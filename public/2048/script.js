/**
 * 2048游戏核心逻辑
 * 彻底重写，采用标准2048算法实现
 */

// 游戏配置
const config = {
  gridSize: 4, // 4x4网格
  winningValue: 2048, // 获胜条件
  startTiles: 2, // 初始方块数量
  newTileValue: [2, 4], // 新生成方块的可能值
  newTileValueProbability: [0.9, 0.1] // 生成2和4的概率
};

// 游戏状态
let gameState = {
  grid: [], // 游戏网格
  score: 0, // 当前分数
  bestScore: 0, // 最高分
  over: false, // 游戏是否结束
  won: false, // 游戏是否获胜
  paused: false // 游戏是否暂停
};

// DOM元素
let elements = {
  gridContainer: null,
  scoreDisplay: null,
  bestScoreDisplay: null,
  gameMessage: null,
  gameMessageText: null,
  gameMessageSubtext: null,
  restartButton: null,
  pauseButton: null
};

// 方向键映射
const keyCodes = {
  UP: [38, 87], // 上箭头或W键
  RIGHT: [39, 68], // 右箭头或D键
  DOWN: [40, 83], // 下箭头或S键
  LEFT: [37, 65] // 左箭头或A键
};

// 滑动方向
const directions = {
  0: { x: 0, y: -1 }, // 上
  1: { x: 1, y: 0 },  // 右
  2: { x: 0, y: 1 },  // 下
  3: { x: -1, y: 0 }  // 左
};

// 触摸事件相关变量
let touchStartX, touchStartY, touchEndX, touchEndY;

// 动画相关变量
let animating = false;

/**
 * 初始化游戏
 */
function initGame() {
  // 获取DOM元素
  elements.gridContainer = document.querySelector('.game-grid');
  elements.scoreDisplay = document.querySelector('.score-value');
  elements.bestScoreDisplay = document.querySelector('.best-score-value');
  elements.gameMessage = document.querySelector('.game-message');
  elements.gameMessageText = elements.gameMessage.querySelector('h2');
  elements.gameMessageSubtext = elements.gameMessage.querySelector('p');
  elements.restartButton = document.querySelector('.restart-button');
  elements.pauseButton = document.querySelector('.pause-button');

  // 加载最高分
  loadBestScore();
  
  // 初始化网格
  setupGrid();
  
  // 开始新游戏
  newGame();
  
  // 添加事件监听器
  setupEventListeners();
}

/**
 * 设置游戏网格
 */
function setupGrid() {
  // 清空网格容器
  elements.gridContainer.innerHTML = '';
  
  // 创建网格单元格
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize; x++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.x = x;
      cell.dataset.y = y;
      elements.gridContainer.appendChild(cell);
    }
  }
}

/**
 * 开始新游戏
 */
function newGame() {
  // 重置游戏状态
  gameState.grid = [];
  gameState.score = 0;
  gameState.over = false;
  gameState.won = false;
  gameState.paused = false;
  
  // 更新分数显示
  updateScoreDisplay();
  
  // 初始化空网格
  for (let y = 0; y < config.gridSize; y++) {
    gameState.grid[y] = [];
    for (let x = 0; x < config.gridSize; x++) {
      gameState.grid[y][x] = 0;
    }
  }
  
  // 移除所有方块
  removeAllTiles();
  
  // 添加初始方块
  for (let i = 0; i < config.startTiles; i++) {
    addRandomTile();
  }
  
  // 隐藏游戏消息
  hideGameMessage();
  
  // 更新按钮状态
  updateButtonStates();
}

/**
 * 添加随机方块
 */
function addRandomTile() {
  // 获取所有空单元格
  const emptyCells = [];
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize; x++) {
      if (gameState.grid[y][x] === 0) {
        emptyCells.push({ x, y });
      }
    }
  }
  
  // 如果有空单元格，随机选择一个添加方块
  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < config.newTileValueProbability[0] ? 
                  config.newTileValue[0] : config.newTileValue[1];
    
    gameState.grid[randomCell.y][randomCell.x] = value;
    renderTile(randomCell.x, randomCell.y, value, true);
  }
}

