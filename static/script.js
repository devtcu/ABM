let currentTime = 0;
let isRunning = false;
let intervalId = null;
let endTime = 24;


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
        if (introOverlay) {
            introOverlay.classList.add('hidden');
            console.log('Intro overlay hidden');
        } else {
            console.error('Intro overlay not found');
        }
    }, 2700);
    // Staggered appearance of elements
    const elements = [
        simulationContainer.querySelector('h1'),
        statusDiv,
        gridContainer,
        simulationContainer.querySelector('.controls'),
        simulationContainer.querySelector('.params')
    ];
    elements.forEach((el, index) => {
        if (el) {
            setTimeout(() => {
                el.classList.add('visible');
                console.log(`Element ${index} (class: ${el.className}) made visible at ${2700 + index * 300}ms`);
            }, 2700 + index * 300);
        } else {
            console.error(`Element at index ${index} not found`);
        }
    });
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

if (layersInput) {
    layersInput.addEventListener('input', () => {
        // Only update preview if simulation is not running
        if (!isRunning) {
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
                    if (!response.ok) throw new Error(`Preview request failed: ${response.status} ${response.statusText}`);
                    return response.json();
                })
                .then(data => {
                    if (data.error) throw new Error(`Server error: ${data.error}`);
                    renderGrid(data);
                    currentTime = data.time;
                    endTime = data.end_time || 24;
                })
                .catch(error => console.error('Preview grid error:', error));
        }
    });
}


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
    const layers = data.grid.length;
    // Calculate cell size: 0.8rem for 10 layers, scaling down to 0.4rem for 50 layers
    const cellSize = Math.max(0.4, 0.8 - (layers - 10) * 0.01);
    gridContainer.style.gridTemplateColumns = `repeat(${layers}, ${cellSize}rem)`;
    data.grid.forEach(row => {
        row.forEach(cell => {
            const div = document.createElement('div');
            div.className = `cell ${cell}`;
            gridContainer.appendChild(div);
        });
    });
    statusDiv.innerHTML = `
        Time: ${data.time.toFixed(1)} hours |
        <span class="state-healthy">Healthy: ${data.counts.h}</span> |
        <span class="state-eclipse">Eclipse: ${data.counts.e}</span> |
        <span class="state-infected">Infected: ${data.counts.i}</span> |
        <span class="state-fused">Fused: ${data.counts.f}</span> |
        <span class="state-dead">Dead: ${data.counts.d}</span>
`;
    document.title = `Viral ABM Simulation - t=${data.time.toFixed(1)}`;
}

// Start simulation
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            // Resume from pause
            if (currentTime > 0 && currentTime < endTime) {
                pauseToggle.checked = false; // Uncheck pause when resuming
                isRunning = true;
                startBtn.textContent = 'Stop Simulation';
                intervalId = setInterval(() => {
                    currentTime += 1.0;
                    if (currentTime > endTime) {
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
                            renderGrid(data);
                        })
                        .catch(error => console.error('Step error:', error));
                }, 500);
            } else {
                // Start new simulation (reset)
                isRunning = true;
                startBtn.textContent = 'Stop Simulation';
                pauseToggle.checked = false; // Uncheck pause on new start
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
                        renderGrid(data);
                        currentTime = data.time;
                        endTime = data.end_time || 24;
                        intervalId = setInterval(() => {
                            currentTime += 1.0;
                            if (currentTime > endTime) {
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
                                    renderGrid(data);
                                })
                                .catch(error => console.error('Step error:', error));
                        }, 500);
                    })
                    .catch(error => {
                        console.error('Start error:', error);
                        isRunning = false;
                        startBtn.textContent = 'Start Simulation';
                    });
            }
        } else {
            // Stop simulation
            clearInterval(intervalId);
            isRunning = false;
            startBtn.textContent = 'Start Simulation';
            pauseToggle.checked = false; // Uncheck pause when stopped
        }
    });
}

// Step forward
if (stepBtn) {
    stepBtn.addEventListener('click', () => {
        if (!isRunning) {
            currentTime += 1.0;
            if (currentTime <=48.0) {
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
            // Pause simulation
            clearInterval(intervalId);
            isRunning = false;
            startBtn.textContent = 'Start Simulation';
        } else if (!pauseToggle.checked && !isRunning && currentTime > 0 && currentTime < endTime) {
            // Resume simulation from pause
            isRunning = true;
            startBtn.textContent = 'Stop Simulation';
            intervalId = setInterval(() => {
                currentTime += 1.0;
                if (currentTime > endTime) {
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
                    .then(response => response.json())
                    .then(data => renderGrid(data))
                    .catch(error => console.error('Step error:', error));
            }, 500);
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