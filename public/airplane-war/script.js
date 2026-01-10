// ==========================================
// 飞机大战 - 修复卡死版 script.js
// 仅修复碰撞检测中的索引错乱，其余保持原逻辑
// ==========================================

// 游戏资源
const gameResources = {
  playerImage: 'img/w.png',
  enemyImage: 'img/d.png',
  bulletImage: 'img/zd.png',
  powerUpImage: 'img/hl.png',
  scoreUpImage: 'img/jf.png',
  shieldImage: 'img/hd.png',
  backgroundImage: 'img/bj.png'
};

const LANG = document.documentElement.lang || 'zh';   // 取 <html lang="zh|en">

// 游戏状态
const gameState = {
  isRunning: false,
  score: 0,
  lives: 3,
  power: 1,
  difficulty: 1,
  lastEnemySpawn: 0,
  enemySpawnRate: 1000,
  lastPowerUpSpawn: 0,
  powerUpSpawnRate: 8000,
  keys: {},
  touchX: null,
  player: {
    x: 0, y: 0, width: 60, height: 60, speed: 5,
    lastShot: 0, shotDelay: 500, shield: false, shieldTime: 0
  },
  bullets: [],
  enemies: [],
  powerUps: [],
  explosions: [],
  scoreMultiplier: 1,
  scoreMultiplierTime: 0
};

// 工具：加载单张图片
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 预加载所有资源
async function preloadResources() {
  try {
    const keys = Object.keys(gameResources);
    for (const k of keys) {
      gameResources[k] = await loadImage(gameResources[k]);
    }
    return true;
  } catch (e) {
    console.error('资源加载失败:', e);
    return false;
  }
}

