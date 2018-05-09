<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTakenTestsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		Schema::create('taken_tests', function (Blueprint $table) {
			$table->increments('id'); // Implies primary.
			$table->string('testable_quality_id', 32);
			$table->timestamp('specimen_collection_time')->nullable();
			$table->string('result_value', 32);
			$table->string('ref', 255)->nullable();

			$table->timestamps();

			$table->foreign('testable_quality_id')->references('id')->on('testable_qualities');
			// TODO Test with the new index
            $table->unique(['testable_quality_id', 'specimen_collection_time', 'ref']);
		});
	}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('taken_tests');
    }
}
