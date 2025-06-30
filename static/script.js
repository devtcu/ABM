let currentTime = 0;
let isRunning = false;
let intervalId = null;

const gridContainer = document.getElementById('grid-container');
const statusDiv = document.getElementById('status');
const startBtn = document.getElementById('start-btn');
const stepBtn = document.getElementById('step-btn');
const pauseToggle = document.getElementById('pause');
const probiInput = document.getElementById('probi');
const fusionProbInput = document.getElementById('fusion-prob');
const layersInput = document.getElementById('layers');
const probiValue = document.getElementById('probi-value');
const fusionProbValue = document.getElementById('fusion-prob-value');
const layersValue = document.getElementById('layers-value');
const introOverlay = document.getElementById('intro-overlay');
const simulationContainer = document.getElementById('simulation-container');

// Generate intro hexagon grid
function createIntroHexGrid() {
    const hexGrid = document.querySelector('.hex-grid');
    if (!hexGrid) {
        console.error('Hex grid not found');
        return;
    }
    const rows = 6;
    const cols = 10;
    for (let i = 0; i < rows * cols; i++) {
        const hex = document.createElement('div');
        hex.className = 'hex';
        const angle = Math.random() * 2 * Math.PI;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        hex.style.setProperty('--dx', dx);
        hex.style.setProperty('--dy', dy);
        hex.style.setProperty('--i', i);
        hexGrid.appendChild(hex);
    }
    setTimeout(() => {
        if (introOverlay && simulationContainer) {
            introOverlay.classList.add('hidden');
            simulationContainer.classList.add('visible');
        } else {
            console.error('Intro overlay or simulation container not found');
        }
    }, 2700);
}

// Initialize intro animation
if (introOverlay && simulationContainer) {
    createIntroHexGrid();
} else {
    console.error('Intro overlay or simulation container missing');
}

// Update slider values
if (probiInput && probiValue) probiInput.addEventListener('input', () => probiValue.textContent = probiInput.value);
if (fusionProbInput && fusionProbValue) fusionProbInput.addEventListener('input', () => fusionProbValue.textContent = fusionProbInput.value);
if (layersInput && layersValue) layersInput.addEventListener('input', () => layersValue.textContent = layersInput.value);

// Render simulation grid
function renderGrid(data) {
    if (!gridContainer || !statusDiv) {
        console.error('Grid container or status div not found');
        return;
    }
    if (!data || !data.grid || !data.counts) {
        console.error('Invalid data format:', data);
        return;
    }
    console.log('Rendering grid with data:', data);
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${data.grid.length}, 20px)`;
    data.grid.forEach(row => {
        row.forEach(cell => {
            const div = document.createElement('div');
            div.className = `cell ${cell}`;
            gridContainer.appendChild(div);
        });
    });
    statusDiv.textContent = `Time: ${data.time.toFixed(1)} hours | Healthy: ${data.counts.h} | Eclipse: ${data.counts.e} | Infected: ${data.counts.i} | Fused: ${data.counts.f} | Dead: ${data.counts.d}`;
    document.title = `Viral ABM Simulation - t=${data.time.toFixed(1)}`;
}

// Start simulation
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            startBtn.textContent = 'Stop Simulation';
            fetch('/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    layers: parseInt(layersInput.value) || 20,
                    probi: parseFloat(probiInput.value) || 0.2,
                    fusion_prob: parseFloat(fusionProbInput.value) || 0.05
                })
            })
                .then(response => {
                    if (!response.ok) throw new Error(`Start request failed: ${response.status} ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    if (data.error) throw new Error(`Server error: ${data.error}`);
                    console.log('Start response:', data);
                    renderGrid(data);
                    currentTime = data.time;
                    intervalId = setInterval(() => {
                        currentTime += 1.0;
                        if (currentTime > 24.0) {
                            clearInterval(intervalId);
                            isRunning = false;
                            startBtn.textContent = 'Start Simulation';
                            return;
                        }
                        fetch('/step', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ time: currentTime })
                        })
                            .then(response => {
                                if (!response.ok) throw new Error(`Step request failed: ${response.status} ${response.statusText}`);
                                return response.json();
                            })
                            .then(data => {
                                if (data.error) throw new Error(`Server error: ${data.error}`);
                                console.log('Step response:', data);
                                renderGrid(data);
                            })
                            .catch(error => console.error('Step error:', error));
                    }, 1000);
                })
                .catch(error => {
                    console.error('Start error:', error);
                    isRunning = false;
                    startBtn.textContent = 'Start Simulation';
                });
        } else {
            clearInterval(intervalId);
            isRunning = false;
            startBtn.textContent = 'Start Simulation';
        }
    });
}

// Step forward
if (stepBtn) {
    stepBtn.addEventListener('click', () => {
        if (!isRunning) {
            currentTime += 1.0;
            if (currentTime <= 24.0) {
                fetch('/step', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ time: currentTime })
                })
                    .then(response => {
                        if (!response.ok) throw new Error(`Step request failed: ${response.status} ${response.statusText}`);
                        return response.json();
                    })
                    .then(data => {
                        if (data.error) throw new Error(`Server error: ${data.error}`);
                        console.log('Step response:', data);
                        renderGrid(data);
                    })
                    .catch(error => console.error('Step error:', error));
            }
        }
    });
}

// Pause toggle
if (pauseToggle) {
    pauseToggle.addEventListener('change', () => {
        if (pauseToggle.checked && isRunning) {
            clearInterval(intervalId);
            isRunning = false;
            startBtn.textContent = 'Start Simulation';
        }
    });
}

// Initial grid load
setTimeout(() => {
    if (!layersInput || !probiInput || !fusionProbInput) {
        console.error('Input elements missing');
        return;
    }
    fetch('/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            layers: parseInt(layersInput.value) || 20,
            probi: parseFloat(probiInput.value) || 0.2,
            fusion_prob: parseFloat(fusionProbInput.value) || 0.05
        })
    })
        .then(response => {
            if (!response.ok) throw new Error(`Initial request failed: ${response.status} ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(`Server error: ${data.error}`);
            console.log('Initial response:', data);
            renderGrid(data);
        })
        .catch(error => console.error('Initial grid error:', error));
}, 2700);