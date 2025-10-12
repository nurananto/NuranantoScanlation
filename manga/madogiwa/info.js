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
// VIEW COUNTER FUNCTIONS
// ===========================

// Load view count untuk semua chapter yang terlihat
function loadAllViewCounts() {
  // Ambil semua chapter items
  const chapterItems = document.querySelectorAll('.chapter-item[data-chapter]:not(.locked)');
  
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
  
  // Redirect ke halaman reader dengan parameter
  window.location.href = `reader.html?manga=${mangaId}&chapter=${encodeURIComponent(chapterNum)}`;
  
  // Alternatif: buka di tab baru
  // window.open(`reader.html?manga=${mangaId}&chapter=${encodeURIComponent(chapterNum)}`, '_blank');
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

// Load semua view counts saat halaman dimuat
window.addEventListener('DOMContentLoaded', function() {
  console.log('Loading view counts...');
  loadAllViewCounts();
});