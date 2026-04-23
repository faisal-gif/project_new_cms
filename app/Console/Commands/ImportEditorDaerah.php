<?php

namespace App\Console\Commands;

use App\Models\EditorMaster;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportEditorDaerah extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:editor-daerah';
    

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrasi data dari tabel editor daerah ke tabel editor master';
    /**
     * Execute the console command.
     */
    public function handle()
    {
          $this->info("=== Memulai Migrasi Data Writer Daerah ===");

        // Menghitung total data untuk Progress Bar
        $totalData = DB::connection('mysql_daerah')->table('editors')->count();
        $bar = $this->output->createProgressBar($totalData);
        $bar->start();

        // Mengambil data per 500 baris agar hemat memori (RAM)
        DB::connection('mysql_daerah')->table('editors')->orderBy('id')->chunk(500, function ($editorsDaerah) use ($bar) {
            foreach ($editorsDaerah as $wd) {
                
                // 1. Pengecekan Duplikasi Email
                $existingEditor = EditorMaster::where('name', $wd->name)->first();

                if ($existingEditor) {
                    // JIKA EMAIL SUDAH ADA: Update saja kolom id_daerah-nya
                    EditorMaster::where('id', $existingEditor->id)
                        ->update([
                            'id_daerah' => $wd->id,
                            'id_ti' => $wd->id_ti,
                            'updated_at' => Carbon::now()
                        ]);
                } else {
                    // JIKA BELUM ADA: Insert sebagai baris baru
                    EditorMaster::create([
                        'id'          => $wd->id, // PERTAHANKAN ID LAMA SEBAGAI ID BARU
                        'name'        => $wd->name,
                        'user_id'     => $wd->user_id,
                        'id_ti'       => $wd->id_ti,
                        'id_daerah'   => $wd->id,
                        'status'      => $wd->status === '1' ? '1' : '0',
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
