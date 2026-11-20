---
name: Sami El Akkad Portfolio
description: An editorial portfolio for applied AI products, agents, and workflow automation.
colors:
  ink: "#131d20"
  paper: "#f0eee7"
  sand: "#d9ac6d"
  sage: "#b5c7ba"
  muted: "#aab5b5"
  ink-divider: "#344044"
  paper-divider: "#cccfc7"
  paper-body: "#45564f"
  paper-secondary: "#53625e"
  paper-focus: "#876029"
  current-status: "#a5d7ae"
  dark-body: "#c6cfcb"
typography:
  headline:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "clamp(38px, 4.8vw, 68px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  arabic-body:
    fontFamily: "Noto Sans Arabic, Archivo, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  reading-title:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "clamp(40px, 6vw, 80px)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.04em"
rounded:
  frame: "3px"
  portrait: "2px"
  company-mark: "4px"
  round: "50%"
spacing:
  compact: "8px"
  related: "16px"
  group: "24px"
  wide: "32px"
  section-mobile: "65px"
  section-tablet: "80px"
components:
  button-primary:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.frame}"
    padding: "14px 22px"
  filter-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.frame}"
    padding: "10px 15px"
  reading-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  award-surface:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.ink}"
---

# Design System: Sami El Akkad Portfolio

## Overview

The system is an editorial product portfolio: large, direct typography; real work shown at useful scale; and detailed evidence available without forcing every visitor to read everything. Broad dark sections give product imagery room to stand out. Paper-colored reading surfaces support scanning and longer inspection. Sage marks recognition, while sand identifies action and selected proof.

The primary audience is AI product hiring teams. The design must also be understandable to visitors unfamiliar with model evaluation or agent architecture. A visitor can recognize the work, inspect Sami’s contribution, and reach him through ordinary links. This document records the implemented system, not a claim of formal accessibility certification.

Key characteristics:

- Real portraits, company marks, hardware photography, and product screenshots.
- Open editorial layouts followed by compact expandable project and career rows.
- English and Arabic pages with intentional direction and type treatment.
- Static HTML as the complete content layer; JavaScript adds discovery conveniences.

## Colors

### Primary

**Sand** carries primary buttons, emphasized hero words, selected project evidence, and dark-surface focus rings. It is an action and emphasis color, not a general body-text replacement.

### Secondary

**Sage** fills the awards section and selected image stages. It separates recognition from project browsing through a full surface change. **Current status** marks ongoing roles beside an explicit date/status label; the green dot never carries that meaning alone.

### Neutral

**Ink** and **paper** reverse roles by surface. Main portfolio sections use paper text on ink. The project archive, about section, and supporting reading pages use ink text on paper. **Muted** and **dark body** provide dark-surface text hierarchy. **Paper body** and **paper secondary** serve the corresponding readable roles on light surfaces.

**Ink divider** and **paper divider** follow their backgrounds. Use the dedicated **paper focus** color on light surfaces rather than carrying the sand ring unchanged.

**The surface rule.** Change the whole section’s ground when a new reading mode warrants it. Avoid adding arbitrary colored cards inside every section.

## Typography

Archivo is the shared Latin face. Noto Sans Arabic leads Arabic pages, with Archivo available for Latin names and labels. Both families are self-hosted as WOFF2 in `assets/fonts/`, with `font-display: swap` and CSS variable-weight ranges. Arial and generic sans-serif are fallback faces, not the intended presentation.

Headings use medium weight, tight spacing, and balanced lines. The section-headline role is fluid. Project titles and career names are deliberately smaller, so opening details does not create another competing hero. Body copy uses a relaxed line height and a maximum paragraph measure of 68 characters.

Reading pages use a distinct but related hierarchy: a fluid page title, 32px section headings, 23px subheadings, and body text with generous separation. Their title steps down to 42px on small screens. Arabic headings use looser line-height (1.35) and tracking (-0.025em); Arabic hero sizing is independently adjusted at responsive breakpoints.

**The content rule.** Preserve the difference between title, role, date, evidence, and body copy. Do not style all metadata as prominent badges.

## Layout

All primary sections share a centered container whose width is the viewport minus two fluid gutters, capped at 1440px. Desktop gutters use `clamp(24px, 5.55vw, 96px)`. They resolve to 32px at 800px and below, then 24px at 600px and below.

The implemented responsive breakpoints are 1100px, 800px, and 600px, with a wide-screen adjustment beginning at 1500px. At desktop sizes, the hero pairs copy with a portrait, featured work mixes one wide project with two smaller projects, and career details sit beside an introductory column. At tablet sizes the feature and career compositions simplify. At mobile sizes content stacks, filter controls wrap, project descriptions move below names, and details use the full readable column.

