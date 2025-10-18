import React, { useState } from 'react';
import Door from '../components/Door';
import { useMovieContext } from '../context/MovieContext';
import './SixthGrid.css';
import actorAvatar from '../assets/actor.avif';

const SixthGrid = () => {
  const { movies, currentIndex } = useMovieContext();
  const [selectedActor, setSelectedActor] = useState(null);

  if (!movies || movies.length === 0) {
    return <Door />;
  }

  const currentMovie = movies[currentIndex];
  const actors = currentMovie.actors || [];

  const handleActorClick = (actor) => {
    setSelectedActor(actor);
  };

  const handleCloseModal = () => {
    setSelectedActor(null);
  };

  return (
    <div className='w-full h-full relative flex items-center justify-center gc-6'>
      <div className="flex flex-col items-center space-y-2 absolute g6-main">
        <div className="flex overflow-x-auto justify-start gap-6 actor-container scrollbar-hide">
          {actors.slice(0, 12).map((actor, index) => (
            <div
              key={actor.id || index}
              className="flex flex-col items-center max-w-[80px] sm:max-w-[70px] md:max-w-[75px] lg:max-w-[80px] xl:max-w-[85px] cursor-pointer"
              onClick={() => handleActorClick(actor)}
            >
              <img
                src={
                  actor.profile_path
                    ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                    : actorAvatar
                }
                alt={actor.name}
                className="w-16 h-16 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-20 xl:h-20 rounded-full object-cover border-2 border-gray-500 actor-avatar"
              />
            </div>
          ))}
          {actors.length === 0 && (
            <div className="text-center w-full text-white">No actors available</div>
          )}
        </div>
      </div>
      <Door />

      {selectedActor && (
        <div 
          className="modal-overlay" 
          onClick={handleCloseModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={
                selectedActor.profile_path 
                  ? `https://image.tmdb.org/t/p/w500${selectedActor.profile_path}`
                  : actorAvatar
              }
              alt={selectedActor.name}
              className="modal-image"
            />
            <button 
              className="modal-close-button" 
              onClick={handleCloseModal}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SixthGrid;
