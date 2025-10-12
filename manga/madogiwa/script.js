// count-pages.js - Auto Update reader.js & Generate chapters.json
// Letakkan file ini di folder repo manga (yang ada folder chapter: 1, 2, 3, dll)
// Requirement: Node.js 14+

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ===========================
// KONFIGURASI - EDIT SESUAI STRUKTUR PROJECT ANDA
// ===========================

// Current directory (folder tempat script ini berada - biasanya folder repo)
const REPO_PATH = __dirname;

// Path ke file-file target (relatif dari folder ini)
// Sesuaikan jika struktur folder Anda berbeda
const READER_JS_PATH = path.join(REPO_PATH, '..', '..', 'reader.js');
const CHAPTERS_JSON_PATH = path.join(REPO_PATH, '..', '..', 'chapters.json');
const LOCKED_CHAPTERS_JSON_PATH = path.join(REPO_PATH, '..', '..', 'locked-chapters.json');

// Nama manga untuk chapters.json
const MANGA_NAME = "Your Manga Title Here";

// ===========================
// HELPER FUNCTIONS
// ===========================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function countImagesInFolder(folderPath) {
  try {
    if (!fs.existsSync(folderPath)) {
      return { success: false, error: 'Folder tidak ditemukan' };
    }

    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    return { 
      success: true, 
      count: imageFiles.length,
      files: imageFiles.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
      })
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getAllFolders() {
  try {
    const items = fs.readdirSync(REPO_PATH);
    const folders = items.filter(item => {
      const itemPath = path.join(REPO_PATH, item);
      const isDir = fs.statSync(itemPath).isDirectory();
      const isChapterFolder = /^(\d+\.?\d*)$/.test(item); // Match: 1, 2.1, 3.2, etc
      return isDir && isChapterFolder;
    });
    
    // Sort folders: numbers first, then decimals
    return folders.sort((a, b) => {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB;
    });
  } catch (err) {
    console.error('❌ Error membaca folder:', err.message);
    return [];
  }
}

function generateChaptersData(results) {
  const successResults = results.filter(r => r.success);
  
  return successResults.map(r => ({
    num: r.folder,
    title: `Chapter ${r.folder}`,
    pages: r.count,
    folder: r.folder,
    locked: false
  }));
}

function loadLockedChapters() {
  try {
    if (fs.existsSync(LOCKED_CHAPTERS_JSON_PATH)) {
      const data = JSON.parse(fs.readFileSync(LOCKED_CHAPTERS_JSON_PATH, 'utf8'));
      return data.lockedChapters || [];
    }
  } catch (err) {
    console.error('Error loading locked chapters:', err.message);
  }
  return [];
}

