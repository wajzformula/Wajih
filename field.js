/* ============================================================================
   field.js — the fluid field behind the hero.

   The cursor injects dye and momentum into a velocity field. The field is then
   advected, swirled with vorticity confinement, and made divergence-free with a
   Jacobi pressure solve, so the wake curls and spreads the way a real one does
   rather than just fading along the path the mouse took.

   You should not need to edit this file. If you want to change how the field
   feels, the CONFIG block below is the only part worth touching — every value
   has a comment saying what it does.
   ========================================================================= */

(function () {
  "use strict";

  /* ======================================================================
     CONFIG — the feel of the field. Safe to adjust.
     ====================================================================== */
  var CONFIG = {
    SIM_RES:              128,    // velocity grid size. Higher = finer swirl, slower.
    DYE_RES:              640,    // dye grid size. Higher = sharper trail, slower.
    PRESSURE_ITERATIONS:  18,     // Jacobi sweeps. Fewer = cheaper, mushier.

    DENSITY_DISSIPATION:  0.92,   // how fast the glow fades. Higher = fades faster.
    VELOCITY_DISSIPATION: 1.9,    // how fast motion dies. Keep above the density value.
    VORTICITY:            26.0,   // swirl strength. 0 = no curl, 40 = very turbulent.

    SPLAT_RADIUS:         0.0040, // base width of the wake
    SPLAT_FORCE:          5200,   // how hard the cursor pushes the fluid
    FAST_SPEED:           2.2,    // cursor speed (screen widths/sec) counted as a hard flick
    NARROWING:            0.55,   // how much a fast flick narrows the wake (0–0.9)

    GLOW:                 0.66,   // bloom around the brightest parts
    EXPOSURE:             1.18,   // overall brightness of the dye

    COLD: [0.130, 0.030, 0.400],  // colour of a slow drift
    HOT:  [0.720, 0.210, 0.980],  // colour of a fast flick

    AMBIENT_EVERY:        2400,   // ms between idle puffs that keep the field alive
    BACKGROUND: [0.027, 0.024, 0.055] // must match --ink in styles.css
  };

  /* ====================================================================== */

  var canvas = document.querySelector(".hero__canvas");
  var heroEl = document.getElementById("hero");
  var hintEl = document.querySelector(".hero__hint");
  if (!canvas) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return; // CSS gradient on the canvas stays visible

  var gl = canvas.getContext("webgl2", {
    alpha: false, depth: false, stencil: false,
    antialias: false, preserveDrawingBuffer: false,
    powerPreference: "high-performance"
  });
  if (!gl) return; // no WebGL2 — CSS gradient stays visible

  if (!gl.getExtension("EXT_color_buffer_float")) return;

  /* --- shader plumbing -------------------------------------------------- */

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function program(vsSrc, fsSrc) {
    var vs = compile(gl.VERTEX_SHADER, vsSrc);
    var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.bindAttribLocation(p, 0, "aPosition");
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(p));
      return null;
    }
    var u = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var name = gl.getActiveUniform(p, i).name;
      u[name] = gl.getUniformLocation(p, name);
    }
    return { handle: p, u: u };
  }

  var VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  var SPLAT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + splat, 1.0);
}`;

  var ADVECT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  vec4 result = texture(uSource, coord);
  float decay = 1.0 + dissipation * dt;
  fragColor = result / decay;
}`;

  var DIVERGENCE = `#version 300 es
precision highp float;
in vec2 vUv, vL, vR, vT, vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  fragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

  var CURL = `#version 300 es
precision highp float;
in vec2 vUv, vL, vR, vT, vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y;
  float R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x;
  float B = texture(uVelocity, vB).x;
  fragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

  var VORTICITY = `#version 300 es
precision highp float;
in vec2 vUv, vL, vR, vT, vB;
out vec4 fragColor;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture(uCurl, vL).x;
  float R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x;
  float B = texture(uCurl, vB).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy + force * dt;
  fragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
}`;

  var PRESSURE = `#version 300 es
precision highp float;
in vec2 vUv, vL, vR, vT, vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  float divergence = texture(uDivergence, vUv).x;
  fragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}`;

  var GRADIENT = `#version 300 es
precision highp float;
in vec2 vUv, vL, vR, vT, vB;
out vec4 fragColor;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture(uPressure, vL).x;
  float R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x;
  float B = texture(uPressure, vB).x;
  vec2 velocity = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}`;

  var CLEAR = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform float value;
