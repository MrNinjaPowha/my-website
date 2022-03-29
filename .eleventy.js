function generateCraftingLayout(recipe) {
  const craftingType = recipe.type;
  let inputHtml = '';
  let ingridients = [];
  let ingridientsHtml = '';

  if (craftingType == 'table') {
    for (let i = 0; i < recipe.pattern.length; i++) {
      for (let j = 0; j < recipe.pattern[i].length; j++) {
        const symbol = recipe.pattern[i][j];

        if (symbol == ' ') {
          inputHtml =
            inputHtml +
            `
            <span class="crafting__slot"></span>`;
        } else {
          const item = recipe.key[symbol];

          if (!ingridients.includes(item.name)) {
            ingridients = [...ingridients, item.name];
          }

          inputHtml =
            inputHtml +
            `
            <a href="${item.url}" class="crafting__slot">
              <img src="/images/sprites/${item.name.toLowerCase().replace(/ /g, '_')}.png" alt="${
              item.name
            }" class="crafting__${item.type}">
            </a>`;
        }
      }
    }

    ingridients.sort();
    for (let i = 0; i < ingridients.length; i++) {
      ingridientsHtml =
        ingridientsHtml +
        `
        <li>${ingridients[i]}</li>`;
    }

    return `
    <div class="crafting">
      <div class="crafting__${craftingType}">
        ${inputHtml}
      </div>
      <div class="crafting__output">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 23" class="crafting__arrow">
          <polygon class="cls-1" points="0 8 25 8 25 0 38 11.5 25 23 25 15 0 15 0 8"></polygon>
        </svg>
        <a href="${recipe.result.url}" class="crafting__result">
          <img src="/images/sprites/${recipe.result.name
            .toLowerCase()
            .replace(/ /g, '_')}.png" alt="${recipe.result.name}" class="crafting__${
      recipe.result.type
    }">
        </a>
      </div>
      <div class="ingridients">
        <span class="ingridients__title">Ingridients</span>
        <ul>
          ${ingridientsHtml}
        </ul>
      </div>
    </div>`;
  }
}

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