function saveLockedChapters(lockedChapters) {
  try {
    const data = {
      updated: new Date().toISOString(),
      lockedChapters: lockedChapters
    };
    
    fs.writeFileSync(LOCKED_CHAPTERS_JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving locked chapters:', err.message);
    return false;
  }
}

function updateChaptersJSON(chaptersData) {
  try {
    // Load locked chapters
    const lockedChapters = loadLockedChapters();
    
    // Hapus locked chapters yang sudah ada folder-nya (auto-unlock)
    const existingFolders = chaptersData.map(ch => ch.num);
    const stillLocked = lockedChapters.filter(locked => !existingFolders.includes(locked.num));
    
    if (stillLocked.length < lockedChapters.length) {
      const unlockedCount = lockedChapters.length - stillLocked.length;
      console.log(`🔓 ${unlockedCount} chapter otomatis unlock (folder sudah ada)`);
      saveLockedChapters(stillLocked);
    }
    
    // Merge real chapters + locked chapters
    const allChapters = [
      ...chaptersData,
      ...stillLocked.map(locked => ({
        ...locked,
        locked: true
      }))
    ];
    
    // Sort by chapter number
    allChapters.sort((a, b) => {
      const numA = parseFloat(a.num) || 0;
      const numB = parseFloat(b.num) || 0;
      return numA - numB;
    });
    
    const json = {
      updated: new Date().toISOString(),
      manga: MANGA_NAME,
      totalChapters: allChapters.length,
      realChapters: chaptersData.length,
      lockedChapters: stillLocked.length,
      chapters: allChapters
    };

    // Backup if exists
    if (fs.existsSync(CHAPTERS_JSON_PATH)) {
      const backupPath = CHAPTERS_JSON_PATH + '.backup';
      fs.copyFileSync(CHAPTERS_JSON_PATH, backupPath);
      console.log(`💾 Backup JSON: ${path.basename(backupPath)}`);
    }

    fs.writeFileSync(CHAPTERS_JSON_PATH, JSON.stringify(json, null, 2), 'utf8');
    console.log(`✅ chapters.json berhasil dibuat/diupdate!`);
    console.log(`📍 Location: ${CHAPTERS_JSON_PATH}`);
    console.log(`📊 Total: ${json.totalChapters} chapters (${json.realChapters} real, ${json.lockedChapters} locked)`);
    
    return true;
  } catch (err) {
    console.error('❌ Error updating chapters.json:', err.message);
    return false;
  }
}

function updateReaderJS(chaptersData) {
  try {
    // Check if reader.js exists
    if (!fs.existsSync(READER_JS_PATH)) {
      console.log(`\n❌ File reader.js tidak ditemukan!`);
      console.log(`📍 Path: ${READER_JS_PATH}\n`);
      console.log('💡 Sesuaikan READER_JS_PATH di line 12 file ini.\n');
      return false;
    }

    // Read current reader.js
    let content = fs.readFileSync(READER_JS_PATH, 'utf8');

    // Generate new chapters array code
    const newChaptersCode = `const chapters = [\n${
      chaptersData.map(ch => 
        `  { num: "${ch.num}", title: "${ch.title}", pages: ${ch.pages}, folder: "${ch.folder}" }`
      ).join(',\n')
    }\n];`;

    // Find and replace the chapters array
    const regex = /const chapters = \[[\s\S]*?\];/;
    
    if (!regex.test(content)) {
      console.log('\n❌ Tidak menemukan "const chapters = [...]" di reader.js!');
      console.log('💡 Pastikan format array chapters sudah benar.\n');
      return false;
    }

    content = content.replace(regex, newChaptersCode);

    // Backup original file
    const backupPath = READER_JS_PATH + '.backup';
    fs.copyFileSync(READER_JS_PATH, backupPath);
    console.log(`\n💾 Backup dibuat: ${path.basename(backupPath)}`);

    // Write updated content
    fs.writeFileSync(READER_JS_PATH, content, 'utf8');
    
    return true;
  } catch (err) {
    console.error('\n❌ Error updating reader.js:', err.message);
    return false;
  }
}

function displayResults(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 HASIL PERHITUNGAN');
  console.log('='.repeat(60) + '\n');

  let totalPages = 0;

  results.forEach(result => {
    if (result.success) {
      console.log(`✅ Chapter ${result.folder}: ${result.count} halaman`);
      totalPages += result.count;
    } else {
      console.log(`❌ Chapter ${result.folder}: ${result.error}`);
    }
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`📚 Total: ${results.length} chapter, ${totalPages} halaman`);
  console.log('-'.repeat(60));
}

// ===========================
// LOCKED CHAPTERS MANAGEMENT
// ===========================

async function manageLockedChapters() {
  console.log('\n🔒 Manage Locked Chapters\n');
  
  const lockedChapters = loadLockedChapters();
  const existingFolders = getAllFolders();
  
  console.log('Status saat ini:');
  console.log(`  📂 Folder tersedia: ${existingFolders.length}`);
  console.log(`  🔒 Locked chapters: ${lockedChapters.length}\n`);
  
  if (lockedChapters.length > 0) {
    console.log('Locked chapters yang ada:\n');
    lockedChapters.forEach((locked, i) => {
      const hasFolder = existingFolders.includes(locked.num);
      const status = hasFolder ? '✅ Sudah ada folder (akan auto-unlock)' : '🔒 Masih locked';
      console.log(`  ${i + 1}. Chapter ${locked.num} - ${status}`);
    });
    console.log('');
  }
  
  console.log('Pilih aksi:\n');
  console.log('  1. Tambah locked chapter baru');
  console.log('  2. Hapus locked chapter');
  console.log('  3. Edit locked chapter');
  console.log('  4. Lihat semua locked chapters');
  console.log('  5. Kembali\n');
  
  const choice = await question('Pilihan (1-5): ');
  
  switch (choice) {
    case '1':
      await addLockedChapter();
      break;
    case '2':
      await removeLockedChapter();
      break;
    case '3':
      await editLockedChapter();
      break;
    case '4':
      await viewLockedChapters();
      break;
    case '5':
      return;
  }
}

async function addLockedChapter() {
  console.log('\n➕ Tambah Locked Chapter\n');
  
  const chapterNum = await question('Nomor chapter (contoh: 5 atau 5.1): ');
  
  if (!chapterNum.trim()) {
    console.log('❌ Nomor chapter tidak boleh kosong!\n');
    return;
  }
  
  const lockedChapters = loadLockedChapters();
  
  // Check if already exists
  if (lockedChapters.find(ch => ch.num === chapterNum)) {
    console.log(`❌ Chapter ${chapterNum} sudah ada di locked list!\n`);
    return;
  }
  
  // Check if folder exists
  const existingFolders = getAllFolders();
  if (existingFolders.includes(chapterNum)) {
    console.log(`❌ Folder ${chapterNum} sudah ada! Tidak perlu di-lock.\n`);
    return;
  }
  
  const title = await question(`Judul (default: "Chapter ${chapterNum}"): `);
  const releaseDate = await question('Release date (default: Coming Soon): ');
  const supportLink = await question('Support link (default: https://your-support-page.com): ');
  
  const newLocked = {
    num: chapterNum,
    title: title.trim() || `Chapter ${chapterNum}`,
    pages: 0,
    folder: chapterNum,
    locked: true,
    releaseDate: releaseDate.trim() || 'Coming Soon',
    supportLink: supportLink.trim() || 'https://your-support-page.com'
  };
  
  lockedChapters.push(newLocked);
  
  // Sort
  lockedChapters.sort((a, b) => {
    const numA = parseFloat(a.num) || 0;
    const numB = parseFloat(b.num) || 0;
    return numA - numB;
  });
  
  if (saveLockedChapters(lockedChapters)) {
    console.log(`\n✅ Chapter ${chapterNum} ditambahkan ke locked list!`);
    console.log('💡 Jangan lupa update chapters.json dengan mode 1 atau 3\n');
  }
}

async function removeLockedChapter() {
  console.log('\n➖ Hapus Locked Chapter\n');
  
  const lockedChapters = loadLockedChapters();
  
  if (lockedChapters.length === 0) {
    console.log('❌ Tidak ada locked chapter!\n');
    return;
  }
  
  console.log('Locked chapters:\n');
  lockedChapters.forEach((locked, i) => {
    console.log(`  ${i + 1}. Chapter ${locked.num} - ${locked.title}`);
  });
  
  const choice = await question('\nPilih nomor untuk dihapus (atau 0 untuk batal): ');
  const index = parseInt(choice) - 1;
  
  if (index < 0 || index >= lockedChapters.length) {
    console.log('❌ Dibatalkan.\n');
    return;
  }
  
  const removed = lockedChapters.splice(index, 1)[0];
  
  if (saveLockedChapters(lockedChapters)) {
    console.log(`\n✅ Chapter ${removed.num} dihapus dari locked list!\n`);
  }
}

async function editLockedChapter() {
  console.log('\n✏️  Edit Locked Chapter\n');
  
  const lockedChapters = loadLockedChapters();
  
  if (lockedChapters.length === 0) {
    console.log('❌ Tidak ada locked chapter!\n');
    return;
  }
  
  console.log('Locked chapters:\n');
  lockedChapters.forEach((locked, i) => {
    console.log(`  ${i + 1}. Chapter ${locked.num} - ${locked.title}`);
  });
  
  const choice = await question('\nPilih nomor untuk diedit (atau 0 untuk batal): ');
  const index = parseInt(choice) - 1;
  
  if (index < 0 || index >= lockedChapters.length) {
    console.log('❌ Dibatalkan.\n');
    return;
  }
  
  const locked = lockedChapters[index];
  
  console.log(`\nEdit Chapter ${locked.num}`);
  console.log('(Tekan Enter untuk skip/tidak ubah)\n');
  
  const newTitle = await question(`Judul (${locked.title}): `);
  const newRelease = await question(`Release date (${locked.releaseDate}): `);
  const newLink = await question(`Support link (${locked.supportLink}): `);
  
  if (newTitle.trim()) locked.title = newTitle.trim();
  if (newRelease.trim()) locked.releaseDate = newRelease.trim();
  if (newLink.trim()) locked.supportLink = newLink.trim();
  
  if (saveLockedChapters(lockedChapters)) {
    console.log(`\n✅ Chapter ${locked.num} berhasil diupdate!\n`);
  }
}

async function viewLockedChapters() {
  console.log('\n📋 Semua Locked Chapters\n');
  
  const lockedChapters = loadLockedChapters();
  
  if (lockedChapters.length === 0) {
    console.log('❌ Tidak ada locked chapter!\n');
    return;
  }
  
  console.log('='.repeat(60));
  lockedChapters.forEach(locked => {
    console.log(`\nChapter ${locked.num}`);
    console.log(`  Title: ${locked.title}`);
    console.log(`  Release: ${locked.releaseDate}`);
    console.log(`  Support: ${locked.supportLink}`);
  });
  console.log('\n' + '='.repeat(60) + '\n');
}

// ===========================
// MAIN FUNCTIONS
// ===========================

async function countAllFolders() {
  console.log('\n🔍 Mencari semua folder chapter di:');
  console.log(`📁 ${REPO_PATH}\n`);
  
  const folders = getAllFolders();
  
  if (folders.length === 0) {
    console.log('❌ Tidak ada folder chapter ditemukan!');
    console.log('💡 Folder harus berformat: 1, 2, 2.1, 3, dll\n');
    return;
  }

  console.log(`✅ Ditemukan ${folders.length} folder chapter:\n`);
  folders.forEach(folder => console.log(`   - ${folder}`));
  
  const confirm = await question('\n❓ Hitung semua folder ini? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Dibatalkan.\n');
    return;
  }

  console.log('\n⏳ Menghitung...\n');

  const results = [];

  for (const folder of folders) {
    const folderPath = path.join(REPO_PATH, folder);
    const result = countImagesInFolder(folderPath);
    results.push({
      folder: folder,
      ...result
    });
    
    // Live progress
    if (result.success) {
      console.log(`   ✅ ${folder}: ${result.count} halaman`);
    } else {
      console.log(`   ❌ ${folder}: ${result.error}`);
    }
  }

  displayResults(results);

  // Ask to update files
  console.log('\n📝 Pilih update:');
  console.log('   1. Update reader.js & chapters.json (Recommended)');
  console.log('   2. Update reader.js saja');
  console.log('   3. Update chapters.json saja');
  console.log('   4. Tidak update (tampilkan data saja)');
  
  const choice = await question('\nPilihan (1-4): ');
  
  const chaptersData = generateChaptersData(results);
  
  if (choice === '1') {
    console.log('\n⏳ Updating files...');
    const jsSuccess = updateReaderJS(chaptersData);
    const jsonSuccess = updateChaptersJSON(chaptersData);
    
    if (jsSuccess && jsonSuccess) {
      console.log('\n✅ Semua file berhasil diupdate!\n');
    }
  } else if (choice === '2') {
    console.log('\n⏳ Updating reader.js...');
    if (updateReaderJS(chaptersData)) {
      console.log('\n✅ reader.js berhasil diupdate!\n');
    }
  } else if (choice === '3') {
    console.log('\n⏳ Updating chapters.json...');
    if (updateChaptersJSON(chaptersData)) {
      console.log('\n✅ chapters.json berhasil diupdate!\n');
    }
  } else {
    console.log('\n📋 Data chapters:');
    console.log(JSON.stringify(chaptersData, null, 2));
    console.log('\n');
  }
}

async function countSpecificFolders() {
  console.log('\n🔍 Mode: Pilih Folder Spesifik\n');
  
  const allFolders = getAllFolders();
  
  if (allFolders.length === 0) {
    console.log('❌ Tidak ada folder chapter ditemukan!\n');
    return;
  }

  console.log('Folder yang tersedia:\n');
  allFolders.forEach((folder, index) => {
    console.log(`  ${String(index + 1).padStart(2, ' ')}. Chapter ${folder}`);
  });

  console.log('\n💡 Cara input:');
  console.log('   - Satu folder: 1');
  console.log('   - Beberapa folder: 1,3,5');
  console.log('   - Range: 1-5');
  console.log('   - Kombinasi: 1,3-5,7');
  console.log('   - Semua: all\n');

  const input = await question('📝 Pilih folder: ');

  let selectedFolders = [];

  if (input.toLowerCase() === 'all') {
    selectedFolders = allFolders;
  } else {
    const parts = input.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end; i++) {
          if (i > 0 && i <= allFolders.length) {
            selectedFolders.push(allFolders[i - 1]);
          }
        }
      } else {
        const index = parseInt(part);
        if (index > 0 && index <= allFolders.length) {
          selectedFolders.push(allFolders[index - 1]);
        }
      }
    }
  }

  if (selectedFolders.length === 0) {
    console.log('❌ Tidak ada folder yang dipilih!\n');
    return;
  }

  console.log('\n✅ Folder yang akan dihitung:');
  selectedFolders.forEach(f => console.log(`   - Chapter ${f}`));

  const confirm = await question('\n❓ Lanjutkan? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Dibatalkan.\n');
    return;
  }

  console.log('\n⏳ Menghitung...\n');

  const results = [];

  for (const folder of selectedFolders) {
    const folderPath = path.join(REPO_PATH, folder);
    const result = countImagesInFolder(folderPath);
    results.push({
      folder: folder,
      ...result
    });
    
    if (result.success) {
      console.log(`   ✅ ${folder}: ${result.count} halaman`);
    } else {
      console.log(`   ❌ ${folder}: ${result.error}`);
    }
  }

  displayResults(results);

  // For specific folders, show current data first
  console.log('\n💡 Mode: Update Spesifik');
  console.log('   Opsi 1: Replace semua data di reader.js');
  console.log('   Opsi 2: Tampilkan data untuk manual edit\n');
  
  const choice = await question('Pilihan (1/2): ');
  
  if (choice === '1') {
    const update = await question('\n⚠️  Ini akan REPLACE semua data chapter. Lanjut? (y/n): ');
    
    if (update.toLowerCase() === 'y') {
      console.log('\n⏳ Updating reader.js...');
      
      const chaptersData = generateChaptersData(results);
      const success = updateReaderJS(chaptersData);
      
      if (success) {
        console.log('✅ reader.js berhasil diupdate!\n');
      }
    }
  } else {
    console.log('\n📋 Data untuk manual edit:\n');
    generateChaptersData(results).forEach(ch => {
      console.log(`  { num: "${ch.num}", title: "${ch.title}", pages: ${ch.pages}, folder: "${ch.folder}" },`);
    });
    console.log('\n');
  }
}

