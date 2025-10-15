/**
 * READER.JS
 * Manga Reader - Support chapters dari multiple repos
 * Auto-redirect ke Trakteer untuk locked chapters
 */

// Mapping repo ke URL manga.json
const MANGA_REPOS = {
    '10nenburi': 'https://raw.githubusercontent.com/nurananto/10nenburi/main/manga.json',
};

// Link Trakteer untuk chapter terkunci
const TRAKTEER_LINK = 'https://trakteer.id/NuranantoScanlation';

// Google Apps Script URL untuk chapter view counter
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZ0-VeyloQxjvh-h65G0wtfAzxVq6VYzU5Bz9n1Rl0T4GAkGu9X7HmGh_3_0cJhCS1iA/exec';

let mangaData = null;
let currentChapterFolder = null;
let currentChapter = null;
let allChapters = [];
let repoParam = null;

// Load saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    await initializeReader();
});

/**
 * Initialize reader
 */
async function initializeReader() {
    try {
        showLoading(); // Show loading at start
        
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
 * Setup UI elements
 */
function setupUI() {
    // Set manga title di header
    const mangaTitleElement = document.getElementById('mangaTitle');
    mangaTitleElement.textContent = mangaData.manga.title;
    
    // Adjust title size based on length
    adjustMangaTitleSize(mangaTitleElement, mangaData.manga.title);
    
    // Set chapter title
    const titleElement = document.getElementById('chapterTitle');
    titleElement.textContent = currentChapter.title;
    
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
    
    // Setup navigation buttons
    const btnPrev = document.getElementById('btnPrevChapter');
    const btnNext = document.getElementById('btnNextChapter');
    
    btnPrev.onclick = () => navigateChapter('prev');
    btnNext.onclick = () => navigateChapter('next');
    
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
 * Adjust manga title size based on length
 */
function adjustMangaTitleSize(element, title) {
    if (!element || !title) return;
    
    const length = title.length;
    
    // Remove existing classes
    element.classList.remove('long-title', 'extra-long-title');
    
    // Add appropriate class based on length
    if (length > 100) {
        element.classList.add('extra-long-title');
    } else if (length > 50) {
        element.classList.add('long-title');
    }
    
    console.log(`📝 Manga title length: ${length} characters`);
}

/**
 * Load chapter pages
 */
async function loadChapterPages() {
    try {
        const readerContainer = document.getElementById('readerContainer');
        readerContainer.innerHTML = '';
        
        const { repoUrl, imagePrefix, imageFormat } = mangaData.manga;
        const totalPages = currentChapter.pages;
        
        console.log('📄 Loading chapter pages...');
        console.log('- Repo URL:', repoUrl);
        console.log('- Folder:', currentChapterFolder);
        console.log('- Image Prefix:', imagePrefix);
        console.log('- Image Format:', imageFormat);
        console.log('- Total Pages:', totalPages);
        
        // Update page indicator
        document.getElementById('currentPageNum').textContent = '1';
        document.getElementById('totalPagesNum').textContent = totalPages;
        
        // Load all pages
        for (let i = 1; i <= totalPages; i++) {
            const pageNum = String(i).padStart(2, '0');
            const imageUrl = `${repoUrl}/${currentChapterFolder}/${imagePrefix}${pageNum}.${imageFormat}`;
            
            console.log(`Loading page ${i}:`, imageUrl);
            
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
                img.alt = `Failed to load page ${i}`;
                img.style.minHeight = '300px';
                img.style.backgroundColor = '#333333';
                img.style.display = 'flex';
                img.style.alignItems = 'center';
                img.style.justifyContent = 'center';
            };
            
            readerContainer.appendChild(img);
        }
        
        // Setup intersection observer for page tracking
        setupPageTracking();
        
        console.log('✅ Pages container setup complete');
        
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
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = entry.target.getAttribute('data-page');
                document.getElementById('currentPageNum').textContent = pageNum;
            }
        });
    }, options);
    
    const pages = document.querySelectorAll('.reader-page');
    pages.forEach(page => observer.observe(page));
}

/**
 * Update navigation button states
 */
function updateNavigationButtons() {
    const currentIndex = allChapters.findIndex(ch => ch.folder === currentChapterFolder);
    
    const btnPrev = document.getElementById('btnPrevChapter');
    const btnNext = document.getElementById('btnNextChapter');
    
    // Previous button (karena sort descending, prev = index + 1)
    if (currentIndex >= allChapters.length - 1) {
        btnPrev.disabled = true;
        btnPrev.style.opacity = '0.5';
    } else {
        btnPrev.disabled = false;
        btnPrev.style.opacity = '1';
    }
    
    // Next button (karena sort descending, next = index - 1)
    if (currentIndex <= 0) {
        btnNext.disabled = true;
        btnNext.style.opacity = '0.5';
    } else {
        btnNext.disabled = false;
        btnNext.style.opacity = '1';
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
 * Track chapter view
 */
async function trackChapterView() {
    try {
        // Check if already viewed in this session
        const viewKey = `viewed_${repoParam}_${currentChapterFolder}`;
        const hasViewed = sessionStorage.getItem(viewKey);
        
        if (hasViewed) {
            console.log('📊 Already counted in this session');
            return;
        }
        
        console.log('📤 Tracking chapter view...');
        
        // Increment via Google Apps Script
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                repo: repoParam,
                chapter: currentChapterFolder
            }),
            mode: 'no-cors'
        });
        
        // Mark as viewed
        sessionStorage.setItem(viewKey, 'true');
        
        console.log('✅ View tracked successfully');
        
    } catch (error) {
        console.error('❌ Error tracking view:', error);
        // Don't throw - continue normal operation
    }
}

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
        console.log('🔄 Loading overlay shown');
    } else {
        console.error('❌ Loading overlay element not found!');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        // Force hide dengan style langsung jika class tidak bekerja
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        console.log('✅ Loading overlay hidden');
    } else {
        console.error('❌ Loading overlay element not found!');
    }
}