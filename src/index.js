/**
 * Core functionality for the eleventy-plugin-llms-txt
 */

const path = require('path');
const fs = require('fs');

/**
 * Process HTML content to clean it for LLM consumption
 * @param {String} content - HTML content
 * @param {Number} maxLength - Maximum content length
 * @param {Boolean} normalizeWhitespace - Whether to normalize whitespace
 * @param {Boolean} stripHorizontalRules - Whether to remove '---' from content
 * @returns {String} - Processed content
 */
function processContent(content, maxLength, normalizeWhitespace = false, stripHorizontalRules = true) {
  if (!content) return '';
  
  // Remove <style> tags and their content
  let processedContent = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove <script> tags and their content
  processedContent = processedContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Strip HTML tags
  processedContent = processedContent.replace(/<[^>]*>/g, ' ');
  
  // Remove horizontal rules if configured
  if (stripHorizontalRules) {
    // Replace '---' with a space to avoid breaking content flow
    processedContent = processedContent.replace(/---/g, ' ');
  }
  
  // Normalize whitespace if configured
  if (normalizeWhitespace) {
    processedContent = processedContent.replace(/\s+/g, ' ').trim();
  } else {
    // Just trim leading/trailing whitespace but preserve internal formatting
    processedContent = processedContent.trim();
  }
  
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
    customHeader = '',
    sortByDate = false,
    sortDirection = 'desc',
    normalizeWhitespace = false,
    stripHorizontalRules = true
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

    console.log(`Processing collection '${collectionName}' with ${collection.length} items`);
    output += `## Collection: ${collectionName}\n\n`;
    
    // Sort collection by date if requested
    let collectionToProcess = [...collection];
    if (sortByDate) {
      collectionToProcess.sort((a, b) => {
        const aData = a.data || a;
        const bData = b.data || b;
        const aDate = a.date || aData.date || new Date(0);
        const bDate = b.date || bData.date || new Date(0);
        
        // Handle case where dates might not be Date objects
        const aTimestamp = aDate instanceof Date ? aDate.getTime() : new Date(aDate).getTime();
        const bTimestamp = bDate instanceof Date ? bDate.getTime() : new Date(bDate).getTime();
        
        return sortDirection === 'desc' ? bTimestamp - aTimestamp : aTimestamp - bTimestamp;
      });
      console.log(`Sorted collection '${collectionName}' by date (${sortDirection}ending)`);
    }

    collectionToProcess.forEach(item => {
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
          const processedContent = processContent(content, maxContentLength, normalizeWhitespace, stripHorizontalRules);
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
