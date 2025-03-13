/**
 * Core functionality for the eleventy-plugin-llms-txt
 */

const path = require('path');
const fs = require('fs');

/**
 * Process HTML content to clean it for LLM consumption
 * @param {String} content - HTML content
 * @param {Number} maxLength - Maximum content length
 * @returns {String} - Processed content
 */
function processContent(content, maxLength) {
  if (!content) return '';
  
  // Strip HTML tags
  let processedContent = content.replace(/<[^>]*>/g, ' ');
  
  // Normalize whitespace
  processedContent = processedContent.replace(/\s+/g, ' ').trim();
  
  // Truncate if needed
  if (maxLength && processedContent.length > maxLength) {
    processedContent = processedContent.substring(0, maxLength) + '...';
  }
  
  return processedContent;
}

/**
 * Generate metadata section for a page
 * @param {Object} item - Collection item
 * @param {Object} options - Plugin options
 * @returns {String} - Metadata section
 */
function generateMetadata(item, options) {
  const { 
    siteUrl = '',
    dateFormat = 'toISOString',
    additionalMetadata = []
  } = options;
  
  let output = '';
  
  // Title
  output += `### Page: ${item.data.title || 'Untitled'}\n`;
  
  // URL
  const fullUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}${item.url}` : item.url;
  output += `URL: ${fullUrl}\n`;
  
  // Date
  if (item.date) {
    try {
      output += `Date: ${item.date[dateFormat]()}\n`;
    } catch (e) {
      output += `Date: ${item.date.toString()}\n`;
    }
  }
  
  // Tags
  if (item.data.tags && item.data.tags.length > 0) {
    const filteredTags = item.data.tags.filter(tag => tag !== 'all');
    if (filteredTags.length > 0) {
      output += `Tags: ${filteredTags.join(', ')}\n`;
    }
  }
  
  // Additional metadata fields
  additionalMetadata.forEach(field => {
    if (item.data[field] !== undefined) {
      const value = typeof item.data[field] === 'object' 
        ? JSON.stringify(item.data[field]) 
        : item.data[field];
      output += `${field}: ${value}\n`;
    }
  });
  
  return output;
}

/**
 * Generate llms.txt content from collection items
 * @param {Object} collections - Eleventy collections
 * @param {Object} options - Plugin options
 * @returns {String} - Content for llms.txt
 */
function generateLlmsTxt(collections, options) {
  const { 
    collections: collectionNames = ['all'],
    excludeCollections = [],
    excludeContentTypes = [],
    siteUrl = '',
    includeContent = true,
    maxContentLength = 10000,
    dateFormat = 'toISOString',
    additionalMetadata = [],
    includeHeader = true,
    customHeader = ''
  } = options;

  let output = '';
  
  // Add header
  if (includeHeader) {
    if (customHeader) {
      output += customHeader + '\n\n';
    } else {
      output += `# Site Content for LLMs\n`;
      output += `# Generated: ${new Date()[dateFormat]()}\n`;
      if (siteUrl) {
        output += `# Site URL: ${siteUrl}\n`;
      }
      output += `\n`;
    }
  }

  // Process each requested collection
  collectionNames.forEach(collectionName => {
    if (excludeCollections.includes(collectionName)) return;
    
    const collection = collections[collectionName];
    if (!collection || collection.length === 0) return;

    output += `## Collection: ${collectionName}\n\n`;

    collection.forEach(item => {
      // Skip excluded content types
      const contentType = item.data?.contentType || 'page';
      if (excludeContentTypes.includes(contentType)) return;

      // Add metadata
      output += generateMetadata(item, options);
      
      // Add content if requested
      if (includeContent && item.templateContent) {
        const processedContent = processContent(item.templateContent, maxContentLength);
        if (processedContent) {
          output += `\nContent:\n${processedContent}\n`;
        }
      }
      
      output += `\n---\n\n`;
    });
  });

  return output;
}

module.exports = {
  generateLlmsTxt,
  processContent,
  generateMetadata
};
