import { useState } from "react";
import { FaYoutube } from "react-icons/fa6";
import { IoHomeOutline } from "react-icons/io5";
import { MdSubscriptions } from "react-icons/md";
import { GrChannel } from "react-icons/gr";
import { FaHistory } from "react-icons/fa";
import { RiPlayListAddFill } from "react-icons/ri";
import { BiSolidVideos } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [hide, setHide] = useState({left:"0px"});

  function hideSideBar() {
    if(hide.left === "-200px") setHide({left:"0px"});
    else
    setHide({left:"-200px"});
  }

  return (
    <>
      <div className="bg-black w-full flex flex-col h-screen overflow-hidden">
        <header className="flex justify-between w-full h-min-[100] text-white bg-black p-4 shadow-xl">
          <div className="flex gap-2 basis-1/3">
            <button className="text-white text-2xl w-fit hover:bg-gray-400 rounded-lg px-2 py-3" onClick={hideSideBar}><GiHamburgerMenu /></button>
            <div className="flex gap-2 place-items-center text-2xl text-red-500">
              <FaYoutube /> VideoTube
            </div>
          </div>
          <div className="basis-1/2">
          <form className="max-w-md">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="default-search"
                className="flex-grow block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search..."
              />
              <button
                type="submit"
                className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Search
              </button>
            </div>
          </form>
          </div>
          
          <div className="basis-1/7 place-content-center">
          <button type="button" className="text-white text-xl bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 me-2  dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">SignIn/LogIn</button>
          </div>
        </header>
        <main className="flex-1 flex-col overflow-y-scroll">
          <div className="flex-col">
            <div id="sideBar" className=" flex flex-col transition-all duration-250 ease-linear h-screen bg-black text-white w-fit p-4 shadow-xl col-span-2 fixed" style={hide}>
              <div className="flex flex-col">
                <a href="" className="flex gap-2 text-xl hover:bg-gray-400 rounded-lg  px-3 py-2 place-items-center"><IoHomeOutline />Home</a>
                <a href="" className="flex gap-2 text-xl hover:bg-gray-400 rounded-lg  px-3 py-2 place-items-center"><GrChannel /> Your Channel</a>
                <a href="" className="flex gap-2 text-xl hover:bg-gray-400 rounded-lg  px-3 py-2 place-items-center"><MdSubscriptions /> Subscriptions</a>
                <a href="" className="flex gap-2 text-xl hover:bg-gray-400 rounded-lg  px-3 py-2 place-items-center"><BiSolidVideos /> Your Videos</a>
                <a href="" className="flex gap-2 text-xl hover:bg-gray-400 rounded-lg  px-3 py-2 place-items-center"><BiSolidLike /> Liked Videos</a>
                <a href="" className="flex gap-2 text-xl hover:bg-gray-400 rounded-lg  px-3 py-2 place-items-center"><FaHistory /> History</a>
                <a href="" className="flex gap-2 text-xl hover:bg-gray-400 rounded-lg  px-3 py-2 place-items-center"><RiPlayListAddFill /> Playlist</a>
              </div>
            </div>

            <div id="main" className="h-screen text-white bg-blue-500 p-10 shadow-xl col-span-10 mr-">
              <h1>Hi</h1>
              
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
