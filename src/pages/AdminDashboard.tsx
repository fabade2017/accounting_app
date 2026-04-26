// src/pages/AdminDashboard.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Select,
  message,
  Card,
  Row,
  Col,
  Popconfirm,
  Drawer,
  Form,
  Space,
  DatePicker,
  Flex,
} from "antd";
import { transformDataByMapping } from "../utils/chartTransform";

import {
  SaveOutlined,
  PlusCircleOutlined,
  DragOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  UserOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { WidgetModal } from "../components/WidgetModal";
import { ThemeContext } from "../contexts/ThemeContext";
import ThemeEditorDashboard from "./ThemeEditorDashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import KpiManagerDrawer from "../components/KpiManagerDrawer";

const { Option } = Select;

const DASHBOARD_ID = 2;
const WIDGET_HEIGHT_UNIT = 220;
const NUM_COLUMNS = 3;

//const CHART_COLORS = ["#a78bfa", "#8b5cf6", "#60a5fa", "#4c1d95", "#7c3aed", "#3b82f6"];
const CHART_COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa541c",
];

const COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa541c",
];
// const widgetMeta: Record<number, { name: string; type: string }> = {
//   1: { name: "Sales Chart", type: "Chart" },
//   2: { name: "User Table", type: "Table" },
//   3: { name: "KPI Card", type: "Card" },
//   4: { name: "Revenue Chart", type: "Chart" },
// };

interface Widget {
  DashboardWidgetId: number;
  DashboardId: number;
  WidgetId: number;
  WidgetName?: string;
  Type?: string;
  Settings: string;
  PositionX: number;
  PositionY: number;
  Width: number;
  Height: number;
}

interface Procedure {
  ProcedureId: number;
  ProcedureName: string;
}

interface User {
  UserId: number;
  Username: string;
  Permissions: string[];
}

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const AdminDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [form] = Form.useForm();
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedProc, setSelectedProc] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [procParamsDef, setProcParamsDef] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const userId = localStorage.getItem("userid")??0;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5017/api";
const [open, setOpen] = useState(false);
const [kpiDrawerOpen, setKpiDrawerOpen] = useState(false);
//const [dashboardKPIs, setDashboardKPIs] = useState<any[]>([]);
// const [kpiReloadKey, setKpiReloadKey] = useState(0);
// useEffect(() => {
//   const loadLookups = async () => {
//     const [customers, suppliers, companies] = await Promise.all([
//       fetch("/api/customers").then(r => r.json()),
//       fetch("/api/suppliers").then(r => r.json()),
//       fetch("/api/companies").then(r => r.json()),
//     ]);

//     setLookupOptions({
//       customers: customers.map(c => ({ label: c.Name, value: c.Id })),
//       suppliers: suppliers.map(s => ({ label: s.Name, value: s.Id })),
//       companies: companies.map(c => ({ label: c.Name, value: c.Id })),
//     });
//   };

