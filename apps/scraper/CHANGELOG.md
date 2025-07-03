# scraper

## 1.4.0

### Minor Changes

- [#106](https://github.com/g-raman/uenroll/pull/106) [`0306479`](https://github.com/g-raman/uenroll/commit/03064794f717c007f20d39291968c157174d4020) Thanks [@g-raman](https://github.com/g-raman)! - Added neverthrow for better error handling

- [#104](https://github.com/g-raman/uenroll/pull/104) [`f67b5b3`](https://github.com/g-raman/uenroll/commit/f67b5b346b87670b189cf9151b1531538b59e534) Thanks [@g-raman](https://github.com/g-raman)! - Migrated all db queries to db package

### Patch Changes

- [#105](https://github.com/g-raman/uenroll/pull/105) [`d28b0f8`](https://github.com/g-raman/uenroll/commit/d28b0f8ddfb75d70cf82b311201f8f01095c13ee) Thanks [@g-raman](https://github.com/g-raman)! - Fixed error with courses with unknown dates

## 1.3.0

### Minor Changes

- [#101](https://github.com/g-raman/uenroll/pull/101) [`94d56e2`](https://github.com/g-raman/uenroll/commit/94d56e20d02619ba7c58526cd682ac593b9c4a83) Thanks [@g-raman](https://github.com/g-raman)! - Switched to arm architecture and used medium ec2 instance for scraper

## 1.2.2

### Patch Changes

- [#80](https://github.com/g-raman/uenroll/pull/80) [`56f1ef9`](https://github.com/g-raman/uenroll/commit/56f1ef9843a5e55484b39fddb7b81651eec76759) Thanks [@g-raman](https://github.com/g-raman)! - Show virtual classes

## 1.2.1

### Patch Changes

- [#73](https://github.com/g-raman/uenroll/pull/73) [`08b9d82`](https://github.com/g-raman/uenroll/commit/08b9d828dd817e2b6675f5c5f8e8d4e850e430e2) Thanks [@g-raman](https://github.com/g-raman)! - Remove outdated terms from db after scraping new terms

## 1.2.0

### Minor Changes

- [#66](https://github.com/g-raman/uenroll/pull/66) [`aa4174f`](https://github.com/g-raman/uenroll/commit/aa4174f6f8c7a6d03d61ef2fbba9c62be869e289) Thanks [@g-raman](https://github.com/g-raman)! - Fix linting errors. Add linting and formatting scripts. Add catalogs for common dependencies.

## 1.1.1

### Patch Changes

- [#55](https://github.com/g-raman/uenroll/pull/55) [`c177ced`](https://github.com/g-raman/uenroll/commit/c177ced05a552a024999b6883557eec83b44dd76) Thanks [@g-raman](https://github.com/g-raman)! - Add build step for DB package and use transpiled files. Build scraper during EC2 instance setup.

## 1.1.0

### Minor Changes

- [#46](https://github.com/g-raman/uenroll/pull/46) [`76079b4`](https://github.com/g-raman/uenroll/commit/76079b42eac4fb3ed07c44c4ba38abb680052daf) Thanks [@g-raman](https://github.com/g-raman)! - Moved the database config, schema, and migrations to shared folder under `packages`
