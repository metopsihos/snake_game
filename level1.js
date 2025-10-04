// Level 1 (Jungle) and core Field Manager for Snake Game
class FieldManager {
    constructor(game) {
        this.game = game;
        this.currentField = 'normal';
        this.previousField = null;
        this.availableFields = ['normal', 'jungle', 'space', 'sea'];
        // Track cycle of non-home levels visited since last time at home
        this.cycleVisited = new Set();
        this.portalThreshold = 10; // Points needed since last portal to spawn a new one
        this.lastPortalScore = 0;  // Score when last portal was entered (baseline)
        this.portal = null;
        this.teleportState = null; // Tracks teleportation effect
        this.portalsEnabled = true; // Can be disabled via settings
        // Level-based item thresholds
        this.levelEntryScore = 0;
        // Space: magnet
        this.spaceMagnetThreshold = null; // score delta for magnet spawn
        this.magnetSpawned = false;
        this.magnetActive = false;
        this.magnetStepsRemaining = 0;
        // Space: big asteroid (3x3)
        this.bigAsteroid = null;
        // Jungle: king monkey
        this.jungleKingMonkeyThreshold = null;
        this.jungleKingMonkeySpawned = false;
        
        // Planet images for space level
        this.planetImages = {};
        this.planetBigImages = {};
        this.meteoriteImages = {};
        this.loadPlanetImages();
        this.loadMeteoriteImages();
        
        // Load space background image
        this.spaceBackground = new Image();
        this.spaceBackground.src = 'images/background/space.png';
        this.spaceBackgroundLoaded = true;
        
        // Load jungle background image
        this.jungleBackground = new Image();
        this.jungleBackground.src = 'images/background/jungle.png';
        this.jungleBackgroundLoaded = true;
        
        // Load ocean background image
        this.oceanBackground = new Image();
        this.oceanBackground.src = 'images/background/ocean.png';
        this.oceanBackgroundLoaded = true;
        
        // Load tree images for jungle level
        this.treeImages = {};
        this.loadTreeImages();
        
        // Load fish and bubble images for sea level
        this.fishImages = {};
        this.bubbleImage = new Image();
        this.bubbleImage.src = 'images/fish/bubbles.png';
        this.bubbleImageLoaded = false;
        
        this.bubbleImage.onload = () => {
            this.bubbleImageLoaded = true;
        };
        
        this.bubbleImage.onerror = () => {
            this.bubbleImageLoaded = false;
        };
        
        // Load portal image
        this.portalImage = new Image();
        this.portalImage.src = 'images/portal.png';
        this.portalImageLoaded = false;
        
        this.portalImage.onload = () => {
            this.portalImageLoaded = true;
        };
        
        this.portalImage.onerror = () => {
            this.portalImageLoaded = false;
        };
        
        // Load monkey images for jungle level
        this.monkeyImage = new Image();
        this.monkeyImage.src = 'images/monkeys/monkey.png';
        this.monkeyImageLoaded = false;
        
        this.monkeyImage.onload = () => {
            this.monkeyImageLoaded = true;
        };
        
        this.monkeyImage.onerror = () => {
            this.monkeyImageLoaded = false;
        };
        
        this.monkeyKingImage = new Image();
        this.monkeyKingImage.src = 'images/monkeys/monkey_king.png';
        this.monkeyKingImageLoaded = false;
        
        this.monkeyKingImage.onload = () => {
            this.monkeyKingImageLoaded = true;
        };
        
        this.monkeyKingImage.onerror = () => {
            this.monkeyKingImageLoaded = false;
        };
        
        this.loadFishImages();
    }

    // Load planet images
    loadPlanetImages() {
        // Load small planet images (1-9)
        for (let i = 1; i <= 9; i++) {
            const img = new Image();
            img.src = `images/planet/planet_${i.toString().padStart(2, '0')}.png`;
            this.planetImages[i] = {
                image: img,
                loaded: false
            };
            
            img.onload = () => {
                this.planetImages[i].loaded = true;
            };
            
            img.onerror = () => {
                this.planetImages[i].loaded = false;
            };
        }
        
        // Load large planet images (1-25)
        for (let i = 1; i <= 25; i++) {
            const img = new Image();
            img.src = `images/planet_big/planet_big,png_${i.toString().padStart(2, '0')}.png`;
            this.planetBigImages[i] = {
                image: img,
                loaded: false
            };
            
            img.onload = () => {
                this.planetBigImages[i].loaded = true;
            };
            
            img.onerror = () => {
                this.planetBigImages[i].loaded = false;
            };
        }
        }
    
