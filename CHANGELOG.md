# Changelog

## Unreleased

### Changed

- **Output directory:** The plugin now reads `directories.output` from the `eleventy.after` event, falling back to the deprecated `dir.output`. No behavioural change – both resolve to the same path – but `dir` is deprecated in Eleventy 3 and 4.

### Added

- **Eleventy 4 compatibility, documented and checked.** Verified against `4.0.0-alpha.10`: the plugin works unchanged and produces identical output. See [`docs/ELEVENTY_4.md`](docs/ELEVENTY_4.md). CI now builds an example against the Eleventy `canary` tag on every pull request and weekly, so a breaking alpha surfaces on its own. The job is informational and never blocks.

## 1.4.0 (2026-09-22)

A behaviour change: builds that silently produced no `llms.txt` now fail. If your build goes red on upgrade, it was already not writing the file.

### Changed

- **A failed write now fails the build.** Writing `llms.txt` was wrapped in a catch that only logged, so a build that produced no `llms.txt` still reported success. That is what hid [#3](https://github.com/CleverCloud/eleventy-plugin-llms-txt/issues/3) for so long. The error is now raised, naming the output path and keeping the original filesystem error as its `cause`:

  ```
  [11ty] Could not write _site/ai/llms.txt: EEXIST: file already exists, mkdir '_site/ai'
  ```

  Eleventy exits non-zero. In watch mode a failing rebuild is reported without stopping the watcher, so the dev loop is unaffected.

## 1.3.1 (2026-09-22)

No user-facing change. Cut deliberately to exercise the new release pipeline: this is the first version published by CI over OIDC, with provenance attached.

### Fixed

- **Test script:** `npm test` used `node --test test/`, which fails on Node 22 and 24 (`Cannot find module '.../test'`). It now passes an explicit glob. This affects contributors only; `test/` is not part of the published package.

## 1.3.0 (2026-09-22)

Two bug fixes, one of which changes how collections are resolved – see the note below if you define your own collections.

### Fixed

- **Output path:** An `outputPath` containing a subdirectory, such as `ai/llms.txt`, no longer fails with `ENOENT` ([#3](https://github.com/CleverCloud/eleventy-plugin-llms-txt/issues/3)). The plugin now creates the parent directory before writing.
- **Collections:** The plugin no longer crashes with `config.addCollection(<name>) already exists` when a configured collection is also defined in your own Eleventy config ([#1](https://github.com/CleverCloud/eleventy-plugin-llms-txt/issues/1)). It now registers a single internal collection instead of one per configured name, so it never claims a name your site uses. When you have defined a collection yourself, the plugin reuses your definition, preserving your sorting and filtering; otherwise it falls back to a tag lookup.

### Added

- **Tests:** `npm test` now runs a regression suite with `node --test`, replacing the placeholder script.
- **Warnings:** The plugin now warns when a configured collection resolves to no items, so a collection it cannot see – a glob-based one, say – is no longer silently empty.

### Changed

- **Collection resolution:** When a configured name matches a collection you defined yourself, the plugin now uses *your* definition rather than a tag lookup. Output can therefore differ from 1.2.x: your sort order and filtering are preserved. Names you have not defined still resolve by tag, as before.

## 1.2.1 (2026-09-22)

Packaging-only release – no changes to plugin behaviour.

### Fixed

- **Engines:** Corrected `engines.node` from `>=14.0.0` to `>=18.0.0`. The previous value was never satisfiable, since the `@11ty/eleventy@^3.0.0` peer dependency has required Node 18 since 3.0.0.

### Changed

- **Package size:** Added a `files` allowlist so the published tarball ships only the plugin, its docs and its licence. The examples – including two 55 kB lockfiles – are no longer published, reducing the tarball from 41.8 kB to 7.8 kB (30 files to 8).
- **Examples:** Refreshed the example projects to `@11ty/eleventy@^3.1.6` and regenerated their lockfiles, which were still pinned to 3.0.0.

## 1.2.0 (2025-06-19)

### Features

- **Content Formatting:** Added `normalizeWhitespace` option (default: `false`) to preserve whitespace formatting in content, making it more readable for LLMs
- **Content Separation:** Added `stripHorizontalRules` option (default: `true`) to remove `---` sequences from content to avoid confusion with page separators

### Documentation

- Updated README with new configuration options

## 1.1.0

- Initial public release
