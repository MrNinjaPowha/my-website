const searchBar = document.querySelector('.search__input');
const searchResultList = document.querySelector('.search__result-list');
const searchResults = searchResultList.childNodes;

const searchPageBar = document.querySelector('.search-page__input');
const searchPageResultList = document.querySelector('.search-page__result-list');

let pages = [];

document.addEventListener('mouseup', () => {
  /* This hides the results when you click to remove focus from the search bar. */
  if (searchBar != document.activeElement) {
    showResults(false);
  }
});

document.addEventListener('keydown', (e) => {
  /* Moves focus between and out of the search results */
  const focusableList = [searchBar, ...searchResults];

  const index = focusableList.indexOf(document.activeElement);
  let nextIndex = 0;

  if (index >= 0) {
    if (e.key == 'Tab') showResults(false);
    else if (e.key == 'ArrowUp') {
      // move focus up
      e.preventDefault();
      nextIndex = index > 0 ? index - 1 : 0;
      focusableList[nextIndex].focus();
    } else if (e.key == 'ArrowDown') {
      // move focus down
      e.preventDefault();
      nextIndex = index + 1 < focusableList.length ? index + 1 : index;
      focusableList[nextIndex].focus();
    }
  }
});

searchBar.addEventListener('keyup', (e) => {
  /* This function filters and sorts the results each time you type in the search bar in the page head */
  const searchString = e.target.value.toLowerCase();

  if (e.key == 'Enter') {
    // if the enter key is pressed the user is taken to the search page
    localStorage.setItem('searchString', searchString);
    window.location.href = '/search';
  }

  if (searchString) {
    const filteredResults = pages.filter((page) => {
      return page.title.toLowerCase().includes(searchString);
    });

    filteredResults.forEach((result) => {
      result.accuracy = getDistance(result.title, searchString);
    });

    filteredResults.sort((a, b) =>
      a.accuracy < b.accuracy ? 1 : b.accuracy < a.accuracy ? -1 : 0
    );

    displayResults(filteredResults);
    showResults(true);
  } else {
    showResults(false);
  }
});

if (searchPageBar)
  // only active on the search page
  searchPageBar.addEventListener('keyup', (e) => {
    const searchString = e.target.value.toLowerCase();

    if (e.key == 'Enter' && searchString) {
      displayPageResults(searchString);
    }
  });

async function loadPages() {
  /* Loads all the search options from the json file */
  try {
    pages = await fetch('/searchData.json');
    pages = await pages.json();

    if (searchPageBar) {
      // Makes an initial search if on the search page
      searchPageBar.value = localStorage.getItem('searchString');
      if (searchPageBar.value) displayPageResults(searchPageBar.value.toLowerCase());
    }
  } catch (err) {
    console.error(err);
  }
}

function displayResults(results) {
  /* Displays the 10 most accurate results */
  const htmlString = results
    .slice(0, 10)
    .map((page) => {
      return `<a href="${page.url}" class="search__result">${page.title}</a>`;
    })
    .join('');

  searchResultList.innerHTML = htmlString;
}

function showResults(display) {
  /* Changes display for the results in the page header */
  searchResults.forEach((result) => {
    result.style.display = display ? 'block' : 'none';
  });
}

function displayPageResults(searchString) {
  /* Filters and displays the detailed search results on the search page */
  const filteredResults = pages.filter((page) => {
    return (
      includesAny(page.title.toLowerCase(), searchString.split(' ')) ||
      includesAny(page.desc.toLowerCase(), searchString.split(' '))
    );
  });

  filteredResults.forEach((page) => {
    page.accuracy = getDistance(page.title, searchString) + getDistance(page.desc, searchString);
  });

  filteredResults.sort((a, b) => (a.accuracy < b.accuracy ? 1 : b.accuracy < a.accuracy ? -1 : 0));

  const htmlString = filteredResults
    .map((page) => {
      return `<a class="search-result" href="${page.url}">
                <span class="search-result__title">${page.title}</span>
                <div class="search-result__about">
                  <img class="search-result__image search-result__image${page.rendering}" src="${page.image}">
                  <p class="search-result__desc">${page.desc}</p>
                </div>
              </a>`;
    })
    .join('');

  searchPageResultList.innerHTML = htmlString;
}

function includesAny(string, list) {
  let includes = false;

  list.forEach((word) => {
    if (string.includes(word)) {
      includes = true;
    }
  });

  return includes;
}

function getDistance(a, b) {
  let costs = [];

  a = a.toLowerCase();
  b = b.toLowerCase();

  // exit early if possible
  if (a === b) return 1;
  if (!a || !b) return 0;

  let longer = a.length < b.length ? b : a;

  for (let i = 0; i <= a.length; i++) {
    let lastValue = i;

    for (let j = 0; j <= b.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];

          if (a.charAt(i - 1) != b.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }

          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }

    if (i > 0) costs[b.length] = lastValue;
  }

  return (longer.length - costs[b.length]) / parseFloat(longer.length);
}

loadPages();
