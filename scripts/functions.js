// ---------------------------------------------------------------------------------------------
// FUNCTIONS THAT TOGGLE CLASSES
// ---------------------------------------------------------------------------------------------

// toggles the suggestions Box display
function suggestionsBoxSwitch() {
    if (searchInput.value === "") {
        searchResults.classList.add("nodisplay");
    } else {
        searchResults.classList.remove("nodisplay");
    }
}


function isNoDisplayActive(element) {
    return element.classList.contains("nodisplay")
}

// toggles search button class
function searchButtonSwitch() {
    if ((searchButton.className.indexOf("button-active") < 0) && (searchInput.value !== "")) {
        searchButton.classList.add("button-active");
    } else if (searchInput.value === "") {
        searchButton.classList.remove("button-active");
    }
}

// Returns the source of the logo depending on the theme
function changeLogoSrc(theme) {
    if (theme === "light-theme") {
        return "./images/gifOF_logo_dark.png"
    } else {
        return "./images/gifOF_logo.png"
    }
}

// switches the theme in the main container
function switchTheme(newTheme, currentTheme) {
    mainContainer.classList.remove(currentTheme);
    mainContainer.classList.add(newTheme);
}

// gets the search term from the search input field
function getSearchTerm(elementID) {
    let inputField = document.getElementById(elementID)
    let term = inputField.value === "" ? inputField.dataTag[0] : inputField.value;
    return term;
    //let searchTerm = inputField.value;
    //return searchTerm;
}

// ---------------------------------------------------------------------------------------------
// FUNCTIONS THAT ARE CALLED IN EVENTS OR FUNCTIONS
// ---------------------------------------------------------------------------------------------

function passGifTagToSearchInput(gifTag) {
    searchInput.value = gifTag;
}

// ---------------------------------------------------------------------------------------------
// FUNCTIONS THAT DEAL WITH SEARCHING FOR A TERM IN THE API
// ---------------------------------------------------------------------------------------------

// parses the url that will be passed to the API
function createSearchURL(query, numberOfResults, key, offset, rating, language) {
    const searchURL = `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${query}&limit=${numberOfResults}&offset=${offset}&rating=${rating}&lang=${language}}`;
    return searchURL;
}

// searches the giphy api. Returns a promise
async function searchAPI(query, numberOfResults, key, offset, rating, language) {
    const queryURL = createSearchURL(query, numberOfResults, key, offset, rating, language);
    const searchResults = await fetch(queryURL);
    const resultObject = await searchResults.json();
    return resultObject;
}

// calls the searchApi function to get the promise and deal with it
function getGifs(offset, scrollFlag) {
    let searchTerm = getSearchTerm("search-input");
    const searchResults = searchAPI(searchTerm, numberOfResults, apiKey, offset, rating, language);

    //adds each search result into the site
    searchResults
        .then(obj => {
            let gifArray = obj.data;
            const section = document.querySelector(".gif-results");
            /// WILL NEED TO CHANGE TO ACCOMODATE THE INFINITE SCROLL
            section.innerHTML = scrollFlag === true ? "" : section.innerHTML;
            gifArray.forEach((element, index) => {
                let newIMG = document.createElement("img");
                const newDiv = document.createElement("div");
                const newParagraph = document.createElement("p");
                newDiv.className = (index + 1) % 5 === 0 ? "gif-result-box large" : "gif-result-box";
                newIMG.src = element.images.original.url;
                newIMG.className = "gif-img";
                newIMG.alt = "gif" + index;
                const gifTags = parseElementTags(element.title, searchTerm);
                newParagraph.innerHTML = gifTags;
                newParagraph.className = "gif-tags";
                newDiv.appendChild(newIMG);
                newDiv.appendChild(newParagraph);
                section.appendChild(newDiv);
                if (scrollFlag === true) {
                    optionButtonsContainer.scrollIntoView();
                }
                resultsTitleBar.innerText = "Resultados de Búsqueda para: " + searchInput.value;

            });
        })
        .catch(error => console.log(error))
}


// ---------------------------------------------------------------------------------------------
// FUNCTIONS THAT DEAL WITH INITIALIZING THE SITE'S RESULT GIFS
// ---------------------------------------------------------------------------------------------
function createGifResultBoxImg(gifSource) {
    const newIMG = document.createElement("img");
    newIMG.src = gifSource;
    newIMG.className = "gif-img";
    return newIMG;
}

function createGifResultBoxP(gifTags) {
    const newParagraph = document.createElement("p");
    newParagraph.innerHTML = gifTags;
    newParagraph.className = "gif-tags";
    return newParagraph;
}

function createGifResultBoxDiv(imgElement, paragraphElement) {
    const newDiv = document.createElement("div");
    newDiv.appendChild(imgElement);
    newDiv.appendChild(paragraphElement);
    return newDiv;
}

function createGifResultBox(gifURL, gifTags) {
    const imgElement = createGifResultBoxImg(gifURL);
    const paragraphElement = createGifResultBoxP(gifTags);
    const gifDiv = createGifResultBoxDiv(imgElement, paragraphElement);
    return gifDiv;
}

