const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');

// 扩展搜索建议数据
const sampleSuggestions = [
    '热门搜索',
    '今日新闻',
    '天气预报',
    '视频直播',
    '在线地图',
    '购物',
    '游戏',
    '音乐'
];

// 获取搜索历史
let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
let currentSelection = -1;

searchInput.addEventListener('input', function(e) {
    const value = e.target.value.trim();
    currentSelection = -1;
    
    if (value.length > 0) {
        // 合并搜索建议和历史记录
        const suggestions = [...new Set([
            ...searchHistory.filter(item => item.includes(value)),
            ...sampleSuggestions.filter(item => item.includes(value))
        ])].slice(0, 8);
        
        showSuggestions(suggestions);
    } else {
        showSuggestions(searchHistory.slice(0, 5));
    }
});

// 处理键盘事件
searchInput.addEventListener('keydown', function(e) {
    const suggestions = document.querySelectorAll('.suggestion-item');
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            currentSelection = Math.min(currentSelection + 1, suggestions.length - 1);
            updateSelection(suggestions);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            currentSelection = Math.max(currentSelection - 1, -1);
            updateSelection(suggestions);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (currentSelection >= 0 && suggestions[currentSelection]) {
                searchInput.value = suggestions[currentSelection].textContent;
            }
            performSearch();
            break;
    }
});

function updateSelection(suggestions) {
    suggestions.forEach((item, index) => {
        item.classList.toggle('selected', index === currentSelection);
        if (index === currentSelection) {
            searchInput.value = item.textContent;
        }
    });
}

function showSuggestions(suggestions) {
    const suggestionsBox = document.getElementById('suggestions');
    if (!suggestionsBox) return;

    if (!suggestions || suggestions.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }

    suggestionsBox.innerHTML = '';
    suggestions.forEach((suggestion, index) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        
        // 防止 XSS 攻击
        const sanitizedSuggestion = suggestion.replace(/[<>]/g, '');
        
        if (searchHistory.includes(sanitizedSuggestion)) {
            div.innerHTML = `
                <i class="history-icon">⌛</i>
                <span>${sanitizedSuggestion}</span>
                <i class="delete-icon" onclick="removeFromHistory('${sanitizedSuggestion}', event)">✕</i>
            `;
        } else {
            div.innerHTML = `<i class="search-icon">🔍</i> ${sanitizedSuggestion}`;
        }
        
        div.onclick = (e) => {
            if (!e.target.classList.contains('delete-icon')) {
                searchInput.value = sanitizedSuggestion;
                suggestionsBox.style.display = 'none';
                performSearch();
            }
        };
        suggestionsBox.appendChild(div);
    });
    
    suggestionsBox.style.display = 'block';
}

// 搜索引擎配置
const searchEngines = {
    baidu: {
        name: '百度',
        url: 'https://www.baidu.com/s?wd=',
        icon: 'https://www.baidu.com/favicon.ico'
    },
    google: {
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        icon: 'https://www.google.com/favicon.ico'
    },
    bing: {
        name: '必应',
        url: 'https://www.bing.com/search?q=',
        icon: 'https://www.bing.com/favicon.ico'
    },
    github: {
        name: 'GitHub',
        url: 'https://github.com/search?q=',
        icon: 'https://github.com/favicon.ico'
    },
    stackoverflow: {
        name: 'Stack Overflow',
        url: 'https://stackoverflow.com/search?q=',
        icon: 'https://stackoverflow.com/favicon.ico'
    },
    scholar: {
        name: '谷歌学术',
        url: 'https://scholar.google.com/scholar?q=',
        icon: 'https://scholar.google.com/favicon.ico'
    },
    cnki: {
        name: '中国知网',
        url: 'https://kns.cnki.net/kns8/defaultresult/index?q=',
        icon: 'https://www.cnki.net/favicon.ico'
    }
};

// 当前选择的搜索引擎
let currentEngine = 'baidu';

// 初始化搜索引擎选择器
const currentEngineEl = document.getElementById('currentEngine');
const engineOptions = document.getElementById('engineOptions');

// 切换搜索引擎选项的显示/隐藏
currentEngineEl.addEventListener('click', () => {
    currentEngineEl.classList.toggle('active');
    engineOptions.style.display = engineOptions.style.display === 'block' ? 'none' : 'block';
});

// 点击其他地方时隐藏搜索引擎选项
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-engine-selector')) {
        currentEngineEl.classList.remove('active');
        engineOptions.style.display = 'none';
    }
});

