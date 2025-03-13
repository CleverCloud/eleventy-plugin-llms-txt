/**
 * Advanced example Eleventy configuration with the llms-txt plugin
 */

const llmsTxtPlugin = require('../../.eleventy.js');

module.exports = function(eleventyConfig) {
  // Add the llms.txt plugin with custom options
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
  
  // Return your Eleventy configuration options
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
