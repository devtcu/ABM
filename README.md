# Viral Agent-Based Model (ABM) Simulation

This project is a web-based simulation of a viral agent-based model, visualizing a hexagonal grid of cells that represent different states (Healthy, Eclipse, Infected, Fused, Dead, Other). The simulation features a responsive design, dynamic grid sizing based on the number of layers, and a visually appealing intro animation with sequential element fade-in.

## Features
- **Hexagonal Grid**: Displays a grid of hexagonal cells, with colors indicating cell states (e.g., green for Healthy, red for Infected).
- **Dynamic Grid Sizing**: Cell size adjusts dynamically based on the number of layers (0.8rem for 10 layers, scaling down to 0.4rem for 50 layers) to fit within the viewport.
- **Responsive Design**: Adapts to different screen sizes, ensuring the grid, controls, and parameters are visible in both minimized and maximized browser windows.
- **Sequential Fade-In**: After a 2.7s hexagon intro animation, elements (title, status, grid, controls, params) fade in sequentially (2.7s to 3.9s).
- **Interactive Controls**: Includes sliders for adjusting parameters (Number of Layers, Infection Probability, Fusion Probability), Start/Stop and Step buttons, and a Pause toggle.
- **Styling**: Features a gradient background (`#101051` to `#401479`), cyan (`rgb(100, 255, 218)`) text and borders, and a rounded grid container.

## Prerequisites
- Python 3.x
- Flask
- NumPy
- SciPy
- Git
- Web browsers like Chrome, Firefox, etc

## Installation
1. **Clone the Repository**:
```bash
git clone https://github.com/your-username/viral-abm-simulation.git
cd viral-abm-simulation
```

2. **Set Up a Virtual Environment (recommended)**:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**:
```bash
pip install flask numpy scipy
```


4. **Project Structure**:
```
viral-abm-simulation/
├── app.py              # Flask backend for simulation logic
├── static/
│   ├── script.js       # Frontend logic for grid rendering and animations
│   ├── styles.css      # Styling for responsive design and animations
├── templates/
│   ├── index.html      # Main HTML template
├── README.md           # This file
```


## Usage

1. **Run the Application**:
```bash
python app.py
```

2. **Access the Simulation**:

Open your browser and navigate to http://localhost:5000.


## Contributing
Feel free to submit issues or pull requests to improve the simulation, such as adding new features or refining the UI.