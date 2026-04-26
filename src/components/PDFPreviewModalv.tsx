// PDFPreviewModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Spin, Input, Button, message } from 'antd';
import { PDFViewer } from '@react-pdf/renderer';
import { ERPDocumentPDF } from './ERPDocumentPDF';
import { ERPDocumentData } from '../utils/types';

interface PDFPreviewModalProps {
  open: boolean;
  onClose: () => void;
  documentData: ERPDocumentData;
  onSendEmail: (pdfBlob: Blob, email: string) => void;
  sending?: boolean;
}

export const PDFPreviewModalv: React.FC<PDFPreviewModalProps> = ({
  open,
  onClose,
  documentData,
  onSendEmail,
  sending = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<ERPDocumentData | null>(null);
  const [recipientEmail, setRecipientEmail] = useState(documentData?.recipient.Email || '');
  const [customerEmail, setCustomerEmail] = useState<string>('quotes@mycompany.com');

  useEffect(() => {
    if (!open || !documentData) return;
    setPdfData(documentData);
    setLoading(false);
  }, [open, documentData]);

  const handleDownload = async () => {
    if (!pdfData) return;
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(<ERPDocumentPDF data={pdfData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdfData.type}-${pdfData.documentNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('PDF downloaded');
  };

  const handleSend = async () => {
    if (!pdfData || !recipientEmail.trim()) return;
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(<ERPDocumentPDF data={pdfData} />).toBlob();
    onSendEmail(blob, recipientEmail.trim());
  };
// if (documentData.customerId) {
//   try {
//     const clientRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/${documentData.companyId}`);
//     if (clientRes.ok) {
//       const c = await clientRes.json();
//     //   client = {
//     //     CustomerName: c.CompanyName || c.Name || client.CustomerName,
//     //     Address: c.Address || '',
//     //     Phone: c.Phone || '',
//     //     Email: c.Email || '',
//     //   };
//     }
//   } catch (err) {
//     console.warn('Could not fetch client details');
//   }
// }

useEffect(() => {
  if (!documentData?.companyId) return;

  const fetchClient = async () => {
    try {
      const clientRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/companies/${documentData.companyId}`
      );

      if (clientRes.ok) {
        const c = await clientRes.json();
      //  setClient(c); // or whatever state you use
          setCustomerEmail(c.Email);
      }
    } catch (err) {
      console.error("Failed to fetch client", err);
    }
  };

  fetchClient();
}, [documentData?.companyId]);

      
  if (!pdfData) return null;

  return (
    <Modal open={open} onCancel={onClose} width={1100} footer={null} title={`${pdfData.type} Preview`}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <span>Email to:</span>
        <Input
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          style={{ flex: 1 }}
          type="email"
        />
      </div>

      <div style={{ height: '65vh', position: 'relative' }}>
        {loading ? (
          <Spin tip="Loading..." size="large" />
        ) : (
          <PDFViewer width="100%" height="100%">
            <ERPDocumentPDF data={pdfData} />
          </PDFViewer>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSend} loading={sending} type="primary" disabled={loading || !recipientEmail.trim()}>
          Send via Email
        </Button>
        <Button onClick={handleDownload}>Download PDF</Button>
      </div>
    </Modal>
  );
};





// if (documentData.customerId) {
//   try {
//     const clientRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/${documentData.companyId}`);
//     if (clientRes.ok) {
//       const c = await clientRes.json();
//     //   client = {
//     //     CustomerName: c.CompanyName || c.Name,
//     //     Address: c.Address || '',
//     //     Phone: c.Phone || '',
//     //     Email: c.Email || '',
//     //   };
//     setRecipientEmail(c.Email);
//     }
//   } catch (err) {
//     console.warn('Could not fetch client details');
//   }
// }
        // setCustomerEmail(client.Email);