export const initialRows = {
  service: [
    ["ÖR-001", "Örnek cihaz A", "Kontrol", "Bekliyor", "Örnek kayıt"],
    ["ÖR-002", "Örnek cihaz B", "Yazılım kurulumu", "İşlemde", "Örnek kayıt"],
    ["ÖR-003", "Örnek cihaz C", "Ağ bağlantısı", "Tamamlandı", "Örnek kayıt"],
  ],
  rental: [
    ["K-001", "Örnek tablet A", "Depo", "Kullanımda", "Örnek kayıt"],
    ["K-002", "Örnek yazıcı B", "Paketleme", "Kontrolde", "Örnek kayıt"],
    ["K-003", "Örnek terminal C", "Sevkiyat", "Hazır", "Örnek kayıt"],
  ],
  puantaj: [
    ["P-001", "Örnek çalışan A", "Operasyon", "20 gün", "Örnek kayıt"],
    ["P-002", "Örnek çalışan B", "Ofis", "21 gün", "Örnek kayıt"],
    ["P-003", "Örnek çalışan C", "Saha", "19 gün", "Örnek kayıt"],
  ],
};
export const headers = {
  service: ["Kayıt", "Cihaz", "İşlem", "Durum", "Veri türü"],
  rental: ["Kayıt", "Ekipman", "Birim", "Durum", "Veri türü"],
  puantaj: ["Kayıt", "Personel", "Birim", "Çalışma", "Veri türü"],
};
export const createRows = (mode) => {
  if (!initialRows[mode]) throw new Error("Bilinmeyen örnek");
  return initialRows[mode].map((row) => [...row]);
};
export const appendRow = (rows, mode) => [
  ...rows,
  [
    `${mode.toUpperCase()}-${rows.length + 1}`,
    "Yeni örnek kayıt",
    "İnceleme",
    "Taslak",
    "Örnek kayıt",
  ],
];
export function toCsv(columnNames, rows) {
  const cell = (value) => {
    let text = String(value);
    if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r]/.test(text)) text = "'" + text;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return (
    "\uFEFF" +
    [columnNames, ...rows].map((row) => row.map(cell).join(";")).join("\r\n") +
    "\r\n"
  );
}
export function parseInvoiceRows(text) {
  const rows = [],
    errors = [];
  const blocks = String(text)
    .trim()
    .split(/\n\s*\n/)
    .filter(Boolean);
  if (!blocks.length) return { rows, errors: ["Örnek metin boş."] };
  blocks.forEach((block, index) => {
    const value = (label) =>
      block.match(new RegExp(`^${label}:[ \\t]*(.+)$`, "im"))?.[1].trim();
    const id = value("Belge (?:No|Seri)"),
      date = value("(?:Fatura )?Tarih(?:i)?"),
      description = value("Açıklama"),
      amount = value("Tutar");
    if (!id || !date || !description || !amount) {
      errors.push(`${index + 1}. belgede gerekli alan eksik.`);
      return;
    }
    const dm = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
    if (
      !dm ||
      new Date(Date.UTC(+dm[3], +dm[2] - 1, +dm[1]))
        .toISOString()
        .slice(0, 10) !== `${dm[3]}-${dm[2]}-${dm[1]}`
    ) {
      errors.push(`${index + 1}. belgede tarih geçersiz.`);
      return;
    }
    const am = /^((?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?)\s*(?:TL|₺)?$/i.exec(
      amount,
    );
    if (!am) {
      errors.push(`${index + 1}. belgede tutar biçimi geçersiz.`);
      return;
    }
    const amountMinor = Math.round(
      Number(am[1].replaceAll(".", "").replace(",", ".")) * 100,
    );
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
      errors.push(
        `${index + 1}. belgede pozitif ve geçerli bir tutar gerekli.`,
      );
      return;
    }
    rows.push({ id, date, description, amountMinor });
  });
  return { rows, errors };
}
export function buildBrief({ company, category, message, timing }) {
  return `Proje görüşmesi\n\nKurum / proje: ${company.trim() || "Belirtilmedi"}\nÇalışma alanı: ${category}\nHedef zaman: ${timing.trim() || "Birlikte belirlenecek"}\n\nİhtiyaç:\n${message.trim()}\n\nİlk görüşmede netleştirilecekler: mevcut süreç, veri kaynakları, kullanıcılar, entegrasyonlar, kapsam ve kabul ölçütleri.`;
}
