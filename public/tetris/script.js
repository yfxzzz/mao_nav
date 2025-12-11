// 俄罗斯方块游戏主逻辑

// 游戏常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF0D72', // I形
    '#0DC2FF', // J形
    '#FFE135', // L形
    '#00FF85', // O形
    '#FF8500', // S形
    '#8500FF', // T形
    '#FF0085'  // Z形
];

// 方块形状定义
const SHAPES = [
    [], // 空形状
    [ // I形
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    [ // J形
        [2, 0, 0],
        [2, 2, 2],
        [0, 0, 0]
    ],
    [ // L形
        [0, 0, 3],
        [3, 3, 3],
        [0, 0, 0]
    ],
    [ // O形
        [4, 4],
        [4, 4]
    ],
    [ // S形
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
    ],
    [ // T形
        [0, 6, 0],
        [6, 6, 6],
        [0, 0, 0]
    ],
    [ // Z形
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
    ]
];

// 游戏变量
let canvas, ctx;
let nextCanvas, nextCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let highScore = localStorage.getItem('tetrisHighScore') || 0;
let linesCleared = 0;
let level = 1;
let gameSpeed = 1000; // 初始下落速度（毫秒）
let dropCounter = 0;
let lastTime = 0;
let gameOver = false;
let isPaused = false;
let animationId = null;

// 音效
const sounds = {
    move: new Audio('data:audio/mp3;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA/+MYxAANkAKwBUAABAAAAHQAAA1NvdW5kIEVmZmVjdHMA/+MYxDAMkAKwBUAABAAAAGQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDEMkAKwBUAABAAAAGQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDMMkAKwBUAABAAAAGQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'),
    rotate: new Audio('data:audio/mp3;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA/+MYxAANkAKwBUAABAAABQQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDEMkAKwBUAABAAABQQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDMMkAKwBUAABAAABQQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'),
    clear: new Audio('data:audio/mp3;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA/+MYxAANkAKwBUAABAAABMwAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDEMkAKwBUAABAAABMwAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDMMkAKwBUAABAAABMwAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'),
    gameOver: new Audio('data:audio/mp3;base64,SUQzAwAAAAAAJlRQRTEAAAAcAAAAU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMA/+MYxAANkAKwBUAABAAABYQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDEMkAKwBUAABAAABYQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDMMkAKwBUAABAAABYQAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV')
};

// DOM元素
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const currentScoreEl = document.getElementById('currentScore');
const highScoreEl = document.getElementById('highScore');
const linesClearedEl = document.getElementById('linesCleared');
const currentLevelEl = document.getElementById('currentLevel');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// 初始化游戏
function init() {
    // 获取画布和上下文
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');

    // 调整画布大小
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    nextCanvas.width = 4 * BLOCK_SIZE;
    nextCanvas.height = 4 * BLOCK_SIZE;

    // 初始化游戏板
    resetBoard();

    // 生成第一个方块和下一个方块
    currentPiece = generateNewPiece();
    nextPiece = generateNewPiece();

    // 更新显示
    updateDisplay();

    // 设置事件监听器
    setupEventListeners();

    // 绘制初始游戏状态
    draw();
}

// 重置游戏板
function resetBoard() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

// 生成新方块
function generateNewPiece() {
    const type = Math.floor(Math.random() * 7) + 1; // 1-7
    return {
        type,
        shape: SHAPES[type],
        x: Math.floor((COLS - SHAPES[type][0].length) / 2),
        y: 0,
        color: COLORS[type]
    };
}

// 旋转方块
function rotate(piece) {
    // 创建旋转后的新形状
    const rotatedShape = [];
    const rows = piece.shape.length;
    const cols = piece.shape[0].length;

    for (let i = 0; i < cols; i++) {
        rotatedShape[i] = [];
        for (let j = 0; j < rows; j++) {
            rotatedShape[i][j] = piece.shape[rows - 1 - j][i];
        }
    }

    // 创建新的方块对象
    const rotatedPiece = {
        ...piece,
        shape: rotatedShape
    };

    return rotatedPiece;
}

// 检查方块是否可以移动到指定位置
function isValidMove(piece, offsetX = 0, offsetY = 0, testShape = null) {
    const shape = testShape || piece.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x] !== 0) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;

                // 检查边界
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return false;
                }

                // 检查是否与已有方块重叠（但允许在顶部以上）
                if (newY >= 0 && board[newY][newX] !== 0) {
                    return false;
                }
            }
        }
    }

    return true;
}

// 将当前方块固定到游戏板上
function lockPiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] !== 0) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                
                // 确保方块在游戏板内
                if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
                    board[boardY][boardX] = currentPiece.type;
                }
            }
        }
    }

    // 检查是否有完整的行可以消除
    checkLines();

    // 更新当前方块为下一个方块
    currentPiece = nextPiece;
    nextPiece = generateNewPiece();

    // 检查游戏是否结束
    if (!isValidMove(currentPiece)) {
        endGame();
    }
}