// 选择搜索引擎
document.querySelectorAll('.engine-option').forEach(option => {
    option.addEventListener('click', () => {
        const engine = option.dataset.engine;
        currentEngine = engine;
        
        // 更新当前显示的搜索引擎
        currentEngineEl.innerHTML = `
            <img src="${searchEngines[engine].icon}" alt="${searchEngines[engine].name}" />
            <span>${searchEngines[engine].name}</span>
            <span class="arrow">▼</span>
        `;
        
        // 保存用户选择
        localStorage.setItem('preferredEngine', engine);
        
        // 隐藏选项
        engineOptions.style.display = 'none';
        currentEngineEl.classList.remove('active');
    });
});

// 修改搜索函数
function performSearch() {
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        // 保存到搜索历史
        if (!searchHistory.includes(searchTerm)) {
            searchHistory.unshift(searchTerm);
            searchHistory = searchHistory.slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        }
        
        // 使用选择的搜索引擎
        window.location.href = searchEngines[currentEngine].url + encodeURIComponent(searchTerm);
    }
}

// 加载用户之前选择的搜索引擎
document.addEventListener('DOMContentLoaded', () => {
    // 确保元素存在
    const engineOptions = document.getElementById('engineOptions');
    if (engineOptions) {
        engineOptions.style.display = 'none'; // 初始状态隐藏
    }

    // 加载保存的搜索引擎
    const savedEngine = localStorage.getItem('preferredEngine');
    if (savedEngine && searchEngines[savedEngine]) {
        currentEngine = savedEngine;
        const currentEngineEl = document.getElementById('currentEngine');
        if (currentEngineEl) {
            currentEngineEl.innerHTML = `
                <img src="${searchEngines[savedEngine].icon}" alt="${searchEngines[savedEngine].name}" />
                <span>${searchEngines[savedEngine].name}</span>
                <span class="arrow">▼</span>
            `;
        }
    }

    // 初始化其他功能
    initHotSearches();
    updateClearHistoryButton();
    getWeather();

    // 在 DOMContentLoaded 事件中添加工具按钮的事件监听
    document.addEventListener('DOMContentLoaded', function() {
        // 计算器按钮
        const calcButton = document.querySelector('[onclick="showCalculator()"]');
        if (calcButton) {
            calcButton.onclick = function(e) {
                e.preventDefault();
                showCalculator();
            };
        }

        // 翻译按钮
        const translateButton = document.querySelector('[onclick="showTranslator()"]');
        if (translateButton) {
            translateButton.onclick = function(e) {
                e.preventDefault();
                showTranslator();
            };
        }

        // 便签按钮
        const notesButton = document.querySelector('[onclick="showNotes()"]');
        if (notesButton) {
            notesButton.onclick = function(e) {
                e.preventDefault();
                showNotes();
            };
        }
    });
});

// 点击页面其他地方时隐藏搜索建议
document.addEventListener('click', function(e) {
    if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
        suggestionsBox.style.display = 'none';
    }
}); 

// 添加深色模式切换功能
const themeToggle = document.getElementById('themeToggle');
const clearHistoryBtn = document.getElementById('clearHistory');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
});

// 初始化主题
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

// 显/隐藏清除历史按钮
function updateClearHistoryButton() {
    clearHistoryBtn.style.display = searchHistory.length > 0 ? 'block' : 'none';
}

// 清除搜索历史
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('确定要清除所有搜索历史吗？')) {
        searchHistory = [];
        localStorage.removeItem('searchHistory');
        suggestionsBox.style.display = 'none';
        updateClearHistoryButton();
    }
});

// 从历史记录中删除单个项目
function removeFromHistory(item, event) {
    event.stopPropagation();
    searchHistory = searchHistory.filter(h => h !== item);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    showSuggestions(searchHistory.slice(0, 5));
}

// 初始化时更新清除历史按钮状态
updateClearHistoryButton(); 

// 添加热搜功能
const hotSearches = [
    { text: "热门电影", hot: 9999 },
    { text: "今日新闻", hot: 8888 },
    { text: "最新游戏", hot: 7777 },
    { text: "流行音乐", hot: 6666 },
    { text: "美食推荐", hot: 5555 },
    { text: "旅游攻略", hot: 4444 },
    { text: "科技资讯", hot: 3333 },
    { text: "健康知识", hot: 2222 }
];

function initHotSearches() {
    const hotList = document.querySelector('.hot-list');
    if (!hotList) return;
    
    hotList.innerHTML = '';
    hotSearches.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'hot-item';
        div.innerHTML = `
            <span class="hot-rank">${index + 1}</span>
            <span class="hot-text">${item.text}</span>
        `;
        div.onclick = () => {
            searchInput.value = item.text;
            performSearch();
        };
        hotList.appendChild(div);
    });
}

