import React from 'react';
import Door from '../components/Door';
import { useMovieContext } from '../context/MovieContext';
import './FourthGrid.css';

const FourthGrid = () => {
  const { movies, currentIndex } = useMovieContext();

  if (!movies || movies.length === 0) {
    return <Door />;
  }

  const currentMovie = movies[currentIndex];
  const description = currentMovie.overview || 'No description available';

  return (
    <div className="w-full h-full relative flex items-center justify-center gc-6">
      <div className="flex flex-col items-center space-y-2 px-4 absolute g6-main">
        {/* <h2 className="text-xl font-bold text-white mb-2">{currentMovie.title}</h2> */}
        <div className="description-container text-white text-justify px-10 max-h-[140px] overflow-y-auto">
          <p className="transition-all duration-300">
            {description}
          </p>
        </div>
      </div>
      <Door />
    </div>
  );
};

export default FourthGrid;
