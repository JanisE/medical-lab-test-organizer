<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

// TODO Manage translations properly.
class TestName extends Model
{
	public function testableQuality ()
	{
		return $this->belongsTo('App\TestableQuality');
	}
}
