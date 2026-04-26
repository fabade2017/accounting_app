// src/components/sidebar/BucketMenu.tsx
import React, { useState } from "react";
import { useTranslate } from "@refinedev/core";
import {
  DashboardOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  DollarCircleOutlined,
  BarChartOutlined,
  UserOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";

export default function BucketMenu() {
  const t = useTranslate();
  const [openBuckets, setOpenBuckets] = useState<string[]>(["/general"]);

  const toggleBucket = (path: string) => {
    setOpenBuckets(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) =>
    window.location.pathname === path || window.location.pathname.startsWith(path + "/");

  const buckets = [
    { label: t("dashboard", "Dashboard"), path: "/dashboard", icon: <DashboardOutlined /> },
    { label: t("generalSetup", "General Setup"), path: "/general", icon: <SettingOutlined />, children: [
        { label: "Company Profile", path: "/general/company-profile" },
        { label: "Branches", path: "/general/branches" },
        { label: "Departments", path: "/general/departments" },
        { label: "Currency", path: "/general/currency" },
        { label: "Exchange Rates", path: "/general/exchange-rates" },
        { label: "Financial Year", path: "/general/financial-year" },
      ]},
    { label: t("productSetup", "Product Setup"), path: "/products", icon: <ShopOutlined />, children: [
        { label: "Categories", path: "/products/category" },
        { label: "Product List", path: "/products/list" },
        { label: "Pricing", path: "/products/pricing" },
      ]},
    { label: t("customerManagement", "Customer Management"), path: "/customers", icon: <TeamOutlined />, children: [
        { label: "Customer List", path: "/customers/list" },
        { label: "Groups", path: "/customers/group" },
        { label: "Rating", path: "/customers/rating" },
      ]},
    { label: t("budgetPlanning", "Budget & Planning"), path: "/budget", icon: <DollarCircleOutlined />, children: [
        { label: "Roles", path: "/budget/role" },
        { label: "Lines", path: "/budget/line" },
        { label: "Approval", path: "/budget/approval" },
      ]},
    { label: t("reports", "Reports"), path: "/reports", icon: <BarChartOutlined />, children: [
        { label: "Profit & Loss", path: "/reports/profit-loss" },
        { label: "Balance Sheet", path: "/reports/balance-sheet" },
        { label: "Trial Balance", path: "/reports/trial-balance" },
      ]},
    { label: t("administration", "Administration"), path: "/admin", icon: <UserOutlined />, children: [
        { label: "Users", path: "/admin/users" },
        { label: "Roles", path: "/admin/roles" },
        { label: "Audit Trail", path: "/admin/audit" },
      ]},
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-white shadow-2xl border-r border-gray-200 z-50 overflow-y-auto">
      {/* Logo */}
      <div className="p-8 text-center border-b border-gray-100">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          My ERP Pro
        </h1>
        <p className="text-xs text-gray-500 mt-1">Enterprise Suite</p>
      </div>

      {/* Menu Items */}
      <nav className="mt-6 px-4 space-y-3">
        {buckets.map(item => {
          const hasChildren = !!item.children?.length;
          const isOpen = openBuckets.includes(item.path);

          if (hasChildren) {
            return (
              <div key={item.path}>
                <button
                  onClick={() => toggleBucket(item.path)}
                  className={`w-full flex items centerline justify-between px-5 py-4 rounded-2xl transition-all duration-300 font-medium
                    ${isOpen 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {isOpen ? <DownOutlined /> : <RightOutlined />}
                </button>

                {isOpen && (
                  <div className="mt-3 ml-12 space-y-2">
                    {item.children!.map(child => (
                      <a
                        key={child.path}
                        href={child.path}
                        className={`block px-6 py-3 rounded-xl text-sm font-medium transition-all
                          ${isActive(child.path)
                            ? "bg-blue-600 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300
                ${isActive(item.path)
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
        <p className="text-xs text-center text-gray-500">© 2025 My ERP Pro</p>
      </div>
    </div>
  );
}