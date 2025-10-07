// Script fetches JSON from the GitHub repo root; fallback to local list if fetch fails.
const RAW_JSON = 'https://raw.githubusercontent.com/nurananto/NuranantoCubariMoe/main/manga.json';
const fallback = [
  {
    "title":"Genjitsu mo Tama ni Uso wo Tsuku",
    "cover":"covers/genjitsu.jpg",
    "read1":"https://trakteer.id/NuranantoScanlation",
    "read2":"https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9HZW5qaXRzdSUyMG1vJTIwVGFtYSUyMG5pJTIwVXNvJTIwd28lMjBUc3VrdS5qc29u/",
    "updated":"2025-10-08"
  },
  {
    "title":"Suufungo no Mirai ga Wakaru You ni Natta kedo, Onnagokoro wa Wakaranai",
    "cover":"covers/suufungo.jpg",
    "read1":"https://trakteer.id/NuranantoScanlation",
    "read2":"https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9TdXVmdW5nbyUyMG5vJTIwTWlyYWklMjBnYSUyMFdha2FydSUyMFlvdSUyMG5pJTIwTmF0dGElMjBrZWRvLCUyME9ubmFnb2tvcm8lMjB3YSUyMFdha2FyYW5haS5qc29u/",
    "updated":"2025-10-07"
  },
  {
    "title":"Uchi no Seiso-kei Iinchou ga Katsute Chuunibyou Idol datta Koto o Ore Dake ga Shitteiru",
    "cover":"covers/uchi.png",
    "read1":"https://trakteer.id/NuranantoScanlation",
    "read2":"https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9VY2hpJTIwbm8lMjBTZWlzby1rZWklMjBJaW5jaG91JTIwZ2ElMjBLYXRzdXRlJTIwQ2h1dW5pYnlvdSUyMElkb2wlMjBkYXR0YSUyMEtvdG8lMjBvJTIwT3JlJTIwRGFrZSUyMGdhJTIwU2hpdHRlaXJ1Lmpzb24/",
    "updated":"2025-10-06"
  },
  {
    "title":"Yarikonda Renai Game no Akuyaku ni Tensei shitanode, Gensaku Chishiki de Heroine wo Kouryaku shimasu",
    "cover":"covers/yarikonda.jpg",
    "read1":"https://trakteer.id/NuranantoScanlation",
    "read2":"https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9ZYXJpa29uZGElMjBSZW5haSUyMEdhbWUlMjBubyUyMEFrdXlha3UlMjBuaSUyMFRlbnNlaSUyMHNoaXRhbm9kZSwlMjBHZW5zYWt1JTIwQ2hpc2hpa2klMjBkZSUyMEhlcm9pbmUlMjB3byUyMEtvdXJ5YWt1JTIwc2hpbWFzdS5qc29u/",
    "updated":"2025-10-05"
  },
  {
    "title":"Kimi no Negai ga Kanau made",
    "cover":"covers/kiminonegai.jpg",
    "read1":"https://trakteer.id/NuranantoScanlation",
    "read2":"https://cubari.moe/proxy/gist/cmF3L251cmFuYW50by9OdXJhbmFudG9DdWJhcmlNb2UvbWFpbi9LaW1pJTIwbm8lMjBOZWdhaSUyMGdhJTIwS2FuYXUlMjBtYWRlLmpzb24/",
    "updated":"2025-10-04"
  },
];


function render(list){
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('article');
    card.className = 'manga-item';
    card.innerHTML = `
      <img loading="lazy" src="${item.cover}" alt="${item.title}">
      <div class="overlay" role="group" aria-hidden="true">
        <a class="read-btn" target="_blank" rel="noopener noreferrer" href="${item.read1}">Baca duluan</a>
        <a class="read-btn secondary" target="_blank" rel="noopener noreferrer" href="${item.read2}">Mulai Baca</a>
      </div>
      <div class="title-strip"><strong>${item.title}</strong></div>
    `;
    grid.appendChild(card);
  });
}

// try fetch from GitHub raw json first
fetch(RAW_JSON).then(r=>{
  if(!r.ok) throw new Error('Network response not ok');
  return r.json();
}).then(data=>{
  // expect data to be array; try to map fields
  const list = data.map(d=>{
    return {
      title: d.title || d.name || 'Untitled',
      cover: d.cover || d.image || d.thumb || d.cover_url || '#',
      read1: d.read1 || 'https://trakteer.id/NuranantoScanlation',
      read2: d.read2 || '#',
      updated: d.updated || d.date || d.modified || d.updated_at || '1970-01-01'
    };
  });
  // sort by updated desc
  list.sort((a,b)=> new Date(b.updated) - new Date(a.updated));
  render(list.slice(0,6));
}).catch(err=>{
  console.warn('Fetching remote JSON failed, using fallback', err);
  fallback.sort((a,b)=> new Date(b.updated) - new Date(a.updated));
  render(fallback);
});

// Search functionality
document.addEventListener('input', e=>{
  if(e.target && e.target.id === 'search'){
    const q = e.target.value.trim().toLowerCase();
    const cards = document.querySelectorAll('.manga-item');
    cards.forEach(c=>{
      const title = c.querySelector('.title-strip strong').textContent.toLowerCase();
      c.style.display = title.includes(q) ? '' : 'none';
    });
  }
});
