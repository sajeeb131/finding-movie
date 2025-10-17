import React from 'react'
import Door from '../components/Door'
import './ThirdGrid.css'
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdOutlineMovieFilter } from "react-icons/md";
import { useMovieContext } from '../context/MovieContext';
import notFound from '../assets/not-found.jpg';

const ThirdGrid = () => {
  const { movies, setYoutube, currentIndex, setCurrentIndex } = useMovieContext();

  if (!movies || movies.length === 0) {
    return <Door />;
  }

  const currentMovie = movies[currentIndex];

  // Helper to extract YouTube video ID safely
  const extractVideoId = (trailerUrl) => {
    if (trailerUrl && trailerUrl.includes("v=")) {
      const parts = trailerUrl.split("v=");
      return parts[1] || null;
    }
    return null;
  };

  // Helper to update movie index and set YouTube video
  const updateMovieIndex = (direction) => {
    setCurrentIndex((prevIndex) => {
      const total = movies.length;
      const newIndex =
        direction === 'prev'
          ? prevIndex === 0 ? total - 1 : prevIndex - 1
          : prevIndex === total - 1 ? 0 : prevIndex + 1;
      const trailerUrl = movies[newIndex]?.trailerUrl;
      const videoId = extractVideoId(trailerUrl);
      setYoutube(videoId || null);
      return newIndex;
    });
  };

  return (
    <div className='w-full h-full g3-c'>
      <div className='w-full h-full flex flex-col gap-4 g3-main'>
        <div className='flex flex-row items-center justify-between gap-4 g3-upper'>
          <div className='flex flex-row items-center justify-between g3-upper-left'>
            <div className='flex flex-row gap-4 items-center'>               
              <MdOutlineMovieFilter size={25} />
              <span className='font-extra-small g3-upper-left-text'>
                {currentMovie.title}
              </span>
            </div>
            <img 
              src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632c8d7e710706a7d835765a_device-dots.png" 
              alt="" 
              width={60} 
              height={25}
            />
          </div>
          <div className='flex flex-row gap-3 g3-upper-right'>
            <button className='g3-arrow' onClick={() => updateMovieIndex('prev')}>
              <FaArrowLeft size={30} color='white'/>
            </button>
            <button className='g3-arrow' onClick={() => updateMovieIndex('next')}>
              <FaArrowRight size={30} />
            </button>
          </div>
        </div>

        <div className='g3-lower'>
          <section className='g3-tv'>
            <div className='g3-tv-display'>
              {/* Display the movie poster with fallback */}
              <img
                className="poster" 
                src={currentMovie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` 
                      : notFound} 
                alt={currentMovie.title} 
                width={300} 
                height={400}
              />
            </div>
          </section>
        </div>
      </div>
      {movies && <Door />}
    </div>
  );
};

export default ThirdGrid;
