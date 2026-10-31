# Portfolio website

A single-page site. Everything you will ever want to change — text, pictures,
links, which projects appear — lives in one file called **`content.js`**.

---

## Part 1 — Put it online (about 10 minutes, once)

You need a free GitHub account. If you don't have one, make it at
[github.com/signup](https://github.com/signup) first. **Choose your username
carefully** — it becomes part of your web address.

### 1. Make the repository

1. Go to [github.com/new](https://github.com/new).
2. In **Repository name**, type your username followed by `.github.io`.
   If your username is `wajihuddin`, type exactly: `wajihuddin.github.io`
3. Choose **Public**.
4. Leave every checkbox unticked.
5. Click **Create repository**.

### 2. Upload the files

1. On the page that appears, click **uploading an existing file**.
2. Drag in these files: `index.html`, `content.js`, `styles.css`,
   `render.js`, `field.js`, `README.md`, and the whole `assets` folder.
3. Scroll down, click **Commit changes**.

### 3. Turn the website on

1. Click **Settings** at the top of the repository.
2. Click **Pages** in the left sidebar.
3. Under **Source**, choose **Deploy from a branch**.
4. Branch: `main`, folder: `/ (root)`. Click **Save**.
5. Wait two or three minutes, then open `https://yourusername.github.io`

That's it. It's live.

---

## Part 2 — Change the text (any time, no coding)

1. Go to your repository on GitHub.
2. Click on **`content.js`**.
3. Click the **pencil icon** at the top right of the file.
4. Change the words between the `"` quote marks.
5. Scroll to the bottom, click **Commit changes**, then **Commit changes** again.
6. Wait about a minute and refresh your website.

### The four rules

If the site ever breaks after an edit, it is almost certainly one of these:

| Rule | Right | Wrong |
| --- | --- | --- |
| Keep the quote marks | `title: "My project"` | `title: My project` |
| Keep the comma at the end | `"Python",` | `"Python"` |
| Escape quotes inside text | `"the \"two-fluid\" model"` | `"the "two-fluid" model"` |
| Never delete `{ }` or `[ ]` | | |

GitHub shows your edit history, so **nothing is ever lost**. If something
breaks: open the repository, click **commits**, find the last version that
worked, and restore it.

---

## Part 3 — Change the pictures

### Add a picture

1. Open the **`assets`** folder in your repository.
2. Click **Add file → Upload files**, drag your image in, commit.
3. Open `content.js`, find the project, and write the file name:

```
figure: {
  src: "assets/nozzle-particles.png",
  alt: "Particle tracks leaving the nozzle",
  caption: "particle tracks · nozzle exit"
}
```

### Remove a picture

Set `src: ""` — the project keeps its caption and shows a placeholder box.
Delete the whole `figure: { ... },` block to remove the picture area entirely.

### Your profile picture (top left)

Upload a **square** photo to `assets/` and name it in the `meta` block:
`avatar: "assets/profile.jpg"`. It appears as a small circle beside your name
in the bar at the top of every screen. Leave it as `""` to show no picture.
A separate, larger `portrait:` in the `about` block is optional.

### Pictures, GIFs and videos

Every project figure accepts all three. The file extension decides what happens:

| File | What it does |
| --- | --- |
| `.jpg` `.png` `.webp` | A still image |
| `.gif` | Animates on its own, no setup |
| `.mp4` `.webm` | Plays silently on a loop, no controls, restarts forever |

For video, add a `poster` so something shows while it loads:

```
figure: {
  src: "assets/nozzle-loop.mp4",
  poster: "assets/nozzle-still.jpg",
  alt: "Particle tracks leaving the nozzle",
  caption: "particle tracks · one cycle"
}
```

A six to ten second loop of your ParaView or Fluent animation is the single
most persuasive thing you can put on this page. Export at about 1280 px wide
and keep each clip under roughly 5 MB — GitHub Pages serves files up to 100 MB,
but a heavy page loses the reader before it loads. MP4 (H.264) plays
everywhere. A GIF of the same clip is usually five times larger than the MP4,
so prefer MP4 unless the clip is tiny.

Visitors who have asked their system for reduced motion get a play button
instead of an autoplaying loop.

### Institution logos

The strip near the bottom. Upload each logo to `assets/` — a transparent PNG
or an SVG is best — and name it in the `logos` block. Until you upload one,
that institution's **name shows as text instead**, so the section never looks
broken while you collect them. Logos render in greyscale and come to full
colour on hover. Set `show: false` to hide the strip entirely.

### Replace the CV

Upload your PDF to `assets/` named exactly **`CV.pdf`** and the Download CV
button works with no further change. Different name? Update the `href` in the
`hero.buttons` list.

**Image tips.** Use JPG or PNG. Keep each under about 500 KB — in Preview,
Paint or [squoosh.app](https://squoosh.app) export at around 1400 px wide.
Simulation output — contour plots, particle fields, mesh views — looks far
better here than stock photography, and it's what a supervisor actually reads.

---

## Part 4 — Add, remove and reorder things

**Remove** anything — a project, a job, a contact row — by deleting everything
from its opening `{` to its closing `},` including both brackets.

**Add** one by copying an existing block from `{` to `},` pasting it directly
below, and changing the text.

**Reorder** by cutting a whole block and pasting it somewhere else in the list.

**Hide the seminars section** entirely: in `talks`, set `show: false`.

---

## Part 5 — Preview before you publish

Download the folder to your computer and double-click `index.html`. It opens in
your browser and works exactly as it does online. Edit `content.js` in any text
editor (Notepad, TextEdit, VS Code), save, refresh the browser.

---

## What each file does

| File | What it is |
| --- | --- |
| `content.js` | **Your text and pictures. The only file you edit.** |
| `index.html` | The empty page shell |
| `styles.css` | Colours, fonts, spacing. The colour block is at the very top |
| `render.js` | Puts your content onto the page |
| `field.js` | The fluid simulation behind your name |
| `assets/` | Your images and your CV |

---

## Changing the colour

The whole site is driven by seven colour values at the top of `styles.css`,
in the block marked `--- colours ---`. `--violet` is the brand fill (buttons),
`--violet-lift` is the same hue lightened for links and lines. Change those two
and the entire interface follows.

The fluid itself has its own colours, in the `CONFIG` block at the top of
`field.js`: `COLD` is a slow drift, `HOT` is a fast flick, written as
red/green/blue from 0 to 1. `BACKGROUND` must match `--ink`.

## About the hero animation

It is a real fluid solve running on your visitor's graphics card: the cursor
injects dye and momentum, vorticity confinement adds the curl, and a Jacobi
pressure solve keeps the velocity field divergence-free, which is why the wake
rolls up instead of just fading along the cursor path. Speed drives the dye
amount, the wake width, how long it persists and its colour, so a flick looks
different from a drift.

To change how it feels, open `field.js` and edit the `CONFIG` block at the top —
every value has a comment. Nothing else in that file needs touching.

It degrades safely: no WebGL2, or a visitor who has asked their system for
reduced motion, gets a static gradient and the rest of the page is unchanged.
If frame times slip the grid drops once and carries on. The simulation stops
entirely once you scroll past the hero.

---

## Using your own domain later

Buy a domain, then in **Settings → Pages → Custom domain** enter it and follow
GitHub's instructions. Your `github.io` address keeps working.
