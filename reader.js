// ===========================
// CONFIGURATION
// ===========================
const MAIN_REPO = 'nurananto/NuranantoScanlation';
const MANGA_LIST_URL = `https://raw.githubusercontent.com/${MAIN_REPO}/main/manga-list.json`;
const STATS_URL = `https://raw.githubusercontent.com/${MAIN_REPO}/main/stats.json`;

// Google Apps Script Web App URL
const VIEW_COUNTER_API = 'https://script.google.com/macros/s/AKfycbwd6-DwlpwSy3wgJS5muIi0BTD9N3guq-9zSSHpqkfnnHpvkAiHSK4efJv9643-Z_n9/exec';

// ===========================
// GLOBAL VARIABLES
// ===========================
let mangaConfig = null;
let mangaRepo = '';
let chapters = [];
let currentChapterNum = '1';
let currentPage = 1;
let totalPages = 0;
let readMode = 'vertical';
let imageUrls = [];
let mangaId = '';
let loadedImages = 0;

// ===========================
// VIEW COUNTER
// ===========================
async function incrementChapterView(chapterId) {
  try {
    const sessionKey = `viewed_${mangaId}_${chapterId}`;
    
    // Cek apakah chapter sudah pernah dilihat di session ini
    if (sessionStorage.getItem(sessionKey)) {
      console.log('Chapter already viewed in this session');
      return;
    }
    
    // Tandai sebagai sudah dilihat
    sessionStorage.setItem(sessionKey, 'true');
    
    // Prepare data
    const viewData = {
      manga_id: mangaId,
      chapter: chapterId,
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending view data:', viewData);
    
    // Kirim ke Google Apps Script API dengan redirect: 'follow'
    const response = await fetch(VIEW_COUNTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(viewData),
      redirect: 'follow',
      mode: 'no-cors'
    });
    
    // Karena mode no-cors, kita tidak bisa baca response
    // Tapi request tetap terkirim ke server
    console.log('✅ View counting request sent for chapter:', chapterId);
    
  } catch (error) {
    console.error('❌ Error incrementing view:', error);
  }
}

// ===========================
// PAGE INITIALIZATION
// ===========================
window.addEventListener('DOMContentLoaded', async function() {
  const urlParams = new URLSearchParams(window.location.search);
  mangaId = urlParams.get('manga') || 'madogiwa';
  const chapterFromUrl = urlParams.get('chapter') || '1';
  
  showLoading();
  
  try {
    // Load manga config
    await loadMangaConfig();
    
    // Load chapters from config
    loadChaptersFromConfig();
    
    // Find chapter
    if (chapters.find(ch => ch.num === chapterFromUrl)) {
      currentChapterNum = chapterFromUrl;
    }
    
    // Load chapter
    await loadChapter(currentChapterNum);
    generateChapterList();
    
    // Increment view
    incrementChapterView(currentChapterNum);
    
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Gagal memuat manga: ' + error.message);
    hideLoading();
  }
});

// ===========================
// LOAD MANGA CONFIG
// ===========================
async function loadMangaConfig() {
  try {
    // Load manga list
    const listResponse = await fetch(MANGA_LIST_URL + '?t=' + Date.now());
    const mangaList = await listResponse.json();
    
    if (!mangaList[mangaId]) {
      throw new Error('Manga tidak ditemukan dalam daftar');
    }
    
    mangaRepo = mangaList[mangaId].repo;
    const configUrl = mangaList[mangaId].config_url;
    
    // Load manga config
    const configResponse = await fetch(configUrl + '?t=' + Date.now());
    mangaConfig = await configResponse.json();
    
    // Set title
    document.title = `${mangaConfig.title} - Reader`;
    document.querySelectorAll('.manga-title').forEach(el => {
      el.textContent = mangaConfig.title;
    });
    
    console.log('Manga config loaded:', mangaConfig);
    
  } catch (error) {
    console.error('Error loading manga config:', error);
    throw error;
  }
}

// ===========================
// LOAD CHAPTERS FROM CONFIG
// ===========================
function loadChaptersFromConfig() {
  chapters = [];
  
  Object.keys(mangaConfig.chapters).forEach(chapterNum => {
    const chapterData = mangaConfig.chapters[chapterNum];
    chapters.push({
      num: chapterNum,
      title: `Chapter ${chapterNum}`,
      pages: chapterData.pages,
      locked: chapterData.locked
    });
  });
  
  // Sort chapters by number (support decimal like 1.2, 1.5)
  chapters.sort((a, b) => {
    return parseFloat(a.num) - parseFloat(b.num);
  });
  
  console.log(`Loaded ${chapters.length} chapters:`, chapters);
}

