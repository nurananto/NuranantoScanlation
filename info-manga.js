/**
 * INFO-MANGA.JS - WITH BALANCED PROTECTION
 * Load manga data dari repo chapter (support multiple manga)
 * 
 * CARA PAKAI:
 * info-manga.html?repo=10nenburi
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

// Google Apps Script URL untuk view counter
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZ0-VeyloQxjvh-h65G0wtfAzxVq6VYzU5Bz9n1Rl0T4GAkGu9X7HmGh_3_0cJhCS1iA/exec';

let mangaData = null;

// Load data saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    await loadMangaFromRepo();
    setupShowDetailsButton();
    
    // Track page view
    trackPageView();
});

/**
 * Get manga.json URL from URL parameter
 */
function getMangaJsonUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');
    
    if (!repoParam) {
        console.error('❌ Parameter "repo" tidak ditemukan di URL');
        alert('Error: Parameter repo tidak ditemukan.\n\nContoh: info-manga.html?repo=10nenburi');
        return null;
    }
    
    const mangaConfig = MANGA_REPOS[repoParam];
    
    if (!mangaConfig) {
        console.error(`❌ Repo "${repoParam}" tidak ditemukan di mapping`);
        alert(`Error: Repo "${repoParam}" tidak terdaftar.\n\nRepo tersedia: ${Object.keys(MANGA_REPOS).join(', ')}`);
        return null;
    }
    
    console.log(`📚 Loading manga: ${repoParam}`);
    
    // Support both old format (string) and new format (object)
    if (typeof mangaConfig === 'string') {
        return mangaConfig;
    } else {
        // Store githubRepo for later use
        window.currentGithubRepo = mangaConfig.githubRepo;
        return mangaConfig.url;
    }
}

/**
 * Load manga.json dari repo chapter
 */
