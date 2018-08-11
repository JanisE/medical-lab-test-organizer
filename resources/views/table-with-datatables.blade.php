<table>
	<thead>

	@section('date_header')
		<tr>
			{{-- No colspan for DataTables and its FreezeColumns plug-in to work. --}}
			@for ($i = 5; $i > 0; $i--)
				<th></th>
			@endfor

			@foreach ($aTestResults as $sDate => $aDate)
				<?php $oTime = $aDate->first()->specimen_collection_time; ?>
				<th>
					{{$oTime->format('Y')}}<br />
					{{$oTime->format('d.m.')}}
				</th>
			@endforeach
		</tr>
	@overwrite
	@yield('date_header')

	</thead>

	<tbody>
	<?php /* TODO Do not display classes or testable qualities that have no taken tests. */ ?>

	@foreach ($aTestClasses as $aTestClass)

		{{-- @if ($aTestClass->id == 14 || $aTestClass->id == 15) --}}
		{{--@if (! ($aTestClass->id == 14 || $aTestClass->id == 15))--}}
		@if (true)

		<tr class="test_class">
			{{-- No colspan for DataTables and its FreezeColumns plug-in to work. --}}
			<th></th>
			<th>{{$aTestClass->name_lv}}</th>
			@for ($i = 4 + count($aTestResults) - 1; $i > 0; $i--)
				<th></th>
			@endfor
		</tr>

		@foreach ($aTestClass->testableQualities as $aTest)

			{{--@if (strpos($aTest->id, 'urine') === 0 || strpos($aTest->id, 'stool') === 0)--}}
			{{--@if (strpos($aTest->id, 'urine') !== 0 && strpos($aTest->id, 'stool') !== 0)--}}

			<tr title="{{$aTest->testName->name_lv or $aTest->id}}">
				@section('qualities_header')
					{{-- The class row is for using DataTables' rowGroup plug-in, which is not used now (because of its incompatibility with the FreezeColumns plug-in). --}}
					<th>{{$aTestClass->name_lv}}</th>
					<th>{{$aTest->testName->name_lv or $aTest->id}}</th>
					<th>{{$aTest->unit}}</th>
					<th class="norms_lower_boundary" title="Norms lower boundary">{{is_numeric($aTest->norms_lower_boundary) ? str_replace('.', ',', $aTest->norms_lower_boundary) : $aTest->norms_lower_boundary}}</th>
					<th class="norms_upper_boundary" title="Norms upper boundary">{{is_numeric($aTest->norms_upper_boundary) ? str_replace('.', ',', $aTest->norms_upper_boundary) : $aTest->norms_upper_boundary}}</th>
				@overwrite
				@yield('qualities_header')

				@foreach ($aTestResults as $aDate)
					<td class="{{empty($aDate[$aTest->id]) ? '' : $aDate[$aTest->id]->assessment()}}">
						{{empty($aDate[$aTest->id]) ? '' : (is_numeric($aDate[$aTest->id]->result_value) ? str_replace('.', ',', $aDate[$aTest->id]->result_value) : $aDate[$aTest->id]->result_value)}}
					</td>
				@endforeach
			</tr>

			{{--@endif--}}
		@endforeach
		{{--@endif--}}
		@endif
	@endforeach
	</tbody>

	<tfoot>
	@yield('date_header')
	</tfoot>
</table>
