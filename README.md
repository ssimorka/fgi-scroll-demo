# FGI homepage — scroll / transition demo

Throwaway motion demo for the FGI homepage. Open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python -m http.server 8765`).

What it demonstrates:

- Lenis smooth scroll site-wide
- Panel stacking: Hero → FGI's Approach → Mission (the covered panel pins, recedes and fades while the next slides over it)
- Technology scroll sequence: pinned section, cards translate horizontally in proportion to scroll, next card peeks in; swipe carousel below 1024px
- Parallax on the Approach / Founders panels

Copy, layout and assets come from the Figma file *FGI Site Design* (node `6070:13`). Video clips are watermarked stock placeholders, licensing pending — not final assets.

Stack: plain HTML/CSS/JS, GSAP + ScrollTrigger and Lenis from CDN. No build step.
