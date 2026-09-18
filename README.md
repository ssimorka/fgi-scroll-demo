# FGI homepage — scroll / transition demo

Throwaway motion demo for the FGI homepage. Open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python -m http.server 8765`).

What it demonstrates:

- Lenis smooth scroll site-wide
- Panel stacking: Hero → FGI's Approach → Mission (the covered panel pins, recedes and fades while the next slides over it)
- Technology scroll sequence: pinned section, cards translate horizontally in proportion to scroll, next card peeks in; swipe carousel below 1024px
- Parallax on the Approach / Founders panels
- Page entrance: nav and hero copy rise in on load, fact tiles count up after. Skipped under `prefers-reduced-motion`
- Nav collapses on scroll to mark + Contact + menu; the menu is a tray that slides in from the right over the dimmed page (display links rise in, contact row) on every breakpoint
- Numbered sections (01 Approach, 02 Technology, 03 Mission, 04 Let's talk), drawn arrows everywhere whose shaft extends on hover, scroll-in reveals on headings / cards / tiles (`data-reveal`), and a closing "Let's talk." section of contact routes on a light ground above the footer

Copy, layout and assets come from the Figma file *FGI Site Design* (node `6070:13`). Video clips are 720p web encodes of licensed stock footage (`blood-draw-by-medical-professional-at-clinic-*.mov`, `mixing of blood 1.mov`, `DNA Sequence_LOOP.mov`; 4K / 1080p ProRes masters kept outside the repo). Posters in `assets/stills/` are each clip's first frame.

Stack: plain HTML/CSS/JS, GSAP + ScrollTrigger and Lenis from CDN. No build step.
