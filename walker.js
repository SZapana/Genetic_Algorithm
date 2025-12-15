// Definición de la clase Walker (caminante) y su estructura física
class Walker {
    constructor(genome = null, name = '') {
        // Si no se proporciona un genoma, creamos uno aleatorio
        this.genome = genome || this.createRandomGenome();
        this.name = name || this.generateRandomName();
        this.score = 0;
        this.bodyParts = {}; // Almacenará las partes físicas del cuerpo
        this.joints = []; // Almacenará las articulaciones
        this.motors = []; // Almacenará los motores de las articulaciones
        this.initialPosition = { x: 0, y: 0 }; // Posición inicial para cálculos de fitness
        this.isAlive = true;
    }

    // Crear un genoma aleatorio para un nuevo walker
    createRandomGenome() {
        const genome = {
            // Parámetros de tamaño del cuerpo
            bodyWidth: Math.random() * 0.4 + 0.3, // 0.3 a 0.7 metros
            bodyHeight: Math.random() * 0.3 + 0.2, // 0.2 a 0.5 metros
            legSegmentLength: Math.random() * 0.3 + 0.2, // 0.2 a 0.5 metros
            legSegmentThickness: Math.random() * 0.1 + 0.05, // 0.05 a 0.15 metros
            
            // Parámetros del motor - cada valor representa un motor diferente
            // Hay 4 motores: 2 para las piernas superiores e inferiores izquierda y derecha
            motorAmplitudes: [], // Amplitud de oscilación para cada motor
            motorFrequencies: [], // Frecuencia de oscilación para cada motor
            motorPhases: [] // Desfase de fase para coordinación
        };

        // Inicializamos los parámetros del motor con valores aleatorios
        for (let i = 0; i < 4; i++) {
            genome.motorAmplitudes.push(Math.random() * 2 - 1); // Valores entre -1 y 1
            genome.motorFrequencies.push(Math.random() * 5 + 0.5); // Valores entre 0.5 y 5.5
            genome.motorPhases.push(Math.random() * Math.PI * 2); // Valores entre 0 y 2π
        }

        return genome;
    }

