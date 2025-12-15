// Genetic Algorithm class handles the evolution of walkers
class GeneticAlgorithm {
    constructor(populationSize = 10) {
        this.populationSize = populationSize;
        this.population = [];
        this.generation = 1;
        this.championsToCopy = 3;
        this.mutationProbability = 0.1; // 10%
        this.mutationAmount = 0.1;      // 10%
        this.motorNoise = 0.01;         // 1%
        this.recordDistance = 0;
        this.bestWalker = null;
    }
    
    // Initialize the population with random walkers
    initializePopulation(engine, startX, startY) {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const walker = new Walker(engine, startX, startY);
            this.population.push(walker);
        }
    }
    
    // Select parents for the next generation using tournament selection
    selectParent() {
        // Tournament selection: pick a few random individuals and select the best
        const tournamentSize = 3;
        let best = null;
        
        for (let i = 0; i < tournamentSize; i++) {
            const candidate = this.population[Math.floor(Math.random() * this.population.length)];
            if (!best || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        
        return best;
    }
    
    // Crossover two parent genes to create offspring genes
    crossover(parent1, parent2) {
        const childGenes = JSON.parse(JSON.stringify(parent1.genes)); // Deep clone
        
        // Mix genes from both parents
        for (let i = 0; i < childGenes.numSegments; i++) {
            // Randomly choose values from either parent
            if (Math.random() > 0.5) {
                childGenes.segmentLengths[i] = parent2.genes.segmentLengths[i];
            }
            if (Math.random() > 0.5) {
                childGenes.jointAngles[i] = parent2.genes.jointAngles[i];
            }
            if (Math.random() > 0.5) {
                childGenes.motorFrequencies[i] = parent2.genes.motorFrequencies[i];
            }
            if (Math.random() > 0.5) {
                childGenes.motorAmplitudes[i] = parent2.genes.motorAmplitudes[i];
            }
            if (Math.random() > 0.5) {
                childGenes.bodyPartSizes[i] = parent2.genes.bodyPartSizes[i];
            }
        }
        
        return childGenes;
    }
    
    // Mutate genes based on mutation probability and amount
    mutate(genes) {
        // Mutate numerical values
        for (let i = 0; i < genes.numSegments; i++) {
            // Segment lengths
            if (Math.random() < this.mutationProbability) {
                genes.segmentLengths[i] += (Math.random() - 0.5) * 2 * this.mutationAmount * 50;
                genes.segmentLengths[i] = Math.max(10, Math.min(100, genes.segmentLengths[i])); // Keep in bounds
            }
            
            // Joint angles
            if (Math.random() < this.mutationProbability) {
                genes.jointAngles[i] += (Math.random() - 0.5) * 2 * this.mutationAmount * Math.PI / 2;
                genes.jointAngles[i] = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, genes.jointAngles[i]));
            }
            
            // Motor frequencies
            if (Math.random() < this.mutationProbability) {
                genes.motorFrequencies[i] += (Math.random() - 0.5) * 2 * this.mutationAmount * 3;
                genes.motorFrequencies[i] = Math.max(0.1, Math.min(10, genes.motorFrequencies[i]));
            }
            
            // Motor amplitudes
            if (Math.random() < this.mutationProbability) {
                genes.motorAmplitudes[i] += (Math.random() - 0.5) * 2 * this.mutationAmount * Math.PI / 3;
                genes.motorAmplitudes[i] = Math.max(0, Math.min(Math.PI / 2, genes.motorAmplitudes[i]));
            }
            
            // Body part sizes
            if (Math.random() < this.mutationProbability) {
                genes.bodyPartSizes[i].width += (Math.random() - 0.5) * 2 * this.mutationAmount * 20;
                genes.bodyPartSizes[i].width = Math.max(5, Math.min(50, genes.bodyPartSizes[i].width));
            }
            if (Math.random() < this.mutationProbability) {
                genes.bodyPartSizes[i].height += (Math.random() - 0.5) * 2 * this.mutationAmount * 20;
                genes.bodyPartSizes[i].height = Math.max(5, Math.min(50, genes.bodyPartSizes[i].height));
            }
        }
        
        return genes;
    }
    
    // Create the next generation of walkers
    createNextGeneration(engine, startX, startY) {
        // Sort population by fitness (descending)
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        // Check for record distance
        if (this.population[0].fitness > this.recordDistance) {
            this.recordDistance = this.population[0].fitness;
            this.bestWalker = this.population[0];
        }
        
        const newPopulation = [];
        
        // Copy top performers (champions) to next generation
        for (let i = 0; i < this.championsToCopy && i < this.population.length; i++) {
            const champion = this.population[i];
            const newWalker = new Walker(engine, startX, startY, champion.genes);
            newPopulation.push(newWalker);
        }
        
        // Fill the rest with offspring
        while (newPopulation.length < this.populationSize) {
            // Select parents
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            // Create child through crossover
            let childGenes = this.crossover(parent1, parent2);
            
            // Mutate child
            childGenes = this.mutate(childGenes);
            
            // Create new walker with mutated genes
            const childWalker = new Walker(engine, startX, startY, childGenes);
            newPopulation.push(childWalker);
        }
        
        // Kill old population
        for (const walker of this.population) {
            walker.kill();
        }
        
        this.population = newPopulation;
        this.generation++;
        
        return this.population;
    }
    
    // Get the fittest walker in the current population
    getFittestWalker() {
        if (this.population.length === 0) return null;
        
        let fittest = this.population[0];
        for (const walker of this.population) {
            if (walker.fitness > fittest.fitness) {
                fittest = walker;
            }
        }
        return fittest;
    }
    
    // Update algorithm parameters
    setChampionsToCopy(value) {
        this.championsToCopy = parseInt(value);
    }
    
    setMutationProbability(value) {
        this.mutationProbability = parseFloat(value) / 100;
    }
    
    setMutationAmount(value) {
        this.mutationAmount = parseFloat(value) / 100;
    }
    
    setMotorNoise(value) {
        this.motorNoise = parseFloat(value) / 100;
    }
}

// Export the GeneticAlgorithm class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeneticAlgorithm;
}