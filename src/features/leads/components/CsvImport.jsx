import { useState } from "react";
import Papa from "papaparse";
import { importLeads } from "../api/leadsApi";
import { getExistingPhones } from "../api/leadsApi";

function CsvImport( {onImport} ) {
    
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
 async function handleImport() {
  try {
    const existing = await getExistingPhones();

    const existingPhones = new Set(
      existing.map((lead) => lead.phone)
    );

    const uniqueLeads = rows.filter(
      (row) => !existingPhones.has(row.phone)
    );

    const skipped = rows.length - uniqueLeads.length;

    if (uniqueLeads.length === 0) {
      alert("All leads already exist.");
      return;
    }

    await importLeads(uniqueLeads);

    if (onImport) {
      await onImport();
    }

    alert(
      `Imported ${uniqueLeads.length} leads.\nSkipped ${skipped} duplicates.`
    );

    setRows([]);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
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

          <button onClick={handleImport}>
            Import {rows.length} Leads
          </button>
        </>
      )}
    </div>
  );
}

export default CsvImport;
