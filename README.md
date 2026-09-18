# FGI site — scroll / transition demo

Motion demo for the FGI site. Serve the folder with `python serve.py` (or any static server) and open `index.html`; `leadership.html` is the Leadership & Board page. Shared styles and behaviour (tokens, nav, menu tray, buttons, reveals, footer) live in `assets/site.css` and `assets/site.js`; each page keeps only its own script inline.

What it demonstrates:

- Lenis smooth scroll site-wide
- Panel stacking: Hero → FGI's Approach → Mission (the covered panel pins, recedes and fades while the next slides over it)
- Technology scroll sequence: pinned section, cards translate horizontally in proportion to scroll, next card peeks in; swipe carousel below 1024px
- Parallax on the Approach / Founders panels
- Page entrance: nav and hero copy rise in on load, fact tiles count up after. Skipped under `prefers-reduced-motion`
- Nav: Company has a hover/focus dropdown (Mission, Vision, Values / Leadership & Board / Company Milestones) in the frosted-pill surface; on scroll the bar collapses to mark + Contact + menu. The menu is a tray that slides in from the right over the dimmed page, with the same items as the bar and Company as a hover/tap accordion (BillionToOne pattern)
- Numbered sections (01 Approach, 02 Technology, 03 Mission, 04 Let's talk), drawn arrows everywhere whose shaft extends on hover, scroll-in reveals on headings / cards / tiles (`data-reveal`), and a closing "Let's talk." section of contact routes on a light ground above the footer

Copy, layout and assets come from the Figma file *FGI Site Design* (node `6070:13`). Video clips are 720p web encodes of licensed stock footage (`blood-draw-by-medical-professional-at-clinic-*.mov`, `mixing of blood 1.mov`, `DNA Sequence_LOOP.mov`; 4K / 1080p ProRes masters kept outside the repo). Posters in `assets/stills/` are each clip's first frame.

Leadership & Board (`leadership.html`, after 35pharma's About page): photo hero → "01" company statement panel → "02" Leadership, each sliding over the last with the same panel stacking as the home page (now generic in `site.js`: any `.stack-wrap` followed by a `.stack-over`). Three founder cards open a bio tray from the right (same move as the menu tray, light surface). Founders and affiliations are from the old site's Company page; bios are drafts pending FGI review. Headshots in `assets/team/` (originals in `assets/team/src/`); the hero photo is an EDSR ×2 super-resolution of the 1024px original. Board section to come when there is one.

Mission, Vision & Values (`company.html`): photo hero → "01" mission statement panel → "02" vision (split heading / copy, photo card) and "03" values (the four core principles as tiles) with a founders band linking to Leadership. Copy is FGI's own, from the old site and the investor deck (mission pillars, founder titles).

Company Milestones (`milestones.html`, after 35pharma's Pipeline page): sequencing-clip hero → "01" overview panel → "02" roadmap: one card per phase (Research, Validation, Launch preparation, Launch), a row per milestone with a bar (chart weight, brand data-viz palette) across the stages reached (planned / under way / complete), stage labels on the header row, a dot key under the cards. Bars draw in from the left on scroll. `site.css` also carries a generic `.chart` card (the Chartist horizontal bar chart in FGI type and colour: `--v` is a bar's length, `.s1/.s2/.s3` the series) for charts elsewhere. The seven milestones and the funding line are from the investor deck; the phase grouping is ours.

Stack: plain HTML/CSS/JS, GSAP + ScrollTrigger and Lenis from CDN. No build step.
