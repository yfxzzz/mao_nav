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

        /* ===== 1. 多语言文案 ===== */
        this.i18n = {
            zh: { win: '恭喜获胜！', lose: '游戏超时！' },
            en: { win: 'Congratulations, you won!', lose: 'Time is up!' },
            es: { win: '¡Felicitaciones, ganaste!', lose: '¡Se acabó el tiempo!' },
            fr: { win: 'Félicitations, vous avez gagné !', lose: 'Temps écoulé !' }
        };

        // 难度配置（所有难度统一3分钟倒计时）
        this.difficultyConfig = {
            easy: { size: 4, maxNumber: 8 },
            medium: { size: 6, maxNumber: 12 },
            hard: { size: 8, maxNumber: 16 }
        };

        this.initializeGame();
    }

    /* ===== 2. 获取当前页面语言 ===== */
    getCurrentLanguage() {
        const path = window.location.pathname;
        if (path.includes('en.html')) return 'en';
        if (path.includes('es.html')) return 'es';
        if (path.includes('fr.html')) return 'fr';
        return 'zh'; // index.html 或其他
    }

    initializeGame() {
        this.bindEvents();
        this.showScreen('welcome');
    }

    bindEvents() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.difficulty = e.target.dataset.difficulty;
                this.startGame();
            });
        });

        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('home-btn').addEventListener('click', () => this.showScreen('welcome'));
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-home-btn').addEventListener('click', () => this.showScreen('welcome'));
        document.getElementById('timeout-retry-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('timeout-home-btn').addEventListener('click', () => this.showScreen('welcome'));
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(`${screenName}-screen`).classList.add('active');
        this.currentScreen = screenName;
        if (screenName === 'welcome') this.resetGame();
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
        if (this.timer) clearInterval(this.timer);
        this.gameBoard = [];
        this.selectedTile = null;
        this.score = 0;
        this.time = 180;
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
        let validBoard = false, attempts = 0, maxAttempts = 100;

        while (!validBoard && attempts < maxAttempts) {
            let numbers = [];
            for (let i = 1; i <= pairsNeeded; i++) {
                const number = (i % config.maxNumber) + 1;
                numbers.push(number, number);
            }
            numbers = this.shuffleArray(numbers);
            this.gameBoard = [];
            for (let row = 0; row < config.size; row++) {
                this.gameBoard[row] = [];
                for (let col = 0; col < config.size; col++) {
                    this.gameBoard[row][col] = {
                        value: numbers[row * config.size + col],
                        row, col, matched: false
                    };
                }
            }
            validBoard = this.hasPossibleMoves();
            attempts++;
        }
        if (!validBoard) this.generateGameBoard();
        this.noMovesCounter = 0;
    }

    renderGameBoard() {
        const boardElement = document.getElementById('game-board');
        const config = this.difficultyConfig[this.difficulty];
        const existingTiles = boardElement.querySelectorAll('.tile');
        const shouldRebuild = existingTiles.length !== config.size * config.size;

        if (shouldRebuild) {
            boardElement.innerHTML = '';
            boardElement.className = `game-board ${this.difficulty}`;
            for (let row = 0; row < config.size; row++) {
                for (let col = 0; col < config.size; col++) {
                    const tile = this.gameBoard[row][col];
                    const tileElement = document.createElement('div');
                    tileElement.className = 'tile' + (tile.matched ? ' matched' : '');
                    tileElement.dataset.row = row;
                    tileElement.dataset.col = col;
                    tileElement.textContent = tile.value;
                    tileElement.addEventListener('click', () => this.handleTileClick(row, col));
                    boardElement.appendChild(tileElement);
                }
            }
        } else {
            for (let row = 0; row < config.size; row++) {
                for (let col = 0; col < config.size; col++) {
                    const tile = this.gameBoard[row][col];
                    const tileElement = this.getTileElement(row, col);
                    if (tileElement) {
                        tileElement.textContent = tile.value;
                        tileElement.classList.toggle('matched', tile.matched);
                        tileElement.classList.remove('selected');
                    }
                }
            }
        }
    }

    handleTileClick(row, col) {
        if (!this.gameActive) return;
        const tile = this.gameBoard[row][col];
        if (tile.matched) return;
        const tileElement = this.getTileElement(row, col);
        tileElement.classList.remove('hint');

        if (this.selectedTile && this.selectedTile.row === row && this.selectedTile.col === col) {
            this.clearSelection(); return;
        }
        if (this.selectedTile) {
            if (this.canConnect(this.selectedTile, tile)) {
                this.matchTiles(this.selectedTile, tile);
                this.noMovesCounter = 0;
            } else {
                this.clearSelection();
                this.selectTile(tile);
                this.noMovesCounter++;
                if (this.noMovesCounter >= this.maxNoMoves) this.reshuffleBoard();
            }
        } else {
            this.selectTile(tile);
        }
    }

    selectTile(tile) {
        this.selectedTile = tile;
        const tileElement = this.getTileElement(tile.row, tile.col);
        tileElement.classList.add('selected');
        tileElement.classList.remove('hint');
    }

    clearSelection() {
        if (this.selectedTile) {
            this.getTileElement(this.selectedTile.row, this.selectedTile.col).classList.remove('selected');
            this.selectedTile = null;
        }
    }

    matchTiles(tile1, tile2) {
        this.createConnectionAnimation(tile1, tile2);
        setTimeout(() => {
            tile1.matched = tile2.matched = true;
            const el1 = this.getTileElement(tile1.row, tile1.col);
            const el2 = this.getTileElement(tile2.row, tile2.col);
            el1.classList.remove('selected', 'hint');
            el2.classList.remove('selected', 'hint');
            el1.classList.add('matched');
            el2.classList.add('matched');
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.selectedTile = null;
            this.noMovesCounter = 0;
            setTimeout(() => {
                if (this.checkGameComplete()) this.endGame(true);
                else if (!this.hasPossibleMoves()) this.reshuffleBoard();
            }, 500);
        }, 500);
    }

    createConnectionAnimation(tile1, tile2) {
        const boardElement = document.getElementById('game-board');
        const el1 = this.getTileElement(tile1.row, tile1.col);
        const el2 = this.getTileElement(tile2.row, tile2.col);
        const rect1 = el1.getBoundingClientRect(), rect2 = el2.getBoundingClientRect(), boardRect = boardElement.getBoundingClientRect();
        const x1 = rect1.left + rect1.width / 2 - boardRect.left, y1 = rect1.top + rect1.height / 2 - boardRect.top;
        const x2 = rect2.left + rect2.width / 2 - boardRect.left, y2 = rect2.top + rect2.height / 2 - boardRect.top;
        const length = Math.hypot(x2 - x1, y2 - y1), angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const line = document.createElement('div');
        line.className = 'connection-line';
        line.style.width = `${length}px`; line.style.height = '4px';
        line.style.left = `${x1}px`; line.style.top = `${y1}px`;
        line.style.transformOrigin = '0 0'; line.style.transform = `rotate(${angle}deg)`;
        boardElement.appendChild(line);
        setTimeout(() => line.remove(), 500);
    }

    canConnect(tile1, tile2) {
        if (tile1.value !== tile2.value) return false;
        return this.checkConnection(tile1.row, tile1.col, tile2.row, tile2.col);
    }

    checkConnection(r1, c1, r2, c2) {
        if (this.isDirectConnection(r1, c1, r2, c2)) return true;
        if (this.hasOneCorner(r1, c1, r2, c2)) return true;
        if (this.hasTwoCorners(r1, c1, r2, c2)) return true;
        return false;
    }

    isDirectConnection(r1, c1, r2, c2) {
        if (r1 === r2) {
            for (let c = Math.min(c1, c2) + 1; c < Math.max(c1, c2); c++) if (!this.isEmpty(r1, c)) return false;
            return true;
        }
        if (c1 === c2) {
            for (let r = Math.min(r1, r2) + 1; r < Math.max(r1, r2); r++) if (!this.isEmpty(r, c1)) return false;
            return true;
        }
        return false;
    }

    hasOneCorner(r1, c1, r2, c2) {
        const config = this.difficultyConfig[this.difficulty];
        for (let c = -1; c <= config.size; c++) {
            if ((c >= 0 && c < config.size && !this.isEmpty(r1, c)) || (c >= 0 && c < config.size && !this.isEmpty(r2, c))) continue;
            if (this.isDirectConnection(r1, c1, r1, c) && this.isDirectConnection(r1, c, r2, c) && this.isDirectConnection(r2, c, r2, c2)) return true;
        }
        for (let r = -1; r <= config.size; r++) {
            if ((r >= 0 && r < config.size && !this.isEmpty(r, c1)) || (r >= 0 && r < config.size && !this.isEmpty(r, c2))) continue;
            if (this.isDirectConnection(r1, c1, r, c1) && this.isDirectConnection(r, c1, r, c2) && this.isDirectConnection(r, c2, r2, c2)) return true;
        }
        return false;
    }

    hasTwoCorners(r1, c1, r2, c2) {
        const config = this.difficultyConfig[this.difficulty];
        for (let cr = -1; cr <= config.size; cr++) {
            for (let cc = -1; cc <= config.size; cc++) {
                if ((cr === r1 && cc === c1) || (cr === r2 && cc === c2)) continue;
                if (cr >= 0 && cr < config.size && cc >= 0 && cc < config.size && !this.isEmpty(cr, cc)) continue;
                if (this.isDirectConnection(r1, c1, cr, cc) && this.isDirectConnection(cr, cc, r2, c2)) return true;
            }
        }
        return false;
    }

    isEmpty(r, c) {
        const config = this.difficultyConfig[this.difficulty];
        if (r < -1 || r > config.size || c < -1 || c > config.size) return false;
        if (r >= 0 && r < config.size && c >= 0 && c < config.size) return this.gameBoard[r][c].matched;
        return true;
    }

    getTileElement(row, col) {
        return document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
    }

    checkGameComplete() {
        for (let r = 0; r < this.gameBoard.length; r++) {
            for (let c = 0; c < this.gameBoard[r].length; c++) {
                if (!this.gameBoard[r][c].matched) return false;
            }
        }
        return true;
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.time--;
            if (this.hintCooldown > 0) {
                this.hintCooldown--;
                this.updateHintButton();
            }
            if (this.time <= 0) {
                this.time = 0;
                this.showTimeoutScreen();
                return;
            }
            const minutes = Math.floor(this.time / 60), seconds = this.time % 60;
            document.getElementById('timer').textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    showTimeoutScreen() {
        this.gameActive = false;
        if (this.timer) clearInterval(this.timer);
        document.getElementById('timeout-score').textContent = this.score;
        this.showScreen('timeout');
    }

    /* ===== 3. 使用多语言文案 ===== */
    endGame(isVictory) {
        this.gameActive = false;
        if (this.timer) clearInterval(this.timer);
        let finalScore = this.score;
        if (isVictory) finalScore += Math.max(0, this.time) * 2;
        const lang = this.getCurrentLanguage();
        const resultElement = document.getElementById('game-result');
        resultElement.textContent = isVictory ? this.i18n[lang].win : this.i18n[lang].lose;
        resultElement.className = isVictory ? '' : 'lost';
        const minutes = Math.floor(this.time / 60), seconds = this.time % 60;
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
        const unmatched = [];
        for (let r = 0; r < config.size; r++) {
            for (let c = 0; c < config.size; c++) {
                if (!this.gameBoard[r][c].matched) unmatched.push(this.gameBoard[r][c]);
            }
        }
        for (let i = 0; i < unmatched.length; i++) {
            for (let j = i + 1; j < unmatched.length; j++) {
                if (unmatched[i].value === unmatched[j].value &&
                    this.checkConnection(unmatched[i].row, unmatched[i].col, unmatched[j].row, unmatched[j].col)) return true;
            }
        }
        return false;
    }

    reshuffleBoard() {
        const config = this.difficultyConfig[this.difficulty];
        const unmatched = [];
        for (let r = 0; r < config.size; r++) {
            for (let c = 0; c < config.size; c++) {
                if (!this.gameBoard[r][c].matched) unmatched.push(this.gameBoard[r][c]);
            }
        }
        if (unmatched.length === 0) return;
        const values = unmatched.map(t => t.value);
        let validShuffle = false, attempts = 0, maxAttempts = 50;
        while (!validShuffle && attempts < maxAttempts) {
            this.shuffleArray(values);
            for (let i = 0; i < unmatched.length; i++) unmatched[i].value = values[i];
            validShuffle = this.hasPossibleMoves();
            attempts++;
        }
        this.clearSelection();
        this.renderGameBoard();
        this.showReshuffleMessage();
        this.noMovesCounter = 0;
    }

    showReshuffleMessage() {
        const lang = this.getCurrentLanguage();
        const text = {
            zh: '无法连接，重新排列方块！',
            en: 'No moves available, reshuffling tiles!',
            es: '¡No hay movimientos disponibles, reorganizando fichas!',
            fr: 'Aucun mouvement disponible, redistribution des tuiles !'
        };
        const msg = document.createElement('div');
        msg.className = 'reshuffle-message';
        msg.textContent = text[lang];
        msg.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ed8936, #f6ad55); color: white;
            padding: 20px 30px; border-radius: 15px; font-size: 1.2rem; font-weight: bold;
            z-index: 1000; box-shadow: 0 10px 30px rgba(237, 137, 54, 0.4); animation: slideIn 0.3s ease-out;`;
        const style = document.createElement('style');
        style.textContent = `@keyframes slideIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }`;
        document.head.appendChild(style);
        document.body.appendChild(msg);
        setTimeout(() => { msg.remove(); style.remove(); }, 2000);
    }

    showHint() {
        if (!this.gameActive || this.hintCooldown > 0 || this.hintCount >= this.maxHints) return;
        this.clearHintEffect();
        const pair = this.findHintPair();
        if (pair) {
            this.showHintEffect(pair[0], pair[1]);
            this.hintCount++;
            this.hintCooldown = 10;
            this.updateHintButton();
            this.score = Math.max(0, this.score - 5);
            document.getElementById('score').textContent = this.score;
        } else {
            this.reshuffleBoard();
        }
    }

    findHintPair() {
        const config = this.difficultyConfig[this.difficulty];
        const unmatched = [];
        for (let r = 0; r < config.size; r++) {
            for (let c = 0; c < config.size; c++) {
                if (!this.gameBoard[r][c].matched) unmatched.push(this.gameBoard[r][c]);
            }
        }
        for (let i = 0; i < unmatched.length; i++) {
            for (let j = i + 1; j < unmatched.length; j++) {
                if (unmatched[i].value === unmatched[j].value &&
                    this.checkConnection(unmatched[i].row, unmatched[i].col, unmatched[j].row, unmatched[j].col)) return [unmatched[i], unmatched[j]];
            }
        }
        return null;
    }

    showHintEffect(tile1, tile2) {
        const el1 = this.getTileElement(tile1.row, tile1.col);
        const el2 = this.getTileElement(tile2.row, tile2.col);
        if (el1 && el2) {
            el1.classList.add('hint');
            el2.classList.add('hint');
            setTimeout(() => this.createConnectionAnimation(tile1, tile2), 500);
        }
    }

    clearHintEffect() {
        document.querySelectorAll('.tile.hint').forEach(t => t.classList.remove('hint'));
    }

    updateHintButton() {
        const btn = document.getElementById('hint-btn');
        if (!btn) return;
        const lang = this.getCurrentLanguage();
        const rem = this.maxHints - this.hintCount;
        const text = {
            zh: { used: '提示次数已用完', cooldown: `冷却中，剩余${rem}次提示`, avail: `剩余${rem}次提示` },
            en: { used: 'No hints left', cooldown: `Cooldown, ${rem} hints left`, avail: `${rem} hints left` },
            es: { used: 'No quedan pistas', cooldown: `En enfriamiento, ${rem} pistas restantes`, avail: `${rem} pistas restantes` },
            fr: { used: 'Plus d\'indices', cooldown: `Refroidissement, ${rem} indices restants`, avail: `${rem} indices restants` }
        };
        if (rem <= 0) {
            btn.disabled = true; btn.innerHTML = '💡(0)'; btn.title = text[lang].used;
        } else if (this.hintCooldown > 0) {
            btn.disabled = true; btn.innerHTML = `💡(${rem})<span class="cooldown">${this.hintCooldown}s</span>`; btn.title = text[lang].cooldown;
        } else {
            btn.disabled = false; btn.innerHTML = `💡(${rem})`; btn.title = text[lang].avail;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NumberLinkGame();
});
