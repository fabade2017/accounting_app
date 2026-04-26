import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Modal,
  Form,
  Popconfirm,
  message,
} from "antd";
import { ThemeContext, useTheme } from "../contexts/ThemeContext";

// Updated Theme interface (non-optional)
interface Theme {
  ThemeId: number;
  ThemeName: string;
  BackgroundColor: string;
  TextColor: string;
  PrimaryColor: string;
  CardColor: string;
  SidebarBg: string;
  ChartColor: string;
}
interface ThemeEditorDashboardProps {
  onClose?: () => void;  // ← Add this
}
export const ThemeEditorDashboard : React.FC<ThemeEditorDashboardProps> = ({ onClose }) => {
  const { applyThemeToDOM } = useContext(ThemeContext)!;
  const { theme, setTheme } = useTheme();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // If no onClose provided (full page mode), go back in history
      window.history.back();
      // Or navigate to dashboard:
      // navigate("/admin-dashboard");
    }
  };
  // -------------------------------
  // Load all themes on mount
  // -------------------------------
  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/genericprocedure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProcedureName: "sp_thememanager",
          Parameters: "'GetAll'",
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Partial<Theme>[] = await res.json();

      // Provide default values for missing fields
      const loaded: Theme[] = (data || []).map((t) => ({
        ThemeId: t.ThemeId ?? 0,
        ThemeName: t.ThemeName ?? "",
        BackgroundColor: t.BackgroundColor ?? "#ffffff",
        TextColor: t.TextColor ?? "#000000",
        PrimaryColor: t.PrimaryColor ?? "#1890ff",
        CardColor: t.CardColor ?? "#ffffff",
        SidebarBg: t.SidebarBg ?? "#f0f2f5",
        ChartColor: t.ChartColor ?? "#1890ff",
      }));

      setThemes(loaded);
    } catch (err) {
      console.error("Failed to load themes", err);
      setThemes([]);
    }
  };

  // -------------------------------------------------
  // Open modal to edit / create theme
  // -------------------------------------------------
  const openEditor = (theme: Theme | null) => {
    setEditingTheme(theme);
    setIsModalOpen(true);

    if (theme) {
      form.setFieldsValue(theme);
    } else {
      form.resetFields();
    }
  };

  // -------------------------------------------------
  // SAVE THEME (Create or Update)
  // -------------------------------------------------
  const saveTheme = async (values: Partial<Theme>) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/sp_thememanager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: editingTheme ? "Update" : "Create",
          ...(editingTheme ? { ThemeId: editingTheme.ThemeId } : {}),
          ...values,
        }),
      });

      message.success(editingTheme ? "Theme updated!" : "Theme created!");
      setIsModalOpen(false);
      loadThemes();
    } catch (err) {
      console.error(err);
      message.error("Failed to save theme");
    }
  };

  // -------------------------------------------------
  // DELETE THEME
  // -------------------------------------------------
  const deleteTheme = async (themeId: number) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/procedures/sp_thememanager`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Action: "Delete",
          ThemeId: themeId,
        }),
      });

      message.success("Theme deleted");
      loadThemes();
    } catch (err) {
      console.error(err);
      message.error("Failed to delete theme");
    }
  };

  // -------------------------------------------------
  // APPLY THEME LIVE (Preview)
  // -------------------------------------------------
  const previewTheme = (theme: Theme) => {
    applyThemeToDOM(theme);
    message.info(`Previewing theme "${theme.ThemeName}"`);
  };

  // -------------------------------------------------
  // APPLY THEME FOR USER
  // -------------------------------------------------
  const applyTheme = (theme: Theme) => {
    setTheme(theme);
    applyThemeToDOM(theme);
    message.success(`Theme "${theme.ThemeName}" applied!`);
  };

  return (
    
     <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Theme Editor</h2>
        <Button type="primary" onClick={handleClose}>
          {onClose ? "Close" : "Back"}
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {themes.map((theme) => (
          <Col span={6} key={theme.ThemeId}>
            <Card
              title={theme.ThemeName}
              bordered
              style={{ borderRadius: 10 }}
            >
              {/* Theme preview card */}
              <div
                style={{
                  background: theme.BackgroundColor,
                  color: theme.TextColor,
                  padding: 10,
                  borderRadius: 6,
                  border: `1px solid ${theme.PrimaryColor}`,
                  marginBottom: 10,
                }}
              >
                <h4 style={{ margin: 0 }}>Preview</h4>
                <p style={{ margin: 0 }}>Primary: {theme.PrimaryColor}</p>
              </div>

              <Button block style={{ marginBottom: 6 }} onClick={() => previewTheme(theme)}>
                Preview
              </Button>

              <Button type="primary" block style={{ marginBottom: 6 }} onClick={() => applyTheme(theme)}>
                Apply Theme
              </Button>

              <Button block style={{ marginBottom: 6 }} onClick={() => openEditor(theme)}>
                Edit
              </Button>

              <Popconfirm title="Delete theme?" onConfirm={() => deleteTheme(theme.ThemeId)}>
                <Button danger block>
                  Delete
                </Button>
              </Popconfirm>
            </Card>
          </Col>
        ))}

        {/* Add new theme */}
        <Col span={6}>
          <Card
            style={{
              height: 250,
              border: "2px dashed #ccc",
              cursor: "pointer",
              textAlign: "center",
              paddingTop: 90,
            }}
            onClick={() => openEditor(null)}
          >
            + Add New Theme
          </Card>
        </Col>
      </Row>

      {/* -----------------------------------------
          THEME EDITOR MODAL
      ------------------------------------------ */}
      <Modal
        title={editingTheme ? "Edit Theme" : "Create Theme"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={saveTheme}>
          <Form.Item name="ThemeName" label="Theme Name" rules={[{ required: true }]}>
            <Input placeholder="Dark Mode" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="PrimaryColor" label="Primary Color">
                <Input type="color" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="BackgroundColor" label="Background">
                <Input type="color" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="TextColor" label="Text Color">
                <Input type="color" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="CardColor" label="Card Background">
                <Input type="color" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="SidebarBg" label="Sidebar Color">
                <Input type="color" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="ChartColor" label="Chart Color">
                <Input type="color" />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" block htmlType="submit">
            Save Theme
          </Button>
        </Form>
      </Modal>

      {/* <Button onClick={onClose}>Close</Button> */}
      {/* Or put a close button in header, etc. */}
    </div>
  );
};

export default ThemeEditorDashboard;


// import React, { useState, useEffect, useContext } from "react";
// import {
//   Card,
//   Row,
//   Col,
//   Button,
//   Input,
//   Modal,
//   Form,
//   Popconfirm,
//   message,
// } from "antd";
// import { ThemeContext, useTheme } from "../contexts/ThemeContext";

// export const ThemeEditorDashboard = () => {
//   const { applyThemeToDOM } = useContext(ThemeContext);
//   const { theme, setTheme } = useTheme();
//   const [themes, setThemes] = useState([]);
//   const [editingTheme, setEditingTheme] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [form] = Form.useForm();

//   // -------------------------------
//   // Load all themes on mount
//   // -------------------------------
//   useEffect(() => {
//     loadThemes();
//   }, []);

// //   const loadThemes = async () => {
// //     const res = await fetch("`${import.meta.env.VITE_API_BASE_URL}/procedure/sp_thememanager?action=GetAll");
// //     const data = await res.json();
// //     setThemes(data);
// //   };
// const loadThemes = async () => {
//   try {
//     const res = await fetch("http://localhost:5017/api/procedures/genericprocedure", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         ProcedureName: "sp_thememanager",
//         Parameters: "'GetAll'" // single string parameter for action
//       }),
//     });

