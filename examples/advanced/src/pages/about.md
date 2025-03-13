---
layout: base.njk
title: About
description: About our advanced example site
author: Horacio Gonzalez
category: Information
tags:
  - page
  - about
---

# About This Advanced Example

This is an advanced example site created to demonstrate the eleventy-plugin-llms-txt plugin with custom configuration options.

## What is llms.txt?

The llms.txt file is a structured text file that contains the content of your website in a format that's optimized for Large Language Models (LLMs) like ChatGPT, Claude, and others.

## Advanced Configuration

In this example, we're using the following custom configuration options:

```javascript
eleventyConfig.addPlugin(llmsTxtPlugin, {
  outputPath: 'ai/llms.txt',
  collections: ['posts', 'pages'],
  excludeCollections: ['drafts'],
  siteUrl: 'https://example.com',
  includeContent: true,
  maxContentLength: 5000,
  dateFormat: 'toISOString',
  additionalMetadata: ['description', 'author', 'category']
});
```

This demonstrates how you can customize the plugin to fit your specific needs.