async function showDetailedView() {
  console.log('\n📋 Mode: Lihat Detail per Folder\n');
  
  const allFolders = getAllFolders();
  
  if (allFolders.length === 0) {
    console.log('❌ Tidak ada folder ditemukan!\n');
    return;
  }

  console.log('Pilih folder:\n');
  allFolders.forEach((folder, index) => {
    console.log(`  ${String(index + 1).padStart(2, ' ')}. Chapter ${folder}`);
  });

  const input = await question('\n📝 Nomor folder: ');
  const index = parseInt(input) - 1;

  if (index < 0 || index >= allFolders.length) {
    console.log('❌ Nomor tidak valid!\n');
    return;
  }

  const folder = allFolders[index];
  const folderPath = path.join(REPO_PATH, folder);
  const result = countImagesInFolder(folderPath);

  console.log('\n' + '='.repeat(60));
  console.log(`📁 Chapter ${folder} - Detail`);
  console.log('='.repeat(60) + '\n');

  if (!result.success) {
    console.log(`❌ Error: ${result.error}\n`);
    return;
  }

  console.log(`✅ Total: ${result.count} halaman`);
  console.log(`📂 Path: ${folderPath}\n`);
  console.log('📄 Daftar file:\n');
  
  result.files.forEach((file, i) => {
    const num = String(i + 1).padStart(3, ' ');
    console.log(`   ${num}. ${file}`);
  });

  console.log('\n' + '-'.repeat(60) + '\n');
}

