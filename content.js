/* ============================================================================
   content.js  —  THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Everything you see on the website is written here. Change the text between
   the quote marks, save, and the site updates.

   FOUR RULES. If something breaks, it is almost always one of these:
     1. Keep the quote marks "" around every piece of text.
     2. Keep the comma , at the end of every line that has one.
     3. To use a quote mark inside text, write it as \"  (backslash first).
     4. Never delete a { } or [ ] bracket.

   TO ADD AN IMAGE: upload the file into the assets/ folder, then write its
   name here, like:  "assets/my-picture.jpg"
   TO REMOVE AN IMAGE: leave it empty, like:  ""

   TO DELETE AN ITEM (a project, a job, a link): delete everything from its
   opening {  to its closing },  including both brackets.
   TO ADD ONE: copy an existing item from its {  to its },  and paste it
   directly below, then change the text.
   ========================================================================= */

const CONTENT = {

  /* ---------------------------------------------------------------------
     1. BROWSER TAB AND SEARCH RESULTS
     --------------------------------------------------------------------- */
  meta: {
    title: "Muhammad Wajih Uddin — Computational Multiphase Flows",
    description: "Computational engineer working on multiphase flow, gas–solid transport and CFD solvers.",
    // Shown in the top-left corner of the navigation bar.
    wordmark: "Wajih Uddin",

    // Your profile picture, top left. Upload it to assets/ and name it here.
    // A square photo works best. Leave as "" to show no picture.
    avatar: "assets/profile.jpg",
    avatarAlt: "Muhammad Wajih Uddin"
  },

  /* ---------------------------------------------------------------------
     2. NAVIGATION — the links in the bar at the top.
        "id" must match the section it jumps to. Don't change the ids
        unless you know what you're doing; change the "label" freely.
     --------------------------------------------------------------------- */
  nav: [
    { label: "About",      id: "about" },
    { label: "Work",       id: "work" },
    { label: "Experience", id: "experience" },
    { label: "Methods",    id: "methods" },
    { label: "Contact",    id: "contact" }
  ],

  /* ---------------------------------------------------------------------
     3. HERO — the first screen, with the moving field behind it.
     --------------------------------------------------------------------- */
  hero: {
    name: "Muhammad Wajih Uddin",
    // One sentence. Keep it plain enough that a non-specialist understands it.
    lede: "I model flows where gas, liquid and solid move together, and write the solvers that run them.",
    // A quiet line under the sentence.
    roleLine: "Computational multiphase flows, CFD and particle transport",
    places: "Aachen · Torino · Saint-Étienne",
    buttons: [
      { label: "See the work", href: "#work" },
      { label: "Download CV",  href: "assets/CV.pdf" }
    ],
    // Tells visitors the background reacts to them. Keep it short.
    hint: "move to disturb the field"
  },

  /* ---------------------------------------------------------------------
     4. ABOUT
     --------------------------------------------------------------------- */
  about: {
    label: "About",
    heading: "Physics I can defend, code I can run",
    paragraphs: [
      "I build numerical models of multiphase systems and the solvers that run them. Most of my work sits where a continuous fluid meets a dispersed phase: particles in a carrier gas, bubbles in a rotating pump, a powder stream leaving a nozzle at speed.",
      "I trained as a mechanical engineer at NED University in Karachi, then joined the Erasmus Mundus master's in Computational Multiphase Flow Systems, studying across TUM, Politecnico di Torino and IMT Mines Saint-Étienne. Between them I spent twenty months at IFP Energies nouvelles in Lyon on gas–solid transport, and wrote my thesis at Fraunhofer ILT in Aachen on a high-speed powder delivery device.",
      "The problems I like need a model that is honest about its assumptions and still cheap enough to run: residual plastic particles in a conveying line, air entrainment in a gear pump, buoyant convection resolved all the way down."
    ],
    // The short facts column on the right. Add or remove rows freely.
    facts: [
      { label: "Based in",   value: "Aachen, Germany" },
      { label: "Studying",   value: "MSc Computational Multiphase Flow Systems — TUM, PoliTo, Mines Saint-Étienne" },
      { label: "Funded by",  value: "Erasmus Mundus scholarship" },
      { label: "Working in", value: "Python, MATLAB, ANSYS Fluent, OpenFOAM" }
    ],
    // Your photo. Upload to assets/ and put the filename here, or leave "" for none.
    portrait: "",
    portraitAlt: "Portrait of Muhammad Wajih Uddin"
  },

  /* ---------------------------------------------------------------------
     5. WORK — your projects. The most important section on the site.

        Each project has:
          meta     a short line: what kind of work, where, when
          title    the project name
          summary  2–3 sentences: what the problem was and what you did
          figure   a picture, GIF or video of your results.
                   .jpg .png .webp  -> still image
                   .gif             -> animates by itself
                   .mp4 .webm       -> plays silently on a loop, no controls
                   leave src: "" for no picture at all.
                   For video you can also add  poster: "assets/still.jpg"
          bullets  the specific things you did — methods, not adjectives
          stats    big numbers worth pulling out (up to 3 look best)
          tags     short labels at the bottom of the card
     --------------------------------------------------------------------- */
  work: {
    label: "Work",
    heading: "Selected simulations and solvers",
    intro: "Thesis, placement and course work, from solvers written from scratch to industrial CFD studies.",
    items: [

      {
        meta: "Master's thesis · Fraunhofer ILT, Aachen · Apr–Sep 2026",
        title: "High-speed fluidic device for powder delivery",
        summary: "A nozzle that has to deliver a powder stream with a predictable shape and mass flow at high gas velocity. I characterised and optimised it with 3D CFD coupled to particle dynamics, then checked the model against the physical rig.",
        figure: {
          // A short silent loop works very well here. Example:
          //   src: "assets/nozzle-loop.mp4",
          //   poster: "assets/nozzle-still.jpg",
          src: "",
          alt: "Simulation of the powder delivery nozzle",
          caption: "particle tracks · nozzle exit"
        },
        bullets: [
          "3D CFD of the internal gas flow coupled with Lagrangian particle dynamics",
          "Turbulence and particle–fluid coupling modelled across the operating envelope",
          "Design of experiments covering every factor expected to affect delivery",
          "Validation against measurements from the physical setup"
        ],
        stats: [],
        tags: ["ANSYS Fluent", "Particle–fluid coupling", "Turbulence", "DoE", "Experimental validation"]
      },

      {
        meta: "Research placement · IFP Energies nouvelles, Lyon · Oct 2024 – Jun 2026",
        title: "Gas–solid flow in pneumatic conveying of residual particles",
        summary: "Residual particles are carried to downstream processing through a conveying line, and the pressure loss along it decides whether the line works. I modelled the gas and solid phases as interpenetrating continua and wrote the solver from scratch in Python.",
        figure: {
          src: "",
          alt: "Solid volume fraction along the conveying line",
          caption: "solid volume fraction · Euler–Euler"
        },
        bullets: [
          "Euler–Euler two-fluid formulation for the gas and the dispersed solid phase",
          "Particle–gas and particle–wall interaction treated through closure models",
          "Solver built in Python, with the transport behaviour resolved along the line",
          "Validated against experimental data and published results"
        ],
        stats: [],
        tags: ["Python", "Euler–Euler", "Gas–solid flow", "Drag closures"]
      },

      {
        meta: "Course project · Numerical methods · 2025",
        title: "Direct numerical simulation of buoyancy-driven convection",
        summary: "A DNS solver written in Python for convection along a heated source under the Boussinesq approximation, resolving the coupled flow and heat transfer without a turbulence model.",
        figure: {
          src: "",
          alt: "Temperature field in the convective plume",
          caption: "temperature field · DNS"
        },
        bullets: [
          "Boussinesq approximation for the buoyancy coupling between momentum and energy",
          "Coupled velocity and temperature fields resolved on the full grid",
          "Verification by grid refinement study",
          "Validation against published experimental and numerical results"
        ],
        stats: [],
        tags: ["Python", "DNS", "Heat transfer", "Grid convergence"]
      },

      {
        meta: "Course project · Multiphase CFD · 2025",
        title: "Bubble transport and air entrainment in a rotating gear pump",
        summary: "Gear pumps entrain air, and the entrained gas changes the pressure they can hold. I ran transient two-phase simulations of a rotating pump to see where the gas goes and what it does to performance.",
        figure: {
          src: "",
          alt: "Liquid and gas phase distribution inside the gear pump",
          caption: "phase distribution · one revolution"
        },
        bullets: [
          "Eulerian mixture model in ANSYS Fluent for the liquid–gas system",
          "CAD prepared and corrected, then meshed with boundary-layer inflation where pressure and the interface had to be resolved",
          "Dynamic mesh with rigid body motion to resolve the gear rotation",
          "Analysed phase distribution, air entrainment, pressure and velocity fields, and interphase behaviour"
        ],
        stats: [],
        tags: ["ANSYS Fluent", "Eulerian mixture", "Dynamic mesh", "Interfacial flow"]
      },

      {
        meta: "Course project · Multiphase transport · 2025",
        title: "Solid–liquid flow with particles injected through an inlet",
        summary: "A two-dimensional study of discrete solid particles entering a liquid domain through an inlet opening, modelled in an Eulerian framework to follow how the particle phase distributes itself as the flow develops.",
        figure: {
          src: "",
          alt: "Particle distribution in the solid–liquid domain",
          caption: "particle distribution"
        },
        bullets: [
          "Eulerian multiphase framework chosen for the solid–liquid system",
          "Particle distribution and phase interaction tracked through the domain",
          "Velocity fields and flow development analysed as the inlet stream spreads"
        ],
        stats: [],
        tags: ["Eulerian multiphase", "Solid–liquid flow"]
      },

      {
        meta: "Bachelor's thesis · NED University of Engineering and Technology · 2023",
        title: "Machine-learning-enhanced particle streak velocimetry",
        summary: "Particle streak velocimetry extracts flow fields from streak images, but the extraction step is expensive. I trained a supervised model on synthetic data to predict flow characteristics directly, making CFD-based flow analysis cheaper to run.",
        figure: {
          src: "",
          alt: "Particle streaks used to reconstruct the velocity field",
          caption: "synthetic streaks · MATLAB"
        },
        bullets: [
          "Synthetic streak datasets generated in MATLAB",
          "Supervised machine learning in Python trained to predict flow characteristics",
          "Advanced a novel particle streak velocimetry algorithm for flow and structural design"
        ],
        stats: [],
        tags: ["MATLAB", "Python", "Machine learning", "Flow measurement"]
      }

    ]
  },

  /* ---------------------------------------------------------------------
     6. EXPERIENCE AND EDUCATION — one list, newest first.
        "kind" is the small label: write "Work" or "Education".
     --------------------------------------------------------------------- */
  experience: {
    label: "Experience",
    heading: "Where I've worked and studied",
    items: [
      {
        period: "2026",
        kind: "Work",
        title: "Master's thesis student, Fraunhofer ILT",
        org: "Aachen, Germany",
        bullets: [
          "Optimisation and characterisation of a high-speed fluidic device for powder delivery",
          "3D CFD coupled with particle dynamics; turbulence and particle–fluid coupling modelling",
          "Design of experiments across all expected impact factors, validated against a physical setup"
        ]
      },
      {
        period: "2024 – 2026",
        kind: "Work",
        title: "Placement student, IFP Energies nouvelles (IFPEN)",
        org: "Lyon, France",
        bullets: [
          "Numerical simulation of gas–solid flow in pneumatic conveying systems for residual particles",
          "Euler–Euler two-fluid approach; analysis of particle–gas and wall interactions and transport behaviour",
          "Built the solver in Python and validated it against experimental and published data"
        ]
      },
      {
        period: "2024 – 2026",
        kind: "Education",
        title: "MSc Computational Multiphase Flow Systems",
        org: "TUM (Germany) · Politecnico di Torino (Italy) · IMT Mines Saint-Étienne (France)",
        bullets: [
          "Erasmus Mundus joint master's, 120 ECTS, specialising in mathematical modelling, thermo-fluid sciences and multiphase transport",
          "Coursework: turbulence, fluid and thermodynamics, gas–solid and liquid–liquid systems, numerical methods, probability and uncertainty, multiscale modelling, nonlinear systems"
        ]
      },
      {
        period: "2023 – 2024",
        kind: "Work",
        title: "Junior Mechanical Engineer, Lucky–Yunus Energy",
        org: "Karachi, Pakistan",
        bullets: [
          "Worked on a 100 MW wind power plant with Nordex and Siemens Gamesa turbines",
          "Researched turbine blade aerofoils and vortex generators for maintenance planning",
          "Calculated exhaust back pressure and thermal losses of gas engine generators for exhaust piping design in a thermal coupling study"
        ]
      },
      {
        period: "2019 – 2023",
        kind: "Education",
        title: "BE Mechanical Engineering, NED University of Engineering and Technology",
        org: "Karachi, Pakistan",
        bullets: [
          "Thesis: machine-learning-enhanced particle streak velocimetry for flow and structural design",
          "Highlighted courses: fluid and solid mechanics, materials science, manufacturing processes, dynamics"
        ]
      }
    ]
  },

  /* ---------------------------------------------------------------------
     7. METHODS AND TOOLS — grouped. Add or remove whole groups freely.
     --------------------------------------------------------------------- */
  methods: {
    label: "Methods",
    heading: "What I work with",
    groups: [
      {
        title: "Numerical methods",
        items: ["Finite volume method", "Direct numerical simulation", "Euler–Euler two-fluid models", "Eulerian mixture model", "Dynamic mesh and rigid body motion", "Grid independence studies"]
      },
      {
        title: "Physics",
        items: ["Gas–solid flow", "Liquid–liquid and interfacial flow", "Particle–fluid coupling", "Turbulence modelling", "Buoyancy-driven convection", "Multiscale modelling"]
      },
      {
        title: "Programming",
        items: ["Python", "MATLAB", "LaTeX"]
      },
      {
        title: "Simulation and experiment",
        items: ["ANSYS Fluent", "OpenFOAM", "CAD", "Design of experiments", "Experimental validation"]
      }
    ]
  },

  /* ---------------------------------------------------------------------
     8. SEMINARS — set show to false to hide this whole section.
     --------------------------------------------------------------------- */
  talks: {
    show: true,
    label: "Seminars",
    heading: "Talks attended",
    items: [
      {
        title: "CFD analysis of multiphase flows in porous media for hydrogen production",
        speaker: "Giuseppe Sassone, Fondazione Bruno Kessler, Trento",
        venue: "Department of Applied Science and Technology, Turin",
        note: "CFD modelling of multiphase flow in porous media for PEM and AEM electrolysers in OpenFOAM: grid independence, experimental validation, and how porous media properties drive electrolyser efficiency."
      },
      {
        title: "REP atomisation and nuclear fuel particle synthesis",
        speaker: "Bertrand Stepnik, R&D Director, Cerca Framatome",
        venue: "Mines Saint-Étienne",
        note: "Industrial R&D on the REP atomisation process for UMo particle synthesis for research reactors, and the role of academia–industry collaboration in advanced materials processing."
      }
    ]
  },

  /* ---------------------------------------------------------------------
     9. INSTITUTION LOGOS — the strip near the bottom of the page.

        Upload each logo into assets/ and name it below. A transparent PNG
        or an SVG looks best. Until you upload one, the institution's name
        shows as text instead, so nothing ever looks broken.

        Set show: false to hide the whole strip.
     --------------------------------------------------------------------- */
  logos: {
    show: true,
    label: "Institutions",
    heading: "Where I have studied and worked",
    items: [
      { name: "Technical University of Munich",  src: "assets/logo-tum.png",        href: "https://www.tum.de/" },
      { name: "Politecnico di Torino",           src: "assets/logo-polito.png",     href: "https://www.polito.it/" },
      { name: "IMT Mines Saint-Étienne",         src: "assets/logo-mines.png",      href: "https://www.mines-stetienne.fr/" },
      { name: "NED University of Engineering and Technology", src: "assets/logo-ned.png", href: "https://www.neduet.edu.pk/" },
      { name: "Fraunhofer ILT",                  src: "assets/logo-fraunhofer.png", href: "https://www.ilt.fraunhofer.de/" },
      { name: "IFP Energies nouvelles",          src: "assets/logo-ifpen.png",      href: "https://www.ifpenergiesnouvelles.com/" },
      { name: "Erasmus Mundus",                  src: "assets/logo-erasmus.png",    href: "" }
    ]
  },

  /* ---------------------------------------------------------------------
     10. CONTACT
        copy: true  adds a small "copy" button next to the value.
        href: ""    makes it plain text instead of a link.
     --------------------------------------------------------------------- */
  contact: {
    label: "Contact",
    heading: "Get in touch about flows",
    intro: "I'm glad to hear about research positions, simulation work, or any of the projects above.",
    links: [
      { label: "Email",    value: "wajihuddin23@gmail.com",   href: "mailto:wajihuddin23@gmail.com", copy: true },
      { label: "Academic", value: "mwajih.uddin@tum.de",      href: "mailto:mwajih.uddin@tum.de",    copy: true },
      { label: "LinkedIn", value: "Add your LinkedIn here",   href: "",                              copy: false },
      { label: "GitHub",   value: "Add your GitHub here",     href: "",                              copy: false },
      { label: "Based in", value: "Aachen, Germany",          href: "",                              copy: false }
    ],
    footerNote: "References available on request."
  },

  /* 11. FOOTER */
  footer: {
    text: "© 2026 Muhammad Wajih Uddin"
  }

};

window.CONTENT = CONTENT;
