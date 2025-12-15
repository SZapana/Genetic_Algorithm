// Genetic Algorithm Core Implementation

class Individual {
    constructor(geneLength = 10) {
        this.genes = this.initializeGenes(geneLength);
        this.fitness = 0;
    }

    initializeGenes(length) {
        // Initialize genes randomly based on problem domain
        const genes = [];
        for (let i = 0; i < length; i++) {
            genes.push(Math.random());
        }
        return genes;
    }

    evaluateFitness(problemDomain, objectiveFunction) {
        switch (problemDomain) {
            case 'rastrigin':
                this.fitness = this.rastriginFunction();
                break;
            case 'sphere':
                this.fitness = this.sphereFunction();
                break;
            case 'ackley':
                this.fitness = this.ackleyFunction();
                break;
            case 'mathematical':
                this.fitness = this.mathematicalFunction();
                break;
            case 'knapsack':
                this.fitness = this.knapsackFunction();
                break;
            default:
                this.fitness = this.defaultFunction();
        }

        // Apply objective function transformation if needed
        if (objectiveFunction === 'minimization') {
            this.fitness = 1 / (1 + this.fitness); // Convert minimization to maximization
        }

        return this.fitness;
    }

    rastriginFunction() {
        const A = 10;
        const n = this.genes.length;
        let sum = A * n;
        
        for (let i = 0; i < n; i++) {
            const x = this.genes[i] * 10 - 5; // Scale to [-5, 5]
            sum += Math.pow(x, 2) - A * Math.cos(2 * Math.PI * x);
        }
        
        return sum;
    }

    sphereFunction() {
        let sum = 0;
        for (let i = 0; i < this.genes.length; i++) {
            const x = this.genes[i] * 10 - 5; // Scale to [-5, 5]
            sum += Math.pow(x, 2);
        }
        return sum;
    }

    ackleyFunction() {
        const a = 20;
        const b = 0.2;
        const c = 2 * Math.PI;
        const n = this.genes.length;
        
        let sum1 = 0;
        let sum2 = 0;
        
        for (let i = 0; i < n; i++) {
            const x = this.genes[i] * 20 - 10; // Scale to [-10, 10]
            sum1 += Math.pow(x, 2);
            sum2 += Math.cos(c * x);
        }
        
        return -a * Math.exp(-b * Math.sqrt(sum1 / n)) - Math.exp(sum2 / n) + a + Math.E;
    }

    mathematicalFunction() {
        // Simple quadratic function for demonstration
        let sum = 0;
        for (let i = 0; i < this.genes.length; i++) {
            const x = this.genes[i];
            sum += Math.pow(x - 0.5, 2); // Try to get values close to 0.5
        }
        return sum;
    }

    knapsackFunction() {
        // For simplicity, we'll use a placeholder knapsack evaluation
        // In a real implementation, this would take weights/values and capacity
        let totalValue = 0;
        for (let i = 0; i < this.genes.length; i++) {
            // Treat gene values as probabilities of including item
            if (this.genes[i] > 0.5) {
                totalValue += this.genes[i]; // Simplified value calculation
            }
        }
        return totalValue;
    }

    defaultFunction() {
        // Sum of all genes as a simple example
        return this.genes.reduce((sum, gene) => sum + gene, 0);
    }

    copy() {
        const newIndividual = new Individual(this.genes.length);
        newIndividual.genes = [...this.genes];
        newIndividual.fitness = this.fitness;
        return newIndividual;
    }
}

class GeneticAlgorithm {
    constructor(config) {
        this.config = config;
        this.population = [];
        this.generation = 0;
        this.bestIndividual = null;
        this.fitnessHistory = {
            best: [],
            average: [],
            worst: [],
            stdDev: []
        };
        this.geneLength = 10; // Default gene length, can be configured
    }

    initializePopulation() {
        this.population = [];
        for (let i = 0; i < this.config.populationSize; i++) {
            const individual = new Individual(this.geneLength);
            individual.evaluateFitness(this.config.problemDomain, this.config.objectiveFunction);
            this.population.push(individual);
        }
        this.updateStats();
    }

