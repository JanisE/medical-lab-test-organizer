const _ = require('lodash');
//const Promise = require('bluebird'); // Sequelize uses its own Bluebird Promise internally.

const path = require('path');

const moment = require('moment-timezone');

const readChunk = require('read-chunk');
const fFileType = require('file-type');
const oFileSystem = require('fs');

const fExecute = require('child_process').execSync;
//var fReadFile = require('fs').readFileSync; var sRawText = fReadFile('dev/tests.txt', {encoding: 'UTF-8'});

const Sequelize = require('sequelize');



// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeForRegExp (string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @return {Promise<Object>} Configuration map.
 */
function getTestConfig () {
	return oModels.TestableQuality.findAll({include: {model: oModels.SearchPattern}}) // eslint-disable-line no-use-before-define
		.then((aQualities) => {
			const oTests = {};

			_.forEach(aQualities, (oQuality) => {
				if (! oTests[oQuality.id]) {
					oTests[oQuality.id] = {
						aMarkedBy: [],
						sSpecimenSourceType: oQuality.specimen_source_type
					};
				}

				_.forEach(oQuality.search_patterns, (oPattern) => {
					oTests[oQuality.id].aMarkedBy.push({
						pattern: oPattern.pattern,
						type: oPattern.type
					});
				});
			});

			return oTests;
		});
}

