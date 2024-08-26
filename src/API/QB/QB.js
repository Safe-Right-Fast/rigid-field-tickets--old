import db from "../../DB";

let mode = process.env.REACT_APP_ENV_MODE;
let Token = process.env.REACT_APP_MY_TOKEN;
let method = "POST";

/*
 * Retrieves the temporary authorization token from QuickBase API.
 * @param {Object} payload - The payload object containing the tableId.
 * @returns {Promise<string|Object>} - The temporary authorization token or the entire tempAuth object.
 * @throws {Error} - If failed to fetch temporary authorization.
 */
const get_auth = async (payload) => {
  try {
    let { tableId } = payload;
    let tempAuth = JSON.parse(localStorage.getItem("tempAuth"));
    let timeData = validateTime(tempAuth.timeStored);

    if (!tempAuth || timeData.needsRefresh) {
      let headers = await constructHeaders(payload);
      let fetchPayload = {
        method: "GET",
        headers,
        credentials: "include",
      };
      let resAuth = await fetch(
        `https://api.quickbase.com/v1/auth/temporary/${tableId}`,
        fetchPayload
      );

      if (!resAuth.ok) {
        throw new Error(
          `Failed to fetch temporary authorization. Status: ${resAuth.status}`
        );
      }

      tempAuth = await resAuth.json();
      tempAuth = tempAuth["temporaryAuthorization"];
      localStorage.setItem(
        "tempAuth",
        JSON.stringify({ tempAuth, timeStored: Date.now() })
      );
      return tempAuth.tempAuth;
    }

    return tempAuth;
  } catch (error) {
    console.error("Error in get_auth:", error);
  }
};

/*
 * Validates the parameters for a GET request.
 * @param {string} tableId - The ID of the table.
 * @param {string} appToken - The application token.
 * @param {string} hostName - The host name.
 * @throws {Error} If any of the parameters are undefined.
 */
const validateGetRequest = (tableId, appToken, hostName) => {
  let error = "";
  if (tableId === undefined) {
    error += "tableId is undefined. ";
  }
  if (appToken === undefined) {
    error += "appToken is undefined. ";
  }
  if (hostName === undefined) {
    error += "hostName is undefined. ";
  }
  if (error.length) {
    throw new Error(error);
  }
};

/*
 * Validates the parameters of a POST request.
 * @param {Object} params - The parameters of the request.
 * @param {string} params.tableId - The table ID.
 * @param {string} params.appToken - The app token.
 * @param {string} params.hostName - The host name.
 * @param {Array} params.dataArr - The data array.
 * @throws {Error} If any of the parameters are undefined.
 */
const validatePostRequest = ({ tableId, appToken, hostName, dataArr }) => {
  let error = "";
  if (tableId === undefined) {
    error += "tableId is undefined. ";
  }
  if (appToken === undefined) {
    error += "appToken is undefined. ";
  }
  if (hostName === undefined) {
    error += "hostName is undefined. ";
  }
  if (dataArr === undefined) {
    error += "dataArr is undefined. ";
  }
  if (error.length) {
    throw new Error(error);
  }
};

/*
 * @param {object} payload - The payload for constructing the headers.
 * @param {string} payload.hostName - The hostname of the QuickBooks API.
 * @param {string} payload.tableId - The ID of the table to retrieve records from.
 * @param {string} payload.appToken - The app token for authentication.
 * @returns {Promise<object>} - A promise that resolves to an object of headers.
 */

const constructHeaders = async (payload) => {
  let { hostName } = payload;
  let Authorization = await constructAuth(payload);

  return {
    "QB-Realm-Hostname": hostName,
    "User-Agent": "{Development API call Invoice Generator}",
    Authorization,
    "Content-Type": "application/json",
  };
};

/*
 * Constructs the authorization header for QuickBooks API requests.
 * If a token is available, it uses the QB-USER-TOKEN format.
 * Otherwise, it uses the QB-TEMP-TOKEN format and retrieves the token using the provided payload.
 * @param {Object} payload - The payload used to retrieve the token (if needed).
 * @returns {string} The constructed authorization header.
 */

const constructAuth = async (payload) => {
  return Token
    ? `QB-USER-TOKEN ${Token}`
    : `QB-TEMP-TOKEN ${await get_auth(payload)}`;
};

/*
 * Retrieves records from a QuickBooks table.
 * @param {Object} options - The options for retrieving records.
 * @param {string} options.tableId - The ID of the table to retrieve records from.
 * @param {string} options.appToken - The app token for authentication.
 * @param {Array<number>} options.fieldsWantedArr - The array of fields to retrieve for each record.
 * @param {Object} options.queryParamaters - The query parameters for filtering the records.
 * @param {string} options.sorted - The field to sort the records by.
 * @param {string} options.hostName - The hostname of the QuickBooks API.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of records.
 */