    evaluatePopulation() {
        for (const individual of this.population) {
            individual.evaluateFitness(this.config.problemDomain, this.config.objectiveFunction);
        }
    }

    selectParent() {
        switch (this.config.selectionMethod) {
            case 'roulette':
                return this.rouletteWheelSelection();
            case 'tournament':
                return this.tournamentSelection();
            case 'ranking':
                return this.rankingSelection();
            default:
                return this.tournamentSelection();
        }
    }

    rouletteWheelSelection() {
        // Calculate total fitness
        let totalFitness = 0;
        for (const individual of this.population) {
            totalFitness += individual.fitness;
        }

        // If all individuals have zero fitness, pick randomly
        if (totalFitness === 0) {
            return this.population[Math.floor(Math.random() * this.population.length)];
        }

        // Pick a random value between 0 and totalFitness
        let pick = Math.random() * totalFitness;
        let current = 0;

        for (const individual of this.population) {
            current += individual.fitness;
            if (current >= pick) {
                return individual;
            }
        }

        // Fallback (shouldn't reach here)
        return this.population[this.population.length - 1];
    }

    tournamentSelection() {
        const tournamentSize = this.config.tournamentSize || 3;
        let best = this.population[Math.floor(Math.random() * this.population.length)];

        for (let i = 1; i < tournamentSize; i++) {
            const candidate = this.population[Math.floor(Math.random() * this.population.length)];
            if (candidate.fitness > best.fitness) {
                best = candidate;
            }
        }

        return best;
    }

    rankingSelection() {
        // Sort population by fitness
        const sortedPop = [...this.population].sort((a, b) => b.fitness - a.fitness);

        // Assign ranks (higher fitness gets lower rank number)
        const ranks = Array.from({length: sortedPop.length}, (_, i) => i + 1);
        const totalRank = ranks.reduce((sum, rank) => sum + rank, 0);

        // Pick based on rank
        let pick = Math.random() * totalRank;
        let current = 0;

        for (let i = 0; i < sortedPop.length; i++) {
            current += ranks[i];
            if (current >= pick) {
                return sortedPop[i];
            }
        }

        return sortedPop[sortedPop.length - 1];
    }

    crossover(parent1, parent2) {
        const child1 = new Individual(this.geneLength);
        const child2 = new Individual(this.geneLength);

        // Only perform crossover based on probability
        if (Math.random() > this.config.crossoverRate / 100) {
            // No crossover, just copy parents
            child1.genes = [...parent1.genes];
            child2.genes = [...parent2.genes];
            return [child1, child2];
        }

        switch (this.config.crossoverType) {
            case 'single_point':
                [child1.genes, child2.genes] = this.singlePointCrossover(parent1.genes, parent2.genes);
                break;
            case 'two_point':
                [child1.genes, child2.genes] = this.twoPointCrossover(parent1.genes, parent2.genes);
                break;
            case 'uniform':
                [child1.genes, child2.genes] = this.uniformCrossover(parent1.genes, parent2.genes);
                break;
            default:
                [child1.genes, child2.genes] = this.singlePointCrossover(parent1.genes, parent2.genes);
        }

        return [child1, child2];
    }

    singlePointCrossover(genes1, genes2) {
        const point = Math.floor(Math.random() * genes1.length);
        const child1Genes = [...genes1.slice(0, point), ...genes2.slice(point)];
        const child2Genes = [...genes2.slice(0, point), ...genes1.slice(point)];
        return [child1Genes, child2Genes];
    }

    twoPointCrossover(genes1, genes2) {
        const point1 = Math.floor(Math.random() * genes1.length);
        const point2 = Math.floor(Math.random() * genes1.length);
        const start = Math.min(point1, point2);
        const end = Math.max(point1, point2);

        const child1Genes = [
            ...genes1.slice(0, start),
            ...genes2.slice(start, end),
            ...genes1.slice(end)
        ];

        const child2Genes = [
            ...genes2.slice(0, start),
            ...genes1.slice(start, end),
            ...genes2.slice(end)
        ];

        return [child1Genes, child2Genes];
    }

