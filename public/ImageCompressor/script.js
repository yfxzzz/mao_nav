// 全局变量
let selectedFiles = [];
let compressedFiles = [];
let currentCompressionIndex = 0;

// DOM 元素
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const fileItems = document.getElementById('file-items');
const uploadContainer = document.getElementById('upload-container');
const settingsContainer = document.getElementById('settings-container');
const progressContainer = document.getElementById('progress-container');
const resultContainer = document.getElementById('result-container');
const compressBtn = document.getElementById('compress-btn');
const qualitySlider = document.getElementById('quality-slider');
const outputFormat = document.getElementById('output-format');
const overallProgressBar = document.getElementById('overall-progress-bar');
const overallProgressText = document.getElementById('overall-progress-text');
const currentFileName = document.getElementById('current-file-name');
const currentFileProgressBar = document.getElementById('current-file-progress-bar');
const currentFileProgress = document.getElementById('current-file-progress');
const progressStatus = document.getElementById('progress-status');
const resultItems = document.getElementById('result-items');
const downloadAllBtn = document.getElementById('download-all-btn');
const compressMoreBtn = document.getElementById('compress-more-btn');
const notification = document.getElementById('notification');
const notificationIcon = document.getElementById('notification-icon');
const notificationTitle = document.getElementById('notification-title');
const notificationMessage = document.getElementById('notification-message');
const notificationClose = document.getElementById('notification-close');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 移动端菜单
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
    
    // 文件拖放
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);
    dropArea.addEventListener('click', () => fileInput.click());
    
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 压缩按钮
    compressBtn.addEventListener('click', startCompression);
    
    // 压缩更多按钮
    compressMoreBtn.addEventListener('click', resetCompressor);
    
    // 下载所有按钮
    downloadAllBtn.addEventListener('click', downloadAllFiles);
    
    // 通知关闭按钮
    notificationClose.addEventListener('click', hideNotification);
    
    // 质量滑块与单选按钮联动
    document.querySelectorAll('input[name="quality"]').forEach(radio => {
        radio.addEventListener('change', updateQualitySlider);
    });
    
    qualitySlider.addEventListener('input', updateQualityRadio);
}

// 切换移动端菜单
function toggleMobileMenu() {
    mobileMenu.classList.toggle('hidden');
}

// 处理拖拽经过
function handleDragOver(e) {
    e.preventDefault();
    dropArea.classList.add('active');
}

// 处理拖拽离开
function handleDragLeave(e) {
    e.preventDefault();
    if (!dropArea.contains(e.relatedTarget)) {
        dropArea.classList.remove('active');
    }
}

// 处理文件拖放
function handleDrop(e) {
    e.preventDefault();
    dropArea.classList.remove('active');
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        processFiles(files);
    } else {
        showNotification('error', 'invalidFile', 'error');
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        processFiles(files);
    } else {
        showNotification('error', 'invalidFile', 'error');
    }
}

// 处理文件
function processFiles(files) {
    // 检查文件大小
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
        showNotification('warning', 'fileTooLarge', 'warning', { count: oversizedFiles.length });
    }
    
    // 过滤有效文件
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
    
    // 添加到选择列表
    selectedFiles = [...selectedFiles, ...validFiles];
    
    // 更新UI
    updateFileList();
    showSettings();
}

// 更新文件列表
function updateFileList() {
    if (selectedFiles.length === 0) {
        fileList.classList.add('hidden');
        return;
    }
    
    fileList.classList.remove('hidden');
    fileItems.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item fade-in';
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileSize = formatFileSize(file.size);
        
        fileItem.innerHTML = `
            <div class="file-item-icon">
                <i class="fa fa-file-image-o text-gray-500 text-xl"></i>
            </div>
            <div class="file-item-info">
                <div class="file-item-name">${file.name}</div>
                <div class="file-item-size">${fileSize} • ${file.type}</div>
            </div>
            <div class="file-item-remove" data-index="${index}">
                <i class="fa fa-times"></i>
            </div>
        `;
        
        fileItems.appendChild(fileItem);
    });
    
    // 添加删除事件
    document.querySelectorAll('.file-item-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            selectedFiles.splice(index, 1);
            updateFileList();
            
            if (selectedFiles.length === 0) {
                showUploadArea();
            }
        });
    });
}

// 显示设置区域
function showSettings() {
    uploadContainer.classList.add('hidden');
    settingsContainer.classList.remove('hidden');
    progressContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
}

