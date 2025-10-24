/**
 * READER.JS (INTEGRATED VERSION)
 * Manga Reader - Support chapters dari multiple repos
 * Auto-redirect ke Trakteer untuk locked chapters
 * Track chapter views to pending-chapter-views.json via Google Apps Script
 * Enhanced with page navigation, mode switching, and image protection
 */

// Mapping repo ke URL manga.json
const MANGA_REPOS = {
    '10nenburi': 'https://raw.githubusercontent.com/nurananto/10nenburi/main/manga.json',
    'madogiwa' : 'https://raw.githubusercontent.com/nurananto/MadogiwaHenshuu/refs/heads/main/manga.json',
    'yarikonda': 'https://raw.githubusercontent.com/nurananto/YarikondaRenaiGame/refs/heads/main/manga.json',
    'tensai'   : 'https://raw.githubusercontent.com/nurananto/TensaiBishoujo/refs/heads/main/manga.json',
    'suufungo' : 'https://raw.githubusercontent.com/nurananto/SuufungonoMirai/refs/heads/main/manga.json',
    'sankakukei' : 'https://raw.githubusercontent.com/nurananto/SankakukeinoLoop/refs/heads/main/manga.json',
    'negatte' : 'https://raw.githubusercontent.com/nurananto/NegattemoNai/refs/heads/main/manga.json',
    'midari' : 'https://raw.githubusercontent.com/nurananto/Midari/refs/heads/main/manga.json',
    'kiminonegai' : 'https://raw.githubusercontent.com/nurananto/KiminoNegai/refs/heads/main/manga.json',
    'amarichan' : 'https://raw.githubusercontent.com/nurananto/Amarichan/refs/heads/main/manga.json',
    'aiwooshiete' : 'https://raw.githubusercontent.com/nurananto/AiwoOshiete/refs/heads/main/manga.json',
    'kawaiigal' : 'https://raw.githubusercontent.com/nurananto/KawaiiGal/refs/heads/main/manga.json',
    'vtuber' : 'https://raw.githubusercontent.com/nurananto/YuumeiVTuber/refs/heads/main/manga.json',
    'uchi' : 'https://raw.githubusercontent.com/nurananto/UchinoSeiso-kei/refs/heads/main/manga.json',
};

// Link Trakteer untuk chapter terkunci
const TRAKTEER_LINK = 'https://trakteer.id/NuranantoScanlation';

// Google Apps Script URL untuk chapter view counter
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
const modeBtn = document.getElementById('modeBtn');
const modeText = document.getElementById('modeText');
const pageNav = document.getElementById('pageNav');
const pageList = document.getElementById('pageList');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const btnNextChapterBottom = document.getElementById('btnNextChapterBottom');

// Load saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    initProtection();
    await initializeReader();
    setupEnhancedEventListeners();
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
        const mangaJsonUrl = MANGA_REPOS[repo];
        
        if (!mangaJsonUrl) {
            throw new Error(`Repo "${repo}" tidak ditemukan di mapping`);
        }
        
        console.log(`📚 Loading manga data from: ${repo}`);
        
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
 * Setup UI elements
 */
function setupUI() {
    // Set manga title di header
    const mangaTitleElement = document.getElementById('mangaTitle');
    mangaTitleElement.textContent = mangaData.manga.title;
    
    // Adjust font size to fit in 2 lines
    adjustTitleFontSize(mangaTitleElement);
    
    // Set chapter title
    const titleElement = document.getElementById('chapterTitle');
    titleElement.textContent = currentChapter.title;
    
    // Set mode text based on current mode
    modeText.textContent = readMode === 'manga' ? 'Manga' : 'Webtoon';
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
        const imageUrl = `${repoUrl}/${currentChapterFolder}/${imagePrefix}${paddedPage}.${imageFormat}`;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `Page ${i}`;
        
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
        console.log(`   Repo: ${repoParam}, Chapter: ${currentChapterFolder}`);
        
        // Increment via Google Apps Script
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                repo: repoParam,
                chapter: currentChapterFolder,
                type: 'chapter'
            }),
            mode: 'no-cors'
        });
        
        // Mark as viewed
        sessionStorage.setItem(viewKey, 'true');
        
        console.log('✅ Chapter view tracked successfully');
        
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
    // Mode toggle
    modeBtn.addEventListener('click', async () => {
        readMode = readMode === 'manga' ? 'webtoon' : 'manga';
        modeText.textContent = readMode === 'manga' ? 'Manga' : 'Webtoon';
        
        // Save mode to localStorage
        localStorage.setItem('readMode', readMode);
        
        // Reset next chapter button visibility
        const nextChapterContainer = document.getElementById('nextChapterContainer');
        readerContainer.classList.remove('show-next-chapter');
        if (readMode === 'manga') {
            nextChapterContainer.style.display = 'none'; // Hide in manga mode initially
        } else {
            nextChapterContainer.style.display = 'block'; // Show in webtoon mode
        }
        
        // Reload pages with new mode
        currentPage = 1;
        await loadChapterPages();
    });
    
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
    
    // Touch support for mobile
    let touchTimeout;
    
    pageNavHandle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        document.body.classList.add('show-page-nav');
        clearTimeout(touchTimeout);
        
        touchTimeout = setTimeout(() => {
            document.body.classList.remove('show-page-nav');
        }, 5000);
    });
    
    document.addEventListener('touchstart', () => {
        // Only show briefly on touch if not touching handle
        if (!event.target.closest('.page-nav-handle') && !event.target.closest('.page-nav')) {
            clearTimeout(touchTimeout);
            touchTimeout = setTimeout(() => {
                document.body.classList.add('show-page-nav');
                
                setTimeout(() => {
                    document.body.classList.remove('show-page-nav');
                }, 3000);
            }, 100);
        }
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