// 检查并消除完整的行
function checkLines() {
    let linesRemoved = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            // 移除当前行
            board.splice(y, 1);
            // 在顶部添加新的空行
            board.unshift(Array(COLS).fill(0));
            // 增加行数计数
            linesRemoved++;
            // 因为移除了一行，所以y需要加1，否则会跳过一行
            y++;
        }
    }

    if (linesRemoved > 0) {
        // 播放消除音效
        sounds.clear.play();
        
        // 计算得分
        const points = calculatePoints(linesRemoved);
        score += points;
        
        // 更新消除的行数
        linesCleared += linesRemoved;
        
        // 检查是否需要升级
        checkLevelUp();
        
        // 更新显示
        updateDisplay();
    }
}

// 计算得分
function calculatePoints(lines) {
    // 基础分数
    const basePoints = [0, 100, 300, 500, 800]; // 0, 1, 2, 3, 4行的基础分数
    
    // 根据等级计算倍率
    const levelMultiplier = 1 + (level - 1) * 0.5;
    
    // 返回最终得分
    return Math.floor(basePoints[lines] * levelMultiplier);
}

// 检查是否需要升级
function checkLevelUp() {
    const newLevel = Math.floor(linesCleared / 10) + 1;
    
    if (newLevel > level) {
        level = newLevel;
        // 随着等级提升，游戏速度加快
        gameSpeed = Math.max(100, 1000 - (level - 1) * 100);
    }
}

// 硬降（瞬间下落到底部）
function hardDrop() {
    while (isValidMove(currentPiece, 0, 1)) {
        currentPiece.y++;
    }
    lockPiece();
}

// 软降（加速下落）
function softDrop() {
    if (isValidMove(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        lockPiece();
    }
}

// 移动方块
function movePiece(direction) {
    if (direction === 'left' && isValidMove(currentPiece, -1, 0)) {
        currentPiece.x--;
        sounds.move.play();
    } else if (direction === 'right' && isValidMove(currentPiece, 1, 0)) {
        currentPiece.x++;
        sounds.move.play();
    } else if (direction === 'down') {
        softDrop();
    } else if (direction === 'rotate') {
        const rotatedPiece = rotate(currentPiece);
        if (isValidMove(rotatedPiece)) {
            currentPiece.shape = rotatedPiece.shape;
            sounds.rotate.play();
        }
    }
}

// 开始游戏
function startGame() {
    if (gameOver) {
        resetGame();
    }
    
    isPaused = false;
    gameOver = false;
    
    // 更新按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    // 确保游戏循环能够持续运行
    function runGameLoop() {
        if (isPaused || gameOver) return;
        
        const now = performance.now();
        const deltaTime = now - lastTime;
        dropCounter += deltaTime;
        
        if (dropCounter > gameSpeed) {
            if (isValidMove(currentPiece, 0, 1)) {
                currentPiece.y++;
                sounds.move.play();
            } else {
                lockPiece();
            }
            dropCounter = 0;
        }
        
        draw();
        lastTime = now;
        animationId = requestAnimationFrame(runGameLoop);
    }
    
    // 初始化时间和计数器
    lastTime = performance.now();
    dropCounter = 0;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // 立即开始游戏循环
    runGameLoop();
}

// 暂停游戏
function pauseGame() {
    isPaused = !isPaused;
    
    // 更新按钮文本
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
    
    if (!isPaused && !gameOver) {
        // 如果继续游戏，重新开始游戏循环
        lastTime = performance.now();
        gameLoop();
    }
}

// 重置游戏
function resetGame() {
    // 停止游戏循环
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // 重置游戏变量
    score = 0;
    linesCleared = 0;
    level = 1;
    gameSpeed = 1000;
    gameOver = false;
    isPaused = false;
    
    // 重置游戏板
    resetBoard();
    
    // 生成新的方块
    currentPiece = generateNewPiece();
    nextPiece = generateNewPiece();
    
    // 更新显示
    updateDisplay();
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '暂停';
    
    // 隐藏游戏结束模态框
    gameOverModal.classList.add('hidden');
    
    // 绘制游戏
    draw();
}

// 结束游戏
function endGame() {
    gameOver = true;
    
    // 停止游戏循环
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // 播放游戏结束音效
    sounds.gameOver.play();
    
    // 检查是否创造了新的最高分
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('tetrisHighScore', highScore);
    }
    
    // 更新显示
    updateDisplay();
    
    // 显示游戏结束模态框
    finalScoreEl.textContent = score;
    gameOverModal.classList.remove('hidden');
    
    // 更新按钮状态
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// 游戏主循环
function gameLoop(timestamp) {
    if (isPaused || gameOver) return;
    
    // 计算时间差
    const deltaTime = timestamp - lastTime;
    
    // 更新下落计数器
    dropCounter += deltaTime;
    
    // 如果达到下落速度阈值
    if (dropCounter > gameSpeed) {
        // 尝试下移方块
        if (isValidMove(currentPiece, 0, 1)) {
            currentPiece.y++;
            // 播放移动音效
            sounds.move.play();
        } else {
            lockPiece();
        }
        
        // 重置计数器
        dropCounter = 0;
    }
    
    // 绘制游戏
    draw();
    
    // 更新最后时间
    lastTime = timestamp;
    
    // 继续游戏循环
    animationId = requestAnimationFrame(gameLoop);
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线
    drawGrid();
    
    // 绘制游戏板
    drawBoard();
    
    // 绘制当前方块
    drawPiece(currentPiece, ctx);
    
    // 绘制下一个方块
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    // 绘制下一个方块的网格线
    drawNextGrid();
    drawPiece(nextPiece, nextCtx, true);
}

// 绘制网格线
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
}

