import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets.js';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import { timeFormat } from '../lib/timeFormat';
import DateSelect from '../components/DateSelect.jsx';
import MovieCard from '../components/MovieCard.jsx';
import Loading from '../components/Loading.jsx';

const MovieDetails = () => {

  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id);

    if(show){
      setShow({
        movie: show, 
        dateTime: dummyDateTimeData
      });
    }
  }

  useEffect(() => {
    getShow();
  }, [id]);

  return show ?  (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>

      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

        <img src={show.movie.poster_path} alt="" className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover' />

        <div className='relative flex flex-col items-start gap-3'>
          
          <p className='text-red-800 bg-blue-200 inline-block rounded px-3'>ENGLISH</p>

          <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>

          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-gray-200 fill-red-500' />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>

          <p className='text-gray-400 mt-2 text-sm max-w-xl'>
            {show.movie.overview}
          </p>

          <p>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map(genre => genre.name).join(", ")} • {show.movie.release_date.split("-")[0]}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>

            <button className='flex items-center gap-2 px-5 py-3 text-sm bg-gray-700 hover:bg-gray-800 transition rounded-md font-medium cursor-pointer active:scale-95'>

              <PlayCircleIcon className='w-5 h-5' />
              Watch Trailer</button>

            <a href="#dateSelect" className='px-6 py-3 text-sm bg-red-500 hover:bg-red-700 transition rounded-md font-medium cursor-pointer active:scale-95'> Buy Tickets</a>

            <button className='bg-green-500 p-2.5 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`w-5 h-5`} />
            </button>
          </div>

        </div>
      </div> 

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>

      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {dummyShowsData.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        )) }
      </div>

      <div className='flex justify-center mt-20'>

        <button 
          onClick={() => {navigate("/movies"); scrollTo(0, 0)}}
          className='px-5 py-3 bg-red-500 hover:bg-red-700 hover:scale-105 transition rounded-md font-medium cursor-pointer'>Show More</button>
      </div>

    </div>
  ) : (
    <Loading />
  )
}

export default MovieDetails