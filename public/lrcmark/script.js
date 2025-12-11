// LRC歌词制作工具 JavaScript 文件

// 全局变量
let audio = null;
let isPlaying = false;
let isMuted = false;
let originalVolume = 0.8;
let lyricsWithTimestamps = [];
let currentLanguage = 'en';

// DOM 元素
const audioFileInput = document.getElementById('audio-file');
const fileNameDisplay = document.getElementById('file-name');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const progressSlider = document.getElementById('progress-slider');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const muteBtn = document.getElementById('mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const lyricsInput = document.getElementById('lyrics-input');
const addTimestampBtn = document.getElementById('add-timestamp-btn');
const currentPlayTimeDisplay = document.getElementById('current-play-time');
const lyricsPreview = document.getElementById('lyrics-preview');
const saveTxtBtn = document.getElementById('save-txt-btn');
const saveLrcBtn = document.getElementById('save-lrc-btn');
const languageSelect = document.getElementById('language-select');
const notification = document.getElementById('notification');

// 语言包
const translations = {
  zh: {
    'app-title': 'LRC歌词制作工具',
    'upload-btn': '上传音频文件',
    'upload-text': '上传音频文件',
    'no-file': '未选择文件',
    'play-btn': '播放',
    'pause-btn': '暂停',
    'time-format': '00:00',
    'mute-btn': '静音',
    'lyrics-input-title': '歌词输入',
    'lyrics-placeholder': '在此输入歌词，每行一句...',
    'add-timestamp-btn': '添加时间戳',
    'add-timestamp-text': '添加时间戳',
    'current-time': '当前时间',
    'lyrics-preview-title': '歌词预览',
    'lyrics-preview-placeholder': '添加时间戳后，歌词将在此显示...',
    'save-txt-btn': '保存为TXT',
    'save-txt-text': '保存为TXT',
    'save-lrc-btn': '保存为LRC',
    'save-lrc-text': '保存为LRC',
    'instructions-title': '使用说明',
    'instructions-content': `
      <ol>
        <li>上传音频文件（支持MP3、WAV等常见格式）</li>
        <li>播放音频，在歌词输入框中输入歌词内容</li>
        <li>选中某行歌词，点击"添加时间戳"按钮为该行歌词添加当前播放时间</li>
        <li>在预览区查看带时间戳的歌词效果</li>
        <li>完成后，点击"保存为LRC"按钮下载LRC格式歌词文件</li>
      </ol>
    `,
    'instruction-step-1': '上传音频文件（支持MP3、WAV等常见格式）',
    'instruction-step-2': '播放音频，在歌词输入框中输入歌词内容',
    'instruction-step-3': '选中某行歌词，点击"添加时间戳"按钮为该行歌词添加当前播放时间',
    'instruction-step-4': '在预览区查看带时间戳的歌词效果',
    'instruction-step-5': '完成后，点击"保存为LRC"按钮下载LRC格式歌词文件',
    'notification-no-selection': '请先选择一行歌词',
    'notification-timestamp-added': '时间戳已添加',
    'notification-file-saved': '文件已保存',
    'notification-error': '发生错误，请重试',
    'notification-no-audio': '请先上传音频文件',
    'notification-no-lyrics': '请先添加歌词和时间戳'
  },
  en: {
    'app-title': 'LRC Maker',
    'upload-btn': 'Upload Audio',
    'upload-text': 'Upload Audio File',
    'no-file': 'No file selected',
    'play-btn': 'Play',
    'pause-btn': 'Pause',
    'time-format': '00:00',
    'mute-btn': 'Mute',
    'lyrics-input-title': 'Lyrics Input',
    'lyrics-placeholder': 'Enter lyrics here, one line per sentence...',
    'add-timestamp-btn': 'Add Timestamp',
    'add-timestamp-text': 'Add Timestamp',
    'current-time': 'Current Time',
    'lyrics-preview-title': 'Lyrics Preview',
    'lyrics-preview-placeholder': 'Lyrics with timestamps will appear here...',
    'save-txt-btn': 'Save as TXT',
    'save-txt-text': 'Save as TXT',
    'save-lrc-btn': 'Save as LRC',
    'save-lrc-text': 'Save as LRC',
    'instructions-title': 'Instructions',
    'instructions-content': `
      <ol>
        <li>Upload an audio file (supports MP3, WAV, and other common formats)</li>
        <li>Play the audio and enter lyrics in the input box</li>
        <li>Select a line of lyrics and click "Add Timestamp" to add the current playback time</li>
        <li>View the lyrics with timestamps in the preview area</li>
        <li>When finished, click "Save as LRC" to download the LRC format lyrics file</li>
      </ol>
    `,
    'instruction-step-1': 'Upload an audio file (supports MP3, WAV, and other common formats)',
    'instruction-step-2': 'Play the audio and enter lyrics in the input box',
    'instruction-step-3': 'Select a line of lyrics and click "Add Timestamp" to add the current playback time',
    'instruction-step-4': 'View the lyrics with timestamps in the preview area',
    'instruction-step-5': 'When finished, click "Save as LRC" to download the LRC format lyrics file',
    'notification-no-selection': 'Please select a line of lyrics first',
    'notification-timestamp-added': 'Timestamp added',
    'notification-file-saved': 'File saved',
    'notification-error': 'An error occurred, please try again',
    'notification-no-audio': 'Please upload an audio file first',
    'notification-no-lyrics': 'Please add lyrics and timestamps first'
  }
};

// 初始化函数
function init() {
  // 设置语言选择器初始值
  languageSelect.value = currentLanguage;
  
  // 添加事件监听器
  audioFileInput.addEventListener('change', handleAudioFileSelect);
  playBtn.addEventListener('click', playAudio);
  pauseBtn.addEventListener('click', pauseAudio);
  progressSlider.addEventListener('input', seekAudio);
  muteBtn.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', adjustVolume);
  addTimestampBtn.addEventListener('click', addTimestamp);
  saveTxtBtn.addEventListener('click', saveAsTxt);
  saveLrcBtn.addEventListener('click', saveAsLrc);
  languageSelect.addEventListener('change', changeLanguage);
  
  // 更新UI语言
  updateLanguageUI();
  
  // 禁用所有控制按钮，直到音频文件被上传
  disableControls();
}

// 处理音频文件选择
function handleAudioFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
    
    // 创建新的音频对象
    if (audio) {
      audio.pause();
      audio = null;
    }
    
    audio = new Audio(URL.createObjectURL(file));
    
    // 添加音频事件监听器
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleAudioEnd);
    
    // 启用控制按钮
    enableControls();
    
    // 更新音量滑块
    volumeSlider.value = originalVolume * 100;
    audio.volume = originalVolume;
    
    // 重置状态
    isPlaying = false;
    isMuted = false;
    updatePlayButtonState();
    updateMuteButtonState();
  }
}