// 添加语音搜索功能
const voiceSearchBtn = document.getElementById('voiceSearch');

voiceSearchBtn.addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            voiceSearchBtn.textContent = '🎤 听写中...';
            voiceSearchBtn.style.color = 'red';
        };

        recognition.onend = () => {
            voiceSearchBtn.textContent = '🎤';
            voiceSearchBtn.style.color = '';
        };

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            searchInput.value = text;
            performSearch();
        };

        recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            alert('语音识别失败，请重试');
        };

        recognition.start();
    } else {
        alert('您的浏览器不支持语音识别功能');
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initHotSearches();
    // 检查并应用保存的主题设置
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
    updateClearHistoryButton();
});

// 添加窗口大小改变时的处理
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        document.querySelector('.hot-list').style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';
    } else {
        document.querySelector('.hot-list').style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
    }
}); 

// 更新 emoji 数组，按类别组织
const emojiGroups = {
    tech: ['💻', '📱', '🖥️', '⌨️', '🖱️', '🔍', '📡', '🛰️', '🤖', '💡'],
    fun: ['✨', '🌟', '⭐', '🎉', '🎊', '🎨', '🎭', '🎪', '🎵', '🎼'],
    nature: ['🌈', '🌸', '🍀', '🌺', '🌻', '🌹', '🌷', '🌼', '🌿', '🍃'],
    magic: ['🔮', '⚡', '💫', '', '🎯', '🎪', '🎭', '🎨', '🎪', '🎢']
};

let lastEmojiTime = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let mouseSpeed = 0;
let currentGroup = 'tech';
let groupChangeTimeout;

// 周期性切换 emoji 组
function rotateEmojiGroup() {
    const groups = Object.keys(emojiGroups);
    const currentIndex = groups.indexOf(currentGroup);
    currentGroup = groups[(currentIndex + 1) % groups.length];
}

// 5秒切换一次 emoji 组
setInterval(rotateEmojiGroup, 5000);

// 听鼠标移动
document.addEventListener('mousemove', (e) => {
    const currentTime = Date.now();
    
    // 计算鼠标移动速度
    const moveX = e.clientX - lastMouseX;
    const moveY = e.clientY - lastMouseY;
    mouseSpeed = Math.sqrt(moveX * moveX + moveY * moveY);
    
    // 根据移动速度调整生成频率和大小
    const delay = mouseSpeed > 50 ? 50 : 200;
    
    if (currentTime - lastEmojiTime > delay) {
        createEmoji(e.clientX, e.clientY);
        lastEmojiTime = currentTime;
    }
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

// 添加点击特效
document.addEventListener('click', (e) => {
    // 创建环形动画
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            createEmoji(e.clientX, e.clientY, true, (Math.PI * 2 * i) / 12);
        }, i * 50);
    }
});

function createEmoji(x, y, isClick = false, angle = null) {
    const emojis = emojiGroups[currentGroup];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const emojiElement = document.createElement('div');
    emojiElement.className = 'floating-emoji';
    emojiElement.textContent = emoji;
    
    // 根据鼠标速度调整大小
    const baseSize = isClick ? 24 : 16;
    const speedFactor = Math.min(mouseSpeed / 50, 2);
    const size = baseSize * (0.8 + Math.random() * 0.4) * (isClick ? 1 : speedFactor);
    emojiElement.style.fontSize = `${size}px`;
    
    // 设置初始位置
    emojiElement.style.left = `${x}px`;
    emojiElement.style.top = `${y}px`;
    
    if (isClick) {
        // 点击时的环形扩散效果
        const distance = 100 + Math.random() * 50;
        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;
        
        emojiElement.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        setTimeout(() => {
            emojiElement.style.transform = `
                translate(${targetX - x}px, ${targetY - y}px) 
                rotate(${Math.random() * 360}deg) 
                scale(${0.5 + Math.random() * 0.5})
            `;
            emojiElement.style.opacity = '0';
        }, 0);
    } else {
        // 移动时的随机飘动效果
        const randomAngle = Math.random() * Math.PI * 2;
        const distance = 30 + mouseSpeed;
        const targetX = x + Math.cos(randomAngle) * distance;
        const targetY = y + Math.sin(randomAngle) * distance - 100;
        
        emojiElement.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            emojiElement.style.transform = `
                translate(${targetX - x}px, ${targetY - y}px) 
                rotate(${Math.random() * 90 - 45}deg)
                scale(${0.2 + Math.random() * 0.3})
            `;
            emojiElement.style.opacity = '0';
        }, 0);
    }
    
    document.body.appendChild(emojiElement);
    
    // 动画结束后移除元素
    setTimeout(() => {
        document.body.removeChild(emojiElement);
    }, 1000);
}