//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const data = await res.json();
//     setThemes(data || []);
//   } catch (err) {
//     console.error("Failed to load themes", err);
//     setThemes([]);
//   }
// };

//   // -------------------------------------------------
//   // Open modal to edit / create theme
//   // -------------------------------------------------
//   const openEditor = (theme) => {
//     setEditingTheme(theme);
//     setIsModalOpen(true);

//     if (theme) {
//       form.setFieldsValue(theme);
//     } else {
//       form.resetFields();
//     }
//   };

//   // -------------------------------------------------
//   // SAVE THEME (Create or Update)
//   // -------------------------------------------------
//   const saveTheme = async (values) => {
//     const method =  "POST";
// console.log(JSON.stringify( {Action: editingTheme ? "Update" : "Create",
//         ThemeId: editingTheme?.ThemeId,
//     ...values}));
//     await fetch(`http://localhost:5017/api/procedures/sp_thememanager`, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         Action: editingTheme ? "Update" : "Create",
//         ThemeId: editingTheme?.ThemeId,
//         ...values,
//       }),
//     });

//     message.success(editingTheme ? "Theme updated!" : "Theme created!");
//     setIsModalOpen(false);
//     loadThemes();
//   };

//   // -------------------------------------------------
//   // DELETE THEME
//   // -------------------------------------------------
//   const deleteTheme = async (themeId) => {
//     await fetch(`http://localhost:5017/api/procedures/sp_thememanager`, {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         Action: "Delete",
//         ThemeId: themeId,
//       }),
//     });

