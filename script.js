// CARA PAKAI:
// Manga yang BARU DIUPDATE → Taruh di PALING ATAS array ini
// Urutan dari atas ke bawah = urutan tampil di website

const mangaList = [
  {
    title: 'Seishun wa Sankakukei no Loop',
    cover: 'covers/seishun-wa-sankakukei-no-loop-4cf5a0cc-9123-43bd-bf54-c5f8c0aa9e16.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/read/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9TZWlzaHVuJTIwd2ElMjBTYW5rYWt1a2VpJTIwbm8lMjBMb29wLmpzb24/',
    mangadex: 'https://mangadex.org/title/e6d70578-d6b2-4c60-a2f4-7ab16e515480/seishun-wa-sankakukei-no-loop',
    raw: 'https://comic-walker.com/detail/KC_006586_S?episodeType=first'
  },
  {
    title: '10-Nen Buri ni Saikai shita Kusogaki wa Seijun Bishoujo JK ni Seichou shiteita',
    cover: 'covers/10-nen-buri-ni-saikai-shita-kusogaki-wa-seijun-bis-6d676869-6140-44ed-8210-58264ae612df.jpg',
    readFirst: 'https://trakteer.id/NuranantoScanlation',
    readNow: 'https://cubari.moe/read/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi8xMC1OZW4lMjBCdXJpJTIwbmklMjBTYWlrYWklMjBzaGl0YSUyMEt1c29nYWtpJTIwd2ElMjBTZWlqdW4lMjBCaXNob3VqbyUyMEpLJTIwbmklMjBTZWljaG91JTIwc2hpdGVpdGEuanNvbg/',
    mangadex: 'https://mangadex.org/title/26854d1a-dfd0-4e5c-b6d1-ab291035b8cc/10-nen-buri-ni-saikai-shita-kusogaki-wa-seijun-bishoujo-jk-ni-seichou-shiteita',
    raw: 'https://comic-gardo.com/episode/2550912965031159065'
  },
  {
    title: 'Uchi no Seiso-kei Iinchou ga Katsute Chuunibyou Idol datta Koto o Ore Dake ga Shitteiru',
    cover: 'covers/uchi-no-seiso-kei-iinchou-ga-katsute-chuunibyou-id-8c348f37-efdc-463c-9b5f-ce3ec9a7bb58.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9VY2hpJTIwbm8lMjBTZWlzby1rZWklMjBJaW5jaG91JTIwZ2ElMjBLYXRzdXRlJTIwQ2h1dW5pYnlvdSUyMElkb2wlMjBkYXR0YSUyMEtvdG8lMjBvJTIwT3JlJTIwRGFrZSUyMGdhJTIwU2hpdHRlaXJ1Lmpzb24/',
    mangadex: 'https://mangadex.org/title/5993c10b-c49e-4771-9a3a-8b8436b12d80/uchi-no-seiso-kei-iinchou-ga-katsute-chuunibyou-idol-datta-koto-o-ore-dake-ga-shitteiru',
    raw: 'https://comic-days.com/episode/2550912965858307088'
  },
  {
    title: 'Yarikonda Renai Game no Akuyaku ni Tensei shitanode, Gensaku Chishiki de Heroine wo Kouryaku shimasu',
    cover: 'covers/yarikonda-renai-game-no-akuyaku-ni-tensei-shitanod-eaecd9b5-0510-46aa-b65c-a09611fa912b.jpg',
    readFirst: 'https://trakteer.id/NuranantoScanlation',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9ZYXJpa29uZGElMjBSZW5haSUyMEdhbWUlMjBubyUyMEFrdXlha3UlMjBuaSUyMFRlbnNlaSUyMHNoaXRhbm9kZSwlMjBHZW5zYWt1JTIwQ2hpc2hpa2klMjBkZSUyMEhlcm9pbmUlMjB3byUyMEtvdXJ5YWt1JTIwc2hpbWFzdS5qc29u/',
    mangadex: 'https://mangadex.org/title/a605a5d0-21a6-481f-a055-74735ea4f2c2/yarikonda-renai-game-no-akuyaku-ni-tensei-shitanode-gensaku-chishiki-de-heroine-wo-kouryaku-shimasu',
    raw: 'https://www.manga-up.com/titles/1518'
  },
  {
    title: 'Yuumei VTuber no Ani Dakedo, Nazeka Ore ga Yuumei ni Natteita',
    cover: 'covers/yuumei-vtuber-no-ani-dakedo-nazeka-ore-ga-yuumei-n-493c315e-5492-4d76-80e9-1f55f9e5849e.jpg',
    readFirst: 'https://trakteer.id/NuranantoScanlation',
    readNow: 'https://cubari.moe/read/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9ZdXVtZWklMjBWVHViZXIlMjBubyUyMEFuaSUyMERha2VkbywlMjBOYXpla2ElMjBPcmUlMjBnYSUyMFl1dW1laSUyMG5pJTIwTmF0dGVpdGEuanNvbg/',
    mangadex: 'https://mangadex.org/title/9aebe60e-777f-4a58-a3bf-143c3096b94f/yuumei-vtuber-no-ani-dakedo-nazeka-ore-ga-yuumei-ni-natteita',
    raw: 'https://www.manga-up.com/titles/1289/chapters/266183'
  },
  {
    title: 'Genjitsu mo Tama ni Uso wo Tsuku',
    cover: 'covers/genjitsu-mo-tama-ni-uso-wo-tsuku-cb70a9ca-a789-4a9e-b7c1-2038686bd388.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9HZW5qaXRzdSUyMG1vJTIwVGFtYSUyMG5pJTIwVXNvJTIwd28lMjBUc3VrdS5qc29u/',
    mangadex: 'https://mangadex.org/title/de9e3b62-eac5-4c0a-917d-ffccad694381/sometimes-even-reality-is-a-lie',
    raw: 'https://www.pixiv.net/user/1035047/series/60488'
  },
  {
    title: 'Suufungo no Mirai ga Wakaru You ni Natta kedo, Onnagokoro wa Wakaranai',
    cover: 'covers/suufungo-no-mirai-ga-wakaru-you-ni-natta-kedo-onna-b681b78e-75ce-4464-8089-50f37f00e0e9.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9TdXVmdW5nbyUyMG5vJTIwTWlyYWklMjBnYSUyMFdha2FydSUyMFlvdSUyMG5pJTIwTmF0dGElMjBrZWRvLCUyME9ubmFnb2tvcm8lMjB3YSUyMFdha2FyYW5haS5qc29u/',
    mangadex: 'https://mangadex.org/title/16c34950-954c-4f0d-808e-d8278a546339/suufungo-no-mirai-ga-wakaru-you-ni-natta-kedo-onnagokoro-wa-wakaranai',
    raw: 'https://comic-walker.com/detail/KC_005690_S?episodeType=first'
  },
  {
    title: 'Kimi no Negai ga Kanau made',
    cover: 'covers/kimi-no-negai-ga-kanau-made-5c6872ff-e467-44e1-b190-b01c0c1d8857.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/90d81edd-accb-4c8d-b44c-e38254d77935/kimi-no-negai-ga-kanau-made',
    raw: 'https://comic-walker.com/detail/KC_006693_S/episodes/KC_0066930000200011_E?episodeType=latest'
  },
  {
    title: 'Class de Ichiban Kawaii Gal wo Ezuke Shiteiru Hanashi',
    cover: 'covers/class-de-ichiban-kawaii-gal-wo-ezuke-shiteiru-hana-644202c9-1458-41db-8de5-b3e550919324.jpg',
    readFirst: 'https://trakteer.id/NuranantoScanlation',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/acfd6902-b39c-4b7d-91a8-9825dda4ede8/class-de-ichiban-kawaii-gal-wo-ezuke-shiteiru-hanashi',
    raw: 'https://www.manga-up.com/titles/1540'
  },
  {
    title: 'Watashi ni Ai wo Oshiete',
    cover: 'covers/watashi-ni-ai-wo-oshiete-e56a300a-60aa-433e-8589-c8a963f188f8.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/c14b2a85-ca88-4bf7-8937-87baf95491c0/watashi-ni-ai-wo-oshiete',
    raw: 'https://championcross.jp/episodes/312e96c6d46e6/'
  },
  {
    title: 'Kanojo ni Shitai Joshi Ichii, no Tonari de Mitsuketa Amari-chan',
    cover: 'covers/kanojo-ni-shitai-joshi-ichii-no-tonari-de-mitsuket-6ffed041-aa59-49e2-b79f-dac40ac0ef53.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/624d6ceb-768d-40a7-8412-84e083afbdb1/kanojo-ni-shitai-joshi-ichii-no-tonari-de-mitsuketa-amari-chan',
    raw: 'https://comic-walker.com/detail/KC_006262_S?episodeType=first'
  },
  {
    title: 'Tensai Bishoujo Sanshimai wa Isourou ni Dake Choro Kawaii',
    cover: 'covers/tensai-bishoujo-sanshimai-wa-isourou-ni-dake-choro-3964fb0f-aa43-492f-a693-a83b70e35371.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/ee1eb629-79c9-410f-927c-dd7a4cd1d87b/tensai-bishoujo-sanshimai-wa-isourou-ni-dake-choro-kawaii',
    raw: 'https://comic-walker.com/detail/KC_006969_S/episodes/KC_0069690000200011_E?episodeType=first'
  },
  {
    title: 'Negatte mo Nai Tsuihou Go kara no Slow Life? ~Intai Shita Hazu ga Nariyuki de Bishoujo Gal no Shishou ni Nattara Naze ka Mechakucha Natsukareta~',
    cover: 'covers/negatte-mo-nai-tsuihou-go-kara-no-slow-life-intai--dee7c542-0efd-4e72-8df1-5d71a2b08c6d.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/748d2aab-cea8-4ffb-89b3-e716872cb027/negatte-mo-nai-tsuihou-go-kara-no-slow-life-intai-shita-hazu-ga-nariyuki-de-bishoujo-gal-no-shishou',
    raw: 'https://comic-walker.com/detail/KC_006563_S?episodeType=first'
  },
  {
    title: 'Midari ni Tsukasete wa Narimasen',
    cover: 'covers/midari-ni-tsukasete-wa-narimasen-d86648a6-77d3-4a95-a8d2-b296da206065.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/3076dc1f-e6f2-418c-baa9-125694eb36cc/midari-ni-tsukasete-wa-narimasen',
    raw: 'https://comic-walker.com/detail/KC_006109_S?episodeType=first'
  },
  {
    title: 'Madogiwa Henshuu to Baka ni Sareta Ore ga, Futago JK to Doukyo suru Koto ni Natta',
    cover: 'covers/madogiwa-henshuu-to-baka-ni-sareta-ore-ga-futago-j-ce74d132-81f0-491a-bb19-83de73746c8e.jpg',
    readFirst: '',
    readNow: 'https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/',
    mangadex: 'https://mangadex.org/title/a0ecce48-aa4c-48e6-8d9b-90f322a5687a/madogiwa-henshuu-to-baka-ni-sareta-ore-ga-futago-jk-to-doukyo-suru-koto-ni-natta',
    raw: 'https://comic-walker.com/detail/KC_006388_S?episodeType=first'
  }
];

function createCard(manga) {
  // Cek apakah ada link "Baca Duluan" (readFirst)
  const readFirstButton = manga.readFirst 
    ? `<button class="btn-primary" onclick="event.stopPropagation(); window.open('${manga.readFirst}')">Baca Duluan</button>`
    : '';
  
  // Cek apakah ada link "Raw" - FITUR BARU!
  const rawButton = manga.raw 
    ? `<button class="btn-raw" onclick="event.stopPropagation(); window.open('${manga.raw}')">Raw</button>`
    : '';
  
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
  <div class="manga-card">
    <div class="overlay">
      ${readFirstButton}
      <button class="btn-secondary" onclick="event.stopPropagation(); window.open('${manga.readNow}')">Mulai Baca</button>
      <button class="btn-mangadex" onclick="event.stopPropagation(); window.open('${manga.mangadex}')">Mangadex</button>
      ${rawButton}
    </div>
    <img src="${manga.cover}" alt="${manga.title}">
    <div class="${titleClass}">${manga.title}</div>
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