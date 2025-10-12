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
let db;
let storage;

async function initFirebase() {
  try {
    // Import Firebase modules
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getDatabase, ref, get, child } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    const { getStorage, ref: storageRef, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    storage = getStorage(app);
    
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Gagal menghubungkan ke server. Silakan refresh halaman.');
    return false;
  }
}

// ===========================
// GLOBAL VARIABLES
// ===========================
let chapters = [];
let currentChapterNum = '1';
let currentPage = 1;
let totalPages = 0;
let readMode = 'vertical';
let imageUrls = [];
let mangaId = '';

// ===========================
// PAGE INITIALIZATION
// ===========================
window.addEventListener('DOMContentLoaded', async function() {
  // Initialize Firebase first
  const firebaseReady = await initFirebase();
  
  if (!firebaseReady) {
    return;
  }
  
  // Get manga ID from URL or use default
  const urlParams = new URLSearchParams(window.location.search);
  mangaId = urlParams.get('manga') || 'madogiwa';
  const chapterFromUrl = urlParams.get('chapter');
  
  // Load manga data from Firebase
  await loadMangaData();
  
  if (chapterFromUrl && chapters.find(ch => ch.num === chapterFromUrl)) {
    currentChapterNum = chapterFromUrl;
  }
  
  await loadChapter(currentChapterNum);
  generateChapterList();
});

// ===========================
// LOAD MANGA DATA FROM FIREBASE
// ===========================
async function loadMangaData() {
  try {
    showLoading();
    
    const { ref: dbRef, get, child } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
    
    // Get manga metadata
    const mangaRef = dbRef(db, `mangas/${mangaId}`);
    const snapshot = await get(mangaRef);
    
    if (!snapshot.exists()) {
      throw new Error('Manga tidak ditemukan');
    }
    
    const mangaData = snapshot.val();
    
    // Set manga title
    document.title = mangaData.title || 'Manga Reader';
    
    // Load chapters
    chapters = [];
    if (mangaData.chapters) {
      Object.keys(mangaData.chapters).forEach(chapterNum => {
        const chapterData = mangaData.chapters[chapterNum];
        chapters.push({
          num: chapterNum,
          title: chapterData.title || `Chapter ${chapterNum}`,
          pages: chapterData.pages || 0,
          locked: chapterData.locked || false
        });
      });
    }
    
    // Sort chapters by number
    chapters.sort((a, b) => {
      const numA = parseFloat(a.num);
      const numB = parseFloat(b.num);
      return numA - numB;
    });
    
    console.log(`Loaded ${chapters.length} chapters:`, chapters);
    
    if (chapters.length === 0) {
      throw new Error('Tidak ada chapter yang tersedia');
    }
    
  } catch (error) {
    console.error('Error loading manga data:', error);
    alert('Gagal memuat data manga: ' + error.message);
    hideLoading();
  }
}

// ===========================
// LOAD CHAPTER
// ===========================
async function loadChapterImages(chapterNum, pageCount) {
  try {
    imageUrls = [];

    // Contoh lokasi gambar:
    // https://nurananto.github.io/MadogiwaHenshuutoBakaniSaretaOrega-FutagoJKtoDoukyosuruKotoniNatta/manga/madogiwa/4/1.jpg
    for (let i = 1; i <= pageCount; i++) {
      const imageUrl = `https://nurananto.github.io/MadogiwaHenshuutoBakaniSaretaOrega-FutagoJKtoDoukyosuruKotoniNatta/manga/${mangaId}/${chapterNum}/${i}.jpg`;
      imageUrls.push(imageUrl);
    }

    if (imageUrls.length === 0) throw new Error('Tidak ada gambar yang ditemukan di GitHub');

    console.log(`Loaded ${imageUrls.length} pages for chapter ${chapterNum}`);

  } catch (error) {
    console.error('Error loading images:', error);
    throw error;
  }
}


