// Gobang Game Logic
class GobangGame {
    constructor() {
        this.boardSize = 15; // 15x15 board
        this.board = []; // Board state
        this.currentPlayer = 'black'; // Current player, black goes first
        this.gameOver = false; // Game over flag
        this.winner = null; // Winner
        this.moveHistory = []; // Move history for undo
        this.maxUndoSteps = 3; // Maximum undo steps
        this.undoCount = 0; // Current undo count
        
        // Initialize DOM elements
        this.boardElement = document.getElementById('board');
        this.playerIndicator = document.getElementById('player-indicator');
        this.gameStatusText = document.getElementById('game-status-text');
        this.undoBtn = document.getElementById('undo-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.modal = document.getElementById('game-over-modal');
        this.winnerText = document.getElementById('winner-text');
        this.modalRestartBtn = document.getElementById('modal-restart-btn');
        
        // Initialize game
        this.init();
    }
    
    // Initialize game
    init() {
        // Initialize board data
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        
        // Create board UI
        this.createBoardUI();
        
        // Add event listeners
        this.addEventListeners();
        
        // Update UI state
        this.updateUI();
        
        // Reset game state
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
        this.undoCount = 0;
    }
    
    // Create board UI
    createBoardUI() {
        this.boardElement.innerHTML = '';
        
        // Calculate cell size and spacing
        const cellSize = 30; // Cell size
        const boardSize = this.boardSize;
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const cell = document.createElement('div');
                cell.classList.add('board-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Use absolute positioning for cells
                const cellWidth = 100 / (boardSize - 1);
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                cell.style.left = `calc(${col * cellWidth}% - ${cellSize / 2}px)`;
                cell.style.top = `calc(${row * cellWidth}% - ${cellSize / 2}px)`;
                
                this.boardElement.appendChild(cell);
            }
        }
    }
    
    // Add event listeners
    addEventListeners() {
        // Board click event
        this.boardElement.addEventListener('click', (e) => {
            const cell = e.target.closest('.board-cell');
            if (cell && !this.gameOver) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                this.handleCellClick(row, col);
            }
        });
        
        // Undo button click event
        this.undoBtn.addEventListener('click', () => {
            this.undoMove();
        });
        
        // Restart button click event
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
        
