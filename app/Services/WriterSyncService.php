<?php

namespace App\Services;

use App\Models\Writer;
use App\Models\WriterDaerah;
use App\Models\WriterNasional;
use Illuminate\Support\Str;

class WriterSyncService
{
    /**
     * Sinkronkan data writer ke master + nasional (journalist) + daerah (writers).
     *
     * Nama di-cascade ke tiga; slug nasional = slug(nama). Field khusus nasional
     * (bio/region/image) hanya diubah bila key-nya dikirim. Daerah = salinan
     * master untuk sistem daerah (email/no_whatsapp/date_exp/network_id/password).
     *
     * @param array{name:string, status?:int|string, bio?:?string, region?:?string, image_url?:?string} $fields
     * @param array{nasional_id?:?int, create_nasional?:bool, daerah_id?:?int, create_daerah?:bool} $opts
     *        nasional_id/daerah_id = taut ke record yang SUDAH ada; create_* = buat baru.
     *
     * ponytail: 3 koneksi DB berbeda -> tak ada transaksi lintas-DB. Update berurutan.
     */
    public function sync(Writer $master, array $fields, array $opts = []): void
    {
        $name = $fields['name'];

        // --- Nasional (journalist) ---
        $nasional = $master->nasional;
        if (!$nasional && !empty($opts['nasional_id'])) {
            $nasional = WriterNasional::find($opts['nasional_id']); // taut existing
        }
        if (!$nasional && !empty($opts['create_nasional'])) {
            $nasional = new WriterNasional();
            $nasional->created_by = auth()->id();
        }
        if ($nasional) {
            $nasional->name = $name;
            $nasional->slug = Str::slug($name);
            if (array_key_exists('bio', $fields)) {
                $nasional->bio = $fields['bio'];
            }
            if (array_key_exists('region', $fields)) {
                $nasional->region = $fields['region'];
            }
            if (!empty($fields['image_url'])) {
                $nasional->image = $fields['image_url'];
            }
            if (array_key_exists('status', $fields)) {
                $nasional->status = $fields['status'];
            }
            $nasional->save();
            $master->id_nasional = $nasional->id;
        }

        // --- Daerah (writers) = salinan master ---
        $daerah = $master->daerah;
        if (!$daerah && !empty($opts['daerah_id'])) {
            $daerah = WriterDaerah::find($opts['daerah_id']); // taut existing
        }
        if (!$daerah && !empty($opts['create_daerah'])) {
            $daerah = new WriterDaerah();
            // password daerah wajib saat create: salin hash dari master (master sudah
            // di-hash di controller; sama seperti ImportWriterDaerah menyalin hash lama).
            $daerah->password = $master->password;
        }
        if ($daerah) {
            $daerah->name = $name; // cascade nama
            // Salin identitas dari master HANYA untuk record daerah yang baru dibuat.
            // Saat menaut record existing, jangan timpa email/no_wa/network-nya.
            if (!$daerah->exists) {
                $daerah->email       = $master->email;
                $daerah->no_whatsapp = $master->no_whatsapp;
                $daerah->date_exp    = $master->date_exp;
                $daerah->network_id  = $master->network_id;
            }
            if (array_key_exists('status', $fields)) {
                $daerah->status = $fields['status'];
            }
            $daerah->save();
            $master->id_daerah = $daerah->id;
        }

        // --- Master (sumber nama) ---
        $master->name = $name;
        if (array_key_exists('status', $fields)) {
            $master->status = $fields['status'];
        }
        $master->save();

        $master->setRelation('nasional', $nasional);
        $master->setRelation('daerah', $daerah);
    }
}
