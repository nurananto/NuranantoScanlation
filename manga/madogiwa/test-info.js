// ===========================
// FIREBASE CONFIGURATION
// ===========================
const firebaseConfig = {
  apiKey: "AIzaSyDREmN67P3fz6I5L1dVSYdqgMdcOWI-QKk",
  authDomain: "nuranantoscanlation.firebaseapp.com",
  databaseURL: "https://nuranantoscanlation-default-rtdb.firebaseio.com",
  projectId: "nuranantoscanlation",
  storageBucket: "nuranantoscanlation.firebasestorage.app",
  messagingSenderId: "510319300673",
  appId: "1:510319300673:web:8501244010e703e6eaf6c0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===========================
// MANGA ID
// ===========================
const mangaId = 'madogiwa';

// ===========================
// GLOBAL VARIABLES
// ===========================
let chapters = [];

// ===========================
// LOAD CHAPTERS FROM GITHUB (TEST MODE)
// ===========================
async function loadChaptersFromGitHub() {
  try {
    console.log('🔄 Loading chapters from GitHub...');
    
    const githubUrl = 'https://raw.githubusercontent.com/nurananto/MadogiwaHenshuutoBakaniSaretaOrega-FutagoJKtoDoukyosuruKotoniNatta/main/chapters.json';
    
    const response = await fetch(githubUrl);
    
    if (!response.ok) {
      throw new Error('Failed to load chapters.json from GitHub');
    }
    
    const data = await response.json();
    chapters = data.chapters || [];
    
    console.log(`✅ Loaded ${chapters.length} chapters:`, chapters);
    
    // Generate chapter list HTML
    generateChapterListHTML();
    
    // Load view counts setelah chapter list dibuat
    setTimeout(() => {
      loadAllViewCounts();
    }, 100);
    
  } catch (error) {
    console.error('❌ Error loading chapters:', error);
    alert('Gagal memuat data chapter dari GitHub: ' + error.message);
  }
}

// ===========================
// GENERATE CHAPTER LIST HTML
// ===========================
function generateChapterListHTML() {
  const container = document.querySelector('.div10');
  
  if (!container) {
    console.error('Chapter list container not found!');
    return;
  }
  
  // Clear existing content
  container.innerHTML = '<div class="chapter-list-title">Chapter List (TEST MODE)</div>';
  
  // Reverse untuk tampilkan chapter terbaru di atas
  const reversedChapters = [...chapters].reverse();
  
  // 3 chapter terbaru
  const recentChapters = reversedChapters.slice(0, 3);
  
  recentChapters.forEach(chapter => {
    const div = document.createElement('div');
    div.className = 'chapter-item';
    
    if (chapter.locked) {
      div.classList.add('locked');
      div.setAttribute('data-chapter', chapter.num);
      div.onclick = () => unlockChapter(chapter.num);
      
      div.innerHTML = `
        <span class="chapter-title">Chapter ${chapter.num} 🔒</span>
        <div class="chapter-locked-info" style="color: #ffd700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
          <span>🔒</span>
          <span>Locked</span>
        </div>
      `;
    } else {
      div.setAttribute('data-chapter', chapter.num);
      div.onclick = () => readChapter(chapter.num);
      
      div.innerHTML = `
        <span class="chapter-title">Chapter ${chapter.num}</span>
        <div class="chapter-views loading" id="views-${chapter.num}">
          <span class="view-icon">👁️</span>
          <span class="view-count">...</span>
          <span class="view-label">views</span>
        </div>
      `;
    }
    
    container.appendChild(div);
  });
  
  // Older chapters (jika ada lebih dari 3)
  if (reversedChapters.length > 3) {
    const btn = document.createElement('button');
    btn.className = 'show-all-btn';
    btn.textContent = 'Show All Chapters';
    btn.onclick = toggleChapters;
    container.appendChild(btn);
    
    const olderDiv = document.createElement('div');
    olderDiv.id = 'olderChapters';
    olderDiv.style.display = 'none';
    
    reversedChapters.slice(3).forEach(chapter => {
      const div = document.createElement('div');
      div.className = 'chapter-item';
      
      if (chapter.locked) {
        div.classList.add('locked');
        div.setAttribute('data-chapter', chapter.num);
        div.onclick = () => unlockChapter(chapter.num);
        
        div.innerHTML = `
          <span class="chapter-title">Chapter ${chapter.num} 🔒</span>
          <div class="chapter-locked-info" style="color: #ffd700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;">
            <span>🔒</span>
            <span>Locked</span>
          </div>
        `;
      } else {
        div.setAttribute('data-chapter', chapter.num);
        div.onclick = () => readChapter(chapter.num);
        
        div.innerHTML = `
          <span class="chapter-title">Chapter ${chapter.num}</span>
          <div class="chapter-views loading" id="views-${chapter.num}">
            <span class="view-icon">👁️</span>
            <span class="view-count">...</span>
            <span class="view-label">views</span>
          </div>
        `;
      }
      
      olderDiv.appendChild(div);
    });
    
    container.appendChild(olderDiv);
  }
  
  console.log('✅ Chapter list HTML generated');
}

// ===========================
// VIEW COUNTER FUNCTIONS
// ===========================

// Load view count untuk semua chapter yang terlihat
function loadAllViewCounts() {
  // Ambil semua chapter items
  const chapterItems = document.querySelectorAll('.chapter-item[data-chapter]:not(.locked)');
  
  console.log(`Loading view counts for ${chapterItems.length} chapters...`);
  
  chapterItems.forEach(item => {
    const chapterId = item.getAttribute('data-chapter');
    loadViewCount(chapterId);
  });
}

// Load view count untuk chapter tertentu
function loadViewCount(chapterId) {
  const viewRef = db.ref('chapters/' + chapterId + '/views');
  const viewElement = document.getElementById('views-' + chapterId);
  
  if (!viewElement) return;
  
  // Listen untuk perubahan real-time
  viewRef.on('value', (snapshot) => {
    const views = snapshot.val() || 0;
    updateViewDisplay(chapterId, views);
  }, (error) => {
    console.error('Error loading views for chapter ' + chapterId + ':', error);
    if (viewElement) {
      viewElement.querySelector('.view-count').textContent = '0';
      viewElement.classList.remove('loading');
    }
  });
}

// Update tampilan view count
function updateViewDisplay(chapterId, views) {
  const viewElement = document.getElementById('views-' + chapterId);
  if (viewElement) {
    viewElement.querySelector('.view-count').textContent = views.toLocaleString();
    viewElement.classList.remove('loading');
  }
}

// Increment view count saat chapter dibuka
function incrementViewCount(chapterId) {
  const viewRef = db.ref('chapters/' + chapterId + '/views');
  
  viewRef.transaction((currentViews) => {
    return (currentViews || 0) + 1;
  }).then(() => {
    console.log('View count incremented for chapter ' + chapterId);
  }).catch((error) => {
    console.error('Error incrementing view count:', error);
  });
}

// ===========================
// CHAPTER FUNCTIONS
// ===========================

// Fungsi untuk membaca chapter
function readChapter(chapterNum) {
  // Check if user already viewed this chapter in this session
  const sessionKey = 'viewed_chapter_' + chapterNum;
  const hasViewed = sessionStorage.getItem(sessionKey);
  
  // Increment view count hanya sekali per session
  if (!hasViewed) {
    incrementViewCount(chapterNum);
    sessionStorage.setItem(sessionKey, 'true');
  }
  
  // TEST MODE: Redirect ke test-reader.html
  window.location.href = `test-reader.html?manga=${mangaId}&chapter=${encodeURIComponent(chapterNum)}`;
  
  // PRODUCTION: Ganti jadi reader.html
  // window.location.href = `reader.html?manga=${mangaId}&chapter=${encodeURIComponent(chapterNum)}`;
}

// Fungsi untuk membuka Mangadex
function openMangadex() {
  window.open('https://mangadex.org/title/a0ecce48-aa4c-48e6-8d9b-90f322a5687a/madogiwa-henshuu-to-baka-ni-sareta-ore-ga-futago-jk-to-doukyo-suru-koto-ni-natta', '_blank');
}

// Fungsi untuk membuka Raw
function openRaw() {
  window.open('https://comic-walker.com/detail/KC_006388_S', '_blank');
}

// Fungsi untuk unlock chapter (redirect ke support page)
function unlockChapter(chapterNum) {
  // Tampilkan konfirmasi
  if (confirm('Chapter ini terkunci! Dukung kami di Trakteer untuk membaca lebih awal?')) {
    window.open('https://trakteer.id/NuranantoScanlation', '_blank');
  }
}

// Fungsi untuk show/hide chapter list
function toggleChapters() {
  const olderChapters = document.getElementById('olderChapters');
  const btn = event.target;
  
  if (olderChapters.style.display === 'none') {
    // Tampilkan chapter lama
    olderChapters.style.display = 'flex';
    olderChapters.style.flexDirection = 'column';
    olderChapters.style.gap = '8px';
    olderChapters.style.marginTop = '8px';
    btn.textContent = 'Hide Chapters';
    
    // Load view counts untuk chapter yang baru muncul
    loadAllViewCounts();
  } else {
    // Sembunyikan chapter lama
    olderChapters.style.display = 'none';
    btn.textContent = 'Show All Chapters';
  }
}

// ===========================
// SEARCH FUNCTIONS (PLACEHOLDER)
// ===========================

function searchAuthor(authorName) {
  alert('Search by author: ' + authorName);
  // Implement your search logic here
}

function searchArtist(artistName) {
  alert('Search by artist: ' + artistName);
  // Implement your search logic here
}

function searchGenre(genreName) {
  alert('Search by genre: ' + genreName);
  // Implement your search logic here
}

// ===========================
// INITIALIZATION
// ===========================

// Load chapters dari GitHub saat halaman dimuat
window.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 TEST MODE - info.html');
  console.log('Loading chapters from GitHub...');
  loadChaptersFromGitHub();
});