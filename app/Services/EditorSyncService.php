<?php

namespace App\Services;

use App\Models\Editor;
use App\Models\EditorDaerah;
use App\Models\EditorNasional;
use Illuminate\Support\Str;

class EditorSyncService
{
    /**
     * Sinkronkan data editor ke master + nasional + daerah.
     *
     * Nama di-cascade ke tiga tabel; alias nasional = slug(nama). Field khusus
     * (deskripsi/foto nasional, no WA daerah) hanya diubah bila key-nya dikirim.
     *
     * @param array{
     *   name:string, status?:int|string,
     *   description?:?string, image_url?:?string, no_whatsapp?:?string
     * } $fields
     * @param array{
     *   nasional_id?:?int, create_nasional?:bool,
     *   daerah_id?:?int, create_daerah?:bool
     * } $opts  nasional_id/daerah_id = taut ke record yang SUDAH ada;
     *          create_* = buat baru bila belum ada & tidak menaut.
     *
     * ponytail: 3 koneksi DB berbeda -> tak ada transaksi lintas-DB. Update
     * berurutan; kalau butuh atomic penuh, pindah ke saga/kompensasi.
     */
    public function sync(Editor $master, array $fields, array $opts = []): void
    {
        $name = $fields['name'];

        // --- Nasional ---
        $nasional = $master->nasional;
        if (!$nasional && !empty($opts['nasional_id'])) {
            $nasional = EditorNasional::find($opts['nasional_id']); // taut existing
        }
        if (!$nasional && !empty($opts['create_nasional'])) {
            $nasional = new EditorNasional();
            $nasional->created_by = auth()->id();
        }
        if ($nasional) {
            $nasional->editor_name  = $name;
            $nasional->editor_alias = Str::slug($name);
            if (array_key_exists('description', $fields)) {
                $nasional->editor_description = $fields['description'];
            }
            if (!empty($fields['image_url'])) {
                $nasional->editor_image = $fields['image_url'];
            }
            if (array_key_exists('status', $fields)) {
                $nasional->status = $fields['status'];
            }
            $nasional->save();
            $master->id_ti = $nasional->editor_id; // wire (idempoten kalau sudah sama)
        }

        // --- Daerah ---
        $daerah = $master->daerah;
        if (!$daerah && !empty($opts['daerah_id'])) {
            $daerah = EditorDaerah::find($opts['daerah_id']); // taut existing
        }
        if (!$daerah && !empty($opts['create_daerah'])) {
            $daerah = new EditorDaerah();
        }
        if ($daerah) {
            $daerah->name = $name;
            if (array_key_exists('no_whatsapp', $fields)) {
                $daerah->no_whatsapp = $fields['no_whatsapp'];
            }
            if (array_key_exists('status', $fields)) {
                $daerah->status = $fields['status'];
            }
            $daerah->save();
            $master->id_daerah = $daerah->id; // wire
        }

        // --- Master (sumber nama) ---
        $master->name = $name;
        if (array_key_exists('status', $fields)) {
            $master->status = $fields['status'];
        }
        $master->save();

        // Refresh relasi agar pemanggil melihat record yang baru dibuat.
        $master->setRelation('nasional', $nasional);
        $master->setRelation('daerah', $daerah);
    }
}
