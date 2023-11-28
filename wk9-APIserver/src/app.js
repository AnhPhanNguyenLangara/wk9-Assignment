// ****************************************************************************
// ****************************************************************************
// Core Modules
const fs = require("fs");
const path = require("path");
// ****************************************************************************
// Third Party Modules
const express = require("express");
const fetch = require("node-fetch");
const cors = require('cors');
// ****************************************************************************
// Custom Modules
// ****************************************************************************
// ****************************************************************************
const port = process.env.PORT || 3000;

// Path to the favorites database JSON

const databaseFilePath= path.resolve(__dirname,"./favorites.json");

// Path to the API
const apiURL = "https://api.themoviedb.org/3";
const apiSingleMovie = "/movie";
const apiDiscovery = "/discover/movie?sort_by=popularity.desc";
const apiSearch = "/search/movie?include_adult=false&language=en-US"
const apiKey = "&api_key=94af6c55e45122b4f9eb07b1aca67c36&page=1";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
    fetch(apiURL + apiDiscovery + apiKey).then((tmdbResponse) => {
        tmdbResponse.json().then((data) => {
            res
                .set({
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                })
                .send(data.results);
        });
    });
});


// Search endpoint
app.get("/search", (req, res) => {
    const fetchTarget = apiURL + apiSearch + apiKey + `&query=${req.query.query}`;
    // console.log(fetchTarget);
    fetch(fetchTarget).then((tmdbResponse) => {
        tmdbResponse.json().then((data) => {
            res
                .set({
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                })
                .send(data.results);
        });
    });
});


// Get favorite movies endpoint (GET)
app.get("/favorites", (req, res) => {
    try {
        const jsonData = fs.readFileSync(databaseFilePath, 'utf8');
        const dataObject = JSON.parse(jsonData);
        console.log('Current Favorites List:', dataObject.favorites);

        const getMovieDetails = async (idList) => {
            const moviePromises = idList.map((id) => fetch (apiURL+apiSingleMovie+`/${id}`+"?language=en-US"+apiKey));
            const movieResponses = await Promise.all(moviePromises);
            const movies = await Promise.all(movieResponses.map(res => res.json()));
            res
                .set({
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                })
                .send(movies);
        }
        getMovieDetails(dataObject.favorites);
    } catch (err) {
        // Handle errors appropriately
        console.error('Error reading the file:', err);
    }
})

// Add one favorite movie endpoint (POST)
app.post("/favorites/:putID",(req,res) => {
    try {
        const putID = Number(req.params['putID']);
        const jsonData = fs.readFileSync(databaseFilePath, 'utf8');
        const dataObject = JSON.parse(jsonData);
        const withNewID = [putID,...dataObject.favorites];
        const newFavorites = [...new Set(withNewID)]; // Deduplicating saved movies
        const newJSONData = JSON.stringify({favorites: newFavorites});
        fs.writeFileSync(databaseFilePath,newJSONData,'utf8');
        res
            .set({
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            })
            .send({message:"Successfully Added Movie"});
    }
    catch (err) {
        // Handle errors appropriately
        console.error('Error reading the file:', err);
    }
});

// Delete one favorite movie endpoint (DELETE)
app.delete("/favorites/:deleteID",(req,res) => {
    try {
        const deleteID = Number(req.params['deleteID']);
        const jsonData = fs.readFileSync(databaseFilePath, 'utf8');
        const dataObject = JSON.parse(jsonData);
        const newFavorites = dataObject.favorites.filter((movieID) => movieID!==deleteID);
        const newJSONData = JSON.stringify({favorites: newFavorites});
        fs.writeFileSync(databaseFilePath,newJSONData,'utf8');
        res
            .set({
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            })
            .send({message:"Successfully Deleted Movie"});
    }
    catch (err) {
        // Handle errors appropriately
        console.error('Error reading the file:', err);
    }
});

app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`)
})
