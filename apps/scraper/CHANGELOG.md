# scraper

## 1.6.1

### Patch Changes

- [#141](https://github.com/g-raman/uenroll/pull/141) [`5e0cdbf`](https://github.com/g-raman/uenroll/commit/5e0cdbf4f0575082266edc839b24458c464ef2ba) Thanks [@g-raman](https://github.com/g-raman)! - Fix check other and billingual option for languages because certain search results are excluded otherwise

- [#143](https://github.com/g-raman/uenroll/pull/143) [`3a8bcac`](https://github.com/g-raman/uenroll/commit/3a8bcac4b7470406ad7283229c03d98655199fa9) Thanks [@g-raman](https://github.com/g-raman)! - Update deps

## 1.6.0

### Minor Changes

- [#137](https://github.com/g-raman/uenroll/pull/137) [`34f162c`](https://github.com/g-raman/uenroll/commit/34f162c12fbd062d548ba84569c69f6db30bb55a) Thanks [@g-raman](https://github.com/g-raman)! - Use bun instead of pnpm

- [#139](https://github.com/g-raman/uenroll/pull/139) [`9309484`](https://github.com/g-raman/uenroll/commit/9309484ab2bedab1f124f7702456ed9c1511b6a3) Thanks [@g-raman](https://github.com/g-raman)! - Migrate script to use bun

### Patch Changes

- [#131](https://github.com/g-raman/uenroll/pull/131) [`99f2e26`](https://github.com/g-raman/uenroll/commit/99f2e26eca69a9fc2b0d407894ab2c0d2e26d515) Thanks [@g-raman](https://github.com/g-raman)! - Update dependencies

## 1.5.0

### Minor Changes

- [#122](https://github.com/g-raman/uenroll/pull/122) [`fb33f1f`](https://github.com/g-raman/uenroll/commit/fb33f1ff00b7f6cd678171afe68c03a91548a4d6) Thanks [@g-raman](https://github.com/g-raman)! - Handled case where search results exceed maximum by querying english and french courses separately

- [#123](https://github.com/g-raman/uenroll/pull/123) [`e5649e6`](https://github.com/g-raman/uenroll/commit/e5649e669a334e91eeefdd71ed944aab9b5ca65c) Thanks [@g-raman](https://github.com/g-raman)! - Used pino for logging

### Patch Changes

- [#127](https://github.com/g-raman/uenroll/pull/127) [`491dac5`](https://github.com/g-raman/uenroll/commit/491dac53a60ffbbf267313db543a7f606e960779) Thanks [@g-raman](https://github.com/g-raman)! - Fixed bug with pino

- [#121](https://github.com/g-raman/uenroll/pull/121) [`5325388`](https://github.com/g-raman/uenroll/commit/5325388488fb44a3f66c51b7a4abccf2ba0e94f9) Thanks [@g-raman](https://github.com/g-raman)! - Updated new section regex to include section of format P200

## 1.4.1

### Patch Changes

- [#116](https://github.com/g-raman/uenroll/pull/116) [`be9f67d`](https://github.com/g-raman/uenroll/commit/be9f67d8a56548661606a43ef07b10610e9aef54) Thanks [@g-raman](https://github.com/g-raman)! - Updated all dependencies to latest

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
