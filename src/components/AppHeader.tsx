import { Layout, Avatar, Dropdown, Space, Input, Badge } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";

const { Header } = Layout;
const { Search } = Input;

interface AppHeaderProps {
  onSearchChange: (value: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onSearchChange }) => {
  const username = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userid");
    window.location.href = "/login";
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "logout",
      label: (
        <span onClick={handleLogout}>
          <LogoutOutlined style={{ marginRight: 8 }} />
          Logout
        </span>
      ),
    },
  ];

  return (
    <Header
      style={{
        background: "rgba(15, 23, 42, 0.85)", // Deep slate with slight transparency
        backdropFilter: "blur(12px)", // Glassmorphism effect
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#e2e8f0",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 70,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left: Title with subtle gradient text */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          background: "linear-gradient(to right, #a78bfa, #60a5fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.5px",
        }}
      >
       Upperlink Accounting Package
      </div>

      {/* Center: Search Bar */}
      <div style={{ flex: 1, maxWidth: 600, margin: "0 48px" }}>
        <Search
          placeholder="Search modules..."
          allowClear
          enterButton={
            <span style={{ fontWeight: 600 }}>Search</span>
          }
          size="large"
          onSearch={onSearchChange}
          style={{
            width: "100%",
          }}
          styles={{
            input: {
              background: "rgba(30, 41, 59, 0.6)",
              color: "#e2e8f0",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
            },
            suffix: { color: "#94a3b8" },
            prefix: { color: "#94a3b8" },
          }}
          // Gradient button style
          className="custom-gradient-search"
        />
      </div>

      {/* Right: Notifications + User Dropdown */}
      <Space size={24}>
        <Badge dot offset={[-4, 6]} style={{ boxShadow: "none" }}>
          <BellOutlined
            style={{
              fontSize: 22,
              color: "#cbd5e1",
              cursor: "pointer",
              padding: 8,
              borderRadius: 12,
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          />
        </Badge>

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
          <Space style={{ cursor: "pointer" }}>
            <Avatar
              size={40}
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              }}
              icon={<UserOutlined />}
            />
            <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{username}</span>
          </Space>
        </Dropdown>
      </Space>

      {/* Custom CSS for gradient search button - add this to your global CSS or styled component */}
     
    </Header>
  );
};

// import { Layout, Avatar, Dropdown, Space, Input } from "antd";
// import type { MenuProps } from "antd";
// import { UserOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";

// const { Header } = Layout;
// const { Search } = Input;

// interface AppHeaderProps {
//   onSearchChange: (value: string) => void;
// }

// export const AppHeader: React.FC<AppHeaderProps> = ({ onSearchChange }) => {
//   const username = localStorage.getItem("userName") || "User";

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userName");
//     localStorage.removeItem("userid");
//     window.location.href = "/login";
//   };

//   const menuItems: MenuProps["items"] = [
//     {
//       key: "logout",
//       label: (
//         <span onClick={handleLogout}>
//           <LogoutOutlined style={{ marginRight: 8 }} />
//           Logout
//         </span>
//       ),
//     },
//   ];

//   return (
//     <Header
//       style={{
//         background: "var(--card-color)",
//         color: "var(--text-color)",
//         padding: "0 24px",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         height: 64,
//         boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
//       }}
//     >
//       {/* Left */}
//       <div style={{ fontSize: 20, fontWeight: 600, minWidth: 200 }}>
//         Admin Dashboard
//       </div>

//       {/* Center */}
//       <div style={{ flex: 1, maxWidth: 500, margin: "0 32px" }}>
//         <Search
//           placeholder="Search modules..."
//           allowClear
//           enterButton="Search"
//           onSearch={onSearchChange}
//           style={{ width: "100%" }}
//         />
//       </div>

//       {/* Right */}
//       <Space size="large">
//         <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />

//         <Dropdown menu={{ items: menuItems }} placement="bottomRight">
//           <Space style={{ cursor: "pointer" }}>
//             <Avatar
//               size="small"
//               style={{ background: "#3b82f6" }}
//               icon={<UserOutlined />}
//             />
//             <span>{username}</span>
//           </Space>
//         </Dropdown>
//       </Space>
//     </Header>
//   );
// };


// import { Layout, Avatar, Dropdown, Space, Input } from "antd";
// import type { MenuProps } from "antd";
// import { UserOutlined, LogoutOutlined, BellOutlined } from "@ant-design/icons";

// const { Header } = Layout;
// const { Search } = Input;

// interface AppHeaderProps {
//   onSearchChange: (value: string) => void;
// }

// export const AppHeader: React.FC<AppHeaderProps> = ({ onSearchChange }) => {
//   const username = localStorage.getItem("userName") || "User";

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userName");
//     localStorage.removeItem("userid");
//     window.location.href = "/login";
//   };

//   const menuItems: MenuProps["items"] = [
//     {
//       key: "logout",
//       label: (
//         <span onClick={handleLogout}>
//           <LogoutOutlined style={{ marginRight: 8 }} />
//           Logout
//         </span>
//       ),
//     },
//   ];

//   return (
//     <Header style={{ display: "flex", justifyContent: "space-between" }}>
//       <div style={{ fontSize: 20, fontWeight: 600 }}>Admin Dashboard</div>

//       <Search
//         placeholder="Search modules..."
//         onSearch={onSearchChange}
//         style={{ maxWidth: 500 }}
//       />

//       <Space size="large">
//         <BellOutlined />

//         <Dropdown menu={{ items: menuItems }} placement="bottomRight">
//           <Space style={{ cursor: "pointer" }}>
//             <Avatar icon={<UserOutlined />} />
//             <span>{username}</span>
//           </Space>
//         </Dropdown>
//       </Space>
//     </Header>
//   );
// };
