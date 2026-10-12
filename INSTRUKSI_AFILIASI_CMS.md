# Instruksi: Fitur Afiliasi (untuk CMS Redaksi)

Bangun layar **admin program afiliasi**: kelola afiliator, tinjau komisi, dan cairkan pembayaran. CMS ini dan aplikasi publik (`kopi.times.co.id`) **berbagi DB yang sama** (`timesindo_ajp`).

> Prinsip: minimal. Pakai pola/komponen yang **sudah ada** di CMS ini (layout, tabel, form, validasi). Jangan bikin abstraksi baru, jangan tambah dependency. Bangun hanya yang diminta.

## Konteks

Program afiliasi 2 tingkat untuk mengejar member baru. Harga membership baru **Rp 48.000**; perpanjangan memakai harga lama dan **tidak** menghasilkan komisi.

Pembagian per pembayaran member baru **yang punya perekrut**:

| Pos (`role`) | Penerima | Dasar | Tarif | Nominal |
|---|---|---|---|---|
| `tier1` | perekrut langsung | 48.000 | 20% | **9.600** |
| `tier2` | upline si perekrut | 38.400 | 5% | **1.920** |
| `internal` | alokasi tim IT / KITA AI | 38.400 | 10% | **3.840** |
| — | net kantor (tidak disimpan sebagai baris) | | sisa | **32.640** |

Aturan penting:

- **Member baru tanpa perekrut tidak menghasilkan baris komisi sama sekali**, termasuk pos `internal`. Rp 48.000 utuh ke kantor.
- Pos `internal` adalah angka internal. **Hanya boleh tampil di CMS**, tidak pernah di aplikasi publik.
- Komisi **ditahan 7 hari** sejak pembayaran lunas. Kolom `available_at` sudah berisi tanggalnya.
- Bila perekrut tidak punya upline, baris `tier2` **tetap dibuat** dengan `affiliate_id = NULL` dan `status = 'unassigned'`. Uang itu belum jadi milik siapa pun; manajemen memutuskan belakangan.

Alur di aplikasi publik, supaya gambaran utuh: pengunjung membuka `https://kopi.times.co.id/?ref=KODE` → kode disimpan di cookie 30 hari → saat ia mendaftar, barisnya dicatat di `affiliate_referrals` → saat pembayarannya lunas (callback Tripay), baris komisi dibuat di `affiliate_commissions` di dalam transaksi pembayaran.

## Kontrak Database (JANGAN ubah skema — tabel dibuat aplikasi publik)

Jangan membuat migration untuk keempat tabel di bawah. Cukup bikin Model, Controller, Route, dan View sesuai pola CMS ini.

### Tabel `affiliates` — dikelola penuh oleh CMS

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | bigint PK | |
| `user_id` | bigint nullable **unik** | id di tabel `wartawan`. Diisi kalau afiliator perlu login ke portal afiliasi. Boleh NULL untuk afiliator yang hanya dibayar transfer |
| `upline_id` | bigint nullable | id afiliator lain di tabel ini. Inilah tingkat kedua. Tidak boleh menunjuk dirinya sendiri atau membentuk lingkaran |
| `code` | string(32) **unik** | huruf besar + angka. Ini yang dipakai di `?ref=`. Generate otomatis, tawarkan tombol salin |
| `name` | string | wajib |
| `email` | string nullable unik | dipakai aplikasi publik untuk menolak self-referral |
| `phone` | string(30) nullable | |
| `payout_method` | enum `bank` \| `ewallet` | default `bank` |
| `bank_name`, `bank_account_number`, `bank_account_name` | string nullable | wajib diisi sebelum pencairan pertama |
| `status` | enum `pending` \| `active` \| `suspended` \| `inactive` | default `pending`. **Hanya `active` yang menghasilkan atribusi dan komisi baru** |
| `approved_at` | timestamp nullable | isi saat status jadi `active` |
| `note` | text nullable | catatan admin |
| `created_at`, `updated_at` | timestamp | |

### Tabel `affiliate_referrals` — HANYA BACA

