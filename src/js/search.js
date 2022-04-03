const searchBar = document.querySelector('.search__input');
const searchResultList = document.querySelector('.search__result-list');
const searchResults = searchResultList.childNodes;

let pages = [];

document.addEventListener('mouseup', () => {
  if (searchBar != document.activeElement) {
    showResults(false);
  }
});

document.addEventListener('keydown', (event) => {
  // Moves focus between and out of the search results
  const focusableList = [searchBar, ...searchResults];

  const index = focusableList.indexOf(document.activeElement);
  let nextIndex = 0;

  if (index >= 0) {
    if (event.key == 'Tab') showResults(false);
    else if (event.key == 'ArrowUp') {
      // move focus up
      event.preventDefault();
      nextIndex = index > 0 ? index - 1 : 0;
      focusableList[nextIndex].focus();
    } else if (event.key == 'ArrowDown') {
      // move focus down
      event.preventDefault();
      nextIndex = index + 1 < focusableList.length ? index + 1 : index;
      focusableList[nextIndex].focus();
    }
  }
});

searchBar.addEventListener('keyup', (e) => {
  const searchString = e.target.value.toLowerCase();

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

const loadResults = async () => {
  try {
    pages = await (await fetch('/searchData.json')).json();
    displayResults(pages);
    showResults(false);
  } catch (err) {
    console.error(err);
  }
};

const displayResults = (results) => {
  const htmlString = results
    .slice(0, 10)
    .map((page) => {
      return `<a href="${page.url}" class="search__result">${page.title}</a>`;
    })
    .join('');

  searchResultList.innerHTML = htmlString;
};

const showResults = (display) => {
  searchResults.forEach((result) => {
    result.style.display = display ? 'block' : 'none';
  });
};

const getDistance = (a, b) => {
  let costs = new Array();

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
};

loadResults();
