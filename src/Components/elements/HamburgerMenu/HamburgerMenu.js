import React, { useState } from 'react';

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="">
      <button
        className="text-white p-2 focus:outline-none"
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-16 right-0 bg-primary w-48 p-4 shadow-md rounded-md border-solid border-2 border-[#d7d7d7]">
          <ul>
            <li className="mb-2">
              <a href="#" className="text-white hover:text-gray-200">
                Home
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-white hover:text-gray-200">
                About
              </a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-white hover:text-gray-200">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="text-white hover:text-gray-200">
                Contact
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
