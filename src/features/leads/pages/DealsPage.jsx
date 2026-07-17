import { useEffect, useState } from "react";
import { getDeals } from "../api/dealsApi";
import EditDealModal from "../components/EditDealModal";

import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [editingDeal, setEditingDeal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(deal) {
    setEditingDeal(deal);
    setShowEditModal(true);
  }

  const totalRevenue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);

  const pendingRevenue = deals
    .filter((d) => d.payment_status !== "paid")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  const paidRevenue = deals
    .filter((d) => d.payment_status === "paid")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  const averageDeal =
    deals.length === 0 ? 0 : Math.round(totalRevenue / deals.length);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deals"
        description="Manage closed clients and revenue."
      />

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-fog">Revenue</p>
            <h2 className="mt-2 text-3xl font-semibold">
              ₹{totalRevenue.toLocaleString()}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-fog">Paid</p>
            <h2 className="mt-2 text-3xl font-semibold text-green-600">
              ₹{paidRevenue.toLocaleString()}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-fog">Pending</p>
            <h2 className="mt-2 text-3xl font-semibold text-amber-600">
              ₹{pendingRevenue.toLocaleString()}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-fog">Avg Deal</p>
            <h2 className="mt-2 text-3xl font-semibold">
              ₹{averageDeal.toLocaleString()}
            </h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left text-sm">
                <th className="p-4">Client</th>
                <th>Value</th>
                <th>Payment</th>
                <th>Invoice</th>
                <th>Closed</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="border-b">
                  <td className="p-4">{deal.leads?.lead_name}</td>

                  <td>₹{Number(deal.value).toLocaleString()}</td>

                  <td>
                    <Badge
                      className={
                        deal.payment_status === "paid"
                          ? "bg-green-100 text-green-700"
                          : deal.payment_status === "partial"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }
                    >
                      {deal.payment_status}
                    </Badge>
                  </td>

                  <td>
                    <Badge
                      variant="outline"
                      className={
                        deal.invoice_status === "paid"
                          ? "border-green-300 text-green-700"
                          : deal.invoice_status === "sent"
                            ? "border-blue-300 text-blue-700"
                            : "border-gray-300 text-gray-600"
                      }
                    >
                      {deal.invoice_status.replace("_", " ")}
                    </Badge>
                  </td>

                  <td>{deal.close_date}</td>

                  <td>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(deal)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <EditDealModal
        deal={editingDeal}
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingDeal(null);
        }}
        onSaved={fetchDeals}
      />
    </div>
  );
}

export default DealsPage;
