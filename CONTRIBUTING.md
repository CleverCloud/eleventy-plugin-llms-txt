# Contributing to eleventy-plugin-llms-txt

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Test your changes using the examples in the `examples` directory
5. Submit a pull request

## Project Structure

- `.eleventy.js` - Main plugin file
- `src/` - Core plugin functionality
- `examples/` - Example implementations and tests
- `README.md` - Documentation

## Testing

Run the test suite:

```bash
npm test
```

It uses Node's built-in test runner, so there is nothing to install – the plugin
itself has no dependencies.

You can also exercise the plugin end to end against the example sites:

```bash
cd examples/basic && npm ci && npm run build
```

Both examples are built in CI on every pull request, from a clean checkout.

Use `npm ci` rather than `npm install` in the examples. `npm ci` installs exactly
what the lockfile pins, which preserves the minimum age the dependencies were
resolved with; `npm install` re-resolves and can pull a package published hours
ago. When the example dependencies do need refreshing, resolve them with a
cutoff, for example `npm install --before=$(date -v-14d +%Y-%m-%d)`.

## Code Style

Please follow the existing code style in the project. We use:

- 2 spaces for indentation
- Semicolons at the end of statements
- Single quotes for strings
- JSDoc comments for functions

## Pull Request Process

1. Update the README.md with details of changes if appropriate
2. Update examples if needed
3. The PR should work with Node.js 18.x and above, the floor declared in `engines`
4. PRs will be merged after review

## Releasing

Releases are published by CI, not from a developer machine.

1. Update `CHANGELOG.md`, moving the entries under a new version heading
2. Bump `version` in `package.json`
3. Commit, then tag: `git tag -a vX.Y.Z -m "vX.Y.Z"`
4. Push the commit and the tag
5. Publish a GitHub release for that tag, with the changelog entry as its notes

Publishing the release triggers `.github/workflows/publish.yml`, which runs the
tests, checks that the tag matches `package.json`, and publishes to npm. A plain
tag push does not publish anything.

The workflow authenticates over OIDC using npm trusted publishing, so no token is
stored in the repository and no one-time password is needed. It also attaches
provenance, linking the published tarball to the commit and workflow run that
built it.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT license.
