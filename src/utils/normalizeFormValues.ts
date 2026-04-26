// utils/normalizeFormValues.ts
import dayjs from "dayjs";

export const normalizeFormValues = (data: Record<string, any>) => {
  const normalized: Record<string, any> = {};

  Object.entries(data || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "string" &&
      key.toLowerCase().includes("date")
    ) {
      normalized[key] = dayjs(value);
    } else {
      normalized[key] = value;
    }
  });

  return normalized;
};
