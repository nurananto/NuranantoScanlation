function getWIBTimestamp() {
    const date = new Date();
    const wibStr = date.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
    return wibStr + '+07:00';
}

function convertToWIB(isoString) {
    if (!isoString) return null;
    const date = new Date(isoString);
    const wibStr = date.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T');
    return wibStr + '+07:00';
}


const TRAKTEER_LINK = 'https://trakteer.id/NuranantoScanlation';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZ0-VeyloQxjvh-h65G0wtfAzxVq6VYzU5Bz9n1Rl0T4GAkGu9X7HmGh_3_0cJhCS1iA/exec';

let mangaData = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadMangaFromRepo();
    setupShowDetailsButton();


    trackPageView();
});


function getMangaJsonUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');

    if (!repoParam) {
        console.error('❌ Parameter "repo" tidak ditemukan di URL');
        alert('Error: Parameter repo tidak ditemukan.\n\nContoh: info-manga.html?repo=10nenburi');
        return null;
    }

    const mangaConfig = MANGA_REPOS[repoParam];

    if (!mangaConfig) {
        console.error(`❌ Repo "${repoParam}" tidak ditemukan di mapping`);
        alert(`Error: Repo "${repoParam}" tidak terdaftar.\n\nRepo tersedia: ${Object.keys(MANGA_REPOS).join(', ')}`);
        return null;
    }

    console.log(`📚 Loading manga: ${repoParam}`);


    if (typeof mangaConfig === 'string') {
        return mangaConfig;
    } else {

        window.currentGithubRepo = mangaConfig.githubRepo;
        return mangaConfig.url;
    }
}


