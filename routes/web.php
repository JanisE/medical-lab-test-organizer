<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use Illuminate\Support\Facades\Route;

Route::get('/', function ()
{
    return view('index');
});

function GetAllTestResults () {
	return App\TakenTest::orderBy('specimen_collection_time', 'asc')
//		->where('testable_quality_id', '=', 'Ast')
//		->orWhere('testable_quality_id', '=', 'Alt')
//		->orWhere('testable_quality_id', '=', 'Cpk')
//		->orWhere('testable_quality_id', '=', 'Alp')
//		->orWhere('testable_quality_id', '=', 'Ggt')
//		->orWhere('testable_quality_id', '=', 'Amy')
//		->orWhere('testable_quality_id', '=', 'Lps')
//		->orWhere('testable_quality_id', '=', 'Tbil')
//		->orWhere('testable_quality_id', '=', 'Ldh')
//		->orWhere('testable_quality_id', '=', 'Ceruloplasmin')
		->get()
		->map(function ($oResult)
		{
			$oResult->specimen_collection_time = $oResult->specimen_collection_time->setTimezone(config('app.timezone'));

			return $oResult;
		})
		->groupBy(function($oResult)
		{
			return $oResult->specimen_collection_time->format('Y-m-d');
		})
		->map(function ($aDate)
		{
			return $aDate->keyBy('testable_quality_id');
		});
}

Route::get('/all-for-printing', function ()
{
	$aTestClasses = App\TestClass::orderBy('order', 'asc')->get();

	$aTestResultsInChunks = GetAllTestResults()->chunk(16);

    return view('results', compact('aTestClasses', 'aTestResultsInChunks'));
});

Route::get('/all-for-big-screens', function ()
{
	$aTestClasses = App\TestClass::orderBy('order', 'asc')->get();

	$aTestResultsInChunks = [GetAllTestResults()];

	return view('results-with-datatables', compact('aTestClasses', 'aTestResultsInChunks'));
});

Route::get('/last', function ()
{
	$iLastCount = 3;

	$aLastResults = [];
	foreach (App\TestableQuality::all() as $oQuality) {
		$aLastResults[$oQuality->id] = $oQuality->takenTests()->orderBy('specimen_collection_time', 'desc')->take($iLastCount)
			->get()
			->map(function ($oResult)
			{
				$oResult->specimen_collection_time = $oResult->specimen_collection_time->setTimezone(config('app.timezone'));

				return $oResult;
			});
	}

	$aTestClasses = App\TestClass::orderBy('order', 'asc')->get();

    return view('results_last', compact('aTestClasses', 'aLastResults', 'iLastCount'));
});
