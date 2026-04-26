// src/components/WidgetModal.tsx
import { Modal, Form, Input, InputNumber, Button, Select, message, Row, Col , DatePicker } from "antd";
import { useEffect, useState } from "react";
import { formatProcedureName } from "../utils/formatName";
import { transformDataByMapping } from "../utils/chartTransform";
import dayjs from 'dayjs';
const { Option } = Select;

interface Widget {
  DashboardWidgetId: number;
  DashboardId: number;
  WidgetId: number;
  WidgetName?: string;
  Type?: string;
  Settings: string;
  PositionX: number;
  PositionY: number;
  Width: number;
  Height: number;
}

interface ProcParam {
  name: string;
  type: "string" | "number";
  required: boolean;
}

interface Procedure {
  ProcedureId: number;
  ProcedureName: string;
}

interface WidgetModalProps {
  modalVisible: boolean;
  setModalVisible: (v: boolean) => void;
  editingWidget: Widget | null;
  setEditingWidget: (w: Widget | null) => void;
  form: any;
  procParamsDef: ProcParam[];
  setProcParamsDef: (v: ProcParam[]) => void;
  previewData: any[];
  setPreviewData: (v: any[]) => void;
  selectedProc: number | null;
  setSelectedProc: (v: number | null) => void;
  procedures: Procedure[]; // array of { ProcedureId, ProcedureName }
  callProcAndGetResultSets: (procName: string, params: Record<string, any>) => Promise<any[]>;
  onSave: (widget: Widget) => void;
}

export const WidgetModal = ({
  modalVisible,
  setModalVisible,
  editingWidget,
  setEditingWidget,
  form,
  procParamsDef,
  setProcParamsDef,
  previewData,
  setPreviewData,
  selectedProc,
  setSelectedProc,
  procedures,
  callProcAndGetResultSets,
  onSave
}: WidgetModalProps) => {
  const [loadingPreview, setLoadingPreview] = useState(false);
interface ProcParamRaw {
  Id: number;
  ProcedureName: string;
  ParameterName: string;
  ParameterType: string;
  IsRequired: boolean;
}

//mapping: { x: "Title", y: "Value" };
// const transformDataByMapping = (
//   data: any[],
//   chartType: string,
//   mapping?: { x?: string; y?: string }
// ) => {
//   // Hard guard – TS now KNOWS these exist
//   if (!mapping?.x || !mapping?.y) return data;

//   const xKey = mapping.x;
//   const yKey = mapping.y;

//   switch (chartType) {
//     case "pie":
//       return data.map(d => ({
//         name: d[xKey],
//         value: d[yKey]
//       }));

//     case "bar":
//       return data.map(d => ({
//         category: d[xKey],
//         value: d[yKey]
//       }));

//     case "line":
//       return data.map(d => ({
//         x: d[xKey],
//         y: d[yKey]
//       }));

//     default:
//       return data;
//   }
// };

const [lookupOptions, setLookupOptions] = useState<Record<string, any[]>>({});
const isIsoDate = (val: any) =>
  typeof val === "string" && !isNaN(Date.parse(val));

const buildLookupOption = (row: any) => {
  const entries = Object.entries(row);

  // VALUE → first *Id
  const valueEntry = entries.find(
    ([key, val]) => /id$/i.test(key) && typeof val === "number"
  );

  // LABEL → first two string fields
  const labelEntries = entries.filter(
    ([, val]) => typeof val === "string" && !isIsoDate(val)
  );

  return {
    value: valueEntry?.[1],
    label: labelEntries
      .slice(0, 2)
      .map(([, v]) => v)
      .join(" - "),
  };
};
// const loadLookups = async (paramNames: string[]) => {
//   const results = await Promise.all(
//     paramNames.map(async (param) => {
//       const res = await fetch(
//         `${import.meta.env.VITE_API_BASE_URL}/api/${param.replace("Id", "").toLowerCase()}s`
//       );
//       const json = await res.json();

//       return [
//         param,
//         json.map(buildLookupOption),
//       ];
//     })
//   );

//   setLookupOptions(Object.fromEntries(results));
// };
const API_ENDPOINTS: Record<string, string> = {
  CompanyId: "/companies",
  SupplierId: "/suppliers",
  CustomerId: "/customers",
  UserId: "/users",
  WarehouseId: "/warehouses"
};

const loadLookups = async (paramNames: string[]) => {
  const results = await Promise.all(
    paramNames.map(async (param) => {
      const url = API_ENDPOINTS[param];
      if (!url) return [param, []]; // unknown param, skip

      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        return [param, json.map(buildLookupOption)];
      } catch (err) {
        console.error(`Failed to load lookup ${param}:`, err);
        return [param, []]; // fallback
      }
    })
  );

  setLookupOptions(Object.fromEntries(results));
};


