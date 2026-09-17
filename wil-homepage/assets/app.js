/* ============================================================
   WIL © homepage — 双语内容与渲染
   所有可编辑内容集中在本文件的 COPY 数据对象
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 内容数据（中 / EN） ---------- */
  const COPY = {
    zh: {
      eyebrow: "艺术 × 神经科学",
      name: "王悦为",
      nameEn: "Wang Yuewei",
      alias: "LIA · WIL",
      role: "智能医学工程 · 脑机接口方向 · 大一",
      intro:
        "嗨，我是王悦为。我是智能医学工程（<strong>脑机接口</strong>方向）的大一学生，业余喜欢绘画、舞蹈、摄影。热衷记录生活，也喜欢研究生物学与人文艺术。很高兴在这里认识你。",
      cta: "认识我一下",
      marquee: ["绘画", "舞蹈", "摄影", "音乐", "电影", "脑机接口", "生物学", "人文艺术"],
      nav: { about: "关于", hobbies: "兴趣", growing: "进行中", contact: "联系" },
      aboutTag: "ABOUT / 关于",
      aboutH2: "一个正在<em>生长</em>的 08 后",
      aboutSub: "从成都到深圳，从艺术到科学，随时准备被新的可能性击中。",
      longIntro:
        "我喜欢在两种语言里切换——<strong>一支画笔</strong>和一段代码，记录舞蹈律动的同时，也想读懂大脑的电波。生活与学习，都是我观察世界的镜头。",
      aboutMeta: ["记录生活", "生物学", "人文艺术"],
      factTitle: "个人档案 / PROFILE",
      facts: [
        { k: "出生", v: "2008.04.23" },
        { k: "家乡", v: "四川成都" },
        { k: "常居", v: "广东深圳" },
        { k: "学校", v: "天津大学香港理工大学深圳未来技术学院" },
        { k: "专业", v: "智能医学工程（脑机接口方向）" },
      ],
      hobbiesTag: "HOBBIES / 兴趣",
      hobbiesH2: "让生活<em>有点颜色</em>",
      hobbiesSub: "文学艺术相关 · 点击一下，感受我随时上头的节奏。",
      hobbies: [
        { c: "绘画", e: "painting" },
        { c: "舞蹈", e: "dance" },
        { c: "摄影", e: "photography" },
        { c: "音乐", e: "music" },
        { c: "电影", e: "film" },
      ],
      growingTag: "WIP / 进行中",
      growingH2: "还有<em>惊喜</em>在路上",
      growingSub: "技能、方向与项目还在慢慢长出来，欢迎常回来看看。",
      growing: [
        {
          no: "01",
          title: "技能学习",
          desc: "正在解锁新的工具与方向，边学边玩，敬请期待。",
          badge: "正在生长",
        },
        {
          no: "02",
          title: "项目经历",
          desc: "第一个正经作品正在酝酿里，出炉一定会大声告诉你。",
          badge: "正在生长",
        },
        {
          no: "03",
          title: "更多可能",
          desc: "这里永远给下一个想法留着位置。",
          badge: "敬请期待",
        },
      ],
      contactTag: "CONTACT / 联系",
      contactH2: "来和我<em>聊聊</em>",
      contactSub: "无论是一幅画、一支舞，还是一个有趣的想法，都欢迎找我。",
      contact: [
        { k: "邮箱 EMAIL", v: "wil_19780117@tju.edu.cn", href: "mailto:wil_19780117@tju.edu.cn", tap: "点我写信" },
        { k: "QQ", v: "3944174406", href: "javascript:;", tap: "来看看" },
        { k: "微信 WECHAT", v: "Wil-2t", href: "javascript:;", tap: "报上名号" },
      ],
      footer: "© 2026 王悦为 · 保持好奇，持续创造",
      footerNote: "Designed in black / red / white",
      githubSoon: "GitHub 即将上线",
    },

    en: {
      eyebrow: "ART × NEUROSCIENCE",
      name: "Wang Yuewei",
      nameEn: "Wang Yuewei",
      alias: "LIA · WIL",
      role: "Intelligent Medical Eng. · BCI · Freshman",
      intro:
        "Hi, I'm Lia. A freshman in <strong>Intelligent Medical Engineering</strong> (Brain-Computer Interface). Off the clock I paint, dance and shoot photos. I love documenting life and digging into biology and the humanities. Glad to meet you here.",
      cta: "Say hello",
      marquee: ["Painting", "Dance", "Photography", "Music", "Film", "BCI", "Biology", "Humanities"],
      nav: { about: "About", hobbies: "Hobbies", growing: "WIP", contact: "Contact" },
      aboutTag: "ABOUT / ABOUT",
      aboutH2: "A <em>rising</em> Gen-Z",
      aboutSub: "From Chengdu to Shenzhen, from art to science — always ready to be struck by new possibilities.",
      longIntro:
        "I love switching between two languages — a <strong>paintbrush</strong> and a line of code. Chasing the rhythm of dance while trying to read the brain's electric waves. Life and study are both lenses for how I see the world.",
      aboutMeta: ["Documenting life", "Biology", "Humanities"],
      factTitle: "PROFILE / PROFILE",
      facts: [
        { k: "Born", v: "2008.04.23" },
        { k: "Hometown", v: "Chengdu, Sichuan" },
        { k: "Based in", v: "Shenzhen, Guangdong" },
        { k: "School", v: "Shenzhen Future Tech Institute, TJU & PolyU" },
        { k: "Major", v: "Intelligent Medical Eng. (BCI)" },
      ],
      hobbiesTag: "HOBBIES / HOBBIES",
      hobbiesH2: "A dash of <em>color</em>",
      hobbiesSub: "Arts & humanities — tap one and feel the vibe.",
      hobbies: [
        { c: "Painting", e: "绘画" },
        { c: "Dance", e: "舞蹈" },
        { c: "Photography", e: "摄影" },
        { c: "Music", e: "音乐" },
        { c: "Film", e: "电影" },
      ],
      growingTag: "WIP / WIP",
      growingH2: "Surprises <em>on the way</em>",
      growingSub: "Skills, directions and projects are still growing — come back soon.",
      growing: [
        {
          no: "01",
          title: "Skills",
          desc: "Unlocking new tools and directions, learning while playing. Stay tuned.",
          badge: "GROWING",
        },
        {
          no: "02",
          title: "Projects",
          desc: "My first real project is brewed in the lab — I'll shout it out when it's ready.",
          badge: "GROWING",
        },
        {
          no: "03",
          title: "More to come",
          desc: "There's always a spot left for the next idea here.",
          badge: "SOON",
        },
      ],
      contactTag: "CONTACT / CONTACT",
      contactH2: "Let's <em>talk</em>",
      contactSub: "A painting, a dance, or just a fun idea — I'm all ears.",
      contact: [
        { k: "EMAIL", v: "wil_19780117@tju.edu.cn", href: "mailto:wil_19780117@tju.edu.cn", tap: "Write to me" },
        { k: "QQ", v: "3944174406", href: "javascript:;", tap: "Say hi" },
        { k: "WECHAT", v: "Wil-2t", href: "javascript:;", tap: "Add me" },
      ],
      footer: "© 2026 Wang Yuewei · Stay curious, keep creating",
      footerNote: "Designed in black / red / white",
      githubSoon: "GitHub — coming soon",
    },
  };

  let lang = "zh";

  const $ = (sel) => document.querySelector(sel);

  /* ---------- 渲染 ---------- */
  function render() {
    const t = COPY[lang];

    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = `${t.name} · ${lang === "zh" ? "个人主页" : "Homepage"}`;

    $("#brand-name").textContent = "wil";
    $("#eyebrow").textContent = t.eyebrow;
    $("#name-cn").textContent = t.name;
    $("#alias").textContent = t.alias;
    $("#role").textContent = t.role;
    $("#intro").innerHTML = t.intro;
    $("#cta").textContent = t.cta;

    $("#nav-about").textContent = t.nav.about;
    $("#nav-hobbies").textContent = t.nav.hobbies;
    $("#nav-growing").textContent = t.nav.growing;
    $("#nav-contact").textContent = t.nav.contact;

    // 跑马灯：复制两份实现无缝循环
    const words = t.marquee.map((w) => `<span>${w}</span>`).join("");
    $("#marquee-track").innerHTML = `<div class="marquee__group">${words}</div><div class="marquee__group" aria-hidden="true">${words}</div>`;
    $("#marquee-track-2").innerHTML = `<div class="marquee__group">${words}</div><div class="marquee__group" aria-hidden="true">${words}</div>`;

    // 关于
    $("#about-tag").textContent = t.aboutTag;
    $("#about-h2").innerHTML = t.aboutH2;
    $("#about-sub").textContent = t.aboutSub;
    $("#long-intro").innerHTML = t.longIntro;
    $("#about-meta").innerHTML = [
      `<span class="chip"><i>◆</i>${t.aboutMeta[0]}</span>`,
      `<span class="chip"><i>◆</i>${t.aboutMeta[1]}</span>`,
      `<span class="chip"><i>◆</i>${t.aboutMeta[2]}</span>`,
    ].join("");
    $("#fact-title").textContent = t.factTitle;
    $("#fact-list").innerHTML = t.facts
      .map((f) => `<div class="fact-row"><dt>${f.k}</dt><dd>${f.v}</dd></div>`)
      .join("");

    // 兴趣
    $("#hobbies-tag").textContent = t.hobbiesTag;
    $("#hobbies-h2").innerHTML = t.hobbiesH2;
    $("#hobbies-sub").textContent = t.hobbiesSub;
    $("#hobbies").innerHTML = t.hobbies
      .map((h) => `<button class="hobby" type="button"><span>${h.c}</span><span class="en">${h.e}</span></button>`)
      .join("");

    // 生长中
    $("#growing-tag").textContent = t.growingTag;
    $("#growing-h2").innerHTML = t.growingH2;
    $("#growing-sub").textContent = t.growingSub;
    $("#growing").innerHTML = t.growing
      .map(
        (g) => `
        <article class="grow-card">
          <div class="grow-card__no">${g.no}</div>
          <h3>${g.title}</h3>
          <p>${g.desc}</p>
          <span class="grow-badge"><i></i>${g.badge}</span>
        </article>`
      )
      .join("");

    // 联系
    $("#contact-tag").textContent = t.contactTag;
    $("#contact-h2").innerHTML = t.contactH2;
    $("#contact-sub").textContent = t.contactSub;
    $("#contact").innerHTML = t.contact
      .map(
        (c) => `
        <a class="contact-item" href="${c.href}" target="${c.href.startsWith("http") ? "_blank" : "_self"}">
          <span class="contact-item__k">${c.k}</span>
          <span class="contact-item__v">${c.v}</span>
          <span class="contact-item__tap">${c.tap}</span>
        </a>`
      )
      .join("");

    // 页脚
    $("#footer").textContent = t.footer;
    $("#footer-note").textContent = t.footerNote;
    $("#github-soon").textContent = t.githubSoon;

    // 切换状态
    document.querySelectorAll(".lang button").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.lang === lang);
    });

    observeAll();
  }

  /* ---------- 语言切换 ---------- */
  function bindLang() {
    document.querySelectorAll(".lang button").forEach((b) => {
      b.addEventListener("click", () => {
        if (b.dataset.lang !== lang) {
          lang = b.dataset.lang;
          render();
        }
      });
    });
  }

  /* ---------- 滚动浮现 ---------- */
  let io = null;
  function observeAll() {
    if (io) io.disconnect();
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* ---------- 定制光标 ---------- */
  function bindCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const dot = $("#cursor");
    document.body.classList.add("has-cursor");
    window.addEventListener("mousemove", (e) => {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    render();
    bindLang();
    bindCursor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
