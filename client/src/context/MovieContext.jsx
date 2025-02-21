import { createContext, useContext, useState } from "react";

// Create context
const MovieContext = createContext();

// provider component
export const MovieProvider = ({children}) =>{
    const [movies, setMovies] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0)
    const [yt, setYoutube] = useState(null)
    return (
        <MovieContext.Provider value = {{movies, setMovies, yt, setYoutube, currentIndex, setCurrentIndex}}>
            {children}
        </MovieContext.Provider>
    )
}

export const useMovieContext = () => useContext(MovieContext);