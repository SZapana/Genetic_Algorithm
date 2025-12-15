// Clase que maneja el renderizado visual de la simulación
class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración de dimensiones
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Escala para convertir unidades físicas a píxeles
        this.scale = 100; // 1 metro = 100 píxeles
        
        // Centro de la pantalla (para posicionar el mundo físico)
        this.centerX = this.width / 2;
        this.centerY = this.height * 0.8; // Suelo en la parte inferior
        
        // Color de fondo
        this.backgroundColor = '#0f172a';
    }

    // Convertir coordenadas físicas a coordenadas de lienzo
    physToCanvas(pos) {
        // En Box2D/planck.js, Y positiva va hacia arriba, pero en canvas va hacia abajo
        return {
            x: this.centerX + pos.x * this.scale,
            y: this.centerY - pos.y * this.scale
        };
    }

    // Dibujar el mundo físico
    renderWorld(physicsEngine) {
        // Limpiar el lienzo
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Dibujar un degradado sutil en el fondo
        this.drawBackground();
        
        // Dibujar el suelo
        this.drawGround();
        
        // Dibujar todos los walkers
        const walkers = physicsEngine.getWalkers();
        for (const walker of walkers) {
            this.renderWalker(walker);
        }
    }
    
    // Dibujar un fondo más interesante
    drawBackground() {
        // Dibujar un degradado radial
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(this.width, this.height) / 2
        );
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Dibujar el suelo
    drawGround() {
        this.ctx.strokeStyle = '#4cc9f0';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        // El suelo está en y = -1 en coordenadas físicas
        const groundY = this.centerY - (-1) * this.scale; // Convertir coordenadas físicas a canvas
        
        // Dibujar una línea con estilo más interesante
        this.ctx.setLineDash([5, 15]);
        this.ctx.moveTo(0, groundY);
        this.ctx.lineTo(this.width, groundY);
        this.ctx.stroke();
        
        // Restablecer el estilo de línea
        this.ctx.setLineDash([]);
    }

    // Dibujar un walker específico
    renderWalker(walker) {
        // Dibujar torso
        if (walker.bodyParts.torso) {
            this.drawBodyPart(walker.bodyParts.torso, '#4361ee', walker.genome.bodyWidth, walker.genome.bodyHeight, true);
        }
        
        // Dibujar piernas izquierda
        if (walker.bodyParts.leftUpperLeg) {
            this.drawBodyPart(walker.bodyParts.leftUpperLeg, '#f72585', walker.genome.legSegmentThickness, walker.genome.legSegmentLength);
        }
        
        if (walker.bodyParts.leftLowerLeg) {
            this.drawBodyPart(walker.bodyParts.leftLowerLeg, '#b5179e', walker.genome.legSegmentThickness, walker.genome.legSegmentLength);
        }
        
        // Dibujar piernas derecha
        if (walker.bodyParts.rightUpperLeg) {
            this.drawBodyPart(walker.bodyParts.rightUpperLeg, '#7209b7', walker.genome.legSegmentThickness, walker.genome.legSegmentLength);
        }
        
        if (walker.bodyParts.rightLowerLeg) {
            this.drawBodyPart(walker.bodyParts.rightLowerLeg, '#560bad', walker.genome.legSegmentThickness, walker.genome.legSegmentLength);
        }
        
        // Dibujar una sombra debajo de cada walker
        this.drawShadow(walker);
    }
    
    // Dibujar sombra debajo del walker
    drawShadow(walker) {
        if (!walker.bodyParts.torso) return;
        
        const torsoPos = walker.bodyParts.torso.getPosition();
        const canvasPos = this.physToCanvas(torsoPos);
        
        // Sombra debajo del torso
        this.ctx.beginPath();
        this.ctx.arc(canvasPos.x, this.centerY + 5, walker.genome.bodyWidth * this.scale * 0.8, 0, Math.PI * 2);
        const gradient = this.ctx.createRadialGradient(
            canvasPos.x, this.centerY + 5, 0,
            canvasPos.x, this.centerY + 5, walker.genome.bodyWidth * this.scale * 0.8
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    // Dibujar una parte del cuerpo (caja rectangular)
    drawBodyPart(body, color, width, height, isTorso = false) {
        if (!body) return;
        
        const pos = body.getPosition();
        const angle = body.getAngle();
        
        // Convertir posición física a coordenadas de lienzo
        const canvasPos = this.physToCanvas(pos);
        
        // Guardar el estado actual del contexto
        this.ctx.save();
        
        // Mover el origen al centro de la parte del cuerpo
        this.ctx.translate(canvasPos.x, canvasPos.y);
        this.ctx.rotate(angle);
        
        // Dibujar la caja
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Si es el torso, dibujar con esquinas redondeadas
        if (isTorso) {
            this.drawRoundedRect(-width * this.scale / 2, -height * this.scale / 2, 
                                width * this.scale, height * this.scale, 10);
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // Dibujar rectángulo centrado en el origen
            this.ctx.fillRect(-width * this.scale / 2, -height * this.scale / 2, 
                             width * this.scale, height * this.scale);
            this.ctx.strokeRect(-width * this.scale / 2, -height * this.scale / 2, 
                               width * this.scale, height * this.scale);
        }
        
        // Restaurar el estado del contexto
        this.ctx.restore();
    }
    
    // Dibujar rectángulo con esquinas redondeadas
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    // Actualizar la información del walker actual en la UI
    updateCurrentWalkerInfo(walker) {
        if (walker) {
            document.getElementById('currentWalkerName').textContent = walker.name;
            document.getElementById('currentWalkerScore').textContent = walker.score.toFixed(2);
        } else {
            document.getElementById('currentWalkerName').textContent = '-';
            document.getElementById('currentWalkerScore').textContent = '0';
        }
    }

    // Actualizar la tabla de récords
    updateRecordsTable(topWalkers) {
        const tbody = document.getElementById('recordsTableBody');
        tbody.innerHTML = ''; // Limpiar tabla
        
        // Agregar los mejores walkers
        topWalkers.forEach((walker, index) => {
            const row = document.createElement('tr');
            
            const rankCell = document.createElement('td');
            rankCell.textContent = index + 1;
            
            const nameCell = document.createElement('td');
            nameCell.textContent = walker.name;
            
            const scoreCell = document.createElement('td');
            scoreCell.textContent = walker.score.toFixed(2);
            
            row.appendChild(rankCell);
            row.appendChild(nameCell);
            row.appendChild(scoreCell);
            
            tbody.appendChild(row);
        });
    }

    // Actualizar estadísticas generales
    updateStats(generation, bestScore, avgScore) {
        document.getElementById('generationCount').textContent = generation;
        document.getElementById('bestScore').textContent = bestScore.toFixed(2);
        document.getElementById('avgScore').textContent = avgScore.toFixed(2);
    }

    // Redimensionar el lienzo si cambia el tamaño
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.centerX = width / 2;
        this.centerY = height * 0.8;
    }
}