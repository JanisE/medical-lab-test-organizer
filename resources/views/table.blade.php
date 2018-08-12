@php ($displayQualitiesFooter = false)

<table>
	<thead>

	@section('date_header')
		<tr>
			<th colspan="4"></th>

			@foreach ($aTestResults as $sDate => $aDate)
				<?php $oTime = $aDate->first()->specimen_collection_time; ?>
				<th>
					{{$oTime->format('Y')}}<br />
					{{$oTime->format('d.m.')}}
				</th>
			@endforeach

			@if ($displayQualitiesFooter)
				<th colspan="4"></th>
			@endif
		</tr>
	@overwrite
	@yield('date_header')

	</thead>

	<tbody>
	@foreach ($aTestClasses as $aTestClass)

		<?php
			$iTakenTests = 0;
			foreach ($aTestClass->testableQualities as $aTest) {
				foreach ($aTestResults as $aDate) {
					if (isset($aDate[$aTest->id])) {
						$iTakenTests++;
					}
				}
			}
		?>

		@if ($iTakenTests > 0)

		<tr class="test_class">
			<th colspan="{{4 + count($aTestResults) + ($displayQualitiesFooter ? 4 : 0)}}">{{$aTestClass->name_lv}}</th>
		</tr>

		<?php /* TODO Do not display testable qualities that have no taken tests. */ ?>
		@foreach ($aTestClass->testableQualities as $aTest)

			{{--@if (strpos($aTest->id, 'urine') === 0 || strpos($aTest->id, 'stool') === 0)--}}
			{{--@if (strpos($aTest->id, 'urine') !== 0 && strpos($aTest->id, 'stool') !== 0)--}}

			<tr title="{{$aTest->testName->name_lv or $aTest->id}}">
				@section('qualities_header')
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

				@if ($displayQualitiesFooter)
					@yield('qualities_header')
				@endif
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
