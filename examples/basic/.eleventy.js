/**
 * Example Eleventy configuration with the llms-txt plugin
 */

const llmsTxtPlugin = require('../../.eleventy.js');

module.exports = function(eleventyConfig) {

  // Add the llms.txt plugin with default options
  eleventyConfig.addPlugin(llmsTxtPlugin);
  
  // Return your Eleventy configuration options
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
