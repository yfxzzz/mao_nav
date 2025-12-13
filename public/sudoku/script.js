// 数独游戏主要逻辑

// 全局变量
let currentDifficulty = 'easy';
let gameBoard = Array(9).fill().map(() => Array(9).fill(0));
let solutionBoard = Array(9).fill().map(() => Array(9).fill(0));
let userBoard = Array(9).fill().map(() => Array(9).fill(0));
let fixedCells = Array(9).fill().map(() => Array(9).fill(false));
let mistakes = 0;
let isGameActive = false;
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let moveHistory = [];
let selectedCell = { row: -1, col: -1 };

// DOM元素
const gameBoardElement = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const mistakesElement = document.getElementById('mistakes');
const startBtn = document.getElementById('start-btn');
const undoBtn = document.getElementById('undo-btn');
const themeToggle = document.getElementById('theme-toggle');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const numberBtns = document.querySelectorAll('.number-btn');
const gameOverModal = document.getElementById('game-over-modal');
const gameWinModal = document.getElementById('game-win-modal');
const newGameBtn = document.getElementById('new-game-btn');
const newGameBtnModal = document.getElementById('new-game-btn-modal');
const winTimeElement = document.getElementById('win-time');
const fireworksContainer = document.getElementById('fireworks-container');
const winSound = document.getElementById('win-sound');
const closeBtns = document.querySelectorAll('.close-btn');

// 初始化游戏
function initGame() {
    createBoard();
    setupEventListeners();
    updateMistakesDisplay();
    updateTimerDisplay();
    checkThemePreference();
}

// 创建数独棋盘
function createBoard() {
    gameBoardElement.innerHTML = '';
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            gameBoardElement.appendChild(cell);
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 单元格点击事件
    gameBoardElement.addEventListener('click', handleCellClick);
    
    // 数字按钮点击事件
    numberBtns.forEach(btn => {
        btn.addEventListener('click', handleNumberClick);
    });
    
    // 难度选择按钮点击事件
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', handleDifficultyChange);
    });
    
    // 控制按钮点击事件
    startBtn.addEventListener('click', startGame);
    undoBtn.addEventListener('click', undoMove);
    newGameBtn.addEventListener('click', startNewGame);
    // Game-Over 弹窗 → 关闭弹窗 + 重新开始
    document.getElementById('new-game-over-btn').addEventListener('click', () => {
        gameOverModal.classList.add('hidden');   // 关掉弹窗
        startNewGame();                          // 重新开始
    });

    // Congratulations 弹窗 → 保持不变
    newGameBtn.addEventListener('click', startNewGame);
    
    // 关闭按钮点击事件
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            document.getElementById(modalId).classList.add('hidden');
        });
    });
    
    // 主题切换按钮点击事件
    themeToggle.addEventListener('click', toggleTheme);
    
    // 键盘事件
    document.addEventListener('keydown', handleKeyPress);
}

// 处理单元格点击
function handleCellClick(event) {
    if (!isGameActive) return;
    
    const cell = event.target.closest('.cell');
    if (!cell) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // 如果是固定单元格，不允许选择
    if (fixedCells[row][col]) return;
    
    // 更新选中单元格
    updateSelectedCell(row, col);
}

// 更新选中单元格
function updateSelectedCell(row, col) {
    // 清除之前的选中状态
    clearSelection();
    
    // 设置新的选中状态
    selectedCell = { row, col };
    const cell = getCellElement(row, col);
    cell.classList.add('selected');
    
    // 高亮相同数字
    highlightSameNumbers(userBoard[row][col]);
}

// 清除选中状态
function clearSelection() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('selected', 'same-number');
    });
}

// 高亮相同数字
function highlightSameNumbers(number) {
    if (number === 0) return;
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] === number) {
                const cell = getCellElement(row, col);
                if (!(row === selectedCell.row && col === selectedCell.col)) {
                    cell.classList.add('same-number');
                }
            }
        }
    }
}

// 获取单元格元素
function getCellElement(row, col) {
    return gameBoardElement.children[row * 9 + col];
}

// 处理数字按钮点击
function handleNumberClick(event) {
    if (!isGameActive || selectedCell.row === -1) return;
    
    const number = parseInt(event.target.dataset.number);
    enterNumber(number);
}

