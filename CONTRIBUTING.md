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

You can test the plugin using the provided test script:

```bash
node examples/test-plugin.js
```

This will generate a sample `llms.txt` file in the `examples/output` directory.

## Code Style

Please follow the existing code style in the project. We use:

- 2 spaces for indentation
- Semicolons at the end of statements
- Single quotes for strings
- JSDoc comments for functions

## Pull Request Process

1. Update the README.md with details of changes if appropriate
2. Update examples if needed
3. The PR should work with Node.js 14.x and above
4. PRs will be merged after review

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT license.
