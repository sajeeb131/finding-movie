import React from "react";
import './styles.css'
import FirstGrid from "../first-grid/FirstGrid";
import SecondGrid from "../second-grid/SecondGrid";
import ThirdGrid from "../third-grid/ThirdGrid";
import FifthGrid from "../fifth-grid/FifthGrid";
import SeventhGrid from "../seventh-grid/SeventhGrid";
import SixthGrid from "../sixth-grid/SixthGrid";
import FourthGrid from "../fourth-grid/FourthGrid";

const GridLayout = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center grid-container">
      <div className="bg-image">
        {/* background image */}
      </div>
      <div className="grid h-full w-full gap-4 p-10 grid-cols-10 grid-rows-10">
        <div className="col-span-3 row-span-10 flex items-center justify-center bg-black  box">
          <FirstGrid />
        </div>
        
        <div className="col-span-7 row-span-2 flex items-center justify-center bg-black  box">
            <SixthGrid />
        </div>
        
        
        <div className="col-span-4 row-span-6 flex items-center justify-center bg-black  box">
          <ThirdGrid />
        </div>
        
        <div className="col-span-3 row-span-3 flex items-center justify-center bg-black  box">
          <FourthGrid />
        </div>
        
        <div className="col-span-3 row-span-5 flex items-center justify-center bg-black  box">
          <FifthGrid />
        </div>
         
        <div className="col-span-2 row-span-2 flex items-center justify-center bg-black  box">
          <SecondGrid />
        </div>
        
        <div className="col-span-2 row-span-2 flex items-center justify-center bg-black  box">
          <SeventhGrid />
        </div>
        
      </div>
    </div>
  );
};

export default GridLayout;
