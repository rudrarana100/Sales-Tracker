import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import Papa from "papaparse";
import { importLeads, getExistingPhones } from "../api/leadsApi";
import { Button } from "@/components/ui/button";
import SectionCard from "@/components/common/SectionCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Download,
  FileSpreadsheet,
} from "lucide-react";

const CsvImport = forwardRef(function CsvImport(
  { onImport },
  ref
) {
  const [rows, setRows] = useState([]);

  const fileInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    openFilePicker() {
      fileInputRef.current?.click();
    },
  }));

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
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

      const skipped =
        rows.length - uniqueLeads.length;

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
  <>
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv"
      onChange={handleFile}
      className="hidden"
    />

    {rows.length > 0 && (
      <SectionCard title="Import Leads">
        <div className="space-y-3">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {row.lead_name}
                    </TableCell>
                    <TableCell>{row.contact_person}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell className="capitalize">
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {rows.length > 10 && (
            <p className="text-xs text-muted-foreground">
              Showing first 10 of {rows.length} leads...
            </p>
          )}

          <Button size="sm" onClick={handleImport}>
            <Download className="h-4 w-4" />
            Import {rows.length} Lead{rows.length !== 1 ? "s" : ""}
          </Button>
        </div>
      </SectionCard>
    )}
  </>
);
});

export default CsvImport;
