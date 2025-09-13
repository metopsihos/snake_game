// Level 3 (Sea) extensions injected into FieldManager prototype if present
(function attachSeaLevel() {
    if (typeof FieldManager === 'undefined') return;

    // Initialize sea field: ocean background, fishes and bubbles
    FieldManager.prototype.initSeaField = function initSeaField() {
        this.game.fieldObstacles = []; // open water
        this.game.fieldEnemies = [
            ...this.createFishes(),
            ...this.createBubbles()
        ];
    };

    FieldManager.prototype.createFishes = function createFishes() {
        const fishes = [];
        // Scale fish count (small 3, medium 5, large 7, huge 10)
        const minDim = Math.min(this.game.fieldWidth, this.game.fieldHeight);
        let count = 3;
        if (minDim >= 20 && minDim < 25) count = 5;
        else if (minDim >= 25 && minDim < 30) count = 7;
        else if (minDim >= 30) count = 10;
        for (let i = 0; i < count; i++) {
            let fish; let attempts = 0;
            do {
                fish = {
                    x: Math.floor(Math.random() * this.game.fieldWidth),
                    y: Math.floor(Math.random() * this.game.fieldHeight),
                    type: 'fish',
                    emoji: ['🐟','🐠','🐡'][Math.floor(Math.random()*3)],
                    color: '#4FC3F7',
                    dx: Math.random() < 0.5 ? -1 : 1,
                    dy: 0,
                    lastMoveTime: 0,
                    moveInterval: 500 + Math.random() * 300,
                    stepsSinceVertical: 0,
                    fishIndex: (i % 3) + 1 // Assign fish image index 1, 2, or 3
                };
                attempts++;
                if (attempts > 200) break;
            } while (this.isPositionBlocked(fish.x, fish.y) && attempts <= 200);
            fishes.push(fish);
        }
        return fishes;
    };

    FieldManager.prototype.createBubbles = function createBubbles() {
        const bubbles = [];
        // Scale bubble count (small 3, medium 5, large 7, huge 10)
        const minDim = Math.min(this.game.fieldWidth, this.game.fieldHeight);
        let count = 3;
        if (minDim >= 20 && minDim < 25) count = 5;
        else if (minDim >= 25 && minDim < 30) count = 7;
        else if (minDim >= 30) count = 10;
        // Prefer fruit columns with priority
        const fruitXs = Array.from(new Set((this.game.foods || []).map(f => f.x)));
        const chosen = [];
        // Fill entirely from fruits if possible
        for (let x of fruitXs) { if (chosen.length < count) chosen.push(x); }
        while (chosen.length < count) {
            const x = Math.floor(Math.random() * this.game.fieldWidth);
            if (!chosen.includes(x)) chosen.push(x);
        }
        for (let i = 0; i < count; i++) {
            const x = chosen[i % chosen.length];
            bubbles.push({
                x, y: this.game.fieldHeight - 1,
                type: 'bubble', emoji: '🫧', color: '#80DEEA',
                lastMoveTime: 0,
                moveInterval: 250 + Math.random() * 200,
                dy: -1,
                carryingFruit: null // store reference to fruit object when picked
            });
        }
        return bubbles;
    };

    FieldManager.prototype.updateSea = function updateSea() {
        this.updateFishes();
        this.updateBubbles();
    };

    FieldManager.prototype.updateFishes = function updateFishes() {
        const now = Date.now();
        for (const fish of (this.game.fieldEnemies || [])) {
            if (fish.type !== 'fish') continue;
            if (now - fish.lastMoveTime < fish.moveInterval) continue;
            fish.lastMoveTime = now;
            // Horizontal move
            let nx = fish.x + fish.dx;
            if (nx < 0 || nx >= this.game.fieldWidth || this.isObstacleAt(nx, fish.y)) {
                fish.dx = -fish.dx;
                nx = fish.x + fish.dx;
            }
            if (nx >= 0 && nx < this.game.fieldWidth && !this.isObstacleAt(nx, fish.y)) {
                fish.x = nx;
                fish.stepsSinceVertical++;
            }
            // Every 5 horizontal steps, allow one vertical step (toward nearest fruit if any)
            if (fish.stepsSinceVertical >= 5) {
                fish.stepsSinceVertical = 0;
                let dy = 0; // toward nearest fruit by y
                let nearest = null; let best = Infinity;
                for (const food of this.game.foods) {
                    const d = Math.abs(food.x - fish.x) + Math.abs(food.y - fish.y);
                    if (d < best) { best = d; nearest = food; }
                }
                if (nearest) {
                    if (nearest.y > fish.y) dy = 1; else if (nearest.y < fish.y) dy = -1;
                } else {
                    dy = Math.random() < 0.5 ? -1 : 1;
                }
                const ny = fish.y + dy;
                if (ny >= 0 && ny < this.game.fieldHeight && !this.isObstacleAt(fish.x, ny)) {
                    fish.y = ny;
                }
            }
            // Eat fruit at fish position
            for (let i = this.game.foods.length - 1; i >= 0; i--) {
                const food = this.game.foods[i];
                if (food.x === fish.x && food.y === fish.y) {
                    this.game.foods.splice(i, 1);
                    this.game.spawnSingleFood();
                    // Increment fish counter
                    if (this.game.fruitDestructionCounters) {
                        this.game.fruitDestructionCounters.fish = (this.game.fruitDestructionCounters.fish || 0) + 1;
                        this.game.updateFruitCountersUI?.();
                    }
                    break;
                }
            }
        }
    };

    FieldManager.prototype.updateBubbles = function updateBubbles() {
        const now = Date.now();
        const enemies = this.game.fieldEnemies || [];
        for (const bubble of enemies) {
            if (bubble.type !== 'bubble') continue;
            if (now - bubble.lastMoveTime < bubble.moveInterval) continue;
            bubble.lastMoveTime = now;
            
            // Check if snake is at current bubble position (snake has priority)
            let snakeAtPosition = false;
            if (this.game.snake && this.game.snake.length > 0) {
                const snakeHead = this.game.snake[0];
                if (snakeHead.x === bubble.x && snakeHead.y === bubble.y) {
                    snakeAtPosition = true;
                }
            }
            if (this.game.snake2 && this.game.snake2.length > 0) {
                const snake2Head = this.game.snake2[0];
                if (snake2Head.x === bubble.x && snake2Head.y === bubble.y) {
                    snakeAtPosition = true;
                }
            }
            
            // Pick up fruit at current position if not carrying and snake is not there
            if (!bubble.carryingFruit && !snakeAtPosition) {
                for (let i = 0; i < this.game.foods.length; i++) {
                    const food = this.game.foods[i];
                    if (food.x === bubble.x && food.y === bubble.y) {
                        bubble.carryingFruit = food;
                        // Bubble started carrying a fruit; count as destroyed once it leaves top
                        break;
                    }
                }
            }
            
            // Move bubble upward
            const ny = bubble.y + bubble.dy; // dy = -1
            if (ny < 0) {
                // Reached top; if carrying fruit, remove and respawn fruit; respawn bubble at bottom
                if (bubble.carryingFruit) {
                    const idx = this.game.foods.indexOf(bubble.carryingFruit);
                    if (idx >= 0) this.game.foods.splice(idx, 1);
                    this.game.spawnSingleFood();
                    // Increment bubble counter
                    if (this.game.fruitDestructionCounters) {
                        this.game.fruitDestructionCounters.bubble = (this.game.fruitDestructionCounters.bubble || 0) + 1;
                        this.game.updateFruitCountersUI?.();
                    }
                }
                bubble.y = this.game.fieldHeight - 1;
                // Respawn prioritizing fruit columns
                const fruitXs = Array.from(new Set((this.game.foods || []).map(f => f.x)));
                if (fruitXs.length > 0) {
                    bubble.x = fruitXs[Math.floor(Math.random() * fruitXs.length)];
                } else {
                    bubble.x = Math.floor(Math.random() * this.game.fieldWidth);
                }
                bubble.carryingFruit = null;
                continue;
            } else {
                bubble.y = ny;
            }
            
            // Check if snake is at new bubble position (snake has priority)
            snakeAtPosition = false;
            if (this.game.snake && this.game.snake.length > 0) {
                const snakeHead = this.game.snake[0];
                if (snakeHead.x === bubble.x && snakeHead.y === bubble.y) {
                    snakeAtPosition = true;
                }
            }
            if (this.game.snake2 && this.game.snake2.length > 0) {
                const snake2Head = this.game.snake2[0];
                if (snake2Head.x === bubble.x && snake2Head.y === bubble.y) {
                    snakeAtPosition = true;
                }
            }
            
            // Carry fruit upwards with bubble
            if (bubble.carryingFruit) {
                bubble.carryingFruit.x = bubble.x;
                bubble.carryingFruit.y = bubble.y;
            } else if (!snakeAtPosition) {
                // If not carrying and snake is not at new position, try to pick a fruit
                for (let i = 0; i < this.game.foods.length; i++) {
                    const food = this.game.foods[i];
                    if (food.x === bubble.x && food.y === bubble.y) {
                        bubble.carryingFruit = food;
                        break;
                    }
                }
            }
        }
    };

    // Spawn a single fish (used on fish eaten)
    FieldManager.prototype.spawnFish = function spawnFish() {
        let fish; let attempts = 0;
        do {
            fish = {
                x: Math.floor(Math.random() * this.game.fieldWidth),
                y: Math.floor(Math.random() * this.game.fieldHeight),
                type: 'fish',
                emoji: ['🐟','🐠','🐡'][Math.floor(Math.random()*3)],
                color: '#4FC3F7',
                dx: Math.random() < 0.5 ? -1 : 1,
                dy: 0,
                lastMoveTime: 0,
                moveInterval: 500 + Math.random() * 300,
                stepsSinceVertical: 0
            };
            attempts++;
            if (attempts > 200) break;
        } while (this.isPositionBlocked(fish.x, fish.y) && attempts <= 200);
        if (!this.game.fieldEnemies) this.game.fieldEnemies = [];
        this.game.fieldEnemies.push(fish);
    };





})();


