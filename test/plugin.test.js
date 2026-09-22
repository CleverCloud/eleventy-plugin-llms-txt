/**
 * Regression tests for the plugin's collection wiring.
 *
 * The fake config mirrors Eleventy's UserConfig: `addCollection` refuses a name
 * that already exists, and `getCollections` exposes the registered callbacks.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const llmsTxtPlugin = require('../.eleventy.js');

function makeEleventyConfig() {
  const collections = {};
  const events = {};
  return {
    collections,
    events,
    addCollection(name, callback) {
      if (collections[name]) {
        throw new Error(
          `config.addCollection(${name}) already exists. Try a different name for your collection.`
        );
      }
      collections[name] = callback;
    },
    getCollections() {
      return collections;
    },
    on(name, callback) {
      (events[name] = events[name] || []).push(callback);
    },
  };
}

function makeItem(title, url, tags, date) {
  return {
    url,
    date: new Date(date),
    data: { title, tags },
    templateContent: `<p>${title} body</p>`,
  };
}

const ITEMS = [
  makeItem('First Journal Post', '/journal/first/', ['journal'], '2025-01-01'),
  makeItem('Second Journal Post', '/journal/second/', ['journal'], '2025-06-01'),
  makeItem('About', '/about/', ['page'], '2025-03-01'),
];

function makeCollectionApi(items = ITEMS) {
  return {
    getAll: () => items.slice(),
    getAllSorted: () => items.slice(),
    getFilteredByTag: (tag) => items.filter((i) => (i.data.tags || []).includes(tag)),
  };
}

/** Run every collection callback the plugin registered, then the after-build hook. */
async function build(eleventyConfig, userDefinedNames = [], outputPath = 'llms.txt') {
  const collectionApi = makeCollectionApi();
  for (const [name, callback] of Object.entries(eleventyConfig.collections)) {
    if (userDefinedNames.includes(name)) continue;
    await callback(collectionApi);
  }
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-txt-test-'));
  for (const handler of eleventyConfig.events['eleventy.after'] || []) {
    await handler({ dir: { output: outputDir } });
  }
  return fs.readFileSync(path.join(outputDir, outputPath), 'utf8');
}

test('does not crash when a configured collection is already defined by the user', () => {
  const eleventyConfig = makeEleventyConfig();
  // Issue #1: the user already has their own 'journal' collection.
  eleventyConfig.addCollection('journal', (api) =>
    api.getFilteredByTag('journal').sort((a, b) => b.date - a.date)
  );

  assert.doesNotThrow(() => {
    llmsTxtPlugin(eleventyConfig, { collections: ['journal', 'page'] });
  });
});

test('does not crash when the user defines their collection after the plugin', () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { collections: ['journal'] });

  assert.doesNotThrow(() => {
    eleventyConfig.addCollection('journal', (api) => api.getFilteredByTag('journal'));
  });
});

test('does not register collections under the configured names', () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { collections: ['journal', 'page'] });

  assert.deepStrictEqual(
    Object.keys(eleventyConfig.collections).filter((n) => ['journal', 'page'].includes(n)),
    [],
    'the plugin must not claim the site\'s collection names'
  );
});

test("reuses the user's own collection definition, preserving its order", async () => {
  const eleventyConfig = makeEleventyConfig();
  eleventyConfig.addCollection('journal', (api) =>
    api.getFilteredByTag('journal').sort((a, b) => b.date - a.date) // newest first
  );
  llmsTxtPlugin(eleventyConfig, { collections: ['journal'], includeContent: false });

  const output = await build(eleventyConfig, ['journal']);
  assert.ok(output.includes('Second Journal Post'), 'journal entries should be present');
  assert.ok(
    output.indexOf('Second Journal Post') < output.indexOf('First Journal Post'),
    "the user's newest-first sort order should be preserved"
  );
});

test('falls back to tag lookup for collections the user has not defined', async () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { collections: ['journal'], includeContent: false });

  const output = await build(eleventyConfig);
  assert.ok(output.includes('First Journal Post'));
  assert.ok(output.includes('Second Journal Post'));
  assert.ok(!output.includes('About'), 'only tagged items belong in the collection');
});

test("still supports the default 'all' collection", async () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { includeContent: false });

  const output = await build(eleventyConfig);
  for (const item of ITEMS) {
    assert.ok(output.includes(item.data.title), `${item.data.title} should be present`);
  }
});

test('creates the output directory when outputPath has a subdirectory', async () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { outputPath: 'ai/llms.txt', includeContent: false });

  const output = await build(eleventyConfig, [], 'ai/llms.txt');
  assert.ok(output.includes('About'), 'llms.txt should be written inside the nested directory');
});

test('creates nested output directories several levels deep', async () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { outputPath: 'ai/meta/llms.txt', includeContent: false });

  const output = await build(eleventyConfig, [], 'ai/meta/llms.txt');
  assert.ok(output.includes('About'));
});

/** An output directory where 'ai' is a file, so 'ai/llms.txt' cannot be created. */
function makeUnwritableOutputDir() {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-txt-test-'));
  fs.writeFileSync(path.join(outputDir, 'ai'), 'this is a file, not a directory');
  return outputDir;
}

async function runAfterBuild(eleventyConfig, outputDir) {
  for (const callback of Object.values(eleventyConfig.collections)) {
    await callback(makeCollectionApi());
  }
  for (const handler of eleventyConfig.events['eleventy.after'] || []) {
    await handler({ dir: { output: outputDir } });
  }
}

test('fails the build when llms.txt cannot be written', async () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { outputPath: 'ai/llms.txt', includeContent: false });

  await assert.rejects(
    () => runAfterBuild(eleventyConfig, makeUnwritableOutputDir()),
    /Could not write/,
    'a failed write must not be swallowed'
  );
});

test('the write error names the output path and keeps the original cause', async () => {
  const eleventyConfig = makeEleventyConfig();
  llmsTxtPlugin(eleventyConfig, { outputPath: 'ai/llms.txt', includeContent: false });

  const error = await runAfterBuild(eleventyConfig, makeUnwritableOutputDir()).then(
    () => null,
    (e) => e
  );

  assert.ok(error, 'the handler should have thrown');
  assert.match(error.message, /ai\/llms\.txt/, 'the message should name the output path');
  assert.ok(error.cause instanceof Error, 'the original error should be kept as cause');
  // The exact code varies by platform (EEXIST on Linux, ENOTDIR elsewhere), so
  // assert that the filesystem error survived rather than which one it was.
  assert.ok(
    typeof error.cause.code === 'string' && error.cause.code.length > 0,
    `the cause should carry a filesystem error code, got ${error.cause.code}`
  );
});
