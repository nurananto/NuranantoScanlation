// DAFTAR MANGA - Cukup define repo saja, sorting otomatis!
const mangaList = [
  {
    title: 'Class de Ichiban Kawaii Gal o Ezuke Shiteiru Hanashi',
    cover: 'covers/class-de-ichiban-kawaii-gal-o-ezuke-shiteiru-hanas-057c4259-5fef-4db3-aef5-a805c7f096c2.jpg',
    repo: 'kawaiigal'
  },
  {
    title: '10-Nen Buri ni Saikai shita Kusogaki wa Seijun Bishoujo JK ni Seichou shiteita',
    cover: 'covers/10-nen-buri-ni-saikai-shita-kusogaki-wa-seijun-bis-6d676869-6140-44ed-8210-58264ae612df.jpg',
    repo: '10nenburi'
  },
  {
    title: 'Watashi ni Ai wo Oshiete',
    cover: 'covers/watashi-ni-ai-wo-oshiete-e56a300a-60aa-433e-8589-c8a963f188f8.jpg',
    repo: 'aiwooshiete'
  },
  {
    title: 'Yarikonda Renai Game no Akuyaku ni Tensei shitanode, Gensaku Chishiki de Heroine wo Kouryaku shimasu',
    cover: 'covers/yarikonda-renai-game-no-akuyaku-ni-tensei-shitanod-eaecd9b5-0510-46aa-b65c-a09611fa912b.jpg',
    repo: 'yarikonda'
  },
  {
    title: 'Kanojo ni Shitai Joshi Ichii, no Tonari de Mitsuketa Amari-chan',
    cover: 'covers/kanojo-ni-shitai-joshi-ichii-no-tonari-de-mitsuket-6ffed041-aa59-49e2-b79f-dac40ac0ef53.jpg',
    repo: 'amarichan'
  },
  {
    title: 'Seishun wa Sankakukei no Loop',
    cover: 'covers/seishun-wa-sankakukei-no-loop-4cf5a0cc-9123-43bd-bf54-c5f8c0aa9e16.jpg',
    repo: 'sankakukei'
  },
  {
    title: 'Madogiwa Henshuu to Baka ni Sareta Ore ga, Futago JK to Doukyo suru Koto ni Natta',
    cover: 'covers/madogiwa-henshuu-to-baka-ni-sareta-ore-ga-futago-j-ce74d132-81f0-491a-bb19-83de73746c8e.jpg',
    repo: 'madogiwa'
  },
  {
    title: 'Tensai Bishoujo Sanshimai wa Isourou ni Dake Choro Kawaii',
    cover: 'covers/tensai-bishoujo-sanshimai-wa-isourou-ni-dake-choro-3964fb0f-aa43-492f-a693-a83b70e35371.jpg',
    repo: 'tensai'
  },
  {
    title: 'Suufungo no Mirai ga Wakaru You ni Natta kedo, Onnagokoro wa Wakaranai.',
    cover: 'covers/suufungo-no-mirai-ga-wakaru-you-ni-natta-kedo-onna-b681b78e-75ce-4464-8089-50f37f00e0e9.jpg',
    repo: 'suufungo'
  },
  {
    title: 'Negatte mo Nai Tsuihou Go kara no Slow Life? ~Intai Shita Hazu ga Nariyuki de Bishoujo Gal no Shishou ni Nattara Naze ka Mechakucha Natsukareta~',
    cover: 'covers/negatte-mo-nai-tsuihou-go-kara-no-slow-life-intai--dee7c542-0efd-4e72-8df1-5d71a2b08c6d.jpg',
    repo: 'negatte'
  },
  {
    title: 'Midari ni Tsukasete wa Narimasen',
    cover: 'covers/midari-ni-tsukasete-wa-narimasen-d86648a6-77d3-4a95-a8d2-b296da206065.jpg',
    repo: 'midari'
  },
  {
    title: 'Kimi no Negai ga Kanau made',
    cover: 'covers/kimi-no-negai-ga-kanau-made-5c6872ff-e467-44e1-b190-b01c0c1d8857.jpg',
    repo: 'kiminonegai'
  },
  {
    title: 'Yuumei VTuber no Ani Dakedo, Nazeka Ore ga Yuumei ni Natteita',
    cover: 'covers/yuumei-vtuber-no-ani-dakedo-nazeka-ore-ga-yuumei-n-493c315e-5492-4d76-80e9-1f55f9e5849e.jpg',
    repo: 'vtuber'
  },
  {
    title: 'Uchi no Seiso-kei Iinchou ga Katsute Chuunibyou Idol datta Koto o Ore Dake ga Shitteiru.',
    cover: 'covers/uchi-no-seiso-kei-iinchou-ga-katsute-chuunibyou-id-8c348f37-efdc-463c-9b5f-ce3ec9a7bb58.jpg',
    repo: 'uchi'
  }
];

