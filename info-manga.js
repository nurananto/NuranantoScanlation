/**
 * INFO-MANGA.JS
 * Load manga data dari repo chapter (support multiple manga)
 * 
 * CARA PAKAI:
 * info-manga.html?repo=10nenburi
 * info-manga.html?repo=MadogiwaHenshuutoBakaniSaretaOrega-FutagoJKtoDoukyosuruKotoniNatta
 */

// Mapping repo ke URL manga.json
const MANGA_REPOS = {
    '10nenburi': 'https://raw.githubusercontent.com/nurananto/10nenburi/main/manga.json',
    'madogiwa': 'https://raw.githubusercontent.com/nurananto/MadogiwaHenshuutoBakaniSaretaOrega-FutagoJKtoDoukyosuruKotoniNatta/main/manga.json',
    // Tambahkan manga lain di sini
    // 'nama-pendek': 'URL manga.json'
};

let mangaData = null;

// Load data saat halaman dimuat
document.addEventListener('DOMContentLoaded', async () => {
    await loadMangaFromRepo();
    setupShowDetailsButton();
});

/**
 * Get manga.json URL from URL parameter
 */
function getMangaJsonUrl() {
    // Ambil parameter ?repo=xxx dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');
    
    if (!repoParam) {
        console.error('❌ Parameter "repo" tidak ditemukan di URL');
        alert('Error: Parameter repo tidak ditemukan.\n\nContoh: info-manga.html?repo=10nenburi');
        return null;
    }
    
    const mangaUrl = MANGA_REPOS[repoParam];
    
    if (!mangaUrl) {
        console.error(`❌ Repo "${repoParam}" tidak ditemukan di mapping`);
        alert(`Error: Repo "${repoParam}" tidak terdaftar.\n\nRepo tersedia: ${Object.keys(MANGA_REPOS).join(', ')}`);
        return null;
    }
    
    console.log(`📚 Loading manga: ${repoParam}`);
    return mangaUrl;
}

/**
 * Load manga.json dari repo chapter
 */
async function loadMangaFromRepo() {
    try {
        const mangaJsonUrl = getMangaJsonUrl();
        if (!mangaJsonUrl) return;
        
        const response = await fetch(mangaJsonUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        mangaData = await response.json();
        
        // Display manga info
        displayMangaInfo();
        
        // Display chapters
        displayChapters();
        
        // Update page title
        document.title = `${mangaData.manga.title} - Info`;
        
        console.log('✅ Manga data loaded from repo');
        
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
    document.getElementById('mainTitle').textContent = manga.title;
    document.getElementById('subtitle').textContent = manga.alternativeTitle;
    
    // Update Title - Mobile
    document.getElementById('mainTitleMobile').textContent = manga.title;
    document.getElementById('subtitleMobile').textContent = manga.alternativeTitle;
    
    // Update Cover
    document.getElementById('mangaCover').src = manga.cover;
    
    // Update Views
    document.getElementById('viewsCount').textContent = manga.views;
    document.getElementById('viewsCountMobile').textContent = manga.views;
    
    // Update Description
    document.getElementById('descriptionContent').textContent = manga.description;
    
    // Update Author & Artist
    document.getElementById('authorName').textContent = manga.author;
    document.getElementById('artistName').textContent = manga.artist;
    
    // Update Genre
    displayGenres(manga.genre);
    
    // Setup Buttons
    setupButtons(manga.links);
}

/**
 * Display genre tags
 */
function displayGenres(genres) {
    const genreList = document.getElementById('genreList');
    genreList.innerHTML = '';
    
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
        div.onclick = () => showLockedMessage();
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
 * Show locked message
 */
function showLockedMessage() {
    alert('Chapter ini masih terkunci. 🔒\n\nDukung kami di Trakteer untuk unlock chapter lebih cepat!');
}

/**
 * Open chapter
 */
function openChapter(chapter) {
    const repoUrl = mangaData.manga.repoUrl;
    const imagePrefix = mangaData.manga.imagePrefix;
    const imageFormat = mangaData.manga.imageFormat;
    
    // Save to sessionStorage
    const chapterData = {
        folder: chapter.folder,
        title: chapter.title,
        pages: chapter.pages,
        repoUrl: repoUrl,
        imagePrefix: imagePrefix,
        imageFormat: imageFormat
    };
    
    sessionStorage.setItem('currentChapter', JSON.stringify(chapterData));
    
    console.log('📖 Opening chapter:', chapter.folder);
    
    // Redirect to reader
    window.location.href = `reader.html?chapter=${chapter.folder}`;
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
    // Button Mangadex
    document.getElementById('btnMangadex').onclick = () => {
        if (links.mangadex) {
            window.open(links.mangadex, '_blank');
        } else {
            alert('Link Mangadex tidak tersedia');
        }
    };
    
    // Button Raw
    document.getElementById('btnRaw').onclick = () => {
        if (links.raw) {
            window.open(links.raw, '_blank');
        } else {
            alert('Link Raw tidak tersedia');
        }
    };
}

/**
 * Setup show details button
 */
function setupShowDetailsButton() {
    const btn = document.getElementById('btnShowDetails');
    const container = document.getElementById('detailsContainer');
    const btnText = document.getElementById('detailsButtonText');
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