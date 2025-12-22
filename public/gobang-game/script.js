// 五子棋游戏逻辑
class GobangGame {
    constructor() {
        this.boardSize = 15; // 15x15的棋盘
        this.board = []; // 棋盘状态
        this.currentPlayer = 'black'; // 当前玩家，黑方先行
        this.gameOver = false; // 游戏是否结束
        this.winner = null; // 获胜方
        this.moveHistory = []; // 落子历史，用于悔棋
        this.maxUndoSteps = 3; // 最大悔棋次数
        this.undoCount = 0; // 当前悔棋次数
        
        // 初始化DOM元素
        this.boardElement = document.getElementById('board');
        this.playerIndicator = document.getElementById('player-indicator');
        this.gameStatusText = document.getElementById('game-status-text');
        this.undoBtn = document.getElementById('undo-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.modal = document.getElementById('game-over-modal');
        this.winnerText = document.getElementById('winner-text');
        this.modalRestartBtn = document.getElementById('modal-restart-btn');
        
        // 初始化游戏
        this.init();
    }
    
    // 初始化游戏
    init() {
        // 初始化棋盘数据
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        
        // 创建棋盘UI
        this.createBoardUI();
        
        // 添加事件监听器
        this.addEventListeners();
        
        // 更新UI状态
        this.updateUI();
        
        // 重置游戏状态
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
        this.undoCount = 0;
    }
    
    // 创建棋盘UI
    createBoardUI() {
        this.boardElement.innerHTML = '';
        
        // 计算单元格大小和间距
        const cellSize = 30; // 单元格大小
        const boardSize = this.boardSize;
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('board-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 使用绝对定位放置单元格
                const cellWidth = 100 / (boardSize - 1);
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.left = `calc(${col * cellWidth}% - ${cellSize / 2}px)`;
                cell.style.top = `calc(${row * cellWidth}% - ${cellSize / 2}px)`;
                
                this.boardElement.appendChild(cell);
            }
        }
    }
    
