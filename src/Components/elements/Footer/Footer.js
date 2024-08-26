import React from 'react';

const Footer = ({appTitle}) => {
    let title = appTitle

  return (
    <footer className="bg-secondary py-4 text-white text-center flex flex-col">
                  <img className="h-8 ml-4" src="https://ibhc71.p3cdn1.secureserver.net/wp-content/uploads/2023/06/SRF_Logo.svg?time=1696343174" alt="SRF LOGO" />
      <p>&copy; {new Date().getFullYear()} - {new Date().getFullYear()+1} { title ? title: "set the app name"}. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
