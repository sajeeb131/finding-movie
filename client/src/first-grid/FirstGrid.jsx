import React, { useState, useRef } from 'react';
import './FirstGrid.css';
import avatar from '../assets/avatar.png';

const FirstGrid = () => {
  const [position, setPosition] = useState(0); // Button position (left offset)
  const [isPressed, setIsPressed] = useState(false); // Track button press state
  const sliderRef = useRef(null);
  const buttonRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startLeft = useRef(0);

  // Handle mouse down event (button press)
  const handleMouseDown = (e) => {
    isDragging.current = true;
    setIsPressed(true);
    startX.current = e.clientX;
    startLeft.current = position;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    
    // Start image animation when button is pressed
    sliderRef.current.classList.add("animating");
  };

  // Handle mouse move event (dragging)
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    requestAnimationFrame(() => {
      const sliderWidth = sliderRef.current.offsetWidth;
      const buttonWidth = buttonRef.current.offsetWidth;
      let newPosition = startLeft.current + (e.clientX - startX.current);

      // Prevent button from going out of bounds
      if (newPosition < 0) newPosition = 0;
      if (newPosition > sliderWidth - buttonWidth) newPosition = sliderWidth - buttonWidth;

      setPosition(newPosition);
    });
  };

  // Handle mouse up event (button release)
  const handleMouseUp = () => {
    isDragging.current = false;
    setIsPressed(false);
    setPosition(0)
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    // Stop image animation when button is released
    sliderRef.current.classList.remove("animating");
  };

  return (
    <div className='flex flex-col bg-[var(--blue)] grid-child'>
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

        <img src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632c8d7e710706a7d835765a_device-dots.png" alt="" width={100} height={25}/>
      </header>

      <section className='flex flex-col items-center gap-6 p-10 g1-mid'>
        <div className='h-[40vh] bg-[var(--black)] g1-mid-tv'>
          <div className='flex items-center justify-center g1-mid-tv-display'>
            <img src={avatar} alt="" width={100} height={100}/>
          </div>
        </div>

        <div className='flex justify-center items-center h-[15vh] bg-[var(--dark-blue)] g1-mid-button'>
          <div className='flex flex-row button-slider' ref={sliderRef}>
            <div className='flex flex-row slider-images'>
              <img src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632d71d15867f648fad21525_bg-slider.png" height={20} className='btn-slider-img'/>
              <img src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632d71d15867f648fad21525_bg-slider.png" height={20} className='btn-slider-img'/>
              <img src="https://cdn.prod.website-files.com/61ba0d8d68d959d09b491aa4/632d71d15867f648fad21525_bg-slider.png" height={20} className='btn-slider-img'/>
            </div>
            <button
              className={`btn-main ${isPressed ? 'btn-pressed' : ''}`}
              ref={buttonRef}
              style={{ left: `${position}px` }}
              onMouseDown={handleMouseDown}
            >
              START
            </button>
          </div>
        </div>
      </section>
      <section className='g1-btm'>
        
      </section>
    </div>
  );
};

export default FirstGrid;