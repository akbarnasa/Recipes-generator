# 🍳 Dapur AI — Rekomendasi Resep

Aplikasi web untuk mendapatkan rekomendasi resep masakan berdasarkan bahan-bahan yang kamu miliki, didukung oleh AI (Groq).

---


## ⚙️ Cara Menjalankan di Local

### 1. Clone Repository

```bash
git clone https://github.com/akbarnasa/Recipes-generator.git
cd Recipes-generator
```

### 2. Buat Virtual Environment

```bash
py -m venv .venv
```

Aktifkan virtual environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# Windows CMD
.venv\Scripts\activate.bat
```

### 3. Install Dependencies

```bash
py -m pip install -r requirements.txt
```

### 4. Dapatkan API Key Groq (Gratis)

1. Buka 👉 https://console.groq.com
2. Login / daftar akun
3. Klik **API Keys → Create API Key**
4. Copy API key (bentuknya `gsk_...`)

### 5. Buat File `.env`

Buat file baru bernama `.env` di root folder proyek, isi dengan:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
```

Ganti `gsk_xxxxxxxxxxxxxxxx` dengan API key asli kamu.

### 6. Jalankan Server

```bash
py server.py
```

Jika berhasil, terminal akan menampilkan:

```
🍳 Dapur AI server berjalan di http://localhost:5000
 * Running on http://127.0.0.1:5000
```

### 7. Buka Aplikasi

Buka browser dan akses:

```
http://localhost:5000
```

---

## 🚀 Cara Penggunaan

1. Ketik nama bahan yang kamu punya di kolom input, tekan **Enter** atau **koma**
2. Atau klik tombol bahan yang tersedia (Ayam, Tahu, Telur, dll)
3. Pilih tingkat kesulitan, jenis masakan, dan jumlah resep
4. Klik **Carikan Resep**
5. Klik kartu resep untuk melihat detail lengkap beserta langkah memasak
6. Klik **▶ Tonton Tutorial di YouTube** untuk melihat video tutorialnya

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Fungsi |
|---|---|
| HTML, CSS, JavaScript | Frontend / tampilan |
| Python + Flask | Backend server |
| Groq API (LLaMA 3.1) | AI rekomendasi resep |
| python-dotenv | Manajemen API key |

---

## ⚠️ Catatan Penting

- Jangan share atau push file `.env` ke GitHub karena berisi API key
- Server Flask harus tetap berjalan selama menggunakan aplikasi
- Groq API gratis dengan limit harian yang cukup untuk penggunaan normal
