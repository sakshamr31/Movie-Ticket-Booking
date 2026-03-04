import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });


//Inngest Fn. to save user data to a database
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk' }, 
    { event: 'clerk/user.created'},

    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        const userData = {
            _id: id, 
            email: email_addresses[0].email_address, 
            name: first_name + ' ' + last_name, 
            image: image_url
        }

        await User.create(userData);
    }
); 


//Inngest Fn. to delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-with-clerk' }, 
    { event: 'clerk/user.deleted'},

    async ({ event }) => {
        const { id } = event.data;

        await User.findByIdAndDelete(id);
    }
);


//Inngest Fn. to update user in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk' }, 
    { event: 'clerk/user.updated'},

    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        const userData = { 
            email: email_addresses[0].email_address, 
            name: first_name + ' ' + last_name, 
            image: image_url
        }

        await User.findByIdAndUpdate(id, userData);
    }
);


//Inngest fn. to release seats and delete booking
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: 'release-seats-and-delete-booking' }, 
    { event: 'app/checkPayment'}, 

    async ({ event, step }) => {
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);

        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId);

            if(!booking || booking.isPaid){
                return;
            }

            const show = await Show.findById(booking.show);

            if(!show){
                return;
            }

            booking.bookedSeats.forEach(seat => {
                if(show.occupiedSeats[seat]){
                    delete show.occupiedSeats[seat];
                }
            });

            show.markModified('occupiedSeats');

            await show.save();
            await Booking.findByIdAndDelete(booking._id);
        });
    }
);


//inngest fn. to send a confirmation email
const sendBookingConfirmationEmail = inngest.createFunction(
    { id: 'send-booking-confirmation-email' }, 
    { event: 'app/show.Booked'}, 

    async ({ event, step}) => {
        const { bookingId } = event.data;

        const booking = await Booking.findById(bookingId).populate({
            path: 'show', 
            populate: {
                path: "movie", 
                model: "Movie"
            }
        }).populate('user');

        await sendEmail({
            to: booking.user.email, 
            subject: `Payment Confirmation: ${booking.show.movie.title} booked!`, 
            body: `<h2>Hi, ${booking.user.name}</h2>
            <br />
            <p>Your booking for ${booking.show.movie.title} is confirmed. </p>
            <br />
            <h3>Details are: </h3>
            <br />
            <p>Date: ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', {timeZone: 'Asia/Kolkata'})}
            <br />
            Time: ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Kolkata'})}</p>
            <br />
            <p>Enjoy the show!</p>`
        });
    }
);


// Create an empty array where we'll export future Inngest functions
export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation, 
    releaseSeatsAndDeleteBooking, 
    sendBookingConfirmationEmail 
];