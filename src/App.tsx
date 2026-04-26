// src/App.tsx
import { useEffect, useState } from "react";
import { Layout, Menu, Spin } from "antd";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { GenericResourcePage } from "./components/GenericResourcePage";
import { GenericReportPage } from "./components/GenericReportPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ThemeEditorDashboard } from "./pages/ThemeEditorDashboard";
import { Login } from "./pages/Login";
import { AppHeader } from "./components/AppHeader";
import { PrivateRoute } from "./components/PrivateRoute";
import { getSwaggerResources, SwaggerResource } from "./utils/swaggerResources";
import { pluralize } from "./Pluralize";
import { ThemeProvider } from "./contexts/ThemeContext";
import SystemFlowPage from "./components/SystemFlowPage";
import {formatProcedureName} from "./utils/formatName";
import Drawer from "antd/lib/drawer";
import '@ant-design/v5-patch-for-react-19';
import { message } from "antd/lib";
import {AdminDashboardUsers} from "./pages/AdminDashboardUsers";
const { Sider, Content } = Layout;

export const App = () => {
  const [menuData, setMenuData] = useState<any[]>([]);
  const [resources, setResources] = useState<SwaggerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      loadMenu();
      loadSwagger();
    }
  }, [token]);

  // ------------------------------
  // Load Buckets & SubBuckets
  // ------------------------------
  // const loadMenu = async () => {
  //   try {
  //     const [bucketsRes, subBucketsRes, bucketsRolesRes] = await Promise.all([
  //       fetch("http://localhost:3000/api/Buckets", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }),
  //       fetch("http://localhost:3000/api/SubBuckets", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }),
  //       fetch("http://localhost:3000/api/bucketsroles", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }),
  //     ]);

  //     const buckets = await bucketsRes.json();
  //     const subBuckets = await subBucketsRes.json();
  //     const bucketRoles = await bucketsRolesRes.json();

  //     const myRoleId = parseInt(localStorage.getItem("roleid") || "0");
  //     const allowedBucketIds = bucketRoles
  //       .filter((br: any) => br.RoleId === myRoleId)
  //       .map((br: any) => br.BucketId);

  //     const menu = buckets
  //       .filter((bucket: any) => allowedBucketIds.includes(bucket.Id))
  //       .map((bucket: any) => ({
  //         key: `bucket_${bucket.Id}`,
  //         label: bucket.Name,
  //         children: subBuckets
  // .filter((sb: any) => sb.BucketId === bucket.Id)
  // .map((sb: any) => ({
  //   key: `/${sb.Name.toLowerCase()}`,
  //   label: <Link to={`/${sb.Name.toLowerCase()}`}>
  //     {sb.Name.startsWith("sp_") 
  //       ? formatProcedureName(sb.Name) 
  //       : sb.Name}
  //   </Link>,
  // })),
  //         // children: subBuckets
  //         //   .filter((sb: any) => sb.BucketId === bucket.Id)
  //         //   .map((sb: any) => ({
  //         //     key: `/${sb.Name.toLowerCase()}`,
  //         //     label: <Link to={`/${sb.Name.toLowerCase()}`}>{sb.Name}</Link>,
  //         //   })),
  //       }));

  //     menu.unshift(
  //       { key: "/SystemFlow", label: <Link to="/SystemFlow">System Flow</Link> },
  //       { key: "/theme-editor", label: <Link to="/theme-editor">Theme Editor</Link> },
  //       { key: "/admin-dashboard", label: <Link to="/admin-dashboard">Admin Dashboard</Link> }
  //     );

  //     menu.push({
  //       key: "logout",
  //       label: <a onClick={handleLogout}>Logout</a>,
  //     });

  //     setMenuData(menu);
  //   } catch (err) {
  //     console.error("Failed to load menu:", err);
  //   }
  // };
