// Main Application Controller for Genetic Algorithm Simulator

class GASimulator {
    constructor() {
        this.ga = null;
        this.visualizer = new Visualizer();
        this.isRunning = false;
        this.isPaused = false;
        this.simulationSpeed = 50; // Default speed
        this.animationInterval = null;
        
        this.initEventListeners();
        this.visualizer.initCharts();
        this.updateUIFromConfig();
    }

    initEventListeners() {
        // Population settings
        document.getElementById('populationSize').addEventListener('input', (e) => {
            document.getElementById('populationSizeValue').textContent = e.target.value;
        });
        
        document.getElementById('generations').addEventListener('input', (e) => {
            document.getElementById('generationsValue').textContent = e.target.value;
        });
        
        // Selection method
        document.getElementById('selectionMethod').addEventListener('change', (e) => {
            document.getElementById('tournamentSizeGroup').style.display = 
                e.target.value === 'tournament' ? 'block' : 'none';
        });
        
        document.getElementById('tournamentSize').addEventListener('input', (e) => {
            document.getElementById('tournamentSizeValue').textContent = e.target.value;
        });
        
        // Crossover settings
        document.getElementById('crossoverRate').addEventListener('input', (e) => {
            document.getElementById('crossoverRateValue').textContent = e.target.value + '%';
        });
        
        // Mutation settings
        document.getElementById('mutationRate').addEventListener('input', (e) => {
            document.getElementById('mutationRateValue').textContent = e.target.value + '%';
        });
        
        // Elitism
        document.getElementById('elitismToggle').addEventListener('change', (e) => {
            document.getElementById('eliteCount').disabled = !e.target.checked;
        });
        
        document.getElementById('eliteCount').addEventListener('input', (e) => {
            document.getElementById('eliteCountValue').textContent = e.target.value;
        });
        
        // Speed control
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value + '%';
        });
        
        // Button controls
        document.getElementById('startBtn').addEventListener('click', () => this.startSimulation());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('stepBtn').addEventListener('click', () => this.stepSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());
        
        // Initialize tournament size visibility
        document.getElementById('tournamentSizeGroup').style.display = 
            document.getElementById('selectionMethod').value === 'tournament' ? 'block' : 'none';
        document.getElementById('eliteCount').disabled = !document.getElementById('elitismToggle').checked;
    }

    getConfigFromUI() {
        return {
            populationSize: parseInt(document.getElementById('populationSize').value),
            generations: parseInt(document.getElementById('generations').value),
            selectionMethod: document.getElementById('selectionMethod').value,
            tournamentSize: parseInt(document.getElementById('tournamentSize').value),
            crossoverType: document.getElementById('crossoverType').value,
            crossoverRate: parseInt(document.getElementById('crossoverRate').value),
            mutationType: document.getElementById('mutationType').value,
            mutationRate: parseInt(document.getElementById('mutationRate').value),
            elitism: document.getElementById('elitismToggle').checked,
            eliteCount: parseInt(document.getElementById('eliteCount').value),
            objectiveFunction: document.getElementById('objectiveFunction').value,
            problemDomain: document.getElementById('problemDomain').value
        };
    }

    updateUIFromConfig() {
        const config = this.getConfigFromUI();
        
        document.getElementById('populationSize').value = config.populationSize;
        document.getElementById('populationSizeValue').textContent = config.populationSize;
        
        document.getElementById('generations').value = config.generations;
        document.getElementById('generationsValue').textContent = config.generations;
        
        document.getElementById('selectionMethod').value = config.selectionMethod;
        document.getElementById('tournamentSize').value = config.tournamentSize;
        document.getElementById('tournamentSizeValue').textContent = config.tournamentSize;
        
        document.getElementById('crossoverType').value = config.crossoverType;
        document.getElementById('crossoverRate').value = config.crossoverRate;
        document.getElementById('crossoverRateValue').textContent = config.crossoverRate + '%';
        
        document.getElementById('mutationType').value = config.mutationType;
        document.getElementById('mutationRate').value = config.mutationRate;
        document.getElementById('mutationRateValue').textContent = config.mutationRate + '%';
        
        document.getElementById('elitismToggle').checked = config.elitism;
        document.getElementById('eliteCount').value = config.eliteCount;
        document.getElementById('eliteCountValue').textContent = config.eliteCount;
        
        document.getElementById('objectiveFunction').value = config.objectiveFunction;
        document.getElementById('problemDomain').value = config.problemDomain;
        
        document.getElementById('tournamentSizeGroup').style.display = 
            config.selectionMethod === 'tournament' ? 'block' : 'none';
        document.getElementById('eliteCount').disabled = !config.elitism;
    }

    startSimulation() {
        if (this.isRunning && !this.isPaused) return;
        
        if (!this.ga || this.isPaused) {
            if (this.isPaused) {
                // Resume from pause
                this.isPaused = false;
                this.runSimulationLoop();
            } else {
                // Start new simulation
                this.initSimulation();
            }
        } else {
            // Start new simulation
            this.initSimulation();
        }
    }

    initSimulation() {
        const config = this.getConfigFromUI();
        this.ga = new GeneticAlgorithm(config);
        this.ga.initializePopulation();
        
        this.isRunning = true;
        this.isPaused = false;
        
        // Update visualization
        this.visualizer.clearProcessStep();
        this.visualizer.drawPopulation(this.ga.population, this.ga.geneLength);
        this.visualizer.updateStats(0, 0, 0, 0);
        
        this.runSimulationLoop();
    }

    runSimulationLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        // Calculate interval based on speed (higher speed = faster execution)
        const interval = Math.max(10, 200 - (this.simulationSpeed * 1.5));
        
        this.animationInterval = setInterval(() => {
            if (this.isPaused || !this.isRunning) {
                clearInterval(this.animationInterval);
                return;
            }
            
            // Evolve one generation
            this.ga.evolve();
            
            // Update visualization
            this.visualizer.updateFitnessChart(this.ga.fitnessHistory);
            this.visualizer.drawPopulation(this.ga.population, this.ga.geneLength);
            
            // Get stats for the current generation
            const best = this.ga.population[0].fitness;
            const avg = this.ga.fitnessHistory.average[this.ga.fitnessHistory.average.length - 1];
            const worst = this.ga.fitnessHistory.worst[this.ga.fitnessHistory.worst.length - 1];
            
            this.visualizer.updateStats(this.ga.generation, best, avg, worst);
            
            // Check termination
            if (this.ga.isTerminated()) {
                this.stopSimulation();
                this.visualizer.updateProcessStep('', 'Simulation completed!');
            }
        }, interval);
    }

    pauseSimulation() {
        if (!this.isRunning) return;
        
        this.isPaused = true;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        this.visualizer.updateProcessStep('', 'Simulation paused');
    }

    stepSimulation() {
        if (!this.ga) {
            this.initSimulation();
            return;
        }
        
        if (this.ga.isTerminated()) {
            this.visualizer.updateProcessStep('', 'Simulation completed! Reset to start again.');
            return;
        }
        
        // Show which step we're on
        this.visualizer.updateProcessStep('selection', 'Selecting parents...');
        setTimeout(() => {
            this.visualizer.updateProcessStep('crossover', 'Performing crossover...');
        }, 300);
        setTimeout(() => {
            this.visualizer.updateProcessStep('mutation', 'Applying mutations...');
        }, 600);
        setTimeout(() => {
            this.visualizer.updateProcessStep('replacement', 'Creating new population...');
        }, 900);
        
        // Evolve one generation
        this.ga.evolve();
        
        // Update visualization
        this.visualizer.updateFitnessChart(this.ga.fitnessHistory);
        this.visualizer.drawPopulation(this.ga.population, this.ga.geneLength);
        
        // Get stats for the current generation
        const best = this.ga.population[0].fitness;
        const avg = this.ga.fitnessHistory.average[this.ga.fitnessHistory.average.length - 1];
        const worst = this.ga.fitnessHistory.worst[this.ga.fitnessHistory.worst.length - 1];
        
        this.visualizer.updateStats(this.ga.generation, best, avg, worst);
        
        // Clear step indicators after a delay
        setTimeout(() => {
            if (!this.ga.isTerminated()) {
                this.visualizer.clearProcessStep();
            }
        }, 1200);
        
        if (this.ga.isTerminated()) {
            this.visualizer.updateProcessStep('', 'Simulation completed!');
        }
    }

    stopSimulation() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }

    resetSimulation() {
        this.stopSimulation();
        
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        
        this.ga = null;
        this.visualizer.clearProcessStep();
        
        // Clear charts
        if (this.visualizer.fitnessChart) {
            this.visualizer.fitnessChart.data.labels = [];
            this.visualizer.fitnessChart.data.datasets.forEach(dataset => {
                dataset.data = [];
            });
            this.visualizer.fitnessChart.update();
        }
        
        // Clear population canvas
        if (this.visualizer.ctx) {
            this.visualizer.ctx.clearRect(0, 0, 
                this.visualizer.populationCanvas.width, 
                this.visualizer.populationCanvas.height);
        }
        
        // Reset stats
        document.getElementById('generationCounter').textContent = '0';
        document.getElementById('bestFitness').textContent = '0.00';
        document.getElementById('avgFitness').textContent = '0.00';
        document.getElementById('worstFitness').textContent = '0.00';
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new GASimulator();
});

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GASimulator, GeneticAlgorithm, Individual, Visualizer };
}