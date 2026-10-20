# Instruksi: Fitur Afiliasi (untuk CMS Redaksi)

Bangun layar **admin program afiliasi**: kelola afiliator, tinjau komisi, dan cairkan pembayaran. CMS ini dan aplikasi publik (`kopi.times.co.id`) **berbagi DB yang sama** (`timesindo_ajp`).

> Prinsip: minimal. Pakai pola/komponen yang **sudah ada** di CMS ini (layout, tabel, form, validasi). Jangan bikin abstraksi baru, jangan tambah dependency. Bangun hanya yang diminta.

## Riwayat perubahan dokumen

**Sudah memegang versi sebelumnya? Baca bagian ini dulu, sisanya hanya penajaman.**

### 2026-10-20 (2) — kolom baru `tier2_eligible`, dropdown upline dihapus

**Ini bentuk final; dua catatan di bawahnya sudah tidak berlaku.** Pembagiannya: **admin menentukan siapa BERHAK menerima komisi 5%, sistem menurunkan rantainya** dari data referral.

Satu kolom baru di `affiliates` (migration dari aplikasi publik, CMS tidak membuatnya):

| Kolom | Tipe | Keterangan |
|---|---|---|
| `tier2_eligible` | boolean, default false | Dicentang = akun ini boleh menerima komisi 5% dari jaringannya |

Cara kerjanya: saat member mengajukan diri jadi afiliator, aplikasi publik mengisi `upline_id`-nya dengan afiliator yang dulu mengundang dia jadi member — **hanya bila akun pengundang itu `tier2_eligible`, aktif, dan di situs yang sama.** Tanpa centang, uplinenya kosong dan jaringan orang itu tidak menghasilkan 5% bagi siapa pun.

Yang berubah di layar CMS:

| Hal | Sebelumnya | Sekarang |
|---|---|---|
| Form afiliator | Dropdown "Upline (opsional)" | **Checkbox** "Akun ini boleh menerima komisi 5% dari jaringannya" + upline saat ini ditampilkan sebagai teks |
| Antrean pengajuan | Dropdown upline | **Checkbox** yang sama |
| `upline_id` dari form | Diterima & divalidasi | **Tidak diterima lagi** — dihapus dari form request beserta pemeriksaan lingkarannya |
| Daftar afiliator | Kolom upline saja | Kolom upline + lencana **"Berhak 5%"** |

Komisi 20% dari pendaftar langsung **tidak** bergantung pada penanda ini. Penanda hanya mengatur terbentuknya tingkat kedua.

**Tidak berlaku ke belakang.** Penanda dibaca saat pengajuan afiliator dibuat, jadi mencentang akun hari ini tidak membentuk rantai dari orang yang sudah jadi afiliator sebelumnya. Koreksi rantai yang sudah terjadi tetap lewat layar **Baris Tertahan**, satu baris komisi sekaligus.

### 2026-10-20 — upline sepenuhnya ditetapkan admin *(diganti, lihat catatan 2026-10-20 (2))*

**Catatan 2026-10-19 di bawah ini TIDAK berlaku lagi.** Pengisian upline otomatis dicabut sehari setelah diterapkan, atas permintaan pemilik produk: penerima komisi 5% harus ditentukan admin, bukan disimpulkan sistem dari data referral.

| Hal | Catatan 2026-10-19 | Yang benar sekarang |
|---|---|---|
| `upline_id` pada pengajuan mandiri | Bisa sudah terisi otomatis | **Selalu NULL** |
| Dropdown upline di antrean pengajuan | Nilai otomatis jadi pilihan awal | Kosong, kecuali admin sudah menetapkannya lewat layar ubah afiliator |
| Siapa menentukan penerima 5% | Sistem, admin boleh menimpa | **Admin, selalu** |

Mekanisme komisinya sendiri tidak berubah dan memang sudah benar: akun A yang mengundang B memperoleh 20% dari pendaftaran B; bila B kemudian mengundang C, A memperoleh 5% dari pendaftaran C. Yang menentukan A memperoleh 5% itu adalah `affiliates.upline_id` milik B — dan kolom itu kini hanya terisi lewat CMS.

**Konsekuensi yang harus dipantau:** selama upline seorang afiliator kosong, setiap komisi 5% dari jaringannya lahir berstatus `unassigned`. Layar **Baris Tertahan** karena itu bukan laporan pelengkap melainkan antrean kerja, dan menetapkan upline saat menyetujui pengajuan adalah cara mencegah tumpukan itu.

Tidak ada perubahan skema.

### 2026-10-19 — upline pengajuan mandiri terisi otomatis *(dibatalkan, lihat catatan 2026-10-20)*