//   loadLookups();
// }, []);


  // Load default widgets from API
  // const loadWidgets = async () => {
  //   console.log(`Fine:: ${import.meta.env.VITE_API_BASE_URL}/dashboardwidgets?dashboardId=${DASHBOARD_ID}`);
  //   try {
  //     const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboardwidgets?dashboardId=${DASHBOARD_ID}`);
  //     const data = await res.json();
  //   console.log(`loadwidgets::: `+ JSON.stringify(data));
  //     const enriched = (data || []).map((w: any) => ({
  //       ...w,
  //       WidgetName: w.WidgetName || widgetMeta[w.WidgetId]?.name || `Widget ${w.WidgetId}`,
  //       Type: w.Type || widgetMeta[w.WidgetId]?.type || "Unknown",
  //     }));
  // // WidgetName: w.WidgetName || widgetMeta[w.WidgetId]?.name || `Widget ${w.WidgetId}`,
  // //       Type: w.Type || widgetMeta[w.WidgetId]?.type || "Unknown",
  //       console.log(`enriched: ` + JSON.stringify(enriched));
  //     setWidgets(enriched || []);
  //   } catch {
  //     message.error("Failed to load widgets");
  //     setWidgets([]);
  //   }
  // };

  const loadProcedures = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ProcedureData`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const filtered: Procedure[] = (data || [])
        .filter((p: any) => p?.ProcedureId !== undefined)
        .map((p: any) => ({ ProcedureId: Number(p.ProcedureId), ProcedureName: String(p.ProcedureName) }));
      const distinctById = Array.from(new Map(filtered.map((p) => [p.ProcedureId, p])).values());
      distinctById.sort((a, b) => a.ProcedureName.localeCompare(b.ProcedureName, undefined, { sensitivity: "base" }));
      setProcedures(distinctById);
    } catch (err) {
      console.error("Failed to load procedures", err);
      setProcedures([]);
    }
  };
// const renderParamInput = (param: ProcParamDef) => {
//   switch (param.type) {
//     case "date":
//       return <DatePicker style={{ width: "100%" }} />;

//     case "lookup":
//       return (
//         <Select
//           showSearch
//           allowClear
//           placeholder={`Select ${param.label || param.name}`}
//           options={lookupOptions[param.source!]}
//         />
//       );

//     default:
//       return <Input />;
//   }
// };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`);
      setUsers(await res.json());
    } catch {
      message.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Save dashboard layout
  const saveDashboard = async () => {
   //message.success("Dashboard Saving ..!");
    if (!userId) {
      message.error("User not logged in");
      return;
    }

    const config = {
      kpiData: [], // Add later if saving KPIs
      widgets,
    };
console.log(`Dashboard Save:::`, JSON.stringify({
          Action: "CREATE",
          UserId: parseInt(userId),
          Config: config //, //  Result: "",
       
        }))
    try {
      const res = await fetch(`${apiBaseUrl}/procedures/sp_userdashboard_crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: "CREATE",
          UserId: parseInt(userId),
          Config: config //, //  Result: "",
       
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      message.success("Dashboard saved successfully!");
    } catch (err) {
      console.error(err);
      message.error("Failed to save dashboard");
    }
  };

  // Load saved dashboard layout
  const loadDashboard = async () => {

   //  console.log("S111111::>"+userId);
    if (!userId) return;

    try {
      const res = await fetch(`${apiBaseUrl}/procedures/usp_userdashboard_crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: "READ",
          UserId: parseInt(userId),
          Config: "" ,
          Result: "",
        }),
      });

      if (!res.ok) throw new Error("Load failed");

      const json = await res.json();
    //  console.log("So:" +JSON.stringify(json));
      const configJsonString = Array.isArray(json) ? json[0]?.Config : json.Config;
  console.log("So:" +JSON.stringify(configJsonString));
      if (configJsonString) {
        const savedConfig = JSON.parse(configJsonString);
        console.log("So-so:" +JSON.stringify(savedConfig));
        if (Array.isArray(savedConfig.widgets)) {
          setWidgets(savedConfig.widgets);
          message.success("Custom layout loaded!");
        }
      }
    } catch (err) {
      console.error("No saved layout found or load failed");
      // Silently fail — use default widgets
    }
  };
// const loadDashboardKPIs = async () => {
//   // const res = await fetch(`${apiBaseUrl}/kpis/user/${userId}`);
//   // const data = await res.json();
//   // setDashboardKPIs(data);
//   fetchKPIs();
// };

// useEffect(() => {
//   console.log("Superman");
//   loadDashboardKPIs();
// }, [kpiReloadKey]);

useEffect(() => {
  fetchKPIs();
}, []);
  // Drag & Drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(widgets);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((w, idx) => ({
      ...w,
      PositionX: idx % NUM_COLUMNS,
      PositionY: Math.floor(idx / NUM_COLUMNS),
    }));

    setWidgets(updated);
    message.success("Layout updated — click Save to persist");
  };

  // Call Procedure for Widget Data
  // const callProcAndGetResultSets = async (procName: string, params: Record<string, any>): Promise<any[]> => {
   
  //   try {
  //     let parameters = Object.keys(params || {})
  //       .map((k) => params[k])
  //       .filter((v) => v !== undefined && v !== null && v !== "")
  //       .map((v) => `'${v}'`)
  //       .join(",");
  //     const res = await fetch(`${apiBaseUrl}/procedures/genericprocedure`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ProcedureName: procName, Parameters: parameters }),
  //     });
  //     if (!res.ok) throw new Error(res.statusText);
  //     const data = await res.json();
  //     return Array.isArray(data) ? data : [data];
  //   } catch (err) {
  //     console.error("callProc error", err);
  //     return [];
  //   }
  // };
          // const callProcAndGetResultSets = async (
          //   procName: string,
          //   params: Record<string, any>,
          //   paramDefs: { name: string }[]
          // ): Promise<any[]> => {
          //   try {
          //     const uniqueParamDefs = Array.from(new Map(paramDefs.map(p => [p.name, p])).values());

          //     const orderedParams = uniqueParamDefs
          //       .map(p => params[p.name])
          //       .filter(v => v !== undefined && v !== null && v !== "")
          //       .map(v => `'${String(v).replace(/'/g, "''")}'`)
          //       .join(",");
          // console.log(`ProcedureName:`+JSON.stringify(procName));
          // console.log(`Parameters:`+JSON.stringify(orderedParams));
          //     const res = await fetch(`${apiBaseUrl}/procedures/genericprocedure`, {
          //       method: "POST",
          //       headers: { "Content-Type": "application/json" },
          //       body: JSON.stringify({
          //         ProcedureName: procName,
          //         Parameters: orderedParams,
          //       }),
          //     });

          //     if (!res.ok) throw new Error(res.statusText);

          //     const data = await res.json();
          //     return Array.isArray(data) ? data : [data];
          //   } catch (err) {
          //     console.error("callProc error:", err);
          //     return [];
          //   }
          // };