// 处理键盘输入
function handleKeyPress(event) {
    if (!isGameActive || selectedCell.row === -1) return;
    
    if (event.key >= '1' && event.key <= '9') {
        enterNumber(parseInt(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
        enterNumber(0);
    } else if (event.key === 'ArrowUp' || event.key === 'w') {
        moveSelection(-1, 0);
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        moveSelection(1, 0);
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        moveSelection(0, -1);
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
        moveSelection(0, 1);
    }
}

// 移动选中单元格
function moveSelection(rowOffset, colOffset) {
    let newRow = selectedCell.row + rowOffset;
    let newCol = selectedCell.col + colOffset;
    
    // 确保在棋盘范围内
    newRow = Math.max(0, Math.min(8, newRow));
    newCol = Math.max(0, Math.min(8, newCol));
    
    // 如果是固定单元格，继续移动
    if (fixedCells[newRow][newCol]) {
        moveSelection(rowOffset, colOffset);
        return;
    }
    
    updateSelectedCell(newRow, newCol);
}

// 输入数字
function enterNumber(number) {
    const { row, col } = selectedCell;
    
    // 如果是固定单元格，不允许修改
    if (fixedCells[row][col]) return;
    
    // 保存当前状态用于撤销
    saveMove(row, col, userBoard[row][col]);
    
    // 更新用户棋盘
    userBoard[row][col] = number;
    
    // 更新UI
    updateCellDisplay(row, col);
    
    // 检查是否正确
    if (number !== 0) {
        checkNumber(row, col, number);
    }
    
    // 检查是否完成
    checkCompletion();
}

// 检查数字是否正确
function checkNumber(row, col, number) {
    if (number !== solutionBoard[row][col]) {
        mistakes++;
        updateMistakesDisplay();
        
        // 标记错误单元格
        const cell = getCellElement(row, col);
        cell.classList.add('error');
        setTimeout(() => {
            cell.classList.remove('error');
        }, 1000);
        
        // 检查是否游戏结束
        if (mistakes >= 3) {
            endGame(false);
        }
    }
}

// 更新单元格显示
function updateCellDisplay(row, col) {
    const cell = getCellElement(row, col);
    const number = userBoard[row][col];
    
    cell.textContent = number === 0 ? '' : number;
    
    // 重置单元格样式
    cell.classList.remove('error');
}

// 更新错误次数显示
function updateMistakesDisplay() {
    mistakesElement.textContent = `${mistakes}/3`;
}

// 保存移动记录
function saveMove(row, col, value) {
    moveHistory.push({ row, col, value });
    
    // 只保留最近10步
    if (moveHistory.length > 10) {
        moveHistory.shift();
    }
    
    // 更新撤销按钮状态
    undoBtn.disabled = moveHistory.length === 0;
}

// 撤销移动
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const move = moveHistory.pop();
    const { row, col, value } = move;
    
    // 恢复之前的状态
    userBoard[row][col] = value;
    updateCellDisplay(row, col);
    
    // 如果当前没有选中单元格，选中撤销的单元格
    if (selectedCell.row === -1) {
        updateSelectedCell(row, col);
    }
    
    // 更新撤销按钮状态
    undoBtn.disabled = moveHistory.length === 0;
}

// 检查是否完成
function checkCompletion() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (userBoard[row][col] === 0 || userBoard[row][col] !== solutionBoard[row][col]) {
                return false;
            }
        }
    }
    
    // 所有单元格都正确填写
    endGame(true);
    return true;
}

// 开始游戏
function startGame() {
    // 生成数独谜题
    generateSudoku();
    
    // 重置游戏状态
    resetGameState();
    
    // 更新UI
    updateBoardDisplay();
    
    // 开始计时
    startTimer();
    
    // 更新按钮状态
    startBtn.disabled = false; // 允许在游戏中点击New Game
    undoBtn.disabled = true;
    
    // 设置游戏为活动状态
    isGameActive = true;
}

// 重置游戏状态
function resetGameState() {
    mistakes = 0;
    elapsedTime = 0;
    moveHistory = [];
    selectedCell = { row: -1, col: -1 };
    clearSelection();
    updateMistakesDisplay();
    updateTimerDisplay();
}

// 更新棋盘显示
function updateBoardDisplay() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = getCellElement(row, col);
            const number = gameBoard[row][col];
            
            cell.textContent = number === 0 ? '' : number;
            cell.classList.remove('fixed', 'selected', 'same-number', 'error');
            
            if (number !== 0) {
                cell.classList.add('fixed');
                fixedCells[row][col] = true;
                userBoard[row][col] = number;
            } else {
                fixedCells[row][col] = false;
                userBoard[row][col] = 0;
            }
        }
    }
}

// 生成数独谜题
function generateSudoku() {
    // 生成完整解决方案
    generateSolution(solutionBoard);
    
    // 复制解决方案到游戏棋盘
    copyBoard(solutionBoard, gameBoard);
    
    // 根据难度移除数字
    removeNumbers();
}

// 生成数独解决方案
function generateSolution(board) {
    // 清空棋盘
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            board[row][col] = 0;
        }
    }
    
    // 使用回溯法填充棋盘
    solveSudoku(board);
}

// 数独求解器（回溯法）
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                // 尝试填入1-9
                const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (const num of numbers) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        
                        if (solveSudoku(board)) {
                            return true;
                        }
                        
                        board[row][col] = 0; // 回溯
                    }
                }
                return false; // 无法填入任何数字
            }
        }
    }
    return true; // 所有单元格都已填满
}

