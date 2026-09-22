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
    sortByDate: false,
    sortDirection: 'desc', // 'desc' for newest first, 'asc' for oldest first
    normalizeWhitespace: false, // Whether to normalize whitespace in content
    stripHorizontalRules: true, // Whether to remove '---' from content
    ...options
  };


  // The plugin needs a `collectionApi` to read the site's content, and a collection
  // callback is the only place Eleventy hands one over. Declaring one collection per
  // configured name would claim names the site may already use, which Eleventy rejects
  // outright (`config.addCollection(x) already exists`). A single reserved name leaves
  // the site's own collections untouched.
  const readCollections = () =>
    typeof eleventyConfig.getCollections === 'function' ? eleventyConfig.getCollections() : {};

  let hookName = '__eleventyPluginLlmsTxt';
  while (readCollections()[hookName]) hookName += '_';

  const collectionData = {};
  eleventyConfig.addCollection(hookName, async function (collectionApi) {
    // Read the registry here rather than at plugin time: collections declared after
    // `addPlugin` are registered by the time this callback runs.
    const siteCollections = readCollections();

    for (const t of pluginOptions.collections) {
      if (t === 'all') {
        collectionData[t] = collectionApi.getAll();
      } else if (typeof siteCollections[t] === 'function' && t !== hookName) {
        // Reuse the site's own definition so its sorting and filtering survive.
        collectionData[t] = await siteCollections[t](collectionApi);
      } else {
        collectionData[t] = collectionApi.getFilteredByTag(t);
      }

      if (!Array.isArray(collectionData[t])) {
        console.warn(`\u26a0\ufe0f  Collection '${t}' did not return a list of items; skipping it.`);
        collectionData[t] = [];
      } else if (collectionData[t].length === 0) {
        console.warn(`\u26a0\ufe0f  Collection '${t}' is empty; nothing from it will appear in ${pluginOptions.outputPath}.`);
      }
    }

    return [];
  });
  // Hook into Eleventy’s build process
  eleventyConfig.on("eleventy.after", ({dir}) => {
    const outputDir = dir.output || '_site';
    const outputPath = path.join(outputDir, pluginOptions.outputPath);

    // Generate the llms.txt content
    const llmsTxtContent = generateLlmsTxt(collectionData, pluginOptions);
      
    // Write to file. A failure here fails the build: reporting success while
    // producing no llms.txt hides exactly the kind of bug this once shipped.
    try {
      // Eleventy creates the output directory itself, but not any subdirectory
      // the configured outputPath asks for.
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, llmsTxtContent);
    } catch (error) {
      throw new Error(`Could not write ${outputPath}: ${error.message}`, { cause: error });
    }

    console.log(`✅ Generated ${pluginOptions.outputPath}`);
  });
  
};
