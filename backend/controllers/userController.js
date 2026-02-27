import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

//API controller fn. to get user bookings
export const getUserBookings = async (req, res) => {
    try{
        const auth = req.auth?.();

        if(!auth || !auth.userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = auth.userId;

        const bookings = await Booking.find({ user })
        .populate({
            path: "show", 
            populate: { path: "movie" }
        })
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true, 
            bookings
        });
    }

    catch(error){
        console.error(error);

        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    } 
}


//API fn to update favourite movies in clerk user metadata
export const updateFavorite = async (req, res) => {
    try{
        const auth = req.auth?.();

        if(!auth || !auth.userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { movieId } = req.body;

        if(!movieId){ 
            return res.status(400).json({
                success: false, 
                message: "Movie ID is required"
            });
        }

        const userId = auth.userId; 

        const user = await clerkClient.users.getUser(userId);

        let favourites = user.privateMetadata?.favourites || [];

        if(favourites.includes(movieId)){
            favourites = favourites.filter((item) => item !== movieId);
        } 
        else {
            favourites.push(movieId);
        }

        await clerkClient.users.updateUserMetadata(
            userId, 
            { 
                privateMetadata: {
                    ...user.privateMetadata, 
                    favourites,
                } 
            }
        );

        return res.status(200).json({
            success: true, 
            message: "Updated movies in favourites"
        });
    }

    catch(error){
        console.error(error);

        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}


//Fn. to get the favourite movies
export const getFavourite = async (req, res) => {
    try{
        const auth = req.auth?.();

        if(!auth || !auth.userId){
            return res.status(401).json({
                success: false, 
                message: "Unauthorized"
            });
        }

        const favourites = user.privateMetadata?.favourites || [];

        if(favourites.length === 0){
            return res.status(200).json({
                success: true, 
                movies
            });
        }

        //getting movies from database
        const movies = await Movie.find({
            _id: { $in: favourites }
        });

        return res.status(200).json({
            success: true, 
            movies
        });
    }

    catch(error){
        console.error(error);

        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}