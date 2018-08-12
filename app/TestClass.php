<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TestClass extends Model
{
	public function testableQualities ()
	{
		return $this->hasMany('App\TestableQuality');
	}

	public function takenTests ()
	{
		$takenTests = collect();

		foreach ($this->testableQualities as $oTestableQuality) {
			$takenTests = $takenTests->merge($oTestableQuality->takenTests);
		}

		return $takenTests->sortBy('specimen_collection_time');
	}
}
