<table class="last_results">

	<tbody>

	@foreach ($aTestClasses as $aTestClass)

		<tr class="test_class">
			<th colspan="{{4 + $iLastCount + 0}}">{{$aTestClass->name_lv}}</th>
		</tr>
		@foreach ($aTestClass->testableQualities as $oTest)

			<tr title="{{$oTest->testName->name_lv or $oTest->id}}">
				<th rowspan="2">{{$oTest->testName->name_lv or $oTest->id}}</th>
				<th rowspan="2">{{$oTest->unit}}</th>
				<th rowspan="2" class="norms_lower_boundary" title="Norms lower boundary">{{is_numeric($oTest->norms_lower_boundary) ? str_replace('.', ',', $oTest->norms_lower_boundary) : $oTest->norms_lower_boundary}}</th>
				<th rowspan="2" class="norms_upper_boundary" title="Norms upper boundary">{{is_numeric($oTest->norms_upper_boundary) ? str_replace('.', ',', $oTest->norms_upper_boundary) : $oTest->norms_upper_boundary}}</th>

				@foreach ($aLastResults[$oTest->id] as $oResult)
					<td class="date">
						{{$oResult->specimen_collection_time->format('d.m.Y.')}}
					</td>
				@endforeach
			</tr>

			<tr title="{{$oTest->testName->name_lv or $oTest->id}}">
				@foreach ($aLastResults[$oTest->id] as $oResult)
					<td class="{{$oResult->assessment()}}" title="{{$oTest->testName->name_lv or $oTest->id}} (ref.: {{$oResult->ref}})">
						{{is_numeric($oResult->result_value) ? str_replace('.', ',', $oResult->result_value) : $oResult->result_value}}
					</td>
				@endforeach
			</tr>

		@endforeach

	@endforeach
	</tbody>

</table>