// CARA PAKAI:
// Manga yang BARU DIUPDATE → Taruh di PALING ATAS array ini
// Urutan dari atas ke bawah = urutan tampil di website

const mangaList = [
  {
    title: '10-Nen Buri ni Saikai shita Kusogaki wa Seijun Bishoujo JK ni Seichou shiteita',
    cover: 'covers/10-nen-buri-ni-saikai-shita-kusogaki-wa-seijun-bis-6d676869-6140-44ed-8210-58264ae612df.jpg',
    repo: '10nenburi'
  },
  {
    title: 'Madogiwa Henshuu to Baka ni Sareta Ore ga, Futago JK to Doukyo suru Koto ni Natta',
    cover: 'covers/madogiwa-henshuu-to-baka-ni-sareta-ore-ga-futago-j-ce74d132-81f0-491a-bb19-83de73746c8e.jpg',
    repo: 'madogiwa'
  },
  {
    title: 'Yarikonda Renai Game no Akuyaku ni Tensei shitanode, Gensaku Chishiki de Heroine wo Kouryaku shimasu',
    cover: 'covers/yarikonda-renai-game-no-akuyaku-ni-tensei-shitanod-eaecd9b5-0510-46aa-b65c-a09611fa912b.jpg',
    repo: 'yarikonda'
  }
 ];

function createCard(manga) {
  // Tentukan ukuran font berdasarkan panjang judul
  let titleClass = 'manga-title';
  const titleLength = manga.title.length;
  
  if (titleLength <= 30) {
    titleClass += ' title-large';
  } else if (titleLength <= 60) {
    titleClass += ' title-medium';
  } else if (titleLength <= 90) {
    titleClass += ' title-small';
  } else {
    titleClass += ' title-xsmall';
  }
  
  return `
  <div class="manga-card" onclick="window.location.href='info-manga.html?repo=${manga.repo}'">
    <img src="${manga.cover}" alt="${manga.title}">
    <div class="${titleClass}">${manga.title}</div>
  </div>`;
}

function renderManga(filteredList = mangaList) {
  const mangaGrid = document.getElementById("mangaGrid");
  mangaGrid.innerHTML = filteredList.map(createCard).join("");
}

// Render pertama kali
renderManga();

// Search functionality
document.getElementById("searchInput").addEventListener("keyup", function () {
  const query = this.value.toLowerCase();
  const filtered = mangaList.filter(m => m.title.toLowerCase().includes(query));
  renderManga(filtered);
});