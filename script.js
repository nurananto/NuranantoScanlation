// ============================================
// SCRIPT.JS - MAIN PAGE (index.html) - WITH BALANCED PROTECTION
// ============================================

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
// MANGA LIST FUNCTIONS
// ============================================

async function fetchMangaData(repo) {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/nurananto/${repo}/main/manga.json`);
    if (!response.ok) throw new Error('Failed to fetch manga data');
    const data = await response.json();
    return {
      lastUpdated: data.lastUpdated || null,
      lastChapterUpdate: data.lastChapterUpdate || data.lastUpdated || null,
      totalChapters: Object.keys(data.chapters || {}).length
    };
  } catch (error) {
    console.error(`Error fetching manga data for ${repo}:`, error);
    return {
      lastUpdated: null,
      lastChapterUpdate: null,
      totalChapters: 0
    };
  }
}

function isRecentlyUpdated(lastChapterUpdateStr) {
  if (!lastChapterUpdateStr) return false;
  
  const lastChapterUpdate = new Date(lastChapterUpdateStr);
  
  if (!lastChapterUpdate || isNaN(lastChapterUpdate.getTime())) {
    console.warn(`Invalid date format: ${lastChapterUpdateStr}`);
    return false;
  }
  
  const now = new Date();
  const diffDays = (now - lastChapterUpdate) / (1000 * 60 * 60 * 24);
  
  if (diffDays < 0) {
    console.warn(`Future date detected: ${lastChapterUpdateStr}`);
    return false;
  }
  
  return diffDays <= 2;
}

function getRelativeTime(lastChapterUpdateStr) {
  if (!lastChapterUpdateStr) return '';
  
  const lastChapterUpdate = new Date(lastChapterUpdateStr);
  const now = new Date();
  
  const diffMs = now - lastChapterUpdate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins} menit yang lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  } else if (diffDays === 1) {
    return 'Kemarin';
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`;
  } else {
    return lastChapterUpdate.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
  }
}

function createCard(manga, mangaData) {
  const isRecent = isRecentlyUpdated(mangaData.lastChapterUpdate);
  const relativeTime = getRelativeTime(mangaData.lastChapterUpdate);
  
  const updatedBadge = isRecent ? `
    <div class="updated-badge">
      <span class="badge-text">UPDATED!</span>
      ${relativeTime ? `<span class="badge-time">${relativeTime}</span>` : ''}
    </div>
  ` : '';
  
  const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='420' viewBox='0 0 300 420'%3E%3Crect width='300' height='420' fill='%231a1a1a'/%3E%3Cg fill='%23666'%3E%3Cpath d='M150 160c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40zm0 60c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z'/%3E%3Cpath d='M250 120H50c-11.046 0-20 8.954-20 20v160c0 11.046 8.954 20 20 20h200c11.046 0 20-8.954 20-20V140c0-11.046-8.954-20-20-20zm0 180H50V140h200v160z'/%3E%3C/g%3E%3Ctext x='150' y='350' font-family='Arial,sans-serif' font-size='16' fill='%23666' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;
  
  return `
    <div class="manga-card ${isRecent ? 'recently-updated' : ''}" onclick="window.location.href='info-manga.html?repo=${manga.id}'">
      <img src="${manga.cover}" alt="${manga.title}" loading="lazy" onerror="this.src='${placeholderSVG}'">
      ${updatedBadge}
      <div class="manga-title">${manga.title}</div>
    </div>`;
}

async function renderManga(filteredList) {
  const mangaGrid = document.getElementById("mangaGrid");
  const loadingIndicator = document.getElementById("loadingIndicator");
  
  loadingIndicator.classList.add('show');
  mangaGrid.innerHTML = '';
  
  const mangaWithData = await Promise.all(
    filteredList.map(async (manga) => {
      const mangaData = await fetchMangaData(manga.repo);
      return { 
        manga, 
        mangaData,
        lastChapterUpdate: mangaData.lastChapterUpdate
      };
    })
  );
  
  mangaWithData.sort((a, b) => {
    const dateA = a.lastChapterUpdate ? new Date(a.lastChapterUpdate) : new Date(0);
    const dateB = b.lastChapterUpdate ? new Date(b.lastChapterUpdate) : new Date(0);
    
    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
    
    return timeB - timeA;
  });
  
  loadingIndicator.classList.remove('show');
  
  if (mangaWithData.length === 0) {
    mangaGrid.innerHTML = `
      <div class="empty-state">
        <p>Tidak ada manga yang ditemukan</p>
        <p style="font-size: 14px;">Coba kata kunci yang berbeda</p>
      </div>
    `;
    return;
  }
  
  mangaGrid.innerHTML = mangaWithData.map(({ manga, mangaData }) => 
    createCard(manga, mangaData)
  ).join("");
  
  console.log('✅ Manga sorted by lastChapterUpdate (newest first)');
}

let searchTimeout;
document.addEventListener('DOMContentLoaded', function() {
  // manga-config.js exports: const mangaList = MANGA_LIST;
  if (typeof mangaList === 'undefined') {
    console.error('❌ ERROR: mangaList not found!');
    console.error('Make sure manga-config.js is loaded before script.js in index.html');
    return;
  }
  
  console.log('🚀 Initializing manga list...');
  console.log('📚 Total manga:', mangaList.length);
  renderManga(mangaList);
  
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function() {
    clearTimeout(searchTimeout);
    const query = this.value.toLowerCase().trim();
    
    searchTimeout = setTimeout(() => {
      if (query === '') {
        renderManga(mangaList);
      } else {
        const filtered = mangaList.filter(manga => 
          manga.title.toLowerCase().includes(query)
        );
        renderManga(filtered);
      }
    }, 300);
  });
});