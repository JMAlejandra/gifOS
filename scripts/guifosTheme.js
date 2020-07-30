const themesDropdown = document.getElementById("theme-button");
const gifOSLogo = document.getElementById("logo");
const mainContainer = document.getElementById("main-container");
const themesDiv = document.getElementById("themes");

function setThemeToLocalStorage(themeName) {
    if (localStorage.getItem("theme") !== null) {
        localStorage.setItem("theme", JSON.stringify({ name: themeName }));
    } else {
        localStorage.setItem("theme", JSON.stringify({ name: themeName }));
    }
};
function changeLogoSrc(theme) {
    if (theme === "light-theme") {
        return "../images/gifOF_logo_dark.png"
    } else {
        return "../images/gifOF_logo.png"
    }
};
// checks if two themes are the same
function isLocalStorageThemeActive(currentTheme, storageTheme) {
    return currentTheme === storageTheme ? true : false;
};
// switches the theme in the main container
function switchTheme(newTheme, currentTheme) {
    mainContainer.classList.remove(currentTheme);
    mainContainer.classList.add(newTheme);
};
function getCurrentTheme() {
    return mainContainer.classList[1];
};
function setThemeOnLoad() {
    let currentTheme = getCurrentTheme();
    let storageTheme = readLocalStorage("theme").name || "light-theme";
    if (!isLocalStorageThemeActive(currentTheme, storageTheme)) {
        switchTheme(storageTheme, currentTheme);
        gifOSLogo.src = changeLogoSrc(currentTheme);
    }
};

// changes themes 
themesDiv.addEventListener("click", () => {
    const newTheme = event.target.id;
    const currentTheme = mainContainer.classList[1];

    if ((currentTheme !== newTheme) && (newTheme !== "themes")) {
        const newLogoSrc = changeLogoSrc(currentTheme);
        switchTheme(newTheme, currentTheme);
        gifOSLogo.src = newLogoSrc;
        setThemeToLocalStorage(newTheme);
    }
});

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
});

document.querySelector("#create-guifo").addEventListener("click", () => {
    sessionStorage.setItem("guifosApp", JSON.stringify({ isEnabled: true }));
    document.location.href = '../pages/guifos.html';
})
document.querySelector(".nav-link").addEventListener("click", () => {
    sessionStorage.setItem("guifosApp", JSON.stringify({ isEnabled: false }));
    document.location.href = '../pages/guifos.html';
})