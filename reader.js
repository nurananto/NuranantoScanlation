// State management
const state = {
    currentChapter: "1", // String karena ada chapter seperti "2.1"
    currentPage: 1,
    totalPages: 0,
    readingMode: 'webtoon',
    pages: [],
    hideUI: false,
    totalChapters: 0,
    mangaData: null,
    chapterList: [], // Array of chapter keys sorted
    touchStartX: 0,
    touchStartY: 0,
    touchEndX: 0,
    touchEndY: 0
};

// GitHub repo configuration
const GITHUB_REPO = 'nurananto/10nenburi';
const GITHUB_BRANCH = 'main';
const JSON_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}/manga.json`;
const IMAGE_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/refs/heads/${GITHUB_BRANCH}`;

// Load manga data from JSON
async function loadMangaData() {
    try {
        const response = await fetch(JSON_URL);
        const data = await response.json();
        
        console.log('Loaded manga data:', data);
        
        state.mangaData = data;
        
        // Convert chapters object to sorted array
        if (data.chapters && typeof data.chapters === 'object') {
            state.chapterList = Object.keys(data.chapters)
                .filter(key => !data.chapters[key].locked) // Filter out locked chapters
                .sort((a, b) => {
                    // Sort by numeric value (1, 2.1, 2.2, etc)
                    return parseFloat(a) - parseFloat(b);
                });
            state.totalChapters = state.chapterList.length;
        }
        
        // Update title from manga object
        if (data.manga && data.manga.title) {
            document.getElementById('mangaTitle').textContent = data.manga.title;
            adjustTitleFontSize();
        }
        
        console.log('Chapter list:', state.chapterList);
        console.log('Total chapters:', state.totalChapters);
        
        return data;
    } catch (error) {
        console.error('Error loading manga data:', error);
        alert('Failed to load manga data: ' + error.message);
        return null;
    }
}

// Generate pages from chapter data
function generatePagesFromChapter(chapterKey) {
    const pages = [];
    
    if (!state.mangaData || !state.mangaData.chapters) {
        console.error('Invalid manga data structure');
        return pages;
    }
    
    const chapter = state.mangaData.chapters[chapterKey];
    
    if (!chapter) {
        console.error(`Chapter ${chapterKey} not found`);
        return pages;
    }
    
    state.totalPages = chapter.pages;
    const folder = chapter.folder || chapterKey;
    
    console.log(`Loading chapter ${chapterKey} (folder: ${folder}) with ${chapter.pages} pages`);
    
    // Generate page URLs: /{folder}/Image01.jpg, /Image02.jpg, etc.
    for (let i = 1; i <= chapter.pages; i++) {
        const pageNumber = String(i).padStart(2, '0');
        pages.push({
            url: `${IMAGE_BASE_URL}/${folder}/Image${pageNumber}.jpg`,
            number: i
        });
    }
    
    return pages;
}

// Initialize
async function init() {
    // Show loading
    document.getElementById('loading').classList.add('active');
    
    // Load manga data from JSON
    await loadMangaData();
    
    if (!state.mangaData) {
        alert('Failed to load manga data');
        document.getElementById('loading').classList.remove('active');
        return;
    }
    
    // Load first chapter
    state.pages = generatePagesFromChapter(state.currentChapter);
    
    // Update UI elements
    updateChapterButton();
    updateChapterNavButtons();
    generateChapterGrid();
    
    renderPages();
    updateUI();
    adjustTitleFontSize();
    attachEventListeners();
    
    // Hide loading
    document.getElementById('loading').classList.remove('active');
}

// Update chapter button text
function updateChapterButton() {
    const chapterBtn = document.getElementById('chapterBtn');
    
    if (!state.mangaData || !state.mangaData.chapters) {
        chapterBtn.textContent = `Chapter ${state.currentChapter}`;
        return;
    }
    
    const chapter = state.mangaData.chapters[state.currentChapter];
    
    if (chapter && chapter.title) {
        chapterBtn.textContent = chapter.title;
    } else {
        chapterBtn.textContent = `Chapter ${state.currentChapter}`;
    }
}

