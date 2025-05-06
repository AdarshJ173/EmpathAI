import React from 'react';
import './SearchBar.css';

const SearchBar = () => {
  return (
    <div className="relative searchbar-component z-10">
      <div id="searchbar-poda" className="transform scale-90">
        <div className="glow"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>
        <div className="darkBorderBg"></div>

        <div className="white"></div>

        <div className="border"></div>

        <div id="searchbar-main">
          <input placeholder="Search history..." type="text" name="text" className="input cursor-pointer" readOnly />
          <div id="searchbar-pink-mask"></div>
          <div id="searchbar-search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              height="20"
              fill="none"
              className="feather feather-search"
            >
              <circle stroke="url(#searchbar-search-gradient)" r="8" cy="11" cx="11"></circle>
              <line
                stroke="url(#searchbar-searchl-gradient)"
                y2="16.65"
                y1="22"
                x2="16.65"
                x1="22"
              ></line>
              <defs>
                <linearGradient gradientTransform="rotate(50)" id="searchbar-search-gradient">
                  <stop stopColor="#f8e7f8" offset="0%"></stop>
                  <stop stopColor="#b6a9b7" offset="50%"></stop>
                </linearGradient>
                <linearGradient id="searchbar-searchl-gradient">
                  <stop stopColor="#b6a9b7" offset="0%"></stop>
                  <stop stopColor="#837484" offset="50%"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar; 