// 更新音频时长
function updateDuration() {
  const duration = audio.duration;
  durationDisplay.textContent = formatTime(duration);
  progressSlider.max = duration;
}

// 更新播放进度
function updateProgress() {
  const currentTime = audio.currentTime;
  currentTimeDisplay.textContent = formatTime(currentTime);
  progressSlider.value = currentTime;
  currentPlayTimeDisplay.textContent = formatTimeWithMillis(currentTime);
}

// 处理音频播放结束
function handleAudioEnd() {
  isPlaying = false;
  updatePlayButtonState();
}

// 播放音频
function playAudio() {
  if (!audio) {
    showNotification('notification-no-audio', 'error');
    return;
  }
  
  audio.play()
    .then(() => {
      isPlaying = true;
      updatePlayButtonState();
    })
    .catch(error => {
      console.error('Error playing audio:', error);
      showNotification('notification-error', 'error');
    });
}

// 暂停音频
function pauseAudio() {
  if (audio) {
    audio.pause();
    isPlaying = false;
    updatePlayButtonState();
  }
}

// 跳转音频
function seekAudio() {
  if (audio) {
    audio.currentTime = progressSlider.value;
  }
}

// 切换静音
function toggleMute() {
  if (!audio) return;
  
  if (isMuted) {
    audio.volume = originalVolume;
    volumeSlider.value = originalVolume * 100;
  } else {
    originalVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
  }
  
  isMuted = !isMuted;
  updateMuteButtonState();
}

