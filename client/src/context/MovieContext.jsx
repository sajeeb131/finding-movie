import { createContext, useContext, useState } from "react";

// Create context
const MovieContext = createContext();

// Provider component
export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [yt, setYoutube] = useState(null);
  const [gameStarted, setGameStarted] = useState(false); // new state

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
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovieContext = () => useContext(MovieContext);