// 显示上传区域
function showUploadArea() {
    uploadContainer.classList.remove('hidden');
    settingsContainer.classList.add('hidden');
    progressContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
}

// 显示进度区域
function showProgress() {
    uploadContainer.classList.add('hidden');
    settingsContainer.classList.add('hidden');
    progressContainer.classList.remove('hidden');
    resultContainer.classList.add('hidden');
}

// 显示结果区域
function showResults() {
    uploadContainer.classList.add('hidden');
    settingsContainer.classList.add('hidden');
    progressContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');
}

// 更新质量滑块
function updateQualitySlider() {
    const quality = document.querySelector('input[name="quality"]:checked').value;
    switch (quality) {
        case 'low':
            qualitySlider.value = 30;
            break;
        case 'medium':
            qualitySlider.value = 60;
            break;
        case 'high':
            qualitySlider.value = 80;
            break;
    }
}

// 更新质量单选按钮
function updateQualityRadio() {
    const value = parseInt(qualitySlider.value);
    let quality;
    
    if (value < 40) {
        quality = 'low';
    } else if (value < 70) {
        quality = 'medium';
    } else {
        quality = 'high';
    }
    
    document.querySelector(`input[name="quality"][value="${quality}"]`).checked = true;
}

// 开始压缩
function startCompression() {
    if (selectedFiles.length === 0) {
        showNotification('error', 'noFiles', 'error');
        return;
    }
    
    // 重置状态
    compressedFiles = [];
    currentCompressionIndex = 0;
    
    // 显示进度区域
    showProgress();
    updateProgress(0, '准备压缩...');
    
    // 开始压缩过程
    setTimeout(() => compressNextFile(), 500);
}

// 压缩下一个文件
function compressNextFile() {
    if (currentCompressionIndex >= selectedFiles.length) {
        // 所有文件压缩完成
        showResults();
        displayResults();
        showNotification('success', 'compressionComplete', 'success', { count: selectedFiles.length });
        return;
    }
    
    const file = selectedFiles[currentCompressionIndex];
    currentFileName.textContent = file.name;
    
    // 更新进度
    const overallProgress = Math.round((currentCompressionIndex / selectedFiles.length) * 100);
    updateProgress(overallProgress, `正在压缩 ${file.name}...`);
    
    // 读取文件
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            // 获取压缩质量
            const quality = parseInt(qualitySlider.value) / 100;
            
            // 获取输出格式
            let format = outputFormat.value;
            if (format === 'same') {
                format = file.type.split('/')[1];
            }
            
            // 压缩图片
            compressImage(img, file, quality, format, (compressedFile, beforeSize, afterSize) => {
                // 添加到结果列表
                compressedFiles.push({
                    original: file,
                    compressed: compressedFile,
                    beforeSize: beforeSize,
                    afterSize: afterSize,
                    compressionRatio: Math.round((1 - afterSize / beforeSize) * 100)
                });
                
                // 更新进度
                currentCompressionIndex++;
                const newOverallProgress = Math.round((currentCompressionIndex / selectedFiles.length) * 100);
                updateProgress(newOverallProgress, `已完成 ${currentCompressionIndex}/${selectedFiles.length}`);
                
                // 压缩下一个文件
                setTimeout(() => compressNextFile(), 100);
            });
        };
    };
}

// 压缩图片
function compressImage(img, originalFile, quality, format, callback) {
    const canvas = document.createElement('canvas');
    let width = img.width;
    let height = img.height;
    
    // 限制最大尺寸
    const maxDimension = 1920;
    if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // 转换格式
    let mimeType = 'image/jpeg';
    if (format === 'png') {
        mimeType = 'image/png';
    } else if (format === 'webp') {
        mimeType = 'image/webp';
    }
    
    // 转换为Blob
    canvas.toBlob((blob) => {
        const beforeSize = originalFile.size;
        const afterSize = blob.size;
        
        // 创建压缩后的文件
        const compressedFile = new File([blob], getCompressedFileName(originalFile.name, format), {
            type: mimeType
        });
        
        callback(compressedFile, beforeSize, afterSize);
    }, mimeType, quality);
}

// 获取压缩后的文件名
function getCompressedFileName(originalName, format) {
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
    return `${baseName}_compressed.${format}`;
}

