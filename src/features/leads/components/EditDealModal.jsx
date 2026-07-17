import { useEffect, useState } from "react";

import { updateDeal } from "../api/dealsApi";
import { addActivity } from "../api/activitiesApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function EditDealModal({ deal, open, onClose, onSaved }) {
  const [value, setValue] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [invoiceStatus, setInvoiceStatus] = useState("not_sent");
  const [closeDate, setCloseDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!deal) return;

    setValue(deal.value ?? 0);
    setPaymentStatus(deal.payment_status);
    setInvoiceStatus(deal.invoice_status);
    setCloseDate(deal.close_date || "");
    setNotes(deal.notes || "");
  }, [deal]);

  if (!open || !deal) return null;

  async function handleSave() {
    try {
      await updateDeal(deal.id, {
        value: Number(value),
        payment_status: paymentStatus,
        invoice_status: invoiceStatus,
        close_date: closeDate,
        notes,
      });

      await addActivity({
        lead_id: deal.lead_id,
        activity_type: "deal_updated",
        description: `Deal updated • Value ₹${Number(value).toLocaleString()} • Payment: ${paymentStatus}`,
      });

      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update deal.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold">Edit Deal</h2>

        <div className="space-y-4">
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Deal Value"
          />

          <select
            className="w-full rounded-lg border p-2"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>

          <select
            className="w-full rounded-lg border p-2"
            value={invoiceStatus}
            onChange={(e) => setInvoiceStatus(e.target.value)}
          >
            <option value="not_sent">Not Sent</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
          </select>

          <Input
            type="date"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
          />

          <textarea
            className="min-h-28 w-full rounded-lg border p-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditDealModal;
