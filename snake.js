// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.player1ScoreElement = document.getElementById('player1Score');
        this.player2ScoreElement = document.getElementById('player2Score');
        this.singlePlayerScoreElement = document.getElementById('singlePlayerScore');
        this.multiPlayerScoresElement = document.getElementById('multiPlayerScores');
        this.gameOverElement = document.getElementById('gameOver');
        this.startScreenElement = document.getElementById('startScreen');
        this.startButtonElement = document.getElementById('startButton');
        this.controlsTextElement = document.getElementById('controlsText');
        this.currentFieldElement = document.getElementById('currentField');
        this.fruitCountersElement = document.getElementById('fruitCounters');
        
        // Game settings
        this.gridSize = 30;
        this.fieldSize = 20; // default medium field size (this will be the base size)
        this.fieldWidth = 20; // horizontal tiles
        this.fieldHeight = 20; // vertical tiles
        
        // Game state
        this.score = 0;
        this.gameStarted = false;
        this.gameRunning = false;
        this.pausedAfterTeleport = false;
        this.gamePaused = false; // New pause state for competitive mode
        this.highScoreInputActive = false; // Track when high score input is active
        
        // Game settings
        this.gameSpeed = 150; // default medium speed
        this.borderWrap = false; // default solid borders
        this.gameMode = 'competitive'; // default competitive mode
        this.adventureMode = false; // turn-based mode flag
        this.bombCount = 1; // default single bomb
        this.bombs = []; // array to hold multiple bombs
        this.portalsEnabled = true; // default portals enabled
        this.snakeHitBehavior = 'pause'; // default: pause when snake hits itself
        
        // Field management
        this.fieldManager = null; // will be initialized after DOM load
        this.fieldObstacles = []; // obstacles in current field
        this.fieldEnemies = []; // enemies in current field
        
        // Snake initial state (will be repositioned based on field size)
        this.snake = [
            {x: 10, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        
        // Multiplayer settings and second snake
        this.isMultiplayer = false;
        this.snake2 = [{x: 15, y: 10}];
        this.dx2 = 0;
        this.dy2 = 0;
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1Color = 'green';
        this.player2Color = 'yellow';
        
        // Food items with their colors, emojis and images
        this.foods = [];
        this.foodTypes = [
            {emoji: '🍓', color: '#FF6B6B', points: 1, imageSrc: 'images/fruits/berry.png'}, // strawberry
            {emoji: '🍅', color: '#FF4444', points: 1, imageSrc: 'images/fruits/tomato.png'}, // tomato
            {emoji: '🍋', color: '#FFD700', points: 1, imageSrc: 'images/fruits/lemon.png'}, // lemon
            {emoji: '🍎', color: '#FF0000', points: 1, imageSrc: 'images/fruits/apple.png'}, // apple
            {emoji: '🍊', color: '#FFA500', points: 1, imageSrc: 'images/fruits/orange.png'}  // orange
        ];
        
        // Bomb type definition  
        this.bombType = {emoji: '💣', color: '#333333', imageSrc: 'images/fruits/bomb.png'};
        
        // Load fruit and bomb images
        this.fruitImages = {};
        this.bombImage = new Image();
        this.bombImageLoaded = false;
        
        // Load bomb images for different levels
        this.bombImages = {
            red: new Image(),
            black: new Image()
        };
        
        this.bombImages.red.src = 'images/fruits/bomb_red.png';
        this.bombImages.black.src = 'images/fruits/bomb_black.png';
        
        this.bombImages.red.onload = () => {
            this.bombImageLoaded = true;
        };
        
        this.bombImages.red.onerror = () => {
            this.bombImageLoaded = false;
        };
        
        this.bombImages.black.onload = () => {
            this.bombImageLoaded = true;
        };
        
        this.bombImages.black.onerror = () => {
            this.bombImageLoaded = false;
        };
        
        // Load all fruit images
        this.foodTypes.forEach((foodType, index) => {
            const img = new Image();
            img.src = foodType.imageSrc;
            this.fruitImages[index] = {
                image: img,
                loaded: false
            };
            
            img.onload = () => {
                this.fruitImages[index].loaded = true;
            };
            
            img.onerror = () => {
                console.warn(`Could not load fruit image for ${foodType.imageSrc}, using fallback`);
                this.fruitImages[index].loaded = false;
            };
        });
        
        // Snake color settings
        this.snakeColor = 'green'; // default color
        
        // Load snake images for different colors
        this.snakeImages = {
            green: {
                head: new Image(),
                tail: new Image(),
                headLoaded: false,
                tailLoaded: false
            },
            yellow: {
                head: new Image(),
                tail: new Image(),
                headLoaded: false,
                tailLoaded: false
            },
            violet: {
                head: new Image(),
                tail: new Image(),
                headLoaded: false,
                tailLoaded: false
            }
        };
        
        // Load green snake images (default)
        this.snakeImages.green.head.src = 'images/head_G.png';
        this.snakeImages.green.tail.src = 'images/tail_G.png';
        
        this.snakeImages.green.head.onload = () => {
            this.snakeImages.green.headLoaded = true;
        };
        
        this.snakeImages.green.head.onerror = () => {
            this.snakeImages.green.headLoaded = false;
        };
        
        this.snakeImages.green.tail.onload = () => {
            this.snakeImages.green.tailLoaded = true;
        };
        
        this.snakeImages.green.tail.onerror = () => {
            this.snakeImages.green.tailLoaded = false;
        };
        
        // Load yellow snake images
        this.snakeImages.yellow.head.src = 'images/head_Y.png';
        this.snakeImages.yellow.tail.src = 'images/tail_Y.png';
        
        this.snakeImages.yellow.head.onload = () => {
            this.snakeImages.yellow.headLoaded = true;
        };
        
        this.snakeImages.yellow.head.onerror = () => {
            this.snakeImages.yellow.headLoaded = false;
        };
        
        this.snakeImages.yellow.tail.onload = () => {
            this.snakeImages.yellow.tailLoaded = true;
        };
        
        this.snakeImages.yellow.tail.onerror = () => {
            this.snakeImages.yellow.tailLoaded = false;
        };
        
        // Load violet snake images
        this.snakeImages.violet.head.src = 'images/head_V.png';
        this.snakeImages.violet.tail.src = 'images/tail_V.png';
        
        this.snakeImages.violet.head.onload = () => {
            this.snakeImages.violet.headLoaded = true;
        };
        
        this.snakeImages.violet.head.onerror = () => {
            this.snakeImages.violet.headLoaded = false;
        };
        
        this.snakeImages.violet.tail.onload = () => {
            this.snakeImages.violet.tailLoaded = true;
        };
        
        this.snakeImages.violet.tail.onerror = () => {
            this.snakeImages.violet.tailLoaded = false;
        };
        
        // Explosion overlay state
        this.explosionState = null;

        // Fruit destruction counters
        this.fruitDestructionCounters = {
            monkey: 0,
            asteroid: 0,
            fish: 0,
            bubble: 0
        };
        
        this.init();
    }

    // ===== Leaderboard utilities =====
    loadLeaderboardData() {
        try {
            const raw = localStorage.getItem('snakeLeaderboard');
            if (!raw) return [];
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) return arr;
        } catch (e) {}
        return [];
    }

    saveLeaderboardData(entries) {
        try {
            localStorage.setItem('snakeLeaderboard', JSON.stringify(entries));
        } catch (e) {}
    }

    addLeaderboardEntry(playerName, score, icons) {
        const entries = this.loadLeaderboardData();
        entries.push({ name: playerName, score: score, ts: Date.now(), icons: Array.isArray(icons) ? icons : [] });
        entries.sort((a, b) => b.score - a.score || a.ts - b.ts);
        const top5 = entries.slice(0, 5);
        this.saveLeaderboardData(top5);
        return top5;
    }

    renderLeaderboardHTML(entries) {
        if (!entries || entries.length === 0) {
            return '<div style="margin-top:8px;color:#666;font-size:14px;">No scores yet. Be the first!</div>';
        }
        let html = '<ol style="text-align:left;max-height:220px;overflow:auto;padding-left:20px;font-size:14px;line-height:1.35;">';
        for (const e of entries) {
            const icons = Array.isArray(e.icons) ? e.icons.join(' ') : '';
            const iconsHtml = icons ? ` <span style=\"opacity:.95\">${icons}</span>` : '';
            const nameHtml = `<strong>${this.escapeHtml(e.name || 'Player')}</strong>`;
            html += `<li>${nameHtml} - ${e.score}${iconsHtml ? ' -' + iconsHtml : ''}</li>`;
        }
        html += '</ol>';
        return html;
    }

    escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
    }

    // removed download option per requirements

    // Local-only leaderboard initialization
    async initLeaderboardFile() {
        const entries = this.loadLeaderboardData();
        this.saveLeaderboardData(Array.isArray(entries) ? entries.slice(0,5) : []);
    }

    

    // Build icon strip representing settings used in this run
    getSettingsIcons() {
        const icons = [];
        // Mode
        icons.push(this.gameMode === 'adventure' ? '🗺️' : '⚡');
        // Field size choice (approximate by base size selection; infer from min of width/height)
        // We stored speedSetting value and borderWrap/portalsEnabled already.
        // For field size, we approximate by current base density grouping.
        const minDim = Math.min(this.fieldWidth || 0, this.fieldHeight || 0);
        let sizeIcon = '🖥️';
        if (minDim <= 16) sizeIcon = '📱';
        else if (minDim <= 22) sizeIcon = '🖥️';
        else if (minDim <= 27) sizeIcon = '🖼️';
        else sizeIcon = '🏟️';
        icons.push(sizeIcon);
        // Bombs
        let bombIcon = '⚙️';
        if (this.bombCount === 0) bombIcon = '🌸';
        else if (this.bombCount === 1) bombIcon = '💣';
        else if (this.bombCount === 3) bombIcon = '💥';
        else if (this.bombCount === 5) bombIcon = '💀';
        icons.push(bombIcon);
        // Speed (only matters in competitive; still show)
        const speedIcon = this.speedSetting === 'slow' ? '🐌' : (this.speedSetting === 'fast' ? '🏃' : '🚶');
        icons.push(speedIcon);
        // Border
        icons.push(this.borderWrap ? '🌀' : '🧱');
        // Portals
        icons.push(this.portalsEnabled ? '🌀' : '🚫');
        return icons;
    }

    // Removed file persistence; keeping leaderboard in localStorage only

    buildLeaderboardTxt(entries) {
        let content = 'Snake Leaderboard (Top 5)\n\n';
        entries.forEach((e, i) => {
            content += `${i+1}. ${e.name || 'Player'} - ${e.score}\n`;
        });
        return content;
    }
    
    // Save settings to localStorage (simulating config file)
    saveSettings() {
        const settings = {
            gameMode: this.gameMode,
            fieldSize: this.fieldSize,
            bombCount: this.bombCount,
            gameSpeed: this.gameSpeed,
            borderWrap: this.borderWrap,
            portalsEnabled: this.portalsEnabled,
            snakeHitBehavior: this.snakeHitBehavior || 'pause',
            speedSetting: this.speedSetting || 'medium',
            snakeColor: this.snakeColor || 'green'
        };
        
        try {
            localStorage.setItem('snakeGameSettings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }
    
    // Load settings from localStorage (simulating config file)
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('snakeGameSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                // Apply loaded settings as defaults
                this.gameMode = settings.gameMode || 'competitive';
                this.adventureMode = (this.gameMode === 'adventure');
                
                if (settings.fieldSize) {
                    this.fieldSize = settings.fieldSize;
                    this.tileCount = this.fieldSize;
                }
                
                this.bombCount = settings.bombCount || 1;
                this.gameSpeed = settings.gameSpeed || 150;
                this.borderWrap = settings.borderWrap || false;
                this.portalsEnabled = settings.portalsEnabled !== undefined ? settings.portalsEnabled : true;
                this.snakeHitBehavior = settings.snakeHitBehavior || 'pause';
                this.speedSetting = settings.speedSetting || 'medium';
                this.snakeColor = settings.snakeColor || 'green';
                
                // Update UI to reflect loaded settings
                this.applySettingsToUI(settings);
                
                // Update field manager with loaded portal setting
                if (this.fieldManager) {
                    this.fieldManager.portalsEnabled = this.portalsEnabled;
                }
                
                return true;
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
        return false;
    }
    
    // Apply loaded settings to UI elements
    applySettingsToUI(settings) {
        // Set game mode
        const gameModeRadio = document.querySelector(`input[name="gameMode"][value="${settings.gameMode}"]`);
        if (gameModeRadio) gameModeRadio.checked = true;
        
        // Set field size
        let fieldSizeValue = 'medium';
        switch(settings.fieldSize) {
            case 15: fieldSizeValue = 'small'; break;
            case 20: fieldSizeValue = 'medium'; break;
            case 25: fieldSizeValue = 'large'; break;
            case 30: fieldSizeValue = 'huge'; break;
        }
        const fieldSizeRadio = document.querySelector(`input[name="fieldSize"][value="${fieldSizeValue}"]`);
        if (fieldSizeRadio) fieldSizeRadio.checked = true;
        
        // Set bomb count
        let bombValue = settings.bombCount.toString();
        if (![0, 1, 3, 5].includes(settings.bombCount)) {
            bombValue = 'custom';
            const customInput = document.getElementById('customBombNumber');
            if (customInput) customInput.value = settings.bombCount;
        }
        const bombRadio = document.querySelector(`input[name="bombCount"][value="${bombValue}"]`);
        if (bombRadio) bombRadio.checked = true;
        
        // Set speed
        const speedRadio = document.querySelector(`input[name="speed"][value="${settings.speedSetting}"]`);
        if (speedRadio) speedRadio.checked = true;
        
        // Set border
        const borderValue = settings.borderWrap ? 'wrap' : 'solid';
        const borderRadio = document.querySelector(`input[name="border"][value="${borderValue}"]`);
        if (borderRadio) borderRadio.checked = true;
        
        // Set portals
        const portalsValue = settings.portalsEnabled ? 'on' : 'off';
        const portalsRadio = document.querySelector(`input[name="portals"][value="${portalsValue}"]`);
        if (portalsRadio) portalsRadio.checked = true;
        
        // Set snake hit behavior
        const snakeHitRadio = document.querySelector(`input[name="snakeHit"][value="${settings.snakeHitBehavior || 'pause'}"]`);
        if (snakeHitRadio) snakeHitRadio.checked = true;
        
        // Set snake color
        const snakeColorRadio = document.querySelector(`input[name="snakeColor"][value="${settings.snakeColor || 'green'}"]`);
        if (snakeColorRadio) snakeColorRadio.checked = true;
        
        // Trigger UI update events
        const updateModeEvent = new Event('change');
        const updateBombEvent = new Event('change');
        if (gameModeRadio) gameModeRadio.dispatchEvent(updateModeEvent);
        if (bombRadio) bombRadio.dispatchEvent(updateBombEvent);
    }
    
    init() {
        this.setupEventListeners();
        this.fieldManager = new FieldManager(this);
        // Initialize field manager with current settings
        this.fieldManager.portalsEnabled = this.portalsEnabled;

        // Initialize UI counters
        this.updateFruitCountersUI();
        
        // Start game loop (image will load asynchronously)
        this.gameLoop();

        // Attempt to load leaderboard from file near index.html
        this.initLeaderboardFile();
    }
    
    setupEventListeners() {
        // Start button click event
        if (this.startButtonElement) {
            this.startButtonElement.addEventListener('click', () => {
                this.startGame();
            });
        }
        
        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.gameStarted) {
                this.resizeCanvas();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            // Determine if user is typing in an input/textarea
            const activeElTag = (document.activeElement && document.activeElement.tagName) || '';
            const isTypingNow = activeElTag === 'INPUT' || activeElTag === 'TEXTAREA';
            // Prevent arrow keys, WASD and Space from scrolling only when not typing and leaderboard not active
            if (!this.highScoreInputActive && !isTypingNow && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }

            // Restart with Enter (not Space). Avoid triggering while typing in inputs
            const activeTag = (document.activeElement && document.activeElement.tagName) || '';
            const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
            if (!this.gameRunning && this.gameStarted && e.code === 'Enter' && !isTyping) {
                this.restart();
                return;
            }
            
            // Handle pause in competitive mode (but not when high score input is active)
            if (this.gameRunning && this.gameStarted && !this.adventureMode && e.code === 'KeyP' && !this.highScoreInputActive) {
                this.gamePaused = !this.gamePaused;
                return;
            }
            
            // Don't process game controls when high score input is active
            if (this.highScoreInputActive) return;
            
            if (!this.gameRunning) return;
            
            if (this.adventureMode) {
                // Adventure mode: move one step immediately for Snake 1
                switch(e.code) {
                    case 'ArrowUp':
                        // Only allow up if not currently moving down
                        if (this.dy !== 1) {
                            this.dx = 0;
                            this.dy = -1;
                            this.moveOneStep();
                        }
                        break;
                    case 'ArrowDown':
                        // Only allow down if not currently moving up
                        if (this.dy !== -1) {
                            this.dx = 0;
                            this.dy = 1;
                            this.moveOneStep();
                        }
                        break;
                    case 'ArrowLeft':
                        // Only allow left if not currently moving right
                        if (this.dx !== 1) {
                            this.dx = -1;
                            this.dy = 0;
                            this.moveOneStep();
                        }
                        break;
                    case 'ArrowRight':
                        // Only allow right if not currently moving left
                        if (this.dx !== -1) {
                            this.dx = 1;
                            this.dy = 0;
                            this.moveOneStep();
                        }
                        break;
                }

                // Adventure mode: move one step immediately for Snake 2
                switch(e.code) {
                    case 'KeyW':
                        // Only allow up if not currently moving down
                        if (this.dy2 !== 1) {
                            this.dx2 = 0;
                            this.dy2 = -1;
                            this.movePlayer2();
                        }
                        break;
                    case 'KeyS':
                        // Only allow down if not currently moving up
                        if (this.dy2 !== -1) {
                            this.dx2 = 0;
                            this.dy2 = 1;
                            this.movePlayer2();
                        }
                        break;
                    case 'KeyA':
                        // Only allow left if not currently moving right
                        if (this.dx2 !== 1) {
                            this.dx2 = -1;
                            this.dy2 = 0;
                            this.movePlayer2();
                        }
                        break;
                    case 'KeyD':
                        // Only allow right if not currently moving left
                        if (this.dx2 !== -1) {
                            this.dx2 = 1;
                            this.dy2 = 0;
                            this.movePlayer2();
                        }
                        break;
                }
            } else {
                // Competitive mode: change direction only
            switch(e.code) {
                case 'ArrowUp':
                    // Only allow up if not currently moving down
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                        // Resume movement if paused after teleport
                        if (this.pausedAfterTeleport) {
                            this.pausedAfterTeleport = false;
                        }
                    }
                    break;
                case 'ArrowDown':
                    // Only allow down if not currently moving up
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                        // Resume movement if paused after teleport
                        if (this.pausedAfterTeleport) {
                            this.pausedAfterTeleport = false;
                        }
                    }
                    break;
                case 'ArrowLeft':
                    // Only allow left if not currently moving right
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                        // Resume movement if paused after teleport
                        if (this.pausedAfterTeleport) {
                            this.pausedAfterTeleport = false;
                        }
                    }
                    break;
                case 'ArrowRight':
                    // Only allow right if not currently moving left
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                        // Resume movement if paused after teleport
                        if (this.pausedAfterTeleport) {
                            this.pausedAfterTeleport = false;
                        }
                    }
                    break;
            }
            
            // Handle WASD keys for Player 2 in multiplayer mode
            if (this.isMultiplayer) {
                if (this.adventureMode) {
                    // Adventure mode: move one step immediately (same as arrow keys)
                    switch(e.code) {
                        case 'KeyW':
                            if (this.dy2 !== 1) {
                                this.dx2 = 0;
                                this.dy2 = -1;
                                this.movePlayer2();
                            }
                            break;
                        case 'KeyS':
                            if (this.dy2 !== -1) {
                                this.dx2 = 0;
                                this.dy2 = 1;
                                this.movePlayer2();
                            }
                            break;
                        case 'KeyA':
                            if (this.dx2 !== 1) {
                                this.dx2 = -1;
                                this.dy2 = 0;
                                this.movePlayer2();
                            }
                            break;
                        case 'KeyD':
                            if (this.dx2 !== -1) {
                                this.dx2 = 1;
                                this.dy2 = 0;
                                this.movePlayer2();
                            }
                            break;
                    }
                } else {
                    // Competitive mode: change direction only
                    switch(e.code) {
                        case 'KeyW':
                            // Only allow up if not currently moving down
                            if (this.dy2 !== 1) {
                                this.dx2 = 0;
                                this.dy2 = -1;
                                if (this.pausedAfterTeleport) {
                                    this.pausedAfterTeleport = false;
                                }
                            }
                            break;
                        case 'KeyS':
                            // Only allow down if not currently moving up
                            if (this.dy2 !== -1) {
                                this.dx2 = 0;
                                this.dy2 = 1;
                                if (this.pausedAfterTeleport) {
                                    this.pausedAfterTeleport = false;
                                }
                            }
                            break;
                        case 'KeyA':
                            // Only allow left if not currently moving right
                            if (this.dx2 !== 1) {
                                this.dx2 = -1;
                                this.dy2 = 0;
                                if (this.pausedAfterTeleport) {
                                    this.pausedAfterTeleport = false;
                                }
                            }
                            break;
                        case 'KeyD':
                            // Only allow right if not currently moving left
                            if (this.dx2 !== -1) {
                                this.dx2 = 1;
                                this.dy2 = 0;
                                if (this.pausedAfterTeleport) {
                                    this.pausedAfterTeleport = false;
                                }
                            }
                            break;
                    }
                }
            }
            }
        });
    }
    
    spawnFood() {
        // Remove existing food
        this.foods = [];
        // Target fruits: ~0.75% of total tiles (half of previous), rounded down
        const totalTiles = this.fieldWidth * this.fieldHeight;
        const target = Math.max(1, Math.floor(totalTiles * 0.0075));
        for (let i = 0; i < target; i++) {
            let newFood;
            let attempts = 0;
            do {
                newFood = {
                    x: Math.floor(Math.random() * this.fieldWidth),
                    y: Math.floor(Math.random() * this.fieldHeight),
                    type: this.foodTypes[Math.floor(Math.random() * this.foodTypes.length)]
                };
                attempts++;
                if (attempts > 200) break;
            } while (this.isPositionOccupied(newFood.x, newFood.y) && attempts <= 200);
            this.foods.push(newFood);
        }
    }
    
    spawnSingleFood() {
        // Spawn a single new food item
        let newFood;
        let attempts = 0;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.fieldWidth),
                y: Math.floor(Math.random() * this.fieldHeight),
                type: this.foodTypes[Math.floor(Math.random() * this.foodTypes.length)]
            };
            attempts++;
            if (attempts > 100) break;
        } while (this.isPositionOccupied(newFood.x, newFood.y) && attempts <= 100);
        
        this.foods.push(newFood);
    }
    
    spawnBombs() {
        // Clear existing bombs
        this.bombs = [];
        
        // Spawn multiple bombs based on bombCount setting
        for (let i = 0; i < this.bombCount; i++) {
            let newBomb;
            let attempts = 0;
            do {
                newBomb = {
                    x: Math.floor(Math.random() * this.fieldWidth),
                    y: Math.floor(Math.random() * this.fieldHeight),
                    type: this.bombType
                };
                attempts++;
                // Prevent infinite loop
                if (attempts > 100) break;
            } while (this.isPositionOccupiedForBomb(newBomb.x, newBomb.y) && attempts <= 100);
            
            this.bombs.push(newBomb);
        }
    }
    
    isPositionOccupied(x, y) {
        // Check if position is occupied by snake
        for (let segment of this.snake) {
            if (segment.x === x && segment.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by other foods
        for (let food of this.foods) {
            if (food.x === x && food.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by bombs
        for (let bomb of this.bombs) {
            if (bomb.x === x && bomb.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by field obstacles
        for (let obstacle of this.fieldObstacles) {
            if (obstacle.x === x && obstacle.y === y) {
                return true;
            }
        }
        
        // Check portal
        if (this.fieldManager && this.fieldManager.portal && 
            this.fieldManager.portal.x === x && this.fieldManager.portal.y === y) {
            return true;
        }
        
        return false;
    }
    
    isPositionOccupiedForBomb(x, y) {
        // Check if position is occupied by snake
        for (let segment of this.snake) {
            if (segment.x === x && segment.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by foods
        for (let food of this.foods) {
            if (food.x === x && food.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by other bombs
        for (let bomb of this.bombs) {
            if (bomb.x === x && bomb.y === y) {
                return true;
            }
        }
        
        // Check if position is occupied by field obstacles (including planet obstacles)
        for (let obstacle of this.fieldObstacles) {
            if (obstacle.x === x && obstacle.y === y && obstacle.isObstacle !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    startGame() {
        // Read settings from radio buttons
        const gameModeSetting = document.querySelector('input[name="gameMode"]:checked').value;
        const speedSetting = document.querySelector('input[name="speed"]:checked')?.value || 'medium';
        const borderSetting = document.querySelector('input[name="border"]:checked').value;
        const fieldSizeSetting = document.querySelector('input[name="fieldSize"]:checked').value;
        const bombCountSetting = document.querySelector('input[name="bombCount"]:checked').value;
        const portalsSetting = document.querySelector('input[name="portals"]:checked').value;
        const snakeHitSetting = document.querySelector('input[name="snakeHit"]:checked').value;
        const playerModeSetting = document.querySelector('input[name="playerMode"]:checked').value;
        
        // Get color settings based on player mode
        let snakeColorSetting, player1ColorSetting, player2ColorSetting;
        if (playerModeSetting === 'multi') {
            player1ColorSetting = document.querySelector('input[name="player1Color"]:checked').value;
            player2ColorSetting = document.querySelector('input[name="player2Color"]:checked').value;
        } else {
            snakeColorSetting = document.querySelector('input[name="snakeColor"]:checked').value;
        }
        
        // Calculate field dimensions based on screen aspect ratio
        const availableWidth = window.innerWidth * 0.90;
        const availableHeight = window.innerHeight * 0.75;
        
        // Set base field density based on size setting
        let baseDensity;
        switch(fieldSizeSetting) {
            case 'small':
                baseDensity = 15; // 15 tiles for the smaller dimension
                break;
            case 'medium':
                baseDensity = 20; // 20 tiles for the smaller dimension
                break;
            case 'large':
                baseDensity = 25; // 25 tiles for the smaller dimension
                break;
            case 'huge':
                baseDensity = 30; // 30 tiles for the smaller dimension
                break;
        }
        
        // Calculate grid size based on smaller dimension to ensure cells are large enough
        const minDimension = Math.min(availableWidth, availableHeight);
        this.gridSize = Math.floor(minDimension / baseDensity);
        
        // Ensure minimum grid size for playability
        this.gridSize = Math.max(this.gridSize, 20);
        
        // Calculate field dimensions to fill screen
        this.fieldWidth = Math.floor(availableWidth / this.gridSize);
        this.fieldHeight = Math.floor(availableHeight / this.gridSize);
        
        // Ensure minimum field dimensions
        this.fieldWidth = Math.max(this.fieldWidth, baseDensity);
        this.fieldHeight = Math.max(this.fieldHeight, Math.floor(baseDensity * 0.75));
        
        // Store for compatibility
        this.fieldSize = Math.min(this.fieldWidth, this.fieldHeight);
        
        // Set canvas dimensions
        this.canvas.width = this.fieldWidth * this.gridSize;
        this.canvas.height = this.fieldHeight * this.gridSize;
        
        // Set bomb count
        if (bombCountSetting === 'custom') {
            this.bombCount = parseInt(document.getElementById('customBombNumber').value);
        } else {
            this.bombCount = parseInt(bombCountSetting);
        }
        
        // Set game mode
        this.gameMode = gameModeSetting;
        this.adventureMode = (gameModeSetting === 'adventure');
        
        // Set game speed based on selection (only for competitive mode)
        this.speedSetting = speedSetting; // Store for settings persistence
        if (!this.adventureMode) {
            switch(speedSetting) {
                case 'slow':
                    this.gameSpeed = 250;
                    break;
                case 'medium':
                    this.gameSpeed = 150;
                    break;
                case 'fast':
                    this.gameSpeed = 80;
                    break;
            }
        }
        
        // Set border behavior
        this.borderWrap = (borderSetting === 'wrap');
        
        // Set portal behavior
        this.portalsEnabled = (portalsSetting === 'on');
        if (this.fieldManager) {
            this.fieldManager.portalsEnabled = this.portalsEnabled;
            // Reset field manager to clean state
            this.fieldManager.switchToField('normal');
            this.currentFieldElement.textContent = this.fieldManager.getCurrentFieldName();
        }
        
        // Set snake hit behavior
        this.snakeHitBehavior = snakeHitSetting;
        
        // Set multiplayer mode and colors
        this.isMultiplayer = (playerModeSetting === 'multi');
        if (this.isMultiplayer) {
            this.player1Color = player1ColorSetting;
            this.player2Color = player2ColorSetting;
            console.log('Multiplayer colors - Player 1:', this.player1Color, 'Player 2:', this.player2Color);
        } else {
            this.snakeColor = snakeColorSetting;
            console.log('Single player color:', this.snakeColor);
        }
        
        // Update controls text based on game mode and player count
        if (this.isMultiplayer) {
            if (this.adventureMode) {
                this.controlsTextElement.innerHTML = 'Player 1: Arrow keys | Player 2: WASD keys<br>🍓 🍅 🍋 🍎 🍊 = +1 point &nbsp;&nbsp;&nbsp; 💣 = BOOM!';
            } else {
                this.controlsTextElement.innerHTML = 'Player 1: Arrow keys | Player 2: WASD keys | Press P to pause<br>🍓 🍅 🍋 🍎 🍊 = +1 point &nbsp;&nbsp;&nbsp; 💣 = BOOM!';
            }
        } else {
            if (this.adventureMode) {
                this.controlsTextElement.innerHTML = 'Press arrow keys to move the snake one step at a time!<br>🍓 🍅 🍋 🍎 🍊 = +1 point &nbsp;&nbsp;&nbsp; 💣 = BOOM!';
            } else {
                this.controlsTextElement.innerHTML = 'Use arrow keys to change direction | Press P to pause<br>🍓 🍅 🍋 🍎 🍊 = +1 point &nbsp;&nbsp;&nbsp; 💣 = BOOM!';
            }
        }
        
        this.gameStarted = true;
        this.gameRunning = true;
        this.startScreenElement.style.display = 'none';
        
        // Reset snake(s) based on player mode
        if (this.isMultiplayer) {
            // Find safe spawn positions for both players
            const player1Pos = this.fieldManager.findSafeSpawnPosition();
            const player2Pos = this.fieldManager.findSafeSpawnPosition();
            
            // Ensure players don't spawn at the same position
            if (player1Pos.x === player2Pos.x && player1Pos.y === player2Pos.y) {
                // Try to find a different position for player 2
                for (let attempt = 0; attempt < 50; attempt++) {
                    const newPos = this.fieldManager.findSafeSpawnPosition();
                    if (newPos.x !== player1Pos.x || newPos.y !== player1Pos.y) {
                        player2Pos.x = newPos.x;
                        player2Pos.y = newPos.y;
                        break;
                    }
                }
            }
            
            this.snake = [{x: player1Pos.x, y: player1Pos.y}];
            this.snake2 = [{x: player2Pos.x, y: player2Pos.y}];
            
            // Set initial directions
            this.dx = 0; this.dy = 0;
            this.dx2 = 0; this.dy2 = 0;
            
            if (!this.adventureMode) {
                this.pausedAfterTeleport = true;
            }
        } else {
            // Single player: find safe spawn position
            const spawnPos = this.fieldManager.findSafeSpawnPosition();
            this.snake = [{x: spawnPos.x, y: spawnPos.y}];
            
            // Set initial direction based on game mode
            if (this.adventureMode) {
                // In adventure mode, start with no movement
                this.dx = 0;
                this.dy = 0;
            } else {
                // In competitive mode, pause at start to let player choose direction (same as post-teleport)
                this.dx = 0;
                this.dy = 0;
                this.pausedAfterTeleport = true;
            }
        }
        
        // Spawn initial items
        this.spawnFood();
        this.spawnBombs();
        // Clear any residual explosion visuals
        this.explosionState = null;
        
        // Save current settings for next game
        this.saveSettings();
    }
    
    moveOneStep() {
        // Execute one movement step for Player 1 - used for adventure mode
        if (this.isMultiplayer) {
            this.updateSingleSnake(this.snake, this.dx, this.dy, false);
        } else {
            // Single player: use the full update
            this.update();
        }
        this.draw();
    }
    
    movePlayer2() {
        console.log('Game state - gameRunning:', this.gameRunning, 'gameStarted:', this.gameStarted);
        console.log('Snake 2 position before move:', this.snake2);
        if (this.gameRunning && this.gameStarted) {
            this.updateSingleSnake(this.snake2, this.dx2, this.dy2, true);
            console.log('Snake 2 position after move:', this.snake2);
            this.draw();
        }
    }
    
    update() {
        if (!this.gameRunning || !this.gameStarted) return;
        
        // Don't update if game is paused in competitive mode
        if (!this.adventureMode && this.gamePaused) return;
        
        if (this.isMultiplayer) {
            // Multiplayer: Update both snakes
            let player1Moved = false;
            let player2Moved = false;
            
            // Update Player 1 snake
            if (this.adventureMode || (!this.adventureMode && !this.pausedAfterTeleport && (this.dx !== 0 || this.dy !== 0))) {
                if (this.updateSingleSnake(this.snake, this.dx, this.dy, false)) {
                    player1Moved = true;
                }
            }
            
            // Update Player 2 snake
            if (this.adventureMode || (!this.adventureMode && !this.pausedAfterTeleport && (this.dx2 !== 0 || this.dy2 !== 0))) {
                if (this.updateSingleSnake(this.snake2, this.dx2, this.dy2, true)) {
                    player2Moved = true;
                }
            }
            
            // Update field manager: always in adventure mode, or when movement occurred in competitive mode
            if (this.fieldManager && (this.adventureMode || player1Moved || player2Moved)) {
                this.fieldManager.update();
            }
        } else {
            // Single player: Update main snake only
            // In adventure mode, only move if there's a direction set
            if (this.adventureMode && this.dx === 0 && this.dy === 0) return;
            
            // In competitive mode, don't move if paused after teleport
            if (!this.adventureMode && this.pausedAfterTeleport) return;
            
            this.updateSingleSnake(this.snake, this.dx, this.dy, false);
            
            // Update field manager
            if (this.fieldManager) {
                this.fieldManager.update();
            }
        }
    }
    
    updateSingleSnake(snake, dx, dy, isPlayer2 = false) {
        if (!snake || snake.length === 0) return false;
        
        // In competitive mode, don't move if no direction set
        if (!this.adventureMode && dx === 0 && dy === 0) return false;
        
        // Calculate new head position
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        
        // Prevent movement that would cause immediate self-collision
        // Check if the new head position would collide with the body
        for (let i = 1; i < snake.length; i++) {
            const segment = snake[i];
            if (head.x === segment.x && head.y === segment.y) {
                // Handle self-collision based on settings
                if (this.snakeHitBehavior === 'gameOver') {
                    this.gameOver();
                    return false;
                } else {
                    // Just prevent movement (no pause) - allow player to choose new direction
                    return false;
                }
            }
        }
        
        // Check wall collision or wrap around
        if (this.borderWrap) {
            // Wrap around borders
            head.x = (head.x + this.fieldWidth) % this.fieldWidth;
            head.y = (head.y + this.fieldHeight) % this.fieldHeight;
        } else {
            // Solid borders - game over on collision
            if (head.x < 0 || head.x >= this.fieldWidth || head.y < 0 || head.y >= this.fieldHeight) {
                this.gameOver();
                return false;
            }
        }
        

        

        
        // Check obstacle collision (only for obstacles marked as blocking)
        for (let obstacle of this.fieldObstacles) {
            if (head.x === obstacle.x && head.y === obstacle.y && obstacle.isObstacle !== false) {
                this.gameOver();
                return false;
            }
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check food collision
        let ateFood = false;
        for (let i = this.foods.length - 1; i >= 0; i--) {
            const food = this.foods[i];
            if (head.x === food.x && head.y === food.y) {
                // Update individual or combined score based on mode
                if (this.isMultiplayer) {
                    if (isPlayer2) {
                        this.player2Score += food.type.points;
                    } else {
                        this.player1Score += food.type.points;
                    }
                    this.updateScoreDisplay();
                } else {
                    this.score += food.type.points;
                    this.scoreElement.textContent = this.score;
                }
                this.foods.splice(i, 1);
                ateFood = true;
                
                // Spawn new food to replace eaten one
                let newFood;
                let attempts = 0;
                do {
                    newFood = {
                        x: Math.floor(Math.random() * this.fieldWidth),
                        y: Math.floor(Math.random() * this.fieldHeight),
                        type: this.foodTypes[Math.floor(Math.random() * this.foodTypes.length)]
                    };
                    attempts++;
                    if (attempts > 100) break;
                } while (this.isPositionOccupied(newFood.x, newFood.y) && attempts <= 100);
                
                this.foods.push(newFood);
                break;
            }
        }
        
        // Check bomb collision
        for (let bomb of this.bombs) {
            if (head.x === bomb.x && head.y === bomb.y) {
                // Revert head so snake appears just before the bomb tile
                snake.shift();
                this.explode(bomb.x, bomb.y);
                return false;
            }
        }
        
        // Delegate enemy collision handling to FieldManager (level-specific)
        if (this.fieldManager && typeof this.fieldManager.handleEnemyCollision === 'function') {
            this.fieldManager.handleEnemyCollision(head);
        }
        
        // Remove tail if no food was eaten
        if (!ateFood) {
            snake.pop();
        }
        
        // Check portal collision (both players can trigger portal transport)
        if (this.fieldManager && this.fieldManager.checkPortalCollision(head)) {
            // Portal entry handled in fieldManager
            this.currentFieldElement.textContent = this.fieldManager.getCurrentFieldName();
        }
        
        return true;
    }
    
    updateScoreDisplay() {
        if (this.isMultiplayer) {
            // Show individual scores for multiplayer
            if (this.singlePlayerScoreElement) this.singlePlayerScoreElement.style.display = 'none';
            if (this.multiPlayerScoresElement) this.multiPlayerScoresElement.style.display = 'block';
            if (this.player1ScoreElement) this.player1ScoreElement.textContent = this.player1Score;
            if (this.player2ScoreElement) this.player2ScoreElement.textContent = this.player2Score;
            // Update combined score for compatibility with existing systems
            this.score = this.player1Score + this.player2Score;
            this.scoreElement.textContent = this.score;
        } else {
            // Show single score for single player
            if (this.singlePlayerScoreElement) this.singlePlayerScoreElement.style.display = 'block';
            if (this.multiPlayerScoresElement) this.multiPlayerScoresElement.style.display = 'none';
            this.scoreElement.textContent = this.score;
        }
    }
    
    draw() {
        // Use field manager for background and grid drawing
        if (this.fieldManager) {
            this.fieldManager.draw(this.ctx, this.gridSize);
        } else {
            // Fallback to normal drawing
            this.ctx.fillStyle = '#E8F5E8';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid lines (subtle)
            this.ctx.strokeStyle = '#D0E8D0';
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= this.fieldWidth; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(i * this.gridSize, 0);
                this.ctx.lineTo(i * this.gridSize, this.canvas.height);
                this.ctx.stroke();
            }
            for (let i = 0; i <= this.fieldHeight; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, i * this.gridSize);
                this.ctx.lineTo(this.canvas.width, i * this.gridSize);
                this.ctx.stroke();
            }
        }
        
        // Only draw snake if game has started
        if (this.gameStarted) {
            // Draw snake
            for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            
            if (i === 0 && this.snakeImages[this.isMultiplayer ? this.player1Color : this.snakeColor] && this.snakeImages[this.isMultiplayer ? this.player1Color : this.snakeColor].headLoaded) {
                // Draw head image for the first segment with rotation based on direction
                const centerX = segment.x * this.gridSize + this.gridSize / 2;
                const centerY = segment.y * this.gridSize + this.gridSize / 2;
                
                this.ctx.save();
                this.ctx.translate(centerX, centerY);
                
                // Transform based on movement direction
                if (this.dx === 1) {
                    // Right (default orientation)
                    // No transformation needed
                } else if (this.dx === -1) {
                    // Left - flip horizontally instead of rotating
                    this.ctx.scale(-1, 1);
                } else if (this.dy === 1) {
                    // Down - rotate 90° clockwise
                    this.ctx.rotate(Math.PI / 2);
                } else if (this.dy === -1) {
                    // Up - rotate 90° counter-clockwise
                    this.ctx.rotate(-Math.PI / 2);
                }
                
                this.ctx.drawImage(
                    this.snakeImages[this.isMultiplayer ? this.player1Color : this.snakeColor].head,
                    -this.gridSize / 2, 
                    -this.gridSize / 2, 
                    this.gridSize, 
                    this.gridSize
                );
                
                this.ctx.restore();
            } else if (i > 0 && this.snakeImages[this.isMultiplayer ? this.player1Color : this.snakeColor] && this.snakeImages[this.isMultiplayer ? this.player1Color : this.snakeColor].tailLoaded) {
                // Draw body segments with tail image
                this.ctx.drawImage(
                    this.snakeImages[this.isMultiplayer ? this.player1Color : this.snakeColor].tail,
                    segment.x * this.gridSize, 
                    segment.y * this.gridSize, 
                    this.gridSize, 
                    this.gridSize
                );
            }
            }
            
            // Draw second snake for multiplayer
            if (this.isMultiplayer && this.snake2) {
                for (let i = 0; i < this.snake2.length; i++) {
                    const segment = this.snake2[i];
                    
                    if (i === 0 && this.snakeImages[this.player2Color] && this.snakeImages[this.player2Color].headLoaded) {
                        // Draw head image for the first segment with rotation based on direction
                        const centerX = segment.x * this.gridSize + this.gridSize / 2;
                        const centerY = segment.y * this.gridSize + this.gridSize / 2;
                        
                        this.ctx.save();
                        this.ctx.translate(centerX, centerY);
                        
                        // Transform based on movement direction
                        if (this.dx2 === 1) {
                            // Right (default orientation)
                            // No transformation needed
                        } else if (this.dx2 === -1) {
                            // Left - flip horizontally instead of rotating
                            this.ctx.scale(-1, 1);
                        } else if (this.dy2 === 1) {
                            // Down - rotate 90° clockwise
                            this.ctx.rotate(Math.PI / 2);
                        } else if (this.dy2 === -1) {
                            // Up - rotate 90° counter-clockwise
                            this.ctx.rotate(-Math.PI / 2);
                        }
                        
                        this.ctx.drawImage(
                            this.snakeImages[this.player2Color].head,
                            -this.gridSize / 2, 
                            -this.gridSize / 2, 
                            this.gridSize, 
                            this.gridSize
                        );
                        
                        this.ctx.restore();
                    } else if (i > 0 && this.snakeImages[this.player2Color] && this.snakeImages[this.player2Color].tailLoaded) {
                        // Draw body segments with tail image
                        this.ctx.drawImage(
                            this.snakeImages[this.player2Color].tail,
                            segment.x * this.gridSize, 
                            segment.y * this.gridSize, 
                            this.gridSize, 
                            this.gridSize
                        );
                    }
                }
            }
        }
        
        // Only draw foods and bomb if game has started
        if (this.gameStarted) {
        // Draw foods
        this.ctx.font = `${this.gridSize - 6}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (let food of this.foods) {
            const x = food.x * this.gridSize;
            const y = food.y * this.gridSize;
            
            // Find the food type index
            const foodTypeIndex = this.foodTypes.findIndex(type => type.emoji === food.type.emoji);
            
            // Try to draw image first, fallback to emoji if image not loaded
            if (foodTypeIndex !== -1 && this.fruitImages[foodTypeIndex] && this.fruitImages[foodTypeIndex].loaded) {
                // Draw fruit image
                this.ctx.drawImage(
                    this.fruitImages[foodTypeIndex].image,
                    x + 2, 
                    y + 2, 
                    this.gridSize - 4, 
                    this.gridSize - 4
                );
            } else {
                // Fallback to emoji rendering
                const centerX = x + this.gridSize / 2;
                const centerY = y + this.gridSize / 2;
                
                // Draw background circle
                this.ctx.fillStyle = food.type.color;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, this.gridSize / 2 - 3, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Draw emoji
                this.ctx.fillStyle = 'white';
                this.ctx.fillText(food.type.emoji, centerX, centerY);
            }
        }
        
            // Draw bombs
            for (let bomb of this.bombs) {
                const x = bomb.x * this.gridSize;
                const y = bomb.y * this.gridSize;
                
                // Determine which bomb image to use based on current level
                let bombImage = null;
                if (this.fieldManager && this.fieldManager.currentField) {
                    if (this.fieldManager.currentField === 'jungle' || this.fieldManager.currentField === 'space') {
                        bombImage = this.bombImages.red;
                    } else {
                        // home and sea levels
                        bombImage = this.bombImages.black;
                    }
                } else {
                    // Default to black bomb if no field manager
                    bombImage = this.bombImages.black;
                }
                
                // Try to draw image first, fallback to emoji if image not loaded
                if (this.bombImageLoaded && bombImage) {
                    // Draw bomb image
                    this.ctx.drawImage(
                        bombImage,
                        x + 2, 
                        y + 2, 
                        this.gridSize - 4, 
                        this.gridSize - 4
                    );
                } else {
                    // Fallback to emoji rendering
                    const centerX = x + this.gridSize / 2;
                    const centerY = y + this.gridSize / 2;
                    
                    // Draw background circle
                    this.ctx.fillStyle = bomb.type.color;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, this.gridSize / 2 - 3, 0, 2 * Math.PI);
                    this.ctx.fill();
                    
                    // Draw bomb emoji
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillText(bomb.type.emoji, centerX, centerY);
                }
            }
        }

        // Draw explosion overlay last so it appears above everything, but snake head stays on previous tile
        if (this.explosionState && !this.explosionState.shown) {
            const centerX = this.explosionState.x * this.gridSize + this.gridSize / 2;
            const centerY = this.explosionState.y * this.gridSize + this.gridSize / 2;
            this.ctx.fillStyle = '#FF4444';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.gridSize, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, this.gridSize * 0.7, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = `${this.gridSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💥', centerX, centerY);
            this.explosionState.shown = true;
        }
        
        // Draw pause overlay (only for manual pause with P key)
        if (this.gamePaused && !this.adventureMode && this.gameRunning) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = `${Math.max(24, this.gridSize * 2)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('⏸️ PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = `${Math.max(16, this.gridSize)}px Arial`;
            this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
            
            // Show additional message if paused due to self-collision
            if (this.snakeHitBehavior === 'pause') {
                this.ctx.font = `${Math.max(14, this.gridSize * 0.8)}px Arial`;
                this.ctx.fillText('Snake hit itself!', this.canvas.width / 2, this.canvas.height / 2 + 70);
            }
        }
    }
    
    explode(bx, by) {
        this.gameRunning = false;
        // Remember explosion location for drawing overlay
        this.explosionState = { x: bx ?? this.snake[0].x, y: by ?? this.snake[0].y, shown: false };
        // Render once immediately
        this.draw();
        // Show universal leaderboard UI
        this.renderGameOverUI(this.score);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.renderGameOverUI(this.score);
    }

    renderGameOverUI(currentScore) {
        // Build leaderboard UI (no download button)
        const entries = this.loadLeaderboardData();
        const listHtml = this.renderLeaderboardHTML(entries);
        this.gameOverElement.innerHTML = `
            <div style="font-size:26px;margin-bottom:8px;">🐍 Game Over! 🐍</div>
            <div style="margin-bottom:12px;">Your score: <strong>${currentScore}</strong></div>
            <div style="display:flex;flex-direction:column;gap:8px;align-items:center;">
                <div style="display:flex;gap:8px;align-items:center;">
                    <input id=\"playerNameInput\" type=\"text\" placeholder=\"Enter your name\" style=\"padding:6px 10px;border:2px solid #4CAF50;border-radius:8px;font-size:14px;width:180px;\" />
                    <button id=\"saveScoreBtn\" class=\"start-btn\" style=\"padding:8px 14px;font-size:14px;\">Save Score</button>
                </div>
                <div id=\"saveStatus\" style=\"min-height:18px;color:#777;font-size:12px;\"></div>
                <div id=\"leaderboardContainer\" style=\"width:100%;max-width:460px;\">${listHtml}</div>
                <div style=\"font-size:12px;color:#777;\">Press Enter to restart</div>
            </div>
        `;
        this.gameOverElement.style.display = 'block';
        this.highScoreInputActive = true; // Set flag to disable game controls

        const nameInput = document.getElementById('playerNameInput');
        const saveBtn = document.getElementById('saveScoreBtn');
        const leaderboardContainer = document.getElementById('leaderboardContainer');
        const saveStatus = document.getElementById('saveStatus');

        const saveAction = () => {
            const name = (nameInput?.value || '').trim().slice(0, 24) || 'Player';
            // Only save if qualifies for Top 5
            const existing = (this.loadLeaderboardData() || []).slice();
            existing.sort((a,b)=> b.score - a.score || a.ts - b.ts);
            const qualifies = existing.length < 5 || currentScore >= (existing[existing.length - 1]?.score || 0);
            if (qualifies) {
                const updated = this.addLeaderboardEntry(name, currentScore, this.getSettingsIcons());
                if (leaderboardContainer) leaderboardContainer.innerHTML = this.renderLeaderboardHTML(updated);
                if (saveBtn) { saveBtn.textContent = 'Saved!'; saveBtn.disabled = true; }
                if (saveStatus) { saveStatus.textContent = 'Saved to leaderboard.'; saveStatus.style.color = '#2E7D32'; }
                // Local-only; no file persistence
            } else {
                if (saveStatus) { saveStatus.textContent = 'Score not in Top 5. Try again!'; saveStatus.style.color = '#c0392b'; }
            }
        };

        if (saveBtn) saveBtn.addEventListener('click', saveAction);
        if (nameInput) {
            nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveAction(); });
            nameInput.addEventListener('focus', () => { this.highScoreInputActive = true; });
            nameInput.addEventListener('blur', () => { this.highScoreInputActive = false; });
            // Focus the input automatically
            setTimeout(() => nameInput.focus(), 100);
        }
    }
    
    restart() {
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'none';
        this.highScoreInputActive = false; // Clear flag to re-enable game controls
        this.gameStarted = false;
        this.gameRunning = false;
        this.pausedAfterTeleport = false;
        this.gamePaused = false;
        // Note: snakeHitBehavior is preserved across games
        
        // Reset snake (will be positioned safely when game starts)
        this.snake = [{x: 0, y: 0}]; // Temporary position, will be set properly on start
        this.dx = 0;
        this.dy = 0;
        
        // Clear foods and bombs arrays
        this.foods = [];
        this.bombs = [];

        // Reset counters UI
        this.fruitDestructionCounters = { monkey: 0, asteroid: 0, fish: 0, bubble: 0 };
        this.updateFruitCountersUI();
        
        // Reset field manager and portal baseline for a fresh game
        if (this.fieldManager) {
            this.fieldManager.switchToField('normal');
            this.fieldManager.lastPortalScore = 0;
            this.fieldManager.portal = null;
            this.fieldManager.teleportState = null;
            this.currentFieldElement.textContent = this.fieldManager.getCurrentFieldName();
        }
        
        // Show start screen again so players can change settings
        this.startScreenElement.style.display = 'block';
    }

    // ===== Counters UI =====
    updateFruitCountersUI() {
        if (!this.fruitCountersElement) return;
        const c = this.fruitDestructionCounters || {};
        const compact = `🐒 ${c.monkey || 0} | ☄️ ${c.asteroid || 0} | 🐟 ${c.fish || 0} | 🫧 ${c.bubble || 0}`;
        this.fruitCountersElement.textContent = compact;
    }
    
    resizeCanvas() {
        if (!this.gameStarted) return;
        
        // Recalculate dimensions based on new screen size
        const availableWidth = window.innerWidth * 0.90;
        const availableHeight = window.innerHeight * 0.75;
        
        // Keep the same tile density, but recalculate grid size
        const minDimension = Math.min(availableWidth, availableHeight);
        const baseDensity = Math.min(this.fieldWidth, this.fieldHeight);
        this.gridSize = Math.floor(minDimension / baseDensity);
        
        // Ensure minimum grid size for playability
        this.gridSize = Math.max(this.gridSize, 20);
        
        // Recalculate field dimensions
        this.fieldWidth = Math.floor(availableWidth / this.gridSize);
        this.fieldHeight = Math.floor(availableHeight / this.gridSize);
        
        // Update canvas dimensions
        this.canvas.width = this.fieldWidth * this.gridSize;
        this.canvas.height = this.fieldHeight * this.gridSize;
        
        // Redraw immediately
        this.draw();
    }

    gameLoop() {
        // In competitive mode, auto-update. In adventure mode, only update field manager for events like portals
        if (!this.adventureMode) {
            this.update();
        } else {
            // In adventure mode, update field manager for portal spawning and other events
            if (this.fieldManager) {
                this.fieldManager.update();
            }
        }
        this.draw();
        
        // Use dynamic game speed based on settings (only matters for competitive mode)
        setTimeout(() => {
            this.gameLoop();
        }, this.adventureMode ? 50 : this.gameSpeed); // Fast refresh for adventure mode drawing
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    const game = new SnakeGame();
    
    // Load settings after everything is initialized
    setTimeout(() => {
        game.loadSettings();
    }, 200);
});
