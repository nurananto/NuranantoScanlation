# 📘 CARA TAMBAH MANGA BARU - SUPER MUDAH!

## 🎯 **Yang Perlu Diupdate: CUMA 1 FILE!**

File: **`manga-config.js`**

---

## ✅ **LANGKAH-LANGKAH:**

### **Step 1: Buka file `manga-config.js`**

### **Step 2: Copy template ini:**

```javascript
{
  id: 'idmangabaru',                    // ← ID unik (lowercase, no space)
  title: 'Judul Manga Lengkap',         // ← Judul manga
  cover: 'covers/nama-file-cover.jpg',  // ← Path ke cover image
  repo: 'NamaRepoGitHub'                // ← Nama repo GitHub (EXACT!)
}
```

### **Step 3: Paste di PALING ATAS array `MANGA_LIST`**

```javascript
const MANGA_LIST = [
  // ← PASTE DI SINI (paling atas untuk manga terbaru)
  {
    id: 'mangabaru',
    title: 'Manga Baru yang Keren Banget',
    cover: 'covers/manga-baru-cover.jpg',
    repo: 'MangaBaruRepo'
  },
  // ... manga lainnya di bawah
];
```

### **Step 4: Save & Push**

```bash
git add manga-config.js
git commit -m "Add new manga: Manga Baru"
git push
```

### **Step 5: DONE! 🎉**

Manga otomatis muncul di:
- ✅ Halaman utama (index.html)
- ✅ Halaman info manga (info-manga.html)  
- ✅ Reader (reader.html)

---

## 📋 **CONTOH LENGKAP:**

### **Scenario: Tambah Manga "Solo Leveling"**

**1. Siapkan Data:**
- Nama repo GitHub: `SoloLeveling`
- Cover sudah ada di: `covers/solo-leveling-xxx.jpg`

**2. Edit `manga-config.js`:**

```javascript
const MANGA_LIST = [
  // MANGA BARU - PASTE DI SINI!
  {
    id: 'sololeveling',
    title: 'Solo Leveling',
    cover: 'covers/solo-leveling-xxx.jpg',
    repo: 'SoloLeveling'
  },
  
  // Manga lama di bawah
  {
    id: 'kawaiigal',
    title: 'Class de Ichiban Kawaii Gal...',
    cover: 'covers/class-de-ichiban-kawaii-gal...',
    repo: 'KawaiiGal'
  },
  // ... dst
];
```

**3. Push:**

```bash
git add manga-config.js
git commit -m "Add Solo Leveling"
git push
```

**4. Result:**

URL otomatis jadi:
- `https://raw.githubusercontent.com/nurananto/SoloLeveling/main/manga.json`
- `https://raw.githubusercontent.com/nurananto/SoloLeveling/main/chapters.json`
- Chapter images: `https://raw.githubusercontent.com/nurananto/SoloLeveling/main/1/001.jpg`

---

## ⚠️ **PENTING! Field yang Harus Benar:**

### **1. `id` (Identifier)**
- ✅ Lowercase
- ✅ No spaces (gunakan underscore jika perlu)
- ✅ Unik (tidak sama dengan manga lain)
- ❌ Jangan pakai special characters

**Contoh:**
```javascript
✅ id: 'sololeveling'
✅ id: 'one_piece'
❌ id: 'Solo Leveling'  // Ada spasi
❌ id: 'solo-leveling'  // Ada dash (bisa, tapi avoid)
```

### **2. `title` (Judul Manga)**
- Bebas, boleh pakai spasi, special chars, etc.

### **3. `cover` (Path Cover Image)**
- Path relatif dari root website
- Format: `covers/nama-file.jpg`

### **4. `repo` (Nama Repo GitHub)**
- **HARUS EXACT** sama dengan nama repo di GitHub!
- Case-sensitive!

**Contoh:**
```javascript
// Repo di GitHub: SoloLeveling
✅ repo: 'SoloLeveling'
❌ repo: 'sololeveling'  // Salah! Case berbeda
❌ repo: 'solo-leveling' // Salah! Nama berbeda
```

---

## 🔍 **Cara Cek Nama Repo yang Benar:**

### **Option 1: Buka GitHub**
```
https://github.com/nurananto
```
Lihat list repo, copy nama yang exact.

### **Option 2: Dari URL Repo**
```
https://github.com/nurananto/SoloLeveling
                              ^^^^^^^^^^^^
                              Ini nama repo!
```

### **Option 3: Clone/Pull Repo**
```bash
git clone https://github.com/nurananto/NamaRepoYangBenar
```

---

## 📊 **Struktur File Setelah Refactor:**

```
NuranantoScanlation/
├── manga-config.js          ← EDIT INI SAJA!
├── script.js                ← No need to edit
├── info-manga.js            ← No need to edit
├── reader.js                ← No need to edit
├── index.html               ← Load manga-config.js
├── info-manga.html          ← Load manga-config.js
├── reader.html              ← Load manga-config.js
└── covers/
    ├── manga-1-cover.jpg
    ├── manga-2-cover.jpg
    └── ...
```

---

## 🎯 **Keuntungan Sistem Baru:**

### **Sebelum (Manual):**
❌ Update `script.js` → tambah di `mangaList`
❌ Update `info-manga.js` → tambah di `MANGA_REPOS`
❌ Rawan typo, tidak sinkron
❌ Duplikasi data

### **Setelah (Automatic):**
✅ Update `manga-config.js` SAJA
✅ Otomatis sync ke semua halaman
✅ Single source of truth
✅ No duplikasi

---

## 🚀 **Quick Checklist:**

Setiap kali tambah manga baru:

- [ ] Repo manga sudah dibuat di GitHub?
- [ ] Cover image sudah ada di folder `covers/`?
- [ ] Sudah tau nama repo GitHub yang EXACT?
- [ ] Edit `manga-config.js`
- [ ] Paste entry baru di PALING ATAS array
- [ ] Field `id`, `title`, `cover`, `repo` sudah benar?
- [ ] Git add, commit, push
- [ ] Refresh website → manga muncul! 🎉

---

## ❓ **Troubleshooting:**

### **Problem: Manga tidak muncul di website**

**Check:**
1. Apakah `manga-config.js` sudah di-push?
2. Apakah nama `repo` benar (case-sensitive)?
3. Apakah file `manga.json` ada di repo manga?
4. Clear cache browser (Ctrl + Shift + R)

### **Problem: Cover tidak muncul**

**Check:**
1. Apakah path `cover` benar?
2. Apakah file cover ada di folder `covers/`?
3. Typo di nama file?

### **Problem: Error 404 saat fetch data**

**Check:**
1. Nama repo salah (case-sensitive!)
2. Repo tidak public?
3. File `manga.json` belum ada?

---

## 📱 **Contact:**

Kalau masih bingung atau ada error:
- Facebook: Nurananto Scanlation
- GitHub Issues: https://github.com/nurananto/NuranantoScanlation/issues

---

**Happy Manga Uploading! 🎉**
