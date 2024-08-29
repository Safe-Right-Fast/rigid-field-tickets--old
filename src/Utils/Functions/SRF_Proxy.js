import React, { useRef } from "react";


export function buildSRFProxy(iframeSrc) {
    let iframeRef = null; // This will be assigned inside the ProxyFrame component
    let isAuthMode = false;
    const iframeURL = new URL(iframeSrc)
    const origin = iframeURL.origin;
    const appId = iframeURL.pathname.split("/").filter(Boolean)[0];

    const createdAt = Date.now();

    const ProxyFrame = () => {
        iframeRef = useRef(null); // We now create the ref inside the component

        return (
            <iframe
                title={`proxyFrame-${createdAt}`}
                ref={iframeRef}
                id={`proxyFrame-${createdAt}`}
                src={iframeSrc}
                style={{
                    width: isAuthMode ? "100vw" : "600px",
                    height: isAuthMode ? "100vh" : "400px",
                    display: isAuthMode ? "block" : "none",
                    position: isAuthMode ? "fixed" : "relative",
                    top: isAuthMode ? 0 : "auto",
                    left: isAuthMode ? 0 : "auto",
                    zIndex: isAuthMode ? 1000 : 1,
                }}
            ></iframe>
        );
    };


    async function quickbaseFetch(url, options) {
        const iframe = iframeRef.current;
        const requestId = Date.now(); // Unique identifier for the request
        const contentType = options.headers && options.headers['Content-Type'];
        const isJsonApi = contentType && contentType.includes('application/json');
        // const isXmlApi = contentType && contentType.includes('application/xml');
        const body = (options.body && isJsonApi) && JSON.parse(options.body);
        const dbid = body && body?.from ? body?.from : body?.to;
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
            dbid: dbid ? dbid : appId, // Only needed for JSON API requests
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
        const message = { type: 'CHECK_AUTH', dbid: appId, requestId };
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

    function messageHandler(event) {
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
        } else if (type === 'IFRAME_LOADED') {
            // When the iframe loads the original URL, hide it again
            isAuthMode = false; // Set back to false when authentication is done
            if (iframeRef.current) {
                iframeRef.current.style.display = "none";
            }
        }
    }

    function authenticateFrame() {
        const iframe = iframeRef.current;
        
        const iframeURL = encodeURIComponent(iframeSrc);

        // Construct the sign-in URL
        const signInUrl = `${origin}/db/main?a=SignIn&nexturl=${iframeURL}`;

        // Switch to auth mode, making the iframe visible and full-screen
        isAuthMode = true;


        if (iframe) {
            iframe.style.width = "100vw";
            iframe.style.height = "100vh";
            iframe.style.display = "block";
            iframe.style.position = "fixed";
            iframe.style.top = "0";
            iframe.style.left = "0";
            iframe.style.zIndex = "1000";
        }


        // Instruct the iframe to navigate to the sign-in URL
        iframe.contentWindow.postMessage({
            type: 'NAVIGATE',
            url: signInUrl,
        }, origin);
    }

    async function logoutFrame() {
        return quickbaseFetch(`${origin}/db/main?a=SignOut`, {
            method: "GET",
            headers: {
              "Content-Type": "application/xml",
            },
          })
    }


    return {
        quickbaseFetch,
        ProxyFrame,
        messageHandler,
        frameIsAuthenticated,
        authenticateFrame,
        logoutFrame,
    }
}