// ===========================
// LOAD CHAPTER IMAGES FROM FIREBASE STORAGE
// ===========================
// ===========================
// LOAD CHAPTER IMAGES FROM GITHUB
// ===========================
async function loadChapterImages(chapterNum, pageCount) {
  try {
    imageUrls = [];

    // Loop semua halaman sesuai jumlah halaman
    for (let i = 1; i <= pageCount; i++) {
      const imageUrl = `https://nurananto.github.io/MadogiwaHenshuutoBakaniSaretaOrega-FutagoJKtoDoukyosuruKotoniNatta/manga/madogiwa/${chapterNum}/${i}.jpg`;
      imageUrls.push(imageUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error('Tidak ada gambar yang ditemukan di GitHub');
    }

    console.log(`Loaded ${imageUrls.length} pages for chapter ${chapterNum}`);

    // Render ke halaman
    const container = document.getElementById('imageContainer');
    container.innerHTML = '';

    imageUrls.forEach((url) => {
      const img = document.createElement('img');
      img.src = url;
      img.loading = 'lazy';
      img.alt = `Page ${url}`;
      container.appendChild(img);
    });

  } catch (error) {
    console.error('Error loading images:', error);
    throw error;
  }
}


// ===========================
// LOADING INDICATOR
// ===========================
function showLoading() {
  const container = document.getElementById('mangaContainer');
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 20px;">
      <div style="width: 60px; height: 60px; border: 5px solid #1a1a1a; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: #888; font-size: 1.1rem;">Loading chapter...</p>
    </div>
  `;
  
  if (!document.getElementById('spin-keyframes')) {
    const style = document.createElement('style');
    style.id = 'spin-keyframes';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

function hideLoading() {
  // Loading will be cleared when loadMangaPages() is called
}

// ===========================
// LOAD MANGA PAGES
// ===========================
function loadMangaPages() {
  const container = document.getElementById('mangaContainer');
  container.innerHTML = '';
  
  imageUrls.forEach((url, index) => {
    const img = document.createElement('img');
    img.className = 'manga-page';
    img.src = url;
    img.alt = `Page ${index + 1}`;
    img.loading = 'lazy';
    
    img.onerror = function() {
      console.error(`Failed to load image: ${url}`);
      this.style.background = '#1a1a1a';
      this.style.minHeight = '600px';
      this.style.display = 'flex';
      this.style.alignItems = 'center';
      this.style.justifyContent = 'center';
      this.alt = `Failed to load page ${index + 1}`;
    };
    
    container.appendChild(img);
  });
  
  container.scrollTop = 0;
  container.scrollLeft = 0;
  
  if (readMode === 'vertical') {
    container.addEventListener('scroll', trackScrollPosition);
  }
  
  setupHorizontalNavigation();
}

// ===========================
// HORIZONTAL NAVIGATION SETUP
// ===========================
function setupHorizontalNavigation() {
  const container = document.getElementById('mangaContainer');
  
  container.removeEventListener('click', handleContainerClick);
  container.removeEventListener('touchstart', handleTouchStart);
  container.removeEventListener('touchend', handleTouchEnd);
  
  container.addEventListener('click', handleContainerClick);
  container.addEventListener('touchstart', handleTouchStart);
  container.addEventListener('touchend', handleTouchEnd);
}

let touchStartX = 0;
let touchEndX = 0;

function handleContainerClick(e) {
  if (readMode !== 'horizontal') return;
  
  const container = document.getElementById('mangaContainer');
  const containerWidth = container.clientWidth;
  const clickX = e.clientX;
  
  if (clickX < containerWidth * 0.3) {
    scrollToPreviousPage();
  } else if (clickX > containerWidth * 0.7) {
    scrollToNextPage();
  }
}

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  if (readMode !== 'horizontal') return;
  
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  if (touchEndX > touchStartX + 50) {
    scrollToPreviousPage();
  } else if (touchEndX < touchStartX - 50) {
    scrollToNextPage();
  }
}

function scrollToNextPage() {
  const container = document.getElementById('mangaContainer');
  const images = container.querySelectorAll('.manga-page');
  
  let currentVisibleIndex = 0;
  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    if (rect.left >= containerRect.left - 50 && rect.left <= containerRect.left + 50) {
      currentVisibleIndex = index;
    }
  });
  
  if (currentVisibleIndex < images.length - 1) {
    images[currentVisibleIndex + 1].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center', 
      inline: 'center' 
    });
    currentPage = currentVisibleIndex + 2;
    updatePageIndicator();
  }
}

function scrollToPreviousPage() {
  const container = document.getElementById('mangaContainer');
  const images = container.querySelectorAll('.manga-page');
  
  let currentVisibleIndex = 0;
  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    if (rect.left >= containerRect.left - 50 && rect.left <= containerRect.left + 50) {
      currentVisibleIndex = index;
    }
  });
  
  if (currentVisibleIndex > 0) {
    images[currentVisibleIndex - 1].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center', 
      inline: 'center' 
    });
    currentPage = currentVisibleIndex;
    updatePageIndicator();
  }
}

// ===========================
// TRACK SCROLL POSITION
// ===========================
let scrollTimeout;

function trackScrollPosition() {
  const container = document.getElementById('mangaContainer');
  const images = container.querySelectorAll('.manga-page');
  const indicator = document.querySelector('.page-indicator');
  
  indicator.classList.remove('hidden');
  
  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    if (rect.top >= containerRect.top && rect.top <= containerRect.bottom) {
      currentPage = index + 1;
      updatePageIndicator();
    }
  });
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    indicator.classList.add('hidden');
  }, 2000);
}

// ===========================
// UPDATE PAGE INDICATOR
// ===========================
function updatePageIndicator() {
  const pageInfo = document.getElementById('pageInfo');
  const currentStr = String(currentPage).padStart(2, '0');
  const totalStr = String(totalPages).padStart(2, '0');
  pageInfo.textContent = `${currentStr}/${totalStr}`;
}

// ===========================
// TOGGLE READ MODE
// ===========================
function toggleReadMode() {
  const container = document.getElementById('mangaContainer');
  const modeBtn = document.getElementById('modeBtn');
  const modeBtn2 = document.getElementById('modeBtn2');
  
  if (readMode === 'vertical') {
    readMode = 'horizontal';
    container.classList.add('horizontal');
    
    modeBtn.querySelector('.mode-icon').textContent = '⬌';
    modeBtn.querySelector('.mode-text').textContent = 'Manga';
    modeBtn2.querySelector('.mode-icon').textContent = '⬌';
    modeBtn2.querySelector('.mode-text').textContent = 'Manga';
    
    container.removeEventListener('scroll', trackScrollPosition);
    
  } else {
    readMode = 'vertical';
    container.classList.remove('horizontal');
    
    modeBtn.querySelector('.mode-icon').textContent = '⬇';
    modeBtn.querySelector('.mode-text').textContent = 'Webtoon';
    modeBtn2.querySelector('.mode-icon').textContent = '⬇';
    modeBtn2.querySelector('.mode-text').textContent = 'Webtoon';
    
    container.addEventListener('scroll', trackScrollPosition);
  }
}

// ===========================
// CHAPTER NAVIGATION
// ===========================
function prevChapter() {
  const currentIndex = chapters.findIndex(ch => ch.num === currentChapterNum);
  
  if (currentIndex > 0) {
    const prevChapter = chapters[currentIndex - 1];
    
    if (prevChapter.locked) {
      if (confirm('Chapter ini terkunci! Dukung kami di Trakteer untuk membaca lebih awal. Klik OK untuk menuju halaman Trakteer.')) {
        window.open('https://trakteer.id/NuranantoScanlation', '_blank');
      }
      return;
    }
    
    loadChapter(prevChapter.num);
    
    const newUrl = `reader.html?manga=${mangaId}&chapter=${prevChapter.num}`;
    window.history.pushState({}, '', newUrl);
  } else {
    alert('Ini adalah chapter pertama!');
  }
}

function nextChapter() {
  const currentIndex = chapters.findIndex(ch => ch.num === currentChapterNum);
  
  if (currentIndex < chapters.length - 1) {
    const nextChapter = chapters[currentIndex + 1];
    
    if (nextChapter.locked) {
      if (confirm('Chapter ini terkunci! Dukung kami di Trakteer untuk membaca lebih awal. Klik OK untuk menuju halaman Trakteer.')) {
        window.open('https://trakteer.id/NuranantoScanlation', '_blank');
      }
      return;
    }
    
    loadChapter(nextChapter.num);
    
    const newUrl = `reader.html?manga=${mangaId}&chapter=${nextChapter.num}`;
    window.history.pushState({}, '', newUrl);
  } else {
    alert('Ini adalah chapter terakhir!');
  }
}

// ===========================
// UPDATE NAVIGATION BUTTONS
// ===========================
function updateNavigationButtons() {
  const currentIndex = chapters.findIndex(ch => ch.num === currentChapterNum);
  const prevButtons = document.querySelectorAll('.div4 .btn-nav, .div9 .btn-nav');
  const nextButtons = document.querySelectorAll('.div5 .btn-nav, .div10 .btn-nav');
  
  if (currentIndex === 0) {
    prevButtons.forEach(btn => btn.disabled = true);
  } else {
    prevButtons.forEach(btn => btn.disabled = false);
  }
  
  if (currentIndex === chapters.length - 1) {
    nextButtons.forEach(btn => btn.disabled = true);
  } else {
    nextButtons.forEach(btn => btn.disabled = false);
  }
}

// ===========================
// MODAL CHAPTER LIST
// ===========================
function generateChapterList() {
  const container = document.getElementById('chapterListContainer');
  container.innerHTML = '';
  
  chapters.forEach(chapter => {
    const div = document.createElement('div');
    div.className = 'chapter-option';
    
    if (chapter.locked) {
      div.textContent = `${chapter.title} 🔒`;
      div.style.opacity = '0.7';
    } else {
      div.textContent = chapter.title;
    }
    
    if (chapter.num === currentChapterNum) {
      div.classList.add('active');
    }
    
    div.addEventListener('click', function() {
      if (chapter.locked) {
        closeChapterList();
        if (confirm('Chapter ini terkunci! Dukung kami di Trakteer untuk membaca lebih awal. Klik OK untuk menuju halaman Trakteer.')) {
          window.open('https://trakteer.id/NuranantoScanlation', '_blank');
        }
        return;
      }
      
      loadChapter(chapter.num);
      closeChapterList();
      
      const newUrl = `reader.html?manga=${mangaId}&chapter=${chapter.num}`;
      window.history.pushState({}, '', newUrl);
    });
    
    container.appendChild(div);
  });
}

function showChapterList() {
  const modal = document.getElementById('chapterModal');
  modal.classList.add('show');
  generateChapterList();
}

function closeChapterList() {
  const modal = document.getElementById('chapterModal');
  modal.classList.remove('show');
}

window.addEventListener('click', function(event) {
  const modal = document.getElementById('chapterModal');
  if (event.target === modal) {
    closeChapterList();
  }
});

// ===========================
// BACK TO INFO PAGE
// ===========================
function backToInfo() {
  window.location.href = `info.html?manga=${mangaId}`;
}

// ===========================
// KEYBOARD SHORTCUTS
// ===========================
document.addEventListener('keydown', function(event) {
  switch(event.key) {
    case 'ArrowLeft':
      prevChapter();
      break;
    case 'ArrowRight':
      nextChapter();
      break;
    case 'm':
    case 'M':
      toggleReadMode();
      break;
    case 'c':
    case 'C':
      showChapterList();
      break;
    case 'Escape':
      closeChapterList();
      break;
  }
});

// ===========================
// IMAGE PROTECTION
// ===========================

// Disable right click
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
});

// Disable drag images
document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    return false;
  }
});

// Disable text selection on images
document.addEventListener('selectstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    return false;
  }
});
