# @repo/db

## 0.5.1

### Patch Changes

- [#111](https://github.com/g-raman/uenroll/pull/111) [`6dd6e04`](https://github.com/g-raman/uenroll/commit/6dd6e04cc350021bbb06b60df6bbc2088eccacb0) Thanks [@g-raman](https://github.com/g-raman)! - Removed unnecessary fields

## 0.5.0

### Minor Changes

- [#107](https://github.com/g-raman/uenroll/pull/107) [`dbf5bcc`](https://github.com/g-raman/uenroll/commit/dbf5bccb615212c76c4ce09713c18c792d6dbfe6) Thanks [@g-raman](https://github.com/g-raman)! - Used drizzle for get course query instead of raw sql. Migrated get course query to db package

- [#106](https://github.com/g-raman/uenroll/pull/106) [`0306479`](https://github.com/g-raman/uenroll/commit/03064794f717c007f20d39291968c157174d4020) Thanks [@g-raman](https://github.com/g-raman)! - Added neverthrow for better error handling

- [#104](https://github.com/g-raman/uenroll/pull/104) [`f67b5b3`](https://github.com/g-raman/uenroll/commit/f67b5b346b87670b189cf9151b1531538b59e534) Thanks [@g-raman](https://github.com/g-raman)! - Migrated all db queries to db package

## 0.4.1

### Patch Changes

- [#98](https://github.com/g-raman/uenroll/pull/98) [`8ac29bc`](https://github.com/g-raman/uenroll/commit/8ac29bc49e2ad20b8b652992081a46f7cdccde17) Thanks [@g-raman](https://github.com/g-raman)! - Added simpler db:init command

## 0.4.0

### Minor Changes

- [#75](https://github.com/g-raman/uenroll/pull/75) [`cc83570`](https://github.com/g-raman/uenroll/commit/cc83570636d131e45b4466871f67a3b924a60ba7) Thanks [@g-raman](https://github.com/g-raman)! - Create file to store queries for db

## 0.3.0

### Minor Changes

- [#63](https://github.com/g-raman/uenroll/pull/63) [`4fd908d`](https://github.com/g-raman/uenroll/commit/4fd908d42fa647987b774348d58bd15bd1c345d0) Thanks [@g-raman](https://github.com/g-raman)! - Simplify local db setup. Added compose.yml for local pg instance. Add seeding. Use default pg uri in env for dev.

- [#66](https://github.com/g-raman/uenroll/pull/66) [`aa4174f`](https://github.com/g-raman/uenroll/commit/aa4174f6f8c7a6d03d61ef2fbba9c62be869e289) Thanks [@g-raman](https://github.com/g-raman)! - Fix linting errors. Add linting and formatting scripts. Add catalogs for common dependencies.

## 0.2.0

### Minor Changes

- [#58](https://github.com/g-raman/uenroll/pull/58) [`39d630b`](https://github.com/g-raman/uenroll/commit/39d630b002bf5bf1e11b7e32f81468efa72a6b63) Thanks [@g-raman](https://github.com/g-raman)! - Make db package usable in Nextjs app

## 0.1.1

### Patch Changes

- [#55](https://github.com/g-raman/uenroll/pull/55) [`c177ced`](https://github.com/g-raman/uenroll/commit/c177ced05a552a024999b6883557eec83b44dd76) Thanks [@g-raman](https://github.com/g-raman)! - Add build step for DB package and use transpiled files. Build scraper during EC2 instance setup.

## 0.1.0

### Minor Changes

- [#46](https://github.com/g-raman/uenroll/pull/46) [`76079b4`](https://github.com/g-raman/uenroll/commit/76079b42eac4fb3ed07c44c4ba38abb680052daf) Thanks [@g-raman](https://github.com/g-raman)! - Moved the database config, schema, and migrations to shared folder under `packages`
