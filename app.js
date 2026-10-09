import { projects } from "./projects.js";
import { wallpapers } from "./wallpapers.js";

const flavors = [["mocha","mauve"],["macchiato","mauve"],["frappe","mauve"],["latte","mauve"]];
const $ = (s, r = document) => r.querySelector(s);
const esc = s => s.replace(/[&<>]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c]));

/* projects */
const plist = $("#plist");
plist.innerHTML = projects.map((p, i) => `<button class="proj ${p.c}" role="option" data-i="${i}"><span class="mk" aria-hidden="true">❯</span><span>${esc(p.n)}/</span><small># ${esc(p.d)}</small></button>`).join("");
plist.insertAdjacentHTML("afterbegin", '<div aria-hidden="true" style="margin-bottom:6px"><span class="prm">❯</span> <span class="cmdt">ls -1 projects/</span></div>');
function pick(i) {
  const p = projects[i];
  plist.querySelectorAll(".proj").forEach((b, j) => b.setAttribute("aria-selected", j === i));
  $("#dpath").textContent = "kitty — ~/projects/" + p.repo;
  $("#detail").innerHTML = `<div><span class="prm">❯</span> <span class="cmdt">cat README.md</span></div><h2 class="big ${p.c}" style="margin-top:8px">${esc(p.n)}</h2><div style="max-width:60ch">${esc(p.t)}</div><ul class="tags">${p.s.map(x => `<li>${esc(x)}</li>`).join("")}</ul>${p.link ? `<div style="margin-top:10px"><a href="${p.link}">github repo</a></div>` : ""}`;
}
plist.addEventListener("click", e => { const b = e.target.closest(".proj"); if (b) pick(+b.dataset.i); });
pick(0);

/* workspaces */
const spaces = [...document.querySelectorAll(".space")];
const tabs = [...document.querySelectorAll(".ws")];
function focusWin(w) { w.parentElement.parentElement.querySelectorAll(".win").forEach(x => x.classList.toggle("act", x === w)); }
let cur = 1;
function go(n) {
  if (n === cur) return;
  const next = spaces[n - 1];
  next.classList.remove("from-l", "from-r");
  void next.offsetWidth; // restart the animation if the user switches quickly
  next.classList.add(n > cur ? "from-r" : "from-l");
  cur = n;
  spaces.forEach((s, i) => s.classList.toggle("on", i === n - 1));
  tabs.forEach((t, i) => t.setAttribute("aria-selected", i === n - 1));
  const wins = spaces[n - 1].querySelectorAll(".win");
  wins.forEach((w, i) => w.classList.toggle("act", i === 0));
}
$("#tabs").addEventListener("click", e => { const b = e.target.closest(".ws"); if (b) go(+b.dataset.ws); });
document.addEventListener("keydown", e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "1" || e.key === "2") go(+e.key);
  if (spaces[1].classList.contains("on") && ["j","k","ArrowDown","ArrowUp"].includes(e.key) && !e.target.closest("#ddmenu")) {
    e.preventDefault();
    const i = +plist.querySelector('[aria-selected="true"]').dataset.i;
    pick((i + (e.key === "j" || e.key === "ArrowDown" ? 1 : projects.length - 1)) % projects.length);
  }
});
/* focus follows mouse */
const follow = e => { const w = e.target.closest(".win"); if (w) w.closest(".space").querySelectorAll(".win").forEach(x => x.classList.toggle("act", x === w)); };
document.addEventListener("mouseover", follow);
document.addEventListener("focusin", follow);

