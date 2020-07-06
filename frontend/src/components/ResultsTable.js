import Table from "react-bootstrap/Table";
import React from "react";

// using index for list keys is okay here since its all static data
const ResultsTable = ({ columns, values }, idx) => {
  return (
    <Table key={idx} size="sm" variant="dark">
      <thead>
        <tr>
          {columns.map((columnName, colIdx) => (
            <td key={colIdx}>{columnName}</td>
          ))}
        </tr>
      </thead>

      <tbody>
        {values.map((
          row,
          rowIdx // values is an array of arrays representing the results of the query
        ) => (
          <tr key={rowIdx}>
            {row.map((value, valIdx) => (
              <td key={valIdx}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ResultsTable;
