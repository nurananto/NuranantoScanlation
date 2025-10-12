// ===========================
// CONFIGURATION
// ===========================
const MAIN_REPO = 'nurananto/NuranantoScanlation';
const MANGA_LIST_URL = `https://raw.githubusercontent.com/${MAIN_REPO}/main/manga-list.json`;
const STATS_URL = `https://raw.githubusercontent.com/${MAIN_REPO}/main/stats.json`;
const GITHUB_API_URL = `https://api.github.com/repos/${MAIN_REPO}/dispatches`;
const GITHUB_TOKEN = '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'; // GANTI INI!

// ===========================
// GLOBAL VARIABLES
// ===========================
let mangaId = '';
let mangaConfig = null;

// ===========================
// VIEW COUNTER FUNCTIONS
// ===========================

// Load stats.json dari GitHub
async function loadStatsFromGitHub() {
  try {
    const response = await fetch(STATS_URL + '?t=' + new Date().getTime());
    if (!response.ok) {
      throw new Error('Failed to load stats');
    }
    const stats = await response.json();
    return stats;
  } catch (error) {
    console.error('Error loading stats:', error);
    return {
      mangas: {}
    };
  }
}

// Update tampilan view count di halaman
async function displayAllViewCounts() {
  const stats = await loadStatsFromGitHub();
  
  // Cek apakah ada stats untuk manga ini
  const mangaStats = stats.mangas?.[mangaId] || { chapters: {} };
  
  // Update view count untuk setiap chapter yang ada di halaman
  const chapterItems = document.querySelectorAll('.chapter-item[data-chapter]:not(.locked)');
  
  chapterItems.forEach(item => {
    const chapterId = item.getAttribute('data-chapter');
    const viewElement = item.querySelector('.chapter-views');
    
    if (viewElement) {
      const views = mangaStats.chapters[chapterId] || 0;
      const viewCount = viewElement.querySelector('.view-count');
      
      if (viewCount) {
        viewCount.textContent = views.toLocaleString();
        viewElement.classList.remove('loading');
      }
    }
  });
  
  console.log('View counts loaded for', mangaId, ':', mangaStats);
}

