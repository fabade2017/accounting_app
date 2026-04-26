// src/components/sidebar/CustomBucketSider.tsx
import React, { useState } from "react";
import {
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  GoldOutlined,
  BookOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { Link } from "react-router-dom";

const { Sider } = Layout;

interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

export const CustomBucketSider: React.FC = () => {
  const { token } = theme.useToken();
  const [openKeys, setOpenKeys] = useState<string[]>(["ar", "ap", "inventory"]);

  const menuGroups: MenuItem[] = [
    { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/dashboard" },
    {
      key: "ar",
      label: "Accounts Receivable",
      icon: <TeamOutlined />,
      children: [
        { key: "customers", label: "Customers", path: "/customers" },
        { key: "invoices", label: "Invoices", path: "/invoices" },
        { key: "receipts", label: "Receipts", path: "/receipts" },
      ],
    },
    {
      key: "ap",
      label: "Accounts Payable",
      icon: <ShopOutlined />,
      children: [
        { key: "suppliers", label: "Suppliers", path: "/suppliers" },
        { key: "purchaseorders", label: "Purchase Orders", path: "/purchaseorders" },
      ],
    },
    {
      key: "inventory",
      label: "Inventory",
      icon: <GoldOutlined />,
      children: [
        { key: "products", label: "Products", path: "/products" },
      ],
    },
    {
      key: "gl",
      label: "General Ledger",
      icon: <BookOutlined />,
      children: [
        { key: "journalentries", label: "Journal Entries", path: "/journalentries" },
        { key: "chartofaccounts", label: "Chart of Accounts", path: "/chartofaccounts" },
      ],
    },
  ];

  const getItems = (items: MenuItem[]) => {
    return items.map((item) => {
      if (item.children) {
        return {
          key: item.key,
          icon: item.icon,
          label: (
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span>{item.label}</span>
              {openKeys.includes(item.key) ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />}
            </div>
          ),
          children: item.children.map((child) => ({
            key: child.path!,
            label: <Link to={child.path!}>{child.label}</Link>,
          })),
        };
      }
      return {
        key: item.path!,
        icon: item.icon,
        label: <Link to={item.path!}>{item.label}</Link>,
      };
    });
  };

  return (
    <Sider width={280} style={{ background: token.colorBgContainer, position: "fixed", height: "100vh", borderRight: `1px solid ${token.colorBorder}` }}>
      <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: "bold", color: token.colorPrimary, borderBottom: `1px solid ${token.colorBorder}` }}>
        My ERP Pro
      </div>
      <Menu
        mode="inline"
        selectedKeys={[window.location.pathname]}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        style={{ borderRight: 0, marginTop: 16 }}
        items={getItems(menuGroups)}
      />
    </Sider>
  );
};

// // src/components/sidebar/CustomBucketSider.tsx
// import React, { useState } from "react";
// import {
//   DashboardOutlined,
//   TeamOutlined,
//   ShopOutlined,
//   GoldOutlined,
//   BookOutlined,
//   RightOutlined,
//   DownOutlined,
// } from "@ant-design/icons";
// import { Layout, Menu, theme } from "antd";
// import { Link } from "react-router-dom";

// const { Sider } = Layout;

// interface MenuItem {
//   key: string;
//   label: string;
//   icon?: React.ReactNode;
//   path?: string;
//   children?: MenuItem[];
// }

// export const CustomBucketSider: React.FC = () => {
//   const { token } = theme.useToken();
//   const [openKeys, setOpenKeys] = useState<string[]>(["ar", "ap", "inventory"]);

//   const menuGroups: MenuItem[] = [
//     { key: "dashboard", label: "Dashboard", icon: <DashboardOutlined />, path: "/dashboard" },
//     {
//       key: "ar",
//       label: "Accounts Receivable",
//       icon: <TeamOutlined />,
//       children: [
//         { key: "customers", label: "Customers", path: "/customers" },
//         { key: "invoices", label: "Invoices", path: "/invoices" },
//         { key: "receipts", label: "Receipts", path: "/receipts" },
//       ],
//     },
//     {
//       key: "ap",
//       label: "Accounts Payable",
//       icon: <ShopOutlined />,
//       children: [
//         { key: "suppliers", label: "Suppliers", path: "/suppliers" },
//         { key: "purchaseorders", label: "Purchase Orders", path: "/purchaseorders" },
//       ],
//     },
//     {
//       key: "inventory",
//       label: "Inventory",
//       icon: <GoldOutlined />,
//       children: [
//         { key: "products", label: "Products", path: "/products" },
//       ],
//     },
//     {
//       key: "gl",
//       label: "General Ledger",
//       icon: <BookOutlined />,
//       children: [
//         { key: "journalentries", label: "Journal Entries", path: "/journalentries" },
//         { key: "chartofaccounts", label: "Chart of Accounts", path: "/chartofaccounts" },
//       ],
//     },
//   ];

