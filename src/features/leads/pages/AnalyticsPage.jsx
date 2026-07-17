import { useEffect, useState } from "react";
import { getDeals } from "../api/dealsApi";
import { getLeads } from "../api/leadsApi";

import {
  getRevenueByMonth,
  getPaymentDistribution,
  getWinRate,
  getAverageDeal,
} from "../api/analyticsApi";

import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import StatCard from "@/components/common/StatCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  TrendingUp,
  DollarSign,
  Target,
  Wallet,
} from "lucide-react";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
];

function AnalyticsPage() {
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    async function load() {
      setDeals(await getDeals());
      setLeads(await getLeads());
    }

    load();
  }, []);

  const revenueData = getRevenueByMonth(deals);
  const paymentData = getPaymentDistribution(deals);

  const totalRevenue = deals.reduce(
    (sum, d) => sum + Number(d.value || 0),
    0
  );

  const averageDeal = getAverageDeal(deals);
  const winRate = getWinRate(leads);

  return (
    <div className="space-y-5">

      <PageHeader
        title="Analytics"
        description="Business performance overview."
      />

      <div className="grid gap-3 md:grid-cols-4">

        <StatCard
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={16} />}
        />

        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          icon={<Target size={16} />}
        />

        <StatCard
          title="Avg Deal"
          value={`₹${averageDeal.toLocaleString()}`}
          icon={<Wallet size={16} />}
        />

        <StatCard
          title="Deals"
          value={deals.length}
          icon={<TrendingUp size={16} />}
        />

      </div>

      <div className="grid gap-4 lg:grid-cols-2">

        <SectionCard title="Revenue Trend">

          <div className="h-80">

            <ResponsiveContainer>

              <LineChart data={revenueData}>

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </SectionCard>

        <SectionCard title="Payment Distribution">

          <div className="h-80">

            <ResponsiveContainer>

              <PieChart>

                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {paymentData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </SectionCard>

      </div>

    </div>
  );
}

export default AnalyticsPage;