// 调整音量
function adjustVolume() {
  if (!audio) return;
  
  const volume = volumeSlider.value / 100;
  audio.volume = volume;
  
  if (volume === 0) {
    isMuted = true;
  } else {
    isMuted = false;
    originalVolume = volume;
  }
  
  updateMuteButtonState();
}

// 添加时间戳
function addTimestamp() {
  if (!audio) {
    showNotification('notification-no-audio', 'error');
    return;
  }
  
  const startPos = lyricsInput.selectionStart;
  const endPos = lyricsInput.selectionEnd;
  
  if (startPos === endPos) {
    // 没有选中文本，尝试找到当前行
    const text = lyricsInput.value;
    const lines = text.split('\n');
    let currentLineStart = 0;
    let currentLineIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentLineStart + lines[i].length + 1; // +1 for the newline
      
      if (startPos >= currentLineStart && startPos < lineEnd) {
        currentLineIndex = i;
        break;
      }
      
      currentLineStart = lineEnd;
    }
    
    if (currentLineIndex === -1) {
      showNotification('notification-no-selection', 'error');
      return;
    }
    
    // 选中当前行
    const lineStart = text.substring(0, startPos).lastIndexOf('\n') + 1;
    const lineEnd = text.indexOf('\n', startPos);
    
    if (lineEnd === -1) {
      lyricsInput.setSelectionRange(lineStart, text.length);
    } else {
      lyricsInput.setSelectionRange(lineStart, lineEnd);
    }
  }
  
  // 获取选中的文本
  const selectedText = lyricsInput.value.substring(lyricsInput.selectionStart, lyricsInput.selectionEnd).trim();
  
  // 获取当前播放时间
  const currentTime = audio.currentTime;
  const timestamp = formatTimeWithMillis(currentTime);
  
  // 创建带时间戳的歌词行（允许空行添加时间戳）
  const timestampedLine = `[${timestamp}]${selectedText}`;
  
  // 保存当前选中区域的位置信息
  const originalStart = lyricsInput.selectionStart;
  const originalEnd = lyricsInput.selectionEnd;
  
  // 替换选中的文本
  const newText = lyricsInput.value.substring(0, originalStart) + 
                  timestampedLine + 
                  lyricsInput.value.substring(originalEnd);
  
  // 计算添加时间戳后的新位置
  const newPosition = originalStart + timestampedLine.length;
  
  // 设置新的文本内容
  lyricsInput.value = newText;
  
  // 计算新光标位置（添加时间戳行的下一行开头，跳过空行）
  setTimeout(() => {
    // 获取完整文本
    const fullText = lyricsInput.value;
    
    // 找到添加时间戳行的结束位置
    let nextLineStart = fullText.indexOf('\n', newPosition);
    
    if (nextLineStart === -1) {
      // 如果没有找到换行符，说明已经是最后一行
      nextLineStart = fullText.length;
    } else {
      // 移动到下一行开头
      nextLineStart += 1;
      
      // 跳过所有空行，直到找到有内容的行
      while (nextLineStart < fullText.length) {
        // 找到下一个换行符，确定当前行的范围
        const nextLineEnd = fullText.indexOf('\n', nextLineStart);
        const lineEndPos = nextLineEnd === -1 ? fullText.length : nextLineEnd;
        
        // 提取当前行文本并检查是否为空
        const currentLineText = fullText.substring(nextLineStart, lineEndPos).trim();
        
        if (currentLineText) {
          // 找到非空行，停止查找
          break;
        } else if (nextLineEnd === -1) {
          // 已经到文本末尾，没有找到非空行
          break;
        } else {
          // 跳过空行，继续查找下一行
          nextLineStart = lineEndPos + 1;
        }
      }
    }
    
    // 确保光标位置有效
    const validCursorPos = Math.min(nextLineStart, fullText.length);
    
    // 强制设置光标位置
    lyricsInput.focus();
    lyricsInput.setSelectionRange(validCursorPos, validCursorPos);
    
    // 简单直接的滚动方法：将光标位置滚动到可视区域
    setTimeout(() => {
      try {
        // 获取光标位置
        const cursorPos = validCursorPos;
        
        // 设置滚动位置，使光标位置在可视区域内
        // 计算光标所在行的大致位置（基于平均字符高度估算）
        const avgCharHeight = 20; // 平均字符高度（像素）
        const lineNumber = fullText.substring(0, cursorPos).split('\n').length;
        const estimatedLinePosition = lineNumber * avgCharHeight;
        
        // 如果估算的行位置不在可视区域内，则滚动
        if (estimatedLinePosition < lyricsInput.scrollTop || 
            estimatedLinePosition > lyricsInput.scrollTop + lyricsInput.clientHeight) {
          
          // 滚动到光标位置附近
          lyricsInput.scrollTop = estimatedLinePosition - lyricsInput.clientHeight / 2;
        }
      } catch (e) {
        console.error('滚动错误:', e);
      }
    }, 50); // 增加延迟确保DOM完全更新
  }, 10); // 增加一点延迟确保DOM更新完成
  
  // 更新预览
  updateLyricsPreview();
  
  // 显示通知
  showNotification('notification-timestamp-added', 'success');
}