//   const getItems = (items: MenuItem[]) => {
//     return items.map((item) => {
//       if (item.children) {
//         return {
//           key: item.key,
//           icon: item.icon,
//           label: (
//             <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
//               <span>{item.label}</span>
//               {openKeys.includes(item.key) ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />}
//             </div>
//           ),
//           children: item.children.map((child) => ({
//             key: child.path!,
//             label: <Link to={child.path!}>{child.label}</Link>,
//           })),
//         };
//       }
//       return {
//         key: item.path!,
//         icon: item.icon,
//         label: <Link to={item.path!}>{item.label}</Link>,
//       };
//     });
//   };

//   return (
//     <Sider width={280} style={{ background: token.colorBgContainer, position: "fixed", height: "100vh", borderRight: `1px solid ${token.colorBorder}` }}>
//       <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: "bold", color: token.colorPrimary, borderBottom: `1px solid ${token.colorBorder}` }}>
//         My ERP Pro
//       </div>
//       <Menu
//         mode="inline"
//         selectedKeys={[window.location.pathname]}
//         openKeys={openKeys}
//         onOpenChange={setOpenKeys}
//         style={{ borderRight: 0, marginTop: 16 }}
//         items={getItems(menuGroups)}
//       />
//     </Sider>
//   );
// };
// // src/components/sidebar/CustomBucketSider.tsx
// import React, { useState } from "react";
// import {
//   DashboardOutlined,
//   TeamOutlined,
//   ShopOutlined,
//   GoldOutlined,
//   BookOutlined,
//   FileTextOutlined,
//   BankOutlined,
//   RightOutlined,
//   DownOutlined,
// } from "@ant-design/icons";
// import { Layout, Menu, theme } from "antd";
// import { Link } from "react-router-dom";

// const { Sider } = Layout;

// export const CustomBucketSider: React.FC = () => {
//   const { token } = theme.useToken();
//   const [openKeys, setOpenKeys] = useState<string[]>(["ar", "ap", "inventory"]);

//   const menuGroups = [
//     { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard", path: "/dashboard" },
//     {
//       key: "ar",
//       icon: <TeamOutlined />,
//       label: "Accounts Receivable",
//       items: [
//         { label: "Customers", path: "/customers" },
//         { label: "Invoices", path: "/invoices" },
//         { label: "Receipts", path: "/receipts" },
//         { label: "Sales Orders", path: "/salesorders" },
//       ],
//     },
//     {
//       key: "ap",
//       icon: <ShopOutlined />,
//       label: "Accounts Payable",
//       items: [
//         { label: "Suppliers", path: "/suppliers" },
//         { label: "Purchase Orders", path: "/purchaseorders" },
//         { label: "Supplier Invoices", path: "/supplierinvoices" },
//       ],
//     },
//     {
//       key: "inventory",
//       icon: <GoldOutlined />,
//       label: "Inventory",
//       items: [
//         { label: "Products", path: "/products" },
//         { label: "Inventory Stock", path: "/inventorystock" },
//         { label: "Warehouses", path: "/warehouses" },
//       ],
//     },
//     {
//       key: "gl",
//       icon: <BookOutlined />,
//       label: "General Ledger",
//       items: [
//         { label: "Chart of Accounts", path: "/chartofaccounts" },
//         { label: "Journal Entries", path: "/journalentries" },
//         { label: "General Ledger", path: "/generalledger" },
//         { label: "Bank Accounts", path: "/bankaccounts" },
//       ],
//     },
//   ];

//   const menuItems = menuGroups.map(group => {
//     if (group.items) {
//       return {
//         key: group.key,
//         icon: group.icon,
//         label: (
//           <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
//             <span>{group.label}</span>
//             {openKeys.includes(group.key) ? (
//               <DownOutlined style={{ fontSize: 12 }} />
//             ) : (
//               <RightOutlined style={{ fontSize: 12 }} />
//             )}
//           </div>
//         ),
//         children: group.items.map(item => ({
//           key: item.path,
//           label: <Link to={item.path}>{item.label}</Link>,
//         })),
//       };
//     }
//     return {
//       key: group.path,
//       icon: group.icon,
//       label: <Link to={group.path}>{group.label}</Link>,
//     };
//   });

//   return (
//     <Sider
//       width={280}
//       style={{
//         background: token.colorBgContainer,
//         position: "fixed",
//         height: "100vh",
//         left: 0,
//         top: 0,
//         bottom: 0,
//         borderRight: `1px solid ${token.colorBorder}`,
//         zIndex: 1000,
//       }}
//     >
//       <div
//         style={{
//           height: 64,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: 22,
//           fontWeight: "bold",
//           color: token.colorPrimary,
//           borderBottom: `1px solid ${token.colorBorder}`,
//         }}
//       >
//         My ERP Pro
//       </div>

//       <Menu
//         mode="inline"
//         selectedKeys={[window.location.pathname]}
//         openKeys={openKeys}
//         onOpenChange={setOpenKeys}
//         style={{ borderRight: 0, marginTop: 16, height: "calc(100vh - 64px)", overflowY: "auto" }}
//         items={menuItems}
//       />
//     </Sider>
//   );
// };