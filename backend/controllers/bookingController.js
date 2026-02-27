import Booking from "../models/Booking.js";
import Show from "../models/Show.js"; 
import stripe from "stripe";

//Fn. to check availability of selected seats for a movie
export const checkSeatsAvailability = async (showId, selectedSeats) => {
    try{
        if (!showId || !Array.isArray(selectedSeats) || selectedSeats.length === 0){
            return false;
        }

        const showData = await Show.findById(showId);

        if(!showData){
            return false;
        }

        const occupiedSeats = showData.occupiedSeats || {};

        const isAnySeatTaken = selectedSeats.some(
            (seat) => occupiedSeats[seat]
        );

        return !isAnySeatTaken;
    }

    catch(error){
        console.log(error.message || error);
        return false;
    }
}


//Fn. to create a booking
export const createBooking = async (req, res) => {
    try{
        const auth = req.auth?.();

        if (!auth || !auth.userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { userId } = auth;
        const { showId, selectedSeats } = req.body;

        if (!showId || !Array.isArray(selectedSeats) || selectedSeats.length === 0 || selectedSeats.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking data (Max 5 seats allowed)",
            });
        }

        const { origin } = req.headers;

        //check if seat is available for selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats);

        if(!isAvailable){
            return res.status(409).json({
                success: false, 
                message: "Selected seats are not available."
            });
        }

        //get show details
        const showData = await Show.findById(showId)
        .populate("movie");

        if (!showData) {
            return res.status(404).json({
                success: false,
                message: "Show not found",
            });
        }

        if(!showData.occupiedSeats){
            showData.occupiedSeats = {};
        }

        //lock seats
        selectedSeats.forEach((seat) => {
            showData.occupiedSeats[seat] = userId;
        });

        showData.markModified("occupiedSeats");

        await showData.save()

        //create a new booking
        const booking = await Booking.create({
            user: userId, 
            show: showId, 
            amount: showData.showPrice * selectedSeats.length, 
            bookedSeats: selectedSeats, 
            isPaid: false, 
            paymentStatus: "pending"
        });

        //stripe gateway initialization
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //creating line items for stripe
        const line_items = [{
            price_data: {
                currency: 'usd', 
                product_data: {
                    name: showData.movie.title
                }, 
                unit_amount: Math.round(booking.amount * 100)
            }, 
            quantity: 1
        }];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`, 
            cancel_url: `${origin}/my-bookings`, 
            line_items: line_items, 
            mode: 'payment', 
            metadata: {
                bookingId: booking._id.toString()
            }, 
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,        //expires in 30 mins
        });

        booking.paymentLink = session.url
        await booking.save();

        return res.status(201).json({
            success: true, 
            booking, 
            url: session.url
        });
    }

    catch(error){
        console.log("Booking error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}


//Fn. to get the occupied seats
export const getOccupiedSeats = async (req, res) => {
    try{
        const { showId } = req.params;

        if(!showId){
            return res.status(400).json({
                success: false,
                message: "Show ID is required",
            });
        }

        const showData = await Show.findById(showId);

        if(!showData){
            return res.status(404).json({
                success: false, 
                message: "Show not found"
            });
        }

        const occupiedSeats = Object.keys(showData.occupiedSeats);

        return res.status(200).json({
            success: true, 
            occupiedSeats
        });
    }

    catch(error){
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}