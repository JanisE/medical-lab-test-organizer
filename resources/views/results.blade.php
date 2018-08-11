<!doctype html>
<html lang="{{ config('app.locale') }}">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>Analīzes</title>

	<!-- Fonts -->
	<!-- <link href="https://fonts.googleapis.com/css?family=Inconsolata" rel="stylesheet" type="text/css"> -->

	<link href="//cdn.datatables.net/1.10.15/css/jquery.dataTables.min.css" rel="stylesheet" type="text/css">

	<link href="css/style.css" rel="stylesheet" type="text/css">
</head>
<body class="mode-all-for-printing">
<div class="position-ref">
	<div class="content">
		{{--<div class="title m-b-md">--}}
			{{--Analīzes--}}
		{{--</div>--}}

		@foreach ($aAllTestResults->chunk(16) as $aTestResults)
			@include('table')
		@endforeach

	</div>
</div>
{{--<script src="https://code.jquery.com/jquery-3.2.1.js"></script>--}}
{{--<script src="//cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js"></script>--}}
{{--<script>--}}
	{{--$(document).ready(function(){--}}
		{{--$('table').DataTable();--}}
	{{--});--}}
{{--</script>--}}
</body>
</html>