//     message.success("Theme deleted");
//     loadThemes();
//   };

//   // -------------------------------------------------
//   // APPLY THEME LIVE (Preview)
//   // -------------------------------------------------
//   const previewTheme = (theme: any) => {
  
//     applyThemeToDOM(theme);  //alert(JSON.stringify(theme));
//     message.info(`Previewing theme "${theme.ThemeName}"`);
//   };

//   // -------------------------------------------------
//   // SAVE USER'S THEME
//   // -------------------------------------------------
//               // const applyTheme = async (themeId) => {
//               // alert(themeId);
//               //   await fetch(`http://localhost:5017/api/procedures/genericprocedure?action=SetTheme`, {
//               //     method: "POST",
//               //     headers: { "Content-Type": "application/json" },
//               //     body: JSON.stringify({
//               //               UserId: 1, // TODO: use real logged in user
//               //       ThemeId: themeId,
//               //     }),
//               //   });

//               //   message.success("Default theme saved!");
//               // };
// const applyTheme = (item: any) => {
 
//     setTheme(item); 
//      applyThemeToDOM(item);//alert(JSON.stringify(item));
//     message.success(`Theme "${item.ThemeName}" applied!`);
//   };
//   return (
//     <div>
//       <h2 style={{ marginBottom: 20 }}>🎨 Theme Editor</h2>

//       <Row gutter={[16, 16]}>
//         {themes.map((theme) => (
//           <Col span={6} key={theme.ThemeId}>
//             <Card
//               title={theme.ThemeName}
//               bordered
//               style={{ borderRadius: 10 }}
//             >
//               {/* Theme preview card */}
//               <div
//                 style={{
//                   background: theme.BackgroundColor,
//                   color: theme.TextColor,
//                   padding: 10,
//                   borderRadius: 6,
//                   border: `1px solid ${theme.PrimaryColor}`,
//                   marginBottom: 10,
//                 }}
//               >
//                 <h4 style={{ margin: 0 }}>Preview</h4>
//                 <p style={{ margin: 0 }}>Primary: {theme.PrimaryColor}</p>
//               </div>

//               <Button
//                 block
//                 style={{ marginBottom: 6 }}
//                 onClick={() => previewTheme(theme)}
//               >
//                 Preview
//               </Button>

//               <Button
//                 type="primary"
//                 block
//                 style={{ marginBottom: 6 }}
//                 onClick={() => applyTheme(theme)}
//               >
//                 Apply Theme
//               </Button>

//               <Button
//                 block
//                 style={{ marginBottom: 6 }}
//                 onClick={() => openEditor(theme)}
//               >
//                 Edit
//               </Button>

//               <Popconfirm
//                 title="Delete theme?"
//                 onConfirm={() => deleteTheme(theme.ThemeId)}
//               >
//                 <Button danger block>
//                   Delete
//                 </Button>
//               </Popconfirm>
//             </Card>
//           </Col>
//         ))}

//         {/* Add new theme */}
//         <Col span={6}>
//           <Card
//             style={{
//               height: 250,
//               border: "2px dashed #ccc",
//               cursor: "pointer",
//               textAlign: "center",
//               paddingTop: 90,
//             }}
//             onClick={() => openEditor(null)}
//           >
//             + Add New Theme
//           </Card>
//         </Col>
//       </Row>

//       {/* -----------------------------------------
//           THEME EDITOR MODAL
//       ------------------------------------------ */}
//       <Modal
//         title={editingTheme ? "Edit Theme" : "Create Theme"}
//         open={isModalOpen}
//         onCancel={() => setIsModalOpen(false)}
//         footer={null}
//       >
//         <Form form={form} layout="vertical" onFinish={saveTheme}>
//           <Form.Item
//             name="ThemeName"
//             label="Theme Name"
//             rules={[{ required: true }]}
//           >
//             <Input placeholder="Dark Mode" />
//           </Form.Item>

//           <Row gutter={12}>
//             <Col span={12}>
//               <Form.Item name="PrimaryColor" label="Primary Color">
//                 <Input type="color" />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="BackgroundColor" label="Background">
//                 <Input type="color" />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={12}>
//             <Col span={12}>
//               <Form.Item name="TextColor" label="Text Color">
//                 <Input type="color" />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="CardColor" label="Card Background">
//                 <Input type="color" />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={12}>
//             <Col span={12}>
//               <Form.Item name="SidebarBg" label="Sidebar Color">
//                 <Input type="color" />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item name="ChartColor" label="Chart Color">
//                 <Input type="color" />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Button type="primary" block htmlType="submit">
//             Save Theme
//           </Button>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default ThemeEditorDashboard;
