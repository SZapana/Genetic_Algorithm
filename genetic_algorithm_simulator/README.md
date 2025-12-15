# Genetic Algorithm Simulator

An interactive visualization tool for understanding and experimenting with genetic algorithms. This simulator allows users to configure, run, observe, and analyze the behavior of genetic algorithms in real-time with dynamic charts, population visualization, and detailed process tracking.

## 🚀 Features

### 1. Algorithm Configuration
- **Population Settings**: Adjust population size and maximum generations
- **Selection Methods**: Choose between Roulette Wheel, Tournament, and Ranking selection
- **Crossover Settings**: Select from Single Point, Two Point, or Uniform crossover with adjustable probability
- **Mutation Settings**: Configure Bit Flip, Swap, or Gaussian mutation with customizable rates
- **Elitism**: Enable/disable and set number of elite individuals to preserve
- **Objective Functions**: Toggle between maximization and minimization
- **Problem Domains**: Choose from mathematical optimization, knapsack problem, or benchmark functions (Rastrigin, Sphere, Ackley)

### 2. Real-time Visualization
- **Fitness Charts**: Dynamic line graphs showing best, average, and worst fitness over generations
- **Population Visualization**: 2D scatter plot or 1D bar chart showing individual distribution
- **Statistics Panel**: Real-time display of generation count, best fitness, average fitness, and worst fitness
- **Process Tracking**: Visual indicators showing current evolution step (Selection, Crossover, Mutation, Replacement)

### 3. Interactive Controls
- **Start/Pause/Step**: Run simulation continuously, pause, or advance generation by generation
- **Reset**: Clear simulation and start fresh
- **Speed Control**: Adjust simulation speed from 1% to 100%
- **Step-by-step Mode**: Educational mode showing each evolution step with descriptions

## 🛠️ Technical Architecture

### Frontend
- **HTML5**: Semantic markup for accessibility and structure
- **CSS3**: Modern styling with glassmorphism effects, dark mode, and responsive design
- **JavaScript**: Modular architecture with classes for GA core, visualization, and main controller
- **Chart.js**: Interactive fitness evolution charts
- **Canvas API**: Population visualization

### Algorithm Implementation
- **Individual Class**: Represents a single solution with genes and fitness
- **GeneticAlgorithm Class**: Core GA logic with selection, crossover, mutation operators
- **Benchmark Functions**: Implementation of Rastrigin, Sphere, and Ackley functions
- **Selection Methods**: Roulette wheel, tournament, and ranking selection
- **Crossover Operators**: Single point, two point, and uniform crossover
- **Mutation Operators**: Bit flip, swap, and Gaussian mutation

## 📊 Problem Domains

### Benchmark Functions
- **Rastrigin Function**: Non-convex function with many local minima
- **Sphere Function**: Continuous, convex function with single global minimum
- **Ackley Function**: Multimodal function with nearly flat outer region

### Optimization Types
- **Maximization/Minimization**: Toggle between objective types
- **Mathematical Optimization**: General function optimization
- **Knapsack Problem**: Combinatorial optimization (simplified implementation)

## 🎛️ Controls Guide

### Population Settings
- **Population Size**: Number of individuals in each generation (10-200)
- **Max Generations**: Maximum number of generations to run (10-500)

### Selection Configuration
- **Selection Method**: Algorithm for choosing parents
- **Tournament Size**: Size of tournament for tournament selection (2-10)

### Crossover Configuration
- **Crossover Type**: Method for combining parent genes
- **Crossover Rate**: Probability of crossover occurring (0-100%)

### Mutation Configuration
- **Mutation Type**: Method for introducing variation
- **Mutation Rate**: Probability of mutation per gene (0-20%)

### Elitism
- **Enable Elitism**: Preserve best individuals across generations
- **Elite Count**: Number of best individuals to preserve (0-10)

## 🧪 Educational Value

### Learning Objectives
- Understand genetic algorithm components and their interactions
- Observe how parameter changes affect algorithm performance
- Visualize population evolution over time
- Compare different selection, crossover, and mutation strategies

### Didactic Features
- Step-by-step execution mode with explanations
- Real-time visualization of population distribution
- Fitness progression charts
- Process step indicators showing current algorithm phase

## 🚦 Getting Started

### Running the Simulator
1. Open `index.html` in any modern web browser
2. Configure algorithm parameters using the control panel
3. Click "Start" to begin the simulation
4. Use "Pause", "Step", or "Reset" controls as needed

### Recommended Starting Configuration
- Population Size: 50
- Selection: Tournament
- Tournament Size: 3
- Crossover: Single Point, 80%
- Mutation: Bit Flip, 5%
- Elitism: Enabled, 2 elites
- Problem: Rastrigin Function

## 📈 Analysis Capabilities

### Performance Metrics
- Best fitness progression
- Average fitness evolution
- Worst fitness tracking
- Standard deviation analysis

### Comparative Analysis
- Compare different parameter configurations
- Analyze convergence behavior
- Study exploration vs exploitation trade-offs

## 🛡️ Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

This simulator is designed for educational purposes. Contributions are welcome, especially for:
- Additional problem domains
- New visualization techniques
- Performance improvements
- Educational content

## 📄 License

This project is available for educational use. Feel free to adapt and extend for teaching purposes.