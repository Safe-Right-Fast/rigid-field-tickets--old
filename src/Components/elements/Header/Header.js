import React from 'react';

const Header = ({appTitle}) => {

  return (
    <header className="bg-primary py-4 text-white flex justify-between">
        <div className='flex flex-col text-center'>
            <img className="h-8 ml-4" src="https://ibhc71.p3cdn1.secureserver.net/wp-content/uploads/2023/06/SRF_Logo.svg?time=1696343174" alt="SRF LOGO" />
        <    h1 className="text-xl font-semibold">{appTitle}</h1>
        </div>
      <div>
        <p className="mt-2">Manage your {appTitle} with ease.</p>
      </div>
    </header>
  );
};

export default Header;
