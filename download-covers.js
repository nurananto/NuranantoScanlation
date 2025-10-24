/**
 * SCRIPT DOWNLOAD COVER MANGA DARI MANGADEX v3.0
 * FITUR: Auto-ambil cover TERBARU & Replace cover lama
 * 
 * Arsitektur:
 * - script.js berisi: title, cover, repo
 * - manga-repos.json: Shared config untuk repo URLs (SINGLE SOURCE OF TRUTH)
 * - manga.json di setiap repo berisi: mangadex URL + info lengkap
 * 
 * Cara Pakai:
 * 1. Jalankan: node download-covers.js
 * 2. Script akan load manga-repos.json
 * 3. Fetch manga.json dari URL yang sudah di-mapping
 * 4. Ambil cover TERBARU dari MangaDex
 * 5. Replace cover lama dengan yang baru
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Config
const DELAY_MS = 1500;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const FORCE_UPDATE = false;

// Load MANGA_REPOS dari file JSON
const MANGA_REPOS_PATH = path.join(__dirname, 'manga-repos.json');
let MANGA_REPOS = {};

try {
  const reposContent = fs.readFileSync(MANGA_REPOS_PATH, 'utf-8');
  MANGA_REPOS = JSON.parse(reposContent);
  console.log(`📋 Loaded ${Object.keys(MANGA_REPOS).length} repo mappings from manga-repos.json\n`);
} catch (error) {
  console.error('❌ Error loading manga-repos.json:', error.message);
  console.error('\n💡 Pastikan file manga-repos.json ada di folder yang sama dengan script ini');
  process.exit(1);
}

// Baca script.js
const scriptPath = path.join(__dirname, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

// Try multiple patterns to find mangaList
let mangaListMatch = scriptContent.match(/const\s+mangaList\s*=\s*(\[[\s\S]*?\n\s*\]);/);
if (!mangaListMatch) {
  mangaListMatch = scriptContent.match(/let\s+mangaList\s*=\s*(\[[\s\S]*?\n\s*\]);/);
}
if (!mangaListMatch) {
  mangaListMatch = scriptContent.match(/const\s+mangaList\s*=\s*(\[[\s\S]*?\n\s*\])/);
}

if (!mangaListMatch) {
  console.error('❌ Tidak bisa menemukan mangaList di script.js');
  process.exit(1);
}

let mangaList;
try {
  mangaList = eval(mangaListMatch[1]);
} catch (e) {
  console.error('❌ Error parsing mangaList:', e.message);
  process.exit(1);
}

console.log(`📚 Ditemukan ${mangaList.length} manga dalam list`);
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
  let noMappingCount = 0;

  for (let i = 0; i < mangaList.length; i++) {
    const manga = mangaList[i];
    
    console.log(`\n[${i + 1}/${mangaList.length}] ${manga.title}`);
    
    try {
      // Step 1: Get manga.json URL dari mapping
      const mangaJsonUrl = MANGA_REPOS[manga.repo];
      
      if (!mangaJsonUrl) {
        console.log(`  ⚠️  Tidak ada mapping untuk repo: ${manga.repo}`);
        console.log(`  💡 Tambahkan di manga-repos.json: "${manga.repo}": "https://raw.githubusercontent.com/..."`);
        updatedMangaList.push(manga);
        noMappingCount++;
        continue;
      }
      
      // Step 2: Fetch manga.json dari URL
      console.log(`  🔍 Fetch manga.json dari: ${manga.repo}`);
      const mangaJson = await fetchMangaJson(mangaJsonUrl);
      
      // Step 3: Ambil MangaDex URL (support multiple structures)
      let mangadexUrl = null;
      
      // Try different JSON structures
      if (mangaJson.manga && mangaJson.manga.links && mangaJson.manga.links.mangadex) {
        // Structure: { manga: { links: { mangadex: "..." } } }
        mangadexUrl = mangaJson.manga.links.mangadex;
      } else if (mangaJson.links && mangaJson.links.mangadex) {
        // Structure: { links: { mangadex: "..." } }
        mangadexUrl = mangaJson.links.mangadex;
      } else if (mangaJson.mangadex) {
        // Structure: { mangadex: "..." }
        mangadexUrl = mangaJson.mangadex;
      }
      
      if (!mangadexUrl) {
        console.log('  ⚠️  Tidak ada MangaDex URL di manga.json');
        console.log('  💡 Cek struktur JSON - expected: manga.links.mangadex');
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
      if (i < mangaList.length - 1) {
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

  return { updatedMangaList, successCount, skipCount, errorCount, updatedCount, noMappingCount };
}

function updateScriptJs(updatedMangaList) {
  let updatedScript = scriptContent;
  
  // Format mangaList dengan indentasi yang sama seperti aslinya
  const mangaListString = 'const mangaList = \n  ' + 
    JSON.stringify(updatedMangaList, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, "'")
      .split('\n')
      .join('\n  ') + ';';
  
  // Replace mangaList
  updatedScript = updatedScript.replace(
    /const\s+mangaList\s*=\s*\n?\s*\[[\s\S]*?\n\s*\];?/,
    mangaListString
  );
  
  const backupPath = path.join(__dirname, 'script.js.backup');
  fs.copyFileSync(scriptPath, backupPath);
  
  fs.writeFileSync(scriptPath, updatedScript, 'utf-8');
  console.log('\n💾 script.js diupdate!');
  console.log('📦 Backup disimpan: script.js.backup');
}

// Main
(async () => {
  try {
    const { updatedMangaList, successCount, skipCount, errorCount, updatedCount, noMappingCount } = await processAllManga();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 HASIL:');
    console.log(`  ✅ Berhasil download: ${successCount}`);
    console.log(`  🔄 Cover diupdate (replaced): ${updatedCount}`);
    console.log(`  ⭐ Sudah terbaru (skip): ${skipCount}`);
    if (noMappingCount > 0) {
      console.log(`  ⚠️  Tidak ada mapping URL: ${noMappingCount}`);
    }
    console.log(`  ❌ Error: ${errorCount}`);
    console.log(`  📚 Total: ${mangaList.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (successCount > 0 || updatedCount > 0) {
      updateScriptJs(updatedMangaList);
      
      console.log('🎉 Selesai!');
      if (updatedCount > 0) {
        console.log(`   ${updatedCount} cover diupdate ke versi terbaru`);
      }
      if (successCount > 0) {
        console.log(`   ${successCount} cover baru di-download`);
      }
      
      console.log('\n📝 Push ke GitHub:');
      console.log('   git add covers/ script.js');
      console.log('   git commit -m "Update covers to latest version"');
      console.log('   git push\n');
    } else if (noMappingCount > 0) {
      console.log('⚠️  Ada manga tanpa mapping URL');
      console.log('💡 Update manga-repos.json dengan mapping yang hilang');
    } else {
      console.log('✨ Semua cover sudah up-to-date!');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
