<?php

namespace App\Console\Commands;

use App\Models\Writer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ImportWriterDaerah extends Command
{
  // Nama command untuk dieksekusi di terminal
    protected $signature = 'import:writer-daerah';
    protected $description = 'Migrasi data dari tabel writer_daerah ke tabel writers master';

    public function handle()
    {
        $this->info("=== Memulai Migrasi Data Writer Daerah ===");

        // Menghitung total data untuk Progress Bar
        $totalData = DB::connection('mysql_daerah')->table('writers')->count();
        $bar = $this->output->createProgressBar($totalData);
        $bar->start();

        // Mengambil data per 500 baris agar hemat memori (RAM)
        DB::connection('mysql_daerah')->table('writers')->orderBy('id')->chunk(500, function ($writersDaerah) use ($bar) {
            foreach ($writersDaerah as $wd) {
                
                // 1. Pengecekan Duplikasi Email
                $existingWriter = DB::table('writers')->where('email', $wd->email)->first();

                if ($existingWriter) {
                    // JIKA EMAIL SUDAH ADA: Update saja kolom id_daerah-nya
                    Writer::where('id', $existingWriter->id)
                        ->update([
                            'id_daerah' => $wd->id,
                            'updated_at' => Carbon::now()
                        ]);
                } else {
                    // JIKA BELUM ADA: Insert sebagai baris baru
                    Writer::create([
                        'id'          => $wd->id, // PERTAHANKAN ID LAMA SEBAGAI ID BARU
                        'name'        => $wd->name,
                        'email'       => $wd->email,
                        'password'    => $wd->password, // Gunakan hash password yang lama
                        'no_whatsapp' => $wd->no_whatsapp,
                        'date_exp'    => $wd->date_exp,
                        // Pastikan network_id tidak null jika skema Anda strict
                        'network_id'  => $wd->network_id ?? 0, 
                        'id_nasional' => $wd->net_id, // Dikosongkan karena ini dari daerah
                        'id_daerah'   => $wd->id, // TRACKING ID LAMA DI SINI
                        'status'      => $wd->status === '1' ? '1' : '0',
                        'editor_id'   => $wd->editor_id,
                        'created_at'  => $wd->created_at ?? Carbon::now(),
                        'updated_at'  => $wd->updated_at ?? Carbon::now(),
                    ]);
                }

                $bar->advance();
            }
        });

        $bar->finish();
        $this->info("\n\n=== Migrasi Selesai! ===");
        $this->info("Data berhasil dipindahkan ke tabel 'writers' master.");
    }
}
