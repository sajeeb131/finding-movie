import React from 'react'
import Door from '../components/Door'
import { useMovieContext } from '../context/MovieContext'

const SecondGrid = () => {
  const {movies} = useMovieContext()
  return (
    <div className='w-full h-full gc-2'>
      <Door />
      {console.log(movies)}
    </div>
  )
}

export default SecondGrid