    // 添加事件监听器
    addEventListeners() {
        // 棋盘点击事件
        this.boardElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.board-cell');
            if (cell && !this.gameOver) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.handleCellClick(row, col);
            }
        });
        
        // 悔棋按钮点击事件
        this.undoBtn.addEventListener('click', () => {
            this.undoMove();
        });
        
        // 重新开始按钮点击事件
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
        
        // 模态框中的重新开始按钮点击事件
        this.modalRestartBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.restartGame();
        });
    }
    
    // 处理棋盘单元格点击
    handleCellClick(row, col) {
        // 检查位置是否已有棋子
        if (this.board[row][col] !== null) {
            return;
        }
        
        // 玩家落子
        this.makeMove(row, col, 'black');
        
        // 检查玩家是否获胜
        if (this.checkWin(row, col, 'black')) {
            this.endGame('black');
            return;
        }
        
        // 检查是否平局
        if (this.checkDraw()) {
            this.endGame(null);
            return;
        }
        
        // 切换到电脑回合
        this.currentPlayer = 'white';
        this.updateUI();
        
        // 电脑延迟落子，增加思考感
        setTimeout(() => {
            // 电脑落子
            const computerMove = this.getComputerMove();
            if (computerMove) {
                this.makeMove(computerMove.row, computerMove.col, 'white');
                
                // 检查电脑是否获胜
                if (this.checkWin(computerMove.row, computerMove.col, 'white')) {
                    this.endGame('white');
                    return;
                }
                
                // 检查是否平局
                if (this.checkDraw()) {
                    this.endGame(null);
                    return;
                }
            }
            
            // 切换回玩家回合
            this.currentPlayer = 'black';
            this.updateUI();
        }, 500);
    }
    
    // 落子
    makeMove(row, col, player) {
        // 更新棋盘数据
        this.board[row][col] = player;
        
        // 记录落子历史
        this.moveHistory.push({ row, col, player });
        
        // 更新UI显示棋子
        this.updateBoardUI();
        
        // 更新悔棋按钮状态
        this.updateUndoButton();
    }
    
    // 更新棋盘UI显示
    updateBoardUI() {
        // 清除所有棋子
        document.querySelectorAll('.stone').forEach(stone => stone.remove());
        
        // 计算交叉点位置
        const cellWidth = 100 / (this.boardSize - 1);
        const stoneSize = 26;
        
        // 重新添加所有棋子
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col]) {
                    const stone = document.createElement('div');
                    stone.classList.add('stone', `stone-${this.board[row][col]}`);
                    
                    // 计算棋子位置，确保位于线条交叉点
                    stone.style.left = `calc(${col * cellWidth}% - ${stoneSize / 2}px)`;
                    stone.style.top = `calc(${row * cellWidth}% - ${stoneSize / 2}px)`;
                    
                    // 将棋子直接添加到棋盘上，而不是单元格内
                    this.boardElement.appendChild(stone);
                    
                    // 保存棋子的位置信息，用于高亮显示
                    stone.dataset.row = row;
                    stone.dataset.col = col;
                }
            }
        }
    }
    
    // 获取电脑落子位置
    getComputerMove() {
        // 简单AI逻辑：优先防守，其次进攻，最后随机落子
        
        // 检查电脑是否有获胜机会
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = 'white';
                    const canWin = this.checkWin(row, col, 'white');
                    this.board[row][col] = null;
                    if (canWin) {
                        return { row, col };
                    }
                }
            }
        }
        
        // 检查玩家是否有获胜机会，进行防守
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = 'black';
                    const canWin = this.checkWin(row, col, 'black');
                    this.board[row][col] = null;
                    if (canWin) {
                        return { row, col };
                    }
                }
            }
        }
        
        // 检查电脑是否能形成活四
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = 'white';
                    const canFormFour = this.checkPotentialWin(row, col, 'white', 4);
                    this.board[row][col] = null;
                    if (canFormFour) {
                        return { row, col };
                    }
                }
            }
        }
        
        // 检查玩家是否能形成活四，进行防守
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = 'black';
                    const canFormFour = this.checkPotentialWin(row, col, 'black', 4);
                    this.board[row][col] = null;
                    if (canFormFour) {
                        return { row, col };
                    }
                }
            }
        }
        
        // 检查电脑是否能形成活三
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = 'white';
                    const canFormThree = this.checkPotentialWin(row, col, 'white', 3);
                    this.board[row][col] = null;
                    if (canFormThree) {
                        return { row, col };
                    }
                }
            }
        }
        
        // 检查玩家是否能形成活三，进行防守
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    this.board[row][col] = 'black';
                    const canFormThree = this.checkPotentialWin(row, col, 'black', 3);
                    this.board[row][col] = null;
                    if (canFormThree) {
                        return { row, col };
                    }
                }
            }
        }
        
        // 如果以上都没有合适的位置，则选择一个靠近中心的空位
        const center = Math.floor(this.boardSize / 2);
        const distance = [];
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    const dist = Math.abs(row - center) + Math.abs(col - center);
                    distance.push({ row, col, dist });
                }
            }
        }
        
        // 按距离中心的远近排序
        distance.sort((a, b) => a.dist - b.dist);
        
        // 如果有空格，返回距离中心最近的位置
        if (distance.length > 0) {
            return { row: distance[0].row, col: distance[0].col };
        }
        
        return null;
    }
    
    // 检查潜在的获胜机会（活三、活四等）
    checkPotentialWin(row, col, player, targetCount) {
        const directions = [
            [0, 1],  // 水平
            [1, 0],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 向一个方向查找
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow < 0 || newRow >= this.boardSize || 
                    newCol < 0 || newCol >= this.boardSize || 
                    this.board[newRow][newCol] !== player) {
                    break;
                }
                
                count++;
            }
            
            // 向相反方向查找
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow < 0 || newRow >= this.boardSize || 
                    newCol < 0 || newCol >= this.boardSize || 
                    this.board[newRow][newCol] !== player) {
                    break;
                }
                
                count++;
            }
            
            if (count >= targetCount) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查是否获胜
    checkWin(row, col, player) {
        const directions = [
            [0, 1],  // 水平
            [1, 0],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 向一个方向查找
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow < 0 || newRow >= this.boardSize || 
                    newCol < 0 || newCol >= this.boardSize || 
                    this.board[newRow][newCol] !== player) {
                    break;
                }
                
                count++;
            }
            
            // 向相反方向查找
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                
                if (newRow < 0 || newRow >= this.boardSize || 
                    newCol < 0 || newCol >= this.boardSize || 
                    this.board[newRow][newCol] !== player) {
                    break;
                }
                
                count++;
            }
            
            if (count >= 5) {
                // 高亮显示获胜的五个棋子
                this.highlightWinningStones(row, col, dx, dy, player);
                return true;
            }
        }
        
        return false;
    }
    
    // 高亮显示获胜的棋子
    highlightWinningStones(row, col, dx, dy, player) {
        // 标记获胜的棋子位置
        const winningStones = [{ row, col }];
        
        // 向一个方向查找
        for (let i = 1; i < 5; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            
            if (newRow < 0 || newRow >= this.boardSize || 
                newCol < 0 || newCol >= this.boardSize || 
                this.board[newRow][newCol] !== player) {
                break;
            }
            
            winningStones.push({ row: newRow, col: newCol });
        }
        
        // 向相反方向查找
        for (let i = 1; i < 5; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            
            if (newRow < 0 || newRow >= this.boardSize || 
                newCol < 0 || newCol >= this.boardSize || 
                this.board[newRow][newCol] !== player) {
                break;
            }
            
            winningStones.push({ row: newRow, col: newCol });
        }
        
        // 高亮显示获胜的棋子
        setTimeout(() => {
            winningStones.forEach(stone => {
                // 直接查找棋子元素
                const stoneElements = document.querySelectorAll('.stone');
                stoneElements.forEach(stoneElement => {
                    if (stoneElement.dataset.row == stone.row && stoneElement.dataset.col == stone.col) {
                        stoneElement.classList.add('stone-highlight');
                    }
                });
            });
        }, 300);
    }
    
    // 检查是否平局
    checkDraw() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false; // 还有空格，不是平局
                }
            }
        }
        return true; // 棋盘已满，平局
    }
    
    // 结束游戏
    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
        
        // 更新游戏状态文本
        if (winner === 'black') {
            this.gameStatusText.textContent = '黑方获胜！';
            this.winnerText.textContent = '黑方获胜！';
        } else if (winner === 'white') {
            this.gameStatusText.textContent = '白方获胜！';
            this.winnerText.textContent = '白方获胜！';
        } else {
            this.gameStatusText.textContent = '平局！';
            this.winnerText.textContent = '平局！';
        }
        
        // 显示游戏结束模态框
        setTimeout(() => {
            this.modal.classList.remove('hidden');
        }, 1000);
    }
    
    // 悔棋
    undoMove() {
        if (this.undoCount >= this.maxUndoSteps || this.moveHistory.length === 0 || this.gameOver) {
            return;
        }
        
        // 撤销两步（玩家和电脑各一步）
        for (let i = 0; i < 2 && this.moveHistory.length > 0; i++) {
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.row][lastMove.col] = null;
        }
        
        // 更新悔棋次数
        this.undoCount++;
        
        // 更新棋盘UI
        this.updateBoardUI();
        
        // 更新悔棋按钮状态
        this.updateUndoButton();
        
        // 确保当前玩家是黑方（玩家）
        this.currentPlayer = 'black';
        
        // 更新UI
        this.updateUI();
        
        // 如果游戏已结束，重置游戏状态
        if (this.gameOver) {
            this.gameOver = false;
            this.winner = null;
            this.gameStatusText.textContent = '游戏进行中';
        }
    }
    
    // 更新悔棋按钮状态
    updateUndoButton() {
        const remainingUndo = this.maxUndoSteps - this.undoCount;
        this.undoBtn.textContent = `悔棋 (${remainingUndo})`;
        
        if (remainingUndo <= 0 || this.moveHistory.length === 0 || this.gameOver) {
            this.undoBtn.disabled = true;
        } else {
            this.undoBtn.disabled = false;
        }
    }
    
    // 重新开始游戏
    restartGame() {
        // 隐藏模态框
        this.modal.classList.add('hidden');
        
        // 重新初始化游戏
        this.init();
    }
    
    // 更新UI状态
    updateUI() {
        // 更新当前玩家指示器
        if (this.currentPlayer === 'black') {
            this.playerIndicator.textContent = '黑方（玩家）';
            this.playerIndicator.className = 'player-black';
        } else {
            this.playerIndicator.textContent = '白方（电脑）';
            this.playerIndicator.className = 'player-white';
        }
        
        // 更新游戏状态文本
        if (!this.gameOver) {
            this.gameStatusText.textContent = '游戏进行中';
        }
    }
}

// 当DOM加载完成后，初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GobangGame();
});