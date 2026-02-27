import React from 'react'
// import { dummyShowsData } from '../assets/assets.js'
import MovieCard from '../components/MovieCard.jsx';
import { useAppContext } from '../context/AppContext.jsx';

const Favourite = () => {

  const { favouriteMovies } = useAppContext();

  return favouriteMovies?.length > 0 ?  (
    <div className='relative my-28 mb-40 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>

      <h1 className='text-lg font-medium my-5 text-cyan-700 bg-green-100 rounded-lg px-4 py-1 inline-block'>Your Favourite Movies</h1>

      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {favouriteMovies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        )) }
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>

      <h1 className='text-3xl font-bold text-center'>You haven’t added any favourite movies yet.</h1>
    </div>
  )
}

export default Favourite