// ===========================
// LOAD CHAPTER
// ===========================
async function loadChapter(chapterNum) {
  const chapter = chapters.find(ch => ch.num === chapterNum);
  
  if (!chapter) {
    alert('Chapter tidak ditemukan!');
    return;
  }
  
  if (chapter.locked) {
    if (confirm('Chapter ini terkunci! Dukung kami di Trakteer untuk membaca lebih awal. Klik OK untuk menuju halaman Trakteer.')) {
      window.open('https://trakteer.id/NuranantoScanlation', '_blank');
    }
    return;
  }
  
  showLoading();
  
  try {
    await loadChapterImages(chapterNum, chapter.pages);
    
    currentChapterNum = chapterNum;
    totalPages = imageUrls.length;
    currentPage = 1;
    loadedImages = 0;
    
    const chapterTitle = `Chapter ${chapterNum}`;
    document.getElementById('currentChapter').textContent = chapterTitle;
    document.getElementById('currentChapter2').textContent = chapterTitle;
    document.title = `${chapterTitle} - ${mangaConfig.title}`;
    
    updatePageIndicator();
    loadMangaPages();
    updateNavigationButtons();
    
  } catch (error) {
    console.error('Error loading chapter:', error);
    alert('Gagal memuat chapter: ' + error.message);
  } finally {
    hideLoading();
  }
}

// ===========================
// LOAD CHAPTER IMAGES FROM GITHUB
// ===========================
async function loadChapterImages(chapterNum, pageCount) {
  imageUrls = [];
  
  const baseUrl = `https://raw.githubusercontent.com/${mangaRepo}/main/${chapterNum}`;
  
  for (let i = 1; i <= pageCount; i++) {
    // Format: Image01.jpg, Image02.jpg, dst
    const pageNumStr = String(i).padStart(2, '0');
    const imageUrl = `${baseUrl}/Image${pageNumStr}.jpg`;
    imageUrls.push(imageUrl);
  }
  
  console.log(`Loaded ${imageUrls.length} pages for chapter ${chapterNum}`);
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
// LOAD MANGA PAGES (LAZY LOADING)
// ===========================
function loadMangaPages() {
  const container = document.getElementById('mangaContainer');
  container.innerHTML = '';
  
  imageUrls.forEach((url, index) => {
    const img = document.createElement('img');
    img.className = 'manga-page';
    img.alt = `Page ${index + 1}`;
    
    // LAZY LOADING: Load hanya 3 gambar pertama, sisanya lazy
    if (index < 3) {
      img.src = url;
      img.loading = 'eager';
    } else {
      img.setAttribute('data-src', url);
      img.loading = 'lazy';
      
      // Intersection Observer untuk lazy loading
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            lazyImage.src = lazyImage.getAttribute('data-src');
            lazyImage.removeAttribute('data-src');
            obs.unobserve(lazyImage);
          }
        });
      }, {
        rootMargin: '200px'
      });
      
      observer.observe(img);
    }
    
    img.onerror = function() {
      console.error(`Failed to load image: ${url}`);
      this.style.background = '#1a1a1a';
      this.style.minHeight = '600px';
      this.style.display = 'flex';
      this.style.alignItems = 'center';
      this.style.justifyContent = 'center';
      this.alt = `Failed to load page ${index + 1}`;
    };
    
    img.onload = function() {
      loadedImages++;
      console.log(`Loaded ${loadedImages}/${totalPages} images`);
    };
    
    container.appendChild(img);
  });
  
  // Scroll ke atas setelah load chapter baru
  container.scrollTop = 0;
  container.scrollLeft = 0;
  
  if (readMode === 'vertical') {
    container.removeEventListener('scroll', handleWebtoonScroll);
    container.addEventListener('scroll', handleWebtoonScroll);
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
  
  // Deteksi apakah device menggunakan touch
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    // Untuk touch device, hanya gunakan touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
  } else {
    // Untuk non-touch device (desktop), gunakan click events
    container.addEventListener('click', handleContainerClick);
  }
}

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;
let touchStartTime = 0;

function handleContainerClick(e) {
  if (readMode !== 'horizontal') return;
  
  const container = document.getElementById('mangaContainer');
  const containerWidth = container.clientWidth;
  const clickX = e.clientX;
  
  // Area klik: 40% kiri untuk previous, 40% kanan untuk next, 20% tengah tidak ada aksi
  if (clickX < containerWidth * 0.4) {
    scrollToPreviousPage();
  } else if (clickX > containerWidth * 0.6) {
    scrollToNextPage();
  }
}

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
  touchStartTime = Date.now();
}