    // Load meteorite images
    loadMeteoriteImages() {
        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `images/meteorite/meteorite_${i.toString().padStart(2, '0')}.png`;
            this.meteoriteImages[i] = {
                image: img,
                loaded: false
            };
            
            img.onload = () => {
                this.meteoriteImages[i].loaded = true;
            };
            
            img.onerror = () => {
                this.meteoriteImages[i].loaded = false;
            };
        }
    }
    
    // Load tree images for jungle level
    loadTreeImages() {
        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `images/background/tree_${i.toString().padStart(2, '0')}.png`;
            this.treeImages[i] = {
                image: img,
                loaded: false
            };
            
            img.onload = () => {
                this.treeImages[i].loaded = true;
            };
            
            img.onerror = () => {
                this.treeImages[i].loaded = false;
            };
        }
    }
    
    // Load fish images for sea level
    loadFishImages() {
        for (let i = 1; i <= 3; i++) {
            const img = new Image();
            img.src = `images/fish/fish_${i}.png`;
            this.fishImages[i] = {
                image: img,
                loaded: false
            };
            
            img.onload = () => {
                this.fishImages[i].loaded = true;
            };
            
            img.onerror = () => {
                this.fishImages[i].loaded = false;
            };
        }
    }
    
    // Check if portal should appear (after each +10 points since last portal)
    shouldShowPortal() {
        return this.portalsEnabled &&
               (this.game.score - this.lastPortalScore) >= this.portalThreshold &&
               !this.portal;
    }

    // Choose portal destination based on current field
    chooseDestination() {
        const nonHome = ['jungle', 'space', 'sea'];
        if (this.currentField === 'normal') {
            // Start a new cycle from home
            const pick = nonHome[Math.floor(Math.random() * nonHome.length)];
            return pick;
        }
        // In a non-home level: continue to unvisited non-home levels, otherwise go home
        const remaining = nonHome.filter(l => !this.cycleVisited.has(l) && l !== this.currentField);
        if (remaining.length > 0) {
            return remaining[Math.floor(Math.random() * remaining.length)];
        }
        return 'normal';
    }

    // Spawn portal
    spawnPortal() {
        if (this.portal) return; // Portal already exists
        let attempts = 0;
        let x, y;
        do {
            x = Math.floor(Math.random() * this.game.fieldWidth);
            y = Math.floor(Math.random() * this.game.fieldHeight);
            attempts++;
            if (attempts > 200) break;
        } while (this.game.isPositionOccupied(x, y) && attempts <= 200);

        this.portal = {
            x,
            y,
            type: {emoji: '🌀', color: '#9C27B0'}, // Purple portal
            destination: this.chooseDestination()
        };
    }

    // Remove portal
    removePortal() {
        this.portal = null;
    }

    // Check portal collision
    checkPortalCollision(head) {
        if (this.portal && head.x === this.portal.x && head.y === this.portal.y) {
            this.enterPortal();
            return true;
        }
        return false;
    }

    // Find a safe spawn position for the snake (not occupied by obstacles)
    findSafeSpawnPosition() {
        const attempts = 100; // Maximum attempts to find a safe position
        
        for (let attempt = 0; attempt < attempts; attempt++) {
            const x = Math.floor(Math.random() * this.game.fieldWidth);
            const y = Math.floor(Math.random() * this.game.fieldHeight);
            
            // Check if this position is safe (not occupied by obstacles)
            if (!this.isPositionBlocked(x, y)) {
                return {x, y};
            }
        }
        
        // If no safe position found after many attempts, try center area
        const centerX = Math.floor(this.game.fieldWidth / 2);
        const centerY = Math.floor(this.game.fieldHeight / 2);
        
        // Try positions around center in a spiral pattern
        for (let radius = 1; radius <= 5; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
                        const x = centerX + dx;
                        const y = centerY + dy;
                        
                        if (x >= 0 && x < this.game.fieldWidth && 
                            y >= 0 && y < this.game.fieldHeight && 
                            !this.isPositionBlocked(x, y)) {
                            return {x, y};
                        }
                    }
                }
            }
        }
        
        // Last resort: return center position
        return {x: centerX, y: centerY};
    }

    // Enter portal and switch fields
    enterPortal() {
        if (!this.portal) return;

        const destination = this.portal.destination;

        if (this.game.isMultiplayer) {
            // Multiplayer: Restore snake lengths based on individual scores (score = length)
            const player1Length = Math.max(1, this.game.player1Score + 1); // +1 for head
            const player2Length = Math.max(1, this.game.player2Score + 1); // +1 for head

            // Find safe spawn positions for both players
            const player1Pos = this.findSafeSpawnPosition();
            const player2Pos = this.findSafeSpawnPosition();
            
            // Ensure players don't spawn at the same position
            if (player1Pos.x === player2Pos.x && player1Pos.y === player2Pos.y) {
                // Try to find a different position for player 2
                for (let attempt = 0; attempt < 50; attempt++) {
                    const newPos = this.findSafeSpawnPosition();
                    if (newPos.x !== player1Pos.x || newPos.y !== player1Pos.y) {
                        player2Pos.x = newPos.x;
                        player2Pos.y = newPos.y;
                        break;
                    }
                }
            }
            
            // Create Player 1 snake with correct length
            this.game.snake = [{x: player1Pos.x, y: player1Pos.y}];
            for (let i = 1; i < player1Length; i++) {
                this.game.snake.push({x: player1Pos.x, y: player1Pos.y});
            }
            
            // Create Player 2 snake with correct length
            this.game.snake2 = [{x: player2Pos.x, y: player2Pos.y}];
            for (let i = 1; i < player2Length; i++) {
                this.game.snake2.push({x: player2Pos.x, y: player2Pos.y});
            }

            // Pause both snakes for direction selection
            if (!this.game.adventureMode) {
                this.game.pausedAfterTeleport = true;
                this.game.dx = 0; this.game.dy = 0;
                this.game.dx2 = 0; this.game.dy2 = 0;
            }
        } else {
            // Single player: Restore snake length based on total score
            const snakeLength = Math.max(1, this.game.score + 1); // +1 for head

            // Find a safe spawn position
            const spawnPos = this.findSafeSpawnPosition();
            
            // Create snake with correct length
            this.game.snake = [{x: spawnPos.x, y: spawnPos.y}];
            for (let i = 1; i < snakeLength; i++) {
                this.game.snake.push({x: spawnPos.x, y: spawnPos.y});
            }

            // Reset direction after teleportation to allow player to choose new direction
            this.game.dx = 0;
            this.game.dy = 0;
            
            // In competitive mode, pause the snake after teleportation to allow direction selection
            if (!this.game.adventureMode) {
                this.game.pausedAfterTeleport = true;
            }
        }

        // Reset portal baseline so next portal appears after another +10 points
        this.lastPortalScore = this.game.score;

        this.removePortal();
        this.switchToField(destination);
    }

    // Switch to different field
    switchToField(fieldName) {
        const oldField = this.currentField;
        this.currentField = fieldName;
        this.previousField = oldField;

        // Clear current field items
        this.game.foods = [];
        this.game.bombs = [];

        // Record entry score baseline for level-specific items
        this.levelEntryScore = this.game.score;
        // Reset per-level item state
        this.magnetSpawned = false;
        this.magnetActive = false;
        this.magnetStepsRemaining = 0;
        this.spaceMagnetThreshold = null;
        this.bigAsteroid = null;
        this.jungleKingMonkeySpawned = false;
        this.jungleKingMonkeyThreshold = null;

        // Update cycle visited set
        if (fieldName === 'normal') {
            this.cycleVisited.clear();
        } else if (['jungle', 'space', 'sea'].includes(fieldName)) {
            this.cycleVisited.add(fieldName);
        }

        // Initialize new field
        switch(fieldName) {
            case 'jungle':
                this.initJungleField();
                // King monkey appears always at +5 points since entry
                this.jungleKingMonkeyThreshold = 5;
                break;
            case 'space':
                // Provided by level2.js
                if (typeof this.initSpaceField === 'function') {
                    this.initSpaceField();
                } else {
                    // Fallback to normal if level2 script not loaded
                    this.initNormalField();
                }
                // Magnet threshold fixed at +5 points after entry
                this.spaceMagnetThreshold = 5;
                break;
            case 'sea':
                if (typeof this.initSeaField === 'function') {
                    this.initSeaField();
                } else {
                    this.initNormalField();
                }
                break;
            case 'normal':
            default:
                this.initNormalField();
                break;
        }

        // Respawn items for new field
        this.game.spawnFood();
        // Align asteroids to fruit columns after fruits are spawned
        if (fieldName === 'space' && typeof this.resetAsteroidsToFruitColumns === 'function') {
            this.resetAsteroidsToFruitColumns();
        }
        this.game.spawnBombs();
    }

    // Initialize normal field (home)
    initNormalField() {
        this.game.fieldObstacles = [];
        this.game.fieldEnemies = [];
        // Do not reset teleportState or lastPortalScore here to preserve emergence and portal baseline across transitions
        // Portal is cleared on enterPortal()
    }

    // Initialize jungle field (level 1)
    initJungleField() {
        this.game.fieldObstacles = this.createJungleTrees();
        this.game.fieldEnemies = this.createMonkeys();
    }

    // Create jungle trees (vertical 1x3 trees with images)
    createJungleTrees() {
        const trees = [];
        // Counts by size
        const minDim = Math.min(this.game.fieldWidth, this.game.fieldHeight);
        let count = 5; // small
        if (minDim >= 20 && minDim < 25) count = 7; // medium
        else if (minDim >= 25 && minDim < 30) count = 10; // large
        else if (minDim >= 30) count = 15; // huge

        for (let t = 0; t < count; t++) {
            const pos = {
                x: Math.floor(Math.random() * this.game.fieldWidth),
                y: Math.floor(Math.random() * this.game.fieldHeight)
            };
            
            // Create 3-tile vertical tree pattern (1-2-3) - all are obstacles
            for (let i = 1; i <= 3; i++) {
                const yy = pos.y + (i - 1);
                if (yy < this.game.fieldHeight) {
                    trees.push({ 
                        x: pos.x, 
                        y: yy, 
                        type: 'tree', 
                        emoji: '🌳', 
                        color: '#2E7D32',
                        treeIndex: i, // 1, 2, or 3 for image selection
                        isObstacle: true // All tree tiles are obstacles
                    });
                }
            }
        }
        return trees;
    }

    // Create monkeys
    createMonkeys() {
        const monkeys = [];
        // Base count scaled by size (similar to trees but smaller)
        const minDim = Math.min(this.game.fieldWidth, this.game.fieldHeight);
        let monkeyCount = 3;
        if (minDim >= 20 && minDim < 25) monkeyCount = 4;
        else if (minDim >= 25 && minDim < 30) monkeyCount = 5;
        else if (minDim >= 30) monkeyCount = 6;

        for (let i = 0; i < monkeyCount; i++) {
            let monkey;
            let attempts = 0;
            do {
                monkey = {
                    x: Math.floor(Math.random() * this.game.fieldWidth),
                    y: Math.floor(Math.random() * this.game.fieldHeight),
                    type: 'monkey',
                    emoji: '🐒',
                    color: '#8D6E63',
                    lastMoveTime: 0,
                    moveInterval: 800 + Math.random() * 400, // 0.8-1.2 seconds
                    dx: 0,
                    dy: 0
                };
                attempts++;
                if (attempts > 100) break;
            } while (this.isPositionBlocked(monkey.x, monkey.y) && attempts <= 100);
            monkeys.push(monkey);
        }
        return monkeys;
    }

    // Check if position is blocked by obstacles
    isPositionBlocked(x, y) {
        // Check obstacles (only those marked as obstacles)
        for (let obstacle of (this.game.fieldObstacles || [])) {
            if (obstacle.x === x && obstacle.y === y && obstacle.isObstacle !== false) {
                return true;
            }
        }
        // Check other game objects
        return this.game.isPositionOccupied(x, y);
    }

    // Update field-specific logic
    update() {
        // Simple portal spawning (no emergence logic needed)
        if (this.shouldShowPortal()) {
            this.spawnPortal();
        }

        if (this.currentField === 'jungle') {
            this.updateMonkeys();
            this.maybeSpawnKingMonkey();
        } else if (this.currentField === 'space' && typeof this.updateAsteroids === 'function') {
            this.updateAsteroids();
            this.maybeSpawnMagnet();
            this.updateMagnetEffect();
        } else if (this.currentField === 'sea' && typeof this.updateSea === 'function') {
            this.updateSea();
        }
    }

    // Update teleport effect - gradual snake emergence
    updateTeleportEffect() {
        if (!this.teleportState || !this.teleportState.emergenceInProgress) return;

        const currentTime = Date.now();
        const timeSinceLastEmergence = currentTime - this.teleportState.lastEmergenceTime;

        // In adventure mode, emerge on each player move (handled elsewhere)
        // In competitive mode, emerge one segment per time interval
        const shouldEmergeSegment = !this.game.adventureMode &&
            timeSinceLastEmergence >= this.teleportState.emergenceInterval;

        if (shouldEmergeSegment && this.teleportState.segmentsEmerged < this.teleportState.originalSnakeLength) {
            this.emergeNextSegment();
        }
    }

    // Emerge the next segment of the snake
    emergeNextSegment() {
        if (!this.teleportState || !this.teleportState.emergenceInProgress) return;

        const portalPos = this.teleportState.exitPortalPosition;
        const newSegment = {x: portalPos.x, y: portalPos.y};
        this.game.snake.push(newSegment);

        this.teleportState.segmentsEmerged++;
        this.teleportState.lastEmergenceTime = Date.now();

        if (this.teleportState.segmentsEmerged >= this.teleportState.originalSnakeLength) {
            this.teleportState.emergenceInProgress = false;
            setTimeout(() => { this.teleportState = null; }, 1000);
        }
    }

    // Jungle: update monkey behavior (moves toward nearest fruit, destroys it)
    updateMonkeys() {
        const currentTime = Date.now();
        for (let monkey of (this.game.fieldEnemies || [])) {
            if (currentTime - monkey.lastMoveTime > monkey.moveInterval) {
                this.moveMonkey(monkey);
                monkey.lastMoveTime = currentTime;
                this.checkMonkeyFruitSteal(monkey);
            }
        }
    }

    // Move monkey towards nearest fruit with simple obstacle avoidance
    moveMonkey(monkey) {
        let nearestFruit = null;
        let nearestDistance = Infinity;
        for (let food of this.game.foods) {
            const distance = Math.abs(monkey.x - food.x) + Math.abs(monkey.y - food.y);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestFruit = food;
            }
        }

        if (nearestFruit) {
            let dx = 0, dy = 0;
            if (nearestFruit.x > monkey.x) dx = 1; else if (nearestFruit.x < monkey.x) dx = -1;
            if (nearestFruit.y > monkey.y) dy = 1; else if (nearestFruit.y < monkey.y) dy = -1;

            let xDistance = Math.abs(nearestFruit.x - monkey.x);
            let yDistance = Math.abs(nearestFruit.y - monkey.y);
            let moved = false;

            if (xDistance >= yDistance && dx !== 0) {
                const newX = monkey.x + dx;
                if (newX >= 0 && newX < this.game.fieldWidth && !this.isObstacleAt(newX, monkey.y)) {
                    monkey.x = newX; moved = true;
                }
            }
            if (!moved && dy !== 0) {
                const newY = monkey.y + dy;
                if (newY >= 0 && newY < this.game.fieldHeight && !this.isObstacleAt(monkey.x, newY)) {
                    monkey.y = newY; moved = true;
                }
            }
            if (!moved && dx !== 0 && xDistance < yDistance) {
                const newX = monkey.x + dx;
                if (newX >= 0 && newX < this.game.fieldWidth && !this.isObstacleAt(newX, monkey.y)) {
                    monkey.x = newX; moved = true;
                }
            }
            if (moved) return;
        }

        // Random step (or stay)
        const directions = [
            {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}, {dx: 0, dy: 0}
        ];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newX = monkey.x + direction.dx;
        const newY = monkey.y + direction.dy;
        if (newX >= 0 && newX < this.game.fieldWidth && newY >= 0 && newY < this.game.fieldHeight && !this.isObstacleAt(newX, newY)) {
            monkey.x = newX; monkey.y = newY;
        }
    }

    // Check if there's an obstacle at position
    isObstacleAt(x, y) {
        for (let obstacle of (this.game.fieldObstacles || [])) {
            if (obstacle.x === x && obstacle.y === y) return true;
        }
        return false;
    }

    // Jungle: monkey steals fruit
    checkMonkeyFruitSteal(monkey) {
        for (let i = this.game.foods.length - 1; i >= 0; i--) {
            const food = this.game.foods[i];
            if (monkey.x === food.x && monkey.y === food.y) {
                // Increment counter for monkey destruction
                if (this.game.fruitDestructionCounters) {
                    this.game.fruitDestructionCounters.monkey = (this.game.fruitDestructionCounters.monkey || 0) + 1;
                    this.game.updateFruitCountersUI?.();
                }
                this.game.foods.splice(i, 1);
                this.game.spawnSingleFood();
                break;
            }
        }
    }

    // Draw field-specific elements
    draw(ctx, gridSize) {
        // Background
        if (this.currentField === 'jungle') {
            // Draw jungle background image
            ctx.drawImage(
                this.jungleBackground,
                0, 0, ctx.canvas.width, ctx.canvas.height
            );
        } else if (this.currentField === 'space') {
            // Draw space background image (stretched to fill canvas)
            ctx.drawImage(
                this.spaceBackground,
                0, 0, ctx.canvas.width, ctx.canvas.height
            );
        } else if (this.currentField === 'sea') {
            // Draw ocean background image
            ctx.drawImage(
                this.oceanBackground,
                0, 0, ctx.canvas.width, ctx.canvas.height
            );
        } else {
            ctx.fillStyle = '#E8F5E8'; // Normal field background (light green)
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // Grid lines (transparent overlay on top of background)
        if (this.currentField === 'jungle') {
            ctx.strokeStyle = '#A5D6A7';
        } else if (this.currentField === 'space') {
            ctx.strokeStyle = 'rgba(26, 33, 64, 0.3)'; // Semi-transparent grid for space
        } else if (this.currentField === 'sea') {
            ctx.strokeStyle = '#1565c0';
        } else {
            ctx.strokeStyle = '#D0E8D0';
        }
        ctx.lineWidth = 1;
        for (let i = 0; i <= this.game.fieldWidth; i++) {
            ctx.beginPath(); 
            ctx.moveTo(i * gridSize, 0); 
            ctx.lineTo(i * gridSize, ctx.canvas.height); 
            ctx.stroke();
        }
        for (let i = 0; i <= this.game.fieldHeight; i++) {
            ctx.beginPath(); 
            ctx.moveTo(0, i * gridSize); 
            ctx.lineTo(ctx.canvas.width, i * gridSize); 
            ctx.stroke();
        }



        // Draw order: in space, asteroids behind planets; otherwise obstacles first
        if (this.currentField === 'space') {
            this.drawEnemies(ctx, gridSize);
            this.drawObstacles(ctx, gridSize);
        } else {
            this.drawObstacles(ctx, gridSize);
            this.drawEnemies(ctx, gridSize);
        }

        // Portal(s)
        this.drawPortal(ctx, gridSize);
    }

    // Draw obstacles
    drawObstacles(ctx, gridSize) {
        ctx.font = `${gridSize - 6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let obstacle of (this.game.fieldObstacles || [])) {
            const x = obstacle.x * gridSize;
            const y = obstacle.y * gridSize;
            
            // Check if this is a planet with an image
            if (obstacle.type === 'planet' && obstacle.planetIndex) {
                let planetImage = null;
                let imageLoaded = false;
                
                // Determine which image set to use
                if (obstacle.planetType === 'small' && 
                    this.planetImages[obstacle.planetIndex] && 
                    this.planetImages[obstacle.planetIndex].loaded) {
                    planetImage = this.planetImages[obstacle.planetIndex].image;
                    imageLoaded = true;
                } else if (obstacle.planetType === 'large' && 
                    this.planetBigImages[obstacle.planetIndex] && 
                    this.planetBigImages[obstacle.planetIndex].loaded) {
                    planetImage = this.planetBigImages[obstacle.planetIndex].image;
                    imageLoaded = true;
                }
                
                if (imageLoaded) {
                    // Draw planet image
                    ctx.drawImage(
                        planetImage,
                        x + 1, 
                        y + 1, 
                        gridSize - 2, 
                        gridSize - 2
                    );
                    
                    // Optional: For non-obstacle planet positions, add a subtle visual indicator
                    // Uncomment the lines below to show passable planet tiles with green dots
                    /*
                    if (!obstacle.isObstacle) {
                        ctx.globalAlpha = 0.3;
                        ctx.fillStyle = '#00FF00';
                        ctx.fillRect(x + 2, y + 2, 4, 4); // Small green indicator
                        ctx.globalAlpha = 1.0;
                    }
                    */
                } else {
                    // Fallback to emoji rendering
                    const centerX = x + gridSize / 2;
                    const centerY = y + gridSize / 2;
                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                    ctx.fillStyle = 'white';
                    ctx.fillText(obstacle.emoji, centerX, centerY);
                }
            } else if (obstacle.type === 'tree' && obstacle.treeIndex) {
                // Check if this is a tree with an image
                if (this.treeImages[obstacle.treeIndex] && this.treeImages[obstacle.treeIndex].loaded) {
                    // Draw tree image
                    ctx.drawImage(
                        this.treeImages[obstacle.treeIndex].image,
                        x + 1, 
                        y + 1, 
                        gridSize - 2, 
                        gridSize - 2
                    );
                } else {
                    // Fallback to emoji rendering
                    const centerX = x + gridSize / 2;
                    const centerY = y + gridSize / 2;
                    ctx.fillStyle = obstacle.color;
                    ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                    ctx.fillStyle = 'white';
                    ctx.fillText(obstacle.emoji, centerX, centerY);
                }
            } else {
                // Fallback to emoji rendering
                const centerX = x + gridSize / 2;
                const centerY = y + gridSize / 2;
                ctx.fillStyle = obstacle.color;
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                ctx.fillStyle = 'white';
                ctx.fillText(obstacle.emoji, centerX, centerY);
            }
        }
    }

    // Draw enemies
    drawEnemies(ctx, gridSize) {
        ctx.font = `${gridSize - 6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let enemy of (this.game.fieldEnemies || [])) {
            const x = enemy.x * gridSize;
            const y = enemy.y * gridSize;
            
            // Check if this is a meteorite with an image
            if ((enemy.type === 'asteroid' || enemy.type === 'big_asteroid') && 
                enemy.meteoriteIndex === 3) { // Only process main meteorite tiles
                
                // Draw the complete meteorite (tail + main body)
                // Draw tail tiles above the main meteorite
                for (let tailIndex = 1; tailIndex <= 3; tailIndex++) {
                    const tailY = y - (3 - tailIndex) * gridSize; // Position tiles above main tile
                    
                    // Only draw if the tail tile is within the visible area
                    if (tailY >= 0) {
                        if (this.meteoriteImages[tailIndex] && this.meteoriteImages[tailIndex].loaded) {
                            // Draw meteorite image
                            ctx.drawImage(
                                this.meteoriteImages[tailIndex].image,
                                x + 1, 
                                tailY + 1, 
                                gridSize - 2, 
                                gridSize - 2
                            );
                        } else {
                            // Fallback to emoji rendering
                            const centerX = x + gridSize / 2;
                            const centerY = tailY + gridSize / 2;
                            ctx.fillStyle = enemy.color;
                            ctx.beginPath(); 
                            ctx.arc(centerX, centerY, gridSize / 2 - 3, 0, 2 * Math.PI); 
                            ctx.fill();
                            ctx.fillStyle = 'white';
                            ctx.fillText(enemy.emoji, centerX, centerY);
                        }
                    }
                }
            } else if (enemy.type === 'fish' && enemy.fishIndex) {
                // Check if this is a fish with an image
                if (this.fishImages[enemy.fishIndex] && this.fishImages[enemy.fishIndex].loaded) {
                    // Draw fish image
                    ctx.drawImage(
                        this.fishImages[enemy.fishIndex].image,
                        x + 1, 
                        y + 1, 
                        gridSize - 2, 
                        gridSize - 2
                    );
                } else {
                    // Fallback to emoji rendering
                    const centerX = x + gridSize / 2;
                    const centerY = y + gridSize / 2;
                    ctx.fillStyle = enemy.color;
                    ctx.beginPath(); 
                    ctx.arc(centerX, centerY, gridSize / 2 - 3, 0, 2 * Math.PI); 
                    ctx.fill();
                    ctx.fillStyle = 'white';
                    ctx.fillText(enemy.emoji, centerX, centerY);
                }
            } else if (enemy.type === 'bubble') {
                // Check if bubble image is loaded
                if (this.bubbleImageLoaded) {
                    // Draw bubble image
                    ctx.drawImage(
                        this.bubbleImage,
                        x + 1, 
                        y + 1, 
                        gridSize - 2, 
                        gridSize - 2
                    );
                } else {
                    // Fallback to emoji rendering
                    const centerX = x + gridSize / 2;
                    const centerY = y + gridSize / 2;
                    ctx.fillStyle = enemy.color;
                    ctx.beginPath(); 
                    ctx.arc(centerX, centerY, gridSize / 2 - 3, 0, 2 * Math.PI); 
                    ctx.fill();
                    ctx.fillStyle = 'white';
                    ctx.fillText(enemy.emoji, centerX, centerY);
                }
                         } else if (enemy.type === 'monkey') {
                 // Check if monkey image is loaded
                 if (this.monkeyImageLoaded) {
                     // Draw monkey image
                     ctx.drawImage(
                         this.monkeyImage,
                         x + 1, 
                         y + 1, 
                         gridSize - 2, 
                         gridSize - 2
                     );
                 } else {
                     // Fallback to emoji rendering
                     const centerX = x + gridSize / 2;
                     const centerY = y + gridSize / 2;
                     ctx.fillStyle = enemy.color;
                     ctx.beginPath(); 
                     ctx.arc(centerX, centerY, gridSize / 2 - 3, 0, 2 * Math.PI); 
                     ctx.fill();
                     ctx.fillStyle = 'white';
                     ctx.fillText(enemy.emoji, centerX, centerY);
                 }
             } else if (enemy.type === 'king_monkey') {
                 // Check if king monkey image is loaded
                 if (this.monkeyKingImageLoaded) {
                     // Draw king monkey image
                     ctx.drawImage(
                         this.monkeyKingImage,
                         x + 1, 
                         y + 1, 
                         gridSize - 2, 
                         gridSize - 2
                     );
                 } else {
                     // Fallback to emoji rendering
                     const centerX = x + gridSize / 2;
                     const centerY = y + gridSize / 2;
                     ctx.fillStyle = enemy.color;
                     ctx.beginPath(); 
                     ctx.arc(centerX, centerY, gridSize / 2 - 3, 0, 2 * Math.PI); 
                     ctx.fill();
                     ctx.fillStyle = 'white';
                     ctx.fillText(enemy.emoji, centerX, centerY);
                 }
             } else if (!((enemy.type === 'asteroid' || enemy.type === 'big_asteroid') && enemy.meteoriteIndex)) {
                 // Fallback to emoji rendering for other enemies
                 const centerX = x + gridSize / 2;
                 const centerY = y + gridSize / 2;
                 ctx.fillStyle = enemy.color;
                 ctx.beginPath(); 
                 ctx.arc(centerX, centerY, gridSize / 2 - 3, 0, 2 * Math.PI); 
                 ctx.fill();
                 ctx.fillStyle = 'white';
                 ctx.fillText(enemy.emoji, centerX, centerY);
             }
        }
    }

    // Draw portal
    drawPortal(ctx, gridSize) {
        if (this.portal) {
            const centerX = this.portal.x * gridSize + gridSize / 2;
            const centerY = this.portal.y * gridSize + gridSize / 2;
            
            // Check if portal image is loaded
            if (this.portalImageLoaded) {
                // Draw portal image
                const portalSize = gridSize - 2;
                ctx.drawImage(
                    this.portalImage,
                    centerX - portalSize / 2,
                    centerY - portalSize / 2,
                    portalSize,
                    portalSize
                );
            } else {
                // Fallback to emoji rendering
                ctx.fillStyle = this.portal.type.color;
                ctx.beginPath(); ctx.arc(centerX, centerY, gridSize / 2 - 2, 0, 2 * Math.PI); ctx.fill();
                ctx.fillStyle = '#E1BEE7';
                ctx.beginPath(); ctx.arc(centerX, centerY, gridSize / 3, 0, 2 * Math.PI); ctx.fill();
                ctx.font = `${gridSize - 8}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.fillText(this.portal.type.emoji, centerX, centerY);
            }
        }

        // Exit portal during emergence
        if (this.teleportState && this.teleportState.emergenceInProgress &&
            this.teleportState.exitPortalPosition &&
            this.teleportState.segmentsEmerged < this.teleportState.originalSnakeLength) {
            const exitPos = this.teleportState.exitPortalPosition;
            const centerX = exitPos.x * gridSize + gridSize / 2;
            const centerY = exitPos.y * gridSize + gridSize / 2;
            const snakeAtPortal = this.game.snake.some(segment => segment.x === exitPos.x && segment.y === exitPos.y);
            if (!snakeAtPortal) {
                // Check if portal image is loaded for exit portal
                if (this.portalImageLoaded) {
                    // Draw portal image for exit portal
                    const portalSize = gridSize - 2;
                    ctx.drawImage(
                        this.portalImage,
                        centerX - portalSize / 2,
                        centerY - portalSize / 2,
                        portalSize,
                        portalSize
                    );
                } else {
                    // Fallback to emoji rendering
                    ctx.fillStyle = '#7B1FA2';
                    ctx.beginPath(); ctx.arc(centerX, centerY, gridSize / 3, 0, 2 * Math.PI); ctx.fill();
                    ctx.fillStyle = '#BA68C8';
                    ctx.beginPath(); ctx.arc(centerX, centerY, gridSize / 4, 0, 2 * Math.PI); ctx.fill();
                    ctx.font = `${gridSize - 12}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'white';
                    ctx.fillText('🌀', centerX, centerY);
                }
            }
        }
    }

    // ===== Jungle items =====
    maybeSpawnKingMonkey() {
        if (this.jungleKingMonkeySpawned) return;
        if (this.jungleKingMonkeyThreshold == null) return;
        const delta = this.game.score - this.levelEntryScore;
        if (delta >= this.jungleKingMonkeyThreshold) {
            this.spawnKingMonkey();
            this.jungleKingMonkeySpawned = true;
        }
    }

    spawnKingMonkey() {
        // Spawn near a random tree top if available
        const treeTiles = (this.game.fieldObstacles || []).filter(o => o.type === 'tree');
        let x = Math.floor(Math.random() * this.game.fieldWidth);
        let y = Math.floor(Math.random() * this.game.fieldHeight);
        if (treeTiles.length > 0) {
            const byX = new Map();
            for (const t of treeTiles) { if (!byX.has(t.x)) byX.set(t.x, []); byX.get(t.x).push(t); }
            const xs = Array.from(byX.keys());
            const rx = xs[Math.floor(Math.random() * xs.length)];
            const col = byX.get(rx);
            const topY = Math.min(...col.map(t => t.y));
            if (topY - 1 >= 0) { x = rx; y = topY - 1; }
        }
        const king = {
            x, y,
            type: 'king_monkey',
            emoji: '🐒',
            color: '#FFD700',
            lastMoveTime: 0,
            moveInterval: 400 + Math.random() * 200, // ~2x faster
            dx: 0, dy: 0
        };
        if (!this.game.fieldEnemies) this.game.fieldEnemies = [];
        this.game.fieldEnemies.push(king);
    }

    // ===== Space items =====
    maybeSpawnMagnet() {
        // Magnet functionality removed from level 2 (space level)
        return;
    }

    spawnBigAsteroid() {
        // Create a 3x3 meteorite pattern where only bottom row (3-3-3) are obstacles
        const x = Math.floor(Math.random() * Math.max(1, this.game.fieldWidth - 2));
        const y = 0;
        
        if (!this.game.fieldEnemies) this.game.fieldEnemies = [];
        
        // Create only the bottom row (3-3-3) as actual entities - the obstacle tiles
        // The visual tail (rows 1-1-1 and 2-2-2) will be rendered relative to these positions
        const groupId = `big_meteorite_${Date.now()}`;
        for (let col = 0; col < 3; col++) {
            const meteorite = {
                x: x + col,
                y: y + 2, // Start with the bottom row (obstacle) position
                type: 'big_asteroid',
                emoji: '☄️',
                color: '#E65100',
                lastMoveTime: 0,
                moveInterval: 350 + Math.random() * 250,
                dy: 1,
                meteoriteIndex: 3, // This is the main obstacle row
                isObstacle: true, // Only these tiles are actual obstacles
                groupId: groupId // Track which big meteorite this belongs to
            };
            this.game.fieldEnemies.push(meteorite);
        }
        
        // Set reference to track big asteroid existence (use first tile)
        this.bigAsteroid = this.game.fieldEnemies[this.game.fieldEnemies.length - 3];
    }

    updateMagnetEffect() {
        // Magnet functionality removed from level 2 (space level)
        return;
    }

    isSnakeBodyAt(x, y) {
        // body only; head excluded
        for (let i = 1; i < this.game.snake.length; i++) {
            const seg = this.game.snake[i];
            if (seg.x === x && seg.y === y) return true;
        }
        return false;
    }

    // ===== Enemy collision handling (centralized, so snake.js stays level-agnostic) =====
    handleEnemyCollision(head) {
        if (!this.game.fieldEnemies || !head) return false;
        for (let i = this.game.fieldEnemies.length - 1; i >= 0; i--) {
            const enemy = this.game.fieldEnemies[i];
            if (head.x !== enemy.x || head.y !== enemy.y) continue;
            
            // Skip non-obstacle meteorite tiles (only bottom tiles are obstacles)
            if (enemy.isObstacle === false) continue;
            switch (enemy.type) {
                case 'monkey':
                    this.game.fieldEnemies.splice(i, 1);
                    this.spawnMonkeyOnTopOfRandomTree();
                    return true;
                case 'king_monkey':
                    // Eat king monkey; respawn as king monkey
                    this.game.fieldEnemies.splice(i, 1);
                    this.spawnKingMonkey();
                    return true;
                case 'asteroid':
                    this.game.fieldEnemies.splice(i, 1);
                    if (typeof this.spawnAsteroidAtFruitOrTop === 'function') {
                        this.spawnAsteroidAtFruitOrTop();
                    }
                    return true;
                case 'big_asteroid':
                    this.game.fieldEnemies.splice(i, 1);
                    this.bigAsteroid = null;
                    return true;
                case 'magnet':
                    // Magnet functionality removed from level 2 (space level)
                    this.game.fieldEnemies.splice(i, 1);
                    return true;
                default:
                    break;
            }
        }
        return false;
    }

    // Name for UI
    getCurrentFieldName() {
        switch(this.currentField) {
            case 'jungle': return '🌴 Jungle';
            case 'space': return '🌌 Space';
            case 'normal': return '🏠 Home';
            default: return this.currentField;
        }
    }

    // Jungle: spawn a new monkey above the top of a random tree column
    spawnMonkeyOnTopOfRandomTree() {
        const treeTiles = (this.game.fieldObstacles || []).filter(o => o.type === 'tree');
        if (treeTiles.length === 0) {
            // Fallback to random spawn
            const m = this.createMonkeys()[0];
            if (!this.game.fieldEnemies) this.game.fieldEnemies = [];
            this.game.fieldEnemies.push(m);
            return;
        }
        // Group by x to get tree columns
        const byX = new Map();
        for (const t of treeTiles) {
            if (!byX.has(t.x)) byX.set(t.x, []);
            byX.get(t.x).push(t);
        }
        const xs = Array.from(byX.keys());
        for (let attempt = 0; attempt < xs.length; attempt++) {
            const x = xs[Math.floor(Math.random() * xs.length)];
            const col = byX.get(x);
            const topY = Math.min(...col.map(t => t.y));
            const spawnY = topY - 1;
            if (spawnY >= 0 && !this.isObstacleAt(x, spawnY) && !this.game.isPositionOccupied(x, spawnY)) {
                const monkey = {
                    x, y: spawnY,
                    type: 'monkey', emoji: '🐒', color: '#8D6E63',
                    lastMoveTime: 0,
                    moveInterval: 800 + Math.random() * 400,
                    dx: 0, dy: 0
                };
                if (!this.game.fieldEnemies) this.game.fieldEnemies = [];
                this.game.fieldEnemies.push(monkey);
                return;
            }
        }
        // If all above-tree spots invalid, fallback to random
        const fallback = this.createMonkeys()[0];
        if (!this.game.fieldEnemies) this.game.fieldEnemies = [];
        this.game.fieldEnemies.push(fallback);
    }
}


