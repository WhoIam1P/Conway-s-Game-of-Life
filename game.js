// 康威生命游戏 - Game of Life
class GameOfLife {
    constructor(canvasId, cellSize = 20) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = cellSize;
        this.isRunning = false;
        this.generation = 0;
        this.animationId = null;
        this.speed = 5; // 1-10
        
        this.setupCanvas();
        this.grid = this.createGrid();
        this.nextGrid = this.createGrid();
        
        this.setupEventListeners();
        this.draw();
    }

    setupCanvas() {
        // 设置画布大小
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.cols = Math.floor(this.canvas.width / this.cellSize);
        this.rows = Math.floor(this.canvas.height / this.cellSize);
    }

    createGrid() {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
    }

    setupEventListeners() {
        // 鼠标点击切换细胞状态
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const col = Math.floor(x / this.cellSize);
            const row = Math.floor(y / this.cellSize);
            
            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                this.grid[row][col] = this.grid[row][col] ? 0 : 1;
                this.draw();
                this.updateStats();
            }
        });

        // 控制按钮
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('clearBtn').addEventListener('click', () => this.clear());
        document.getElementById('randomBtn').addEventListener('click', () => this.randomize());

        // 速度滑块
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = this.speed;
        });

        // 网格大小滑块
        document.getElementById('sizeSlider').addEventListener('input', (e) => {
            this.cellSize = parseInt(e.target.value);
            document.getElementById('sizeValue').textContent = this.cellSize;
            this.setupCanvas();
            this.grid = this.createGrid();
            this.nextGrid = this.createGrid();
            this.draw();
            this.updateStats();
        });

        // 预设模式按钮
        document.querySelectorAll('.btn-pattern').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pattern = e.target.dataset.pattern;
                this.loadPattern(pattern);
            });
        });
    }

    // 计算活邻居数量
    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = (row + i + this.rows) % this.rows;
                const newCol = (col + j + this.cols) % this.cols;
                count += this.grid[newRow][newCol];
            }
        }
        return count;
    }

    // 更新游戏状态
    update() {
        // 计算下一代
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const neighbors = this.countNeighbors(row, col);
                const currentCell = this.grid[row][col];

                // 康威生命游戏规则
                if (currentCell === 1) {
                    // 活细胞
                    if (neighbors < 2 || neighbors > 3) {
                        this.nextGrid[row][col] = 0; // 死亡
                    } else {
                        this.nextGrid[row][col] = 1; // 存活
                    }
                } else {
                    // 死细胞
                    if (neighbors === 3) {
                        this.nextGrid[row][col] = 1; // 繁殖
                    } else {
                        this.nextGrid[row][col] = 0; // 保持死亡
                    }
                }
            }
        }

        // 交换网格
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        this.generation++;
        this.draw();
        this.updateStats();
    }

    // 绘制网格
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制细胞
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col] === 1) {
                    const x = col * this.cellSize;
                    const y = row * this.cellSize;
                    
                    // 绘制活细胞（带渐变效果）
                    const gradient = this.ctx.createRadialGradient(
                        x + this.cellSize / 2, y + this.cellSize / 2, 0,
                        x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 2
                    );
                    gradient.addColorStop(0, '#00ff88');
                    gradient.addColorStop(1, '#00cc6a');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
                }
            }
        }

        // 绘制网格线
        this.ctx.strokeStyle = '#2a2a3e';
        this.ctx.lineWidth = 1;
        
        // 垂直线
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    // 游戏循环
    gameLoop() {
        const fps = this.speed;
        const interval = 1000 / fps;
        let lastTime = 0;

        const loop = (currentTime) => {
            if (!this.isRunning) return;

            const deltaTime = currentTime - lastTime;

            if (deltaTime >= interval) {
                this.update();
                lastTime = currentTime - (deltaTime % interval);
            }

            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    // 控制方法
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
            this.gameLoop();
        }
    }

    pause() {
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    reset() {
        this.pause();
        this.generation = 0;
        this.grid = this.createGrid();
        this.draw();
        this.updateStats();
    }

    clear() {
        this.pause();
        this.grid = this.createGrid();
        this.draw();
        this.updateStats();
    }

    randomize() {
        this.pause();
        this.generation = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col] = Math.random() > 0.7 ? 1 : 0;
            }
        }
        this.draw();
        this.updateStats();
    }

    // 更新统计信息
    updateStats() {
        document.getElementById('generation').textContent = this.generation;
        const population = this.grid.flat().reduce((sum, cell) => sum + cell, 0);
        document.getElementById('population').textContent = population;
    }

    // 加载预设模式
    loadPattern(patternName) {
        this.clear();
        const centerRow = Math.floor(this.rows / 2);
        const centerCol = Math.floor(this.cols / 2);

        const patterns = {
            glider: [
                [0, 1, 0],
                [0, 0, 1],
                [1, 1, 1]
            ],
            blinker: [
                [1, 1, 1]
            ],
            toad: [
                [0, 1, 1, 1],
                [1, 1, 1, 0]
            ],
            beacon: [
                [1, 1, 0, 0],
                [1, 1, 0, 0],
                [0, 0, 1, 1],
                [0, 0, 1, 1]
            ],
            pulsar: [
                [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
            ],
            gliderGun: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        };

        const pattern = patterns[patternName];
        if (pattern) {
            const startRow = centerRow - Math.floor(pattern.length / 2);
            const startCol = centerCol - Math.floor(pattern[0].length / 2);

            for (let i = 0; i < pattern.length; i++) {
                for (let j = 0; j < pattern[i].length; j++) {
                    const row = startRow + i;
                    const col = startCol + j;
                    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                        this.grid[row][col] = pattern[i][j];
                    }
                }
            }
            this.draw();
            this.updateStats();
        }
    }
}

// 初始化游戏
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new GameOfLife('gameCanvas');
});