/**
 * 渲染方块
 * @param {number} x - 方块的X坐标
 * @param {number} y - 方块的Y坐标
 * @param {number} value - 方块的值
 * @param {boolean} isNew - 是否是新方块
 * @param {Object} fromPosition - 起始位置（用于动画）
 */
function renderTile(x, y, value, isNew = false, fromPosition = null) {
  // 移除该位置已有的方块
  removeTile(x, y);
  
  // 创建新方块
  const tile = document.createElement('div');
  tile.className = `tile tile-${value} ${isNew ? 'tile-new' : ''}`;
  tile.dataset.x = x;
  tile.dataset.y = y;
  tile.textContent = value;
  
  // 计算方块位置
  const size = (100 / config.gridSize) - (100 / config.gridSize / 10);
  const margin = (100 / config.gridSize) / 20;
  
  tile.style.width = `${size}%`;
  tile.style.height = `${size}%`;
  
  // 如果提供了起始位置，设置初始位置并添加动画
  if (fromPosition) {
    // 先设置为起始位置（无过渡）
    tile.style.transition = 'none';
    tile.style.left = `${fromPosition.x * (size + margin * 2) + margin}%`;
    tile.style.top = `${fromPosition.y * (size + margin * 2) + margin}%`;
    
    // 添加到容器
    elements.gridContainer.appendChild(tile);
    
    // 强制重绘
    tile.offsetHeight;
    
    // 设置目标位置并添加过渡动画
    tile.style.transition = 'left 0.15s ease, top 0.15s ease';
    tile.style.left = `${x * (size + margin * 2) + margin}%`;
    tile.style.top = `${y * (size + margin * 2) + margin}%`;
  } else {
    // 直接设置为目标位置
    tile.style.left = `${x * (size + margin * 2) + margin}%`;
    tile.style.top = `${y * (size + margin * 2) + margin}%`;
    
    // 添加到网格容器
    elements.gridContainer.appendChild(tile);
  }
}

/**
 * 移除方块
 * @param {number} x - 方块的X坐标
 * @param {number} y - 方块的Y坐标
 */
function removeTile(x, y) {
  const tile = document.querySelector(`.tile[data-x="${x}"][data-y="${y}"]`);
  if (tile) {
    tile.remove();
  }
}

/**
 * 移除所有方块
 */
function removeAllTiles() {
  const tiles = document.querySelectorAll('.tile');
  tiles.forEach(tile => tile.remove());
}



/**
 * 暂停/继续游戏
 */
function togglePause() {
  if (gameState.over || gameState.won) return;
  
  gameState.paused = !gameState.paused;
  
  if (gameState.paused) {
    showGameMessage(gameStrings.gamePaused, gameStrings.gamePausedMessage);
    elements.pauseButton.textContent = gameStrings.continue;
  } else {
    hideGameMessage();
    elements.pauseButton.textContent = gameStrings.pause;
  }
}

/**
 * 移动方块 - 支持动画效果的版本
 * @param {number} direction - 移动方向 (0: 上, 1: 右, 2: 下, 3: 左)
 * @returns {boolean} 是否有方块移动
 */