function handleTouchEnd(e) {
  if (readMode !== 'horizontal') return;
  
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  const touchDuration = Date.now() - touchStartTime;
  
  handleGesture(touchDuration);
}

function handleGesture(duration) {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  // Threshold untuk swipe dan tap
  const SWIPE_THRESHOLD = 50;
  const TAP_THRESHOLD = 10;
  const TAP_DURATION = 200; // ms
  
  // Deteksi TAP (sentuhan singkat tanpa gerakan)
  if (absDeltaX < TAP_THRESHOLD && absDeltaY < TAP_THRESHOLD && duration < TAP_DURATION) {
    handleTap(touchStartX);
    return;
  }
  
  // Deteksi SWIPE (gerakan horizontal yang jelas)
  // Hanya proses jika gerakan lebih horizontal daripada vertical
  if (absDeltaX > absDeltaY && absDeltaX > SWIPE_THRESHOLD) {
    if (deltaX > 0) {
      // Swipe ke kanan = Previous
      scrollToPreviousPage();
    } else {
      // Swipe ke kiri = Next
      scrollToNextPage();
    }
  }
}

function handleTap(tapX) {
  const container = document.getElementById('mangaContainer');
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const relativeX = tapX - containerRect.left;
  
  // Area tap: 40% kiri untuk previous, 40% kanan untuk next, 20% tengah tidak ada aksi
  if (relativeX < containerWidth * 0.4) {
    scrollToPreviousPage();
  } else if (relativeX > containerWidth * 0.6) {
    scrollToNextPage();
  }
}

function handleSwipe() {
  // Hitung delta X dan Y
  const deltaX = Math.abs(touchEndX - touchStartX);
  const deltaY = Math.abs(touchEndY - touchStartY);
  
  // Hanya proses jika gerakan lebih horizontal daripada vertical
  // Dan minimal swipe 50px
  if (deltaX > deltaY && deltaX > 50) {
    if (touchEndX > touchStartX) {
      // Swipe ke kanan = Previous
      scrollToPreviousPage();
    } else {
      // Swipe ke kiri = Next
      scrollToNextPage();
    }
  }
}

function scrollToNextPage() {
  // Gunakan currentPage untuk tracking
  const currentVisibleIndex = currentPage - 1;
  
  // Pindah ke halaman berikutnya
  if (currentVisibleIndex < totalPages - 1) {
    const nextIndex = currentVisibleIndex + 1;
    currentPage = nextIndex + 1;
    
    // Update display untuk mode manga
    updateMangaPageDisplay(nextIndex);
    
    updatePageIndicator();
  } else {
    // Sudah di halaman terakhir, pindah ke chapter berikutnya
    nextChapter();
  }
}

function scrollToPreviousPage() {
  // Gunakan currentPage untuk tracking
  const currentVisibleIndex = currentPage - 1;
  
  // Pindah ke halaman sebelumnya
  if (currentVisibleIndex > 0) {
    const prevIndex = currentVisibleIndex - 1;
    currentPage = prevIndex + 1;
    
    // Update display untuk mode manga
    updateMangaPageDisplay(prevIndex);
    
    updatePageIndicator();
  } else {
    // Sudah di halaman pertama, pindah ke chapter sebelumnya
    prevChapter();
  }
}

// ===========================
// UPDATE MANGA PAGE DISPLAY
// ===========================
function updateMangaPageDisplay(pageIndex) {
  const container = document.getElementById('mangaContainer');
  const images = container.querySelectorAll('.manga-page');
  
  // Sembunyikan semua gambar
  images.forEach((img, index) => {
    if (index === pageIndex) {
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
  });
  
  // Reset scroll ke atas
  container.scrollTop = 0;
  container.scrollLeft = 0;
}

// ===========================
// TRACK SCROLL POSITION
// ===========================
let scrollTimeout;
let isAtBottom = false;
let isAtTop = false;

function trackScrollPosition() {
  const container = document.getElementById('mangaContainer');
  const images = container.querySelectorAll('.manga-page');
  const indicator = document.querySelector('.page-indicator');
  
  indicator.classList.remove('hidden');
  
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  
  // Cek jika sudah di bottom (halaman terakhir)
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    currentPage = totalPages;
    updatePageIndicator();
    
    // Auto next chapter jika sudah di bottom
    if (!isAtBottom) {
      isAtBottom = true;
      setTimeout(() => {
        if (isAtBottom && scrollTop + clientHeight >= scrollHeight - 10) {
          nextChapter();
        }
      }, 500);
    }
  } else {
    isAtBottom = false;
  }
  
  // Cek jika sudah di top (halaman pertama)
  if (scrollTop <= 10) {
    currentPage = 1;
    updatePageIndicator();
    
    // Auto previous chapter jika sudah di top dan scroll ke atas
    if (!isAtTop) {
      isAtTop = true;
    }
  } else {
    isAtTop = false;
  }
  
  // Track halaman berdasarkan posisi gambar (untuk halaman tengah)
  if (scrollTop > 10 && scrollTop + clientHeight < scrollHeight - 10) {
    images.forEach((img, index) => {
      const rect = img.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (rect.top >= containerRect.top && rect.top <= containerRect.bottom) {
        currentPage = index + 1;
        updatePageIndicator();
      }
    });
  }
  
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    indicator.classList.add('hidden');
  }, 2000);
}

