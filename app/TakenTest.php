<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TakenTest extends Model
{
	protected $dates = ['specimen_collection_time'];
	protected $dateFormat = 'U';

	public function testableQuality ()
	{
		return $this->belongsTo('App\TestableQuality');
	}

	public function assessment ()
	{
		$sAssessment = 'unknown';

		if (is_numeric($this->result_value)) {
			$sNormsLowerBoundary = $this->testableQuality->norms_lower_boundary;
			$sNormsUpperBoundary = $this->testableQuality->norms_upper_boundary;

			if (isset($sNormsLowerBoundary) && $this->result_value < $sNormsLowerBoundary) {
				$sAssessment = 'too_low';
			}
			else if (isset($sNormsUpperBoundary) && $this->result_value > $this->testableQuality->norms_upper_boundary) {
				$sAssessment = 'too_high';
			}
			else {
				// TODO Distinguish between norm is not set and norm is not known and there is no norm.
				if (isset($sNormsLowerBoundary) && isset($sNormsUpperBoundary)) {
					$sAssessment = 'normal';
				}
			}
		}

		return $sAssessment;
	}
}
