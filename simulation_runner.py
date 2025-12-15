"""
Script opcional para ejecutar simulaciones headless (sin UI) para hacer runs largas y guardar estadísticas.
Este script puede ejecutar simulaciones genéticas sin interfaz gráfica para análisis más profundos.
"""

import json
import time
import random
from datetime import datetime

class HeadlessSimulation:
    def __init__(self, population_size=50, mutation_rate=0.1, mutation_magnitude=0.2, num_champions=2):
        """
        Inicializa la simulación sin UI
        """
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.mutation_magnitude = mutation_magnitude
        self.num_champions = num_champions
        self.generation = 0
        self.fitness_history = []
        self.population = []
        
    def create_random_genome(self):
        """
        Crear un genoma aleatorio para un walker (mismo formato que en JS)
        """
        genome = {
            "bodyWidth": random.uniform(0.3, 0.7),
            "bodyHeight": random.uniform(0.2, 0.5),
            "legSegmentLength": random.uniform(0.2, 0.5),
            "legSegmentThickness": random.uniform(0.05, 0.15),
            "motorAmplitudes": [random.uniform(-1, 1) for _ in range(4)],
            "motorFrequencies": [random.uniform(0.5, 5.5) for _ in range(4)],
            "motorPhases": [random.uniform(0, 2 * 3.14159) for _ in range(4)]
        }
        return genome

    def initialize_population(self):
        """
        Inicializar la población con genomas aleatorios
        """
        self.population = []
        for i in range(self.population_size):
            genome = self.create_random_genome()
            walker = {
                "name": f"Walker_{self.generation}_{i}",
                "genome": genome,
                "score": 0
            }
            self.population.append(walker)
        self.generation = 0

    def simulate_walker(self, walker):
        """
        Simular un walker y calcular su fitness (simplificado para la versión headless)
        En una implementación completa, esto usaría un motor físico real
        """
        # En la versión headless, generamos una puntuación basada en los genes
        # En una implementación real, esto ejecutaría la física real
        genome = walker["genome"]
        
        # Simulación simplificada: mejor fitness para combinaciones equilibradas de genes
        score = 0
        
        # Contribución de la amplitud del motor
        avg_amplitude = sum(abs(a) for a in genome["motorAmplitudes"]) / len(genome["motorAmplitudes"])
        score += avg_amplitude * 10
        
        # Contribución de la frecuencia del motor
        avg_frequency = sum(genome["motorFrequencies"]) / len(genome["motorFrequencies"])
        score += avg_frequency * 5
        
        # Contribución del tamaño del cuerpo
        body_score = (genome["bodyWidth"] + genome["bodyHeight"]) * 10
        score += body_score
        
        # Contribución de la longitud de la pierna
        leg_score = genome["legSegmentLength"] * 15
        score += leg_score
        
        # Agregar algo de aleatoriedad para evitar convergencia prematura
        score += random.uniform(-5, 5)
        
        walker["score"] = max(0, score)  # Asegurar puntuación no negativa
        return walker["score"]

    def simulate_generation(self):
        """
        Simular una generación completa (evaluar todos los walkers)
        """
        for walker in self.population:
            self.simulate_walker(walker)
        
        # Ordenar por puntuación (mejor primero)
        self.population.sort(key=lambda x: x["score"], reverse=True)

    def select_parent(self):
        """
        Seleccionar un padre usando selección por ruleta
        """
        total_fitness = sum(max(0.1, w["score"]) for w in self.population)  # Evitar división por 0
        
        pick = random.uniform(0, total_fitness)
        current = 0
        
        for walker in self.population:
            current += max(0.1, walker["score"])
            if current >= pick:
                return walker
        
        return self.population[0]  # Por si acaso

    def crossover(self, parent1, parent2):
        """
        Crear un hijo combinando dos padres
        """
        child_genome = {}
        
        # Parámetros de tamaño corporal
        child_genome["bodyWidth"] = random.choice([parent1["genome"]["bodyWidth"], parent2["genome"]["bodyWidth"]])
        child_genome["bodyHeight"] = random.choice([parent1["genome"]["bodyHeight"], parent2["genome"]["bodyHeight"]])
        child_genome["legSegmentLength"] = random.choice([parent1["genome"]["legSegmentLength"], parent2["genome"]["legSegmentLength"]])
        child_genome["legSegmentThickness"] = random.choice([parent1["genome"]["legSegmentThickness"], parent2["genome"]["legSegmentThickness"]])

        # Parámetros del motor
        child_genome["motorAmplitudes"] = []
        child_genome["motorFrequencies"] = []
        child_genome["motorPhases"] = []

        for i in range(4):
            child_genome["motorAmplitudes"].append(random.choice([
                parent1["genome"]["motorAmplitudes"][i], 
                parent2["genome"]["motorAmplitudes"][i]
            ]))
            child_genome["motorFrequencies"].append(random.choice([
                parent1["genome"]["motorFrequencies"][i], 
                parent2["genome"]["motorFrequencies"][i]
            ]))
            child_genome["motorPhases"].append(random.choice([
                parent1["genome"]["motorPhases"][i], 
                parent2["genome"]["motorPhases"][i]
            ]))

        return {
            "name": f"Child_{self.generation}_{len(self.population)}",
            "genome": child_genome,
            "score": 0
        }

    def mutate_genome(self, genome):
        """
        Mutar un genoma
        """
        # Mutar parámetros de tamaño corporal
        if random.random() < self.mutation_rate:
            genome["bodyWidth"] += random.uniform(-1, 1) * self.mutation_magnitude
            genome["bodyWidth"] = max(0.1, min(2.0, genome["bodyWidth"]))

        if random.random() < self.mutation_rate:
            genome["bodyHeight"] += random.uniform(-1, 1) * self.mutation_magnitude
            genome["bodyHeight"] = max(0.1, min(1.0, genome["bodyHeight"]))

        if random.random() < self.mutation_rate:
            genome["legSegmentLength"] += random.uniform(-1, 1) * self.mutation_magnitude
            genome["legSegmentLength"] = max(0.1, min(1.0, genome["legSegmentLength"]))

        if random.random() < self.mutation_rate:
            genome["legSegmentThickness"] += random.uniform(-1, 1) * self.mutation_magnitude
            genome["legSegmentThickness"] = max(0.01, min(0.3, genome["legSegmentThickness"]))

        # Mutar parámetros del motor
        for i in range(4):
            if random.random() < self.mutation_rate:
                genome["motorAmplitudes"][i] += random.uniform(-1, 1) * self.mutation_magnitude
                genome["motorAmplitudes"][i] = max(-2, min(2, genome["motorAmplitudes"][i]))

            if random.random() < self.mutation_rate:
                genome["motorFrequencies"][i] += random.uniform(-1, 1) * self.mutation_magnitude
                genome["motorFrequencies"][i] = max(0.1, min(10, genome["motorFrequencies"][i]))

            if random.random() < self.mutation_rate:
                genome["motorPhases"][i] += random.uniform(-1, 1) * self.mutation_magnitude
                # Mantener fase entre 0 y 2π
                genome["motorPhases"][i] = genome["motorPhases"][i] % (2 * 3.14159)

        return genome

    def next_generation(self):
        """
        Crear la siguiente generación
        """
        # Guardar estadísticas de la generación actual
        best_score = self.population[0]["score"] if self.population else 0
        avg_score = sum(w["score"] for w in self.population) / len(self.population) if self.population else 0
        
        self.fitness_history.append({
            "generation": self.generation,
            "best_score": best_score,
            "avg_score": avg_score,
            "timestamp": time.time()
        })

        # Crear nueva población
        new_population = []

        # Copiar campeones
        for i in range(min(self.num_champions, len(self.population))):
            champion = self.population[i]
            champion_copy = {
                "name": f"{champion['name']}_copy",
                "genome": dict(champion["genome"]),  # Copia profunda
                "score": champion["score"]
            }
            new_population.append(champion_copy)

        # Llenar el resto con crossover y mutación
        while len(new_population) < self.population_size:
            parent1 = self.select_parent()
            parent2 = self.select_parent()
            
            child = self.crossover(parent1, parent2)
            child["genome"] = self.mutate_genome(child["genome"])
            
            new_population.append(child)

        self.population = new_population
        self.generation += 1

        return {
            "generation": self.generation,
            "best_score": best_score,
            "avg_score": avg_score
        }

    def run_simulation(self, num_generations=100, save_frequency=10):
        """
        Ejecutar la simulación completa
        """
        print(f"Iniciando simulación de {num_generations} generaciones...")
        
        start_time = time.time()
        
        # Inicializar población
        self.initialize_population()
        
        for gen in range(num_generations):
            print(f"Generación {gen + 1}/{num_generations}")
            
            # Simular la generación actual
            self.simulate_generation()
            
            # Crear siguiente generación
            stats = self.next_generation()
            
            # Guardar estado periódicamente
            if (gen + 1) % save_frequency == 0:
                self.save_state(f"checkpoint_gen_{gen+1}.json")
                print(f"  - Mejor puntuación: {stats['best_score']:.2f}")
                print(f"  - Puntuación promedio: {stats['avg_score']:.2f}")
        
        end_time = time.time()
        print(f"Simulación completada en {end_time - start_time:.2f} segundos")
        
        # Guardar resultados finales
        self.save_results("final_results.json")
        
        return self.fitness_history

    def save_state(self, filename):
        """
        Guardar el estado actual de la simulación
        """
        state = {
            "generation": self.generation,
            "population_size": self.population_size,
            "mutation_rate": self.mutation_rate,
            "mutation_magnitude": self.mutation_magnitude,
            "num_champions": self.num_champions,
            "population": self.population,
            "fitness_history": self.fitness_history
        }
        
        with open(filename, 'w') as f:
            json.dump(state, f, indent=2)
        
        print(f"Estado guardado en {filename}")

    def save_results(self, filename):
        """
        Guardar los resultados finales
        """
        results = {
            "final_generation": self.generation,
            "total_generations": len(self.fitness_history),
            "best_individual": self.population[0] if self.population else None,
            "fitness_history": self.fitness_history,
            "parameters": {
                "population_size": self.population_size,
                "mutation_rate": self.mutation_rate,
                "mutation_magnitude": self.mutation_magnitude,
                "num_champions": self.num_champions
            },
            "timestamp": datetime.now().isoformat()
        }
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Resultados guardados en {filename}")


def main():
    """
    Función principal para ejecutar la simulación
    """
    # Crear y ejecutar la simulación
    sim = HeadlessSimulation(
        population_size=50,
        mutation_rate=0.1,
        mutation_magnitude=0.2,
        num_champions=2
    )
    
    # Ejecutar simulación de ejemplo
    results = sim.run_simulation(num_generations=50, save_frequency=10)
    
    print("\nResumen final:")
    if results:
        final_stats = results[-1]
        print(f"Última generación: {final_stats['generation']}")
        print(f"Mejor puntuación final: {final_stats['best_score']:.2f}")
        print(f"Puntuación promedio final: {final_stats['avg_score']:.2f}")


if __name__ == "__main__":
    main()