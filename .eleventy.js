/**
 * Eleventy Plugin to generate llms.txt
 * This plugin creates a llms.txt file that exposes the content of an Eleventy site to LLMs
 * in a structured format.
 */

const path = require('path');
const fs = require('fs');
const { generateLlmsTxt } = require('./src/index');

/**
 * Eleventy Plugin
 * @param {Object} eleventyConfig - Eleventy config object
 * @param {Object} options - Plugin options
 */
module.exports = function(eleventyConfig, options = {}) {
  // Default options
  const pluginOptions = {
    outputPath: 'llms.txt',
    collections: ['all'],
    excludeCollections: [],
    excludeContentTypes: [],
    siteUrl: '',
    includeContent: true,
    maxContentLength: 10000,
    dateFormat: 'toISOString',
    additionalMetadata: [],
    includeHeader: true,
    customHeader: '',
    ...options
  };

  // Add the plugin
  eleventyConfig.addPlugin(function(eleventyConfig) {
    // Generate llms.txt after the build is complete
    eleventyConfig.on('eleventy.after', async ({ dir, results }) => {
      const outputDir = dir.output || '_site';
      const outputPath = path.join(outputDir, pluginOptions.outputPath);
      
      // Ensure the directory exists
      const outputDirPath = path.dirname(outputPath);
      if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
      }
      
      // Get all collections
      const collections = {};
      
      // Get the requested collections
      pluginOptions.collections.forEach(collectionName => {
        try {
          collections[collectionName] = eleventyConfig.collections.getAll().filter(item => {
            if (collectionName === 'all') return true;
            return item.data.collections && 
                  Array.isArray(item.data.collections) && 
                  item.data.collections.includes(collectionName);
          });
        } catch (error) {
          console.warn(`⚠️ Collection '${collectionName}' not found`);
          collections[collectionName] = [];
        }
      });
      
      // Generate the llms.txt content
      const llmsTxtContent = generateLlmsTxt(collections, pluginOptions);
      
      // Write to file
      try {
        fs.writeFileSync(outputPath, llmsTxtContent);
        console.log(`✅ Generated ${pluginOptions.outputPath}`);
      } catch (error) {
        console.error(`❌ Error generating ${pluginOptions.outputPath}:`, error);
      }
    });
  });
};
