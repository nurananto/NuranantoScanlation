// ============================================
// MANGA CONFIGURATION - SINGLE SOURCE OF TRUTH
// ============================================
// File ini adalah SATU-SATUNYA tempat untuk manage data manga
// Dipakai oleh: index.html, info-manga.html, reader.html
//
// CARA TAMBAH MANGA BARU:
// 1. Copy salah satu entry di bawah
// 2. Paste di paling atas array MANGA_LIST
// 3. Update semua field (title, cover, repo)
// 4. Save & push - DONE! Otomatis muncul di semua halaman
// ============================================

let MANGA_LIST = [
  {
    id: 'wakachan',
    title: 'Waka-chan wa Kyou mo Azatoi',
    cover: '',
    repo: 'wakachan'
  },
  {
    id: '10nenburi',
    title: '10-Nen Buri ni Saikai shita Kusogaki wa Seijun Bishoujo JK ni Seichou shiteita',
    cover: 'covers/10-nen-buri-ni-saikai-shita-kusogaki-wa-seijun-bis-6d676869-6140-44ed-8210-58264ae612df.jpg',
    repo: '10nenburi'  // ← CORRECT! Sesuai GitHub repo name
  },
  {
    id: 'aiwooshiete',
    title: 'Watashi ni Ai wo Oshiete',
    cover: 'covers/watashi-ni-ai-wo-oshiete-e56a300a-60aa-433e-8589-c8a963f188f8.jpg',
    repo: 'AiwoOshiete'
  },
  {
    id: 'yarikonda',
    title: 'Yarikonda Renai Game no Akuyaku ni Tensei shitanode, Gensaku Chishiki de Heroine wo Kouryaku shimasu',
    cover: 'covers/yarikonda-renai-game-no-akuyaku-ni-tensei-shitanod-eaecd9b5-0510-46aa-b65c-a09611fa912b.jpg',
    repo: 'YarikondaRenaiGame'
  },
  {
    id: 'amarichan',
    title: 'Kanojo ni Shitai Joshi Ichii, no Tonari de Mitsuketa Amari-chan',
    cover: 'covers/kanojo-ni-shitai-joshi-ichii-no-tonari-de-mitsuket-6ffed041-aa59-49e2-b79f-dac40ac0ef53.jpg',
    repo: 'Amarichan'
  },
  {
    id: 'sankakukei',
    title: 'Seishun wa Sankakukei no Loop',
    cover: 'covers/seishun-wa-sankakukei-no-loop-4cf5a0cc-9123-43bd-bf54-c5f8c0aa9e16.jpg',
    repo: 'SankakukeinoLoop'
  },
  {
    id: 'madogiwa',
    title: 'Madogiwa Henshuu to Baka ni Sareta Ore ga, Futago JK to Doukyo suru Koto ni Natta',
    cover: 'covers/madogiwa-henshuu-to-baka-ni-sareta-ore-ga-futago-j-ce74d132-81f0-491a-bb19-83de73746c8e.jpg',
    repo: 'MadogiwaHenshuu'
  },
  {
    id: 'tensai',
    title: 'Tensai Bishoujo Sanshimai wa Isourou ni Dake Choro Kawaii',
    cover: 'covers/tensai-bishoujo-sanshimai-wa-isourou-ni-dake-choro-3964fb0f-aa43-492f-a693-a83b70e35371.jpg',
    repo: 'TensaiBishoujo'
  },
  {
    id: 'suufungo',
    title: 'Suufungo no Mirai ga Wakaru You ni Natta kedo, Onnagokoro wa Wakaranai.',
    cover: 'covers/suufungo-no-mirai-ga-wakaru-you-ni-natta-kedo-onna-b681b78e-75ce-4464-8089-50f37f00e0e9.jpg',
    repo: 'SuufungonoMirai'
  },
  {
    id: 'negatte',
    title: 'Negatte mo Nai Tsuihou Go kara no Slow Life? ~Intai Shita Hazu ga Nariyuki de Bishoujo Gal no Shishou ni Nattara Naze ka Mechakucha Natsukareta~',
    cover: 'covers/negatte-mo-nai-tsuihou-go-kara-no-slow-life-intai--dee7c542-0efd-4e72-8df1-5d71a2b08c6d.jpg',
    repo: 'NegattemoNai'
  },
  {
    id: 'midari',
    title: 'Midari ni Tsukasete wa Narimasen',
    cover: 'covers/midari-ni-tsukasete-wa-narimasen-d86648a6-77d3-4a95-a8d2-b296da206065.jpg',
    repo: 'Midari'
  },
  {
    id: 'kiminonegai',
    title: 'Kimi no Negai ga Kanau made',
    cover: 'covers/kimi-no-negai-ga-kanau-made-5c6872ff-e467-44e1-b190-b01c0c1d8857.jpg',
    repo: 'KiminoNegai'
  },
  {
    id: 'vtuber',
    title: 'Yuumei VTuber no Ani Dakedo, Nazeka Ore ga Yuumei ni Natteita',
    cover: 'covers/yuumei-vtuber-no-ani-dakedo-nazeka-ore-ga-yuumei-n-493c315e-5492-4d76-80e9-1f55f9e5849e.jpg',
    repo: 'YuumeiVTuber'
  },
  {
    id: 'uchi',
    title: 'Uchi no Seiso-kei Iinchou ga Katsute Chuunibyou Idol datta Koto o Ore Dake ga Shitteiru.',
    cover: 'covers/uchi-no-seiso-kei-iinchou-ga-katsute-chuunibyou-id-8c348f37-efdc-463c-9b5f-ce3ec9a7bb58.jpg',
    repo: 'UchinoSeiso-kei'
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get manga by ID
function getMangaById(id) {
  return MANGA_LIST.find(manga => manga.id === id);
}

// Get manga by repo name
function getMangaByRepo(repo) {
  return MANGA_LIST.find(manga => manga.repo === repo);
}

// Construct URLs
function getMangaDataURL(manga) {
  return `https://raw.githubusercontent.com/nurananto/${manga.repo}/main/manga.json`;
}

function getChaptersDataURL(manga) {
  return `https://raw.githubusercontent.com/nurananto/${manga.repo}/main/chapters.json`;
}

function getChapterImageURL(manga, chapterFolder, imageName) {
  return `https://raw.githubusercontent.com/nurananto/${manga.repo}/main/${chapterFolder}/${imageName}`;
}

// ============================================
// EXPORTS (untuk compatibility)
// ============================================

// Export untuk script.js (index.html)
const mangaList = MANGA_LIST;

// Export untuk info-manga.js dan reader.js
// NEW FORMAT: Include githubRepo untuk view counter
let MANGA_REPOS = {};
MANGA_LIST.forEach(manga => {
  MANGA_REPOS[manga.id] = {
    url: getMangaDataURL(manga),
    githubRepo: manga.repo  // ← ADD THIS for view counter!
  };
});
