import React, { useState, useRef, useEffect } from 'react';
import './ModernSlidingButton.css';

const ModernSlidingButton = ({ onSlideComplete, isDisabled = false, initialValue = 0 }) => {
  // State management
  const [position, setPosition] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const [isAtThreshold, setIsAtThreshold] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [buttonText, setButtonText] = useState("→ Slide to Start");
  const [showHint, setShowHint] = useState(true);
  
  // Refs
  const sliderRef = useRef(null);
  const buttonRef = useRef(null);
  const trackRef = useRef(null);
  const progressRef = useRef(null);
  const startX = useRef(0);
  
  // Animation refs
  const animationRef = useRef(null);
  const velocityRef = useRef(0);
  const lastPositionRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  // Constants
  const THRESHOLD = 0.75; // 75% of track width to trigger completion
  const SPRING_TENSION = 0.25;
  const SPRING_FRICTION = 0.15;
  const MIN_VELOCITY_TO_CONTINUE = 0.5;
  
  // Calculate threshold position in pixels
  const getThresholdPosition = () => {
    if (!trackRef.current) return 0;
    const trackWidth = trackRef.current.offsetWidth;
    const buttonWidth = buttonRef.current ? buttonRef.current.offsetWidth : 80;
    return trackWidth * THRESHOLD - buttonWidth / 2;
  };
  
  // Calculate max position in pixels
  const getMaxPosition = () => {
    if (!trackRef.current) return 0;
    const trackWidth = trackRef.current.offsetWidth;
    const buttonWidth = buttonRef.current ? buttonRef.current.offsetWidth : 80;
    return trackWidth - buttonWidth;
  };
  
  // Set button text based on position
  useEffect(() => {
    if (isCompleted) {
      setButtonText("✓ Started");
    } else if (isAtThreshold) {
      setButtonText("Release!");
    } else if (position > getMaxPosition() * 0.3) {
      setButtonText("→ Keep Going");
    } else {
      setButtonText("→ Slide to Start");
    }
  }, [position, isAtThreshold, isCompleted]);
  
  // Hide hint after first interaction
  useEffect(() => {
    if (isDragging) {
      setShowHint(false);
    }
  }, [isDragging]);
  
  // Spring animation for smooth return
  const animateSpring = (targetPosition, callback) => {
    const animate = () => {
      if (!sliderRef.current) return;
      
      const currentPosition = parseFloat(sliderRef.current.style.left || '0');
      const displacement = targetPosition - currentPosition;
      
      // Apply spring physics
      const springForce = displacement * SPRING_TENSION;
      const dampingForce = velocityRef.current * SPRING_FRICTION;
      const acceleration = springForce - dampingForce;
      
      velocityRef.current += acceleration;
      const newPosition = currentPosition + velocityRef.current;
      
      // Update position
      setPosition(newPosition);
      sliderRef.current.style.left = `${newPosition}px`;
      
      // Update progress bar
      if (progressRef.current) {
        const maxPos = getMaxPosition();
        const progress = Math.min(100, Math.max(0, (newPosition / maxPos) * 100));
        progressRef.current.style.width = `${progress}%`;
      }
      
      // Check if animation is complete
      if (Math.abs(displacement) < 0.5 && Math.abs(velocityRef.current) < 0.5) {
        velocityRef.current = 0;
        if (callback) callback();
        return;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };
  
  // Handle mouse/touch start
  const handleStart = (e) => {
    if (isDisabled || isCompleted) return;
    
    e.preventDefault();
    setIsDragging(true);
    setIsAtThreshold(false);
    velocityRef.current = 0;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const trackRect = trackRef.current.getBoundingClientRect();
    
    // Calculate initial position
    const initialOffset = clientX - sliderRect.left;
    const currentLeft = position || 0;
    startX.current = clientX - currentLeft;
    
    // Add event listeners
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
    
    // Add active class for visual feedback
    buttonRef.current.classList.add('active');
    trackRef.current.classList.add('active');
  };
  
  // Handle mouse/touch move
  const handleMove = (e) => {
    if (!isDragging || isDisabled || isCompleted) return;
    
    e.preventDefault();
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const trackRect = trackRef.current.getBoundingClientRect();
    const buttonWidth = buttonRef.current ? buttonRef.current.offsetWidth : 80;
    
    // Calculate new position
    let newPosition = clientX - startX.current;
    
    // Constrain to track boundaries
    newPosition = Math.max(0, Math.min(newPosition, getMaxPosition()));
    
    // Calculate velocity for momentum
    const currentTime = Date.now();
    if (lastTimeRef.current > 0) {
      const timeDelta = currentTime - lastTimeRef.current;
      const positionDelta = newPosition - lastPositionRef.current;
      velocityRef.current = positionDelta / timeDelta * 10; // Scale for visibility
    }
    
    lastPositionRef.current = newPosition;
    lastTimeRef.current = currentTime;
    
    // Update position
    setPosition(newPosition);
    sliderRef.current.style.left = `${newPosition}px`;
    
    // Update progress bar
    if (progressRef.current) {
      const maxPos = getMaxPosition();
      const progress = Math.min(100, Math.max(0, (newPosition / maxPos) * 100));
      progressRef.current.style.width = `${progress}%`;
    }
    
    // Check if at threshold
    const thresholdPos = getThresholdPosition();
    if (newPosition >= thresholdPos && !isAtThreshold) {
      setIsAtThreshold(true);
      buttonRef.current.classList.add('at-threshold');
    } else if (newPosition < thresholdPos && isAtThreshold) {
      setIsAtThreshold(false);
      buttonRef.current.classList.remove('at-threshold');
    }
  };
  
  // Handle mouse/touch end
  const handleEnd = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    setIsDragging(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleEnd);
    
    // Remove active classes
    buttonRef.current.classList.remove('active');
    trackRef.current.classList.remove('active');
    
    // Check if at threshold for completion
    const thresholdPos = getThresholdPosition();
    if (position >= thresholdPos) {
      // Complete the action
      completeAction();
    } else {
      // Return to start with spring animation
      buttonRef.current.classList.remove('at-threshold');
      setIsAtThreshold(false);
      
      // Add momentum if velocity is high enough
      const maxPos = getMaxPosition();
      let targetPosition = 0;
      
      if (Math.abs(velocityRef.current) > MIN_VELOCITY_TO_CONTINUE) {
        // Calculate where the button would stop with current velocity
        const momentumDistance = velocityRef.current * 30; // Scale momentum
        targetPosition = Math.max(0, Math.min(position + momentumDistance, maxPos));
      }
      
      // Animate return
      animateSpring(targetPosition, () => {
        if (targetPosition >= thresholdPos) {
          completeAction();
        }
      });
    }
  };
  
  // Complete the action
  const completeAction = () => {
    setIsCompleted(true);
    setIsAtThreshold(false);
    
    // Snap to end position
    const maxPos = getMaxPosition();
    setPosition(maxPos);
    sliderRef.current.style.left = `${maxPos}px`;
    
    // Update progress bar to 100%
    if (progressRef.current) {
      progressRef.current.style.width = '100%';
    }
    
    // Add completion class
    buttonRef.current.classList.add('completed');
    trackRef.current.classList.add('completed');
    
    // Trigger callback
    if (onSlideComplete) {
      onSlideComplete();
    }
    
    // Reset after delay (if needed)
    setTimeout(() => {
      if (onSlideComplete && typeof onSlideComplete === 'function') {
        // This will be handled by the parent component
      }
    }, 2000);
  };
  
  // Reset button
  const reset = () => {
    setIsCompleted(false);
    setIsAtThreshold(false);
    setPosition(0);
    velocityRef.current = 0;
    
    if (sliderRef.current) {
      sliderRef.current.style.left = '0px';
    }
    
    if (progressRef.current) {
      progressRef.current.style.width = '0%';
    }
    
    if (buttonRef.current) {
      buttonRef.current.classList.remove('completed', 'at-threshold');
    }
    
    if (trackRef.current) {
      trackRef.current.classList.remove('completed');
    }
    
    setShowHint(true);
  };
  
  // Expose reset method to parent
  useEffect(() => {
    if (initialValue === 0 && isCompleted) {
      reset();
    }
  }, [initialValue]);
  
  return (
    <div className="modern-slider-container">
      {showHint && !isDragging && (
        <div className="slider-hint">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2L14 8M14 8L10 4M14 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      
      <div 
        ref={trackRef}
        className={`slider-track ${isDisabled ? 'disabled' : ''} ${isCompleted ? 'completed' : ''}`}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Progress fill */}
        <div ref={progressRef} className="slider-progress"></div>
        
        {/* Shimmer effect */}
        <div className="slider-shimmer"></div>
        
        {/* Button handle */}
        <div 
          ref={sliderRef}
          className={`slider-button ${isDragging ? 'dragging' : ''} ${isAtThreshold ? 'at-threshold' : ''} ${isCompleted ? 'completed' : ''}`}
          style={{ left: `${position}px` }}
        >
          <div className="slider-button-content">
            <span className="slider-button-text">{buttonText}</span>
            <div className="slider-button-glow"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSlidingButton;