export async function callProcedure(procedureName: string, parameters = "") {
  const res = await fetch("/api/procedures/genericprocedure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ProcedureName: procedureName, Parameters: parameters }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  // Some endpoints return [] or object
  const text = await res.text();
  if (!text) return [];
  try { return JSON.parse(text); } catch { return text; }
}
