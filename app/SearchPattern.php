<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SearchPattern extends Model
{
	public function testableQuality ()
	{
		return $this->belongsTo('App\TestableQuality');
	}
}