// 修改天气功能
async function getWeather() {
    const weatherInfo = document.querySelector('.temperature');
    if (!weatherInfo) return;

    try {
        // 这里使用模拟数据，实际应用中应该调用真实的天气 API
        const weatherData = {
            temperature: '23°C',
            condition: '晴朗'
        };
        
        weatherInfo.innerHTML = `
            <span class="weather-temp">${weatherData.temperature}</span>
            <span class="weather-cond">${weatherData.condition}</span>
        `;
    } catch (error) {
        console.error('获取天气信息失败:', error);
        weatherInfo.textContent = '天气信息获取失败';
    }
}

// 定期更新天气
setInterval(getWeather, 1800000); // 每30分钟更新一次

// 计算器功能
function showCalculator() {
    const calc = document.createElement('div');
    calc.className = 'tool-popup calculator';
    calc.style.opacity = '0';
    calc.innerHTML = `
        <div class="tool-header">
            <h3>计算器</h3>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="calc-content">
            <input type="text" id="calcDisplay" readonly value="0">
            <div class="calc-buttons">
                <button onclick="clearCalc()">C</button>
                <button onclick="appendToCalc('(')">(</button>
                <button onclick="appendToCalc(')')">)</button>
                <button onclick="appendToCalc('/')">/</button>
                <button onclick="appendToCalc('7')">7</button>
                <button onclick="appendToCalc('8')">8</button>
                <button onclick="appendToCalc('9')">9</button>
                <button onclick="appendToCalc('*')">×</button>
                <button onclick="appendToCalc('4')">4</button>
                <button onclick="appendToCalc('5')">5</button>
                <button onclick="appendToCalc('6')">6</button>
                <button onclick="appendToCalc('-')">-</button>
                <button onclick="appendToCalc('1')">1</button>
                <button onclick="appendToCalc('2')">2</button>
                <button onclick="appendToCalc('3')">3</button>
                <button onclick="appendToCalc('+')">+</button>
                <button onclick="appendToCalc('0')">0</button>
                <button onclick="appendToCalc('.')">.</button>
                <button onclick="deleteLastChar()">←</button>
                <button onclick="calculateResult()">=</button>
            </div>
        </div>
    `;
    showToolPopup(calc);
}

// 计算器辅助函数
function appendToCalc(value) {
    const display = document.getElementById('calcDisplay');
    if (display.value === '0' && !isNaN(value)) {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearCalc() {
    document.getElementById('calcDisplay').value = '0';
}

function deleteLastChar() {
    const display = document.getElementById('calcDisplay');
    display.value = display.value.slice(0, -1) || '0';
}

function calculateResult() {
    const display = document.getElementById('calcDisplay');
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = 'Error';
        setTimeout(clearCalc, 1000);
    }
}

// 翻译功能
function showTranslator() {
    const translator = document.createElement('div');
    translator.className = 'tool-popup translator';
    translator.style.opacity = '0';
    translator.innerHTML = `
        <div class="tool-header">
            <h3>翻译工具</h3>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="translator-content">
            <div class="lang-select">
                <select id="fromLang">
                    <option value="auto">自动检测</option>
                    <option value="zh-CN">中文</option>
                    <option value="en">英语</option>
                    <option value="ja">日语</option>
                    <option value="ko">韩语</option>
                    <option value="fr">法语</option>
                    <option value="de">德语</option>
                    <option value="es">西班牙语</option>
                    <option value="ru">俄语</option>
                </select>
                <button onclick="swapLanguages()" class="swap-btn">🔄</button>
                <select id="toLang">
                    <option value="zh-CN">中文</option>
                    <option value="en">英语</option>
                    <option value="ja">日语</option>
                    <option value="ko">韩语</option>
                    <option value="fr">法语</option>
                    <option value="de">德语</option>
                    <option value="es">西班牙语</option>
                    <option value="ru">俄语</option>
                </select>
            </div>
            <textarea id="sourceText" placeholder="请输入要翻译的文本" oninput="autoTranslate()"></textarea>
            <div class="translate-controls">
                <button onclick="clearText()" class="clear-btn">清空</button>
                <button onclick="copyResult()" class="copy-btn">复制结果</button>
                <button onclick="translateText()" class="translate-btn">翻译</button>
            </div>
            <textarea id="targetText" readonly placeholder="翻译结果"></textarea>
        </div>
    `;
    showToolPopup(translator);

    // 添加自动翻译延迟
    let translateTimeout;
    function autoTranslate() {
        clearTimeout(translateTimeout);
        translateTimeout = setTimeout(translateText, 1000);
    }
}

// 翻译辅助函数
function swapLanguages() {
    const fromLang = document.getElementById('fromLang');
    const toLang = document.getElementById('toLang');
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    
    if (fromLang.value !== 'auto') {
        [fromLang.value, toLang.value] = [toLang.value, fromLang.value];
        [sourceText.value, targetText.value] = [targetText.value, sourceText.value];
        if (sourceText.value) {
            translateText();
        }
    }
}

function clearText() {
    document.getElementById('sourceText').value = '';
    document.getElementById('targetText').value = '';
}

function copyResult() {
    const targetText = document.getElementById('targetText');
    targetText.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '已复制！';
    setTimeout(() => copyBtn.textContent = originalText, 2000);
}

async function translateText() {
    const sourceText = document.getElementById('sourceText').value.trim();
    const fromLang = document.getElementById('fromLang').value;
    const toLang = document.getElementById('toLang').value;
    const targetText = document.getElementById('targetText');
    const translateBtn = document.querySelector('.translate-btn');
    
    if (!sourceText) {
        targetText.value = '';
        return;
    }

    try {
        showLoading(translateBtn);
        targetText.value = '正在翻译...';
        
        // 使用 Google Translate API
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(sourceText)}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('翻译请求失败');
        
        const data = await response.json();
        const translatedText = data[0]
            .map(item => item[0])
            .join('');
        
        targetText.value = translatedText;
    } catch (error) {
        console.error('翻译失败:', error);
        targetText.value = '翻译失败，请稍后重试';
    } finally {
        hideLoading(translateBtn);
    }
}

