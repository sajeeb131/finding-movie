import { useState } from 'react'
import { MovieProvider } from './context/MovieContext'
import './App.css'
import GridLayout from './GridLayout/GridLayout'
import AnimatedBackground from './components/AnimatedBackground/AnimatedBackground'


function App() {
  return (
    <>
    <AnimatedBackground />
    <MovieProvider>
      <GridLayout />
    </MovieProvider>
    </>
  )
}

export default App
