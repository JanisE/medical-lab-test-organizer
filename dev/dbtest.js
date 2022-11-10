const Sequelize = require('sequelize');

//const oModels = require('./src/models').createTables(new Sequelize(
//	'sqlite://./database/database_test.sqlite',
//	{operatorsAliases: false, logging: false}
//));

const oModels = require('./src/models').GetModels(new Sequelize(
	'sqlite://./database/database.sqlite',
	{operatorsAliases: false, logging: false}
));



oModels.TestableQuality.findAll({include: {model: oModels.SearchPattern}})
.then((res) => {console.log(res[0].id, res[0].search_patterns[0].pattern)});





//oDb.each ('SELECT tq.id, tq.specimen_source_type, pattern, type AS pattern_type '
//	+ 'FROM testable_qualities tq '
//	+ 'INNER JOIN search_patterns ON testable_quality_id = tq.id', function (oError, oQuality)
//{
//	if (oError) {
//		console.log ('DB error = ', oError);
//	}
//	else {
//		if (! aTests [oQuality.id]) {
//			aTests [oQuality.id] = {
//				aMarkedBy: [],
//				sSpecimenSourceType: oQuality.specimen_source_type
//			};
//		}
//
//		aTests [oQuality.id].aMarkedBy.push({
//			pattern: oQuality.pattern,
//			type: oQuality.pattern_type
//		});
//	}
//}, function ()
//{
//	fResolve(aTests);
//});