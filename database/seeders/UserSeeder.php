<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Paula Martinez',
                'email' => 'paula.martinez@verdecampo.test',
                'active' => true,
                'last_login_at' => now()->subHours(3),
                'roles' => ['Productor'],
            ],
            [
                'name' => 'Ignacio Ferrero',
                'email' => 'ignacio.ferrero@verdecampo.test',
                'active' => true,
                'last_login_at' => now()->subDay(),
                'roles' => ['Ingeniero'],
            ],
            [
                'name' => 'Lucia Benitez',
                'email' => 'lucia.benitez@verdecampo.test',
                'active' => true,
                'last_login_at' => now()->subDays(2),
                'roles' => ['Ingeniero'],
            ],
            [
                'name' => 'Camila Ruiz',
                'email' => 'camila.ruiz@verdecampo.test',
                'active' => false,
                'last_login_at' => null,
                'roles' => ['Ingeniero'],
            ],
            [
                'name' => 'Tomas Soria',
                'email' => 'tomas.soria@verdecampo.test',
                'active' => false,
                'last_login_at' => null,
                'roles' => [],
            ],
            [
                'name' => 'Nicolas Pereyra',
                'email' => 'nicolas.pereyra@verdecampo.test',
                'active' => true,
                'last_login_at' => null,
                'roles' => [],
            ],
        ];

        foreach ($users as $data) {
            $roles = $data['roles'];
            unset($data['roles']);

            $user = User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'active' => $data['active'],
                    'last_login_at' => $data['last_login_at'],
                    'password' => '12345678',
                ],
            );

            $user->forceFill(['email_verified_at' => now()])->save();
            $user->syncRoles($roles);
        }
    }
}
