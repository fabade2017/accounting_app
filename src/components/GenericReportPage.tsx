// GenericReportPage.tsx
import { useEffect, useState } from "react";
import {
  Table,
  DatePicker,
  Input,
  Button,
  Form,
  message,
  Select,
  Card,
  Space,
} from "antd";
import type { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import { Pie, Bar } from "@ant-design/plots";
import { exportToExcel, exportToCSV } from "../utils/export";
import { Column } from '@ant-design/plots';  // or '@ant-design/charts' depending on your package
import { formatProcedureName } from "../utils/formatName";
type ReportRow = Record<string, any>;

interface GroupedRow {
  Group: string;
  Total: number;
  children: ReportRow[];
  _uniqueKey: string;
}

interface GenericReportPageProps {
  resourceName: string;
  apiBaseUrl: string;
  fields: string[];
}

export const GenericReportPage: React.FC<GenericReportPageProps> = ({
  resourceName,
  apiBaseUrl,
  fields,
}) => {
  const [form] = Form.useForm();

  const [data, setData] = useState<ReportRow[]>([]);
  const [grouped, setGrouped] = useState<GroupedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookups, setLookups] = useState<
    Record<string, { data: any[]; idField: string; labelField: string }>
  >({});
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [aggCol, setAggCol] = useState<string | null>(null);
  const [aggType, setAggType] = useState<"SUM" | "AVG" | "COUNT">("SUM");
  const [chartType, setChartType] = useState<"none" | "pie" | "bar">("none");

  const endpoint = `${apiBaseUrl}/procedures/${resourceName}`;

  const [jsonLookups, setJsonLookups] = useState<Record<string, any[]>>({});

useEffect(() => {
  const loadJsonLookups = async () => {
    try {
      const res = await fetch("/lookups.json");
      if (!res.ok) throw new Error("Failed to load lookup JSON");
      const data = await res.json();
      setJsonLookups(data);
    } catch (err) {
      console.error(err);
    }
  };
  loadJsonLookups();
}, []);
  type GenericRow = Record<string, unknown>;

  // Set default filter values
  useEffect(() => {
    const defaults: Record<string, any> = {};
    fields.forEach((f) => {
      const key = f.toLowerCase();
      if (key.includes("date")) defaults[f] = dayjs();
      if (key.includes("company")) defaults[f] = 1;
    });
    form.setFieldsValue(defaults);
  }, [fields, form]);

  // Automatically detect id/label fields from row
  const resolveLookupFields = (row: Record<string, any>) => {
    const keys = Object.keys(row);

    const idField =
      keys.find((k) => /id$/i.test(k)) ??
      keys.find((k) => typeof row[k] === "number") ??
      keys[0];

    const labelField =
      keys.find((k) => typeof row[k] === "string" && k !== idField) ??
      keys.find((k) => k !== idField) ??
      keys[1];

    return { idField, labelField };
  };

  // Resolve API URL for a given field
  const resolveLookupApi = (field: string) => {
    const lower = field.toLowerCase();

    if (!lower.endsWith("id") && !lower.endsWith("type")|| lower.toLowerCase().endsWith("by")|| lower.toLowerCase().endsWith("status")) return null;

    const base = field.replace(/(id|type)$/i, "");

    // irregular pluralization rules
    const irregulars: Record<string, string> = {
      company: "companies",
      warehouse: "warehouses",
      status: "status"
    };

    const endpoint = irregulars[base.toLowerCase()] ?? base.toLowerCase() + "s";

    return {
      api: `${apiBaseUrl}/${endpoint}`,
    };
  };

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      const idFields = fields.filter(
        (f) => f.toLowerCase().endsWith("id") || f.toLowerCase().endsWith("type")|| f.toLowerCase().endsWith("by")|| f.toLowerCase().endsWith("status")
      );

      if (!idFields.length) return;

      const result: Record<string, any> = {};

      await Promise.all(
        idFields.map(async (field) => {
          const cfg = resolveLookupApi(field);
          if (!cfg) return;

          try {
            const res = await fetch(cfg.api);
            if (!res.ok) return;

            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return;

            const { idField, labelField } = resolveLookupFields(data[0]);
            result[field] = { data, idField, labelField };
          } catch (err) {
            console.error("Lookup load failed:", field, err);
          }
        })
      );

      setLookups(result);
    };

    loadLookups();
  }, [fields, apiBaseUrl]);

  // Build request body
  const buildRequestBody = () => {
    const values = form.getFieldsValue();
    const body: Record<string, any> = {};
    Object.keys(values).forEach((k) => {
      const v = values[k];
      body[k] = dayjs.isDayjs(v) ? v.format("YYYY-MM-DD") : v;
    });
    return body;
  };

  // Load report data
  const loadReport = async () => {
    setLoading(true);
    setData([]);
    setGrouped([]);
    setGroupBy(null);
    setAggCol(null);
    setAggType("SUM");
    setChartType("none");
console.log(`buildRequestBody:` +JSON.stringify(buildRequestBody()));
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequestBody()),
      });

      if (!res.ok) throw new Error("Failed to load report");
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Grouping & aggregation
  useEffect(() => {
    if (!groupBy || !aggCol || data.length === 0) {
      setGrouped([]);
      return;
    }

    const map: Record<string, { total: number; count: number; children: ReportRow[] }> = {};

    data.forEach((row, idx) => {
      const key = String(row[groupBy] ?? "Unknown");
      if (!map[key]) map[key] = { total: 0, count: 0, children: [] };

      map[key].children.push({ ...row, _uniqueKey: `row-${idx}` });

      const val = Number(row[aggCol]) || 0;
      if (aggType === "SUM") map[key].total += val;
      if (aggType === "AVG") {
        map[key].total += val;
        map[key].count++;
      }
      if (aggType === "COUNT") map[key].count++;
    });

    const result: GroupedRow[] = Object.keys(map).map((k, i) => {
      const e = map[k];
      const total =
        aggType === "AVG"
          ? e.total / (e.count || 1)
          : aggType === "COUNT"
          ? e.count
          : e.total;

      return {
        Group: k,
        Total: total,
        children: e.children,
        _uniqueKey: `group-${i}`,
      };
    });

    setGrouped(result);
  }, [data, groupBy, aggCol, aggType]);

  // Columns for table
  const columns: ColumnType<ReportRow>[] =
    data.length > 0
      ? Object.keys(data[0]).map((k) => ({
          title: k,
          dataIndex: k,
          key: k,
          sorter: (a, b) =>
            typeof a[k] === "number" && typeof b[k] === "number"
              ? a[k] - b[k]
              : String(a[k] ?? "").localeCompare(String(b[k] ?? "")),
        }))
      : [];

  // Totals per column for summary
  const getTotals = (rows: ReportRow[]) => {
    const totals: Record<string, number> = {};
    rows.forEach((r) =>
      columns.forEach((c) => {
        if ("dataIndex" in c) {
          const v = Number(r[c.dataIndex as string]) || 0;
          totals[c.dataIndex as string] =
            (totals[c.dataIndex as string] || 0) + v;
        }
      })
    );
    return totals;
  };

  // Chart data
  const chartData = grouped.map((g) => ({ type: g.Group, value: g.Total }));

  // Export data
  const exportData =
    grouped.length > 0
      ? grouped.flatMap((g) => g.children.map((c) => ({ Group: g.Group, ...c })))
      : data;

  return (
    <div>
      <h2>{formatProcedureName(resourceName).toUpperCase()}</h2>

      {/* FILTER */}
      <Form form={form} layout="inline" onFinish={loadReport}>
        {fields.map((f) => {
          const lower = f.toLowerCase();

          // DATE
          if (lower.includes("date")) {
            return (
              <Form.Item key={f} name={f} label={f}>
                <DatePicker />
              </Form.Item>
            );
          }
  // JSON lookup first
  const jsonOptions = jsonLookups[lower];
  const apiCfg = lookups[f];

  if (jsonOptions && jsonOptions.length > 0) {
    console.log(`AA: `+JSON.stringify(apiCfg));
    console.log(`BB: ` +JSON.stringify(jsonOptions));
    return (
      <Form.Item key={f} name={f} label={f}>
        <Select allowClear showSearch optionFilterProp="children" style={{ width: 220 }}>
          {jsonOptions.map((o: any) => (
            <Select.Option key={o.value} value={o.value}>
              {o.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  }
          // DROPDOWN (Id fields)
          if (f.toLocaleLowerCase().endsWith("id") || f.toLocaleLowerCase().endsWith("status")  || f.toLocaleLowerCase().endsWith("groupby")) {
            const cfg = lookups[f];
            return (
              <Form.Item key={f} name={f} label={f}>
                <Select allowClear showSearch optionFilterProp="children" style={{ width: 220 }}>
                  {cfg?.data.map((o) => (
                    <Select.Option key={o[cfg.idField]} value={o[cfg.idField]}>
                      {o[cfg.labelField]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }

          // DEFAULT
          return (
            <Form.Item key={f} name={f} label={f}>
              <Input />
            </Form.Item>
          );
        })}

        <Button type="primary" htmlType="submit" loading={loading}>
          Run Report
        </Button>
      </Form>

      {/* CONTROLS */}
      {data.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Space>
            <Select
              placeholder="Group By"
              value={groupBy}
              onChange={setGroupBy}
              allowClear
              style={{ width: 180 }}
            >
              {columns.map((c) => (
                <Select.Option
                  key={String(c.key ?? c.dataIndex)}
                  value={String(c.dataIndex)}
                >
                  {typeof c.title === "function" ? c.title({} as any) : c.title}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Aggregate Column"
              value={aggCol}
              onChange={setAggCol}
              style={{ width: 180 }}
            >
              {columns.map((c) => (
                <Select.Option
                  key={String(c.key ?? c.dataIndex)}
                  value={String(c.dataIndex)}
                >
                  {typeof c.title === "function" ? c.title({} as any) : c.title}
                </Select.Option>
              ))}
            </Select>

            <Select value={aggType} onChange={setAggType} style={{ width: 120 }}>
              <Select.Option value="SUM">SUM</Select.Option>
              <Select.Option value="AVG">AVG</Select.Option>
              <Select.Option value="COUNT">COUNT</Select.Option>
            </Select>

            <Select value={chartType} onChange={setChartType} style={{ width: 120 }}>
              <Select.Option value="none">None</Select.Option>
              <Select.Option value="pie">Pie</Select.Option>
              <Select.Option value="bar">Bar</Select.Option>
            </Select>

            <Button onClick={() => exportToExcel(exportData, resourceName)}>Export Excel</Button>
            <Button onClick={() => exportToCSV(exportData, resourceName)}>Export CSV</Button>
          </Space>
        </Card>
      )}

      {/* TABLE */}
      <Table
        style={{ marginTop: 16 }}
        dataSource={grouped.length ? grouped : data}
        columns={
          grouped.length
            ? [
                { title: "Group", dataIndex: "Group", key: "Group" },
                { title: "Total", dataIndex: "Total", key: "Total" },
              ]
            : columns
        }
        expandable={
          grouped.length
            ? {
                rowExpandable: (record) =>
                  Array.isArray(record.children) && record.children.length > 0,
                expandedRowRender: (record, parentIndex) => {
                  const childrenRows = ((record.children || []) as GenericRow[])
                    .filter((r: GenericRow) =>
                      r &&
                      Object.keys(r).some(
                        (k) => k !== "_uniqueKey" && r[k] != null && r[k] !== ""
                      )
                    )
                    .map((r: GenericRow, i: number) => ({
                      ...r,
                      _uniqueKey: `child-${parentIndex}-${i}`,
                    }));

                  if (childrenRows.length === 0) return null;

                  const totals = getTotals(childrenRows);

                  return (
                    <Table
                      dataSource={childrenRows}
                      columns={columns}
                      pagination={false}
                      rowKey={(child) => child._uniqueKey}
                      summary={() => (
                        <Table.Summary.Row>
                          {columns.map((c, i) => {
                            if (!("dataIndex" in c)) return null;
                            const val = totals[c.dataIndex as string];
                            return (
                              <Table.Summary.Cell
                                key={`summary-${parentIndex}-${i}`}
                                index={i}
                              >
                                {val != null ? val : 0}
                              </Table.Summary.Cell>
                            );
                          })}
                        </Table.Summary.Row>
                      )}
                    />
                  );
                },
              }
            : undefined
        }
        rowKey={(record) =>
          "_uniqueKey" in record ? record._uniqueKey : JSON.stringify(record)
        }
        loading={loading}
      />

      {/* CHART */}
      {chartType !== "none" && grouped.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          {/* {chartType === "pie" && <Pie data={chartData} angleField="value" colorField="type" radius={0.9} />} */}
          {chartType === "pie" && chartData.length > 0 && (

    <Pie
      key={chartType} // forces remount when switching
      data={chartData}
      angleField="value"
      colorField="type"
      radius={0.9}
      autoFit
    />

)}

{/* <Bar
  data={chartData}
  xField="value"   // categorical → bottom x-axis
  yField="type"  // numeric → vertical y-axis (bars grow upward)
  label={{ position: 'middle' }}  // still works, or try 'top'/'bottom' if needed
  tooltip={{ showTitle: true }}
  autoFit
  barWidthRatio={0.6} // controls relative width of bars (thinner than default)
/> */}
    {chartType === "pie" && chartData.length > 0 && (
<Column
  data={chartData}
  xField="type"    // categorical: Asset, Liability, Equity → on bottom x-axis
  yField="value"   // numeric → vertical y-axis (positive up, negative down)
  label={{ position: 'middle' }}  // or 'top' / 'bottom' as needed
  tooltip={{ showTitle: true }}
  autoFit
  barWidthRatio={0.6}  // thinner columns
  // Optional: better handle zero/negative scale
  yAxis={{
    min: Math.min(0, ...chartData.map(d => d.value)) * 1.1,  // ensure negatives are visible
    max: Math.max(0, ...chartData.map(d => d.value)) * 1.1,
  }}
/>)}
        </Card>
      )}
    </div>
  );
};
