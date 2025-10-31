# 📚 Nurananto Scanlation - Website Manga

Website manga scanlation modern dengan sistem automasi lengkap untuk menampilkan dan membaca manga terjemahan.

---

## 📖 Daftar Isi

1. [Penjelasan File & Fungsinya](#-penjelasan-file--fungsinya)
2. [Setup Awal](#-setup-awal)
3. [Konfigurasi Website](#-konfigurasi-website)
4. [Menambah Manga Baru](#-menambah-manga-baru)
5. [Automasi Cover](#-automasi-cover)
6. [Deploy ke GitHub Pages](#-deploy-ke-github-pages)
7. [FAQ](#-faq)

---

## 📁 Penjelasan File & Fungsinya

### **File HTML (Halaman Website)**

#### `index.html`
**Fungsi:** Halaman utama yang menampilkan daftar manga
- Grid card manga dengan cover
- Search bar untuk cari manga
- Badge "UPDATED!" untuk manga baru
- Sort otomatis berdasarkan update terbaru

**Yang Perlu Diedit:**
```html
<!-- Line 13: Ganti nama website di title -->
<title>Nurananto Scanlation</title>

<!-- Line 16: Ganti path logo -->
<img src="assets/logo.png" alt="Nurananto Scanlation">

<!-- Line 19: Ganti URL GitHub repo -->
<a href="https://github.com/nurananto/NuranantoScanlation">

<!-- Line 27: Ganti URL Facebook -->
<a href="https://web.facebook.com/profile.php?id=61556658895013">

<!-- Line 59: Ganti URL Trakteer -->
<a href="https://trakteer.id/NuranantoScanlation">

<!-- Line 60: Ganti path icon Trakteer -->
<img src="assets/trakteer-icon.png">
```

#### `info-manga.html`
**Fungsi:** Halaman detail manga (sinopsis, genre, daftar chapter)
- Cover manga
- Info author, artist, genre
- Sinopsis lengkap
- Daftar chapter dengan views
- Link MangaDex dan RAW

**Yang Perlu Diedit:**
```html
<!-- Line 48-52: Sama seperti index.html -->
<!-- Ganti logo, GitHub, Facebook URL -->
```

#### `reader.html`
**Fungsi:** Halaman baca manga (webtoon mode)
- Scroll vertical untuk baca
- Navigation antar chapter
- Protection anti copy/download
- Page navigation thumbnails

**Yang Perlu Diedit:**
```html
<!-- Tidak perlu edit, sudah otomatis! -->
```

---

### **File CSS (Tampilan/Style)**

#### `style.css`
**Fungsi:** Style untuk `index.html`
- Dark theme
- Responsive grid (desktop/tablet/mobile)
- Card hover effects
- Badge "UPDATED!" styling

**Yang Perlu Diedit:**
```css
/* Line 8-15: Ganti warna tema (opsional) */
:root {
  --primary-color: #1877f2;  /* Warna utama (biru Facebook) */
  --bg-dark: #111;           /* Background gelap */
  --bg-card: #1a1a1a;        /* Background card */
}
```

#### `info-manga.css`
**Fungsi:** Style untuk `info-manga.html`

#### `reader.css`
**Fungsi:** Style untuk `reader.html`

> **Catatan:** File CSS tidak perlu diedit kecuali ingin ganti warna tema!

---

### **File JavaScript (Logika Website)**

#### `manga-config.js` ⭐ **FILE PALING PENTING**
**Fungsi:** Database manga - SATU-SATUNYA tempat data manga
- List semua manga
- Cover path
- Repo GitHub per manga
- Generate URL otomatis

**HARUS DIEDIT:**
```javascript
// Line 15-105: Daftar manga
MANGA_LIST = [
  {
    id: 'wakachan',                    // ID unik (huruf kecil, no spasi)
    title: 'Waka-chan wa Kyou mo Azatoi',  // Judul manga
    cover: 'covers/wakachan-hash.jpg', // Path cover (auto-update)
    repo: 'wakachan'                   // Nama repo GitHub manga
  },
  // ... tambah manga baru di sini
];

// Line 131: Ganti username GitHub
function getMangaDataURL(manga) {
  return `https://raw.githubusercontent.com/nurananto/${manga.repo}/main/manga.json`;
  //                                        ^^^^^^^^ GANTI INI!
}

// Line 135, 139: Sama, ganti username
```

#### `script.js`
**Fungsi:** Logic untuk `index.html`
- Fetch data manga dari repo
- Sort manga by update terbaru
- Search manga
- Create card manga

**Yang Perlu Diedit:**
```javascript
// Line 4: Ganti username GitHub
const response = await fetch(`https://raw.githubusercontent.com/nurananto/${repo}/main/manga.json`);
//                                                            ^^^^^^^^ GANTI!
```

#### `info-manga.js`
**Fungsi:** Logic untuk `info-manga.html`
- Load manga detail
- Display chapter list
- View counter
- Open chapter di reader

**Yang Perlu Diedit:**
```javascript
// Line 32: Link Trakteer untuk chapter locked
const TRAKTEER_LINK = 'https://trakteer.id/NuranantoScanlation';
//                                        ^^^^^^^^^^^^^^^^^^^^^ GANTI!

// Line 35: Google Apps Script URL (view counter)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/...';
//                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ GANTI!
// (Opsional, bisa dikosongkan jika tidak pakai view counter)
```

#### `reader.js`
**Fungsi:** Logic untuk `reader.html`
- Load images chapter
- Navigation prev/next page
- Track view chapter
- Protection anti-screenshot

**Yang Perlu Diedit:**
```javascript
// Line 32: Link Trakteer (sama seperti info-manga.js)
const TRAKTEER_LINK = 'https://trakteer.id/NuranantoScanlation';

// Line 35: Google Apps Script URL (sama)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/...';
```

---

### **File Automation (GitHub Actions)**

#### `download-covers.js` ⭐ **SCRIPT AUTO-UPDATE COVER**
**Fungsi:** Download cover terbaru dari MangaDex
- Fetch manga.json dari setiap repo manga
- Ambil cover TERBARU dari MangaDex API
- Replace cover lama dengan baru
- Update `manga-config.js` otomatis
- Sync cover ke 15 repo manga

**Yang Perlu Diedit:**
```javascript
// Line 355-359: Ganti username GitHub di URL
const coverUrl = `https://raw.githubusercontent.com/nurananto/NuranantoScanlation/refs/heads/main/${manga.cover}`;
const configUrl = `https://raw.githubusercontent.com/nurananto/${manga.repo}/main/manga-config.json`;
//                                                ^^^^^^^^ GANTI!
```

#### `.github/workflows/update-covers.yml` ⭐ **WORKFLOW AUTO-UPDATE**
**Fungsi:** GitHub Action untuk auto-update cover setiap 14 hari
- Jalankan `download-covers.js`
- Commit & push perubahan
- Trigger sync ke 15 repo manga

**Yang Perlu Diedit:**
```yaml
# Line 52-53: Daftar repo manga
repos=("10nenburi" "wakachan" "KawaiiGal" ...)
# GANTI dengan list repo manga kamu!

# Line 58: Ganti username GitHub
https://api.github.com/repos/nurananto/$repo/dispatches
#                             ^^^^^^^^ GANTI!
```

---

## 🚀 Setup Awal

### **Step 1: Fork/Clone Repo**
```bash
# Clone repo ini
git clone https://github.com/nurananto/NuranantoScanlation.git
cd NuranantoScanlation
```

### **Step 2: Ganti Semua Username GitHub**

**File yang HARUS diganti:**
1. `manga-config.js` (line 131, 135, 139)
2. `script.js` (line 4)
3. `download-covers.js` (line 355-356)
4. `.github/workflows/update-covers.yml` (line 58)

**Cara cepat ganti semua:**
```bash
# Linux/Mac - Replace di semua file sekaligus
find . -type f \( -name "*.js" -o -name "*.yml" \) -exec sed -i 's/nurananto/USERNAME_KAMU/g' {} +

# Windows - Pakai search & replace di VS Code
# Ctrl+Shift+H → Find: "nurananto" → Replace: "USERNAME_KAMU"
```

### **Step 3: Update Assets**

**Siapkan file di folder `assets/`:**
```
assets/
├── logo.png          ← Logo scanlation kamu (min. 300x80px)
└── trakteer-icon.png ← Icon Trakteer (24x24px)
```

### **Step 4: Setup GitHub Pages**

1. GitHub repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → Folder: **/ (root)**
4. Save

**Website akan online di:**
```
https://USERNAME_KAMU.github.io/NAMA_REPO/
```

---

## ⚙️ Konfigurasi Website

### **1. Ganti Informasi Dasar**

#### **File: `index.html`**
```html
<!-- Ganti title -->
<title>Nama Scanlation Kamu</title>

<!-- Ganti logo -->
<img src="assets/logo.png" alt="Nama Scanlation Kamu">

<!-- Ganti URL Facebook -->
<a href="https://web.facebook.com/profile.php?id=FACEBOOK_ID_KAMU">

<!-- Ganti URL Trakteer -->
<a href="https://trakteer.id/USERNAME_TRAKTEER_KAMU">
```

#### **File: `info-manga.html`**
```html
<!-- Sama seperti index.html, ganti logo, Facebook, dll -->
```

### **2. Setup Link Donasi**

#### **File: `info-manga.js` dan `reader.js`**
```javascript
// Ganti URL Trakteer
const TRAKTEER_LINK = 'https://trakteer.id/USERNAME_KAMU';
```

### **3. Setup View Counter (Opsional)**

Jika ingin pakai view counter:

1. Buat Google Apps Script
2. Deploy sebagai Web App
3. Copy URL
4. Paste di `info-manga.js` dan `reader.js`:

```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/URL_KAMU/exec';
```

**Jika tidak mau pakai view counter:**
```javascript
// Kosongkan saja
const GOOGLE_SCRIPT_URL = '';
```

---

## ➕ Menambah Manga Baru

### **Step 1: Buat Repo Manga**

Contoh: Manga baru "One Punch Man"

1. Buat repo baru: `OnePunchMan`
2. Upload chapter manga ke repo tersebut
3. Pastikan ada file `manga.json` dan `chapters.json`

### **Step 2: Tambah Entry di `manga-config.js`**

```javascript
MANGA_LIST = [
  // Paste di PALING ATAS array (urutan manga terbaru)
  {
    id: 'onepunchman',                 // Unique ID (lowercase, no space)
    title: 'One Punch Man',            // Judul manga
    cover: 'covers/onepunchman-xxx.jpg', // Path cover (nanti auto-update)
    repo: 'OnePunchMan'                // Nama repo GitHub
  },
  
  // Manga lain di bawah...
  {
    id: 'wakachan',
    title: 'Waka-chan wa Kyou mo Azatoi',
    cover: 'covers/wakachan-c15f762d.jpg',
    repo: 'wakachan'
  },
  // ...
];
```

### **Step 3: Download Cover Pertama Kali**

**Opsi 1: Manual (Cepat)**
```bash
# Download cover dari MangaDex
# Save as: covers/onepunchman-HASH.jpg

# Update path di manga-config.js:
cover: 'covers/onepunchman-HASH.jpg'
```

**Opsi 2: Auto (Pakai Script)**
```bash
# Jalankan script download cover
node download-covers.js

# Script akan otomatis:
# 1. Fetch manga.json dari repo OnePunchMan
# 2. Ambil cover dari MangaDex
# 3. Download ke folder covers/
# 4. Update manga-config.js otomatis
```

### **Step 4: Commit & Push**

```bash
git add covers/ manga-config.js
git commit -m "Add manga: One Punch Man"
git push
```

**✅ Manga baru otomatis muncul di website!**

---

## 🖼️ Automasi Cover

### **Setup Personal Access Token (PAT)**

Agar workflow bisa auto-sync cover ke semua repo manga:

#### **Step 1: Buat PAT Token**

1. GitHub → Settings → Developer settings
2. Personal access tokens → **Tokens (classic)**
3. Generate new token (classic)
4. **Name:** `MANGA_SYNC_TOKEN`
5. **Expiration:** 1 year
6. **Scopes:** 
   - ✅ `repo` (Full control)
   - ✅ `workflow` (Update workflows)
7. Generate → **Copy token!**

#### **Step 2: Simpan Token di Repo**

1. Repo website → Settings → Secrets and variables → Actions
2. New repository secret
3. **Name:** `PAT_TOKEN`
4. **Value:** (paste token dari step 1)
5. Add secret

### **Cara Kerja Auto-Update Cover**

```
Setiap 14 hari / manual trigger:
  ↓
1. Workflow update-covers.yml jalan
  ↓
2. Script download-covers.js:
   - Loop 15 manga
   - Fetch manga.json dari setiap repo
   - Ambil cover TERBARU dari MangaDex
   - Download cover baru
   - Hapus cover lama
   - Update manga-config.js
  ↓
3. Commit & push perubahan
  ↓
4. Trigger sync-cover.yml di 15 repo manga
  ↓
5. Update manga-config.json di setiap repo
```

### **Manual Trigger Cover Update**

1. GitHub repo → **Actions**
2. Workflow: **Auto Update Manga Covers**
3. Run workflow
4. Wait ~2-3 menit
5. ✅ Cover ter-update!

---

## 🌐 Deploy ke GitHub Pages

### **Aktifkan GitHub Pages**

1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → `/` (root)
4. **Save**

**Website online di:**
```
https://USERNAME_KAMU.github.io/NAMA_REPO/
```

### **Custom Domain (Opsional)**

Jika punya domain sendiri (contoh: `mangasaya.com`):

1. Buat file `CNAME` di root repo:
   ```
   mangasaya.com
   ```

2. Setting DNS di provider domain:
   ```
   Type: CNAME
   Name: @ (atau www)
   Value: USERNAME_KAMU.github.io
   ```

3. GitHub Pages → Custom domain → `mangasaya.com` → Save

---

## ❓ FAQ

### **Q: Manga tidak muncul di website?**

**A:** Cek:
1. `manga-config.js` → Pastikan entry manga sudah ditambah
2. `manga.json` → Pastikan ada di repo manga
3. Console browser (F12) → Cek error

### **Q: Cover 404 / tidak muncul?**

**A:** 
1. Cek path cover di `manga-config.js`:
   ```javascript
   cover: 'covers/wakachan-HASH.jpg'  // ✅ Benar
   cover: 'wakachan-HASH.jpg'         // ❌ Salah (kurang covers/)
   ```

2. Pastikan file cover ada di folder `covers/`

3. Trigger workflow `update-covers.yml` untuk re-download

### **Q: GitHub Action failed?**

**A:** Cek:
1. **PAT_TOKEN** → Pastikan sudah disimpan di Secrets
2. Token permission → Harus punya akses `repo` & `workflow`
3. Username GitHub → Pastikan sudah diganti di semua file

### **Q: View counter tidak jalan?**

**A:**
1. Jika tidak perlu view counter, kosongkan:
   ```javascript
   const GOOGLE_SCRIPT_URL = '';
   ```

2. Jika mau pakai, setup Google Apps Script dulu

### **Q: Website blank / error di browser?**

**A:**
1. Buka Console (F12) → Lihat error
2. Biasanya: path file salah atau `manga-config.js` tidak ke-load
3. Cek struktur folder:
   ```
   ├── index.html
   ├── manga-config.js  ← HARUS di root!
   ├── script.js
   ├── covers/
   └── assets/
   ```

### **Q: Cara update workflow di semua repo manga?**

**A:**
1. Update file `sync-cover.yml` atau `manga-automation.yml`
2. Copy ke semua repo manga (15 repo)
3. Commit & push di masing-masing repo

**Atau:** Buat script bash:
```bash
#!/bin/bash
repos=("10nenburi" "wakachan" "KawaiiGal" ...)

for repo in "${repos[@]}"; do
  cd ../$repo
  cp ../NuranantoScanlation/.github/workflows/sync-cover.yml .github/workflows/
  git add .github/workflows/sync-cover.yml
  git commit -m "Update sync-cover.yml"
  git push
  cd ../NuranantoScanlation
done
```

---

## 📝 Checklist Setup

Gunakan checklist ini untuk memastikan setup sudah benar:

### **Setup Dasar**
- [ ] Fork/clone repo
- [ ] Ganti semua username `nurananto` → username kamu
- [ ] Upload logo & assets
- [ ] Update link Facebook & Trakteer
- [ ] Aktifkan GitHub Pages

### **Konfigurasi Manga**
- [ ] Edit `manga-config.js` → Tambah entry manga
- [ ] Buat repo manga (1 repo per manga)
- [ ] Upload cover ke folder `covers/`
- [ ] Test buka website → Manga muncul?

### **Automasi (Opsional)**
- [ ] Buat PAT Token
- [ ] Simpan token di Secrets (`PAT_TOKEN`)
- [ ] Edit `update-covers.yml` → List repo manga
- [ ] Test workflow: Manual trigger → Berhasil?

### **Finishing**
- [ ] Test semua link (GitHub, Facebook, Trakteer)
- [ ] Test baca manga di reader
- [ ] Test search manga
- [ ] Cek responsive (mobile/tablet/desktop)

---

## 🎉 Selesai!

Website manga kamu sudah online! 

**Next Steps:**
- Upload chapter manga ke repo manga
- Share website ke social media
- Promote di grup manga Indonesia

**Need Help?**
- Buka issue di GitHub repo
- DM di Facebook Page

---

**Created by Nurananto Scanlation**
