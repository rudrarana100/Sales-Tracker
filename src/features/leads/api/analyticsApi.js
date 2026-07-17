export function getRevenueByMonth(deals) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const revenue = new Array(12).fill(0);

  deals.forEach((deal) => {
    if (!deal.close_date) return;

    const date = new Date(deal.close_date);
    const month = date.getMonth();

    revenue[month] += Number(deal.value || 0);
  });

  return months.map((month, index) => ({
    month,
    revenue: revenue[index],
  }));
}

export function getPaymentDistribution(deals) {
  return [
    {
      name: "Paid",
      value: deals.filter((d) => d.payment_status === "paid").length,
    },
    {
      name: "Partial",
      value: deals.filter((d) => d.payment_status === "partial").length,
    },
    {
      name: "Pending",
      value: deals.filter((d) => d.payment_status === "pending").length,
    },
  ];
}

export function getWinRate(leads) {
  if (leads.length === 0) return 0;

  const won = leads.filter(
    (lead) => lead.status === "closed_won"
  ).length;

  return Math.round((won / leads.length) * 100);
}

export function getAverageDeal(deals) {
  if (deals.length === 0) return 0;

  const total = deals.reduce(
    (sum, deal) => sum + Number(deal.value || 0),
    0
  );

  return Math.round(total / deals.length);
}