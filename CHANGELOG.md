# Changelog

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
