class NumberLinkGame {
    constructor() {
        this.currentScreen = 'welcome';
        this.difficulty = 'easy';
        this.gameBoard = [];
        this.selectedTile = null;
        this.score = 0;
        this.time = 180; // 3分钟倒计时
        this.timer = null;
        this.gameActive = false;
        this.noMovesCounter = 0;
        this.maxNoMoves = 20;
        this.hintUsed = false;
        this.hintCooldown = 0;
        this.hintCount = 0;
        this.maxHints = 3;
        

        
        // 难度配置（所有难度统一3分钟倒计时）
        this.difficultyConfig = {
            easy: { size: 4, maxNumber: 8 },
            medium: { size: 6, maxNumber: 12 },
            hard: { size: 8, maxNumber: 16 }
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.bindEvents();
        this.showScreen('welcome');
    }
    
    bindEvents() {
        // 难度选择按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = e.target.dataset.difficulty;
                this.startGame();
            });
        });
        
        // 游戏控制按钮
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('home-btn').addEventListener('click', () => this.showScreen('welcome'));
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-home-btn').addEventListener('click', () => this.showScreen('welcome'));
        
        // 超时页面按钮
        document.getElementById('timeout-retry-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('timeout-home-btn').addEventListener('click', () => this.showScreen('welcome'));
    }
    
    showScreen(screenName) {
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 显示指定屏幕
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;
        
        // 如果返回主页，重置游戏状态
        if (screenName === 'welcome') {
            this.resetGame();
        }
    }
    
    startGame() {
        this.resetGame();
        this.generateGameBoard();
        this.renderGameBoard();
        this.startTimer();
        this.gameActive = true;
        this.showScreen('game');
    }
    
    resetGame() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.gameBoard = [];
        this.selectedTile = null;
        this.score = 0;
        this.time = 180; // 重置为3分钟倒计时
        this.gameActive = false;
        this.noMovesCounter = 0;
        this.hintUsed = false;
        this.hintCooldown = 0;
        this.hintCount = 0;
        this.clearHintEffect();
        document.getElementById('score').textContent = '0';
        document.getElementById('timer').textContent = '03:00';
        this.updateHintButton();
    }
    
    generateGameBoard() {
        const config = this.difficultyConfig[this.difficulty];
        const totalTiles = config.size * config.size;
        const pairsNeeded = totalTiles / 2;
        
        let validBoard = false;
        let attempts = 0;
        const maxAttempts = 100;
        
        while (!validBoard && attempts < maxAttempts) {
            // 生成数字对
            let numbers = [];
            for (let i = 1; i <= pairsNeeded; i++) {
                const number = (i % config.maxNumber) + 1;
                numbers.push(number, number); // 添加一对相同的数字
            }
            
            // 随机打乱数字
            numbers = this.shuffleArray(numbers);
            
            // 创建游戏板
            this.gameBoard = [];
            for (let row = 0; row < config.size; row++) {
                this.gameBoard[row] = [];
                for (let col = 0; col < config.size; col++) {
                    this.gameBoard[row][col] = {
                        value: numbers[row * config.size + col],
                        row: row,
                        col: col,
                        matched: false
                    };
                }
            }
            
            // 检查是否有可连接的方块
            validBoard = this.hasPossibleMoves();
            attempts++;
        }
        
        // 如果无法生成有效游戏板，重新开始
        if (!validBoard) {
            console.warn('无法生成有效游戏板，重新尝试...');
            this.generateGameBoard();
        }
        
        this.noMovesCounter = 0;
    }
    
    renderGameBoard() {
        const boardElement = document.getElementById('game-board');
        const config = this.difficultyConfig[this.difficulty];
        
        // 检查是否需要完全重建游戏板
        const existingTiles = boardElement.querySelectorAll('.tile');
        const shouldRebuild = existingTiles.length !== config.size * config.size;
        
        if (shouldRebuild) {
            // 清空并设置网格大小
            boardElement.innerHTML = '';
            boardElement.className = `game-board ${this.difficulty}`;
            
            // 创建方块元素
            for (let row = 0; row < config.size; row++) {
                for (let col = 0; col < config.size; col++) {
                    const tile = this.gameBoard[row][col];
                    const tileElement = document.createElement('div');
                    tileElement.className = 'tile';
                    if (tile.matched) {
                        tileElement.classList.add('matched');
                    }
                    tileElement.dataset.row = row;
                    tileElement.dataset.col = col;
                    tileElement.textContent = tile.value;
                    
                    tileElement.addEventListener('click', () => this.handleTileClick(row, col));
                    
                    boardElement.appendChild(tileElement);
                }
            }
        } else {
            // 只更新现有方块的值和状态
            for (let row = 0; row < config.size; row++) {
                for (let col = 0; col < config.size; col++) {
                    const tile = this.gameBoard[row][col];
                    const tileElement = this.getTileElement(row, col);
                    
                    if (tileElement) {
                        tileElement.textContent = tile.value;
                        
                        // 保持已匹配方块的隐藏状态
                        if (tile.matched) {
                            tileElement.classList.add('matched');
                        } else {
                            tileElement.classList.remove('matched', 'selected');
                        }
                    }
                }
            }
        }
    }
    
    handleTileClick(row, col) {
        if (!this.gameActive) return;
        
        const tile = this.gameBoard[row][col];
        
        // 如果方块已匹配，忽略点击
        if (tile.matched) return;
        
        // 获取方块元素
        const tileElement = this.getTileElement(row, col);
        
        // 移除提示效果
        tileElement.classList.remove('hint');
        
        // 如果点击的是已选中的方块，取消选中
        if (this.selectedTile && this.selectedTile.row === row && this.selectedTile.col === col) {
            this.clearSelection();
            return;
        }
        
        // 如果已经选中了一个方块
        if (this.selectedTile) {
            // 检查是否可以连接
            if (this.canConnect(this.selectedTile, tile)) {
                this.matchTiles(this.selectedTile, tile);
                this.noMovesCounter = 0; // 重置计数器
            } else {
                // 取消之前的选中状态
                this.clearSelection();
                // 选中新方块
                this.selectTile(tile);
                // 增加无法连接计数器
                this.noMovesCounter++;
                
                // 检查是否需要重新排列
                if (this.noMovesCounter >= this.maxNoMoves) {
                    this.reshuffleBoard();
                }
            }
        } else {
            // 第一次选中方块
            this.selectTile(tile);
        }
    }
    
    selectTile(tile) {
        this.selectedTile = tile;
        const tileElement = this.getTileElement(tile.row, tile.col);
        tileElement.classList.add('selected');
        // 移除提示效果
        tileElement.classList.remove('hint');
    }
    
    clearSelection() {
        if (this.selectedTile) {
            const tileElement = this.getTileElement(this.selectedTile.row, this.selectedTile.col);
            tileElement.classList.remove('selected');
            this.selectedTile = null;
        }
    }
    
    matchTiles(tile1, tile2) {
        // 创建连线动画
        this.createConnectionAnimation(tile1, tile2);
        
        // 延迟后消除方块
        setTimeout(() => {
            // 标记为已匹配
            tile1.matched = true;
            tile2.matched = true;
            
            // 添加消除动画
            const element1 = this.getTileElement(tile1.row, tile1.col);
            const element2 = this.getTileElement(tile2.row, tile2.col);
            
            // 移除所有效果类
            element1.classList.remove('selected', 'hint');
            element2.classList.remove('selected', 'hint');
            
            // 添加消除动画
            element1.classList.add('matched');
            element2.classList.add('matched');
            
            // 增加分数
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            
            // 清除选中状态
            this.selectedTile = null;
            this.noMovesCounter = 0; // 重置计数器
            
            // 延迟后检查游戏状态
            setTimeout(() => {
                if (this.checkGameComplete()) {
                    this.endGame(true);
                } else {
                    // 检查是否还有可能的移动
                    if (!this.hasPossibleMoves()) {
                        this.reshuffleBoard();
                    }
                }
            }, 500);
        }, 500);
    }
    
    createConnectionAnimation(tile1, tile2) {
        const boardElement = document.getElementById('game-board');
        const element1 = this.getTileElement(tile1.row, tile1.col);
        const element2 = this.getTileElement(tile2.row, tile2.col);
        
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
        const boardRect = boardElement.getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2 - boardRect.left;
        const y1 = rect1.top + rect1.height / 2 - boardRect.top;
        const x2 = rect2.left + rect2.width / 2 - boardRect.left;
        const y2 = rect2.top + rect2.height / 2 - boardRect.top;
        
        // 创建连线元素
        const line = document.createElement('div');
        line.className = 'connection-line';
        
        // 计算连线位置和角度
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.height = '4px';
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transformOrigin = '0 0';
        line.style.transform = `rotate(${angle}deg)`;
        
        boardElement.appendChild(line);
        
        // 移除连线
        setTimeout(() => {
            line.remove();
        }, 500);
    }
    
    canConnect(tile1, tile2) {
        // 数字必须相同
        if (tile1.value !== tile2.value) return false;
        
        // 检查是否可以通过最多三条直线连接
        return this.checkConnection(tile1.row, tile1.col, tile2.row, tile2.col);
    }
    
    checkConnection(row1, col1, row2, col2) {
        // 直接相连（0条折线）
        if (this.isDirectConnection(row1, col1, row2, col2)) {
            return true;
        }
        
        // 一条折线
        if (this.hasOneCorner(row1, col1, row2, col2)) {
            return true;
        }
        
        // 两条折线
        if (this.hasTwoCorners(row1, col1, row2, col2)) {
            return true;
        }
        
        return false;
    }
    
    isDirectConnection(row1, col1, row2, col2) {
        // 同一行
        if (row1 === row2) {
            const minCol = Math.min(col1, col2);
            const maxCol = Math.max(col1, col2);
            for (let col = minCol + 1; col < maxCol; col++) {
                if (!this.isEmpty(row1, col)) {
                    return false;
                }
            }
            return true;
        }
        
        // 同一列
        if (col1 === col2) {
            const minRow = Math.min(row1, row2);
            const maxRow = Math.max(row1, row2);
            for (let row = minRow + 1; row < maxRow; row++) {
                if (!this.isEmpty(row, col1)) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    }
    
    hasOneCorner(row1, col1, row2, col2) {
        const config = this.difficultyConfig[this.difficulty];
        
        // 检查所有可能的单转角路径，包括边界外的点
        // 1. 水平-垂直路径
        for (let col = -1; col <= config.size; col++) {
            if ((col >= 0 && col < config.size && !this.isEmpty(row1, col)) ||
                (col >= 0 && col < config.size && !this.isEmpty(row2, col))) {
                continue;
            }
            if (this.isDirectConnection(row1, col1, row1, col) && 
                this.isDirectConnection(row1, col, row2, col) && 
                this.isDirectConnection(row2, col, row2, col2)) {
                return true;
            }
        }
        
        // 2. 垂直-水平路径
        for (let row = -1; row <= config.size; row++) {
            if ((row >= 0 && row < config.size && !this.isEmpty(row, col1)) ||
                (row >= 0 && row < config.size && !this.isEmpty(row, col2))) {
                continue;
            }
            if (this.isDirectConnection(row1, col1, row, col1) && 
                this.isDirectConnection(row, col1, row, col2) && 
                this.isDirectConnection(row, col2, row2, col2)) {
                return true;
            }
        }
        
        return false;
    }
    
    hasTwoCorners(row1, col1, row2, col2) {
        const config = this.difficultyConfig[this.difficulty];
        
        // 检查扩大边界内的所有可能中转点
        for (let cornerRow = -1; cornerRow <= config.size; cornerRow++) {
            for (let cornerCol = -1; cornerCol <= config.size; cornerCol++) {
                // 跳过起点和终点
                if ((cornerRow === row1 && cornerCol === col1) || 
                    (cornerRow === row2 && cornerCol === col2)) {
                    continue;
                }
                
                // 对于游戏区域内的点，需要检查是否为空
                if (cornerRow >= 0 && cornerRow < config.size && 
                    cornerCol >= 0 && cornerCol < config.size) {
                    if (!this.isEmpty(cornerRow, cornerCol)) {
                        continue;
                    }
                }
                
                // 检查是否可以通过这个中转点连接
                if (this.canConnectWithTwoCorners(row1, col1, row2, col2, cornerRow, cornerCol)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    canConnectWithTwoCorners(row1, col1, row2, col2, cornerRow, cornerCol) {
        // 检查从起点到第一个转角点
        if (!this.isDirectConnection(row1, col1, cornerRow, cornerCol)) {
            return false;
        }
        
        // 检查从第一个转角点到第二个转角点（这里只有一个转角点，直接到终点）
        if (!this.isDirectConnection(cornerRow, cornerCol, row2, col2)) {
            return false;
        }
        
        return true;
    }
    
    isEmpty(row, col) {
        const config = this.difficultyConfig[this.difficulty];
        // 扩大边界检查，边界外一圈也视为空
        if (row < -1 || row > config.size || col < -1 || col > config.size) {
            return false; // 扩大边界外的区域视为障碍
        }
        // 原始游戏区域内的检查
        if (row >= 0 && row < config.size && col >= 0 && col < config.size) {
            return this.gameBoard[row][col].matched;
        }
        // 扩大的边界区域视为空
        return true;
    }
    
    getTileElement(row, col) {
        return document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    }
    
    checkGameComplete() {
        for (let row = 0; row < this.gameBoard.length; row++) {
            for (let col = 0; col < this.gameBoard[row].length; col++) {
                if (!this.gameBoard[row][col].matched) {
                    return false;
                }
            }
        }
        return true;
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.time--;
            
            // 更新冷却时间
            if (this.hintCooldown > 0) {
                this.hintCooldown--;
                this.updateHintButton();
            }
            
            // 检查是否超时
            if (this.time <= 0) {
                this.time = 0;
                this.showTimeoutScreen();
                return;
            }
            
            // 更新时间显示（倒计时格式）
            const minutes = Math.floor(this.time / 60);
            const seconds = this.time % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    showTimeoutScreen() {
        this.gameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 显示超时页面
        document.getElementById('timeout-score').textContent = this.score.toString();
        this.showScreen('timeout');
    }

    endGame(isVictory) {
        this.gameActive = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 计算最终得分
        let finalScore = this.score;
        if (isVictory) {
            // 时间奖励：剩余时间 * 2
            const timeBonus = Math.max(0, this.time) * 2;
            finalScore += timeBonus;
        }
        
        // 更新结束页面
        const resultElement = document.getElementById('game-result');
        resultElement.textContent = isVictory ? 'Victory!' : 'Time-out';
        resultElement.className = isVictory ? '' : 'lost';
        
        const minutes = Math.floor(this.time / 60);
        const seconds = this.time % 60;
        document.getElementById('final-time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('final-score').textContent = finalScore;
        
        this.showScreen('game-over');
    }
    
    restartGame() {
        this.startGame();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    hasPossibleMoves() {
        const config = this.difficultyConfig[this.difficulty];
        
        // 创建未匹配方块的列表
        const unmatchedTiles = [];
        for (let row = 0; row < config.size; row++) {
            for (let col = 0; col < config.size; col++) {
                if (!this.gameBoard[row][col].matched) {
                    unmatchedTiles.push(this.gameBoard[row][col]);
                }
            }
        }
        
        // 检查是否有可连接的方块对
        for (let i = 0; i < unmatchedTiles.length; i++) {
            for (let j = i + 1; j < unmatchedTiles.length; j++) {
                if (unmatchedTiles[i].value === unmatchedTiles[j].value && 
                    this.checkConnection(unmatchedTiles[i].row, unmatchedTiles[i].col, 
                                       unmatchedTiles[j].row, unmatchedTiles[j].col)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    reshuffleBoard() {
        const config = this.difficultyConfig[this.difficulty];
        
        // 收集未匹配的方块
        const unmatchedTiles = [];
        for (let row = 0; row < config.size; row++) {
            for (let col = 0; col < config.size; col++) {
                if (!this.gameBoard[row][col].matched) {
                    unmatchedTiles.push(this.gameBoard[row][col]);
                }
            }
        }
        
        // 如果没有未匹配的方块，直接返回
        if (unmatchedTiles.length === 0) return;
        
        // 获取所有未匹配方块的值
        const values = unmatchedTiles.map(tile => tile.value);
        
        // 打乱值的顺序
        const shuffledValues = this.shuffleArray([...values]);
        
        // 重新分配值
        let attempts = 0;
        const maxAttempts = 50;
        let validShuffle = false;
        
        while (!validShuffle && attempts < maxAttempts) {
            // 打乱值的顺序
            this.shuffleArray(shuffledValues);
            
            // 分配新值
            for (let i = 0; i < unmatchedTiles.length; i++) {
                unmatchedTiles[i].value = shuffledValues[i];
            }
            
            // 检查是否有可连接的方块
            validShuffle = this.hasPossibleMoves();
            attempts++;
        }
        
        // 清除选中状态
        this.clearSelection();
        
        // 重新渲染游戏板
        this.renderGameBoard();
        
        // 显示重新排列提示
        this.showReshuffleMessage();
        
        // 重置计数器
        this.noMovesCounter = 0;
    }
    
    showReshuffleMessage() {
        // 创建提示元素
        const message = document.createElement('div');
        message.className = 'reshuffle-message';
        // 根据当前页面语言显示不同的消息
        let messageText = '无法连接，重新排列方块！';
        if (window.location.pathname.endsWith('en.html')) {
            messageText = 'No moves available, reshuffling tiles!';
        } else if (window.location.pathname.endsWith('es.html')) {
            messageText = '¡No hay movimientos disponibles, reorganizando fichas!';
        } else if (window.location.pathname.endsWith('fr.html')) {
            messageText = 'Aucun mouvement disponible, redistribution des tuiles !';
        }
        message.textContent = messageText;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ed8936, #f6ad55);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(237, 137, 54, 0.4);
            animation: slideIn 0.3s ease-out;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(message);
        
        // 2秒后移除提示
        setTimeout(() => {
            message.remove();
            style.remove();
        }, 2000);
    }
    
    showHint() {
        if (!this.gameActive || this.hintCooldown > 0 || this.hintCount >= this.maxHints) return;
        
        // 移除之前的提示效果
        this.clearHintEffect();
        
        // 查找可连接的方块对
        const hintPair = this.findHintPair();
        if (hintPair) {
            const [tile1, tile2] = hintPair;
            
            // 显示提示效果
            this.showHintEffect(tile1, tile2);
            
            // 增加提示使用次数
            this.hintCount++;
            
            // 设置冷却时间
            this.hintCooldown = 10;
            this.updateHintButton();
            
            // 扣分
            this.score = Math.max(0, this.score - 5);
            document.getElementById('score').textContent = this.score;
        } else {
            // 如果没有可连接的方块，重新排列
            this.reshuffleBoard();
        }
    }
    
    findHintPair() {
        const config = this.difficultyConfig[this.difficulty];
        
        // 创建未匹配方块的列表
        const unmatchedTiles = [];
        for (let row = 0; row < config.size; row++) {
            for (let col = 0; col < config.size; col++) {
                if (!this.gameBoard[row][col].matched) {
                    unmatchedTiles.push(this.gameBoard[row][col]);
                }
            }
        }
        
        // 查找可连接的方块对
        for (let i = 0; i < unmatchedTiles.length; i++) {
            for (let j = i + 1; j < unmatchedTiles.length; j++) {
                if (unmatchedTiles[i].value === unmatchedTiles[j].value && 
                    this.checkConnection(unmatchedTiles[i].row, unmatchedTiles[i].col, 
                                       unmatchedTiles[j].row, unmatchedTiles[j].col)) {
                    return [unmatchedTiles[i], unmatchedTiles[j]];
                }
            }
        }
        
        return null;
    }
    
    showHintEffect(tile1, tile2) {
        // 显示提示动画
        const element1 = this.getTileElement(tile1.row, tile1.col);
        const element2 = this.getTileElement(tile2.row, tile2.col);
        
        if (element1 && element2) {
            element1.classList.add('hint');
            element2.classList.add('hint');
            
            // 创建连线提示
            setTimeout(() => {
                this.createConnectionAnimation(tile1, tile2);
            }, 500);
        }
    }
    
    clearHintEffect() {
        document.querySelectorAll('.tile.hint').forEach(tile => {
            tile.classList.remove('hint');
        });
    }
    

    getCurrentLanguage() {
        const path = window.location.pathname;
        if (path.endsWith('en.html')) return 'en';
        if (path.endsWith('es.html')) return 'es';
        if (path.endsWith('fr.html')) return 'fr';
        return 'zh'; // 默认中文
    }

    updateHintButton() {
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            const remainingHints = this.maxHints - this.hintCount;
            
            const lang = this.getCurrentLanguage();
            let titleUsedUp, titleCooldown, titleAvailable;
            
            switch(lang) {
                case 'en':
                    titleUsedUp = 'No hints left';
                    titleCooldown = `Cooldown, ${remainingHints} hints left`;
                    titleAvailable = `${remainingHints} hints left`;
                    break;
                case 'es':
                    titleUsedUp = 'No quedan pistas';
                    titleCooldown = `En enfriamiento, ${remainingHints} pistas restantes`;
                    titleAvailable = `${remainingHints} pistas restantes`;
                    break;
                case 'fr':
                    titleUsedUp = 'Plus d\'indices';
                    titleCooldown = `Refroidissement, ${remainingHints} indices restants`;
                    titleAvailable = `${remainingHints} indices restants`;
                    break;
                default:
                    titleUsedUp = '提示次数已用完';
                    titleCooldown = `冷却中，剩余${remainingHints}次提示`;
                    titleAvailable = `剩余${remainingHints}次提示`;
            }
            
            if (remainingHints <= 0) {
                hintBtn.disabled = true;
                hintBtn.innerHTML = '💡(0)';
                hintBtn.title = titleUsedUp;
            } else if (this.hintCooldown > 0) {
                hintBtn.disabled = true;
                hintBtn.innerHTML = `💡(${remainingHints})<span class="cooldown">${this.hintCooldown}s</span>`;
                hintBtn.title = titleCooldown;
            } else {
                hintBtn.disabled = false;
                hintBtn.innerHTML = `💡(${remainingHints})`;
                hintBtn.title = titleAvailable;
            }
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new NumberLinkGame();
});