async function testConnection() {
  console.log('\n🔧 Test Koneksi File\n');
  
  console.log('1. Folder Manga (current directory):');
  console.log(`   📁 ${REPO_PATH}`);
  console.log(`   ✅ Exists: ${fs.existsSync(REPO_PATH) ? 'YES' : 'NO'}\n`);
  
  console.log('2. File reader.js:');
  console.log(`   📁 ${READER_JS_PATH}`);
  
  if (fs.existsSync(READER_JS_PATH)) {
    console.log(`   ✅ Exists: YES`);
    const content = fs.readFileSync(READER_JS_PATH, 'utf8');
    const hasChaptersArray = /const chapters = \[/.test(content);
    console.log(`   ✅ Has 'const chapters': ${hasChaptersArray ? 'YES' : 'NO'}\n`);
  } else {
    console.log(`   ❌ Exists: NO\n`);
  }
  
  console.log('3. File chapters.json:');
  console.log(`   📄 ${CHAPTERS_JSON_PATH}`);
  
  if (fs.existsSync(CHAPTERS_JSON_PATH)) {
    console.log(`   ✅ Exists: YES`);
    try {
      const json = JSON.parse(fs.readFileSync(CHAPTERS_JSON_PATH, 'utf8'));
      console.log(`   ✅ Valid JSON: YES`);
      console.log(`   ℹ️  Chapters: ${json.totalChapters || json.chapters?.length || 0}`);
      console.log(`   ℹ️  Last updated: ${json.updated || 'N/A'}\n`);
    } catch (err) {
      console.log(`   ❌ Valid JSON: NO (${err.message})\n`);
    }
  } else {
    console.log(`   ⚠️  Exists: NO (akan dibuat saat pertama update)\n`);
  }
  
  console.log('4. Chapter folders:');
  const folders = getAllFolders();
  console.log(`   📂 Found: ${folders.length} folders`);
  if (folders.length > 0) {
    console.log(`   ✅ ${folders.join(', ')}\n`);
  } else {
    console.log(`   ❌ No chapter folders found\n`);
  }
  
  if (!fs.existsSync(READER_JS_PATH)) {
    console.log('💡 Solusi:');
    console.log('   Edit line 12 di count-pages.js');
    console.log('   Sesuaikan READER_JS_PATH ke lokasi file reader.js Anda\n');
  }
}

// ===========================
// MAIN MENU
// ===========================

async function showMenu() {
  console.clear();
  console.log('╔═════════════════════════════════════════════════════════╗');
  console.log('║      📚 AUTO MANGA PAGE COUNTER & UPDATER v2.0 📚        ║');
  console.log('╚═════════════════════════════════════════════════════════╝\n');
  
  console.log(`📁 Folder Manga: ${REPO_PATH}`);
  console.log(`📍 Target reader.js: ${READER_JS_PATH}`);
  console.log(`📄 Target chapters.json: ${CHAPTERS_JSON_PATH}\n`);
  
  console.log('Pilih Mode:\n');
  console.log('  1. 🚀 Hitung SEMUA & Update (Recommended)');
  console.log('  2. 🎯 Hitung folder spesifik');
  console.log('  3. 🔍 Lihat detail per folder');
  console.log('  4. 🔒 Manage locked chapters');
  console.log('  5. ⚙️  Test koneksi file');
  console.log('  6. ❌ Keluar\n');

  const choice = await question('Pilihan Anda (1-6): ');

  switch (choice) {
    case '1':
      await countAllFolders();
      break;
    case '2':
      await countSpecificFolders();
      break;
    case '3':
      await showDetailedView();
      break;
    case '4':
      await manageLockedChapters();
      break;
    case '5':
      await testConnection();
      break;
    case '6':
      console.log('\n👋 Terima kasih! Sampai jumpa!\n');
      rl.close();
      return;
    default:
      console.log('\n❌ Pilihan tidak valid!\n');
  }

  const again = await question('\n🔄 Kembali ke menu? (y/n): ');
  if (again.toLowerCase() === 'y') {
    await showMenu();
  } else {
    console.log('\n👋 Terima kasih!\n');
    rl.close();
  }
}

// ===========================
// START APPLICATION
// ===========================

console.log('🚀 Starting Auto Updater...\n');
console.log('📁 Current Directory:', REPO_PATH);
console.log('📍 Target reader.js:', READER_JS_PATH);
console.log('\n⏳ Validating...\n');

// Quick validation
const folders = getAllFolders();
if (folders.length === 0) {
  console.log('⚠️  WARNING: Tidak ada folder chapter ditemukan!');
  console.log('💡 Pastikan file ini berada di folder yang berisi: 1, 2, 3, dll\n');
}

if (!fs.existsSync(READER_JS_PATH)) {
  console.log('⚠️  WARNING: reader.js tidak ditemukan!');
  console.log('💡 Edit READER_JS_PATH di line 12 jika path berbeda\n');
}

showMenu().catch(err => {
  console.error('\n❌ Error:', err.message);
  rl.close();
});