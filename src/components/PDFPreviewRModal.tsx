 // components/PDFPreviewModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Spin, message, Input, Button } from 'antd';
import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, lineHeight: 1.4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  logo: { width: 120, height: 'auto' },
  companyInfo: { textAlign: 'right', width: '60%' },
  companyName: { fontSize: 18, fontWeight: 'bold', color: '#1e3799', marginBottom: 6 },
  companyDetails: { fontSize: 10, color: '#444', marginBottom: 3 },
  title: { fontSize: 26, textAlign: 'center', marginBottom: 30, color: '#1e3799', fontWeight: 'bold' },
  clientSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#1e3799' },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  label: { fontWeight: 'bold', width: 100 },
  table: {
    width: '100%',
    border: '1px solid #333',
    marginTop: 20,
    flexDirection: 'column',
  },
  tableRow: { flexDirection: 'row', borderBottom: '1px solid #333' },
  tableHeader: { backgroundColor: '#f0f5ff', fontWeight: 'bold' },
  cellItem: { width: '40%', padding: 8, borderRight: '1px solid #333' },
  cellQty: { width: '15%', padding: 8, borderRight: '1px solid #333', textAlign: 'center' },
  cellPrice: { width: '20%', padding: 8, borderRight: '1px solid #333', textAlign: 'right' },
  cellTotal: { width: '25%', padding: 8, textAlign: 'right' },
  totalRow: { marginTop: 30, textAlign: 'right', fontSize: 14 },
  totalLabel: { fontWeight: 'bold' },
  notes: { marginTop: 40, fontSize: 11 },
});

interface LineItem {
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
  Amount: number;
  TaxRate: number;
}

interface CalculatedReceiptData {
  ReceiptNumber: string;
  ReceiptDate: string;
  ValidUntilDate: string;
  Notes?: string;
  lineItems: LineItem[];
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  issuingCompany: {
    CompanyName: string;
    Address: string;
    Phone: string;
    Email: string;
    Website: string;
  };
  client: {
    CustomerName: string;
    Address: string;
    Phone: string;
    Email: string;
  };
}

const ReceiptPDFDocument = ({ data }: { data: CalculatedReceiptData }) => (
  <Document>
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.headerRow}>
        <Image src="/logodef.png" style={styles.logo} />

        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{data.issuingCompany.CompanyName}</Text>
          <Text style={styles.companyDetails}>{data.issuingCompany.Address}</Text>
          <Text style={styles.companyDetails}>Phone: {data.issuingCompany.Phone}</Text>
          <Text style={styles.companyDetails}>Email: {data.issuingCompany.Email}</Text>
          <Text style={styles.companyDetails}>{data.issuingCompany.Website}</Text>
        </View>
      </View>

      <Text style={styles.title}>Sales Receipt #{data.ReceiptNumber}</Text>

      <View style={styles.clientSection}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text style={styles.companyName}>{data.client.CustomerName}</Text>
        <Text style={styles.companyDetails}>{data.client.Address || 'Address not provided'}</Text>
        <Text style={styles.companyDetails}>Phone: {data.client.Phone || 'N/A'}</Text>
        <Text style={styles.companyDetails}>Email: {data.client.Email || 'N/A'}</Text>

        <View style={{ marginTop: 15 }}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text>{new Date(data.ReceiptDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Valid until:</Text>
            <Text>{new Date(data.ValidUntilDate).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.cellItem}>Item</Text>
          <Text style={styles.cellQty}>Qty</Text>
          <Text style={styles.cellPrice}>Unit Price</Text>
          <Text style={styles.cellTotal}>Line Total</Text>
        </View>

        {data.lineItems.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.cellItem}>{item.ProductName}</Text>
            <Text style={styles.cellQty}>{item.Quantity}</Text>
            <Text style={styles.cellPrice}>N{formatCurrency(item.UnitPrice)}</Text>
            <Text style={styles.cellTotal}>N{formatCurrency(item.Amount)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text>Subtotal: <Text style={styles.totalLabel}>N{formatCurrency(data.subTotal)}</Text></Text>
        <Text>Tax: <Text style={styles.totalLabel}>N{formatCurrency(data.taxAmount)}</Text></Text>
        <Text style={{ fontSize: 18, marginTop: 8 }}>
          <strong>Total: N{formatCurrency(data.totalAmount)}</strong>
        </Text>
      </View>

      {data.Notes && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Notes:</Text>
          <Text>{data.Notes}</Text>
        </View>
      )}
    </Page>
  </Document>
);

interface PDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  ReceiptData: any;
  onSendEmail: (pdfBlob: Blob, customerEmail: string) => void;
  sending?: boolean;
}
const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};


