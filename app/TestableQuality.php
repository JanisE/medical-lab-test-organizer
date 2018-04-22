<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * Class TestableQuality. Or testable attributes, characteristics.
 * @package App
 */
class TestableQuality extends Model
{
	public $incrementing = false;	// To avoid collecting `id` value as an integer.

	public function searchPatterns ()
	{
		return $this->hasMany('App\SearchPattern');
	}

	public function testClass ()
	{
		return $this->belongsTo('App\TestClass');
	}

	public function takenTests ()
	{
		return $this->hasMany('App\TakenTest');
	}

	public function testName ()
	{
		return $this->hasOne('App\TestName', 'id');
	}
}