// Kirim ping ke GitHub Actions untuk increment view
async function incrementViewCount(type, chapterId = null) {
  try {
    // Cek apakah sudah pernah view di session ini
    const sessionKey = type === 'info' 
      ? `viewed_${mangaId}_info` 
      : `viewed_${mangaId}_${chapterId}`;
    
    if (sessionStorage.getItem(sessionKey)) {
      console.log('Already counted in this session');
      return;
    }
    
    // Tandai sudah di-view di session ini
    sessionStorage.setItem(sessionKey, 'true');
    
    // Kirim event ke GitHub Actions
    const eventType = type === 'info' ? 'manga_info_view' : 'chapter_view';
    
    const response = await fetch(GITHUB_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: {
          manga_id: mangaId,
          chapter: chapterId || 'info',
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (response.status === 204) {
      console.log(`View counted for ${mangaId} - ${type}:`, chapterId || 'info');
    } else {
      console.warn('Failed to increment view:', response.status);
    }
  } catch (error) {
    console.error('Error incrementing view:', error);
  }
}

// ===========================
// LOAD MANGA CONFIG
// ===========================
async function loadMangaConfig() {
  try {
    // Load manga list
    const listResponse = await fetch(MANGA_LIST_URL + '?t=' + Date.now());
    const mangaList = await listResponse.json();
    
    if (!mangaList[mangaId]) {
      throw new Error('Manga tidak ditemukan');
    }
    
    const configUrl = mangaList[mangaId].config_url;
    
    // Load manga config
    const configResponse = await fetch(configUrl + '?t=' + Date.now());
    mangaConfig = await configResponse.json();
    
    console.log('Manga config loaded:', mangaConfig);
    return mangaConfig;
    
  } catch (error) {
    console.error('Error loading manga config:', error);
    throw error;
  }
}

// ===========================
// POPULATE PAGE WITH MANGA DATA
// ===========================
async function populatePageData() {
  if (!mangaConfig) return;
  
  // Update title
  document.title = `${mangaConfig.title} - Info`;
  const titleElement = document.querySelector('.div2');
  if (titleElement) {
    titleElement.textContent = mangaConfig.title;
  }
  
  // Update author
  const authorLink = document.querySelector('.div4 a');
  if (authorLink && mangaConfig.author) {
    authorLink.textContent = mangaConfig.author;
  }
  
  // Update artist
  const artistLink = document.querySelector('.div11 a');
  if (artistLink && mangaConfig.artist) {
    artistLink.textContent = mangaConfig.artist;
  }
  
  // Update genres
  const genreContainer = document.querySelector('.div12');
  if (genreContainer && mangaConfig.genres) {
    genreContainer.innerHTML = '';
    mangaConfig.genres.forEach(genre => {
      const tag = document.createElement('span');
      tag.className = 'genre-tag';
      tag.textContent = genre;
      tag.onclick = () => searchGenre(genre);
      genreContainer.appendChild(tag);
    });
  }
  
  // Update description
  const descElement = document.querySelector('.div6 p');
  if (descElement && mangaConfig.description) {
    descElement.textContent = mangaConfig.description;
  }
  
  // Update cover
  const coverImg = document.querySelector('.cover-img');
  if (coverImg && mangaConfig.cover_url) {
    coverImg.src = mangaConfig.cover_url;
  }
  
  // Generate chapter list
  generateChapterList();
}

// ===========================
// GENERATE CHAPTER LIST
// ===========================
function generateChapterList() {
  if (!mangaConfig || !mangaConfig.chapters) return;
  
  const chapterListContainer = document.querySelector('.div10');
  if (!chapterListContainer) return;
  
  // Simpan title dan show all button
  const title = chapterListContainer.querySelector('.chapter-list-title');
  const showAllBtn = chapterListContainer.querySelector('.show-all-btn');
  const olderChapters = document.getElementById('olderChapters');
  
  // Clear existing chapters (except title, button, olderChapters)
  const existingChapters = chapterListContainer.querySelectorAll('.chapter-item');
  existingChapters.forEach(ch => ch.remove());
  
  // Convert chapters object to sorted array
  const chapterArray = Object.keys(mangaConfig.chapters).map(num => ({
    num: num,
    ...mangaConfig.chapters[num]
  })).sort((a, b) => parseFloat(b.num) - parseFloat(a.num)); // Descending order
  
  // Show latest 3 chapters
  const latestChapters = chapterArray.slice(0, 3);
  const olderChaptersList = chapterArray.slice(3);
  
  // Insert latest chapters
  latestChapters.forEach(chapter => {
    const chapterElement = createChapterElement(chapter);
    chapterListContainer.insertBefore(chapterElement, showAllBtn);
  });
  
  // Clear and populate older chapters
  if (olderChapters) {
    olderChapters.innerHTML = '';
    olderChaptersList.forEach(chapter => {
      const chapterElement = createChapterElement(chapter);
      olderChapters.appendChild(chapterElement);
    });
  }
}

// ===========================
// CREATE CHAPTER ELEMENT
// ===========================
function createChapterElement(chapter) {
  const div = document.createElement('div');
  div.className = 'chapter-item';
  div.setAttribute('data-chapter', chapter.num);
  
  if (chapter.locked) {
    div.classList.add('locked');
    div.onclick = () => unlockChapter(chapter.num);
    
    const title = document.createElement('span');
    title.className = 'chapter-title';
    title.textContent = `Chapter ${chapter.num}`;
    
    const lockInfo = document.createElement('div');
    lockInfo.className = 'chapter-locked-info';
    lockInfo.style.cssText = 'color: #ffd700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;';
    lockInfo.innerHTML = '<span>🔒</span><span>Support di Trakteer</span>';
    
    div.appendChild(title);
    div.appendChild(lockInfo);
  } else {
    div.onclick = () => readChapter(chapter.num);
    
    const title = document.createElement('span');
    title.className = 'chapter-title';
    title.textContent = `Chapter ${chapter.num}`;
    
    const views = document.createElement('div');
    views.className = 'chapter-views loading';
    views.id = `views-${chapter.num}`;
    views.innerHTML = `
      <span class="view-icon">👁️</span>
      <span class="view-count">...</span>
      <span class="view-label">views</span>
    `;
    
    div.appendChild(title);
    div.appendChild(views);
  }
  
  return div;
}

// ===========================
// CHAPTER FUNCTIONS
// ===========================

// Fungsi untuk membaca chapter
function readChapter(chapterNum) {
  // Redirect ke halaman reader dengan parameter
  window.location.href = `reader.html?manga=${mangaId}&chapter=${encodeURIComponent(chapterNum)}`;
}

// Fungsi untuk membuka Mangadex
function openMangadex() {
  window.open('https://mangadex.org/title/your-manga-id', '_blank');
}

// Fungsi untuk membuka Raw
function openRaw() {
  window.open('https://example.com/raw-source', '_blank');
}

// Fungsi untuk unlock chapter (redirect ke support page)
function unlockChapter(chapterNum) {
  if (confirm('Chapter ini terkunci! Dukung kami di Trakteer untuk membaca lebih awal?')) {
    window.open('https://trakteer.id/NuranantoScanlation', '_blank');
  }
}

// Fungsi untuk show/hide chapter list
function toggleChapters() {
  const olderChapters = document.getElementById('olderChapters');
  const btn = event.target;
  
  if (olderChapters.style.display === 'none' || !olderChapters.style.display) {
    olderChapters.style.display = 'flex';
    olderChapters.style.flexDirection = 'column';
    olderChapters.style.gap = '8px';
    olderChapters.style.marginTop = '8px';
    btn.textContent = 'Hide Chapters';
    
    // Load view counts untuk chapter yang baru muncul
    displayAllViewCounts();
  } else {
    olderChapters.style.display = 'none';
    btn.textContent = 'Show All Chapters';
  }
}

// ===========================
// SEARCH FUNCTIONS
// ===========================

function searchAuthor(authorName) {
  alert('Search by author: ' + authorName);
  // TODO: Implement your search logic here
}

function searchArtist(artistName) {
  alert('Search by artist: ' + artistName);
  // TODO: Implement your search logic here
}

function searchGenre(genreName) {
  alert('Search by genre: ' + genreName);
  // TODO: Implement your search logic here
}

// ===========================
// INITIALIZATION
// ===========================

window.addEventListener('DOMContentLoaded', async function() {
  console.log('Loading manga info page...');
  
  // Get manga ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  mangaId = urlParams.get('manga') || 'madogiwa';
  
  try {
    // Load manga config
    await loadMangaConfig();
    
    // Populate page with manga data
    await populatePageData();
    
    // Load view counts dari GitHub
    await displayAllViewCounts();
    
    // Increment view count untuk halaman info manga
    incrementViewCount('info');
    
    // Refresh view counts setiap 30 detik untuk update real-time
    setInterval(displayAllViewCounts, 30000);
    
  } catch (error) {
    console.error('Error loading page:', error);
    alert('Gagal memuat data manga: ' + error.message);
  }
});