// 初始化游戏
function initGame() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    gameState.player.x = canvas.width / 2 - gameState.player.width / 2;
    gameState.player.y = canvas.height - gameState.player.height - 20;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('keydown', e => gameState.keys[e.key] = true);
  window.addEventListener('keyup', e => gameState.keys[e.key] = false);

  // 触摸控制
  function handleTouch(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    gameState.touchX = e.touches[0].clientX - rect.left;
  }
  canvas.addEventListener('touchstart', handleTouch);
  canvas.addEventListener('touchmove', handleTouch);
  canvas.addEventListener('touchend', () => gameState.touchX = null);

  document.getElementById('startBtn').addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', startGame);

  // 主循环
  function gameLoop(timestamp) {
    if (!gameState.isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateGame(timestamp);
    drawGame();
    if (gameState.lives <= 0) { endGame(); return; }
    requestAnimationFrame(gameLoop);
  }

  // 更新整个游戏状态
  function updateGame(ts) {
    updatePlayer();
    if (ts - gameState.lastEnemySpawn > gameState.enemySpawnRate) {
      spawnEnemy(); gameState.lastEnemySpawn = ts;
    }
    if (ts - gameState.lastPowerUpSpawn > gameState.powerUpSpawnRate) {
      spawnPowerUp(); gameState.lastPowerUpSpawn = ts;
    }
    updateBullets(ts);
    updateEnemies();
    updatePowerUps();
    updateExplosions();
    updatePowerUpEffects(ts);
    checkCollisions();
    updateDifficulty(ts);
  }

  // 更新玩家
  function updatePlayer() {
    const p = gameState.player;
    if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) p.x -= p.speed;
    if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) p.x += p.speed;
    if (gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) p.y -= p.speed;
    if (gameState.keys['ArrowDown'] || gameState.keys['s'] || gameState.keys['S']) p.y += p.speed;
    if (gameState.touchX !== null) p.x = gameState.touchX - p.width / 2;
    p.x = Math.max(0, Math.min(canvas.width - p.width, p.x));
    p.y = Math.max(0, Math.min(canvas.height - p.height, p.y));
  }

  // 生成敌机
  function spawnEnemy() {
    gameState.enemies.push({
      x: Math.random() * (canvas.width - 50),
      y: -50, width: 50, height: 50,
      speed: 2 + Math.random() * 2 * gameState.difficulty,
      health: 1
    });
  }

  // 生成道具
  function spawnPowerUp() {
    const types = ['power', 'score', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];
    gameState.powerUps.push({
      x: Math.random() * (canvas.width - 30),
      y: -30, width: 30, height: 30, speed: 2, type
    });
  }

  // 更新子弹（自动发射）
  function updateBullets(ts) {
    const p = gameState.player;
    if (ts - p.lastShot > p.shotDelay) { shootBullet(); p.lastShot = ts; }
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      const b = gameState.bullets[i];
      b.y -= b.speed;
      if (b.y < -b.height) gameState.bullets.splice(i, 1);
    }
  }

  // 发射子弹
  function shootBullet() {
    const p = gameState.player, cx = p.x + p.width / 2, cy = p.y;
    if (gameState.power === 1) {
      gameState.bullets.push({ x: cx - 5, y: cy, width: 10, height: 20, speed: 8, damage: 1 });
    } else if (gameState.power === 2) {
      gameState.bullets.push({ x: p.x + p.width / 3 - 5, y: cy, width: 10, height: 20, speed: 8, damage: 1 });
      gameState.bullets.push({ x: p.x + 2 * p.width / 3 - 5, y: cy, width: 10, height: 20, speed: 8, damage: 1 });
    } else {
      gameState.bullets.push({ x: cx - 5, y: cy, width: 10, height: 20, speed: 10, damage: 2 });
      gameState.bullets.push({ x: p.x + p.width / 4 - 5, y: cy, width: 10, height: 20, speed: 8, damage: 1 });
      gameState.bullets.push({ x: p.x + 3 * p.width / 4 - 5, y: cy, width: 10, height: 20, speed: 8, damage: 1 });
    }
  }

  // 更新敌机
  function updateEnemies() {
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      const e = gameState.enemies[i];
      e.y += e.speed;
      if (e.y > canvas.height) gameState.enemies.splice(i, 1);
    }
  }

  // 更新道具
  function updatePowerUps() {
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
      const pu = gameState.powerUps[i];
      pu.y += pu.speed;
      if (pu.y > canvas.height) gameState.powerUps.splice(i, 1);
    }
  }

  // 更新爆炸
  function updateExplosions() {
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
      const ex = gameState.explosions[i];
      ex.life -= 1;
      if (ex.life <= 0) gameState.explosions.splice(i, 1);
    }
  }

  // 更新道具剩余时间
  function updatePowerUpEffects(deltaTime) {
    const p = gameState.player;
    if (p.shield) {
      p.shieldTime -= 16;
      if (p.shieldTime <= 0) { p.shield = false; p.shieldTime = 0; }
    }
    if (gameState.scoreMultiplier > 1) {
      gameState.scoreMultiplierTime -= 16;
      if (gameState.scoreMultiplierTime <= 0) { gameState.scoreMultiplier = 1; gameState.scoreMultiplierTime = 0; }
    }
  }

  // 碰撞检测（倒序安全删除）
  function checkCollisions() {
    // 子弹 vs 敌人
    for (let i = gameState.bullets.length - 1; i >= 0; i--) {
      const b = gameState.bullets[i];
      for (let j = gameState.enemies.length - 1; j >= 0; j--) {
        const e = gameState.enemies[j];
        if (isColliding(b, e)) {
          e.health -= b.damage;
          gameState.bullets.splice(i, 1);
          if (e.health <= 0) {
            addExplosion(e.x + e.width / 2, e.y + e.height / 2);
            gameState.enemies.splice(j, 1);
            const pts = 10 * gameState.scoreMultiplier;
            gameState.score += pts;
            document.getElementById('score').textContent = gameState.score;
            showScoreAnimation(e.x + e.width / 2, e.y, pts);
          }
          break;
        }
      }
    }
    // 玩家 vs 敌人
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      const e = gameState.enemies[i];
      if (isColliding(gameState.player, e)) {
        addExplosion(e.x + e.width / 2, e.y + e.height / 2);
        gameState.enemies.splice(i, 1);
        if (gameState.player.shield) {
          gameState.player.shield = false; gameState.player.shieldTime = 0;
        } else {
          gameState.lives -= 1;
          document.getElementById('lives').textContent = gameState.lives;
          if (gameState.power > 1) { gameState.power = 1; document.getElementById('power').textContent = gameState.power; }
        }
      }
    }
    // 玩家 vs 道具
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
      const pu = gameState.powerUps[i];
      if (isColliding(gameState.player, pu)) {
        switch (pu.type) {
          case 'power': if (gameState.power < 3) { gameState.power++; document.getElementById('power').textContent = gameState.power; } break;
          case 'score': gameState.scoreMultiplier = 2; gameState.scoreMultiplierTime = 10000; break;
          case 'shield': gameState.player.shield = true; gameState.player.shieldTime = 5000; break;
        }
        gameState.powerUps.splice(i, 1);
      }
    }
  }

  // AABB 碰撞判断
  function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }

  // 爆炸效果
  function addExplosion(x, y) {
    gameState.explosions.push({ x, y, life: 15 });
    const dom = document.createElement('div');
    dom.className = 'explosion';
    dom.style.left = `${x - 25}px`; dom.style.top = `${y - 25}px`;
    document.getElementById('gameContainer').appendChild(dom);
    setTimeout(() => dom.remove(), 500);
  }

  // 得分动画
  function showScoreAnimation(x, y, pts) {
    const dom = document.createElement('div');
    dom.textContent = `+${pts}`;
    dom.style.position = 'absolute'; dom.style.left = `${x}px`; dom.style.top = `${y}px`;
    dom.style.color = 'yellow'; dom.style.fontWeight = 'bold'; dom.style.fontSize = '16px';
    dom.style.pointerEvents = 'none'; dom.style.zIndex = '1000'; dom.style.textShadow = '0 0 5px black';
    document.getElementById('gameContainer').appendChild(dom);
    let op = 1, yy = y;
    const anim = () => {
      op -= 0.05; yy -= 2;
      dom.style.opacity = op; dom.style.top = `${yy}px`;
      if (op > 0) requestAnimationFrame(anim); else dom.remove();
    };
    anim();
  }

  // 难度递增
  function updateDifficulty(ts) {
    if (ts % 30000 < 16) {
      gameState.difficulty += 0.2;
      if (gameState.enemySpawnRate > 300) gameState.enemySpawnRate -= 50;
    }
  }

  // 绘制游戏
  function drawGame() {
    const ctx = canvas.getContext('2d');
    ctx.drawImage(gameResources.backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(gameResources.playerImage, gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);
    if (gameState.player.shield) {
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(gameState.player.x + gameState.player.width / 2, gameState.player.y + gameState.player.height / 2, gameState.player.width / 2 + 10, 0, Math.PI * 2);
      ctx.fillStyle = 'blue'; ctx.fill(); ctx.globalAlpha = 1;
    }
    gameState.bullets.forEach(b => ctx.drawImage(gameResources.bulletImage, b.x, b.y, b.width, b.height));
    gameState.enemies.forEach(e => ctx.drawImage(gameResources.enemyImage, e.x, e.y, e.width, e.height));
    gameState.powerUps.forEach(pu => {
      let img = gameResources.powerUpImage;
      if (pu.type === 'score') img = gameResources.scoreUpImage;
      if (pu.type === 'shield') img = gameResources.shieldImage;
      ctx.drawImage(img, pu.x, pu.y, pu.width, pu.height);
    });
    gameState.explosions.forEach(ex => {
      const alpha = ex.life / 15;
      ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.arc(ex.x, ex.y, 30 - ex.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 107, 53, ${alpha})`; ctx.fill(); ctx.globalAlpha = 1;
    });
    if (gameState.scoreMultiplier > 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(10, canvas.height - 40, 120, 30);
      ctx.fillStyle = 'yellow'; ctx.font = '16px Arial'; const label = LANG.startsWith('zh') ? '得分' : 'Score';
      ctx.fillText(`${label} ${gameState.scoreMultiplier}x`, 20, canvas.height - 20);
    }
  }

  // 开始游戏
  function startGame() {
    // 重置状态
    Object.assign(gameState, {
      isRunning: true, score: 0, lives: 3, power: 1, difficulty: 1,
      lastEnemySpawn: 0, enemySpawnRate: 1000, lastPowerUpSpawn: 0, powerUpSpawnRate: 8000,
      bullets: [], enemies: [], powerUps: [], explosions: [], keys: {}, touchX: null,
      scoreMultiplier: 1, scoreMultiplierTime: 0
    });
    const p = gameState.player;
    p.x = canvas.width / 2 - p.width / 2; p.y = canvas.height - p.height - 20;
    p.lastShot = 0; p.shield = false; p.shieldTime = 0;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('power').textContent = gameState.power;
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('gameUI').classList.remove('hidden');
    requestAnimationFrame(gameLoop);
  }

  // 结束游戏
  function endGame() {
    gameState.isRunning = false;
    document.getElementById('gameOverScreen').classList.remove('hidden');
    document.getElementById('gameUI').classList.add('hidden');
    document.getElementById('finalScore').textContent = gameState.score;
  }

  // 资源加载完成后显示开始界面
  preloadResources().then(ok => {
    if (ok) {
      document.getElementById('startScreen').classList.remove('hidden');
      document.getElementById('gameOverScreen').classList.add('hidden');
      document.getElementById('gameUI').classList.add('hidden');
    } else {
      alert('游戏资源加载失败，请刷新页面重试');
    }
  });
}

// 页面就绪
window.addEventListener('DOMContentLoaded', initGame);