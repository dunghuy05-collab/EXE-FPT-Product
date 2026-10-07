# PaceCar Design System

## Design direction

PaceCar uses a calm, road-inspired visual language: midnight navy communicates
trust, cobalt identifies actions and navigation, and a restrained amber accent
signals motion or emphasis. Off-white page backgrounds and white surfaces keep
long booking and dashboard flows readable. Gradients are reserved for the
landing hero and a small number of promotional surfaces.

## Tokens

| Role | Token / value | Use |
| --- | --- | --- |
| Brand midnight | `brand-950` `#111A3A` | Hero, dark brand surfaces |
| Brand blue | `brand-600` `#2452DF` | Primary actions, active navigation |
| Brand pale | `brand-50` `#EEF4FF` | Selected and informational surfaces |
| Motion accent | `signal-400` `#F7B938` | Focus ring and limited emphasis |
| Page background | `#F7F8FB` | Main application canvas |
| Surface | `#FFFFFF` | Cards, forms, overlays |
| Neutral text | Slate 950 / 700 / 500 | Headings / body / secondary text |
| Success | Emerald | Completed or verified states |
| Warning | Amber | Pending or attention-required states |
| Danger | Red | Errors, rejection, destructive actions |
| Information | Cobalt / cyan | Informational and in-progress states |

The corresponding brand and signal scales live in `client/tailwind.config.js`.
Status colors retain their established semantic palettes so color is not the
only state cue: badges and controls also include text, icons, or accessible
names.

## Type, spacing, and shape

- Typeface: Be Vietnam Pro, with a system sans-serif fallback.
- Headings: a compact, bold scale from 24 px section titles to 60 px desktop
  hero text; body copy uses 14–18 px with comfortable line height.
- Spacing: Tailwind's 4 px base spacing scale; content uses a centered
  `max-w-7xl` container with 16/24/32 px responsive gutters.
- Controls: minimum 44 px interaction height; inputs use 12 px corners.
- Cards: 20 px corner radius, a low-contrast border, and a soft elevation.
- Focus: a visible 3 px amber outline or a cobalt-tinted 4 px ring with offset.

## Elevation and interaction

- `soft`: `0 14px 45px rgba(17, 26, 58, .08)` for cards.
- `lift`: `0 22px 55px rgba(17, 26, 58, .14)` for registration emphasis.
- `focus`: `0 0 0 4px rgba(56, 108, 245, .2)` for focused controls.
- Hover feedback uses a small vertical translation, border/color change, or
  shadow; active controls return to rest with a subtle compression.
- Loading and disabled states preserve control dimensions and expose disabled
  semantics.
- Links styled as buttons render a single anchor via the shared `Button`
  component's `as` prop; actions remain native buttons.
- Motion uses short 180 ms interaction transitions and a one-shot 1.25 s hero
  drift, with an 18 s low-contrast ambient hero accent. The ambient motion pauses
  when the tab is hidden. `prefers-reduced-motion` removes nonessential
  animation and leaves the car illustration static.

## Illustration and assets

- The landing-page drifting car, road, smoke, streaks, and decorative marks are
  original inline SVG/CSS authored for PaceCar. They use no external image,
  video, or animation dependency.
- Existing vehicle and destination photography remains sourced from the
  Unsplash image URLs already present in the application; those are existing
  product assets, not part of the new hero illustration.
- Be Vietnam Pro is loaded from Google Fonts and is distributed under the
  SIL Open Font License.
- No new third-party visual asset was added.

## Shared UI surfaces

- `Button` centralizes primary, secondary, light, outline, dark, and danger
  states; it supports native buttons and semantic links.
- `.card`, `.input`, `.label`, and `.section-title` establish consistent
  surface and form styling across public pages, dashboards, and workflows.
- `CarCard`, `DashboardCard`, and `DashboardShell` retain their existing data
  behavior while inheriting the shared elevation, brand, and motion rules.
- `Navbar` exposes registration next to sign-in for guests on desktop and
  mobile.
- The landing page uses a responsive, custom drift illustration and an
  overlapping search surface. Registration is a two-column trust-and-form
  layout on large screens and a single-column form on narrow screens.

## Registration and legal information

The public registration route supports renter and owner roles only. Form fields
have inline validation and accessible error associations; password visibility,
consent, loading, duplicate-email, and API/network error states are explicit.
The server hashes the password, records the accepted demo terms version, and
issues a revocable session token after successful registration. Admin
registration remains unavailable.

`/terms` and `/privacy` explain the current demo's limitations and data handling.
They are informational demo text, not production-ready legal documents; the
service operator must review and approve them before enabling real-world
registration.

## Responsive and accessibility rules

- The public navigation collapses into a labeled mobile menu; the account
  dashboard uses a collapsible sidebar.
- Search, registration fields, card layouts, and dashboard surfaces reflow at
  Tailwind's standard breakpoints; the landing illustration scales without
  changing document flow.
- Inputs retain visible labels, inline errors use `aria-invalid` and
  `aria-describedby`, role and visibility toggles expose pressed state, and
  icon-only controls have accessible names.
- Keyboard focus remains visible, skip navigation is retained, and animation
  respects the system reduced-motion preference.
