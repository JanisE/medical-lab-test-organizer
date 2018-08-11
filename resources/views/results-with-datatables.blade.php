<!doctype html>
<html lang="{{ config('app.locale') }}">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>Analīzes</title>

	<!-- Fonts -->
	<!-- <link href="https://fonts.googleapis.com/css?family=Inconsolata" rel="stylesheet" type="text/css"> -->

	{{-- DataTable's theme "DataTables". --}}
	{{--<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.18/css/jquery.dataTables.css"/>--}}
	<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/fixedcolumns/3.2.5/css/fixedColumns.dataTables.css"/>
	{{--<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/rowgroup/1.0.3/css/rowGroup.dataTables.css"/>--}}

	<link href="css/style.css" rel="stylesheet" type="text/css">
</head>
<body class="mode-all-for-big-screens">
<div class="position-ref">
	<div class="content">
		{{--<div class="title m-b-md">--}}
			{{--Analīzes--}}
		{{--</div>--}}

		@include('table-with-datatables', ['aTestResults' => $aAllTestResults])

	</div>
</div>
<script src="https://code.jquery.com/jquery-3.2.1.js"></script>

<script type="text/javascript" src="https://cdn.datatables.net/1.10.18/js/jquery.dataTables.js"></script>
<script type="text/javascript" src="https://cdn.datatables.net/fixedcolumns/3.2.5/js/dataTables.fixedColumns.js"></script>
{{--<script type="text/javascript" src="https://cdn.datatables.net/rowgroup/1.0.3/js/dataTables.rowGroup.js"></script>--}}

<script>
	$(document).ready(function(){
		$('table').DataTable({
			info: false,
			ordering: false,
			paging: false,
			scrollX: true,
			scrollY: 'calc(100vh - 88px)',
			scrollCollapse: true,
			searching: false,
			fixedColumns: {
				leftColumns: 5,
			},
//			rowGroup: {
//				className: 'test_class',
//				dataSrc: 0
//			},
			columnDefs:[{
				targets: 0, visible: false
			}]
		});
	});
</script>
</body>
</html>