function move(direction) {
  // 如果游戏结束、获胜、暂停或正在动画中，不执行移动
  if (gameState.over || gameState.won || gameState.paused || animating) return false;
  
  // 创建新的网格状态
  const newGrid = [];
  for (let y = 0; y < config.gridSize; y++) {
    newGrid[y] = [];
    for (let x = 0; x < config.gridSize; x++) {
      newGrid[y][x] = gameState.grid[y][x];
    }
  }
  
  // 标记是否有方块移动
  let moved = false;
  
  // 记录移动信息用于动画
  const moveInfo = {
    movedTiles: [],
    mergedTiles: []
  };
  
  // 根据方向执行不同的移动逻辑
  switch (direction) {
    case 0: // 上
      moved = moveUpWithAnimation(newGrid, moveInfo);
      break;
    case 1: // 右
      moved = moveRightWithAnimation(newGrid, moveInfo);
      break;
    case 2: // 下
      moved = moveDownWithAnimation(newGrid, moveInfo);
      break;
    case 3: // 左
      moved = moveLeftWithAnimation(newGrid, moveInfo);
      break;
  }
  
  // 如果有方块移动
  if (moved) {
    // 设置动画状态
    animating = true;
    
    // 播放移动动画
    playMoveAnimation(moveInfo, () => {
      // 动画完成后更新状态
      gameState.grid = newGrid;
      
      // 更新分数显示
      updateScoreDisplay();
      
      // 重新渲染游戏（确保所有方块都在正确位置）
      renderGrid();
      
      // 检查是否获胜
      checkForWin();
      
      // 添加新方块
      setTimeout(() => {
        addRandomTile();
        
        // 检查游戏是否结束
        if (!movesAvailable()) {
          gameOver();
        }
        
        // 重置动画状态
        animating = false;
      }, 100);
    });
  }
  
  return moved;
}

/**
 * 播放移动动画
 * @param {Object} moveInfo - 移动信息
 * @param {Function} callback - 动画完成后的回调函数
 */
function playMoveAnimation(moveInfo, callback) {
  // 播放移动动画
  moveInfo.movedTiles.forEach(tileInfo => {
    const tile = document.querySelector(`.tile[data-x="${tileInfo.from.x}"][data-y="${tileInfo.from.y}"]`);
    if (tile) {
      // 设置更平滑的动画
      tile.style.transition = 'left 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      
      // 计算目标位置
      const size = (100 / config.gridSize) - (100 / config.gridSize / 10);
      const margin = (100 / config.gridSize) / 20;
      tile.style.left = `${tileInfo.to.x * (size + margin * 2) + margin}%`;
      tile.style.top = `${tileInfo.to.y * (size + margin * 2) + margin}%`;
      
      // 更新数据属性
      tile.dataset.x = tileInfo.to.x;
      tile.dataset.y = tileInfo.to.y;
    }
  });
  
  // 播放合并动画
  moveInfo.mergedTiles.forEach(tileInfo => {
    const targetTile = document.querySelector(`.tile[data-x="${tileInfo.to.x}"][data-y="${tileInfo.to.y}"]`);
    if (targetTile) {
      // 添加合并动画类
      targetTile.classList.add('tile-merged');
      targetTile.textContent = tileInfo.newValue;
    }
  });
  
  // 等待动画完成
  setTimeout(() => {
    // 移除合并动画类
    document.querySelectorAll('.tile-merged').forEach(tile => {
      tile.classList.remove('tile-merged');
    });
    
    // 执行回调
    if (callback) callback();
  }, 200);
}

/**
 * 向上移动（支持动画）
 * @param {Array} grid - 游戏网格
 * @param {Object} moveInfo - 移动信息对象
 * @returns {boolean} 是否有方块移动
 */
