(() => {
  "use strict";
  const config = window.SITE_CONFIG;
  if (!config) return;
  const put = (selector, value) => {
    document.querySelectorAll(selector).forEach(element => {
      element.textContent = value || "";
    });
  };
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  const safeLink = value => {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      if (["https:", "http:", "file:"].includes(url.protocol)) return value;
    } catch {}
    return null;
  };
  Object.entries(config.profile).forEach(([key, value]) => {
    put(`[data-profile="${key}"]`, Array.isArray(value) ? value.join(" / ") : value);
  });
  config.hero.title.forEach((line, index) => put(`[data-hero="${index}"]`, line));
  put('[data-hero="subtitle"]', config.hero.subtitle);
  put('[data-about="heading"]', config.about.heading);
  config.about.paragraphs.forEach((line, index) => put(`[data-about="p${index}"]`, line));
  put('[data-about="learning"]', config.about.learning);
  put('[data-about="method"]', config.about.method);
  const profileMark = document.querySelector('.hero .example-mark');
  profileMark.hidden = !config.profile.example;
  if (config.about.example) {
    const mark = document.createElement("p");
    mark.className = "content-notice";
    mark.textContent = "介绍、学习方向与兴趣为示例文案，待本人替换。";
    document.querySelector(".about-copy").append(mark);
  }
  const email = config.profile.email;
  const emailValid = typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.querySelectorAll("[data-email-link]").forEach(link => {
    link.hidden = !emailValid;
    if (emailValid) link.href = "mailto:" + email;
  });
  document.querySelectorAll("[data-github-link]").forEach(link => {
    const href = safeLink(config.profile.github);
    link.hidden = !href;
    if (href) link.href = href;
  });
  const covers = {
    notes: '<div class="cover"><div class="cover-top"><span>LITTLE NOTES</span><span class="demo-badge">交互演示</span></div><div class="notes-cover-title">灵感不必，<br>转瞬即逝。<small>COLLECT. CONNECT. CREATE.</small></div><div class="mini-window"><div class="mini-toolbar"><i></i><i></i><i></i><span>little-notes / 我的灵感</span></div><div class="mini-content"><div class="mini-sidebar"><b>拾页</b><span>所有笔记</span><span>设计灵感</span><span>开发日志</span><span>生活碎片</span></div><div class="mini-paper"><small>YOUR LITTLE GARDEN</small><h4>让想法有迹可循。</h4><p>一个念头，就是一个开始。</p><div class="mini-note">先记录下来，<br>再慢慢长成一个作品。</div><p>设计 &nbsp; / &nbsp; 开发 &nbsp; / &nbsp; 灵感</p></div></div></div></div>',
    palette: '<div class="cover cover-palette"><div class="cover-top"><span>COLOR STUDIES / 02</span><span class="demo-badge">交互演示</span></div><div class="swatches"><span>#243D34</span><span>#C9DFBE</span><span>#ECE7D5</span><span>#D79E79</span></div></div>',
    focus: '<div class="cover cover-focus"><div class="cover-top"><span>A MOMENT / 03</span><span class="demo-badge">交互演示</span></div><div class="clock-illustration"><strong>05:00</strong><small>ONE THING AT A TIME</small></div></div>'
  };
  const grid = document.querySelector("#project-grid");
  config.projects.forEach(project => {
    const card = document.createElement("article");
    card.className = "project";
    const href = safeLink(project.href);
    const link = document.createElement(href ? "a" : "div");
    link.className = "project-link";
    if (href) {
      link.href = href;
      link.setAttribute("aria-label", project.title + "：打开" + (project.example ? "本地示例演示" : "项目"));
    }
    const art = document.createElement("div");
    art.setAttribute("aria-hidden", "true");
    art.innerHTML = covers[project.id] || covers.notes;
    link.append(art);
    const info = document.createElement("div");
    info.className = "project-info";
    info.innerHTML = `<div class="project-top"><h3>${escape(project.title)}</h3>${href ? '<span aria-hidden="true">↗</span>' : ''}</div><p class="project-description">${escape(project.description)}</p><div class="project-tags">${project.example ? '<span class="example-tag">示例项目</span>' : ''}${project.tags.map(tag => `<span>${escape(tag)}</span>`).join("")}</div>`;
    link.append(info);
    card.append(link);
    grid.append(card);
  });
  document.querySelector(".work-intro > p").textContent = config.projects.some(project => project.example) ? "目前这里展示的是交互示例。\n不是个人历史成果，也没有虚构的数据。" : "把好奇心落在具体的作品里。\n这里记录每一次动手的尝试。";
  const timeline = document.querySelector("#timeline");
  config.logs.forEach(entry => {
    const article = document.createElement("article");
    article.className = "entry";
    article.innerHTML = `<div class="entry-meta"><time datetime="${escape(entry.date)}">${escape(entry.date.replaceAll("-", "."))}</time><span>${escape(entry.category)}</span>${entry.example ? '<span class="example-mark">示例记录</span>' : ''}</div><h3>${escape(entry.title)}</h3><p>${escape(entry.summary)}</p>`;
    timeline.append(article);
  });
  put('[data-now="updated"]', config.now.updated);
  put('[data-now="title"]', "此刻，给好奇心一点时间。");
  put('[data-now="text"]', config.now.example ? "示例状态 · 内容为手动维护，尚待本人填写。" : "手动更新 · 不连接实时活动数据。");
  config.now.items.forEach(item => {
    const row = document.createElement("div");
    row.className = "now-item";
    row.innerHTML = `<span>${escape(item.label)}</span><p>${escape(item.text)}</p>`;
    document.querySelector("#now-list").append(row);
  });
  put('[data-contact="title"]', config.contact.title);
  put('[data-contact="text"]', config.contact.text);
  put("#year", new Date().getFullYear());
  document.title = config.seo.title;
  document.querySelector('meta[name="description"]').content = config.seo.description;
  document.querySelector('meta[property="og:title"]').content = config.seo.title;
  document.querySelector('meta[property="og:description"]').content = config.seo.description;
  if (/^https:\/\//.test(config.seo.url)) {
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = config.seo.url;
    document.head.append(canonical);
    const og = document.createElement("meta");
    og.setAttribute("property", "og:url");
    og.content = config.seo.url;
    document.head.append(og);
  }
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 20), { passive: true });
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    if (!motion.matches) {
      document.querySelectorAll(".about-grid,.about-facts,.project,.entry,.now-card,.contact").forEach(element => {
        element.classList.add("will-reveal");
        observer.observe(element);
      });
    }
    const sections = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll(".site-nav a").forEach(link => {
          if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-15% 0px -45% 0px" });
    document.querySelectorAll("#about,#work,#notes,#contact").forEach(section => sections.observe(section));
  }
})();
