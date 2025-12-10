class Minesweeper {
  constructor() {
    this.board = [];
    this.mines = [];
    this.flags = [];
    this.revealed = [];
    this.gameBoard = document.getElementById('game-board');
    this.minesLeftElement = document.getElementById('mines-left');
    this.timerElement = document.getElementById('time');
    this.gameStatusElement = document.getElementById('game-status');
    this.restartBtn = document.getElementById('restart-btn');
    this.themeToggle = document.getElementById('theme-toggle');
    this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
    
    // 游戏状态
    this.gameStarted = false;
    this.gameOver = false;
    this.victory = false;
    this.timer = 0;
    this.timerInterval = null;
    
    // 难度设置
    this.difficulties = {
      easy: { rows: 9, cols: 9, mines: 10 },
      medium: { rows: 16, cols: 16, mines: 40 },
      hard: { rows: 16, cols: 30, mines: 99 }
    };
    
    this.currentDifficulty = 'easy';
    this.settings = this.difficulties[this.currentDifficulty];
    
    // 初始化游戏
    this.init();
    
    // 设置语言切换
    this.setupLanguageSwitch();
  }
  
  // 初始化游戏
  init() {
    this.setupEventListeners();
    this.createBoard();
    this.updateMinesCounter();
    this.loadTheme();
  }
  
  // 设置事件监听器
  setupEventListeners() {
    // 重新开始按钮
    this.restartBtn.addEventListener('click', () => this.restartGame());
    
    // 主题切换
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    
    // 难度按钮
    this.difficultyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const difficulty = e.target.dataset.difficulty;
        this.changeDifficulty(difficulty);
      });
    });
  }
  
  // 创建游戏板
  createBoard() {
    this.board = [];
    this.mines = [];
    this.flags = [];
    this.revealed = [];
    
    // 清空游戏板
    this.gameBoard.innerHTML = '';
    
    // 设置网格
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.settings.cols}, 1fr)`;
    this.gameBoard.style.gridTemplateRows = `repeat(${this.settings.rows}, 1fr)`;
    
    // 创建格子
    for (let row = 0; row < this.settings.rows; row++) {
      this.board[row] = [];
      this.revealed[row] = [];
      this.flags[row] = [];
      
      for (let col = 0; col < this.settings.cols; col++) {
        this.board[row][col] = 0;
        this.revealed[row][col] = false;
        this.flags[row][col] = false;
        
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        // 添加事件监听器
        cell.addEventListener('click', (e) => this.handleCellClick(e));
        cell.addEventListener('contextmenu', (e) => this.handleCellRightClick(e));
        cell.addEventListener('dblclick', (e) => this.handleCellDoubleClick(e));
        
        this.gameBoard.appendChild(cell);
      }
    }
  }
  
  // 生成地雷
  generateMines(firstClickRow, firstClickCol) {
    let minesPlaced = 0;
    
    // 确保第一次点击不是地雷
    const safeZone = this.getAdjacentCells(firstClickRow, firstClickCol);
    safeZone.push({ row: firstClickRow, col: firstClickCol });
    
    while (minesPlaced < this.settings.mines) {
      const row = Math.floor(Math.random() * this.settings.rows);
      const col = Math.floor(Math.random() * this.settings.cols);
      
      // 检查是否已经是地雷或在安全区域内
      const isSafeZone = safeZone.some(cell => cell.row === row && cell.col === col);
      if (!this.isMine(row, col) && !isSafeZone) {
        this.mines.push({ row, col });
        minesPlaced++;
      }
    }
    
    // 更新周围格子的数字
    this.updateNumbers();
  }
  
  // 更新周围格子的数字
  updateNumbers() {
    for (const mine of this.mines) {
      const adjacentCells = this.getAdjacentCells(mine.row, mine.col);
      
      for (const cell of adjacentCells) {
        if (this.isValidCell(cell.row, cell.col)) {
          this.board[cell.row][cell.col]++;
        }
      }
    }
  }
  
  // 获取相邻格子
  getAdjacentCells(row, col) {
    const cells = [];
    
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r !== row || c !== col) {
          cells.push({ row: r, col: c });
        }
      }
    }
    
    return cells;
  }
  
  // 检查是否是有效的格子
  isValidCell(row, col) {
    return row >= 0 && row < this.settings.rows && col >= 0 && col < this.settings.cols;
  }
  
  // 检查是否是地雷
  isMine(row, col) {
    return this.mines.some(mine => mine.row === row && mine.col === col);
  }
  
  // 处理格子点击
  handleCellClick(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // 如果游戏已结束或格子已揭示或已标记，则不处理
    if (this.gameOver || this.revealed[row][col] || this.flags[row][col]) {
      return;
    }
    
    // 如果是第一次点击，生成地雷并开始计时
    if (!this.gameStarted) {
      this.generateMines(row, col);
      this.startTimer();
      this.gameStarted = true;
    }
    
    // 揭示格子
    this.revealCell(row, col);
    
    // 检查游戏状态
    this.checkGameStatus();
  }
  
  // 处理格子右键点击
  handleCellRightClick(e) {
    e.preventDefault();
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // 如果游戏已结束或格子已揭示，则不处理
    if (this.gameOver || this.revealed[row][col]) {
      return;
    }
    
    // 如果是第一次点击，开始游戏但不生成地雷
    if (!this.gameStarted) {
      this.startTimer();
      this.gameStarted = true;
    }
    
    // 切换标记状态
    this.toggleFlag(row, col);
  }
  
  // 处理格子双击
  handleCellDoubleClick(e) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // 如果游戏已结束或格子未揭示或格子是空白，则不处理
    if (this.gameOver || !this.revealed[row][col] || this.board[row][col] === 0) {
      return;
    }
    
    // 获取周围的格子
    const adjacentCells = this.getAdjacentCells(row, col);
    
    // 计算周围已标记的格子数量
    let flaggedCount = 0;
    for (const cell of adjacentCells) {
      if (this.isValidCell(cell.row, cell.col) && this.flags[cell.row][cell.col]) {
        flaggedCount++;
      }
    }
    
    // 如果标记数量与数字相同，揭示周围未标记的格子
    if (flaggedCount === this.board[row][col]) {
      for (const cell of adjacentCells) {
        if (this.isValidCell(cell.row, cell.col) && !this.revealed[cell.row][cell.col] && !this.flags[cell.row][cell.col]) {
          this.revealCell(cell.row, cell.col);
        }
      }
      
      // 检查游戏状态
      this.checkGameStatus();
    }
  }
  
  // 揭示格子
  revealCell(row, col) {
    // 如果格子已揭示或已标记，则不处理
    if (this.revealed[row][col] || this.flags[row][col]) {
      return;
    }
    
    // 标记为已揭示
    this.revealed[row][col] = true;
    
    // 获取格子元素
    const cellElement = this.getCellElement(row, col);
    cellElement.classList.add('revealed');
    
    // 如果是地雷，显示地雷
    if (this.isMine(row, col)) {
      cellElement.classList.add('mine', 'hit');
      cellElement.innerHTML = '<i class="fas fa-bomb"></i>';
      return;
    }
    
    // 如果是数字，显示数字
    if (this.board[row][col] > 0) {
      cellElement.textContent = this.board[row][col];
      cellElement.classList.add(`number-${this.board[row][col]}`);
      return;
    }
    
    // 如果是空白，递归揭示周围的格子
    const adjacentCells = this.getAdjacentCells(row, col);
    for (const cell of adjacentCells) {
      if (this.isValidCell(cell.row, cell.col) && !this.revealed[cell.row][cell.col]) {
        setTimeout(() => this.revealCell(cell.row, cell.col), 10);
      }
    }
  }
  
  // 切换标记状态
  toggleFlag(row, col) {
    this.flags[row][col] = !this.flags[row][col];
    
    const cellElement = this.getCellElement(row, col);
    
    if (this.flags[row][col]) {
      cellElement.classList.add('flagged');
      cellElement.innerHTML = '<i class="fas fa-flag"></i>';
    } else {
      cellElement.classList.remove('flagged');
      cellElement.innerHTML = '';
    }
    
    // 更新地雷计数器
    this.updateMinesCounter();
  }
  
  // 获取格子元素
  getCellElement(row, col) {
    return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  }
  
  // 更新地雷计数器
  updateMinesCounter() {
    let flaggedCount = 0;
    
    for (let row = 0; row < this.settings.rows; row++) {
      for (let col = 0; col < this.settings.cols; col++) {
        if (this.flags[row][col]) {
          flaggedCount++;
        }
      }
    }
    
    const minesLeft = this.settings.mines - flaggedCount;
    this.minesLeftElement.textContent = minesLeft;
  }
  
  // 开始计时器
  startTimer() {
    this.timer = 0;
    this.timerInterval = setInterval(() => {
      this.timer++;
      this.timerElement.textContent = this.timer;
    }, 1000);
  }
  
  // 停止计时器
  stopTimer() {
    clearInterval(this.timerInterval);
  }
  
  // 检查游戏状态
  checkGameStatus() {
    // 检查是否点击了地雷
    for (let row = 0; row < this.settings.rows; row++) {
      for (let col = 0; col < this.settings.cols; col++) {
        if (this.revealed[row][col] && this.isMine(row, col)) {
          this.gameOver = true;
          this.victory = false;
          this.stopTimer();
          this.revealAllMines();
          this.showGameStatus('Game Over!', 'lose');
          return;
        }
      }
    }
    
    // 检查是否揭示了所有非地雷格子
    let revealedCount = 0;
    const totalCells = this.settings.rows * this.settings.cols;
    
    for (let row = 0; row < this.settings.rows; row++) {
      for (let col = 0; col < this.settings.cols; col++) {
        if (this.revealed[row][col]) {
          revealedCount++;
        }
      }
    }
    
    if (revealedCount === totalCells - this.settings.mines) {
      this.gameOver = true;
      this.victory = true;
      this.stopTimer();
      this.flagAllMines();
      this.showGameStatus('You won!', 'win');
    }
  }
  
  // 揭示所有地雷
  revealAllMines() {
    for (const mine of this.mines) {
      const cellElement = this.getCellElement(mine.row, mine.col);
      
      // 如果地雷未被标记，显示地雷
      if (!this.flags[mine.row][mine.col]) {
        cellElement.classList.add('revealed', 'mine');
        cellElement.innerHTML = '<i class="fas fa-bomb"></i>';
      }
    }
    
    // 显示错误标记
    for (let row = 0; row < this.settings.rows; row++) {
      for (let col = 0; col < this.settings.cols; col++) {
        if (this.flags[row][col] && !this.isMine(row, col)) {
          const cellElement = this.getCellElement(row, col);
          cellElement.classList.add('revealed');
          cellElement.innerHTML = '<i class="fas fa-times"></i>';
        }
      }
    }
  }
  
  // 标记所有地雷
  flagAllMines() {
    for (const mine of this.mines) {
      if (!this.flags[mine.row][mine.col]) {
        this.flags[mine.row][mine.col] = true;
        const cellElement = this.getCellElement(mine.row, mine.col);
        cellElement.classList.add('flagged');
        cellElement.innerHTML = '<i class="fas fa-flag"></i>';
      }
    }
  }
  
  // 显示游戏状态
  showGameStatus(message, type) {
    this.gameStatusElement.textContent = message;
    this.gameStatusElement.classList.remove('hidden', 'win', 'lose');
    this.gameStatusElement.classList.add(type);
    
    // 如果是胜利，添加烟花特效
    if (type === 'win') {
      this.createFireworks();
    }
  }
  
  // 创建烟花特效
  createFireworks() {
    // 创建烟花容器
    const fireworksContainer = document.createElement('div');
    fireworksContainer.id = 'fireworks-container';
    fireworksContainer.style.position = 'fixed';
    fireworksContainer.style.top = '0';
    fireworksContainer.style.left = '0';
    fireworksContainer.style.width = '100%';
    fireworksContainer.style.height = '100%';
    fireworksContainer.style.pointerEvents = 'none';
    fireworksContainer.style.zIndex = '1000';
    document.body.appendChild(fireworksContainer);
    
    // 创建多个烟花
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.createFirework(fireworksContainer);
      }, i * 300);
    }
    
    // 5秒后移除烟花容器
    setTimeout(() => {
      document.body.removeChild(fireworksContainer);
    }, 5000);
  }
  
  // 创建单个烟花
  createFirework(container) {
    // 随机位置
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight;
    const endX = startX + (Math.random() * 200 - 100);
    const endY = Math.random() * window.innerHeight * 0.7;
    
    // 创建烟花轨迹
    const rocket = document.createElement('div');
    rocket.style.position = 'absolute';
    rocket.style.width = '4px';
    rocket.style.height = '4px';
    rocket.style.backgroundColor = '#fff';
    rocket.style.borderRadius = '50%';
    rocket.style.left = `${startX}px`;
    rocket.style.top = `${startY}px`;
    rocket.style.boxShadow = '0 0 6px 2px rgba(255, 255, 255, 0.8)';
    container.appendChild(rocket);
    
    // 动画：火箭上升
    let progress = 0;
    const duration = 500 + Math.random() * 500;
    const interval = 10;
    const steps = duration / interval;
    
    const animateRocket = () => {
      progress += 1 / steps;
      
      if (progress >= 1) {
        // 火箭到达目标位置，爆炸成火花
        this.createExplosion(container, endX, endY);
        container.removeChild(rocket);
        return;
      }
      
      // 计算当前位置
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      // 更新位置
      rocket.style.left = `${x}px`;
      rocket.style.top = `${y}px`;
      
      // 继续动画
      setTimeout(animateRocket, interval);
    };
    
    // 开始动画
    animateRocket();
  }
  
  // 创建爆炸效果
  createExplosion(container, x, y) {
    // 爆炸粒子数量
    const particleCount = 50;
    
    // 颜色选项
    const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00', '#00f'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      // 随机角度和速度
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      const size = 2 + Math.random() * 3;
      
      // 创建粒子元素
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.borderRadius = '50%';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.boxShadow = `0 0 ${size * 2}px ${size}px ${color}`;
      container.appendChild(particle);
      
      // 动画：粒子扩散
      let progress = 0;
      const duration = 500 + Math.random() * 500;
      const interval = 10;
      const steps = duration / interval;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      
      const animateParticle = () => {
        progress += 1 / steps;
        
        if (progress >= 1) {
          // 粒子消失
          container.removeChild(particle);
          return;
        }
        
        // 计算当前位置
        const currentX = x + vx * progress * 50;
        const currentY = y + vy * progress * 50;
        
        // 更新位置和透明度
        particle.style.left = `${currentX}px`;
        particle.style.top = `${currentY}px`;
        particle.style.opacity = 1 - progress;
        
        // 继续动画
        setTimeout(animateParticle, interval);
      };
      
      // 开始动画
      animateParticle();
    }
  }
  
  // 重新开始游戏
  restartGame() {
    this.gameStarted = false;
    this.gameOver = false;
    this.victory = false;
    this.stopTimer();
    this.timer = 0;
    this.timerElement.textContent = '0';
    this.gameStatusElement.classList.add('hidden');
    this.createBoard();
    this.updateMinesCounter();
  }
  
  // 切换主题
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 更新主题切换按钮图标
    this.themeToggle.innerHTML = newTheme === 'dark' 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
  }
  
  // 加载主题
  loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // 更新主题切换按钮图标
    this.themeToggle.innerHTML = savedTheme === 'dark' 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
  }
  
  // 设置语言切换
  setupLanguageSwitch() {
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        window.location.href = selectedLanguage;
      });
    }
  }
  
  // 更改难度
  changeDifficulty(difficulty) {
    if (this.difficulties[difficulty]) {
      this.currentDifficulty = difficulty;
      this.settings = this.difficulties[difficulty];
      
      // 更新难度按钮状态
      this.difficultyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === difficulty) {
          btn.classList.add('active');
        }
      });
      
      // 重新开始游戏
      this.restartGame();
    }
  }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
  new Minesweeper();
});
