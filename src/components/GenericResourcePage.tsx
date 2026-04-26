 import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Checkbox,
  Row,
  Col,
  DatePicker,
  InputNumber,
  InputRef,
  Typography,
  Divider,
  Alert,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { SearchOutlined, PlusOutlined, EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import type { FilterConfirmProps } from "antd/es/table/interface";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import Highlighter from "react-highlight-words";
import { generateQuotationPDF} from "./QuotationPDF";
import { useParams } from 'react-router-dom';
import {PDFPreviewModal} from './PDFPreviewModal';

import {PDFPreviewRModal} from './PDFPreviewRModal';
import {PDFPreviewModalv} from './PDFPreviewModalv';
import { OpenApiSchemaExtended } from '../utils/schema';
//import { QuotationView } from './QuotationView';
import { normalizeFormValues } from "../utils/normalizeFormValues";
import { formatProcedureName } from "../utils/formatName";

const { Text } = Typography;
interface LookupItem {
  id: string | number;
  label: string;
  [k: string]: any;
}

interface DetailConfig {
  resourceName: string; // Line item API/table
  foreignKey: string; // e.g. InvoiceId
  fields: string[]; // Columns in line items table
  quantityField?: string;
  priceField?: string;
  lineTotalField?: string;
  taxField?: string;
}
interface Props {
  resourceName: string;
  apiBaseUrl?: string;
  fields: string[];
  detailConfig?: DetailConfig;
}

export const toDayjs = (value?: string | null) =>
  value ? dayjs(value) : null;

export const GenericResourcePage: React.FC<Props> = ({
  resourceName,
  apiBaseUrl = "",
  fields ,
  detailConfig,
}) => {
   apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [data, setData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);
  const [lookupData, setLookupData] = useState<Record<string, LookupItem[]>>({});
  const [fieldsForLookup, setFieldsForLookup] = useState<Record<string, string[]>>({});
  const [form] = Form.useForm();
  const [lineEditModalVisible, setLineEditModalVisible] = useState(false);
const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [lineEditForm] = Form.useForm(); // New form for editing single line
  const [showAllFields, setShowAllFields] = useState(false);
  const [rowColor, setRowColor] = useState("#ffffff");
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [sortedInfo, setSortedInfo] = useState<{ columnKey?: string; order?: "ascend" | "descend" }>({});
  const searchInput = useRef<InputRef>(null);
  const loggedInUserId = Number(localStorage.getItem("userid") || 0);
  const [lookupModalVisible, setLookupModalVisible] = useState(false);
  const [lookupModalField, setLookupModalField] = useState<string | null>(null);
  const [lookupForm] = Form.useForm();
  const isReport = resourceName.toLowerCase().includes("report");
  const [reportParams, setReportParams] = useState<Record<string, any>>({});
  const [reportData, setReportData] = useState<any[]>([]);
  const { id } = useParams<{ id: string }>();
   const [schema, setSchema] = useState<OpenApiSchemaExtended | null>(null);
   const [lineItemRows, setLineItemRows] = useState<any[]>([]);
const [isHaveChild, setHasChild] = useState(false);

 // setHasChild(false); 
  //   let isHaveChild = false;
  //const isMaster = !!detailConfig;
//const [detailConfigState, setDetailConfigState] = useState<DetailConfig | undefined>(undefined);
const [detailConfigState, setDetailConfigState] = useState<DetailConfig | undefined>(
  detailConfig
);
// useEffect(() => {
//  setHasChild(false);// optional: set loading/default state

//   try {
//     const res =  fetch(
//       `${import.meta.env.VITE_API_BASE_URL}/procedures/ishavechild`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           tableName: resourceName || '',
//         }),
//       }
//     );

//     if (!res) {
//       throw new Error(`HTTP error! status: ${res}`);
//     }

//     const data =  res?.json();
//     console.log('Has child:', JSON.stringify(data[0].counters));
//     // Assuming backend returns something like { hasChild: true/false }
//  if(Number(data[0].counters) ==1)   
//   {setHasChild(true);
//      console.log('Has RRR. child:', data[0].counters);
//     console.log('Has isHaveChild:', isHaveChild);}
   
//   } catch (error) {
//     console.error('Error checking child:', error);
//   setHasChild(false); // or handle error appropriately
//   }
// }, [isHaveChild]);

useEffect(() => {
  const checkHasChild = async () => {
    setHasChild(false); // Reset to false while checking

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/procedures/ishavechild`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tableName: resourceName || '',
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log('Has child response:', data);

      if (data && data[0] && Number(data[0].counters) === 1) {
        setHasChild(true);
        console.log('Has child: YES');
      } else {
        setHasChild(false);
        console.log('Has child: NO');
      }
    } catch (error) {
      console.error('Error checking if has child:', error);
      setHasChild(false); // Safe default
    }
  };

  checkHasChild();
}, [resourceName]); // ← Better dependency: resourceName, not isHasChild!
console.log(`detailConfigState: `, JSON.stringify(detailConfigState));
const effectiveDetailConfig = detailConfig || detailConfigState;
console.log(`effectiveDetailConfig: `, JSON.stringify(effectiveDetailConfig));
//const isMaster = Boolean(effectiveDetailConfig);
// const isMaster = useMemo(() => {
//   return !!(detailConfig || detailConfigState);
// }, [detailConfig, detailConfigState]);


    const isMaster = useMemo(() => {
      return !!effectiveDetailConfig; // Use effective one directly
    }, [effectiveDetailConfig]);

    
  //  const isMaster = false;
    // useEffect(() => {
    //   if (!detailConfigState && resourceName === 'goodsreceiveds') {
    //     setDetailConfigState({
    //       masterKey: 'GoodsReceivedId',
    //       detailResource: 'goodsreceivedlines',
    //       foreignKey: 'GoodsReceivedId',
    //     });
    //   }
    // }, [detailConfigState, resourceName]);
useEffect(() => {
  console.log('detailConfig prop:', detailConfig);
  console.log('detailConfigState:', detailConfigState);
}, [detailConfig, detailConfigState]);

console.log(`ismaster: ${isMaster}`);
//if(isMaster){}
  const qtyField = effectiveDetailConfig?.quantityField || "quantity";
  const priceField = effectiveDetailConfig?.priceField || "price";
  const lineTotalField = effectiveDetailConfig?.lineTotalField || "lineTotal";
  const taxField = effectiveDetailConfig?.taxField;
  const [excludedLookupFields, setExcludedLookupFields] = useState<string[]>([]);
  // For lazy-loaded expandable line items
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [expandedLines, setExpandedLines] = useState<Record<string, any[]>>({});
  const [warning, setWarning] = useState("");
  const [lineWarning, setLineWarning] = useState("");
  const [lineModalVisible, setLineModalVisible] = useState(false);
  const [currentMaster, setCurrentMaster] = useState<Record<string, any> | null>(null);
  const [lineForm] = Form.useForm();
 // const [quotationData, setQuotationData] = useState<any>(null);
//const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [quotationData, setQuotationData] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sending, setSending] = useState(false);

const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
const [selectedInvoice, setSelectedInvoice] = useState<any>(null);


    //   const fetchdatachild = async (quoteId: string) => {
    //     setHasChild(false);
    //     const formData = new FormData();
        
    //     formData.append('tableName', resourceName || '');
    //    // formData.append('file', pdfBlob, `quotation-${quotationData.QuotationNumber}.pdf`);
    //  //console.log( JSON.stringify(formData));
    //    // const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/isHaveChild/${quoteId}`);
    //     const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/ishavechild`, {
    //         method: 'POST',
    //         headers: { "Content-Type": "application/json" },
    //         body: formData,
    //       });
    //     //  const result =   res;
    //   //    console.log(`This is child::${res}.  ${resourceName}`, JSON.stringify(res));
    //   };

    const fetchdatachild = async (_quoteId: string) => {
//  setHasChild(false);// optional: set loading/default state

//   try {
//     const res = await fetch(
//       `${import.meta.env.VITE_API_BASE_URL}/procedures/ishavechild`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           tableName: resourceName || '',
//         }),
//       }
//     );

//     if (!res.ok) {
//       throw new Error(`HTTP error! status: ${res.status}`);
//     }

//     const data = await res.json();
//     console.log('Has child:', JSON.stringify(data[0].counters));
//     // Assuming backend returns something like { hasChild: true/false }
//  if(Number(data[0].counters) ==1)   
//   {setHasChild(true);
//      console.log('Has RRR. child:', data[0].counters);
//     console.log('Has isHaveChild:', isHaveChild);}
   
//   } catch (error) {
//     console.error('Error checking child:', error);
//   setHasChild(false); // or handle error appropriately
//   }
};

// Call it with the correct quoteId
//fetchdatachild(quoteId); // make sure quoteId is defined

  // const handleSendEmail = async () => {
  //   if (!pdfBlob || !quotationData) return;

  //   setSending(true);
  //   const formData = new FormData();
  //   formData.append('customerEmail', quotationData.customerEmail || 'fabade2017@gmail.com');
  //   formData.append('file', pdfBlob, `quotation-${quotationData.QuotationNumber}.pdf`);

  //   try {
  //     const res = await fetch('/api/quotes/send-email', {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     const result = await res.json();

  //     if (result.success) {
  //       alert('Quotation sent successfully!');
  //       setPreviewOpen(false);
  //     } else {
  //       alert('Failed: ' + result.message);
  //     }
  //   } catch (err) {
  //     alert('Error sending email');
  //   } finally {
  //     setSending(false);
  //   }
  // };

// Detect if we're on quotations
console.log(`isInvoice ::${resourceName}`);
  const isQuotation = resourceName.includes('quotations') || resourceName.includes('quotes');
    const isReceipt = resourceName.includes('receipt') || resourceName.includes('receipts');
        const isInvoice = resourceName.includes('invoice') || resourceName.includes('invoices');
 const openPreview = (record: any) => {
  
  setSelectedQuotation(record);
    setSelectedReceipt(record);
      setSelectedInvoice(record);
  //console.log(`Record Record1:`+ JSON.stringify(record) );
  setPreviewOpen(true);
  //console.log(`Record Record:2`+ JSON.stringify(record) );
};
const loadQuotation = async (quotationId: number) => {
   console.log(`IsQuotation: ${quotationId}`);
  const res = await fetch(`${apiBaseUrl}/quotations/${quotationId}/full`);
  const data = await res.json();
  setQuotationData(data);

  // Generate PDF for preview
  const blob = await generateQuotationPDF(data);
  setPdfBlob(blob);
};
const { quoteId } = useParams<{ quoteId: string }>(); // Adjust key name if different (e.g., id, quotationId)
// Call this when viewing a quotation
// useEffect(() => {
//   if (quoteId) loadQuotation(quoteId);
// }, [quoteId]);

  useEffect(() => {
      fetchdatachild(resourceName);
    //  console.log(`Has Child ` + isHasChild);
    const fetchFullQuotation = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/quotations/${quoteId}/full`);
      const data = await res.json();
      setQuotationData(data);

      // Generate blob for email sending
      const blob = await generateQuotationPDF(data);
      setPdfBlob(blob);
    };

    if (quoteId) fetchFullQuotation();
  }, [quoteId]);
// useEffect(() => {
//   if (!detailConfig && !isReport) {
//     (async () => {
//       const detected = await resolveDetailConfig(resourceName);
//       if (detected) {
//         setDetailConfigState(detected);
//       }
//     })();
//   }
// }, [resourceName, detailConfig, isReport]);

// useEffect(() => {
//   if (detailConfig) {
//     setDetailConfigState(detailConfig);
//   }
// }, [detailConfig]);

// Replace all useEffect blocks related to detailConfigState with this single one:
useEffect(() => {
  // Always reset when resourceName changes
  setDetailConfigState(undefined);

  if (detailConfig) {
    // If explicitly passed via props (e.g. salesinvoices)
    setDetailConfigState(detailConfig);
  } else if (!isReport) {
    // Otherwise, auto-detect
    (async () => {
      const detected = await resolveDetailConfig(resourceName);
      if (detected) {
        setDetailConfigState(detected);
      } else {
        setDetailConfigState(undefined); // Explicitly null to avoid re-running
      }
    })();
  }
}, [resourceName, detailConfig, isReport]); // Re-run when any of these change
useEffect(() => {
    if (quoteId) {
      // fetch quotation, generate PDF, etc.
      loadQuotation(parseInt(quoteId));
    }
  }, [quoteId]);
  // ==================== Helpers ====================
  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };


  const subTotal = Form.useWatch("SubTotal", form);
const paid = Form.useWatch("PaidAmount", form);
const companyId = Form.useWatch("CompanyId", form);

//

  //const lineTotal = Form.useWatch("LineTotal", form);




//const TAX_RATE = 0.001; // 0.1%
  useEffect(() => {
  if (companyId) {
    const fetchTaxRate = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/execgeneric`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            PName: 'sp_TaxCodes',
            PParameters: `READRATE,${companyId},1`  // replace '1' with needed parameter if dynamic
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch tax rate');
        
        const data = await response.json();
         const tax = data[0].TaxRate;
         let taxamount = 0;
         let total = 0;
        if (data.length > 0) {
          form.setFieldValue('TaxRate', tax); // auto-fill TaxRate
          taxamount = (subTotal || 0) * tax / 100;
           total = (subTotal || 0) + taxamount;
        } else {
          form.setFieldValue('TaxRate', 0);
        }
        form.setFieldsValue({
          TaxRate: tax,
    TaxAmount: taxamount,
    TotalAmount: total,
  });
      } catch (error) {
        console.error(error);
        form.setFieldValue('TaxRate', 0);
      }
    };

    fetchTaxRate();
  } 
  
//   else
// {
//   alert("Here in");
//     const fetchWithoutTaxRate = async () => {
//       try {
    
//         // const tax = data[0].TaxRate;
//          let taxamount = 0;
//          let lineTotal = 0;
//          const submtotal = (unitPrice || 0) * (quantity||0);
//       //  if (data.length > 0) {
//       //    form.setFieldValue('TaxRate', 10); // auto-fill TaxRate
//           taxamount = (submtotal || 0) * taxRate / 100;
//            lineTotal = (submtotal || 0) + taxamount;
//      //   } else {
//      //     form.setFieldValue('TaxRate', 0);
//      //   }
//         form.setFieldsValue({
//           TaxRate: taxRate,
//     TaxAmount: taxamount,
//     LineTotal: lineTotal,
//   });
//       } catch (error) {
//         console.error(error);
//         form.setFieldValue('TaxRate', 0);
//       }
//     };

//     fetchWithoutTaxRate();
//   }
}, [companyId]);

const handleSendQuote = async () => {
  try {
    // 1. Validate form first
   // await form.validateFields();
//console.log(`These are the values:  Reached herer `);
    // 2. Save the quote first (as Draft if needed)
    const values = currentMaster; //form.getFieldsValue();
  //  console.log(`These are the currentMaster: `+JSON.stringify(currentMaster));
  //    console.log(`These are the values: `+JSON.stringify(values));
//    await handleSave({ ...values, StatusId: "1" }); // Reuse your save logic

    // 3. Generate PDF client-side (using @react-pdf/renderer)
    const pdfBlob = await generateQuotationPDF(values); // See code below
//  console.log(`These are the values: `+JSON.stringify(values));
    // 4. Upload PDF to backend and trigger email
    const formData = new FormData();
    formData.append("file", pdfBlob, `quotation-${values?.QuoteNumber || values?.id}.pdf`);
    formData.append("quoteId", String(values?.[fields[0]] ?? '')); //formData.append("quoteId", values[fields[0]]); // Primary key
    formData.append("customerEmail", values?.CustomerEmail != undefined ? values?.CustomerEmail : "fabade2017@gmail.com");
     // Assume you have this field
 //    console.log("FormData contents:");
for (const [key, value] of formData.entries()) {
  if (value instanceof Blob) {
    console.log(key, `→ Blob (size: ${value.size} bytes, type: ${value.type})`);
  } else {
    console.log(key, "→", value);
  }
}
    const res = await fetch(`${import.meta.env.VITE_API2_BASE_URL}/quotes/send-email`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to send email");

    message.success("Quote sent successfully!");

    // 5. Update status to "Sent"
    form.setFieldValue("StatusId", "2");
    await handleSave({ ...values, StatusId: "2" });

    closeModal();
    fetchData(); // Refresh list
 } catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  message.error("Failed to send quote: " + errorMessage);
}
};
const handleSendQuoteFromList = async (record: any) => {
  setCurrentMaster(record);
  console.log(`The Data Record` + JSON.stringify(record));
  // Optionally open modal or just trigger send
  await handleSendQuote(); // Reuse same logic, but use record instead of form values
};
//   useEffect(() => {
//   if (companyId) {
//     const fetchTaxRate = async () => {
//       try {
//         const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/execgeneric`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             PName: 'sp_TaxCodes',
//             PParameters: `READRATE,${companyId},1`  // replace '1' with needed parameter if dynamic
//           }),
//         });

//         if (!response.ok) throw new Error('Failed to fetch tax rate');
        
//         const data = await response.json();
//          const tax = data[0].TaxRate;
//          let taxamount = 0;
//          let total = 0;
//         if (data.length > 0) {
//           form.setFieldValue('TaxRate', tax); // auto-fill TaxRate
//           taxamount = (subTotal || 0) * tax / 100;
//            total = (subTotal || 0) + taxamount;
//         } else {
//           form.setFieldValue('TaxRate', 0);
//         }
//         form.setFieldsValue({
//     TaxAmount: taxamount,
//     TotalAmount: total,
//   });
//       } catch (error) {
//         console.error(error);
//         form.setFieldValue('TaxRate', 0);
//       }
//     };

//     fetchTaxRate();
//   }
// }, [companyId]);

// const computeLineTotals = (
//   quantity: number,
//   unitPrice: number,
//   taxRate: number
// ) => {
//   const lineTotal = quantity * unitPrice;
//   const taxAmount = lineTotal * (taxRate / 100);
//   const grossTotal = lineTotal + taxAmount;

//   return {
//     lineTotal,
//     taxAmount,
//     grossTotal,
//   };
// };


// useEffect(() => {
//   const { Quantity, UnitPrice, TaxRate } = form.getFieldsValue();
// alert("Hereere");
//   if (Quantity && UnitPrice) {
//     const { lineTotal, taxAmount, grossTotal } =
//       computeLineTotals(Quantity, UnitPrice, TaxRate || 0);

//     form.setFieldsValue({
//       LineTotal: lineTotal,
//       TaxAmount: taxAmount,
//       GrossTotal: grossTotal,
//     });
//   }
// }, [form]);
// useEffect(() => {
//   const tax = Math.round((subTotal || 0) * TAX_RATE);
//   const total = (subTotal || 0) + tax;

//   form.setFieldsValue({
//     TaxAmount: tax,
//     TotalAmount: total,
//   });
// }, [subTotal]);

useEffect(() => {
  const total = form.getFieldValue("TotalAmount") || 0;
  const balance = total - (paid || 0);

  form.setFieldValue("BalanceAmount", balance);
}, [paid]);

  const getColumnSearchProps = (dataIndex: string): any => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            OK
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value: any, record: any) =>
      record[dataIndex] ? String(record[dataIndex]).toLowerCase().includes((value as string).toLowerCase()) : false,
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const shadeColor = (color: string, percent: number) => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    R = Math.min(255, Math.max(0, Math.round(R + R * percent)));
    G = Math.min(255, Math.max(0, Math.round(G + G * percent)));
    B = Math.min(255, Math.max(0, Math.round(B + B * percent)));
    const RR = R.toString(16).padStart(2, "0");
    const GG = G.toString(16).padStart(2, "0");
    const BB = B.toString(16).padStart(2, "0");
    return `#${RR}${GG}${BB}`;
  };
  const generateNumberField = (fieldName: string) => {
    const letters = (fieldName.match(/[A-Z]/g) || []).join("") || "";
    const datePart = moment().format("YYYYMMDD");
    const randomPart = Math.floor(Math.random() * 1_000_000_0000)
      .toString()
      .padStart(10, "0");
    return `${letters}${datePart}${randomPart}`;
  };