async function loadMangaFromRepo() {
    try {
        const mangaJsonUrl = getMangaJsonUrl();
        if (!mangaJsonUrl) return;
        
        // Add cache buster
        const timestamp = new Date().getTime();
        const response = await fetch(`${mangaJsonUrl}?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        mangaData = await response.json();
        
        console.log('📦 Raw manga data:', mangaData);
        
        // Display manga info
        displayMangaInfo();
        
        // Display chapters
        displayChapters();
        
        // Fetch MangaDex rating
        fetchMangaDexRating();
        
        // Update page title
        document.title = `${mangaData.manga.title} - Info`;
        
        console.log('✅ Manga data loaded from repo (WIB timezone)');
        
    } catch (error) {
        console.error('❌ Error loading manga data:', error);
        alert('Gagal memuat data manga dari repository. Cek console untuk detail.');
    }
}

/**
 * Display informasi manga
 */
function displayMangaInfo() {
    const manga = mangaData.manga;
    
    // Update Title - Desktop
    const mainTitle = document.getElementById('mainTitle');
    const subtitle = document.getElementById('subtitle');
    mainTitle.textContent = manga.title;
    subtitle.textContent = manga.alternativeTitle || '';
    
    // Add class untuk judul panjang
    adjustTitleSize(mainTitle, manga.title);
    adjustTitleSize(subtitle, manga.alternativeTitle, true);
    
    // Update Title - Mobile
    const mainTitleMobile = document.getElementById('mainTitleMobile');
    const subtitleMobile = document.getElementById('subtitleMobile');
    mainTitleMobile.textContent = manga.title;
    subtitleMobile.textContent = manga.alternativeTitle || '';
    
    adjustTitleSize(mainTitleMobile, manga.title);
    adjustTitleSize(subtitleMobile, manga.alternativeTitle, true);
    
    // Update Cover
    const coverImg = document.getElementById('mangaCover');
    coverImg.src = manga.cover;
    coverImg.onerror = function() {
        console.error('❌ Failed to load cover:', manga.cover);
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect width="300" height="450" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3ENo Cover%3C/text%3E%3C/svg%3E';
    };
    
    // Update Views
    document.getElementById('viewsCount').textContent = manga.views || 0;
    document.getElementById('viewsCountMobile').textContent = manga.views || 0;
    
    // Update Description
    document.getElementById('descriptionContent').textContent = manga.description;
    
    // Update mobile sinopsis in details container
    const synopsisMobile = document.getElementById('synopsisMobile');
    if (synopsisMobile) {
        synopsisMobile.textContent = manga.description;
    }
    
    // Update Author & Artist
    document.getElementById('authorName').textContent = manga.author;
    document.getElementById('artistName').textContent = manga.artist;
    
    // Update Genre
    displayGenres(manga.genre);
    
    // Setup Buttons
    setupButtons(manga.links);
}

/**
 * Adjust title size based on length
 */
function adjustTitleSize(element, text, isSubtitle = false) {
    if (!element || !text) return;
    
    const length = text.length;
    
    if (isSubtitle) {
        // Subtitle threshold
        if (length > 80) {
            element.classList.add('long-subtitle');
        }
    } else {
        // Main title threshold
        if (length > 50) {
            element.classList.add('long-title');
        }
    }
}

/**
 * Display genre tags
 */
function displayGenres(genres) {
    const genreList = document.getElementById('genreList');
    genreList.innerHTML = '';
    
    if (!genres || genres.length === 0) {
        genreList.innerHTML = '<span class="genre-tag">Unknown</span>';
        return;
    }
    
    genres.forEach(genre => {
        const tag = document.createElement('span');
        tag.className = 'genre-tag';
        tag.textContent = genre;
        genreList.appendChild(tag);
    });
}

/**
 * Display chapters
 */
function displayChapters() {
    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = '';
    
    // Convert chapters object to array
    const chaptersArray = Object.values(mangaData.chapters);
    
    // Sort descending (terbaru di atas)
    chaptersArray.sort((a, b) => {
        const numA = parseFloat(a.folder);
        const numB = parseFloat(b.folder);
        return numB - numA;
    });
    
    // Get initial limit
    const initialLimit = getInitialChapterLimit();
    
    chaptersArray.forEach((chapter, index) => {
        const chapterElement = createChapterElement(chapter);
        
        // Hide chapters beyond limit
        if (index >= initialLimit) {
            chapterElement.classList.add('chapter-hidden');
        }
        
        chapterList.appendChild(chapterElement);
    });
    
    // Add show more button if needed
    if (chaptersArray.length > initialLimit) {
        const showMoreBtn = createShowMoreButton(chaptersArray.length - initialLimit);
        chapterList.appendChild(showMoreBtn);
    }
    
    console.log(`✅ Loaded ${chaptersArray.length} chapters`);
}

/**
 * Create chapter element
 */
function createChapterElement(chapter) {
    const div = document.createElement('div');
    div.className = 'chapter-item';
    
    // Check if locked
    if (chapter.locked) {
        div.classList.add('chapter-locked');
        div.onclick = () => trackLockedChapterView(chapter);
    } else {
        div.onclick = () => openChapter(chapter);
    }
    
    const lockIcon = chapter.locked ? '🔒 ' : '';
    
    div.innerHTML = `
        <div class="chapter-info">
            <div class="chapter-title-text">${lockIcon}${chapter.title}</div>
        </div>
        <div class="chapter-views">
            <span>👁️ ${chapter.views}</span>
        </div>
    `;
    
    return div;
}

/**
 * Open Trakteer link for locked chapters
 */
function openTrakteer() {
    window.open(TRAKTEER_LINK, '_blank');
}

/**
 * Track locked chapter view and open Trakteer
 */
async function trackLockedChapterView(chapter) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const repoParam = urlParams.get('repo');
        
        if (!repoParam) {
            console.error('❌ Repo parameter not found');
            openTrakteer();
            return;
        }
        
        console.log('🔒 Locked chapter clicked:', chapter.folder);
        console.log('📊 Tracking view for locked chapter...');
        
        // Get GitHub repo name from config or use repoParam as fallback
        const githubRepo = window.currentGithubRepo || repoParam;
        
        incrementPendingChapterViews(githubRepo, chapter.folder).catch(err => {
            console.error('⚠️ Failed to track locked chapter view:', err);
        });
        
        alert('Chapter ini terkunci. Silakan donasi untuk membuka chapter ini!');
        openTrakteer();
        
    } catch (error) {
        console.error('❌ Error tracking locked chapter:', error);
        openTrakteer();
    }
}

/**
 * Increment pending chapter views via Google Apps Script
 */
async function incrementPendingChapterViews(repo, chapter) {
    try {
        console.log('📡 Sending chapter view increment to Google Apps Script (WIB)...');
        
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({ 
                repo: repo,
                chapter: chapter,
                type: 'chapter',
                timestamp: getWIBTimestamp()
            }),
            mode: 'no-cors'
        });
        
        console.log('✅ Chapter view increment request sent (no-cors mode, WIB)');
        
    } catch (error) {
        console.error('❌ Error incrementing chapter views:', error);
        throw error;
    }
}

/**
 * Open chapter
 */
function openChapter(chapter) {
    // Get repo param from current URL
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');
    
    if (!repoParam) {
        console.error('❌ Repo parameter not found');
        alert('Error: Parameter repo tidak ditemukan.');
        return;
    }
    
    console.log('📖 Opening chapter:', chapter.folder, 'from repo:', repoParam);
    
    // Redirect to reader with repo and chapter params
    window.location.href = `reader.html?repo=${repoParam}&chapter=${chapter.folder}`;
}

/**
 * Get initial chapter limit
 */
function getInitialChapterLimit() {
    const width = window.innerWidth;
    
    if (width <= 480) return 2;
    else if (width <= 768) return 4;
    else if (width <= 1024) return 7;
    else return 10;
}

/**
 * Create show more button
 */
function createShowMoreButton(hiddenCount) {
    const btn = document.createElement('button');
    btn.className = 'btn-show-more';
    btn.innerHTML = `Show More (${hiddenCount} chapters)`;
    
    btn.onclick = () => {
        const hiddenChapters = document.querySelectorAll('.chapter-hidden');
        hiddenChapters.forEach(ch => {
            ch.classList.remove('chapter-hidden');
            ch.classList.add('chapter-show');
        });
        btn.remove();
    };
    
    return btn;
}

/**
 * Setup buttons
 */
function setupButtons(links) {
    const btnMangadex = document.getElementById('btnMangadex');
    const btnRaw = document.getElementById('btnRaw');
    
    // Button Mangadex
    if (btnMangadex) {
        btnMangadex.onclick = () => {
            if (links && links.mangadex) {
                window.open(links.mangadex, '_blank');
            } else {
                alert('Link Mangadex tidak tersedia');
            }
        };
    }
    
    // Button Raw
    if (btnRaw) {
        btnRaw.onclick = () => {
            if (links && links.raw) {
                window.open(links.raw, '_blank');
            } else {
                alert('Link Raw tidak tersedia');
            }
        };
    }
}

/**
 * Setup show details button
 */
function setupShowDetailsButton() {
    const btn = document.getElementById('btnShowDetails');
    const container = document.getElementById('detailsContainer');
    const btnText = document.getElementById('detailsButtonText');
    
    if (!btn || !container) return;
    
    let isShown = false;

    btn.onclick = () => {
        isShown = !isShown;
        
        if (isShown) {
            container.classList.add('show');
            btnText.textContent = 'Hide Details';
        } else {
            container.classList.remove('show');
            btnText.textContent = 'Show Details';
        }
    };
}

/**
 * Track page view
 */
async function trackPageView() {
    try {
        // Get repo param
        const urlParams = new URLSearchParams(window.location.search);
        const repoParam = urlParams.get('repo');
        
        if (!repoParam) {
            console.log('⚠️ No repo parameter, skipping view tracking');
            return;
        }
        
        // Check if already viewed in this session
        const viewKey = `viewed_${repoParam}`;
        const hasViewed = sessionStorage.getItem(viewKey);
        
        if (hasViewed) {
            console.log('📊 Already counted in this session');
            return;
        }
        
        console.log('📤 Tracking page view for:', repoParam);
        
        // Get GitHub repo name from config or use repoParam as fallback
        const githubRepo = window.currentGithubRepo || repoParam;
        
        // Increment pending views via Google Apps Script
        await incrementPendingViews(githubRepo);
        
        // Mark as viewed in this session
        sessionStorage.setItem(viewKey, 'true');
        
        console.log('✅ View tracked successfully (WIB)');
        
    } catch (error) {
        console.error('❌ Error tracking view:', error);
        // Don't throw error - continue normal operation
    }
}

/**
 * Increment pending views via Google Apps Script
 */
async function incrementPendingViews(repo) {
    try {
        console.log('📡 Sending view increment to Google Apps Script (WIB)...');
        
        // Using text/plain to avoid CORS preflight with no-cors mode
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({ 
                repo: repo,
                type: 'page',
                timestamp: getWIBTimestamp()
            }),
            mode: 'no-cors'
        });
        
        console.log('✅ View increment request sent (no-cors mode, WIB)');
        
    } catch (error) {
        console.error('❌ Error incrementing views:', error);
    }
}

/**
 * Fetch rating dari MangaDex API dengan multi-proxy fallback + 48 hour cache
 */
async function fetchMangaDexRating() {
    try {
        const mangadexUrl = mangaData.manga.links?.mangadex;
        
        if (!mangadexUrl) {
            console.log('⚠️ MangaDex URL tidak tersedia');
            return;
        }
        
        // Extract manga ID dari URL
        const mangaIdMatch = mangadexUrl.match(/\/title\/([a-f0-9-]+)/);
        
        if (!mangaIdMatch) {
            console.error('❌ Tidak bisa extract MangaDex ID dari URL');
            return;
        }
        
        const mangaId = mangaIdMatch[1];
        
        // CEK CACHE DULU (48 JAM)
        const cachedRating = localStorage.getItem(`rating_${mangaId}`);
        const cachedTime = localStorage.getItem(`rating_time_${mangaId}`);
        
        if (cachedRating && cachedTime) {
            const cacheAge = Date.now() - parseInt(cachedTime);
            const cacheAgeHours = Math.floor(cacheAge / 3600000);
            const CACHE_DURATION = 48 * 3600000;
            
            if (cacheAge < CACHE_DURATION) {
                console.log(`📦 Using cached rating: ${cachedRating} (${cacheAgeHours} hours old, valid for ${48 - cacheAgeHours} more hours)`);
                
                const ratingScoreDesktop = document.getElementById('ratingScore');
                if (ratingScoreDesktop) {
                    ratingScoreDesktop.textContent = cachedRating;
                }
                
                const ratingScoreMobile = document.getElementById('ratingScoreMobile');
                if (ratingScoreMobile) {
                    ratingScoreMobile.textContent = cachedRating;
                }
                
                return;
            } else {
                console.log(`🔄 Cache expired (${cacheAgeHours} hours old), fetching fresh data...`);
            }
        }
        
        // FETCH BARU
        console.log(`📊 Fetching rating untuk manga ID: ${mangaId}`);
        
        const apiUrl = `https://api.mangadex.org/statistics/manga/${mangaId}`;
        
        const proxies = [
            { 
                name: 'GoogleAppsScript', 
                url: 'https://script.google.com/macros/s/AKfycbwZ0-VeyloQxjvh-h65G0wtfAzxVq6VYzU5Bz9n1Rl0T4GAkGu9X7HmGh_3_0cJhCS1iA/exec?action=getRating&mangaId=',
                isGAS: true
            }
        ];
        
        let rating = null;
        let successProxy = null;
        
        for (const proxy of proxies) {
            try {
                console.log(`🔄 Trying ${proxy.name}...`);
                
                let fetchUrl;
                if (proxy.isGAS) {
                    fetchUrl = proxy.url + mangaId;
                } else {
                    fetchUrl = proxy.url + encodeURIComponent(apiUrl);
                }
                
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },
                    signal: AbortSignal.timeout(5000)
                });
                
                if (!response.ok) {
                    console.warn(`⚠️ ${proxy.name} returned ${response.status}`);
                    continue;
                }
                
                const data = await response.json();
                
                if (proxy.isGAS) {
                    if (data.success && data.rating) {
                        rating = data.rating;
                        successProxy = proxy.name;
                        console.log(`✅ Success via ${proxy.name}!`);
                        break;
                    }
                } else {
                    rating = data.statistics?.[mangaId]?.rating?.average;
                    if (rating) {
                        successProxy = proxy.name;
                        console.log(`✅ Success via ${proxy.name}!`);
                        break;
                    }
                }
                
            } catch (error) {
                console.warn(`⚠️ ${proxy.name} failed:`, error.message);
                continue;
            }
        }
        
        if (rating) {
            const roundedRating = rating.toFixed(1);
            
            localStorage.setItem(`rating_${mangaId}`, roundedRating);
            localStorage.setItem(`rating_time_${mangaId}`, Date.now());
            
            const ratingScoreDesktop = document.getElementById('ratingScore');
            if (ratingScoreDesktop) {
                ratingScoreDesktop.textContent = roundedRating;
            }
            
            const ratingScoreMobile = document.getElementById('ratingScoreMobile');
            if (ratingScoreMobile) {
                ratingScoreMobile.textContent = roundedRating;
            }
            
            console.log(`⭐ Rating MangaDex: ${roundedRating}/10 (via ${successProxy})`);
        } else {
            console.warn('⚠️ Semua proxy gagal, rating tidak tersedia');
            
            const cachedRating = localStorage.getItem(`rating_${mangaId}`);
            const cachedTime = localStorage.getItem(`rating_time_${mangaId}`);
            
            if (cachedRating) {
                const cacheAge = Math.floor((Date.now() - parseInt(cachedTime)) / 86400000);
                console.log(`📦 Using cached rating: ${cachedRating} (${cacheAge} days old)`);
                
                const ratingScoreDesktop = document.getElementById('ratingScore');
                if (ratingScoreDesktop) {
                    ratingScoreDesktop.textContent = cachedRating;
                }
                
                const ratingScoreMobile = document.getElementById('ratingScoreMobile');
                if (ratingScoreMobile) {
                    ratingScoreMobile.textContent = cachedRating;
                }
            } else {
                console.warn('⚠️ No cache available, showing "-"');
                
                const ratingScoreDesktop = document.getElementById('ratingScore');
                if (ratingScoreDesktop) {
                    ratingScoreDesktop.textContent = '-';
                }
                
                const ratingScoreMobile = document.getElementById('ratingScoreMobile');
                if (ratingScoreMobile) {
                    ratingScoreMobile.textContent = '-';
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error fetching MangaDex rating:', error);
    }
}