Dicatat aplikasi publik saat member mendaftar. CMS **tidak boleh** insert, update, atau delete.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | |
| `user_id` | bigint unik | member yang direkrut (id di `wartawan`) |
| `affiliate_id` | bigint | perekrutnya |
| `code` | string(32) | kode yang benar-benar dipakai saat itu |
| `source` | enum `link` \| `manual` | dari link atau diketik di form |
| `created_at` | timestamp | waktu atribusi dikunci |

Koreksi atribusi yang salah adalah pengecualian manual yang harus dicatat, bukan fitur.

### Tabel `affiliate_commissions` — ledger, CMS hanya boleh mengubah status

| Kolom | Tipe | Keterangan | Boleh ditulis CMS |
|---|---|---|---|
| `id` | bigint PK | | — |
| `payment_id` | bigint | pembayaran sumber (`payments.id`) | **tidak** |
| `user_id` | bigint | member yang membayar | **tidak** |
| `role` | enum `tier1` \| `tier2` \| `internal` | pos pembagian | **tidak** |
| `affiliate_id` | bigint nullable | penerima. NULL untuk `internal`, dan untuk `tier2` yang `unassigned` | **hanya** untuk menetapkan penerima baris `unassigned` |
| `source_affiliate_id` | bigint nullable | perekrut langsung asal baris ini. Dipakai menelusuri baris `tier2` tertahan | **tidak** |
| `base_amount` | bigint | dasar hitung saat kejadian (48.000 / 38.400) | **tidak** |
| `rate_bps` | smallint | basis poin (2000 / 500 / 1000) | **tidak** |
| `amount` | bigint | nominal rupiah | **tidak** |
| `status` | enum (lihat di bawah) | default `accrued` | ya |
| `status_note` | string nullable | alasan tolak/batal | ya |
| `available_at` | timestamp | lunas + 7 hari. Syarat boleh disetujui | **tidak** |
| `payout_id` | bigint nullable | batch pencairan | ya |
| `approved_at`, `paid_at` | timestamp nullable | | ya |
| `created_at`, `updated_at` | timestamp | | — |

Ada unique index `(payment_id, role)`. Jangan pernah mencoba menyisipkan baris komisi dari CMS; kalaupun dicoba, index itu akan menolaknya.

> **Nominal komisi ditulis sekali oleh aplikasi publik di dalam transaksi pembayaran. Tidak ada pihak lain yang boleh mengubahnya.** Koreksi dilakukan lewat `status = 'reversed'` dan penyesuaian di pencairan berikutnya, bukan dengan mengedit `amount`.

### Tabel `affiliate_payouts` — dikelola penuh oleh CMS

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | bigint PK | |
| `affiliate_id` | bigint | satu batch untuk satu afiliator |
| `period_start`, `period_end` | date nullable | periode yang dicairkan |
| `amount` | bigint | **wajib sama dengan** jumlah `amount` seluruh komisi yang `payout_id`-nya menunjuk batch ini |
| `method` | enum `bank` \| `ewallet` | |
| `bank_name`, `bank_account_number`, `bank_account_name` | string nullable | salin dari `affiliates` saat batch dibuat, supaya jadi bukti rekening saat itu |
| `reference` | string nullable | nomor referensi transfer |
| `proof_path` | string nullable | path bukti transfer |
| `status` | enum `pending` \| `paid` \| `cancelled` | default `pending` |
| `paid_at` | timestamp nullable | |
| `note` | text nullable | |
| `created_at`, `updated_at` | timestamp | |

## Status dan transisinya

### Komisi (`affiliate_commissions.status`)

Aplikasi publik hanya pernah menulis `accrued` dan `unassigned`. Sisanya milik CMS.

```
accrued ──► approved ──► paid ──► reversed
   │            │
   │            └──► rejected
   └──► rejected

unassigned ──(admin menetapkan affiliate_id)──► approved ──► …
unassigned ──► rejected
```

Aturan:

- `accrued` → `approved` **hanya jika `available_at <= sekarang`** (masa tahan 7 hari). Isi `approved_at`.
- `approved` → `paid` hanya lewat batch pencairan yang berstatus `paid`. Isi `paid_at` dan `payout_id`.
- `rejected` bersifat final. Dipakai untuk pendaftaran fiktif atau komisi yang dibatalkan sebelum dibayar. Wajib mengisi `status_note`.
- `reversed` hanya dari `approved` atau `paid`, dipakai saat refund atau chargeback. Wajib mengisi `status_note`.
- `unassigned` adalah baris `tier2` tanpa upline. Tetap `unassigned` sampai admin menetapkan `affiliate_id`, baru boleh `approved`.

### Pencairan (`affiliate_payouts.status`)

```
pending ──► paid        (isi paid_at; semua komisi di batch jadi paid)
pending ──► cancelled   (lepaskan komisi: payout_id = NULL, status kembali approved)
```

Keduanya final. Kalau ada kekeliruan setelah `paid`, buat batch baru sebagai koreksi, jangan mengubah batch lama.

## Yang harus dibangun

1. **Daftar afiliator** — kolom: nama, kode, status, upline, jumlah member direkrut, total komisi (tertahan / siap cair / sudah dibayar). Filter per status, pencarian nama/kode/email.

2. **Tambah & ubah afiliator** — form: nama, email, phone, upline (pilih dari afiliator lain), status, metode dan data rekening, catatan.
   - `code` digenerate otomatis saat simpan, huruf besar + angka, **wajib unik** (URL publik bergantung ini).
   - Tombol salin link referral: `https://kopi.times.co.id/?ref={code}`.
   - Menautkan akun login: cari user berdasarkan email di tabel `wartawan`, lalu isi `user_id`. Satu user hanya boleh jadi satu afiliator.
   - Afiliator eksternal yang perlu login harus mendaftar lebih dulu di aplikasi publik (akun gratis, tanpa bayar), baru ditautkan di sini.

3. **Setujui / tangguhkan afiliator** — aksi cepat mengubah `status`, mengisi `approved_at` saat jadi `active`. Penangguhan menghentikan atribusi dan komisi **baru**; komisi lama tidak ikut batal.

4. **Daftar komisi** — kolom: tanggal, member, nama paket/nomor pembayaran, pos (`tier1`/`tier2`/`internal`), penerima, nominal, status, `available_at`. Filter per afiliator, status, pos, dan rentang tanggal. Aksi: setujui (massal), tolak dengan alasan, dan untuk baris `unassigned` tetapkan penerima.
   - Tombol setujui harus nonaktif selama `available_at > sekarang`.

5. **Laporan baris tertahan** — daftar khusus `status = 'unassigned'` beserta `source_affiliate_id`. Tanpa layar ini, uang tertahan tidak terlihat siapa pun.

6. **Batch pencairan** — pilih afiliator dan periode, sistem menarik semua komisi `approved` miliknya yang `payout_id`-nya masih NULL, hitung totalnya, lalu buat `affiliate_payouts` dan isi `payout_id` di komisi tersebut. Lanjutan: tandai lunas (isi `reference`, unggah bukti, set `paid_at`, semua komisinya jadi `paid`) atau batalkan (lepaskan kembali komisinya).

7. **Laporan rekap per periode** — pemasukan kotor, total `tier1`, total `tier2`, total `internal` (KITA AI), total tertahan, dan net kantor. **Hanya di CMS.**

8. **Deteksi kecurangan sederhana** — daftar afiliator dengan rasio mencurigakan, misalnya banyak member direkrut tetapi hampir tidak ada yang pernah mengirim tulisan, atau beberapa pendaftaran dari pola email yang mirip.

## Validasi

- `name`: required, string, max 255
- `email`: nullable, email, unik di `affiliates`
- `code`: required, unik, regex `^[A-Z0-9]{3,32}$` (auto-generate, tetap divalidasi)
- `upline_id`: nullable, ada di `affiliates`, **tidak boleh** dirinya sendiri dan tidak boleh membentuk lingkaran (telusuri rantai upline saat menyimpan)
- `user_id`: nullable, ada di `wartawan`, unik di `affiliates`
- `status`: required, in `pending,active,suspended,inactive`
- rekening: `bank_account_number` dan `bank_account_name` wajib saat membuat batch pencairan
- saat menolak atau membalik komisi: `status_note` wajib diisi
- saat menyetujui komisi: tolak jika `available_at > sekarang`