    // Generar un nombre aleatorio para el walker
    generateRandomName() {
        const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
        const suffixes = ['Walker', 'Strider', 'Ambler', 'Stroller', 'Marcher', 'Glider', 'Pacer', 'Rover'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const number = Math.floor(Math.random() * 1000);
        return `${prefix}${suffix}${number}`;
    }

    // Crear la representación física del walker usando planck.js
    createPhysicalRepresentation(world, startX, startY) {
        this.initialPosition = { x: startX, y: startY };
        
        const g = this.genome;
        
        // Creamos el cuerpo central (torso)
        const bodyDef = planck.BodyDef({
            type: 'dynamic',
            position: planck.Vec2(startX, startY),
            fixedRotation: false
        });
        
        const body = world.createBody(bodyDef);
        
        // Forma del cuerpo (rectángulo)
        const bodyShape = planck.Box(g.bodyWidth/2, g.bodyHeight/2);
        const bodyFixture = planck.FixtureDef({
            shape: bodyShape,
            density: 1.0,
            friction: 0.3
        });
        
        body.createFixture(bodyFixture);
        this.bodyParts.torso = body;
        
        // Creamos las piernas
        this.createLeg(world, startX - g.bodyWidth/2, startY, 'left');
        this.createLeg(world, startX + g.bodyWidth/2, startY, 'right');
        
        return body;
    }

    // Crear una pierna (conjunto de segmentos)
    createLeg(world, hipX, hipY, side) {
        const g = this.genome;
        const sideMultiplier = side === 'left' ? -1 : 1;
        
        // Articulación de cadera (conecta la pierna al torso)
        const upperLegDef = planck.BodyDef({
            type: 'dynamic',
            position: planck.Vec2(hipX, hipY + g.legSegmentLength/2),
            fixedRotation: false
        });
        
        const upperLeg = world.createBody(upperLegDef);
        const upperLegShape = planck.Box(g.legSegmentThickness/2, g.legSegmentLength/2);
        const upperLegFixture = planck.FixtureDef({
            shape: upperLegShape,
            density: 1.0,
            friction: 0.3
        });
        
        upperLeg.createFixture(upperLegFixture);
        this.bodyParts[`${side}UpperLeg`] = upperLeg;
        
        // Articulación de rodilla (conecta pierna superior con inferior)
        const lowerLegDef = planck.BodyDef({
            type: 'dynamic',
            position: planck.Vec2(hipX, hipY + g.legSegmentLength * 1.5),
            fixedRotation: false
        });
        
        const lowerLeg = world.createBody(lowerLegDef);
        const lowerLegShape = planck.Box(g.legSegmentThickness/2, g.legSegmentLength/2);
        const lowerLegFixture = planck.FixtureDef({
            shape: lowerLegShape,
            density: 1.0,
            friction: 0.3
        });
        
        lowerLeg.createFixture(lowerLegFixture);
        this.bodyParts[`${side}LowerLeg`] = lowerLeg;
        
        // Articulación de cadera (entre torso y pierna superior)
        const hipJointDef = planck.RevoluteJointDef();
        hipJointDef.bodyA = this.bodyParts.torso;
        hipJointDef.bodyB = upperLeg;
        hipJointDef.localAnchorA.set(sideMultiplier * this.genome.bodyWidth/2, 0);
        hipJointDef.localAnchorB.set(0, -this.genome.legSegmentLength/2);
        hipJointDef.enableLimit = true;
        hipJointDef.lowerAngle = -Math.PI/2; // Límite inferior del ángulo
        hipJointDef.upperAngle = Math.PI/2;  // Límite superior del ángulo
        hipJointDef.enableMotor = true;
        hipJointDef.maxMotorTorque = 10.0;
        
        const hipJoint = world.createJoint(hipJointDef);
        this.joints.push(hipJoint);
        
        // Articulación de rodilla (entre pierna superior e inferior)
        const kneeJointDef = planck.RevoluteJointDef();
        kneeJointDef.bodyA = upperLeg;
        kneeJointDef.bodyB = lowerLeg;
        kneeJointDef.localAnchorA.set(0, this.genome.legSegmentLength/2);
        kneeJointDef.localAnchorB.set(0, -this.genome.legSegmentLength/2);
        kneeJointDef.enableLimit = true;
        kneeJointDef.lowerAngle = 0; // Límite inferior del ángulo
        kneeJointDef.upperAngle = Math.PI * 0.8;  // Límite superior del ángulo
        kneeJointDef.enableMotor = true;
        kneeJointDef.maxMotorTorque = 10.0;
        
        const kneeJoint = world.createJoint(kneeJointDef);
        this.joints.push(kneeJoint);
        
        // Guardamos los motores para controlarlos durante la simulación
        this.motors.push({ joint: hipJoint, side: side, segment: 'upper' });
        this.motors.push({ joint: kneeJoint, side: side, segment: 'lower' });
    }

    // Actualizar los motores basados en el genoma y el tiempo
    updateMotors(time, noise = 0.05) {
        // Calculamos el movimiento para cada motor basado en los genes
        for (let i = 0; i < this.motors.length; i++) {
            const motorData = this.motors[i];
            const joint = motorData.joint;
            
            // Determinar qué índice de gen usar según el lado y segmento
            let geneIndex;
            if (motorData.side === 'left') {
                geneIndex = motorData.segment === 'upper' ? 0 : 1;
            } else {
                geneIndex = motorData.segment === 'upper' ? 2 : 3;
            }
            
            // Obtener los parámetros del genoma
            const amplitude = this.genome.motorAmplitudes[geneIndex];
            const frequency = this.genome.motorFrequencies[geneIndex];
            const phase = this.genome.motorPhases[geneIndex];
            
            // Calcular el objetivo de ángulo basado en la función sinusoidal
            const targetAngle = amplitude * Math.sin(frequency * time + phase);
            
            // Agregar ruido aleatorio si es necesario
            const noisyTargetAngle = targetAngle + (Math.random() * 2 - 1) * noise;
            
            // Aplicar el objetivo de velocidad angular al motor
            joint.setMotorSpeed(noisyTargetAngle * 2); // Multiplicamos por 2 para mayor velocidad
        }
    }

    // Calcular la puntuación (fitness) del walker
    calculateFitness() {
        if (!this.bodyParts.torso) return 0;
        
        // Obtenemos la posición actual del torso (cabeza/cuerpo principal)
        const torsoPos = this.bodyParts.torso.getPosition();
        const torsoY = torsoPos.y;
        
        // Calculamos la distancia horizontal desde la posición inicial
        const distanceTraveled = Math.abs(torsoPos.x - this.initialPosition.x);
        
        // La puntuación se basa en:
        // 1. Distancia recorrida (lo más importante)
        // 2. Altura mantenida (indicativo de estar de pie)
        // 3. Estabilidad (menor oscilación vertical)
        const heightScore = Math.max(0, 5 - torsoY) * 10; // Premio por mantenerse arriba
        const distanceScore = distanceTraveled * 10;      // Premio por moverse
        const stabilityScore = Math.max(0, 100 - Math.abs(torsoY - this.initialPosition.y) * 20); // Penalización por inestabilidad
        
        // La puntuación final combina todos estos factores
        this.score = distanceScore + heightScore + stabilityScore;
        
        return this.score;
    }

    // Método para matar al walker (marcar como no vivo)
    kill() {
        this.isAlive = false;
    }
}