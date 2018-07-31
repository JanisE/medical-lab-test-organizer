#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e '.mode insert test_classes\nselect * from test_classes;' | sqlite3 "$SCRIPT_DIR/../database/database.sqlite" > "$SCRIPT_DIR/../database/seeds/TestClassesTableSeeder.sql"
echo -e '.mode insert testable_qualities\nselect * from testable_qualities;' | sqlite3 "$SCRIPT_DIR/../database/database.sqlite" > "$SCRIPT_DIR/../database/seeds/TestableQualitiesTableSeeder.sql"
echo -e '.mode insert test_names\nselect * from test_names;' | sqlite3 "$SCRIPT_DIR/../database/database.sqlite" > "$SCRIPT_DIR/../database/seeds/TestNamesTableSeeder.sql"
echo -e '.mode insert search_patterns\nselect * from search_patterns;' | sqlite3 "$SCRIPT_DIR/../database/database.sqlite" > "$SCRIPT_DIR/../database/seeds/SearchPatternsTableSeeder.sql"
