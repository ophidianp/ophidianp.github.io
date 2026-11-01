const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

// typing effect in the hero
const typed = document.querySelector(".typed");
if (typed && !reduceMotion) {
  const words = typed.dataset.words.split("|");
  let w = 0;
  let i = words[0].length;
  let deleting = true;

  const tick = () => {
    i += deleting ? -1 : 1;
    typed.textContent = words[w].slice(0, i);

    let delay = deleting ? 45 : 85;
    if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 300;
    } else if (!deleting && i === words[w].length) {
      deleting = true;
      delay = 1800;
    }
    setTimeout(tick, delay);
  };
  setTimeout(tick, 1800);
}

// background glow follows the cursor
const glow = document.querySelector(".glow");
window.addEventListener("pointermove", (e) => {
  glow.style.setProperty("--mx", e.clientX + "px");
  glow.style.setProperty("--my", e.clientY + "px");
});

// spotlight on cards
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--x", e.clientX - r.left + "px");
    card.style.setProperty("--y", e.clientY - r.top + "px");
  });
});

// reveal sections on scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// live numbers from modrinth + github (falls back to the baked-in values)
const fmt = (n) => n.toLocaleString("en-US");
const getJSON = (url) => fetch(url).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));

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
    document.getElementById("dl-count").textContent = fmt(total);
    document.getElementById("stat-dl").textContent = fmt(total);
  })
  .catch(() => {});

live.github
  .then((u) => {
    document.getElementById("repo-count").textContent = u.public_repos;
  })
  .catch(() => {});
