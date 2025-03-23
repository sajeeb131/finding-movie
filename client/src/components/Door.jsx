import { useState } from "react";
import "./Door.css";
import { CiLock, CiUnlock } from "react-icons/ci";
import { useMovieContext } from "../context/MovieContext";

const Door = () => {
  const [locked, setLocked] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { gameStarted } = useMovieContext(); // Get global gameStarted state

  const handleUnlock = () => {
    // Only allow unlocking if the game has started
    if (!gameStarted) return;

    // Play unlock sound
    const unlockSound = new Audio("/audio/door.mp3.wav");
    setLocked(false);
    setTimeout(() => {
      setIsOpen(true);
      unlockSound.play();
    }, 200); // slight delay before opening the door (adjust if needed)
  };

  const handleLock = () => {
    // Play lock sound
    const lockSound = new Audio("/lock-click.mp3");
    lockSound.play();

    setLocked(true);
    setIsOpen(false);
  };

  return (
    <div
      className={`w-full door-container ${isOpen ? "door-open" : ""}`}
      onMouseEnter={() => {
        if (gameStarted) setLocked(false);
      }}
      onMouseLeave={() => {
        if (gameStarted && !isOpen) setLocked(true);
      }}
    >
      <div className={`w-full border-r-[1px] door-part ${isOpen ? "left-door" : ""}`}>
        <div className="door-design">{/* empty */}</div>
      </div>
      <div className={`w-full border-l-[1px] door-part ${isOpen ? "right-door" : ""}`}>
        <div className="door-design">{/* empty */}</div>
      </div>

      {/* Render door lock only if door is closed */}
      {!isOpen && (
        <div
          className="flex flex-row items-center justify-center lock-circle"
          onClick={handleUnlock}
        >
          {locked ? (
            <CiLock size={30} color="#b58622" />
          ) : (
            <CiUnlock size={30} color="#213e9a" />
          )}
        </div>
      )}
    </div>
  );
};

export default Door;
