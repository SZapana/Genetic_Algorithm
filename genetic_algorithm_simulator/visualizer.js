// Visualization Component for Genetic Algorithm Simulator

class Visualizer {
    constructor() {
        this.fitnessChart = null;
        this.populationCanvas = null;
        this.ctx = null;
        this.animationFrameId = null;
    }

    initCharts() {
        // Initialize fitness chart
        const ctx = document.getElementById('fitnessChart').getContext('2d');
        
        this.fitnessChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Best Fitness',
                        data: [],
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Average Fitness',
                        data: [],
                        borderColor: '#6b8cbc',
                        backgroundColor: 'rgba(107, 140, 188, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Worst Fitness',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e2e8f0'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Fitness Evolution Over Generations',
                        color: '#e2e8f0'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Generation',
                            color: '#e2e8f0'
                        },
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Fitness Value',
                            color: '#e2e8f0'
                        },
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });

        // Get canvas for population visualization
        this.populationCanvas = document.getElementById('populationCanvas');
        this.ctx = this.populationCanvas.getContext('2d');
    }

    updateFitnessChart(history) {
        if (!this.fitnessChart) return;

        // Update chart data
        this.fitnessChart.data.labels = Array.from({length: history.best.length}, (_, i) => i);
        this.fitnessChart.data.datasets[0].data = history.best;
        this.fitnessChart.data.datasets[1].data = history.average;
        this.fitnessChart.data.datasets[2].data = history.worst;

        this.fitnessChart.update();
    }

    drawPopulation(population, geneLength) {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.populationCanvas.width, this.populationCanvas.height);

        // Set background
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.populationCanvas.width, this.populationCanvas.height);

        // Determine how many genes to visualize based on problem domain
        const numGenesToVisualize = Math.min(geneLength, 2); // For 2D visualization
        
        if (numGenesToVisualize === 2) {
            // Draw 2D scatter plot
            this.draw2DPopulation(population);
        } else {
            // Draw 1D visualization
            this.draw1DPopulation(population);
        }
    }

    draw2DPopulation(population) {
        const width = this.populationCanvas.width;
        const height = this.populationCanvas.height;
        const padding = 40;

        // Draw axes
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.stroke();

        // Draw axis labels
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Gene 0', width / 2, height - 10);
        this.ctx.save();
        this.ctx.translate(10, height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Gene 1', 0, 0);
        this.ctx.restore();

        // Find min/max for normalization
        let minGene0 = Infinity, maxGene0 = -Infinity;
        let minGene1 = Infinity, maxGene1 = -Infinity;
        
        for (const individual of population) {
            if (individual.genes.length >= 2) {
                minGene0 = Math.min(minGene0, individual.genes[0]);
                maxGene0 = Math.max(maxGene0, individual.genes[0]);
                minGene1 = Math.min(minGene1, individual.genes[1]);
                maxGene1 = Math.max(maxGene1, individual.genes[1]);
            }
        }

        // Draw each individual
        for (const individual of population) {
            if (individual.genes.length < 2) continue;

            // Normalize coordinates to canvas dimensions
            const x = padding + ((individual.genes[0] - minGene0) / (maxGene0 - minGene0 || 1)) * (width - 2 * padding);
            const y = height - padding - ((individual.genes[1] - minGene1) / (maxGene1 - minGene1 || 1)) * (height - 2 * padding);

            // Color based on fitness (brighter = better fitness)
            const normalizedFitness = individual.fitness / (Math.max(...population.map(i => i.fitness)) || 1);
            const hue = 240 - (normalizedFitness * 180); // Blue (high fitness) to red (low fitness)
            this.ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;

            // Draw individual as a circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();

            // Draw border for best individual
            if (individual === population[0]) { // Assuming population[0] is best
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }

    draw1DPopulation(population) {
        const width = this.populationCanvas.width;
        const height = this.populationCanvas.height;
        const padding = 20;

        // Draw each individual as a vertical bar
        const barWidth = Math.max(1, (width - 2 * padding) / population.length);
        
        for (let i = 0; i < population.length; i++) {
            const individual = population[i];
            
            // Find max fitness for normalization
            const maxFitness = Math.max(...population.map(ind => ind.fitness));
            
            // Height based on fitness
            const barHeight = (individual.fitness / (maxFitness || 1)) * (height - 2 * padding);
            
            // Color based on fitness
            const normalizedFitness = individual.fitness / (maxFitness || 1);
            const hue = 240 - (normalizedFitness * 180); // Blue (high fitness) to red (low fitness)
            this.ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            
            // Draw bar
            const x = padding + i * barWidth;
            this.ctx.fillRect(x, height - padding - barHeight, barWidth - 1, barHeight);
            
            // Highlight best individual
            if (i === 0) { // Assuming first is best
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, height - padding - barHeight, barWidth - 1, barHeight);
            }
        }
    }

    updateStats(generation, bestFitness, avgFitness, worstFitness) {
        document.getElementById('generationCounter').textContent = generation;
        document.getElementById('bestFitness').textContent = bestFitness.toFixed(4);
        document.getElementById('avgFitness').textContent = avgFitness.toFixed(4);
        document.getElementById('worstFitness').textContent = worstFitness.toFixed(4);
    }

    updateProcessStep(step, description) {
        // Remove active class from all steps
        document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
        
        // Add active class to current step
        const stepElement = document.getElementById(step + 'Step');
        if (stepElement) {
            stepElement.classList.add('active');
        }
        
        // Update description
        document.getElementById('stepDescription').textContent = description;
    }

    clearProcessStep() {
        document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
        document.getElementById('stepDescription').textContent = 'Ready to start simulation...';
    }
}