import React, { useState, useEffect } from 'react';
import Header from './Components/elements/Header';
import Footer from './Components/elements/Footer';
import { useStore } from './store';
const appTitle = "Field Tickets";


const hostName = "https://saferightfast.quickbase.com";
const userAgent = "Rigid_Field_Tickets_Dev";

const jobsTable = "bucbxzpaf";
const jobNumber = 28;
const jobStatus = 163;
const jobLocationName = 77;


function App() {
  const {quickbaseFetch, frameIsAuthenticated, authenticateFrame, isOnline, logoutFrame} = useStore();

  const [jobs, setJobs] = useState([]);


  // useEffect(() => {
    

  //   return () => {
      
  // };
  // }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header appTitle={appTitle} />
      <main className="flex-grow flex flex-col items-center justify-center" style={!isOnline ? {display: "none"} : {}}>
      <button
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
          onClick={logoutFrame}
          >Sign Me Out</button>
      <button
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
          onClick={() => authenticateFrame()}
          >Auth Me</button>
      <button
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
          onClick={() => frameIsAuthenticated(jobsTable).then(res => alert(res)).catch(er => console.error(er))}
          >Am I Auth?</button>
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
          }).then(res => {
            setJobs(res.body.data);
          }).catch(error => console.error(error))}
        >
          Click Me
        </button>
        <h1>Parent Page</h1>
        {/* <ProxyFrame/> */}
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