const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "");

const singularize = (name: string) => {
  if (name.endsWith("ies")) return name.slice(0, -3) + "y";
  if (name.endsWith("ses")) return name.slice(0, -2);
  if (name.endsWith("s")) return name.slice(0, -1);
  return name;
};

const normalizeDates = (obj: Record<string, any>) => {
  const result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value && key.toLowerCase().includes("date")) {
      result[key] = dayjs(value); // 👈 REQUIRED
    } else {
      result[key] = value;
    }
  });

  return result;
};
const generateCode = (f: any) => {
  const prefix = (f.match(/[A-Z]/g) || []).join("") || "XX";
  const dateStr = moment().format("YYYYMMDD");
  const rand10 = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(10, "0");

  return `${prefix}${dateStr}${rand10}`;
};


//form.setFieldsValue(normalizeDates(apiData));
    // const resolveDetailConfigrrr = async (
    //   resourceName: string
    // ): Promise<DetailConfig | null> => {
    //   const masterNorm = normalize(resourceName);
    //   const masterSingular = singularize(masterNorm);

    //   // console.log(`resourceName:` + JSON.stringify(resourceName));
    //   // console.log(`masterNorm:` + JSON.stringify(masterNorm));
    //   // console.log(`masterSingular:` + JSON.stringify(masterSingular));
    //  /*const normalized = normalize(resourceName); // e.g. "goodsreceived"
    //   const singular = singularize(normalized);   // e.g. "goodsreceived"

    //   // All possible variations of line item table names
    //   const candidates = [
    //     `${singular}lineitems`,
    //     `${singular}lines`,
    //     `${singular}details`,
    //     `${normalized}lineitems`,
    //     `${normalized}lines`,
    //     `${normalized}details`,
    //     `sp_${singular}LineItems`,
    //     `sp_${normalized}LineItems`,
    //     `${singular}_lineitems`,
    //     `${normalized}_lineitems`,
    //     `${singular}LineItems`,
    //     `${normalized}LineItems`,
    //   ];*/
    //   // 1️⃣ Ask backend for tables (preferred)
    //  const candidates = [
    //     `${masterSingular}lineitems`,
    //    // `${masterNorm}lineitems`
    //   //  `${masterSingular}_lineitems`,//lineitems
    //   // `${masterNorm}_lineitems`// _lineitems`,lineitems
    //   ];
    // console.log(`Data:` + JSON.stringify(data));
    // console.log(`Candidate:` + JSON.stringify(candidates));

    //   for (const table of candidates) {
    //     try {
    //       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${table}`);
    //       console.log(`fields BBB:` +JSON.stringify(`${import.meta.env.VITE_API_BASE_URL}/${table}`));
    //       if (!res.ok) continue;

    //       const rows = await res.json();
    //       if (!Array.isArray(rows) || !rows.length) continue;

    //       const fields = Object.keys(rows[0]);
    // // console.log(``);

    //       // 2️⃣ Find FK properly
    //       const fk = fields.find(f =>
    //         normalize(f).includes(masterSingular) &&
    //         normalize(f).endsWith("id")
    //       );

    //       if (!fk) continue;
    // //isMaster = true;
    // //console.log(`isMaster`, isMaster);
    //       return {
    //         resourceName: table,
    //         foreignKey: fk,
    //         fields,
    //         quantityField: fields.find(f => /qty|quantity/i.test(f)),
    //         priceField: fields.find(f => /price|rate/i.test(f)),
    //         lineTotalField: fields.find(f => /total|amount/i.test(f)),
    //         taxField: fields.find(f => /tax/i.test(f)),
    //       };
    //     } catch {
    //       continue;
    //     }
    //   }

    //   return null;
    // };

//     const resolveDetailConfig = async (
//       resourceName: string
//     ): Promise<DetailConfig | null> => {
//       const masterNorm = normalize(resourceName);           // "goodsreceiveds"
//       const masterSingular = singularize(masterNorm);       // "goodsreceived"

//       // All possible line item table/endpoint names
//       const candidates = [
//         `${masterSingular}lineitems`,      // goodsreceivedlineitems
//         `${masterSingular}lines`,          // goodsreceivedlines
//         `${masterSingular}details`,        // goodsreceiveddetails
//         `${masterNorm}lineitems`,          // goodsreceivedslineitems
//         `${masterNorm}lines`,              // goodsreceivedslines
//         `${masterSingular}LineItems`,      // goodsreceivedLineItems
//         `${masterNorm}LineItems`,          // goodsreceivedsLineItems
//         `sp_${masterSingular}LineItems`,   // sp_goodsreceivedLineItems
//         `sp_${masterNorm}LineItems`,       // sp_goodsreceivedsLineItems
//       ];

//       console.log(`[Auto-Detect] Looking for line items for: ${resourceName}`);
//       console.log(`[Auto-Detect] Trying candidates:`, candidates);

//       for (const table of candidates) {
//         try {
//           const url = `${import.meta.env.VITE_API_BASE_URL}/${table}`;
//           const res = await fetch(url);

//           if (!res.ok) {
//             console.log(`[Auto-Detect] ${table} → ${res.status}`);
//             continue;
//           }

//           const rows = await res.json();
//           // if (!Array.isArray(rows) || rows.length === 0) {
//           //   console.log(`[Auto-Detect] ${table} → empty or not array`);
//           //   continue;
//           // }
// if (!Array.isArray(rows)) {
//   console.log(`[Auto-Detect] ${table} → not an array`);
//   continue;
// }
//           const fields = Object.keys(rows[0]);
//           console.log(`[Auto-Detect] SUCCESS: ${table} → found ${rows.length} rows`);

//           // Find foreign key (column that references the master)
//           const fk = fields.find(f =>
//             normalize(f).includes(masterSingular) && normalize(f).endsWith("id")
//           ) || `${masterSingular}Id`;

//           return {
//             resourceName: table,
//             foreignKey: fk,
//             fields,
//             quantityField: fields.find(f => /qty|quantity/i.test(f)) ?? "Quantity",
//             priceField: fields.find(f => /price|rate|cost/i.test(f)) ?? "UnitPrice",
//             lineTotalField: fields.find(f => /total|amount/i.test(f)) ?? "LineTotal",
//             taxField: fields.find(f => /tax|vat/i.test(f)),
//           };
//         } catch (err) {
//           console.log(`[Auto-Detect] Error trying ${table}:`, err);
//         }
//       }

//       console.warn(`[Auto-Detect] No line items table found for ${resourceName}`);
//       return null;
//     };
              //     const resolveDetailConfig = async (
              //   resourceName: string
              // ): Promise<DetailConfig | null> => {
              //   const masterNorm = normalize(resourceName);           // "goodsreceiveds"
              //   const masterSingular = singularize(masterNorm);       // "goodsreceived"

              //   const candidates = [
              //     `${masterSingular}lineitems`,      // goodsreceivedlineitems  ← THIS ONE EXISTS!
              //     // `${masterSingular}lines`,
              //     // `${masterSingular}details`,
              //     // `${masterNorm}lineitems`,
              //     // `${masterNorm}lines`,
              //     // `${masterSingular}LineItems`,
              //     // `${masterNorm}LineItems`,
              //     // `sp_${masterSingular}LineItems`,
              //     // `sp_${masterNorm}LineItems`,
              //   ];

              //   console.log(`[Auto-Detect] Looking for line items for: ${resourceName}`);
              //   console.log(`[Auto-Detect] Trying candidates:`, candidates);

              //   for (const table of candidates) {
              //     try {
              //       const url = `${import.meta.env.VITE_API_BASE_URL}/${table}`;
              //       const res = await fetch(url);
                    
              //       if (!res.ok) {
              //         console.log(`[Auto-Detect] ${table} → ${res.status}`);
              //         continue;
              //       }

              //       const rows = await res.json();

              //       // ✅ ACCEPT EVEN IF EMPTY — just check it's an array
              //       if (!Array.isArray(rows)) {
              //         console.log(`[Auto-Detect] ${table} → not an array`);
              //         continue;
              //       }

              //       // If has data → use first row to get fields
              //       // If empty → we can't get fields from data, but assume it's correct if endpoint exists
              //       const fields = rows.length > 0 
              //         ? Object.keys(rows[0]) 
              //         : []; // we'll fill fields later when loading lines

              //       console.log(`[Auto-Detect] SUCCESS: ${table} → ${rows.length} rows`);

              //       const fk = fields.find(f =>
              //         normalize(f).includes(masterSingular) && normalize(f).endsWith("id")
              //       ) || `${masterSingular}Id`;

              //       // return {
              //       //   resourceName: table,
              //       //   foreignKey: fk,
              //       //   fields: fields.length > 0 ? fields : ['GoodsReceivedId','PurchaseOrderId',  'ProductId', 'QuantityOrdered','QuantityReceived', 'UnitCost'], // fallback
              //       //   quantityField: fields.find(f => /qty|quantity/i.test(f)) ?? "QuantityReceived",
              //       //   priceField: fields.find(f => /price|rate|cost/i.test(f)) ?? "UnitCost",
              //       //   lineTotalField: fields.find(f => /total|amount/i.test(f)) ?? "TotalCost",
              //       //   taxField: fields.find(f => /tax|vat/i.test(f)),
              //       // };
              //   return {
              //             resourceName: table,
              //             foreignKey: fk,
              //             fields,
              //             quantityField: fields.find(f => /qty|quantity/i.test(f)) ?? "Quantity",
              //             priceField: fields.find(f => /price|rate|cost/i.test(f)) ?? "UnitPrice",
              //             lineTotalField: fields.find(f => /total|amount/i.test(f)) ?? "LineTotal",
              //             taxField: fields.find(f => /tax|vat/i.test(f)),
              //           };
              //     } catch (err) {
              //       console.log(`[Auto-Detect] Error trying ${table}:`, err);
              //     }
              //   }

              //   console.warn(`[Auto-Detect] No line items table found for ${resourceName}`);
              //   return null;
              // };

const resolveDetailConfig = async (  
  resourceName: string
): Promise<DetailConfig | null> => {
  const normalizedMaster = normalize(resourceName); // e.g., "quotations" → "quotations"
  const singularMaster = singularize(normalizedMaster); // "quotations" → "quotation"

  console.log(`[Auto-Detect] Resolving detail config for master: ${resourceName} (singular: ${singularMaster})`);
  //console.log(` Fields::`,JSON.stringify(fields));
  // Helper to test a candidate endpoint
  const testCandidate = async (candidate: string): Promise<DetailConfig | null> => {
    const urlsToTry = [
      `${import.meta.env.VITE_API_BASE_URL}/schema/table/${candidate}`//,
      //   `${import.meta.env.VITE_API_BASE_URL}/schema/table/${candidate}`
   //   `${import.meta.env.VITE_API_BASE_URL}/${candidate}`,
   //   `${import.meta.env.VITE_API_BASE_URL}/sp_${candidate.charAt(0).toUpperCase() + candidate.slice(1)}`,
  //    `${import.meta.env.VITE_API_BASE_URL}/sp_${candidate.toUpperCase()}`,
    ];
  console.log(`Fields::RRRRR||`,JSON.stringify(fields));
    for (const url of urlsToTry) {
      try {
        console.log(`[Auto-Detect] Trying: ${url}`);
        const res = await fetch(url);

        if (!res.ok) {
          console.log(`[Auto-Detect] ${url} → ${res.status}`);
          continue;
        }

        const text = await res.text();
        if (!text.trim()) {
          console.log(`[Auto-Detect] ${url} → empty response`);
          continue;
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          console.log(`[Auto-Detect] ${url} → invalid JSON`);
          continue;
        }

        if (!Array.isArray(data)) {
          console.log(`[Auto-Detect] ${url} → not an array`);
          continue;
        }

        // console.log(`[Auto-Detect] SUCCESS: ${url} → ${data.length} rows`);

        // Determine fields: use first row if exists, otherwise assume common ones later
       const fields = data.length > 0 ? Object.keys(data[0]) : [];
   // const fields = await res.json();
    console.log(`[Auto-Detect] SUCCESS: ${url} → ${data.length} rows`);
        // Find foreign key: look for column containing singular master name + "Id"
        let foreignKey = fields.find(f =>
          normalize(f).includes(singularMaster) && normalize(f).endsWith("id")
        );

        // Fallback patterns
        if (!foreignKey) {
          foreignKey = fields.find(f => normalize(f).endsWith("id")) ||
                       `${singularMaster}Id`;
        }
        console.log(`Fields::PPPPP-`,JSON.stringify(fields));
        // Auto-detect common fields
        const quantityField = fields.find(f => /quantity|qty|ordered|received/i.test(f)) || "Quantity";
        const priceField = fields.find(f => /price|rate|cost|unitprice/i.test(f)) || "UnitPrice";
        const lineTotalField = fields.find(f => /total|amount|linetotal/i.test(f)) || "LineTotal";
        const taxField = fields.find(f => /tax|vat/i.test(f));

        return {
          resourceName: candidate,
          foreignKey,
          fields: fields.length > 0 ? fields : [
            foreignKey,
            'ProductId',
            quantityField,
            priceField,
            lineTotalField,
            taxField ?? 'TaxRate'
          ].filter(Boolean),
          quantityField,
          priceField,
          lineTotalField,
          taxField,
        };
      } catch (err) {
        console.log(`[Auto-Detect] Error fetching ${url}:`, err);
      }
    }

    return null;
  };

  // Priority order of candidates (most likely first)
  const candidates = [
    `${singularMaster}lineitems`,        // quotationlineitems     ← most common in your code
    `${singularMaster}lines`,            // quotationlines
    `${singularMaster}details`,          // quotationdetails
    `${normalizedMaster}lineitems`,      // quotationslineitems
    `${normalizedMaster}lines`,
    `${singularMaster}LineItems`,        // QuotationLineItems (capitalized)
    `${normalizedMaster}LineItems`,
  ];

  for (const candidate of candidates) {
    const result = await testCandidate(candidate);
    if (result) {
      console.log(`[Auto-Detect] Detected detail config:`, result);
      return result;
    }
  }

  console.warn(`[Auto-Detect] No detail table found for ${resourceName}`);
  return null;
};
// const resolveDetailConfig = async (
//   resourceName: string
// ): Promise<DetailConfig | null> => {
//   const masterNorm = normalize(resourceName);
//   const masterSingular = singularize(masterNorm);