function parseVC4 (sSource) {
	const oParsed = {};

	const oSources = [];
	sSource.replace(/Materiāls[\s\S]+?Izpildītāj(?:s|i)/g, (sSingleSource) => {
		let sSpecimenSourceType = 'Unexpected';
		const [, sSpecimenSourceTypeRaw] = sSingleSource.match(/Materiāla tips:\s+(.+)/);
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
			console.log('Unepxected specimen source type: ', sSpecimenSourceTypeRaw);
		}

		let sCollectedAt;
		try {
			sCollectedAt = sSingleSource.match(/Materiāla paņemš.datums\/laiks:\s+(\d+\.\d+\.\d+ \d+:\d+)\b/)[1];
		}
		catch (oException1) {
			try {
				sCollectedAt = sSingleSource.match(/Materiāla paņemš.datums\/laiks:\s+(\d+\.\d+\.\d+)\b/)[1] + ' 00:00';
			}
			catch (oException2) {
				console.log('Registration time used as the specimen collection time!');
				try {
					sCollectedAt = sSingleSource.match(/Reģistrācijas datums: (\d+\.\d+\.\d+ \d+:\d+)\b/)[1];
				}
				catch (oException3) {
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

	_.forOwn(oSources, (oSource) => {
		_.forEach(parse.aTests, (oTest, sTestKey) => {
			if (oSource.sSpecimenSourceType === oTest.sSpecimenSourceType) {
				for (let iPattern = oTest.aMarkedBy.length - 1; iPattern >= 0; iPattern--) {
					if (oTest.aMarkedBy[iPattern].type != 'literal' && oTest.aMarkedBy[iPattern].type != 'regexp') {
						console.error('Unexpected pattern type: ', oTest.aMarkedBy[iPattern]);
					}

					const oMatches = oSource.sSource.match(
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
							// [^\\s\\d]+ {1, 3}[\\S\\d]+ e.g. 'gaiši brūna', 'nav atrasts'.
							// Up to 3 space, because there were such cases in old PDFs.
							+ '[^\\S\\r\\n]+([^\\s\\d]+ {1,3}[\\S\\d]+|(< |> )?[\\S]+)',
							'm'
						)
					);

					if (oMatches) {
						oParsed[sTestKey] = {
							mResult: oMatches[2],
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
function parse (sSource) {
	let oParsed = {};

	if (
		sSource.indexOf('Medicīnas centrs "Veselibas Centrs - 4" Testēšanas laboratorija') > -1
		|| sSource.indexOf('Medicīnas centrs "Veselības Centrs 4" Laboratorija') > -1
		|| sSource.indexOf('Medicīnas centrs "Veselības Centrs - 4" Laboratorija') > -1
		|| sSource.indexOf('SIA "Veselības Centrs 4" Laboratorija') > -1
		|| sSource.indexOf('SIA "Veselibas Centrs - 4" Testēšanas laboratorija') > -1
	) {
		oParsed = parseVC4(sSource);
	}
	else if (sSource.indexOf('SIA "NMS-LABORATORIJA"') > -1) {
		// NVMC format is very much like VC4, except for the mess with PDF encoding.
		console.log('No support for the messy NVMC PDF.');

		// vvv No, this works for too few cases.
		// Try to recover some important characters for the algorithm in "parseVC4" to work.
//		sSource = sSource.replace(/[✁✝✡✩ ]/g, 'ā');
//		sSource = sSource.replace(/[✌☞]/g, 'ē');
//		sSource = sSource.replace(/[✠]/g, 'ģ');
//		sSource = sSource.replace(/[✟]/g, 'ī');
//		sSource = sSource.replace(/[☛]/g, 'ņ');
//
//		oParsed = parseVC4(sSource);
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

/**
 * @param {string} dbPath Path to the DB file.
 *
 * @return {Promise<Array<TakenTest>>} A list of TakenTest's.
 */
async function selectAllFromDb (dbPath) {
	const oModels = require('./src/models').getModels(new Sequelize(
		'sqlite://' + dbPath,
		{operatorsAliases: false, logging: false}
	));

	const aDbRows = await oModels.TakenTest.findAll({raw: true});

	const rgIsTimestamp = new RegExp('^\\d{10}$');
	for (let i = aDbRows.length - 1; i >= 0; i--) {
		// Support importing from the old format (time in Unix timestamp format).
		if (rgIsTimestamp.test(aDbRows[i].specimen_collection_time)) {
			aDbRows[i].specimen_collection_time = aDbRows[i].specimen_collection_time * 1000;
		}
	}

	return aDbRows;
}

/**
 * @param {Array} oTestResults As returned by "parse".
 * @param {string} sReference Record source reference.
 *
 * @return {Array} Array of TakenTest's.
 */
function getTestResultsInDbFormat (oTestResults, sReference) {
	const aRows = [];

	_.forOwn(oTestResults, (oResult, sTestableQualityId) => {
		aRows.push(new oModels.TakenTest({ 	// eslint-disable-line no-use-before-define
			/* eslint-disable camelcase */
			testable_quality_id: sTestableQualityId,
			specimen_collection_time: oResult.oCollectedAt,
			result_value: oResult.mResult,
			ref: sReference
			/* eslint-enable camelcase */
		}));
	});

	return aRows;
}


/**
 * @param {TakenTest[]|Object[]} aTestResults Test results to insert/update.
 *
 * @return {Promise<{iResultsToUpdate: number, iResultsUpdated: number}>} Updating status.
 */
function updateToDb (aTestResults) {
	// TODO Detect and think what to do when overwriting (maybe even within the same oTestResults).
	// A transaction gives a huge performance boost, in SQLite:
	// http://stackoverflow.com/questions/18899828/best-practices-for-using-sqlite3-node-js.
	return oDb
		.transaction(async oTransaction => {
			// A non-bulk (slower) version for inserting or updating un duplicates.
			let iUpdated = 0;

			for (const oTestResult of aTestResults) {
				const oTestResultValues = oTestResult instanceof oModels.TakenTest ? oTestResult.get() : oTestResult;

				await oModels.TakenTest.findOrCreate({
					where: {
						/* eslint-disable camelcase */
						testable_quality_id: oTestResult.testable_quality_id,
						specimen_collection_time: oTestResult.specimen_collection_time,
						ref: oTestResult.ref
						/* eslint-enable camelcase */
					},
					defaults: oTestResultValues,
					transaction: oTransaction
				}).spread((oTakenTest, bCreated) => {
					if (! bCreated) {
						oTakenTest.set(oTestResultValues);
						if (oTakenTest.changed()) {
							oTakenTest.save();	// `save` includes `changed` check, but we need it for iUpdated.
							iUpdated++;
						}
						// Else: DB has the same values already.
					}
					else {
						iUpdated++;
					}
				})
					.catch(oError => {
						console.log('updateToDb failed for ', oTestResult);
						throw oError;
					});
			}

			return iUpdated;

			// A bulk version if we keep the existing values:
//			return oModels.TakenTest.bulkCreate(
//				(aTestResults[0] instanceof oModels.TakenTest
//					? aTestResults.map(oModel => oModel.get())
//					: aTestResults
//				), {
//					fields: ['testable_quality_id', 'result_value', 'specimen_collection_time', 'ref'],
//					// TODO Do I need to manually set transaction?
//					transaction: oTransaction,
//					ignoreDuplicates: true
//				});
		})
		.then(iUpdated => {
			return {
				iResultsToUpdate: _.size(aTestResults),
				// Used `aRecords.length` in case of `bulkCreate`, but it counted ignored rows as updated, too.
				iResultsUpdated: iUpdated
			};
		})
		.catch(oError => {
			console.log('updateToDb failed: ', oError);
			throw oError;
		});
}

/**
 * @return {Promise} Resolves when done.
 */
function clearTakenTestData () {
	return oModels.TakenTest.truncate();
}

function escapeForShell (sCmd) {
	return sCmd.replace(/(["\s'$`\\])/g, '\\$1');
}

/**
 * @param {string} sFilePath File path.
 *
 * @return {string} File type.
 */
function getFileType (sFilePath) {
	let sFileType = '';

	try {
		if (! oFileSystem.lstatSync(sFilePath).isFile()) {
			// May be a directory.
			sFileType = 'nonfile';
		}
		else {
			const maxBytesForDeterminingFileType = 4100;
			const oFileType = fFileType(readChunk.sync(sFilePath, 0, maxBytesForDeterminingFileType));

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

async function processSourceFiles () {
	let iTotal = 0;
	let aTestResultsToImport = [];

	for (const filePath of aPdfFiles) {
		const fileType = getFileType(filePath);

		switch (fileType) {
		case 'application/pdf':
			console.log('Importing ' + fileType + ': ' + filePath + ')...');

			const oParsed = parse(fExecute(
				'pdftotext -layout ' + escapeForShell(filePath) + ' -',
				{encoding: 'UTF-8'}
			));
			aTestResultsToImport = getTestResultsInDbFormat(oParsed, path.basename(filePath));

			iTotal += _.size(aTestResultsToImport);
			console.log(await updateToDb(aTestResultsToImport));
			break;

		case 'application/x-sqlite3':
			console.log('Importing ' + fileType + ': ' + filePath + ')...');

			aTestResultsToImport = await selectAllFromDb(filePath);

			iTotal += _.size(aTestResultsToImport);
			console.log(await updateToDb(aTestResultsToImport));
			break;

		default:
			console.log('Skipping file ', fileType, ': ', filePath);
		}
	}

	console.log('Total qualities recognised: ', iTotal);
}




const [, , ...aPdfFiles] = process.argv;

const oDb = new Sequelize(
	'sqlite://./database/database.sqlite',
	{operatorsAliases: false, logging: false}
);

const oModels = require('./src/models').getModels(oDb);

(async function Main () {
	parse.aTests = await getTestConfig();

	await clearTakenTestData();

	return processSourceFiles();
}());
