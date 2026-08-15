# Panduan Memakai API Kopi Times

Panduan langkah demi langkah untuk mengambil dan mencari data berita & member
Kopi Times lewat halaman dokumentasi — **tanpa perlu jadi programmer**.

---

## Apa ini?

Sistem menyediakan sebuah **API** — pintu untuk mengambil data secara langsung,
seperti daftar berita Kopi Times beserta penulisnya. Kamu tidak perlu menulis kode:
ada halaman **dokumentasi interaktif (Swagger)** yang bisa dipakai langsung dari
browser untuk mencoba dan melihat hasilnya.

Untuk masuk, kamu butuh satu **kunci akses (API key)** yang diberikan oleh admin.
Anggap saja seperti kata sandi khusus untuk pintu ini.

## Yang perlu disiapkan

1. **Browser** apa saja (Chrome, Edge, Firefox).
2. **Alamat dokumentasi**: alamat aplikasi diikuti `/api/documentation` —
   misalnya `https://cms.domainmu.com/api/documentation`.
3. **API key** dari admin/tim IT. Simpan baik-baik dan jangan dibagikan sembarangan.

---

## Langkah pemakaian

Ikuti berurutan dari atas ke bawah.

### 1. Buka halaman dokumentasi
Ketik alamat `/api/documentation` di browser. Akan muncul halaman berjudul
**TIN CMS API** dengan daftar endpoint yang bisa dibuka-tutup.

### 2. Masukkan API key (Authorize)
Klik tombol hijau **Authorize** di kanan atas. Pada kotak yang muncul, tempel
**API key**-mu di kolom **Value**, lalu klik **Authorize** sekali lagi dan tutup
kotaknya.

> 💡 Cukup dilakukan **sekali** selama halaman terbuka. Kunci ini dikirim otomatis
> di setiap percobaan lewat header `X-API-KEY`.

### 3. Pilih data yang mau diambil
Klik salah satu baris endpoint untuk membukanya. Tersedia dua:

- `GET /api/kopi-times/news` — daftar berita Kopi Times.
- `GET /api/kopi-times/members` — daftar member (penulis).

### 4. Isi kolom pencarian
Klik tombol **Try it out**, lalu isi kolom yang kamu perlukan (misalnya judul atau
nama). **Semua kolom opsional** — biarkan kosong kalau tidak dipakai. Rincian tiap
kolom ada di bagian [Referensi kolom](#referensi-kolom-pencarian) di bawah.

### 5. Jalankan & lihat hasil
Klik tombol biru **Execute**. Hasil muncul di bawahnya dalam kotak **Response body**
berupa data terstruktur (JSON). Cara membacanya ada di bagian
[Membaca hasil](#membaca-hasil).

---

## Referensi kolom pencarian

Arti tiap kolom dalam bahasa sederhana. Kalau beberapa kolom diisi bersamaan,
hasilnya harus cocok **semuanya**.

### `GET /api/kopi-times/news`
Daftar berita Kopi Times, lengkap dengan data penulis dan berita nasional terkait
(tautan, judul, deskripsi, isi).

| Kolom | Isi dengan… |
|---|---|
| `q_title` | Kata pada **judul** berita (atau kode berita). Contoh: `pemilu`. |
| `q_member` | Nama atau email **penulis/member**. Contoh: `budi`. |
| `member` | **ID member** (angka) untuk menampilkan berita dari satu member saja. Ambil ID-nya dari endpoint members. |
| `status` | Angka status berita, bila ingin menyaring. |
| `per_page` | Jumlah item per halaman (bawaan 15, maksimal 100). |

### `GET /api/kopi-times/members`
Daftar member Kopi Times (penulis berbayar).

| Kolom | Isi dengan… |
|---|---|
| `q_name` | Nama atau email member. Contoh: `budi`. |
| `q_instansi` | Nama instansi atau kota. Contoh: `malang`. |
| `active` | Isi `1` untuk menampilkan hanya member yang langganannya masih aktif. |
| `status` | Angka status member, bila ingin menyaring. |
| `per_page` | Jumlah item per halaman (bawaan 15, maksimal 100). |

---

## Contoh penggunaan

🎯 **Cari berita yang judulnya memuat kata "pemilu"**
Buka `/api/kopi-times/news` → **Try it out** → isi `q_title` = `pemilu` → **Execute**.

🎯 **Cari member bernama "Budi" yang masih aktif**
Buka `/api/kopi-times/members` → isi `q_name` = `budi` dan `active` = `1` → **Execute**.

🎯 **Lihat semua berita dari satu member tertentu**
Cari dulu member di endpoint **members**, catat angka `id`-nya. Lalu di endpoint
**news** isi `member` = angka ID tadi → **Execute**.

---

## Membaca hasil

Hasil datang **per halaman**, bukan sekaligus. Penanda penting di kotak hasil:

- `data` — **daftar isinya** ada di sini (tiap berita/member satu blok).
- `total` — jumlah seluruh data yang cocok dengan pencarianmu.
- `current_page` & `per_page` — halaman keberapa yang sedang tampil dan berapa item
  per halaman.

> 💡 Ingin melihat halaman berikutnya? Tambahkan kolom `page` = `2`, `3`, dan
> seterusnya, lalu **Execute** lagi. Atau perbesar `per_page` (maksimal 100).

---

## Kalau ada masalah

| Yang muncul | Artinya & solusinya |
|---|---|
| **401 Unauthorized** | API key salah atau belum di-Authorize. Ulangi **Langkah 2** dan pastikan kunci ditempel dengan benar (tanpa spasi berlebih). |
| `data` kosong `[ ]` | Tidak ada data yang cocok. Coba kata kunci lebih pendek, atau kosongkan sebagian kolom. |
| Halaman tidak terbuka | Pastikan alamatnya benar dan aplikasi sedang berjalan. Bila tetap gagal, hubungi admin. |
| Belum punya API key | Minta kepada admin / tim IT. Kunci ini bersifat rahasia — jangan sebar. |

> 🔒 **Jaga kerahasiaan API key.** Siapa pun yang memilikinya bisa mengambil data
> ini. Jangan tempel di grup chat, tangkapan layar, atau dokumen publik.

---

## Untuk pengguna teknis (opsional)

Memanggil langsung tanpa Swagger — kirim API key di header `X-API-KEY`:

```bash
curl -s "https://cms.domainmu.com/api/kopi-times/news?q_title=pemilu&per_page=5" \
  -H "X-API-KEY: <API_KEY_ANDA>"
```

Endpoint & kolom mengikuti dokumentasi Swagger pada `/api/documentation`.
