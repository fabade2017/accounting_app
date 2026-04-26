// src/pages/dashboard.tsx
import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  Card,
  Title,
  Text,
  Metric,
  Flex,
  BadgeDelta,
  AreaChart,
  DonutChart,
  BarList,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from "@tremor/react";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGrid = WidthProvider(Responsive);

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const defaultLayout: LayoutItem[] = [
  { i: "revenue", x: 0, y: 0, w: 3, h: 2 },
  { i: "expenses", x: 3, y: 0, w: 3, h: 2 },
  { i: "profit", x: 6, y: 0, w: 3, h: 2 },
  { i: "pending", x: 9, y: 0, w: 3, h: 2 },
  { i: "revenueTrend", x: 0, y: 2, w: 8, h: 5 },
  { i: "expensesByCat", x: 8, y: 2, w: 4, h: 5 },
  { i: "topCustomers", x: 0, y: 7, w: 6, h: 4 },
  { i: "recentTransactions", x: 6, y: 7, w: 6, h: 4 },
];

interface WidgetMap {
  [key: string]: React.ReactNode;
}

export const DashboardPage: React.FC = () => {
  const [layout, setLayout] = useState<LayoutItem[]>(() => {
    const saved = localStorage.getItem("accounting-dashboard-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  useEffect(() => {
    localStorage.setItem("accounting-dashboard-layout", JSON.stringify(layout));
  }, [layout]);

  // Mock data (replace with real API later)
  const revenueData = [
    { month: "Jan", revenue: 3800000 },
    { month: "Feb", revenue: 4200000 },
    { month: "Mar", revenue: 4800000 },
    { month: "Apr", revenue: 5100000 },
    { month: "May", revenue: 5800000 },
    { month: "Jun", revenue: 6200000 },
  ];

  const expenseByCat = [
    { category: "Salaries", amount: 12000000 },
    { category: "Rent & Utilities", amount: 3800000 },
    { category: "Marketing", amount: 5200000 },
    { category: "Software", amount: 1800000 },
    { category: "Other", amount: 5200000 },
  ];

  const topCustomers = [
    { name: "Al Rajhi Trading Co", value: 8420000 },
    { name: "Saudi Telecom", value: 6300000 },
    { name: "Bin Laden Group", value: 5100000 },
    { name: "Aramco Suppliers", value: 4800000 },
    { name: "Riyadh Pharma", value: 3900000 },
  ];

  const recentTx = [
    { id: "INV-2025-1089", customer: "Al Rajhi Co", amount: 125000, status: "Paid" as const, date: "2025-06-18" },
    { id: "INV-2025-1077", customer: "STC", amount: 89000, status: "Pending" as const, date: "2025-06-17" },
    { id: "INV-2025-1065", customer: "Bin Laden", amount: 210000, status: "Overdue" as const, date: "2025-06-10" },
    { id: "INV-2025-1051", customer: "Riyadh Pharma", amount: 156000, status: "Paid" as const, date: "2025-06-08" },
  ];

  const widgets: WidgetMap = {
    revenue: (
      <Card className="h-full">
        <Flex alignItems="start" className="space-x-4">
          <div className="p-3 rounded-lg bg-emerald-100">
            <BanknotesIcon className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <Text>Total Revenue</Text>
            <Metric className="mt-2">45.29M SAR</Metric>
            <BadgeDelta deltaType="increase">+12.5%</BadgeDelta>
          </div>
        </Flex>
      </Card>
    ),
    expenses: (
      <Card className="h-full">
        <Flex alignItems="start" className="space-x-4">
          <div className="p-3 rounded-lg bg-rose-100">
            <ArrowTrendingDownIcon className="h-8 w-8 text-rose-600" />
          </div>
          <div>
            <Text>Total Expenses</Text>
            <Metric className="mt-2">28.12M SAR</Metric>
            <BadgeDelta deltaType="decrease">-4.2%</BadgeDelta>
          </div>
        </Flex>
      </Card>
    ),
    profit: (
      <Card className="h-full">
        <Flex alignItems="start" className="space-x-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <Text>Net Profit</Text>
            <Metric className="mt-2">17.17M SAR</Metric>
            <BadgeDelta deltaType="increase">+18.1%</BadgeDelta>
          </div>
        </Flex>
      </Card>
    ),
    pending: (
      <Card className="h-full">
        <Flex alignItems="start" className="space-x-4">
          <div className="p-3 rounded-lg bg-amber-100">
            <ClockIcon className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <Text>Pending / Overdue</Text>
            <Metric className="mt-2">42 / 8</Metric>
            <BadgeDelta deltaType="moderateIncrease">+3 overdue</BadgeDelta>
          </div>
        </Flex>
      </Card>
    ),
    revenueTrend: (
      <Card className="h-full">
        <Title>Revenue Trend 2025</Title>
        <AreaChart
          className="mt-6 h-80"
          data={revenueData}
          index="month"
          categories={["revenue"]}
          colors={["emerald"]}
          valueFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M SAR`}
        />
      </Card>
    ),
    expensesByCat: (
      <Card className="h-full">
        <Title>Expenses by Category</Title>
        <DonutChart
          className="mt-6"
          data={expenseByCat}
          category="amount"
          index="category"
          valueFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M SAR`}
          colors={["rose", "amber", "indigo", "emerald", "slate"]}
        />
      </Card>
    ),
    topCustomers: (
      <Card className="h-full">
        <Title>Top 5 Customers</Title>
        <BarList
          data={topCustomers}
          className="mt-4"
          valueFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M SAR`}
        />
      </Card>
    ),
    recentTransactions: (
      <Card className="h-full">
        <Title>Recent Transactions</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Invoice</TableHeaderCell>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTx.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.id}</TableCell>
                <TableCell>{tx.customer}</TableCell>
                <TableCell>{tx.amount.toLocaleString()} SAR</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.status === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : tx.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {tx.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    ),
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <Title className="text-3xl font-bold">Accounting Dashboard</Title>
        <Text>Real-time financial insights • {new Date().toLocaleDateString("en-SA")}</Text>
      </div>

      <ResponsiveGrid
        layouts={{ lg: layout }}
        onLayoutChange={(_, newLayout) => setLayout(newLayout.lg || defaultLayout)}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={100}
        margin={[20, 20]}
      >
        {layout.map((item) => (
          <div key={item.i} className="bg-white dark:bg-gray-900 rounded-lg shadow">
            {widgets[item.i]}
          </div>
        ))}
      </ResponsiveGrid>
    </div>
  );
};