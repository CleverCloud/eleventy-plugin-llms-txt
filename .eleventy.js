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


  const collectionData = {};
  for (const t of pluginOptions.collections) {
    eleventyConfig.addCollection(t, function (collectionApi) {
      collectionData[t] = (t=="all") ? collectionApi.getAll() : collectionApi.getFilteredByTag(t);
      return collectionData[t];
    });
  }
  // Hook into Eleventy’s build process
  eleventyConfig.on("eleventy.after", ({dir}) => {
    const outputDir = dir.output || '_site';
    const outputPath = path.join(outputDir, pluginOptions.outputPath);

    // Generate the llms.txt content
    const llmsTxtContent = generateLlmsTxt(collectionData, pluginOptions);
      
    // Write to file
    try {
      fs.writeFileSync(outputPath, llmsTxtContent);
      console.log(`✅ Generated ${pluginOptions.outputPath}`);
    } catch (error) {
      console.error(`❌ Error generating ${pluginOptions.outputPath}:`, error);
    }
  });
  
};
