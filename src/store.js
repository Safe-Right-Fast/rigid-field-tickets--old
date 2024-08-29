import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildSRFProxy } from './Utils/Functions/SRF_Proxy';
// Create the context
const StoreContext = createContext();

// Create a provider component
export const StoreProvider = ({ children, iframeSrc }) => {
  // Define your global state and actions
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const { quickbaseFetch, messageHandler, logoutFrame, ProxyFrame, frameIsAuthenticated, authenticateFrame } = buildSRFProxy(iframeSrc);
  useEffect(() => {

    frameIsAuthenticated().then(res => setIsAuthenticated(res));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      window.removeEventListener('message', messageHandler);
    };
  }, []);


  return (
    <StoreContext.Provider
      value={{
        isAuthenticated,
        //setIsAuthenticated,
        isOnline,
        setIsOnline,
        quickbaseFetch, 
        frameIsAuthenticated,
        authenticateFrame,
        logoutFrame
      }}
    >
      <ProxyFrame />
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use the store context
export const useStore = () => useContext(StoreContext);