async function loadMangaFromRepo() {
    try {
        const mangaJsonUrl = getMangaJsonUrl();
        if (!mangaJsonUrl) return;


        const timestamp = new Date().getTime();
        const response = await fetch(`${mangaJsonUrl}?t=${timestamp}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        mangaData = await response.json();

        console.log('📦 Raw manga data:', mangaData);


        displayMangaInfo();


        displayChapters();


        setupReadFirstButton();


        fetchMangaDexRating();


        document.title = `${mangaData.manga.title} - Info`;

        console.log('✅ Manga data loaded from repo (WIB timezone)');

    } catch (error) {
        console.error('❌ Error loading manga data:', error);
        alert('Gagal memuat data manga dari repository. Cek console untuk detail.');
    }
}


function displayMangaInfo() {
    const manga = mangaData.manga;


    const mainTitle = document.getElementById('mainTitle');
    const subtitle = document.getElementById('subtitle');
    mainTitle.textContent = manga.title;
    subtitle.textContent = manga.alternativeTitle || '';


    adjustTitleSize(mainTitle, manga.title);
    adjustTitleSize(subtitle, manga.alternativeTitle, true);


    const mainTitleMobile = document.getElementById('mainTitleMobile');
    const subtitleMobile = document.getElementById('subtitleMobile');
    mainTitleMobile.textContent = manga.title;
    subtitleMobile.textContent = manga.alternativeTitle || '';

    adjustTitleSize(mainTitleMobile, manga.title);
    adjustTitleSize(subtitleMobile, manga.alternativeTitle, true);


    const coverImg = document.getElementById('mangaCover');
    coverImg.src = manga.cover;
    coverImg.onerror = function() {
        console.error('❌ Failed to load cover:', manga.cover);
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450"%3E%3Crect width="300" height="450" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3ENo Cover%3C/text%3E%3C/svg%3E';
    };


    document.getElementById('viewsCount').textContent = manga.views || 0;
    document.getElementById('viewsCountMobile').textContent = manga.views || 0;


    document.getElementById('descriptionContent').textContent = manga.description;


    const synopsisMobile = document.getElementById('synopsisMobile');
    if (synopsisMobile) {
        synopsisMobile.textContent = manga.description;
    }


    document.getElementById('authorName').textContent = manga.author;
    document.getElementById('artistName').textContent = manga.artist;


    displayGenres(manga.genre);


    setupButtons(manga.links);
}


function adjustTitleSize(element, text, isSubtitle = false) {
    if (!element || !text) return;

    const length = text.length;

    if (isSubtitle) {

        if (length > 80) {
            element.classList.add('long-subtitle');
        }
    } else {

        if (length > 50) {
            element.classList.add('long-title');
        }
    }
}


function displayGenres(genres) {
    const genreList = document.getElementById('genreList');
    genreList.innerHTML = '';

    if (!genres || genres.length === 0) {
        genreList.innerHTML = '<span class="genre-tag">Unknown</span>';
        return;
    }

    genres.forEach(genre => {
        const tag = document.createElement('span');
        tag.className = 'genre-tag';
        tag.textContent = genre;
        genreList.appendChild(tag);
    });
}


function displayChapters() {
    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = '';


    const chaptersArray = Object.values(mangaData.chapters);


    chaptersArray.sort((a, b) => {
        const numA = parseFloat(a.folder);
        const numB = parseFloat(b.folder);
        return numB - numA;
    });


    const initialLimit = getInitialChapterLimit();

    chaptersArray.forEach((chapter, index) => {
        const chapterElement = createChapterElement(chapter);


        if (index >= initialLimit) {
            chapterElement.classList.add('chapter-hidden');
        }

        chapterList.appendChild(chapterElement);
    });


    if (chaptersArray.length > initialLimit) {
        const showMoreBtn = createShowMoreButton(chaptersArray.length - initialLimit);
        chapterList.appendChild(showMoreBtn);
    }

    console.log(`✅ Loaded ${chaptersArray.length} chapters`);
}


function createChapterElement(chapter) {
    const div = document.createElement('div');
    div.className = 'chapter-item';


    if (chapter.locked) {
        div.classList.add('chapter-locked');
        div.onclick = () => trackLockedChapterView(chapter);
    } else {
        div.onclick = () => openChapter(chapter);
    }

    const lockIcon = chapter.locked ? '🔒 ' : '';

    div.innerHTML = `
        <div class="chapter-info">
            <div class="chapter-title-text">${lockIcon}${chapter.title}</div>
        </div>
        <div class="chapter-views">
            <span>👁️ ${chapter.views}</span>
        </div>
    `;

    return div;
}


function openTrakteer() {
    window.open(TRAKTEER_LINK, '_blank');
}


async function trackLockedChapterView(chapter) {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const repoParam = urlParams.get('repo');

        if (!repoParam) {
            console.error('❌ Repo parameter not found');
            openTrakteer();
            return;
        }

        console.log('🔒 Locked chapter clicked:', chapter.folder);
        console.log('📊 Tracking view for locked chapter...');


        const githubRepo = window.currentGithubRepo || repoParam;

        incrementPendingChapterViews(githubRepo, chapter.folder).catch(err => {
            console.error('⚠️ Failed to track locked chapter view:', err);
        });

        alert('Chapter ini terkunci. Silakan donasi untuk membuka chapter ini!');
        openTrakteer();

    } catch (error) {
        console.error('❌ Error tracking locked chapter:', error);
        openTrakteer();
    }
}


async function incrementPendingChapterViews(repo, chapter) {
    try {
        console.log('📡 Sending chapter view increment to Google Apps Script (WIB)...');

        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                repo: repo,
                chapter: chapter,
                type: 'chapter',
                timestamp: getWIBTimestamp()
            }),
            mode: 'no-cors'
        });

        console.log('✅ Chapter view increment request sent (no-cors mode, WIB)');

    } catch (error) {
        console.error('❌ Error incrementing chapter views:', error);
        throw error;
    }
}


function openChapter(chapter) {

    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get('repo');

    if (!repoParam) {
        console.error('❌ Repo parameter not found');
        alert('Error: Parameter repo tidak ditemukan.');
        return;
    }

    console.log('📖 Opening chapter:', chapter.folder, 'from repo:', repoParam);


    window.location.href = `reader.html?repo=${repoParam}&chapter=${chapter.folder}`;
}


function getInitialChapterLimit() {
    const width = window.innerWidth;

    if (width <= 480) return 2;
    else if (width <= 768) return 4;
    else if (width <= 1024) return 7;
    else return 10;
}


function createShowMoreButton(hiddenCount) {
    const btn = document.createElement('button');
    btn.className = 'btn-show-more';
    btn.innerHTML = `Show More (${hiddenCount} chapters)`;

    btn.onclick = () => {
        const hiddenChapters = document.querySelectorAll('.chapter-hidden');
        hiddenChapters.forEach(ch => {
            ch.classList.remove('chapter-hidden');
            ch.classList.add('chapter-show');
        });
        btn.remove();
    };

    return btn;
}


function setupButtons(links) {
    const btnMangadex = document.getElementById('btnMangadex');
    const btnRaw = document.getElementById('btnRaw');


    if (btnMangadex) {
        btnMangadex.onclick = () => {
            if (links && links.mangadex) {
                window.open(links.mangadex, '_blank');
            } else {
                alert('Link Mangadex tidak tersedia');
            }
        };
    }


    if (btnRaw) {
        btnRaw.onclick = () => {
            if (links && links.raw) {
                window.open(links.raw, '_blank');
            } else {
                alert('Link Raw tidak tersedia');
            }
        };
    }
}


function setupShowDetailsButton() {
    const btn = document.getElementById('btnShowDetails');
    const container = document.getElementById('detailsContainer');
    const btnText = document.getElementById('detailsButtonText');

    if (!btn || !container) return;

    let isShown = false;

    btn.onclick = () => {
        isShown = !isShown;

        if (isShown) {
            container.classList.add('show');
            btnText.textContent = 'Hide Details';
        } else {
            container.classList.remove('show');
            btnText.textContent = 'Show Details';
        }
    };
}


async function trackPageView() {
    try {

        const urlParams = new URLSearchParams(window.location.search);
        const repoParam = urlParams.get('repo');

        if (!repoParam) {
            console.log('⚠️ No repo parameter, skipping view tracking');
            return;
        }


        const viewKey = `viewed_${repoParam}`;
        const hasViewed = sessionStorage.getItem(viewKey);

        if (hasViewed) {
            console.log('📊 Already counted in this session');
            return;
        }

        console.log('📤 Tracking page view for:', repoParam);


        const githubRepo = window.currentGithubRepo || repoParam;


        await incrementPendingViews(githubRepo);


        sessionStorage.setItem(viewKey, 'true');

        console.log('✅ View tracked successfully (WIB)');

    } catch (error) {
        console.error('❌ Error tracking view:', error);

    }
}


async function incrementPendingViews(repo) {
    try {
        console.log('📡 Sending view increment to Google Apps Script (WIB)...');


        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
                repo: repo,
                type: 'page',
                timestamp: getWIBTimestamp()
            }),
            mode: 'no-cors'
        });

        console.log('✅ View increment request sent (no-cors mode, WIB)');

    } catch (error) {
        console.error('❌ Error incrementing views:', error);
    }
}


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



async function fetchMangaDexRating() {
    try {
        const mangadexUrl = mangaData.manga.links?.mangadex;

        if (!mangadexUrl) {
            console.log('⚠️ MangaDex URL tidak tersedia');
            return;
        }


        const mangaIdMatch = mangadexUrl.match(/\/title\/([a-f0-9-]+)/);

        if (!mangaIdMatch) {
            console.error('❌ Tidak bisa extract MangaDex ID dari URL');
            return;
        }

        const mangaId = mangaIdMatch[1];




        const cachedRating = localStorage.getItem(`rating_${mangaId}`);
        const cachedTime = localStorage.getItem(`rating_time_${mangaId}`);

        if (cachedRating && cachedTime) {
            const cacheAge = Date.now() - parseInt(cachedTime);
            const cacheAgeHours = Math.floor(cacheAge / 3600000);
            const CACHE_DURATION = 48 * 3600000;

            if (cacheAge < CACHE_DURATION) {
                console.log(`📦 Using cached rating: ${cachedRating} (${cacheAgeHours} hours old, valid for ${48 - cacheAgeHours} more hours)`);


                const ratingScoreDesktop = document.getElementById('ratingScore');
                if (ratingScoreDesktop) {
                    ratingScoreDesktop.textContent = cachedRating;
                }

                const ratingScoreMobile = document.getElementById('ratingScoreMobile');
                if (ratingScoreMobile) {
                    ratingScoreMobile.textContent = cachedRating;
                }

                return;
            } else {
                console.log(`🔄 Cache expired (${cacheAgeHours} hours old), fetching fresh data...`);
            }
        }




        console.log(`📊 Fetching rating untuk manga ID: ${mangaId}`);

        const apiUrl = `https://api.mangadex.org/statistics/manga/${mangaId}`;


        const proxies = [
            {
                name: 'GoogleAppsScript',
                url: 'https://script.google.com/macros/s/AKfycbwZ0-VeyloQxjvh-h65G0wtfAzxVq6VYzU5Bz9n1Rl0T4GAkGu9X7HmGh_3_0cJhCS1iA/exec?action=getRating&mangaId=',
                isGAS: true
            }
        ];

        let rating = null;
        let successProxy = null;


        for (const proxy of proxies) {
            try {
                console.log(`🔄 Trying ${proxy.name}...`);

                let fetchUrl;
                if (proxy.isGAS) {

                    fetchUrl = proxy.url + mangaId;
                } else {

                    fetchUrl = proxy.url + encodeURIComponent(apiUrl);
                }

                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    },

                    signal: AbortSignal.timeout(5000)
                });

                if (!response.ok) {
                    console.warn(`⚠️ ${proxy.name} returned ${response.status}`);
                    continue;
                }

                const data = await response.json();


                if (proxy.isGAS) {
                    if (data.success && data.rating) {
                        rating = data.rating;
                        successProxy = proxy.name;
                        console.log(`✅ Success via ${proxy.name}!`);
                        break;
                    }
                } else {

                    rating = data.statistics?.[mangaId]?.rating?.average;
                    if (rating) {
                        successProxy = proxy.name;
                        console.log(`✅ Success via ${proxy.name}!`);
                        break;
                    }
                }

            } catch (error) {
                console.warn(`⚠️ ${proxy.name} failed:`, error.message);
                continue;
            }
        }


        if (rating) {
            const roundedRating = rating.toFixed(1);


            localStorage.setItem(`rating_${mangaId}`, roundedRating);
            localStorage.setItem(`rating_time_${mangaId}`, Date.now());


            const ratingScoreDesktop = document.getElementById('ratingScore');
            if (ratingScoreDesktop) {
                ratingScoreDesktop.textContent = roundedRating;
            }


            const ratingScoreMobile = document.getElementById('ratingScoreMobile');
            if (ratingScoreMobile) {
                ratingScoreMobile.textContent = roundedRating;
            }

            console.log(`⭐ Rating MangaDex: ${roundedRating}/10 (via ${successProxy})`);
        } else {
            console.warn('⚠️ Semua proxy gagal, rating tidak tersedia');


            const cachedRating = localStorage.getItem(`rating_${mangaId}`);
            const cachedTime = localStorage.getItem(`rating_time_${mangaId}`);

            if (cachedRating) {
                const cacheAge = Math.floor((Date.now() - parseInt(cachedTime)) / 86400000);
                console.log(`📦 Using cached rating: ${cachedRating} (${cacheAge} days old)`);


                const ratingScoreDesktop = document.getElementById('ratingScore');
                if (ratingScoreDesktop) {
                    ratingScoreDesktop.textContent = cachedRating;
                }

                const ratingScoreMobile = document.getElementById('ratingScoreMobile');
                if (ratingScoreMobile) {
                    ratingScoreMobile.textContent = cachedRating;
                }
            } else {

                console.warn('⚠️ No cache available, showing "-"');

                const ratingScoreDesktop = document.getElementById('ratingScore');
                if (ratingScoreDesktop) {
                    ratingScoreDesktop.textContent = '-';
                }

                const ratingScoreMobile = document.getElementById('ratingScoreMobile');
                if (ratingScoreMobile) {
                    ratingScoreMobile.textContent = '-';
                }
            }
        }

    } catch (error) {
        console.error('❌ Error fetching MangaDex rating:', error);
    }
}

