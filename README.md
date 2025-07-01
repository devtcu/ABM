Viral Agent-Based Model (ABM) Simulation
This project is a web-based simulation of a viral agent-based model, visualizing a hexagonal grid of cells that represent different states (Healthy, Eclipse, Infected, Fused, Dead, Other). The simulation features a responsive design, dynamic grid sizing based on the number of layers, and a visually appealing intro animation with sequential element fade-in.
Features

Hexagonal Grid: Displays a grid of hexagonal cells, with colors indicating cell states (e.g., green for Healthy, red for Infected).
Dynamic Grid Sizing: Cell size adjusts dynamically based on the number of layers (0.8rem for 10 layers, scaling down to 0.4rem for 50 layers) to fit within the viewport.
Responsive Design: Adapts to different screen sizes, ensuring the grid, controls, and parameters are visible in both minimized and maximized browser windows.
Sequential Fade-In: After a 2.7s hexagon intro animation, elements (title, status, grid, controls, params) fade in sequentially (2.7s to 3.9s).
Interactive Controls: Includes sliders for adjusting parameters (Number of Layers, Infection Probability, Fusion Probability), Start/Stop and Step buttons, and a Pause toggle.
Styling: Features a gradient background (#101051 to #401479), cyan (rgb(100, 255, 218)) text and borders, and a rounded grid container.

Prerequisites

Python 3.x
Flask
NumPy
SciPy
A modern web browser (e.g., Chrome, Firefox)

Installation

Clone the Repository:
git clone https://github.com/your-username/viral-abm-simulation.git
cd viral-abm-simulation


Install Dependencies:
pip install flask numpy scipy


Project Structure:
viral-abm-simulation/
├── app.py              # Flask backend for simulation logic
├── static/
│   ├── script.js       # Frontend logic for grid rendering and animations
│   ├── styles.css      # Styling for responsive design and animations
├── templates/
│   ├── index.html      # Main HTML template
├── README.md           # This file



Usage

Run the Application:
python app.py


Access the Simulation:

Open your browser and navigate to http://localhost:5000.
The simulation starts with a 2.7s hexagon intro animation, followed by sequential fade-in of the title, status, grid, controls, and parameters.


Interact with the Simulation:

Sliders: Adjust Number of Layers (10–50), Infection Probability, and Fusion Probability.
Buttons:
Start/Stop Simulation: Runs or stops the simulation, updating every 1s up to 24 hours.
Step Forward: Advances the simulation by one time step (1 hour).


Pause Toggle: Pauses the simulation while keeping the Start button active.
The grid updates dynamically, with cell sizes shrinking as layers increase (e.g., 0.8rem at 10 layers, 0.4rem at 50 layers).
The grid is capped at 30rem wide and 70vh tall, with vertical scrolling if needed.



Customization
To adjust the grid size, modify the following in static/styles.css:

Grid Width: Change max-width: min(90vw, 30rem) in .grid-container. For example:
35rem for a wider grid.
25rem for a smaller grid.


Grid Height: Change max-height: 70vh in .grid-container. For example:
80vh for a taller grid (params may extend further off-screen).
60vh for a shorter grid.


Mobile Height: Change max-height: 50vh in the @media (max-width: 600px) block.

To adjust cell size scaling, modify static/script.js in the renderGrid function:

Update cellSize = Math.max(0.4, 0.8 - (layers - 10) * 0.01) to change the range (e.g., 0.9 to 0.5).

Debugging

Open your browser’s Developer Tools (F12) and check the Console for logs:
Rendering grid with data shows layer count and cell size.
Element X made visible at Yms confirms sequential fade-in timing.
Errors like Invalid data format or Element at index X not found indicate issues with data or DOM elements.


Inspect .grid-container in the Elements tab to verify grid-template-columns (e.g., repeat(10, 0.8rem)) and max-width.
Test with the layers slider (10–50) in minimized and maximized windows.

Known Issues

If the grid overflows or elements are hidden, verify max-width and max-height in styles.css.
If elements appear simultaneously, check console logs for timing issues in script.js.

Contributing
Feel free to submit issues or pull requests to improve the simulation, such as adding new features (e.g., a logo-shaped intro animation) or refining the UI.
License
This project is licensed under the MIT License.