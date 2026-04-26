// ERPDocumentPDF.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ERPDocumentData } from '../utils/types';

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
  table: { width: '100%', border: '1px solid #333', marginTop: 20, flexDirection: 'column' },
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

const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

export const ERPDocumentPDF = ({ data }: { data: ERPDocumentData }) => (
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

      <Text style={styles.title}>{data.type} #{data.documentNumber}</Text>

      <View style={styles.clientSection}>
        <Text style={styles.sectionTitle}>Recipient:</Text>
        <Text style={styles.companyName}>{data.recipient.Name}</Text>
        {data.recipient.Address && <Text style={styles.companyDetails}>{data.recipient.Address}</Text>}
        {data.recipient.Phone && <Text style={styles.companyDetails}>Phone: {data.recipient.Phone}</Text>}
        {data.recipient.Email && <Text style={styles.companyDetails}>Email: {data.recipient.Email}</Text>}
        <View style={{ marginTop: 15 }}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date:</Text>
            <Text>{new Date(data.documentDate).toLocaleDateString()}</Text>
          </View>
          {data.validUntilDate && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Valid until:</Text>
              <Text>{new Date(data.validUntilDate).toLocaleDateString()}</Text>
            </View>
          )}
        </View>
      </View>

      {data.lineItems && data.lineItems.length > 0 && (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.cellItem}>Item</Text>
            <Text style={styles.cellQty}>Qty</Text>
            <Text style={styles.cellPrice}>Unit Price</Text>
            <Text style={styles.cellTotal}>Line Total</Text>
          </View>
          {data.lineItems.map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.cellItem}>{item.ProductName}</Text>
              <Text style={styles.cellQty}>{item.Quantity}</Text>
              <Text style={styles.cellPrice}>{formatCurrency(item.UnitPrice)}</Text>
              <Text style={styles.cellTotal}>{formatCurrency(item.Amount)}</Text>
            </View>
          ))}
        </View>
      )}

      {data.subTotal !== undefined && (
        <View style={styles.totalRow}>
          <Text>Subtotal: <Text style={styles.totalLabel}>{formatCurrency(data.subTotal)}</Text></Text>
          <Text>Tax: <Text style={styles.totalLabel}>{formatCurrency(data.taxAmount|| 0)}</Text></Text>
          <Text style={{ fontSize: 18, marginTop: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Total: {formatCurrency(data?.totalAmount || 0)}</Text>
          </Text>
        </View>
      )}

      {data.Notes && (
        <View style={styles.notes}>
          <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Notes:</Text>
          <Text>{data.Notes}</Text>
        </View>
      )}

      {data.internalData && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>Internal Data / Ledger:</Text>
          <Text>{JSON.stringify(data.internalData, null, 2)}</Text>
        </View>
      )}
    </Page>
  </Document>
);
