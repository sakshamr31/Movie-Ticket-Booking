import axios from "axios";

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