export const PDFPreviewRModal: React.FC<PDFPreviewModalProps> = ({
  open,
  onClose,
  ReceiptData,
  onSendEmail,
  sending = false,
}) => {
  const [calculatedData, setCalculatedData] = useState<CalculatedReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState<string>('quotes@mycompany.com');

  useEffect(() => {
    if (!open || !ReceiptData) {
      setCalculatedData(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch line items
        const url = `${import.meta.env.VITE_API_BASE_URL}/receipts/${ReceiptData.ReceiptId}`;
        // if (!url.toLowerCase().includes('lineitems')) {
        //   url = url.replace(/\/$/, '') + '/lineitems';
        // }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load items');
    //   const items: LineItem[] = await res.json();

       let items: LineItem[] = [];

if (ReceiptData.LineItems && ReceiptData.LineItems.length > 0) {
  items =await res.json(); // ReceiptData.LineItems;
} else {
  // Fake one line for the PDF
  items = [
    {
      ProductName: ReceiptData.Reference || 'Receipt Payment',
      Quantity: 1,
      UnitPrice: ReceiptData.Amount,
      Amount: ReceiptData.Amount,
      TaxRate: 0,
    },
  ];
}
      //  const items: LineItem[] = await res.json();
 console.log(`The Res:${ReceiptData.ReceiptId} >>>>>`+JSON.stringify(items));
        const subTotal = items.reduce((sum, item) => sum + Number(item.Amount || 0), 0);
        const taxAmount = items.reduce((sum, item) => {
          const lineTotal = Number(item.Amount || 0);
          const taxRate = Number(item.TaxRate || 10) / 100;
          const lineSub = lineTotal / (1 + taxRate);
          return sum + (lineSub * taxRate);
        }, 0);

        // Hardcoded issuing company
        let issuingCompany = {
          CompanyName: 'My Company Ltd',
          Address: '123 Main Street, Lagos, Nigeria',
          Phone: '+234 800 123 4567',
          Email: 'info@mycompany.com',
          Website: 'www.upperlink.ng',
        };
try {
  const compRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/1`);
  if (compRes.ok) {
    const comp = await compRes.json();
    issuingCompany = {
      CompanyName: comp.CompanyName || comp.Name || issuingCompany.CompanyName,
      Address: comp.Address || issuingCompany.Address,
      Phone: comp.Phone || issuingCompany.Phone,
      Email: comp.Email || issuingCompany.Email,
      Website: comp.Website || issuingCompany.Website,
    };
    setCustomerEmail(issuingCompany.Email);
  }
} catch (err) {
  console.warn('Could not fetch company details — using defaults');
  setCustomerEmail(issuingCompany.Email);
}
        // Client from ReceiptData
        let client = {
          CustomerName: ReceiptData.CustomerName || 'Valued Customer',
          Address: ReceiptData.CustomerAddress || '',
          Phone: ReceiptData.CustomerPhone || '',
          Email: ReceiptData.CustomerEmail || '',
        };
if (ReceiptData.CustomerId) {
  try {
    const clientRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/${ReceiptData.CompanyId}`);
    if (clientRes.ok) {
      const c = await clientRes.json();
      client = {
        CustomerName: c.CompanyName || c.Name || client.CustomerName,
        Address: c.Address || '',
        Phone: c.Phone || '',
        Email: c.Email || '',
      };
    }
  } catch (err) {
    console.warn('Could not fetch client details');
  }
}
        setCustomerEmail(client.Email);

        setCalculatedData({
          ReceiptNumber: ReceiptData.ReceiptNumber || 0,
          ReceiptDate: ReceiptData.ReceiptDate || "2025-01-01",
          ValidUntilDate: ReceiptData.ValidUntilDate || "2025-01-01",
          Notes: ReceiptData.Notes || "NA",
          lineItems: items,
          subTotal,
          taxAmount,
          totalAmount: subTotal + taxAmount,
          issuingCompany,
          client,
        });
      } catch (err: any) {
        message.error('Failed to load Receipt: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, ReceiptData]);
const handleDownload = async () => {
  if (!calculatedData) return;
  try {
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(<ReceiptPDFDocument data={calculatedData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${calculatedData.ReceiptNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('PDF downloaded');
  } catch (err) {
    message.error('Download failed');
  }
};
  const handleSend = async () => {
    if (!calculatedData || !customerEmail.trim()) {
      message.warning('No data or email');
      return;
    }

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(<ReceiptPDFDocument data={calculatedData} />).toBlob();
      onSendEmail(blob, customerEmail.trim());
    } catch (err) {
      message.error('Failed to generate PDF');
    }
  };

  if (!ReceiptData) return null;

  return (
    <Modal
      title={`Preview Receipt - ${ReceiptData.ReceiptNumber || 'Loading...'}`}
      open={open}
      onCancel={onClose}
      width={1100}
      footer={null}
    >
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 'bold', minWidth: 120 }}>Send to:</span>
        <Input
          placeholder="Client email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          style={{ flex: 1 }}
          type="email"
        />
      </div>

      <div style={{ height: '65vh', position: 'relative', marginBottom: 16 }}>
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <Spin fullscreen tip="Loading..." size="large" />
          </div>
        ) : calculatedData ? (
          <PDFViewer width="100%" height="100%">
            <ReceiptPDFDocument data={calculatedData} />
          </PDFViewer>
        ) : (
          <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
            Unable to load Receipt data
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
        <Button
          type="primary"
          onClick={handleSend}
          loading={sending}
          disabled={loading || !customerEmail.trim()}
        >
          Send via Email
        </Button>
        <Button onClick={handleDownload} style={{ marginRight: 8 }}>
  Download PDF
</Button>
      </div>
      
    </Modal>
  );
};      