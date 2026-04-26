/**
 * Super-intelligent formatter for any identifier → beautiful title
 * Handles: sp_ prefixes, camelCase, PascalCase, run-together words, underscores
 */
export const formatProcedureName = (input: string): string => {
  if (!input || typeof input !== "string") return "Unknown";

  let name = input.trim();

  // Step 1: Remove common prefixes
  name = name.replace(/^sp_|^proc_/i, "");

  // Step 2: Track if it was a report
  const endsWithReport = /report$/i.test(name);
  name = name.replace(/report$/i, "");

  // Step 3: Insert spaces in camelCase/PascalCase (including acronyms)
  name = name
    .replace(/([a-z])([A-Z])/g, "$1 $2")                    // taxCodes → tax Codes
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")               // APIKey → API Key
    .replace(/([0-9])([a-zA-Z])/g, "$1 $2")                // Tax1099 → Tax 1099
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2");               // Item2 → Item 2

  // Step 4: Replace underscores and hyphens
  name = name.replace(/[_-]/g, " ");

  // Step 5: Clean multiple spaces
  name = name.replace(/\s+/g, " ").trim();

  // Step 6: Split into words
  const words = name
    .split(" ")
    .filter(word => word.length > 0)
    .map(word => word.toLowerCase());

  // Step 7: Capitalize properly
  let formatted = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Step 8: Special known replacements
  const replacements: Record<string, string> = {
    "Pl": "P&L",
    "Balancesheet": "Balance Sheet",
    "Trialbalance": "Trial Balance",
    "Cashflow": "Cash Flow",
    "Gl": "General Ledger",
    "Ar": "Accounts Receivable",
    "Ap": "Accounts Payable",
    "Api": "API",
    "Id": "ID",
    "Ui": "UI",
    "Ux": "UX",
    "Taxcodes": "Tax Codes",
    "Paymenttypes": "Payment Types",
    "Warehouses": "Ware Houses",
    "Customerorders": "Customer Orders",
    "Inventoryitems": "Inventory Items",
    "Itemcodes": "Item Codes",
  };

  Object.keys(replacements).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    formatted = formatted.replace(regex, replacements[key]);
  });

  // Step 9: Re-add "Report" if needed
  if (endsWithReport) {
    formatted += " Report";
  }

  return formatted.trim();
};