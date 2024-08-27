export function buildSRFProxy(hostName) {}

export function buildLogHandler(hostName) {
    return function handleLogMessage(event) {
        if (event.origin !== hostName) {
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
}

export function buildFetch(iframeRef, hostName) {
    return async function quickbaseFetch(url, options, dbid) {
        const iframe = iframeRef.current;
        const requestId = Date.now(); // Unique identifier for the request
        const message = {
            url: url,
            options: {
                ...options,
                headers: {
                    ...options?.headers,
                    'Content-Type': options?.headers['Content-Type'] || 'application/json'
                }
            },
            requestId: requestId,
            dbid: dbid // Only needed for JSON API requests
        };

        // Create a new promise and store it in the map
        const requestPromise = new Promise((resolve, reject) => {


            const handleResponse = (event) => {
                if (event.origin !== hostName) {
                    console.warn('Invalid origin:', event.origin);
                    return;
                }

                console.log(event)

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
}