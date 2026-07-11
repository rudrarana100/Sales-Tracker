import { useState } from "react";
import Papa from "papaparse";

function CsvImport() {
  const [rows, setRows] = useState([]);

  function handleFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete(results) {
        console.log(results.data);

        setRows(results.data);
      },
    });
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Import Leads</h2>

      <input type="file" accept=".csv" onChange={handleFile} />

      {rows.length > 0 && (
        <>
          <h3>Preview ({rows.length} Leads)</h3>

          <table
            border="1"
            cellPadding="8"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.slice(0, 10).map((row, index) => (
                <tr key={index}>
                  <td>{row.lead_name}</td>
                  <td>{row.contact_person}</td>
                  <td>{row.phone}</td>
                  <td>{row.email}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length > 10 && (
            <p style={{ marginTop: "10px" }}>
              Showing first 10 of {rows.length} leads...
            </p>
          )}

          <button
            style={{
              marginTop: "20px",
              padding: "10px 18px",
            }}
          >
            Import {rows.length} Leads
          </button>
        </>
      )}
    </div>
  );
}

export default CsvImport;
