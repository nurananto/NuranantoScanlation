/**
 * DOWNLOAD TRAKTEER ICON
 * Script untuk download icon Trakteer ke folder assets/
 * 
 * Cara Pakai: node download-trakteer-icon.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TRAKTEER_ICON_URL = 'https://cdn.trakteer.id/images/embed/trbtn-icon.png';
const ASSETS_DIR = path.join(__dirname, 'assets');
const OUTPUT_FILE = path.join(ASSETS_DIR, 'trakteer-icon.png');

console.log('📥 Download Icon Trakteer');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Buat folder assets jika belum ada
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR);
  console.log('📁 Folder assets/ dibuat\n');
}

// Cek apakah icon sudah ada
if (fs.existsSync(OUTPUT_FILE)) {
  console.log('✅ Icon Trakteer sudah ada: assets/trakteer-icon.png');
  console.log('ℹ️  Tidak perlu download ulang.\n');
  console.log('💡 Kalau mau download ulang, hapus dulu file:');
  console.log('   rm assets/trakteer-icon.png\n');
  process.exit(0);
}

// Download icon
console.log(`📥 Downloading dari: ${TRAKTEER_ICON_URL}`);
console.log('⏳ Mohon tunggu...\n');

const file = fs.createWriteStream(OUTPUT_FILE);

https.get(TRAKTEER_ICON_URL, (response) => {
  // Handle redirect
  if (response.statusCode === 301 || response.statusCode === 302) {
    return https.get(response.headers.location, (redirectResponse) => {
      redirectResponse.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('✅ Berhasil download: assets/trakteer-icon.png');
        console.log(`📊 Ukuran file: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);
        console.log('🎉 Selesai!');
        console.log('📝 Sekarang tinggal push ke GitHub:\n');
        console.log('   git add assets/');
        console.log('   git commit -m "Add Trakteer icon"');
        console.log('   git push\n');
      });
      
      file.on('error', (err) => {
        fs.unlink(OUTPUT_FILE, () => {});
        console.error('❌ Error saat menyimpan file:', err.message);
        process.exit(1);
      });
    });
  }
  
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('✅ Berhasil download: assets/trakteer-icon.png');
    console.log(`📊 Ukuran file: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB\n`);
    console.log('🎉 Selesai!');
    console.log('📝 Sekarang tinggal push ke GitHub:\n');
    console.log('   git add assets/');
    console.log('   git commit -m "Add Trakteer icon"');
    console.log('   git push\n');
  });
  
  file.on('error', (err) => {
    fs.unlink(OUTPUT_FILE, () => {});
    console.error('❌ Error saat menyimpan file:', err.message);
    process.exit(1);
  });
  
}).on('error', (err) => {
  console.error('❌ Error saat download:', err.message);
  process.exit(1);
});