//   const candidates = [
//     `${masterSingular}lineitems`,
//   ];

//   console.log(`[Auto-Detect] Looking for line items for: ${resourceName}`);
//   console.log(`[Auto-Detect] Trying candidates:`, candidates);

//   for (const table of candidates) {
//     try {
//       const url = `${import.meta.env.VITE_API_BASE_URL}/api/schema/table/${table}`;
//       const res = await fetch(url);

//       if (!res.ok) {
//         console.log(`[Auto-Detect] ${table} → ${res.status}`);
//         continue;
//       }

//       const schema: OpenApiSchemaExtended = await res.json();

//       // Map backend detail to convenience fields
//       if (schema.detail) {
//         schema.DetailResource = schema.detail.resource;
//         schema.ForeignKey = schema.detail.foreignKey;
//       }

//       // If you have some sample rows endpoint, you can fetch fields dynamically
//       const rowsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${table}?$top=1`);
//       const rows = rowsRes.ok ? await rowsRes.json() : [];
//       const fields = Array.isArray(rows) && rows.length > 0
//         ? Object.keys(rows[0])
//         : []; // fallback if no data

//       const fk = fields.find(f =>
//         normalize(f).includes(masterSingular) && normalize(f).endsWith("id")
//       ) || `${masterSingular}Id`;

//       return {
//         resourceName: table,
//         foreignKey: fk,
//         fields,
//         quantityField: fields.find(f => /qty|quantity/i.test(f)) ?? "Quantity",
//         priceField: fields.find(f => /price|rate|cost/i.test(f)) ?? "UnitPrice",
//         lineTotalField: fields.find(f => /total|amount/i.test(f)) ?? "LineTotal",
//         taxField: fields.find(f => /tax|vat/i.test(f)),
//       };
//     } catch (err) {
//       console.log(`[Auto-Detect] Error trying ${table}:`, err);
//     }
//   }

//   console.warn(`[Auto-Detect] No line items table found for ${resourceName}`);
//   return null;
// };

const toCamelCase = (str: string): string => {
  return str.charAt(0).toLowerCase() + str.slice(1);
};
////////////////

// Helper to get resource name from path (your existing logic)
  // const getResourceName = () => {
  //   // e.g., return pathname.split('/')[1] or however you detect it
  //   return 'quotations'; // adjust based on your routing
  // };

  // New: Fetch full quotation data (with customer name + line items)
  const fetchFullQuotationData = async (quoteId: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/quotations/${quoteId}/full`);
    return await res.json();
  };

  // Send email from modal
  // const handleSendEmail = async () => {
  //   if (!pdfBlob || !record) return;

  //   setSending(true);
  //   const formData = new FormData();
  //   formData.append('customerEmail', record?.customerEmail || 'fabade2017@gmail.com');
  //   formData.append('file', pdfBlob, `quotation-${record?.QuotationNumber || id}.pdf`);

  //   try {
  //     const res = await fetch(`${import.meta.env.VITE_API2_BASE_URL}/quotes/send-email`, {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     const result = await res.json();
  //     if (result.success) {
  //       alert('Quotation sent successfully!');
  //       setPreviewOpen(false);
  //     } else {
  //       alert('Failed: ' + result.message);
  //     }
  //   } catch (err) {
  //     alert('Error sending email');
  //   } finally {
  //     setSending(false);
  //   }
  // };

const handleSendEmail = async (pdfBlob: Blob, customerEmail: string) => {
  setSending(true);
  const formData = new FormData();

  // ← USE THE EMAIL FROM THE MODAL, NOT FROM selectedQuotation
  formData.append('customerEmail', customerEmail.trim());

  formData.append('file', pdfBlob, `quotation-${selectedQuotation?.QuotationNumber || 'unknown'}.pdf`);
  // formData.append('customerEmail', selectedQuotation?.customerEmail || 'fabade2017@gmail.com');
  // formData.append('file', pdfBlob, `quotation-${selectedQuotation?.QuotationNumber || 'unknown'}.pdf`);

  try {
    const res = await fetch(`${import.meta.env.VITE_API2_BASE_URL}/quotes/send-email`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    if (result.success) {
      message.success('Quotation sent successfully!');
      setPreviewOpen(false);
    } else {
      message.error('Failed: ' + result.message);
    }
  } catch (err) {
    message.error('Error sending email');
  } finally {
    setSending(false);
  }
};
//////////////////////
// useEffect(() => {
//   (async () => {
//     const detected = await resolveDetailConfig(resourceName);
//     if (detected) {
//       setDetailConfigState(detected);
//     }
//   })();
// }, [resourceName]);
  // ==================== Data Fetching ====================
          //   const fetchData = async () => {
          //     // alert(`${resourceName}`);
          //    setData([]);
          //     setLoading(true);
          //     try {
          //       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${resourceName}`);
          //       const json = await res.json();
          //       setData(Array.isArray(json) ? json : []);
                
          //       // ONLY for quotations: generate PDF blob for preview/send
          //         if (isQuotation) {
          //           const fullData = await fetchFullQuotationData(id!); // create this helper
          //           const blob = await generateQuotationPDF(fullData);
          //           setPdfBlob(blob);
          //         }
          //     //  console.log(data);
          //  console.log(`MDAtA:` , JSON.stringify(data));
          //     } catch (err) {
          //       message.error("Failed to load data" + err);
          //     } finally {
          //       setLoading(false);
          //     }
          //   };
const fetchData = async () => {
  setData([]);
  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${resourceName}`);
    const json = await res.json();
  //  const newData = Array.isArray(json) ? json : [];
const newData = Array.isArray(json)
  ? json
  : Array.isArray(json?.data)
  ? json.data
  : Array.isArray(json?.items)
  ? json.items
  : [];
    console.log("API Response:", json);
    console.log("Data array length:", newData.length);
    if (newData.length > 0) {
      console.log("First record keys:", Object.keys(newData[0]));
      console.log("First record sample:", newData[0]);
    }

    setData(newData);

    // ... rest unchanged
  } catch (err) {
    message.error("Failed to load data: " + err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
  (async () => {
    const detected = await resolveDetailConfig(resourceName);
    if (detected) {
      setDetailConfigState(detected);
    }
  })();
}, [resourceName]);
  const runReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/${resourceName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportParams),
      });
      const json = await res.json();
      setReportData(Array.isArray(json) ? json : []);
    } catch (err) {
      message.error("Failed to run report");
    } finally {
      setLoading(false);
    }
  };
const parseDate = (val: any): moment.Moment | null => {
  if (!val) return null;
  if (moment.isMoment(val)) {
    return val.isValid() ? val : null;
  }
  if (typeof val === "string" && val.trim() !== "") {
    const m = moment(val.trim());
    return m.isValid() ? m : null;
  }
  return null;
};

const fetchLineItems = async (parentId: number,
  config: DetailConfig) => {
//console.log("BBBB detailConfig reach here..." + JSON.stringify(config));

  if (!config) return [];
console.log("Did I bbbb reach here...");
 // const fk = detailConfig.foreignKey;
 //const fk = config.foreignKey;
console.log(`Solo:`,config.resourceName);
  const attempts = [
     // `${fk}=${parentId}`,
  //  `${fk.toLowerCase()}=${parentId}`,
   // `${fk.replace(/[A-Z]/g, m => "_" + m.toLowerCase())}=${parentId}`,
   //http://localhost:5017/api/sp_QuotationLineItems/1/For
 `${parentId}`
  ];
 
 let resname =config.resourceName;
 // let resname1 =config.resourceName.replace("lineitems","LineItems");
 resname = resname.replace("lineitems","LineItems");
 //resname1 = resname1.replace("LineItems","LineItemId");
 // const resnameid = `${config.resourceName}LineItemId`;
  for (const q of attempts) {
   //  console.log("This is the line item: " + `${import.meta.env.VITE_API_BASE_URL}/sp_${resname}/${q}/For`);
    try {
  //   console.log("This is the line item: " + `${import.meta.env.VITE_API_BASE_URL}/sp_${resname}/${q}/For`);
      const url = `${import.meta.env.VITE_API_BASE_URL}/sp_${resname}/${q}/For`;
      //  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/DynamicCrud`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(q),
      // });
     const res = await fetch(url);
//    const payload = `{
//   Action: "READFOR",
//   ${resname1}: ${q}
// }`;
            // const payload = {
            //   Action: "READFOR",
            //   [resname1]: q  // dynamic property name
            // }; //`${import.meta.env.VITE_API_BASE_URL}/procedures/sp_${resname}`
            //        const res = await fetch(url, {
            //         method: "POST",
            //         headers: { "Content-Type": "application/json" },
            //         body:  JSON.stringify(payload),
            //       });

            // // 
      const text = await res.text(); // 🔥 RAW
      console.log("RAW response:", url, text);

      if (!text) return [];

      const json = JSON.parse(text);
      console.log("PARSED response:", json);

      if (Array.isArray(json)) return json;
      if (Array.isArray(json?.data)) return json.data;
      if (Array.isArray(json?.items)) return json.items;
      if (Array.isArray(json?.results)) return json.results;

    } catch (e) {
      console.error("fetchLineItems error", e);
    }
  }

  return [];
};

