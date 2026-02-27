import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// import { dummyDateTimeData, dummyShowsData } from '../assets/assets.js';
import Loading from '../components/Loading.jsx';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import { isoTimeFormat } from '../lib/isoTimeFormat.js';
import { assets } from '../assets/assets.js';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext.jsx';

const SeatLayout = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const { id, date } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const navigate = useNavigate();

  const { axios, getToken, user } = useAppContext();

  const getShow = async () => {
    try{
      const { data } = await axios.get(`/api/show/${id}`);

      if(data.success){
        setShow(data.show);
      }
    }

    catch(error){
      console.error(error.response?.data || error.message);
    }
  }

  const handleSeatClick = (seatId) => {
    if(!selectedTime){
      return toast.error("Please select time first");
    }

    if(!selectedSeats.includes(seatId) && selectedSeats.length > 4){
      return toast("You can only select upto 5 seats");
    }

    if(occupiedSeats.includes(seatId)){
      return toast("This seat is already booked.");
    }

    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId]);
  }

  const renderSeats = (row, count = 9) => (

    <div key={row} className="flex gap-2 mt-2">

      <div className="flex flex-wrap items-center justify-center gap-2">

        {Array.from({ length: count }, (_, i) => {

          const seatId = `${row}${i + 1}`;
          return (
            <button
              key={seatId}
              disabled={occupiedSeats.includes(seatId)}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded border border-gray-200 cursor-pointer ${
                selectedSeats.includes(seatId) && "bg-green-500 text-white" } ${occupiedSeats.includes(seatId) && "opacity-50 cursor-not-allowed"}` }>
              {seatId}
            </button>
          );
        })}

      </div>
    </div>
  );

  const getOccupiedSeats = async () => {
    try{
      const { data } = await axios.get(`/api/bookings/seats/${selectedTime.showId}`);

      if(data.success){
        setOccupiedSeats(data.occupiedSeats);
      }

      else{
        toast.error(data.message);
      }
    }

    catch(error){
      console.error(error.response?.data || error.message);
    }
  }

  const bookTickets = async () => {
    try{
      if(!user){
        return toast.error("Please login to proceed");
      }

      if(!selectedTime || !selectedSeats.length){
        return toast.error("Please select time and seat");                 
      } 

      const token = await getToken();
      
      const { data } = await axios.post("/api/booking/create", {showId: 
        selectedTime.showId, selectedSeats
      }, {
        headers: {
        Authorization: `Bearer ${ token }` }
      });

      if(data.success){
        window.location.href = data.url;
      }

      else{
        toast.error(data.message);
      }
    }

    catch(error){
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getShow()
  }, [id]);

  useEffect(() => {
    if(selectedTime){
      setSelectedSeats([]);
      getOccupiedSeats();
    }
  }, [selectedTime]);

  return show ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-28 md:pt-40'>

      {/* Available Timings */}
      <div className='w-60 bg-red-300/30 border border-red-200 rounded-lg py-8 h-max md:sticky md:top-30'>

        <p className='text-lg font-semibold px-5'>Available Timings</p>

        <div className='mt-5 space-y-1'>

          {show.dateTime[date]?.map((item, index) => (

            <div key={item.time} onClick={() => setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-red-400 text-white" : "hover:bg-gray-500"}` }>

              <ClockIcon className='w-4 h-4' />
              <p className='text-sm'>{isoTimeFormat(item.time)}</p>
            </div>
          )) }

        </div>
      </div>

      {/* Seat Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>

        <h1 className='text-2xl font-semibold mb-4'>Select your seats</h1>

        <img src={assets.screenImage} alt="screen"  />

        <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

        <div className='flex flex-col items-center mt-10 text-xs text-gray-200'>

          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {groupRows[0].map(row => renderSeats(row))}
          </div>

          <div className='grid grid-cols-2 gap-11'>
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx}>
                {group.map(row => renderSeats(row))}
              </div>
            )) }
          </div>
        </div>

        <button onClick={bookTickets} className='flex items-center gap-1 mt-20 px-8 py-3 text-sm bg-red-500 hover:bg-red-600 hover:opacity-90 hover:scale-105 transition rounded-full font-medium cursor-pointer active:scale-95'>
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
        </button>

      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout