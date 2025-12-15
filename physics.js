// Clase que maneja la simulación física usando planck.js
class PhysicsEngine {
    constructor(gravity = -10) {
        // Creamos el mundo físico con gravedad
        this.world = planck.World({
            gravity: planck.Vec2(0, gravity)
        });
        
        // Configuramos los parámetros de la simulación
        this.timeStep = 1.0 / 60.0; // 60 FPS de simulación física
        this.velocityIterations = 8;
        this.positionIterations = 3;
        
        // Crear el suelo
        this.createGround();
        
        // Lista de walkers en la simulación
        this.walkers = [];
    }

    // Crear el suelo donde caminarán los walkers
    createGround() {
        const groundDef = planck.BodyDef({
            position: planck.Vec2(0, -1)
        });

        const ground = this.world.createBody(groundDef);

        // Forma del suelo (una caja larga)
        const groundShape = planck.Box(50, 1, planck.Vec2(0, 0), 0);
        ground.createFixture(groundShape, 0.5); // densidad 0 para que sea estático
    }

    // Agregar un walker a la simulación
    addWalker(walker, startX = 0, startY = 5) {
        const body = walker.createPhysicalRepresentation(this.world, startX, startY);
        this.walkers.push(walker);
        return body;
    }

    // Actualizar la simulación física
    update(deltaTime = null) {
        // Si no se proporciona deltaTime, usamos el predeterminado
        const stepTime = deltaTime || this.timeStep;
        
        // Avanzamos la simulación física
        this.world.step(stepTime, this.velocityIterations, this.positionIterations);
    }

    // Limpiar la simulación
    clear() {
        // Eliminar todos los bodies excepto el suelo
        const bodies = [];
        for (let b = this.world.getBodyList(); b; b = b.getNext()) {
            bodies.push(b);
        }

        for (const body of bodies) {
            if (body.getPosition().y !== -1) { // No eliminar el suelo
                this.world.destroyBody(body);
            }
        }
        
        this.walkers = [];
    }

    // Obtener la lista de walkers
    getWalkers() {
        return this.walkers;
    }

    // Actualizar los motores de todos los walkers
    updateWalkerMotors(time, noise = 0.05) {
        for (const walker of this.walkers) {
            walker.updateMotors(time, noise);
        }
    }

    // Calcular las puntuaciones de todos los walkers
    calculateAllFitness() {
        for (const walker of this.walkers) {
            walker.calculateFitness();
        }
    }

    // Obtener el walker con la mejor puntuación
    getBestWalker() {
        if (this.walkers.length === 0) return null;

        let best = this.walkers[0];
        for (const walker of this.walkers) {
            if (walker.score > best.score) {
                best = walker;
            }
        }
        return best;
    }

    // Obtener la puntuación promedio de todos los walkers
    getAverageFitness() {
        if (this.walkers.length === 0) return 0;

        let total = 0;
        for (const walker of this.walkers) {
            total += walker.score;
        }
        return total / this.walkers.length;
    }

    // Obtener la mejor puntuación
    getBestFitness() {
        if (this.walkers.length === 0) return 0;

        let best = 0;
        for (const walker of this.walkers) {
            if (walker.score > best) best = walker.score;
        }
        return best;
    }
}