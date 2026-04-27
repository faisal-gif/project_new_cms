<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:user';

    /**
     * The console command description.
     *
     * @var string
     */
  protected $description = 'Migrasi data dari tabel users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
