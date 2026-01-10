// lang.js：根据文件名高亮当前语言
(() => {
  const file = location.pathname.split('/').pop(); // index.html 或 en.html
  const lang = file.includes('en') ? 'en' : 'zh';
  document.querySelector(`.lang-switch a.${lang}`)?.classList.add('active');
})();