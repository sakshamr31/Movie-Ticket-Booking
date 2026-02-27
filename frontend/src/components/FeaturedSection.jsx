import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
// import { dummyShowsData } from '../assets/assets.js';
import MovieCard from './MovieCard.jsx';
import { useAppContext } from '../context/AppContext.jsx';

const FeaturedSection = () => {

    const navigate = useNavigate();
    const { shows } = useAppContext();

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>

        <div className='relative flex items-center justify-between pt-20 pb-10'>

            <p className='text-gray-200 font-medium text-lg'>Now Showing</p>

            <button 
                onClick={() => navigate("/movies")} className='group flex items-center gap-2 text-sm text-gray-200 cursor-pointer hover:text-gray-300 hover:scale-105'>
                View All 
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4 h-4' />
            </button>
        </div>

        <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
            {shows.slice(0, 4).map((show) => (
                <MovieCard key={show._id} movie={show} />
            ))}
        </div>

        <div className='flex justify-center mt-20'>

            <button 
                onClick={() => { navigate("/movies")} }
                className='px-6 py-3 text-md text-gray-100 bg-linear-to-r from-red-500 to-red-800 hover:opacity-90 hover:scale-105 transition rounded-lg font-medium mb-3 cursor-pointer'>Show More</button>
        </div>

    </div>
  )
}

export default FeaturedSection