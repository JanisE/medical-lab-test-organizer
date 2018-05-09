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
            $table->increments('id'); // Implies primary.
			$table->string('testable_quality_id', 32);
			$table->string('type', 16)->default('literal');
//			$table->string('pattern',255)->text(); TODO debug - what was text doing here?
			$table->string('pattern',255);

			$table->foreign('testable_quality_id')->references('id')->on('testable_qualities');
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