**Mengoreksi aturan "pengajuan mandiri selalu masuk tanpa upline".** Aplikasi publik kini mengisi `upline_id` otomatis saat member mengajukan diri: uplinenya adalah **afiliator yang dulu merekrut orang itu jadi member**, dibaca dari `affiliate_referrals`.

Otomatisasi ini **dilewati** dan uplinenya tetap kosong bila:

- orang itu mendaftar tanpa link referral siapa pun;
- perekrutnya bukan afiliator berstatus `active`;
- perekrutnya milik situs lain — komisi tingkat 2 tidak boleh melintasi situs.

Dampaknya ke layar CMS:

| Hal | Sebelumnya | Sekarang |
|---|---|---|
| `upline_id` pada baris `pending` | Selalu NULL | **Bisa sudah terisi** |
| Antrean pengajuan | Dropdown upline selalu kosong | Nilai otomatis jadi **pilihan awal** dropdown |
| Menyetujui tanpa menyentuh dropdown | Tidak ada yang tersimpan | **Mempertahankan** upline otomatis |
| Mengosongkan dropdown lalu menyetujui | — | **Membatalkan** upline otomatis; kirim `upline_id` bernilai null |

Yang penting di sisi implementasi: bedakan "admin tidak menyentuh dropdown" dari "admin sengaja mengosongkannya". Kalau keduanya sama-sama dikirim sebagai null dan backend memakai `?? $affiliate->upline_id`, upline otomatis tidak akan pernah bisa dibatalkan.

Tidak ada perubahan skema. Admin tetap berwenang penuh menimpa nilainya, baik saat menyetujui maupun lewat layar ubah afiliator.

### 2026-10-15 — pos internal (tim IT / KITA AI) terbit juga tanpa kode referral

**Mengoreksi aturan "tanpa perekrut tidak ada baris sama sekali".** Pos `internal` sekarang dicatat untuk **setiap pendaftaran member baru**, termasuk pembeli yang datang tanpa kode referral, supaya bagian tim IT tidak bergantung pada ada atau tidaknya perekrut.

| Hal | Versi sebelumnya | Yang benar sekarang |
|---|---|---|
| Member baru tanpa perekrut | Nol baris komisi | **Satu baris `internal`**, nominal 4.800 (10% dari 48.000 utuh) |
| Afiliator tidak aktif / situs lain | Nol baris komisi | Sama: hanya baris `internal` |
| `source_affiliate_id` pos internal | Selalu terisi | **Bisa NULL** bila penjualannya tanpa perekrut |
| Perpanjangan | Nol baris | Tetap nol baris, pos `internal` sekalipun |

Nominalnya 4.800 dan bukan 3.840 karena dasarnya harga utuh: pada penjualan berafiliasi 10% dihitung dari 38.400 (setelah komisi perekrut), sedangkan di sini tidak ada potongan perekrut yang benar-benar terjadi.

Dampaknya ke layar CMS: tidak ada perubahan skema dan tidak ada perubahan kode yang diwajibkan. Yang perlu diketahui saat membaca data — daftar komisi akan memuat baris `internal` tanpa afiliator asal (tampilkan `—`), dan rekap `kita_ai` jadi lebih besar daripada 10% total komisi perekrut karena memuat penjualan non-referral juga.

### 2026-10-12 — program ini melayani lebih dari satu situs

Versi pertama dokumen ini menyebut `ajp.times.co.id` akan memakai **database terpisah**. **Itu keliru.** AJP dan Kopi TIMES memakai codebase dan database yang sama (`timesindo_ajp`), hanya beda projek dan branding.

Dampaknya ke layar yang Anda bangun:

| Hal | Versi lama | Yang benar |
|---|---|---|
| Asal komisi | Semua dari Kopi TIMES | Bisa dari situs mana pun di database ini |
| Afiliator | Per situs | Satu afiliator bisa merekrut ke beberapa situs |
| Saldo & pencairan | Per situs | Satu saldo, satu batch, mencakup semua situs |
| Daftar komisi & laporan | Tanpa kolom situs | **Wajib ada filter dan kolom situs** |

Situs asal sebuah komisi ditelusuri lewat paket yang dibeli: `affiliate_commissions.payment_id → payments.package_id → news_package.type`.

| `type` | Produk |
|---|---|
| **1** | **AJP** |
| 2, 3 | lini produk lain di database yang sama |
| **4** | **Kopi TIMES** |

Tampilkan nama produknya, bukan angkanya, di daftar komisi dan laporan.

