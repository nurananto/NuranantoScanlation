/**
 * HYBRID DYNAMIC HEADER HEIGHT - ADD TO READER.JS
 * This code updates CSS custom property (--header-height) based on actual header height
 * Works with reader-hybrid.css
 */

/* ========================================
   STEP 1: Add these functions to reader.js
   (Add anywhere in the file, preferably near other utility functions)
   ======================================== */

/**
 * Update --header-height CSS custom property based on actual header height
 * This handles manga titles that wrap to 2-3 lines
 */
function updateDynamicHeaderHeight() {
    const header = document.querySelector('header');
    
    if (!header) {
        console.warn('⚠️ Header element not found');
        return;
    }
    
    // Get actual computed height of header (including multi-line titles)
    const headerHeight = header.offsetHeight;
    
    // Update CSS custom property
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    
    console.log(`📏 Dynamic header height updated: ${headerHeight}px`);
}

/**
 * Initialize dynamic header height adjustment
 * Sets up listeners for resize and initial calculation
 */
function initDynamicHeaderHeight() {
    // Initial update after a delay to ensure DOM is fully rendered
    setTimeout(() => {
        updateDynamicHeaderHeight();
    }, 100);
    
    // Update on window resize (handles orientation changes, etc)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateDynamicHeaderHeight();
        }, 200);
    });
    
    // Optional: Use ResizeObserver for more accurate tracking (modern browsers)
    if ('ResizeObserver' in window) {
        const headerObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.contentRect.height;
                document.documentElement.style.setProperty('--header-height', `${height}px`);
                console.log(`🔄 ResizeObserver: Header height changed to ${height}px`);
            }
        });
        
        // Start observing when header is available
        const header = document.querySelector('header');
        if (header) {
            headerObserver.observe(header);
            console.log('👀 ResizeObserver monitoring header height changes');
        }
    }
}


/* ========================================
   STEP 2: Call initDynamicHeaderHeight() in setupUI()
   
   Find the setupUI() function and add this line at the END:
   ======================================== */

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
    
    // 🎯 ADD THIS LINE HERE - Initialize dynamic header height
    initDynamicHeaderHeight();
}


/* ========================================
   ALTERNATIVE: Call in initializeReader() instead
   
   If you prefer to call it in initializeReader(), add after setupUI():
   ======================================== */

async function initializeReader() {
    try {
        showLoading();
        
        console.log('🚀 Initializing reader...');
        
        // Get URL params
        const urlParams = new URLSearchParams(window.location.search);
        repoParam = urlParams.get('repo');
        currentChapterFolder = urlParams.get('chapter');
        
        if (!repoParam || !currentChapterFolder) {
            throw new Error('Missing repo or chapter parameter');
        }
        
        // Load manga data
        await loadMangaData(repoParam);
        
        // Find current chapter
        currentChapter = allChapters.find(ch => ch.folder === currentChapterFolder);
        
        if (!currentChapter) {
            throw new Error(`Chapter "${currentChapterFolder}" not found`);
        }
        
        // Check if chapter is locked
        if (currentChapter.locked) {
            showLockedChapterMessage();
            return;
        }
        
        // Setup UI
        setupUI();
        
        // Load chapter pages
        await loadChapterPages();
        
        // Track chapter view
        trackChapterView();
        
        // 🎯 OR ADD THIS LINE HERE - Initialize dynamic header height
        initDynamicHeaderHeight();
        
        hideLoading();
    } catch (error) {
        console.error('❌ Error initializing reader:', error);
        showErrorMessage(error.message);
        hideLoading();
    }
}


/* ========================================
   TESTING
   
   After implementation, test in browser console:
   ======================================== */

// Check current header height
console.log('Header height:', document.querySelector('header').offsetHeight);

// Check CSS variable value
console.log('--header-height:', 
    getComputedStyle(document.documentElement).getPropertyValue('--header-height'));

// Check chapter bar position
console.log('Chapter bar top:', 
    getComputedStyle(document.querySelector('.chapter-info-bar')).top);

// Expected: All three values should match!


/* ========================================
   BENEFITS OF THIS APPROACH
   ======================================== */

/**
 * ✅ Fully dynamic - adapts to any title length (1, 2, or 3 lines)
 * ✅ Graceful degradation - CSS fallback values work without JS
 * ✅ Smooth transitions - CSS transition handles changes smoothly
 * ✅ Responsive - updates on window resize
 * ✅ Modern - uses ResizeObserver for accurate tracking
 * ✅ No overlap - chapter bar always positioned correctly
 * ✅ No gap - works perfectly for both short and long titles
 * ✅ Performance - uses CSS custom property (one update affects all)
 */


/* ========================================
   SUMMARY
   ======================================== */

/**
 * What this does:
 * 1. Measures actual header height (which varies with title length)
 * 2. Updates CSS custom property --header-height with that value
 * 3. .chapter-info-bar uses that variable for its `top` position
 * 4. Result: Chapter bar always positioned right below header, no overlap!
 * 
 * When it runs:
 * - On page load (after DOM ready + 100ms delay)
 * - On window resize (with 200ms debounce)
 * - On header size change (via ResizeObserver)
 * 
 * What you need to do:
 * 1. Replace reader.css with reader-hybrid.css
 * 2. Copy these two functions to reader.js
 * 3. Call initDynamicHeaderHeight() in setupUI() or initializeReader()
 * 4. Test with long and short manga titles
 * 5. Done! ✅
 */
