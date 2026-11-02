// interactive terminal in the hero (uses `live`, `fmt` and `getJSON` from script.js)
(() => {
  const term = document.querySelector(".term");
  const body = term.querySelector(".term-body");
  const out = term.querySelector(".term-out");
  const form = term.querySelector(".term-line");
  const input = term.querySelector(".term-input");
  const maxBtn = term.querySelector(".term-max");
  const backdrop = document.querySelector(".term-backdrop");
  const card = term.parentElement;
  const startedAt = Date.now();

  // --- output helpers ---
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const acc = (s) => `<span class="accent">${s}</span>`;
  const dim = (s) => `<span class="dim">${s}</span>`;
  const err = (s) => `<span class="err">${s}</span>`;
  const link = (url, text = url.replace(/^https?:\/\//, "").replace(/\/$/, "")) =>
    `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`;

  const print = (html = "") => {
    const line = document.createElement("div");
    line.className = "line";
    line.innerHTML = html;
    out.appendChild(line);
    body.scrollTop = body.scrollHeight;
  };

  const openUrl = (url, label) => {
    print(`opening ${link(url, label)} ...`);
    window.open(url, "_blank", "noopener");
  };

  // --- content ---
  const places = {
    salt: "https://ophidianp.github.io/Salt/",
    chlorine: "https://ophidianp.github.io/chlorine/",
    cornea: "https://ophidianp.github.io/cornea/",
    facet: "https://ophidianp.github.io/facet/",
    vibepolish: "https://vibepolish.vercel.app",
    galveston: "https://github.com/ophidianp/galveston-mines",
    swirl: "https://ophidianp.github.io/swirl_website/",
    boba: "https://ophidianp.github.io/boba_drops_page/",
    barepvp: "https://modrinth.com/modpack/barebonespvp",
    chocochips: "https://modrinth.com/modpack/vanilla-pluschocolate-chips",
    github: "https://github.com/ophidianp",
    modrinth: "https://modrinth.com/user/ophidianp",
    discord: "https://discord.gg/6RnXtN3xF",
    wca: "https://www.worldcubeassociation.org/persons/2023NEMA01",
  };

  const projects = [
    ["salt", "client", "glassy minecraft client with its own hud + mods, 1.21 to 26.3"],
    ["chlorine", "mod", "sodium-compatible performance & power mod for 26.3"],
    ["cornea", "shaderpack", "photon-inspired iris shaders for mid/low-end gpus"],
    ["facet", "web app", "speedcubing timer with a liquid glass ui + wca rules"],
    ["vibepolish", "web app", "turns messy thoughts into clean ai prompts"],
    ["galveston", "game", "procedural runner in godot, made with my team"],
    ["swirl", "website", "website for swirl"],
    ["boba", "website", "page for hack club's boba drops"],
  ];

  const files = {
    "about.txt":
      "hey, i'm oph.\n" +
      "i make minecraft stuff: a client (salt), a performance mod (chlorine),\n" +
      "a shaderpack (cornea), plus modpacks, a cube timer and the odd godot game.\n" +
      "most of it is vibe-coded with claude, codex and copilot, then tested\n" +
      "by me until it actually works.",
    "interests.txt": "minecraft · modding · shaders\nspeedcubing · game dev · hack club",
    "projects.txt": projects.map(([name]) => name).join("\n"),
    ".secret.txt": "↑ ↑ ↓ ↓ ← → ← → b a\n\n(on a phone? type it in here instead)",
  };

  const splashes = [
    "also try chlorine!",
    "now with 100% more salt!",
    "vibe-coded!",
    "sodium compatible!",
    "26.3 ready!",
    "sigma sigma boy!",
    "tested by one person!",
    "15 seconds of inspection!",
    "made with #00e371!",
    "photon-inspired!",
    "runs on a 6500 xt!",
    "no build step!",
    "sub-20 someday!",
    "ships on github pages!",
  ];

  const scramble = () => {
    const faces = "RLUDFB";
    const axis = { R: 0, L: 0, U: 1, D: 1, F: 2, B: 2 };
    const mods = ["", "'", "2"];
    const moves = [];
    while (moves.length < 20) {
      const f = faces[Math.floor(Math.random() * 6)];
      const [a, b] = [moves.at(-1)?.[0], moves.at(-2)?.[0]];
      if (f === a) continue;
      if (a && b && axis[a] === axis[f] && axis[b] === axis[f]) continue;
      moves.push(f + mods[Math.floor(Math.random() * 3)]);
    }
    return moves.join(" ");
  };

  const uptime = () => {
    const s = Math.floor((Date.now() - startedAt) / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  let reposReq;
  const repos = () => (reposReq ??= getJSON("https://api.github.com/users/ophidianp/repos?per_page=100&sort=updated"));

  // --- commands ---
  const history = [];
  const commands = {
    help: ["list commands", () => {
      print(`${Object.keys(commands).length} commands:`);
      Object.entries(commands).forEach(([name, [desc]]) => print(`  ${acc(name.padEnd(12))}${dim(esc(desc))}`));
      print();
      print(dim("tip: ↑/↓ for history, tab to autocomplete, esc to leave fullscreen"));
    }],
    whoami: ["who's this", () => print(`${acc("ophidianp")} ${dim("(oph)")}`)],
    about: ["a bit about me", () => print(files["about.txt"])],
    projects: ["things i've made", () => {
      const narrow = body.clientWidth < 520;
      projects.forEach(([name, kind, desc]) =>
        print(narrow ? `  ${acc(name)} ${dim(kind)}\n    ${desc}` : `  ${acc(name.padEnd(12))}${dim(kind.padEnd(12))}${desc}`)
      );
      print();
      print(dim("open one with: open &lt;name&gt;"));
    }],
    modpacks: ["my modrinth packs (live)", () => {
      print(dim("asking modrinth..."));
      live.modrinth
        .then((ps) => ps.forEach((p) => print(`  ${acc(esc(p.title.padEnd(22)))}${fmt(p.downloads).padStart(7)} downloads  ${link(`https://modrinth.com/modpack/${p.slug}`, "view")}`)))
        .catch(() => print(err("couldn't reach modrinth, try again later")));
    }],
    stats: ["live numbers", () => {
      Promise.allSettled([live.modrinth, live.github]).then(([m, g]) => {
        if (m.status === "fulfilled") print(`modrinth downloads  ${acc(fmt(m.value.reduce((t, p) => t + p.downloads, 0)))}`);
        if (g.status === "fulfilled") {
          print(`public repos        ${acc(g.value.public_repos)}`);
          print(`github followers    ${acc(g.value.followers)}`);
        }
        if (m.status === "rejected" && g.status === "rejected") print(err("apis are being shy right now, try again later"));
      });
    }],
    repos: ["every public repo (live)", () => {
      print(dim("asking github..."));
      repos()
        .then((rs) => rs.filter((r) => !r.fork).forEach((r) => print(`  ${link(r.html_url, r.name)}${" ".repeat(Math.max(1, 20 - r.name.length))}${dim(esc(r.description || ""))}`)))
        .catch(() => print(err("couldn't reach github, try again later")));
    }],
    stack: ["languages & tools", () => {
      print(`${acc("languages")}  java · rust · glsl · javascript · typescript · gdscript · html/css`);
      print(`${acc("tools    ")}  fabric · iris · tauri · godot · github pages · vercel`);
      print(`${acc("co-pilots")}  claude · chatgpt codex · github copilot`);
    }],
    contact: ["where to find me", () => {
      print(`github    ${link(places.github)}`);
      print(`modrinth  ${link(places.modrinth)}`);
      print(`discord   ${link(places.discord)}`);
      print(`wca       ${link(places.wca)}`);
    }],
    github: ["open my github", () => openUrl(places.github)],
    modrinth: ["open my modrinth", () => openUrl(places.modrinth)],
    discord: ["join my discord server", () => openUrl(places.discord)],
    wca: ["my official cubing results", () => openUrl(places.wca, "wca profile")],
    open: ["open a project: open <name>", ([name]) => {
      const key = (name || "").toLowerCase();
      if (places[key]) return openUrl(places[key], key);
      print(name ? err(`open: no project called '${esc(name)}'`) : "usage: open &lt;name&gt;");
      print(dim(`try: ${Object.keys(places).join(", ")}`));
    }],
    ls: ["list files", ([flag]) => {
      const names = Object.keys(files).filter((f) => flag === "-a" || !f.startsWith("."));
      print(names.map((f) => (f.startsWith(".") ? dim(f) : f)).join("  "));
    }],
    dir: ["files you can cat", ([flag]) => {
      const all = /^[/-]a$/i.test(flag || "");
      const names = Object.keys(files).filter((f) => all || !f.startsWith("."));
      print(` directory of ~/ophidianp${all ? "" : dim("  (dir /a shows hidden files)")}`);
      print();
      names.forEach((f) => {
        const name = f.startsWith(".") ? dim(f.padEnd(16)) : acc(f.padEnd(16));
        print(`  ${name}${dim(`${new TextEncoder().encode(files[f]).length} bytes`.padStart(10))}`);
      });
      print();
      print(dim(`${names.length} file(s). read one with: cat &lt;file&gt;`));
    }],
    cat: ["read a file: cat <file>", ([file]) => {
      if (!file) return print("usage: cat &lt;file&gt;  " + dim("(see dir)"));
      print(files[file] !== undefined ? esc(files[file]) : err(`cat: ${esc(file)}: no such file`));
    }],
    cd: ["change directory", () => print("cd: you're already home. ~ is where the heart is.")],
    pwd: ["print working directory", () => print("/home/ophidianp")],
    echo: ["say something", (args) => print(esc(args.join(" ")))],
    date: ["what time is it", () => print(new Date().toString())],
    history: ["what you've typed", () => history.forEach((h, i) => print(`  ${dim(String(i + 1).padStart(3))}  ${esc(h)}`))],
    neofetch: ["system info, kinda", () => neofetch()],
    scramble: ["a 3x3 wca-style scramble", () => print(acc(scramble()))],
    accent: ["change the site colour", ([color]) => {
      if (!color) {
        print(`current accent: ${acc(rainbowFrame ? "rainbow" : esc(currentAccent()))}`);
        return print(dim("usage: accent &lt;color&gt;  e.g. accent #ff4fd8, accent orange, accent rainbow, accent reset"));
      }
      if (color.toLowerCase() === "reset") {
        setAccent(null);
        return print(`accent reset to ${acc("#00e371")}`);
      }
      if (color.toLowerCase() === "rainbow") {
        setAccent("rainbow");
        return print(`accent set to ${acc("rainbow")}. ${dim("'accent reset' to go back")}`);
      }
      const value = /^[0-9a-f]{3,8}$/i.test(color) ? "#" + color : color;
      if (!CSS.supports("color", value)) return print(err(`accent: '${esc(color)}' isn't a colour`));
      setAccent(value);
      print(`accent set to ${acc(esc(value))}. ${dim("'accent reset' to go back")}`);
    }],
    splash: ["random splash text", () => print(acc(splashes[Math.floor(Math.random() * splashes.length)]))],
    coinflip: ["heads or tails", () => print(Math.random() < 0.5 ? "heads" : "tails")],
    ping: ["are you there", () => print(`pong ${dim(`(${Math.floor(Math.random() * 30) + 8}ms, trust me)`)}`)],
    uptime: ["how long you've been here", () => print(`up ${uptime()}`)],
    license: ["how my stuff is licensed", () => {
      print(`${acc("All Rights Reserved (ARR)")}. &copy; Pavan Nemani`);
      print("everything i make (this site, salt, chlorine, cornea, facet, my modpacks...) is not open source.");
      print("you can use official releases yourself, but don't copy, modify or re-upload any of it without asking.");
      print(`full text: ${link("https://github.com/ophidianp/ophidianp.github.io/blob/main/LICENSE", "LICENSE")}`);
    }],
    sudo: ["try it", () => print(err("ophidianp is not in the sudoers file. this incident will be reported."))],
    rm: ["try it", () => print("rm: nice try.")],
    fullscreen: ["toggle the big terminal", () => setExpanded(!expanded)],
    exit: ["close the terminal", () => (expanded ? setExpanded(false) : print("logout... jk, you can't leave that easily."))],
    clear: ["clear the screen", () => (out.innerHTML = "")],
  };
  const aliases = { cls: "clear", max: "fullscreen", "?": "help", info: "about", fetch: "neofetch" };

  function neofetch() {
    const creeper = ["########", "########", "#..##..#", "#..##..#", "###..###", "##....##", "##....##", "##.##.##"];
    const art = creeper.map((row) => acc([...row].map((c) => (c === "#" ? "██" : "  ")).join("")));
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const info = [
      `${acc("ophidianp")}@${acc("web")}`,
      "-------------",
      `${acc("os")}: github pages`,
      `${acc("host")}: ophidianp.github.io`,
      `${acc("shell")}: vibe-sh 1.0`,
      `${acc("uptime")}: ${uptime()}`,
      `${acc("langs")}: java, rust, glsl, js`,
      `${acc("accent")}: ${esc(accent)}`,
    ];
    art.forEach((row, i) => print(`${row}   ${info[i] || ""}`));
  }

  const run = (raw) => {
    const [name, ...args] = raw.trim().split(/\s+/);
    if (!name) return print(dim("$"));
    print(`${dim("$")} ${esc(raw)}`);
    if (isCheatCode(raw)) return cheatCode();
    const cmd = commands[name.toLowerCase()] || commands[aliases[name.toLowerCase()]];
    if (cmd) cmd[1](args);
    else print(`${err(`command not found: ${esc(name)}`)}. type ${acc("help")} for commands`);
  };

  // --- input ---
  let cursor = 0;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value;
    input.value = "";
    if (raw.trim()) history.push(raw);
    cursor = history.length;
    run(raw);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      cursor = Math.max(0, Math.min(history.length, cursor + (e.key === "ArrowUp" ? -1 : 1)));
      input.value = history[cursor] ?? "";
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    } else if (e.key === "Tab") {
      e.preventDefault();
      complete();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = "";
    }
  });

  function complete() {
    const parts = input.value.split(" ");
    const last = parts.at(-1).toLowerCase();
    let pool = Object.keys(commands);
    if (parts.length === 2) {
      pool = { open: Object.keys(places), cat: Object.keys(files), dir: ["/a"], accent: ["reset"] }[parts[0].toLowerCase()] || [];
    } else if (parts.length > 2) return;
    const hits = pool.filter((c) => c.startsWith(last));
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      input.value = parts.join(" ") + " ";
    } else if (hits.length > 1) {
      print(`${dim("$")} ${esc(input.value)}`);
      print(hits.join("  "));
    }
  }

  // click anywhere in the terminal to type (unless selecting text or clicking a link)
  body.addEventListener("click", (e) => {
    if (e.target.closest("a") || String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });

  // --- expand to an overlay ---
  let expanded = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setExpanded(on) {
    if (on === expanded) return;
    const apply = () => {
      expanded = on;
      // keep the hero from collapsing while the terminal floats above it
      card.style.minHeight = on ? card.offsetHeight + "px" : "";
      term.classList.toggle("expanded", on);
      backdrop.classList.toggle("open", on);
      document.body.classList.toggle("no-scroll", on);
      maxBtn.setAttribute("aria-label", on ? "shrink terminal" : "expand terminal");
      body.scrollTop = body.scrollHeight;
    };
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
    else apply();
    if (on) input.focus({ preventScroll: true });
  }

  // --- accent colour (a colour, "rainbow", or null for the default) ---
  const root = document.documentElement;
  const probe = document.createElement("i");
  let rainbowFrame = 0;

  const currentAccent = () => getComputedStyle(root).getPropertyValue("--accent").trim();

  // dark accents (like blue) get white button text, bright ones get near-black
  function updateOnAccent() {
    probe.style.color = currentAccent();
    document.body.appendChild(probe);
    const [r, g, b] = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
    probe.remove();
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    root.style.setProperty("--on-accent", luminance > 0.5 ? "#03130a" : "#ffffff");
  }

  function startRainbow() {
    root.classList.add("rainbow");
    let lastHue = -1;
    const tick = (now) => {
      // full cycle every ~4s, in 3° steps so we don't restyle the page every frame
      const hue = (Math.round(now / 36) * 3) % 360;
      if (hue !== lastHue) {
        lastHue = hue;
        root.style.setProperty("--accent", `hsl(${hue} 100% 55%)`);
        updateOnAccent();
      }
      rainbowFrame = requestAnimationFrame(tick);
    };
    rainbowFrame = requestAnimationFrame(tick);
  }

  function setAccent(value) {
    cancelAnimationFrame(rainbowFrame);
    rainbowFrame = 0;
    root.classList.remove("rainbow");
    if (value === "rainbow") startRainbow();
    else if (value) root.style.setProperty("--accent", value);
    else root.style.removeProperty("--accent");
    updateOnAccent();
    try {
      if (value) localStorage.setItem("accent", value);
      else localStorage.removeItem("accent");
    } catch (e) {}
  }

  try {
    if (localStorage.getItem("accent") === "rainbow") startRainbow();
  } catch (e) {}
  updateOnAccent();

  // --- the secret: ↑ ↑ ↓ ↓ ← → ← → b a ---
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let progress = 0;

  // typed version for phones: "↑↑↓↓←→←→ba" or "up up down down left right left right b a"
  function isCheatCode(raw) {
    const words = { up: "↑", down: "↓", left: "←", right: "→" };
    const flat = raw.toLowerCase().replace(/up|down|left|right/g, (w) => words[w]).replace(/[\s,]/g, "");
    return flat === "↑↑↓↓←→←→ba";
  }

  document.addEventListener("keydown", (e) => {
    if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === code[progress]) progress++;
    else if (key === "ArrowUp") progress = progress === 2 ? 2 : 1; // ↑↑↑ still counts
    else progress = 0;
    if (progress < code.length) return;
    progress = 0;
    // the arrows and the b may have messed with the terminal input
    if (document.activeElement === input) input.value = "";
    e.preventDefault();
    cheatCode();
  });

  function cheatCode() {
    setAccent("rainbow");
    print(`${acc("cheat code accepted. rainbow mode: on")} ${dim("('accent reset' to turn it off)")}`);
    showToast();
    if (!reduceMotion) blockRain();
  }

  function showToast() {
    document.querySelector(".toast")?.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = `<span class="toast-block" aria-hidden="true"></span>
      <span><b>secret unlocked!</b><small>you know the code. respect.</small></span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // blocks fall from the sky, minecraft-style
  function blockRain() {
    const canvas = document.createElement("canvas");
    canvas.className = "block-rain";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = innerWidth * dpr);
    const h = (canvas.height = innerHeight * dpr);
    // minecraft-ish blocks, plus rainbow ones to match rainbow mode
    const palette = ["#5d9b3a", "#8b5a2b", "#8a8a8a", "#4fe0d0", "#f2c94c"];
    const pickColor = () =>
      Math.random() < 0.45 ? `hsl(${Math.floor(Math.random() * 360)} 100% 55%)` : palette[Math.floor(Math.random() * palette.length)];

    const blocks = Array.from({ length: 140 }, () => ({
      x: Math.random() * w,
      y: -Math.random() * h - 40 * dpr,
      size: (10 + Math.random() * 14) * dpr,
      vx: (Math.random() - 0.5) * 2 * dpr,
      vy: (2 + Math.random() * 4) * dpr,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.15,
      color: pickColor(),
    }));

    const start = performance.now();
    let last = start;
    const frame = (now) => {
      const t = now - start;
      // physics is tuned for 60fps; scale by elapsed time so 144hz screens don't fast-forward
      const dt = Math.min(3, (now - last) / (1000 / 60));
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = t > 3500 ? Math.max(0, 1 - (t - 3500) / 800) : 1;
      blocks.forEach((b) => {
        b.vy += 0.12 * dpr * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.spin * dt;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        const s = b.size;
        ctx.fillStyle = b.color;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        // pixel shading: light top-left, dark bottom-right
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(-s / 2, -s / 2, s, s / 4);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(-s / 2, s / 4, s, s / 4);
        ctx.restore();
      });
      if (t < 4300) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }

  maxBtn.addEventListener("click", () => setExpanded(!expanded));
  backdrop.addEventListener("click", () => setExpanded(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && expanded) setExpanded(false);
  });
})();
