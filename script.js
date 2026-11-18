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
