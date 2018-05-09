const Sequelize = require('sequelize');


function GetModels (sequelize)
{
	// Building a DB model as similar as possible to that built by Laravel.
	// There are various differences (varchar lengths, non-null timestamps, explicitly nullable fields),
	// but they are not critical as long as we can read and update the DB as we need it.

	// Reproduces 2017_05_10_065054_create_test_classes_table.php
	const TestClass = sequelize.define(
		'test_class', {
			id: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
			name_lv: {type: Sequelize.TEXT, allowNull: true},
			name_en: {type: Sequelize.TEXT, allowNull: true},
			order: {type: Sequelize.INTEGER, allowNull: true}
		}, {
			timestamps: false
		}
	);

	// Reproduces 2017_05_11_064315_create_testable_qualities_table.php
	const TestableQuality = sequelize.define(
		'testable_quality', {
			id: {type: Sequelize.STRING(32), allowNull: false, primaryKey: true},
			specimen_source_type: Sequelize.STRING(16),
			unit: {type: Sequelize.STRING(16), allowNull: true},
			norms_lower_boundary: {type: Sequelize.STRING(32), allowNull: true},
			norms_upper_boundary: {type: Sequelize.STRING(32), allowNull: true},
			comments: {type: Sequelize.TEXT, allowNull: true}
		}, {
			timestamps: false
		}
	);
	TestableQuality.belongsTo(TestClass, {foreignKey: 'test_class_id'});
	TestClass.hasMany(TestableQuality, {foreignKey: 'test_class_id'});

	// Reproduces 2017_05_11_064342_create_taken_tests_table.php
	const TakenTest = sequelize.define(
		'taken_test', {
			id: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
			specimen_collection_time: {type: Sequelize.DATE, allowNull: true},
			result_value: Sequelize.STRING(32),
			ref: {type: Sequelize.STRING(255), allowNull: true}
		}, {
			indexes: [{unique: true, fields: ['testable_quality_id', 'specimen_collection_time', 'ref']}],
			timestamps: true,
			underscored: true
		}
	);
	TakenTest.belongsTo(TestableQuality, {foreignKey: 'testable_quality_id'});
	TestableQuality.hasMany(TakenTest, {foreignKey: 'testable_quality_id'});

	// Reproduces 2017_05_11_172900_create_search_patterns_table.php
	const SearchPattern = sequelize.define(
		'search_pattern', {
			id: {type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true},
			type: {type: Sequelize.STRING(16), defaultValue: 'literal'},
			pattern: Sequelize.STRING(255)
		}, {
			timestamps: false
		}
	);
	SearchPattern.belongsTo(TestableQuality, {foreignKey: 'testable_quality_id'});
	TestableQuality.hasMany(SearchPattern, {foreignKey: 'testable_quality_id'});

	// Reproduces 2017_05_12_140526_create_test_names_table.php
	const TestName = sequelize.define(
		'test_name', {
			id: {
				type: Sequelize.STRING(32),
				primaryKey: true,
				references: {model: TestableQuality, key: 'id'}
			},
			name_lv: {type: Sequelize.TEXT, allowNull: true},
			name_en: {type: Sequelize.TEXT, allowNull: true}
		}
	);
	TestName.belongsTo(TestableQuality, {foreignKey: 'id'});
	TestableQuality.hasOne(TestName, {foreignKey: 'id'});

	return {
		TestClass: TestClass,
		TestableQuality: TestableQuality,
		TakenTest: TakenTest,
		SearchPattern: SearchPattern,
		TestName: TestName
	}
}

// For testing.
function CreateTables (sequelize)
{
	const oModels = GetModels(sequelize);

	oModels.TestClass.sync();
	oModels.TestableQuality.sync();
	oModels.TakenTest.sync();
	oModels.SearchPattern.sync();
	oModels.TestName.sync();
}

module.exports = exports = {
	GetModels: GetModels,
	CreateTables: CreateTables
};
