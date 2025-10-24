# 🚀 GitHub Actions Auto Cover Update - Complete Package

> Automated manga cover updates dari MangaDex setiap 2 minggu menggunakan GitHub Actions

## 📦 What's Included

Paket lengkap untuk setup GitHub Actions auto-update cover manga:

```
outputs/
├── 🔧 CORE FILES (WAJIB)
│   ├── .github/workflows/update-covers.yml  → Workflow utama
│   └── .gitignore                           → Git ignore rules
│
├── 📚 DOCUMENTATION (Pilih sesuai kebutuhan)
│   ├── INDEX.md                    → 📍 Navigasi & file guide
│   ├── SUMMARY.md                  → 📊 Overview & benefit analysis
│   ├── GITHUB_ACTIONS_README.md    → 📖 Comprehensive documentation
│   ├── QUICK_REFERENCE.md          → ⚡ Quick commands & reference
│   ├── SETUP_CHECKLIST.md          → ✅ Step-by-step setup guide
│   └── GIT_COMMANDS.md             → 📝 Git commands reference
│
└── 🛠️ UTILITIES
    └── cleanup.sh                  → Script cleanup file manual
```

## ⚡ Quick Start

### 1️⃣ Copy Files ke Repository
```bash
# Masuk ke folder repository
cd /path/to/NuranantoScanlation

# Copy workflow (WAJIB)
cp -r /path/to/outputs/.github .

# Copy gitignore (Recommended)
cp /path/to/outputs/.gitignore .

# Copy cleanup script (Optional)
cp /path/to/outputs/cleanup.sh .
chmod +x cleanup.sh
```

### 2️⃣ Cleanup File Manual (Optional)
```bash
# Hapus file yang tidak diperlukan lagi
bash cleanup.sh
# Atau manual:
rm -f force-update-covers.js Command_Buat_Download_Cover script_js.force-backup
```

### 3️⃣ Commit & Push
```bash
git add .github/ .gitignore
git commit -m "🤖 Setup GitHub Actions for auto cover update"
git push
```

### 4️⃣ Enable GitHub Actions
1. Buka `Settings` → `Actions` → `General`
2. Enable: "Allow all actions and reusable workflows"
3. Workflow permissions: **"Read and write permissions"**
4. Save changes

### 5️⃣ Test Manual Trigger
1. Tab `Actions` → `Auto Update Manga Covers`
2. Click `Run workflow` → `Run workflow`
3. Tunggu ~5-10 menit
4. Cek commit dari `github-actions[bot]`

## 🎯 What You Get

### ✅ Automated Process
- ⏰ Berjalan otomatis setiap **2 minggu**
- 📅 Scheduled: Minggu, 00:00 UTC
- 🔄 Auto-update cover yang berbeda
- 💾 Auto-commit & push ke repository
- 📊 Generate update summary

### ✅ Manual Control
- 🎮 Trigger manual dari GitHub UI
- ⚙️ Customizable schedule (1 minggu, 1 bulan, dll)
- 📝 Full logs & history di Actions tab
- 🔔 Email notification jika error

### ✅ Zero Maintenance
- 🤖 Fully automated, tidak perlu intervensi
- ☁️ Berjalan di cloud (tidak tergantung PC lokal)
- 💰 **Gratis** untuk public repository
- ⏱️ Save ~6.5 jam per tahun

## 📚 Documentation Guide

**Bingung mulai dari mana?** Pilih berdasarkan kebutuhan:

| Kebutuhan | Baca File Ini |
|-----------|---------------|
| 🆕 Setup pertama kali | **INDEX.md** → **SETUP_CHECKLIST.md** |
| ⚡ Mau cepat | **QUICK_REFERENCE.md** |
| 📖 Mau detail lengkap | **GITHUB_ACTIONS_README.md** |
| 📊 Mau overview dulu | **SUMMARY.md** |
| 🔧 Git problems | **GIT_COMMANDS.md** |
| 🗺️ Navigasi file | **INDEX.md** |

### Recommended Reading Order:
```
Pemula: INDEX.md → SUMMARY.md → SETUP_CHECKLIST.md
Expert: QUICK_REFERENCE.md → Setup → Done!
```

## 🔥 Key Features

### Smart Update Detection
- Hanya download cover yang **berbeda/lebih baru**
- Skip cover yang sudah up-to-date
- Replace cover lama otomatis

### Reliable Automation
- Auto-retry jika rate limit
- Error handling & logging
- Backup otomatis via Git history

### Developer Friendly
- Clear logs & debugging info
- Customizable workflow
- Easy to modify & extend

## 📊 File Priority

