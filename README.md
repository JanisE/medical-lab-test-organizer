## Requirements

I'm using a Linux Ubuntu-like distribution, that's where the command examples come from.

* SQLite3 driver for PHP:
```bash
sudo apt-get install php-sqlite3
```
* `pdftotext` utility:
```bash
sudo apt-get install poppler-utils
```

* Node.js version >=7.6 (`async` functions)

## Installation

```bash
bash INSTALL.sh
```

## Usage

### Import data

```bash
bash parse.sh
```

Clears the current database (`database/database.sqlite`) of test data and imports new data from all files in `storage/data-sources/`.

Stores the file names as source references, so meaningful file names are advisable.

Assumes timezone "Europe/Riga" (+02:00/+03:00).

Stores the time in UTC (loses the (implicit) timezone info).

#### File types

PDF and SQLite3 file types are supported.

PDF formats:
* "Veselības Centrs 4".

SQLite3 formats:
* DB files matching the database structure of `database/database.sqlite` (specifically, table `taken_tests`).
  * (Updating of testable qualities and related properties is not supported, so `taken_tests` data must not reference entries in other tables that are not already present.) 
  * __The expected use case__
    * first time:
      * add some PDFs into `storage/data-sources/`,
      * parse/import,
      * copy `database/database.sqlite` into `storage/data-sources/` (as both a backup and a source for the next time),
      * remove the PDFs;
    * next time:
      * add some new PDFs into `storage/data-sources/` (keeping the old copied `database.sqlite`),
      * parse/import,
      * copy the new `database/database.sqlite` into `storage/data-sources/`, overwriting the old one,
      * remove the PDFs;
    * in other words, copy `database/database.sqlite` into `storage/data-sources/` to carry the old/current test data (data that would not be imported from the other data sources in `storage/data-sources/`, because it was manually entered or adjusted, or because the original sources have since been removed from the folder) over into the new data set.

#### Precedence

`parse.sh` reads the source files alphabetically by name, later entries overwriting the earlier ones (when the time and the test item match).

### View

```bash
php artisan serve
```

Launches a server that serves a website accessible at [http://127.0.0.1:8000](http://127.0.0.1:8000) using the data of the database.

## Examples

Not yet.

## Development

### DB seeding

* Create/update the seed data from the current database by:
```bash
bash dev/createSeedData.sh
```

## Contribution

Pull requests are welcome.