// 添加自动翻译功能
let translateTimeout;
function autoTranslate() {
    clearTimeout(translateTimeout);
    translateTimeout = setTimeout(translateText, 1000);
}

// 便签功能
function showNotes() {
    const notes = document.createElement('div');
    notes.className = 'tool-popup notes';
    notes.style.opacity = '0';
    notes.innerHTML = `
        <div class="tool-header">
            <h3>便签</h3>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="notes-content">
            <div class="notes-list" id="notesList"></div>
            <div class="note-editor">
                <textarea id="noteText" placeholder="写点什么..."></textarea>
                <button onclick="saveNote()">保存便签</button>
            </div>
        </div>
    `;
    showToolPopup(notes);
}

// 便签辅助函数
function loadNotes() {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;

    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    
    notesList.innerHTML = notes.map((note, index) => `
        <div class="note-item">
            <p>${note.text}</p>
            <div class="note-actions">
                <span>${note.date}</span>
                <button onclick="deleteNote(${index})">删除</button>
            </div>
        </div>
    `).join('');
}

function saveNote() {
    const noteText = document.getElementById('noteText');
    if (!noteText) return;

    const text = noteText.value.trim();
    
    if (text) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.unshift({
            text: text,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('notes', JSON.stringify(notes));
        noteText.value = '';
        loadNotes();
    }
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes') || '[]');
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    loadNotes();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化天气
    getWeather();
    // 每30分钟更新一次天气
    setInterval(getWeather, 1800000);
    
    // ... 其他初始化代码 ...
});

// 添加聊天相关功能
let isChatOpen = false;
let isMinimized = false;

function openChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatFloatBtn = document.querySelector('.chat-float-btn');
    
    if (chatWidget && chatFloatBtn) {
        chatWidget.style.display = 'flex';
        chatFloatBtn.style.display = 'none';
        isChatOpen = true;
        
        // 确保聊天窗口在正确的状态
        if (isMinimized) {
            chatWidget.style.height = '50px';
            document.querySelector('.chat-body').style.display = 'none';
        } else {
            chatWidget.style.height = '500px';
            document.querySelector('.chat-body').style.display = 'flex';
        }
    }
}

function closeChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.style.display = 'none';
    isChatOpen = false;
    document.querySelector('.chat-float-btn').style.display = 'flex';
}

