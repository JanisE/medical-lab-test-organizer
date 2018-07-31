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

Route::get('/all', function ()
{
	//$aAvailableTests = DB::table('available_tests')->get();
	$aTestClasses = App\TestClass::orderBy('order', 'asc')->get();

	$aTestResults = App\TakenTest::orderBy('specimen_collection_time', 'asc')
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

	$aTestResultsInChunks = $aTestResults->chunk(16);

    return view('results', compact('aTestClasses', 'aTestResultsInChunks'));
});

Route::get('/last', function ()
{
	$iLastCount = 3;

	$aLastResults = [];
	foreach (App\TestableQuality::all() as $oQuality) {
		$aLastResults[$oQuality->id] = $oQuality->takenTests()->orderBy('specimen_collection_time', 'desc')->take($iLastCount)->get();
	}

	$aTestClasses = App\TestClass::orderBy('order', 'asc')->get();

    return view('results_last', compact('aTestClasses', 'aLastResults', 'iLastCount'));
});