// ============================================
// FETCH DATA FUNCTIONS
// ============================================

// Fungsi untuk mengambil manga.json dari repository
async function fetchMangaData(repo) {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/nurananto/${repo}/main/manga.json`);
    if (!response.ok) throw new Error('Failed to fetch manga data');
    const data = await response.json();
    return {
      lastUpdated: data.lastUpdated || null,
      lastChapterUpdate: data.lastChapterUpdate || data.lastUpdated || null,  // ← FIELD BARU!
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

// Fungsi untuk mengambil chapters.json dari repository
async function fetchChapters(repo) {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/nurananto/${repo}/main/chapters.json`);
    if (!response.ok) throw new Error('Failed to fetch chapters');
    const data = await response.json();
    return data.chapters || [];
  } catch (error) {
    console.error(`Error fetching chapters for ${repo}:`, error);
    return [];
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
// CARD CREATION
// ============================================

// Fungsi untuk membuat HTML card manga
function createMangaCard(manga, chapters, mangaData) {
  // Ambil 3 chapter terbaru
  const recentChapters = chapters.slice(0, 3);
  
  // Cek apakah recently updated (dalam 7 hari) - PAKAI lastChapterUpdate!
  const isRecent = isRecentlyUpdated(mangaData.lastChapterUpdate);
  const relativeTime = getRelativeTime(mangaData.lastChapterUpdate);
  
  // Buat HTML untuk chapter list
  const chaptersHTML = recentChapters.map(chapter => `
    <div class="chapter-item">
      <div class="chapter-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="chapter-title">${chapter.title}</div>
    </div>
  `).join('');

  // Badge "UPDATED" untuk manga yang baru diupdate CHAPTER-nya
  const updatedBadge = isRecent ? `
    <div class="updated-badge">
      <span class="badge-text">UPDATED</span>
      ${relativeTime ? `<span class="badge-time">${relativeTime}</span>` : ''}
    </div>
  ` : '';

  return `
    <div class="manga-card ${isRecent ? 'recently-updated' : ''}" onclick="window.location.href='info-manga.html?repo=${manga.repo}'">
      <div class="manga-cover-section">
        <img src="${manga.cover}" alt="${manga.title}" class="manga-cover-image" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22450%22%3E%3Crect width=%22300%22 height=%22450%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2216%22 font-family=%22Arial%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        ${updatedBadge}
      </div>
      <div class="manga-info-section">
        <div class="manga-title-container">
          <div class="manga-title-text">${manga.title}</div>
        </div>
        <div class="manga-chapters-list">
          ${chaptersHTML || '<div class="chapter-item"><div class="chapter-title">Tidak ada chapter</div></div>'}
        </div>
      </div>
    </div>
  `;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

// Fungsi untuk render semua manga dengan auto-sorting
async function renderMangaList(filteredList = mangaList) {
  const container = document.getElementById('mangaListContainer');
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  // Tampilkan loading
  loadingIndicator.classList.add('show');
  container.innerHTML = '';
  
  // Fetch data manga.json dan chapters.json secara paralel
  const mangaWithData = await Promise.all(
    filteredList.map(async (manga) => {
      const [mangaData, chapters] = await Promise.all([
        fetchMangaData(manga.repo),
        fetchChapters(manga.repo)
      ]);
      return { 
        manga, 
        chapters, 
        mangaData,
        lastChapterUpdate: mangaData.lastChapterUpdate  // ← Pakai lastChapterUpdate!
      };
    })
  );
  
  // SORTING: Urutkan berdasarkan lastChapterUpdate (terbaru di atas)
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
    container.innerHTML = `
      <div class="empty-state">
        <p>Tidak ada manga yang ditemukan</p>
        <p style="font-size: 14px;">Coba kata kunci yang berbeda</p>
      </div>
    `;
    return;
  }
  
  mangaWithData.forEach(({ manga, chapters, mangaData }) => {
    container.innerHTML += createMangaCard(manga, chapters, mangaData);
  });
  
  console.log('✅ Manga sorted by lastChapterUpdate (newest first)');
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

let searchTimeout;
document.getElementById('searchInput').addEventListener('input', function() {
  clearTimeout(searchTimeout);
  const query = this.value.toLowerCase().trim();
  
  searchTimeout = setTimeout(() => {
    if (query === '') {
      renderMangaList();
    } else {
      const filtered = mangaList.filter(manga => 
        manga.title.toLowerCase().includes(query)
      );
      renderMangaList(filtered);
    }
  }, 300); // Debounce 300ms
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing manga list with auto-sorting...');
  renderMangaList();
});
