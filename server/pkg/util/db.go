package util

import (
	"database/sql"
	"embed"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/mattn/go-sqlite3"
)

func ConnectDB(migrations embed.FS) *goqu.Database {
	db, err := sql.Open("sqlite3", "./vesa.db")
	if err != nil {
		panic(err)
	}

	goquDb := goqu.Dialect("sqlite3").DB(db)
	migrate(migrations, goquDb)
	return goquDb
}

func ensureMigrationsTable(db *goqu.Database) {
	db.Exec(`
		CREATE TABLE IF NOT EXISTS _migrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			created_at DATETIME
		)
	`)
}

func migrate(migrationsDir embed.FS, db *goqu.Database) {
	ensureMigrationsTable(db)

	migrations, err := migrationsDir.ReadDir("migrations")
	if err != nil {
		panic(err)
	}

	for _, migration := range migrations {
		empty := struct{}{}
		found, err := db.
			Select("id").
			From("_migrations").
			Where(goqu.Ex{"name": migration.Name()}).
			ScanStruct(&empty)

		if err != nil {
			panic(err)
		}

		if found {
			continue
		}

		migrationFile, err := migrationsDir.ReadFile("migrations/" + migration.Name())
		if err != nil {
			panic(err)
		}

		_, err = db.Exec(string(migrationFile))
		if err != nil {
			panic(err)
		}

		_, err = db.
			Insert("_migrations").
			Rows(goqu.Record{"name": migration.Name()}).
			Executor().Exec()

		if err != nil {
			panic(err)
		}
	}
}
