"use strict";

// Deklarerar variabler.
let resultListEl = document.getElementById("result-list");
let appInfoEl = document.getElementById("app-info");

// Importerar API-nyckel.
import { omdbApiKey } from "./apikey.js";

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
};

// Hämtar in efterfrågad data, sorterar och skriver ut i DOM.
function showMovieList(data) {

    // Rensar tidigare information.
    resultListEl.innerHTML = "";
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
        });
   
    // Meddelande om filmtiteln saknas i API:et.
    } else {
        resultListEl.innerHTML = "The movietitle you searched for doesn't exist. Try again with a different title!";
    }
};