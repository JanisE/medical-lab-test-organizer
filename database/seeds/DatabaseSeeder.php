<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(TestClassesTableSeeder::class);
		$this->call(TestableQualitiesTableSeeder::class);
		$this->call(SearchPatternsTableSeeder::class);
		$this->call(TestNamesTableSeeder::class);
    }
}