function setupReadFirstButton() {
    const btnReadFirstOutside = document.getElementById('btnReadFirstOutside');
    const btnReadFirstInside = document.getElementById('btnReadFirstInside');

    if (!btnReadFirstOutside && !btnReadFirstInside) {
        console.warn('⚠️ Read First buttons not found');
        return;
    }


    function getFirstUnlockedChapter() {
        if (!mangaData || !mangaData.chapters) {
            console.error('❌ Manga data not loaded');
            return null;
        }


        const chaptersArray = Object.values(mangaData.chapters);


        chaptersArray.sort((a, b) => {
            const numA = parseFloat(a.folder);
            const numB = parseFloat(b.folder);
            return numA - numB;
        });


        const firstUnlocked = chaptersArray.find(ch => !ch.locked);

        if (!firstUnlocked) {
            console.warn('⚠️ All chapters are locked');
            return null;
        }

        return firstUnlocked;
    }


    function handleReadFirstClick() {
        const firstChapter = getFirstUnlockedChapter();

        if (!firstChapter) {
            alert('Tidak ada chapter yang tersedia. Semua chapter terkunci.');
            openTrakteer();
            return;
        }

        console.log('🎬 Opening first chapter:', firstChapter.folder);
        openChapter(firstChapter);
    }


    if (btnReadFirstOutside) {
        btnReadFirstOutside.onclick = handleReadFirstClick;
    }
    if (btnReadFirstInside) {
        btnReadFirstInside.onclick = handleReadFirstClick;
    }

    console.log('✅ Read First buttons initialized');
}