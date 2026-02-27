import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(null);
    const [shows, setShows] = useState([]);
    const [favouriteMovies, setFavouriteMovies] = useState([]);

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    const { user } = useUser();
    const { getToken } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // fetch admin status of logged-in user
    const fetchIsAdmin = async () => {
        try{
            const token = await getToken();

            if(!token){
                return;
            }

            const { data } = await axios.get("/api/admin/is-admin", {
                headers: {
                    Authorization: `Bearer ${ token }` 
                }
            });

            setIsAdmin(data.isAdmin);

            if(!data.isAdmin && location.pathname.startsWith("/admin")){
                navigate("/");
                toast.error("Unauthorized to access admin dashboard");
            }
        }

        catch(error){
            console.log(error);
        }
    }


    //fetch all available movie shows
    const fetchShows = async () => {
        try{
            const { data } = await axios.get("/api/show/all"); 

            if(data.success){
                setShows(data.shows);
            }
            else{
                toast.error(data.message);
            }
        }

        catch(error){
            console.error(error);
        }
    }


    // fetch favourite movies of the logged-in user
    const fetchFavouriteMovies = async () => {
        try{
            const token = await getToken();

            if(!token){
                return;
            }

            const { data } = await axios.get("/api/user/favourites", {
                headers: {
                    Authorization: `Bearer ${ token }` 
                }
            });

            if(data.success){
                setFavouriteMovies(data.movies);
            }
            else{
                toast.error(data.message);
            }
        }

        catch(error){
            console.error(error);
        }
    }

    useEffect(() => {
        fetchShows();
    }, []);

    useEffect(() => {
        if(user){
            fetchIsAdmin();
            fetchFavouriteMovies();
        }
    }, [user]);

    const value = {
        axios, user, 
        navigate, getToken,
        isAdmin, setIsAdmin, 
        shows, setShows, 
        favouriteMovies, setFavouriteMovies, 
        fetchIsAdmin, fetchFavouriteMovies, 
        image_base_url
    };

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext);