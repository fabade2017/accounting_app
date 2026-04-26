// utils/chartTransform.ts
export const transformDataByMapping = (
  data: any[],
  chartType: string,
  mapping?: { x?: string; y?: string }
) => {
  if (!mapping?.x || !mapping?.y) return data;

  const xKey = mapping.x;
  const yKey = mapping.y;

  switch (chartType) {
    case "pie":
      return data.map(d => ({
        name: d[xKey],
        value: Number(d[yKey])
      }));

    case "bar":
      return data.map(d => ({
        category: d[xKey],
        value: Number(d[yKey])
      }));

    case "line":
      return data.map(d => ({
        x: d[xKey],
        y: Number(d[yKey])
      }));

    default:
      return data;
  }
};
