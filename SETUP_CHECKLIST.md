# ✅ Setup Checklist - GitHub Actions Auto Cover Update

## 📦 Pre-Setup

- [ ] Repository sudah ada di GitHub
- [ ] File `download-covers.js` sudah ada dan berfungsi
- [ ] File `script.js` dengan mangaList sudah ada
- [ ] Folder `covers/` sudah dibuat

## 🚀 Setup Steps

### 1. Upload File GitHub Actions
- [ ] Copy folder `.github/` ke root repository
- [ ] Pastikan structure: `.github/workflows/update-covers.yml`

### 2. Upload File Pendukung (Opsional)
- [ ] Copy `.gitignore` ke root repository
- [ ] Copy `GITHUB_ACTIONS_README.md` (untuk dokumentasi)
- [ ] Copy `QUICK_REFERENCE.md` (untuk quick guide)

### 3. Cleanup File Manual
- [ ] Jalankan `bash cleanup.sh` atau hapus manual:
  - [ ] `force-update-covers.js`
  - [ ] `Command_Buat_Download_Cover`
  - [ ] `script_js.force-backup`

### 4. Commit & Push
```bash
git add .github/ .gitignore
git commit -m "🤖 Setup GitHub Actions for auto cover update"
git push
```
- [ ] File ter-commit
- [ ] File ter-push ke GitHub

### 5. Enable GitHub Actions
- [ ] Buka `Settings` → `Actions` → `General`
- [ ] Enable "Allow all actions and reusable workflows"
- [ ] Set "Workflow permissions" → "Read and write permissions"
- [ ] Save changes

### 6. Test Manual Trigger
- [ ] Buka tab `Actions` di GitHub
- [ ] Pilih workflow "Auto Update Manga Covers"
- [ ] Klik "Run workflow" → "Run workflow"
- [ ] Tunggu workflow selesai (±5-10 menit)
- [ ] Cek apakah ada commit baru dari github-actions[bot]

## ✅ Verifikasi

### Cek Workflow File
```bash
cat .github/workflows/update-covers.yml
```
- [ ] File ada dan readable
- [ ] Cron schedule: `0 0 */14 * *` (setiap 2 minggu)

### Cek Permissions
- [ ] Repository → Settings → Actions → Workflow permissions
- [ ] Harus: "Read and write permissions" ✅

### Cek Workflow Runs
- [ ] Repository → Actions tab
- [ ] Ada workflow "Auto Update Manga Covers"
- [ ] Status: ✅ Success (jika sudah run)

### Cek Auto Commit
```bash
git log --author="github-actions[bot]" -1
```
- [ ] Ada commit dari bot (setelah manual trigger)
- [ ] Commit message: "🤖 Auto-update covers - [date]"

## 🎉 Setup Complete!

Setelah semua checklist di atas selesai:

### ✅ Yang Sudah Jalan:
- Auto-update cover setiap 2 minggu
- Manual trigger dari GitHub UI
- Auto-commit & push oleh bot
- Notifikasi email (jika workflow error)

### 📅 Jadwal Berikutnya:
- Workflow akan run otomatis setiap 14 hari
- Bisa cek di Actions → "Auto Update Manga Covers" → "scheduled"

### 🔔 Monitoring:
- Cek tab Actions untuk workflow runs
- Email notifikasi jika workflow fail
- Commit history dari github-actions[bot]

## 🆘 Troubleshooting

### Workflow tidak muncul di Actions?
- Pastikan file di path: `.github/workflows/update-covers.yml`
- Push ulang jika perlu

### Workflow error "Permission denied"?
- Settings → Actions → Workflow permissions
- Pilih "Read and write permissions"

### Workflow tidak run otomatis?
- Repository harus aktif (ada commit dalam 60 hari)
- Trigger manual untuk "wake up"

### Cover tidak update?
- Normal jika cover sudah terbaru
- Cek logs di Actions untuk detail

## 📞 Need Help?

- **Documentation**: Baca `GITHUB_ACTIONS_README.md`
- **Quick Guide**: Baca `QUICK_REFERENCE.md`
- **Issues**: Open issue di GitHub repository
- **MangaDex API**: https://api.mangadex.org/docs/

---

**Setup Date**: ________________  
**Setup By**: ________________  
**Repository**: ________________
