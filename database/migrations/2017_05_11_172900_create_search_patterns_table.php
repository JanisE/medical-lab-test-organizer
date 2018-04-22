<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSearchPatternsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('search_patterns', function (Blueprint $table) {
            $table->increments('id');
			$table->string('testable_quality_id', 32);
			$table->string('type', 16)->default('literal');
			$table->string('pattern')->text();

			$table->foreign('testable_quality_id')->references('id')->on('testable_qualities');
			$table->index('testable_quality_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('search_patterns');
    }
}