useEffect(() => {
  if (!procParamsDef.length) return;

  const lookupParams: string[] = procParamsDef
    .map(p => p.name)        // ✅ extract string
    .filter(name => /Id$/i.test(name));

  loadLookups(lookupParams);
}, [procParamsDef]);

  const getWidgetSettings = () => {
    if (!editingWidget) return null;

    try {
      return JSON.parse(editingWidget.Settings);
    } catch {
      return null;
    }
  };
// const settings = getWidgetSettings();
// if (settings?.params) {
//   const params = { ...settings.params };

//   // Convert date strings to dayjs objects
//   Object.keys(params).forEach(key => {
//     if (/date/i.test(key) && params[key]) {
//       params[key] = dayjs(params[key]);
//     }
//   });

//   form.setFieldsValue({ params });
// }
  useEffect(() => {
    if (modalVisible && selectedProc !== null) {
      fetchProcParams(selectedProc);
    }
  }, [modalVisible, selectedProc]);

  useEffect(() => {
  if (!editingWidget) return;

  let settings: any = {};
  try {
    settings = JSON.parse(editingWidget.Settings || "{}");
  } catch {
    settings = {};
  }

  // Restore params
  const params = { ...(settings.params || {}) };

  Object.keys(params).forEach(key => {
    if (/date/i.test(key) && params[key]) {
      params[key] = dayjs(params[key]); // ✅ AntD DatePicker needs dayjs
    }
  });

  form.setFieldsValue({
    WidgetName: editingWidget.WidgetName, // 🔥 THIS IS WHAT YOU WERE MISSING
    params,
    chartType: settings.chartType,
    mapping: settings.mapping,
    proc: settings.proc,
  });
}, [editingWidget, form]);

  // Fetch params by procedure ID
  const fetchProcParams = async (procId: number | string) => {
   let   res; 
   console.log(`Widget Metrics:` + JSON.stringify(`${import.meta.env.VITE_API_BASE_URL}/procedures/sp_FetchProcedureMetadata`));
   console.log(`Widget procId: ${procId}` );
    try {
      if (!procId) 
      {
         res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/sp_FetchProcedureMetadata`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ProcedureName: "0" }), // sending procId as ProcedureName
}); // return;
      }
       else{ 
      
//console.log(procId);
    //   const res = await fetch(`http://localhost:5017/api/proceduremetadata/${procId}`);
  res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/sp_FetchProcedureMetadata`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ ProcedureName: procId }), // sending procId as ProcedureName
});
       }
// if (!res.ok) throw new Error(`Failed to fetch params: ${res.status}`);
// const data = await res.json();

      if (!res.ok) throw new Error(`Failed to fetch params: ${res.status}`);

    //   const data: {
    //     Id: number;
    //     ProcedureName: string;
    //     Parameters: Array<{ ParameterName: string; ParameterType: string; IsRequired: boolean }>;
    //     ParameterName: string;
    //     ParameterType: string;
    //     IsRequired: boolean ;
    //   } = await res.json();
//console.log("Procedure params:ok", JSON.stringify(data));
 const data: ProcParamRaw[] = await res.json(); // <-- data is an array

    const paramsDef: ProcParam[] = data.map(p => ({
      name: p.ParameterName.replace(/^@/, ""),
      type: ["int", "decimal", "bigint", "float", "numeric"].includes(p.ParameterType.toLowerCase())
        ? "number"
        : "string",
      required: p.IsRequired
    }));


console.log("Procedure params:",JSON.stringify(paramsDef) );
      setProcParamsDef(paramsDef);
// hydrate parameter values when editing
const settings = getWidgetSettings();
if (settings?.params) {
  form.setFieldsValue({
    params: settings.params
  });
}
      // Initialize form: set procId and procName (string) and blank params
         const initialValues: Record<string, any> = {};
      paramsDef.forEach(p => initialValues[p.name] = '');
   form.setFieldsValue({ proc: data[0]?.ProcedureName || "", params: initialValues });

    } catch (err) {
      console.error("Failed to fetch procedure params", err);
      message.error("Failed to fetch procedure parameters");
      setProcParamsDef([]);
    }
  };

const handlePreview = async () => {
  try {
    const values = form.getFieldsValue();
    const procName =
      procedures.find(p => p.ProcedureId === Number(values.procId))?.ProcedureName ||
      values.procName;

    if (!procName) {
      message.error("Procedure not selected");
      return;
    }

    setLoadingPreview(true);

    const raw = await callProcAndGetResultSets(
      procName,
      values.params || {},
     // procParamsDef
    );

    const transformed =
      values.chartType === "table" || values.chartType === "card"
        ? raw
        : transformDataByMapping(raw, values.chartType, values.mapping);

    setPreviewData(transformed);
  } catch (err) {
    console.error(err);
    message.error("Preview failed");
  } finally {
    setLoadingPreview(false);
  }
};

//   const handleOk = async () => {
//     try {
//       const values = form.getFieldsValue();
//       const procId = values.procId;
//       const procName = procedures.find(p => p.ProcedureId === Number(procId))?.ProcedureName || values.procName;
//       if (!procName) throw new Error("Procedure not selected");

//       //const widgetSettings = { proc: procName, procId: Number(procId), params: values.params || {}, chartType: values.chartType };
// const widgetSettings = {
//   proc: procName,
//   procId: Number(procId),
//   params: values.params || {},
//   chartType: values.chartType,
//   mapping: values.mapping || { x: "Title", y: "Value" }
// };

//       let newWidget: Widget;
//       if (editingWidget) {
//         newWidget = { ...editingWidget, Settings: JSON.stringify(widgetSettings) };
//         onSave(newWidget);
//       } else {
//         newWidget = {
//           DashboardWidgetId: 0,
//           DashboardId: 2,
//           WidgetId: 0,
//           WidgetName: values.WidgetName || "New Widget",
//           Type: "Chart",
//           Settings: JSON.stringify(widgetSettings),
//           PositionX: 0,
//           PositionY: 0,
//           Width: 2,
//           Height: 2
//         };

//         const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboardwidgets`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(newWidget)
//         });
//         const saved = await res.json();
//         onSave(saved);
//       }

//       message.success("Widget saved!");
//       setModalVisible(false);
//       setEditingWidget(null);
//       form.resetFields();
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to save widget");
//     }
//   };

//   useEffect(() => {
//   if (!modalVisible || !editingWidget) return;

//   const settings = getWidgetSettings();
//   if (!settings) return;

//   const { procId, proc, params, chartType } = settings;

//   // set procId first (this triggers param fetch)
//   form.setFieldsValue({
//     WidgetName: editingWidget.WidgetName,
//     procId,
//     procName: proc,
//     chartType
//   });

//   setSelectedProc(procId);
// }, [modalVisible, editingWidget]);


const handleOk = async () => {
  try {
    const values = form.getFieldsValue();

    if (!values.WidgetName) {
      message.error("Widget name is required");
      return;
    }

    const procId = Number(values.procId);
    const procName =
      procedures.find(p => p.ProcedureId === procId)?.ProcedureName ||
      values.procName;

    if (!procName) {
      message.error("Procedure not selected");
      return;
    }

    const widgetSettings = {
      proc: procName,
      procId,
      params: values.params || {},
      chartType: values.chartType,
      mapping: values.mapping || { x: "Title", y: "Value" },
    };

    let savedWidget: Widget;

    if (editingWidget) {
      // ✅ EDIT EXISTING WIDGET (FIXED)
      savedWidget = {
        ...editingWidget,
        WidgetName: values.WidgetName,   // 🔥 THIS WAS MISSING
        Settings: JSON.stringify(widgetSettings),
      };

      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/dashboardwidgets/${editingWidget.DashboardWidgetId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savedWidget),
        }
      );

      onSave(savedWidget);
    } else {
      // ✅ CREATE NEW WIDGET
      const newWidget: Widget = {
        DashboardWidgetId: 0,
        DashboardId: 2, // adjust if dynamic
        WidgetId: 0,
        WidgetName: values.WidgetName, // ✅ NOW ALWAYS SAVED
        Type: "Chart",
        Settings: JSON.stringify(widgetSettings),
        PositionX: 0,
        PositionY: 0,
        Width: 2,
        Height:2, //  values.chartType === "Pie" ? 4 : 2,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/dashboardwidgets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newWidget),
        }
      );

      savedWidget = await res.json();
      onSave(savedWidget);
    }

    message.success("Widget saved");
    setModalVisible(false);
    setEditingWidget(null);
    form.resetFields();
  } catch (err) {
    console.error(err);
    message.error("Failed to save widget");
  }
};