### Must-Have (Minimal Setup)
```
✅ .github/workflows/update-covers.yml  (100% required)
✅ .gitignore                           (Highly recommended)
```

### Recommended Setup
```
✅ .github/workflows/update-covers.yml
✅ .gitignore
✅ SETUP_CHECKLIST.md
✅ QUICK_REFERENCE.md
```

### Complete Package
```
✅ Semua file (untuk dokumentasi lengkap)
```

## 🛠️ File yang Bisa Dihapus dari Repo

Setelah setup GitHub Actions, file-file ini **TIDAK DIPERLUKAN LAGI**:

```bash
# File manual yang obsolete
❌ force-update-covers.js       (Replaced by GitHub Actions)
❌ Command_Buat_Download_Cover  (No need manual command)
❌ script_js.force-backup       (Git history is enough)
```

Gunakan `cleanup.sh` untuk hapus otomatis.

## ⚙️ Configuration

### Default Settings
- **Schedule**: Setiap 14 hari (2 minggu)
- **Day**: Minggu
- **Time**: 00:00 UTC
- **Delay**: 1500ms per request
- **Timezone**: UTC

### Customize Schedule
Edit `.github/workflows/update-covers.yml`:
```yaml
schedule:
  - cron: '0 0 */14 * *'  # Ubah sesuai kebutuhan
```

**Contoh cron:**
- `0 0 * * 0` → Setiap minggu
- `0 0 1 * *` → Setiap bulan
- `0 0 * * *` → Setiap hari

🔗 **Cron Helper**: https://crontab.guru/

## 🔍 Monitoring

### Check Workflow Status
```
Repository → Actions tab → Auto Update Manga Covers
```

### Check Latest Run
- ✅ Green checkmark = Success
- ❌ Red X = Failed (cek logs)
- 🟡 Yellow dot = Running

### Check Bot Commits
```bash
git log --author="github-actions[bot]"
```

### Email Notifications
- Otomatis dapat email jika workflow failed
- Configure di Settings → Notifications

## 🆘 Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Workflow tidak run | Enable Actions di Settings |
| Permission denied | Set "Read and write permissions" |
| Rate limit | Auto-retry, tunggu saja |
| File not found | Cek path .github/workflows/ |
| No commits | Cek workflow logs untuk errors |

**Butuh help detail?** Baca `GITHUB_ACTIONS_README.md` bagian Troubleshooting.

## 💡 Pro Tips

1. **Test dulu** dengan manual trigger setelah setup
2. **Monitor** 2-3 runs pertama untuk pastikan lancar
3. **Bookmark** QUICK_REFERENCE.md untuk daily use
4. **Review logs** jika ada yang aneh
5. **Jangan ubah** download-covers.js tanpa test lokal dulu

## 🎓 Learning Resources

### GitHub Actions
- [Official Docs](https://docs.github.com/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Cron Schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule)

### MangaDex API
- [API Documentation](https://api.mangadex.org/docs/)
- [Rate Limits Info](https://api.mangadex.org/docs/rate-limits/)

### Git
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)

## 📊 Benefits Overview

### Time Saved
```
Manual update: ~15 menit per update
Automated: 0 menit per update
Updates per year: 26x (bi-weekly)
Total saved: ~6.5 jam per tahun
```

### Resource Saved
- ✅ No need PC/laptop online
- ✅ No need remember schedule
- ✅ No maintenance required
- ✅ Zero cost (for public repo)

### Reliability
- ✅ Konsisten setiap 2 minggu
- ✅ Auto-retry if error
- ✅ Full audit trail (logs)
- ✅ Email alerts if failed

## 🔐 Security

- ✅ Hanya akses public MangaDex API
- ✅ No credentials required
- ✅ Isolated GitHub Actions environment
- ✅ Hanya update repo sendiri

**Permissions needed:**
- Read: Checkout repository
- Write: Commit & push changes

## 📞 Support & Feedback

- 📖 **Documentation issues**: Baca file yang relevan
- 🐛 **Workflow problems**: Cek logs + troubleshooting docs
- 💬 **Questions**: Open issue di repository
- 🌟 **Feedback**: Welcome!

## 🎉 Ready to Automate!

Anda sekarang punya **complete package** untuk full automation cover updates!

**Next Steps:**
1. 📋 Review **INDEX.md** untuk navigasi
2. ✅ Follow **SETUP_CHECKLIST.md**
3. ⚡ Bookmark **QUICK_REFERENCE.md**
4. 🚀 Enjoy automation!

---

**Package Version**: 1.0.0  
**Created**: 2025-01-24  
**License**: Free to use & modify  

**Happy Automating!** 🤖✨

> Butuh bantuan? Mulai dari INDEX.md untuk navigasi lengkap!
