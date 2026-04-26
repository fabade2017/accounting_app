// QuotationView.tsx or similar
import React, { useState, useEffect } from 'react';
import {PDFPreviewModal} from './PDFPreviewModal';
import { generateQuotationPDF } from './QuotationPDF'; // your existing function
import { useParams } from 'react-router-dom';
interface QuotationViewProps {
  quoteId: string | number;
}
export const QuotationView: React.FC<QuotationViewProps> = ({ quoteId }) => {
  //  const { quoteId } = useParams<{ quoteId: string }>();
  const [quotationData, setQuotationData] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchFullQuotation = async () => {
      const res = await fetch(`/api/quotations/${quoteId}/full`);
      const data = await res.json();
      setQuotationData(data);

      // Generate blob for email sending
      const blob = await generateQuotationPDF(data);
      setPdfBlob(blob);
    };

    if (quoteId) fetchFullQuotation();
  }, [quoteId]);

  const handleSendEmail = async () => {

   
    if (!pdfBlob || !quotationData) return;

    setSending(true);
    const formData = new FormData();
    formData.append('customerEmail', quotationData.customerEmail || 'fabade2017@gmail.com');
    formData.append('file', pdfBlob, `quotation-${quotationData.QuotationNumber}.pdf`);

    try {
      const res = await fetch('/api/quotes/send-email', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        alert('Quotation sent successfully!');
        setPreviewOpen(false);
      } else {
        alert('Failed: ' + result.message);
      }
    } catch (err) {
      alert('Error sending email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1>Quotation: {quotationData?.QuotationNumber}</h1>

      {/* Your existing line items table here */}

      <button onClick={() => setPreviewOpen(true)} className="btn-primary">
        Preview PDF & Send Email
      </button>

      <PDFPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        quotationData={quotationData}
        onSendEmail={handleSendEmail}
        sending={sending}
      />
    </div>
  );
};

//export default QuotationView;