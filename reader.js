/**
 * READER.JS - WITH BALANCED PROTECTION
 * Manga reader with navigation
 */

// ============================================
// MANGA PROTECTION SYSTEM - BALANCED
// ============================================
const DEBUG_MODE = false; // Set true untuk testing

const PROTECTION_CONFIG = {
    enableDevToolsDetection: true,
    sizeThreshold: 220,
    performanceThreshold: 200,
    detectionRequired: 2,
    checkInterval: 3000,
    disableRightClick: true,
    disableKeyboardShortcuts: true,
    disableImageSelection: true,
    disableImageDrag: true,
    disableCopy: true,
    showWarningMessage: true,
};

let detectionState = {
    sizeDetected: 0,
    performanceDetected: 0,
    consoleDetected: 0,
    isBlocked: false,
    detectionCount: 0
};

function isLikelyExtension() {
    const indicators = [
        '[data-lastpass-icon-root]',
        '[data-grammarly-extension]',
        '[data-darkreader-mode]',
        '.translate-tooltip',
        '#chrome-extension',
    ];
    
    for (const selector of indicators) {
        if (document.querySelector(selector)) {
            return true;
        }
    }
    
    if (document.body.classList.contains('darkreader') ||
        document.body.classList.contains('translated-ltr')) {
        return true;
    }
    
    return false;
}

function detectDevToolsBySize() {
    if (!PROTECTION_CONFIG.enableDevToolsDetection) return;
    
    setInterval(() => {
        if (isLikelyExtension()) {
            detectionState.sizeDetected = 0;
            return;
        }
        
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        
        if (widthDiff > PROTECTION_CONFIG.sizeThreshold || 
            heightDiff > PROTECTION_CONFIG.sizeThreshold) {
            detectionState.sizeDetected++;
            checkAndBlock();
        } else {
            detectionState.sizeDetected = 0;
        }
    }, PROTECTION_CONFIG.checkInterval);
}

function detectDevToolsByPerformance() {
    if (!PROTECTION_CONFIG.enableDevToolsDetection) return;
    
    setInterval(() => {
        let start = performance.now();
        debugger;
        let end = performance.now();
        let executionTime = end - start;
        
        if (executionTime > PROTECTION_CONFIG.performanceThreshold) {
            detectionState.performanceDetected++;
            checkAndBlock();
        } else {
            detectionState.performanceDetected = 0;
        }
    }, PROTECTION_CONFIG.checkInterval);
}

function detectDevToolsByConsole() {
    if (!PROTECTION_CONFIG.enableDevToolsDetection) return;
    
    const element = new Image();
    Object.defineProperty(element, 'id', {
        get: function() {
            detectionState.consoleDetected++;
            checkAndBlock();
            return 'console-check';
        }
    });
    
    setInterval(() => {
        console.log('%c ', 'font-size: 0px');
        console.log(element);
        console.clear();
        
        setTimeout(() => {
            if (detectionState.consoleDetected > 0) {
                detectionState.consoleDetected--;
            }
        }, 1000);
    }, PROTECTION_CONFIG.checkInterval);
}

function checkAndBlock() {
    if (detectionState.isBlocked || DEBUG_MODE) return;
    
    const activeDetections = 
        (detectionState.sizeDetected > 0 ? 1 : 0) +
        (detectionState.performanceDetected > 0 ? 1 : 0) +
        (detectionState.consoleDetected > 0 ? 1 : 0);
    
    if (activeDetections >= PROTECTION_CONFIG.detectionRequired) {
        detectionState.detectionCount++;
        
        if (detectionState.detectionCount >= 3) {
            blockContent();
        }
    } else {
        detectionState.detectionCount = 0;
    }
}

