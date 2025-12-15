# Genetic Walkers Simulation

This is a complete implementation of a genetic walkers simulation that mimics the behavior of the original at https://rednuht.org/genetic_walkers/. The simulation uses a genetic algorithm to evolve virtual creatures (walkers) that learn to walk as far as possible.

## 🚀 Features

- **Complete genetic algorithm**: Implements selection, crossover, and mutation
- **Physics-based simulation**: Uses Matter.js for realistic physics
- **Interactive controls**: Adjust parameters in real-time
- **Visual representation**: See the walkers evolve and move
- **Performance tracking**: Monitor generations and scores

## 🛠️ Technical Implementation

The project consists of several key components:

### Core Classes

1. **Walker (`walker.js`)**:
   - Represents individual walker creatures
   - Contains body parts (rectangles) connected by joints
   - Has motors that drive movement based on genetic parameters
   - Calculates fitness based on distance traveled and posture

2. **Genetic Algorithm (`genetic-algorithm.js`)**:
   - Manages the population of walkers
   - Handles selection, crossover, and mutation
   - Controls the evolutionary process across generations

3. **Main Controller (`main.js`)**:
   - Integrates all components
   - Manages the simulation loop
   - Handles UI controls and updates

### Key Algorithms

- **Selection**: Tournament selection chooses parents for the next generation
- **Crossover**: Genes from two parents are combined to create offspring
- **Mutation**: Random changes are applied to genes to introduce variation
- **Fitness Function**: Based on distance traveled and ability to stay upright

### Physics System

- Uses Matter.js for realistic physics simulation
- Gravity affects all objects
- Joints connect body parts
- Motors apply forces to create movement

## 📊 Controls and Parameters

The simulation includes various adjustable parameters:

- **Gene Mutation Probability**: Chance that a gene will mutate during reproduction (0-100%)
- **Gene Mutation Amount**: How much a gene can change when mutated (0-100%)
- **Champions to Copy**: Number of top performers copied to the next generation (0-10)
- **Motor Noise**: Randomness added to motor movements (0-5%)
- **Round Length**: Duration before a new generation begins (various options)
- **Animation Quality**: Controls frame rate for rendering (up to 60 FPS)
- **Simulation Speed**: Controls how fast the physics runs (up to 1000x speed)

## 🏃‍♂️ Running the Project

### Local Execution (No Server Needed)

1. Simply open `index.html` in your web browser. Modern browsers support loading external libraries via CDN directly from local files.

### Using a Local Server (Alternative Method)

If you encounter CORS issues with the CDN, you can serve the files locally:

```bash
# Navigate to the project directory
cd /path/to/genetic-walkers

# Python 3
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if installed)
npx http-server

# Then visit http://localhost:8000 in your browser
```

## 🧬 How the Genetic Algorithm Works

1. **Initialization**: A population of random walkers is created
2. **Evaluation**: Each walker moves for a set period while its fitness is calculated
3. **Selection**: Top-performing walkers are chosen as parents for the next generation
4. **Crossover**: Genes from two parents are combined to create offspring
5. **Mutation**: Random changes are introduced to maintain genetic diversity
6. **Replacement**: The old generation is replaced with the new one
7. **Repeat**: Steps 2-6 continue for successive generations

## 📈 Fitness Calculation

Each walker's fitness is determined by:

- **Distance Traveled**: How far the walker moved horizontally from its starting position
- **Posture Bonus**: Additional points for staying upright (penalizes falling over)

The algorithm favors walkers that can maintain balance while moving forward efficiently.

## 🎯 Goal

Watch as the walkers gradually improve their walking ability over successive generations, demonstrating the power of evolutionary algorithms to optimize complex behaviors through trial and error.