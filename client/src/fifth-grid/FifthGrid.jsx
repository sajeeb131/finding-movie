import React from 'react'
import { MdOutlineMovieFilter } from "react-icons/md";
import Door from '../components/Door';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import movie from '../assets/movie.jpeg'
import './FifthGrid.css'
import { useMovieContext } from '../context/MovieContext';

const FifthGrid = () => {
  const {movies, yt} = useMovieContext()
  return (
    <div className='w-full h-full g3-c'>
        <div className='w-full h-full flex flex-col gap-4 g3-main g5-main'>
            <div className='flex flex-row items-center justify-between gap-4 g3-upper'>
              <div className='flex flex-row items-center justify-between g5-upper-left'>
                <div className='flex flex-row gap-4 items-start'>               
                  <MdOutlineMovieFilter size={25}/>
                  <span className='font-small g3-upper-left-text'>Trailer</span>
                </div>
                <img src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632c8d7e710706a7d835765a_device-dots.png" alt="" width={60} height={25}/>
              </div>
            </div>

            <div className='h-full g3-lower'>
              <section className='h-full g3-tv'>
                <div className='h-full g3-tv-display'>
                  {/* movie here */}
                  {yt && (
                    <iframe
                      className="trailer-iframe"
                      src={`https://www.youtube.com/embed/${yt}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen>
                    </iframe>
                  )}
                  {!yt && (
                    <div className="flex items-center justify-center h-full text-white">
                      <p>No trailer available</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
        </div>
        <Door/>

    </div>
  )
}

export default FifthGrid;