function blockContent() {
    if (detectionState.isBlocked) return;
    detectionState.isBlocked = true;
    
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.filter = 'blur(20px)';
        img.style.userSelect = 'none';
        img.style.pointerEvents = 'none';
    });
    
    const overlay = document.createElement('div');
    overlay.id = 'devtools-warning-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;
    
    overlay.innerHTML = `
        <div style="
            text-align: center;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 500px;
            padding: 40px;
            background: rgba(20, 20, 20, 0.9);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        ">
            <div style="font-size: 64px; margin-bottom: 20px;">⚠️</div>
            <h2 style="font-size: 24px; margin-bottom: 10px; color: #ff6b6b;">
                Developer Tools Detected
            </h2>
            <p style="font-size: 16px; line-height: 1.6; color: #ccc; margin-bottom: 20px;">
                Untuk melindungi konten manga, akses dibatasi saat Developer Tools terbuka.
            </p>
            <p style="font-size: 14px; color: #888;">
                Please close DevTools and refresh the page to continue reading.
            </p>
            <button onclick="location.reload()" style="
                margin-top: 30px;
                padding: 12px 30px;
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.background='#ff5252'" onmouseout="this.style.background='#ff6b6b'">
                🔄 Refresh Page
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

function showTooltip(x, y, message) {
    const existing = document.getElementById('protection-tooltip');
    if (existing) existing.remove();
    
    const tooltip = document.createElement('div');
    tooltip.id = 'protection-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 107, 107, 0.95);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        z-index: 999999;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translate(-50%, -150%);
        animation: fadeOut 2s forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            0% { opacity: 1; transform: translate(-50%, -150%); }
            70% { opacity: 1; }
            100% { opacity: 0; transform: translate(-50%, -170%); }
        }
    `;
    if (!document.querySelector('style[data-tooltip-animation]')) {
        style.setAttribute('data-tooltip-animation', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 2000);
}

function initBasicProtection() {
    if (DEBUG_MODE) {
        console.log('🔓 Debug mode - basic protection disabled');
        return;
    }
    
    if (PROTECTION_CONFIG.disableRightClick) {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (PROTECTION_CONFIG.showWarningMessage) {
                showTooltip(e.pageX, e.pageY, 'Right-click disabled');
            }
            return false;
        });
    }

    if (PROTECTION_CONFIG.disableKeyboardShortcuts) {
        document.addEventListener('keydown', (e) => {
            // Check for DevTools shortcuts first
            if (
                e.keyCode === 123 ||
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) ||
                (e.ctrlKey && e.keyCode === 85) ||
                (e.ctrlKey && e.keyCode === 83) ||
                (e.metaKey && e.shiftKey && e.keyCode === 73) ||
                (e.metaKey && e.altKey && e.keyCode === 73)
            ) {
                e.preventDefault();
                if (PROTECTION_CONFIG.showWarningMessage) {
                    showTooltip(window.innerWidth / 2, 100, 'Developer tools disabled');
                }
                detectionState.detectionCount += 2;
                checkAndBlock();
                return false;
            }
        });
    }

    if (PROTECTION_CONFIG.disableImageSelection) {
        document.addEventListener('selectstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
    }

    if (PROTECTION_CONFIG.disableImageDrag) {
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                return false;
            }
        });
    }

    if (PROTECTION_CONFIG.disableCopy) {
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            return false;
        });
    }
    
    const style = document.createElement('style');
    style.textContent = `
        img {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            pointer-events: auto;
        }
        .reader-page {
            user-select: none;
            -webkit-touch-callout: none;
        }
    `;
    document.head.appendChild(style);
}

