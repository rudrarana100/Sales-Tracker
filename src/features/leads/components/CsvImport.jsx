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
import { Download, X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Target Database Fields
const TARGET_FIELDS = [
  { key: "lead_name", label: "Business / Lead Name", required: true },
  { key: "phone", label: "Phone Number", required: true },
  { key: "contact_person", label: "Contact Person" },
  { key: "email", label: "Email Address" },
  { key: "business_type", label: "Business Type / Category" },
  { key: "website", label: "Website URL" },
  { key: "city", label: "City / Location" },
];

const CsvImport = forwardRef(function CsvImport({ onImport }, ref) {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawRows, setRows] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [step, setStep] = useState(1); // Step 1: Map Columns | Step 2: Live Preview
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
        if (!results.data || results.data.length === 0) {
          toast.error("The uploaded CSV file is empty.");
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setRows(results.data);

        // Auto-guess initial mapping based on header names
        const initialMapping = {};
        TARGET_FIELDS.forEach((target) => {
          const matchedHeader = headers.find((h) => {
            const cleanHeader = h.toLowerCase().replace(/[^a-z0-9]/g, "");
            const cleanTarget = target.key.toLowerCase().replace(/[^a-z0-9]/g, "");
            const cleanLabel = target.label.toLowerCase().replace(/[^a-z0-9]/g, "");
            return cleanHeader.includes(cleanTarget) || cleanHeader.includes(cleanLabel);
          });
          if (matchedHeader) {
            initialMapping[target.key] = matchedHeader;
          }
        });

        setFieldMapping(initialMapping);
        setStep(1);
        e.target.value = ""; // Reset file input
      },
    });
  }

  function handleClose() {
    setRows([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setStep(1);
  }

  function handleMappingChange(targetKey, selectedHeader) {
    setFieldMapping((prev) => ({
      ...prev,
      [targetKey]: selectedHeader === "--ignore--" ? "" : selectedHeader,
    }));
  }

  // Transform raw CSV rows into DB schema using active field mappings
  const mappedLeads = rawRows.map((row) => {
    const lead = {
      status: "cold",
    };
    TARGET_FIELDS.forEach((field) => {
      const csvHeader = fieldMapping[field.key];
      lead[field.key] = csvHeader && row[csvHeader] ? String(row[csvHeader]).trim() : "";
    });
    return lead;
  });

  function handleProceedToPreview() {
    if (!fieldMapping.lead_name && !fieldMapping.phone) {
      toast.warning("Please map at least 'Business / Lead Name' or 'Phone Number'.");
      return;
    }
    setStep(2);
  }

  async function handleImport() {
    setLoading(true);
    try {
      // Filter out rows without basic required information
      const validLeads = mappedLeads.filter((l) => l.lead_name || l.phone);

      if (validLeads.length === 0) {
        toast.warning("No valid leads found in mapped data.");
        setLoading(false);
        return;
      }

      const existing = await getExistingPhones();
      const existingPhones = new Set(
        (existing || []).map((lead) => lead.phone).filter(Boolean)
      );

      const uniqueLeads = validLeads.filter(
        (row) => !row.phone || !existingPhones.has(row.phone)
      );
      const skipped = validLeads.length - uniqueLeads.length;

      if (uniqueLeads.length === 0) {
        toast.warning("All leads already exist in your database.");
        setLoading(false);
        return;
      }

      await importLeads(uniqueLeads);
      if (onImport) await onImport();

      toast.success("Import completed", {
        description: `Successfully imported ${uniqueLeads.length} lead${
          uniqueLeads.length !== 1 ? "s" : ""
        }.${skipped > 0 ? ` Skipped ${skipped} duplicate phone numbers.` : ""}`,
      });

      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to import leads.");
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
      {rawRows.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Import Leads</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800">
                    Step {step} of 2
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {step === 1
                    ? "Map your CSV column headers to SalesTracker database fields."
                    : "Review mapped lead data before adding them to your CRM workspace."}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* STEP 1: COLUMN MAPPER GRID */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TARGET_FIELDS.map((field) => {
                      const currentHeader = fieldMapping[field.key] || "";
                      return (
                        <div
                          key={field.key}
                          className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <span>{field.label}</span>
                              {field.required && (
                                <span className="text-rose-500 font-bold">*</span>
                              )}
                            </label>
                            {currentHeader && (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Mapped
                              </span>
                            )}
                          </div>

                          <select
                            value={currentHeader}
                            onChange={(e) =>
                              handleMappingChange(field.key, e.target.value)
                            }
                            className="h-9 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="--ignore--">-- Ignore field --</option>
                            {csvHeaders.map((header) => (
                              <option key={header} value={header}>
                                CSV Column: "{header}"
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: LIVE PREVIEW TABLE */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                        <TableRow className="border-slate-200 dark:border-slate-800">
                          <TableHead className="text-slate-500 dark:text-slate-400">Lead / Business</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Contact</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Phone</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Email</TableHead>
                          <TableHead className="text-slate-500 dark:text-slate-400">Business Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mappedLeads.slice(0, 10).map((row, index) => (
                          <TableRow
                            key={index}
                            className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          >
                            <TableCell className="font-bold text-slate-900 dark:text-white">
                              {row.lead_name || "--"}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                              {row.contact_person || "--"}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                              {row.phone || "--"}
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">
                              {row.email || "--"}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-300">
                              {row.business_type || "--"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {mappedLeads.length > 10 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      Showing first 10 preview rows of {mappedLeads.length} total entries...
                    </p>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total rows detected: <strong className="text-slate-900 dark:text-white">{rawRows.length}</strong>
              </span>

              <div className="flex items-center gap-2.5">
                {step === 1 ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClose}
                      className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      Cancel
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleProceedToPreview}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <span>Preview Mapped Data</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Mapping
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleImport}
                      disabled={loading}
                      className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      <span>{loading ? "Importing..." : `Import ${rawRows.length} Leads`}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
});

export default CsvImport;