// const callProcAndGetResultSets = async (
//   procName: string,
//   params: Record<string, any> // ,
//   //paramDefs: { name: string }[]
// ): Promise<any[]> => {
//   try {
//     // Deduplicate paramDefs by name
//     const uniqueParamDefs = Array.from(new Map(paramDefs.map(p => [p.name, p])).values());
//     console.log("API params:  uniqueParamDefs ::  ->",uniqueParamDefs,':::'); // Optional debug
//     console.log("API params:  paramDefs ::  ->",paramDefs,':::'); 
//     // Build ordered params
//     const orderedParams = uniqueParamDefs
//       .map(p => params[p.name])
//       .filter(v => v !== undefined && v !== null && v !== "")
//       .map(v => `'${String(v).replace(/'/g, "''")}'`)
//       .join(",");

//     console.log("API params:",procName,':::', orderedParams); // Optional debug

//     const res = await fetch(`${apiBaseUrl}/procedures/genericprocedure`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         ProcedureName: procName,
//         Parameters: orderedParams,
//       }),
//     });

//     if (!res.ok) throw new Error(res.statusText);

//     const data = await res.json();
//     return Array.isArray(data) ? data : [data];
//   } catch (err) {
//     console.error("callProc error:", err);
//     return [];
//   }
// };
const callProcAndGetResultSets = async (
  procName: string,
  params: Record<string, any>
): Promise<any[]> => {
  try {
    const orderedParams = Object.values(params)
      .filter(v => v !== undefined && v !== null && v !== "")
      .map(v => `'${String(v).replace(/'/g, "''")}'`)
      .join(",");

    console.log("API params:", procName, orderedParams);

    const res = await fetch(`${apiBaseUrl}/procedures/genericprocedure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ProcedureName: procName,
        Parameters: orderedParams,
      }),
    });

    if (!res.ok) throw new Error(res.statusText);

    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    console.error("callProc error:", err);
    return [];
  }
};

  // Widget Renderer
        const WidgetRenderer = ({ widget }: { widget: Widget }) => {
          const [data, setData] = useState<any[] | null>(null);
          const settings = useMemo(() => {
            try { return JSON.parse(widget.Settings || "{}"); } catch { return {}; }
          }, [widget.Settings]);
//console.log(`Settings:` +JSON.stringify(settings));
//           useEffect(() => {
//             let mounted = true;
//             const fetchData = async () => {
//               if (!settings.proc) return setData([]);
//               // const rs = await callProcAndGetResultSets(settings.proc, settings.params || {});
//               // if (mounted) setData(rs);
//               const rs = await callProcAndGetResultSets(
//   settings.proc,
//   settings.params || {}
// );

// const transformed =
//   settings.chartType === "table" || settings.chartType === "card"
//     ? rs
//     : transformDataByMapping(
//         rs,
//         settings.chartType,
//         settings.mapping
//       );

// if (mounted) setData(transformed);

//             };
//             fetchData();
//             return () => { mounted = false; };
//           }, [widget.Settings]);
// useEffect(() => {
//   let mounted = true;

//   const fetchData = async () => {
//     // if (!settings.proc) {
//     //   setData([]);
//     //   return;
//     // }
// // 1️⃣ Static data has priority
// if (Array.isArray(settings.data)) {
//   setData(settings.data);
//   return;
// }

// // 2️⃣ Procedure-driven data
// if (!settings.proc) {
//   setData([]);
//   return;
// }

//     const rs = await callProcAndGetResultSets(
//       settings.proc,
//       settings.params || {},
//       procParamsDef
//     );

//     const transformed =
//       settings.chartType === "table" || settings.chartType === "card"
//         ? rs
//         : transformDataByMapping(rs, settings.chartType, settings.mapping);

//     if (mounted) setData(transformed);
//   };

//   fetchData();
//   return () => { mounted = false; };
// }, [
//   settings.proc,
//   JSON.stringify(settings.params),
//   settings.chartType,
//   JSON.stringify(settings.mapping),
// ]);

useEffect(() => {
  let mounted = true;

  const fetchData = async () => {
    // ✅ STATIC DATA (your current widgets)
    if (Array.isArray(settings.data)) {
      if (mounted) setData(settings.data);
      return;
    }

    // ✅ PROCEDURE DATA
    if (!settings.proc) {
      if (mounted) setData([]);
      return;
    }

    const rs = await callProcAndGetResultSets(
      settings.proc,
      settings.params || {} //,
 //     procParamsDef
    );

    const transformed =
      settings.chartType === "table" || settings.chartType === "card"
        ? rs
        : transformDataByMapping(rs, settings.chartType, settings.mapping);

    if (mounted) setData(transformed);
  };

  fetchData();
  return () => { mounted = false; };
}, [
  settings.proc,
  JSON.stringify(settings.params),
  JSON.stringify(settings.data),
  settings.chartType,
  JSON.stringify(settings.mapping),
]);


          const chartHeight = (widget.Height || 2) * WIDGET_HEIGHT_UNIT - 80;
          const chartType = settings.chartType || "bar";

          if (data === null) return <div style={{ height: chartHeight, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>Loading...</div>;
          if (!data || data.length === 0) return <div style={{ height: chartHeight, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>No data</div>;

          // Simplified rendering — extend as needed
          if (chartType === "table") {
            const columns = Object.keys(data[0] || {}).map((key) => ({ title: key, dataIndex: key, key }));
            return <Table dataSource={data} columns={columns} pagination={false} size="small" />;
          }
  return (
 <div style={{ height: chartHeight, width: "100%" }}>
  <div style={{ textAlign: "center", fontSize: 16, marginBottom: 8 }}>
    {widget.WidgetName}
  </div>

  {chartType === "bar" && (
    <ResponsiveContainer width="100%" height="90%">
      <BarChart data={data}>
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )}

  {chartType === "line" && (
    <ResponsiveContainer width="100%" height="90%">
      <LineChart data={data}>
        <XAxis dataKey="x" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="y" stroke="#22c55e" />
      </LineChart>
    </ResponsiveContainer>
  )}

  {chartType === "pie" && (
    <ResponsiveContainer width="100%" height="90%">
      {/* <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          fill="#6366f1"
          label
        />
        <Tooltip />
      </PieChart> */}
   <PieChart>
    <Pie
      data={data}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
       paddingAngle={3}
 //      label={false} // 🔥 turn OFF labels
    //  innerRadius={40} // donut chart (more readable)
      outerRadius={Math.min(chartHeight / 2 - 20, 100)} // adaptive radius
   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
    >
      {data.map((_entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
  

    </ResponsiveContainer>
  )}
  {chartType === "don" && (
    <ResponsiveContainer width="100%" height="90%">
      {/* <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          fill="#6366f1"
          label
        />
        <Tooltip />
      </PieChart> */}
   <PieChart>
    <Pie
      data={data}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      innerRadius={40} // donut chart (more readable)
      outerRadius={Math.min(chartHeight / 2 - 20, 100)} // adaptive radius
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
    >
      {data.map((_entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
  

    </ResponsiveContainer>
  )}
  {chartType === "table" && (
    <pre style={{ fontSize: 12, overflow: "auto" }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  )}
</div>

  );

         // return <div style={{ height: chartHeight, padding: 20, color: "#e2e8f0" }}>Widget: {widget.WidgetName}</div>;
        };

const [kpiData, setKpiData] = useState<any[]>([]);
const formatCompact = (value: number | string) => {
  const num = Number(value) || 0;

  return new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num);
};
// Add this function
const fetchKPIs = async () => {
  try {
   // const res = await fetch(`${apiBaseUrl}/procedures/sp_userdashboard_crud`);  // Change to your real endpoint, e.g. /procedures/sp_GetKPIs
    
       const res = await fetch(`${apiBaseUrl}/procedures/sp_userdashboard_crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: "KPIS",
          UserId: userId!,
          Config: null // ,
          // Result: "",
        }),
      });

    if (!res.ok) throw new Error("Failed to load KPIs");

    const json = await res.json();
    console.log(`json - ${userId}:` + JSON.stringify(json));
    const kpis = Array.isArray(json) ? json : [json];

    setKpiData(kpis.map((kpi: any) => ({
      title: kpi.Title || kpi.title || "Untitled KPI",
      value: formatCompact(kpi.Value) || formatCompact(kpi.value) || "0",
      trend: kpi.Trend || kpi.trend || "+0%",
      trendColor: kpi.TrendColor || (kpi.trend?.startsWith("+") ? "#60a5fa" : "#f87171"),
      iconComponent: (
        kpi.Icon === "Dollar" ? <DollarOutlined /> :
        kpi.Icon === "User" ? <UserOutlined /> :
        kpi.Icon === "Invoice" ? <FileTextOutlined /> :
        kpi.Icon === "Order" ? <ShoppingCartOutlined /> :
        <DollarOutlined />
      ),
    })));
  } catch (err) {
    console.error("KPI load failed:", err);
    message.error("Failed to load KPIs");

    // Fallback static KPIs
    setKpiData([
      { title: "Total Revenue", value: "$124,580", trend: "+12.5%", trendColor: "#60a5fa", iconComponent: <DollarOutlined /> },
      { title: "Active Users", value: "2,847", trend: "+8.2%", trendColor: "#60a5fa", iconComponent: <UserOutlined /> },
      { title: "Open Invoices", value: "142", trend: "-3", trendColor: "#f87171", iconComponent: <FileTextOutlined /> },
      { title: "Pending Orders", value: "89", trend: "+19", trendColor: "#60a5fa", iconComponent: <ShoppingCartOutlined /> },
    ]);
  }
};

