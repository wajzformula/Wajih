/* ============================================================================
   render.js — turns content.js into the page.
   You should not need to edit this file. All text lives in content.js.
   ========================================================================= */

(function () {
  "use strict";

  var C = window.CONTENT || (typeof CONTENT !== "undefined" ? CONTENT : null);
  if (!C) {
    document.body.innerHTML =
      '<p style="font-family:monospace;padding:3rem;color:#E8A33D">' +
      "content.js did not load. Check that the file is next to index.html " +
      "and that no comma or bracket is missing." +
      "</p>";
    return;
  }

  /* --- small helpers --------------------------------------------------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function has(v) {
    return v != null && String(v).trim() !== "";
  }

  /* Builds the picture for a project. A .mp4 or .webm filename becomes a
     silent looping video; anything else (jpg, png, gif, webp) becomes an
     image. GIFs animate on their own, so they need nothing special. */
  function media(fig) {
    var src = fig.src || "";
    var isVideo = /\.(mp4|webm|mov)($|\?)/i.test(src);
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isVideo) {
      var im = el("img");
      im.src = src;
      im.alt = fig.alt || "";
      im.loading = "lazy";
      return im;
    }

    var holder = el("div", "figure__media");
    var v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.preload = "metadata";
    if (has(fig.poster)) v.poster = fig.poster;
    if (has(fig.alt)) v.setAttribute("aria-label", fig.alt);

    if (reducedMotion) {
      v.controls = true;                 // visitor starts it themselves
    } else {
      v.autoplay = true;
      v.setAttribute("autoplay", "");
      holder.appendChild(v);
      holder.appendChild(el("span", "figure__play", "loop"));
      return holder;
    }
    holder.appendChild(v);
    return holder;
  }

  function list(arr, cls, itemCls) {
    var ul = el("ul", cls);
    (arr || []).forEach(function (t) {
      ul.appendChild(el("li", itemCls || null, t));
    });
    return ul;
  }

  /* --- head and tab ---------------------------------------------------- */

  var meta = C.meta || {};
  if (has(meta.title)) document.title = meta.title;
  if (has(meta.description)) {
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute("content", meta.description);
  }

  /* --- top bar --------------------------------------------------------- */

  var wordmark = document.querySelector(".wordmark");
  wordmark.textContent = has(meta.wordmark) ? meta.wordmark : (C.hero && C.hero.name) || "";

  var avatar = document.querySelector(".brand__avatar");
  if (has(meta.avatar)) {
    avatar.src = meta.avatar;
    avatar.alt = meta.avatarAlt || "";
    avatar.hidden = false;
    avatar.addEventListener("error", function () { avatar.hidden = true; });
  }

  var navUl = document.querySelector(".navlinks");
  (C.nav || []).forEach(function (item) {
    var li = el("li");
    var a = el("a", null, item.label);
    a.href = "#" + item.id;
    a.dataset.target = item.id;
    li.appendChild(a);
    navUl.appendChild(li);
  });

  /* --- hero ------------------------------------------------------------ */

  var hero = C.hero || {};
  document.querySelector(".hero__name").textContent = hero.name || "";
  document.querySelector(".hero__lede").textContent = hero.lede || "";
  document.querySelector(".hero__role").textContent = hero.roleLine || "";
  document.querySelector(".hero__places").textContent = hero.places || "";
  document.querySelector(".hero__hint").textContent = hero.hint || "";

  var actions = document.querySelector(".hero__actions");
  (hero.buttons || []).forEach(function (b, i) {
    var a = el("a", "btn" + (i === 0 ? " btn--primary" : ""), b.label);
    a.href = b.href || "#";
    if (/\.pdf($|\?)/i.test(b.href || "")) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    }
    actions.appendChild(a);
  });

  /* --- section shell --------------------------------------------------- */

  var mount = document.getElementById("sections");

  function band(id, labelText) {
    var section = el("section", "band");
    section.id = id;
    var label = el("p", "band__label reveal", labelText || "");
    var body = el("div", "band__body");
    section.appendChild(label);
    section.appendChild(body);
    mount.appendChild(section);
    return body;
  }

  function heading(body, text, intro) {
    if (has(text)) body.appendChild(el("h2", "band__heading reveal", text));
    if (has(intro)) body.appendChild(el("p", "band__intro reveal", intro));
  }

  /* --- about ----------------------------------------------------------- */

  if (C.about) {
    var a = C.about;
    var body = band("about", a.label);
    heading(body, a.heading);

    var grid = el("div", "about__grid reveal");
    var prose = el("div", "about__prose");
    (a.paragraphs || []).forEach(function (p) { prose.appendChild(el("p", null, p)); });
    grid.appendChild(prose);

    var side = el("div", "about__side");
    if (has(a.portrait)) {
      var img = el("img", "about__portrait");
      img.src = a.portrait;
      img.alt = a.portraitAlt || "";
      img.loading = "lazy";
      side.appendChild(img);
    }
    if ((a.facts || []).length) {
      var dl = el("dl", "facts");
      a.facts.forEach(function (f) {
        var wrap = el("div");
        wrap.appendChild(el("dt", null, f.label));
        wrap.appendChild(el("dd", null, f.value));
        dl.appendChild(wrap);
      });
      side.appendChild(dl);
    }
    grid.appendChild(side);
    body.appendChild(grid);
  }

  /* --- work ------------------------------------------------------------ */

  if (C.work) {
    var w = C.work;
    var wBody = band("work", w.label);
    heading(wBody, w.heading, w.intro);

    var wrap = el("div", "projects");

    (w.items || []).forEach(function (p) {
      var fig = p.figure || {};
      var wantsFigure = has(fig.src) || has(fig.caption) || has(fig.alt);

      var art = el("article", "project reveal" + (wantsFigure ? " project--figured" : ""));

      var main = el("div", "project__main");
      if (has(p.meta)) main.appendChild(el("p", "project__meta", p.meta));
      if (has(p.title)) main.appendChild(el("h3", "project__title", p.title));
      if (has(p.summary)) main.appendChild(el("p", "project__summary", p.summary));
      if ((p.bullets || []).length) main.appendChild(list(p.bullets, "project__list"));

      if ((p.stats || []).length) {
        var st = el("div", "stats");
        p.stats.forEach(function (s) {
          var cell = el("div", "stat");
          cell.appendChild(el("div", "stat__value", s.value));
          cell.appendChild(el("div", "stat__label", s.label));
          st.appendChild(cell);
        });
        main.appendChild(st);
      }

      if ((p.tags || []).length) main.appendChild(list(p.tags, "tags"));
      art.appendChild(main);

      if (wantsFigure) {
        var holder = el("div", "project__figurewrap");
        var figure = el("figure", "figure");
        if (has(fig.src)) {
          figure.appendChild(media(fig));
        } else {
          var ph = el("div", "figure--empty");
          ph.appendChild(el("span",
            null,
            "Drop a result image in assets/ and name it in content.js"));
          figure.appendChild(ph);
        }
        if (has(fig.caption)) figure.appendChild(el("figcaption", null, fig.caption));
        holder.appendChild(figure);
        art.appendChild(holder);
      }

      wrap.appendChild(art);
    });

    wBody.appendChild(wrap);
  }

  /* --- experience ------------------------------------------------------ */

  if (C.experience) {
    var ex = C.experience;
    var eBody = band("experience", ex.label);
    heading(eBody, ex.heading, ex.intro);

    var ol = el("ol", "timeline");
    (ex.items || []).forEach(function (it) {
      var li = el("li", "entry reveal");

      var when = el("div", "entry__when");
      when.appendChild(document.createTextNode(it.period || ""));
      if (has(it.kind)) when.appendChild(el("span", "entry__kind", it.kind));
      li.appendChild(when);

      var detail = el("div", "entry__detail");
      if (has(it.title)) detail.appendChild(el("h3", "entry__title", it.title));
      if (has(it.org)) detail.appendChild(el("p", "entry__org", it.org));
      if ((it.bullets || []).length) detail.appendChild(list(it.bullets, "entry__list"));
      li.appendChild(detail);

      ol.appendChild(li);
    });
    eBody.appendChild(ol);
  }

  /* --- methods --------------------------------------------------------- */

  if (C.methods) {
    var m = C.methods;
    var mBody = band("methods", m.label);
    heading(mBody, m.heading, m.intro);

    var mg = el("div", "methods__grid reveal");
    (m.groups || []).forEach(function (g) {
      var col = el("div", "method");
      col.appendChild(el("h3", null, g.title));
      col.appendChild(list(g.items, null));
      mg.appendChild(col);
    });
    mBody.appendChild(mg);
  }

  /* --- seminars -------------------------------------------------------- */

  if (C.talks && C.talks.show !== false && (C.talks.items || []).length) {
    var t = C.talks;
    var tBody = band("talks", t.label);
    heading(tBody, t.heading, t.intro);

    var tw = el("div", "talks reveal");
    t.items.forEach(function (item) {
      var box = el("div", "talk");
      if (has(item.title)) box.appendChild(el("h3", null, item.title));
      var by = [item.speaker, item.venue].filter(has).join(" — ");
      if (by) box.appendChild(el("p", "talk__by", by));
      if (has(item.note)) box.appendChild(el("p", null, item.note));
      tw.appendChild(box);
    });
    tBody.appendChild(tw);
  }

  /* --- institution logos ------------------------------------------------ */

  if (C.logos && C.logos.show !== false && (C.logos.items || []).length) {
    var lg = C.logos;
    var lBody = band("logos", lg.label);
    heading(lBody, lg.heading, lg.intro);

    var strip = el("div", "logos reveal");
    lg.items.forEach(function (item) {
      var cell = el(has(item.href) ? "a" : "div", "logo");
      if (has(item.href)) {
        cell.href = item.href;
        cell.target = "_blank";
        cell.rel = "noopener";
      }
      cell.title = item.name || "";

      if (has(item.src)) {
        var im = el("img");
        im.src = item.src;
        im.alt = item.alt || item.name || "";
        im.loading = "lazy";
        // no logo file uploaded yet, or a bad filename: show the name instead
        im.addEventListener("error", function () {
          cell.replaceChildren(el("span", "logo__name", item.name || ""));
        });
        cell.appendChild(im);
      } else {
        cell.appendChild(el("span", "logo__name", item.name || ""));
      }
      strip.appendChild(cell);
    });
    lBody.appendChild(strip);
  }

  /* --- contact --------------------------------------------------------- */

  if (C.contact) {
    var ct = C.contact;
    var cBody = band("contact", ct.label);
    heading(cBody, ct.heading, ct.intro);

    var rows = el("div", "contact__list reveal");
    (ct.links || []).forEach(function (lnk) {
      var row = el("div", "contact__row");
      row.appendChild(el("span", "contact__label", lnk.label));

      var val = el("span", "contact__value");
      if (has(lnk.href)) {
        var link = el("a", null, lnk.value);
        link.href = lnk.href;
        if (/^https?:/i.test(lnk.href)) {
          link.target = "_blank";
          link.rel = "noopener";
        }
        val.appendChild(link);
      } else {
        val.className = "contact__value contact__value--plain";
        val.textContent = lnk.value;
      }
      row.appendChild(val);

      if (lnk.copy) {
        var btn = el("button", "copy", "copy");
        btn.type = "button";
        btn.setAttribute("aria-label", "Copy " + lnk.label);
        btn.addEventListener("click", function () {
          var text = lnk.value;
          var done = function () {
            btn.textContent = "copied";
            btn.classList.add("is-done");
            setTimeout(function () {
              btn.textContent = "copy";
              btn.classList.remove("is-done");
            }, 1600);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, function () {});
          } else {
            var ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); done(); } catch (e) {}
            document.body.removeChild(ta);
          }
        });
        row.appendChild(btn);
      } else {
        row.appendChild(el("span"));
      }

      rows.appendChild(row);
    });
    cBody.appendChild(rows);

    if (has(ct.footerNote)) {
      cBody.appendChild(el("p", "contact__note reveal", ct.footerNote));
    }
  }

  /* --- footer ---------------------------------------------------------- */

  document.querySelector(".footer__text").textContent = (C.footer && C.footer.text) || "";

  /* ==========================================================================
     Behaviour: reveals, active nav link, scrolled top bar
     ======================================================================= */

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduced && "IntersectionObserver" in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    document.querySelectorAll(".reveal").forEach(function (n) { revealer.observe(n); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-in"); });
  }

  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".navlinks a"));
  var watched = navAnchors
    .map(function (an) { return document.getElementById(an.dataset.target); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && watched.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (an) {
          an.classList.toggle("is-active", an.dataset.target === entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    watched.forEach(function (s) { spy.observe(s); });
  }

  var bar = document.querySelector(".topbar");
  var onScroll = function () {
    bar.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
