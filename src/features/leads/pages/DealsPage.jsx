import { useEffect, useState } from "react";
import { getDeals } from "../api/dealsApi";

import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function DealsPage() {
  const [deals, setDeals] = useState([]);

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

  const totalRevenue = deals.reduce(
    (sum, d) => sum + Number(d.value || 0),
    0
  );

  const pendingRevenue = deals
    .filter((d) => d.payment_status !== "paid")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deals"
        description="Manage closed clients and revenue."
      />

      <div className="grid gap-3 md:grid-cols-3">
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
            <p className="text-sm text-fog">Deals</p>
            <h2 className="mt-2 text-3xl font-semibold">
              {deals.length}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-fog">
              Pending Payments
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              ₹{pendingRevenue.toLocaleString()}
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
              </tr>
            </thead>

            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="border-b">
                  <td className="p-4">
                    {deal.leads?.lead_name}
                  </td>

                  <td>
                    ₹{Number(deal.value).toLocaleString()}
                  </td>

                  <td>
                    <Badge>
                      {deal.payment_status}
                    </Badge>
                  </td>

                  <td>
                    <Badge variant="outline">
                      {deal.invoice_status}
                    </Badge>
                  </td>

                  <td>{deal.close_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export default DealsPage;