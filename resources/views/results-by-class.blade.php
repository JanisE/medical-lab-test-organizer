<!doctype html>
<html lang="{{ config('app.locale') }}">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>Analīzes</title>

	<link href="css/style.css" rel="stylesheet" type="text/css">
</head>
<body class="mode-all-for-printing-by-class">
	<div class="position-ref">
		<div class="content">
			{{--<div class="title m-b-md">--}}
				{{--Analīzes--}}
			{{--</div>--}}

			@foreach ($aTestClasses as $aTestClass)
				@foreach (Helper::ChunkByDatesMaxLength($aTestClass->takenTests()
					->groupBy(function ($oTakenTest) {
						return $oTakenTest->specimen_collection_time->format('Y-m-d');
					})
					->map(function ($aDate) {
						return $aDate->keyBy('testable_quality_id');
					}), 166) as $aTestResults)
						@include('table', [
							'bDisplayDateFooter' => false,
							'bHideQualitiesWithNoData' => false
						])
				@endforeach
			@endforeach
		</div>
	</div>
</body>
</html>