// fills the gif grid -- WORK IN PROGRESS
async function initializeGifsNew(NumberOfCategories, offset) {
    getTrendingGifs(NumberOfCategories, apiKey);

    const searchTermArray = await getTrendingArray(apiKey);
    const randomSearchTermArray = await getRandomTrends(searchTermArray, 10);
    await console.log(searchTermArray);
    //await console.log(randomSearchTermArray);
    randomSearchTermArray.forEach((element, index) => {
        const searchResult = searchAPI(element, 1, apiKey, offset, rating, language);
        searchResult
            .then(obj => obj.data)
            .then(gifArray => {
                const resultSection = document.querySelector(".gif-results");
                gifArray.forEach((element) => {
                    const gifDiv = createGifResultBox(element.images.original.url, "gifTags");
                    gifDiv.className = (index + 1) % 5 === 0 ? "gif-result-box large" : "gif-result-box";
                    resultSection.appendChild(gifDiv);
                });
                console.log(gifArray);
            })
            .catch(error => console.log(error));
    })
}

function parseElementTags(title, searchTerm) {
    const elementTitleArray = title.split(" ").map(e => '#' + e).filter((e, i) => ((e !== '#GIF') && (i < 3)));
    let tag = '#' + searchTerm + ' ';
    if (elementTitleArray.length > 0) {
        return elementTitleArray.reduce((t, e) => t + ' ' + e);
    } else {
        return tag;
    }
}


// fills the gif grid 
async function initializeGifs(NumberOfCategories, offset) {
    resultsTitleBar.innerText = "Tendencias";
    getTrendingGifs(NumberOfCategories, apiKey, offset);

    // checks localstorage for theme
    setThemeOnLoad();

    const searchTermArray = await getTrendingArray(apiKey);
    const searchTerm = await getRandomTrends(searchTermArray, 1);
    const searchResults = searchAPI(searchTerm, 10, apiKey, offset, rating, language);

    //adds each search result into the site
    searchResults
        .then(obj => {
            let gifArray = obj.data;
            const section = document.querySelector(".gif-results");
            gifArray.forEach((element, index) => {
                let newIMG = document.createElement("img");
                const newDiv = document.createElement("div");
                const newParagraph = document.createElement("p");
                newDiv.className = (index + 1) % 5 === 0 ? "gif-result-box large" : "gif-result-box";
                newIMG.src = element.images.original.url;
                newIMG.className = "gif-img";
                newIMG.alt = "gif" + index;
                const gifTags = parseElementTags(element.title, searchTerm);
                searchInput.dataTag = searchTerm;
                newParagraph.innerHTML = gifTags;
                newParagraph.className = "gif-tags";
                newDiv.appendChild(newIMG);
                newDiv.appendChild(newParagraph);
                section.appendChild(newDiv);
                //console.log(element);
            });
        })
        .catch(error => console.log(error))
}

// ---------------------------------------------------------------------------------------------
// FUNCTIONS THAT DEAL WITH GETTING THE SUGGESTIONS FROM THE API
// ---------------------------------------------------------------------------------------------

async function getTrendingArray(apiKey) {
    const trendingCategories = await fetch(`https://api.giphy.com/v1/trending/searches?api_key=${apiKey}`)
        .then(data => data.json())
        .then(object => object.data)
        .catch(error => console.log("Error on Suggestions fetch: " + error))
    return trendingCategories;
}

function getRandomTrends(array, numberOfResults) {
    let trends = [];
    for (i = 0; i < numberOfResults; i++) {
        const index = Math.floor(Math.random() * array.length);
        trends.push(array[index]);
        array.splice(index, 1);
    }
    return trends;
}

function createSuggestionBoxCloseImg() {
    const titleClose = document.createElement("img")
    titleClose.src = "./images/close.svg";
    titleClose.alt = "close";
    return titleClose;
}

function createSuggestionBoxTitle(gifTitle) {
    const titleContainer = document.createElement("div");
    titleContainer.classList.add("box-title");
    const titleParagraph = document.createElement("p");
    titleParagraph.innerText = gifTitle;
    const titleClose = createSuggestionBoxCloseImg();
    titleContainer.appendChild(titleParagraph);
    titleContainer.appendChild(titleClose);
    return titleContainer;
}

function createSuggestionBoxImage(source, alt) {
    const boxImage = document.createElement("img");
    boxImage.src = source;
    boxImage.alt = alt;
    boxImage.classList.add("suggestions-img");
    return boxImage
}

function createSuggestionBoxButton(gifTitle) {
    const boxButton = document.createElement("button");
    boxButton.classList.add("suggestions-button");
    boxButton.innerHTML = "Ver mas...";
    boxButton.dataTag = gifTitle;
    return boxButton;
}