// 更新歌词预览
function updateLyricsPreview() {
  const text = lyricsInput.value;
  
  if (!text.trim()) {
    lyricsPreview.textContent = translations[currentLanguage]['lyrics-preview-placeholder'];
    return;
  }
  
  // 解析歌词和时间戳
  const lines = text.split('\n');
  lyricsWithTimestamps = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const timestampMatch = trimmedLine.match(/^\[(\d{2}:\d{2}\.\d{2})\](.*)$/);
    
    if (timestampMatch) {
      const timestamp = timestampMatch[1];
      const lyric = timestampMatch[2].trim();
      
      if (lyric) {
        lyricsWithTimestamps.push({
          timestamp,
          lyric,
          originalLine: trimmedLine
        });
      }
    }
  }
  
  // 按时间戳排序
  lyricsWithTimestamps.sort((a, b) => {
    const timeA = parseTime(a.timestamp);
    const timeB = parseTime(b.timestamp);
    return timeA - timeB;
  });
  
  // 更新预览
  if (lyricsWithTimestamps.length > 0) {
    lyricsPreview.textContent = lyricsWithTimestamps.map(item => item.originalLine).join('\n');
    
    // 启用保存按钮
    saveTxtBtn.disabled = false;
    saveLrcBtn.disabled = false;
  } else {
    lyricsPreview.textContent = translations[currentLanguage]['lyrics-preview-placeholder'];
    
    // 禁用保存按钮
    saveTxtBtn.disabled = true;
    saveLrcBtn.disabled = true;
  }
}

// 保存为TXT
function saveAsTxt() {
  if (lyricsWithTimestamps.length === 0) {
    showNotification('notification-no-lyrics', 'error');
    return;
  }
  
  const content = lyricsWithTimestamps.map(item => item.originalLine).join('\n');
  downloadFile(content, 'lyrics.txt', 'text/plain');
  showNotification('notification-file-saved', 'success');
}