function initMangaProtection() {
    if (DEBUG_MODE) {
        console.log('🔓 DEBUG MODE - All protections disabled');
        return;
    }
    
    console.log('🛡️ Manga Protection System initialized');
    
    initBasicProtection();
    
    if (PROTECTION_CONFIG.enableDevToolsDetection) {
        setTimeout(() => {
            detectDevToolsBySize();
            detectDevToolsByPerformance();
            detectDevToolsByConsole();
            
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;
            
            if (widthDiff > PROTECTION_CONFIG.sizeThreshold || 
                heightDiff > PROTECTION_CONFIG.sizeThreshold) {
                if (!isLikelyExtension()) {
                    detectionState.detectionCount = 3;
                    checkAndBlock();
                }
            }
        }, 1000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMangaProtection);
} else {
    initMangaProtection();
}

window.addEventListener('focus', () => {
    if (!DEBUG_MODE && PROTECTION_CONFIG.enableDevToolsDetection) {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;
        
        if (widthDiff > PROTECTION_CONFIG.sizeThreshold || 
            heightDiff > PROTECTION_CONFIG.sizeThreshold) {
            if (!isLikelyExtension()) {
                detectionState.detectionCount++;
                checkAndBlock();
            }
        }
    }
});

// ============================================
// WIB TIMEZONE HELPER (GMT+7)
// ============================================

function getWIBTimestamp() {
    const date = new Date();
    const wibStr = date.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
    return wibStr + '+07:00';
}

function convertToWIB(isoString) {
    if (!isoString) return null;
    const date = new Date(isoString);
    const wibStr = date.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
    return wibStr + '+07:00';
}

// ============================================
// MANGA_REPOS sudah di-export dari manga-config.js
// TIDAK PERLU DEFINE DI SINI LAGI!
// ============================================

// Link Trakteer untuk chapter terkunci
const TRAKTEER_LINK = 'https://trakteer.id/NuranantoScanlation';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZ0-VeyloQxjvh-h65G0wtfAzxVq6VYzU5Bz9n1Rl0T4GAkGu9X7HmGh_3_0cJhCS1iA/exec';

// State management
let mangaData = null;
let currentChapterFolder = null;
let currentChapter = null;
let allChapters = [];
let repoParam = null;
let readMode = localStorage.getItem('readMode') || 'webtoon';
let currentPage = 1;
let totalPages = 0;

// DOM Elements
const readerContainer = document.getElementById('readerContainer');
const pageNav = document.getElementById('pageNav');
const pageList = document.getElementById('pageList');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const btnNextChapterBottom = document.getElementById('btnNextChapterBottom');

// Load saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeReader();
        setupEnhancedEventListeners();
    } catch (error) {
        console.error('❌ Fatal error during initialization:', error);
        alert(`Terjadi kesalahan saat memuat reader:\n${error.message}\n\nSilakan refresh halaman atau kembali ke info.`);
        hideLoading();
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

/**
 * Initialize reader
 */
async function initializeReader() {
    try {
        showLoading();
        
        console.log('🚀 Initializing reader...');
        
        const urlParams = new URLSearchParams(window.location.search);
        const chapterParam = urlParams.get('chapter');
        repoParam = urlParams.get('repo');
        
        console.log('📋 Parameters:', { chapter: chapterParam, repo: repoParam });
        
        if (!chapterParam) {
            alert('Error: Parameter chapter tidak ditemukan.');
            hideLoading();
            return;
        }
        
        if (!repoParam) {
            alert('Error: Parameter repo tidak ditemukan.');
            hideLoading();
            return;
        }
        
        await loadMangaData(repoParam);
        
        if (!mangaData) {
            alert('Error: Gagal memuat data manga.');
            hideLoading();
            return;
        }
        
        const chapterData = findChapterByFolder(chapterParam);
        
        if (!chapterData) {
            alert(`Error: Chapter ${chapterParam} tidak ditemukan.`);
            hideLoading();
            return;
        }
        
        if (chapterData.locked) {
            console.log('🔒 Chapter terkunci, redirect ke Trakteer...');
            alert('Chapter ini terkunci. Silakan donasi untuk membuka chapter ini!');
            window.location.href = TRAKTEER_LINK;
            return;
        }
        
        currentChapter = chapterData;
        currentChapterFolder = chapterParam;
        totalPages = currentChapter.pages;
        
        setupUI();
        await loadChapterPages();
        trackChapterView();
        
        console.log('✅ Reader initialized successfully');
        
    } catch (error) {
        console.error('❌ Error initializing reader:', error);
        alert('Terjadi kesalahan saat memuat reader.');
        hideLoading();
    }
}

/**
 * Load manga.json dari repo
 */
async function loadMangaData(repo) {
    try {
        const mangaConfig = MANGA_REPOS[repo];
        
        if (!mangaConfig) {
            throw new Error(`Repo "${repo}" tidak ditemukan di mapping`);
        }
        
        console.log(`📚 Loading manga data from: ${repo}`);
        
        let mangaJsonUrl;
        if (typeof mangaConfig === 'string') {
            mangaJsonUrl = mangaConfig;
        } else {
            mangaJsonUrl = mangaConfig.url;
            window.currentGithubRepo = mangaConfig.githubRepo;
            console.log(`🔗 GitHub repo: ${mangaConfig.githubRepo}`);
        }
        
        const timestamp = new Date().getTime();
        const response = await fetch(`${mangaJsonUrl}?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        mangaData = await response.json();
        
        console.log('📦 Manga data loaded:', mangaData);
        
        allChapters = Object.values(mangaData.chapters).sort((a, b) => {
            return parseFloat(b.folder) - parseFloat(a.folder);
        });
        
        console.log(`✅ Loaded ${allChapters.length} chapters`);
        
    } catch (error) {
        console.error('❌ Error loading manga data:', error);
        throw error;
    }
}

/**
 * Find chapter by folder name
 */
function findChapterByFolder(folder) {
    if (!mangaData || !mangaData.chapters) return null;
    
    return Object.values(mangaData.chapters).find(ch => ch.folder === folder);
}

/**
 * Save current page to localStorage
 */
function saveLastPage() {
    const storageKey = `lastPage_${repoParam}_${currentChapterFolder}`;
    localStorage.setItem(storageKey, currentPage);
    console.log(`💾 Saved page ${currentPage} for ${currentChapterFolder}`);
}

/**
 * Load last page from localStorage
 */
function loadLastPage() {
    const storageKey = `lastPage_${repoParam}_${currentChapterFolder}`;
    const savedPage = localStorage.getItem(storageKey);
    if (savedPage) {
        const pageNum = parseInt(savedPage);
        if (pageNum > 0 && pageNum <= totalPages) {
            console.log(`📖 Restoring last page: ${pageNum}`);
            return pageNum;
        }
    }
    return 1;
}

/**
 * Adjust chapter title font size to fit in button
 */
function adjustChapterTitleFontSize(element) {
    const parentButton = element.closest('.chapter-btn');
    if (!parentButton) return;
    
    const maxHeight = 44;
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    const minFontSize = 10;
    
    const checkOverflow = () => {
        return element.scrollHeight > maxHeight;
    };
    
    while (checkOverflow() && fontSize > minFontSize) {
        fontSize -= 0.5;
        element.style.fontSize = `${fontSize}px`;
    }
    
    console.log(`🔍 Chapter title font adjusted to: ${fontSize}px`);
}

/**
 * Setup UI elements
 */
function setupUI() {
    const mangaTitleElement = document.getElementById('mangaTitle');
    mangaTitleElement.textContent = mangaData.manga.title;
    
    document.title = `${mangaData.manga.title} - ${currentChapter.title}`;
    
    adjustTitleFontSize(mangaTitleElement);
    
    const titleElement = document.getElementById('chapterTitle');
    titleElement.textContent = currentChapter.title;
    
    adjustChapterTitleFontSize(titleElement);
    
    console.log(`📖 Read mode: ${readMode}`);
    
    const btnBack = document.getElementById('btnBackToInfo');
    btnBack.onclick = () => {
        window.location.href = `info-manga.html?repo=${repoParam}`;
    };
    
    const btnChapterList = document.getElementById('btnChapterList');
    btnChapterList.onclick = () => {
        openChapterListModal();
    };
    
    btnNextChapterBottom.onclick = () => navigateChapter('next');
    
    updateNavigationButtons();
    
    const btnCloseModal = document.getElementById('btnCloseModal');
    btnCloseModal.onclick = () => closeChapterListModal();
    
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
            closeChapterListModal();
        }
    };
}

/**
 * Adjust title font size to fit in maximum 2 lines
 */
function adjustTitleFontSize(element) {
    if (!element) return;
    
    const maxLines = 2;
    const lineHeight = 1.3;
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    const minFontSize = 12;
    
    const checkOverflow = () => {
        const computedHeight = element.scrollHeight;
        const maxHeight = fontSize * lineHeight * maxLines;
        return computedHeight > maxHeight;
    };
    
    while (checkOverflow() && fontSize > minFontSize) {
        fontSize -= 0.5;
        element.style.fontSize = `${fontSize}px`;
    }
    
    console.log(`🔍 Title font adjusted to: ${fontSize}px`);
}

/**
 * Load chapter pages
 */
async function loadChapterPages() {
    try {
        readerContainer.innerHTML = '';
        readerContainer.className = `reader-container ${readMode}-mode`;
        
        let { repoUrl, imagePrefix, imageFormat } = mangaData.manga;
        
        repoUrl = repoUrl.replace(/\/$/, '');
        
        console.log('📄 Loading chapter pages...');
        console.log('- Repo URL:', repoUrl);
        console.log('- Folder:', currentChapterFolder);
        console.log('- Total pages:', totalPages);
        console.log('- Image prefix:', imagePrefix);
        console.log('- Image format:', imageFormat);
        
        for (let i = 1; i <= totalPages; i++) {
            const paddedPage = String(i).padStart(2, '0');
            const imageUrl = `${repoUrl}/${currentChapterFolder}/${imagePrefix}${paddedPage}.${imageFormat}`;
            
            console.log(`📸 Page ${i}: ${imageUrl}`);
            
            const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = `Page ${i}`;
        
        img.style.backgroundColor = 'var(--secondary-bg)';
        
        const thumbnailUrl = getThumbnailUrl(originalUrl);
        img.src = thumbnailUrl;
        
        img.onload = () => {
            thumb.classList.add('loaded');
        };
        
        img.onerror = () => {
            console.warn(`Proxy failed for page ${i}, using original`);
            img.src = originalUrl;
            thumb.classList.add('error');
        };
        
        const pageNum = document.createElement('div');
        pageNum.className = 'page-number';
        pageNum.textContent = i;
        
        thumb.appendChild(img);
        thumb.appendChild(pageNum);
        
        thumb.addEventListener('click', () => {
            goToPage(i);
        });
        
        pageList.appendChild(thumb);
    }
    
    console.log(`📸 Generated ${totalPages} thumbnails using image proxy`);
}

/**
 * Update page navigation
 */
function updatePageNavigation() {
    document.querySelectorAll('.page-thumb').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentPage - 1);
    });
    
    const activeThumb = document.querySelector('.page-thumb.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    
    updateProgressBar();
}

/**
 * Update progress bar based on current page
 */
function updateProgressBar() {
    const pageNavHandle = document.getElementById('pageNavHandle');
    if (!pageNavHandle) return;
    
    const progress = (currentPage / totalPages) * 100;
    pageNavHandle.style.width = `${progress}%`;
    pageNavHandle.setAttribute('data-progress', `${currentPage} / ${totalPages}`);
}

/**
 * Update navigation button states
 */
function updateNavigationButtons() {
    const currentIndex = allChapters.findIndex(ch => ch.folder === currentChapterFolder);
    
    if (currentIndex <= 0) {
        btnNextChapterBottom.disabled = true;
        btnNextChapterBottom.style.opacity = '0.5';
    } else {
        btnNextChapterBottom.disabled = false;
        btnNextChapterBottom.style.opacity = '1';
    }
}

/**
 * Navigate to prev/next chapter
 */
function navigateChapter(direction) {
    const currentIndex = allChapters.findIndex(ch => ch.folder === currentChapterFolder);
    
    let targetIndex;
    if (direction === 'prev') {
        targetIndex = currentIndex + 1;
    } else {
        targetIndex = currentIndex - 1;
    }
    
    if (targetIndex < 0 || targetIndex >= allChapters.length) {
        return;
    }
    
    const targetChapter = allChapters[targetIndex];
    
    if (targetChapter.locked) {
        alert('Chapter ini terkunci. Silakan donasi untuk membuka chapter ini!');
        window.open(TRAKTEER_LINK, '_blank');
        return;
    }
    
    window.location.href = `reader.html?repo=${repoParam}&chapter=${targetChapter.folder}`;
}

/**
 * Open chapter list modal
 */
function openChapterListModal() {
    const modal = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('chapterListModal');
    
    modalBody.innerHTML = '';
    
    allChapters.forEach(chapter => {
        const item = document.createElement('div');
        item.className = 'chapter-item-modal';
        
        if (chapter.folder === currentChapterFolder) {
            item.classList.add('active');
        }
        
        if (chapter.locked) {
            item.classList.add('locked');
        }
        
        const lockIcon = chapter.locked ? '🔒 ' : '';
        
        item.innerHTML = `
            <div class="chapter-item-title">${lockIcon}${chapter.title}</div>
            <div class="chapter-item-views">👁️ ${chapter.views}</div>
        `;
        
        item.onclick = () => {
            if (chapter.locked) {
                alert('Chapter ini terkunci. Silakan donasi untuk membuka chapter ini!');
                window.open(TRAKTEER_LINK, '_blank');
            } else if (chapter.folder !== currentChapterFolder) {
                window.location.href = `reader.html?repo=${repoParam}&chapter=${chapter.folder}`;
            }
        };
        
        modalBody.appendChild(item);
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close chapter list modal
 */
function closeChapterListModal() {
    const modal = document.getElementById('modalOverlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Track chapter view - increment pending views
 */
async function trackChapterView() {
    try {
        const viewKey = `viewed_${repoParam}_${currentChapterFolder}`;
        const hasViewed = sessionStorage.getItem(viewKey);
        
        if (hasViewed) {
            console.log('👁️ Already counted in this session');
            return;
        }
        
        console.log('📤 Tracking chapter view...');
        
        const githubRepo = window.currentGithubRepo || repoParam;
        
        console.log(`   URL param: ${repoParam}`);
        console.log(`   GitHub repo: ${githubRepo}`);
        console.log(`   Chapter: ${currentChapterFolder}`);
        
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({ 
                repo: githubRepo,
                chapter: currentChapterFolder,
                type: 'chapter',
                timestamp: getWIBTimestamp()
            }),
            mode: 'no-cors'
        });
        
        sessionStorage.setItem(viewKey, 'true');
        
        console.log('✅ Chapter view tracked successfully (WIB)');
        
    } catch (error) {
        console.error('❌ Error tracking chapter view:', error);
    }
}

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
        console.log('📄 Loading overlay shown');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        console.log('✅ Loading overlay hidden');
    }
}

/**
 * Setup enhanced event listeners
 */
function setupEnhancedEventListeners() {
    const pageNavHandle = document.getElementById('pageNavHandle');
    
    pageNavHandle.addEventListener('click', () => {
        document.body.classList.add('show-page-nav');
    });
    
    pageNavHandle.addEventListener('mouseenter', () => {
        document.body.classList.add('show-page-nav');
    });
    
    let showNavTimeout;
    document.addEventListener('mousemove', (e) => {
        const windowHeight = window.innerHeight;
        const mouseY = e.clientY;
        
        if (mouseY > windowHeight - 80) {
            document.body.classList.add('show-page-nav');
            clearTimeout(showNavTimeout);
        } else {
            clearTimeout(showNavTimeout);
            showNavTimeout = setTimeout(() => {
                if (!pageNav.matches(':hover') && !pageNavHandle.matches(':hover')) {
                    document.body.classList.remove('show-page-nav');
                }
            }, 300);
        }
    });
    
    pageNav.addEventListener('mouseenter', () => {
        clearTimeout(showNavTimeout);
        document.body.classList.add('show-page-nav');
    });
    
    pageNav.addEventListener('mouseleave', () => {
        showNavTimeout = setTimeout(() => {
            document.body.classList.remove('show-page-nav');
        }, 500);
    });
    
    let touchTimeout;
    let isNavShowing = false;
    
    pageNavHandle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        document.body.classList.add('show-page-nav');
        isNavShowing = true;
        clearTimeout(touchTimeout);
        
        touchTimeout = setTimeout(() => {
            document.body.classList.remove('show-page-nav');
            isNavShowing = false;
        }, 5000);
    });
    
    document.addEventListener('touchstart', (e) => {
        if (e.target.closest('.page-nav')) {
            return;
        }
        
        const windowHeight = window.innerHeight;
        const touchY = e.touches[0].clientY;
        
        if (touchY > windowHeight - 50) {
            document.body.classList.add('show-page-nav');
            isNavShowing = true;
            clearTimeout(touchTimeout);
            
            touchTimeout = setTimeout(() => {
                document.body.classList.remove('show-page-nav');
                isNavShowing = false;
            }, 4000);
        }
    }, { passive: true });
    
    pageNav.addEventListener('touchstart', () => {
        clearTimeout(touchTimeout);
        document.body.classList.add('show-page-nav');
        isNavShowing = true;
        
        touchTimeout = setTimeout(() => {
            document.body.classList.remove('show-page-nav');
            isNavShowing = false;
        }, 5000);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.shiftKey) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                if (readMode === 'manga') {
                    e.preventDefault();
                    goToPage(currentPage - 1);
                }
                break;
            case 'ArrowRight':
                if (readMode === 'manga') {
                    e.preventDefault();
                    goToPage(currentPage + 1);
                }
                break;
            case 'ArrowUp':
                if (readMode === 'webtoon') {
                    e.preventDefault();
                    window.scrollBy({ top: -300, behavior: 'smooth' });
                }
                break;
            case 'ArrowDown':
                if (readMode === 'webtoon') {
                    e.preventDefault();
                    window.scrollBy({ top: 300, behavior: 'smooth' });
                }
                break;
        }
    });
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const mangaTitleElement = document.getElementById('mangaTitle');
            if (mangaTitleElement && mangaData) {
                mangaTitleElement.style.fontSize = '';
                adjustTitleFontSize(mangaTitleElement);
            }
        }, 250);
    });
}

// ============================================
// HIDE NAVBAR ON SCROLL & UPDATE HEADER TITLE
// ============================================

let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const mangaTitleElement = document.getElementById('mangaTitle');
    
    if (scrollTop === 0) {
        if (mangaData) {
            mangaTitleElement.textContent = mangaData.manga.title;
        }
    } else {
        if (mangaData && currentChapter) {
            mangaTitleElement.textContent = `${mangaData.manga.title} - ${currentChapter.title}`;
        }
    }
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.opacity = '0';
    } else {
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
    }
    
    lastScrollTop = scrollTop;
}); = document.createElement('img');
            img.className = 'reader-page';
            img.src = imageUrl;
            img.alt = `Page ${i}`;
            img.loading = 'lazy';
            
            img.setAttribute('data-page', i);
            
            img.onload = () => {
                console.log(`✅ Page ${i} loaded successfully`);
            };
            
            img.onerror = () => {
                console.error(`❌ Failed to load page ${i}:`, imageUrl);
                const placeholder = document.createElement('div');
                placeholder.className = 'reader-page-error';
                placeholder.style.minHeight = '600px';
                placeholder.style.backgroundColor = 'var(--secondary-bg)';
                placeholder.style.display = 'flex';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.style.color = 'var(--text-secondary)';
                placeholder.style.fontSize = '0.9rem';
                placeholder.style.borderRadius = '4px';
                placeholder.style.border = '1px solid var(--border-color)';
                placeholder.setAttribute('data-page', i);
                
                img.replaceWith(placeholder);
            };
            
            readerContainer.appendChild(img);
        }
        
        setupPageTracking();
        setupMangaScrollTracking();
        renderPageThumbnails();
        updateProgressBar();
        
        console.log('✅ Pages container setup complete');
        
        currentPage = loadLastPage();
        
        if (readMode === 'manga') {
            readerContainer.classList.add('manga-mode');
            readerContainer.classList.remove('webtoon-mode');
        } else {
            readerContainer.classList.add('webtoon-mode');
            readerContainer.classList.remove('manga-mode');
        }
        
        if (currentPage > 1) {
            setTimeout(() => {
                goToPage(currentPage);
                updatePageNavigation();
            }, 100);
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('❌ Error loading pages:', error);
        hideLoading();
        alert('Gagal memuat halaman chapter.');
    }
}

/**
 * Setup page tracking with intersection observer
 */
function setupPageTracking() {
    const options = {
        root: readMode === 'manga' ? readerContainer : null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = parseInt(entry.target.getAttribute('data-page'));
                currentPage = pageNum;
                updatePageNavigation();
                saveLastPage();
            }
        });
    }, options);
    
    const pages = document.querySelectorAll('.reader-page');
    pages.forEach(page => observer.observe(page));
}

function setupMangaScrollTracking() {
    const nextChapterContainer = document.getElementById('nextChapterContainer');
    
    if (readMode === 'manga') {
        if (nextChapterContainer) {
            nextChapterContainer.style.display = 'none';
        }
        readerContainer.classList.remove('show-next-chapter');
        
        readerContainer.addEventListener('scroll', () => {
            const containerWidth = readerContainer.offsetWidth;
            const scrollLeft = readerContainer.scrollLeft;
            const pageIndex = Math.round(scrollLeft / containerWidth);
            const newPage = pageIndex + 1;
            
            if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                updatePageNavigation();
                saveLastPage();
            }
            
            if (newPage === totalPages) {
                readerContainer.classList.add('show-next-chapter');
                if (nextChapterContainer) {
                    nextChapterContainer.style.display = 'block';
                }
            } else {
                readerContainer.classList.remove('show-next-chapter');
                if (nextChapterContainer) {
                    nextChapterContainer.style.display = 'none';
                }
            }
        });
    } else {
        if (nextChapterContainer) {
            nextChapterContainer.style.display = 'block';
        }
    }
}

/**
 * Navigate to specific page
 */
function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    
    currentPage = pageNum;
    saveLastPage();
    
    if (readMode === 'manga') {
        const containerWidth = readerContainer.offsetWidth;
        const targetScroll = (pageNum - 1) * containerWidth;
        readerContainer.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    } else {
        const pages = document.querySelectorAll('.reader-page');
        if (pages[pageNum - 1]) {
            pages[pageNum - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    updatePageNavigation();
}

/**
 * Generate thumbnail URL using image proxy for faster loading
 */
function getThumbnailUrl(originalUrl) {
    const encodedUrl = originalUrl.replace('https://', '');
    return `https://images.weserv.nl/?url=${encodedUrl}&w=200&h=300&fit=cover&output=webp`;
}

/**
 * Render page thumbnails
 */
function renderPageThumbnails() {
    pageList.innerHTML = '';
    
    let { repoUrl, imagePrefix, imageFormat } = mangaData.manga;
    
    repoUrl = repoUrl.replace(/\/$/, '');
    
    for (let i = 1; i <= totalPages; i++) {
        const thumb = document.createElement('div');
        thumb.className = 'page-thumb';
        if (i === currentPage) {
            thumb.classList.add('active');
        }
        
        const paddedPage = String(i).padStart(2, '0');
        const originalUrl = `${repoUrl}/${currentChapterFolder}/${imagePrefix}${paddedPage}.${imageFormat}`;
        
        const img