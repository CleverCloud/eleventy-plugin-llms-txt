# Eleventy 4 compatibility

Status as of 2026-09-22, tested against `@11ty/eleventy@4.0.0-alpha.10`.

**The plugin works on Eleventy 4 with no code changes**, and produces output
identical to Eleventy 3 for the same input. This file records what was checked,
so the next person does not have to derive it again.

## What was verified

Both the reported bug scenarios were exercised, since they are the cases most
likely to regress:

- A user-defined, custom-sorted collection configured in the plugin (issue #1)
- An `outputPath` containing a subdirectory (issue #3)

Output was compared between 3.1.6 and 4.0.0-alpha.10 for the same source and the
same configuration. The files are identical once generation timestamps are
normalised.

## APIs the plugin depends on

| API | Used for | Eleventy 4 |
| --- | --- | --- |
| `eleventyConfig.addCollection` | registering the internal capture hook | present |
| `eleventyConfig.getCollections()` | reusing a collection the site defines | present |
| `collectionApi.getAll` / `getFilteredByTag` | resolving configured collections | present |
| `eleventy.after` event | writing `llms.txt` after the build | present |
| `directories.output` in that event | locating the output directory | present |

The event payload gained an `incremental` key in 4; nothing the plugin reads was
removed.

## Known differences

**Node floor.** Eleventy 4 requires `>=22.15`, where Eleventy 3 requires `>=18`.
This is the only genuine breaking change for consumers, and it is inherited
rather than ours. A release supporting Eleventy 4 cannot keep
`engines.node: ">=18.0.0"`.

**`dir` is deprecated** in favour of `directories`. Both are present in Eleventy
3 and 4, and resolve to the same path through `path.join`:

```
dir:         {"output":"_site"}
directories: {"output":"./_site/"}
```

The plugin now reads `directories.output` and falls back to `dir.output`.

## Deliberately not changed yet

`peerDependencies` stays `^3.0.0` and `engines.node` stays `>=18.0.0`. Eleventy 4
is an alpha, and advertising support for a moving target would be a promise the
plugin cannot keep. Both change together, with the Node floor, when 4.0.0 is
stable — a 2.0.0 release.

## Continuous check

The `eleventy-canary` job in `.github/workflows/ci.yml` builds the advanced
example against the `canary` dist-tag on every pull request and weekly. It is
marked `continue-on-error`, so a breaking alpha is reported without blocking
anyone. If it starts failing, this document is the place to record what changed.