// Call it on mount
useEffect(() => {
  loadDashboard();
  fetchKPIs();  // ← Dynamic KPIs
 //loadWidgets();
  loadProcedures();
  loadUsers();
  setLoading(false);
}, []);
  // useEffect(() => {
  //   loadDashboard();     // Load saved layout first
  //   loadWidgets();       // Fallback to default widgets
  //   loadProcedures();
  //   loadUsers();
  //   setLoading(false);
  // }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: "24px 0" }}>
     {/* Dynamic KPI Cards */}
<Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
  {kpiData.map((kpi, idx) => (
    <Col key={idx} xs={24} sm={12} md={6}>
      <Card
        hoverable
        style={{
          background: "rgba(30, 41, 59, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(167, 139, 250, 0.2)",
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(167, 139, 250, 0.1)",
          transition: "all 0.3s ease",
        }}
        styles={{
          body: { padding: "24px" },
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>{kpi.title}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#e2e8f0" }}>{kpi.value}</div>
            <div style={{ fontSize: 12, color: kpi.trendColor, marginTop: 8 }}>{kpi.trend}</div>
          </div>
          <div style={{ fontSize: 48, color: "#a78bfa", opacity: 0.8 }}>
            {kpi.iconComponent}
          </div>
        </div>
      </Card>
    </Col>
  ))}
</Row>
      {/* Action Bar */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <Button type="primary" size="large" icon={<PlusCircleOutlined />} onClick={() => { setEditingWidget(null); form.resetFields(); setModalVisible(true); }}>
            Add Widget
          </Button>
          <Button type="primary" size="large" icon={<SaveOutlined />} onClick={saveDashboard} style={{ marginLeft: 12 }}>
            Save Dashboard
          </Button>
         <Button type="primary"  size="large"  style={{ marginLeft: 12 }} onClick={() => setDrawerOpen(true)}>
              Open Theme Editor
            </Button>

  <Button  style={{ marginLeft: 12 }}
    size="large"
    icon={<SettingOutlined />}
    onClick={() => setKpiDrawerOpen(true)}
  />
        </Col>
        <Col>
        
          <Select style={{ width: 300 }} size="large" placeholder="Quick add from procedure..." onChange={(v) => { const proc = procedures.find((p) => p.ProcedureName === v); setSelectedProc(proc?.ProcedureId ?? null); setModalVisible(true); }}>
            {procedures.map((p) => (
              <Option key={p.ProcedureId} value={p.ProcedureName}>
                {p.ProcedureName.replace(/^sp_/i, "")}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Main Layout */}
   
      {/* <Row gutter={[24, 24]}> */}
        <Col span={32}>
          <Card title={<span style={{ fontWeight: 600, fontSize: 18  }}>Dashboard Widgets</span>} styles={{ body: { padding: 0 }, width:"100%"  }}>
             {/* <Button
  type="primary"
  shape="circle"
  icon={<SettingOutlined />}
  style={{ position: "fixed", bottom: 24, right: 24 }}
  onClick={() => setKpiDrawerOpen(true)}
/> */}
                     {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
  <h3>KPIs</h3>

  <Button
    size="small"
    icon={<SettingOutlined />}
    onClick={() => setKpiDrawerOpen(true)}
  />
</div> */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="widgets">
     
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",width:"100%", gap: 24, padding: 24 }}>
                    {Array.isArray(widgets) && widgets.length > 0 ? (
                      widgets.map((widget, index) => (
                        <Draggable key={widget.DashboardWidgetId} draggableId={String(widget.DashboardWidgetId)} index={index}>
                          {(provided, _snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} style={{ ...provided.draggableProps.style }}>
                              <Card
                                hoverable
                                title={<span style={{ fontWeight: 600 }}>{widget.WidgetName}</span>}
                                styles={{
                                  header: { background: "linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(96, 165, 250, 0.15))", borderBottom: "1px solid rgba(255,255,255,0.1)" },
                                  body: { padding: 16 },
                                }}
                                extra={
                                  <Space {...provided.dragHandleProps} style={{ cursor: "grab" }}>
                                    <DragOutlined />
                                    <Button type="text" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); setEditingWidget(widget); setModalVisible(true); }} />
                                    <Popconfirm title="Delete?" onConfirm={() => setWidgets(ws => ws.filter(x => x.DashboardWidgetId !== widget.DashboardWidgetId))}>
                                      <Button type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>
                                  </Space>
                                }
                              >
                                {/* <div style={{ minHeight: 240 }}>
                                  <WidgetRenderer widget={widget} />
                                </div> */}
                                <div style={{ minHeight: (widget.Height || 3) * WIDGET_HEIGHT_UNIT - 80 }}>
  <WidgetRenderer widget={widget} />
</div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 80, color: "#94a3b8" }}>
                        <AppstoreAddOutlined style={{ fontSize: 64, marginBottom: 16, opacity: 0.5 }} />
                        <div style={{ fontSize: 18 }}>No widgets yet</div>
                        <div style={{ fontSize: 14 }}>Click "Add Widget" to begin</div>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </Card>
        </Col>

        {/* <Col span={6} >
          <Card title="Theme Editor" style={{ marginBottom: 24 }}>
            
          </Card>
          <Card title="Users Overview">
            <Table dataSource={users} rowKey="UserId" columns={[{ title: "User", dataIndex: "Username" }, { title: "Perms", dataIndex: "Permissions", render: (p: string[]) => p?.join(", ") }]} pagination={false} size="small" />
          </Card>
        </Col> */}
      {/* </Row> */}

      <Drawer title="Theme Editor" open={drawerOpen} placement="right" width="90%" onClose={() => setDrawerOpen(false)}>
        <ThemeEditorDashboard onClose={() => setDrawerOpen(false)} />
      </Drawer>

      <WidgetModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        editingWidget={editingWidget}
        setEditingWidget={setEditingWidget}
        form={form}
        procParamsDef={procParamsDef}
        setProcParamsDef={setProcParamsDef}
        previewData={previewData}
        setPreviewData={setPreviewData}
        selectedProc={selectedProc}
        setSelectedProc={setSelectedProc}
        procedures={procedures}
        callProcAndGetResultSets={callProcAndGetResultSets}
        onSave={(w) => {
          setWidgets((ws) => {
            const idx = ws.findIndex((x) => x.DashboardWidgetId === w.DashboardWidgetId);
            if (idx >= 0) {
              const copy = [...ws];
              copy[idx] = w;
              return copy;
            }
            return [w, ...ws];
          });
          setModalVisible(false);
          setEditingWidget(null);
          form.resetFields();
        }}
      />
      <KpiManagerDrawer
  open={kpiDrawerOpen}
  onClose={() => setKpiDrawerOpen(false)}
   onSaved={async () => {
    await fetchKPIs();      // 🔥 refresh dashboard
    setKpiDrawerOpen(false);
  }}
  userId={userId}
/>

    </div>
  );
};