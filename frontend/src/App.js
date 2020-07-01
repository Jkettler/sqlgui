import React, { useEffect, useLayoutEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [db, setDb] = useState(null);

  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [query, setQuery] = useState(null);

  const queryUrl = "http://localhost:9000/db/query";

  const queryServer = () => {
    setResults(null);
    setError(null);
    axios
      .post(queryUrl, {
        query: query,
      })
      .then((res) => {
        const {
          data: { results, error },
        } = res;

        setResults(results);
        setError(error);
      })
      .catch((e) => {
        setError(e);
      });
  };

  const renderResult = ({ columns, values }) => {
    return (
      <table>
        <thead>
          <tr>
            {columns.map((columnName) => (
              <td>{columnName}</td>
            ))}
          </tr>
        </thead>

        <tbody>
          {values.map((
            row // values is an array of arrays representing the results of the query
          ) => (
            <tr>
              {row.map((value) => (
                <td>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      <textarea
        rows={10}
        cols={40}
        placeholder="Enter some SQL"
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={queryServer}>Search</button>
      <div>{error ? <span>{`${error}`}</span> : ""}</div>
      <div>{results ? results.map(renderResult) : null}</div>
    </div>
  );
}

export default App;