    uniformCrossover(genes1, genes2) {
        const child1Genes = [];
        const child2Genes = [];

        for (let i = 0; i < genes1.length; i++) {
            if (Math.random() < 0.5) {
                child1Genes.push(genes1[i]);
                child2Genes.push(genes2[i]);
            } else {
                child1Genes.push(genes2[i]);
                child2Genes.push(genes1[i]);
            }
        }

        return [child1Genes, child2Genes];
    }

    mutate(individual) {
        for (let i = 0; i < individual.genes.length; i++) {
            if (Math.random() < this.config.mutationRate / 100) {
                switch (this.config.mutationType) {
                    case 'bit_flip':
                        individual.genes[i] = Math.random(); // Replace with random value
                        break;
                    case 'swap':
                        // Swap with another random gene
                        const swapIndex = Math.floor(Math.random() * individual.genes.length);
                        const temp = individual.genes[i];
                        individual.genes[i] = individual.genes[swapIndex];
                        individual.genes[swapIndex] = temp;
                        break;
                    case 'gaussian':
                        // Add small Gaussian noise
                        const gaussianNoise = this.nextGaussian() * 0.1;
                        individual.genes[i] = Math.max(0, Math.min(1, individual.genes[i] + gaussianNoise));
                        break;
                }
            }
        }
    }

    // Helper function for Gaussian distribution
    nextGaussian() {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    updateStats() {
        // Sort population by fitness (descending)
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        this.bestIndividual = this.population[0].copy();
        
        // Calculate statistics
        const fitnessValues = this.population.map(ind => ind.fitness);
        const totalFitness = fitnessValues.reduce((sum, val) => sum + val, 0);
        const avgFitness = totalFitness / this.population.length;
        
        const bestFitness = fitnessValues[0];
        const worstFitness = fitnessValues[fitnessValues.length - 1];
        
        // Calculate standard deviation
        const variance = fitnessValues.reduce((sum, val) => sum + Math.pow(val - avgFitness, 2), 0) / this.population.length;
        const stdDev = Math.sqrt(variance);
        
        // Store history
        this.fitnessHistory.best.push(bestFitness);
        this.fitnessHistory.average.push(avgFitness);
        this.fitnessHistory.worst.push(worstFitness);
        this.fitnessHistory.stdDev.push(stdDev);
    }

    evolve() {
        // Evaluate current population
        this.evaluatePopulation();
        
        // Create new population
        const newPopulation = [];
        
        // Elitism: keep best individuals
        if (this.config.elitism && this.config.eliteCount > 0) {
            this.population.sort((a, b) => b.fitness - a.fitness);
            for (let i = 0; i < this.config.eliteCount; i++) {
                if (i < this.population.length) {
                    newPopulation.push(this.population[i].copy());
                }
            }
        }
        
        // Generate offspring
        while (newPopulation.length < this.config.populationSize) {
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();
            
            const [child1, child2] = this.crossover(parent1, parent2);
            
            this.mutate(child1);
            this.mutate(child2);
            
            // Evaluate children
            child1.evaluateFitness(this.config.problemDomain, this.config.objectiveFunction);
            child2.evaluateFitness(this.config.problemDomain, this.config.objectiveFunction);
            
            newPopulation.push(child1, child2);
        }
        
        // Trim to exact population size
        this.population = newPopulation.slice(0, this.config.populationSize);
        
        // Update statistics
        this.updateStats();
        this.generation++;
    }

    isTerminated() {
        return this.generation >= this.config.generations;
    }

    reset() {
        this.population = [];
        this.generation = 0;
        this.bestIndividual = null;
        this.fitnessHistory = {
            best: [],
            average: [],
            worst: [],
            stdDev: []
        };
    }
}