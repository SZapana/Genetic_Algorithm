# Genetic Algorithm Walkers

Una implementación completa del demo "Genetic Algorithm Walkers" similar al disponible en https://rednuht.org/genetic_walkers/

## Características

- Simulación física basada en Box2D usando planck.js
- Algoritmo genético con selección, crossover y mutación
- Control completo de parámetros de evolución
- Visualización en tiempo real de la simulación
- Exportación/importación de genomas
- Modos de velocidad y calidad ajustables

## Requisitos

- Un navegador web moderno
- Acceso a Internet para cargar las bibliotecas externas (planck.js)

## Cómo ejecutar

Simplemente abre `index.html` en tu navegador. No se requiere servidor web para funcionamiento básico.

Para mejor experiencia con módulos ES6, puedes usar un servidor local como:

```bash
python -m http.server 8000
```

O con Node.js:

```bash
npx serve .
```

Luego visita `http://localhost:8000`

## Estructura del Proyecto

- `index.html` - Página principal con interfaz
- `styles.css` - Estilos de la aplicación
- `main.js` - Lógica principal de la aplicación
- `ga.js` - Algoritmo genético
- `physics.js` - Simulación física
- `walker.js` - Definición de los caminantes
- `renderer.js` - Renderizado visual
- `assets/` - Recursos adicionales