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
  LineTotal: number;
  TaxRate: number;
}

interface CalculatedQuotationData {
  QuotationNumber: string;
  QuotationDate: string;
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

const QuotationPDFDocument = ({ data }: { data: CalculatedQuotationData }) => (
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

      <Text style={styles.title}>Sales Quotation #{data.QuotationNumber}</Text>

      <View style={styles.clientSection}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text style={styles.companyName}>{data.client.CustomerName}</Text>
        <Text style={styles.companyDetails}>{data.client.Address || 'Address not provided'}</Text>
        <Text style={styles.companyDetails}>Phone: {data.client.Phone || 'N/A'}</Text>
        <Text style={styles.companyDetails}>Email: {data.client.Email || 'N/A'}</Text>

        <View style={{ marginTop: 15 }}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text>{new Date(data.QuotationDate).toLocaleDateString()}</Text>
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
            <Text style={styles.cellTotal}>N{formatCurrency(item.LineTotal)}</Text>
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
  quotationData: any;
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
export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  open,
  onClose,
  quotationData,
  onSendEmail,
  sending = false,
}) => {
  const [calculatedData, setCalculatedData] = useState<CalculatedQuotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState<string>('quotes@mycompany.com');

  useEffect(() => {
    if (!open || !quotationData) {
      setCalculatedData(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch line items
        let url = `${import.meta.env.VITE_API_BASE_URL}/sp_QuotationLineItems/${quotationData.QuotationId}/For`;
        if (!url.toLowerCase().includes('lineitems')) {
          url = url.replace(/\/$/, '') + '/lineitems';
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load items');

        const items: LineItem[] = await res.json();

        const subTotal = items.reduce((sum, item) => sum + Number(item.LineTotal || 0), 0);
        const taxAmount = items.reduce((sum, item) => {
          const lineTotal = Number(item.LineTotal || 0);
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
        // Client from quotationData
        let client = {
          CustomerName: quotationData.CustomerName || 'Valued Customer',
          Address: quotationData.CustomerAddress || '',
          Phone: quotationData.CustomerPhone || '',
          Email: quotationData.CustomerEmail || '',
        };
if (quotationData.CustomerId) {
  try {
    const clientRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/${quotationData.CompanyId}`);
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
          QuotationNumber: quotationData.QuotationNumber,
          QuotationDate: quotationData.QuotationDate,
          ValidUntilDate: quotationData.ValidUntilDate,
          Notes: quotationData.Notes,
          lineItems: items,
          subTotal,
          taxAmount,
          totalAmount: subTotal + taxAmount,
          issuingCompany,
          client,
        });
      } catch (err: any) {
        message.error('Failed to load quotation: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, quotationData]);
const handleDownload = async () => {
  if (!calculatedData) return;
  try {
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(<QuotationPDFDocument data={calculatedData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quotation-${calculatedData.QuotationNumber}.pdf`;
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
      const blob = await pdf(<QuotationPDFDocument data={calculatedData} />).toBlob();
      onSendEmail(blob, customerEmail.trim());
    } catch (err) {
      message.error('Failed to generate PDF');
    }
  };

  if (!quotationData) return null;

  return (
    <Modal
      title={`Preview Quotation - ${quotationData.QuotationNumber || 'Loading...'}`}
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
            <QuotationPDFDocument data={calculatedData} />
          </PDFViewer>
        ) : (
          <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
            Unable to load quotation data
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
};        // // components/PDFPreviewModal.tsx
                            // import React, { useState, useEffect } from 'react';
                            // import { Modal, Spin, message, Input, Button } from 'antd';
                            // import { PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

                            // // Enhanced styles with company header
                            // const styles = StyleSheet.create({
                            //   page: { padding: 40, fontSize: 12, backgroundColor: '#fff' },
                            //   header: { marginBottom: 30 },
                            //   companyInfo: { textAlign: 'right', marginBottom: 20 },
                            //   companyName: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
                            //   companyDetails: { fontSize: 10, color: '#555', marginTop: 4 },
                            //   title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#2c3e50' },
                            //   section: { marginBottom: 20 },
                            //   label: { fontWeight: 'bold', width: 120, display: 'inline-block' },
                            //   table: {
                            //     width: '100%',
                            //     border: '1px solid #000',
                            //     marginTop: 20,
                            //     flexDirection: 'column',
                            //   },
                            //   tableRow: { flexDirection: 'row', borderBottom: '1px solid #000' },
                            //   tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
                            //   cellItem: { width: '40%', padding: 8, borderRight: '1px solid #000' },
                            //   cellQty: { width: '15%', padding: 8, borderRight: '1px solid #000', textAlign: 'center' },
                            //   cellPrice: { width: '20%', padding: 8, borderRight: '1px solid #000', textAlign: 'right' },
                            //   cellTotal: { width: '25%', padding: 8, textAlign: 'right' },
                            //   totalRow: { marginTop: 30, textAlign: 'right', fontSize: 14 },
                            //   notes: { marginTop: 40, fontSize: 11 },
                            // });

                            // interface LineItem {
                            //   ProductName: string;
                            //   Quantity: number;
                            //   UnitPrice: number;
                            //   LineTotal: number;
                            // }

                            // interface CompanyInfo {
                            //   CompanyName?: string;
                            //   Address?: string;
                            //   Phone?: string;
                            //   Email?: string;
                            //   Website?: string;
                            //   LogoUrl?: string; // Optional: if you have company logo URL
                            // }

                            // interface CalculatedQuotationData {
                            //   QuotationNumber: string;
                            //   CustomerName?: string;
                            //   QuotationDate: string;
                            //   ValidUntilDate: string;
                            //   Notes?: string;
                            //   lineItems: LineItem[];
                            //   subTotal: number;
                            //   taxAmount: number;
                            //   totalAmount: number;
                            //   company: CompanyInfo;
                            // }

                            // const QuotationPDFDocument = ({ data }: { data: CalculatedQuotationData }) => (
                            //   <Document>
                            //     <Page size="A4" style={styles.page} wrap>
                            //       {/* Company Header */}
                            //       <View style={styles.header}>
                            //         {data.company.LogoUrl ? (
                            //           <Image src={data.company.LogoUrl} style={{ width: 100, marginBottom: 10 }} />
                            //         ) : (
                            //           <View style={{ height: 60 }} /> // Placeholder if no logo
                            //         )}

                            //         <View style={styles.companyInfo}>
                            //           <Text style={styles.companyName}>{data.company.CompanyName || 'Your Company Name'}</Text>
                            //           <Text style={styles.companyDetails}>{data.company.Address || ''}</Text>
                            //           <Text style={styles.companyDetails}>Phone: {data.company.Phone || 'N/A'}</Text>
                            //           <Text style={styles.companyDetails}>Email: {data.company.Email || 'N/A'}</Text>
                            //           <Text style={styles.companyDetails}>{data.company.Website || ''}</Text>
                            //         </View>
                            //       </View>

                            //       <Text style={styles.title}>Sales Quotation #{data.QuotationNumber}</Text>

                            //       <View style={styles.section}>
                            //         <Text><Text style={styles.label}>Customer:</Text> {data.CustomerName || 'N/A'}</Text>
                            //         <Text><Text style={styles.label}>Date:</Text> {new Date(data.QuotationDate).toLocaleDateString()}</Text>
                            //         <Text><Text style={styles.label}>Valid until:</Text> {new Date(data.ValidUntilDate).toLocaleDateString()}</Text>
                            //       </View>

                            //       <View style={styles.table}>
                            //         <View style={[styles.tableRow, styles.tableHeader]}>
                            //           <Text style={styles.cellItem}>Item</Text>
                            //           <Text style={styles.cellQty}>Qty</Text>
                            //           <Text style={styles.cellPrice}>Unit Price</Text>
                            //           <Text style={styles.cellTotal}>Line Total</Text>
                            //         </View>

                            //         {data.lineItems.length > 0 ? (
                            //           data.lineItems.map((item, index) => (
                            //             <View style={styles.tableRow} key={index}>
                            //               <Text style={styles.cellItem}>{item.ProductName}</Text>
                            //               <Text style={styles.cellQty}>{item.Quantity}</Text>
                            //               <Text style={styles.cellPrice}>${Number(item.UnitPrice).toFixed(2)}</Text>
                            //               <Text style={styles.cellTotal}>${Number(item.LineTotal).toFixed(2)}</Text>
                            //             </View>
                            //           ))
                            //         ) : (
                            //           <View style={styles.tableRow}>
                            //             <Text style={{ padding: 8 }}>No items added</Text>
                            //           </View>
                            //         )}
                            //       </View>

                            //       <View style={styles.totalRow}>
                            //         <Text>Subtotal: ${data.subTotal.toFixed(2)}</Text>
                            //         <Text>Tax: ${data.taxAmount.toFixed(2)}</Text>
                            //         <Text style={{ fontSize: 18, marginTop: 10 }}>
                            //           <strong>Total: ${data.totalAmount.toFixed(2)}</strong>
                            //         </Text>
                            //       </View>

                            //       {data.Notes && (
                            //         <View style={styles.notes}>
                            //           <Text style={{ fontWeight: 'bold' }}>Notes:</Text>
                            //           <Text>{data.Notes}</Text>
                            //         </View>
                            //       )}
                            //     </Page>
                            //   </Document>
                            // );

                            // interface PDFPreviewModalProps {
                            //   open: boolean;
                            //   onClose: () => void;
                            //   quotationData: any;
                            //   onSendEmail: (pdfBlob: Blob, customerEmail: string) => void;
                            //   sending?: boolean;
                            // }


                            // // components/PDFPreviewModal.tsx
                            // // ... (imports and styles remain the same)

                            // export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
                            //   open,
                            //   onClose,
                            //   quotationData,
                            //   onSendEmail,
                            //   sending = false,
                            // }) => {
                            //   const [calculatedData, setCalculatedData] = useState<CalculatedQuotationData | null>(null);
                            //   const [loadingItems, setLoadingItems] = useState(false);
                            //   const [loadingCompany, setLoadingCompany] = useState(false);
                            //   const [customerEmail, setCustomerEmail] = useState<string>('');

                            //   // YOUR COMPANY ID (the one issuing the quotation)
                            //   const ISSUING_COMPANY_ID = 1;

                            //   // Fetch line items (unchanged)
                            //   useEffect(() => {
                            //     if (!open || !quotationData?.QuotationId) {
                            //       setCalculatedData(null);
                            //       return;
                            //     }

                            //     const fetchAndCalculate = async () => {
                            //       setLoadingItems(true);
                            //       try {
                            //         let url = `${import.meta.env.VITE_API_BASE_URL}/sp_QuotationLineItems/${quotationData.QuotationId}/For`;
                            //         if (!url.toLowerCase().includes('lineitems')) {
                            //           url = url.replace(/\/$/, '') + '/lineitems';
                            //         }

                            //         const res = await fetch(url);
                            //         if (!res.ok) throw new Error(`HTTP ${res.status}`);

                            //         const raw = await res.json();
                            //         let items: LineItem[] = Array.isArray(raw) ? raw : [];

                            //         const subTotal = items.reduce((sum, item) => sum + Number(item.LineTotal || 0), 0);
                            //         const taxAmount = items.reduce((sum, item) => {
                            //           const lineTotal = Number(item.LineTotal || 0);
                            //           const taxRate = Number(item.TaxRate || 10) / 100;
                            //           const lineSub = lineTotal / (1 + taxRate);
                            //           return sum + (lineSub * taxRate);
                            //         }, 0);

                            //         // Initialize calculatedData with line items and totals
                            //         setCalculatedData({
                            //           QuotationNumber: quotationData.QuotationNumber,
                            //           CustomerName: quotationData.CustomerName,
                            //           QuotationDate: quotationData.QuotationDate,
                            //           ValidUntilDate: quotationData.ValidUntilDate,
                            //           Notes: quotationData.Notes,
                            //           lineItems: items,
                            //           subTotal,
                            //           taxAmount,
                            //           totalAmount: subTotal + taxAmount,
                            //           company: {}, // will be filled by company fetch
                            //         });
                            //       } catch (err: any) {
                            //         message.error('Failed to load line items: ' + err.message);
                            //         setCalculatedData(null);
                            //       } finally {
                            //         setLoadingItems(false);
                            //       }
                            //     };

                            //     fetchAndCalculate();
                            //   }, [open, quotationData?.QuotationId]);

                            //   // NEW: Always fetch YOUR company (ID = 1) for header and from-email
                            //   useEffect(() => {
                            //     if (!open) return;

                            //     const fetchIssuingCompany = async () => {
                            //       setLoadingCompany(true);
                            //       try {
                            //         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/${ISSUING_COMPANY_ID}`);

                            //         if (!res.ok) {
                            //           console.warn(`Your company (ID ${ISSUING_COMPANY_ID}) not found: HTTP ${res.status}`);
                            //           return;
                            //         }

                            //         const company = await res.json();

                            //         const companyInfo: CompanyInfo = {
                            //           CompanyName: company.CompanyName || company.Name || 'My Company Ltd',
                            //           Address: company.Address || company.StreetAddress || '',
                            //           Phone: company.Phone || company.Telephone || '',
                            //           Email: company.Email || company.CompanyEmail || '',
                            //           Website: company.Website || '',
                            //           LogoUrl: company.LogoUrl || company.Logo || '',
                            //         };

                            //         // Pre-fill the "Send to" email with your company's email (e.g., quotes@mycompany.com)
                            //         if (companyInfo.Email) {
                            //           setCustomerEmail(companyInfo.Email);
                            //         }

                            //         // Update calculatedData with your company header
                            //         setCalculatedData(prev => prev ? { ...prev, company: companyInfo } : null);
                            //       } catch (err) {
                            //         console.warn('Failed to load issuing company details', err);
                            //       } finally {
                            //         setLoadingCompany(false);
                            //       }
                            //     };

                            //     fetchIssuingCompany();
                            //   }, [open]); // Only depend on open, not quotationData.CompanyId

                            //   const handleSend = async () => {
                            //     if (!calculatedData) {
                            //       message.warning('No data to send');
                            //       return;
                            //     }

                            //     if (!customerEmail.trim()) {
                            //       message.error('Please enter a valid email address');
                            //       return;
                            //     }

                            //     try {
                            //       const { pdf } = await import('@react-pdf/renderer');
                            //       const blob = await pdf(<QuotationPDFDocument data={calculatedData} />).toBlob();
                            //       onSendEmail(blob, customerEmail.trim());
                            //     } catch (err) {
                            //       message.error('Failed to generate PDF');
                            //       console.error(err);
                            //     }
                            //   };

                            //   if (!quotationData) return null;

                            //   return (
                            //     <Modal
                            //       title={`Preview Quotation - ${quotationData.QuotationNumber || 'Loading...'}`}
                            //       open={open}
                            //       onCancel={onClose}
                            //       width={1100}
                            //       footer={null}
                            //     >
                            //       <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                            //         <span style={{ fontWeight: 'bold', minWidth: 120 }}>Send from:</span>
                            //         <Input
                            //           placeholder="Your company email (editable)"
                            //           value={customerEmail}
                            //           onChange={(e) => setCustomerEmail(e.target.value)}
                            //           style={{ flex: 1 }}
                            //           type="email"
                            //           addonAfter={loadingCompany ? <Spin size="small" /> : null}
                            //         />
                            //       </div>

                            //       <div style={{ height: '65vh', position: 'relative', marginBottom: 16 }}>
                            //         {loadingItems || loadingCompany ? (
                            //           <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                            //             <Spin tip="Loading quotation and company header..." size="large" />
                            //           </div>
                            //         ) : calculatedData ? (
                            //           <PDFViewer width="100%" height="100%">
                            //             <QuotationPDFDocument data={calculatedData} />
                            //           </PDFViewer>
                            //         ) : (
                            //           <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
                            //             Unable to load quotation data
                            //           </div>
                            //         )}
                            //       </div>

                            //       <div style={{ textAlign: 'right' }}>
                            //         <Button onClick={onClose} style={{ marginRight: 8 }}>
                            //           Cancel
                            //         </Button>
                            //         <Button
                            //           type="primary"
                            //           onClick={handleSend}
                            //           loading={sending}
                            //           disabled={loadingItems || loadingCompany || !customerEmail.trim()}
                            //         >
                            //           Send via Email
                            //         </Button>
                            //       </div>
                            //     </Modal>
                            //   );
                            // };
// export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
//   open,
//   onClose,
//   quotationData,
//   onSendEmail,
//   sending = false,
// }) => {
//   const [calculatedData, setCalculatedData] = useState<CalculatedQuotationData | null>(null);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [loadingCompany, setLoadingCompany] = useState(false);
//   const [customerEmail, setCustomerEmail] = useState<string>('');

//   // Fetch line items and calculate totals
//   useEffect(() => {
//     if (!open || !quotationData?.QuotationId) {
//       setCalculatedData(null);
//       return;
//     }

//     const fetchAndCalculate = async () => {
//       setLoadingItems(true);
//       try {
//         let url = `${import.meta.env.VITE_API_BASE_URL}/sp_QuotationLineItems/${quotationData.QuotationId}/For`;
//         if (!url.toLowerCase().includes('lineitems')) {
//           url = url.replace(/\/$/, '') + '/lineitems';
//         }

//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const raw = await res.json();
//         let items: LineItem[] = Array.isArray(raw) ? raw : [];

//         const subTotal = items.reduce((sum, item) => sum + Number(item.LineTotal || 0), 0);
//         const taxAmount = items.reduce((sum, item) => {
//           const lineTotal = Number(item.LineTotal || 0);
//           const taxRate = Number(item.TaxRate || 10) / 100;
//           const lineSub = lineTotal / (1 + taxRate);
//           return sum + (lineSub * taxRate);
//         }, 0);

//         setCalculatedData(prev => prev ? { ...prev, lineItems: items, subTotal, taxAmount, totalAmount: subTotal + taxAmount } : null);
//       } catch (err: any) {
//         message.error('Failed to load line items: ' + err.message);
//       } finally {
//         setLoadingItems(false);
//       }
//     };

//     fetchAndCalculate();
//   }, [open, quotationData?.QuotationId]);

//   // Fetch company details
//   useEffect(() => {
//     if (!open || !quotationData?.CompanyId) {
//       setCalculatedData(prev => prev ? { ...prev, company: {} } : null);
//       return;
//     }

//     const fetchCompany = async () => {
//       setLoadingCompany(true);
//       try {
//         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/${quotationData.CompanyId}`);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const company = await res.json();

//         const companyInfo: CompanyInfo = {
//           CompanyName: company.CompanyName || company.Name || 'Your Company',
//           Address: company.Address || company.StreetAddress || '',
//           Phone: company.Phone || company.Telephone || '',
//           Email: company.Email || company.CompanyEmail || '',
//           Website: company.Website || '',
//           LogoUrl: company.LogoUrl || company.Logo || '', // Optional
//         };

//         setCustomerEmail(companyInfo.Email || '');
//         setCalculatedData(prev => prev ? { ...prev, company: companyInfo } : { ...prev!, company: companyInfo });
//       } catch (err) {
//         console.warn('Failed to load company info');
//       } finally {
//         setLoadingCompany(false);
//       }
//     };

//     fetchCompany();
//   }, [open, quotationData?.CompanyId]);

//   const handleSend = async () => {
//     if (!calculatedData) return;
//     if (!customerEmail.trim()) {
//       message.error('Please enter a valid email address');
//       return;
//     }

//     try {
//       const { pdf } = await import('@react-pdf/renderer');
//       const blob = await pdf(<QuotationPDFDocument data={calculatedData} />).toBlob();
//       onSendEmail(blob, customerEmail.trim());
//     } catch (err) {
//       message.error('Failed to generate PDF');
//     }
//   };

//   if (!quotationData) return null;

//   return (
//     <Modal
//       title={`Preview Quotation - ${quotationData.QuotationNumber || 'Loading...'}`}
//       open={open}
//       onCancel={onClose}
//       width={1100}
//       footer={null}
//     >
//       <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
//         <span style={{ fontWeight: 'bold', minWidth: 120 }}>Send to:</span>
//         <Input
//           placeholder="Customer email"
//           value={customerEmail}
//           onChange={(e) => setCustomerEmail(e.target.value)}
//           style={{ flex: 1 }}
//           type="email"
//           addonAfter={loadingCompany ? <Spin size="small" /> : null}
//         />
//       </div>

//       <div style={{ height: '65vh', position: 'relative', marginBottom: 16 }}>
//         {loadingItems || loadingCompany ? (
//           <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
//             <Spin tip="Loading quotation and company details..." size="large" />
//           </div>
//         ) : calculatedData ? (
//           <PDFViewer width="100%" height="100%">
//             <QuotationPDFDocument data={calculatedData} />
//           </PDFViewer>
//         ) : (
//           <div style={{ textAlign: 'center', padding: 50, color: '#999' }}>
//             Unable to load quotation data
//           </div>
//         )}
//       </div>

//       <div style={{ textAlign: 'right' }}>
//         <Button onClick={onClose} style={{ marginRight: 8 }}>
//           Cancel
//         </Button>
//         <Button
//           type="primary"
//           onClick={handleSend}
//           loading={sending}
//           disabled={loadingItems || loadingCompany || !customerEmail.trim()}
//         >
//           Send via Email
//         </Button>
//       </div>
//     </Modal>
//   );
// };