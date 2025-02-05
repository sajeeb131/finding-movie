import React, { useState } from 'react'
import Door from '../components/Door'
import './ThirdGrid.css'
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import { MdOutlineMovieFilter } from "react-icons/md";
import movie from '../assets/movie.jpeg'
const ThirdGrid = () => {
  
  return (
    <div className=' w-full h-full g3-c' >
        <Door/>
        <div className='w-full h-full flex flex-col gap-4 g3-main'>
            <div className='flex flex-row items-center justify-between gap-4 g3-upper'>
              <div className='flex flex-row items-center justify-between g3-upper-left'>
                <div className='flex flex-row gap-4 items-start'>               
                  <MdOutlineMovieFilter size={25}/>
                  <span className='font-small g3-upper-left-text'>Shawshank Redemption</span>
                </div>
                <img src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632c8d7e710706a7d835765a_device-dots.png" alt="" width={60} height={25}/>
              </div>
              <div className='flex flex-row gap-3 g3-upper-right'>
                <button className='g3-arrow'>
                  <FaArrowLeft size={30} color='white'/>
                </button>
                <button className='g3-arrow'>
                  <FaArrowRight size={30}/>
                </button>

              </div>
            </div>

            <div className='g3-lower'>
              <section className='g3-tv'>
                <div className='g3-tv-display'>
                  <img src={movie} alt="" width="" height=""/>
                </div>
              </section>
            </div>
        </div>
        
    </div>
  )
  
}

export default ThirdGrid