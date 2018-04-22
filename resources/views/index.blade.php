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


	<!-- Styles -->
	<style>
		/*@import url('https://fonts.googleapis.com/css?family=Inconsolata');*/
		@import url('https://fonts.googleapis.com/css?family=Inconsolata|Oxygen+Mono');
	
		html, body {
			background-color: #ffffff;
			color: #161718;
			height: 100vh;
			margin: 0;
		}

		html, body, td, th {
			/*font-family: 'Inconsolata', sans-serif;*/
			font-family: 'Oxygen Mono', sans-serif;
			font-weight: 100;
			font-size: 13px;
		}

		table {
			border-collapse: collapse;
			/*page-break-after: auto;*/
			page-break-after: always;
			page-break-inside: auto;
		}
		thead {
			display: table-header-group;
		}
		thead th {
			text-align: center;
		}
		tfoot {
			display: table-footer-group;
		}
		tbody th {
			border: 1px solid #bbbbbb;
			text-align: left;
			font-weight: normal;
			white-space: nowrap;
		}

		tbody th.norms_lower_boundary,
		tbody th.norms_upper_boundary {
			text-align: right;
		}

		tbody th.norms_upper_boundary {
			border-right: 2px solid #bbbbbb;
		}

		th {
			page-break-inside: avoid;
			page-break-after: auto;
		}
		td {
			border: 1px solid #aaaaaa;
			text-align: right;
			white-space: nowrap;
			page-break-inside: avoid;
			page-break-after:auto
		}
		td.too_low {
			background-color: #eeeeff;
			color: #0000ee;
		}
		td.too_high {
			background-color: #ffeeee;
			color: #cc0000;
		}
		tr {
			page-break-inside: avoid;
			page-break-after: auto;
		}
		tr.test_class th {
			background: #eeeeee;
			font-weight: bold;
		}

		.position-ref {
			position: relative;
		}

		.content {
			text-align: center;
		}

		.title {
			font-size: 84px;
		}

		.links > a {
			color: #636b6f;
			padding: 0 25px;
			font-size: 12px;
			font-weight: 600;
			letter-spacing: .1rem;
			text-decoration: none;
			text-transform: uppercase;
		}

		.m-b-md {
			margin-bottom: 30px;
		}
	</style>
</head>
<body>
<ul>
	<li><a href="/all">Visas</a></li>
	<li><a href="/last">Pēdējās</a></li>
</ul>
</body>
</html>
