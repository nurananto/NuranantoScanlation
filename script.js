// ============================================
// SCRIPT.JS - MAIN PAGE (index.html)
// ============================================
// MANGA_LIST sudah di-export dari manga-config.js
// File ini TIDAK perlu define mangaList lagi!

// mangaList di-import dari manga-config.js
// (manga-config.js sudah di-load di index.html sebelum script.js)

// ============================================
// FETCH DATA FUNCTIONS
// ============================================

// Fungsi untuk mengambil manga.json dari repository GitHub
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

// ============================================
// HELPER FUNCTIONS
// ============================================

// Fungsi untuk cek apakah manga diupdate dalam 1 hari terakhir
function isRecentlyUpdated(lastChapterUpdateStr) {
  if (!lastChapterUpdateStr) return false;
  
  const lastChapterUpdate = new Date(lastChapterUpdateStr);
  
  // Validasi: Cek apakah date valid
  if (isNaN(lastChapterUpdate.getTime())) {
    console.warn(`Invalid date format: ${lastChapterUpdateStr}`);
    return false;
  }
  
  const now = new Date();
  const diffDays = (now - lastChapterUpdate) / (1000 * 60 * 60 * 24);
  
  // Validasi: Cek apakah date tidak di masa depan
  if (diffDays < 0) {
    console.warn(`Future date detected: ${lastChapterUpdateStr}`);
    return false;
  }
  
  return diffDays <= 1; // Update dalam 1 hari terakhir (24 jam)
}

// Fungsi untuk format tanggal relatif
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
      year: 'numeric' 
    });
  }
}

// ============================================
// CARD CREATION WITH UPDATE BADGE
// ============================================

function createCard(manga, mangaData) {
  const isRecent = isRecentlyUpdated(mangaData.lastChapterUpdate);
  const relativeTime = getRelativeTime(mangaData.lastChapterUpdate);
  
  // Badge "UPDATED" untuk manga yang baru diupdate
  const updatedBadge = isRecent ? `
    <div class="updated-badge">
      <span class="badge-text">UPDATED</span>
      ${relativeTime ? `<span class="badge-time">${relativeTime}</span>` : ''}
    </div>
  ` : '';
  
  // SVG placeholder inline (tidak perlu file eksternal)
  const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='420' viewBox='0 0 300 420'%3E%3Crect width='300' height='420' fill='%231a1a1a'/%3E%3Cg fill='%23666'%3E%3Cpath d='M150 160c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40zm0 60c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z'/%3E%3Cpath d='M250 120H50c-11.046 0-20 8.954-20 20v160c0 11.046 8.954 20 20 20h200c11.046 0 20-8.954 20-20V140c0-11.046-8.954-20-20-20zm0 180H50V140h200v160z'/%3E%3C/g%3E%3Ctext x='150' y='350' font-family='Arial,sans-serif' font-size='16' fill='%23666' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;
  
  return `
    <div class="manga-card ${isRecent ? 'recently-updated' : ''}" onclick="window.location.href='info-manga.html?repo=${manga.id}'">
      <img src="${manga.cover}" alt="${manga.title}" loading="lazy" onerror="this.src='${placeholderSVG}'">
      ${updatedBadge}
      <div class="manga-title">${manga.title}</div>
    </div>`;
}

// ============================================
// RENDER FUNCTIONS WITH AUTO-SORTING
// ============================================

async function renderManga(filteredList = mangaList) {
  const mangaGrid = document.getElementById("mangaGrid");
  const loadingIndicator = document.getElementById("loadingIndicator");
  
  // Tampilkan loading
  loadingIndicator.classList.add('show');
  mangaGrid.innerHTML = '';
  
  // Fetch data manga.json secara paralel
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
  
  // AUTO-SORTING: Urutkan berdasarkan lastChapterUpdate (terbaru di atas)
  mangaWithData.sort((a, b) => {
    const dateA = a.lastChapterUpdate ? new Date(a.lastChapterUpdate) : new Date(0);
    const dateB = b.lastChapterUpdate ? new Date(b.lastChapterUpdate) : new Date(0);
    
    // Validasi: Handle invalid dates
    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
    
    return timeB - timeA; // Descending (terbaru dulu)
  });
  
  // Sembunyikan loading
  loadingIndicator.classList.remove('show');
  
  // Render cards
  if (mangaWithData.length === 0) {
    mangaGrid.innerHTML = `
      <div class="empty-state">
        <p>Tidak ada manga yang ditemukan</p>
        <p style="font-size: 14px;">Coba kata kunci yang berbeda</p>
      </div>
    `;
    return;
  }
  
  // Render semua cards
  mangaGrid.innerHTML = mangaWithData.map(({ manga, mangaData }) => 
    createCard(manga, mangaData)
  ).join("");
  
  console.log('✅ Manga sorted by lastChapterUpdate (newest first)');
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

let searchTimeout;
document.addEventListener('DOMContentLoaded', function() {
  // Verify mangaList is loaded from manga-config.js
  if (typeof mangaList === 'undefined') {
    console.error('❌ ERROR: mangaList not found!');
    console.error('Make sure manga-config.js is loaded before script.js in index.html');
    return;
  }
  
  // Initial render
  console.log('🚀 Initializing manga list with auto-sorting...');
  console.log('📚 Total manga:', mangaList.length);
  renderManga();
  
  // Search functionality
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function() {
    clearTimeout(searchTimeout);
    const query = this.value.toLowerCase().trim();
    
    searchTimeout = setTimeout(() => {
      if (query === '') {
        renderManga();
      } else {
        const filtered = mangaList.filter(manga => 
          manga.title.toLowerCase().includes(query)
        );
        renderManga(filtered);
      }
    }, 300); // Debounce 300ms
  });
});
