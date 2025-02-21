import React, { useState, useEffect } from 'react';
import Door from '../components/Door';
import './SeventhGrid.css';
import { useMovieContext } from '../context/MovieContext';
import { FaFistRaised, FaHeart, FaLaugh, FaRocket, FaMask, FaHorse, FaMusic, FaHistory, FaChild, FaGhost, FaQuestion } from 'react-icons/fa';

// Mapping genres to icons
const genreIcons = {
  'action': FaFistRaised,
  'romance': FaHeart,
  'comedy': FaLaugh,
  'science fiction': FaRocket,
  'thriller': FaMask,
  'western': FaHorse,
  'music': FaMusic,
  'history': FaHistory,
  'family': FaChild,
  'horror': FaGhost,
  'adventure': FaRocket,
  'animation': FaChild,
  'crime': FaMask,
  'drama': FaMask,
  'fantasy': FaQuestion,
  'mystery': FaQuestion,
  'war': FaFistRaised,
  'tv movie': FaQuestion // Default for less specific genres
};

const SeventhGrid = () => {
  const { movies, currentIndex } = useMovieContext();
  const [currentGenreIndex, setCurrentGenreIndex] = useState(0);

  // Get genres from the current movie
  const currentMovie = movies && movies.length > 0 ? movies[currentIndex] : null;
  const genres = currentMovie?.genres || [];

  // Cycle through genres every 3 seconds
  useEffect(() => {
    if (genres.length > 1) {
      const interval = setInterval(() => {
        setCurrentGenreIndex((prevIndex) => (prevIndex + 1) % genres.length);
      }, 3000); // Switch every 3 seconds
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [genres]);

  // If no movie or genres, return just the Door
  if (!currentMovie || genres.length === 0) {
    return (
      <div className='w-full h-full relative flex items-center justify-center gc-6'>
        <Door />
      </div>
    );
  }

  const currentGenre = genres[currentGenreIndex];
  const GenreIcon = genreIcons[currentGenre] || FaQuestion; // Fallback to question mark icon

  return (
    <div className='w-full h-full relative flex items-center justify-center gc-6'>
      <div className='flex flex-col items-center space-y-2 absolute g7-main'>
        <div className='genre-display pulse-animation'>
          <GenreIcon className='genre-icon' size={30} />
          <span className='genre-text'>{currentGenre}</span>
        </div>
      </div>
      <Door />
    </div>
  );
};

export default SeventhGrid;