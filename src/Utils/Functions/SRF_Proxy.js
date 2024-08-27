import React, { useRef } from "react";


export function buildSRFProxy(origin, iframeSrc) {
    let iframeRef = null; // This will be assigned inside the ProxyFrame component
    const createdAt = Date.now();
    const ProxyFrame = () => {
      iframeRef = useRef(null); // We now create the ref inside the component
  
      return (
        <iframe
          ref={iframeRef}
          id={`proxyFrame-${createdAt}`}
          src={iframeSrc}
          style={{ width: "600px", height: "400px" }}
        ></iframe>
      );
    };


    async function quickbaseFetch(url, options, dbid) {
        const iframe = iframeRef.current;
        const requestId = Date.now(); // Unique identifier for the request
        const message = {
            type: 'FETCH_REQUEST',
            url: url,
            options: {
                ...options,
                headers: {
                    ...options?.headers,
                    'Content-Type': options?.headers['Content-Type'] || 'application/json',
                },
            },
            requestId: requestId,
            dbid: dbid, // Only needed for JSON API requests
        };
    
        const requestPromise = new Promise((resolve, reject) => {
            const handleResponse = (event) => {
                if (event.origin !== origin) {
                    console.warn('Invalid origin:', event.origin);
                    return;
                }
    
                const { type, requestId: responseId, status, statusText, body } = event.data;
    
                if (type === 'FETCH_RESPONSE' && responseId === requestId) {
                    window.removeEventListener('message', handleResponse);
    
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
        iframe.contentWindow.postMessage(message, origin);
    
        return requestPromise;
    }
    
    async function frameIsAuthenticated(dbid) {
        const iframe = iframeRef.current;
    
        if (!iframe) {
            console.error("Iframe reference is not available.");
            return false;
        }
    
        const requestId = Date.now();
        const message = { type: 'CHECK_AUTH', dbid, requestId };
        return new Promise((resolve) => {
            const handleResponse = (event) => {
                if (event.origin !== origin) {
                    console.warn("Invalid origin:", event.origin);
                    return;
                }
    
                const { type, requestId: responseId, isAuthenticated } = event.data;
                if (type === 'AUTH_RESPONSE' && responseId === requestId) {
                    window.removeEventListener('message', handleResponse);
                    resolve(isAuthenticated);
                }
            };
    
            window.addEventListener('message', handleResponse);
            iframe.contentWindow.postMessage(message, origin);
        });
    }

    function logMessageHandler(event) {
        if (event.origin !== origin) {
            console.warn('Invalid origin:', event.origin);
            return;
        }

        const { type, logType, message } = event.data;

        if (type === 'LOG_MESSAGE') {
            switch (logType) {
                case 'log':
                    console.log(message);
                    break;
                case 'warn':
                    console.warn(message);
                    break;
                case 'error':
                    console.error(message);
                    break;
                default:
                    console.log('Unknown log type:', logType, message);
                    break;
            }
        }
    }

    return {
        quickbaseFetch,
        ProxyFrame,
        logMessageHandler,
        frameIsAuthenticated,
        authenticateFrame: () => true,
    }
}
