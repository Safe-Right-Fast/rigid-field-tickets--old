import React, { useState, useEffect, useRef } from 'react';
import Header from './Components/elements/Header';
import Footer from './Components/elements/Footer';

const appTitle = "Field Tickets"


function App() {
  const iframe = useRef(null);
  const iframeSrc = "https://saferightfast.quickbase.com/db/bucbxyva3?a=dbpage&pageID=10";
  const iframeOrigin = "https://saferightfast.quickbase.com"
  
  async function quickbaseFetch(url, options, dbid) {
    const requestId = Date.now(); // Unique identifier for the request
    const message = {
        url: url,
        options: {
            ...options,
            headers: {
                ...options.headers,
                'Content-Type': options.headers['Content-Type'] || 'application/json'
            }
        },
        requestId: requestId,
        dbid: dbid // Only needed for JSON API requests
    };

    // Create a new promise and store it in the map
    const requestPromise = new Promise((resolve, reject) => {
        const handleResponse = (event) => {
            if (event.origin !== iframeOrigin) {
                console.warn('Invalid origin:', event.origin);
                return;
            }

            const { type, requestId: responseId, status, statusText, body } = event.data;

            if (responseId === requestId) {
                // Clean up the event listener and map entry
                window.removeEventListener('message', handleResponse);

                // Resolve or reject the promise based on response
                if (status >= 200 && status < 300) {
                    resolve({ status, statusText, body });
                } else {
                    reject({ status, statusText, body });
                }
            }
        };

        window.addEventListener('message', handleResponse);
    });

    // Send the message to the iframe
    iframe.contentWindow.postMessage(message, '*'); // Replace '*' with the actual origin if needed

    return requestPromise;
}

  return (
    <div className="min-h-screen flex flex-col">
      <Header appTitle={appTitle} />
      <main className="flex-grow flex flex-col items-center justify-center">
        Hello World
      </main>
      <h1>Parent Page</h1>
      <iframe ref={iframe} id="myIframe" src={iframeSrc} style="width:600px; height:400px;"></iframe>
      <Footer appTitle={appTitle}/>
    </div>
  );
}

export default App;
