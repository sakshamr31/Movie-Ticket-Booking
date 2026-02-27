import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

//API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try{
        const { data } = await axios.get("https://api.themoviedb.org/3/movie/now_playing", {
            headers: {
                Authorization : `Bearer ${process.env.TMDB_BEARER_TOKEN}`, 
                accept: "application/json",
            }
        });

        const movies = data.results;

        return res.status(200).json({
            success: true, 
            movies: movies
        });
    }

    catch(error){
        console.log(error);

        return res.status(500).json({
            success: false, 
            message: error.message
        });
    }
}


//API to add new show to the database
export const addShow = async (req, res) => {
    try{
        const { movieId, showsInput, showPrice } = req.body;

        if (!movieId || !Array.isArray(showsInput) || showsInput.length === 0 || !showPrice) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
            });
        }

        let movie = await Movie.findById(movieId);

        if(!movie){
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {
                        Authorization : `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
                        accept: "application/json",
                    }
                }), 

                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {
                        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}` , 
                        accept: "application/json",
                    }
                })
            ]);

            const movieAPIData = movieDetailsResponse.data;

            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieAPIData.title,
                overview: movieAPIData.overview,
                poster_path: movieAPIData.poster_path,
                backdrop_path: movieAPIData.backdrop_path,
                genres: movieAPIData.genres,
                casts: movieCreditsData.cast,
                release_date: movieAPIData.release_date,
                original_language: movieAPIData.original_language,
                tagline: movieAPIData.tagline || "",
                vote_average: movieAPIData.vote_average,
                runtime: movieAPIData.runtime,
            }

            //Add movie to the database
            movie = await Movie.create(movieDetails);
        }

        const showsToCreate = [];

        showsInput.forEach(show => {
            const showDate = show.date;
            show.time.forEach((time) => {
                const dateTimeString = `${showDate}T${time}:00`;

                showsToCreate.push({
                    movie: movieId, 
                    showDateTime: new Date(dateTimeString), 
                    showPrice, 
                    occupiedSeats: {}
                });
            });
        });

        const existingShow = await Show.findOne({
            movie: movieId,
            showDateTime: { $in: showsToCreate.map(s => s.showDateTime) }
        });

        if (existingShow) {
            return res.status(409).json({
                success: false,
                message: "Show already exists",
            });
        }

        if(showsToCreate.length > 0){
            await Show.insertMany(showsToCreate);
        }

        return res.status(201).json({
            success: true, 
            message: "Show added successfully!"
        });
    }

    catch(error){
        console.log(error.response?.data || error.message || error);

        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}


//API to get all shows from database
export const getAllShows = async (req, res) => {
    try{
        const shows = (await Show.find(
            {showDateTime: { $gte: new Date() }
        })
        .sort({ showDateTime: 1 })
        .populate('movie'))

        //filter unique shows 
        const uniqueMoviesMap = new Map();

        shows.forEach(show => {
            uniqueMoviesMap.set(show.movie._id.toString(), show.movie);
        });

        return res.status(200).json({
            success: true, 
            shows: Array.from(uniqueMoviesMap.values())
        });
    }

    catch(error){
        console.log(error.response?.data || error.message || error);

        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}


//API to get a single show from the database
export const getShow = async (req, res) => {
    try{
        const { movieId } = req.params;

        if (!movieId) {
            return res.status(400).json({
                success: false,
                message: "Movie ID is required"
            });
        }

        //get all upcoming shows for the movie
        const shows = await Show.find({
            movie: movieId,
            showDateTime: { $gte: new Date() }  
        })
        .sort({ showDateTime: 1 });

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
              success: false,
              message: "Movie not found"
            });
        }

        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString()
            .split("T")[0];

            if(!dateTime[date]){
                dateTime[date] = []
            }

            dateTime[date].push({
                time: show.showDateTime, 
                showId: show._id
            });
        });

        return res.status(200).json({
            success: true, 
            movie, 
            dateTime
        });
    }

    catch(error){
        console.log(error.response?.data || error.message || error);

        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}