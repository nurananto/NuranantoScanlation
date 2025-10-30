/**
 * INFO-MANGA.JS - WIB VERSION
 * Load manga data dari repo chapter (support multiple manga)
 * 
 * CARA PAKAI:
 * info-manga.html?repo=10nenburi
 */

// ============================================
// WIB TIMEZONE HELPER (GMT+7)
// ============================================

function getWIBTimestamp() {
    const now = new Date();
    // Add 7 hours for WIB
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return wibTime.toISOString();
}

function convertToWIB(isoString) {
    if (!isoString) return null;
    const date = new Date(isoString);
    // Add 7 hours for WIB
    const wibTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    return wibTime.toISOString();
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