// Detect scroll up at top for previous chapter
let lastScrollTop = 0;
function handleWebtoonScroll() {
  const container = document.getElementById('mangaContainer');
  const scrollTop = container.scrollTop;
  
  // Detect scroll up
  if (scrollTop < lastScrollTop && scrollTop <= 10) {
    // User scrolling up at top, go to previous chapter
    if (isAtTop) {
      prevChapter();
    }
  }
  
  lastScrollTop = scrollTop;
  trackScrollPosition();
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
    
    container.removeEventListener('scroll', handleWebtoonScroll);
    
    // Tampilkan hanya halaman pertama di mode manga
    updateMangaPageDisplay(0);
    currentPage = 1;
    updatePageIndicator();
    
  } else {
    readMode = 'vertical';
    container.classList.remove('horizontal');
    
    modeBtn.querySelector('.mode-icon').textContent = '⬇';
    modeBtn.querySelector('.mode-text').textContent = 'Webtoon';
    modeBtn2.querySelector('.mode-icon').textContent = '⬇';
    modeBtn2.querySelector('.mode-text').textContent = 'Webtoon';
    
    // Tampilkan semua gambar di mode webtoon
    const images = container.querySelectorAll('.manga-page');
    images.forEach(img => {
      img.style.display = 'block';
    });
    
    container.removeEventListener('scroll', handleWebtoonScroll);
    container.addEventListener('scroll', handleWebtoonScroll);
    
    // Scroll ke atas saat ganti mode
    container.scrollTop = 0;
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
    incrementChapterView(prevChapter.num);
    
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
    incrementChapterView(nextChapter.num);
    
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
      incrementChapterView(chapter.num);
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
      if (readMode === 'horizontal') {
        // Mode manga: navigasi halaman
        handleArrowNavigation('left');
      } else {
        // Mode webtoon: navigasi chapter
        prevChapter();
      }
      break;
    case 'ArrowRight':
      if (readMode === 'horizontal') {
        // Mode manga: navigasi halaman
        handleArrowNavigation('right');
      } else {
        // Mode webtoon: navigasi chapter
        nextChapter();
      }
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
// ARROW NAVIGATION HANDLER
// ===========================
function handleArrowNavigation(direction) {
  const container = document.getElementById('mangaContainer');
  const images = container.querySelectorAll('.manga-page');
  
  // Gunakan currentPage untuk menentukan halaman aktif
  const currentVisibleIndex = currentPage - 1;
  
  if (direction === 'right') {
    // Arrow Right: Next page
    if (currentVisibleIndex < images.length - 1) {
      const nextIndex = currentVisibleIndex + 1;
      currentPage = nextIndex + 1;
      updateMangaPageDisplay(nextIndex);
      updatePageIndicator();
    } else {
      // Sudah di halaman terakhir, pindah ke chapter berikutnya
      nextChapter();
    }
  } else if (direction === 'left') {
    // Arrow Left: Previous page
    if (currentVisibleIndex > 0) {
      const prevIndex = currentVisibleIndex - 1;
      currentPage = prevIndex + 1;
      updateMangaPageDisplay(prevIndex);
      updatePageIndicator();
    } else {
      // Sudah di halaman pertama, pindah ke chapter sebelumnya
      prevChapter();
    }
  }
}

// ===========================
// IMAGE PROTECTION
// ===========================
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  return false;
});

document.addEventListener('dragstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    return false;
  }
});

document.addEventListener('selectstart', function(e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
    return false;
  }
});