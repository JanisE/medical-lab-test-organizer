// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeForRegExp (string)
{
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


function GetTestConfig ()
{
	return new Promise((fResolve) =>
	{
		var aTests = {};

		oDb.each ('SELECT tq.id, specimen_source_type, pattern, type AS pattern_type '
			+ 'FROM testable_qualities tq '
			+ 'INNER JOIN search_patterns ON testable_quality_id = tq.id', function (oError, oQuality)
		{
			if (oError) {
				console.log ('DB error = ', oError);
			}
			else {
				if (! aTests [oQuality.id]) {
					aTests [oQuality.id] = {
						aMarkedBy: [],
						sSpecimenSourceType: oQuality.specimen_source_type
					};
				}

				aTests [oQuality.id].aMarkedBy.push({
					pattern: oQuality.pattern,
					type: oQuality.pattern_type
				});
			}
		}, function ()
		{
			fResolve(aTests);
		});
	});
}

function Parse_VC4 (sSource)
{
	var oParsed = {};

	var oSources = [];
	sSource.replace (/Materiāls[\s\S]+?Izpildītāj(?:s|i)/g, function (sSingleSource)
	{
		var sSpecimenSourceType = 'Unexpected';
		var sSpecimenSourceTypeRaw = sSingleSource.match (/Materiāla tips:\s+(.+)/)[1];
		switch (sSpecimenSourceTypeRaw) {
		case 'Urīns':
			sSpecimenSourceType = 'urine';
			break;
		case 'Fēces koprogramma':
			sSpecimenSourceType = 'stool';
			break;
		case 'Asinis EDTA':
			sSpecimenSourceType = 'blood_edta';
			break;
		// Asinis ar nātrija citrātu; blood with sodium citrate.
		case 'Asinis nātrija cit':
			sSpecimenSourceType = 'blood_w_sod_citr';
			break;
		case 'Serums':
		case 'Asinis':
			sSpecimenSourceType = 'blood_serum';
			break;
		default:
			console.log ('Unepxected specimen source type: ', sSpecimenSourceTypeRaw);
		}

		var sCollectedAt;
		try {
			sCollectedAt = sSingleSource.match (/Materiāla paņemš.datums\/laiks:\s+(\d+\.\d+\.\d+ \d+:\d+)\b/)[1];
		}
		catch (oException) {
			try {
				sCollectedAt = sSingleSource.match (/Materiāla paņemš.datums\/laiks:\s+(\d+\.\d+\.\d+)\b/)[1] + ' 00:00';
			}
			catch (oException) {
				console.log ('Registration time used as the specimen collection time!');
				try {
					sCollectedAt = sSingleSource.match(/Reģistrācijas datums: (\d+\.\d+\.\d+ \d+:\d+)\b/)[1];
				}
				catch (oException) {
					console.log('No kind of specimen collection time could be guessed: ', sSingleSource);
					return;
				}
			}
		}

		if (sCollectedAt) {
			oSources.push({
				sSpecimenSourceType: sSpecimenSourceType,
				sSpecimenCollectedAt: moment.tz(
					sCollectedAt,
					'DD.MM.YYYY HH:mm',
					'Europe/Riga'
				),
				sSource: sSingleSource
			});
		}
	});


	_.forOwn(oSources, function (oSource)
	{
		_.forEach(Parse.aTests, function (oTest, sTestKey)
		{
			if (oSource.sSpecimenSourceType === oTest.sSpecimenSourceType) {
				for (var iPattern = oTest.aMarkedBy.length - 1; iPattern >= 0; iPattern--) {
					if (oTest.aMarkedBy[iPattern].type != 'literal' && oTest.aMarkedBy[iPattern].type != 'regexp') {
						console.error('Unexpected pattern type: ', oTest.aMarkedBy[iPattern]);
					}

					var oMatches = oSource.sSource.match(
						// [^\S\r\n] = any space character except new lines.
						new RegExp(
							'^[^\\S\\r\\n]*([<>!]+[^\\S\\r\\n]+)?'
							+ (
								oTest.aMarkedBy[iPattern].type == 'regexp'
								// NB! Use non-capturing sub-patterns [(?:x)] when using the "regexp" type pattern!
								? oTest.aMarkedBy[iPattern].pattern
								: escapeForRegExp(oTest.aMarkedBy[iPattern].pattern)
									.replace(' ', ' +')	// Allow for several space characters when space is expected.
							)
							// [^\\s\\d]+ {1, 3}[\\S\\d]+ e.g. 'gaiši brūna', 'nav atrasts'. Up to 3 space, because there were such cases in old PDFs.
							+ '[^\\S\\r\\n]+([^\\s\\d]+ {1,3}[\\S\\d]+|(< |> )?[\\S]+)',
							'm'
						)
					);

					if (oMatches) {
						oParsed [sTestKey] = {
							mResult: oMatches [2],
							oCollectedAt: oSource.sSpecimenCollectedAt
						};
						// console.log('Collected results for ', sTestKey, ': ', oParsed[sTestKey].mResult);
						// if (oParsed[sTestKey].mResult == undefined) {
						// 	console.log(oMatches);
						// }

						// Different patterns are defined to support different result/input formats.
						// 		There should not be the same quality more than once within the same results/input page.
						// Furthermore, let's allow patterns of the same quality where some of the formats one of the patterns matches,
						// 		may be matched also by other patterns (i.e., their supported formats may overlap).
						// 		For that, the breaking is essential to not produce duplicate results
						// 		(although ignore insert into DB would deal with duplicates).
						break;
					}
					else {
						//console.log('Test absent: ', oTest);
					}
				}
			}
			// Else: this source does not relate to that testable quality.
		});
	});

	//oParsed.time = sSource;

	return oParsed;
}

// http://labtestsonline.org/map/aindex http://www.egl.lv/analīzes http://www.mayomedicallaboratories.com/index.html
function Parse (sSource)
{
	var oParsed = {};

	if (
		sSource.indexOf('Medicīnas centrs "Veselibas Centrs - 4" Testēšanas laboratorija') > -1
		|| sSource.indexOf('Medicīnas centrs "Veselības Centrs 4" Laboratorija') > -1
		|| sSource.indexOf('Medicīnas centrs "Veselības Centrs - 4" Laboratorija') > -1
		|| sSource.indexOf('SIA "Veselības Centrs 4" Laboratorija') > -1
		|| sSource.indexOf('SIA "Veselibas Centrs - 4" Testēšanas laboratorija') > -1
	) {
		oParsed = Parse_VC4(sSource);
	}
	else if (sSource.indexOf('SIA "NMS-LABORATORIJA"') > -1) {
		// NVMC format is very much like VC4, except for the mess with PDF encoding.
		console.log('No support for the messy NVMC PDF.');

		// vvv No, this works for too few cases.
		// Try to recover some important characters for the algorithm in "Parse_VC4" to work.
//		sSource = sSource.replace(/[✁✝✡✩ ]/g, 'ā');
//		sSource = sSource.replace(/[✌☞]/g, 'ē');
//		sSource = sSource.replace(/[✠]/g, 'ģ');
//		sSource = sSource.replace(/[✟]/g, 'ī');
//		sSource = sSource.replace(/[☛]/g, 'ņ');

//		oParsed = Parse_VC4(sSource);
//		console.log('Collected ', _.size(oParsed), ' results.');
	}
	else if (sSource.indexOf('egl.lv') > -1) {
		console.log('Gulbja laboratorija format to be (maybe only HTML)');
	}
	else {
		console.log('The results format not recognised.');
		console.log(sSource);
	}

	return oParsed;
}

function GetWaitableDb(sDatabaseFilePath)
{
	var oDb = new sqlite3.Database (sDatabaseFilePath);

	// For use with "wait.for" – the callback must have `(error, result)` parameters, not the result being in `this`.
	oDb.runStandardised = function (sQuery, oParams, fStandardCallback)
	{
		this.run (sQuery, oParams, function (oErr)
		{
			return fStandardCallback (oErr, this);
		});
	};

	return oDb;
}

function SelectAllFromDb (dbPath, fCallback)
{
	return new Promise(function (fResolve)
	{
		var oDb = GetWaitableDb(dbPath);

		var aTestsTaken = [];

		oDb.each('SELECT testable_quality_id, specimen_collection_time, result_value, ref, created_at, updated_at '
			+ 'FROM taken_tests', function (oError, oTakenTest)
		{
			if (oError) {
				console.log('DB error = ', oError);
			}
			else {
				aTestsTaken.push(oTakenTest)
			}
		}, function ()
		{
			fCallback(null, aTestsTaken);	// For `wait.for`.
			fResolve(aTestsTaken);
		});
	});
}

/**
 * TODO Use http://docs.sequelizejs.com/manual/tutorial/models-definition.html or http://bookshelfjs.org/#Model-subsection-construction
 *
 * @param {array} oTestResults As returned by "Parse".
 * @param {string} sReference
 */
function GetTestResultsInDbFormat (oTestResults, sReference)
{
	const aRows = [];

	_.forOwn(oTestResults, (oResult, sTestableQualityId) => {
		aRows.push({
			testable_quality_id: sTestableQualityId,
			specimen_collection_time: oResult.oCollectedAt.unix(),
			result_value: oResult.mResult,
			ref: sReference,
			created_at: undefined,
			updated_at: undefined
		});
	});

	return aRows;
}


function UpdateToDb (aTestResults)
{
	var iResultsToUpdate = _.size (aTestResults);
	var iResultsUpdated = 0;

	// A transaction gives a huge performance boost, in SQLite: http://stackoverflow.com/questions/18899828/best-practices-for-using-sqlite3-node-js.
	// TODO Detect and think what to do when overwriting (maybe even within the same oTestResults).
	wait.forMethod(oDb, 'run', 'BEGIN TRANSACTION');
	_.forEach(aTestResults, function (oResult)
	{
		var oValues = {
			':testable_quality_id': oResult.testable_quality_id,
			':result_value': oResult.result_value,
			':specimen_collection_time': oResult.specimen_collection_time,
			':ref': oResult.ref
		};

		// In case the result row already exists.
		iResultsUpdated += wait.forMethod (oDb, 'runStandardised',
			'UPDATE taken_tests SET result_value = :result_value, ref = :ref, updated_at = DATETIME() ' +
			'WHERE testable_quality_id = :testable_quality_id AND specimen_collection_time = :specimen_collection_time AND ref = :ref',
			oValues
		).changes;

		// In case the result row didn't exist.
		iResultsUpdated += wait.forMethod (oDb, 'runStandardised',
			'INSERT OR IGNORE INTO taken_tests (testable_quality_id, result_value, specimen_collection_time, ref, created_at) ' +
			'VALUES (:testable_quality_id, :result_value, :specimen_collection_time, :ref, DATETIME())',
			oValues
		).changes;
	});
    wait.forMethod(oDb, 'run', 'END');

	return {
		iResultsToUpdate: iResultsToUpdate,
		iResultsUpdated: iResultsUpdated
	};
}

function ClearTakenTestData ()
{
	wait.forMethod(oDb, 'run', 'DELETE FROM taken_tests');
}

function EscapeForShell (sCmd)
{
	return sCmd.replace (/(["\s'$`\\])/g,'\\$1');
}

const _ = require ('lodash');
const Promise = require('bluebird');

const path = require('path');

const moment = require ('moment-timezone');

const readChunk = require('read-chunk');
const fFileType = require('file-type');
const oFileSystem = require('fs');

// For easier calling asynchronous functions with callback parameters synchronously.
var wait = require ('wait.for');

var sqlite3 = require ('sqlite3').verbose ();

var oDb = GetWaitableDb('database/database.sqlite');

var fExecute = require ('child_process').execSync;
//var fReadFile = require('fs').readFileSync; var sRawText = fReadFile('dev/tests.txt', {encoding: 'UTF-8'});

//var aPdfFiles = ['dev/tests.pdf'];
var aPdfFiles = process.argv.slice (2);

/**
 * @param {string} sFilePath
 * @return {string}
 */
function GetFileType (sFilePath)
{
	let sFileType = '';

	try {
		if (! oFileSystem.lstatSync(sFilePath).isFile()) {
			// May be a directory.
			sFileType = 'nonfile';
		}
		else {
			const oFileType = fFileType(readChunk.sync(sFilePath, 0, 4100));

			if (oFileType) {
				sFileType = oFileType.mime;
			}
			else {
				sFileType = 'unknown';
			}
		}
	}
	catch (oException) {
		// The file is not accessible (probably, doesn't exist).
		sFileType = 'inaccessible';
	}

	return sFileType;
}

function ProcessSourceFiles ()
{
	var iTotal = 0;
	var aTestResultsToImport = [];

	for (const filePath of aPdfFiles) {
		const fileType = GetFileType(filePath);

		switch (fileType) {
		case 'application/pdf':
			console.log('Importing ' + fileType + ': ' + filePath + ')...');

			var oParsed = Parse(fExecute(
				'pdftotext -layout ' + EscapeForShell(filePath) + ' -',
				{encoding: 'UTF-8'}
			));
			aTestResultsToImport = GetTestResultsInDbFormat(oParsed, path.basename(filePath));

			iTotal += _.size(aTestResultsToImport);
			console.log(UpdateToDb(aTestResultsToImport));
			break;

		case 'application/x-sqlite3':
			console.log('Importing ' + fileType + ': ' + filePath + ')...');

			aTestResultsToImport = wait.for(SelectAllFromDb, filePath);

			iTotal += _.size(aTestResultsToImport);
			console.log(UpdateToDb (aTestResultsToImport, path.basename(filePath)));
			break;

		default:
			console.log('Skipping file ', fileType, ': ', filePath);
		}
	}

	console.log('Total qualities recognised: ', iTotal);
}

GetTestConfig ().done (async function (aTests)
{
	Parse.aTests = aTests;

	wait.launchFiber(() => {
		ClearTakenTestData();
		ProcessSourceFiles();
	});
});
