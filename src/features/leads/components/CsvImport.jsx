import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Papa from "papaparse";
import { importLeads, getExistingPhones } from "../api/leadsApi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, X } from "lucide-react";
import { toast } from "sonner";

const CsvImport = forwardRef(function CsvImport({ onImport }, ref) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
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
        e.target.value = ""; // Reset input so re-uploading the same file works
      },
    });
  }

  function handleClose() {
    setRows([]);
  }

  async function handleImport() {
    setLoading(true);
    try {
      const existing = await getExistingPhones();
      const existingPhones = new Set(existing.map((lead) => lead.phone));
      const uniqueLeads = rows.filter((row) => !existingPhones.has(row.phone));
      const skipped = rows.length - uniqueLeads.length;

      if (uniqueLeads.length === 0) {
        toast.warning("All leads already exist.");
        setLoading(false);
        return;
      }

      await importLeads(uniqueLeads);
      if (onImport) await onImport();

      toast.success("Import completed", {
        description: `Imported ${uniqueLeads.length} lead${uniqueLeads.length !== 1 ? "s" : ""}. Skipped ${skipped} duplicate${skipped !== 1 ? "s" : ""}.`,
      });
      setRows([]);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
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

      {/* Modal Popup Overlay */}
      {rows.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-white">Preview Imported Leads</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review your CSV data before importing to your workspace.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable Table) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-800/60">
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Lead</TableHead>
                      <TableHead className="text-slate-400">Contact</TableHead>
                      <TableHead className="text-slate-400">Phone</TableHead>
                      <TableHead className="text-slate-400">Email</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 10).map((row, index) => (
                      <TableRow key={index} className="border-slate-800/60 hover:bg-slate-800/30">
                        <TableCell className="font-bold text-white">{row.lead_name}</TableCell>
                        <TableCell className="text-slate-300">{row.contact_person || "--"}</TableCell>
                        <TableCell className="text-slate-300">{row.phone || "--"}</TableCell>
                        <TableCell className="text-slate-400">{row.email || "--"}</TableCell>
                        <TableCell className="capitalize text-blue-400 font-semibold">{row.status || "Cold"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {rows.length > 10 && (
                <p className="text-xs text-slate-400 italic">
                  Showing first 10 of {rows.length} leads...
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4 bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-400">
                Total to import: <strong className="text-white">{rows.length}</strong> leads
              </span>

              <div className="flex items-center gap-2.5">
                {/* Cancel Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-xl border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  Cancel
                </Button>

                {/* Confirm Import Button */}
                <Button
                  size="sm"
                  onClick={handleImport}
                  disabled={loading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{loading ? "Importing..." : `Import ${rows.length} Lead${rows.length !== 1 ? "s" : ""}`}</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
});

export default CsvImport;