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
- A modern web browser (e.g., Chrome, Firefox)

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/viral-abm-simulation.git
   cd viral-abm-simulation