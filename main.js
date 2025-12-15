// Main simulation script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Matter.js modules
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Body = Matter.Body;
    
    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 1; // Set gravity
    
    // Create renderer
    const canvas = document.getElementById('simulation-canvas');
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.clientWidth || 800,
            height: canvas.clientHeight || 400,
            wireframes: false,
            background: '#87CEEB' // Sky blue background
        }
    });
    
    // Create ground
    const ground = Bodies.rectangle(400, 450, 810, 60, { 
        isStatic: true,
        render: { fillStyle: '#2ECC71' } // Green ground
    });
    
    // Add ground to the world
    Composite.add(engine.world, [ground]);
    
    // Initialize genetic algorithm
    const ga = new GeneticAlgorithm(10); // Population of 10 walkers
    const startX = 100;
    const startY = 100;
    
    // Initialize population
    ga.initializePopulation(engine, startX, startY);
    
    // Control elements
    const mutationProbSlider = document.getElementById('mutation-probability');
    const mutationProbValue = document.getElementById('mutation-probability-value');
    const mutationAmountSlider = document.getElementById('mutation-amount');
    const mutationAmountValue = document.getElementById('mutation-amount-value');
    const championsSlider = document.getElementById('champions-to-copy');
    const championsValue = document.getElementById('champions-to-copy-value');
    const motorNoiseSlider = document.getElementById('motor-noise');
    const motorNoiseValue = document.getElementById('motor-noise-value');
    const roundLengthSelect = document.getElementById('round-length');
    const animationQualitySelect = document.getElementById('animation-quality');
    const simulationSpeedSelect = document.getElementById('simulation-speed');
    const resetButton = document.getElementById('reset-button');
    const generationDisplay = document.getElementById('generation');
    const recordDistanceDisplay = document.getElementById('record-distance');
    const bestWalkerDisplay = document.getElementById('best-walker');
    const walkersPerformanceDiv = document.getElementById('walkers-performance');
    
    // Set initial slider values
    mutationProbValue.textContent = `${mutationProbSlider.value}%`;
    mutationAmountValue.textContent = `${mutationAmountSlider.value}%`;
    championsValue.textContent = championsSlider.value;
    motorNoiseValue.textContent = `${motorNoiseSlider.value}%`;
    
    // Time tracking
    let startTime = Date.now();
    let lastUpdateTime = Date.now();
    let timeScale = 1; // For controlling simulation speed
    let isPaused = false;
    
    // Round length settings (in milliseconds)
    const roundLengthSettings = {
        'very-short': 5000,   // 5 seconds
        'short': 10000,       // 10 seconds
        'regular': 20000,     // 20 seconds
        'long': 40000,        // 40 seconds
        'loooong': 60000      // 60 seconds
    };
    
    let roundEndTime = Date.now() + roundLengthSettings.regular;
    
    // Animation settings
    let animationFrameId = null;
    let targetFPS = 30; // Default 30 FPS
    let frameInterval = 1000 / targetFPS;
    
    // Event listeners for controls
    mutationProbSlider.addEventListener('input', () => {
        ga.setMutationProbability(mutationProbSlider.value);
        mutationProbValue.textContent = `${mutationProbSlider.value}%`;
    });
    
    mutationAmountSlider.addEventListener('input', () => {
        ga.setMutationAmount(mutationAmountSlider.value);
        mutationAmountValue.textContent = `${mutationAmountSlider.value}%`;
    });
    
    championsSlider.addEventListener('input', () => {
        ga.setChampionsToCopy(championsSlider.value);
        championsValue.textContent = championsSlider.value;
    });
    
    motorNoiseSlider.addEventListener('input', () => {
        ga.setMotorNoise(motorNoiseSlider.value);
        motorNoiseValue.textContent = `${motorNoiseSlider.value}%`;
    });
    
    roundLengthSelect.addEventListener('change', () => {
        roundEndTime = Date.now() + roundLengthSettings[roundLengthSelect.value];
    });
    
    animationQualitySelect.addEventListener('change', () => {
        switch(animationQualitySelect.value) {
            case 'none':
                targetFPS = 0;
                break;
            case '10fps':
                targetFPS = 10;
                break;
            case '30fps':
                targetFPS = 30;
                break;
            case '60fps':
                targetFPS = 60;
                break;
        }
        frameInterval = 1000 / targetFPS;
    });
    
    simulationSpeedSelect.addEventListener('change', () => {
        switch(simulationSpeedSelect.value) {
            case 'pause':
                isPaused = true;
                break;
            case '30':
                timeScale = 0.5;
                isPaused = false;
                break;
            case '60':
                timeScale = 1;
                isPaused = false;
                break;
            case '120':
                timeScale = 2;
                isPaused = false;
                break;
            case '1000':
                timeScale = 10;
                isPaused = false;
                break;
        }
    });
    
    resetButton.addEventListener('click', () => {
        // Reset the genetic algorithm
        ga.generation = 1;
        ga.recordDistance = 0;
        ga.bestWalker = null;
        
        // Remove old population
        for (const walker of ga.population) {
            walker.kill();
        }
        
        // Create new population
        ga.initializePopulation(engine, startX, startY);
        
        // Reset timer
        roundEndTime = Date.now() + roundLengthSettings[roundLengthSelect.value];
        
        // Update UI
        updateUI();
    });
    
    // Update UI elements
    function updateUI() {
        generationDisplay.textContent = ga.generation;
        recordDistanceDisplay.textContent = Math.round(ga.recordDistance);
        bestWalkerDisplay.textContent = ga.bestWalker ? ga.bestWalker.name : '-';
        
        // Update walkers performance list
        updateWalkersPerformanceList();
    }
    
    // Update the walkers performance list
    function updateWalkersPerformanceList() {
        walkersPerformanceDiv.innerHTML = '';
        
        // Sort population by fitness
        const sortedWalkers = [...ga.population].sort((a, b) => b.fitness - a.fitness);
        
        for (const walker of sortedWalkers) {
            const walkerElement = document.createElement('div');
            walkerElement.className = 'walker-item';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'walker-name';
            nameElement.textContent = walker.name;
            
            const scoreElement = document.createElement('div');
            scoreElement.className = 'walker-score';
            scoreElement.textContent = `Score: ${Math.round(walker.fitness)}`;
            
            walkerElement.appendChild(nameElement);
            walkerElement.appendChild(scoreElement);
            walkersPerformanceDiv.appendChild(walkerElement);
        }
    }
    
    // Main simulation loop
    function simulationLoop() {
        const now = Date.now();
        
        // Check if round is over
        if (now > roundEndTime) {
            // Create next generation
            ga.createNextGeneration(engine, startX, startY);
            
            // Reset timer for next round
            roundEndTime = now + roundLengthSettings[roundLengthSelect.value];
        }
        
        // Update walkers if not paused
        if (!isPaused) {
            const deltaTime = (now - lastUpdateTime) * 0.001 * timeScale; // Convert to seconds and apply time scale
            const time = (now - startTime) * 0.001;
            
            for (const walker of ga.population) {
                walker.update(time);
            }
            
            // Update physics engine
            Engine.update(engine, deltaTime * 1000); // Matter.js expects delta in ms
            
            lastUpdateTime = now;
        }
        
        // Update UI
        updateUI();
        
        // Continue the loop if animation is not disabled
        if (targetFPS > 0) {
            setTimeout(() => {
                animationFrameId = requestAnimationFrame(simulationLoop);
            }, frameInterval);
        } else {
            // If animation is disabled, just run the logic periodically
            setTimeout(simulationLoop, 100); // Run every 100ms when no animation
        }
    }
    
    // Start the simulation
    simulationLoop();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const container = document.querySelector('.simulation-container');
        render.options.width = container.clientWidth;
        render.options.height = container.clientHeight;
        Render.setPixelRatio(render, window.devicePixelRatio);
    });
});