Tidak ada perubahan skema. Keempat tabel, seluruh kolom, dan kedua state machine tetap sama persis seperti versi sebelumnya.

### 2026-10-13 (2) — afiliator terikat satu situs

**Mengoreksi catatan 2026-10-12.** Afiliator kini **tidak** lintas situs. Keempat tabel afiliasi mendapat kolom `type` (1 = AJP, 4 = Kopi TIMES, mengikuti kolom `type` sistem lama):

| Hal | Catatan 2026-10-12 | Yang benar sekarang |
|---|---|---|
| Afiliator | Satu afiliator untuk semua situs | Terikat satu situs lewat `affiliates.type` |
| Komisi | Dari situs mana pun | **Hanya dari pendaftar di situs yang sama**; lintas situs tidak berkomisi |
| Saldo & pencairan | Satu batch gabungan | **Terpisah per situs**: satu batch hanya berisi komisi dengan `type` yang sama |
| Situs asal komisi | Dijoin ke `news_package` | Cukup baca `affiliate_commissions.type` |

Konsekuensinya untuk layar CMS: daftar afiliator, daftar komisi, dan penyusun batch pencairan **harus memfilter per `type`**. Laporan rekap cukup mengelompokkan `affiliate_commissions.type`, tidak perlu join lagi.

Catatan: referral lintas situs **tetap tercatat** di `affiliate_referrals` (dengan `type` situs tempat pendaftaran terjadi), hanya saja tidak menghasilkan komisi. Jadi mungkin ada afiliator dengan rekrutan tercatat tapi komisi nol — itu bukan bug.

### 2026-10-13 — member bisa mengajukan diri jadi afiliator

Aplikasi publik kini punya formulir pengajuan. **Baris `affiliates` berstatus `pending` tidak lagi hanya datang dari admin — sekarang bisa datang dari member sendiri.** Layar CMS perlu menyiapkan antrean peninjauan.

Dua kolom baru di `affiliates` (keduanya nullable, baris lama tetap valid):

| Kolom | Tipe | Keterangan |
|---|---|---|
| `terms_accepted_at` | timestamp nullable | Waktu pemohon menyetujui syarat & ketentuan. Kosong untuk afiliator yang dibuat admin |
| `applicant_note` | text nullable | Tulisan pemohon tentang audiens yang akan dijangkau. **Dibuat pemohon, jangan ditimpa** — catatan admin tetap di kolom `note` |

Yang perlu disiapkan CMS:

- **Antrean pengajuan**: daftar `status = 'pending'`, menampilkan `applicant_note`, data rekening, status membership pemohon, dan `terms_accepted_at`. Aksi: setujui (jadi `active`, isi `approved_at`) atau tolak (`inactive` atau `suspended`, isi `note`).
- **Upline ditetapkan manual.** Pengajuan mandiri selalu masuk dengan `upline_id` kosong. Selama kosong, komisi tingkat 2 dari afiliator itu tercatat `unassigned`, jadi laporan baris tertahan makin penting. *(Diperbarui 2026-10-19: kini bisa terisi otomatis — lihat catatan paling atas.)*
- **Kode referral sudah digenerate** aplikasi publik saat pengajuan. Jangan dibuat ulang.
- **Minimum pencairan Rp 50.000** (`config/affiliate.php`, `min_payout`). Nominal ini tertulis di syarat & ketentuan yang disetujui pemohon, jadi batch pencairan harus mengikutinya.

### 2026-10-08 — versi pertama

## Konteks

Program afiliasi 2 tingkat untuk mengejar member baru. Harga membership baru **Rp 48.000**; perpanjangan memakai harga lama dan **tidak** menghasilkan komisi.

Pembagian per pembayaran member baru **yang punya perekrut**:

| Pos (`role`) | Penerima | Dasar | Tarif | Nominal |
|---|---|---|---|---|
| `tier1` | perekrut langsung | 48.000 | 20% | **9.600** |
| `tier2` | upline si perekrut | 38.400 | 5% | **1.920** |
| `internal` | alokasi tim IT / KITA AI | 38.400 | 10% | **3.840** |
| — | net kantor (tidak disimpan sebagai baris) | | sisa | **32.640** |

Pembagian per pembayaran member baru **tanpa perekrut** — hanya pos internal:

| Pos (`role`) | Penerima | Dasar | Tarif | Nominal |
|---|---|---|---|---|
| `internal` | alokasi tim IT / KITA AI | 48.000 | 10% | **4.800** |
| — | net kantor (tidak disimpan sebagai baris) | | sisa | **43.200** |

Aturan penting:

