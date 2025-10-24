# 🤖 GitHub Actions: Auto Update Manga Covers

## 📋 Ringkasan

Repository ini menggunakan **GitHub Actions** untuk otomatis mengupdate cover manga dari MangaDex setiap 2 minggu sekali. Tidak perlu lagi menjalankan script manual!

## ✨ Fitur

- ⏰ **Auto-update setiap 2 minggu** (bi-weekly)
- 🔄 **Smart update**: Hanya download cover yang berbeda
- 🤖 **Fully automated**: Tidak perlu intervensi manual
- 📊 **Update summary**: Laporan otomatis di GitHub Actions
- 🚀 **Manual trigger**: Bisa trigger kapan saja dari GitHub UI

## 🔧 Setup GitHub Actions

### 1. Struktur File yang Diperlukan

```
repo/
├── .github/
│   └── workflows/
│       └── update-covers.yml    # ← File workflow utama
├── covers/                       # Folder untuk cover manga
├── download-covers.js            # Script download cover
└── script.js                     # File dengan mangaList
```

### 2. Cara Kerja

#### Workflow akan:
1. ✅ Checkout repository
2. ✅ Setup Node.js environment
3. ✅ Jalankan `download-covers.js`
4. ✅ Cek apakah ada perubahan
5. ✅ Commit & push changes (jika ada)
6. ✅ Generate summary report

#### Jadwal Eksekusi:
- **Otomatis**: Setiap 14 hari (2 minggu) pada hari Minggu, jam 00:00 UTC
- **Manual**: Bisa trigger dari tab "Actions" di GitHub

### 3. Manual Trigger

Untuk menjalankan update cover secara manual:

1. Buka repository di GitHub
2. Klik tab **"Actions"**
3. Pilih workflow **"Auto Update Manga Covers"**
4. Klik **"Run workflow"** → **"Run workflow"**

![Manual Trigger](https://docs.github.com/assets/cb-33501/images/help/actions/workflow-dispatch-button.png)

## 📁 File yang Bisa Dihapus

Setelah menggunakan GitHub Actions, file-file ini **TIDAK DIPERLUKAN LAGI**:

### ❌ File untuk Dihapus:
```bash
# Hapus file-file manual yang tidak terpakai
rm -f force-update-covers.js
rm -f Command_Buat_Download_Cover
rm -f script_js.force-backup
```

**Alasan:**
- `force-update-covers.js` → Diganti dengan manual trigger di GitHub Actions
- `Command_Buat_Download_Cover` → Tidak perlu lagi run manual
- `script_js.force-backup` → Backup otomatis handle oleh Git history

### ✅ File yang Tetap Diperlukan:
```
.github/workflows/update-covers.yml  ← Workflow utama
download-covers.js                   ← Script yang dipakai workflow
script.js                            ← Source mangaList
covers/                              ← Folder cover manga
```

## 🔍 Monitoring & Logs

### Cek Status Workflow:
1. Buka tab **"Actions"** di GitHub
2. Lihat workflow runs terbaru
3. Klik run untuk melihat detail logs

### Log yang Ditampilkan:
- ✅ Berhasil download: X cover
- 🔄 Cover diupdate: X cover
- ⭐ Sudah terbaru: X cover
- ❌ Error: X cover

## ⚙️ Kustomisasi

### Ubah Jadwal Update

Edit file `.github/workflows/update-covers.yml`:

```yaml
schedule:
  - cron: '0 0 */14 * *'  # Setiap 14 hari (2 minggu)
```

**Contoh jadwal lain:**
```yaml
# Setiap 1 minggu (Minggu jam 00:00)
- cron: '0 0 * * 0'

# Setiap 1 bulan (tanggal 1, jam 00:00)
- cron: '0 0 1 * *'

# Setiap hari (jam 00:00)
- cron: '0 0 * * *'
```

**Cron syntax helper**: https://crontab.guru/

### Ubah Delay Request

Edit `download-covers.js`:

```javascript
const DELAY_MS = 1500;  // Ubah delay (dalam milliseconds)
```

## 🚨 Troubleshooting

### Workflow Gagal?

**1. Cek Permissions**
- Pastikan Actions punya write access
- Settings → Actions → General → Workflow permissions
- Pilih: "Read and write permissions"

**2. Rate Limit MangaDex**
- MangaDex API punya rate limit
- Script otomatis retry dengan delay 30 detik
- Jika masih error, tunggu beberapa jam

**3. Node.js Error**
- Workflow pakai Node.js 18
- Pastikan `download-covers.js` compatible

### Workflow Tidak Berjalan?

**Possible causes:**
- Repository harus punya minimal 1 commit dalam 60 hari terakhir
- Scheduled workflows disabled jika repo tidak aktif
- Bisa trigger manual untuk "wake up" workflow

## 📊 Keuntungan GitHub Actions

### ✅ Otomatis
- Tidak perlu ingat-ingat kapan update
- Berjalan di background tanpa intervensi

### ✅ Gratis
- GitHub Actions gratis untuk public repository
- 2000 menit/bulan untuk private repo

### ✅ Reliable
- Berjalan di cloud (tidak tergantung PC lokal)
- Otomatis retry jika error

### ✅ Transparent
- Semua logs tersimpan
- Bisa tracking history update

## 🔐 Security Notes

- Script hanya baca data public dari MangaDex API
- Tidak ada credentials atau API key yang diperlukan
- Hanya update cover dan script.js di repository sendiri

## 📞 Support

Jika ada pertanyaan atau issue:
1. Cek logs di tab Actions
2. Buka issue di repository
3. Review dokumentasi MangaDex API: https://api.mangadex.org/docs/

---

**Last Updated**: 2025-01-24  
**Version**: 1.0.0
