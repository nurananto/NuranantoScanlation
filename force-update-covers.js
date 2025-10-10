/**
 * FORCE UPDATE - Download ulang SEMUA cover ke versi terbaru
 * 
 * Gunakan script ini kalau mau:
 * - Update semua cover ke versi terbaru
 * - Replace semua cover yang sudah ada
 * 
 * Cara Pakai: node force-update-covers.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 FORCE UPDATE MODE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚠️  Script ini akan:');
console.log('   1. HAPUS SEMUA cover di folder covers/');
console.log('   2. Download ulang SEMUA cover dari MangaDex');
console.log('   3. Ambil versi TERBARU untuk setiap manga\n');

// Konfirmasi
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Lanjutkan? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Dibatalkan.');
    readline.close();
    process.exit(0);
  }
  
  console.log('\n🗑️  Menghapus semua cover lama...');
  
  // Hapus semua file di folder covers
  const coversDir = path.join(__dirname, 'covers');
  if (fs.existsSync(coversDir)) {
    const files = fs.readdirSync(coversDir);
    files.forEach(file => {
      const filePath = path.join(coversDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
    console.log(`✅ ${files.length} cover dihapus\n`);
  }
  
  // Kosongkan field cover di script.js
  console.log('📝 Mengosongkan field cover di script.js...');
  const scriptPath = path.join(__dirname, 'script.js');
  let scriptContent = fs.readFileSync(scriptPath, 'utf-8');
  
  // Replace semua cover: "..." dengan cover: ""
  scriptContent = scriptContent.replace(/cover: '[^']*'/g, "cover: ''");
  
  // Backup
  fs.copyFileSync(scriptPath, path.join(__dirname, 'script.js.force-backup'));
  fs.writeFileSync(scriptPath, scriptContent);
  
  console.log('✅ Field cover dikosongkan\n');
  console.log('🚀 Menjalankan download-covers.js...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  readline.close();
  
  // Jalankan download-covers.js
  try {
    execSync('node download-covers.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('\n❌ Error saat menjalankan download-covers.js');
    process.exit(1);
  }
});