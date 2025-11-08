/**
 * READER.JS - FIXED
 * Manga reader with navigation
 */

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

// ============================================
// SMART END CHAPTER LOGIC
// ============================================

/**
 * Predict next chapter number based on last 4 chapters pattern
 */
function predictNextChapter(allChapters, currentChapterFolder) {
    const currentIndex = allChapters.findIndex(ch => ch.folder === currentChapterFolder);
    
    // Get last 4 chapters before current (or less if not available)
    const recentChapters = [];
    for (let i = currentIndex; i < Math.min(currentIndex + 4, allChapters.length); i++) {
        if (allChapters[i]) {
            recentChapters.push(allChapters[i].folder);
        }
    }
    
    // Parse chapter numbers
    const parseChapter = (folder) => {
        const match = folder.match(/(\d+\.?\d*)/);
        return match ? parseFloat(match[1]) : null;
    };
    
    const numbers = recentChapters.map(parseChapter).filter(n => n !== null);
    
    if (numbers.length === 0) {
        return null;
    }
    
    if (numbers.length === 1) {
        // Only current chapter - increment by 1 or 0.1
        const current = numbers[0];
        return Math.floor(current) === current ? current + 1 : (parseFloat(current) + 0.1).toFixed(1);
    }
    
    // Use last 2 chapters to determine pattern
    const current = numbers[0];
    const previous = numbers[1];
    const lastDiff = Math.abs(current - previous);
    
    // Check if this is a consistent small increment pattern (0.1 or 0.5)
    if (lastDiff <= 0.5) {
        // Small increment - likely decimal pattern (6.1, 6.2, 6.3 or 6.5, 7.0, 7.5)
        const next = current + lastDiff;
        
        // Check if it's decimal pattern
        if (lastDiff < 1) {
            return next.toFixed(1);
        } else {
            return Math.round(next);
        }
    }
    
    // Large jump detected (e.g., 6.5 → 7.1)
    // Extract integer and decimal parts
    const currentInt = Math.floor(current);
    const currentDec = parseFloat((current - currentInt).toFixed(1));
    
    if (currentDec > 0) {
        // Current is decimal (e.g., 7.1)
        // Next should be same integer with incremented decimal (7.2)
        const nextDec = parseFloat((currentDec + 0.1).toFixed(1));
        
        if (nextDec < 1) {
            return parseFloat((currentInt + nextDec).toFixed(1));
        } else {
            // Decimal rolled over (e.g., 7.9 → 8.0)
            return currentInt + 1;
        }
    } else {
        // Current is integer (e.g., 7)
        // Next is integer + 1
        return currentInt + 1;
    }
}

/**
 * Check if chapter is oneshot
 */
function isOneshotChapter(chapterFolder) {
    const lower = chapterFolder.toLowerCase();
    return lower.includes('oneshot') || lower.includes('one-shot') || lower === 'os';
}

/**
 * Show locked chapter modal
 */
function showLockedChapterModal() {
    console.log('🔒 showLockedChapterModal called');
    const modal = document.getElementById('lockedChapterModal');
    console.log('🔒 Modal element:', modal);
    
    if (!modal) {
        console.error('❌ lockedChapterModal element not found!');
        return;
    }
    
    // Add active class for z-index override
    modal.classList.add('active');
    // Override both display and opacity/visibility
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    console.log('🔒 Modal shown with flex + opacity + visibility + active class');
    
    // Setup button handlers
    const btnYes = document.getElementById('btnLockedYes');
    const btnNo = document.getElementById('btnLockedNo');
    
    console.log('🔒 Buttons:', { btnYes, btnNo });
    
    const closeModal = () => {
        modal.classList.remove('active');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition
    };
    
    btnYes.onclick = () => {
        closeModal();
        window.open(TRAKTEER_LINK, '_blank');
    };
    
    btnNo.onclick = closeModal;
    
    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
}

/**
 * Render end chapter buttons based on conditions
 */