const stripLineItems = (obj: any) => {
  const clean = { ...obj };
  delete clean.lineItems;
  return clean;
};


  const lookupEndpointFromField = (f: string) => {
    let endpoint = f.replace(/\s/g, "");
    if (endpoint.toLowerCase().endsWith("by")) endpoint = "users";
   // if (endpoint.toLowerCase().endsWith("by")) endpoint = "users";
    if (endpoint.toLowerCase().endsWith("accountid")) endpoint = "bankaccount";
     if (endpoint.toLowerCase().endsWith("managerid")) endpoint = "users";
  //  if (endpoint.toLowerCase().endsWith("goodsreceivedid")) endpoint = "goodsreceivedid";
    endpoint = endpoint
      .replace(/yId$/i, "ies")
       .replace(/type$/i, "types")
      .replace(/y$/i, "ies")
      .replace(/ssId$/i, "sses")
     // .replace(/erId$/i, "er")
    //.replace(/edId$/i, "eds")
      .replace(/Id$/i, "s");
    endpoint = endpoint .replace(/atuss$/i, "atus");
    return endpoint.toLowerCase();
  };

  
  // ==================== Fetch Lookups ====================
  const fetchLookups = async () => {
    const newLookup: Record<string, LookupItem[]> = {};
    const newFieldsForLookup: Record<string, string[]> = {};
    const allFields = [...fields, ...(effectiveDetailConfig?.fields || [])];
  
    const lookupFields = allFields.filter((f) => {
      const lower = f.toLowerCase();
      if (excludedLookupFields.length > 0 && excludedLookupFields.some(ex => lower === ex || lower.endsWith(ex))) {
      //  console.log("Same: "+JSON.stringify(excludedLookupFields) +" " + lower);
        return false;
      }
      if (
        lower.endsWith("id") ||
        lower.endsWith("currency") ||
        lower.endsWith("company") ||
          lower.endsWith("accounttype") || lower.endsWith("entitytype") || 
        lower.endsWith("edby")
      ) {
        return true;
      }
      return false;
    });
    for (const f of lookupFields) {
      let endpointField = f;
      if (f.toLowerCase().endsWith("edby") || f.toLowerCase().endsWith("by") || f.toLowerCase().endsWith("managerid")) {
        endpointField = "users";
      }
      let endpoint = lookupEndpointFromField(endpointField);
       
      endpoint=  endpoint.toLowerCase().replace("lines","lineitems");
 endpoint = endpoint .replace(/atuss$/i, "atus");
   //    console.log(`Endpoing:  ${endpoint}`);
      // console.log(`Endpoing:  ${endpoint}`);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}`);
        if (!res.ok) continue;
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) continue;
        const sample = items[0];
        const keys = Object.keys(sample);
        const labelCandidates = keys.filter((k) => /name|title|code|desc|label/i.test(k));
        const labelKeys = labelCandidates.length ? labelCandidates.slice(0, 2) : keys.slice(1, 4);
        newLookup[f] = items.map((i: any) => {
          const labelParts = labelKeys.map((k) => i[k]).filter(Boolean);
          const label = labelParts.length ? labelParts.join(" - ") : String(i.id || i[keys[0]]);
          return { id: i.id ?? i[Object.keys(i)[0]], label, ...i };
        });
        newFieldsForLookup[f] = keys;
      } catch (err) {
        console.error(`Fetch failed for ${f} → ${endpoint}`, err);
      }
    }
    setLookupData(newLookup);
    setFieldsForLookup(newFieldsForLookup);
  };
  // ==================== Load Excluded Fields ====================
  useEffect(() => {
    const fetchExcludedLookups = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/excludedlookup`);
        if (res.ok) {
          const json = await res.json();
          const names = json.map((item: { Id: number; Name: string }) => item.Name.toLowerCase());
          setExcludedLookupFields(names);
        } else {
          throw new Error("Bad response");
        }
      } catch (err) {
        console.warn("Failed to load excluded lookups, using fallback", err);
        setExcludedLookupFields(["transactionid", "referenceid", "movementid", "parentid", "grnid"]);
      }
    };
    fetchExcludedLookups();
  }, [import.meta.env.VITE_API_BASE_URL]);
useEffect(() => {
  if (editingItem) {
    // Only set values if we are editing and the item exists
    form.setFieldsValue(editingItem);
  } else {
    // Optionally reset the form when adding a new item
    form.resetFields();
  }
}, [editingItem, form]); // Re-run whenever editingItem or form changes
  // ==================== Initial Load ====================
  useEffect(() => {
    if (isReport) runReport();
    else fetchData();
     fetchLookups();
  }, [resourceName, excludedLookupFields, effectiveDetailConfig]);
  // ==================== Auto-detect Detail Config ====================
//   useEffect(() => {
// //        console.log(resourceName);
//         resourceName.replace("lines","lineitems");
//     if (!detailConfig && !resourceName.toLowerCase().endsWith("lineitems") && !isReport) {
//       let singularBase = resourceName;
// //      console.log(singularBase);
//       if (singularBase.endsWith("ies")) singularBase = singularBase.slice(0, -3) + "y";
//       else if (singularBase.endsWith("sses")) singularBase = singularBase.slice(0, -2);
//       else if (singularBase.endsWith("s")) singularBase = singularBase.slice(0, -1);
//       const detailResource = `${singularBase}`.toLowerCase();
//       const foreignKey = `${singularBase}Id`.toLowerCase();
//       const checkDetail = async () => {
//         setLoading(true);
//         try {
//           const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${detailResource}`);
//           if (res.ok) {
//             const json = await res.json();
//             if (Array.isArray(json) && json.length > 0) {
//               const sample = json[0];
//               const detailFields = Object.keys(sample);
//               setDetailConfigState({
//                 resourceName: detailResource,
//                 foreignKey,
//                 fields: detailFields,
//                 quantityField: detailFields.find((f) => /quantity|qty/i.test(f.toLowerCase())) || "quantity",
//                 priceField: detailFields.find((f) => /price|rate|amount/i.test(f.toLowerCase())) || "price",
//                 lineTotalField: detailFields.find((f) => /linetotal|total/i.test(f.toLowerCase())) || "lineTotal",
//                 taxField: detailFields.find((f) => /tax|vat/i.test(f.toLowerCase())),
//               });
//             }
//           }
//         } catch {}
//         setLoading(false);
//       };
//       checkDetail();
//     }
//   }, [resourceName, import.meta.env.VITE_API_BASE_URL, detailConfig, isReport]);
//   // ==================== Edit & Calculations ====================

const handleEdit = async (record: Record<string, any>) => {
  form.resetFields();

  const normalizedValues: Record<string, any> = {};

  fields.forEach((field) => {
    const value = record[field];
    const lower = field.toLowerCase();

    const isDateField = /date|month|edat|at/i.test(lower);
    const isBooleanField = /^(is|has|active|enabled)/i.test(lower);
  //  const isLookupField = /id$/i.test(lower) && lookupData[field];
    // === EXPANDED LOOKUP DETECTION ===
  const isLookupField = 
    lower.endsWith("id") || 
    lower.endsWith("by") ;                    // ← NEW: CreatedBy, UpdatedBy
    // lower.includes("createdby") || 
    // lower.includes("updatedby") || 
    // lower.includes("modifiedby") || 
    // lower.includes("enteredby");
    const isPureYearField = /year/i.test(lower);
    if (value == null) {
      normalizedValues[field] = undefined;
    } else if (isDateField) {
      const d = dayjs(value);
      normalizedValues[field] = d.isValid() ? d : undefined;
    } else if (isPureYearField) {
   //   const d = dayjs(value);
     // normalizedValues[field] = d.isValid() ? d : undefined;
      normalizedValues[field] = Number(value); // ensures it's a clean integer
    } else if (isLookupField) {
      normalizedValues[field] = Number(value);
    } else if (isBooleanField) {
      normalizedValues[field] = Boolean(value);
    } else {
      normalizedValues[field] = value;
    }
  });

  // Master–detail
  if (isMaster && effectiveDetailConfig) {
    try {
      const did = Number(record[fields[0]]);
      const lines = await fetchLineItems(did, effectiveDetailConfig);

      normalizedValues.lineItems = (lines || []).map((line: any) => {
        const obj: any = {};
        effectiveDetailConfig.fields.forEach((f) => {
          const v = line[f];
          if (v == null) return;

          if (/id$/i.test(f)) obj[f] = Number(v);
          else if (/date|month|edat|at/i.test(f)) {
            const d = dayjs(v);
            obj[f] = d.isValid() ? d : undefined;
          } else {
            obj[f] = v;
          }
        });
        return obj;
      });
    } catch (e) {
      console.error("Failed to load line items", e);
      normalizedValues.lineItems = [];
    }
  }

  form.setFieldsValue(normalizedValues);
  setEditingItem(record);
  setModalVisible(true);
};

useEffect(() => {
  console.log("Current editingItem:", editingItem ? JSON.stringify(editingItem) : null);
}, [editingItem]);

// const handleEditLine = (index: number) => {
//   const lines = lineForm.getFieldValue("lineItems") || [];
//   const lineToEdit = lines[index];

//   // Pre-fill the edit form
//   lineEditForm.setFieldsValue(lineToEdit);

//   setEditingLineIndex(index);
//   setLineEditModalVisible(true);
// };

        // const handleEditLine = (index: number) => {
        //   const lines = lineForm.getFieldValue("lineItems") || [];
        //   const lineToEdit = lines[index];

        //   setEditingLineIndex(index);
        //   setLineEditModalVisible(true);

        //   // wait until modal renders
        //   setTimeout(() => {
        //     lineEditForm.setFieldsValue({
        //       ...lineToEdit
        //     });
        //   }, 0);
        // };
const handleEditLine = (index: number) => {
  const lines = lineForm.getFieldValue("lineItems") || [];
  const lineToEdit = lines[index];

  if (!lineToEdit) return;

  // Normalize values (especially dates and lookups)
  const normalized = { ...lineToEdit };

  // Handle dates properly
  effectiveDetailConfig?.fields.forEach((field) => {
    const value = lineToEdit[field];
    const lower = field.toLowerCase();

    if ((lower.includes("date") || lower.endsWith("at")) && value) {
      const d = dayjs(value);
      if (d.isValid()) {
        normalized[field] = d;
      }
    }
  });

  // Set form values
  lineEditForm.setFieldsValue(normalized);

  // Store index for saving
  setEditingLineIndex(index);

  // Open modal
  setLineEditModalVisible(true);
};
const quantityOnHand = Form.useWatch("QuantityOnHand", form);
const quantity = Form.useWatch("Quantity", form);

const valueA = quantityOnHand ?? quantity;
const valueB = Form.useWatch("QuantityReserved", form);
// const taxRate = Form.useWatch("TaxRate", form);
 //const quantity = Form.useWatch("Quantity", form);
 const unitPrice = Form.useWatch("UnitPrice", form);
const quantityReserved = Form.useWatch("QuantityReserved", form);
const LastCostPrice = Form.useWatch("LastCostPrice", form);
const valueC = unitPrice ?? LastCostPrice;
const valueD = quantity ?? quantityReserved;
useEffect(() => {
  const result = (valueA || 0) - (valueB || 0);
  const avgresult = (valueD || 0) * (valueC || 0);
  form.setFieldValue("QuantityAvailable", result);
  form.setFieldValue("AverageCost", avgresult);
   
}, [valueA, valueB]);


  const calculateTotals = useCallback(() => {
    const lines: any[] = form.getFieldValue("lineItems") || [];
    let subtotal = 0;
    lines.forEach((line: any, index: number) => {
      const qty = Number(line[qtyField] || 0);
      const price = Number(line[priceField] || 0);
      const lineTotal = qty * price;
      subtotal += lineTotal;
      if (lineTotalField) {
        form.setFieldValue(["lineItems", index, lineTotalField], lineTotal);
      }
    });
    let tax = 0;
    if (taxField) {
      tax = lines.reduce((sum: number, line: any) => {
        const lineSub = Number(line[qtyField] || 0) * Number(line[priceField] || 0);
        return sum + lineSub * (Number(line[taxField] || 0) / 100);
      }, 0);
    }
    const grandTotal = subtotal + tax;
    form.setFieldsValue({
      subtotal,
      taxAmount: tax,
      grandTotal,
    });
    // Check for exceeding limits
    let newWarning = "";
    const currentValues = form.getFieldsValue(true);
    const possibleLimitFields = ["totalCredit", "totalDebit", "totalAmount", "budget", "maxAmount"];
    const limitField = possibleLimitFields.find((lf) => fields.includes(lf));
    if (limitField) {
      const limit = Number(currentValues[limitField] || 0);
      if (grandTotal > limit) {
        newWarning = `Warning: Grand total (${grandTotal.toLocaleString()}) exceeds ${limitField} (${limit.toLocaleString()})`;
      }
    }
    setWarning(newWarning);
  }, [form, qtyField, priceField, lineTotalField, taxField, fields]);
  const calculateLineTotals = useCallback(() => {
   
    const lines: any[] = lineForm.getFieldValue("lineItems") || [];
    let subtotal = 0;
   // let linetotal = 0;
    let tax = 0;
   //// console.log(`Sweep: ` + JSON.stringify(lines));
    lines.forEach((line: any) => {
      const qty = Number(line[qtyField] || 0);
      const price = Number(line[priceField] || 0);
      const lineTotal = qty * price;
//// console.log(`Sweep qty: ` + JSON.stringify(qty));
//// console.log(`Sweep price: ` + JSON.stringify(price));
//// console.log(`Sweep lineTotal: ` + JSON.stringify(lineTotal));
const updatedLines = lines.map((line, _index) => {
  const qty = Number(line[qtyField] ?? 0);
  const price = Number(line[priceField] ?? 0);
  const rate =
  taxField && taxField in line
    ? Number(line[taxField])
    : 0;

  const lineTotal = qty * price;

  subtotal += lineTotal;
  tax += lineTotal * (rate / 100);

  return {
    ...line,
    [lineTotalField]: lineTotal, // 👈 update THIS ROW
  };
});

// 🔴 Update line items in one go (IMPORTANT)
lineForm.setFieldsValue({
  lineItems: updatedLines,
});
      subtotal += lineTotal;
      if (taxField) {
        tax += lineTotal * (Number(line[taxField] || 0) / 100);
      }
    });
    const grandTotal = subtotal + tax;
    // Check for exceeding limits
    let newWarning = "";
    const possibleLimitFields = ["totalCredit", "totalDebit", "totalAmount", "budget", "maxAmount", "lineTotal"];
    const limitField = possibleLimitFields.find((lf) => fields.includes(lf));
    if (limitField && currentMaster) {
      const limit = Number(currentMaster[limitField] || 0);
      if (grandTotal > limit) {
        newWarning = `Warning: Grand total (${grandTotal.toLocaleString()}) exceeds ${limitField} (${limit.toLocaleString()})`;
      }
    }
    setLineWarning(newWarning);
    return { subtotal, tax, grandTotal };
  }, [lineForm, qtyField, priceField, taxField, fields, currentMaster]);
  // Trigger recalculation on form changes
  const handleValuesChange = useCallback(() => {
    if (isMaster) {
      calculateTotals();
    }
  }, [isMaster, calculateTotals]);

  // const handleLineValuesChange = useCallback(() => {
  //   if (isMaster) {
  //     calculateLineTotals();
  //   }
  // }, [isMaster, calculateLineTotals]);
  const handleLineValuesChange = useCallback(() => {
  const lines = lineForm.getFieldValue("lineItems") || [];

  lines.forEach((_: any, index: number) => {
    const qty = Number(lineForm.getFieldValue(["lineItems", index, qtyField]) || 0);
    const price = Number(lineForm.getFieldValue(["lineItems", index, priceField]) || 0);
    const lineTotal = qty * price;

    // Update LineTotal field if it exists
    if (lineTotalField) {
      lineForm.setFieldValue(["lineItems", index, lineTotalField], lineTotal);
    }

    // Optional: update tax per line if taxField exists
    if (taxField) {
      const taxRateValue = Number(lineForm.getFieldValue(["lineItems", index, taxField]) || 0);
      const taxAmount = lineTotal * (taxRateValue / 100);
      // You can add a "TaxAmount" field per line if needed
    }
  });

  // Optional: recalculate grand totals in master form if needed
  calculateTotals(); // if you want header totals to update too
}, [lineForm, qtyField, priceField, lineTotalField, taxField, calculateTotals]);


  // ==================== Save Logic ====================
  const handleSave_older = async (values: Record<string, any>) => {
    fields.forEach((f) => {
      if (values[f] && moment.isMoment(values[f])) values[f] = values[f].format("YYYY-MM-DD");
      if (!editingItem && f.toLowerCase().includes("by")) values[f] = loggedInUserId;
      if (!editingItem && f.toLowerCase().includes("number")) values[f] = generateNumberField(f);
    });
    let url = `${import.meta.env.VITE_API_BASE_URL}/${resourceName}`;
    let method = "POST";
    let payload: any = { ...values };
    if (editingItem) {
      method = "PUT";
      const pk = editingItem[fields[0]];
      url = `${import.meta.env.VITE_API_BASE_URL}/${resourceName}/${pk}`;
    }
if ((method === "POST") || (method === "PUT")) {
  const primaryKeyField = fields[0];
  if (primaryKeyField?.toLowerCase().endsWith("id")) {
    delete payload[primaryKeyField];
  }
}
   
    if (isMaster) {
      const lineItemsValue = form.getFieldValue("lineItems") || [];
     // payload = { ...values, [effectiveDetailConfig!.resourceName]: lineItemsValue };
      payload = {
  ...values,
  lineItems: lineItemsValue, // 🔥 ONLY THIS
};

      url = `${import.meta.env.VITE_API_BASE_URL}/${resourceName}/${editingItem ? `${editingItem[fields[0]]}` : ""}`;
    }

const { lineItems, ...payloadWithoutLineItems } = payload;

console.log(JSON.stringify(payload));
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadWithoutLineItems),
      });
      if (!res.ok) throw new Error(await res.text() || "Save failed");
      message.success("Saved successfully");
      closeModal();
      fetchData();
    } catch (err: any) {
      if (isMaster && err.message.includes("404")) {
        await handleSaveFallback(values);
      } else {
        message.error(err.message || "Save failed");
      }
    }
  };

  
  const handleSave = async (values: Record<string, any>) => {
  // Normalize dates and auto-fill fields
 // if(resourceName ==="goodsreceived") resourceName ="goodsreceiveds";

//  console.log(`Payload values:: `, JSON.stringify(values));

  fields.forEach((f) => {

     console.log(`Payload f :: `, JSON.stringify(f));

    if (values[f] && moment.isMoment(values[f]) ) {
      values[f] = values[f].format("YYYY-MM-DD");
    }
    if ( f.toLowerCase().endsWith("year")) {
     // values[f] = values[f];//.format("YYYY");
     values[f] =  `"${values[f]}"`;
     // console.log(`111 Payload values:: `, JSON.stringify( values[f]));
    }
    if (!editingItem && f.toLowerCase().includes("by")) {
      values[f] = loggedInUserId;
    }
    if (!editingItem && f.toLowerCase().includes("number")) {
      values[f] = generateNumberField(f);
    }
  });

  let savedHeader = editingItem ? { ...editingItem } : null;
  let parentId = editingItem ? editingItem[fields[0]] : null;

  try {
    // Step 1: Save header
    let url = `${import.meta.env.VITE_API_BASE_URL}/${resourceName}`;
    let method = "POST";
    if (editingItem) {
      method = "PUT";
      url = `${import.meta.env.VITE_API_BASE_URL}/${resourceName}/${parentId}`;
    }
delete values.QuantityAvailable;
    const headerPayload = { ...values };
    delete headerPayload.lineItems; // never send lineItems to header endpoint
    if (headerPayload.BudgetYear) {
  headerPayload.BudgetYear = new Date(headerPayload.BudgetYear).getFullYear();
}
console.log(`Payload:: `, JSON.stringify(headerPayload));

    const headerRes = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(headerPayload),
    });

    if (!headerRes.ok) {
      throw new Error(await headerRes.text().catch(() => "Save failed"));
    }

    if (!editingItem) {
      savedHeader = await headerRes.json();
      parentId = savedHeader![fields[0]];
    }

    message.success("Header saved");
 
    // Step 2: Save line items (only if master-detail)
    if (isMaster && effectiveDetailConfig) {
      const lines = form.getFieldValue("lineItems") || [];

      // Optional: delete old lines on edit
      if (editingItem) {
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/${effectiveDetailConfig.resourceName}/${parentId}`,  //${effectiveDetailConfig.foreignKey}
          { method: "DELETE" }
        ).catch(() => {});
      }
      
      // Save each line
      for (const line of lines) {
        const linePayload = {
          ...line,
          [effectiveDetailConfig.foreignKey]: parentId,
        };

        // Normalize dates in lines
        effectiveDetailConfig.fields.forEach((f) => {
          if (linePayload[f] && moment.isMoment(linePayload[f])) {
            linePayload[f] = linePayload[f].format("YYYY-MM-DD");
          }
        });
 
        const lineRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/${effectiveDetailConfig.resourceName}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(linePayload),
          }
        );

        if (!lineRes.ok) {
          console.error("Failed to save line item", linePayload);
        }
      }

      message.success("Line items saved");
    }

    closeModal();
    fetchData();
  } catch (err: any) {
    message.error(err.message || "Save failed");
  }
};
  const handleSaveFallback = async (headerValues: any) => {
    try {
      const headerUrl = `${import.meta.env.VITE_API_BASE_URL}/${resourceName}${editingItem ? `/${editingItem[fields[0]]}` : ""}`;
      const headerRes = await fetch(headerUrl, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(headerValues),
      });
      if (!headerRes.ok) throw new Error("Header save failed");
      const savedHeader = editingItem ? editingItem : await headerRes.json();
      const parentId = savedHeader[fields[0]];
      const lines = form.getFieldValue("lineItems") || [];
      if (editingItem) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${effectiveDetailConfig!.resourceName}/by-${effectiveDetailConfig!.foreignKey}/${parentId}`, {
          method: "DELETE",
        }).catch(() => {});
      }
      for (const line of lines) {
        const linePayload = { ...line, [effectiveDetailConfig!.foreignKey]: parentId };
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${effectiveDetailConfig!.resourceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(linePayload),
        });
      }
      message.success("Saved successfully (fallback)");
      closeModal();
      fetchData();
    } catch (err) {
      message.error("Fallback save failed" + err);
    }
  };
  const handleDelete = async (record: Record<string, any>) => {
    const rowKey = getRowKey(record);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${resourceName}/${rowKey}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      message.success("Deleted successfully");
    } catch (err) {
      message.error("Delete failed" + err);
    } finally {
      fetchData();
    }
    if (currentMaster && effectiveDetailConfig) {
  const parentId = currentMaster[fields[0]];
  await fetchLineItemsForParent(parentId); // updates state automatically
}
  };

  //  const handleInlineDelete = async (record: number) => {
  //   console.log('VVV: ' +JSON.stringify(effectiveDetailConfig));
  //   console.log('VVV: ' + record);
  //   const rowKey = record ; //getRowKey(record);
  //   try {
  //     const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${resourceName}/${rowKey}`, { method: "DELETE" });
  //     if (!res.ok) throw new Error("delete failed");
  //     message.success("Deleted successfully");
  //   } catch (err) {
  //     message.error("Delete failed" + err);
  //   } finally {
  //     fetchData();
  //   }
  // };
  const handleSaveEditedLine = async () => {
  try {
    const values = await lineEditForm.validateFields();

    // Update the line in the main lineItems list
    const lines = lineForm.getFieldValue("lineItems") || [];
    const updatedLines = [...lines];
    updatedLines[editingLineIndex!] = values;

    lineForm.setFieldsValue({ lineItems: updatedLines });

    // Optional: Recalculate totals
    handleLineValuesChange();

    message.success("Line item updated");
    setLineEditModalVisible(false);
    setEditingLineIndex(null);
    lineEditForm.resetFields();
  } catch (err) {
    console.error("Validation failed:", err);
  }
};
  const handleInlineDelete = async (
  index: number,
  _field: any
) => {
  const values = lineForm.getFieldValue("lineItems") || [];
  const line = values[index];

  const pkField = effectiveDetailConfig!.fields[0];
  const lineId = line?.[pkField];

  // 🟡 If this line exists in DB → delete via API
  if (lineId) {
    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/${effectiveDetailConfig!.resourceName}/${lineId}`,
        { method: "DELETE" }
      );
    } catch (err) {
      message.error("Failed to delete line item");
      return;
    }
  }

  // 🔵 Always remove from form
  const updated = [...values];
  updated.splice(index, 1);
  lineForm.setFieldsValue({ lineItems: updated });
};

  const closeModal = () => {
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
    setExpandedRowKeys([]); // optional
    setWarning("");
  };
  const getRowKey = (record: Record<string, any>) => {
    const idField = fields.find((f) => f.toLowerCase().endsWith("id"));
    return idField && record[idField] !== undefined ? String(record[idField]) : JSON.stringify(record);
  };
  // ==================== Manage Lines ====================
  const handleManageLines = async (record: Record<string, any>) => {
    setCurrentMaster(record);
    setLoading(true);
     // console.log("Firein");
    try {
       const did = Number(record[fields[0]]);
      const lines = await fetchLineItems(did,
    effectiveDetailConfig!);
      // const normalizedLines = lines.map((line: any) => {
      //   const normalizedLine: any = {};
      //   effectiveDetailConfig!.fields.forEach((f) => {
      //     let val = line[f];
      //     if (val !== null && val !== undefined) {
      //       if (f.toLowerCase().endsWith("id") && typeof val === "string") {
      //         normalizedLine[f] = Number(val);
      //       } else if (/date|year|month|edat/i.test(f) && typeof val === "string") {
      //         normalizedLine[f] = moment(val);
      //       } else {
      //         normalizedLine[f] = val;
      //       }
      //     }
      //   });
      //   return normalizedLine;
      // });
   const  normalizedLines = lines.map((line: any) => {
  const normalizedLine: any = {};
  effectiveDetailConfig!.fields.forEach((f) => {
    const val = line[f];
    if (val !== null && val !== undefined) {
      const lower = f.toLowerCase();
    if (lower.includes("date") || lower.includes("year") || lower.includes("month") || lower.endsWith("edat") || lower.endsWith("at")) {
  if (typeof val === "string" && val.trim() !== "") {
    const m = parseDate(moment(val));
    normalizedLine[f] = m!.isValid() ? m : null;  // Only set if valid
  } else if (moment.isMoment(val) && val.isValid()) {
    normalizedLine[f] = val;
  } else {
    normalizedLine[f] = null;  // or undefined
  }
} else if (lower.endsWith("id") && typeof val === "string") {
  normalizedLine[f] = Number(val);
} else {
  normalizedLine[f] = val;
}
    }
  });
  console.log(`JSON normaliszed:: ${normalizedLine}`);
  return normalizedLine;
});
lineForm.setFieldsValue({ lineItems: normalizedLines.length ? normalizedLines : [] });
   //   lineForm.setFieldsValue({ lineItems: normalizedLines });
    } catch (err) {
      console.error("Failed to load line items", err);
      lineForm.setFieldsValue({ lineItems: [] });
    }
    setLoading(false);
    setLineModalVisible(true);
  };
// const fetchLineItemsForParent = async (parentId: number) => {
//   if (!effectiveDetailConfig) return [];
//   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${effectiveDetailConfig.resourceName}?${effectiveDetailConfig.foreignKey}=${parentId}`);
//   if (!res.ok) return [];
//   return res.json();
// };
const fetchLineItemsForParent = async (parentId: number) => {
  // console.log("Firein");
  if (!effectiveDetailConfig) return [];
  //console.log('pkField?:  '+JSON.stringify(pkField));
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${effectiveDetailConfig.resourceName}?${effectiveDetailConfig.foreignKey}=${parentId}`);
  if (!res.ok) return [];
  
  const data = await res.json();
  setLineItemRows(data); // update the state so grid refreshes
  return data;
};
  const handleSaveLines = async () => {
  try {
    const values = await lineForm.validateFields();
    const lines = values.lineItems || [];
    let pkField1: any;
    const parentId = currentMaster![fields[0]];

    // Step 1: Fetch current line items to get their IDs for deletion
    const currentLines = await fetchLineItems(parentId,effectiveDetailConfig! );
    const lineResource = effectiveDetailConfig!.resourceName;
 
    // Delete each existing line item by its primary key
    for (const oldLine of currentLines) {
      const pkField = effectiveDetailConfig!.fields.find(f => 
        f.toLowerCase().endsWith("id") && 
        f.toLowerCase().startsWith(lineResource.replace(/lineitems$/i, "").toLowerCase())
      ) || "id"; // fallback
 //console.log('pkField?:  '+JSON.stringify(pkField));
 
 pkField1 = toCamelCase(pkField);

 console.log('lineResource?:  '+JSON.stringify(lineResource));
 let pkFieldResource = toCamelCase(pkField);
if (pkFieldResource.endsWith("LineId")) {
  pkFieldResource = pkFieldResource.replace(/LineId$/, "LineItems");
}
if (pkFieldResource.endsWith("LineItemId")) {
  pkFieldResource = pkFieldResource.replace(/LineItemId$/, "LineItems");
}
  //  console.log('effectiveDetailConfig?:  '+JSON.stringify(effectiveDetailConfig));
      const oldId = oldLine[pkField];
      if (oldId) {
  //       console.log('pppppppppplines:  '+`${import.meta.env.VITE_API_BASE_URL}/${toCamelCase(lineResource)}/${oldId}`); ///DELETEFORALL
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/${toCamelCase(lineResource)}/${oldId}`, {  ///DELETEFORALL
          method: "DELETE",
        }).catch(() => console.warn(`Failed to delete old line item ${oldId}`));
      }
    }
      
    // Step 2: Create all current lines as new
    for (const line of lines) {
            const pkField = effectiveDetailConfig!.fields.find(f => 
        f.toLowerCase().endsWith("id") && 
        f.toLowerCase().startsWith(lineResource.replace(/lineitems$/i, "").toLowerCase())
      ) || "id"; // fallback
 //console.log('pkField?:  '+JSON.stringify(pkField));
 
 pkField1 = toCamelCase(pkField);

      const normalizedLine: any = {};
      Object.keys(line).forEach((key) => {
        normalizedLine[toCamelCase(key)] = line[key];
      });
      normalizedLine[toCamelCase(effectiveDetailConfig!.foreignKey)] = parentId;

      // Normalize dates
      effectiveDetailConfig!.fields.forEach((f) => {
        const camelKey = toCamelCase(f);
        if (normalizedLine[camelKey] && moment.isMoment(normalizedLine[camelKey])) {
          normalizedLine[camelKey] = normalizedLine[camelKey].format("YYYY-MM-DD");
        }
      });
      // Remove PK before sending if it exists
//&& normalizedLine[pkField1] !== undefined
console.log(`lineresource:  ${import.meta.env.VITE_API_BASE_URL}/${lineResource}`);
console.log(`pkField1::::${pkField1}`);
if (pkField1 ) {
  delete normalizedLine[pkField1];
}

       console.log('normalised:  '+JSON.stringify(normalizedLine));
       console.log('pkField1:  '+JSON.stringify(pkField1));
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${lineResource}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedLine),
      });
