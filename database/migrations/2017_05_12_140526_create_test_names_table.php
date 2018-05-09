<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTestNamesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		Schema::enableForeignKeyConstraints();

        Schema::create('test_names', function (Blueprint $table) {
			$table->string('id', 32);
			$table->text('name_lv')->nullable();
			$table->text('name_en')->nullable();

			$table->primary('id');
			$table->foreign('id')->references('id')->on('testable_qualities');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('test_names');
    }
}