// 绘制下一个方块区域的网格线
function drawNextGrid() {
    nextCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    nextCtx.lineWidth = 1;
    
    // 绘制4x4网格
    for (let x = 0; x <= 4; x++) {
        nextCtx.beginPath();
        nextCtx.moveTo(x * BLOCK_SIZE, 0);
        nextCtx.lineTo(x * BLOCK_SIZE, nextCanvas.height);
        nextCtx.stroke();
    }
    
    for (let y = 0; y <= 4; y++) {
        nextCtx.beginPath();
        nextCtx.moveTo(0, y * BLOCK_SIZE);
        nextCtx.lineTo(nextCanvas.width, y * BLOCK_SIZE);
        nextCtx.stroke();
    }
}

// 绘制游戏板
function drawBoard() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] !== 0) {
                drawBlock(ctx, x, y, COLORS[board[y][x]]);
            }
        }
    }
}

// 绘制方块
function drawPiece(piece, context, isNext = false) {
    const blockSize = isNext ? BLOCK_SIZE : BLOCK_SIZE;
    const offsetX = isNext ? 0 : 0;
    const offsetY = isNext ? 0 : 0;
    
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                const drawX = (isNext ? x : piece.x + x) + offsetX;
                const drawY = (isNext ? y : piece.y + y) + offsetY;
                
                // 只绘制在游戏板内的方块
                if (!isNext || (drawX >= 0 && drawX < 4 && drawY >= 0 && drawY < 4)) {
                    drawBlock(context, drawX, drawY, piece.color, blockSize);
                }
            }
        }
    }
}

// 绘制单个方块
function drawBlock(context, x, y, color, blockSize = BLOCK_SIZE) {
    const borderWidth = 1;
    
    // 绘制方块主体
    context.fillStyle = color;
    context.fillRect(
        x * blockSize + borderWidth,
        y * blockSize + borderWidth,
        blockSize - borderWidth * 2,
        blockSize - borderWidth * 2
    );
    
    // 绘制高光效果（左上角）
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(
        x * blockSize + borderWidth,
        y * blockSize + borderWidth,
        blockSize - borderWidth * 2,
        borderWidth
    );
    context.fillRect(
        x * blockSize + borderWidth,
        y * blockSize + borderWidth,
        borderWidth,
        blockSize - borderWidth * 2
    );
    
    // 绘制阴影效果（右下角）
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(
        x * blockSize + blockSize - borderWidth * 2,
        y * blockSize + borderWidth,
        borderWidth,
        blockSize - borderWidth * 2
    );
    context.fillRect(
        x * blockSize + borderWidth,
        y * blockSize + blockSize - borderWidth * 2,
        blockSize - borderWidth * 2,
        borderWidth
    );
}

// 更新显示
function updateDisplay() {
    currentScoreEl.textContent = score;
    highScoreEl.textContent = highScore;
    linesClearedEl.textContent = linesCleared;
    currentLevelEl.textContent = level;
}

// 设置事件监听器
function setupEventListeners() {
    // 按钮事件
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
    
    // 触屏事件
    let touchStartX, touchStartY;
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // 判断滑动方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 50) {
                movePiece('right');
            } else if (diffX < -50) {
                movePiece('left');
            }
        } else {
            // 垂直滑动
            if (diffY > 50) {
                movePiece('down');
            } else if (diffY < -50) {
                movePiece('rotate');
            }
        }
        
        touchStartX = null;
        touchStartY = null;
    });
    
    // 标签页切换
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除所有标签页的活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // 添加当前标签页的活动状态
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// 处理键盘按键
function handleKeyPress(e) {
    // 阻止方向键和空格键的默认行为（防止页面滚动）
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    if (gameOver || isPaused) {
        if (e.key === ' ' || e.key === 'Enter') {
            startGame();
        }
        return;
    }
    
    switch (e.key) {
        case 'ArrowLeft':
            movePiece('left');
            break;
        case 'ArrowRight':
            movePiece('right');
            break;
        case 'ArrowDown':
            movePiece('down');
            break;
        case 'ArrowUp':
            movePiece('rotate');
            break;
        case ' ': // 空格键
            hardDrop();
            break;
        case 'p':
        case 'P':
            pauseGame();
            break;
        case 'r':
        case 'R':
            resetGame();
            break;
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    init();
    highScoreEl.textContent = highScore;
});