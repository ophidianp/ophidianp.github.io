const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// live numbers from modrinth + github (the page shows the baked-in values until these load)
const fmt = (n) => n.toLocaleString("en-US");
const getJSON = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
const setAll = (sel, text) => document.querySelectorAll(sel).forEach((el) => (el.textContent = text));

// shared with terminal.js
const live = {
  modrinth: getJSON("https://api.modrinth.com/v2/user/ophidianp/projects"),
  github: getJSON("https://api.github.com/users/ophidianp"),
};

live.modrinth
  .then((projects) => {
    let total = 0;
    projects.forEach((p) => {
      total += p.downloads;
      const el = document.querySelector(`.pack[data-slug="${p.slug}"] .dl`);
      if (el) el.textContent = fmt(p.downloads);
    });
    setAll("#dl-count, .dl-count", fmt(total));
  })
  .catch(() => {});

live.github
  .then((u) => setAll("#repo-count, .repo-count", u.public_repos))
  .catch(() => {});

// ---------- motion: scroll reveal, staggered per group, + cursor spotlight on cards ----------
if (!reduceMotion && "IntersectionObserver" in window) {
  const groups = [
    [".stats"],
    [".section-head"],
    [".grid > .card", 0.07],
    [".rows > .row", 0.05],
    [".cta"],
    ["footer"],
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { const t = e.target; t.classList.add("in"); io.unobserve(t); setTimeout(() => t.style.removeProperty("--d"), 1400); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  groups.forEach(([sel, step]) => {
    const seen = new Map();
    document.querySelectorAll(sel).forEach((el) => {
      const parent = el.parentElement, i = seen.get(parent) || 0;
      seen.set(parent, i + 1);
      if (step) el.style.setProperty("--d", `${Math.min(i, 6) * step}s`);
      el.classList.add("reveal");
      io.observe(el);
    });
  });
}
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});