function moveUpWithAnimation(grid, moveInfo) {
  let moved = false;
  
  for (let x = 0; x < config.gridSize; x++) {
    for (let y = 1; y < config.gridSize; y++) {
      if (grid[y][x] !== 0) {
        let newY = y;
        const originalY = y;
        const originalValue = grid[y][x];
        
        // 移动到最远的空位
        while (newY > 0 && grid[newY - 1][x] === 0) {
          newY--;
        }
        
        // 检查是否可以合并
        if (newY > 0 && grid[newY - 1][x] === grid[y][x]) {
          // 记录合并信息
          moveInfo.mergedTiles.push({
            from: { x, y },
            to: { x, y: newY - 1 },
            newValue: grid[y][x] * 2
          });
          
          // 合并方块
          grid[newY - 1][x] *= 2;
          gameState.score += grid[newY - 1][x];
          grid[y][x] = 0;
          moved = true;
        } 
        // 移动到空位
        else if (newY !== y) {
          // 记录移动信息
          moveInfo.movedTiles.push({
            from: { x, y: originalY },
            to: { x, y: newY },
            value: originalValue
          });
          
          grid[newY][x] = grid[y][x];
          grid[y][x] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

/**
 * 向右移动（支持动画）
 * @param {Array} grid - 游戏网格
 * @param {Object} moveInfo - 移动信息对象
 * @returns {boolean} 是否有方块移动
 */
function moveRightWithAnimation(grid, moveInfo) {
  let moved = false;
  
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = config.gridSize - 2; x >= 0; x--) {
      if (grid[y][x] !== 0) {
        let newX = x;
        const originalX = x;
        const originalValue = grid[y][x];
        
        // 移动到最远的空位
        while (newX < config.gridSize - 1 && grid[y][newX + 1] === 0) {
          newX++;
        }
        
        // 检查是否可以合并
        if (newX < config.gridSize - 1 && grid[y][newX + 1] === grid[y][x]) {
          // 记录合并信息
          moveInfo.mergedTiles.push({
            from: { x, y },
            to: { x: newX + 1, y },
            newValue: grid[y][x] * 2
          });
          
          // 合并方块
          grid[y][newX + 1] *= 2;
          gameState.score += grid[y][newX + 1];
          grid[y][x] = 0;
          moved = true;
        } 
        // 移动到空位
        else if (newX !== x) {
          // 记录移动信息
          moveInfo.movedTiles.push({
            from: { x: originalX, y },
            to: { x: newX, y },
            value: originalValue
          });
          
          grid[y][newX] = grid[y][x];
          grid[y][x] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

/**
 * 向下移动（支持动画）
 * @param {Array} grid - 游戏网格
 * @param {Object} moveInfo - 移动信息对象
 * @returns {boolean} 是否有方块移动
 */
function moveDownWithAnimation(grid, moveInfo) {
  let moved = false;
  
  for (let x = 0; x < config.gridSize; x++) {
    for (let y = config.gridSize - 2; y >= 0; y--) {
      if (grid[y][x] !== 0) {
        let newY = y;
        const originalY = y;
        const originalValue = grid[y][x];
        
        // 移动到最远的空位
        while (newY < config.gridSize - 1 && grid[newY + 1][x] === 0) {
          newY++;
        }
        
        // 检查是否可以合并
        if (newY < config.gridSize - 1 && grid[newY + 1][x] === grid[y][x]) {
          // 记录合并信息
          moveInfo.mergedTiles.push({
            from: { x, y },
            to: { x, y: newY + 1 },
            newValue: grid[y][x] * 2
          });
          
          // 合并方块
          grid[newY + 1][x] *= 2;
          gameState.score += grid[newY + 1][x];
          grid[y][x] = 0;
          moved = true;
        } 
        // 移动到空位
        else if (newY !== y) {
          // 记录移动信息
          moveInfo.movedTiles.push({
            from: { x, y: originalY },
            to: { x, y: newY },
            value: originalValue
          });
          
          grid[newY][x] = grid[y][x];
          grid[y][x] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

/**
 * 向左移动（支持动画）
 * @param {Array} grid - 游戏网格
 * @param {Object} moveInfo - 移动信息对象
 * @returns {boolean} 是否有方块移动
 */
function moveLeftWithAnimation(grid, moveInfo) {
  let moved = false;
  
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 1; x < config.gridSize; x++) {
      if (grid[y][x] !== 0) {
        let newX = x;
        const originalX = x;
        const originalValue = grid[y][x];
        
        // 移动到最远的空位
        while (newX > 0 && grid[y][newX - 1] === 0) {
          newX--;
        }
        
        // 检查是否可以合并
        if (newX > 0 && grid[y][newX - 1] === grid[y][x]) {
          // 记录合并信息
          moveInfo.mergedTiles.push({
            from: { x, y },
            to: { x: newX - 1, y },
            newValue: grid[y][x] * 2
          });
          
          // 合并方块
          grid[y][newX - 1] *= 2;
          gameState.score += grid[y][newX - 1];
          grid[y][x] = 0;
          moved = true;
        } 
        // 移动到空位
        else if (newX !== x) {
          // 记录移动信息
          moveInfo.movedTiles.push({
            from: { x: originalX, y },
            to: { x: newX, y },
            value: originalValue
          });
          
          grid[y][newX] = grid[y][x];
          grid[y][x] = 0;
          moved = true;
        }
      }
    }
  }
  
  return moved;
}

/**
 * 构建遍历顺序
 * @param {Object} vector - 方向向量
 * @returns {Object} 遍历顺序
 */
function buildTraversals(vector) {
  const traversals = { x: [], y: [] };
  
  for (let i = 0; i < config.gridSize; i++) {
    traversals.x.push(i);
    traversals.y.push(i);
  }
  
  // 如果向右或向下移动，需要从相反方向开始遍历
  if (vector.x === 1) traversals.x.reverse();
  if (vector.y === 1) traversals.y.reverse();
  
  return traversals;
}

/**
 * 渲染整个游戏网格
 */
function renderGrid() {
  // 设置动画标志
  animating = true;
  
  // 移除所有方块
  removeAllTiles();
  
  // 重新渲染所有方块
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize; x++) {
      if (gameState.grid[y][x] !== 0) {
        renderTile(x, y, gameState.grid[y][x]);
      }
    }
  }
  
  // 动画完成后重置标志
  setTimeout(() => {
    animating = false;
  }, 100);
}

/**
 * 检查位置是否在网格范围内
 * @param {Object} position - 位置
 * @returns {boolean} 是否在范围内
 */
function withinBounds(position) {
  return position.x >= 0 && position.x < config.gridSize && 
         position.y >= 0 && position.y < config.gridSize;
}

/**
 * 检查是否有可用的移动
 * @returns {boolean} 是否有可用移动
 */
function movesAvailable() {
  // 检查是否有空单元格
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize; x++) {
      if (gameState.grid[y][x] === 0) {
        return true;
      }
    }
  }
  
  // 检查是否有可以合并的相邻方块
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize; x++) {
      const tile = gameState.grid[y][x];
      
      // 检查右侧和下方的方块
      for (let direction = 1; direction <= 2; direction++) {
        const vector = directions[direction];
        const position = { x: x + vector.x, y: y + vector.y };
        
        if (withinBounds(position) && gameState.grid[position.y][position.x] === tile) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * 检查是否获胜
 */
function checkForWin() {
  if (!gameState.won) {
    for (let y = 0; y < config.gridSize; y++) {
      for (let x = 0; x < config.gridSize; x++) {
        if (gameState.grid[y][x] === config.winningValue) {
          gameState.won = true;
          showGameMessage(gameStrings.gameWon, gameStrings.gameWonMessage);
          break;
        }
      }
      if (gameState.won) break;
    }
  }
}

/**
 * 游戏结束
 */
function gameOver() {
  gameState.over = true;
  showGameMessage(gameStrings.gameOver, gameStrings.gameOverMessage);
}

/**
 * 更新分数显示
 */
function updateScoreDisplay() {
  elements.scoreDisplay.textContent = gameState.score;
  
  // 更新最高分
  if (gameState.score > gameState.bestScore) {
    gameState.bestScore = gameState.score;
    saveBestScore();
  }
  
  elements.bestScoreDisplay.textContent = gameState.bestScore;
}

/**
 * 保存最高分到本地存储
 */
function saveBestScore() {
  localStorage.setItem('bestScore', gameState.bestScore);
}

/**
 * 从本地存储加载最高分
 */
function loadBestScore() {
  const savedScore = localStorage.getItem('bestScore');
  if (savedScore) {
    gameState.bestScore = parseInt(savedScore, 10);
  }
}

/**
 * 显示游戏消息
 * @param {string} text - 消息文本
 * @param {string} subtext - 消息副标题
 */
function showGameMessage(text, subtext) {
  elements.gameMessageText.textContent = text;
  elements.gameMessageSubtext.textContent = subtext;
  elements.gameMessage.classList.add('visible');
}

/**
 * 隐藏游戏消息
 */
function hideGameMessage() {
  elements.gameMessage.classList.remove('visible');
}

/**
 * 更新按钮状态
 */
function updateButtonStates() {
  if (gameState.paused) {
    elements.pauseButton.textContent = gameStrings.continue;
  } else {
    elements.pauseButton.textContent = gameStrings.pause;
  }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 键盘事件
  document.addEventListener('keydown', handleKeyDown);
  
  // 触摸事件
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  // 按钮事件
  if (elements.restartButton) {
    elements.restartButton.addEventListener('click', newGame);
  }
  
  if (elements.pauseButton) {
    elements.pauseButton.addEventListener('click', togglePause);
  }
  
  // 窗口大小变化事件
  window.addEventListener('resize', handleResize);
}

/**
 * 处理键盘事件
 * @param {Event} event - 键盘事件
 */
function handleKeyDown(event) {
  if (gameState.over || gameState.won || gameState.paused) return;
  
  let direction = null;
  
  // 检查按下的键是否是方向键
  if (keyCodes.UP.includes(event.keyCode)) {
    direction = 0; // 上
  } else if (keyCodes.RIGHT.includes(event.keyCode)) {
    direction = 1; // 右
  } else if (keyCodes.DOWN.includes(event.keyCode)) {
    direction = 2; // 下
  } else if (keyCodes.LEFT.includes(event.keyCode)) {
    direction = 3; // 左
  }
  
  // 如果是方向键，移动方块
  if (direction !== null) {
    event.preventDefault();
    move(direction);
  }
}

/**
 * 处理触摸开始事件
 * @param {Event} event - 触摸事件
 */
function handleTouchStart(event) {
  if (gameState.over || gameState.won || gameState.paused) return;
  
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

/**
 * 处理触摸移动事件
 * @param {Event} event - 触摸事件
 */
function handleTouchMove(event) {
  if (gameState.over || gameState.won || gameState.paused) return;
  
  // 防止页面滚动
  if (Math.abs(event.touches[0].clientX - touchStartX) > 10 || 
      Math.abs(event.touches[0].clientY - touchStartY) > 10) {
    event.preventDefault();
  }
}

/**
 * 处理触摸结束事件
 * @param {Event} event - 触摸事件
 */
function handleTouchEnd(event) {
  if (gameState.over || gameState.won || gameState.paused || animating) return;
  
  // 如果没有开始坐标，直接返回
  if (touchStartX === undefined || touchStartY === undefined) return;
  
  const touch = event.changedTouches[0];
  touchEndX = touch.clientX;
  touchEndY = touch.clientY;
  
  // 计算滑动距离
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  
  // 确定滑动方向
  let direction = null;
  
  // 设置最小滑动距离阈值
  const minSwipeDistance = 10;
  
  // 只有当滑动距离足够大时才处理
  if (Math.abs(dx) > minSwipeDistance || Math.abs(dy) > minSwipeDistance) {
    // 水平滑动
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 1 : 3; // 右或左
    } 
    // 垂直滑动
    else {
      direction = dy > 0 ? 2 : 0; // 下或上
    }
    
    // 移动方块
    if (direction !== null) {
      move(direction);
    }
  }
  
  // 重置触摸坐标
  touchStartX = touchStartY = touchEndX = touchEndY = undefined;
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
  // 重新渲染所有方块
  removeAllTiles();
  for (let y = 0; y < config.gridSize; y++) {
    for (let x = 0; x < config.gridSize; x++) {
      if (gameState.grid[y][x] !== 0) {
        renderTile(x, y, gameState.grid[y][x]);
      }
    }
  }
}

/**
 * 主题切换功能
 */
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

/**
 * 加载保存的主题
 */
function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // 默认使用亮色主题
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

/**
 * 语言切换功能
 */
function changeLanguage() {
  const select = document.getElementById('language-select');
  const language = select.value;
  
  if (language) {
    window.location.href = language;
  }
}

/**
 * 初始化主题和语言选择器
 */
function initThemeAndLanguage() {
  // 加载保存的主题
  loadTheme();
  
  // 主题切换按钮事件
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // 语言选择器事件
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.addEventListener('change', changeLanguage);
  }
}

/**
 * 页面加载完成后初始化游戏
 */
document.addEventListener('DOMContentLoaded', function() {
  initThemeAndLanguage();
  initGame();
});