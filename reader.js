/**
 * HYBRID DYNAMIC HEADER HEIGHT - FIXED VERSION
 * Add to reader.js - with better timing to avoid loading issues
 */

/* ========================================
   FIXED FUNCTIONS - Better Timing
   ======================================== */

/**
 * Update --header-height CSS custom property
 */
function updateDynamicHeaderHeight() {
    const header = document.querySelector('header');
    
    if (!header) {
        console.warn('⚠️ Header not found');
        return;
    }
    
    // Get actual height
    const headerHeight = header.offsetHeight;
    
    // Update CSS variable
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    
    console.log(`✅ Header height updated: ${headerHeight}px`);
    
    // Log for debugging
    const chapterBar = document.querySelector('.chapter-info-bar');
    if (chapterBar) {
        console.log(`✅ Chapter bar top: ${getComputedStyle(chapterBar).top}`);
    }
}

/**
 * Initialize with multiple update attempts for reliability
 */
function initDynamicHeaderHeight() {
    console.log('🚀 Initializing dynamic header height...');
    
    // Multiple updates to ensure it catches after render
    // Immediate attempt
    updateDynamicHeaderHeight();
    
    // After 100ms (for initial render)
    setTimeout(updateDynamicHeaderHeight, 100);
    
    // After 250ms (for slow loading)
    setTimeout(updateDynamicHeaderHeight, 250);
    
    // After 500ms (final catch)
    setTimeout(updateDynamicHeaderHeight, 500);
    
    // On window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateDynamicHeaderHeight, 200);
    });
    
    // ResizeObserver for continuous monitoring
    if ('ResizeObserver' in window) {
        const headerObserver = new ResizeObserver((entries) => {
            updateDynamicHeaderHeight();
        });
        
        // Wait for header to exist
        const checkHeader = setInterval(() => {
            const header = document.querySelector('header');
            if (header) {
                headerObserver.observe(header);
                console.log('👀 ResizeObserver active');
                clearInterval(checkHeader);
            }
        }, 50);
        
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkHeader), 5000);
    }
}


/* ========================================
   OPTION 1: Call AFTER page content loads
   ======================================== */

// In setupUI() - call at the VERY END after all DOM manipulation
function setupUI() {
    // ... all your existing code ...
    
    // Update navigation button states
    updateNavigationButtons();
    
    // ADD HERE - Last thing in setupUI
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
        initDynamicHeaderHeight();
    }, 50);
}


/* ========================================
   OPTION 2: Call AFTER loadChapterPages completes
   ======================================== */

async function initializeReader() {
    try {
        showLoading();
        
        // ... existing code ...
        
        // Setup UI
        setupUI();
        
        // Load chapter pages
        await loadChapterPages();
        
        // Track chapter view
        trackChapterView();
        
        // ADD HERE - After everything is loaded
        initDynamicHeaderHeight();
        
        hideLoading();
    } catch (error) {
        console.error('❌ Error:', error);
        showErrorMessage(error.message);
        hideLoading();
    }
}


/* ========================================
   OPTION 3: Call on DOMContentLoaded (safest)
   ======================================== */

// Add this completely separate event listener
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit more after DOM is ready
    setTimeout(() => {
        initDynamicHeaderHeight();
    }, 300);
});


/* ========================================
   RECOMMENDED APPROACH
   ======================================== */

/**
 * Best practice: Call in multiple places for reliability
 * 
 * 1. In setupUI() with delay
 * 2. After loadChapterPages() completes
 * 3. On window.load event (after all resources)
 */

// Add this standalone listener for extra safety
window.addEventListener('load', () => {
    console.log('🎯 Window fully loaded, updating header height...');
    setTimeout(updateDynamicHeaderHeight, 100);
});


/* ========================================
   DEBUGGING
   ======================================== */

/**
 * If still having issues, add this to check timing:
 */

function debugHeaderHeight() {
    console.log('=== DEBUG HEADER HEIGHT ===');
    
    const header = document.querySelector('header');
    console.log('Header exists:', !!header);
    console.log('Header offsetHeight:', header?.offsetHeight);
    
    const cssVar = getComputedStyle(document.documentElement)
        .getPropertyValue('--header-height');
    console.log('CSS --header-height:', cssVar);
    
    const chapterBar = document.querySelector('.chapter-info-bar');
    console.log('Chapter bar exists:', !!chapterBar);
    console.log('Chapter bar top:', 
        chapterBar ? getComputedStyle(chapterBar).top : 'N/A');
    
    console.log('========================');
}

// Call this in browser console to debug:
// debugHeaderHeight()


/* ========================================
   ALTERNATIVE: Force immediate update
   ======================================== */

/**
 * If the above doesn't work, use this more aggressive approach:
 */

function forceUpdateHeaderHeight() {
    const header = document.querySelector('header');
    const chapterBar = document.querySelector('.chapter-info-bar');
    
    if (!header || !chapterBar) {
        console.warn('⚠️ Elements not ready yet');
        return;
    }
    
    // Force reflow to get accurate height
    header.style.display = 'none';
    header.offsetHeight; // Force reflow
    header.style.display = '';
    
    const height = header.offsetHeight;
    
    // Set both CSS variable AND inline style
    document.documentElement.style.setProperty('--header-height', `${height}px`);
    chapterBar.style.top = `${height}px`;
    
    console.log(`🔧 Forced update: ${height}px`);
}

// Call this if normal method fails:
// setTimeout(forceUpdateHeaderHeight, 500);


/* ========================================
   SUMMARY: What to do based on your error
   ======================================== */

/**
 * Your screenshot shows:
 * - Header height: 75 (correct)
 * - --header-height: 120px (not updated - PROBLEM!)
 * - Chapter bar top: 120px (using fallback - PROBLEM!)
 * 
 * This means the script ran but CSS variable didn't update.
 * 
 * FIX: Use Option 2 or 3 above, or call forceUpdateHeaderHeight()
 * 
 * Try this order:
 * 1. Call initDynamicHeaderHeight() AFTER loadChapterPages()
 * 2. Add window.load listener for backup
 * 3. If still fails, use forceUpdateHeaderHeight()
 */