- **Pos `internal` terbit untuk setiap member baru, ada perekrut atau tidak.** Tanpa perekrut hanya pos itu yang ada — tidak ada `tier1`, tidak ada `tier2` — dan `source_affiliate_id`-nya **NULL**. Nominalnya 4.800, bukan 3.840, karena tidak ada potongan `tier1` yang benar-benar terjadi sehingga dasarnya harga utuh.
- Tiga keadaan diperlakukan sama dengan "tanpa perekrut": tidak ada referral, afiliatornya tidak aktif, dan afiliatornya milik situs lain. Ketiganya hanya menerbitkan pos `internal`.
- **Perpanjangan tetap nol baris**, pos `internal` sekalipun. Yang berkomisi hanya pendaftaran member baru.
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
| `type` | tinyint | situs afiliator: 1 = AJP, 4 = Kopi TIMES. **Jangan diubah** setelah dibuat |
| `user_id` | bigint nullable **unik** | id di tabel `wartawan`. Diisi kalau afiliator perlu login ke portal afiliasi. Boleh NULL untuk afiliator yang hanya dibayar transfer |
| `upline_id` | bigint nullable | id afiliator lain di tabel ini. Inilah tingkat kedua. Tidak boleh menunjuk dirinya sendiri atau membentuk lingkaran |
| `code` | string(32) **unik** | huruf besar + angka. Ini yang dipakai di `?ref=`. Generate otomatis, tawarkan tombol salin |
| `name` | string | wajib |
| `email` | string nullable unik | dipakai aplikasi publik untuk menolak self-referral |
| `phone` | string(30) nullable | |
| `payout_method` | enum `bank` \| `ewallet` | default `bank` |
| `bank_name`, `bank_account_number`, `bank_account_name` | string nullable | wajib diisi sebelum pencairan pertama |
| `status` | enum `pending` \| `active` \| `suspended` \| `inactive` | default `pending`. **Hanya `active` yang menghasilkan atribusi dan komisi baru**. `pending` bisa berasal dari admin maupun pengajuan mandiri member |
| `approved_at` | timestamp nullable | isi saat status jadi `active` |
| `terms_accepted_at` | timestamp nullable | waktu pemohon menyetujui S&K; kosong bila dibuat admin. **Jangan diubah** |
| `applicant_note` | text nullable | tulisan pemohon. **Jangan diubah**; catatan admin pakai `note` |
| `note` | text nullable | catatan admin |
| `created_at`, `updated_at` | timestamp | |

### Tabel `affiliate_referrals` — HANYA BACA

Dicatat aplikasi publik saat member mendaftar. CMS **tidak boleh** insert, update, atau delete.

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | bigint PK | |
| `type` | tinyint | situs tempat pendaftaran terjadi |
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
| `type` | tinyint | situs asal komisi (1 = AJP, 4 = Kopi TIMES) | **tidak** |
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
| `type` | tinyint | situs batch ini; satu batch hanya berisi komisi dengan `type` yang sama |
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

0. **Antrean pengajuan** — daftar `status = 'pending'` berisi nama, email, kontak, `applicant_note`, data rekening, status membership pemohon, dan tanggal persetujuan S&K. Aksi: setujui (`active` + `approved_at`), tolak (`inactive`/`suspended` + `note`), dan tetapkan `upline_id` sekalian saat menyetujui. **Tampilkan `upline_id` yang sudah terisi** — sejak 2026-10-19 nilainya bisa datang otomatis dari perekrut membernya, dan admin perlu melihat apa yang akan tersimpan sebelum menyetujui.

1. **Daftar afiliator** — kolom: nama, kode, status, upline, jumlah member direkrut, total komisi (tertahan / siap cair / sudah dibayar). Filter per status, pencarian nama/kode/email.

2. **Tambah & ubah afiliator** — form: nama, email, phone, upline (pilih dari afiliator lain), status, metode dan data rekening, catatan.
   - `code` digenerate otomatis saat simpan, huruf besar + angka, **wajib unik** (URL publik bergantung ini).
   - Tombol salin link referral: `https://kopi.times.co.id/?ref={code}`.
   - Menautkan akun login: cari user berdasarkan email di tabel `wartawan`, lalu isi `user_id`. Satu user hanya boleh jadi satu afiliator.
   - Afiliator eksternal yang perlu login harus mendaftar lebih dulu di aplikasi publik (akun gratis, tanpa bayar), baru ditautkan di sini.

3. **Setujui / tangguhkan afiliator** — aksi cepat mengubah `status`, mengisi `approved_at` saat jadi `active`. Penangguhan menghentikan atribusi dan komisi **baru**; komisi lama tidak ikut batal.

