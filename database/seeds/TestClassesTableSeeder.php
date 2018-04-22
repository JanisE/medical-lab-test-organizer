<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestClassesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
    	// A transaction gives a huge performance boost, in SQLite.
		DB::transaction(function ()
		{
			DB::unprepared(file_get_contents(base_path() . '/database/seeds/TestClassesTableSeeder.sql'));
		});
    }
}
