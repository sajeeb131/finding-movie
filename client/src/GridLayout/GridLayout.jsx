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
      <div className="grid h-full w-full gap-2 sm:gap-4 p-2 sm:p-10 grid-cols-10 grid-rows-10 grid-main">
        <div className="col-span-10 sm:col-span-3 row-span-4 sm:row-span-10 flex items-center justify-center bg-black box">
          <FirstGrid />
        </div>
        
        <div className="col-span-10 sm:col-span-7 row-span-2 flex items-center justify-center bg-black box order-2 sm:order-1">
            <SixthGrid />
        </div>
        
        
        <div className="col-span-10 sm:col-span-4 row-span-6 sm:row-span-6 flex items-center justify-center bg-black box order-3 sm:order-2">
          <ThirdGrid />
        </div>
        
        <div className="col-span-5 sm:col-span-3 row-span-2 sm:row-span-3 flex items-center justify-center bg-black box order-4 sm:order-3">
          <FourthGrid />
        </div>
        
        <div className="col-span-5 sm:col-span-3 row-span-6 sm:row-span-5 flex items-center justify-center bg-black box order-5 sm:order-4">
          <FifthGrid />
        </div>
         
        <div className="col-span-5 sm:col-span-2 row-span-2 flex items-center justify-center bg-black box order-6 sm:order-5">
          <SecondGrid />
        </div>
        
        <div className="col-span-5 sm:col-span-2 row-span-2 flex items-center justify-center bg-black box order-7 sm:order-6">
          <SeventhGrid />
        </div>
        
      </div>
    </div>
  );
};

export default GridLayout;