void main () { fragColor = value * texture(uTexture, vUv); }`;

  /* Display: dye + a cheap two-ring bloom, tonemapped so text stays readable. */
  var DISPLAY = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uTexture;
uniform vec2 texelSize;
uniform float uGlow;
uniform float uExposure;
uniform vec3 uBackground;
uniform float uAspect;

vec3 ring (float scale) {
  vec3 sum = vec3(0.0);
  vec2 t = texelSize * scale;
  sum += texture(uTexture, vUv + vec2( t.x,  0.0)).rgb;
  sum += texture(uTexture, vUv + vec2(-t.x,  0.0)).rgb;
  sum += texture(uTexture, vUv + vec2( 0.0,  t.y)).rgb;
  sum += texture(uTexture, vUv + vec2( 0.0, -t.y)).rgb;
  sum += texture(uTexture, vUv + vec2( t.x,  t.y)).rgb;
  sum += texture(uTexture, vUv + vec2(-t.x,  t.y)).rgb;
  sum += texture(uTexture, vUv + vec2( t.x, -t.y)).rgb;
  sum += texture(uTexture, vUv + vec2(-t.x, -t.y)).rgb;
  return sum * 0.125;
}

void main () {
  vec3 dye = texture(uTexture, vUv).rgb;
  vec3 glow = ring(3.0) * 0.6 + ring(8.0) * 0.4;

  vec3 c = (dye + glow * uGlow) * uExposure;

  // a very faint resting gradient so an untouched field is not flat black
  vec2 d = (vUv - vec2(0.62, 0.44)) * vec2(uAspect, 1.0);
  float rest = pow(max(0.0, 1.0 - length(d) * 0.85), 3.0);
  vec3 base = uBackground + vec3(0.046, 0.014, 0.088) * rest;

  // saturating tone map: scribbling can never wash the hero white
  c = vec3(1.0) - exp(-c);
  fragColor = vec4(base + c, 1.0);
}`;

  var progSplat      = program(VERT, SPLAT);
  var progAdvect     = program(VERT, ADVECT);
  var progDivergence = program(VERT, DIVERGENCE);
  var progCurl       = program(VERT, CURL);
  var progVorticity  = program(VERT, VORTICITY);
  var progPressure   = program(VERT, PRESSURE);
  var progGradient   = program(VERT, GRADIENT);
  var progClear      = program(VERT, CLEAR);
  var progDisplay    = program(VERT, DISPLAY);

  if (!progSplat || !progAdvect || !progDisplay || !progPressure) return;

  /* --- fullscreen quad --------------------------------------------------- */

  var vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  var ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target) {
    if (target == null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.width, target.height);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* --- render targets ---------------------------------------------------- */

  function makeFBO(w, h) {
    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);

    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture: texture, fbo: fbo, width: w, height: h,
      texelSizeX: 1 / w, texelSizeY: 1 / h,
      attach: function (id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  function makeDouble(w, h) {
    var a = makeFBO(w, h), b = makeFBO(w, h);
    return {
      width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
      get read() { return a; },
      get write() { return b; },
      swap: function () { var t = a; a = b; b = t; }
    };
  }

  var simW, simH, dyeW, dyeH;
  var velocity, dye, divergence, curl, pressure;
  var downgraded = false;

  function dims(res) {
    var aspect = canvas.width / canvas.height || 1;
    return aspect >= 1
      ? { w: Math.round(res * aspect), h: res }
      : { w: res, h: Math.round(res / aspect) };
  }

  function buildTargets() {
    var s = dims(CONFIG.SIM_RES);
    var d = dims(CONFIG.DYE_RES);
    simW = s.w; simH = s.h; dyeW = d.w; dyeH = d.h;

    velocity   = makeDouble(simW, simH);
    dye        = makeDouble(dyeW, dyeH);
    divergence = makeFBO(simW, simH);
    curl       = makeFBO(simW, simH);
    pressure   = makeDouble(simW, simH);
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(canvas.clientWidth * dpr);
    var h = Math.round(canvas.clientHeight * dpr);
    if (w === 0 || h === 0) return false;
    if (canvas.width === w && canvas.height === h) return false;
    canvas.width = w;
    canvas.height = h;
    buildTargets();
    return true;
  }

  canvas.width = Math.max(1, Math.round(canvas.clientWidth));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight));
  buildTargets();
  resize();

  /* --- splats ------------------------------------------------------------ */

  function splat(x, y, dx, dy, color, radius) {
    gl.useProgram(progSplat.handle);
    gl.uniform1i(progSplat.u.uTarget, velocity.read.attach(0));
    gl.uniform1f(progSplat.u.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(progSplat.u.point, x, y);
    gl.uniform3f(progSplat.u.color, dx, dy, 0.0);
    gl.uniform1f(progSplat.u.radius, radius);
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(progSplat.u.uTarget, dye.read.attach(0));
    gl.uniform3f(progSplat.u.color, color[0], color[1], color[2]);
    blit(dye.write);
    dye.swap();
  }

  function mix(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  /* Turns a pointer move into a splat whose strength, width and colour
     all follow how fast the pointer was travelling. */
  function stroke(x, y, dx, dy, speed) {
    var t = clamp(speed / CONFIG.FAST_SPEED, 0, 1);
    var warm = Math.pow(t, 1.4);

    var intensity = 0.16 + 1.5 * Math.pow(t, 0.75);
    var color = [
      mix(CONFIG.COLD[0], CONFIG.HOT[0], warm) * intensity,
      mix(CONFIG.COLD[1], CONFIG.HOT[1], warm) * intensity,
      mix(CONFIG.COLD[2], CONFIG.HOT[2], warm) * intensity
    ];

    var radius = CONFIG.SPLAT_RADIUS * (1.0 - CONFIG.NARROWING * t);
    splat(x, y, dx * CONFIG.SPLAT_FORCE, dy * CONFIG.SPLAT_FORCE, color, radius);
  }

  /* --- pointer ----------------------------------------------------------- */

  var pointer = { x: 0.5, y: 0.5, hasMoved: false, lastT: 0 };
  var coarse = window.matchMedia("(pointer: coarse)").matches;

  function toField(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left) / r.width,
      y: 1.0 - (clientY - r.top) / r.height,
      inside: clientY >= r.top && clientY <= r.bottom
    };
  }

  window.addEventListener("pointermove", function (e) {
    var p = toField(e.clientX, e.clientY);
    if (!p.inside) { pointer.hasMoved = false; return; }

    var now = performance.now();
    if (!pointer.hasMoved) {
      pointer.x = p.x; pointer.y = p.y; pointer.lastT = now;
      pointer.hasMoved = true;
      return;
    }

    var dt = Math.max(1, now - pointer.lastT) / 1000;
    var dx = p.x - pointer.x;
    var dy = p.y - pointer.y;
    var speed = Math.sqrt(dx * dx + dy * dy) / dt;

    pointer.x = p.x; pointer.y = p.y; pointer.lastT = now;
    lastInput = now;

    if (speed > 0.001) stroke(p.x, p.y, dx, dy, speed);
    fadeHint();
  }, { passive: true });

  window.addEventListener("pointerdown", function (e) {
    var p = toField(e.clientX, e.clientY);
    if (!p.inside) return;
    lastInput = performance.now();
    var a = Math.random() * Math.PI * 2;
    stroke(p.x, p.y, Math.cos(a) * 0.012, Math.sin(a) * 0.012, CONFIG.FAST_SPEED * 0.8);
    fadeHint();
  }, { passive: true });

  var hintFaded = false;
  function fadeHint() {
    if (hintFaded || !hintEl) return;
    hintFaded = true;
    setTimeout(function () { hintEl.classList.add("is-faded"); }, 900);
  }

  /* --- idle life --------------------------------------------------------- */

  var lastInput = 0;
  var lastAmbient = 0;
  var drift = { a: Math.random() * 6.28 };

  function ambient(now) {
    var idle = now - lastInput > 1800;
    if (!idle && !coarse) return;
    var every = coarse ? CONFIG.AMBIENT_EVERY * 0.45 : CONFIG.AMBIENT_EVERY;
    if (now - lastAmbient < every) return;
    lastAmbient = now;

    drift.a += 0.6 + Math.random() * 1.4;
    var x = 0.5 + Math.cos(drift.a) * 0.26;
    var y = 0.5 + Math.sin(drift.a * 0.7) * 0.22;
    var dx = Math.cos(drift.a + 1.57) * 0.004;
    var dy = Math.sin(drift.a + 1.57) * 0.004;
    stroke(x, y, dx, dy, CONFIG.FAST_SPEED * (coarse ? 0.34 : 0.18));
  }

  /* --- step -------------------------------------------------------------- */

  function step(dt) {
    gl.disable(gl.BLEND);

    // curl
    gl.useProgram(progCurl.handle);
    gl.uniform2f(progCurl.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progCurl.u.uVelocity, velocity.read.attach(0));
    blit(curl);

    // vorticity confinement
    gl.useProgram(progVorticity.handle);
    gl.uniform2f(progVorticity.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progVorticity.u.uVelocity, velocity.read.attach(0));
    gl.uniform1i(progVorticity.u.uCurl, curl.attach(1));
    gl.uniform1f(progVorticity.u.curl, CONFIG.VORTICITY);
    gl.uniform1f(progVorticity.u.dt, dt);
    blit(velocity.write);
    velocity.swap();

    // divergence
    gl.useProgram(progDivergence.handle);
    gl.uniform2f(progDivergence.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progDivergence.u.uVelocity, velocity.read.attach(0));
    blit(divergence);

    // decay the previous pressure guess
    gl.useProgram(progClear.handle);
    gl.uniform1i(progClear.u.uTexture, pressure.read.attach(0));
    gl.uniform1f(progClear.u.value, 0.8);
    blit(pressure.write);
    pressure.swap();

    // Jacobi pressure solve
    gl.useProgram(progPressure.handle);
    gl.uniform2f(progPressure.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progPressure.u.uDivergence, divergence.attach(0));
    for (var i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(progPressure.u.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    // make the velocity field divergence-free
    gl.useProgram(progGradient.handle);
    gl.uniform2f(progGradient.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progGradient.u.uPressure, pressure.read.attach(0));
    gl.uniform1i(progGradient.u.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    // advect velocity
    gl.useProgram(progAdvect.handle);
    gl.uniform2f(progAdvect.u.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(progAdvect.u.uVelocity, velocity.read.attach(0));
    gl.uniform1i(progAdvect.u.uSource, velocity.read.attach(0));
    gl.uniform1f(progAdvect.u.dt, dt);
    gl.uniform1f(progAdvect.u.dissipation, CONFIG.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    // advect dye
    gl.uniform1i(progAdvect.u.uVelocity, velocity.read.attach(0));
    gl.uniform1i(progAdvect.u.uSource, dye.read.attach(1));
    gl.uniform1f(progAdvect.u.dissipation, CONFIG.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    gl.useProgram(progDisplay.handle);
    gl.uniform1i(progDisplay.u.uTexture, dye.read.attach(0));
    gl.uniform2f(progDisplay.u.texelSize, 1 / dyeW, 1 / dyeH);
    gl.uniform1f(progDisplay.u.uGlow, CONFIG.GLOW);
    gl.uniform1f(progDisplay.u.uExposure, CONFIG.EXPOSURE);
    gl.uniform1f(progDisplay.u.uAspect, canvas.width / canvas.height);
    gl.uniform3f(progDisplay.u.uBackground,
      CONFIG.BACKGROUND[0], CONFIG.BACKGROUND[1], CONFIG.BACKGROUND[2]);
    blit(null);
  }

  /* --- seed the field so it is never empty on arrival -------------------- */

  (function seed() {
    for (var i = 0; i < 7; i++) {
      var a = Math.random() * Math.PI * 2;
      stroke(
        0.42 + Math.random() * 0.4,
        0.3 + Math.random() * 0.4,
        Math.cos(a) * 0.006,
        Math.sin(a) * 0.006,
        CONFIG.FAST_SPEED * (0.2 + Math.random() * 0.35)
      );
    }
  })();

  /* --- loop, with a pause when the hero is off screen -------------------- */

  var running = true;
  var raf = null;
  var last = performance.now();
  var samples = [];

  if ("IntersectionObserver" in window && heroEl) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        running = e.isIntersecting;
        if (running && raf === null) { last = performance.now(); loop(); }
      });
    }, { threshold: 0 }).observe(heroEl);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { running = false; }
    else if (heroEl && heroEl.getBoundingClientRect().bottom > 0) {
      running = true; last = performance.now();
      if (raf === null) loop();
    }
  });

  window.addEventListener("resize", function () {
    if (resize()) {
      // reseed so the new grid is not blank
      for (var i = 0; i < 4; i++) {
        var a = Math.random() * Math.PI * 2;
        stroke(0.5 + Math.cos(a) * 0.2, 0.5 + Math.sin(a) * 0.2,
               Math.cos(a) * 0.005, Math.sin(a) * 0.005, CONFIG.FAST_SPEED * 0.25);
      }
    }
  });

  /* If the machine cannot hold the frame rate, drop the grid once and
     carry on rather than stuttering. */
  function watchdog(ms) {
    if (downgraded) return;
    samples.push(ms);
    if (samples.length < 90) return;
    var avg = samples.reduce(function (a, b) { return a + b; }, 0) / samples.length;
    samples.length = 0;
    if (avg > 22) {
      downgraded = true;
      CONFIG.SIM_RES = 96;
      CONFIG.DYE_RES = 384;
      CONFIG.PRESSURE_ITERATIONS = 12;
      buildTargets();
    }
  }

  function loop() {
    if (!running) { raf = null; return; }
    raf = requestAnimationFrame(loop);

    var now = performance.now();
    var frame = now - last;
    last = now;
    var dt = Math.min(frame / 1000, 0.0166);

    watchdog(frame);
    ambient(now);
    step(dt);
    render();
  }

  loop();
})();
