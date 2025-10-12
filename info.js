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

// Update tampilan visitor count
async function displayVisitorCount() {
  const stats = await loadStatsFromGitHub();
  const visitorElement = document.getElementById('visitor-count');
  
  if (visitorElement) {
    const mangaStats = stats.mangas?.[mangaId] || {};
    const visitorCount = mangaStats.info_views || 0;
    
    visitorElement.textContent = visitorCount.toLocaleString();
    visitorElement.classList.remove('loading');
  }
}

// Update tampilan view count di halaman
async function displayAllViewCounts() {
  const stats = await loadStatsFromGitHub();
  
  // Cek apakah ada stats untuk manga ini
  const mangaStats = stats.mangas?.[mangaId] || { chapters: {} };
  
  // Update view count untuk setiap chapter yang ada di halaman (termasuk locked)
  const chapterItems = document.querySelectorAll('.chapter-item[data-chapter]');
  
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
  const authorSpan = document.querySelector('.author-section span');
  if (authorSpan && mangaConfig.author) {
    authorSpan.textContent = mangaConfig.author;
  }
  
  // Update artist
  const artistSpan = document.querySelector('.artist-section span');
  if (artistSpan && mangaConfig.artist) {
    artistSpan.textContent = mangaConfig.artist;
  }
  
  // Update genres
  const genreContainer = document.querySelector('.div12');
  if (genreContainer && mangaConfig.genres) {
    genreContainer.innerHTML = '';
    mangaConfig.genres.forEach(genre => {
      const tag = document.createElement('span');
      tag.className = 'genre-tag';
      tag.textContent = genre;
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
  
  const latestChaptersContainer = document.getElementById('latest-chapters');
  const olderChaptersContainer = document.getElementById('olderChapters');
  const showAllBtn = document.getElementById('show-all-btn');
  
  if (!latestChaptersContainer) return;
  
  // Clear existing chapters
  latestChaptersContainer.innerHTML = '';
  if (olderChaptersContainer) {
    olderChaptersContainer.innerHTML = '';
  }
  
  // Convert chapters object to sorted array
  const chapterArray = Object.keys(mangaConfig.chapters).map(num => ({
    num: num,
    ...mangaConfig.chapters[num]
  })).sort((a, b) => parseFloat(b.num) - parseFloat(a.num)); // Descending order
  
  // Tentukan jumlah chapter yang ditampilkan berdasarkan tinggi layar dan lebar
  let visibleChapterCount = 10; // Default desktop (dikembalikan ke 10)
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  if (screenWidth <= 480) {
    // Small mobile (iPhone SE, etc): 3 chapter
    visibleChapterCount = 3;
  } else if (screenWidth <= 768) {
    // Mobile biasa
    if (screenHeight <= 740) {
      // Short screen (iPhone SE, Pixel 7): 3 chapter
      visibleChapterCount = 3;
    } else if (screenHeight <= 900) {
      // Medium height (iPhone 12 Pro, XR): 4 chapter
      visibleChapterCount = 4;
    } else {
      // Tall phones (iPhone 14 Pro Max, S20 Ultra): 5 chapter
      visibleChapterCount = 5;
    }
  } else if (screenWidth <= 1024) {
    // Tablet (iPad Mini, iPad Air, Z Fold 5)
    if (screenHeight <= 820) {
      // iPad Mini portrait: 5 chapter
      visibleChapterCount = 5;
    } else {
      // iPad Air, Z Fold unfolded: 6 chapter
      visibleChapterCount = 6;
    }
  }
  
  // Show latest chapters based on device
  const latestChapters = chapterArray.slice(0, visibleChapterCount);
  const olderChaptersList = chapterArray.slice(visibleChapterCount);
  
  // Insert latest chapters
  latestChapters.forEach(chapter => {
    const chapterElement = createChapterElement(chapter);
    latestChaptersContainer.appendChild(chapterElement);
  });
  
  // Show "Show All Chapters" button jika ada chapter lebih dari visible count
  if (olderChaptersList.length > 0 && showAllBtn) {
    showAllBtn.style.display = 'block';
    
    // Populate older chapters
    if (olderChaptersContainer) {
      olderChaptersList.forEach(chapter => {
        const chapterElement = createChapterElement(chapter);
        olderChaptersContainer.appendChild(chapterElement);
      });
    }
  } else {
    // Sembunyikan button jika chapter <= visible count
    if (showAllBtn) {
      showAllBtn.style.display = 'none';
    }
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
    
    // Locked chapter juga punya view counter dengan angka
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
  const btn = document.getElementById('show-all-btn');
  
  if (!olderChapters || !btn) return;
  
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
// Functions removed - Author, Artist, Genre are now plain text

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
    
    // Load visitor count
    await displayVisitorCount();
    
    // Load view counts dari GitHub
    await displayAllViewCounts();
    
    // Increment view count untuk halaman info manga
    incrementViewCount('info');
    
    // Refresh view counts setiap 30 detik untuk update real-time
    setInterval(() => {
      displayVisitorCount();
      displayAllViewCounts();
    }, 30000);
    
  } catch (error) {
    console.error('Error loading page:', error);
    alert('Gagal memuat data manga: ' + error.message);
  }
});

// Re-generate chapter list saat resize window (untuk responsive)
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    if (mangaConfig) {
      generateChapterList();
      displayAllViewCounts();
    }
  }, 250);
});