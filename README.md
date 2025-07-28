# Viral Agent-Based Model (ABM) Simulation

This project is a web-based simulation of a viral agent-based model, visualizing a hexagonal grid of cells that represent different states (Healthy, Eclipse, Infected, Fused, Dead, Other). The simulation features a responsive design, dynamic grid sizing based on the number of layers

## Prerequisites
- Python 3.x
- Flask
- NumPy
- SciPy
- Git
- Web browser

## Installation
Follow the link https://abm-sigma.vercel.app to access it, or follow the instructions below to run it on your local machine

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
Feel free to submit issues or pull requests to improve the simulation, such as adding new features or refining the UI experience.