function renderEndChapterButtons() {
    const container = document.getElementById('endChapterContainer');
    if (!container) return;
    
    const currentIndex = allChapters.findIndex(ch => ch.folder === currentChapterFolder);
    const isLastChapter = currentIndex === 0;
    const isOneshot = isOneshotChapter(currentChapterFolder);
    
    if (!isLastChapter) {
        // Not last chapter - show normal Next Chapter button
        container.innerHTML = `
            <button class="next-chapter-btn" id="btnNextChapterDynamic">
                Next Chapter
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>
        `;
        
        const btn = document.getElementById('btnNextChapterDynamic');
        btn.onclick = () => navigateChapter('next');
        return;
    }
    
    // Last chapter - check conditions
    const nextChapter = allChapters[currentIndex - 1];
    const nextIsLocked = nextChapter && nextChapter.locked;
    
    if (nextIsLocked) {
        // Condition 1: Next is locked - show Next Chapter button with trakteer alert
        container.innerHTML = `
            <button class="next-chapter-btn" id="btnNextChapterLocked">
                Next Chapter
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>
        `;
        
        const btn = document.getElementById('btnNextChapterLocked');
        btn.onclick = () => {
            showLockedChapterModal();
        };
        return;
    }
    
    if (isOneshot) {
        // Condition 2: Oneshot - show Back to Info only
        container.innerHTML = `
            <button class="back-to-info-btn-large" onclick="window.location.href='info-manga.html?repo=${repoParam}'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Back to Info</span>
            </button>
        `;
        return;
    }
    
    // Condition 3: Final chapter (no locked ahead) - show 2 buttons
    const predictedNext = predictNextChapter(allChapters, currentChapterFolder);
    
    container.innerHTML = `
        <div class="dual-buttons-container">
            <button class="back-to-info-btn-half" onclick="window.location.href='info-manga.html?repo=${repoParam}'">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Back to Info</span>
            </button>
            <button class="trakteer-btn-half" onclick="window.open('${TRAKTEER_LINK}', '_blank')">
                <img src="assets/trakteer-icon.png" alt="Trakteer" class="trakteer-icon-small">
                <span>Bantu Beli Chapter ${predictedNext || 'Selanjutnya'}</span>
            </button>
        </div>
    `;
}


// Debug mode - set to true to allow console access
const DEBUG_MODE = false; // Change to true for debugging

// State management
let mangaData = null;
let currentChapterFolder = null;
let currentChapter = null;
let allChapters = [];
let repoParam = null;
let readMode = 'webtoon'; // Force webtoon mode only
let currentPage = 1;
let totalPages = 0;

// DOM Elements
const readerContainer = document.getElementById('readerContainer');
const pageNav = document.getElementById('pageNav');
const pageList = document.getElementById('pageList');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
// btnNextChapterBottom - removed, now dynamic

