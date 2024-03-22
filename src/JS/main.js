"use strict";

// Deklarerar variabler som används i multipla funktioner.
let resultListEl = document.getElementById("result-list");
let resultMovieEl = document.getElementById("result-movie");
let appInfoEl = document.getElementById("app-info");

// Importerar API-nycklar.
import { omdbApiKey } from "./apikey.js";
import { imdbApiKey } from "./apikey.js";

// Händelselyssnare för sök-knapp.
const searchButtonEl = document.getElementById("search-button");
searchButtonEl.addEventListener("click", getInput);

// Hämtar input från sökfältet.
function getInput() {
    const inputValue = document.getElementById("search-input").value;
    // Anropar fetch-funktionen och skickar med inputen. 
    getData(inputValue);
}

// Hämtar data från OMDb API med "värdet" från sökfältet (10 rader/filmer är default).
async function getData(inputValue) {
    try {
        // Hämtar in film-resultat från sökning.
        const response = await fetch("https://www.omdbapi.com/?s=" + inputValue + `&type=movie&apikey=${omdbApiKey}`);
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

    // Skriver ut ny info till användaren.
    appInfoEl.innerHTML = "Click on a movietitle in the list below <br> or make a new search!";

    // Kollar om filmtiteln förekommer i API:et och skriver ut en lista.
    if (data && data.Search) {

        // Sorterar filmerna i fallande ordning efter utgivningsår.
        data.Search.sort((a, b) => b.Year.localeCompare(a.Year));

        // Loopar genom objekt-array och skriver ut en lista med filmer.
        data.Search.forEach((movie) => {
            // Skapar ett listelement för varje film i DOM.
            const movieItem = document.createElement("li");
            movieItem.innerHTML = `
                <h3>${movie.Title}, ${movie.Year}</h3>
            `;
    
            // Lägger till listelementen i listan.
            resultListEl.appendChild(movieItem);

            // Lägger till en händelselyssnare på varje listelement och skickar med film-ID till ny fetch-funktion.
            movieItem.addEventListener("click", () => showMovieInfo(movie.imdbID));
        });
   
    // Meddelande som skrivs ut om filmtiteln saknas i API:et.
    } else {
        resultListEl.innerHTML = "The movietitle you searched for doesn't exist. Try again with a different title!";
    }
}

// Hämtar information om en specifik film från IMDb API och skriver ut till DOM.
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

        // Deklarerar en ny variabel och rensar tidigare information.
        let searchContainerEl = document.getElementById("search-container");
        searchContainerEl.innerHTML = "";
        resultListEl.innerHTML = "";
        resultMovieEl.innerHTML = "";
        appInfoEl.innerHTML = "";

        // Skriver ut ny info till användaren.
        searchContainerEl.innerHTML = `
            <h1>${result.title.title}</h1>
            <h2>${result.title.year}</h2>
        `;

        // Lagrar handling i en variabel då objektets egenskaper varierar.
        const plotText = result.plotSummary?.text || result.plotOutline?.text;

        // Skapar en artikel med resultat för vald film.
        const movieDescriptionItem = document.createElement("article");
        movieDescriptionItem.innerHTML = `
            <img src="${result.title.image.url}" alt="movieposter">
            <h3 id="rating">Rating: ${result.ratings.rating} / 10.</h3>
            <h3>Length: ${result.title.runningTimeInMinutes} minutes.</h3>
            <p>${plotText}</p>
        `;

        // Lägger till artikeln i containern.
        resultMovieEl.appendChild(movieDescriptionItem);

        // Anropar funktion som hämtar trailer och skickar med ID för vald film.
        showTrailer(movieId);

    // Felmeddelande som visas i app och i konsollen.
    } catch (error) {
        resultMovieEl.innerHTML = "Something went wrong. Try again!";
        console.error("Fetch failed. This message was created:", error);
    }
}

// Hämtar trailer för vald film från IMDb API och skriver ut till DOM.
async function showTrailer(movieId) {
    const url = `https://imdb8.p.rapidapi.com/title/v2/get-trailers?tconst=${movieId}`;
    // Alternativ som innefattar API-nyckel.
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': `${imdbApiKey}`,
            'X-RapidAPI-Host': 'imdb8.p.rapidapi.com'
        }
    };

    // Deklarerar en ny variabel för trailer-container.
    let trailerEl = document.getElementById("result-trailer");

    try {
        // Hämtar in trailer-resultat från sökning.
        const response = await fetch(url, options);
        const outcome = await response.json();

        // Kollar om filmtrailer förekommer i API:et och skriver ut i DOM.
        if (outcome.data.title.primaryVideos.edges[0]) {

            // Lagrar trailern och dess id för vald film i en variabel.
            const trailer = outcome.data.title.primaryVideos.edges[0].node;
            const trailerId = trailer.id;

            // Skapar en iframe för trailern. 
            const iframe = document.createElement('iframe');
            // Ställer in attribut för iframen.
            iframe.setAttribute('width', '100%');
            iframe.setAttribute('height', '315');
            iframe.setAttribute('src', `https://www.imdb.com/video/imdb/${trailerId}/imdb/embed?autoplay=false&width=560`);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', '');

            // Skapar en rubrik för trailern.
            const trailerHeadingEl = document.createElement("h2");
            // Sätter ett ID på elementet.
            trailerHeadingEl.setAttribute("id", "trailerHeading");
            // Matar in text-innehåll i rubriken.
            trailerHeadingEl.textContent = "Watch a trailer for the movie here!";

            // Lägger till rubrik och trailer i containern.
            trailerEl.appendChild(trailerHeadingEl);
            trailerEl.appendChild(iframe);

        // Containern för trailer inkl. rubrik lämnas tom om trailer saknas i API:et.
        } else {
            trailerEl.innerHTML = "";
        }

        // Anropar funktion som skriver ut en "ny sök"-knapp.
        showNewSearchButton();

    // Felmeddelande som visas i app och i konsollen.
    } catch (error) {
        trailerEl.innerHTML = "Something went wrong with the trailer for this movie. Try again!";
        console.error("Fetch failed. This message was created:", error);
    }
}

// Lägger till en "ny sök"-knapp i DOM.
function showNewSearchButton() {

    // Skapar knapp.
    const newSearchButtonEl = document.createElement("button");
    // Lägger till knapp-text.
    newSearchButtonEl.textContent = "New search";

    // Händelselyssnare på knappen som laddar om sidan vid klick.
    newSearchButtonEl.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    // Lägger till knappen i containern, efter slutresultatet av filmsöken.
    let newSearchEl = document.getElementById("new-search");
    newSearchEl.appendChild(newSearchButtonEl);
}