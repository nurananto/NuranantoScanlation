// CARA PAKAI:
// Manga yang BARU DIUPDATE â†’ Taruh di PALING ATAS array ini
// Urutan dari atas ke bawah = urutan tampil di website

const mangaList = [
  {
    title: "Uchi no Seiso-kei Iinchou ga Katsute Chuunibyou Idol datta Koto o Ore Dake ga Shitteiru",
    cover: "covers/uchi.png",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9VY2hpJTIwbm8lMjBTZWlzby1rZWklMjBJaW5jaG91JTIwZ2ElMjBLYXRzdXRlJTIwQ2h1dW5pYnlvdSUyMElkb2wlMjBkYXR0YSUyMEtvdG8lMjBvJTIwT3JlJTIwRGFrZSUyMGdhJTIwU2hpdHRlaXJ1Lmpzb24/",
    mangadex: "https://mangadex.org/title/5993c10b-c49e-4771-9a3a-8b8436b12d80/uchi-no-seiso-kei-iinchou-ga-katsute-chuunibyou-idol-datta-koto-o-ore-dake-ga-shitteiru"
  },
  {
    title: "Yarikonda Renai Game no Akuyaku ni Tensei shitanode",
    cover: "covers/yarikonda.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9ZYXJpa29uZGElMjBSZW5haSUyMEdhbWUlMjBubyUyMEFrdXlha3UlMjBuaSUyMFRlbnNlaSUyMHNoaXRhbm9kZSwlMjBHZW5zYWt1JTIwQ2hpc2hpa2klMjBkZSUyMEhlcm9pbmUlMjB3byUyMEtvdXJ5YWt1JTIwc2hpbWFzdS5qc29u/",
    mangadex: "https://mangadex.org/title/a605a5d0-21a6-481f-a055-74735ea4f2c2/yarikonda-renai-game-no-akuyaku-ni-tensei-shitanode-gensaku-chishiki-de-heroine-wo-kouryaku-shimasu"
  },
  {
    title: "Yuumei VTuber no Ani Dakedo, Nazeka Ore ga Yuumei ni Natteita",
    cover: "covers/vtuber.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/read/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9ZdXVtZWklMjBWVHViZXIlMjBubyUyMEFuaSUyMERha2VkbywlMjBOYXpla2ElMjBPcmUlMjBnYSUyMFl1dW1laSUyMG5pJTIwTmF0dGVpdGEuanNvbg/",
    mangadex: "https://mangadex.org/title/9aebe60e-777f-4a58-a3bf-143c3096b94f/yuumei-vtuber-no-ani-dakedo-nazeka-ore-ga-yuumei-ni-natteita"
  },
  {
    title: "Genjitsu mo Tama ni Uso wo Tsuku",
    cover: "covers/genjitsu.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9HZW5qaXRzdSUyMG1vJTIwVGFtYSUyMG5pJTIwVXNvJTIwd28lMjBUc3VrdS5qc29u/",
    mangadex: "https://mangadex.org/title/de9e3b62-eac5-4c0a-917d-ffccad694381/sometimes-even-reality-is-a-lie"
  },
  {
    title: "Suufungo no Mirai ga Wakaru You ni Natta kedo, Onnagokoro wa Wakaranai",
    cover: "covers/suufungo.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9TdXVmdW5nbyUyMG5vJTIwTWlyYWklMjBnYSUyMFdha2FydSUyMFlvdSUyMG5pJTIwTmF0dGElMjBrZWRvLCUyME9ubmFnb2tvcm8lMjB3YSUyMFdha2FyYW5haS5qc29u/",
    mangadex: "https://mangadex.org/title/16c34950-954c-4f0d-808e-d8278a546339/suufungo-no-mirai-ga-wakaru-you-ni-natta-kedo-onnagokoro-wa-wakaranai"
  },
  {
    title: "Kimi no Negai ga Kanau made",
    cover: "covers/kiminonegai.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/",
    mangadex: "https://mangadex.org/title/90d81edd-accb-4c8d-b44c-e38254d77935/kimi-no-negai-ga-kanau-made"
  }
];

function createCard(manga) {
  return `
  <div class="manga-card">
    <img src="${manga.cover}" alt="${manga.title}">
    <div class="overlay">
      <button class="btn-primary" onclick="event.stopPropagation(); window.open('${manga.readFirst}')">Baca duluan</button>
      <button class="btn-secondary" onclick="event.stopPropagation(); window.open('${manga.readNow}')">Mulai Baca</button>
      <button class="btn-mangadex" onclick="event.stopPropagation(); window.open('${manga.mangadex}')">Mangadex</button>
    </div>
    <div class="manga-title">${manga.title}</div>
  </div>`;
}

function renderManga(filteredList = mangaList) {
  const mangaGrid = document.getElementById("mangaGrid");
  mangaGrid.innerHTML = filteredList.map(createCard).join("");
  
  // Tambahkan event listener untuk setiap kartu
  const cards = document.querySelectorAll('.manga-card');
  cards.forEach(card => {
    const overlay = card.querySelector('.overlay');
    
    // Klik pada kartu (cover atau judul) untuk toggle overlay
    card.addEventListener('click', function(e) {
      // Cegah bubbling jika klik pada tombol
      if (e.target.tagName === 'BUTTON') return;
      
      // Cek apakah overlay ini sudah aktif
      const isActive = overlay.classList.contains('active');
      
      // Tutup semua overlay
      document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
      
      // Jika sebelumnya tidak aktif, buka overlay ini
      if (!isActive) {
        overlay.classList.add('active');
      }
    });
  });
}

// Render pertama kali
renderManga();

// Search functionality
document.getElementById("searchInput").addEventListener("keyup", function () {
  const query = this.value.toLowerCase();
  const filtered = mangaList.filter(m => m.title.toLowerCase().includes(query));
  renderManga(filtered);
});