// Load saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initProtection();
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
    // Don't show alert for every error, just log it
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
        
        // Get parameters from URL
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
        
        // Load manga data from repo
        await loadMangaData(repoParam);
        
        if (!mangaData) {
            alert('Error: Gagal memuat data manga.');
            hideLoading();
            return;
        }
        
        // Check if chapter exists
        const chapterData = findChapterByFolder(chapterParam);
        
        if (!chapterData) {
            alert(`Error: Chapter ${chapterParam} tidak ditemukan.`);
            hideLoading();
            return;
        }
        
        // Check if chapter is locked
        if (chapterData.locked) {
            console.log('🔒 Chapter terkunci, redirect ke Trakteer...');
            showLockedChapterModal();
            return;
        }
        
        // Set current chapter
        currentChapter = chapterData;
        currentChapterFolder = chapterParam;
        totalPages = currentChapter.pages;
        
        // Setup UI
        setupUI();
        
        // Load chapter pages
        await loadChapterPages();
        
        // Track chapter view (async, don't wait)
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
        
        // Extract manga.json URL and githubRepo
        let mangaJsonUrl;
        if (typeof mangaConfig === 'string') {
            // Old format (string)
            mangaJsonUrl = mangaConfig;
        } else {
            // New format (object with url and githubRepo)
            mangaJsonUrl = mangaConfig.url;
            // Store githubRepo globally for view tracking
            window.currentGithubRepo = mangaConfig.githubRepo;
            console.log(`🔗 GitHub repo: ${mangaConfig.githubRepo}`);
        }
        
        // Add cache buster
        const timestamp = new Date().getTime();
        const response = await fetch(`${mangaJsonUrl}?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        mangaData = await response.json();
        
        console.log('📦 Manga data loaded:', mangaData);
        
        // Convert chapters to array and sort
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
    return 1; // Default to first page
}

/**
 * Adjust chapter title font size to fit in button
 */
function adjustChapterTitleFontSize(element) {
    const parentButton = element.closest('.chapter-btn');
    if (!parentButton) return;
    
    const maxHeight = 44; // Button min-height
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    const minFontSize = 10;
    
    // Function to check if text overflows button height
    const checkOverflow = () => {
        return element.scrollHeight > maxHeight;
    };
    
    // Reduce font size until it fits
    while (checkOverflow() && fontSize > minFontSize) {
        fontSize -= 0.5;
        element.style.fontSize = `${fontSize}px`;
    }
    
    console.log(`📝 Chapter title font adjusted to: ${fontSize}px`);
}

/**
 * Setup UI elements
 */
function setupUI() {
    // Set manga title di header
    const mangaTitleElement = document.getElementById('mangaTitle');
    mangaTitleElement.textContent = mangaData.manga.title;
    
    // Update browser tab title
    document.title = `${mangaData.manga.title} - ${currentChapter.title}`;
    
    // Adjust font size to fit in 2 lines
    adjustTitleFontSize(mangaTitleElement);
    
    // Set chapter title
    const titleElement = document.getElementById('chapterTitle');
    titleElement.textContent = currentChapter.title;
    
    // Adjust chapter title font size to fit in button
    adjustChapterTitleFontSize(titleElement);
    
    console.log(`📖 Read mode: ${readMode}`);
    
    // Setup back button
    const btnBack = document.getElementById('btnBackToInfo');
    btnBack.onclick = () => {
        window.location.href = `info-manga.html?repo=${repoParam}`;
    };
    
    // Setup chapter list button
    const btnChapterList = document.getElementById('btnChapterList');
    btnChapterList.onclick = () => {
        openChapterListModal();
    };
    
    // Update navigation button states (will render dynamic buttons)
    updateNavigationButtons();
    
    // Setup modal close
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
    const minFontSize = 12; // Minimum font size in pixels
    
    // Calculate if text overflows 2 lines
    const checkOverflow = () => {
        const computedHeight = element.scrollHeight;
        const maxHeight = fontSize * lineHeight * maxLines;
        return computedHeight > maxHeight;
    };
    
    // Reduce font size until it fits in 2 lines
    while (checkOverflow() && fontSize > minFontSize) {
        fontSize -= 0.5;
        element.style.fontSize = `${fontSize}px`;
    }
    
    console.log(`📝 Title font adjusted to: ${fontSize}px`);
}

/**
 * Load chapter pages
 */
async function loadChapterPages() {
    try {
        readerContainer.innerHTML = '';
        readerContainer.className = `reader-container ${readMode}-mode`;
        
        let { repoUrl, imagePrefix, imageFormat } = mangaData.manga;
        
        // Remove trailing slash from repoUrl if exists
        repoUrl = repoUrl.replace(/\/$/, '');
        
        console.log('📄 Loading chapter pages...');
        console.log('- Repo URL:', repoUrl);
        console.log('- Folder:', currentChapterFolder);
        console.log('- Total pages:', totalPages);
        console.log('- Image prefix:', imagePrefix);
        console.log('- Image format:', imageFormat);
        
        // Generate image URLs
        for (let i = 1; i <= totalPages; i++) {
            const paddedPage = String(i).padStart(2, '0');
            const imageUrl = `${repoUrl}/${currentChapterFolder}/${imagePrefix}${paddedPage}.${imageFormat}`;
            
            console.log(`📸 Page ${i}: ${imageUrl}`);
            
            const img = document.createElement('img');
            img.className = 'reader-page';
            img.src = imageUrl;
            img.alt = `Page ${i}`;
            img.loading = 'lazy';
            
            // Update page indicator on scroll
            img.setAttribute('data-page', i);
            
            img.onload = () => {
                console.log(`✅ Page ${i} loaded successfully`);
            };
            
            img.onerror = () => {
                console.error(`❌ Failed to load page ${i}:`, imageUrl);
                // Create a placeholder div instead of showing error text
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
                
                // Replace img with placeholder
                img.replaceWith(placeholder);
            };
            
            readerContainer.appendChild(img);
        }
        
        // Setup intersection observer for page tracking
        setupPageTracking();
        
        // Setup manga scroll tracking
        setupWebtoonScrollTracking();
        
        // Generate page thumbnails
        renderPageThumbnails();
        
        // Initialize progress bar
        updateProgressBar();
        
        console.log('✅ Pages container setup complete');
        
        // Load last page if available
        currentPage = loadLastPage();
        
        // Set reader container to webtoon mode only
        readerContainer.classList.add('webtoon-mode');
        readerContainer.classList.remove('manga-mode');
        
        // Navigate to last page if not first page
        if (currentPage > 1) {
            setTimeout(() => {
                goToPage(currentPage);
                updatePageNavigation();
            }, 100);
        }
        
        // Hide loading overlay after DOM is ready
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
                saveLastPage(); // Save when page changes
            }
        });
    }, options);
    
    const pages = document.querySelectorAll('.reader-page');
    pages.forEach(page => observer.observe(page));
}

// Add scroll listener for manga mode horizontal tracking
function setupWebtoonScrollTracking() {
    const endChapterContainer = document.getElementById('endChapterContainer');
    
    // In webtoon mode, hide initially (will show on scroll to bottom)
    if (endChapterContainer) {
        endChapterContainer.style.display = 'none';
    }
}

/**
 * Navigate to specific page
 */
function goToPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;
    
    currentPage = pageNum;
    saveLastPage();
    
    // Vertical scroll to page (webtoon mode only)
    const pages = document.querySelectorAll('.reader-page');
    if (pages[pageNum - 1]) {
        pages[pageNum - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    updatePageNavigation();
}

/**
 * Generate thumbnail URL using image proxy for faster loading
 */
function getThumbnailUrl(originalUrl) {
    // Use images.weserv.nl proxy to resize images on-the-fly
    // Original: ~2MB, Thumbnail: ~50KB (40x faster!)
    const encodedUrl = originalUrl.replace('https://', '');
    return `https://images.weserv.nl/?url=${encodedUrl}&w=200&h=300&fit=cover&output=webp`;
}

