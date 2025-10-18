import { createContext, useContext, useState } from "react";

// Create context
const MovieContext = createContext();

// Provider component
export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [yt, setYoutube] = useState(null);
  const [gameStarted, setGameStarted] = useState(false); // new state
  const [doorRefs, setDoorRefs] = useState({}); // Store door refs

  // Function to register a door ref
  const registerDoorRef = (name, ref) => {
    setDoorRefs(prev => ({ ...prev, [name]: ref }));
  };

  // Function to reset all doors
  const resetAllDoors = () => {
    Object.values(doorRefs).forEach(ref => {
      if (ref && ref.current && ref.current.reset) {
        ref.current.reset();
      }
    });
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        setMovies,
        yt,
        setYoutube,
        currentIndex,
        setCurrentIndex,
        gameStarted,
        setGameStarted, // expose the updater
        registerDoorRef,
        resetAllDoors,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => useContext(MovieContext);