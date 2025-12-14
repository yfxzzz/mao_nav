// Game Constants
const GRID_SIZE = 20; // Grid size
const CELL_SIZE = 20; // Cell size

// Game Variables
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 150; // Default speed (milliseconds)
let gameInterval;
let score = 0;
let gameRunning = false;
let gamePaused = false;

// Image Resources
const images = {
    background: new Image(),
    snakeHead: new Image(),
    snakeBody: new Image(),
    food: new Image()
};

images.background.src = 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/ff6159acd61c42e6ae8a892f09af09b0~tplv-a9rns2rl98-image.image?rcl=2025121411495316CB5594420CCB1C75E9&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1768276209&x-signature=Z5AJ3jjPU7uTjvuZVCGdfGsQobE%3D';
images.snakeHead.src = 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/5334693579634a0e8b35bb4e428f1cff~tplv-a9rns2rl98-image.image?rcl=2025121411495316CB5594420CCB1C75E9&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1768276241&x-signature=Oiq%2FAVFA7B%2B6cLqcIybKBCXgmKk%3D';
images.food.src = 'https://p9-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/d8a205a417364ba88b3e334a9ece3ebf~tplv-a9rns2rl98-image.image?rcl=2025121411495316CB5594420CCB1C75E9&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1768276230&x-signature=gwKXWjb4BQNgEOkC3hh9wIkfJZw%3D';

// Initialize Game
function initGame() {
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    
    // Initialize snake
    resetSnake();
    
    // Generate food
    generateFood();
    
    // Draw initial game state
    drawGame();
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('languageSelect').addEventListener('change', changeLanguage);
    
    // Difficulty button events
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            // Add active class to current button
            this.classList.add('active');
            // Set game speed
            gameSpeed = parseInt(this.dataset.speed);
            // If game is running, restart with new speed
            if (gameRunning && !gamePaused) {
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        });
    });
    
    // Mobile control button events
    document.querySelectorAll('.mobile-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dir = this.dataset.direction;
            changeDirection(dir);
        });
    });
    
    // Resize canvas when window size changes
    window.addEventListener('resize', resizeCanvas);
}

// Resize Canvas
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Ensure canvas is square and fits container
    const size = Math.min(containerWidth, containerHeight, 400); // Max 400px
    
    canvas.width = size;
    canvas.height = size;
    
    // Redraw game
    drawGame();
}

// Reset Snake
function resetSnake() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    updateScore();
}

// Generate Food
function generateFood() {
    let newFood;
    let overlapping;
    
    do {
        overlapping = false;
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / CELL_SIZE)),
            y: Math.floor(Math.random() * (canvas.height / CELL_SIZE))
        };
        
        // Check if food overlaps with snake
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                overlapping = true;
                break;
            }
        }
    } while (overlapping);
    
    food = newFood;
}

// Draw Game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color');
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        const cell = snake[i];
        const pixelX = cell.x * CELL_SIZE;
        const pixelY = cell.y * CELL_SIZE;
        
        if (i === 0) {
            // Draw snake head
            ctx.fillStyle = '#f00';
            
            // Draw snake head facing different directions based on movement
            ctx.save();
            ctx.translate(pixelX + CELL_SIZE / 2, pixelY + CELL_SIZE / 2);
            
            switch (direction) {
                case 'up':
                    ctx.rotate(-Math.PI / 2);
                    break;
                case 'down':
                    ctx.rotate(Math.PI / 2);
                    break;
                case 'left':
                    ctx.rotate(Math.PI);
                    break;
            }
            
            ctx.drawImage(
                images.snakeHead,
                -CELL_SIZE / 2,
                -CELL_SIZE / 2,
                CELL_SIZE,
                CELL_SIZE
            );
            
            ctx.restore();
        } else {
            // Draw snake body
            ctx.fillStyle = '#0f0';
            ctx.fillRect(pixelX, pixelY, CELL_SIZE - 1, CELL_SIZE - 1);
        }
    }
    
    // Draw food
    const foodPixelX = food.x * CELL_SIZE;
    const foodPixelY = food.y * CELL_SIZE;
    
    ctx.drawImage(
        images.food,
        foodPixelX,
        foodPixelY,
        CELL_SIZE,
        CELL_SIZE
    );
    
    // If game is paused, show pause text
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '24px Press Start 2P';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('游戏暂停', canvas.width / 2, canvas.height / 2);
    }
    
    // If game hasn't started, show start prompt
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px Press Start 2P';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('点击开始按钮', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('或按空格键开始', canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Update Game State
function updateGame() {
    // Update direction
    direction = nextDirection;
    
    // Get snake head
    const head = { x: snake[0].x, y: snake[0].y };
    
    // Move snake head based on direction
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // Check if snake hit boundary
    if (
        head.x < 0 ||
        head.x >= canvas.width / CELL_SIZE ||
        head.y < 0 ||
        head.y >= canvas.height / CELL_SIZE
    ) {
        gameOver();
        return;
    }
    
    // Check if snake hit itself
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    // Add new head to front of snake
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score++;
        updateScore();
        
        // Generate new food
        generateFood();
    } else {
        // If no food eaten, remove tail
        snake.pop();
    }
    
    // Draw game
    drawGame();
}

// Game Loop
function gameLoop() {
    if (!gamePaused) {
        updateGame();
    }
}

// Start Game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameInterval = setInterval(gameLoop, gameSpeed);
        drawGame();
    }
}

// Pause/Resume Game
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        drawGame();
    }
}

// Restart Game
function restartGame() {
    clearInterval(gameInterval);
    resetSnake();
    generateFood();
    gameRunning = false;
    gamePaused = false;
    drawGame();
}

// Game Over
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    
    // Show game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f00';
    ctx.font = '20px Press Start 2P';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px Press Start 2P';
    ctx.fillText('最终分数: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillText('点击重新开始按钮', canvas.width / 2, canvas.height / 2 + 30);
}

// Update Score Display
function updateScore() {
    document.getElementById('score').textContent = '分数: ' + score;
}

// Handle Key Press
function handleKeyPress(e) {
    // Prevent default scrolling behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'r', 'R'].includes(e.key)) {
        e.preventDefault();
    }
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection('right');
            break;
        case ' ':
            // Space key to start/pause game
            if (!gameRunning) {
                startGame();
            } else {
                togglePause();
            }
            break;
        case 'r':
        case 'R':
            // R key to restart game
            restartGame();
            break;
    }
}

// Change Direction
function changeDirection(newDirection) {
    // Ensure snake can't move directly backward
    if (
        (newDirection === 'up' && direction !== 'down') ||
        (newDirection === 'down' && direction !== 'up') ||
        (newDirection === 'left' && direction !== 'right') ||
        (newDirection === 'right' && direction !== 'left')
    ) {
        nextDirection = newDirection;
    }
}

// Change Language
function changeLanguage() {
    const selectedOption = document.getElementById('languageSelect').value;
    window.location.href = selectedOption;
}

// Theme Toggle Functionality
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial theme based on user preference or saved setting
    const savedTheme = localStorage.getItem('theme') || 
                      (prefersDarkScheme.matches ? 'dark' : 'light');
    setTheme(savedTheme);
    
    // Add event listener to theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
}

// Set Theme Function
function setTheme(theme) {
    const themeToggle = document.getElementById('themeToggle');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update button icon
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    initTheme();
    initGame();
});