// types.ts
export interface LineItem {
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
  Amount: number;
  TaxRate: number;
}

export interface ERPDocumentData {
  type: 
    | 'Receipt'
    | 'Invoice'
    | 'CreditNote'
    | 'Statement'
    | 'DeliveryNote'
    | 'PurchaseOrder'
    | 'PaymentRemittance'
    | 'LedgerReport';
    customerId: number;
      companyId: number;
  documentNumber: string;
  documentDate: string;
  validUntilDate?: string;
  Notes?: string;
  lineItems?: LineItem[];
  subTotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  issuingCompany: {
    CompanyName: string;
    Address: string;
    Phone: string;
    Email: string;
    Website: string;
  };
  recipient: {
    Name: string;
    Address?: string;
    Phone?: string;
    Email?: string;
  };
  internalData?: any; // for ledger/journal
}