const PARAM_LOOKUP_CONFIG: Record<string, {
  api: string;
  labelFields: [string, string];
}> = {
  CompanyId: {
    api: `/companies`,//"/api/companies",
    labelFields: ["parameter[0]", "parameter[1]"],
  },
  SupplierId: {
    api:`/suppliers`,// "/api/suppliers",
    labelFields: ["parameter[0]", "parameter[1]"],
  },
  CustomerId: {
    api: `/customers`,
    labelFields: ["parameter[0]", "parameter[1]"],
  },
};
// const renderParamInput = (paramName: string) => {
//   // 🔹 DATE
//   if (isDateParam(paramName)) {
//     return <DatePicker style={{ width: "100%" }} />;
//   }
// console.log(`paramName:`+paramName);
//   // 🔹 LOOKUP (CompanyId, SupplierId, CustomerId)
//  // if (PARAM_LOOKUP_CONFIG[paramName]) {
// if (lookupOptions[paramName]) {
//     console.log(`paramName:`+JSON.stringify(lookupOptions[paramName]));
//     return (
//       <Select
//         showSearch
//         allowClear
//         placeholder={`Select ${paramName}`}
//         options={lookupOptions[paramName]}
//         optionFilterProp="label"
//       />
//     );
//   }

//   // 🔹 DEFAULT
//   return <Input />;
// };
const renderParamInput = (paramName: string) => {
  if (isDateParam(paramName)) {
    return <DatePicker style={{ width: "100%" }} />;
  }

  if (lookupOptions[paramName]) {
    return (
      <Select
        showSearch
        allowClear
        placeholder={`Select ${paramName}`}
        options={lookupOptions[paramName]}
        optionFilterProp="label"
      />
    );
  }

  return <Input />;
};
          // useEffect(() => {
          //   if (!modalVisible || !editingWidget) return;

          //   const settings = getWidgetSettings();
          //   if (!settings) return;

          //   const { procId, proc, params, chartType, mapping } = settings;

          //   form.setFieldsValue({
          //     WidgetName: editingWidget.WidgetName,
          //     procId,
          //     procName: proc,
          //     chartType,
          //     params,
          //     mapping
          //   });

          //   setSelectedProc(procId);
          // }, [modalVisible, editingWidget]);

