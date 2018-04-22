<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTestableQualitiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('testable_qualities', function (Blueprint $table) {
            $table->string('id', 32);
            $table->string('specimen_source_type', 16);
			$table->integer('test_class_id')->nullable();
			$table->string('unit', 16)->nullable();	// Nullable for accepting incomplete data.
            $table->string('norms_lower_boundary', 32)->nullable();
			$table->string('norms_upper_boundary', 32)->nullable();
			$table->text('comments')->nullable();

			$table->primary('id');
			$table->foreign('test_class_id')->references('id')->on('test_classes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('testable_qualities');
    }
}
