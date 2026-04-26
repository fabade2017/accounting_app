# my-accounting-app

<div align="center" style="margin: 30px;">
    <a href="https://refine.dev">
    <img alt="refine logo" src="https://refine.ams3.cdn.digitaloceanspaces.com/readme/refine-readme-banner.png">
    </a>
</div>
<br/>

This [Refine](https://github.com/refinedev/refine) project was generated with [create refine-app](https://github.com/refinedev/refine/tree/master/packages/create-refine-app).

## Getting Started

A React Framework for building internal tools, admin panels, dashboards & B2B apps with unmatched flexibility ✨

Refine's hooks and components simplifies the development process and eliminates the repetitive tasks by providing industry-standard solutions for crucial aspects of a project, including authentication, access control, routing, networking, state management, and i18n.

## Available Scripts

### Running the development server.

```bash
    yarn dev
```

### Building for production.

```bash
    yarn build
```

### Running the production server.

```bash
    yarn start
```

## Learn More

To learn more about **Refine**, please check out the [Documentation](https://refine.dev/docs)

- **REST Data Provider** [Docs](https://refine.dev/docs/core/providers/data-provider/#overview)
- **Ant Design** [Docs](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- **React Router** [Docs](https://refine.dev/docs/core/providers/router-provider/)
- **Custom Auth Provider** [Docs](https://refine.dev/docs/core/providers/auth-provider/)

## License

MIT




// src/pages/dashboard.tsx
// import { useOne, useCustom } from "@refinedev/core";
// import {
//   Card,
//   Title,
//   Metric,
//   Text,
//   Grid,
//   Col,
//   BarChart,
//   DonutChart,
//   AreaChart,
//   BadgeDelta,
// } from "@tremor/react";
/*import { DashboardOutlined } from "@ant-design/icons";
import { useEffect } from "react";

// src/pages/dashboard.tsx
import {
  Card,
  Title,
  Text,
  Grid,
  Col,
  Metric,
  Flex,
  Icon,
  BadgeDelta,
  DeltaType,
  AreaChart,
  DonutChart,
  BarChart,
} from "@tremor/react";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useCustom } from "@refinedev/core";

const cardStyle = "p-6 shadow-sm border border-gray-200 dark:border-gray-700";

export const DashboardPage = () => {
  // Replace these with your real endpoints or keep as mock for now
  const { data: summary } = useCustom<any>({ url: "/api/dashboard/summary", method: "get" });
  const { data: revenue } = useCustom<any>({ url: "/api/dashboard/monthly-revenue", method: "get" });
  const { data: expenses } = useCustom<any>({ url: "/api/dashboard/expenses-by-category", method: "get" });

  const s = summary?.data || { revenue: 45289123, expenses: 28123456, profit: 17165667, pending: 42 };
  const revenueData = revenue?.data || [];
  const expenseData = expenses?.data || [];

  const kpiCards = [
    { title: "Total Revenue", value: s.revenue, icon: BanknotesIcon, color: "emerald", delta: "+12.5%", deltaType: "increase" as DeltaType },
    { title: "Total Expenses", value: s.expenses, icon: ArrowTrendingDownIcon, color: "rose", delta: "-4.2%", deltaType: "decrease" as DeltaType },
    { title: "Net Profit", value: s.profit, icon: ArrowTrendingUpIcon, color: "blue", delta: "+18.1%", deltaType: "increase" as DeltaType },
    { title: "Pending Invoices", value: s.pending, icon: DocumentTextIcon, color: "amber", delta: "+3", deltaType: "moderateIncrease" as DeltaType },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <Title className="text-2xl font-semibold">Accounting Dashboard</Title>
        <Text className="text-gray-600 dark:text-gray-400">Real-time financial overview • {new Date().toLocaleDateString("en-SA")}</Text>
      </div>

      {/* KPI Cards – perfectly sized & aligned */}
      <Grid numItemsSm={2} numItemsLg={4} className="gap-6">
        {kpiCards.map((item) => (
          <Card key={item.title} className={`${cardStyle} hover:shadow-md transition-shadow`}>
            <Flex alignItems="start">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <Icon icon={item.icon} variant="solid" size="md" className={`text-${item.color}-600`} />
              </div>
              <div className="ml-4 truncate">
                <Text className="text-sm text-gray-600 dark:text-gray-400">{item.title}</Text>
                <Metric className="mt-1 text-2xl font-semibold">
                  {item.value.toLocaleString("en-US")} SAR
                </Metric>
                <Flex className="mt-2 space-x-2">
                  <BadgeDelta deltaType={item.deltaType} size="xs">
                    {item.delta}
                  </BadgeDelta>
                </Flex>
              </div>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Revenue Trend */}
        <Card className={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <Title>Revenue Trend 2025</Title>
            <ChartBarIcon className="h-6 w-6 text-gray-500" />
          </div>
          <AreaChart
            data={revenueData}
            index="month"
            categories={["revenue"]}
            colors={["blue"]}
            valueFormatter={(v) => `${Number(v).toLocaleString()} SAR`}
            showLegend={false}
            height="h-72"
          />
        </Card>

        {/* Expenses by Category */}
        <Card className={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <Title>Expenses by Category</Title>
            <UsersIcon className="h-6 w-6 text-gray-500" />
          </div>
          <DonutChart
            data={expenseData}
            category="amount"
            index="category"
            valueFormatter={(v) => `${Number(v).toLocaleString()} SAR`}
            colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
            showLabel={true}
            height="h-72"
          />
        </Card>
      </Grid>
    </div>
  );
};
*/
/*
export const DashboardPage: React.FC = () => {
  // Example: call your existing ASP.NET Core dashboard endpoints
  const { data: summary } = useCustom<any>({
    url: "", // base URL comes from your OpenAPI provider
    method: "get",
    config: {
      // Change these paths to match your real ASP.NET Core endpoints
      url: "/api/dashboard/summary",
    },
  });

  const { data: monthlyRevenue } = useCustom<any>({
    url: "/api/dashboard/monthly-revenue",
    method: "get",
  });

  const { data: expenseByCategory } = useCustom<any>({
    url: "/api/dashboard/expenses-by-category",
    method: "get",
  });

  const summaryData = summary?.data || {};
  const revenueData = monthlyRevenue?.data || [];
  const categoryData = expenseByCategory?.data || [];

  const chartConfig = {
    desktop: {
      label: "Revenue",
      color: "blue",
    },
  };

  return (
    <div className="p-6 space-y-6">
      <Title>Accounting Dashboard</Title>
      <Text>Welcome back! Here's what's happening with your finances today.</Text>

      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <Col>
          <Card decoration="top" decorationColor="blue">
            <Text>Total Revenue</Text>
            <Metric>{summaryData.totalRevenue?.toLocaleString() || "0"} SAR</Metric>
            <BadgeDelta deltaType="moderateIncrease">+12.5%</BadgeDelta>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="emerald">
            <Text>Total Expenses</Text>
            <Metric>{summaryData.totalExpenses?.toLocaleString() || "0"} SAR</Metric>
            <BadgeDelta deltaType="moderateDecrease">-4.2%</BadgeDelta>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="violet">
            <Text>Net Profit</Text>
            <Metric>{summaryData.netProfit?.toLocaleString() || "0"} SAR</Metric>
            <BadgeDelta deltaType="increase">+18.1%</BadgeDelta>
          </Card>
        </Col>
        <Col>
          <Card decoration="top" decorationColor="rose">
            <Text>Pending Invoices</Text>
            <Metric>{summaryData.pendingInvoices || 0}</Metric>
            <BadgeDelta deltaType="moderateIncrease">+3</BadgeDelta>
          </Card>
        </Col>
      </Grid>

      <Grid numItemsMd={1} numItemsLg={2} className="gap-6 mt-6">
        <Card>
          <Title>Revenue Trend (2025)</Title>
          <AreaChart
            className="h-80"
            data={revenueData}
            index="month"
            categories={["revenue"]}
            colors={["blue"]}
            valueFormatter={(v) => `${v.toLocaleString()} SAR`}
          />
        </Card>

        <Card>
          <Title>Expenses by Category</Title>
          <DonutChart
            className="h-80"
            data={categoryData}
            category="amount"
            index="category"
            valueFormatter={(v) => `${v.toLocaleString()} SAR`}
            colors={["slate", "violet", "indigo", "rose", "cyan", "amber"]}
          />
        </Card>
      </Grid>

      <Card className="mt-6">
        <Title>Profit & Loss Overview</Title>
        <BarChart
          className="h-80"
          data={revenueData}
          index="month"
          categories={["revenue", "expenses"]}
          colors={["blue", "red"]}
          stack={true}
          valueFormatter={(v) => `${v.toLocaleString()} SAR`}
        />
      </Card>
    </div>
  );
};*/# accounting_app