Homepage order is hero, selected work, awards, complete project archive, career, about, and contact. This order belongs to the homepage rather than every future surface. Awards remain before the career timeline. The early hero contact link remains available at smaller widths even when the navigation’s larger contact button is hidden.

Supporting pages keep the shared navigation and container. Reading layout is capped at 1080px, with thesis content capped at 840px. Wide data tables and code examples scroll inside their own focusable regions; the page itself should not scroll horizontally. Research notes, section indexes, and a simple footer use the light-surface palette.

## Elevation & Depth

The system is largely flat. Tonal surfaces, whitespace, and fine dividers establish hierarchy. Soft, offset shadows belong to screenshots placed on image stages, giving them separation without turning the whole page into floating cards. The portrait signature uses a small text shadow for legibility over photography.

Hover changes stay restrained: linked images scale within their frame, awards move upward slightly, and directional icons move or rotate. No scroll-driven animation is required to read content.

## Shapes

Frames and controls have small corners. Portrait frames are almost square; buttons and image stages use the shared frame radius. Company marks retain a small protective white field and their proportions. Circular shapes are reserved for image-opening controls and small status dots, not for cropping people into decorative masks.

Native expandable rows use dividers and a plus-shaped SVG that rotates when open. The disclosure remains a native `details` / `summary` control; visual styling does not replace keyboard behavior.

## Components

### Buttons and links

The primary button uses sand over ink, medium-weight type, generous horizontal spacing, and a minimum height of 54px. It provides fine-pointer hover feedback and a small press scale. The navigation contact variant is outlined. Text links retain an underline or border treatment with room for the inline SVG arrow. Interactive links generally provide a 44px minimum hit area.

Focus is immediate: a visible 3px outline, offset from the element. Light surfaces use the darker focus color. The skip link appears when focused and leads directly to main content.

### Navigation

Navigation uses the same container and a lower divider. The name anchors the left side in English; logical direction and Arabic typography adapt the translated page. Ordinary anchor links reach work, experience, about, and contact. The language link switches between complete pages. No overlay menu or custom focus trap is introduced.

### Project discovery

Category buttons are a named group with `aria-pressed` state. Search is a labeled native search input. Its mobile text size is 16px to avoid automatic iOS input zoom. Category and text query combine to filter project rows; the visible result count is announced and an empty message appears when nothing matches.

The toolbar starts hidden in HTML and appears only once JavaScript can operate it. All project content exists in HTML and remains available with JavaScript disabled. Native disclosures work without the filter script. A direct project hash resets the filter, reveals and opens the destination, and scrolls it into view.

### Project and career disclosures

Rows summarize enough to support scanning. Expanded content separates ownership, work performed, output, limits, and evidence links. Current roles use both a readable date/status and a colored dot. External company links identify affiliation; they do not imply that private company source is publicly available.

### Images and evidence

Featured images are real screenshots or photographs. The JakMa feature uses a captured product-search screen, not a fabricated interface. Evidence lines below featured copy retain the scope of the claim: fixture tests, prototype roles, or a team award. Image links reach a real product or the associated project details.

### Reading pages

Thesis content is pre-rendered HTML, with an in-page index and a visible scope note. Project stories preserve English and Arabic content, use native anchors, and identify concept-stage work. No runtime Markdown fetch or external rendering library is needed.

### Contact and motion

Contact uses a `mailto:` link and named professional-profile links. There is no simulated submission form or delivery-success state.

The authored entrance is confined to the hero: copy rises a short distance from an already-visible state, and the portrait settles from a slight scale. Interaction transitions use the shared ease-out curve. Fine-pointer hover is gated by capability. Keyboard-focused disclosure icons, buttons, and link arrows skip their transitions. Reduced-motion preferences remove animations, reset transforms and opacity, and switch scrolling to immediate behavior. Disclosure and filter actions never wait for an entrance animation to finish.

## Do's and Don'ts

### Do:

- Do preserve real imagery, direct first-person copy, and explicit evidence scope.
- Do keep readable content available in static HTML and native disclosures.
- Do use the shared container edges and the translated page’s logical direction.
- Do retain visible focus, reduced-motion treatment, and an early contact route.
- Do distinguish a personal contribution from a team result and a prototype from a deployed system.

### Don't:

- Don’t invent live interfaces, metrics, clients, outcomes, or public access to company work.
- Don’t replace the local fonts with external runtime dependencies.
- Don’t convert every row into a raised rounded card or add repeated scroll reveals.
- Don’t hide primary actions behind hover-only behavior.
- Don’t describe filter availability or message delivery as successful before it has actually occurred.
