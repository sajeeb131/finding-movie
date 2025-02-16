import React, { useState } from 'react'
import Door from '../components/Door'
import './ThirdGrid.css'
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdOutlineMovieFilter } from "react-icons/md";
import { useMovieContext } from '../context/MovieContext';

const ThirdGrid = () => {
  const { movies, setYoutube } = useMovieContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Check if movies are available
  if (!movies || movies.length === 0) {
    return <Door></Door>;  // Show loading state if no movies are present
  }

  const currentMovie = movies[currentIndex];

  const handlePrevMovie = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? movies.length - 1 : prevIndex - 1;
      const videoId = movies[newIndex]?.trailerUrl.split("v=")[1];  
      setYoutube(videoId);
      return newIndex;
    });
  };
  
  const handleNextMovie = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === movies.length - 1 ? 0 : prevIndex + 1;
      const videoId = movies[newIndex]?.trailerUrl.split("v=")[1];  
      setYoutube(videoId);
      return newIndex;
    });
  };
  return (
    <div className='w-full h-full g3-c'>
      <div className='w-full h-full flex flex-col gap-4 g3-main'>
        <div className='flex flex-row items-center justify-between gap-4 g3-upper'>
          <div className='flex flex-row items-center justify-between g3-upper-left'>
            <div className='flex flex-row gap-4 items-start'>               
              <MdOutlineMovieFilter size={25}/>
              <span className='font-extra-small g3-upper-left-text' >{currentMovie.title}</span>
            </div>
            <img className="" src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632c8d7e710706a7d835765a_device-dots.png" alt="" width={60} height={25}/>
          </div>
          <div className='flex flex-row gap-3 g3-upper-right'>
            <button className='g3-arrow' onClick={handlePrevMovie}>
              <FaArrowLeft size={30} color='white'/>
            </button>
            <button className='g3-arrow' onClick={handleNextMovie}>
              <FaArrowRight size={30} />
            </button>
          </div>
        </div>

        <div className='g3-lower'>
          <section className='g3-tv'>
            <div className='g3-tv-display'>
              {/* Display the movie poster */}
              <img
              className="poster" 
                src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`} 
                alt={currentMovie.title} 
                width={300} 
                height={400}
              />
            </div>
          </section>
        </div>
      </div>
      {movies && <Door></Door>}
    </div>
  );
};

export default ThirdGrid;
