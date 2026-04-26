import React, { useState } from "react";
import { Card, Input, Button } from "antd";

interface Theme {
  background: string;
  textColor: string;
  primaryColor: string;
  cardBackground: string;
  borderColor: string;
}

export default function ThemeBuilder() {
  const [theme, setTheme] = useState<Theme>({
    background: "",
    textColor: "",
    primaryColor: "",
    cardBackground: "",
    borderColor: "",
  });

  const update = (key: keyof Theme, value: string) => {
    setTheme({ ...theme, [key]: value });
  };

  const saveTheme = async () => {
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/theme/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
    alert("Theme Saved");
  };

  return (
    <Card title="Theme Builder">
      {Object.keys(theme).map((key) => {
        const k = key as keyof Theme; // type assertion for TS
        return (
          <div key={key} style={{ marginBottom: 10 }}>
            <label>{k}</label>
            <Input
              placeholder="Enter color e.g. #ffffff"
              value={theme[k]}
              onChange={(e) => update(k, e.target.value)}
            />
          </div>
        );
      })}

      <Button type="primary" onClick={saveTheme}>
        Save Theme
      </Button>
    </Card>
  );
}
