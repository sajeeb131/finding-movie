import React, { useState, useEffect, useRef } from 'react';
import './FirstGrid.scss';
import avatarIdle from '../assets/avatar-idle.png';
import avatarLookingDown from '../assets/looking-down.png';
import avatarLookingRight from '../assets/looking-right.png';
import typingSound from '/audio/type.wav';
import buttonSound from '/audio/button.mp3';
import { API_URI } from '../utils/api';
import { useMovieContext } from '../context/MovieContext';

const FirstGrid = () => {
  // Access context including the new gameStarted state setter
  const { setMovies, setYoutube, setGameStarted } = useMovieContext();

  // Slider and backend states
  const [position, setPosition] = useState(0);
  const [isPressed, setIsPressed] = useState(false);
  const [buttonText, setButtonText] = useState("START");
  const [movieData, setMovieData] = useState(null);
  const [error, setError] = useState("");

  const sliderRef = useRef(null);
  const buttonRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startLeft = useRef(0);
  const hasPlayedEndSound = useRef(false);

  // Text animation state
  const [text, setText] = useState("");
  const [animatedText, setAnimatedText] = useState("");

  // Avatar image state
  const [avatarImage, setAvatarImage] = useState(avatarIdle);
  const resetAvatarTimer = useRef(null);

  // Update animated text and play typing sound as user types.
  useEffect(() => {
    if (text.length > animatedText.length) {
      const newChar = text.slice(animatedText.length);
      setAnimatedText((prev) => prev + newChar);
      playTypingSound();
    } else if (text.length < animatedText.length) {
      setAnimatedText(text);
    }
  }, [text, animatedText]);

  const playTypingSound = () => {
    const audio = new Audio(typingSound);
    audio.volume = 0.2;
    audio.play();
  };

  const playButtonSound = () => {
    const audio = new Audio(buttonSound);
    audio.volume = 0.5;
    audio.play();
  };

  // When user types, show lookingDown avatar. Revert to idle after inactivity.
  const handleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 160) {
      setText(inputValue);
      if (inputValue.trim() !== "") {
        setError("");
        clearTimeout(resetAvatarTimer.current);
        setAvatarImage(avatarLookingDown);
        resetAvatarTimer.current = setTimeout(() => {
          setAvatarImage(avatarIdle);
        }, 1500);
      } else {
        setAvatarImage(avatarIdle);
      }
    }
  };

  const handleBlur = () => {
    clearTimeout(resetAvatarTimer.current);
    setAvatarImage(avatarIdle);
    if (text.trim() === "") {
      setError("Write something first..");
    }
  };

  const handleFocus = () => {
    // Optional: adjust avatar on focus if needed.
  };

  // Fetch movie data from the backend
  const fetchMovieData = async () => {
    try {
      const response = await fetch(`${API_URI}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMovies(data.movies);
      // Extract video id safely (assumes trailerUrl exists and has "v=")
      const videoId = data.movies[0]?.trailerUrl.split("v=")[1];
      setYoutube(videoId);
    } catch (error) {
      console.error("Error fetching movie data:", error);
    }
  };

  // Reset slider, local states, and context states so the doors lock again.
  const handleReset = () => {
    setPosition(0);
    setButtonText("START");
    setAvatarImage(avatarIdle);
    setMovieData(null);
    setText("");
    setAnimatedText("");
    setError("");
    // Reset context states to clear movies and YouTube video
    setMovies(null);
    setYoutube(null);
    // Reset gameStarted to false so doors are locked again.
    setGameStarted(false);
  };

  // Slider event handlers
  const handleMouseDown = async (e) => {
    if (buttonText === "RESET") {
      handleReset();
      return;
    }
  
    if (text.trim() === "") {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        const speakText = () => {
          const utterance = new SpeechSynthesisUtterance("teri ma ki chut");
          utterance.pitch = 1.3; 
          utterance.rate = 1.05; 
          const voices = window.speechSynthesis.getVoices();
          utterance.voice = voices.find(voice => voice.name.includes("Google UK English Female")) || voices[0];
          window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            speakText(); 
          };
        } else {
          speakText(); 
        }
      } else {
        console.log("Sorry, your browser does not support text to speech!");
      }
      return;
    }

    isDragging.current = true;
    setIsPressed(true);
    startX.current = e.clientX;
    startLeft.current = position;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    sliderRef.current.classList.add("animating");
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    requestAnimationFrame(() => {
      const sliderWidth = sliderRef.current.offsetWidth;
      const buttonWidth = buttonRef.current.offsetWidth;
      let newPosition = startLeft.current + (e.clientX - startX.current);
      if (newPosition < 0) newPosition = 0;
      if (newPosition > sliderWidth - buttonWidth) newPosition = sliderWidth - buttonWidth;
      // When slider reaches half width, complete the action
      if (newPosition >= sliderWidth / 2 && buttonText === "START") {
        newPosition = sliderWidth - buttonWidth;
        setPosition(newPosition);
        setAvatarImage(avatarLookingRight);
        setButtonText("RESET");
        if (!hasPlayedEndSound.current) {
          playButtonSound();
          hasPlayedEndSound.current = true;
        }
        isDragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        sliderRef.current.classList.remove("animating");
        // Start the game: allow doors to unlock and fetch movie data
        setGameStarted(true);
        fetchMovieData();
      } else {
        if (newPosition < sliderWidth - buttonWidth) {
          hasPlayedEndSound.current = false;
        }
        setPosition(newPosition);
      }
    });
  };

  const handleMouseUp = () => {
    if (buttonText !== "RESET") {
      setPosition(0);
    }
    isDragging.current = false;
    setIsPressed(false);
    if (buttonText !== "RESET") {
      hasPlayedEndSound.current = false;
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    sliderRef.current.classList.remove("animating");
  };

  return (
    <div className='flex flex-col justifiy-center bg-[var(--blue)] grid-child'>
      <header className='flex flex-row items-center justify-between p-10 g1-header'>
        <div className='flex flex-row items-center gap-4'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="1.55em" viewBox="0 0 35 24" width="2.39em">
            <g fill="CurrentColor">
              <rect height="6.67978" rx="3.33989" transform="matrix(0 1 -1 0 7.546878 -5.812502)" width="22.2659" x="6.67969" y=".867188"></rect>
              <rect height="6.67978" rx="3.33989" transform="matrix(0 1 -1 0 16.812488 -15.078112)" width="13.1369" x="15.9453" y=".867188"></rect>
              <rect height="6.67978" rx="3.33989" transform="matrix(0 1 -1 0 26.078088 -24.343712)" width="22.2659" x="25.2109" y=".867188"></rect>
              <rect height="6.67978" rx="3.33989" transform="matrix(0 1 -1 0 44.47269 -24.48051)" width="13.1369" x="34.4766" y="9.99609"></rect>
            </g>
          </svg>
          <h5 className='font-medium'>fINDING-MOVIE</h5>
        </div>
        <img 
          src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632c8d7e710706a7d835765a_device-dots.png" 
          alt="" 
          width={100} 
          height={25}
        />
      </header>

      <section className='flex flex-col items-center gap-6 p-10 g1-mid'>
        <div className='h-[40vh] bg-[var(--black)] g1-mid-tv'>
          <div className='flex items-center justify-center g1-mid-tv-display' style={{ position: 'relative' }}>
            <img 
              src={avatarImage} 
              alt="Avatar" 
              width={380} 
              height={380}
              className='absolute z-10'
              style={{ transition: 'all 0.3s ease' }}
            />
            {error && (
              <div className="cloud-bubble">
                <p className="cloud-text">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className='flex justify-center items-center h-[15vh] bg-[var(--dark-blue)] g1-mid-button'>
          <div className='flex flex-row button-slider' ref={sliderRef}>
            <div className='flex flex-row slider-images'>
              <img 
                src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632d71d15867f648fad21525_bg-slider.png" 
                height={20} 
                className='btn-slider-img'
              />
              <img 
                src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632d71d15867f648fad21525_bg-slider.png" 
                height={20} 
                className='btn-slider-img'
              />
              <img 
                src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632d71d15867f648fad21525_bg-slider.png" 
                height={20} 
                className='btn-slider-img'
              />
            </div>
            <button
              className={`btn-main ${isPressed ? 'btn-pressed' : ''}`}
              ref={buttonRef}
              style={{ left: `${position}px` }}
              onMouseDown={handleMouseDown}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </section>

      <div className="g1-btm">
        <div className="prompt-area-container">
          <div className="prompt-area">
            {animatedText.split("").map((char, index) => (
              <span key={index} className="animated-char">{char}</span>
            ))}
            <span className="cursor">|</span>
          </div>
          <textarea
            className="hidden-textarea"
            value={text}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default FirstGrid;
