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
  
  // Remove <style> tags and their content
  let processedContent = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove <script> tags and their content
  processedContent = processedContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Strip HTML tags
  processedContent = processedContent.replace(/<[^>]*>/g, ' ');
  
  // Normalize whitespace
  processedContent = processedContent.replace(/\s+/g, ' ').trim();
  
  // Truncate if needed
  if (maxLength && processedContent.length > maxLength) {
    // Try to truncate at a sentence boundary
    const lastPeriod = processedContent.lastIndexOf('.', maxLength - 3);
    if (lastPeriod > maxLength * 0.8) { // Only truncate at period if it's reasonably close to the max length
      processedContent = processedContent.substring(0, lastPeriod + 1) + '...';
    } else {
      processedContent = processedContent.substring(0, maxLength) + '...';
    }
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
  
  // Handle different data structures in Eleventy 3.0.0
  const itemData = item.data || item;
  
  // Title - handle different data structures
  let title = itemData.title || 
              (itemData.page && itemData.page.title);
              
  // Try to extract title from content if not found in metadata
  const content = item.templateContent || item.content || itemData.content;
  if (!title && content) {
    // Try to extract from title tag
    let titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    
    // If not found in title tag, try h1
    if (!titleMatch) {
      titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    }
    
    // If still not found, try to extract from the first line of content
    if (!titleMatch && content.includes('-')) {
      const firstLine = content.split('\n')[0];
      if (firstLine && firstLine.includes('-')) {
        title = firstLine.split('-')[0].trim();
      }
    } else if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }
  }
  
  // Default to 'Untitled' if no title found
  title = title || 'Untitled';
  output += `### Page: ${title}\n`;
  
  // URL - handle different data structures
  const url = item.url || 
              (itemData.page && itemData.page.url) || 
              '/';
  const fullUrl = siteUrl ? `${siteUrl.replace(/\/$/, '')}${url}` : url;
  output += `URL: ${fullUrl}\n`;
  
  // Date - handle different data structures
  const date = item.date || itemData.date;
  if (date) {
    try {
      output += `Date: ${date[dateFormat]()}\n`;
    } catch (e) {
      output += `Date: ${date.toString()}\n`;
    }
  }
  
  // Tags - handle different data structures
  const tags = itemData.tags || (itemData.page && itemData.page.tags);
  if (tags && Array.isArray(tags) && tags.length > 0) {
    const filteredTags = tags.filter(tag => tag !== 'all');
    if (filteredTags.length > 0) {
      output += `Tags: ${filteredTags.join(', ')}\n`;
    }
  }
  
  // Additional metadata fields
  additionalMetadata.forEach(field => {
    const value = itemData[field] !== undefined ? itemData[field] : 
                 (itemData.page && itemData.page[field]);
    
    if (value !== undefined) {
      const formattedValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : value;
      output += `${field}: ${formattedValue}\n`;
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
    
    // Check if the collection exists
    const collection = collections[collectionName];
    if (!collection || collection.length === 0) {
      console.log(`Collection '${collectionName}' is empty or not found, skipping...`);
      
      // Special handling for 'post' collection in Eleventy 3.0.0
      // If we're looking for 'post' collection, try to find items in the blog directory
      if (collectionName === 'post' && collections['all']) {
        const blogItems = collections['all'].filter(item => 
          item.inputPath && item.inputPath.includes('/blog/')
        );
        
        if (blogItems.length > 0) {
          console.log(`Found ${blogItems.length} blog items for 'post' collection by path filtering`);
          console.log(`Processing 'post' collection with ${blogItems.length} items`);
          output += `## Collection: post

`;
          
          // Process each blog item
          blogItems.forEach(item => {
            processItem(item, output);
          });
          
          // Skip the regular collection processing for 'post'
          return;
        }
      }
      
      return;
    }

    console.log(`Processing collection '${collectionName}' with ${collection.length} items`);
    output += `## Collection: ${collectionName}\n\n`;

    collection.forEach(item => {
      // Handle different data structures in Eleventy 3.0.0
      const itemData = item.data || item;
      
      // Skip excluded content types
      const contentType = itemData.contentType || 
                         (itemData.page && itemData.page.contentType) || 
                         'page';
      if (excludeContentTypes.includes(contentType)) return;

      // Add metadata
      output += generateMetadata(item, options);
      
      // Add content if requested
      if (includeContent) {
        // Handle different content structures
        const content = item.templateContent || 
                       item.content || 
                       itemData.content || 
                       (itemData.page && itemData.page.content);
                       
        if (content) {
          const processedContent = processContent(content, maxContentLength);
          if (processedContent) {
            output += `\nContent:\n${processedContent}\n`;
          }
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
