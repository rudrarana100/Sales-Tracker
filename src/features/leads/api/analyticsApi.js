// Revenue

export function getContractValue(deals) {
  return deals.reduce(
    (sum, deal) => sum + Number(deal.value || 0),
    0
  );
}

export function getCollectedRevenue(deals) {
  return deals
    .filter((deal) => deal.payment_status === "paid")
    .reduce((sum, deal) => sum + Number(deal.value || 0), 0);
}

export function getPendingRevenue(deals) {
  return deals
    .filter((deal) => deal.payment_status !== "paid")
    .reduce((sum, deal) => sum + Number(deal.value || 0), 0);
}

// Deals

export function getAverageDeal(deals) {
  if (!deals.length) return 0;

  return Math.round(getContractValue(deals) / deals.length);
}

// Leads

export function getConversionRate(leads) {
  if (!leads.length) return 0;

  const converted = leads.filter(
    (lead) => lead.status === "closed_won"
  ).length;

  return Math.round((converted / leads.length) * 100);
}

export function getWinRate(leads) {
  const won = leads.filter(
    (lead) => lead.status === "closed_won"
  ).length;

  const lost = leads.filter(
    (lead) => lead.status === "closed_lost"
  ).length;

  if (won + lost === 0) return 0;

  return Math.round((won / (won + lost)) * 100);
}

// Revenue Graph

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

  const revenue = Array(12).fill(0);

  deals.forEach((deal) => {
    if (!deal.close_date) return;

    const month = new Date(deal.close_date).getMonth();

    revenue[month] += Number(deal.value || 0);
  });

  return months.map((month, index) => ({
    month,
    revenue: revenue[index],
  }));
}

// Payment Graph

export function getPaymentDistribution(deals) {
  return [
    {
      name: "Paid",
      value: getCollectedRevenue(deals),
    },
    {
      name: "Pending",
      value: getPendingRevenue(deals),
    },
  ];
}

// Lead Status Graph

export function getLeadStatusDistribution(leads) {
  const counts = {};

  leads.forEach((lead) => {
    counts[lead.status] = (counts[lead.status] || 0) + 1;
  });

  return Object.entries(counts).map(([status, value]) => ({
    name: status.replaceAll("_", " "),
    value,
  }));
}