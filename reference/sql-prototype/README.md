# SQLite nutrition DB

Build the database locally:

- `sqlite3 db/nutrition.sqlite ".read db/schema.sql" ".read db/seed.sql"`

Quick sanity checks:

- `sqlite3 db/nutrition.sqlite "select count(*) from nutrient;"`
- `sqlite3 db/nutrition.sqlite "select count(*) from pregnancy_week;"`

Example queries live in:

- [db/example-queries.sql](./example-queries.sql)
