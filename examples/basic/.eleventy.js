/**
 * Example Eleventy configuration with the llms-txt plugin
 */

const llmsTxtPlugin = require('../../.eleventy.js');

module.exports = function(eleventyConfig) {

  // Add the llms.txt plugin with our new options
  eleventyConfig.addPlugin(llmsTxtPlugin, {
    normalizeWhitespace: false, // Preserve whitespace formatting
    stripHorizontalRules: true   // Remove '---' from content
  });
  
  // Return your Eleventy configuration options
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
