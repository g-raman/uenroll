# web

## 0.11.0

### Minor Changes

- [#114](https://github.com/g-raman/uenroll/pull/114) [`8e3e091`](https://github.com/g-raman/uenroll/commit/8e3e091ffb1e70a0717565017133f6839b57dae3) Thanks [@g-raman](https://github.com/g-raman)! - Added sonner for toasts and removed react hot toast

### Patch Changes

- [#116](https://github.com/g-raman/uenroll/pull/116) [`be9f67d`](https://github.com/g-raman/uenroll/commit/be9f67d8a56548661606a43ef07b10610e9aef54) Thanks [@g-raman](https://github.com/g-raman)! - Updated all dependencies to latest

- [#118](https://github.com/g-raman/uenroll/pull/118) [`bf1ffd2`](https://github.com/g-raman/uenroll/commit/bf1ffd20172a5d0738ab0e694e24775c9f6ee67b) Thanks [@g-raman](https://github.com/g-raman)! - Showed alert dialog before changing terms

- [#117](https://github.com/g-raman/uenroll/pull/117) [`924038d`](https://github.com/g-raman/uenroll/commit/924038d684562786a25baaa0f484781b7aaac54d) Thanks [@g-raman](https://github.com/g-raman)! - Made sub section selection mutually exclusive

## 0.10.0

### Minor Changes

- [#111](https://github.com/g-raman/uenroll/pull/111) [`6dd6e04`](https://github.com/g-raman/uenroll/commit/6dd6e04cc350021bbb06b60df6bbc2088eccacb0) Thanks [@g-raman](https://github.com/g-raman)! - Migrated to TRPC and simplifed client side state

### Patch Changes

- [#112](https://github.com/g-raman/uenroll/pull/112) [`070aff2`](https://github.com/g-raman/uenroll/commit/070aff2dd657a6db555fed9e0ebc07652b5c0f81) Thanks [@g-raman](https://github.com/g-raman)! - Used window object to get base url to avoid issues on non-production branches

- [#113](https://github.com/g-raman/uenroll/pull/113) [`f0740da`](https://github.com/g-raman/uenroll/commit/f0740da837a81588362e6e118f54ecdc32ec4726) Thanks [@g-raman](https://github.com/g-raman)! - Made sub section selection mutually exclusive based on sections

- [#109](https://github.com/g-raman/uenroll/pull/109) [`57ff20f`](https://github.com/g-raman/uenroll/commit/57ff20ff90eb73771941aaa7158fff07cb5506dd) Thanks [@g-raman](https://github.com/g-raman)! - Cached get course query

## 0.9.0

### Minor Changes

- [#107](https://github.com/g-raman/uenroll/pull/107) [`dbf5bcc`](https://github.com/g-raman/uenroll/commit/dbf5bccb615212c76c4ce09713c18c792d6dbfe6) Thanks [@g-raman](https://github.com/g-raman)! - Used drizzle for get course query instead of raw sql. Migrated get course query to db package

- [#102](https://github.com/g-raman/uenroll/pull/102) [`465173c`](https://github.com/g-raman/uenroll/commit/465173c731d39bb32b6c6a8a2940971003803ca8) Thanks [@g-raman](https://github.com/g-raman)! - Migrated react context to zustand

- [#106](https://github.com/g-raman/uenroll/pull/106) [`0306479`](https://github.com/g-raman/uenroll/commit/03064794f717c007f20d39291968c157174d4020) Thanks [@g-raman](https://github.com/g-raman)! - Added neverthrow for better error handling

- [#104](https://github.com/g-raman/uenroll/pull/104) [`f67b5b3`](https://github.com/g-raman/uenroll/commit/f67b5b346b87670b189cf9151b1531538b59e534) Thanks [@g-raman](https://github.com/g-raman)! - Migrated all db queries to db package

### Patch Changes

- [#105](https://github.com/g-raman/uenroll/pull/105) [`d28b0f8`](https://github.com/g-raman/uenroll/commit/d28b0f8ddfb75d70cf82b311201f8f01095c13ee) Thanks [@g-raman](https://github.com/g-raman)! - Fixed error with courses with unknown dates

- [#108](https://github.com/g-raman/uenroll/pull/108) [`023f3e6`](https://github.com/g-raman/uenroll/commit/023f3e639543f460af67434d69575341e2bdc04d) Thanks [@g-raman](https://github.com/g-raman)! - Used shadcn skeleton for term selector and adjusted accent colour

## 0.8.1

### Patch Changes

- [#100](https://github.com/g-raman/uenroll/pull/100) [`0a821b4`](https://github.com/g-raman/uenroll/commit/0a821b4efe4050ee72b4aff3c332f5132a5c9d3d) Thanks [@g-raman](https://github.com/g-raman)! - Fixed search results overflowing

- [#96](https://github.com/g-raman/uenroll/pull/96) [`b77c772`](https://github.com/g-raman/uenroll/commit/b77c7722d4a7e5d99a549114d832180a3f19a67f) Thanks [@g-raman](https://github.com/g-raman)! - Removed unnecessary useEffect for adding events to calendar

## 0.8.0

### Minor Changes

- [#95](https://github.com/g-raman/uenroll/pull/95) [`7361eed`](https://github.com/g-raman/uenroll/commit/7361eed9636c8877f7c5d0d88ec5d92e114b56ae) Thanks [@g-raman](https://github.com/g-raman)! - Added dark mode

### Patch Changes

- [#93](https://github.com/g-raman/uenroll/pull/93) [`7897786`](https://github.com/g-raman/uenroll/commit/7897786f447c6657514c8be31d0597bfd77a6850) Thanks [@g-raman](https://github.com/g-raman)! - Fixed calendar event sourcing hack

## 0.7.1

### Patch Changes

- [#89](https://github.com/g-raman/uenroll/pull/89) [`ae9a784`](https://github.com/g-raman/uenroll/commit/ae9a78425425f264daab44611eda92f8ad6ed3f7) Thanks [@g-raman](https://github.com/g-raman)! - Removed memoization of is selected state for components

- [#92](https://github.com/g-raman/uenroll/pull/92) [`da7a426`](https://github.com/g-raman/uenroll/commit/da7a426e3a454d69908db8ffe27fafbfcfb29fb5) Thanks [@g-raman](https://github.com/g-raman)! - Added tooltips for buttons

- [#91](https://github.com/g-raman/uenroll/pull/91) [`b12328b`](https://github.com/g-raman/uenroll/commit/b12328bdde2760db738df15650d20520b840f362) Thanks [@g-raman](https://github.com/g-raman)! - Made calendar events slightly translucent

## 0.7.0

### Minor Changes

- [#86](https://github.com/g-raman/uenroll/pull/86) [`306b36a`](https://github.com/g-raman/uenroll/commit/306b36adecfb97cf252bff4f2e484db41dfa4dde) Thanks [@g-raman](https://github.com/g-raman)! - Use shadcn accordion component to render search results

### Patch Changes

- [#88](https://github.com/g-raman/uenroll/pull/88) [`a352100`](https://github.com/g-raman/uenroll/commit/a352100295c5ef5dac975b72bf6c8b4759591d66) Thanks [@g-raman](https://github.com/g-raman)! - Fix course title truncation in course results

## 0.6.2

### Patch Changes

- [#84](https://github.com/g-raman/uenroll/pull/84) [`78d030a`](https://github.com/g-raman/uenroll/commit/78d030a1497c44d9642584c0fdd5badfb05a997f) Thanks [@g-raman](https://github.com/g-raman)! - Add more clear link to uo grades website

## 0.6.1

### Patch Changes

- [#83](https://github.com/g-raman/uenroll/pull/83) [`24858c7`](https://github.com/g-raman/uenroll/commit/24858c7f4f42f7dfddf5bf6c04542dffa3604999) Thanks [@g-raman](https://github.com/g-raman)! - Use shadcn checkbox

- [#81](https://github.com/g-raman/uenroll/pull/81) [`3071568`](https://github.com/g-raman/uenroll/commit/307156854674abb842fa04c58f25fff99b2491e7) Thanks [@g-raman](https://github.com/g-raman)! - Remove scrollable information in course result

## 0.6.0

### Minor Changes

- [#78](https://github.com/g-raman/uenroll/pull/78) [`2678ba7`](https://github.com/g-raman/uenroll/commit/2678ba7d2c018ebbb0196baeec8ef3e784daa9d9) Thanks [@g-raman](https://github.com/g-raman)! - Add better autocomplete UI and keyboard navigation

### Patch Changes

- [#80](https://github.com/g-raman/uenroll/pull/80) [`56f1ef9`](https://github.com/g-raman/uenroll/commit/56f1ef9843a5e55484b39fddb7b81651eec76759) Thanks [@g-raman](https://github.com/g-raman)! - Show virtual classes

## 0.5.1

### Patch Changes

- [#75](https://github.com/g-raman/uenroll/pull/75) [`cc83570`](https://github.com/g-raman/uenroll/commit/cc83570636d131e45b4466871f67a3b924a60ba7) Thanks [@g-raman](https://github.com/g-raman)! - Filter courses by term for autocomplete population

## 0.5.0

### Minor Changes

- [#71](https://github.com/g-raman/uenroll/pull/71) [`2a288c0`](https://github.com/g-raman/uenroll/commit/2a288c042dc2e8b22fdbafa2014c8c37ea9ce10f) Thanks [@g-raman](https://github.com/g-raman)! - Added shadcn

## 0.4.0

### Minor Changes

- [#66](https://github.com/g-raman/uenroll/pull/66) [`aa4174f`](https://github.com/g-raman/uenroll/commit/aa4174f6f8c7a6d03d61ef2fbba9c62be869e289) Thanks [@g-raman](https://github.com/g-raman)! - Fix linting errors. Add linting and formatting scripts. Add catalogs for common dependencies.

## 0.3.0

### Minor Changes

- [#58](https://github.com/g-raman/uenroll/pull/58) [`39d630b`](https://github.com/g-raman/uenroll/commit/39d630b002bf5bf1e11b7e32f81468efa72a6b63) Thanks [@g-raman](https://github.com/g-raman)! - Use shared db package to access data. Remove supabase-js.

## 0.2.2

### Patch Changes

- [#53](https://github.com/g-raman/uenroll/pull/53) [`fc97fa5`](https://github.com/g-raman/uenroll/commit/fc97fa5457afee2ff3dea00beab6ddfc3dc4a12e) Thanks [@g-raman](https://github.com/g-raman)! - remove unnecessary rrule

## 0.2.1

### Patch Changes

- [#51](https://github.com/g-raman/uenroll/pull/51) [`64407e3`](https://github.com/g-raman/uenroll/commit/64407e3b2ae8096533103757ecb6051e202f17d0) Thanks [@g-raman](https://github.com/g-raman)! - day offset calculation takes into account semester not starting on monday
