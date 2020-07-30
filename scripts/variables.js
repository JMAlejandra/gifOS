// Constants
// HTML ELEMENTS BY ID
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchResults = document.getElementById("search-results");
const suggestionsBox = document.getElementById("suggestions");
const resultsTitleBar = document.getElementById("results-title-bar");
const themesDiv = document.getElementById("themes");
const mainContainer = document.getElementById("main-container");
const gifOSLogo = document.getElementById("logo");
const themesDropdown = document.getElementById("theme-button");
const suggestionsGrid = document.getElementById("suggestions-grid");
const searchBox = document.getElementById("search-container");
const optionButtonsContainer = document.querySelector(".suggestions-option-buttons");

// CONSTANT VALUES
const apiKey = "rs9sDvLV5524A3XWhlZo6kKTwEEpY71a";
const numberOfResults = 10;
const rating = 'G';
const language = "en";

// INITIALIZATIONS
let offsetValue = 0;