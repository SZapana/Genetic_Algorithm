"""
Servidor API simple usando Flask para recibir/servir genomas y resultados
"""
from flask import Flask, request, jsonify, send_file
import json
import os
from datetime import datetime

app = Flask(__name__)

# Almacenamiento simple en memoria (en una implementación real usaría base de datos)
genomes_db = {}
results_db = {}

@app.route('/')
def home():
    return jsonify({
        "message": "API de Genomes para Genetic Algorithm Walkers",
        "endpoints": {
            "/api/genomes": "GET para obtener genomas, POST para subir",
            "/api/results": "GET para obtener resultados, POST para subir",
            "/api/generate": "POST para generar nuevo walker"
        }
    })

@app.route('/api/genomes', methods=['GET', 'POST'])
def handle_genomes():
    if request.method == 'GET':
        # Devolver todos los genomas almacenados
        return jsonify({"genomes": list(genomes_db.values())})
    
    elif request.method == 'POST':
        # Recibir nuevos genomas
        data = request.json
        if not data or 'population' not in data:
            return jsonify({"error": "Datos inválidos"}), 400
        
        # Generar un ID único para este conjunto de genomas
        genome_id = f"gen_{len(genomes_db) + 1}_{int(datetime.now().timestamp())}"
        data['id'] = genome_id
        data['timestamp'] = datetime.now().isoformat()
        
        genomes_db[genome_id] = data
        return jsonify({"message": "Genomas recibidos exitosamente", "id": genome_id})

@app.route('/api/genomes/<genome_id>', methods=['GET'])
def get_genome(genome_id):
    if genome_id in genomes_db:
        return jsonify(genomes_db[genome_id])
    else:
        return jsonify({"error": "Genoma no encontrado"}), 404

@app.route('/api/results', methods=['GET', 'POST'])
def handle_results():
    if request.method == 'GET':
        # Devolver todos los resultados almacenados
        return jsonify({"results": list(results_db.values())})
    
    elif request.method == 'POST':
        # Recibir nuevos resultados
        data = request.json
        if not data or 'fitness' not in data:
            return jsonify({"error": "Datos inválidos"}), 400
        
        # Generar un ID único para este resultado
        result_id = f"res_{len(results_db) + 1}_{int(datetime.now().timestamp())}"
        data['id'] = result_id
        data['timestamp'] = datetime.now().isoformat()
        
        results_db[result_id] = data
        return jsonify({"message": "Resultados recibidos exitosamente", "id": result_id})

@app.route('/api/generate', methods=['POST'])
def generate_walker():
    """Generar un nuevo walker con genoma aleatorio"""
    import random
    
    # Generar un genoma aleatorio similar al que se hace en JS
    genome = {
        "bodyWidth": random.uniform(0.3, 0.7),
        "bodyHeight": random.uniform(0.2, 0.5),
        "legSegmentLength": random.uniform(0.2, 0.5),
        "legSegmentThickness": random.uniform(0.05, 0.15),
        "motorAmplitudes": [random.uniform(-1, 1) for _ in range(4)],
        "motorFrequencies": [random.uniform(0.5, 5.5) for _ in range(4)],
        "motorPhases": [random.uniform(0, 2 * 3.14159) for _ in range(4)]
    }
    
    walker = {
        "name": f"GeneratedWalker_{int(datetime.now().timestamp())}",
        "genome": genome,
        "score": 0
    }
    
    return jsonify({"walker": walker})

@app.route('/api/import_example', methods=['GET'])
def import_example():
    """Endpoint para cargar genomas de ejemplo"""
    example_file = 'example_genomes.json'
    if os.path.exists(example_file):
        with open(example_file, 'r') as f:
            example_data = json.load(f)
        
        # Generar un ID único
        genome_id = f"example_{int(datetime.now().timestamp())}"
        example_data['id'] = genome_id
        example_data['timestamp'] = datetime.now().isoformat()
        
        genomes_db[genome_id] = example_data
        return jsonify({"message": "Genomas de ejemplo importados", "id": genome_id})
    else:
        return jsonify({"error": "Archivo de ejemplo no encontrado"}), 404

if __name__ == '__main__':
    # Para desarrollo
    app.run(host='0.0.0.0', port=5000, debug=True)