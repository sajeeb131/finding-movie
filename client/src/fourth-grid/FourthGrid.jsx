import React, { useState } from 'react';
import Door from '../components/Door';
import { useMovieContext } from '../context/MovieContext';
import './FourthGrid.css';

const FourthGrid = () => {
  const { movies, currentIndex } = useMovieContext();
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (!movies || movies.length === 0) {
    return <Door />;
  }

  const currentMovie = movies[currentIndex];
  const description = currentMovie.overview || 'No description available';

  const toggleDescription = () => setShowFullDescription(!showFullDescription);

  return (
    <div className='w-full h-full relative flex items-center justify-center gc-4'>
      <div className='flex flex-col items-center space-y-2 absolute g4-main'>
        <h2 className='text-xl font-bold text-white mb-2'>{currentMovie.title}</h2>
        <div className='description-container text-white text-center px-4'>
          <p className={`transition-all duration-300 ${showFullDescription ? 'max-h-[500px]' : 'max-h-[100px] overflow-hidden'}`}>
            {description}
          </p>
          {description.length > 150 && (
            <button className='text-blue-400 mt-2 hover:text-blue-200' onClick={toggleDescription}>
              {showFullDescription ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>
      <Door />
    </div>
  );
};

export default FourthGrid;
