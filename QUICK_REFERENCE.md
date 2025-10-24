# 🚀 Quick Reference Guide

## Setup Awal (Sekali Saja)

```bash
# 1. Copy workflow file ke repo
mkdir -p .github/workflows
cp update-covers.yml .github/workflows/

# 2. Cleanup file manual (opsional)
bash cleanup.sh

# 3. Commit & push
git add .github/ .gitignore
git commit -m "🤖 Setup GitHub Actions for auto cover update"
git push

# 4. Enable Actions (jika belum aktif)
# - Buka Settings → Actions → General
# - Enable "Allow all actions and reusable workflows"
# - Set Workflow permissions → "Read and write permissions"
```

## ✅ Setelah Setup

### Auto-Update Berjalan:
- 🕐 **Otomatis**: Setiap 2 minggu (14 hari)
- 📅 **Jadwal**: Minggu, 00:00 UTC
- 🔔 **Notifikasi**: Via email (jika ada perubahan)

### Manual Update:
```
1. Buka GitHub → Tab "Actions"
2. Pilih "Auto Update Manga Covers"
3. Klik "Run workflow" → "Run workflow"
```

## 📊 Monitor Status

### Cek Workflow Runs:
```
Repository → Actions → Auto Update Manga Covers
```

### Cek Kapan Update Terakhir:
```
Repository → commits → cari commit dari "github-actions[bot]"
```

## 🔧 Troubleshooting Cepat

| Problem | Solution |
|---------|----------|
| Workflow tidak berjalan | Enable Actions di Settings |
| Permission denied | Set "Read and write permissions" |
| Rate limit error | Workflow auto-retry, tunggu saja |
| Cover tidak update | Cek logs di tab Actions |

## ⚙️ Ubah Jadwal Update

Edit `.github/workflows/update-covers.yml`:

| Frekuensi | Cron Expression |
|-----------|----------------|
| Setiap 1 minggu | `0 0 * * 0` |
| Setiap 2 minggu (default) | `0 0 */14 * *` |
| Setiap 1 bulan | `0 0 1 * *` |
| Setiap hari | `0 0 * * *` |

## 📁 Struktur File Final

```
repo/
├── .github/
│   └── workflows/
│       └── update-covers.yml    ← Workflow (WAJIB)
├── covers/                       ← Folder cover (WAJIB)
├── download-covers.js            ← Script download (WAJIB)
├── script.js                     ← Manga list (WAJIB)
├── .gitignore                    ← Ignore files (RECOMMENDED)
└── README.md                     ← Docs (OPSIONAL)
```

## 🎯 Perintah Git Penting

```bash
# Cek status
git status

# Commit manual (jika edit script)
git add download-covers.js
git commit -m "Update download script"
git push

# Lihat history update otomatis
git log --author="github-actions[bot]"

# Rollback ke commit sebelumnya (jika perlu)
git revert HEAD
git push
```

## 🔗 Links Berguna

- **Cron Expression Helper**: https://crontab.guru/
- **GitHub Actions Docs**: https://docs.github.com/actions
- **MangaDex API**: https://api.mangadex.org/docs/
- **Repository Settings**: `https://github.com/username/repo/settings`

## 💡 Tips

1. **Pertama kali setup**: Trigger manual untuk test
2. **Workflow error**: Cek logs detail di Actions tab
3. **Cover tidak berubah**: Normal, berarti sudah terbaru
4. **Repo tidak aktif**: Push commit untuk "wake up" workflow

---

**Need help?** Open an issue di repository!
