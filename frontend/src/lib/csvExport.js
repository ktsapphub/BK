// Lightweight client-side CSV export — no backend endpoint needed since the
// admin pages already fetch the full list as JSON; this just serializes it.
function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv(filename, rows, columns) {
  if (!rows || rows.length === 0) return;
  const cols = columns || Array.from(rows.reduce((set, row) => {
    Object.keys(row).forEach((k) => set.add(k));
    return set;
  }, new Set())).map((key) => ({ key, label: key }));
  const header = cols.map((c) => csvEscape(c.label)).join(",");
  const body = rows.map((row) => cols.map((c) => csvEscape(row[c.key])).join(",")).join("\n");
  const csv = `${header}\n${body}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
