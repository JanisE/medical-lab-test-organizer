<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TestClass extends Model
{
	public function testableQualities ()
	{
		return $this->hasMany('App\TestableQuality');
	}
}
