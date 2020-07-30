// Enables Theme Dropdown
themesDropdown.addEventListener("click", () => {
    const optionsDiv = themesDropdown.children.themes;
    let className = "nodisplay";
    let isDisplayed = false;
    const classes = optionsDiv.className;
    const isChecked = ((classes.indexOf(className) > 0) && (isDisplayed === false)) ? true : false;
    if (isChecked) {
        optionsDiv.classList.remove(className);
        isDisplayed = true;
    } else {
        optionsDiv.classList.add(className);
        isDisplayed = false;
    }
})

// Enables & disables the suggestions box 
searchInput.addEventListener("keyup", () => {
    suggestionsBoxSwitch();
});

// Enables and disables the active class in the search button
searchInput.addEventListener("keyup", () => {
    searchButtonSwitch();
});

// Enables or disables the active class in the search button
searchInput.addEventListener("click", () => {
    searchButtonSwitch();
});


// Disables the suggestions box when clicked outside of the search input 
document.addEventListener('click', () => {
    if ((event.target.id !== 'search-results') && (!isNoDisplayActive(searchResults))) {
        searchResults.classList.toggle("nodisplay")
    }
}
)

// SWITCHES THEMES
themesDiv.addEventListener("click", () => {
    const newTheme = event.target.id;
    const currentTheme = mainContainer.classList[1];

    if ((currentTheme !== newTheme) && (newTheme !== "themes")) {
        const newLogoSrc = changeLogoSrc(currentTheme);
        switchTheme(newTheme, currentTheme);
        gifOSLogo.src = newLogoSrc;
        setThemeToLocalStorage(newTheme);
    }
})

// EVENTS THAT DEAL WITH SEARCHING THE API

// Gets gifs for the option chosen from the suggestions with the mouse
searchResults.addEventListener("click", () => {
    if (event.target.className.indexOf("search-results") < 0) {
        searchInput.value = event.target.innerText;
        searchButton.classList.remove("button-active");
        searchResults.classList.add("nodisplay");
        resultsTitleBar.innerText = "Resultados de Búsqueda para: " + searchInput.value;
        getGifs(0, true);
        //offsetValue += 10;
        //console.log(offsetValue);
        createButtonsAfterResult();
        if (!isNoDisplayActive(suggestionsBox)) {
            suggestionsBox.classList.toggle("nodisplay");
        }
    } else {
        searchResults.classList.add("nodisplay");
    }
})

// enables getting gifs from search input through clicking the search button
searchButton.addEventListener("click", () => {
    getGifs(0, true);
    searchResults.classList.add("nodisplay");
    searchInput.innerText = "";
    searchButton.classList.remove("button-active");
    createButtonsAfterResult();
    if (!isNoDisplayActive(suggestionsBox)) {
        suggestionsBox.classList.toggle("nodisplay");
    }
})


// enables searching for gifs with enter
searchInput.addEventListener("keyup", () => {
    getSuggestions();
    if (event.keyCode === 13) {
        event.preventDefault();
        getGifs(0, true);
        searchResults.classList.add("nodisplay");
        searchInput.innerText = "";
        searchButton.classList.remove("button-active");
        createButtonsAfterResult();
        if (!isNoDisplayActive(suggestionsBox)) {
            suggestionsBox.classList.toggle("nodisplay");
        }
    }
})

// GETS GIFS FROM SUGGESTION
suggestionsGrid.addEventListener("click", () => {
    const clickedElement = event.target;
    if (event.target.tagName === "BUTTON") {
        passGifTagToSearchInput(clickedElement.dataTag);
        getGifs(1, true);
        createButtonsAfterResult();
        if (!isNoDisplayActive(suggestionsBox)) {
            suggestionsBox.classList.toggle("nodisplay");
        }
    }
})

// infinite scroll 

document.addEventListener("scroll", () => {
    let scrollSum = document.documentElement.scrollTop + window.innerHeight;
    if ((scrollSum >= document.documentElement.scrollHeight - 5) && (searchInput.dataTag !== "")) {
        offsetValue += 10;
        getGifs(offsetValue, false);
        console.log(offsetValue);
    }
})


// searches for gifs depending on the suggestion button that was clicked
optionButtonsContainer.addEventListener("click", () => {
    const clickedElement = event.target;
    if (clickedElement.tagName === "DIV") {
        passGifTagToSearchInput(clickedElement.dataTag);
        getGifs(1, true);
        createButtonsAfterResult();
        if (!isNoDisplayActive(suggestionsBox)) {
            suggestionsBox.classList.toggle("nodisplay");
        }
    }
})

// =================================================================================
// REINITIALIZE PAGE ON GIFOS LOGO
// =================================================================================
// reloads the page when clicking on the logo
gifOSLogo.addEventListener('click', () => {
    document.querySelector(".gif-results").innerHTML = "";
    optionButtonsContainer.innerHTML = "";
    searchInput.value = "";
    suggestionsBox.children[1].innerHTML = '';
    initializeGifs(4, 1);
    if (isNoDisplayActive(suggestionsBox)) {
        suggestionsBox.classList.toggle("nodisplay");
    }
})

// =================================================================================
// SAVES A VARIABLE ON SESSIONSTORAGE THAT TELLS THE GUIFOS IF CAPTURE APP IS ENABLED
// =================================================================================
document.querySelector("#create-guifo").addEventListener("click", () => {
    localStorage.setItem("guifosApp", JSON.stringify({ isEnabled: true }));
    document.location.href = './pages/guifos.html';
})
document.querySelector(".nav-link").addEventListener("click", () => {
    localStorage.setItem("guifosApp", JSON.stringify({ isEnabled: false }));
})