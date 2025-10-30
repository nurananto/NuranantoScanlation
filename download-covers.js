/**
 * SCRIPT DOWNLOAD COVER MANGA DARI MANGADEX v4.0
 * FITUR: Auto-ambil cover TERBARU & Replace cover lama
 * 
 * Update v4.0:
 * - Load dari manga-config.js (TIDAK PERLU manga-repos.json lagi!)
 * - Auto-generate MANGA_REPOS dari MANGA_LIST
 * 
 * Cara Pakai:
 * 1. Jalankan: node download-covers.js
 * 2. Script akan load manga-config.js
 * 3. Fetch manga.json dari URL yang di-generate
 * 4. Ambil cover TERBARU dari MangaDex
 * 5. Replace cover lama dengan yang baru
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const vm = require('vm');

// Config
const DELAY_MS = 1500;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const FORCE_UPDATE = false;

// Load manga-config.js
const MANGA_CONFIG_PATH = path.join(__dirname, 'manga-config.js');
let MANGA_LIST = [];
let MANGA_REPOS = {};

try {
  console.log('📋 Loading manga-config.js...');
  
  // Read manga-config.js
  const configContent = fs.readFileSync(MANGA_CONFIG_PATH, 'utf-8');
  
  // Create sandbox untuk execute manga-config.js
  const sandbox = {
    console: console,
    MANGA_LIST: null,
    MANGA_REPOS: null
  };
  
  // Execute manga-config.js dalam sandbox
  vm.createContext(sandbox);
  vm.runInContext(configContent, sandbox);
  
  // Extract MANGA_LIST dan MANGA_REPOS
  MANGA_LIST = sandbox.MANGA_LIST;
  MANGA_REPOS = sandbox.MANGA_REPOS;
  
  if (!MANGA_LIST || MANGA_LIST.length === 0) {
    throw new Error('MANGA_LIST is empty or undefined');
  }
  
  if (!MANGA_REPOS || Object.keys(MANGA_REPOS).length === 0) {
    throw new Error('MANGA_REPOS is empty or undefined');
  }
  
  console.log(`✅ Loaded ${MANGA_LIST.length} manga from manga-config.js`);
  console.log(`✅ Generated ${Object.keys(MANGA_REPOS).length} repo mappings\n`);
  
} catch (error) {
  console.error('❌ Error loading manga-config.js:', error.message);
  console.error('\n💡 Pastikan manga-config.js ada dan format nya benar');
  process.exit(1);
}

console.log('🔍 Mode: Fetch manga.json → Ambil cover TERBARU dari MangaDex');
console.log('🔄 Cover lama akan di-replace dengan yang lebih baru\n');

// Buat folder covers
const coversDir = path.join(__dirname, 'covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir);
}

// Fetch manga.json dari URL
function fetchMangaJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      
      if (res.statusCode === 404) {
        reject(new Error('manga.json tidak ditemukan'));
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function getMangaIdFromUrl(url) {
  const match = url.match(/\/title\/([a-f0-9-]+)/);
  return match ? match[1] : null;
}

function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const options = {
      headers: { 'User-Agent': USER_AGENT }
    };
    
    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return https.get(response.headers.location, options, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function fetchLatestCover(mangaId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mangadex.org',
      path: `/cover?manga[]=${mangaId}&limit=1&order[createdAt]=desc`,
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      if (res.statusCode === 429) {
        reject(new Error('Rate limit exceeded'));
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          
          if (!json.data || json.data.length === 0) {
            reject(new Error('Cover tidak ditemukan'));
            return;
          }
          
          const coverData = json.data[0];
          const coverFilename = coverData.attributes.fileName;
          const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFilename}`;
          const createdAt = coverData.attributes.createdAt;
          
          resolve({ 
            url: coverUrl, 
            filename: coverFilename,
            createdAt: createdAt 
          });
          
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processAllManga() {
  const updatedMangaList = [];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < MANGA_LIST.length; i++) {
    const manga = MANGA_LIST[i];
    
    console.log(`\n[${i + 1}/${MANGA_LIST.length}] ${manga.title}`);
    
    try {
      // Step 1: Get manga.json URL dari MANGA_REPOS
      const mangaConfig = MANGA_REPOS[manga.id];
      
      if (!mangaConfig) {
        console.log(`  ⚠️  Tidak ada config untuk: ${manga.id}`);
        updatedMangaList.push(manga);
        errorCount++;
        continue;
      }
      
      // Extract URL from config (support both string and object format)
      const mangaJsonUrl = typeof mangaConfig === 'string' ? mangaConfig : mangaConfig.url;
      
      // Step 2: Fetch manga.json dari URL
      console.log(`  🔍 Fetch manga.json...`);
      const mangaJson = await fetchMangaJson(mangaJsonUrl);
      
      // Step 3: Ambil MangaDex URL (support multiple structures)
      let mangadexUrl = null;
      
      if (mangaJson.manga && mangaJson.manga.links && mangaJson.manga.links.mangadex) {
        mangadexUrl = mangaJson.manga.links.mangadex;
      } else if (mangaJson.links && mangaJson.links.mangadex) {
        mangadexUrl = mangaJson.links.mangadex;
      } else if (mangaJson.mangadex) {
        mangadexUrl = mangaJson.mangadex;
      }
      
      if (!mangadexUrl) {
        console.log('  ⚠️  Tidak ada MangaDex URL di manga.json');
        updatedMangaList.push(manga);
        skipCount++;
        continue;
      }
      
      const mangaId = getMangaIdFromUrl(mangadexUrl);
      if (!mangaId) {
        console.log('  ⚠️  MangaDex URL tidak valid');
        updatedMangaList.push(manga);
        skipCount++;
        continue;
      }

      const sanitizedTitle = sanitizeFilename(manga.title);

      // Step 4: Fetch cover terbaru dari MangaDex
      console.log('  🔍 Cek cover terbaru dari MangaDex...');
      const latestCover = await fetchLatestCover(mangaId);
      
      // Step 5: Process cover
      const coverHash = latestCover.filename.split('.')[0];
      const newCoverFilename = `${sanitizedTitle}-${coverHash}.jpg`;
      const newCoverPath = path.join(coversDir, newCoverFilename);
      
      // Cek apakah sudah punya cover dengan hash yang sama
      const existingCovers = fs.readdirSync(coversDir)
        .filter(f => f.startsWith(sanitizedTitle) && f.endsWith('.jpg'));
      
      const alreadyHasLatest = existingCovers.some(f => f.includes(coverHash));
      
      if (alreadyHasLatest && !FORCE_UPDATE) {
        console.log(`  ✅ Sudah punya cover terbaru`);
        manga.cover = `covers/${newCoverFilename}`;
        updatedMangaList.push(manga);
        skipCount++;
        continue;
      }
      
      // Download cover baru
      console.log('  📥 Downloading cover terbaru...');
      await downloadFile(latestCover.url, newCoverPath);
      
      // Hapus cover lama
      if (existingCovers.length > 0) {
        console.log('  🔄 Mengganti cover lama dengan yang baru...');
        existingCovers.forEach(oldCover => {
          const oldCoverPath = path.join(coversDir, oldCover);
          if (oldCoverPath !== newCoverPath) {
            fs.unlinkSync(oldCoverPath);
            console.log(`  🗑️  Dihapus: ${oldCover}`);
          }
        });
        updatedCount++;
      }
      
      console.log(`  ✅ Berhasil: covers/${newCoverFilename}`);
      console.log(`  📅 Upload: ${new Date(latestCover.createdAt).toLocaleDateString()}`);
      
      // Update path cover
      manga.cover = `covers/${newCoverFilename}`;
      updatedMangaList.push(manga);
      successCount++;
      
      // Delay untuk rate limiting
      if (i < MANGA_LIST.length - 1) {
        await delay(DELAY_MS);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      
      if (error.message.includes('Rate limit')) {
        console.log('  ⏸️  Tunggu 30 detik...');
        await delay(30000);
        i--; // Retry
        continue;
      }
      
      // Tetap pakai cover lama kalau ada
      if (manga.cover) {
        console.log('  ℹ️  Pakai cover lama');
      }
      
      updatedMangaList.push(manga);
      errorCount++;
    }
  }

  return { updatedMangaList, successCount, skipCount, errorCount, updatedCount };
}

function updateMangaConfigJs(updatedMangaList) {
  const configContent = fs.readFileSync(MANGA_CONFIG_PATH, 'utf-8');
  
  // Find MANGA_LIST array in file
  const listStart = configContent.indexOf('const MANGA_LIST = [');
  const listEnd = configContent.indexOf('];', listStart) + 2;
  
  if (listStart === -1 || listEnd === -1) {
    throw new Error('Could not find MANGA_LIST in manga-config.js');
  }
  
  // Build new MANGA_LIST string
  const newMangaListStr = 'const MANGA_LIST = [\n' +
    updatedMangaList.map(manga => {
      return `  {\n` +
        `    id: '${manga.id}',\n` +
        `    title: '${manga.title.replace(/'/g, "\\'")}',\n` +
        `    cover: '${manga.cover}',\n` +
        `    repo: '${manga.repo}'\n` +
        `  }`;
    }).join(',\n') +
    '\n];';
  
  // Replace MANGA_LIST
  const before = configContent.substring(0, listStart);
  const after = configContent.substring(listEnd);
  const newContent = before + newMangaListStr + after;
  
  // Backup
  const backupPath = path.join(__dirname, 'manga-config.js.backup');
  fs.copyFileSync(MANGA_CONFIG_PATH, backupPath);
  
  // Write
  fs.writeFileSync(MANGA_CONFIG_PATH, newContent, 'utf-8');
  console.log('\n💾 manga-config.js diupdate!');
  console.log('📦 Backup disimpan: manga-config.js.backup');
}

// Main
(async () => {
  try {
    const { updatedMangaList, successCount, skipCount, errorCount, updatedCount } = await processAllManga();
    
    console.log('\n╔════════════════════════════════════╗');
    console.log('📊 HASIL:');
    console.log(`  ✅ Berhasil download: ${successCount}`);
    console.log(`  🔄 Cover diupdate (replaced): ${updatedCount}`);
    console.log(`  ⭐ Sudah terbaru (skip): ${skipCount}`);
    console.log(`  ❌ Error: ${errorCount}`);
    console.log(`  📚 Total: ${MANGA_LIST.length}`);
    console.log('╚════════════════════════════════════╝\n');
    
    if (successCount > 0 || updatedCount > 0) {
      updateMangaConfigJs(updatedMangaList);
      
      console.log('🎉 Selesai!');
      if (updatedCount > 0) {
        console.log(`   ${updatedCount} cover diupdate ke versi terbaru`);
      }
      if (successCount > 0) {
        console.log(`   ${successCount} cover baru di-download`);
      }
      
      console.log('\n📝 Push ke GitHub:');
      console.log('   git add covers/ manga-config.js');
      console.log('   git commit -m "Update covers to latest version"');
      console.log('   git push\n');
    } else {
      console.log('✨ Semua cover sudah up-to-date!');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();