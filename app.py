from flask import Flask, render_template, request, jsonify
from abm import ViralABM

app = Flask(__name__)

# Store the ABM instance globally (for simplicity; consider session storage for production)
abm = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start():
    global abm
    data = request.json
    layers = int(data.get('layers', 10))
    probi = float(data.get('probi', 0.2))
    fusion_prob = float(data.get('fusion_prob', 0.05))
    end_time = float(data.get('end_time', 60))
    abm = ViralABM(layers=layers, probi=probi, fusion_prob=fusion_prob, end_time=end_time)
    return jsonify(abm.get_state(0))

@app.route('/step', methods=['POST'])
def step():
    global abm
    if abm is None:
        return jsonify({'error': 'Simulation not started'}), 400
    data = request.json
    target_time = float(data.get('time', 0))
    return jsonify(abm.run_to_time(target_time))

if __name__ == '__main__':
    app.run(debug=True)