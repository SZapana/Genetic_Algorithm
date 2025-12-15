// Walker class represents a single walker creature
class Walker {
    constructor(engine, x, y, genes = null) {
        this.engine = engine;
        this.x = x;
        this.y = y;
        this.bodyParts = [];
        this.joints = [];
        this.motors = [];
        this.score = 0;
        this.distanceTraveled = 0;
        this.initialX = x;
        this.fitness = 0;
        this.name = '';
        
        // Generate random genes if none provided
        if (!genes) {
            this.genes = this.generateRandomGenes();
        } else {
            this.genes = genes;
        }
        
        this.createBody();
        this.generateName();
    }
    
    // Generate random genes for the walker
    generateRandomGenes() {
        const genes = {
            numSegments: Math.floor(Math.random() * 4) + 2, // 2-5 segments
            segmentLengths: [],
            jointAngles: [],
            motorFrequencies: [],
            motorAmplitudes: [],
            bodyPartSizes: []
        };
        
        for (let i = 0; i < genes.numSegments; i++) {
            genes.segmentLengths.push(Math.random() * 50 + 20); // 20-70 pixels
            genes.jointAngles.push((Math.random() * Math.PI / 2) - Math.PI / 4); // -45 to 45 degrees
            genes.motorFrequencies.push(Math.random() * 5 + 1); // 1-6 Hz
            genes.motorAmplitudes.push(Math.random() * Math.PI / 3); // 0 to 60 degrees
            genes.bodyPartSizes.push({
                width: Math.random() * 20 + 10, // 10-30 pixels
                height: Math.random() * 20 + 10
            });
        }
        
        return genes;
    }
    
    // Create the physical body of the walker
    createBody() {
        const { Bodies, Body, Composite } = Matter;
        
        // Create head (main body part)
        const head = Bodies.rectangle(this.x, this.y, 30, 30, {
            render: {
                fillStyle: '#3498db'
            },
            friction: 0.01,
            restitution: 0.1
        });
        
        this.bodyParts.push(head);
        
        let prevPart = head;
        let currentY = this.y;
        
        // Create segments based on genes
        for (let i = 0; i < this.genes.numSegments; i++) {
            const segmentLength = this.genes.segmentLengths[i];
            const jointAngle = this.genes.jointAngles[i];
            const size = this.genes.bodyPartSizes[i];
            
            currentY += segmentLength;
            
            // Create body part
            const bodyPart = Bodies.rectangle(
                this.x, 
                currentY, 
                size.width, 
                size.height, 
                {
                    render: {
                        fillStyle: '#e74c3c'
                    },
                    friction: 0.01,
                    restitution: 0.1
                }
            );
            
            this.bodyParts.push(bodyPart);
            
            // Create joint between previous part and current part
            const joint = Matter.Constraint.create({
                bodyA: prevPart,
                bodyB: bodyPart,
                pointA: { x: 0, y: segmentLength / 2 },
                pointB: { x: 0, y: -segmentLength / 2 },
                stiffness: 1,
                length: 0
            });
            
            this.joints.push(joint);
            
            // Create motor (revolute joint with motor)
            const motor = {
                bodyA: prevPart,
                bodyB: bodyPart,
                pointA: { x: 0, y: segmentLength / 2 },
                pointB: { x: 0, y: -segmentLength / 2 },
                frequency: this.genes.motorFrequencies[i],
                amplitude: this.genes.motorAmplitudes[i],
                phase: Math.random() * Math.PI * 2, // Random phase offset
                enabled: true
            };
            
            this.motors.push(motor);
            
            prevPart = bodyPart;
        }
        
        // Add all parts to the world
        Composite.add(this.engine.world, [...this.bodyParts, ...this.joints]);
    }
    
    // Update the walker's movement based on motors
    update(time) {
        const { Body } = Matter;
        
        for (let i = 0; i < this.motors.length; i++) {
            const motor = this.motors[i];
            if (!motor.enabled) continue;
            
            // Calculate target angle based on sine wave
            const targetAngle = Math.sin(time * motor.frequency + motor.phase) * motor.amplitude;
            
            // Apply torque to make the joint move toward the target angle
            // This is a simplified approach - in reality we'd need proper joint constraints
            if (motor.bodyA && motor.bodyB) {
                // Calculate relative angle and apply corrective torque
                const currentAngle = motor.bodyB.angle - motor.bodyA.angle;
                const angleDiff = targetAngle - currentAngle;
                
                // Apply small impulse to achieve desired movement
                Body.applyForce(motor.bodyB, motor.bodyB.position, {
                    x: Math.sin(angleDiff) * 0.0001,
                    y: 0
                });
            }
        }
        
        // Update score based on distance traveled
        const headX = this.bodyParts[0].position.x;
        this.distanceTraveled = Math.abs(headX - this.initialX);
        this.score = this.distanceTraveled;
        
        // Add bonus for maintaining upright posture
        const head = this.bodyParts[0];
        const headAngle = Math.abs(head.angle % (Math.PI * 2));
        // Penalize if not upright (closer to 0 or 2π is better)
        const anglePenalty = Math.min(
            Math.abs(headAngle),
            Math.abs(Math.PI * 2 - headAngle),
            Math.abs(Math.PI - headAngle),
            Math.abs(Math.PI * 3 - headAngle)
        ) * 10;
        
        this.fitness = this.distanceTraveled - anglePenalty;
    }
    
    // Get the position of the walker's head
    getHeadPosition() {
        if (this.bodyParts.length > 0) {
            return this.bodyParts[0].position;
        }
        return { x: this.x, y: this.y };
    }
    
    // Get the furthest distance any part of the walker has traveled
    getFurthestDistance() {
        let maxDist = 0;
        for (const part of this.bodyParts) {
            const dist = Math.abs(part.position.x - this.initialX);
            if (dist > maxDist) {
                maxDist = dist;
            }
        }
        return maxDist;
    }
    
    // Generate a name based on the walker's characteristics
    generateName() {
        const prefixes = ['Robo', 'Mech', 'Cyber', 'Auto', 'Bio', 'Proto', 'Nano', 'Hyper'];
        const middles = ['Walker', 'Runner', 'Mover', 'Crawler', 'Stroller', 'Marcher', 'Jumper', 'Hopper'];
        const suffixes = ['X1', 'Pro', 'Lite', 'Max', 'Ultra', 'Prime', 'One', 'Zero'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const middle = middles[Math.floor(Math.random() * middles.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        this.name = `${prefix}${middle}${suffix}`;
    }
    
    // Kill the walker by removing it from the physics world
    kill() {
        const { Composite } = Matter;
        Composite.remove(this.engine.world, [...this.bodyParts, ...this.joints]);
    }
}

// Export the Walker class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Walker;
}