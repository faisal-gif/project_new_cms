<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'News Master' => [
                'view news master',
                'create news master',
                'edit news master',
                'delete news master',
                'import daerah news master',
                'import nasional news master',
            ],
            'User Master' => [
                'view users master',
                'create users master',
                'edit users master',
                'delete users master',
            ],
            'Role Master' => [
                'view role master',
                'create role master',
                'edit role master',
                'delete role master',
            ],
            'Permission Master' => [
                'view permission master',
                'create permission master',
                'edit permission master',
                'delete permission master',
            ],
            'Penulis Master' => [
                'view penulis master',
                'create penulis master',
                'edit penulis master',
                'delete penulis master',
            ],
            'Editor Master' => [
                'view editor master',
                'create editor master',
                'edit editor master',
                'delete editor master',
            ],            
            'News Nasional' => [
                'view news nasional',
                'create news nasional',
                'edit news nasional',
                'delete news nasional',
            ],
            'Kanal Nasional' => [
                'view kanal nasional',
                'create kanal nasional',
                'edit kanal nasional',
                'delete kanal nasional',
            ],
            'Fokus Nasional' => [
                'view fokus nasional',
                'create fokus nasional',
                'edit fokus nasional',
                'delete fokus nasional',
            ],
            'Gallery Nasional' => [
                'view gallery nasional',
                'create gallery nasional',
                'edit gallery nasional',
                'delete gallery nasional',
            ],
            'Ekoran Nasional' => [
                'view ekoran nasional',
                'create ekoran nasional',
                'edit ekoran nasional',
                'delete ekoran nasional',
            ],
            'Penulis Nasional' => [
                'view penulis nasional',
                'create penulis nasional',
                'edit penulis nasional',
                'delete penulis nasional',
            ],
            'Editor Nasional' => [
                'view editor nasional',
                'create editor nasional',
                'edit editor nasional',
                'delete editor nasional',
            ],
            'News Daerah' => [
                'view news daerah',
                'create news daerah',
                'edit news daerah',
                'delete news daerah',
            ],
            'Kanal Daerah' => [
                'view kanal daerah',
                'create kanal daerah',
                'edit kanal daerah',
                'delete kanal daerah',
            ],
            'Fokus Daerah' => [
                'view fokus daerah',
                'create fokus daerah',
                'edit fokus daerah',
                'delete fokus daerah',
            ],
            'Network Daerah' => [
                'view network daerah',
                'create network daerah',
                'edit network daerah',
                'delete network daerah',
            ],
            'Penulis Daerah' => [
                'view penulis daerah',
                'create penulis daerah',
                'edit penulis daerah',
                'delete penulis daerah',
            ],
            'Editor Daerah' => [
                'view editor daerah',
                'create editor daerah',
                'edit editor daerah',
                'delete editor daerah',
            ],
            'Ads Daerah' => [
                'view ads daerah',
                'create ads daerah',
                'edit ads daerah',
                'delete ads daerah',
            ],
            'Ads Daerah Location' => [
                'view ads daerah location',
                'create ads daerah location',
                'edit ads daerah location',
                'delete ads daerah location',
            ],
        ];

        // Looping dan masukkan ke database
        foreach ($permissions as $category => $perms) {
            foreach ($perms as $permission) {
                Permission::firstOrCreate([
                    'name' => $permission,
                    'category' => $category // Simpan kategorinya
                ]);
            }
        }
    }
}
