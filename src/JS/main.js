"use strict";

// Deklarerar variabler som används i multipla funktioner.
let searchContainerEl = document.getElementById("search-container");
let resultListEl = document.getElementById("result-list");
let resultMovieEl = document.getElementById("result-movie");
let appInfoEl = document.getElementById("app-info");

// Importerar API-nycklar.
import { omdbApiKey } from "./apikey.js";
import { imdbApiKey } from "./apikey.js";

// Händelselyssnare.
const searchButtonEl = document.getElementById("search-button");
searchButtonEl.addEventListener("click", getInput);

// Hämtar input från sökfältet och anropar fetch-funktionen.
function getInput() {
    const inputValue = document.getElementById("search-input").value;
    // Anropar funktionen och skickar med inputen. 
    getData(inputValue);
};

// Hämtar data från OMDb med "värdet" från sökfältet (10 rader/filmer är default).
async function getData(inputValue) {
    try {
        // Hämtar in film-resultat från sökning.
        const response = await fetch("http://www.omdbapi.com/?s=" + inputValue + `&type=movie&apikey=${omdbApiKey}`);
        const data = await response.json();

        // Anropar funktion som visar en lista med filmer. Skickar med datan.
        showMovieList(data);

    // Felmeddelande som visas i app och i konsollen.
    } catch (error) {
        resultListEl.innerHTML = "Something went wrong. Try again!";
        console.error("Fetch failed. This message was created:", error);
    }
}

// Hämtar in efterfrågad data, sorterar och skriver ut i DOM.
function showMovieList(data) {

    // Rensar tidigare information.
    resultListEl.innerHTML = "";
    resultMovieEl.innerHTML = "";
    appInfoEl.innerHTML = "";

    // Skriver ny info till användaren.
    appInfoEl.innerHTML = "Click on a movietitle or make a new search!";

    // Kollar om filmtiteln förekommer i API:et och skriver ut en lista.
    if (data && data.Search) {

        // Sorterar filmerna i fallande ordning efter utgivningsår.
        data.Search.sort((a, b) => b.Year.localeCompare(a.Year));

        // Loopar genom objekt-array och skriver ut en lista med filmer.
        data.Search.forEach((movie) => {
            // Skapar ett listelement för varje film.
            const movieItem = document.createElement("li");
            movieItem.innerHTML = `
                <h3>${movie.Title}, ${movie.Year}</h3>
            `;
    
            // Lägger till listelementen i listan.
            resultListEl.appendChild(movieItem);

            // Lägger till en händelselyssnare på varje listelement och skickar med film-ID till ny funktion.
            movieItem.addEventListener("click", () => showMovieInfo(movie.imdbID));
        });
   
    // Meddelande om filmtiteln saknas i API:et.
    } else {
        resultListEl.innerHTML = "The movietitle you searched for doesn't exist. Try again with a different title!";
    }
};

// Hämtar information om en specifik film från IMDb och skriver ut till DOM.
async function showMovieInfo(movieId) {
    const url = `https://imdb8.p.rapidapi.com/title/get-overview-details?tconst=${movieId}`;
    // Alternativ som innefattar API-nyckel.
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': `${imdbApiKey}`,
            'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
        }
    };

    try {
        // Hämtar in film-resultat från sökning.
        const response = await fetch(url, options);
        const result = await response.json();

        // Rensar tidigare information.
        searchContainerEl.innerHTML = "";
        resultListEl.innerHTML = "";
        resultMovieEl.innerHTML = "";
        appInfoEl.innerHTML = "";

        // Skriver ny info till användaren.
        appInfoEl.innerHTML = `
            <h1>${result.title.title}</h1>
        `;

        // Lagrar handling i en variabel då objektets egenskaper varierar.
        const plotText = result.plotSummary?.text || result.plotOutline?.text;

        // Skapar en artikel med resultat för vald film.
        const movieDescriptionItem = document.createElement("article");
        movieDescriptionItem.innerHTML = `
            <h2>${result.title.year}</h2>
            <img src="${result.title.image.url}">
            <h3>Length: ${result.title.runningTimeInMinutes} minutes</h3>
            <p>${plotText}</p>
            <h4>Rating on IMDb: ${result.ratings.rating}</h4>
        `;

        // Lägger till listelementen i listan.
        resultMovieEl.appendChild(movieDescriptionItem);

    // Felmeddelande som visas i app och i konsollen.
    } catch (error) {
        resultMovieEl.innerHTML = "Something went wrong. Try again!";
        console.error("Fetch failed. This message was created:", error);
    }
};