// src/resources.ts
import {
  HomeOutlined,
  DashboardOutlined,
  TeamOutlined,
  ShopOutlined,
  UserOutlined,
  BankOutlined,
  DollarCircleOutlined,
  AccountBookOutlined,
  //BarChartOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  EditOutlined,
  BookOutlined,
  BuildOutlined,
  //LineChartOutlined,
  TagOutlined,
  SettingOutlined,
  GoldOutlined,
  ContainerOutlined,
  ReconciliationOutlined,
  PercentageOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  FundOutlined,
} from "@ant-design/icons";

export const resources = [
  // Dashboard
  {
    name: "dashboard",
    list: "/dashboard",
    meta: { label: "Dashboard2", icon: <DashboardOutlined /> },
  },

  // General Setup
  {
    name: "companies",
    list: "/companies",
    meta: { label: "Company Profile", icon: <SettingOutlined /> },
  },
  {
    name: "users",
    list: "/users",
    meta: { label: "Users & Roles", icon: <UserOutlined /> },
  },

  // Chart of Accounts & Finance
  {
    name: "chartofaccounts",
    list: "/chartofaccounts",
    meta: { label: "Chart of Accounts", icon: <AccountBookOutlined /> },
  },
  {
    name: "bankaccounts",
    list: "/bankaccounts",
    meta: { label: "Bank Accounts", icon: <BankOutlined /> },
  },
  {
    name: "costcenters",
    list: "/costcenters",
    meta: { label: "Cost Centers", icon: <ApartmentOutlined /> },
  },
  {
    name: "taxcodes",
    list: "/taxcodes",
    meta: { label: "Tax Codes", icon: <TagOutlined /> },
  },
  {
    name: "taxgroups",
    list: "/taxgroups",
    meta: { label: "Tax Groups", icon: <PercentageOutlined /> },
  },

  // Accounts Receivable (AR)
  {
    name: "customers",
    list: "/customers",
    meta: { label: "Customers", icon: <TeamOutlined /> },
  },
  {
    name: "quotations",
    list: "/quotations",
    meta: { label: "Quotations", icon: <FileTextOutlined /> },
  },
  {
    name: "salesorders",
    list: "/salesorders",
    meta: { label: "Sales Orders", icon: <SwapOutlined /> },
  },
  {
    name: "invoices",
    list: "/invoices",
    meta: { label: "Sales Invoices", icon: <FileTextOutlined /> },
  },
  {
    name: "receipts",
    list: "/receipts",
    meta: { label: "Customer Receipts", icon: <DollarCircleOutlined /> },
  },

  // Accounts Payable (AP)
  {
    name: "suppliers",
    list: "/suppliers",
    meta: { label: "Suppliers", icon: <ShopOutlined /> },
  },
  {
    name: "purchaseorders",
    list: "/purchaseorders",
    meta: { label: "Purchase Orders", icon: <ShoppingCartOutlined /> },
  },
  {
    name: "goodsreceived",
    list: "/goodsreceived",
    meta: { label: "Goods Received", icon: <ContainerOutlined /> },
  },
  {
    name: "supplierinvoices",
    list: "/supplierinvoices",
    meta: { label: "Supplier Invoices", icon: <FileTextOutlined /> },
  },

  // Inventory & Products
  {
    name: "products",
    list: "/products",
    meta: { label: "Products & Services", icon: <GoldOutlined /> },
  },
  {
    name: "inventorystock",
    list: "/inventorystock",
    meta: { label: "Inventory Stock", icon: <DatabaseOutlined /> },
  },
  {
    name: "warehouses",
    list: "/warehouses",
    meta: { label: "Warehouses", icon: <HomeOutlined /> },
  },

  // General Ledger
  {
    name: "journalentries",
    list: "/journalentries",
    meta: { label: "Journal Entries", icon: <EditOutlined /> },
  },
  {
    name: "generalledger",
    list: "/generalledger",
    meta: { label: "General Ledger", icon: <BookOutlined /> },
  },
  {
    name: "bankreconciliation",
    list: "/bankreconciliation",
    meta: { label: "Bank Reconciliation", icon: <ReconciliationOutlined /> },
  },

  // Fixed Assets & Budgeting
  {
    name: "fixedassets",
    list: "/fixedassets",
    meta: { label: "Fixed Assets", icon: <BuildOutlined /> },
  },
  {
    name: "budgets",
    list: "/budgets",
    meta: { label: "Budgets", icon: <FundOutlined /> },
  },
];