/**
 * Render page thumbnails
 */
function renderPageThumbnails() {
    pageList.innerHTML = '';
    
    let { repoUrl, imagePrefix, imageFormat } = mangaData.manga;
    
    // Remove trailing slash from repoUrl if exists
    repoUrl = repoUrl.replace(/\/$/, '');
    
    for (let i = 1; i <= totalPages; i++) {
        const thumb = document.createElement('div');
        thumb.className = 'page-thumb';
        if (i === currentPage) {
            thumb.classList.add('active');
        }
        
        const paddedPage = String(i).padStart(2, '0');
        const originalUrl = `${repoUrl}/${currentChapterFolder}/${imagePrefix}${paddedPage}.${imageFormat}`;
        
        const img = document.createElement('img');
        img.loading = 'lazy'; // Add lazy loading for thumbnails
        img.alt = `Page ${i}`;
        
        // Add loading placeholder
        img.style.backgroundColor = 'var(--secondary-bg)';
        
        // Use thumbnail proxy for faster loading
        const thumbnailUrl = getThumbnailUrl(originalUrl);
        img.src = thumbnailUrl;
        
        // Add loaded class when image loads
        img.onload = () => {
            thumb.classList.add('loaded');
        };
        
        img.onerror = () => {
            // Fallback to original if proxy fails
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
 * Go to specific page
 */
function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    currentPage = pageNumber;
    const pages = document.querySelectorAll('.reader-page');
    
    if (pages[pageNumber - 1]) {
        // Vertical scroll for webtoon mode only
        pages[pageNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    updatePageNavigation();
}

/**
 * Update page navigation
 */
function updatePageNavigation() {
    // Update thumbnail active state
    document.querySelectorAll('.page-thumb').forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentPage - 1);
    });
    
    // Scroll active thumbnail into view
    const activeThumb = document.querySelector('.page-thumb.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    
    // Update progress bar handle
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
    // Render smart end chapter buttons
    renderEndChapterButtons();
}

/**
 * Navigate to prev/next chapter
 */
function navigateChapter(direction) {
    const currentIndex = allChapters.findIndex(ch => ch.folder === currentChapterFolder);
    
    let targetIndex;
    if (direction === 'prev') {
        targetIndex = currentIndex + 1; // Karena sort descending
    } else {
        targetIndex = currentIndex - 1;
    }
    
    if (targetIndex < 0 || targetIndex >= allChapters.length) {
        return;
    }
    
    const targetChapter = allChapters[targetIndex];
    
    // Check if locked
    if (targetChapter.locked) {
        showLockedChapterModal();
        return;
    }
    
    // Redirect to new chapter
    window.location.href = `reader.html?repo=${repoParam}&chapter=${targetChapter.folder}`;
}

/**
 * Open chapter list modal
 */
function openChapterListModal() {
    const modal = document.getElementById('modalOverlay');
    const modalBody = document.getElementById('chapterListModal');
    
    // Clear and populate
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
                closeChapterListModal(); // Close chapter list first
                setTimeout(() => {
                    showLockedChapterModal();
                }, 100); // Small delay for smooth transition
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
        // Check if already viewed in this session
        const viewKey = `viewed_${repoParam}_${currentChapterFolder}`;
        const hasViewed = sessionStorage.getItem(viewKey);
        
        if (hasViewed) {
            console.log('👁️ Already counted in this session');
            return;
        }
        
        console.log('📤 Tracking chapter view...');
        
        // Get GitHub repo name from config or use repoParam as fallback
        const githubRepo = window.currentGithubRepo || repoParam;
        
        console.log(`   URL param: ${repoParam}`);
        console.log(`   GitHub repo: ${githubRepo}`);
        console.log(`   Chapter: ${currentChapterFolder}`);
        
        // Increment via Google Apps Script
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({ 
                repo: githubRepo,  // Send GitHub repo name, not URL param
                chapter: currentChapterFolder,
                type: 'chapter',
                timestamp: getWIBTimestamp()
            }),
            mode: 'no-cors'
        });
        
        // Mark as viewed
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
 * Protection against right-click and other methods
 */
function initProtection() {
    // Skip protection if in debug mode
    if (DEBUG_MODE) {
        console.log('🔓 Debug mode enabled - protection disabled');
        return;
    }
    
    // Disable right-click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Disable specific keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
            (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
            (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
            (e.ctrlKey && e.keyCode === 83) // Ctrl+S
        ) {
            e.preventDefault();
            return false;
        }
    });

    // Disable text selection on images
    document.addEventListener('selectstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Disable drag and drop
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Disable copy
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
    });
}