/* catppuccin flavors */
const swatch = { mocha:"#cba6f7", macchiato:"#c6a0f6", frappe:"#ca9ee6", latte:"#8839ef" };
const menus = [];
function dropdown(root, label, items, onPick, footer = "") {
  root.innerHTML = `<button class="th" aria-haspopup="listbox" aria-expanded="false" aria-label="${label}"><i></i><span></span> ▾</button><div class="menu" role="listbox" aria-label="${label}" hidden></div>`;
  const btn = $("button", root), menu = $(".menu", root);
  menu.innerHTML = items.map(([id, name, dot]) => `<button class="th" role="option" data-id="${id}" aria-selected="false">${dot ? `<i style="background:${dot}"></i>` : ""}${name}</button>`).join("") + footer;
  const toggle = open => { menu.hidden = !open; btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", () => toggle(menu.hidden));
  menu.addEventListener("click", e => { const b = e.target.closest(".th"); if (b) { toggle(false); btn.focus(); onPick(b.dataset.id); } });
  menus.push(toggle);
  return { set(id, dot) {
    const it = items.find(x => x[0] === id); if (!it) return;
    $("span", btn).textContent = it[1]; $("i", btn).style.background = dot || it[2] || "var(--sub)";
    menu.querySelectorAll(".th").forEach(b => { const on = b.dataset.id === id; b.setAttribute("aria-selected", on); b.style.color = on ? "var(--accent)" : ""; });
  } };
}
document.addEventListener("click", e => { if (!e.target.closest(".dd")) menus.forEach(t => t(false)); });
document.addEventListener("keydown", e => { if (e.key === "Escape") menus.forEach(t => t(false)); });

/* catppuccin flavors */
const flavorDD = dropdown($("#flavors"), "Theme", flavors.map(([f]) => [f, f, swatch[f]]), flavor);
function flavor(f) {
  document.documentElement.dataset.flavor = f; flavorDD.set(f);
  try { localStorage.setItem("flavor", f); } catch {}
}
let f0 = "mocha"; // read before flavor() runs, since flavor() saves its argument
try { const f = localStorage.getItem("flavor"); if (swatch[f]) f0 = f; } catch {}
flavor(f0);

/* wallpapers: files listed in wallpapers.js.
   Photos keep their own colors; a veil tinted by the active flavor (see .veil in style.css) blends them in. */
const wall = $("#wall");
const showImg = url => { wall.innerHTML = `<div style="background:url('${url}') center/cover"></div><div class="veil"></div>`; };
const wpDD = dropdown($("#wpdd"), "Wallpaper", wallpapers.map(w => [w.id, w.label]), setWall,
  '<div class="credit">wallpapers from <a href="https://github.com/orangci/walls-catppuccin-mocha" target="_blank" rel="noopener">orangci/walls-catppuccin-mocha</a></div>');
function setWall(id) {
  const w = wallpapers.find(x => x.id === id) || wallpapers[0];
  showImg(w.src); wpDD.set(w.id, "var(--sub)");
  try { localStorage.setItem("wall", w.id); } catch {}
}
let w0; try { w0 = localStorage.getItem("wall"); } catch {}
setWall(w0);

/* first launch */
(async () => {
  const root = document.documentElement;
  if (!root.classList.contains("booting")) return;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  let skipped = false;
  const wins = [...spaces[0].querySelectorAll(".win")];
  const cmds = [...spaces[0].querySelectorAll(".cmd .typed")];
  const full = cmds.map(c => c.textContent);
  document.querySelectorAll(".out .kv > *").forEach((el, i) => el.style.setProperty("--i", i % 7));
  const finish = () => {
    skipped = true; root.classList.remove("booting", "chrome-hidden");
    cmds.forEach((c, i) => c.textContent = full[i]);
    spaces[0].querySelectorAll(".cmd .cur").forEach(c => c.remove());
    spaces[0].querySelectorAll(".out").forEach(o => o.classList.add("show"));
    ["keydown", "pointerdown"].forEach(t => removeEventListener(t, finish));
  };
  ["keydown", "pointerdown"].forEach(t => addEventListener(t, finish, { once: true }));
  cmds.forEach(c => c.textContent = "");
  await sleep(150);
  root.classList.remove("chrome-hidden");
  await sleep(300);
  for (const w of wins) {
    if (skipped) return;
    w.classList.add("in");
    await sleep(120);
    for (const el of w.querySelectorAll(".cmd, .out")) {
      if (skipped) return;
      if (el.classList.contains("cmd")) {
        const t = el.querySelector(".typed"), txt = full[cmds.indexOf(t)];
        const cur = Object.assign(document.createElement("span"), { className: "cur" });
        el.append(cur);
        for (const ch of txt) { if (skipped) return; t.textContent += ch; await sleep(22 + Math.random() * 26); }
        await sleep(90); cur.remove();
      } else { el.classList.add("show"); await sleep(el.querySelector(".kv") || el.classList.contains("kv") || el.classList.contains("sw") ? 300 : 150); }
    }
  }
  if (!skipped) finish();
})();

/* intro animation toggle (read again by the inline script in index.html on the next load) */
const introBtn = $("#introbtn");
function setIntro(on) {
  introBtn.setAttribute("aria-pressed", on); $("b", introBtn).textContent = on ? "on" : "off";
  introBtn.style.color = on ? "" : "var(--overlay)";
  try { localStorage.setItem("intro", on ? "on" : "off"); } catch {}
}
introBtn.addEventListener("click", () => setIntro(introBtn.getAttribute("aria-pressed") !== "true"));
try { setIntro(localStorage.getItem("intro") !== "off"); } catch {}

/* clock */
const tick = () => { $("#clock").textContent = new Date().toLocaleString("en-GB", { weekday:"short", day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }).replace(",", ""); };
tick(); setInterval(tick, 20000);

/* copy */
$("#copybtn").addEventListener("click", async () => {
  const b = $("#copybtn");
  try { await navigator.clipboard.writeText($("#mail").textContent); b.textContent = "copied"; } catch { const r = document.createRange(); r.selectNodeContents($("#mail")); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = "selected"; }
  setTimeout(() => b.textContent = "copy", 1800);
});
