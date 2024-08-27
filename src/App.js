import React, { useState, useEffect, useRef } from 'react';
import Header from './Components/elements/Header';
import Footer from './Components/elements/Footer';
import { buildLogHandler, buildFetch } from './Utils/Functions/SRF_Proxy';
const appTitle = "Field Tickets";


const hostName = "https://saferightfast.quickbase.com";
const userAgent = "Rigid_Field_Tickets_Dev";


const jobsTable = "bucbxzpaf";
const jobNumber = 28;
const jobStatus = 163;
const jobLocationName = 77;


function App() {
  const iframeRef = useRef(null);
  const iframeSrc = "https://saferightfast.quickbase.com/db/bucbxyva3?a=dbpage&pageID=10";
  const [jobs, setJobs] = useState([]);

  const quickbaseFetch = buildFetch(iframeRef, hostName);

  useEffect(() => {
    window.addEventListener('message', buildLogHandler(hostName));
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header appTitle={appTitle} />
      <main className="flex-grow flex flex-col items-center justify-center">
        <button
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
          onClick={() => quickbaseFetch("https://api.quickbase.com/v1/records/query", {
            method: "POST",
            headers: {
              "QB-Realm-Hostname": hostName,
              "User-Agent": userAgent,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              "from": jobsTable,
              "select": [
                3,
                jobNumber,
                jobStatus,
                jobLocationName
              ],
            })
          }, jobsTable).then(res => {
            setJobs(res.body.data);
          }).catch(error => console.error(error))}
        >
          Click Me
        </button>
        <h1>Parent Page</h1>
        <iframe ref={iframeRef} id="myIframe" src={iframeSrc} style={{ "width:600px": "height:400px" }}></iframe>
      </main>
      {jobs.map(job => (
        <div key={`job${job[3].value}`}>
          <span>{job[jobNumber].value}</span>
          <span>{job[jobStatus].value}</span>
          <span>{job[jobLocationName].value}</span>
        </div>
      ))}
      <Footer appTitle={appTitle} />
    </div>
  );
}

export default App;
