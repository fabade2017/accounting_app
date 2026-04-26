import { Drawer, Button, List, Card, Tag, message } from "antd";
import { PlusOutlined, DeleteOutlined, DragOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface KPI {
  KPIKey: string;
  KPIId: number;
  Title: string;
  Category: string;
  Icon: string;
}

interface SelectedKPI extends KPI {
  Order: number;
}

// interface Props {
//   open: boolean;
//   onClose: () => void;
//     onSaved: () => void; // 👈 add
//   userId: string|number;
// }
interface Props {
  open: boolean;
  onClose: () => void;
  userId: string | number;
  onSaved: () => Promise<void> | void;
}
const MAX_KPIS = 8;

// export default function KpiManagerDrawer({ open, onClose, userId }: Props) {
export default function KpiManagerDrawer({
  open,
  onClose,
  userId,
  onSaved,
}: Props) {
  const [allKPIs, setAllKPIs] = useState<KPI[]>([]);
  const [selected, setSelected] = useState<SelectedKPI[]>([]);
  const [saving, setSaving] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5017/api";
  useEffect(() => {
    if (open) {
      loadKPIs();
    }
  }, [open]);

  const loadKPIs = async () => {
    const res = await fetch(`${apiBaseUrl}/Dashboardkpis`);//userdashboardkpis /library
    
    const data = await res.json();
    setAllKPIs(data);

 //   const userRes = await fetch(`${apiBaseUrl}/sp_/${userId}`);
     const userRes = await fetch(`${apiBaseUrl}/procedures/sp_userdashboard_crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: "KPISU",
          UserId: userId,//parseInt()
        //  Config: config //, //  Result: "",
       
        }),
      });
    const userData = await userRes.json();
    console.log(`userData::`+ JSON.stringify(userData));
    setSelected(userData);
  };
const onDragEnd = (result: DropResult) => {
  if (!result.destination) return;

  const items = Array.from(selected);
  const [moved] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, moved);

  setSelected(
    items.map((item, idx) => ({
      ...item,
      Order: idx + 1,
    }))
  );
};

  const addKpi = (kpi: KPI) => {
    if (selected.length >= MAX_KPIS) {
      message.warning("You can select a maximum of 8 KPIs");
      return;
    }

    if (selected.find(s => s.KPIKey === kpi.KPIKey)) return;

    setSelected([
      ...selected,
      { ...kpi, Order: selected.length + 1 }
    ]);
  };

  const removeKpi = (key: string) => {
    setSelected(
      selected
        .filter(k => k.KPIKey !== key)
        .map((k, i) => ({ ...k, Order: i + 1 }))
    );
  };
  console.log(".............");
console.log(JSON.stringify({
        UserId: userId,
        KPIs: selected.map(({ KPIId, Order }) => ({ KPIId, Order }))
      }));
        console.log(".............");
  const save = async () => {
    setSaving(true);
    await fetch(`${apiBaseUrl}/procedures/sp_SaveUserDashboardKPIs`, {  //user
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UserId: userId,
        KPIs: selected.map(({ KPIId, Order }) => ({ KPIId, Order }))
      })
    });
    setSaving(false);
    message.success("Dashboard KPIs saved");
     await onSaved(); // 🔥 WAIT until dashboard refreshes
    onClose();
  };

  return (
    <Drawer
      title="Manage Dashboard KPIs"
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" loading={saving} onClick={save}>
            Save Changes
          </Button>
        </div>
      }
    >
      {/* Selected KPIs */}
      <h4>My Dashboard ({selected.length}/{MAX_KPIS})</h4>
      <DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="selected-kpis">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {selected
          .sort((a, b) => a.Order - b.Order)
          .map((item, index) => (
            <Draggable
              key={item.KPIKey}
              draggableId={item.KPIKey}
              index={index}
            >
              {(provided) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={{
                    marginBottom: 8,
                    cursor: "grab",
                    ...provided.draggableProps.style,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      {...provided.dragHandleProps}
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <DragOutlined />
                      <strong>{item.Title}</strong>
                    </div>

                    <DeleteOutlined
                      onClick={() => removeKpi(item.KPIKey)}
                      style={{ color: "red", cursor: "pointer" }}
                    />
                  </div>
                </Card>
              )}
            </Draggable>
          ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>

      {/* <List
        bordered
        dataSource={selected.sort((a, b) => a.Order - b.Order)}
        renderItem={item => (
          <List.Item
            actions={[
              <DeleteOutlined
                key="remove"
                onClick={() => removeKpi(item.KPIKey)}
                style={{ color: "red" }}
              />
            ]}
          >
            <DragOutlined style={{ marginRight: 8 }} />
            {item.Title}
          </List.Item>
        )}
      /> */}

      <br />

      {/* Available KPIs */}
      <h4>KPI Library</h4>
      <List
        grid={{ gutter: 8, column: 1 }}
        dataSource={allKPIs}
        renderItem={kpi => (
          <List.Item>
            <Card size="small">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{kpi.Title}</strong>
                  <br />
                  <Tag>{kpi.Category}</Tag>
                </div>
                <Button
                  icon={<PlusOutlined />}
                  disabled={
                    selected.length >= MAX_KPIS ||
                    selected.some(s => s.KPIKey === kpi.KPIKey)
                  }
                  onClick={() => addKpi(kpi)}
                />
              </div>
            </Card>
          </List.Item>
        )}
      />
    </Drawer>
  );
}
