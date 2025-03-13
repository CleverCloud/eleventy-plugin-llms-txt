# eleventy-plugin-llms-txt

An [Eleventy](https://www.11ty.dev/) plugin that generates a `llms.txt` file to expose your site's content to Large Language Models (LLMs) in a structured format.

## Installation

```bash
npm install eleventy-plugin-llms-txt
```

## Usage

Add the plugin to your Eleventy configuration file (`.eleventy.js`):

```javascript
const llmsTxtPlugin = require('eleventy-plugin-llms-txt');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(llmsTxtPlugin, {
    // options (optional)
  });
  
  // ... rest of your config
};
```

After building your site, a `llms.txt` file will be generated in your output directory (typically `_site`).

## Options

The plugin accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputPath` | String | `'llms.txt'` | Path to the output file (relative to the output directory) |
| `collections` | Array | `['all']` | Collections to include in the output |
| `excludeCollections` | Array | `[]` | Collections to exclude from the output |
| `excludeContentTypes` | Array | `[]` | Content types to exclude |
| `siteUrl` | String | `''` | Base URL of your site |
| `includeContent` | Boolean | `true` | Whether to include page content |
| `maxContentLength` | Number | `10000` | Maximum length of content to include |
| `dateFormat` | String | `'toISOString'` | Date format method to use |
| `additionalMetadata` | Array | `[]` | Additional metadata fields to include |

### Example with options

```javascript
eleventyConfig.addPlugin(llmsTxtPlugin, {
  outputPath: 'ai/llms.txt',
  collections: ['posts', 'pages'],
  excludeCollections: ['drafts'],
  siteUrl: 'https://example.com',
  maxContentLength: 5000,
  additionalMetadata: ['description', 'author']
});
```

## Output Format

The generated `llms.txt` file follows this format:

```
# Site Content for LLMs
# Generated: [timestamp]
# Site URL: [your site URL]

## Collection: [collection name]

### Page: [page title]
URL: [page URL]
Date: [page date]
Tags: [page tags]
[additional metadata fields]

Content:
[page content]

---

[next page...]
```

## Why use this plugin?

LLMs like ChatGPT, Claude, and others can better understand and reference your website's content when it's presented in a structured format. The `llms.txt` file provides:

1. **Structured content**: Organized by collections, pages, and metadata
2. **Clean text**: HTML stripped and whitespace normalized
3. **Relevant metadata**: Titles, URLs, dates, tags, and custom fields
4. **Efficient crawling**: All content in one file for easy processing

## License

MIT
