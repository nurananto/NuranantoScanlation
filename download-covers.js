/**
 * SCRIPT DOWNLOAD COVER MANGA DARI MANGADEX
 * FITUR: Auto-ambil cover TERBARU & Replace cover lama
 * 
 * Cara Pakai:
 * 1. Jalankan: node download-covers.js
 * 2. Script akan ambil cover TERBARU dari MangaDex
 * 3. Kalau ada cover lebih baru, otomatis replace yang lama
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Config
const DELAY_MS = 1500;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const FORCE_UPDATE = false; // Set true untuk force download ulang semua cover

// Baca script.js
const scriptPath = path.join(__dirname, 'script.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

const mangaListMatch = scriptContent.match(/const mangaList = (\[[\s\S]*?\n\]);/);
if (!mangaListMatch) {
  console.error('❌ Tidak bisa menemukan mangaList di script.js');
  process.exit(1);
}

const mangaList = eval(mangaListMatch[1]);

console.log(`📚 Ditemukan ${mangaList.length} manga dalam list`);
console.log('🔍 Mode: Ambil cover TERBARU dari MangaDex');
console.log('🔄 Cover lama akan di-replace dengan yang lebih baru\n');

// Buat folder covers
const coversDir = path.join(__dirname, 'covers');
if (!fs.existsSync(coversDir)) {
  fs.mkdirSync(coversDir);
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

// FITUR BARU: Ambil cover TERBARU dengan sorting
async function fetchLatestCover(mangaId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.mangadex.org',
      // Sort by createdAt descending untuk ambil yang terbaru
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

// FITUR BARU: Cek apakah cover berbeda (compare filename)
function isCoverDifferent(currentCoverPath, newCoverFilename) {
  if (!fs.existsSync(currentCoverPath)) {
    return true; // Cover tidak ada, pasti beda
  }
  
  // Ambil nama file dari path
  const currentFilename = path.basename(currentCoverPath);
  
  // Jika nama file berbeda, berarti cover beda
  // Format: [sanitized-title]-[hash].jpg
  // Hash MangaDex unik per cover
  return !currentFilename.includes(newCoverFilename.split('.')[0]);
}

// FITUR BARU: Hapus cover lama
function deleteOldCover(coverPath) {
  if (fs.existsSync(coverPath)) {
    fs.unlinkSync(coverPath);
    console.log('  🗑️  Cover lama dihapus');
  }
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

  for (let i = 0; i < mangaList.length; i++) {
    const manga = mangaList[i];
    const mangaId = getMangaIdFromUrl(manga.mangadex);
    
    console.log(`\n[${i + 1}/${mangaList.length}] ${manga.title}`);
    
    if (!mangaId) {
      console.log('  ⚠️  Link MangaDex tidak valid, skip');
      updatedMangaList.push(manga);
      skipCount++;
      continue;
    }

    const sanitizedTitle = sanitizeFilename(manga.title);

    try {
      // Fetch info cover terbaru dari API
      console.log('  🔍 Cek cover terbaru dari MangaDex...');
      const latestCover = await fetchLatestCover(mangaId);
      
      // Ekstrak hash dari filename MangaDex (untuk unique ID)
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
      
      // Hapus cover lama dengan prefix yang sama
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
      
      // Delay
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

  return { updatedMangaList, successCount, skipCount, errorCount, updatedCount };
}

function updateScriptJs(updatedMangaList) {
  let updatedScript = scriptContent;
  
  const mangaListString = 'const mangaList = ' + 
    JSON.stringify(updatedMangaList, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, "'") + ';';
  
  updatedScript = updatedScript.replace(
    /const mangaList = \[[\s\S]*?\n\];/,
    mangaListString
  );
  
  const backupPath = path.join(__dirname, 'script.js.backup');
  fs.copyFileSync(scriptPath, backupPath);
  
  fs.writeFileSync(scriptPath, updatedScript, 'utf-8');
  console.log('\n💾 script.js diupdate!');
}

// Main
(async () => {
  try {
    const { updatedMangaList, successCount, skipCount, errorCount, updatedCount } = await processAllManga();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 HASIL:');
    console.log(`  ✅ Berhasil download: ${successCount}`);
    console.log(`  🔄 Cover diupdate (replaced): ${updatedCount}`);
    console.log(`  ⏭️  Sudah terbaru (skip): ${skipCount}`);
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
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();