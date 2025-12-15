// 井字棋游戏JavaScript代码

// 游戏状态变量
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = '2player'; // '2player' 或 'computer'
let soundEnabled = true;
let theme = 'light'; // 'light' 或 'dark'

// 获胜组合
const winPatterns = [
  [0, 1, 2], // 第一行
  [3, 4, 5], // 第二行
  [6, 7, 8], // 第三行
  [0, 3, 6], // 第一列
  [1, 4, 7], // 第二列
  [2, 5, 8], // 第三列
  [0, 4, 8], // 对角线
  [2, 4, 6]  // 另一条对角线
];

// DOM元素
const cells = document.querySelectorAll('.cell');
const currentPlayerElement = document.getElementById('current-player');
const gameStatusElement = document.getElementById('game-status');
const restartButton = document.getElementById('restart-btn');
const modeSelect = document.getElementById('mode-select');
const languageSelector = document.getElementById('language-selector');
const themeToggle = document.getElementById('theme-toggle');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');
const moveSound = document.getElementById('move-sound');

// 初始化游戏
function initGame() {
  // 添加事件监听器
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('mouseenter', handleCellHover);
    cell.addEventListener('mouseleave', handleCellLeave);
  });
  
  restartButton.addEventListener('click', restartGame);
  modeSelect.addEventListener('change', changeGameMode);
  languageSelector.addEventListener('change', changeLanguage);
  themeToggle.addEventListener('click', toggleTheme);
  
  // 检查本地存储中的主题设置
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    theme = savedTheme;
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon();
  }
  
  // 检查本地存储中的音效设置
  const savedSound = localStorage.getItem('soundEnabled');
  if (savedSound !== null) {
    soundEnabled = savedSound === 'true';
  }
  
  // 更新UI
  updateGameStatus();
}

// 处理单元格点击
function handleCellClick(event) {
  const cellIndex = parseInt(event.target.getAttribute('data-index'));
  
  // 检查单元格是否已填充或游戏是否已结束
  if (gameBoard[cellIndex] !== '' || !gameActive) {
    return;
  }
  
  // 填充单元格
  makeMove(cellIndex);
  
  // 如果是人机对战模式且游戏仍在进行中，让电脑下棋
  if (gameMode === 'computer' && gameActive) {
    setTimeout(computerMove, 500);
  }
}

// 处理单元格悬停
function handleCellHover(event) {
  const cellIndex = parseInt(event.target.getAttribute('data-index'));
  
  // 只有在单元格为空且游戏活动时才显示预览
  if (gameBoard[cellIndex] === '' && gameActive) {
    event.target.classList.add('preview');
    event.target.textContent = currentPlayer;
    event.target.style.opacity = '0.3';
  }
}

// 处理单元格离开
function handleCellLeave(event) {
  const cellIndex = parseInt(event.target.getAttribute('data-index'));
  
  // 移除预览
  if (gameBoard[cellIndex] === '' && gameActive) {
    event.target.classList.remove('preview');
    event.target.textContent = '';
    event.target.style.opacity = '1';
  }
}

// 执行移动
function makeMove(cellIndex) {
  // 更新游戏板和UI
  gameBoard[cellIndex] = currentPlayer;
  const cell = document.querySelector(`[data-index="${cellIndex}"]`);
  cell.textContent = currentPlayer;
  cell.classList.add('filled', currentPlayer.toLowerCase());
  cell.style.opacity = '1';
  
  // 播放移动音效
  playSound(moveSound);
  
  // 检查游戏状态
  const gameResult = checkGameStatus();
  
  if (gameResult) {
    endGame(gameResult);
  } else {
    // 切换玩家
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateGameStatus();
  }
}

