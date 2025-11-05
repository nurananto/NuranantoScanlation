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

function isRecentlyUpdated(lastChapterUpdateStr) {
  if (!lastChapterUpdateStr) return false;

  const lastChapterUpdate = new Date(lastChapterUpdateStr);

  if (!lastChapterUpdate || isNaN(lastChapterUpdate.getTime())) {
    console.warn(`Invalid date format: ${lastChapterUpdateStr}`);
    return false;
  }

  const now = new Date();
  const diffDays = (now - lastChapterUpdate) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    console.warn(`Future date detected: ${lastChapterUpdateStr}`);
    return false;
  }

  return diffDays <= 2;
}

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
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    });
  }
}

function createCard(manga, mangaData) {
  const isRecent = isRecentlyUpdated(mangaData.lastChapterUpdate);
  const relativeTime = getRelativeTime(mangaData.lastChapterUpdate);

  const updatedBadge = isRecent ? `
    <div class="updated-badge">
      <span class="badge-text">UPDATED!</span>
      ${relativeTime ? `<span class="badge-time">${relativeTime}</span>` : ''}
    </div>
  ` : '';

  const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='420' viewBox='0 0 300 420'%3E%3Crect width='300' height='420' fill='%231a1a1a'/%3E%3Cg fill='%23666'%3E%3Cpath d='M150 160c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40zm0 60c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z'/%3E%3Cpath d='M250 120H50c-11.046 0-20 8.954-20 20v160c0 11.046 8.954 20 20 20h200c11.046 0 20-8.954 20-20V140c0-11.046-8.954-20-20-20zm0 180H50V140h200v160z'/%3E%3C/g%3E%3Ctext x='150' y='350' font-family='Arial,sans-serif' font-size='16' fill='%23666' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E`;

  return `
    <div class="manga-card ${isRecent ? 'recently-updated' : ''}" onclick="window.location.href='info-manga.html?repo=${manga.id}'">
      <img src="${manga.cover}" alt="${manga.title}" loading="lazy" onerror="this.src='${placeholderSVG}'">
      ${updatedBadge}
      <div class="manga-title">${manga.title}</div>
    </div>`;
}

async function renderManga(filteredList) {
  const mangaGrid = document.getElementById("mangaGrid");
  const loadingIndicator = document.getElementById("loadingIndicator");

  loadingIndicator.classList.add('show');
  mangaGrid.innerHTML = '';

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

  mangaWithData.sort((a, b) => {
    const dateA = a.lastChapterUpdate ? new Date(a.lastChapterUpdate) : new Date(0);
    const dateB = b.lastChapterUpdate ? new Date(b.lastChapterUpdate) : new Date(0);

    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();

    return timeB - timeA;
  });

  loadingIndicator.classList.remove('show');

  if (mangaWithData.length === 0) {
    mangaGrid.innerHTML = `
      <div class="empty-state">
        <p>Tidak ada manga yang ditemukan</p>
        <p style="font-size: 14px;">Coba kata kunci yang berbeda</p>
      </div>
    `;
    return;
  }

  mangaGrid.innerHTML = mangaWithData.map(({ manga, mangaData }) =>
    createCard(manga, mangaData)
  ).join("");

  console.log('✅ Manga sorted by lastChapterUpdate (newest first)');
}

let searchTimeout;
document.addEventListener('DOMContentLoaded', function() {

  if (typeof mangaList === 'undefined') {
    console.error('❌ ERROR: mangaList not found!');
    console.error('Make sure manga-config.js is loaded before script.js in index.html');
    return;
  }

  console.log('🚀 Initializing manga list...');
  console.log('📚 Total manga:', mangaList.length);
  renderManga(mangaList);

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function() {
    clearTimeout(searchTimeout);
    const query = this.value.toLowerCase().trim();

    searchTimeout = setTimeout(() => {
      if (query === '') {
        renderManga(mangaList);
      } else {
        const filtered = mangaList.filter(manga =>
          manga.title.toLowerCase().includes(query)
        );
        renderManga(filtered);
      }
    }, 300);
  });
});


const DEBUG_MODE = false;

function initProtection() {
    if (DEBUG_MODE) {
        console.log('🔓 Debug mode enabled - protection disabled');
        return;
    }


    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });


    document.addEventListener('keydown', (e) => {
        if (
            e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
            (e.ctrlKey && e.shiftKey && e.keyCode === 74) ||
            (e.ctrlKey && e.keyCode === 85) ||
            (e.ctrlKey && e.keyCode === 83)
        ) {
            e.preventDefault();
            return false;
        }
    });


    document.addEventListener('selectstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });


    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });


    document.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
    });

    console.log('🔒 Protection enabled');
}

initProtection();