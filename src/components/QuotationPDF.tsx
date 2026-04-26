     import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  section: { marginBottom: 10 },
  table: { display: "flex", width: "auto", border: "1px solid #000" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f0f0f0", fontWeight: "bold" },
  row: { flexDirection: "row", borderBottom: "1px solid #000", padding: 5 },
  cellItem: { width: "40%" },
  cellQty: { width: "15%" },
  cellPrice: { width: "20%" },
  cellTotal: { width: "25%" },
});

const QuotationPDF = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Sales Quotation #{data.QuotationNumber}</Text>

      <View style={styles.section}>
        {/* Add customer name if you have it – assuming it's not in data yet */}
        <Text>Customer: {data.CustomerName || "Customer Name Not Provided"}</Text>
        <Text>Date: {new Date(data.QuotationDate).toLocaleDateString()}</Text>
        <Text>Valid until: {new Date(data.ValidUntilDate).toLocaleDateString()}</Text>
      </View>

      {/* Line items table */}
      <View style={styles.table}>
        <View style={[styles.row, styles.tableHeader]}>
          <Text style={styles.cellItem}>Item</Text>
          <Text style={styles.cellQty}>Qty</Text>
          <Text style={styles.cellPrice}>Price</Text>
          <Text style={styles.cellTotal}>Total</Text>
        </View>

        {data.lineItems?.length > 0 ? (
          data.lineItems.map((line: any, index: number) => (
            <View style={styles.row} key={index}>
              <Text style={styles.cellItem}>{line.ProductName || "Product"}</Text>
              <Text style={styles.cellQty}>{line.Quantity}</Text>
              <Text style={styles.cellPrice}>{line.UnitPrice}</Text>
              <Text style={styles.cellTotal}>{line.LineTotal}</Text>
            </View>
          ))
        ) : (
          <View style={styles.row}>
            <Text>No line items</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text>Subtotal: ${data.SubTotal}</Text>
        <Text>Tax: ${data.TaxAmount}</Text>
        <Text style={{ fontSize: 18, marginTop: 10 }}>
          Total: ${data.TotalAmount}
        </Text>
        <Text>Notes: {data.Notes}</Text>
      </View>
    </Page>
  </Document>
);

export const generateQuotationPDF = async (data: any) => {
  console.log("In Generate Quotation PDF", JSON.stringify(data));

  const blob = await pdf(<QuotationPDF data={data} />).toBlob();
  // For filename fix: use QuotationNumber
//   const file = new File([blob], `quotation-${data.QuotationNumber || "new"}.pdf`, {
//     type: "application/pdf",
//   });
    //   const blob = await pdf(<QuotationPDF data={data} />).toBlob();
                  return blob;
 // return file; // or blob, depending on how you use it
};
           // import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";

                // const styles = StyleSheet.create({
                //   page: { padding: 30 },
                //   title: { fontSize: 24, marginBottom: 20 },
                //   table: { display: "flex", width: "auto" },
                //   row: { flexDirection: "row", borderBottom: "1px solid #000", padding: 5 },
                // });

                // const QuotationPDF = ({ data }) => (
                //   <Document>
                //     <Page size="A4" style={styles.page}>
                //       <Text style={styles.title}>Sales Quotation #{data.QuoteNumber}</Text>
                //       <Text>Customer: {data.CustomerName}</Text>
                //       <Text>Date: {data.QuoteDate}</Text>

                //       {/* Line items table */}
                //       <View style={styles.table}>
                //         <View style={styles.row}>
                //           <Text>Item</Text>
                //           <Text>Qty</Text>
                //           <Text>Price</Text>
                //           <Text>Total</Text>
                //         </View>
                //         {data.lineItems?.map((line) => (
                //           <View style={styles.row} key={line.id}>
                //             <Text>{line.ProductName}</Text>
                //             <Text>{line.Quantity}</Text>
                //             <Text>{line.UnitPrice}</Text>
                //             <Text>{line.LineTotal}</Text>
                //           </View>
                //         ))}
                //       </View>

                //       <Text>Total: {data.GrandTotal}</Text>
                //       <Text>Valid until: {data.ExpiryDate}</Text>
                //     </Page>
                //   </Document>
                // );

                // export const generateQuotationPDF = async (data) => {
                //     console.log(`In Generate Quotation PDF`+JSON.stringify(data));
                //   const blob = await pdf(<QuotationPDF data={data} />).toBlob();
                //   return blob;
                // };