// 电脑移动
function computerMove() {
  // 简单的AI逻辑：
  // 1. 尝试获胜
  // 2. 阻止玩家获胜
  // 3. 随机移动
  
  // 尝试获胜
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === '') {
      gameBoard[i] = currentPlayer;
      if (checkWin(currentPlayer)) {
        makeMove(i);
        return;
      }
      gameBoard[i] = ''; // 撤销移动
    }
  }
  
  // 阻止玩家获胜
  const opponent = currentPlayer === 'X' ? 'O' : 'X';
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === '') {
      gameBoard[i] = opponent;
      if (checkWin(opponent)) {
        gameBoard[i] = ''; // 撤销移动
        makeMove(i);
        return;
      }
      gameBoard[i] = ''; // 撤销移动
    }
  }
  
  // 随机移动
  let availableMoves = [];
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === '') {
      availableMoves.push(i);
    }
  }
  
  if (availableMoves.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    makeMove(availableMoves[randomIndex]);
  }
}

// 检查游戏状态
function checkGameStatus() {
  // 检查是否有玩家获胜
  if (checkWin(currentPlayer)) {
    return { result: 'win', player: currentPlayer };
  }
  
  // 检查是否平局
  if (!gameBoard.includes('')) {
    return { result: 'draw' };
  }
  
  // 游戏继续
  return null;
}

// 检查玩家是否获胜
function checkWin(player) {
  return winPatterns.some(pattern => {
    return pattern.every(index => {
      return gameBoard[index] === player;
    });
  });
}

// 结束游戏
function endGame(result) {
  gameActive = false;
  
  if (result.result === 'win') {
    // 高亮显示获胜的连线
    highlightWinningCells(result.player);
    
    // 更新游戏状态
    const isCurrentLanguageChinese = ['zh-CN', 'zh-TW'].includes(document.documentElement.lang);
    gameStatusElement.textContent = isCurrentLanguageChinese ? 
      `${result.player} 获胜！` : 
      `${result.player} wins!`;
    
    // 播放获胜音效
    playSound(winSound);
  } else {
    // 更新游戏状态
    const isCurrentLanguageChinese = ['zh-CN', 'zh-TW'].includes(document.documentElement.lang);
    gameStatusElement.textContent = isCurrentLanguageChinese ? 
      '平局！' : 
      'It\'s a draw!';
    
    // 播放平局音效
    playSound(drawSound);
  }
}

// 高亮显示获胜的单元格
function highlightWinningCells(player) {
  winPatterns.forEach(pattern => {
    if (pattern.every(index => gameBoard[index] === player)) {
      pattern.forEach(index => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.classList.add('win');
      });
    }
  });
}

// 更新游戏状态UI
function updateGameStatus() {
  // 更新当前玩家显示
  currentPlayerElement.innerHTML = ['zh-CN', 'zh-TW'].includes(document.documentElement.lang) ? 
    `当前玩家: <span class="player-${currentPlayer.toLowerCase()}">${currentPlayer}</span>` : 
    `Current Player: <span class="player-${currentPlayer.toLowerCase()}">${currentPlayer}</span>`;
  
  // 更新游戏状态显示
  if (gameActive) {
    gameStatusElement.textContent = ['zh-CN', 'zh-TW'].includes(document.documentElement.lang) ? 
      '游戏进行中...' : 
      'Game in progress...';
  }
}

// 重新开始游戏
function restartGame() {
  // 重置游戏状态
  gameBoard = ['', '', '', '', '', '', '', '', ''];
  currentPlayer = 'X';
  gameActive = true;
  
  // 重置UI
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('filled', 'x', 'o', 'win', 'preview');
    cell.style.opacity = '1';
  });
  
  // 更新游戏状态显示
  updateGameStatus();
}

// 更改游戏模式
function changeGameMode() {
  gameMode = modeSelect.value;
  restartGame();
}

// 更改语言
function changeLanguage() {
  const selectedLanguage = languageSelector.value;
  // 只有当选择了有效语言选项（非占位符）时才跳转
  if (selectedLanguage) {
    window.location.href = selectedLanguage;
  }
}

// 切换主题
function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon();
}

// 更新主题图标
function updateThemeIcon() {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// 播放音效
function playSound(sound) {
  if (soundEnabled && sound) {
    sound.currentTime = 0;
    sound.play().catch(error => {
      console.log('Error playing sound:', error);
    });
  }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', initGame);