        // Modal restart button click event
        this.modalRestartBtn.addEventListener('click', () => {
            this.modal.classList.add('hidden');
            this.restartGame();
        });
    }
    
    // Handle board cell click
    handleCellClick(row, col) {
        // Check if position already has a stone
        if (this.board[row][col] !== null) {
            return;
        }
        
        // Player places stone
        this.makeMove(row, col, 'black');
        
        // Check if player wins
        if (this.checkWin(row, col, 'black')) {
            this.endGame('black');
            return;
        }
        
        // Check if draw
        if (this.checkDraw()) {
            this.endGame(null);
            return;
        }
        
        // Switch to computer's turn
        this.currentPlayer = 'white';
        this.updateUI();
        
        // Computer places stone with delay for thinking effect
        setTimeout(() => {
            // Computer move
            const computerMove = this.getComputerMove();
            if (computerMove) {
                this.makeMove(computerMove.row, computerMove.col, 'white');
                
                // Check if computer wins
                if (this.checkWin(computerMove.row, computerMove.col, 'white')) {
                    this.endGame('white');
                    return;
                }
                
                // Check if draw
                if (this.checkDraw()) {
                    this.endGame(null);
                    return;
                }
            }
            
            // Switch back to player's turn
            this.currentPlayer = 'black';
            this.updateUI();
        }, 500);
    }
    
    // Place stone
    makeMove(row, col, player) {
        // Update board data
        this.board[row][col] = player;
        
        // Record move history
        this.moveHistory.push({ row, col, player });
        
        // Update UI to show stone
        this.updateBoardUI();
        
        // Update undo button state
        this.updateUndoButton();
    }
    
    // Update board UI display
    updateBoardUI() {
        // Clear all stones
        document.querySelectorAll('.stone').forEach(stone => stone.remove());
        
        // Calculate intersection positions
        const cellWidth = 100 / (this.boardSize - 1);
        const stoneSize = 26;
        
        // Re-add all stones
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col]) {
                    const stone = document.createElement('div');
                    stone.classList.add('stone', `stone-${this.board[row][col]}`);
                    
                    // Calculate stone position to ensure it's at the intersection
                    stone.style.left = `calc(${col * cellWidth}% - ${stoneSize / 2}px)`;
                    stone.style.top = `calc(${row * cellWidth}% - ${stoneSize / 2}px)`;
                    
                    // Add stone directly to board instead of cell
                    this.boardElement.appendChild(stone);
                    
                    // Save stone position info for highlighting
                    stone.dataset.row = row;
                    stone.dataset.col = col;
                }
            }
        }
    }
    
    // Get computer move
    getComputerMove() {
        // Simple AI logic: prioritize defense, then offense, finally random
        
        // Check if computer can win
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
        
        // Check if player can win, defend
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
        
        // Check if computer can form a potential four
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
        
        // Check if player can form a potential four, defend
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
        
        // Check if computer can form a potential three
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
        
        // Check if player can form a potential three, defend
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
        
        // If no suitable position above, choose a position near the center
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
        
        // Sort by distance to center
        distance.sort((a, b) => a.dist - b.dist);
        
        // If there are empty spaces, return the one closest to center
        if (distance.length > 0) {
            return { row: distance[0].row, col: distance[0].col };
        }
        
        return null;
    }
    
    // Check potential winning opportunities (three, four, etc.)
    checkPotentialWin(row, col, player, targetCount) {
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal
            [1, -1]  // Anti-diagonal
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // Look in one direction
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
            
            // Look in the opposite direction
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
    
    // Check if win
    checkWin(row, col, player) {
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal
            [1, -1]  // Anti-diagonal
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // Look in one direction
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
            
            // Look in the opposite direction
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
                // Highlight winning stones
                this.highlightWinningStones(row, col, dx, dy, player);
                return true;
            }
        }
        
        return false;
    }
    
    // Highlight winning stones
    highlightWinningStones(row, col, dx, dy, player) {
        // Mark winning stone positions
        const winningStones = [{ row, col }];
        
        // Look in one direction
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
        
        // Look in the opposite direction
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
        
        // Highlight winning stones
        setTimeout(() => {
            winningStones.forEach(stone => {
                // Directly find stone elements
                const stoneElements = document.querySelectorAll('.stone');
                stoneElements.forEach(stoneElement => {
                    if (stoneElement.dataset.row == stone.row && stoneElement.dataset.col == stone.col) {
                        stoneElement.classList.add('stone-highlight');
                    }
                });
            });
        }, 300);
    }
    
    // Check if draw
    checkDraw() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    return false; // There are still empty spaces, not a draw
                }
            }
        }
        return true; // Board is full, draw
    }
    
    // End game
    endGame(winner) {
        this.gameOver = true;
        this.winner = winner;
        
        // Update game status text
        if (winner === 'black') {
            this.gameStatusText.textContent = 'Black wins!';
            this.winnerText.textContent = 'Black wins!';
        } else if (winner === 'white') {
            this.gameStatusText.textContent = 'White wins!';
            this.winnerText.textContent = 'White wins!';
        } else {
            this.gameStatusText.textContent = 'Draw!';
            this.winnerText.textContent = 'Draw!';
        }
        
        // Show game over modal
        setTimeout(() => {
            this.modal.classList.remove('hidden');
        }, 1000);
    }
    
    // Undo move
    undoMove() {
        if (this.undoCount >= this.maxUndoSteps || this.moveHistory.length === 0 || this.gameOver) {
            return;
        }
        
        // Undo two steps (player and computer each)
        for (let i = 0; i < 2 && this.moveHistory.length > 0; i++) {
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.row][lastMove.col] = null;
        }
        
        // Update undo count
        this.undoCount++;
        
        // Update board UI
        this.updateBoardUI();
        
        // Update undo button state
        this.updateUndoButton();
        
        // Ensure current player is black (player)
        this.currentPlayer = 'black';
        
        // Update UI
        this.updateUI();
        
        // If game was over, reset game state
        if (this.gameOver) {
            this.gameOver = false;
            this.winner = null;
            this.gameStatusText.textContent = 'Game in Progress';
        }
    }
    
    // Update undo button state
    updateUndoButton() {
        const remainingUndo = this.maxUndoSteps - this.undoCount;
        this.undoBtn.textContent = `Undo (${remainingUndo})`;
        
        if (remainingUndo <= 0 || this.moveHistory.length === 0 || this.gameOver) {
            this.undoBtn.disabled = true;
        } else {
            this.undoBtn.disabled = false;
        }
    }
    
    // Restart game
    restartGame() {
        // Hide modal
        this.modal.classList.add('hidden');
        
        // Reinitialize game
        this.init();
    }
    
    // Update UI state
    updateUI() {
        // Update current player indicator
        if (this.currentPlayer === 'black') {
            this.playerIndicator.textContent = 'Black (Player)';
            this.playerIndicator.className = 'player-black';
        } else {
            this.playerIndicator.textContent = 'White (Computer)';
            this.playerIndicator.className = 'player-white';
        }
        
        // Update game status text
        if (!this.gameOver) {
            this.gameStatusText.textContent = 'Game in Progress';
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GobangGame();
});