// 更新进度
function updateProgress(overallProgress, statusText) {
    overallProgressBar.style.width = `${overallProgress}%`;
    overallProgressText.textContent = `${overallProgress}%`;
    progressStatus.textContent = statusText;
    
    // 如果是最后一个文件，显示100%
    if (overallProgress === 100) {
        currentFileProgressBar.style.width = '100%';
        currentFileProgress.textContent = '100%';
    } else {
        // 模拟当前文件进度
        const currentFileProgressValue = Math.min(100, Math.random() * 100);
        currentFileProgressBar.style.width = `${currentFileProgressValue}%`;
        currentFileProgress.textContent = `${Math.round(currentFileProgressValue)}%`;
    }
}

// 显示结果
function displayResults() {
    resultItems.innerHTML = '';
    
    compressedFiles.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item fade-in';
        
        // 获取压缩比例等级
        let ratioClass = 'fair';
        if (result.compressionRatio >= 70) {
            ratioClass = 'excellent';
        } else if (result.compressionRatio >= 30) {
            ratioClass = 'good';
        }
        
        resultItem.innerHTML = `
            <div class="result-header">
                <h3 class="font-medium text-gray-800">${result.original.name}</h3>
            </div>
            <div class="result-body">
                <div class="result-comparison">
                    <div class="result-image-container">
                        <h4 class="text-sm font-medium text-gray-700 mb-2">原图</h4>
                        <img src="${URL.createObjectURL(result.original)}" alt="原始图片" class="result-image">
                        <div class="result-info">
                            <div class="result-info-row">
                                <span class="result-info-label">文件大小:</span>
                                <span class="result-info-value">${formatFileSize(result.beforeSize)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="result-image-container">
                        <h4 class="text-sm font-medium text-gray-700 mb-2">压缩后</h4>
                        <img src="${URL.createObjectURL(result.compressed)}" alt="压缩后图片" class="result-image">
                        <div class="result-info">
                            <div class="result-info-row">
                                <span class="result-info-label">文件大小:</span>
                                <span class="result-info-value">${formatFileSize(result.afterSize)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="result-footer">
                <div>
                    <span class="text-gray-600">压缩率:</span>
                    <span class="result-compression-ratio ${ratioClass} ml-2">${result.compressionRatio}%</span>
                </div>
                <button class="download-btn bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors" data-index="${index}">
                    <i class="fa fa-download mr-1"></i> 下载
                </button>
            </div>
        `;
        
        resultItems.appendChild(resultItem);
    });
    
    // 添加下载事件
    document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            downloadFile(compressedFiles[index].compressed);
        });
    });
}

// 下载文件
function downloadFile(file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 下载所有文件
function downloadAllFiles() {
    if (compressedFiles.length === 1) {
        // 只有一个文件，直接下载
        downloadFile(compressedFiles[0].compressed);
    } else {
        // 多个文件，创建ZIP（这里简化为逐个下载）
        compressedFiles.forEach(result => {
            downloadFile(result.compressed);
        });
        showNotification('info', 'downloadStarted', 'info');
    }
}

// 重置压缩器
function resetCompressor() {
    selectedFiles = [];
    compressedFiles = [];
    currentCompressionIndex = 0;
    fileInput.value = '';
    updateFileList();
    showUploadArea();
}

// 显示通知
function showNotification(titleKey, messageKey, type = 'info', params = {}) {
    // 获取翻译文本
    const title = getNestedTranslation(translations[document.documentElement.lang || 'en'], `notifications.${titleKey}`) || titleKey;
    let message = getNestedTranslation(translations[document.documentElement.lang || 'en'], `notifications.${messageKey}`) || messageKey;
    
    // 替换消息中的参数
    if (params) {
        Object.keys(params).forEach(key => {
            message = message.replace(`{${key}}`, params[key]);
        });
    }
    // 设置图标和颜色
    let iconClass = 'fa-info-circle';
    let iconColor = 'text-primary';
    
    switch (type) {
        case 'success':
            iconClass = 'fa-check-circle';
            iconColor = 'text-success';
            break;
        case 'error':
            iconClass = 'fa-exclamation-circle';
            iconColor = 'text-danger';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            iconColor = 'text-warning';
            break;
    }
    
    notificationIcon.className = iconColor;
    notificationIcon.innerHTML = `<i class="fa ${iconClass} text-xl"></i>`;
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // 显示通知
    notification.classList.remove('translate-y-full', 'opacity-0');
    
    // 自动隐藏
    setTimeout(hideNotification, 5000);
}

// 隐藏通知
function hideNotification() {
    notification.classList.add('translate-y-full', 'opacity-0');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}