function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    if (isMinimized) {
        chatWidget.style.height = '500px';
        document.querySelector('.chat-body').style.display = 'flex';
    } else {
        chatWidget.style.height = '50px';
        document.querySelector('.chat-body').style.display = 'none';
    }
    isMinimized = !isMinimized;
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// AI 助手的配置
const aiAssistant = {
    name: 'TechSearch AI',
    defaultResponses: {
        greeting: ['你好！', '很高兴见到你！', '有什么我可以帮你的吗？'],
        farewell: ['再见！', '期待下次交谈！', '祝你有愉快的一天！'],
        unknown: ['抱歉，我不太理解。能请你个方式说明吗？', '这个问题有点复杂，能详细解释一下吗？'],
        thinking: ['让我想想...', '正在处理...', '稍等一下...']
    },
    
    // 知识库
    knowledgeBase: {
        search: ['可以告诉我你想搜索什么，我来帮你选择最合适的搜索引擎。', '需要搜索相关帮助吗？'],
        weather: ['需要查看天气预报吗？', '我可以帮你查看天气信息。'],
        tools: ['我们有计算器、翻译器等工具可以使用。', '需要使用什么工具吗？'],
        help: ['我可以帮你：\n1. 选择搜索引擎\n2. 推荐网站\n3. 使用各种工具\n4. 回答问题']
    }
};

// 豆包 API 配置
const DOUPACK_API = {
    endpoint: 'https://api.doubao.com/v1/chat/completions', // 替换为实际的豆包 API 地址
    apiKey: 'your_api_key_here', // 替换为你的 API 密钥
    model: 'doubao-text-001'     // 替换为实际的模型名称
};

// 修改发送消息函数，使用豆包 API
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用户消息
    addMessage(message, true);
    input.value = '';
    
    // 显示思考状态
    const thinkingMsg = addThinkingMessage();
    
    try {
        // 调用豆包 API
        const response = await callDoupackAPI(message);
        thinkingMsg.remove();
        addMessage(response, false);
        
        // 执行相关操作
        executeActions(message);
    } catch (error) {
        console.error('AI 响应错误:', error);
        thinkingMsg.remove();
        addMessage('抱歉，我遇到了一些问题，请稍后再试。', false);
    }
}

