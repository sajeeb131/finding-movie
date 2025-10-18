import React, { useState, useEffect, useRef } from 'react';
import Door from '../components/Door';
import { FaStar } from "react-icons/fa";
import { useMovieContext } from '../context/MovieContext';
import './SecondGrid.css'
const SecondGrid = () => {
  const { movies, currentIndex, registerDoorRef } = useMovieContext();
  const doorRef = useRef(null);
  
  // Register door ref with context
  React.useEffect(() => {
    registerDoorRef('secondGrid', doorRef);
  }, [registerDoorRef]);
  
  // Ensure movies exists and has elements before calculating
  const calculatedRating = movies && movies.length > 0
    ? Math.round(movies[currentIndex].vote_average / 2)
    : 0;
  const [rating, setRating] = useState(calculatedRating);

  // Update rating when movies or currentIndex changes
  useEffect(() => {
    if (movies && movies.length > 0 && movies[currentIndex]?.vote_average) {
      setRating(Math.round(movies[currentIndex].vote_average / 2));
    }
  }, [movies, currentIndex]); // Added currentIndex as dependency

  return (
    <div className='w-full h-full relative flex items-center justify-center gc-6'>
      <div className="flex flex-col items-center space-y-2 absolute g6-main">
        {/* Star Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, index) => {
            const starRating = index + 1;
            return (
              <FaStar
                key={starRating}
                className={`${
                  starRating <= rating ? "text-yellow-400" : "text-gray-300"
                }`}
                size={34}
              />
            );
          })}
        </div>
        
        {/* Vote Count */}
        {movies && movies.length > 0 && movies[currentIndex]?.vote_count && (
          <div className="text-gray-600 text-sm">
            {movies[currentIndex].vote_count.toLocaleString()} votes
          </div>
        )}
      </div>
      <Door ref={doorRef} />
    </div>
  );
};

export default SecondGrid;