// 检查数字放置是否有效
function isValidPlacement(board, row, col, num) {
    // 检查行
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === num) return false;
    }
    
    // 检查列
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) return false;
    }
    
    // 检查3x3宫格
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[boxRow + r][boxCol + c] === num) return false;
        }
    }
    
    return true;
}

// 随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 复制棋盘
function copyBoard(source, target) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            target[row][col] = source[row][col];
        }
    }
}

// 根据难度移除数字
function removeNumbers() {
    let cellsToRemove;
    
    switch (currentDifficulty) {
        case 'easy':
            cellsToRemove = 40; // 保留41个数字
            break;
        case 'medium':
            cellsToRemove = 50; // 保留31个数字
            break;
        case 'hard':
            cellsToRemove = 55; // 保留26个数字
            break;
        case 'expert':
            cellsToRemove = 60; // 保留21个数字
            break;
        default:
            cellsToRemove = 40;
    }
    
    // 随机移除数字
    let removed = 0;
    while (removed < cellsToRemove) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        if (gameBoard[row][col] !== 0) {
            gameBoard[row][col] = 0;
            removed++;
        }
    }
}

// 开始计时器
function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimer, 1000);
}

// 更新计时器
function updateTimer() {
    elapsedTime = Date.now() - startTime;
    updateTimerDisplay();
}

// 更新计时器显示
function updateTimerDisplay() {
    const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    
    timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 停止计时器
function stopTimer() {
    clearInterval(timerInterval);
}



// 结束游戏
function endGame(isWin) {
    // 停止计时器
    stopTimer();
    
    // 设置游戏为非活动状态
    isGameActive = false;
    
    // 清除选中状态
    clearSelection();
    
    // 更新按钮状态
    startBtn.disabled = false;
    undoBtn.disabled = true;
    
    // 显示相应的弹窗
    if (isWin) {
        winTimeElement.textContent = timerElement.textContent;
        gameWinModal.classList.remove('hidden');
        
        // 播放胜利音效
        playWinSound();
        
        // 显示烟花效果
        showFireworks();
    } else {
        gameOverModal.classList.remove('hidden');
    }
}

// 播放胜利音效
function playWinSound() {
    try {
        winSound.play();
    } catch (e) {
        console.log('无法播放音效:', e);
    }
}

// 显示烟花效果
function showFireworks() {
    fireworksContainer.innerHTML = '';
    
    // 创建20个烟花
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createFirework();
        }, i * 200);
    }
}

// 创建单个烟花
function createFirework() {
    const firework = document.createElement('div');
    firework.classList.add('firework');
    
    // 随机位置
    const x = Math.random() * 100;
    const y = Math.random() * 60 + 10; // 10% - 70%
    
    firework.style.left = `${x}%`;
    firework.style.top = `${y}%`;
    
    // 随机颜色
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#f0f', '#0ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    firework.style.backgroundColor = color;
    
    fireworksContainer.appendChild(firework);
    
    // 爆炸动画
    setTimeout(() => {
        firework.style.animation = 'firework-explosion 1s ease-out forwards';
        
        // 创建爆炸粒子
        createFireworkParticles(x, y, color);
    }, 500);
    
    // 移除烟花元素
    setTimeout(() => {
        firework.remove();
    }, 1500);
}

// 创建烟花粒子
function createFireworkParticles(x, y, color) {
    const particleCount = 10;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('firework');
        particle.style.backgroundColor = color;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        
        // 随机方向和距离
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 10 + 5;
        const finalX = x + Math.cos(angle) * distance;
        const finalY = y + Math.sin(angle) * distance;
        
        // 设置动画
        particle.style.transition = `all 1s ease-out`;
        
        fireworksContainer.appendChild(particle);
        
        // 触发动画
        setTimeout(() => {
            particle.style.left = `${finalX}%`;
            particle.style.top = `${finalY}%`;
            particle.style.opacity = '0';
        }, 10);
        
        // 移除粒子元素
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}



// 开始新游戏
function startNewGame() {
    gameWinModal.classList.add('hidden');
    startGame();
}

// 处理难度变更
function handleDifficultyChange(event) {
    // 更新选中状态
    difficultyBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 更新当前难度
    currentDifficulty = event.target.dataset.difficulty;
    
    // 如果游戏正在进行，重新开始游戏
    if (isGameActive) {
        startGame();
    }
}

// 切换主题
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 更新图标
    const icon = themeToggle.querySelector('i');
    if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // 保存主题偏好
    localStorage.setItem('theme', newTheme);
}

// 检查主题偏好
function checkThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // 更新图标
    const icon = themeToggle.querySelector('i');
    if (initialTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

/* ========== 语言切换 ========== */
const langSwitch = document.getElementById('lang-switch');
// 根据当前页面文件名回显选中项
const curPage = location.pathname.split('/').pop();
langSwitch.value = curPage === 'en.html' ? 'en.html' : 'index.html';

langSwitch.addEventListener('change', () => {
  location.href = langSwitch.value;   // 跳转对应语言页
});

// 初始化游戏
window.addEventListener('DOMContentLoaded', initGame);