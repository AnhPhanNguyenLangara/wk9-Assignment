// console.log("connected");

// *****************************************************************************
// *****************************************************************************
// Path to the Movie Poster
const imgPath = "https://image.tmdb.org/t/p/w200";

// Still prefer getElementById cause it's transparent about where the variables
// are coming from and therefore doesn't cause my linter to scream
const featuredMovie = document.getElementById("featuredMovie");
const getDetails = document.getElementById("getDetails");
const movieTable = document.getElementById("movieTable");
const movieDetails = document.getElementById("movieDetails");
const searchForm = document.getElementById("searchForm");
const favoriteMovies = document.getElementById("favoriteMovies");
const saveFavorites = document.getElementById("saveFavorites");

let movieData = [];

// *****************************************************************************
//  API Request goes here
// *****************************************************************************
fetch("http://localhost:3000")
    .then((response) => response.json())
    .then((data) => {
        writeToTable(data);
        featuredMovie.appendChild(createMovieCard(movieData[0]));
    });

renderFavorites();

// *****************************************************************************
// *****************************************************************************

// Processing the Triggered Event
getDetails.addEventListener("click", () => {
    movieDetails.innerHTML = "";
    const allMovies = document.querySelectorAll(".movieItems");
    // console.log(allMovies);
    const checkedMovies = Array.from(allMovies).filter((movie) => movie.checked);
    const checkedMoviesObj = checkedMovies.map(
        (movieInput) => movieData[movieInput.value]
    );
    const movieCards = checkedMoviesObj.map((movieObj) =>
        createMovieCard(movieObj)
    );
    movieCards.forEach((movieCard) => movieDetails.appendChild(movieCard));
});


// Processing the Search Submit
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = encodeURI(e.target.searchMovie.value);
    // console.log(query);
    fetch(`http://localhost:3000/search?query=${query}`)
        .then((response) => response.json())
        .then((data) => {
            featuredMovie.remove();
            writeToTable(data);
        });
});

// Processing saving selected movies to Favorites
saveFavorites.addEventListener("click", async () => {
    const allMovies = document.querySelectorAll(".movieItems");
    // console.log(allMovies);
    const checkedMovies = Array.from(allMovies).filter((movie) => movie.checked);
    const checkedMoviesObj = checkedMovies.map(
        (movieInput) => movieData[movieInput.value]
    );
    const checkedMoviesIDs = checkedMoviesObj.map( movieObj => movieObj.id);
    checkedMoviesIDs.reverse(); // Favorites UI order
    for (const id of checkedMoviesIDs) {
        await fetch(`http://localhost:3000/favorites/${id}`, {method: 'POST'});
    }
    renderFavorites();
})


function renderFavorites() {
    fetch("http://localhost:3000/favorites")
        .then((response) => response.json())
        .then((data) => {
            const movieCards = data.map((movieObj) =>
                createMovieCard(movieObj)
            );
            const fragment = new DocumentFragment();
            for (let i = 0; i < movieCards.length; i++) {
                const movieCard = movieCards[i];
                fragment.appendChild(movieCard);
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete Movie from Favorites";
                deleteButton.setAttribute("data-id", data[i].id);
                deleteButton.addEventListener("click", async (e) => {
                    await fetch(`http://localhost:3000/favorites/${e.target.dataset.id}`, {method: 'DELETE'});
                    renderFavorites();
                })
                fragment.appendChild(deleteButton);
            }
            favoriteMovies.innerHTML = "";
            favoriteMovies.appendChild(fragment);
        })
}

function createMovieCard(movie) {
    // Set up the Information Section
    const newDiv = document.createElement("div");
    newDiv.className = "movieBlock";

    // Add the Heading
    const divHeader = document.createElement("h2");
    const divHeaderText = document.createTextNode(`${movie.title}`);
    divHeader.appendChild(divHeaderText);
    newDiv.appendChild(divHeader);

    // Add Description Container
    const descriptionContainer = document.createElement("div");
    descriptionContainer.className = "descriptionContainer";

    // Add the Image to the Description Container
    const movieImage = document.createElement("img");
    const imagePath = `${imgPath + movie.poster_path}`;
    const imageAlt = `${movie.title}`;
    movieImage.setAttribute("src", imagePath);
    movieImage.setAttribute("alt", imageAlt);

    // Create a Text Container to add to the Description Container
    const movieText = document.createElement("div");
    movieText.className = "textDescription";

    // Add the Movie Description to the Text Container
    const movieDescription = document.createElement("div");
    const description = document.createTextNode(`${movie.overview}`);
    movieDescription.appendChild(description);
    movieText.appendChild(movieDescription);

    // Add the Rating to the Text Container
    const movieRating = document.createElement("div");
    const rating = document.createTextNode(
        `Rated ${movie.vote_average} averaged over ${movie.vote_count} voters`
    );
    movieRating.appendChild(rating);
    movieText.appendChild(movieRating);

    // Put it all together
    descriptionContainer.appendChild(movieImage);
    descriptionContainer.appendChild(movieText);
    newDiv.appendChild(descriptionContainer);

    return newDiv;
}


function writeToTable(data) {
    movieData = data;
    // Get the number of rows in the table
    const rowCount = movieTable.rows.length;

    // Start from the second row (index 1) and remove each row
    for (let i = rowCount - 1; i > 0; i--) {
        movieTable.deleteRow(i);
    }

    // console.log(movieData);
    movieData.forEach((movie, index) => {
        const movieRow = movieTable.insertRow(index + 1);

        // New Cells
        const cell1 = movieRow.insertCell(0);
        const cell2 = movieRow.insertCell(1);
        const cell3 = movieRow.insertCell(2);
        const cell4 = movieRow.insertCell(3);

        // Populate the Cells
        cell1.innerHTML = movie.title;
        cell2.innerHTML = movie.release_date;
        cell3.innerHTML = movie.vote_average;
        cell4.innerHTML = `<input type="checkbox" class="movieItems" id="movie${
            index + 1
        }" value="${index}">`;
    });
}