/**
 * Setup enhanced event listeners
 */
function setupEnhancedEventListeners() {
    // Page navigation handle
    const pageNavHandle = document.getElementById('pageNavHandle');
    
    pageNavHandle.addEventListener('click', () => {
        document.body.classList.add('show-page-nav');
    });
    
    pageNavHandle.addEventListener('mouseenter', () => {
        document.body.classList.add('show-page-nav');
    });
    
    // Show page nav when mouse near bottom
    let showNavTimeout;
    document.addEventListener('mousemove', (e) => {
        const windowHeight = window.innerHeight;
        const mouseY = e.clientY;
        
        // Show if mouse is in bottom 80px (reduced from 150px to avoid conflict with next chapter button)
        if (mouseY > windowHeight - 80) {
            document.body.classList.add('show-page-nav');
            clearTimeout(showNavTimeout);
        } else {
            // Hide after delay if not hovering page nav or handle
            clearTimeout(showNavTimeout);
            showNavTimeout = setTimeout(() => {
                if (!pageNav.matches(':hover') && !pageNavHandle.matches(':hover')) {
                    document.body.classList.remove('show-page-nav');
                }
            }, 300);
        }
    });
    
    // Keep visible when hovering page nav
    pageNav.addEventListener('mouseenter', () => {
        clearTimeout(showNavTimeout);
        document.body.classList.add('show-page-nav');
    });
    
    pageNav.addEventListener('mouseleave', () => {
        showNavTimeout = setTimeout(() => {
            document.body.classList.remove('show-page-nav');
        }, 500);
    });
    
    // Touch support for mobile - Immediate show with single tap
    let touchTimeout;
    let isNavShowing = false;
    
    // Single tap on progress bar handle shows navigation
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
    
    // Tap near bottom to show navigation immediately
    document.addEventListener('touchstart', (e) => {
        // Ignore if already tapping on page nav itself
        if (e.target.closest('.page-nav')) {
            return;
        }
        
        const windowHeight = window.innerHeight;
        const touchY = e.touches[0].clientY;
        
        // Show immediately if touching bottom 50px
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
    
    // Tap anywhere on page-nav to keep it visible
    pageNav.addEventListener('touchstart', () => {
        clearTimeout(touchTimeout);
        document.body.classList.add('show-page-nav');
        isNavShowing = true;
        
        touchTimeout = setTimeout(() => {
            document.body.classList.remove('show-page-nav');
            isNavShowing = false;
        }, 5000);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Don't interfere with protection shortcuts
        if (e.ctrlKey || e.shiftKey) return;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                window.scrollBy({ top: -300, behavior: 'smooth' });
                break;
            case 'ArrowDown':
                e.preventDefault();
                window.scrollBy({ top: 300, behavior: 'smooth' });
                break;
        }
    });
    
    // Adjust title on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const mangaTitleElement = document.getElementById('mangaTitle');
            if (mangaTitleElement && mangaData) {
                // Reset font size to default
                mangaTitleElement.style.fontSize = '';
                // Re-adjust
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
    
    // Update header title berdasarkan posisi scroll
    if (scrollTop === 0) {
        // Di paling atas: Judul saja
        if (mangaData) {
            mangaTitleElement.textContent = mangaData.manga.title;
        }
    } else {
        // Sudah scroll: Judul + Chapter
        if (mangaData && currentChapter) {
            mangaTitleElement.textContent = `${mangaData.manga.title} - ${currentChapter.title}`;
        }
    }
    
    // Hide/show navbar
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scroll down - hide navbar
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.opacity = '0';
    } else {
        // Scroll up - show navbar
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
    }
    
    // Check if at last page in webtoon mode
    if (readMode === 'webtoon') {
        const endChapterContainer = document.getElementById('endChapterContainer');
        if (endChapterContainer) {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollBottom = scrollTop + windowHeight;
            
            // Show buttons when near bottom (within 200px)
            if (scrollBottom >= documentHeight - 200) {
                endChapterContainer.style.display = 'block';
            } else {
                endChapterContainer.style.display = 'none';
            }
        }
    }
    
    lastScrollTop = scrollTop;
});
