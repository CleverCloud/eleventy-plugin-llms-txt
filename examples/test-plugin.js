/**
 * Test script for eleventy-plugin-llms-txt
 * 
 * This script simulates an Eleventy build environment and tests the plugin
 * without requiring a full Eleventy setup.
 */

const fs = require('fs');
const path = require('path');
const { generateLlmsTxt } = require('../src/index');

// Mock collection data
const mockCollections = {
  all: [
    {
      url: '/index.html',
      date: new Date('2025-01-01'),
      data: {
        title: 'Home Page',
        tags: ['page', 'home'],
        description: 'Welcome to the test site',
        author: 'Test Author'
      },
      templateContent: '<h1>Welcome to the test site</h1><p>This is a test page for the llms.txt plugin.</p>'
    },
    {
      url: '/about/index.html',
      date: new Date('2025-01-02'),
      data: {
        title: 'About Page',
        tags: ['page', 'about'],
        description: 'About this test site',
        author: 'Test Author'
      },
      templateContent: '<h1>About</h1><p>This is the about page for testing the llms.txt plugin.</p>'
    },
    {
      url: '/blog/post-1/index.html',
      date: new Date('2025-01-03'),
      data: {
        title: 'Blog Post 1',
        tags: ['post', 'featured'],
        description: 'First blog post',
        author: 'Test Author',
        category: 'Testing'
      },
      templateContent: '<h1>Blog Post 1</h1><p>This is the first blog post for testing the llms.txt plugin.</p>'
    }
  ],
  posts: [
    {
      url: '/blog/post-1/index.html',
      date: new Date('2025-01-03'),
      data: {
        title: 'Blog Post 1',
        tags: ['post', 'featured'],
        description: 'First blog post',
        author: 'Test Author',
        category: 'Testing'
      },
      templateContent: '<h1>Blog Post 1</h1><p>This is the first blog post for testing the llms.txt plugin.</p>'
    }
  ],
  pages: [
    {
      url: '/index.html',
      date: new Date('2025-01-01'),
      data: {
        title: 'Home Page',
        tags: ['page', 'home'],
        description: 'Welcome to the test site',
        author: 'Test Author'
      },
      templateContent: '<h1>Welcome to the test site</h1><p>This is a test page for the llms.txt plugin.</p>'
    },
    {
      url: '/about/index.html',
      date: new Date('2025-01-02'),
      data: {
        title: 'About Page',
        tags: ['page', 'about'],
        description: 'About this test site',
        author: 'Test Author'
      },
      templateContent: '<h1>About</h1><p>This is the about page for testing the llms.txt plugin.</p>'
    }
  ]
};

// Test options
const testOptions = {
  siteUrl: 'https://example.com',
  collections: ['all'],
  additionalMetadata: ['description', 'author', 'category']
};

// Generate llms.txt content
const llmsTxtContent = generateLlmsTxt(mockCollections, testOptions);

// Output directory
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write to file
const outputPath = path.join(outputDir, 'llms.txt');
fs.writeFileSync(outputPath, llmsTxtContent);

console.log(`✅ Test completed. Generated llms.txt at ${outputPath}`);
console.log('Content preview:');
console.log('-------------------');
console.log(llmsTxtContent.substring(0, 500) + '...');
console.log('-------------------');
console.log(`Total content length: ${llmsTxtContent.length} characters`);