useEffect(() => {
  if (!modalVisible || !editingWidget) return;

  let settings: any = {};
  try {
    settings = JSON.parse(editingWidget.Settings || "{}");
  } catch {
    settings = {};
  }

  const params = { ...(settings.params || {}) };

  Object.keys(params).forEach(key => {
    if (/date/i.test(key) && params[key]) {
      params[key] = dayjs(params[key]);
    }
  });

  form.setFieldsValue({
    WidgetName: editingWidget.WidgetName,
    procId: settings.procId,
    procName: settings.proc,
    chartType: settings.chartType,
    mapping: settings.mapping,
    params
  });

  if (settings.procId) {
    setSelectedProc(settings.procId);
    fetchProcParams(settings.procId);
  }
}, [modalVisible, editingWidget, form]);//, setSelectedProc, fetchProcParams


console.log(`Widgetppp:`+ JSON.stringify(editingWidget));
  return (
    <Modal
      title={editingWidget ? "Edit Widget" : "Add Widget"}
      open={modalVisible}
      onCancel={() => { setModalVisible(false); form.resetFields(); setEditingWidget(null); }}
      onOk={handleOk}
      width={600}
      okText="Save"
    > 
   
      <Form form={form} layout="vertical" > {/* autoComplete="off" */}
        <Form.Item label="Widget Name" name="WidgetName" rules={[{ required: true, message: "Enter widget name" }]} >
          <Input  placeholder="Enter widget title" />
        </Form.Item>

        {/* store procId (number) in the form; procName is also stored for clarity */}
        {/* <Form.Item label="Metrics" required>
          <Row gutter={8}>
            <Col flex="auto">
              <Form.Item noStyle name="procId" rules={[{ required: true, message: "Select metric" }]}>
                <Select
                 showSearch
                  placeholder="Select a metric" 
                   optionFilterProp="children"
                  onChange={(v: number) => {
                    const id = Number(v);
                    setSelectedProc(id);
                    // fetch params for this id
                    fetchProcParams(id);
                  }}
                >
                  {procedures.map(p => (
                    <Option key={p.ProcedureId} value={p.ProcedureId}>
                      {formatProcedureName(p.ProcedureName.replace(/^sp_/i, ""))}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col flex="120px">
              {/* visible procName field (read-only) to show actual name * /}
              <Form.Item noStyle name="procName">
                <Input readOnly placeholder="Procedure name" />
              </Form.Item>
            </Col>
          </Row>
        </Form.Item> */}
<Form.Item
  label="Metrics"
  name="procId"
  rules={[{ required: true, message: "Select metric" }]}
>
  <Select
    showSearch
    placeholder="Select a metric"
    optionFilterProp="children"
    onChange={(v: number) => {
      const id = Number(v);
      setSelectedProc(id);
      fetchProcParams(id);
    }}
  >
    {procedures.map(p => (
      <Option key={p.ProcedureId} value={p.ProcedureId}>
        {formatProcedureName(p.ProcedureName.replace(/^sp_/i, ""))}
      </Option>
    ))}
  </Select>
</Form.Item>

<Form.Item label="Procedure Name" name="procName">
  <Input readOnly />
</Form.Item>

        {procParamsDef.length > 0 && (
          <div>
            <h4>Parameters:</h4>
            {/* {procParamsDef.map(p => (
              <Form.Item
                key={p.name}
                label={p.name}
                name={['params', p.name]}
                rules={[{ required: p.required, message: `${p.name} is required` }]}
              >
                {p.type === "number" ? <InputNumber style={{ width: "100%" }} /> : <Input />}
              </Form.Item>
            ))} */}
            {procParamsDef.map(p => (
  <Form.Item
    key={p.name}
    label={p.name}
    name={['params', p.name]}
  >
     {renderParamInput(p.name)}
    {/* {p.type === "number" ? (
      <InputNumber
        id={`param-${p.name}`}
        style={{ width: "100%" }}
      />
    ) : (
      <Input id={`param-${p.name}`} />
    )} */}
  </Form.Item>
))}
          </div>
        )}

        <Form.Item label="Chart Type" name="chartType">
          <Select>
            <Option value="bar">Bar</Option>
            <Option value="line">Line</Option>
            <Option value="pie">Pie</Option>
            <Option value="table">Table</Option>
            <Option value="card">Card</Option>
          </Select>
        </Form.Item>
<Form.Item label="Data Mapping">
  <Row gutter={8}>
    <Col span={12}>
      <Form.Item
        label="X / Label Field"
        name={["mapping", "x"]}
        rules={[{ required: true, message: "Select X field" }]}
      >
        <Input placeholder="e.g. Title" />
      </Form.Item>
    </Col>
    <Col span={12}>
      <Form.Item
        label="Y / Value Field"
        name={["mapping", "y"]}
        rules={[{ required: true, message: "Select Y field" }]}
      >
        <Input placeholder="e.g. Value" />
      </Form.Item>
    </Col>
  </Row>
</Form.Item>

        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={handlePreview} loading={loadingPreview}>Preview</Button>
          </Col>
        </Row>

        {previewData.length > 0 && (
          <div style={{ marginTop: 16, maxHeight: 200, overflow: "auto" }}>
            <pre>{JSON.stringify(previewData, null, 2)}</pre>
          </div>
        )}
      </Form>
    </Modal>
  );
};

const isDateParam = (paramName: string) => {
  return /date/i.test(paramName);
};
// function isDateParam(paramName: string) {
//   throw new Error("Function not implemented.");
// }

