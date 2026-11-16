/* konut-kat-cephe — Konut Kat Cephe — çatılı bina cephesinde kat seçimi, katın daire kartları (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Solda çatılı bir bina cephesi: her kat bir satır (kat numarası + dairelerin durum renginde pencere kareleri); kat seçilince sağda o katın daire kartları (ad, durum rozeti, oda, m², cephe, açıklama, fiyat). Üstte durum lejantı ve «yalnız müsait» süzgeci; açılışta müsait dairesi olan en üst kat. Kayıt alanları: `kat` · `oda` · `m2` · `yon` · `fiyat` · `durum` (musait | rezerve | satildi). JS yokken tüm katların kartları başlıklı gruplar hâlinde alt alta, kat satırları gruplara bağlantı.
   Üretici: scripts/modul-fabrika (aile module) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: desing: ust · baslik · metin · img · img2 · cta_ad/cta_url · cta2_ad/cta2_url; data (maddeler): [{ ikon?, baslik, metin?, url? }] — metinler dil sözlüğü. */
const P = "modulex-konut-kat-cephe";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: module --- */
const yeniMadde = veri.map((o) => ({
  ikon: ikonAd(ilk(o, ["ikon", "icon"])), baslik: metinAl(o, ["baslik", "name", "title"]),
  metin: metinAl(o, ["metin", "text", "description", "spot"]), url: href(ilk(o, ["url", "link"])),
})).filter((k) => k.baslik);
/* module-1 eski şeması: name2/spot2/icon2 … name4 → madde */
const eskiMadde = [2, 3, 4].map((n) => ({ ikon: ikonAd(des["icon" + n]), baslik: metinAl(des, ["name" + n]), metin: metinAl(des, ["spot" + n]), url: "" })).filter((k) => k.baslik);
const kayitlar = yeniMadde.length ? yeniMadde : eskiMadde;
const G1 = medyaUrl(ilk(des, ["img", "image"]));
const G2 = medyaUrl(ilk(des, ["img2", "image2"]));
const gH = (src, s, w, h) => (src ? `<img class="${P}-${s}" src="${esc(src)}" alt="" width="${w || 1200}" height="${h || 900}" loading="lazy" decoding="async" />` : "");
const ustH = (B) => (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "");
const basH = (B) => (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "");
const metH = (B) => (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "");
const listeH = (ic) => (ic ? `<ul class="${P}-maddeler" role="list">${ic}</ul>` : "");
const maddeVar = (k, i) => `<li class="${P}-madde">${ikonH(k.ikon || "check_circle", `${P}-mikon`)}<div class="${P}-myazi"><h3 class="${P}-mbaslik">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.baslik)}</a>` : esc(k.baslik)}</h3>${k.metin ? `<p class="${P}-mmetin">${satirlar(k.metin)}</p>` : ""}</div></li>`;
/* --- modül: konut-kat-cephe --- */
const kart = () => "";
const sar = (ic, A, B) => {
    const R = yeniMadde.length ? veri.filter((o) => metinAl(o, ["baslik", "name", "title"])) : [];
    const x = (i, ks) => metinAl(R[i] || {}, ks);
    const sy = (i, ks) => {
      const v = ilk(R[i] || {}, ks);
      if (typeof v === "number") return v;
      let t = pick(v).replace(/[^\d.,]/g, "");
      t = /,\d{1,2}$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
      const n = t ? Number(t) : NaN;
      return Number.isFinite(n) ? n : NaN;
    };
    const PB = /^[A-Za-z]{3}$/.test(metinAl(des, ["paraBirimi"])) ? metinAl(des, ["paraBirimi"]).toUpperCase() : "";
    const para = (v) => { try { return new Intl.NumberFormat(dil || undefined, PB ? { style: "currency", currency: PB, maximumFractionDigits: 0 } : { maximumFractionDigits: 0 }).format(v); } catch (e) { return String(v); } };
    const DK = ["musait", "rezerve", "satildi"];
    const DZ = { musait: metinAl(des, ["musaitAd"]), rezerve: metinAl(des, ["rezerveAd"]), satildi: metinAl(des, ["satildiAd"]) };
    const KA = metinAl(des, ["katAd"]);
    const MA = metinAl(des, ["m2Ad"]) || "m²";
    const YA = metinAl(des, ["yalnizAd"]);
    const BL = metinAl(des, ["blokAd"]);
    const D = A.map((k, i) => {
      const kt = sy(i, ["kat", "floor"]);
      const dr = x(i, ["durum", "status"]).toLowerCase();
      return { k, kat: Number.isFinite(kt) ? kt : null, d: DK.includes(dr) ? dr : "", oda: x(i, ["oda", "rooms", "tip"]), m2: sy(i, ["m2", "alan", "area"]), f: sy(i, ["fiyat", "price"]), yon: x(i, ["yon", "cephe"]) };
    });
    const KT = [];
    D.forEach((d) => { const key = d.kat === null ? "x" : String(d.kat); let g = KT.find((z) => z.key === key); if (!g) { g = { key, kat: d.kat, L: [] }; KT.push(g); } g.L.push(d); });
    const sv = (z) => (z.kat === null ? -1e9 : z.kat);
    KT.sort((a, b) => sv(b) - sv(a));
    const cok = KT.length > 1;
    const id = (t, j) => `${P}-{{id}}-${t}${j}`;
    const katAdi = (g) => (g.kat === null ? "" : `${KA ? `${esc(KA)} ` : ""}<bdi>${sayiBicim(g.kat, 0)}</bdi>`);
    const daire = (d) => {
      const oz = [d.oda ? `<li>${ikonH("bed", `${P}-oik`)}<bdi dir="ltr">${esc(d.oda)}</bdi></li>` : "", Number.isFinite(d.m2) ? `<li>${ikonH("square_foot", `${P}-oik`)}<bdi dir="ltr">${sayiBicim(d.m2, 0)} ${esc(MA)}</bdi></li>` : "", d.yon ? `<li>${ikonH("explore", `${P}-oik`)}${esc(d.yon)}</li>` : ""].join("");
      return `<li class="${P}-daire" data-d="${d.d || "yok"}"><div class="${P}-dust"><h4 class="${P}-dad">${d.k.url ? `<a class="${P}-bag" href="${esc(d.k.url)}">${esc(d.k.baslik)}</a>` : esc(d.k.baslik)}</h4>${d.d && DZ[d.d] ? `<span class="${P}-durum ${P}-durum--${d.d}">${esc(DZ[d.d])}</span>` : ""}</div>${oz ? `<ul class="${P}-ozellik" role="list">${oz}</ul>` : ""}${d.k.metin ? `<p class="${P}-dmetin">${satirlar(d.k.metin)}</p>` : ""}${Number.isFinite(d.f) ? `<p class="${P}-dfiyat"><bdi>${esc(para(d.f))}</bdi></p>` : ""}</li>`;
    };
    const bina = cok ? `<div class="${P}-bina"><span class="${P}-cati" aria-hidden="true"></span>${BL ? `<p class="${P}-blok">${esc(BL)}</p>` : ""}<div class="${P}-katlar" role="tablist" aria-orientation="vertical" aria-label="${esc(BL || KA || B.baslik)}">${KT.map((g, j) => `<a class="${P}-kat" role="tab" href="#${id("p", j)}" id="${id("t", j)}" aria-controls="${id("p", j)}" aria-selected="${j === 0}"${j ? ' tabindex="-1"' : ""} data-kat="${j}" data-musait="${g.L.some((d) => d.d === "musait") ? 1 : 0}"><span class="${P}-kno">${g.kat === null ? "—" : `<span class="${P}-gizli">${esc(KA)} </span><bdi>${sayiBicim(g.kat, 0)}</bdi>`}</span><span class="${P}-pencereler" aria-hidden="true">${g.L.map((d) => `<i class="${P}-pen ${P}-pen--${d.d || "yok"}"></i>`).join("")}</span></a>`).join("")}</div><span class="${P}-zemin" aria-hidden="true"></span></div>` : "";
    const panel = (g, j) => `<div class="${P}-kpanel"${cok ? ` role="tabpanel" id="${id("p", j)}" aria-labelledby="${id("t", j)}" tabindex="0"` : ""}>${g.kat !== null ? `<h3 class="${P}-kbas">${katAdi(g)}</h3>` : ""}<ul class="${P}-daireler" role="list">${g.L.map(daire).join("")}</ul></div>`;
    const var1 = DK.filter((k) => DZ[k] && D.some((d) => d.d === k));
    const lejant = var1.length ? `<div class="${P}-lejant">${var1.map((k) => `<span class="${P}-lj"><i class="${P}-pen ${P}-pen--${k}" aria-hidden="true"></i>${esc(DZ[k])}</span>`).join("")}${YA && D.some((d) => d.d === "musait") ? `<label class="${P}-yalniz" hidden><input class="${P}-ykutu" type="checkbox" data-yalniz />${esc(YA)}</label>` : ""}</div>` : "";
    return `<div class="${P}-giris">${ustH(B)}${basH(B)}${metH(B)}</div>${lejant}<div class="${P}-site${cok ? "" : ` ${P}-site--tek`}">${bina}<div class="${P}-paneller">${KT.map(panel).join("")}</div></div>${ctaHtml()}`;
  };
const B = { ust: metinAl(des, ["ust","title","badge"]), baslik: metinAl(des, ["baslik","name"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !B.baslik && !B.metin;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = "";
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
