import { useState } from "react";
import { scrapeGoogleMapsLeads, importScrapedLeads } from "../api/scraperApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Globe, Phone, Mail, Check, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function LeadScraperModal({ open, onClose, onImported }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scrapedResults, setScrapedResults] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);

  async function handleScrape(e) {
    e.preventDefault();
    if (!query.trim() || !location.trim()) {
      toast.warning("Please specify both business category and location.");
      return;
    }

    setLoading(true);
    setScrapedResults([]);
    setSelectedIndices([]);

    try {
      const results = await scrapeGoogleMapsLeads({ query, location, limit });
      setScrapedResults(results);
      setSelectedIndices(results.map((_, index) => index));
      toast.success(`Scraped ${results.length} clean leads!`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to scrape leads.");
    } finally {
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
      await importScrapedLeads(leadsToImport);
      toast.success(`Successfully imported ${leadsToImport.length} leads to CRM!`);
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
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Search className="h-5 w-5 text-blue-600" />
            Built-in High Efficiency Lead Scraper
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleScrape} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="e.g. Gyms, Dentists, Software"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-xs h-9"
          />
          <Input
            placeholder="e.g. Delhi, Mumbai, New York"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-xs h-9"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={30}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-xs h-9 w-20"
            />
            <Button type="submit" size="sm" disabled={loading} className="flex-1 h-9 text-xs font-bold cursor-pointer">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
              {loading ? "Scraping..." : "Search"}
            </Button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto space-y-2 border rounded-xl p-3 bg-slate-50 dark:bg-slate-950/40 min-h-[260px]">
          {scrapedResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <MapPin className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs font-medium">Search a category and location to scrape targeted leads.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 pb-2 border-b text-xs font-semibold">
                <button type="button" onClick={toggleSelectAll} className="text-blue-600 cursor-pointer">
                  {selectedIndices.length === scrapedResults.length ? "Deselect All" : "Select All"}
                </button>
                <span>{selectedIndices.length} of {scrapedResults.length} selected</span>
              </div>

              {scrapedResults.map((item, index) => {
                const isSelected = selectedIndices.includes(index);
                return (
                  <div
                    key={index}
                    onClick={() => toggleSelect(index)}
                    className={`flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.lead_name}</p>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        {item.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-emerald-500" /> {item.phone}</span>}
                        {item.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-purple-500" /> {item.email}</span>}
                        {item.website && <span className="flex items-center gap-1 truncate max-w-[180px]"><Globe className="h-3 w-3 text-blue-500" /> {item.website}</span>}
                      </div>
                    </div>
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 text-white border-blue-600" : "border-slate-300"}`}>
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleImport}
            disabled={importing || selectedIndices.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
            Import {selectedIndices.length} Leads to CRM
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}