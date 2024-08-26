import React, { useState, useEffect, useRef } from 'react';
import Header from './Components/elements/Header';
import Footer from './Components/elements/Footer';

const appTitle = "Field Tickets";
const hostName = "https://saferightfast.quickbase.com";
const jobsTable = "bucbxzpaf"

function handleLogMessage(event) {
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


function App() {
  const iframeRef = useRef(null);
  const iframeSrc = "https://saferightfast.quickbase.com/db/bucbxyva3?a=dbpage&pageID=10";
  const [jobs, setJobs] = useState([]);
  async function quickbaseFetch(url, options, dbid) {
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

  useEffect(() => {
    window.addEventListener('message', handleLogMessage);
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header appTitle={appTitle} />
      <main className="flex-grow flex flex-col items-center justify-center">
        <button onClick={() => quickbaseFetch("https://api.quickbase.com/v1/records/query",{
      method: "POST",
      headers: {

        "QB-Realm-Hostname": hostName,
        "User-Agent": "{API call Rigid Job Management}",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "from": jobsTable,
        "select": [
          28,
          163,
          77
        ],
      })
    }, jobsTable).then(res => {
      setJobs(res.body.data);
    }).catch(error => console.error(error))}>click me</button>
        <h1>Parent Page</h1>
        <iframe ref={iframeRef} id="myIframe" src={iframeSrc} style={{"width:600px": "height:400px"}}></iframe>
      </main>
      {jobs.map(job => (
        <div>
          <p>{job["28"].value}</p>
          <p>{job["163"].value}</p>
          <p>{job["77"].value}</p>
        </div>
      ))}
      <Footer appTitle={appTitle}/>
    </div>
  );
}

export default App;
