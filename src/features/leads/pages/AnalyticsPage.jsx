import { useEffect, useState } from "react";
import { getDeals } from "../api/dealsApi";
import { getLeads } from "../api/leadsApi";

import {
  getRevenueByMonth,
  getPaymentDistribution,
  getLeadStatusDistribution,
  getContractValue,
  getCollectedRevenue,
  getPendingRevenue,
  getAverageDeal,
  getConversionRate,
  getWinRate,
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

import { TrendingUp, DollarSign, Target, Wallet } from "lucide-react";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

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
  const leadStatusData = getLeadStatusDistribution(leads);

  const contractValue = getContractValue(deals);
  const collectedRevenue = getCollectedRevenue(deals);
  const pendingRevenue = getPendingRevenue(deals);

  const averageDeal = getAverageDeal(deals);
  const conversionRate = getConversionRate(leads);
  const winRate = getWinRate(leads);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        description="Business performance overview."
      />

      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Contract Value"
          value={`₹${contractValue.toLocaleString()}`}
          icon={<DollarSign size={16} />}
        />

        <StatCard
          title="Collected"
          value={`₹${collectedRevenue.toLocaleString()}`}
          icon={<Wallet size={16} />}
        />

        <StatCard
          title="Pending"
          value={`₹${pendingRevenue.toLocaleString()}`}
          icon={<TrendingUp size={16} />}
        />

        <StatCard
          title="Avg Deal"
          value={`₹${averageDeal.toLocaleString()}`}
          icon={<DollarSign size={16} />}
        />

        <StatCard
          title="Conversion"
          value={`${conversionRate}%`}
          icon={<Target size={16} />}
        />

        <StatCard
          title="Win Rate"
          value={`${winRate}%`}
          icon={<Target size={16} />}
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

                <Line type="monotone" dataKey="revenue" strokeWidth={3} />
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
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
