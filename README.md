# 📚 Nurananto Scanlation

Website manga scanlation berbahasa Indonesia dengan sistem chapter management yang modern dan otomatis.

[![Auto Update Covers](https://github.com/nurananto/NuranantoScanlation/actions/workflows/update-covers.yml/badge.svg)](https://github.com/nurananto/NuranantoScanlation/actions/workflows/update-covers.yml)

🔗 **Live Demo**: [https://nurananto.github.io/NuranantoScanlation/](https://nurananto.github.io/NuranantoScanlation/)

---

## ✨ Fitur

- 🎯 **Auto-Sorting** - Manga otomatis diurutkan berdasarkan update terbaru
- 🔄 **Badge "UPDATED"** - Menampilkan manga yang diupdate dalam 24 jam terakhir
- 🔍 **Real-time Search** - Pencarian manga dengan debounce 300ms
- 📱 **Fully Responsive** - Optimized untuk desktop, tablet, dan mobile
- 📊 **View Counter** - Tracking views otomatis via Google Apps Script
- 🔒 **Locked Chapters** - Sistem chapter terkunci dengan donasi integration
- 🖼️ **Auto Cover Update** - GitHub Actions untuk update cover otomatis setiap 2 minggu
- 🎨 **Modern UI** - Design clean dengan squircle buttons dan smooth animations
- 🚀 **Webtoon Reader** - Reader mode dengan infinite scroll dan page navigation

---

## 🗂️ Struktur Project

```
NuranantoScanlation/
├── index.html              # Halaman utama (daftar manga)
├── info-manga.html         # Halaman info manga + chapter list
├── reader.html             # Halaman reader
├── script.js               # Logic untuk index.html
├── info-manga.js           # Logic untuk info-manga.html
├── reader.js               # Logic untuk reader.html
├── style.css               # Styling untuk index.html
├── info-manga.css          # Styling untuk info-manga.html
├── reader.css              # Styling untuk reader.html
├── manga-config.js         # ⭐ SINGLE SOURCE OF TRUTH untuk manga list
├── manga-repos.json        # Mapping repo → manga.json URLs
├── download-covers.js      # Script untuk download cover dari MangaDex
├── .github/
│   └── workflows/
│       └── update-covers.yml  # GitHub Actions untuk auto-update covers
├── assets/
│   ├── logo.png
│   └── trakteer-icon.png
└── covers/                 # Folder untuk menyimpan cover manga
    ├── manga-1-hash.jpg
    ├── manga-2-hash.jpg
    └── ...
```

---

## 📖 Cara Menambah Manga Baru

### **Step 1: Buat Repository untuk Manga Baru**

Setiap manga harus punya repository tersendiri dengan struktur:

```
NamaMangaRepo/
├── manga.json          # Metadata manga
├── Chapter-1/          # Folder chapter
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
├── Chapter-2/
│   ├── 1.jpg
│   ├── 2.jpg
│   └── ...
└── ...
```

**Contoh `manga.json`:**

```json
{
  "manga": {
    "title": "Judul Manga",
    "alternativeTitle": "Alternative Title",
    "description": "Sinopsis manga...",
    "cover": "https://link-to-cover.jpg",
    "author": "Nama Author",
    "artist": "Nama Artist",
    "genre": ["Romance", "Comedy", "School Life"],
    "views": 0,
    "links": {
      "mangadex": "https://mangadex.org/title/...",
      "raw": "https://comic-walker.com/..."
    }
  },
  "lastUpdated": "2025-01-29T10:30:00Z",
  "lastChapterUpdate": "2025-01-29T10:30:00Z",
  "chapters": {
    "1": {
      "folder": "Chapter-1",
      "title": "Chapter 1",
      "views": 0,
      "locked": false,
      "images": ["1.jpg", "2.jpg", "3.jpg"]
    },
    "2": {
      "folder": "Chapter-2",
      "title": "Chapter 2",
      "views": 0,
      "locked": false,
      "images": ["1.jpg", "2.jpg"]
    }
  }
}
```

---

### **Step 2: Update `manga-config.js`**

Tambahkan manga baru di **paling atas** array `MANGA_LIST`:

```javascript
const MANGA_LIST = [
  // ⭐ MANGA BARU - Taruh di sini!
  {
    id: 'mangabaru',                    // ID unik (lowercase, no space)
    title: 'Judul Manga Lengkap',      // Judul penuh
    cover: 'covers/manga-baru-hash.jpg', // Path ke cover (akan auto-update)
    repo: 'NamaMangaRepo'               // Nama repository di GitHub
  },
  
  // Manga lainnya...
  {
    id: 'kawaiigal',
    title: 'Class de Ichiban Kawaii Gal o Ezuke Shiteiru Hanashi',
    cover: 'covers/class-de-ichiban-kawaii-gal-o-ezuke-shiteiru-hanas-057c4259-5fef-4db3-aef5-a805c7f096c2.jpg',
    repo: 'KawaiiGal'
  },
  // ...
];
```

**Field Explanation:**
- `id`: Identifier unik untuk manga (digunakan di URL)
- `title`: Judul lengkap manga
- `cover`: Path ke file cover di folder `covers/`
- `repo`: Nama repository GitHub (tanpa username)

---

### **Step 3: Update `manga-repos.json`**

Tambahkan mapping URL untuk repo baru:

```json
{
  "mangabaru": "https://raw.githubusercontent.com/nurananto/NamaMangaRepo/main/manga.json",
  "10nenburi": "https://raw.githubusercontent.com/nurananto/10nenburi/main/manga.json",
  "madogiwa": "https://raw.githubusercontent.com/nurananto/MadogiwaHenshuu/refs/heads/main/manga.json",
  ...
}
```

**Format:**
```
"[id-manga]": "https://raw.githubusercontent.com/[username]/[NamaRepo]/main/manga.json"
```

---

### **Step 4: Download Cover dari MangaDex**

Jalankan script untuk auto-download cover terbaru:

```bash
node download-covers.js
```

**Script ini akan:**
1. Membaca `manga-repos.json`
2. Fetch `manga.json` dari setiap repository
3. Ambil cover terbaru dari MangaDex API
4. Download dan simpan ke folder `covers/`
5. Update path cover di `manga-config.js`

---

### **Step 5: Commit & Push**

```bash
git add manga-config.js manga-repos.json covers/
git commit -m "Add new manga: Judul Manga"
git push
```

**✅ Done!** Manga baru akan langsung muncul di website.

---

## 🔄 Auto-Update Covers

Project ini menggunakan **GitHub Actions** untuk auto-update covers setiap 2 minggu.

### **Cara Kerja:**

1. **Scheduled Run**: Setiap 14 hari (bi-weekly) pada hari Minggu jam 00:00 UTC
2. **Workflow** menjalankan `download-covers.js`
3. Jika ada cover baru, otomatis commit & push ke repository
4. Website akan menggunakan cover terbaru

### **Manual Trigger:**

Bisa juga trigger manual dari GitHub UI:
1. Go to **Actions** tab
2. Select **"Auto Update Manga Covers"**
3. Click **"Run workflow"**

### **File Konfigurasi:**

`.github/workflows/update-covers.yml`

```yaml
on:
  schedule:
    - cron: '0 0 */14 * *'  # Every 14 days
  workflow_dispatch:         # Manual trigger
```

---

## 📝 Struktur File Penting

### **1. `manga-config.js` - SINGLE SOURCE OF TRUTH**

File ini adalah **satu-satunya tempat** untuk manage daftar manga. Digunakan oleh semua halaman (index, info-manga, reader).

**✅ Keuntungan:**
- Satu file = satu tempat edit
- Tidak perlu update di banyak tempat
- Konsisten di seluruh website

**📍 Dipakai oleh:**
- `index.html` → Daftar manga
- `info-manga.html` → Load manga data
- `reader.html` → Load chapter images

---

### **2. `manga-repos.json` - URL Mapping**

Mapping dari `id` manga ke URL `manga.json` di GitHub.

**Format:**
```json
{
  "manga-id": "https://raw.githubusercontent.com/username/repo/main/manga.json"
}
```

**📍 Dipakai oleh:**
- `download-covers.js` → Fetch manga.json untuk download cover
- `info-manga.js` → Fetch data manga
- `reader.js` → Fetch chapter data

---

### **3. `download-covers.js` - Cover Downloader**

Script Node.js untuk auto-download cover dari MangaDex API.

**Features:**
- ✅ Auto-detect cover terbaru
- ✅ Replace cover lama dengan yang baru
- ✅ Update `manga-config.js` otomatis
- ✅ Rate limiting handling
- ✅ Backup file sebelum update

**Usage:**
```bash
node download-covers.js
```

---

## 🎨 Styling & Responsive Design

### **Breakpoints:**

```css
/* Desktop */
@media (min-width: 1024px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) { ... }

/* Mobile */
@media (max-width: 767px) { ... }

/* Small Mobile */
@media (max-width: 480px) { ... }
```

### **Key Features:**

- **Squircle Buttons**: Border-radius 12-16px (bukan oval 50px)
- **2-Line Title Ellipsis**: Judul maksimal 2 baris dengan `...`
- **Dynamic Font Size**: Font menyesuaikan device
- **Grid Layout**: 5 kolom (desktop), 3 kolom (tablet), 2 kolom (mobile)

---

## 📊 View Counter System

Website menggunakan **Google Apps Script** untuk tracking views.

### **Endpoints:**

1. **Page Views** (info-manga.html)
   - Tracked saat halaman dimuat
   - Hanya 1x per session (pakai `sessionStorage`)

2. **Chapter Views** (reader.html)
   - Tracked saat chapter dibuka
   - Auto-increment di Google Sheet

3. **Locked Chapter Views**
   - Tracked saat user klik chapter terkunci
   - Redirect ke Trakteer untuk donasi

### **API URL:**

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';
```

**Request Format:**
```json
{
  "repo": "manga-id",
  "chapter": "1",
  "type": "chapter"
}
```

---

## 🔒 Locked Chapters

Chapter bisa dikunci dan hanya bisa dibuka setelah donasi.

### **Setup di `manga.json`:**

```json
{
  "chapters": {
    "5": {
      "folder": "Chapter-5",
      "title": "Chapter 5",
      "views": 0,
      "locked": true,  // ⭐ Set locked = true
      "images": ["1.jpg", "2.jpg"]
    }
  }
}
```

### **Behavior:**

- ❌ User **tidak bisa** langsung baca
- 🔓 Klik chapter → Alert → Redirect ke Trakteer
- 📊 View tetap di-track untuk statistik

### **Trakteer Link:**

```javascript
const TRAKTEER_LINK = 'https://trakteer.id/NuranantoScanlation';
```

---

## 🚀 Deployment

### **GitHub Pages:**

1. Repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `root`
4. Save

**URL:** `https://username.github.io/NuranantoScanlation/`

### **Custom Domain (Optional):**

1. Buat file `CNAME` di root:
   ```
   yourdomain.com
   ```

2. Update DNS:
   ```
   Type: CNAME
   Name: @
   Value: username.github.io
   ```

---

## 🛠️ Development

### **Local Testing:**

Karena ada CORS issue saat buka file langsung, gunakan web server:

**Option 1: VS Code Live Server**
1. Install extension "Live Server"
2. Right-click `index.html` → Open with Live Server

**Option 2: Python HTTP Server**
```bash
python -m http.server 8000
```
Lalu buka: `http://localhost:8000`

**Option 3: Node.js HTTP Server**
```bash
npx http-server
```

---

## 📁 File Dependencies

### **Halaman Index (Daftar Manga)**
- `index.html`
- `style.css`
- `script.js`
- `manga-config.js` ✅

### **Halaman Info Manga**
- `info-manga.html`
- `info-manga.css`
- `info-manga.js`
- `manga-config.js` ✅
- `manga-repos.json` ✅

### **Halaman Reader**
- `reader.html`
- `reader.css`
- `reader.js`
- `manga-config.js` ✅
- `manga-repos.json` ✅

---

## 🐛 Troubleshooting

### **1. Manga tidak muncul di website**

**✓ Checklist:**
- [ ] Sudah tambah di `manga-config.js`?
- [ ] Sudah tambah di `manga-repos.json`?
- [ ] URL `manga.json` bisa diakses?
- [ ] Sudah commit & push?
- [ ] Clear browser cache (Ctrl+F5)

### **2. Cover tidak muncul**

**✓ Checklist:**
- [ ] File cover ada di folder `covers/`?
- [ ] Path cover di `manga-config.js` benar?
- [ ] Jalankan `node download-covers.js`
- [ ] Cek console browser untuk error

### **3. Chapter tidak bisa dibuka**

**✓ Checklist:**
- [ ] Repository chapter sudah public?
- [ ] Struktur folder chapter benar?
- [ ] File `manga.json` format valid?
- [ ] URL di `manga-repos.json` benar?

### **4. View counter tidak jalan**

**✓ Checklist:**
- [ ] Google Apps Script URL valid?
- [ ] Script deployed as web app?
- [ ] Permissions: Anyone (bahkan anonymous)
- [ ] Check console untuk fetch errors

---

## 📞 Support

- **Facebook**: [Nurananto Scanlation](https://web.facebook.com/profile.php?id=61556658895013)
- **Donasi**: [Trakteer.id/NuranantoScanlation](https://trakteer.id/NuranantoScanlation)
- **GitHub**: [Issues](https://github.com/nurananto/NuranantoScanlation/issues)

---

## 📜 License

MIT License - Free to use and modify

---

## 🙏 Credits

- **MangaDex API** - Cover images
- **GitHub Pages** - Hosting
- **Google Apps Script** - View counter
- **Trakteer** - Donation platform

---

**Made with ❤️ by Nurananto Scanlation Team**
