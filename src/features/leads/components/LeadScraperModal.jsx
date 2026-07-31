import { useState, useEffect } from "react";
import { startScraperJob, checkScraperStatus, importScrapedLeads } from "../api/scraperApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Globe, Phone, Mail, Check, Loader2, Download, ExternalLink, Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LeadScraperModal({ open, onClose, onImported }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [targetCount, setTargetCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [scrapedResults, setScrapedResults] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  useEffect(() => {
    if (!jobId || !loading) return;

    const interval = setInterval(async () => {
      try {
        const job = await checkScraperStatus(jobId);
        setProgress(job.progress || 0);
        setScrapedResults(job.leads || []);
        setSelectedIndices((job.leads || []).map((_, i) => i));

        if (job.status === "completed") {
          setLoading(false);
          setJobId(null);
          toast.success(`Scraping complete! Found ${job.leads.length} leads.`);
          clearInterval(interval);
        } else if (job.status === "failed") {
          setLoading(false);
          setJobId(null);
          toast.error(job.error || "Scraping job failed.");
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, loading]);

  async function handleStartScrape(e) {
    e.preventDefault();
    if (!query.trim() || !location.trim()) {
      toast.warning("Please specify both query and location.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setScrapedResults([]);
    setSelectedIndices([]);

    try {
      const id = await startScraperJob({ query, location, targetCount });
      setJobId(id);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to start scraper.");
      setLoading(false);
    }
  }

  function toggleSelect(index) {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  }

  function toggleSelectAll() {
    if (selectedIndices.length === scrapedResults.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(scrapedResults.map((_, i) => i));
    }
  }

  async function handleImport() {
    const leadsToImport = selectedIndices.map((i) => scrapedResults[i]);
    if (leadsToImport.length === 0) {
      toast.warning("No leads selected.");
      return;
    }

    setImporting(true);
    try {
      const { importedCount, skippedCount } = await importScrapedLeads(leadsToImport);

      if (importedCount > 0) {
        toast.success(`Successfully imported ${importedCount} new lead(s)!`);
      }
      if (skippedCount > 0) {
        toast.info(`Skipped ${skippedCount} duplicate lead(s).`);
      }

      onImported?.();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to import leads.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-3xl w-[90vw] max-h-[85vh] flex flex-col p-6 gap-4 overflow-hidden">
        <DialogHeader className="space-y-1 border-b pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-blue-600" />
            High-Volume Lead Intelligence Engine
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Extract targeted, high-intent business leads with verified contact numbers, website URLs, and emails directly from Google Maps.
          </DialogDescription>
        </DialogHeader>

        {/* Search Controls */}
        <form onSubmit={handleStartScrape} className="flex flex-col sm:flex-row items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Input
            placeholder="Category (e.g. Dentists)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="text-xs h-9 bg-white dark:bg-slate-900 flex-1"
          />
          <Input
            placeholder="City (e.g. Bhopal)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
            className="text-xs h-9 bg-white dark:bg-slate-900 flex-1"
          />
          <Input
            type="number"
            min={5}
            max={500}
            value={targetCount}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            disabled={loading}
            placeholder="Limit"
            className="text-xs h-9 bg-white dark:bg-slate-900 w-20 font-semibold"
          />
          <Button type="submit" disabled={loading} className="h-9 px-5 text-xs font-bold cursor-pointer bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs w-full sm:w-auto shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
            {loading ? "Searching..." : "Start"}
          </Button>
        </form>

        {/* Live Progress Indicator */}
        {loading && (
          <div className="space-y-1.5 px-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                Scraping Google Maps in real-time...
              </span>
              <span>{progress} / {targetCount} Leads Collected</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (progress / targetCount) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Leads List Container */}
        <div className="flex-1 overflow-y-auto border rounded-2xl p-3 bg-slate-50/50 dark:bg-slate-950/40 min-h-[300px] max-h-[450px]">
          {scrapedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-2">
              <MapPin className="h-10 w-10 opacity-40 text-blue-500" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No leads extracted yet</p>
              <p className="text-xs text-slate-400 max-w-sm">Enter a business category and city above, set your desired lead count limit, and click Start.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header Controls */}
              <div className="flex items-center justify-between px-2 pb-2 border-b text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={toggleSelectAll} className="text-blue-600 hover:underline cursor-pointer">
                    {selectedIndices.length === scrapedResults.length ? "Deselect All" : "Select All"}
                  </button>
                  <span>•</span>
                  <span>Total Found: <strong className="text-slate-900 dark:text-white">{scrapedResults.length}</strong></span>
                </div>
                <span className="text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                  {selectedIndices.length} Selected for Import
                </span>
              </div>

              {/* Cards List */}
              <div className="grid grid-cols-1 gap-2.5">
                {scrapedResults.map((item, index) => {
                  const isSelected = selectedIndices.includes(index);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleSelect(index)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all cursor-pointer text-xs gap-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.lead_name}</p>
                          {item.business_type && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                              <Briefcase className="h-3 w-3 text-slate-400" />
                              {item.business_type}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                          {item.phone ? (
                            <span className="flex items-center gap-1 font-medium">
                              <Phone className="h-3.5 w-3.5 text-emerald-500" />
                              {item.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No Phone</span>
                          )}

                          {item.email ? (
                            <span className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                              <Mail className="h-3.5 w-3.5 text-purple-500" />
                              {item.email}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No Email</span>
                          )}

                          {item.website && (
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[220px]"
                            >
                              <Globe className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              <span className="truncate">{item.website.replace(/^https?:\/\/(www\.)?/, "")}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0">
                        <div className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected ? "bg-blue-600 text-white border-blue-600 shadow-xs scale-105" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        }`}>
                          {isSelected && <Check className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-slate-500">
            Selected leads will be created with status <span className="font-bold text-slate-700 dark:text-slate-300">Cold</span>.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9 px-4">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={importing || selectedIndices.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 px-4 cursor-pointer shadow-xs"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
              Import {selectedIndices.length} Leads to CRM
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}