export const get_records = async ({
  tableId,
  appToken,
  fieldsWantedArr,
  queryParameters,
  sorted,
  hostName,
}) => {
  try {
    validateGetRequest(tableId, appToken, hostName);
  } catch (e) {
    console.error(e);
    throw e;
  }
  try {
    // Try to fetch data from IndexedDB
    const cachedData = await db.qbTables.get(tableId);

    // Check if the data in IndexedDB is valid
    const timeData = cachedData
      ? validateTime(cachedData.timeStored)
      : { needsRefresh: true };

    // If data is not in IndexedDB or needs to be refreshed, make an API call
    if (!cachedData) {
      const payload = {
        method,
        headers: await constructHeaders({ tableId, appToken, hostName }),
        body: JSON.stringify({
          from: tableId,
          select: fieldsWantedArr,
          where: queryParameters,
          sortBy: sorted,
        }),
      };

      console.log("Fetching from QuickBase API");

      const res = await fetchData(payload);

      // Save the data in IndexedDB
      await db.qbTables.put({
        tableId,
        data: res.data,
        metadata: res.metadata,
        fields: res.fields,
        timeStored: Date.now(),
      });

      return res.data;
    }

    // If data is in IndexedDB and doesn't need to be refreshed, return it
    return cachedData.data;
  } catch (e) {
    console.error(e);
    throw e; // Re-throw the error to be handled by the caller
  }
};

/*
 * Fetches data from the QuickBase API.
 * @param {Object} payload - The payload to be sent with the fetch request.
 * @returns {Promise<Object>} - A promise that resolves to the response from QuickBase.
 */

const fetchData = async (payload) => {
  const res = await fetch(
    "https://api.quickbase.com/v1/records/query",
    payload
  );
  let data = await res.json();

  return data;
};

/*
 * Posts or patches records to a QuickBase table.
 *
 * @param {Object} options - The options for the request.
 * @param {string} options.hostName - The host name of the QuickBase instance.
 * @param {string} options.tableId - The ID of the table in QuickBase.
 * @param {string} options.appToken - The app token for authentication.
 * @param {Array} options.dataArr - The array of data to be posted or patched.
 * @returns {Promise<Object>} - A promise that resolves to the response from QuickBase.
 * @throws {Error} - If there is an error in the request.
 */

export const post_patch_records = async ({
  hostName,
  tableId,
  appToken,
  dataArr,
}) => {
  validatePostRequest({ hostName, tableId, appToken, dataArr });

  const headers = await constructHeaders({ hostName, tableId, appToken });

  const payload = {
    method,
    headers,
    body: JSON.stringify({ to: tableId, data: dataArr }),
  };

  try {
    const res = await fetch("https://api.quickbase.com/v1/records", payload);
    const response = await res.json();

    if (res.ok) {
      return response;
    } else {
      await handle_qb_error({
        headers: payload.headers,
        body: payload.body,
        data: dataArr,
        error_code: res.status,
        response,
      });

      console.error("Something went wrong");
    }
  } catch (error) {
    console.error("Error in post_patch_records:", error);
  }
};

export const handle_qb_error = async ({
  error_headers,
  error_body,
  error_data,
  error_code,
  error_response,
}) => {
  let tableId = "bs4rvnrg2";
  let appToken = "c3a5y8rc8rfjyfcme8qhwcg9ewdp";
  let hostName = "saferightfast.quickbase.com";

  let realm = `https://${error_headers["QB-Realm-Hostname"]}/db/${error_body["from"]}`;
  let code_page_url = window.location.href;

  const error = JSON.stringify({
    error_headers,
    error_body,
    error_data,
    error_response,
  });

  let dataArr = [
    {
      6: { value: error },
      8: { value: error_code },
      9: { value: code_page_url },
      10: { value: realm },
    },
  ];

  await post_patch_records({ hostName, tableId, appToken, dataArr });

  return error;
};

/*
 * Validates the time difference between the current time and the stored time.
 * @param {number} timeStored - The stored time in milliseconds.
 * @returns {Object} - An object containing the current time, stored time, time difference, time difference in minutes, and a flag indicating if a refresh is needed.
 */

const validateTime = (timeStored) => {
  const timeNow = Date.now();
  const timeDiff = timeNow - timeStored;
  const timeDiffInMinutes = timeDiff / 1000 / 60;

  let data = {
    timeNow,
    timeStored,
    timeDiff,
    timeDiffInMinutes,
    needsRefresh: timeDiffInMinutes >= 5,
  };

  return data;
};