if (!res.ok || (res && !res?.ok)) {
    const errText = await res.text();
        throw new Error(res?.status +`HTTP ${errText}: Save failed`);
      }
  //     if (!res.ok) {
  //       const errText = await res.text();
   
  // //setRows(prev => [...prev, data]); // append new row

  //       console.error("Failed to save line item:", errText);
  //     }
    }
    // Refresh line items for current master
if (currentMaster && effectiveDetailConfig) {
  const parentId = currentMaster[fields[0]];
  const updatedLines = await fetchLineItemsForParent(parentId);
  setLineItemRows(updatedLines); // <-- your line items state
}
            //   message.success("Line items saved successfully");
            //   setLineModalVisible(false);
            //   lineForm.resetFields();
            //   setCurrentMaster(null);
            //   setEditingItem(null);
              
            //  // setLineItemRows([]);
            //  // fetchData(); // refresh main table
            

            // } catch (err) {
            //   console.error("Save lines error:", err);
            //   message.error("Failed to save line items");
            // }

            // if (currentMaster && effectiveDetailConfig) {
            // const parentId = currentMaster[fields[0]];
            // await fetchLineItemsForParent(parentId); // updates state automatically
    message.success("Line items saved successfully");
    setLineModalVisible(false);
    lineForm.resetFields();
    setCurrentMaster(null);

    // ✅ Refresh the MAIN table to show updated totals, status, etc.
    fetchData();

    // Optional: Also refresh expanded lines if the row is open
    if (currentMaster) {
      const key = getRowKey(currentMaster);
      const parentId = currentMaster[fields[0]];
      const freshLines = await fetchLineItems(parentId, effectiveDetailConfig!);
      setExpandedLines((prev) => ({ ...prev, [key]: freshLines }));
    }
  } catch (err) {
    console.error("Save lines error:", err);
    message.error("Failed to save line items");
  

    // Simple full reload
// window.location.reload();
}
};
  // ==================== + Add Lookup Item ====================
  const openAddLookup = (field: string) => {
   setLookupModalField(field);
  
    setLookupModalVisible(true); //alert("Saveing");
  };
  const handleAddNewLookup = async () => {
    if (!lookupModalField) return;
   
    try {
      const values = await lookupForm.validateFields();
      const endpoint = lookupEndpointFromField(lookupModalField);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("create lookup failed");
      message.success("Added successfully");
      setLookupModalVisible(false);
      lookupForm.resetFields();
      await fetchLookups();
    } catch (err) {
      message.error("Failed to add lookup item" + err);
    }
  };
  // ==================== Render Form Items ====================
        //   const renderFormItemComponent = (f: string, _isLineItem = false) => {
        //     const lower = f.toLowerCase();
        //     const isExcluded = excludedLookupFields.some((ex) => lower === ex || lower.endsWith(ex));
        //     const isByField = lower.endsWith("by") || lower.endsWith("edby");
        //     const isLookup = (lower.endsWith("id") ||lower.endsWith("currency") || lower.endsWith("company") || lower.endsWith("accounttype") || lower.endsWith("status") || lower.endsWith("entitytype")) && !isExcluded && !isByField;
        //     const isBoolean = /is|active|enabled/i.test(f);
        //    // const isDate = /date/i.test(f);
        //   //   const isDate =
        //   // lower.includes("date") ||
        //   // lower.endsWith("edat");
        //   const isDate = 
        //   lower.includes("date") || 
        //   lower.endsWith("at") || 
        //   lower.includes("month"); // && lower.includes("date"); // e.g., InvoiceDateYear|| (lower.includes("year") 
        //  // const isPureYear = lower.includes("year") && !lower.includes("date") && !lower.includes("month");
        //  const isPureYear = 
        //   (lower === "budgetyear" || 
        //    lower === "fiscalyear" || 
        //    lower === "year" || 
        //    lower.endsWith("year")) && 
        //   !lower.includes("date") && 
        //   !lower.includes("at") && 
        //   !lower.includes("month");
        //     // const isYear = /year/i.test(f);
        //     // const isMonth = /month/i.test(f);
        //     const isNumber = /amount|year|price|total|qty|quantity|rate|balance/i.test(f);
        //     if (isLookup) {
        //       const options = lookupData[f]?.map((i) => ({ label: i.label, value: i.id })) || [];
        //       return (
        //         <Select
        //           options={options}
        //           showSearch
        //           optionFilterProp="label"
        //           allowClear
        //           placeholder={`Select ${f}`}
        //         />
        //       );
        //     }
        //     if (isByField && lookupData[f]) {
        //       const options = lookupData[f]?.map((i) => ({ label: i.label, value: i.id })) || [];
        //       return <Select options={options} disabled />;
        //     }
        //     if (isBoolean) return <Checkbox />;
        //  if (isPureYear) {
        //   // Special handling for year-only integer fields like BudgetYear
        //   return (
        //     <InputNumber
        //       style={{ width: "100%" }}
        //       min={2000}
        //       max={2100}
        //       placeholder="e.g. 2026"
        //     />
        //   );
        // }
        // if (isDate) {
        //   // Keep your existing DatePicker logic for real dates (YYYY-MM-DD)
        //   let dateValue;
        //   const rawValue = editingItem?.[f];
        // //console.log(`rawValue::: `,JSON.stringify(rawValue));
        //   if (dayjs.isDayjs(rawValue)) {
        //     dateValue = rawValue;
        //   } else if (typeof rawValue === "string") {
        //     dateValue = dayjs(rawValue);
        //   } else if (typeof rawValue === "number") {
        //     // For timestamps (rare, but safe)
        //     dateValue = dayjs(rawValue);
        //   } else {
        //     dateValue = undefined;
        //   }

        //   return (
        //     <DatePicker
        //       value={dateValue?.isValid() ? dateValue : undefined}
        //       format="YYYY-MM-DD"
        //       style={{ width: "100%" }}
        //     />
        //   );
        // }
        //         //    if (isDate) {
        //         //   // editingItem[f] could be a timestamp, string, or dayjs
        //         //   let dateValue;
        //         //   const rawValue = editingItem?.[f];

        //         //   if (dayjs.isDayjs(rawValue)) {
        //         //     dateValue = rawValue;
        //         //   } else if (typeof rawValue === "number") {
        //         //     dateValue = dayjs(rawValue); // timestamp → dayjs
        //         //   } else if (typeof rawValue === "string") {
        //         //     dateValue = dayjs(rawValue); // string → dayjs
        //         //   } else {
        //         //     dateValue = undefined; // no value
        //         //   }
        //         //     // Hide the first field (primary key) for new rows
        //         //   // if (index >= 0 && f === effectiveDetailConfig.fields[0]) {
        //         //   //   return null;
        //         //   // }
        //         //   console.log("Sol:", dateValue);
        //         // //const dateValue = editingItem?.[f] ? dayjs(editingItem[f]) : undefined;
        //         //   // const displayValue = dateValue?.isValid() ? dateValue.format("YYYY-MM-DD") : "-";
        //         //   // return <span>{displayValue}</span>;
        //         //   return (
                  
        //         //     <DatePicker
        //         //     //  value={dateValue}
        //         //      format="YYYY-MM-DD"
        //         //       style={{ width: "100%" }}
        //         //     />
        //         //   );
        //         // }

        //   // return <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />;


        // // if (isYear) {
        // //   return <DatePicker picker="year" format="YYYY" style={{ width: "100%" }} />;
        // // }

        // // if (isMonth) {
        // //   return <DatePicker picker="month" format="YYYY-MM" style={{ width: "100%" }} />;
        // // }
        //     // if (isDate) return <DatePicker style={{ width: "100%" }} />;
        //     // if (isYear) return <DatePicker picker="year" style={{ width: "100%" }} />;
        //     // if (isMonth) return <DatePicker picker="month" style={{ width: "100%" }} />;
        //     if (isNumber) {
        //       return (
        //         <InputNumber
        //           style={{ width: "100%" }}
        //           formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        //           parser={(value) => value?.replace(/,/g, "") || ""}
        //         />
        //       );
        //     }
        //    // return <Input placeholder={`Enter ${f}`} />;
        //     return <Input id={f} placeholder={`Enter ${f}`} />;
        //   };

        const renderFormItemComponent = (f: string, _isLineItem = false) => {
  const lower = f.toLowerCase();

  const isExcluded = excludedLookupFields.some((ex) => lower === ex || lower.endsWith(ex));
  const isByField = lower.endsWith("by") || lower.endsWith("edby");

  const isLookup = 
    (lower.endsWith("id") ||
     lower.endsWith("currency") ||
     lower.endsWith("company") ||
     lower.endsWith("accounttype") ||
     lower.endsWith("status") ||
     lower.endsWith("entitytype")) && 
    !isExcluded && 
    !isByField;

  const isBoolean = /^(is|has|active|enabled)/i.test(f);

  // PURE YEAR FIELD — MUST BE FIRST
  const isPureYear = 
    (lower === "budgetyear" || 
     lower === "fiscalyear" || 
     lower === "year" || 
     lower.endsWith("year")) && 
    !lower.includes("date") && 
    !lower.includes("at") && 
    !lower.includes("month");

  // REAL DATE FIELDS
  const isDate = 
    lower.includes("date") || 
    lower.endsWith("at") ||           // ← Critical for CreatedAt, UpdatedAt
    lower.includes("month");

  const isNumber = /amount|price|total|qty|quantity|rate|balance|cost|limit/i.test(lower);

  // 1. Lookup fields (including CreatedBy)
  if (isLookup) {
    const options = lookupData[f]?.map((i) => ({ label: i.label, value: i.id })) || [];
    return (
      <Select
        options={options}
        showSearch
        optionFilterProp="label"
        allowClear
        placeholder={`Select ${f}`}
      />
    );
  }

  // 2. By fields (display only)
  if (isByField && lookupData[f]) {
    const options = lookupData[f]?.map((i) => ({ label: i.label, value: i.id })) || [];
    return <Select options={options} disabled />;
  }

  // 3. Boolean
  if (isBoolean) return <Checkbox />;

  // 4. Pure year → InputNumber
  if (isPureYear) {
    return (
      <InputNumber
        style={{ width: "100%" }}
        min={2000}
        max={2100}
        placeholder="e.g. 2026"
      />
    );
  }

  // 5. Real dates → DatePicker
  if (isDate) {
    let dateValue;
    const rawValue = editingItem?.[f];

    if (dayjs.isDayjs(rawValue)) {
      dateValue = rawValue;
    } else if (typeof rawValue === "string" && rawValue.trim()) {
      dateValue = dayjs(rawValue);
    } else if (typeof rawValue === "number") {
      dateValue = rawValue > 1000000000 ? dayjs(rawValue) : undefined; // only timestamps
    } else {
      dateValue = undefined;
    }

    return (
      <DatePicker
        value={dateValue?.isValid() ? dateValue : undefined}
        format="YYYY-MM-DD"
        style={{ width: "100%" }}
      />
    );
  }

  // 6. Numbers
  if (isNumber) {
    return (
      <InputNumber
        style={{ width: "100%" }}
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        parser={(value) => value?.replace(/,/g, "") || ""}
      />
    );
  }

  // 7. Default text
  return <Input placeholder={`Enter ${f}`} />;
};
        // const renderFormItemComponent = (field: string, _isLineItem = false) => {
        //   const value = form.getFieldValue(field);
        //   const lower = field.toLowerCase();
        //   const isDateField = /date|year|month|edat/i.test(lower);
        //   const isBooleanField = /is|active|enabled/i.test(lower);
        //   const isLookupField = /id$/i.test(lower) && lookupData[field];

        //   // ✅ Date handling with safety
        //   if (isDateField) {
        //     const safeValue = dayjs.isDayjs(value) && value.isValid() ? value : undefined;

        //     if (lower.includes("year")) {
        //       return <DatePicker picker="year" format="YYYY" style={{ width: "100%" }} value={safeValue} />;
        //     }
        //     if (lower.includes("month")) {
        //       return <DatePicker picker="month" format="YYYY-MM" style={{ width: "100%" }} value={safeValue} />;
        //     }
        //     return <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} value={safeValue} />;
        //   }

        //   // ✅ Boolean field
        //   if (isBooleanField) {
        //     return <Switch checked={!!value} />;
        //   }

        //   // ✅ Lookup / ID field
        //   if (isLookupField) {
        //     return (
        //       <Select
        //         style={{ width: "100%" }}
        //         options={lookupData[field].map((i: any) => ({ label: i.label, value: Number(i.id) }))}
        //       />
        //     );
        //   }

        //   // ✅ Default text input
        //   return <Input placeholder={field} />;
        // };

