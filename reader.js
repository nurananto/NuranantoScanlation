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

// Debug mode - set to true to allow console access
const DEBUG_MODE = false; // Change to true for debugging

// State management
let mangaData = null;
let currentChapterFolder = null;
let currentChapter = null;
let allChapters = [];
let repoParam = null;
let readMode = localStorage.getItem('readMode') || 'webtoon'; // Default webtoon, load from localStorage
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
            alert('Chapter ini terkunci. Silakan donasi untuk membuka chapter ini!');
            window.location.href = TRAKTEER_LINK;
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
    
    // Setup bottom next chapter button
    btnNextChapterBottom.onclick = () => navigateChapter('next');
    
    // Update navigation button states
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
        setupMangaScrollTracking();
        
        // Generate page thumbnails
        renderPageThumbnails();
        
        // Initialize progress bar
        updateProgressBar();
        
        console.log('✅ Pages container setup complete');
        
        // Load last page if available
        currentPage = loadLastPage();
        
        // Set reader container class based on mode
        if (readMode === 'manga') {
            readerContainer.classList.add('manga-mode');
            readerContainer.classList.remove('webtoon-mode');
        } else {
            readerContainer.classList.add('webtoon-mode');
            readerContainer.classList.remove('manga-mode');
        }
        
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
function setupMangaScrollTracking() {
    const nextChapterContainer = document.getElementById('nextChapterContainer');
    
    if (readMode === 'manga') {
        // Hide next chapter button initially in manga mode
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
                saveLastPage(); // Save when page changes
            }
            
            // Show next chapter button only on last page in manga mode
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
        // In webtoon mode, always show next chapter button
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
        // Horizontal scroll to page
        const containerWidth = readerContainer.offsetWidth;
        const targetScroll = (pageNum - 1) * containerWidth;
        readerContainer.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    } else {
        // Vertical scroll to page
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
        if (readMode === 'manga') {
            // Horizontal scroll for manga mode
            pages[pageNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        } else {
            // Vertical scroll for webtoon mode
            pages[pageNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
    const currentIndex = allChapters.findIndex(ch => ch.folder === currentChapterFolder);
    
    // Next button (karena sort descending, next = index - 1)
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
        alert('Chapter ini terkunci. Silakan donasi untuk membuka chapter ini!');
        window.open(TRAKTEER_LINK, '_blank');
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
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scroll down
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.opacity = '0';
        
        // Update header: Judul + Chapter
        if (mangaData && currentChapter) {
            mangaTitleElement.textContent = `${mangaData.manga.title} - ${currentChapter.title}`;
        }
    } else {
        // Scroll up
        navbar.style.transform = 'translateY(0)';
        navbar.style.opacity = '1';
        
        // Update header: Judul saja
        if (mangaData) {
            mangaTitleElement.textContent = mangaData.manga.title;
        }
    }
    
    lastScrollTop = scrollTop;
});
