<?php

namespace App\Helpers;

use App\TakenTest;
use App\TestableQuality;

class Helper
{
	public static function FormatTestValue (TakenTest $oTest) {
		return (is_numeric($oTest->result_value)
			? str_replace('.', ',', $oTest->result_value)
			: $oTest->result_value);
	}

	private static function GetCharLengthOfDate (iterable $aTakenTestsInDate) {
		$iMaxChars = 0;

		foreach ($aTakenTestsInDate as $oTest) {
			$iValueLength = mb_strlen(self::FormatTestValue($oTest));

			if ($iValueLength > $iMaxChars) {
				$iMaxChars = $iValueLength;
			}
		}

		return $iMaxChars;
	}

	private static function GetMaxLabelLength (iterable $aTakenTests) {
		$aMaxLength = [0, 0, 0, 0];

		$aTestableQualities = TestableQuality::all()->keyBy('id');

		foreach ($aTakenTests as $oTakenTest) {
			$oTest = $aTestableQualities[$oTakenTest->testable_quality_id];

			$aLabelLength = [
				mb_strlen($oTest->testName->name_lv ?: $oTest->id),
				mb_strlen($oTest->unit),
				mb_strlen($oTest->norms_lower_boundary),
				mb_strlen($oTest->norms_upper_boundary)
			];

			foreach ($aLabelLength as $i => $iLength) {
				if ($iLength > $aMaxLength[$i]) {
					$aMaxLength[$i] = $iLength;
				}
			}
		}

		return $aMaxLength[0] + $aMaxLength[1] + $aMaxLength[2] + $aMaxLength[3];
	}

	/**
	 * @param int $iMaxChars
	 * @param iterable $aTestResultsByDate
	 * @param int $iMinDateLength 6 by default ("d.m." header e.g. "26.05.").
	 *
	 * @return int
	 */
	public static function GetMaxChunkLengthNotExceedingCharacters (int $iMaxChars, iterable $aTestResultsByDate, $iMinDateLength = 6) {
		$iTotalValueLength = 0;
		$iDays = 0;

		$iMaxLabelLength = 0;

		foreach ($aTestResultsByDate as $aDate) {
			$iTotalValueLength += max($iMinDateLength, self::GetCharLengthOfDate($aDate));
			$iMaxLabelLength = max($iMaxLabelLength, self::GetMaxLabelLength($aDate));

			if ($iTotalValueLength + $iMaxLabelLength > $iMaxChars) {
				// Length exceeds the threshold.
				break;
			}

			// Length still within the threshold.
			$iDays++;

//			error_log("Chunk length = " . $iDays . '; chars = ' .($iTotalValueLength + $iMaxLabelLength). ' = '. $iMaxLabelLength . ' + ' . $iTotalValueLength);
		}

		return $iDays;
	}

	/**
	 * @param $aTakenTestsByDates
	 * @param int $iMaxLength 220 looks all right for printing on A3.
	 *
	 * @return \Illuminate\Support\Collection
	 */
	public static function ChunkByDatesMaxLength ($aTakenTestsByDates, $iMaxLength = 220)
	{
		$aChunks = [];

		$aDatesLeft = collect($aTakenTestsByDates);

		while ($aDatesLeft->count() > 0) {
			$aChunks[] = $aDatesLeft->splice(
				0,
				// Take at least 1 date.
				$iTo = max(self::GetMaxChunkLengthNotExceedingCharacters($iMaxLength, $aDatesLeft), 1)
			);
		}

		return collect($aChunks);
	}
}
