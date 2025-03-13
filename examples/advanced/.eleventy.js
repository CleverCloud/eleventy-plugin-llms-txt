/**
 * Advanced example Eleventy configuration with the llms-txt plugin
 */

const llmsTxtPlugin = require('../../.eleventy.js');

module.exports = function(eleventyConfig) {
  // Add a date filter for Nunjucks templates
  eleventyConfig.addFilter('date', function(date, format) {
    if (!date) return '';
    
    // Simple date formatter
    const d = new Date(date);
    if (format === '%Y-%m-%d') {
      return d.getFullYear() + '-' + 
             String(d.getMonth() + 1).padStart(2, '0') + '-' + 
             String(d.getDate()).padStart(2, '0');
    }
    return d.toDateString();
  });
  
  // Add the llms.txt plugin with custom options
  eleventyConfig.addPlugin(llmsTxtPlugin, {
    outputPath: 'ai/llms.txt',
    collections: ['post'],  // Only include the 'post' collection
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
