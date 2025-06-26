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

// Update slider values display
probiInput.addEventListener('input', () => {
    probiValue.textContent = probiInput.value;
});
fusionProbInput.addEventListener('input', () => {
    fusionProbValue.textContent = fusionProbInput.value;
});
layersInput.addEventListener('input', () => {
    layersValue.textContent = layersInput.value;
});

// Render grid and update status
function renderGrid(data) {
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
    document.title = `Viral ABM Simulation - t=${data.time.toFixed(1)} hours`;
}

// Start simulation
startBtn.addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        startBtn.textContent = 'Stop Simulation';
        fetch('/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                layers: layersInput.value,
                probi: probiInput.value,
                fusion_prob: fusionProbInput.value
            })
        })
            .then(response => response.json())
            .then(data => {
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
                        .then(response => response.json())
                        .then(data => renderGrid(data))
                        .catch(error => console.error('Error stepping:', error));
                }, 1000);
            })
            .catch(error => console.error('Error starting:', error));
    } else {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.textContent = 'Start Simulation';
    }
});

// Step forward
stepBtn.addEventListener('click', () => {
    if (!isRunning) {
        currentTime += 1.0;
        if (currentTime <= 24.0) {
            fetch('/step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ time: currentTime })
            })
                .then(response => response.json())
                .then(data => renderGrid(data))
                .catch(error => console.error('Error stepping:', error));
        }
    }
});

// Pause toggle
pauseToggle.addEventListener('change', () => {
    if (pauseToggle.checked && isRunning) {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.textContent = 'Start Simulation';
    }
});

// Initial grid load
fetch('/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        layers: layersInput.value,
        probi: probiInput.value,
        fusion_prob: fusionProbInput.value
    })
})
    .then(response => response.json())
    .then(data => renderGrid(data))
    .catch(error => console.error('Error loading initial grid:', error));