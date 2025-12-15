// Implementación del algoritmo genético para evolucionar walkers
class GeneticAlgorithm {
    constructor(populationSize = 50, mutationRate = 0.1, mutationMagnitude = 0.2, numChampions = 2) {
        this.populationSize = populationSize;
        this.mutationRate = mutationRate;
        this.mutationMagnitude = mutationMagnitude;
        this.numChampions = numChampions; // Cuántos campeones se copian directamente
        this.population = [];
        this.generation = 0;
        this.fitnessHistory = []; // Historial de puntuaciones por generación
    }

    // Inicializar la población con walkers aleatorios
    initializePopulation() {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            const walker = new Walker();
            this.population.push(walker);
        }
        this.generation = 0;
    }

    // Seleccionar un walker de la población basado en su fitness (ruleta)
    selectParent() {
        // Calculamos la suma total de fitness
        let totalFitness = 0;
        for (const walker of this.population) {
            // Aseguramos que no haya fitness negativo
            totalFitness += Math.max(0, walker.score) + 0.1; // Sumamos 0.1 para evitar división por 0
        }

        // Si todos tienen fitness cero, elegimos aleatoriamente
        if (totalFitness <= 0) {
            return this.population[Math.floor(Math.random() * this.population.length)];
        }

        // Seleccionamos un punto aleatorio en el rango de fitness
        let pick = Math.random() * totalFitness;
        let current = 0;

        for (const walker of this.population) {
            current += Math.max(0, walker.score) + 0.1;
            if (current >= pick) {
                return walker;
            }
        }

        // En caso extremo, devolvemos el último
        return this.population[this.population.length - 1];
    }

    // Crear un hijo combinando dos padres (crossover)
    crossover(parent1, parent2) {
        const childGenome = {};

        // Copiamos todos los parámetros del genoma
        // Para cada propiedad del genoma, podemos tomarla de un padre o mezclarla
        
        // Parámetros de tamaño corporal
        childGenome.bodyWidth = Math.random() > 0.5 ? parent1.genome.bodyWidth : parent2.genome.bodyWidth;
        childGenome.bodyHeight = Math.random() > 0.5 ? parent1.genome.bodyHeight : parent2.genome.bodyHeight;
        childGenome.legSegmentLength = Math.random() > 0.5 ? parent1.genome.legSegmentLength : parent2.genome.legSegmentLength;
        childGenome.legSegmentThickness = Math.random() > 0.5 ? parent1.genome.legSegmentThickness : parent2.genome.legSegmentThickness;

        // Parámetros del motor (amplitudes, frecuencias, fases)
        childGenome.motorAmplitudes = [];
        childGenome.motorFrequencies = [];
        childGenome.motorPhases = [];

        for (let i = 0; i < 4; i++) {
            // Tomamos cada parámetro de un padre aleatoriamente
            childGenome.motorAmplitudes.push(Math.random() > 0.5 ? parent1.genome.motorAmplitudes[i] : parent2.genome.motorAmplitudes[i]);
            childGenome.motorFrequencies.push(Math.random() > 0.5 ? parent1.genome.motorFrequencies[i] : parent2.genome.motorFrequencies[i]);
            childGenome.motorPhases.push(Math.random() > 0.5 ? parent1.genome.motorPhases[i] : parent2.genome.motorPhases[i]);
        }

        return new Walker(childGenome);
    }

    // Mutar un genoma
    mutate(genome) {
        // Mutar parámetros de tamaño corporal
        if (Math.random() < this.mutationRate) {
            genome.bodyWidth += (Math.random() * 2 - 1) * this.mutationMagnitude;
            genome.bodyWidth = Math.max(0.1, Math.min(2.0, genome.bodyWidth)); // Limitar rango
        }

        if (Math.random() < this.mutationRate) {
            genome.bodyHeight += (Math.random() * 2 - 1) * this.mutationMagnitude;
            genome.bodyHeight = Math.max(0.1, Math.min(1.0, genome.bodyHeight));
        }

        if (Math.random() < this.mutationRate) {
            genome.legSegmentLength += (Math.random() * 2 - 1) * this.mutationMagnitude;
            genome.legSegmentLength = Math.max(0.1, Math.min(1.0, genome.legSegmentLength));
        }

        if (Math.random() < this.mutationRate) {
            genome.legSegmentThickness += (Math.random() * 2 - 1) * this.mutationMagnitude;
            genome.legSegmentThickness = Math.max(0.01, Math.min(0.3, genome.legSegmentThickness));
        }

        // Mutar parámetros del motor
        for (let i = 0; i < 4; i++) {
            if (Math.random() < this.mutationRate) {
                genome.motorAmplitudes[i] += (Math.random() * 2 - 1) * this.mutationMagnitude;
                genome.motorAmplitudes[i] = Math.max(-2, Math.min(2, genome.motorAmplitudes[i]));
            }

            if (Math.random() < this.mutationRate) {
                genome.motorFrequencies[i] += (Math.random() * 2 - 1) * this.mutationMagnitude;
                genome.motorFrequencies[i] = Math.max(0.1, Math.min(10, genome.motorFrequencies[i]));
            }

            if (Math.random() < this.mutationRate) {
                genome.motorPhases[i] += (Math.random() * 2 - 1) * this.mutationMagnitude;
                // Mantener fase entre 0 y 2π
                genome.motorPhases[i] = ((genome.motorPhases[i] % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            }
        }

        return genome;
    }

    // Crear la siguiente generación
    nextGeneration() {
        // Primero ordenamos la población por fitness (de mayor a menor)
        this.population.sort((a, b) => b.score - a.score);

        // Guardamos las estadísticas de esta generación
        const bestScore = this.population[0].score;
        const avgScore = this.getAverageFitness();
        this.fitnessHistory.push({
            generation: this.generation,
            bestScore: bestScore,
            avgScore: avgScore
        });

        // Creamos la nueva población
        const newPopulation = [];

        // Copiamos los mejores (campeones) directamente a la siguiente generación
        for (let i = 0; i < Math.min(this.numChampions, this.population.length); i++) {
            // Creamos una copia del walker campeón
            const champion = this.population[i];
            const championCopy = new Walker({...champion.genome}, `${champion.name}_copy`);
            newPopulation.push(championCopy);
        }

        // Llenamos el resto de la población mediante selección, crossover y mutación
        while (newPopulation.length < this.populationSize) {
            // Seleccionamos dos padres
            const parent1 = this.selectParent();
            const parent2 = this.selectParent();

            // Creamos un hijo mediante crossover
            const child = this.crossover(parent1, parent2);

            // Mutamos el genoma del hijo
            child.genome = this.mutate(child.genome);

            // Asignamos un nuevo nombre al hijo
            child.name = `Child_${this.generation}_${newPopulation.length}`;

            newPopulation.push(child);
        }

        // Reemplazamos la población anterior con la nueva
        this.population = newPopulation;
        this.generation++;

        // Devolvemos información sobre la generación
        return {
            generation: this.generation,
            bestScore: bestScore,
            avgScore: avgScore,
            bestWalker: this.population[0]
        };
    }

    // Obtener la puntuación promedio de la población actual
    getAverageFitness() {
        if (this.population.length === 0) return 0;

        let total = 0;
        for (const walker of this.population) {
            total += walker.score;
        }
        return total / this.population.length;
    }

    // Obtener la mejor puntuación de la población actual
    getBestFitness() {
        if (this.population.length === 0) return 0;

        let best = 0;
        for (const walker of this.population) {
            if (walker.score > best) best = walker.score;
        }
        return best;
    }

    // Obtener el walker con la mejor puntuación
    getBestWalker() {
        if (this.population.length === 0) return null;

        let best = this.population[0];
        for (const walker of this.population) {
            if (walker.score > best.score) {
                best = walker;
            }
        }
        return best;
    }

    // Obtener los mejores walkers para mostrar en la tabla de récords
    getTopWalkers(count = 10) {
        // Ordenar por puntuación y devolver los primeros 'count'
        const sorted = [...this.population].sort((a, b) => b.score - a.score);
        return sorted.slice(0, count);
    }

    // Exportar la población actual como JSON
    exportPopulation() {
        const data = {
            generation: this.generation,
            populationSize: this.populationSize,
            mutationRate: this.mutationRate,
            mutationMagnitude: this.mutationMagnitude,
            numChampions: this.numChampions,
            population: this.population.map(walker => ({
                name: walker.name,
                score: walker.score,
                genome: walker.genome
            }))
        };
        
        return JSON.stringify(data, null, 2);
    }

    // Importar una población desde JSON
    importPopulation(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            this.generation = data.generation || 0;
            this.populationSize = data.populationSize || 50;
            this.mutationRate = data.mutationRate || 0.1;
            this.mutationMagnitude = data.mutationMagnitude || 0.2;
            this.numChampions = data.numChampions || 2;
            
            this.population = data.population.map(item => {
                const walker = new Walker(item.genome, item.name);
                walker.score = item.score || 0;
                return walker;
            });
            
            return true;
        } catch (error) {
            console.error('Error importing population:', error);
            return false;
        }
    }
}