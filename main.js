// Punto de entrada principal de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Genomas predefinidos interesantes para iniciar la simulación
    const predefinedGenomes = [
        {
            name: "WalkerPro",
            genome: {
                bodyWidth: 0.5,
                bodyHeight: 0.3,
                legSegmentLength: 0.4,
                legSegmentThickness: 0.1,
                motorAmplitudes: [0.8, -0.6, 0.7, -0.5],
                motorFrequencies: [2.5, 1.8, 2.2, 1.9],
                motorPhases: [0.5, 1.2, 0.8, 2.1]
            }
        },
        {
            name: "StriderMax",
            genome: {
                bodyWidth: 0.45,
                bodyHeight: 0.35,
                legSegmentLength: 0.45,
                legSegmentThickness: 0.08,
                motorAmplitudes: [0.6, -0.4, 0.9, -0.3],
                motorFrequencies: [2.0, 2.2, 1.8, 2.4],
                motorPhases: [1.0, 0.5, 1.5, 0.9]
            }
        },
        {
            name: "AmblerFast",
            genome: {
                bodyWidth: 0.6,
                bodyHeight: 0.25,
                legSegmentLength: 0.5,
                legSegmentThickness: 0.12,
                motorAmplitudes: [0.7, -0.8, 0.6, -0.2],
                motorFrequencies: [2.8, 1.5, 2.0, 1.6],
                motorPhases: [0.3, 1.8, 0.6, 2.4]
            }
        },
        {
            name: "StrollerFlex",
            genome: {
                bodyWidth: 0.4,
                bodyHeight: 0.4,
                legSegmentLength: 0.35,
                legSegmentThickness: 0.09,
                motorAmplitudes: [0.9, -0.2, 0.5, -0.7],
                motorFrequencies: [1.9, 2.1, 1.8, 2.0],
                motorPhases: [1.2, 0.7, 1.9, 0.4]
            }
        },
        {
            name: "MarcherPro",
            genome: {
                bodyWidth: 0.55,
                bodyHeight: 0.3,
                legSegmentLength: 0.42,
                legSegmentThickness: 0.11,
                motorAmplitudes: [0.5, -0.7, 0.8, -0.4],
                motorFrequencies: [2.2, 1.7, 2.1, 1.8],
                motorPhases: [0.8, 1.4, 0.5, 2.0]
            }
        }
    ];

    // Inicializar componentes
    const renderer = new Renderer('simulationCanvas');
    const physicsEngine = new PhysicsEngine();
    const ga = new GeneticAlgorithm(
        parseInt(document.getElementById('populationSize').value),
        parseFloat(document.getElementById('mutationRate').value),
        parseFloat(document.getElementById('mutationMagnitude').value),
        parseInt(document.getElementById('numChampions').value)
    );

    // Variables de estado
    let simulationRunning = false;
    let animationId = null;
    let simulationTime = 0; // Tiempo acumulado de simulación
    let roundStartTime = 0; // Momento en que comenzó la ronda actual
    let roundDuration = parseInt(document.getElementById('roundLength').value) * 1000; // Duración de la ronda en ms
    let currentRoundTime = 0; // Tiempo transcurrido en la ronda actual
    
    // Inicializar la población con genomas predefinidos
    ga.initializePopulationWithGenomes(predefinedGenomes);
    
    // Variables para controlar la simulación
    let lastRenderTime = 0;
    let renderInterval = 1000 / 30; // 30 FPS por defecto
    let simulationSpeed = 60; // Velocidad de simulación por defecto
    let motorNoise = parseFloat(document.getElementById('motorNoise').value);
    
    // Función para actualizar la simulación física
    function updateSimulation() {
        // Actualizar los motores de los walkers con el tiempo actual y ruido
        physicsEngine.updateWalkerMotors(simulationTime, motorNoise);
        
        // Actualizar la física
        const stepSize = 1/60; // Paso de tiempo físico
        const steps = simulationSpeed > 0 ? Math.max(1, Math.floor(simulationSpeed / 60)) : 0;
        
        for (let i = 0; i < steps; i++) {
            physicsEngine.update(stepSize);
            simulationTime += stepSize;
        }
        
        // Verificar si ha terminado la ronda
        currentRoundTime = Date.now() - roundStartTime;
        if (currentRoundTime >= roundDuration) {
            // Finalizar la ronda actual
            physicsEngine.calculateAllFitness();
            simulationRunning = false;
        }
    }
    
    // Función para renderizar la escena
    function renderScene(timestamp) {
        if (timestamp - lastRenderTime >= renderInterval) {
            renderer.renderWorld(physicsEngine);
            lastRenderTime = timestamp;
        }
        
        if (simulationRunning) {
            animationId = requestAnimationFrame(renderScene);
        }
    }
    
    // Función para iniciar una nueva ronda
    function startNewRound() {
        // Limpiar la simulación anterior
        physicsEngine.clear();
        
        // Reiniciar temporizador
        roundStartTime = Date.now();
        currentRoundTime = 0;
        simulationTime = 0;
        
        // Agregar los walkers a la simulación física
        for (let i = 0; i < ga.population.length; i++) {
            const walker = ga.population[i];
            // Colocar a cada walker en posición inicial
            physicsEngine.addWalker(walker, i * 2 - ga.population.length, 5);
        }
        
        // Iniciar la simulación
        simulationRunning = true;
        if (!animationId) {
            animationId = requestAnimationFrame(renderScene);
        }
    }
    
    // Función para iniciar la simulación
    function startSimulation() {
        if (!simulationRunning) {
            startNewRound();
        }
    }
    
    // Función para pausar la simulación
    function pauseSimulation() {
        simulationRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    // Función para reiniciar la simulación
    function resetSimulation() {
        pauseSimulation();
        physicsEngine.clear();
        ga.initializePopulation();
        updateUI();
    }
    
    // Función para avanzar un paso
    function stepSimulation() {
        if (!simulationRunning) {
            updateSimulation();
            renderer.renderWorld(physicsEngine);
        }
    }
    
    // Función para avanzar a la siguiente generación
    function nextGeneration() {
        pauseSimulation();
        
        // Calcular fitness de todos los walkers si la ronda no terminó
        if (currentRoundTime < roundDuration) {
            physicsEngine.calculateAllFitness();
        }
        
        // Generar la siguiente generación
        const stats = ga.nextGeneration();
        
        // Actualizar UI con las nuevas estadísticas
        updateUI();
        
        // Iniciar nueva ronda con la nueva generación
        startNewRound();
    }
    
    // Función para actualizar la UI
    function updateUI() {
        // Actualizar tabla de récords
        const topWalkers = ga.getTopWalkers(10);
        renderer.updateRecordsTable(topWalkers);
        
        // Actualizar estadísticas
        renderer.updateStats(ga.generation, ga.getBestFitness(), ga.getAverageFitness());
        
        // Actualizar información del walker actual (el primero de la población)
        if (ga.population.length > 0) {
            renderer.updateCurrentWalkerInfo(ga.population[0]);
        }
    }
    
    // Función para exportar genomas
    function exportGenomes() {
        const data = ga.exportPopulation();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `genomes_generation_${ga.generation}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
    
    // Función para importar genomas
    function importGenomes(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const success = ga.importPopulation(e.target.result);
            if (success) {
                updateUI();
                alert(`Genomas importados correctamente. Generación: ${ga.generation}`);
            } else {
                alert('Error al importar los genomas. Verifique el formato del archivo.');
            }
        };
        reader.readAsText(file);
        
        // Resetear el input file
        event.target.value = '';
    }
    
    // Event listeners para controles
    document.getElementById('startBtn').addEventListener('click', startSimulation);
    document.getElementById('pauseBtn').addEventListener('click', pauseSimulation);
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
    document.getElementById('stepBtn').addEventListener('click', stepSimulation);
    document.getElementById('nextGenBtn').addEventListener('click', nextGeneration);
    document.getElementById('exportGenomesBtn').addEventListener('click', exportGenomes);
    document.getElementById('importGenomesBtn').addEventListener('click', () => {
        document.getElementById('genomeFileInput').click();
    });
    document.getElementById('genomeFileInput').addEventListener('change', importGenomes);
    
    // Event listeners para controles deslizantes
    document.getElementById('mutationRate').addEventListener('input', function() {
        ga.mutationRate = parseFloat(this.value);
        document.getElementById('mutationRateValue').textContent = this.value;
    });
    
    document.getElementById('mutationMagnitude').addEventListener('input', function() {
        ga.mutationMagnitude = parseFloat(this.value);
        document.getElementById('mutationMagnitudeValue').textContent = this.value;
    });
    
    document.getElementById('motorNoise').addEventListener('input', function() {
        motorNoise = parseFloat(this.value);
        document.getElementById('motorNoiseValue').textContent = this.value;
    });
    
    document.getElementById('animationQuality').addEventListener('change', function() {
        const fps = parseInt(this.value);
        renderInterval = fps > 0 ? 1000 / fps : Infinity; // Si es 0, no renderizar
    });
    
    document.getElementById('simulationSpeed').addEventListener('change', function() {
        simulationSpeed = parseInt(this.value);
    });
    
    document.getElementById('roundLength').addEventListener('change', function() {
        roundDuration = parseInt(this.value) * 1000; // Convertir a milisegundos
    });
    
    document.getElementById('populationSize').addEventListener('change', function() {
        ga.populationSize = parseInt(this.value);
    });
    
    document.getElementById('numChampions').addEventListener('change', function() {
        ga.numChampions = parseInt(this.value);
    });
    
    // Inicializar la UI
    updateUI();
    
    // Iniciar una ronda inicial
    startNewRound();
});

// Manejo de cierre de ventana para guardar estado si es necesario
window.addEventListener('beforeunload', function() {
    // Aquí podríamos guardar el estado si es necesario
});