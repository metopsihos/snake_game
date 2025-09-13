// Level 2 (Space) extensions injected into FieldManager prototype if present
(function attachSpaceLevel() {
    if (typeof FieldManager === 'undefined') return;

    // Initialize space field: planets as barriers and falling asteroids
    FieldManager.prototype.initSpaceField = function initSpaceField() {
        this.game.fieldObstacles = this.createSpacePlanets();
        // Delay asteroid creation until foods are spawned to align with fruits
        this.game.fieldEnemies = [];
    };

    // Create planets: small (5 tiles cross/diamond-like) or large (13 tiles ball)
    FieldManager.prototype.createSpacePlanets = function createSpacePlanets() {
        const planets = [];

        const totalTiles = this.game.fieldWidth * this.game.fieldHeight;
        const maxOccupancy = Math.floor(totalTiles * 0.07); // cap ~7% tiles as planets

        // Small planet pattern (9 tiles in 3x3 grid)
        // Numbers represent planet image index (1-9), 0 = no planet
        // Only positions 2,4,5,6,8 are obstacles (marked with 'obstacle' property)
        const smallPattern = [
            [1,2,3],  // Row 0: planet images 1,2,3
            [4,5,6],  // Row 1: planet images 4,5,6  
            [7,8,9]   // Row 2: planet images 7,8,9
        ];
        
        // Define which positions are obstacles for small planets (1-based indexing)
        const smallObstaclePositions = new Set([2, 4, 5, 6, 8]);

        // Large planet pattern (25 tiles in 5x5 grid)
        // Numbers represent planet_big image index (1-25)
        // Only certain positions are obstacles, others are passable decorations
        const largePattern = [
            [1,2,3,4,5],      // Row 0: images 1,2,3,4,5
            [6,7,8,9,10],     // Row 1: images 6,7,8,9,10
            [11,12,13,14,15], // Row 2: images 11,12,13,14,15 (center row)
            [16,17,18,19,20], // Row 3: images 16,17,18,19,20
            [21,22,23,24,25]  // Row 4: images 21,22,23,24,25
        ];
        
        // Define which positions are NOT obstacles for large planets (1-based indexing)
        // Positions 1,2,4,5,6,10,16,20,21,22,24,25 are passable
        const largeNonObstaclePositions = new Set([1,2,4,5,6,10,16,20,21,22,24,25]);

        const candidates = [];

        // Decide counts based on base size categories
        const minDim = Math.min(this.game.fieldWidth, this.game.fieldHeight);
        let totalPlanets = 3; // small
        if (minDim >= 20 && minDim < 25) totalPlanets = 5; // medium
        else if (minDim >= 25 && minDim < 30) totalPlanets = 7; // large
        else if (minDim >= 30) totalPlanets = 10; // huge
        // Distribute into large/small (40% large, 60% small)
        const largeCount = Math.max(1, Math.round(totalPlanets * 0.4));
        const smallCount = Math.max(0, totalPlanets - largeCount);

        // Helper to place small planet (3x3 grid)
        const placeSmall = (cx, cy) => {
            const tiles = [];
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const planetIndex = smallPattern[r][c];
                    if (planetIndex === 0) continue;
                    
                    const x = cx + (c - 1); // Center at cx
                    const y = cy + (r - 1); // Center at cy
                    if (x < 0 || y < 0 || x >= this.game.fieldWidth || y >= this.game.fieldHeight) return null;
                    
                    // Check if position is already occupied by existing planets
                    for (let existingPlanet of planets) {
                        if (existingPlanet.x === x && existingPlanet.y === y) return null;
                    }
                    
                    const isObstacle = smallObstaclePositions.has(planetIndex);
                    tiles.push({
                        x, y, 
                        planetIndex, 
                        isObstacle,
                        planetType: 'small'
                    });
                }
            }
            return tiles;
        };

        // Helper to place large planet (5x5 grid)
        const placeLarge = (cx, cy) => {
            const tiles = [];
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 5; c++) {
                    const planetIndex = largePattern[r][c];
                    
                    const x = cx + (c - 2); // Center at cx
                    const y = cy + (r - 2); // Center at cy
                    if (x < 0 || y < 0 || x >= this.game.fieldWidth || y >= this.game.fieldHeight) return null;
                    
                    // Check if position is already occupied by existing planets
                    for (let existingPlanet of planets) {
                        if (existingPlanet.x === x && existingPlanet.y === y) return null;
                    }
                    
                    const isObstacle = !largeNonObstaclePositions.has(planetIndex);
                    tiles.push({
                        x, y, 
                        planetIndex,
                        isObstacle,
                        planetType: 'large'
                    });
                }
            }
            return tiles;
        };

        let occupied = 0;

        // Place planets: large first, then small
        const tryPlace = (attempts, count, placer, color, emoji, planetType = 'unknown') => {
            let placed = 0;
            let tries = 0;
            
            while (placed < count && tries < attempts && occupied < maxOccupancy) {
                const cx = Math.floor(Math.random() * this.game.fieldWidth);
                const cy = Math.floor(Math.random() * this.game.fieldHeight);
                
                const tiles = placer(cx, cy);
                tries++;
                
                if (!tiles) continue;
                if (occupied + tiles.length > maxOccupancy) break;
                
                for (const t of tiles) {
                    planets.push({ 
                        x: t.x, 
                        y: t.y, 
                        type: 'planet', 
                        emoji, 
                        color,
                        planetIndex: t.planetIndex || null,
                        isObstacle: t.isObstacle !== false,
                        planetType: t.planetType || 'large',
                        centerX: cx,
                        centerY: cy
                    });
                }
                occupied += tiles.length;
                placed++;
            }
        };

        // Place large planets first
        tryPlace(400, largeCount, placeLarge, '#3949AB', '🪐', 'large');
        
        // Then place small planets
        tryPlace(400, smallCount, placeSmall, '#5C6BC0', '🪐', 'small');

        return planets;
    };

    // Create vertically moving asteroids that destroy fruits
    FieldManager.prototype.createAsteroids = function createAsteroids() {
        const asteroids = [];
        // Scale asteroid count by size category (small 3, medium 5, large 7, huge 10)
        const minDim = Math.min(this.game.fieldWidth, this.game.fieldHeight);
        let count = 3;
        if (minDim >= 20 && minDim < 25) count = 5;
        else if (minDim >= 25 && minDim < 30) count = 7;
        else if (minDim >= 30) count = 10;
        
        // Prefer fruit columns so player races the meteorites
        const fruitXs = Array.from(new Set((this.game.foods || []).map(f => f.x)));
        const chosenXs = [];
        for (let x of fruitXs) {
            if (chosenXs.length >= count) break;
            chosenXs.push(x);
        }
        while (chosenXs.length < count) {
            const x = Math.floor(Math.random() * this.game.fieldWidth);
            if (!chosenXs.includes(x)) chosenXs.push(x);
        }
        for (let i = 0; i < count; i++) {
            const x = chosenXs[i % chosenXs.length];
            const y = 0; // start at top so snake has time to chase
            
            // Create single meteorite entity (only the main obstacle tile)
            // The visual tail (tiles 1-2) will be rendered relative to this position
            asteroids.push({
                x, 
                y: y + 2, // Start with the bottom tile (obstacle) position
                type: 'asteroid',
                emoji: '☄️',
                color: '#EF6C00',
                lastMoveTime: 0,
                moveInterval: 300 + Math.random() * 300, // 0.3-0.6s
                dy: 1,
                meteoriteIndex: 3, // This is the main obstacle tile
                isObstacle: true, // Only this tile is the actual obstacle
                groupId: `meteorite_${i}` // Track which meteorite this is
            });
        }
        return asteroids;
    };

    // Reset asteroids to follow current fruits (call after foods are spawned)
    FieldManager.prototype.resetAsteroidsToFruitColumns = function resetAsteroidsToFruitColumns() {
        this.game.fieldEnemies = this.createAsteroids();
    };

    // Update asteroids: move down; when off-screen, respawn at top new column; destroy fruits they touch
    FieldManager.prototype.updateAsteroids = function updateAsteroids() {
        const currentTime = Date.now();
        const enemies = this.game.fieldEnemies || [];
        for (let i = 0; i < enemies.length; i++) {
            const a = enemies[i];
            if (a.type !== 'asteroid' && a.type !== 'big_asteroid') continue;
            if (currentTime - a.lastMoveTime <= a.moveInterval) continue;

            a.lastMoveTime = currentTime;
            const newY = a.y + a.dy;
            if (newY >= this.game.fieldHeight) {
                // Respawn at top following a random fruit column if available
                a.y = 0;
                if (a.type === 'asteroid') {
                    const fruits = this.game.foods || [];
                    if (fruits.length > 0) {
                        const fruit = fruits[Math.floor(Math.random() * fruits.length)];
                        a.x = fruit.x;
                    } else {
                        a.x = Math.floor(Math.random() * this.game.fieldWidth);
                    }
                } else if (a.type === 'big_asteroid') {
                    a.x = Math.floor(Math.random() * Math.max(1, this.game.fieldWidth - 2));
                }
            } else {
                // Always fall; planets do not affect meteorites
                a.y = newY;
            }
            // Destroy fruit at asteroid position (only at the actual obstacle position)
            const destroyedIndices = [];
            if (a.type === 'big_asteroid') {
                // For big asteroids, only destroy fruits at the bottom row (obstacle positions)
                for (let ox = 0; ox < 3; ox++) {
                    const tx = a.x + ox;
                    const ty = a.y + 2; // Bottom row (obstacle positions)
                    for (let f = this.game.foods.length - 1; f >= 0; f--) {
                        const food = this.game.foods[f];
                        if (food.x === tx && food.y === ty) {
                            destroyedIndices.push(f);
                        }
                    }
                }
            } else {
                // For small asteroids, only destroy fruits at the main meteorite position (bottom tile)
                for (let f = this.game.foods.length - 1; f >= 0; f--) {
                    const food = this.game.foods[f];
                    if (food.x === a.x && food.y === a.y) {
                        destroyedIndices.push(f);
                    }
                }
            }
            if (destroyedIndices.length > 0) {
                // Unique and sort descending before splicing
                const unique = Array.from(new Set(destroyedIndices)).sort((x,y)=> y - x);
                for (const idx of unique) {
                    this.game.foods.splice(idx, 1);
                    this.game.spawnSingleFood();
                }
                // Increment asteroid counter by number of fruits destroyed
                if (this.game.fruitDestructionCounters) {
                    this.game.fruitDestructionCounters.asteroid = (this.game.fruitDestructionCounters.asteroid || 0) + unique.length;
                    this.game.updateFruitCountersUI?.();
                }
            }
        }

        // Keep at most 5 asteroids; if fewer (e.g., removed), spawn new at top following fruits
        // Maintain target asteroid count based on size
        const minDim2 = Math.min(this.game.fieldWidth, this.game.fieldHeight);
        let target = 3;
        if (minDim2 >= 20 && minDim2 < 25) target = 5;
        else if (minDim2 >= 25 && minDim2 < 30) target = 7;
        else if (minDim2 >= 30) target = 10;
        const currentSmall = enemies.filter(e => e.type === 'asteroid').length;
        for (let i = currentSmall; i < target; i++) {
            let x;
            const fruits = this.game.foods || [];
            if (fruits.length > 0) {
                x = fruits[Math.floor(Math.random() * fruits.length)].x;
            } else {
                x = Math.floor(Math.random() * this.game.fieldWidth);
            }
            const asteroid = {
                x, y: 0,
                type: 'asteroid', emoji: '☄️', color: '#EF6C00',
                lastMoveTime: 0,
                moveInterval: 300 + Math.random() * 300,
                dy: 1,
                meteoriteIndex: 3, // This is the main obstacle tile
                isObstacle: true // Only this tile is the actual obstacle
            };
            enemies.push(asteroid);
        }
        this.game.fieldEnemies = enemies;
    };

    // Spawn a single asteroid immediately (used when player eats one)
    FieldManager.prototype.spawnAsteroidAtFruitOrTop = function spawnAsteroidAtFruitOrTop() {
        let x;
        const fruits = this.game.foods || [];
        if (fruits.length > 0) {
            x = fruits[Math.floor(Math.random() * fruits.length)].x;
        } else {
            x = Math.floor(Math.random() * this.game.fieldWidth);
        }
        const asteroid = {
            x, y: 0,
            type: 'asteroid', emoji: '☄️', color: '#EF6C00',
            lastMoveTime: 0,
            moveInterval: 300 + Math.random() * 300,
            dy: 1,
            meteoriteIndex: 3, // This is the main obstacle tile
            isObstacle: true // Only this tile is the actual obstacle
        };
        if (!this.game.fieldEnemies) this.game.fieldEnemies = [];
        this.game.fieldEnemies.push(asteroid);
    };
})();


