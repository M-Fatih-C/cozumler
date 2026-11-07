import {
  createRows,
  appendRow,
  headers,
  toCsv,
  parseInvoiceRows,
  buildBrief,
} from "./demo-core.js";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
// Local navigation: native links remain useful without JavaScript.
const menu = $(".nav-menu"),
  toggle = $(".mobile-toggle");
const closeMenu = () => {
  menu.classList.remove("active");
  toggle.setAttribute("aria-expanded", "false");
};
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  menu.classList.toggle("active", open);
  toggle.setAttribute("aria-expanded", String(open));
});
$$(".nav-link").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
    toggle.focus();
  }
});
document.addEventListener("click", (e) => {
  if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
});
// Once-only, progressive scroll reveals. Visible by default and with reduced motion.
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let observer;
function reveal() {
  observer?.disconnect();
  $$(".reveal-on-scroll").forEach((el) =>
    el.classList.remove("reveal-pending"),
  );
  if (motion.matches || !("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      }),
    { rootMargin: "0px 0px 40px", threshold: 0.03 },
  );
  $$(".reveal-on-scroll").forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) {
      el.classList.add("reveal-pending");
      observer.observe(el);
    }
  });
}
reveal();
motion.addEventListener("change", reveal);
window.addEventListener("beforeprint", () => {
  observer?.disconnect();
  $$(".reveal-pending").forEach((el) => el.classList.remove("reveal-pending"));
});
// ARIA tabs with arrow / Home / End keyboard support.
const tabs = $$("[role=tab]");
function activateTab(tab) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(t.dataset.panel);
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (e) => {
    let next;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      e.preventDefault();
      activateTab(tabs[next]);
      tabs[next].focus();
    }
  });
});
function table(columns, rows) {
  const wrap = document.createElement("div");
  wrap.className = "demo-table-wrapper";
  wrap.tabIndex = 0;
  wrap.setAttribute("role", "region");
  wrap.setAttribute("aria-label", "Dönüştürülmüş örnek belge tablosu");
  const t = document.createElement("table");
  t.className = "demo-table";
  const head = t.createTHead().insertRow();
  columns.forEach((text) => {
    const cell = document.createElement("th");
    cell.scope = "col";
    cell.textContent = text;
    head.append(cell);
  });
  const body = t.createTBody();
  rows.forEach((values) => {
    const row = body.insertRow();
    values.forEach((text) => {
      row.insertCell().textContent = String(text);
    });
  });
  wrap.append(t);
  return wrap;
}
function downloadCsv(columns, rows, filename) {
  const blob = new Blob([toCsv(columns, rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob),
    link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Actual browser-side rule parsing of the supplied example text.
let invoiceRows = [];
const money = (minor) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    minor / 100,
  );
const invoiceColumns = ["Belge No", "Tarih", "Açıklama", "Tutar"];
$("#invoice-text").addEventListener("input", () => {
  invoiceRows = [];
  $("#export-invoices").hidden = true;
  $("#invoice-output").replaceChildren();
  $("#invoice-status").textContent =
    "Metin değişti. Güncel tablo için yeniden dönüştürün.";
});
const invoiceValues = () =>
  invoiceRows.map((row) => [
    row.id,
    row.date,
    row.description,
    money(row.amountMinor),
  ]);
$("#parse-invoices").addEventListener("click", () => {
  const { rows, errors } = parseInvoiceRows($("#invoice-text").value);
  invoiceRows = rows;
  $("#invoice-output").replaceChildren();
  if (rows.length)
    $("#invoice-output").append(table(invoiceColumns, invoiceValues()));
  const status = $("#invoice-status");
  status.textContent = `${rows.length} örnek belge dönüştürüldü.${errors.length ? " " + errors.join(" ") : " Tabloyu gözden geçirin."}`;
  status.classList.toggle("error", errors.length > 0);
  $("#export-invoices").hidden = !rows.length;
});
$("#export-invoices").addEventListener("click", () => {
  downloadCsv(invoiceColumns, invoiceValues(), "mfc-ornek-belgeler.csv");
  $("#invoice-status").textContent =
    `${invoiceRows.length} örnek belgenin CSV dosyası hazırlandı.`;
});
// Source-linked fixed answers: no claims of live retrieval/inference.
const answers = [
  "Sipariş kaydı ürün kodu, adet ve talep tarihi içermelidir.",
  "Stokta bulunmayan ürünler satın alma incelemesine aktarılır.",
  "Sevkiyat öncesinde ürün kodu ve adet depo görevlisi tarafından kontrol edilir.",
];
$$("[data-answer]").forEach((button) =>
  button.addEventListener("click", () => {
    const index = Number(button.dataset.answer);
    $$("[data-answer]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === button));
    });
    const p = document.createElement("p");
    p.textContent = answers[index];
    const source = document.createElement("button");
    source.type = "button";
    source.className = "source-link";
    source.textContent = `Kaynak: örnek belge, madde ${index + 1} — vurgula`;
    const highlight = () => {
      $$(".source-document li").forEach((li, i) =>
        li.classList.toggle("is-highlighted", i === index),
      );
    };
    source.addEventListener("click", highlight);
    $("#rag-answer").replaceChildren(p, source);
    highlight();
  }),
);
// The same current records drive both the visible table and CSV export.
let mode = "service";
const records = Object.fromEntries(
  Object.keys(headers).map((key) => [key, createRows(key)]),
);
function renderRecords() {
  const head = document.createElement("tr");
  headers[mode].forEach((text) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = text;
    head.append(th);
  });
  $("#record-head").replaceChildren(head);
  const body = $("#record-body");
  body.replaceChildren();
  records[mode].forEach((values) => {
    const row = document.createElement("tr");
    values.forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      row.append(td);
    });
    body.append(row);
  });
  $("#record-status").textContent =
    `${records[mode].length} örnek kayıt gösteriliyor.`;
}
$$("[data-mode]").forEach((button) =>
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    $$("[data-mode]").forEach((b) => {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    });
    renderRecords();
  }),
);
$("#add-record").addEventListener("click", () => {
  records[mode] = appendRow(records[mode], mode);
  renderRecords();
});
$("#reset-records").addEventListener("click", () => {
  records[mode] = createRows(mode);
  renderRecords();
});
$("#export-records").addEventListener("click", () => {
  downloadCsv(headers[mode], records[mode], `mfc-ornek-${mode}.csv`);
  $("#record-status").textContent =
    `Görünen ${records[mode].length} örnek kayıt CSV dosyasına alındı.`;
});
renderRecords();
const vision = [
  "Kaynak değerlendirmesi: Görüş açısı, ışık, çözünürlük ve örnek kayıt kalitesi incelenir. Bu görsel gerçek kamera akışı değildir.",
  "İşleme değerlendirmesi: İlgili nesne sınıfları, takip ihtiyacı ve değerlendirme verisi belirlenir. Yanlış tespit ve kaçırılan nesneler birlikte değerlendirilir.",
  "Çıktı değerlendirmesi: Sanal çizgi veya bölge kuralları ile sayım ve rapor tasarlanır. Kabul ölçütleri ve saha koşulları projeye göre belirlenir.",
];
$$("[data-vision]").forEach((button) =>
  button.addEventListener("click", () => {
    $$("[data-vision]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
    $("#vision-description").textContent =
      vision[Number(button.dataset.vision)];
  }),
);
// Brief preparation is local. Opening and sending an email are visitor actions.
const email = "muhammedfatihcetintas54@gmail.com";
$("#brief-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = $("#brief-message");
  message.setCustomValidity(
    message.value.trim().length < 15
      ? "İhtiyacınızı en az 15 karakterle açıklayın."
      : "",
  );
  if (!event.currentTarget.reportValidity()) return;
  const body = buildBrief({
    company: $("#brief-company").value,
    category: $("#brief-category").value,
    message: $("#brief-message").value,
    timing: $("#brief-timing").value,
  });
  $("#brief-preview").value = body;
  $("#draft-mailto").href =
    `mailto:${email}?subject=${encodeURIComponent("Yazılım ve yapay zekâ — proje görüşmesi")}&body=${encodeURIComponent(body)}`;
  $("#brief-result").hidden = false;
  $("#brief-status").textContent =
    "Taslak hazırlandı; henüz mesaj gönderilmedi. Metni gözden geçirip e-posta uygulamanızda açabilirsiniz.";
  $("#brief-preview").focus();
});
$("#copy-brief").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#brief-preview").value);
    $("#brief-status").textContent =
      "Taslak metni kopyalandı; henüz mesaj gönderilmedi.";
  } catch {
    $("#brief-preview").focus();
    $("#brief-preview").select();
    $("#brief-status").textContent =
      "Metni seçtim. Kopyalamak için Ctrl+C veya ⌘C kullanabilirsiniz.";
  }
});
// Edited notes must never leave a stale, previously generated email link.
$("#brief-form").addEventListener("input", () => {
  $("#brief-message").setCustomValidity("");
  $("#brief-result").hidden = true;
  $("#draft-mailto").removeAttribute("href");
});
