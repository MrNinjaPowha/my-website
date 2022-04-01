const generateCraftingLayout = require('./generateCraftingLayout.js');

module.exports = (config) => {
  // Set directories to pass through to the dist folder
  config.addPassthroughCopy('./src/images/');
  config.addPassthroughCopy('./src/js/');
  config.addNunjucksShortcode('crafting', generateCraftingLayout);
  config.addLiquidShortcode('crafting', generateCraftingLayout);
  config.addJavaScriptFunction('crafting', generateCraftingLayout);

  // Tell 11ty to use the .eleventyignore and ignore the .gitignore file
  config.setUseGitIgnore(false);

  return {
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',

    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
