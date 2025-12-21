// 骰子图片数组
const diceImages = [
    "img/1.png", // 1点
    "img/2.png", // 2点
    "img/3.png", // 3点
    "img/4.png", // 4点
    "img/5.png", // 5点
    "img/6.png"  // 6点
];

// 获取DOM元素
const diceImage = document.getElementById('diceImage');
const rollButton = document.getElementById('rollButton');
const diceContainer = document.querySelector('.dice-container');

// 掷骰子函数
function rollDice() {
    // 禁用按钮，防止重复点击
    rollButton.disabled = true;
    
    // 添加滚动动画类
    diceContainer.classList.add('rolling');
    
    // 设置初始图片为1点
    diceImage.src = diceImages[0];
    
    // 随机滚动时间（1-2秒）
    const rollDuration = 1000 + Math.random() * 1000;
    
    // 快速切换图片模拟滚动效果
    let rollInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 6);
        diceImage.src = diceImages[randomIndex];
    }, 100);
    
    // 滚动结束后显示最终结果
    setTimeout(() => {
        // 清除滚动间隔
        clearInterval(rollInterval);
        
        // 移除滚动动画类
        diceContainer.classList.remove('rolling');
        
        // 随机生成最终点数（0-5，对应1-6点）
        const finalResult = Math.floor(Math.random() * 6);
        
        // 显示最终结果图片
        diceImage.src = diceImages[finalResult];
        
        // 启用按钮
        rollButton.disabled = false;
    }, rollDuration);
}

// 语言切换函数
function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    const selectedLanguage = languageSelect.value;
    
    // 根据选择的语言跳转到对应页面
    if (selectedLanguage === 'zh') {
        window.location.href = 'index.html';
    } else if (selectedLanguage === 'en') {
        window.location.href = 'en.html';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保按钮初始状态为启用
    rollButton.disabled = false;
    
    // 设置默认图片为1点
    diceImage.src = diceImages[0];
});