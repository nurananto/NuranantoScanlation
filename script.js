const mangaList = [
  {
    title: "Genjitsu mo Tama ni Uso wo Tsuku",
    cover: "https://mangadex.org/covers/de9e3b62-eac5-4c0a-917d-ffccad694381/cb70a9ca-a789-4a9e-b7c1-2038686bd388.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9HZW5qaXRzdSUyMG1vJTIwVGFtYSUyMG5pJTIwVXNvJTIwd28lMjBUc3VrdS5qc29u/",
    mangadex: "https://mangadex.org/title/de9e3b62-eac5-4c0a-917d-ffccad694381"
  },
  {
    title: "Suufungo no Mirai ga Wakaru You ni Natta kedo, Onnagokoro wa Wakaranai",
    cover: "https://mangadex.org/covers/16c34950-954c-4f0d-808e-d8278a546339/b681b78e-75ce-4464-8089-50f37f00e0e9.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9TdXVmdW5nbyUyMG5vJTIwTWlyYWklMjBnYSUyMFdha2FydSUyMFlvdSUyMG5pJTIwTmF0dGElMjBrZWRvLCUyME9ubmFnb2tvcm8lMjB3YSUyMFdha2FyYW5haS5qc29u/",
    mangadex: "https://mangadex.org/title/16c34950-954c-4f0d-808e-d8278a546339"
  },
  {
    title: "Uchi no Seiso-kei Iinchou ga Katsute Chuunibyou Idol datta Koto o Ore Dake ga Shitteiru",
    cover: "https://mangadex.org/covers/5993c10b-c49e-4771-9a3a-8b8436b12d80/1bd09e61-5321-4aa8-8625-e4cb321b7690.png",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9VY2hpJTIwbm8lMjBTZWlzby1rZWklMjBJaW5jaG91JTIwZ2ElMjBLYXRzdXRlJTIwQ2h1dW5pYnlvdSUyMElkb2wlMjBkYXR0YSUyMEtvdG8lMjBvJTIwT3JlJTIwRGFrZSUyMGdhJTIwU2hpdHRlaXJ1Lmpzb24/",
    mangadex: "https://mangadex.org/title/5993c10b-c49e-4771-9a3a-8b8436b12d80"
  },
  {
    title: "Yarikonda Renai Game no Akuyaku ni Tensei shitanode, Gensaku Chishiki de Heroine wo Kouryaku shimasu",
    cover: "https://mangadex.org/covers/a605a5d0-21a6-481f-a055-74735ea4f2c2/eaecd9b5-0510-46aa-b65c-a09611fa912b.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9ZYXJpa29uZGElMjBSZW5haSUyMEdhbWUlMjBubyUyMEFrdXlha3UlMjBuaSUyMFRlbnNlaSUyMHNoaXRhbm9kZSwlMjBHZW5zYWt1JTIwQ2hpc2hpa2klMjBkZSUyMEhlcm9pbmUlMjB3byUyMEtvdXJ5YWt1JTIwc2hpbWFzdS5qc29u/",
    mangadex: "https://mangadex.org/title/a605a5d0-21a6-481f-a055-74735ea4f2c2"
  },
  {
    title: "Kimi no Negai ga Kanau made",
    cover: "https://mangadex.org/covers/90d81edd-accb-4c8d-b44c-e38254d77935/5c6872ff-e467-44e1-b190-b01c0c1d8857.jpg",
    readFirst: "https://trakteer.id/NuranantoScanlation",
    readNow: "https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/",
    mangadex: "https://mangadex.org/title/90d81edd-accb-4c8d-b44c-e38254d77935"
  }
];

function createCard(manga) {
  return `
  <div class="manga-card">
    <img src="${manga.cover}" alt="${manga.title}">
    <div class="overlay">
      <button class="btn-primary" onclick="window.open('${manga.readFirst}')">Baca duluan</button>
      <button class="btn-secondary" onclick="window.open('${manga.readNow}')">Mulai Baca</button>
      <button class="btn-mangadex" onclick="window.open('${manga.mangadex}')">Mangadex</button>
    </div>
    <div class="manga-title">${manga.title}</div>
  </div>`;
}

const mangaGrid = document.getElementById("mangaGrid");
mangaGrid.innerHTML = mangaList.map(createCard).join("");

document.getElementById("searchInput").addEventListener("keyup", function () {
  const query = this.value.toLowerCase();
  mangaGrid.innerHTML = mangaList
    .filter(m => m.title.toLowerCase().includes(query))
    .map(createCard)
    .join("");
});
