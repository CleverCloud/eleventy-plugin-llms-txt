# Using eleventy-plugin-llms-txt

This guide provides detailed instructions and examples for using the `eleventy-plugin-llms-txt` plugin in your Eleventy site.

## Basic Usage

### 1. Install the plugin

```bash
npm install eleventy-plugin-llms-txt
```

### 2. Add to your Eleventy configuration

In your `.eleventy.js` file:

```javascript
const llmsTxtPlugin = require('eleventy-plugin-llms-txt');

module.exports = function(eleventyConfig) {
  // Add the plugin with default options
  eleventyConfig.addPlugin(llmsTxtPlugin);
  
  // Rest of your config...
};
```

With this basic setup, the plugin will:
- Generate a `llms.txt` file in your output directory
- Include all pages from the `all` collection
- Include the full content of each page (HTML stripped)

## Configuration Options

The plugin accepts various options to customize the output:

```javascript
eleventyConfig.addPlugin(llmsTxtPlugin, {
  // Options here
});
```

### Available Options

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
| `includeHeader` | Boolean | `true` | Whether to include the header section |
| `customHeader` | String | `''` | Custom header text (if provided, replaces default header) |

## Examples

### Basic Example

```javascript
// .eleventy.js
const llmsTxtPlugin = require('eleventy-plugin-llms-txt');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(llmsTxtPlugin);
  
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
```

This will generate a `llms.txt` file in the `_site` directory with all pages.

### Advanced Example

```javascript
// .eleventy.js
const llmsTxtPlugin = require('eleventy-plugin-llms-txt');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(llmsTxtPlugin, {
    outputPath: 'ai/llms.txt',
    collections: ['posts', 'pages'],
    excludeCollections: ['drafts'],
    siteUrl: 'https://example.com',
    includeContent: true,
    maxContentLength: 5000,
    dateFormat: 'toISOString',
    additionalMetadata: ['description', 'author', 'category']
  });
  
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
```

This will:
- Generate a `llms.txt` file at `_site/ai/llms.txt`
- Include only pages from the `posts` and `pages` collections
- Exclude any pages in the `drafts` collection
- Prepend `https://example.com` to all URLs
- Include content up to 5000 characters
- Include additional metadata fields: description, author, and category

### Excluding Content

If you want to generate a metadata-only version (no content):

```javascript
eleventyConfig.addPlugin(llmsTxtPlugin, {
  includeContent: false
});
```

### Custom Header

You can provide a custom header for the llms.txt file:

```javascript
eleventyConfig.addPlugin(llmsTxtPlugin, {
  customHeader: `# My Website Content for AI\n# Please use this information responsibly\n# Last updated: ${new Date().toISOString()}`
});
```

## Integration with Robots.txt

You might want to inform crawlers about your llms.txt file. You can add this to your robots.txt:

```
# Allow LLM crawlers to find the llms.txt file
Sitemap: https://example.com/llms.txt
```

## Best Practices

1. **Set the correct site URL**: Always set the `siteUrl` option to ensure links are absolute.
2. **Be selective with collections**: Only include collections that contain content you want LLMs to access.
3. **Include relevant metadata**: Use the `additionalMetadata` option to include fields that provide context.
4. **Limit content length**: For very large sites, consider setting a reasonable `maxContentLength`.
5. **Place in a logical location**: Consider using a path like `/ai/llms.txt` or `/llms/llms.txt` for clarity.

## Troubleshooting

If your llms.txt file is not being generated:

1. Check that the plugin is correctly added to your Eleventy config
2. Verify that the collections you specified exist
3. Check the console output during the build for any warnings or errors
4. Ensure your output directory is correctly configured

If content is missing:

1. Check that the collection names are correct
2. Verify that your pages have the expected metadata
3. Check if any exclusion rules might be filtering out your content