// 保存为LRC
function saveAsLrc() {
  if (lyricsWithTimestamps.length === 0) {
    showNotification('notification-no-lyrics', 'error');
    return;
  }
  
  // LRC文件头部
  let content = '[ti:Unknown Title]\n[ar:Unknown Artist]\n[al:Unknown Album]\n[by:LRC Maker]\n\n';
  
  // 添加歌词行
  content += lyricsWithTimestamps.map(item => item.originalLine).join('\n');
  
  downloadFile(content, 'lyrics.lrc', 'text/plain');
  showNotification('notification-file-saved', 'success');
}

// 下载文件
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

// 更改语言
function changeLanguage() {
  currentLanguage = languageSelect.value;
  updateLanguageUI();
}

// 更新UI语言
function updateLanguageUI() {
  document.documentElement.lang = currentLanguage;
  
  // 更新页面标题
  if (currentLanguage === 'en') {
    document.title = 'LRC Maker';
  } else {
    document.title = 'LRC歌词在线制作';
  }
  
  // 更新所有带data-lang属性的元素
  document.querySelectorAll('[data-lang]').forEach(element => {
    const key = element.getAttribute('data-lang');
    
    if (element.tagName === 'INPUT' && element.type === 'text') {
      element.placeholder = translations[currentLanguage][key];
    } else if (element.tagName === 'TEXTAREA') {
      element.placeholder = translations[currentLanguage][key];
    } else if (key === 'instructions-content') {
      element.innerHTML = translations[currentLanguage][key];
    } else {
      element.textContent = translations[currentLanguage][key];
    }
  });
  
  // 更新歌词预览占位符
  if (!lyricsInput.value.trim()) {
    lyricsPreview.textContent = translations[currentLanguage]['lyrics-preview-placeholder'];
  }
}

// 启用控制按钮
function enableControls() {
  playBtn.disabled = false;
  pauseBtn.disabled = false;
  progressSlider.disabled = false;
  muteBtn.disabled = false;
  volumeSlider.disabled = false;
  addTimestampBtn.disabled = false;
}

// 禁用控制按钮
function disableControls() {
  playBtn.disabled = true;
  pauseBtn.disabled = true;
  progressSlider.disabled = true;
  muteBtn.disabled = true;
  volumeSlider.disabled = true;
  addTimestampBtn.disabled = true;
  saveTxtBtn.disabled = true;
  saveLrcBtn.disabled = true;
}

// 更新播放按钮状态
function updatePlayButtonState() {
  playBtn.style.display = isPlaying ? 'none' : 'flex';
  pauseBtn.style.display = isPlaying ? 'flex' : 'none';
}

// 更新静音按钮状态
function updateMuteButtonState() {
  const icon = muteBtn.querySelector('i');
  
  if (isMuted) {
    icon.className = 'fas fa-volume-mute';
  } else if (audio && audio.volume < 0.5) {
    icon.className = 'fas fa-volume-down';
  } else {
    icon.className = 'fas fa-volume-up';
  }
}

// 格式化时间（分:秒）
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 格式化时间（分:秒.毫秒）
function formatTimeWithMillis(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
}

// 解析时间字符串为秒数
function parseTime(timeStr) {
  const parts = timeStr.split(':');
  const mins = parseInt(parts[0], 10);
  const secParts = parts[1].split('.');
  const secs = parseInt(secParts[0], 10);
  const millis = parseInt(secParts[1] || '0', 10);
  
  return mins * 60 + secs + millis / 100;
}

// 显示通知
function showNotification(messageKey, type) {
  notification.textContent = translations[currentLanguage][messageKey];
  notification.className = `notification ${type}`;
  
  setTimeout(() => {
    notification.classList.add('hidden');
  }, 3000);
}

// 监听歌词输入变化
lyricsInput.addEventListener('input', updateLyricsPreview);

// 初始化应用
window.addEventListener('DOMContentLoaded', init);