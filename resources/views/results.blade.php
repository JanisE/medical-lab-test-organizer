<!doctype html>
<html lang="{{ config('app.locale') }}">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>Analīzes</title>

	<link href="css/style.css" rel="stylesheet" type="text/css">
</head>
<body class="mode-all-for-printing">
	<div class="position-ref">
		<div class="content">
			{{--<div class="title m-b-md">--}}
				{{--Analīzes--}}
			{{--</div>--}}

			@foreach ($aAllTestResults->chunk(16) as $aTestResults)
				@include('table', [
					'bDisplayDateFooter' => true,
					'bHideQualitiesWithNoData' => true
				])
			@endforeach

		</div>
	</div>
</body>
</html>