## Aturan bisnis (samakan dengan aplikasi publik)

- **Rumusnya tetap**: 20% dari harga, lalu 5% dan 10% dari sisa. Jangan menghitung ulang nominal; angkanya sudah ada di kolom `amount`, lengkap dengan `base_amount` dan `rate_bps` sebagai bukti cara hitungnya saat itu.
- **Net kantor tidak pernah jadi baris.** Hitung dengan `payments.amount - SUM(affiliate_commissions.amount)` untuk pembayaran terkait.
- Komisi hanya ada untuk **pembayaran member baru**: paket `level = 1` dan user belum pernah punya pembayaran lunas lain. Perpanjangan tidak pernah menghasilkan komisi.
- Masa tahan **7 hari** sudah terwujud sebagai `available_at`; patuhi kolom itu, jangan menghitung sendiri.
- Satu member selamanya milik satu perekrut. `affiliate_referrals` tidak pernah berubah.
- **Zona waktu**: aplikasi publik berjalan di `Asia/Jakarta` dan MySQL menyimpan datetime polos. Pastikan CMS juga `Asia/Jakarta`, kalau tidak setiap batas bulan di laporan akan meleset 7 jam.

## Contoh query

Rekap satu periode:

```sql
SELECT
  SUM(CASE WHEN role = 'tier1'    THEN amount ELSE 0 END) AS tier1,
  SUM(CASE WHEN role = 'tier2'    THEN amount ELSE 0 END) AS tier2,
  SUM(CASE WHEN role = 'internal' THEN amount ELSE 0 END) AS kita_ai,
  SUM(CASE WHEN status = 'unassigned' THEN amount ELSE 0 END) AS tertahan,
  SUM(amount) AS total_keluar
FROM affiliate_commissions
WHERE created_at BETWEEN ? AND ?
  AND status <> 'rejected';
```

Komisi siap cair milik satu afiliator:

```sql
SELECT * FROM affiliate_commissions
WHERE affiliate_id = ? AND status = 'approved' AND payout_id IS NULL;
```

Dua invariant yang wajib dijaga CMS (tidak dipaksakan database, periksa berkala):

```sql
-- 1. total batch harus sama dengan jumlah komisinya
SELECT p.id FROM affiliate_payouts p
LEFT JOIN affiliate_commissions c ON c.payout_id = p.id
GROUP BY p.id HAVING p.amount <> COALESCE(SUM(c.amount), 0);

-- 2. satu batch hanya boleh berisi komisi milik satu afiliator
SELECT payout_id FROM affiliate_commissions
WHERE payout_id IS NOT NULL
GROUP BY payout_id HAVING COUNT(DISTINCT affiliate_id) > 1;
```

## Catatan

- Jangan buat migration untuk tabel `affiliates`, `affiliate_referrals`, `affiliate_commissions`, dan `affiliate_payouts` — semuanya dibuat aplikasi publik.
- Jangan menghapus baris afiliator yang sudah punya rekrutan atau komisi; database akan menolak (`restrict`). Pakai `status = 'inactive'`.
- Refund setelah komisi tercatat **tidak otomatis**. Aplikasi publik tidak memproses callback refund untuk pembayaran yang sudah lunas, jadi pembatalannya dilakukan manual dari layar komisi (`reversed` + alasan).
- Pemotongan pajak (PPh) belum ada di skema. Kalau keuangan mewajibkannya, sampaikan dulu supaya kolomnya ditambahkan aplikasi publik, jangan membuat kolom sendiri.
- Skema yang sama akan dipakai `ajp.times.co.id` dengan database terpisah. Buat layar CMS ini tidak mengasumsikan satu situs saja bila nanti dipakai ulang.
