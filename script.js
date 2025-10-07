const mangaList = [
  { title: "One Piece", img: "https://via.placeholder.com/300x400?text=One+Piece", link1: "#", link2: "#", updated: "2025-10-06" },
  { title: "Naruto", img: "https://via.placeholder.com/300x400?text=Naruto", link1: "#", link2: "#", updated: "2025-10-07" },
  { title: "Bleach", img: "https://via.placeholder.com/300x400?text=Bleach", link1: "#", link2: "#", updated: "2025-10-05" },
  { title: "Attack on Titan", img: "https://via.placeholder.com/300x400?text=AoT", link1: "#", link2: "#", updated: "2025-10-08" }
];

// Urutkan berdasarkan tanggal update terbaru
mangaList.sort((a, b) => new Date(b.updated) - new Date(a.updated));

const grid = document.getElementById("mangaGrid");

mangaList.forEach(manga => {
  const item = document.createElement("div");
  item.classList.add("manga-item");
  item.innerHTML = `
    <img src="${manga.img}" alt="${manga.title}">
    <div class="overlay">
      <a href="${manga.link1}" class="read-btn">Read A</a>
      <a href="${manga.link2}" class="read-btn">Read B</a>
    </div>
  `;
  item.addEventListener("click", () => {
    item.classList.toggle("active");
  });
  grid.appendChild(item);
});