// 豆包 API 调用函数
async function callDoupackAPI(message) {
    try {
        const response = await fetch(DOUPACK_API.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DOUPACK_API.apiKey}`
            },
            body: JSON.stringify({
                model: DOUPACK_API.model,
                messages: [
                    {
                        role: "system",
                        content: "你是一个智能搜索助手，可以帮助用户搜索信息、回答问题、提供建议。"
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('API 请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('豆包 API 调用失败:', error);
        throw error;
    }
}

// 优化消息显示函数
function addMessage(text, isUser) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    // 使用 DocumentFragment 优化 DOM 操作
    const fragment = document.createDocumentFragment();
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = isUser ? '👤' : '🤖';
    fragment.appendChild(avatar);
    
    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.textContent = text;
    fragment.appendChild(textDiv);
    
    messageDiv.appendChild(fragment);
    chatMessages.appendChild(messageDiv);
    
    // 使用 requestAnimationFrame 优化滚动
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// 优化思考动画
function addThinkingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot thinking';
    
    const fragment = document.createDocumentFragment();
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '🤖';
    fragment.appendChild(avatar);
    
    const textDiv = document.createElement('div');
    textDiv.className = 'text';
    textDiv.innerHTML = '<div class="thinking-dots"><span>.</span><span>.</span><span>.</span></div>';
    fragment.appendChild(textDiv);
    
    thinkingDiv.appendChild(fragment);
    chatMessages.appendChild(thinkingDiv);
    
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
    
    return thinkingDiv;
}

// 执行特定操作
function executeActions(message) {
    const lowerMsg = message.toLowerCase();
    
    // 切换搜索引擎
    if (lowerMsg.includes('切换') && lowerMsg.includes('搜')) {
        for (const [engine, config] of Object.entries(searchEngines)) {
            if (lowerMsg.includes(config.name.toLowerCase())) {
                document.querySelector(`[data-engine="${engine}"]`).click();
                addMessage(`已为您切换到${config.name}搜索引擎。`, false);
                return;
            }
        }
    }
    
    // 打开工具
    if (lowerMsg.includes('打开') || lowerMsg.includes('使用')) {
        if (lowerMsg.includes('计算器')) {
            showCalculator();
        } else if (lowerMsg.includes('翻译')) {
            showTranslator();
        }
    }
}

// 辅助函数随机选择数组中的一个元素
function randomPick(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 添加 CSS 样式
const style = document.createElement('style');
style.textContent = `
    .thinking-dots span {
        animation: thinking 1.4s infinite;
        display: inline-block;
        margin: 0 2px;
    }
    
    .thinking-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .thinking-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes thinking {
        0%, 60%, 100% {
            transform: translateY(0);
        }
        30% {
            transform: translateY(-4px);
        }
    }
`;
document.head.appendChild(style); 

// 添加全局错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo);
    return false;
};

// 添加 Promise 错误处理
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
}); 

// 添加移动端检测和适配
function isMobile() {
    return window.innerWidth <= 768;
}

// 优化移动端布局
function optimizeMobileLayout() {
    if (isMobile()) {
        // 调整搜索框布局
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.style.flexDirection = 'column';
            searchBox.style.padding = '0 20px';
        }
        
        // 调整工具栏位置
        const quickTools = document.querySelector('.quick-tools');
        if (quickTools) {
            quickTools.style.bottom = '0';
            quickTools.style.left = '0';
            quickTools.style.right = '0';
            quickTools.style.top = 'auto';
        }
    }
}

// 监听窗口大小变化
window.addEventListener('resize', optimizeMobileLayout);
document.addEventListener('DOMContentLoaded', optimizeMobileLayout); 

// 添加加载状态管理
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.style.opacity = '0';
    loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingDiv);
    
    requestAnimationFrame(() => {
        loadingDiv.style.opacity = '1';
    });
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading-overlay');
    if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(() => loadingDiv.remove(), 300);
    }
}

// 添加平滑显示搜索引擎选项
function toggleEngineOptions(show) {
    const options = document.getElementById('engineOptions');
    options.classList.toggle('show', show);
}

// 添加按钮波纹效果
function addRippleEffect(element) {
    element.classList.add('ripple');
    setTimeout(() => {
        element.classList.remove('ripple');
    }, 600);
}

// 为所有按钮添加波纹效果
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
        addRippleEffect(this);
    });
});

// 修改所有动画和过渡时间为 0.1s
const animations = {
    popupDuration: 100,    // 弹窗动画时间
    rippleDuration: 100,   // 波纹效果时间
    fadeInDuration: 100,   // 淡入动画时间
    transitionDelay: 50    // 过渡延迟时间
};

// 优化工具弹窗显示函数
function showToolPopup(popup) {
    const existingPopups = document.querySelectorAll('.tool-popup');
    existingPopups.forEach(p => p.remove());

    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // 使用 requestAnimationFrame 优化动画性能
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        popup.style.opacity = '1';
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // 减少关闭动画时间
    const closeBtn = popup.querySelector('.tool-header button');
    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.style.opacity = '0';
            popup.style.opacity = '0';
            popup.style.transform = 'translate(-50%, -55%) scale(0.95)';
            
            setTimeout(() => {
                overlay.remove();
                popup.remove();
            }, animations.popupDuration);
        };
    }
}

// 修改计算器按钮显示
document.querySelector('[onclick="showCalculator()"]').addEventListener('click', (e) => {
    addClickEffect(e.currentTarget);
    setTimeout(showCalculator, 200);
});

// 修改翻译按钮显示
document.querySelector('[onclick="showTranslator()"]').addEventListener('click', (e) => {
    addClickEffect(e.currentTarget);
    setTimeout(showTranslator, 200);
});

// 修改便签按钮显示
document.querySelector('[onclick="showNotes()"]').addEventListener('click', (e) => {
    addClickEffect(e.currentTarget);
    setTimeout(showNotes, 200);
}); 

// 添加加载状态管理
function showLoading(element) {
    element.classList.add('loading');
    element.disabled = true;
}

function hideLoading(element) {
    element.classList.remove('loading');
    element.disabled = false;
}

// 在翻译功能中使用
async function translateText() {
    const translateBtn = document.querySelector('.translate-btn');
    showLoading(translateBtn);
    
    try {
        // ... 翻译逻辑 ...
    } finally {
        hideLoading(translateBtn);
    }
} 

// 修改搜索引擎选择器的事件监听
document.addEventListener('DOMContentLoaded', function() {
    const currentEngineEl = document.getElementById('currentEngine');
    const engineOptions = document.getElementById('engineOptions');

    if (currentEngineEl && engineOptions) {
        currentEngineEl.addEventListener('click', (e) => {
            e.stopPropagation();
            currentEngineEl.classList.toggle('active');
            engineOptions.style.display = engineOptions.style.display === 'block' ? 'none' : 'block';
        });

        // 选择搜索引擎
        engineOptions.querySelectorAll('.engine-option').forEach(option => {
            option.addEventListener('click', () => {
                const engine = option.dataset.engine;
                if (engine && searchEngines[engine]) {
                    currentEngine = engine;
                    currentEngineEl.innerHTML = `
                        <img src="${searchEngines[engine].icon}" alt="${searchEngines[engine].name}" />
                        <span>${searchEngines[engine].name}</span>
                        <span class="arrow">▼</span>
                    `;
                    localStorage.setItem('preferredEngine', engine);
                    engineOptions.style.display = 'none';
                    currentEngineEl.classList.remove('active');
                }
            });
        });
    }
}); 

// 在 DOMContentLoaded 事件中初始化所有工具按钮
document.addEventListener('DOMContentLoaded', function() {
    // 初始化计算器按钮
    const calcButton = document.querySelector('.tool-item:nth-child(1)');
    if (calcButton) {
        calcButton.onclick = function(e) {
            e.preventDefault();
            showCalculator();
        };
    }

    // 初始化翻译按钮
    const translateButton = document.querySelector('.tool-item:nth-child(2)');
    if (translateButton) {
        translateButton.onclick = function(e) {
            e.preventDefault();
            showTranslator();
        };
    }

    // 初始化便签按钮
    const notesButton = document.querySelector('.tool-item:nth-child(3)');
    if (notesButton) {
        notesButton.onclick = function(e) {
            e.preventDefault();
            showNotes();
        };
    }

    // 初始化其他功能
    initializeFeatures();
});

// 添加功能初始化函数
function initializeFeatures() {
    // 初始化搜索历史
    updateClearHistoryButton();
    
    // 初始化天气
    getWeather();
    
    // 初始化热搜
    initHotSearches();
    
    // 初始化主题
    initializeTheme();
    
    // 初始化搜索引擎选择器
    initializeSearchEngineSelector();
}

// 初始化主题
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
}

// 初始化搜索引擎选择器
function initializeSearchEngineSelector() {
    const currentEngineEl = document.getElementById('currentEngine');
    const engineOptions = document.getElementById('engineOptions');
    
    // 加载保存的搜索引擎
    const savedEngine = localStorage.getItem('preferredEngine');
    if (savedEngine && searchEngines[savedEngine]) {
        currentEngine = savedEngine;
        updateCurrentEngineDisplay(savedEngine);
    }
    
    // 确保选项初始隐藏
    if (engineOptions) {
        engineOptions.style.display = 'none';
    }
}

// 更新当前搜索引擎显示
function updateCurrentEngineDisplay(engine) {
    const currentEngineEl = document.getElementById('currentEngine');
    if (currentEngineEl && searchEngines[engine]) {
        currentEngineEl.innerHTML = `
            <img src="${searchEngines[engine].icon}" alt="${searchEngines[engine].name}" />
            <span>${searchEngines[engine].name}</span>
            <span class="arrow">▼</span>
        `;
    }
}

// 修复工具弹窗显示函数
function showToolPopup(popup) {
    // 移除现有弹窗
    const existingPopups = document.querySelectorAll('.tool-popup');
    existingPopups.forEach(p => p.remove());

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    document.body.appendChild(overlay);

    // 添加弹窗
    document.body.appendChild(popup);

    // 触发动画
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        popup.style.opacity = '1';
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    // 添加关闭事件
    const closeBtn = popup.querySelector('.tool-header button');
    if (closeBtn) {
        closeBtn.onclick = () => closeToolPopup(popup, overlay);
    }

    // 点击遮罩层关闭
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeToolPopup(popup, overlay);
        }
    };

    // ESC 键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeToolPopup(popup, overlay);
        }
    });
}

// 关闭工具弹窗
function closeToolPopup(popup, overlay) {
    overlay.style.opacity = '0';
    popup.style.opacity = '0';
    popup.style.transform = 'translate(-50%, -55%) scale(0.95)';
    
    setTimeout(() => {
        overlay.remove();
        popup.remove();
    }, 300);
}

// 添加错误处理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, '\nURL:', url, '\nLine:', lineNo);
    return false;
};

// 添加未处理的 Promise 错误处理
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
}); 

// 添加性能优化
document.addEventListener('DOMContentLoaded', () => {
    // 使用 Intersection Observer 优化滚动性能
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // 观察所有动画元素
    document.querySelectorAll('.feature-card, .tool-item').forEach(el => {
        observer.observe(el);
    });

    // 预加载图标
    const preloadImages = [
        'https://www.baidu.com/favicon.ico',
        'https://www.google.com/favicon.ico',
        'https://www.bing.com/favicon.ico'
        // ... 其他图标
    ];

    preloadImages.forEach(url => {
        const img = new Image();
        img.src = url;
    });
});

// 使用防抖优化搜索建议
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 优化搜索建议显示
const showSuggestionsDebounced = debounce(showSuggestions, 100);

// 优化搜索框输入
searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length > 0) {
        showSuggestionsDebounced(value);
    } else {
        document.getElementById('suggestions').style.display = 'none';
    }
}); 