4. **Daftar komisi** — kolom: tanggal, member, **situs asal**, nama paket/nomor pembayaran, pos (`tier1`/`tier2`/`internal`), penerima, nominal, status, `available_at`. Filter per afiliator, **situs**, status, pos, dan rentang tanggal. Aksi: setujui (massal), tolak dengan alasan, dan untuk baris `unassigned` tetapkan penerima.
   - Tombol setujui harus nonaktif selama `available_at > sekarang`.

5. **Laporan baris tertahan** — daftar khusus `status = 'unassigned'` beserta `source_affiliate_id`. Tanpa layar ini, uang tertahan tidak terlihat siapa pun.

6. **Batch pencairan** — pilih afiliator dan periode, sistem menarik semua komisi `approved` miliknya yang `payout_id`-nya masih NULL, hitung totalnya, lalu buat `affiliate_payouts` dan isi `payout_id` di komisi tersebut. **Totalnya minimal Rp 50.000**, sesuai syarat & ketentuan yang disetujui afiliator. Lanjutan: tandai lunas (isi `reference`, unggah bukti, set `paid_at`, semua komisinya jadi `paid`) atau batalkan (lepaskan kembali komisinya).

7. **Laporan rekap per periode** — pemasukan kotor, total `tier1`, total `tier2`, total `internal` (KITA AI), total tertahan, dan net kantor, **dipecah per situs dan ada barisan totalnya**. **Hanya di CMS.**

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
  c.type AS situs,
  SUM(CASE WHEN c.role = 'tier1'    THEN c.amount ELSE 0 END) AS tier1,
  SUM(CASE WHEN c.role = 'tier2'    THEN c.amount ELSE 0 END) AS tier2,
  SUM(CASE WHEN c.role = 'internal' THEN c.amount ELSE 0 END) AS kita_ai,
  SUM(CASE WHEN c.status = 'unassigned' THEN c.amount ELSE 0 END) AS tertahan,
  SUM(c.amount) AS total_keluar
FROM affiliate_commissions c
WHERE c.created_at BETWEEN ? AND ?
  AND c.status <> 'rejected'
GROUP BY c.type;
```

Hilangkan `c.type` dan `GROUP BY` bila yang dibutuhkan angka gabungan seluruh situs.

Komisi siap cair milik satu afiliator:

```sql
SELECT * FROM affiliate_commissions
WHERE affiliate_id = ? AND type = ? AND status = 'approved' AND payout_id IS NULL;
```

Dua invariant yang wajib dijaga CMS (tidak dipaksakan database, periksa berkala):

```sql
-- 1. total batch harus sama dengan jumlah komisinya
SELECT p.id FROM affiliate_payouts p
LEFT JOIN affiliate_commissions c ON c.payout_id = p.id
GROUP BY p.id HAVING p.amount <> COALESCE(SUM(c.amount), 0);

-- 2. satu batch hanya boleh berisi komisi milik satu afiliator, dari satu situs
SELECT payout_id FROM affiliate_commissions
WHERE payout_id IS NOT NULL
GROUP BY payout_id HAVING COUNT(DISTINCT affiliate_id) > 1 OR COUNT(DISTINCT type) > 1;
```

## Catatan

- Jangan buat migration untuk tabel `affiliates`, `affiliate_referrals`, `affiliate_commissions`, dan `affiliate_payouts` — semuanya dibuat aplikasi publik.
- Jangan menghapus baris afiliator yang sudah punya rekrutan atau komisi; database akan menolak (`restrict`). Pakai `status = 'inactive'`.
- Refund setelah komisi tercatat **tidak otomatis**. Aplikasi publik tidak memproses callback refund untuk pembayaran yang sudah lunas, jadi pembatalannya dilakukan manual dari layar komisi (`reversed` + alasan).
- Pemotongan pajak (PPh) belum ada di skema. Kalau keuangan mewajibkannya, sampaikan dulu supaya kolomnya ditambahkan aplikasi publik, jangan membuat kolom sendiri.
- **`ajp.times.co.id` ikut memakai tabel yang sama di database ini**, bukan database terpisah. Layar CMS **tidak boleh** mengasumsikan semua baris berasal dari Kopi TIMES: filter per `type` di mana pun ada daftar.
- Situs asal tersimpan langsung di kolom `type` tiap tabel afiliasi: `1` = AJP, `4` = Kopi TIMES, sisanya lini produk lain. Tidak perlu join ke `payments` atau `news_package` lagi.
- Pencairan **terpisah per situs**: satu batch hanya boleh berisi komisi milik satu afiliator dengan satu `type`.
