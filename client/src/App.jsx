import { useState } from 'react'
import { MovieProvider } from './context/MovieContext'
import './App.css'
import GridLayout from './GridLayout/GridLayout'


function App() {
  return (
    <>
    <MovieProvider>
      <GridLayout />
    </MovieProvider>
    </>
  )
}

export default App