const loadMenu = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const [bucketsRes, subBucketsRes, bucketsRolesRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API2_BASE_URL}/Buckets`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API2_BASE_URL}/SubBuckets`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API2_BASE_URL}/bucketsroles`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const buckets = await bucketsRes.json();
    const subBuckets = await subBucketsRes.json();
    const bucketRoles = await bucketsRolesRes.json();

    const myRoleId = parseInt(localStorage.getItem("roleid") || "0");
    const allowedBucketIds = bucketRoles
      .filter((br: any) => br.RoleId === myRoleId)
      .map((br: any) => br.BucketId);

    const menu = buckets
      .filter((bucket: any) => allowedBucketIds.includes(bucket.Id))
      .map((bucket: any) => ({
        key: `bucket_${bucket.Id}`,
        label: formatProcedureName(bucket.Name),  // Also format bucket names!
        children: subBuckets
          .filter((sb: any) => sb.BucketId === bucket.Id)
          .map((sb: any) => ({
            key: `/${sb.Name.toLowerCase()}`,
            label: (
              <Link to={`/${sb.Name.toLowerCase()}`}>
                {formatProcedureName(sb.Name)}
              </Link>
            ),
          })),
      }));

    // Static top items — also formatted (safe, won't change much)
    menu.unshift(
      { key: "/admin-dashboard", label: <Link to="/admin-dashboard">Admin Dashboard</Link> },
      { key: "/theme-editor", label: <Link to="/theme-editor">Theme Editor</Link> },
      { key: "/SystemFlow", label: <Link to="/SystemFlow">System Flow</Link> }
    );

    // Logout at bottom
    menu.push({
      key: "logout",
      label: <a onClick={handleLogout}>Logout</a>,
    });

    setMenuData(menu);
  } catch (err) {
    console.error("Failed to load menu:", err);
    message.error("Failed to load navigation menu");
  }
};
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const loadSwagger = async () => {
    try {
      const swagger = await getSwaggerResources();
      setResources(swagger);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    setSearchTerm(trimmed);

    if (!trimmed) {
      setSearchResults([]);
      setDrawerOpen(false);
      return;
    }

    const results: any[] = [];

    menuData.forEach((bucket) => {
      if (bucket.children) {
        bucket.children.forEach((sb: any) => {
          const subName = sb.label?.props?.children || "";
          if (subName.toLowerCase().includes(trimmed)) {
            results.push({
              name: subName,
              route: sb.key,
            });
          }
        });
      }
    });

    const staticRoutes = [
      { name: "Admin Dashboard", route: "/admin-dashboard" },
      { name: "Theme Editor", route: "/theme-editor" },
      { name: "System Flow", route: "/SystemFlow" },
    ];

    staticRoutes.forEach((r) => {
      if (r.name.toLowerCase().includes(trimmed)) {
        results.push(r);
      }
    });

    setSearchResults(results);
    setDrawerOpen(true);
  };

  const getFieldsFor = (name: string) => {
    const match = resources.find((r) => r.name.toLowerCase() === pluralize(name).toLowerCase());
    return match?.fields ?? [];
  };

  const getReportFieldsFor = (name: string) => {
    const match = resources.find((r) => r.name.toLowerCase() === name.toLowerCase());
    return match?.fields ?? [];
  };

  const moduleRoutes = menuData
    .flatMap((b) => b.children ?? [])
    .map((r) => ({ ...r, resourceName: r.key.replace("/", "") }));

  // ------------------------------
  // If not logged in → show only Login
  // ------------------------------
  if (!token) {
    return (
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Login />} /> {/* Redirect all to login */}
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  // ------------------------------
  // Logged in → show full app
  // ------------------------------
  if (loading) {
    return <Spin fullscreen tip="Loading..." style={{ marginTop: 100, width: "100%" }} />;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout style={{ minHeight: "100vh" }}>
        {/*   <Sider width={250} style={{ background: "var(--sidebar-bg)" }}>
            <Menu
              mode="inline"
              style={{ height: "100%", borderRight: 0, background: "var(--sidebar-bg)" }}
              items={menuData}
            />
          </Sider>*/}
 <Sider 
  width={280} 
  style={{ 
    background: "var(--bg-sidebar)",
    position: "fixed",
    left: 0,
    top: 80,
    bottom: 0,
    overflowY: "auto",        // ← THIS IS KEY: enables vertical scroll
    overflowX: "hidden",
    zIndex: 999,
    backdropFilter: "blur(12px)",
    borderRight: "1px solid var(--border-color)"
  }}
>{/* Logo */}
<div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
  {/* <h1
    style={{
      fontSize: 24,
      fontWeight: 800,
      background: "linear-gradient(to right, #a78bfa, #60a5fa)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "1px",
    }}
  >
    ERP Pro
  </h1> */}

  <div
  style={{
    display: "flex",
    alignItems: "center",
  }}
>
  <img
    src="/logodef.png"
    alt="ERP Pro"
    style={{
      height: 40,
      width: "auto",
    }}
  />
</div>

</div>
  <Menu
              mode="inline"
              style={{ height: "100%", borderRight: 0, background: "var(--sidebar-bg)" }}
              items={menuData}
            /></Sider> 
          <Layout>
            <AppHeader onSearchChange={handleSearchChange} />

            <Content
              style={{
                    marginLeft: 280,           // Push content right of fixed sider
                    marginTop:10,
                background: "var(--bg-primary)", // background: "var(--background-color)",
                color: "var(--text-color)",
                padding: 20,
              }}
            > 

     {/*        <Content
  style={{
    marginLeft: 280,           // Push content right of fixed sider
    padding: "24px",
    minHeight: "calc(100vh - 70px)",
    background: "var(--bg-primary)",
  }}
>*/}
              <Routes>
                <Route path="/admin-dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/theme-editor" element={<PrivateRoute><ThemeEditorDashboard /></PrivateRoute>} />
                <Route path="/SystemFlow" element={<PrivateRoute><SystemFlowPage /></PrivateRoute>} />

                {moduleRoutes.map((route: any) => {
                  const resourceName = route.resourceName;
                  if (resourceName.toLowerCase().includes("report")) {
                    return (
                      <Route
                        key={route.key}
                        path={route.key}
                        element={
                          <PrivateRoute>
                            <GenericReportPage
                              resourceName={resourceName}
                             apiBaseUrl = {import.meta.env.VITE_API_BASE_URL}
                              fields={getReportFieldsFor(resourceName)}
                            />
                          </PrivateRoute>
                        }
                      />
                    );
                  }
                  return (
                    <Route
                      key={route.key}
                      path={route.key}
                      element={
                        <PrivateRoute>
                          <GenericResourcePage
                            resourceName={resourceName}
                            apiBaseUrl={import.meta.env.VITE_API_BASE_URL}
                            fields={getFieldsFor(resourceName)}
                          />
                        </PrivateRoute>
                      }
                    />
                  );
                })}

                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      {/* <h2>Select a module from the sidebar</h2> */}
                        <AdminDashboardUsers />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Content>

            <Drawer
              title="Search Results"
              placement="right"
              width={350}
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              {searchResults.length === 0 ? (
                <p>No results found.</p>
              ) : (
                searchResults.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      window.location.href = item.route;
                      setDrawerOpen(false);
                    }}
                    style={{
                      padding: 12,
                      background: "#f5f5f5",
                      borderRadius: 6,
                      marginBottom: 12,
                      cursor: "pointer",
                    }}
                  >
                    {item.name}
                  </div>
                ))
              )}
            </Drawer>
          </Layout>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;