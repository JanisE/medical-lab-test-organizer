<!doctype html>
<html lang="{{ config('app.locale') }}">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>Analīzes</title>

	<link href="css/style.css" rel="stylesheet" type="text/css">
</head>
<body>
<ul>
	<li><a href="/all-for-printing">Visas – printēšanai (vairākās tabulās)</a></li>
	{{--<li><a href="/all-for-printing">Visas, klases – atsevišķās tabulās (printēšanai)</a></li>--}}
	<li><a href="/all-for-big-screens">Visas – lieliem ekrāniem (viena tabula ar fiksētām galvenes rindām un kolonnām)</a></li>
	<li><a href="/last">Pēdējās</a></li>
</ul>
</body>
</html>