// Update chapter navigation buttons state
function updateChapterNavButtons() {
    const prevBtn = document.getElementById('prevChapterBtn');
    const nextBtn = document.getElementById('nextChapterBtn');
    
    const currentIndex = state.chapterList.indexOf(state.currentChapter);
    
    // Disable prev button if at first chapter
    if (currentIndex <= 0) {
        prevBtn.disabled = true;
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.disabled = false;
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
    
    // Disable next button if at last chapter
    if (currentIndex >= state.chapterList.length - 1) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

// Generate chapter grid in modal
function generateChapterGrid() {
    const chapterGrid = document.getElementById('chapterGrid');
    chapterGrid.innerHTML = '';
    
    if (!state.mangaData || !state.mangaData.chapters || state.chapterList.length === 0) return;
    
    // Generate from latest to oldest (reverse order)
    for (let i = state.chapterList.length - 1; i >= 0; i--) {
        const chapterKey = state.chapterList[i];
        const chapter = state.mangaData.chapters[chapterKey];
        
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        
        if (chapterKey === state.currentChapter) {
            chapterItem.classList.add('active');
        }
        
        chapterItem.textContent = chapter.title || `Chapter ${chapterKey}`;
        chapterItem.dataset.chapter = chapterKey;
        
        chapterItem.addEventListener('click', () => {
            selectChapter(chapterKey);
        });
        
        chapterGrid.appendChild(chapterItem);
    }
}

// Select chapter from modal
function selectChapter(chapterKey) {
    state.currentChapter = chapterKey;
    state.currentPage = 1;
    state.pages = generatePagesFromChapter(chapterKey);
    
    // Update UI
    updateChapterButton();
    updateChapterNavButtons();
    generateChapterGrid();
    
    // Close modal
    closeChapterModal();
    
    // Render
    renderPages();
    updateUI();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Open chapter modal
function openChapterModal() {
    document.getElementById('chapterModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close chapter modal
function closeChapterModal() {
    document.getElementById('chapterModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Auto adjust font size untuk title agar muat 2 baris
function adjustTitleFontSize() {
    const titleElement = document.getElementById('mangaTitle');
    const isMobile = window.innerWidth <= 768;
    let fontSize = isMobile ? 14 : 18;
    const minFontSize = isMobile ? 10 : 12;
    const maxLines = 2;
    const lineHeight = isMobile ? 1.2 : 1.3;
    
    titleElement.style.fontSize = fontSize + 'px';
    
    // Cek apakah text melebihi 2 baris
    const maxHeight = fontSize * lineHeight * maxLines;
    
    while (titleElement.scrollHeight > maxHeight && fontSize > minFontSize) {
        fontSize -= 0.5;
        titleElement.style.fontSize = fontSize + 'px';
    }
}

// Render pages based on reading mode
function renderPages() {
    const container = document.getElementById('pageContainer');
    container.innerHTML = '';
    container.className = 'page-container';
    
    // Webtoon mode: show all pages vertically
    state.pages.forEach(page => {
        const img = createPageImage(page);
        container.appendChild(img);
    });
    
    // Initialize lazy loading after DOM update
    setTimeout(() => {
        initLazyLoading();
    }, 100);
}

// Create page image element
function createPageImage(page) {
    const img = document.createElement('img');
    img.dataset.src = page.url; // Store URL in data attribute
    img.alt = `Page ${page.number}`;
    img.className = 'page-image lazy';
    
    // Add placeholder while loading
    img.style.minHeight = '600px';
    img.style.backgroundColor = '#2a2a2a';
    
    // Security attributes
    img.setAttribute('loading', 'lazy'); // Native lazy loading
    img.setAttribute('decoding', 'async'); // Async decoding
    
    img.addEventListener('click', toggleUI);
    
    return img;
}

// Lazy load images using Intersection Observer
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Show loading state
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                // Load image
                img.src = img.dataset.src;
                
                img.onload = () => {
                    img.style.opacity = '1';
                    img.classList.remove('lazy');
                    img.style.minHeight = 'auto';
                    img.style.backgroundColor = 'transparent';
                };
                
                img.onerror = () => {
                    img.style.minHeight = '300px';
                    img.style.backgroundColor = '#1a1a1a';
                    img.alt = 'Failed to load image';
                    console.error('Failed to load image:', img.dataset.src);
                };
                
                // Stop observing this image
                observer.unobserve(img);
            }
        });
    }, {
        root: null,
        rootMargin: '200px', // Start loading 200px before image enters viewport
        threshold: 0.01
    });
    
    // Observe all lazy images
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// Touch handlers - disabled for webtoon
function handleTouchStart(e) {
    // Disabled in webtoon mode
}

function handleTouchEnd(e) {
    // Disabled in webtoon mode
}

function handleSwipe() {
    // Disabled in webtoon mode
}

// Navigation - simplified for webtoon
function nextPage() {
    // Not used in webtoon mode
}

function prevPage() {
    // Not used in webtoon mode
}

function nextChapter() {
    const currentIndex = state.chapterList.indexOf(state.currentChapter);
    if (currentIndex < state.chapterList.length - 1) {
        state.currentChapter = state.chapterList[currentIndex + 1];
        state.currentPage = 1;
        state.pages = generatePagesFromChapter(state.currentChapter);
        
        // Update UI
        updateChapterButton();
        updateChapterNavButtons();
        
        renderPages();
        updateUI();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

function prevChapter() {
    const currentIndex = state.chapterList.indexOf(state.currentChapter);
    if (currentIndex > 0) {
        state.currentChapter = state.chapterList[currentIndex - 1];
        state.currentPage = 1;
        state.pages = generatePagesFromChapter(state.currentChapter);
        
        // Update UI
        updateChapterButton();
        updateChapterNavButtons();
        
        renderPages();
        updateUI();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// UI Updates
function updateUI() {
    // No page counter needed in webtoon mode
}

function toggleUI() {
    state.hideUI = !state.hideUI;
    const header = document.getElementById('header');
    
    if (state.hideUI) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }
}

// Settings - removed, no need for mode switching
function loadSettings() {
    // Not needed
}

function saveSettings() {
    // Not needed
}

// Event Listeners
function attachEventListeners() {
    // Disable right-click context menu on images and page
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Prevent drag and drop
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });
    
    // Disable common screenshot shortcuts
    document.addEventListener('keydown', (e) => {
        // Disable F12 (Developer Tools)
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+I (Inspect)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+S (Save Page)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
        
        // Disable PrintScreen
        if (e.key === 'PrintScreen') {
            e.preventDefault();
            return false;
        }
        
        // Arrow up/down untuk scroll (allowed)
        if (e.key === 'ArrowUp') {
            window.scrollBy(0, -100);
        } else if (e.key === 'ArrowDown') {
            window.scrollBy(0, 100);
        }
    });
    
    // Disable long-press context menu on mobile
    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('page-image')) {
            e.target.style.webkitTouchCallout = 'none';
        }
    }, { passive: true });

    // Chapter navigation buttons
    document.getElementById('prevChapterBtn').addEventListener('click', prevChapter);
    document.getElementById('nextChapterBtn').addEventListener('click', nextChapter);
    
    // Chapter button - open modal
    document.getElementById('chapterBtn').addEventListener('click', () => {
        openChapterModal();
    });
    
    // Close modal button
    document.getElementById('closeModal').addEventListener('click', () => {
        closeChapterModal();
    });
    
    // Close modal when clicking outside
    document.getElementById('chapterModal').addEventListener('click', (e) => {
        if (e.target.id === 'chapterModal') {
            closeChapterModal();
        }
    });

    // Title click - kembali ke info manga
    document.getElementById('mangaTitle').addEventListener('click', (e) => {
        e.preventDefault();
        // Langsung kembali tanpa konfirmasi
        window.location.href = '/manga-info'; // atau window.history.back();
    });
    
    // Re-adjust font size on window resize
    window.addEventListener('resize', () => {
        adjustTitleFontSize();
    });
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);