function createSuggestionBox(gifTitle, gifURL, alt, gifTitleNoHashtag) {
    const gifBox = document.createElement("div");
    gifBox.classList.add("suggestions-box");
    const boxTitle = createSuggestionBoxTitle(gifTitle);
    const boxImage = createSuggestionBoxImage(gifURL, alt);
    const boxButton = createSuggestionBoxButton(gifTitleNoHashtag);
    gifBox.appendChild(boxTitle);
    gifBox.appendChild(boxImage);
    gifBox.appendChild(boxButton);
    return gifBox;
}

async function getTrendingGifs(numberOfResults, apiKey, offset) {
    const trendingArray = await getTrendingArray(apiKey);
    const randomTrends = await getRandomTrends(trendingArray, numberOfResults);
    await randomTrends.forEach((element, index) => {
        const gifObject = searchAPI(element, 1, apiKey, offset, rating, language);
        gifObject
            .then(data => data.data[0])
            .then(gifObj => {
                const gifURL = gifObj.images.original.url;
                const gifTitle = "#" + element;
                const gifBox = createSuggestionBox(gifTitle, gifURL, "gif-" + index, element);
                gifBox.dataTag = element;
                suggestionsGrid.appendChild(gifBox);
            })

    })
}

// ---------------------------------------------------------------------------------------------
// FUNCTIONS THAT DEAL WITH AUTOCOMPLETE ENDPOINT TO SEARCH FOR SUGGESTIONS
// ---------------------------------------------------------------------------------------------

// CREATES THE URL TO SEND TO THE API TO FETCH SUGGESTIONS
function createSuggestionURL(key, search) {
    const searchURL = `https://api.giphy.com/v1/gifs/search/tags?api_key=${key}&q=${search}`;
    return searchURL;
}

async function suggestionsFromAPI(query) {
    const queryURL = createSuggestionURL(apiKey, query);
    const searchResults = await fetch(queryURL);
    const searchObject = searchResults.json();
    return searchObject;
}

function getSuggestions() {
    let searchTerm = getSearchTerm("search-input");
    const suggestionResults = suggestionsFromAPI(searchTerm);
    suggestionResults
        .then(obj => {
            const suggestionArray = obj.data;
            if ((suggestionArray.length > 0)) {
                let results = suggestionArray.length >= 3 ? 3 : suggestionArray.length;
                for (let i = 0; i < results; i++) {
                    searchResults.children[i].innerHTML = suggestionArray[i].name;
                }
            }
        })
        .catch(e => console.log(e))
}

// ===============================================================================
// local storage and switching themes on load
// ===============================================================================

// adds or modifies theme to localStorage
function setThemeToLocalStorage(themeName) {
    if (localStorage.getItem("theme") !== null) {
        localStorage.setItem("theme", JSON.stringify({ name: themeName }));
    } else {
        localStorage.setItem("theme", JSON.stringify({ name: themeName }));
    }
};

// reads localstorage object
function readLocalStorage(keyName) {
    if (localStorage.getItem(keyName) !== null) {
        return JSON.parse(localStorage.getItem(keyName));
    } else {
        return {};
    }
};
// gets the current theme in the main container
function getCurrentTheme() {
    return mainContainer.classList[1];
};
// checks if two themes are the same
function isLocalStorageThemeActive(currentTheme, storageTheme) {
    return currentTheme === storageTheme ? true : false;
};
function setThemeOnLoad() {
    let currentTheme = getCurrentTheme();
    let storageTheme = readLocalStorage("theme").name || "light-theme";
    if (!isLocalStorageThemeActive(currentTheme, storageTheme)) {
        switchTheme(storageTheme, currentTheme);
        gifOSLogo.src = changeLogoSrc(currentTheme);
    }
};

// ===============================================================================
// local storage and switching themes on load
// ===============================================================================

// creates an option button 
function createOptionButton(gifTitle) {
    const boxButton = document.createElement("div");
    boxButton.classList.add("suggestion-option");
    boxButton.innerHTML = '#' + gifTitle;
    boxButton.dataTag = gifTitle;
    return boxButton;
}

// creates the option buttons that are passed to the container after a search is performed
function createButtonsAfterResult() {
    optionButtonsContainer.innerHTML = "";
    let searchTerm = getSearchTerm("search-input");
    const suggestionResults = suggestionsFromAPI(searchTerm);
    suggestionResults
        .then(obj => {
            const suggestionArray = obj.data;
            if ((suggestionArray.length > 0)) {
                let results = suggestionArray.length >= 4 ? 4 : suggestionArray.length;
                for (let i = 0; i < results; i++) {
                    let myBtn = createOptionButton(suggestionArray[i].name);
                    optionButtonsContainer.appendChild(myBtn);
                }
            } else {
                let defaultArray = ["kitties", "puppies", "fab five", "thumbs up"];
                for (let i = 0; i < defaultArray.length; i++) {
                    let myBtn = createOptionButton(defaultArray[i]);
                    optionButtonsContainer.appendChild(myBtn);
                }
            }
        })
        .catch(e => console.log(e))
}
//createButtonsAfterResult()