// const renderFormItemRRRRQQQ = (f: string, idx: number, _isLineItem = false) => {
//   if (!editingItem && idx === 0 && !_isLineItem) return null;

//   if (editingItem && idx === 0 && !_isLineItem) {
//     return (
//       <Form.Item key={f} label={f} name={f}>
//         <Input disabled />
//       </Form.Item>
//     );
//   }

//   const lower = f.toLowerCase();

//   const isLookup =
//     (lower.endsWith("id") ||
//       lower.endsWith("currency") ||
//       lower.endsWith("company") ||
//       lower.endsWith("accounttype") ||
//       lower.endsWith("status") ||
//       lower.endsWith("entitytype")) &&
//     !excludedLookupFields.some((ex) => lower === ex || lower.endsWith(ex)) &&
//     !lower.endsWith("by") &&
//     !lower.endsWith("edby");

//   const label =
//     isLookup && !_isLineItem ? (
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
//         <span>{f}</span>
//         <Button id={f} name={f} size="small" htmlType="button" onClick={() => openAddLookup(f)}>
//           + Add
//         </Button>
//       </div>
//     ) : (
//       f
//     );

//   if (_isLineItem) {
//     return (
//       <Form.Item
//         name={f}
//         key={f}
//         valuePropName={/is|active|enabled/i.test(f) ? "checked" : "value"}
//       >
//         {renderFormItemComponent(f, true)}
//       </Form.Item>
//     );
//   }

//   if (lower.includes("number") && !editingItem) {
//     return (
//       <Form.Item key={f} label={f}>
//         <Form.Item name={f} noStyle>
//           <Input style={{ width: "calc(100% - 110px)" }} placeholder={`Enter ${f}`} />
//         </Form.Item>
//         <Button
//           type="default"
//           style={{ width: 110 }}
//           onClick={() => {
//             const prefix = (f.match(/[A-Z]/g) || []).join("") || "XX";
//             const dateStr = moment().format("YYYYMMDD");
//             const rand10 = Math.floor(Math.random() * 1_000_000_0000)
//               .toString()
//               .padStart(10, "0");
//             form.setFieldValue(f, `${prefix}${dateStr}${rand10}`);
//           }}
//         >
//           Regenerate
//         </Button>
//       </Form.Item>
//     );
//   }

//   // Default case
//   return (
//     <Form.Item key={f} label={label} name={f}>
//       {renderFormItemComponent(f, _isLineItem)}
//     </Form.Item>
//   );
// };

//   const renderFormItemRRRR = (f: string, idx: number, _isLineItem = false) => {
//     if (!editingItem && idx === 0 && !_isLineItem) return null;
//     if (editingItem && idx === 0 && !_isLineItem) {
//       return (
//         <Form.Item key={f} label={f} name={f}>
//           <Input disabled />
//         </Form.Item>
//       );
//     }
//         const lower = f.toLowerCase();
//     const isLookup = (lower.endsWith("id") || lower.endsWith("currency") || lower.endsWith("company") || lower.endsWith("accounttype")|| lower.endsWith("status")|| lower.endsWith("entitytype")) && !excludedLookupFields.some(ex => lower === ex || lower.endsWith(ex)) && !lower.endsWith("by") && !lower.endsWith("edby");
 
//     const value = form.getFieldValue(f);
//  // const lower = field.toLowerCase();

  

//       const isDateField = /date|year|month|edat/i.test(lower);

//   if (isDateField) {
//     const safeValue = dayjs.isDayjs(value) && value.isValid() ? value : undefined;

//     if (lower.includes("year")) {
//       return <DatePicker picker="year" format="YYYY" style={{ width: "100%" }} value={safeValue} />;
//     }

//     if (lower.includes("month")) {
//       return <DatePicker picker="month" format="YYYY-MM" style={{ width: "100%" }} value={safeValue} />;
//     }

//     return <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} value={safeValue} />;
//   }
//    // const label = isLookup && !isLineItem ? (
//     // <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//     // <span>{f}</span>
//     // <Button size="small" onClick={() => openAddLookup(f)} style={{ marginLeft: 8 }}>
//     // + Add
//     // </Button>
//     // </div>
//     // ) : f;
//     const label = isLookup && !_isLineItem ? (
//   <div
//     style={{
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//       gap: 8,
//     }}
//   >
//     <span>{f}</span>
//     <Button id={f} name={f}
//       size="small"
//       htmlType="button"
//     onClick={() => openAddLookup(f)}
//     >
//       + Add
//     </Button>
//   </div>
// ) : f;
//     // if (_isLineItem) {
//     //   return renderFormItemComponent(f, true);
//     // }
//     if (_isLineItem) {
//   return (
//     <Form.Item
//       name={f}
//       key={f}
//       valuePropName={
//         /is|active|enabled/i.test(f) ? "checked" : "value"
//       }
//     >
//       {renderFormItemComponent(f, true)}
//     </Form.Item>
//   );
// }
//     if (lower.includes("number") && !editingItem) {
//       return (
//         <Form.Item key={f} label={f}>
//       {/* <Input.Group compact> */}
//     <Form.Item name={f} noStyle>
//       <Input
//         style={{ width: "calc(100% - 110px)" }}
//         placeholder={`Enter ${f}`}
//       />
//     </Form.Item>
//     <Button
//       type="default"
//       style={{ width: 110 }}
//       onClick={() => {
//         const prefix = (f.match(/[A-Z]/g) || []).join("") || "XX";
//         const dateStr = moment().format("YYYYMMDD");
//         const rand10 = Math.floor(Math.random() * 1_000_000_0000)
//           .toString()
//           .padStart(10, "0");
//         form.setFieldValue(f, `${prefix}${dateStr}${rand10}`);
//       }}
//     >
//       Regenerate
//     </Button>
//   {/* </Input.Group> */}
// </Form.Item>
//       );
//     }
//  // Default case: normal form item
//   return (
//     <Form.Item key={f} label={label} name={f}>
//       {renderFormItemComponent(f, _isLineItem)}
//     </Form.Item>
//   );
//     // return (
//     // <Form.Item key={f} label={f} name={f}>
//     // <div style={{ display: "flex", gap: 8 }}>
//     // <div style={{ flex: 1 }}>
//     // {renderFormItemComponent(f)}
//     // </div>
//     // {/* {isLookup && !isLineItem && (
//     // <Button
//     // size="small"
//     // htmlType="button"
//     // onClick={() => openAddLookup(f)}
//     // >
//     // + Add
//     // </Button>
//     // )} */}
//     // </div>
//     // </Form.Item>
//     // );
//   };

const renderFormItem = (f: string, idx: number, _isLineItem = false) => {
  if (!editingItem && idx === 0 && !_isLineItem) return <h1><span><center>**** Note: Fresh Entry ****</center></span></h1>;

  if (editingItem && idx === 0 && !_isLineItem) {
    return (
      <Form.Item key={f} label={f} name={f}>
        <Input disabled />
      </Form.Item>
    );
  }
const lower = f.toLowerCase();
  const value = form.getFieldValue(f);
 
  const isLookup =
    (lower.endsWith("id") ||
      lower.endsWith("currency") ||
      lower.endsWith("company") ||
      lower.endsWith("accounttype") ||
       lower.endsWith("method") ||
      lower.endsWith("status") ||

  lower.endsWith("edby") ||
      lower.endsWith("entitytype")) &&
    !excludedLookupFields.some((ex) => lower === ex || lower.endsWith(ex)) ;
   
  
{/*!  lower.endsWith("by") ||  */ }
  const isBoolean = /^(is|has|active|enabled)/i.test(f);
  const isDateField = /date|month|edat/i.test(lower);
  const isYear = /year/i.test(lower);
  const isMonth = /month/i.test(lower);
  const isNumberField = /amount|price|total|qty|ordered|quantity|rate|balance|cost|limit/i.test(lower);
  const isGenCode = /code|number|nno/.test(lower);
  const isQA = /available/.test(lower);
  // Handle first field in edit mode
  if (!_isLineItem && idx === 0 && editingItem) {
    return (
      <Form.Item key={f} label={f} name={f}>
        <Input disabled />
      </Form.Item>
    );
  }

  // Label construction for lookup + Add button
  const fwithoutId = f.replace("Id", "");
  const label =
    isLookup && !_isLineItem ? (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span>{fwithoutId}</span>
        <Button size="small" htmlType="button" onClick={() => openAddLookup(f)}>
          + Add
        </Button>
      </div>
    ) : f;
 //console.log(JSON.stringify(`Actually ${f}  working:` +isLookup));
  // Lookup fields
  if (isLookup) {
  //   if((f == "StatusId") ||(f == "CreatedBy"))

  //  console.log(JSON.stringify(`Why ${f}  working:` +isLookup));
    const options = lookupData[f]?.map((i) => ({ label: i.label, value: i.id })) || [];
  //   const options =
  // lookupData[f]?.map((i: any) => {
  //   const value =
  //     i.id ??
  //     i.Id ??
  //     i[`${f}Id`] ??
  //     i.StatusId;

  //   const label =
  //     i.label ??
  //     i.Label ??
  //     i[`${f}Name`] ??
  //     i.StatusName;

  //   return { value, label };
  // }) || [];

  // if((f == "StatusId") ||(f == "CreatedBy"))
  //   console.log(JSON.stringify(`Options for ${f} :` + JSON.stringify(options)));
    return (
      <Form.Item key={f} label={label} name={f}>
        <Select options={options} showSearch optionFilterProp="label" allowClear />
      </Form.Item>
    );
  }

  // Boolean
  if (isBoolean) {
    return (
      <Form.Item key={f} label={f} name={f} valuePropName="checked">
        <Checkbox />
      </Form.Item>
    );
  }

  // Date fields

  if (   lower.includes("date") ||   lower.includes("month") || lower.endsWith("edat")) {
   // const safeValue = dayjs.isDayjs(value) && value.isValid() ? value : undefined;
    const safeValue = dayjs(value);
// if (safeValue.isValid()) {
//   console.log("safeValue:", safeValue.format("YYYY-MM-DD"));
// } else {
//   console.log("Invalid date");
// }
//       console.log(JSON.stringify('safeValue'));
//      console.log("safeValue: " +JSON.stringify(safeValue));
//       console.log("value: " +JSON.stringify(value));
    let pickerProps: any = {};
    if (lower.includes("year") ) pickerProps = { picker: "year", format: "YYYY" };
    else if (lower.includes("month") ) pickerProps = { picker: "month", format: "YYYY-MM" };
    else pickerProps = { format: "YYYY-MM-DD" };
if(!editingItem)
    return (
       <Form.Item key={f} label={f} name={f}>
        <DatePicker style={{ width: "100%" }} value={safeValue} {...pickerProps} />
       </Form.Item>
    );
      return (
       <Form.Item key={f} label={f} >
        <DatePicker style={{ width: "100%" }} value={safeValue} {...pickerProps} />
       </Form.Item>
    );
  }

  // Number fields
  if (isNumberField) {
    if(isQA)
      return (
         <Form.Item key={f} label={f}>
      <Form.Item name={f}  noStyle>
        <InputNumber readOnly
         style={{ width: "calc(100% - 110px)" }}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(val) => val?.replace(/,/g, "") || ""}
        />
      </Form.Item>
     
    </Form.Item>
    );
    
    return (
         <Form.Item key={f} label={f}>
      <Form.Item name={f}  noStyle>
        <InputNumber
         style={{ width: "calc(100% - 110px)" }}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(val) => val?.replace(/,/g, "") || ""}
        />
      </Form.Item>
     
    </Form.Item>
    );
  }  


  // formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
