// live numbers from modrinth + github (the page shows the baked-in values until these load)
const fmt = (n) => n.toLocaleString("en-US");
const getJSON = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

getJSON("https://api.modrinth.com/v2/user/ophidianp/projects")
  .then((projects) => {
    let total = 0;
    projects.forEach((p) => {
      total += p.downloads;
      const el = document.querySelector(`.pack[data-slug="${p.slug}"] .dl`);
      if (el) el.textContent = fmt(p.downloads);
    });
    document.getElementById("dl-count").textContent = fmt(total);
  })
  .catch(() => {});

getJSON("https://api.github.com/users/ophidianp")
  .then((u) => {
    document.getElementById("repo-count").textContent = u.public_repos;
  })
  .catch(() => {});
