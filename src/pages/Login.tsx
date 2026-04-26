import { useState } from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import "antd/dist/reset.css";

const { Title, Text } = Typography;

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        messageApi.error({
          content: "Invalid username or password",
          duration: 4,
        });
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Save login info
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userid", data.userId);
      localStorage.setItem("companyid", data.companyId);

      // Fetch role ID
      const resRole = await fetch(`${import.meta.env.VITE_API_BASE_URL}/roles/${data.role}`);
      //      alert(JSON.stringify(`${import.meta.env.VITE_API2_BASE_URL}/roles/${data.role}`));
      const dataRole = await resRole.json();
    // alert(JSON.stringify(dataRole));
      //console.log(JSON.stringify(dataRole.RoleId));
      localStorage.setItem("roleid", dataRole.RoleId);

      messageApi.success({
        content: "Login Successful! Redirecting...",
        duration: 2,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (err) {
      console.error(err);
      messageApi.error({
        content: "Network error. Please try again.",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}

      <div
        style={{
          height: "100vh",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Left Side - Login Form */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f0f2f5",
            padding: "20px",
          }}
        >
          <Card
            style={{
              width: 400,
              maxWidth: "100%",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
              borderRadius: 16,
            }}
            bodyStyle={{ padding: "40px" }}
          >
            {/* <div style={{ textAlign: "center", marginBottom: 32 }}>
              <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
               Upperlink Accounting Application
              </Title>
              <Text type="secondary">Sign in to access your dashboard</Text>
            </div> */}
{/* Company Logo */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <img
                src="/logodef.png"  // ← Place your logo in public/logo.png
                alt="Upperlink Accounting"
                style={{
                  height: 80,
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              onError={(e) => {
  e.currentTarget.style.display = "none";
  const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
  if (fallback) {
    fallback.style.display = "block";
  }
}}
              />
              {/* Fallback text (hidden unless image fails) */}
              <div style={{ display: "none", marginTop: 16 }}>
                <Text strong style={{ fontSize: 24, color: "#1890ff" }}>
                  Upperlink Accounting Application
                </Text>
              </div>
            </div>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Please enter your username" }]}
              >
                <Input size="large" placeholder="Enter username" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password size="large" placeholder="Enter password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  style={{ height: 48, fontSize: 16 }}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text type="secondary">© 2025 Upperlink Limited. All rights reserved.</Text>
            </div>
          </Card>
        </div>

        {/* Right Side - Image & Branding  url('https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: "cover", */}
        <div
          style={{
            flex: 1,
            background: `linear-gradient(rgba(241, 243, 245, 0.03), rgba(10, 9, 9, 0.09)), url('/logo.png`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <Title level={1} style={{ color: "white", marginBottom: 16 }}>
            Upperlink Accounting Package
          </Title>
          <Title level={3} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 400 }}>
            Manage your business with powerful tools and insights
          </Title>
          <Text style={{ fontSize: 18, marginTop: 32, opacity: 0.9 }}>
            Streamline operations • Track performance • Make data-driven decisions
          </Text>
        </div>
      </div>
    </>
  );
};

export default Login;