if (isGenCode && !editingItem) {
      return (
        <Form.Item key={f} label={f}>
      {/* <Input.Group compact> */}
    <Form.Item name={f} noStyle>
      <InputNumber
        style={{ width: "calc(100% - 110px)" }}
       
        placeholder={`Enter ${f}`}
      />
    </Form.Item>
    <Button
      type="default"
      style={{ width: 110 }}
      onClick={() => {
        const prefix = (f.match(/[A-Z]/g) || []).join("") || "XX";
        const dateStr = moment().format("YYYYMMDD");
        const rand10 = Math.floor(Math.random() * 1_000_000)
          .toString()
          .padStart(10, "0");
        form.setFieldValue(f, `${prefix}${dateStr}${rand10}`);
      }}
    >
      Regenerate
    </Button>
  {/* </Input.Group> */}
</Form.Item>
      );
    }
  // Default text input
  return (
    <Form.Item key={f} label={f} name={f}>
      <Input placeholder={`Enter ${f}`} />
    </Form.Item>
  );
};

  // ==================== Table Columns ====================
  const handleTableChange = (_pagination: any, _filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  
  // const columns: ColumnsType<Record<string, any>> = [
  //   {
  //     title: "Actions",
  //     key: "actions",
  //     fixed: "left",
  //     width: 140,
  //     render: (_: any, record: any) => (
  //       <Space>
  //         <Button type="link" onClick={() => handleEdit(record)}>
  //           Edit
  //         </Button>
  //                 {/*
  //                             <Space>
  //                       <Button type="link" onClick={() => handleEdit(lineFields)}>
  //                         Edit
  //                       </Button>
  //                       {isMaster && (
  //                         <Button type="link" onClick={() => handleManageLines(lineFields)}>
  //                           Lines
  //                         </Button>
  //                       )}
  //                       {lineFields[index].status === "Draft" && (
  //                         <Button type="primary" danger size="small" onClick={() => handleSendQuoteFromList(lineFields)}>
  //                           Send Quote
  //                         </Button>
  //                       )}
  //                       <Button type="link" danger onClick={() => handleInlineDelete(index, lineFields[index])}>
  //                         Delete
  //                       </Button>
  //                     </Space>
  //                 */}
  //                     {/* {isMaster && (
  //                       <Button
  //                         type="link"
  //                         onClick={() => {
  //                           handleEdit(record);
  //                           setTimeout(() => {
  //                             document.getElementById("line-items-anchor")?.scrollIntoView({
  //                               behavior: "smooth",
  //                             });
  //                           }, 300);
  //                         }}
  //                       >
  //                         Line Items
  //                       </Button>
  //                     )} */}
  //                           {isMaster && (
  //                           <Button type="link" onClick={() => handleManageLines(record)}>
  //                     Lines ({(expandedLines[getRowKey(record)] || []).length})
  //                   </Button>
  //                           )}
  //                           {/* {record.StatusId === "1" && (
  //                         <Button type="primary" danger size="small" onClick={() => handleSendQuoteFromList(record)}>
  //                           Send Quote
  //                         </Button>
  //                       )} */}
  //     {isQuotation && (
  //     <button onClick={() => openPreview(record)}>
  //       Preview / Send Email
  //     </button>
  //   )}
  //             {/* {record.StatusId === "1" && (
  //               //   {isQuotation && pdfBlob && (
  //                     <button
  //                       onClick={() => setPreviewOpen(true)}
  //                       style={{
  //                         padding: '10px 20px',
  //                         background: '#1890ff',
  //                         color: 'white',
  //                         border: 'none',
  //                         borderRadius: 4,
  //                         cursor: 'pointer',
  //                         marginTop: 20,
  //                       }}
  //                     >
  //                       Preview / Send Email
  //                     </button>
  //                   )} */}
                

  //                   {/* Remove any old direct send button */}

   
  //         <Button type="link" danger onClick={() => handleDelete(record)}>
  //           Delete
  //         </Button>
  //       </Space>
  //     ),
  //   },
  //   ...fields
  //     .slice(0, showAllFields ? fields.length : 6)
  //     .map((f) => {
  //       const isNumberField = /amount|price|total|qty|quantity|rate|balance|number/i.test(f.toLowerCase());
  //       const isDateField = /date|year|month|edat/i.test(f.toLowerCase());
  //       return {
  //         title: f,
  //         dataIndex: f,
  //         key: f,
  //         align: isNumberField ? ("right" as const) : ("left" as const),
  //         sorter: isDateField
  //           ? (a: any, b: any) => {
  //               const dateA = a[f] ? new Date(a[f]).getTime() : 0;
  //               const dateB = b[f] ? new Date(b[f]).getTime() : 0;
  //               return dateA - dateB;
  //             }
  //           : isNumberField
  //           ? (a: any, b: any) => (a[f] || 0) - (b[f] || 0)
  //           : (a: any, b: any) =>
  //               String(a[f] || "").localeCompare(String(b[f] || "")),
  //         sortOrder: sortedInfo.columnKey === f ? sortedInfo.order : undefined,
  //         ...getColumnSearchProps(f),
  //         render: (value: any) => {
  //           // if (f.toLowerCase().endsWith("id") && lookupData[f]?.length) {
  //           //   const item = lookupData[f].find((i) => Number(i.id) === Number(value));
  //           //   return item ? item.label : value;
  //           // }
  //           // if (isNumberField && (typeof value === "number" || !isNaN(Number(value)))) {
  //           //   return <div style={{ textAlign: "right" }}>{Number(value).toLocaleString("en-US")}</div>;
  //           // }
  //           // if (isDateField && value) {
  //           //   return moment(value).format(f.toLowerCase().includes("year") ? "YYYY" : "YYYY-MM-DD");
  //           // }
  //           // return value?.toString() || "-";
  //                         if (f.toLowerCase().endsWith("id") && lookupData[f]?.length) {
  //               const item = lookupData[f].find((i) => Number(i.id) === Number(value));
  //               return item ? item.label : value;
  //             }

  //             if (isNumberField && (typeof value === "number" || !isNaN(Number(value)))) {
  //               return (
  //                 <div style={{ textAlign: "right" }}>
  //                   {Number(value).toLocaleString("en-US")}
  //                 </div>
  //               );
  //             }

  //             if (isDateField && value) {
  //               const d = dayjs.isDayjs(value) ? value : dayjs(value);

  //               return d.isValid()
  //                 ? d.format(f.toLowerCase().includes("year") ? "YYYY" : "YYYY-MM-DD")
  //                 : "-";
  //             }

  //             return value?.toString() || "-";
  //         },
  //       };
  //     }),
      
  // ];
 
 // 🔥 AUTO-DETECT FIELDS FROM ACTUAL DATA (best fix)
// const dynamicFields = data.length > 0
//   ? Object.keys(data[0]).filter(
//       (k) => k.toLowerCase() !== "lineitems" && k.toLowerCase() !== "lineitem"
//     )
//   : fields; // fallback to props if no data yet
// AUTO-DETECT FIELDS SAFELY FROM ACTUAL DATA
const dynamicFields = (() => {
  if (data.length === 0) return fields;

  const sample = data[0];
  const keys = Object.keys(sample);

  return keys.filter((key) => {
    const value = sample[key];
    const lowerKey = key.toLowerCase();

    // Exclude nested objects/arrays (like line items)
    if (value === null || value === undefined) return true;
    if (typeof value === "object" || Array.isArray(value)) return false;

    // Exclude known junk
    if (lowerKey.includes("lineitem") || lowerKey.includes("lines")) return false;

    return true;
  });
})();

const sortedDynamicFields = [...dynamicFields].sort((a, b) => {
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();

  // Primary key first
  if (lowerA.endsWith("id") && !lowerA.includes("status") && !lowerA.includes("created")) return -1;
  if (lowerB.endsWith("id") && !lowerB.includes("status") && !lowerB.includes("created")) return 1;

  // Number/code next
  if (lowerA.includes("number") || lowerA.includes("code")) return -1;
  if (lowerB.includes("number") || lowerB.includes("code")) return 1;

  return a.localeCompare(b);
});

const isLikelyChildTable = (name: string): boolean => {
  const lower = name.toLowerCase();
  return (
    lower.includes("lineitem") ||
    lower.includes("lines") ||
    lower.includes("detail") ||
    lower.endsWith("lines") ||
    lower.endsWith("lineitems") ||
    lower.endsWith("details")
  );
};
// Optional: sort fields for consistent order (ID first, dates last, etc.)
              // const sortedDynamicFields = [...dynamicFields].sort((a, b) => {
              //   const lowerA = a.toLowerCase();
              //   const lowerB = b.toLowerCase();
              //   if (lowerA.includes("id") && lowerA === lowerA.match(/^(.*?id)$/i)?.[1]) return -1;
              //   if (lowerB.includes("id") && lowerB === lowerB.match(/^(.*?id)$/i)?.[1]) return 1;
              //   if (lowerA.includes("number") || lowerA.includes("code")) return -1;
              //   if (lowerB.includes("number") || lowerB.includes("code")) return 1;
              //   return a.localeCompare(b);
              // });

const columns: ColumnsType<Record<string, any>> = [
  {
    title: "Actions",
    key: "actions",
    fixed: "left",
    width: 140,
    render: (_: any, record: any) => (
      <Space>
        <Button type="link" onClick={() => handleEdit(record)}>
          Edit 
        </Button>
       
        {isMaster && isHaveChild && (
          <Button type="link" onClick={() => handleManageLines(record)}>
            Lines 
            {/* ({(expandedLines[getRowKey(record)] || []).length}) */}
          </Button>
        )}
        {isQuotation && (
          <button onClick={() => openPreview(record)}>
            Preview / Send Email
          </button>
        )}
   {isReceipt && (
          <button onClick={() => openPreview(record)}>
            Preview / Send Email
          </button>
        )}
        
{isInvoice && (
          <button onClick={() => openPreview(record)}>
            Preview / Send Email
          </button>
        )}
        
        
        <Button type="link" danger onClick={() => handleDelete(record)}>
          Delete
        </Button>
      </Space>
    ),
  },
  // 🔥 USE dynamicFields instead of fields
  ...sortedDynamicFields
    .slice(0, showAllFields ? sortedDynamicFields.length : 6)
    .map((f) => {
      const lower = f.toLowerCase();
      const isNumberField = /amount|price|total|qty|quantity|rate|balance|cost/i.test(lower);
      const isDateField = /date|month|edat/i.test(lower);

      return {
        title: f,
        dataIndex: f,
        key: f,
        align: isNumberField ? ("right" as const) : ("left" as const),
        sorter: isDateField
          ? (a: any, b: any) => {
              const dateA = a[f] ? new Date(a[f]).getTime() : 0;
              const dateB = b[f] ? new Date(b[f]).getTime() : 0;
              return dateA - dateB;
            }
          : isNumberField
          ? (a: any, b: any) => (Number(a[f] || 0) - Number(b[f] || 0))
          : (a: any, b: any) => String(a[f] || "").localeCompare(String(b[f] || "")),
        sortOrder: sortedInfo.columnKey === f ? sortedInfo.order : undefined,
        ...getColumnSearchProps(f),
      //         render: (value: any) => {
      //           // Lookup display
      //           if (lower.endsWith("id") && lookupData[f]?.length) {
      //             const item = lookupData[f].find((i: any) => Number(i.id) === Number(value));
      //             return item ? item.label : value;
      //           }
      //           // Numbers
      //           if (isNumberField && value != null) {
      //             return <div style={{ textAlign: "right" }}>{Number(value).toLocaleString()}</div>;
      //           }
      //           // Dates
      //           // if (isDateField && value) {
      //           //   const d = dayjs.isDayjs(value) ? value : dayjs(value);
      //           //   return d.isValid()
      //           //     ? d.format(lower.includes("year") ? "YYYY" : "YYYY-MM-DD")
      //           //     : "-";
      //           // }
      //           if (isDateField || !lower.includes("year")) {
      //   if (typeof value === "number" && !lower.includes("date")) {
      //     // Special case: BudgetYear = 2026 → make dayjs year 2026
      //     const d = dayjs.isDayjs(value) ? value : dayjs(value);
      //       return d.isValid()
      //               ? d.format(lower.includes("year") ? "YYYY" : "YYYY-MM-DD")
      //               : "-";
      //    // normalizedValues[field] = dayjs().year(value);
      //   } else {
      //     const d = dayjs(value);
      //       return d.isValid() ? d : undefined;
      //   }
      // }
      //           return value?.toString() || "-";
      //         },
      render: (value: any) => {
  const lower = f.toLowerCase();

  // === 1. EXPANDED LOOKUP: Includes "By" fields like CreatedBy, UpdatedBy ===
  const isLookupField = 
    lower.endsWith("id") ||
    lower.endsWith("by") ||                    // ← Critical for CreatedBy
    lower.includes("createdby") ||
    lower.includes("updatedby") ||
    lower.includes("modifiedby");

  if (isLookupField && lookupData[f]?.length > 0) {
    const item = lookupData[f].find((i: any) => Number(i.id) === Number(value));
    if (item) {
      return <span style={{ fontWeight: 500 }}>{item.label}</span>;
    }
    return value ?? "-"; // show ID if no match
  }

  // === 2. PURE YEAR FIELDS (BudgetYear, FiscalYear) ===
  const isPureYearField = 
    (lower === "budgetyear" || 
     lower === "fiscalyear" || 
     lower === "year" || 
     lower.endsWith("year")) && 
    !lower.includes("date") && 
    !lower.includes("at") && 
    !lower.includes("month");

  if (isPureYearField && value != null) {
    return <div style={{ textAlign: "center" }}>{Number(value)}</div>;
  }

  // === 3. NUMBERS ===
  if (isNumberField && value != null) {
    return <div style={{ textAlign: "right" }}>{Number(value).toLocaleString()}</div>;
  }

  // === 4. REAL DATES ONLY ===
  const isRealDateField = 
    lower.includes("date") || 
    lower.endsWith("at") || 
    lower.includes("time") ||
    lower.includes("month");

  if (isRealDateField && value != null) {
    const d = dayjs.isDayjs(value) ? value : dayjs(value);
    if (d.isValid()) {
      return d.format("YYYY-MM-DD HH:mm");
    }
    return "-";
  }

  // === 5. DEFAULT ===
  return value?.toString() || "-";
}
      };
    }),
];
  const filteredData = data.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return value != null && String(value).toLowerCase().includes(globalSearch.toLowerCase());
    })
  );
  // ==================== Expandable Row for Line Items ====================
  const handleExpand = async (expanded: boolean, record: Record<string, any>) => {
//console.log("Did you reach here");
// // console.log(`isMaster: `+JSON.stringify(isMaster));
//      // console.log(`effectiveDetailConfig: `+JSON.stringify(effectiveDetailConfig));
//      // console.log(`fields / records`);
 //console.log("Fetching lines with ID:", record[fields[0]]);
 //console.log("expanded :", expanded);
    if (!isMaster || !effectiveDetailConfig) return;
    const key = getRowKey(record);
 //    // console.log(`Field: `+JSON.stringify(fields[0]));
 // console.log(`Records: `+ JSON.stringify(record));
  let kp = 0;
    if (expanded) //  if (expanded && !expandedLines[key])
       {
        kp = kp + 1;
         const did = Number(record[fields[0]]);
      const lines = await fetchLineItems(did,
    effectiveDetailConfig);
    // console.log(`XXX expandedLines:${did}`, JSON.stringify(lines));
  //      // console.log(`lines ${kp}:${did} ||`+JSON.stringify(record));
     // setExpandedLines((prev) => ({ ...prev, [key]: lines }));
      setExpandedLines((prev) => {
  const updated = { ...prev, [key]: lines };

  return updated;
});
  //  // console.log(`lines ${kp}: `+JSON.stringify(expandedLines));
      
     //setExpandedLines();
    }
    setExpandedRowKeys(expanded ? [key] : []);
  };

 useEffect(() => {
  console.log("expandedLines changed:", expandedLines);
}, [expandedLines]); 

  const expandedRowRender = (record: Record<string, any>) => {
    const key = getRowKey(record);
   // console.log(`expandedLines :  ${expandedLines}` + );
    // // console.log(`key: `+JSON.stringify(key));
    //  // console.log(`record: `+JSON.stringify(record));
    // console.log(`expandedLines: `+JSON.stringify(expandedLines));
    const lines = expandedLines[Number(key)] || [];
         // console.log(JSON.stringify(lines));
//console.log(`record lines: `+JSON.stringify(expandedLines[Number(key)]));
    if (lines.length === 0) return <Text type="secondary">No line items</Text>;
    return (
      <Table
        dataSource={lines}
        columns={effectiveDetailConfig!.fields.map((f) => ({
          title: f,
          dataIndex: f,
          key: f,
          render: (val: any) => {
            if (f.toLowerCase().endsWith("id") && lookupData[f]?.length) {
              const item = lookupData[f].find((i) => i.id === val);
              return item ? item.label : val;
            }
            const isNumber = /amount|price|total|qty|quantity|rate|balance/i.test(f.toLowerCase());
            if (isNumber && val != null) {
              return <div style={{ textAlign: "right" }}>{Number(val).toLocaleString()}</div>;
            }
            return val ?? "-";
          },
        }))}
        pagination={false}
        size="small"
      expandable={
    isMaster && !isLikelyChildTable(resourceName)
      ? {
          expandedRowKeys,
          onExpand: handleExpand,
          expandedRowRender,
        }
      : undefined
  }
      />
    );
  };
  // ==================== JSX ====================
  return (
    <div style={{ padding: 20 }}>
      <Row style={{ marginBottom: 16 }} gutter={8} justify="space-between">
        <Col>
          <Button type="primary" onClick={() => {
            setEditingItem(editingItem);
            form.resetFields();
            setModalVisible(true);
            //alert(JSON.stringify(editingItem));
          }}>
            
            Add {formatProcedureName(resourceName)}
          </Button>
        </Col>
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Input
            placeholder="Search all records..."
            prefix={<SearchOutlined />}
            allowClear
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>
        <Col>
          <Button onClick={() => setShowAllFields((p) => !p)}>{showAllFields ? "Show Less" : "Show More Fields"}</Button>
        </Col>
        <Col>
          <input type="color" value={rowColor} onChange={(e) => setRowColor(e.target.value)} title="Select Row Color" style={{ width: 40, height: 32, border: "none" }} />
        </Col>
      </Row>
      {isReport ? (
        <></> // omitted for brevity, same as before
      ) : (
        <Table
          dataSource={globalSearch ? filteredData : data}
          columns={columns}
          rowKey={getRowKey}
          loading={loading}
          scroll={{ x: "max-content" }}
          onChange={handleTableChange}
          rowClassName={(_record, index) => (index % 2 === 0 ? "even-row" : "odd-row")}
          style={{ ["--row-bg-even" as any]: rowColor, ["--row-bg-odd" as any]: shadeColor(rowColor, -0.05) } as any}
          locale={{ emptyText: `No ${resourceName} found` }}
          expandable={isMaster && !isLikelyChildTable(resourceName) ? {
            expandedRowKeys,
            onExpand: handleExpand,
            expandedRowRender,
          } : undefined}
          onRow={(record) => ({ onDoubleClick: () => handleEdit(record) })}
        />
      )}
{/* <Modal
  title={editingItem ? `Edit ${resourceName}` : `Add ${resourceName}`}
  open={modalVisible}
  width={1300}
  onCancel={closeModal}
  onOk={() => form.submit()}
 
  destroyOnHidden={true} // updated per antd v5
>
  <Form
    form={form}
    onFinish={handleSave}
    layout="vertical"
  
    onValuesChange={handleValuesChange}
  >
    <Row gutter={16}>
      {fields.map((f, idx) => (
        <Col span={8} key={f}>
          {renderFormItem(f, idx)}
        </Col>
      ))}
    </Row>
    {isMaster && effectiveDetailConfig && editingItem && (
      <>
        <Divider orientation="left">Line Items (Detailed View)</Divider>
      
        
        <Form.List name="lineItems">
  {(fields) =>
    fields.map((field) => (
      <Row key={field.key}>
        {effectiveDetailConfig.fields.map((f) => (
          <Form.Item
            name={[field.name, f]}
            key={f}
          >
            {renderFormItemComponent(f, true)}
          </Form.Item>
        ))}
      </Row>
    ))
  }
</Form.List>
        {warning && <Alert message={warning} type="warning" showIcon style={{ marginTop: 16 }} />}
      </>
    )}
  </Form>
</Modal> */}
<Modal
  title={editingItem ? `Edit - ${resourceName}` : `Add ${resourceName}`}
  open={modalVisible}
  width={1300}
  onCancel={closeModal}
  onOk={() => form.submit()}
 
  destroyOnHidden={true} // updated per antd v5
>
  <Form
    form={form}
    onFinish={handleSave}
    layout="vertical"
    onFinishFailed={(err) => {
    console.log("Form submit failed:", err);
  }}
    onValuesChange={handleValuesChange}
  >
    <Row gutter={16}>
      {fields.map((f, idx) => (
        <Col span={8} key={f}>
          {renderFormItem(f, idx)}
        </Col>
      ))}
    </Row>
  {/* {isMaster && effectiveDetailConfig &&  (
      <>
        <Divider orientation="left">Line Items (Detailed View)</Divider>
      
        <Form.List name="lineItems">
          {(lineFields, { add, remove }) => (
            <>
              <Table
                dataSource={lineFields} // directly use Form.List fields
                pagination={false}
                size="small"
                rowKey={(field) => field.key} // each field has a unique key
                columns={[
                  ...effectiveDetailConfig.fields.map((f) => ({
                    title: f,
                    width: 200,
                    render: (_: any, __: any, index: number) => {
                      const field = lineFields[index];
                      return (
                        <Form.Item
                          name={[field.name, f]} // use Form.List name
                         fieldKey={[String(field.fieldKey ?? ""), String(f ?? "")]} //fieldKey={[field.fieldKey, f]} // use Form.List fieldKey
                          noStyle
                        >
                          {renderFormItemComponent(f, true)}
                        </Form.Item>
                      );
                    },
                  })),
                  {
                    title: "Action",
                    width: 100,
                    render: (_: any, __: any, index: number) => (
                      <Button
                        danger
                        size="small"
                        onClick={() => remove(index)}
                      >
                        Delete
                      </Button>
                    ),
                  },
                ]}
              />
              <Button
                type="dashed"
                onClick={() => add({ [qtyField]: 1, [priceField]: 0 })}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 16 }}
              >
                Add Line Item
              </Button>
            </>
          )}
        </Form.List>
        {warning && <Alert message={warning} type="warning" showIcon style={{ marginTop: 16 }} />}
      </>
    )}  */}
  </Form>
</Modal>

<Modal
  title="Edit Line Item"
  open={lineEditModalVisible}
  width={1000}
  onCancel={() => {
    setLineEditModalVisible(false);
    setEditingLineIndex(null);
    lineEditForm.resetFields();
  }}
  onOk={() => lineEditForm.submit()}
  destroyOnClose
>
  <Form
    form={lineEditForm}
    onFinish={handleSaveEditedLine}
  
    layout="vertical"
  >
    <Row gutter={16} >
      {effectiveDetailConfig?.fields.map((f, _idx) => (
        <Col span={8} key={f}    >
          {renderFormItemComponent(f, true)}
        </Col>
      ))}
    </Row>
  </Form>
</Modal>
      {/* Line Items Modal */}
      {/* <Modal
        title={`Manage Line Items for ${resourceName} #${currentMaster ? currentMaster[fields.find((f) => f.toLowerCase().includes("number")) || fields[0]] : ""}`}
        open={lineModalVisible}
        width={1300}
        onCancel={() => {
          setLineModalVisible(false);
          lineForm.resetFields();
          setCurrentMaster(null);
          setLineWarning("");
        }}
        onOk={() => lineForm.submit()}
        destroyOnHidden
      >
        <Form form={lineForm} onFinish={handleSaveLines} layout="vertical" onValuesChange={handleLineValuesChange}>
          <Form.List name="lineItems">
            {(lineFields, { add }) => (
              <>
                <Table
                  dataSource={lineFields}
                  pagination={false}
                  size="small"
                  rowKey={(field) => field.key}
                  columns={[
                    ...effectiveDetailConfig!.fields.map((f) => ({
                      title: f,
                      width: 200,
                      render: (_: any, __: any, index: number) => (
                        <Form.Item name={[lineFields[index].name, f]} noStyle>
                          {renderFormItemComponent(f, true)}
                        </Form.Item>
                      ),
                    })),
                    {
                      title: "Action",
                      width: 100,
                      render: (_: any, __: any, index: number) => (
                        <Button danger size="small"onClick={() => handleInlineDelete(index, lineFields[index])}>
                          Delete
                        </Button>
                      ),
                    },
                  ]}
                />
                <Button
                  type="dashed"
                  onClick={() => add({ [qtyField]: 1, [priceField]: 0 })}
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 16 }}
                >
                  Add Line Item
                </Button>
              </>
            )}
          </Form.List>
          {lineWarning && <Alert message={lineWarning} type="warning" showIcon style={{ marginTop: 16 }} />}
        </Form>
      </Modal> */}

   {/* PDF Preview Modal - only renders when isQuotation */}
    {/* ← ONLY ONE MODAL HERE */}
    {isQuotation && selectedQuotation && (
      <PDFPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        quotationData={selectedQuotation}
        onSendEmail={handleSendEmail}
        sending={sending}
      />
    )}

     {isReceipt && selectedReceipt && (
   <PDFPreviewModalv
  open={previewOpen}
  onClose={() => setPreviewOpen(false)}
  documentData={{
    type: 'Receipt', // could also be 'Invoice', 'CreditNote', etc.
    customerId: selectedInvoice.CustomerId,
    companyId: selectedInvoice.CompanyId,
    documentNumber: selectedReceipt.ReceiptNumber,
    documentDate: selectedReceipt.ReceiptDate,
    validUntilDate: selectedReceipt.ValidUntilDate, // optional
    Notes: selectedReceipt.Notes,
    lineItems: selectedReceipt.LineItems && selectedReceipt.LineItems.length > 0
      ? selectedReceipt.LineItems
      : [
          {
            ProductName: selectedReceipt.Reference || 'Receipt Payment',
            Quantity: 1,
            UnitPrice: selectedReceipt.Amount,
            Amount: selectedReceipt.Amount,
            TaxRate: 0,
          },
        ],
    subTotal: selectedReceipt.Amount, // for single-line receipt
    taxAmount: 0,
    totalAmount: selectedReceipt.Amount,
    issuingCompany: {
      CompanyName: 'My Company Ltd',
      Address: '123 Main Street, Lagos, Nigeria',
      Phone: '+234 800 123 4567',
      Email: 'info@mycompany.com',
      Website: 'www.upperlink.ng',
    },
    recipient: {
      Name: selectedReceipt.CustomerName || 'Valued Customer',
      Address: selectedReceipt.CustomerAddress || '',
      Phone: selectedReceipt.CustomerPhone || '',
      Email: selectedReceipt.CustomerEmail || '',
    },
  }}
  onSendEmail={handleSendEmail}
  sending={sending}
/>


      // <PDFPreviewRModal
      //   open={previewOpen}
      //   onClose={() => setPreviewOpen(false)}
      //   ReceiptData={selectedReceipt}
      //   onSendEmail={handleSendEmail}
      //   sending={sending}
      // />
    )}
{/* no <PDFPreviewModal */}
    {isInvoice && selectedInvoice && (
  <PDFPreviewModalv
    open={previewOpen}
    onClose={() => setPreviewOpen(false)}
    documentData={{
      type: 'Invoice',
      customerId: selectedInvoice.CustomerId,
       companyId: selectedInvoice.CompanyId,
      documentNumber: selectedInvoice.InvoiceNumber,
      documentDate: selectedInvoice.InvoiceDate,
      validUntilDate: selectedInvoice.DueDate,
      Notes: selectedInvoice.Notes,
      lineItems: selectedInvoice.InvoiceLineItems && selectedInvoice.InvoiceLineItems.length > 0
        ? selectedInvoice.InvoiceLineItems.map((li: any) => ({
            ProductName: li.Description || `Product ${li.ProductId}`,
            Quantity: li.Quantity,
            UnitPrice: li.UnitPrice,
            Amount: li.LineTotal,
            TaxRate: li.TaxRate,
          }))
        : [],
      subTotal: selectedInvoice.InvoiceLineItems
        ? selectedInvoice.InvoiceLineItems.reduce((sum:any, li: any) => sum + li.LineTotal, 0)
        : 0,
      taxAmount: selectedInvoice.InvoiceLineItems
        ? selectedInvoice.InvoiceLineItems.reduce((sum:any, li: any) => sum + ((li.LineTotal * li.TaxRate) / 100), 0)
        : 0,
      totalAmount: selectedInvoice.TotalAmount || 0,
      issuingCompany: {
        CompanyName: 'My Company Ltd',
        Address: '123 Main Street, Lagos, Nigeria',
        Phone: '+234 800 123 4567',
        Email: 'info@mycompany.com',
        Website: 'www.upperlink.ng',
      },
      recipient: {
        Name: selectedInvoice.CustomerName,
        Address: selectedInvoice.CustomerAddress,
        Phone: selectedInvoice.CustomerPhone,
        Email: selectedInvoice.CustomerEmail,
      },
    }}
    onSendEmail={handleSendEmail}
    sending={sending}
  />
)}

      <Modal
  title={`Manage Line Items for ${resourceName} #${currentMaster ? currentMaster[fields.find((f) => f.toLowerCase().includes("number")) || fields[0]] : ""}`}
  open={lineModalVisible}
  width={1300}
  onCancel={() => {
    setLineModalVisible(false);
    lineForm.resetFields();
    setCurrentMaster(null);
    setLineWarning("");
  }}
  onOk={() => lineForm.submit()}
  destroyOnClose // Better than destroyOnHidden
  style={{ top: 20 }} // Optional: give some space from top
  bodyStyle={{ 
    maxHeight: "calc(100vh - 200px)", // Limit body height
    overflowY: "auto",                // Enable vertical scroll
    paddingRight: 8,                  // Small padding for scrollbar
  }}
>
  <Form form={lineForm} onFinish={handleSaveLines} layout="vertical" onValuesChange={handleLineValuesChange}>
    <Form.List name="lineItems">
      {(lineFields, { add }) => (
        <>
          <Table
            dataSource={lineFields}
            pagination={false}
            size="small"
            rowKey={(field) => field.key}
           // scroll={{ y: "calc(100vh - 400px)" }}  // ← KEY: fixed height with scroll
           scroll={{
  y: "calc(100vh - 400px)",
  x: "max-content", // or a number like 1200
}}
            columns={[
             {
                title: "Action",
                width: 120,
                fixed: "left",
                render: (_: any, __: any, index: number) => (
     
                                     <Space>
                 
                  <Button
        type="link"
        icon={<EditOutlined />}
        size="small"
        onClick={() => handleEditLine(index)}
      >
        Edit
      </Button>
                  <Button
                    danger
                    size="small"
                    onClick={() => handleInlineDelete(index, lineFields[index])}
                  >
                    Delete
                  </Button>   </Space>
                ),
              }, ...effectiveDetailConfig!.fields.map((f) => ({
                title: f,
                width: 200,
                
                render: (_: any, __: any, index: number) => (
                  <Form.Item name={[lineFields[index].name, f]} noStyle>
                    {renderFormItemComponent(f, true)}
                  </Form.Item>
                ),
              })),
              
            ]}
          />

          <Button
            type="dashed"
            onClick={() => add({ [qtyField]: 1, [priceField]: 0 })}
            block
            icon={<PlusCircleOutlined />}
            style={{ marginTop: 16 }}
          >
            Add Line Item
          </Button>
        </> //        {form.getFieldValue("Status") === "Draft" && (
                  //         <Button type="primary" danger onClick={handleSendQuote}>
                  //           Send Quote (Email PDF)
                  //         </Button>
                  //       )}
                  //       <Button onClick={closeModal}>Cancel</Button>
                  //       <Button type="primary" onClick={() => form.submit()}>Save</Button>
                  //  
      )}
    </Form.List>

    {lineWarning && (
      <Alert message={lineWarning} type="warning" showIcon style={{ marginTop: 16 }} />
    )}
  </Form>
</Modal>
      {/* Lookup Modal - simplified for brevity, same as before but using values directly
 
<Modal
  title={lookupModalField ? `Add New ${lookupModalField}` : "Add New"}
  open={lookupModalVisible}
  width={900}
  destroyOnHidden
  onCancel={() => {
    setLookupModalVisible(false);
    lookupForm.resetFields();
    setLookupModalField(null);
  }}
  onOk={() => lookupForm.submit()} // submit lookup form
>
  <Form
    form={lookupForm}
    layout="vertical"
    onFinish={handleAddNewLookup}
  >
    <Row gutter={16}>
      {lookupModalField &&
        (fieldsForLookup[lookupModalField] || []).map((f: string) => (
          <Col span={8} key={f}>
            <Form.Item
              label={f}
              name={f}
              rules={[{ required: true }]}
            >
              {renderFormItemComponent(f)}
            </Form.Item>
          </Col>
        ))}
    </Row>
  </Form>
</Modal>*/}
<Modal
  title={`Add New ${lookupModalField}`}
  open={lookupModalVisible}
  width={900}
  onCancel={() => {
    setLookupModalVisible(false);
    lookupForm.resetFields();
    setLookupModalField(null);
  }}
  onOk={() => lookupForm.submit()}
  destroyOnClose
>
  <Form
    form={lookupForm}
    layout="vertical"
    onFinish={handleAddNewLookup}
  >
    <Row gutter={16}>
      {lookupModalField &&
        (fieldsForLookup[lookupModalField] || [])
          .filter((field: string, index: number, array: string[]) => {
            // If there are no fields, don't filter
            if (array.length === 0) return true;
            const lowerField = field.toLowerCase();
            const isFirstField = index === 0;
            // Derive expected table name from the lookup field (e.g., "CustomerId" → "customer")
            const lookupFieldLower = lookupModalField!.toLowerCase();
            let expectedTableName = lookupEndpointFromField(lookupModalField!); // e.g., "customers"
           
            // Fallback: extract from field name (remove "Id" and pluralize rules)
            if (lookupFieldLower.endsWith("id")) {
              let base = lookupModalField!.slice(0, -2); // remove "Id"
              // Simple plural to singular guess
              if (base.endsWith("ies")) base = base.slice(0, -3) + "y";
              
              else if ((base.endsWith("s")) && (!base.endsWith("sus"))) base = base.slice(0, -1);
              expectedTableName = base.toLowerCase();
                 // console.log(`confirming for ${base} :::: ${expectedTableName}`);
            }
       
             if (lookupFieldLower.endsWith("paymentmethod")) {
              let base = lookupModalField!;
              // Simple plural to singular guess
             // if (base.endsWith("ies")) base = base.slice(0, -3) + "y";
            //  else if (base.endsWith("s")) base = base.slice(0, -1);
            base = base + "s";
              expectedTableName = base.toLowerCase();
            }
            const expectedPkPattern = new RegExp(`^${expectedTableName}id$`, "i");
            // Hide only if:
            // - It's the first field AND
            // - Its name matches the expected primary key pattern (e.g., CustomerId for customers)
            const isPrimaryKey = isFirstField && expectedPkPattern.test(field);
            return !isPrimaryKey;
          })
          .map((field: string) => (
            <Col span={8} key={field}>
              <Form.Item
                label={field}
                name={field}
                rules={[
                  {
                    required: /name|code|title|description|label/i.test(field),
                    message: `${field} is required`,
                  },
                ]}
              >
                {renderFormItemComponent(field)}
              </Form.Item>
            </Col>
          ))}
    </Row>
  </Form>
</Modal>
      <style>{`
        .even-row { background-color: var(--row-bg-even, #ffffff); }
        .odd-row { background-color: var(--row-bg-odd, #f9f9f9); }
      `}</style>
    </div>
  );
};
export default GenericResourcePage;
