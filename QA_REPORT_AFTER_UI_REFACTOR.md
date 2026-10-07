# QA Report — PaceCar UI Refactor

**Date:** 2026-10-07 (Asia/Ho_Chi_Minh)
**Environment:** Windows; local Vite + Express; isolated temporary JSON database
**Browser:** Google Chrome 154.0.8037.98, headless Chromium for repeatable checks
**Viewports:** 1920, 1440, 1024, 768, and 430 CSS px
**Build under test:** Final local worktree after UI, registration, and QA
remediation. No production data or production mutations were used.

## 1. Executive summary

The production build and backend smoke suite pass. The remediation pass fixed
all three original findings and one additional 1 px overflow discovered during
the post-fix responsive matrix. A final browser regression matrix checked 90
public and role-protected screen/viewport combinations; every checked route
rendered one main landmark, a primary heading, and no horizontal overflow.
Login errors are announced and associated with both credential fields.
Registration, session creation and revocation, search recovery, the listing
wizard's required-field validation, the admin modal's keyboard behavior, and
reduced-motion fallbacks were exercised locally.

The new terms and privacy pages explicitly identify themselves as demo text;
they are not ready to serve as production legal documents. The product should
not be released for real account creation until they are reviewed and approved.

## 2. Scope and method

- Reviewed the new landing hero, custom drift illustration, global design
  tokens, navigation, registration and demo legal-information routes.
- Ran backend tests against the test runner's temporary database and browser
  flows against a separate local database selected with
  `PACECAR_DB_FILE=%TEMP%\\pacecar-browser-qa-e245.json`.
- Did not book a vehicle, submit payment, sign a contract, upload files, approve
  or reject a listing, or alter production data.
- Used the prior UI screenshots in `qa-evidence/` as the pre-refactor visual
  comparison; those supplied files were left unchanged.

## 3. Test matrix

| Area                                           | Result                          | Evidence / notes                                                                                                                                                                                                  |
| ---------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` backend smoke suite                 | Pass                            | Registration validation, renter/owner role allowlist, case-insensitive duplicate guard, scrypt password hash, consent persistence, session issue/login/logout and existing booking/authorization/rating checks    |
| `npm run build --prefix client`                | Pass                            | Vite production build completed                                                                                                                                                                                   |
| `git diff --check`                             | Pass                            | No whitespace errors                                                                                                                                                                                              |
| `GET /api/health`                              | Pass                            | `200 { ok: true, name: "PaceCar API" }`                                                                                                                                                                           |
| Public routes                                  | Pass                            | Home, search/list, two car details, help, terms, privacy, and 404 rendered                                                                                                                                        |
| Search/filter URL state                        | Pass                            | Default search navigated to results; SUV + price sort returned 4 results                                                                                                                                          |
| Past-date search recovery                      | Pass                            | Server error shown with recovery action; choosing a new time restored 10 valid results                                                                                                                            |
| Renter / owner / admin login                   | Pass                            | Seed accounts signed in and opened the expected dashboard                                                                                                                                                         |
| Role guard                                     | Pass                            | Renter opening the admin route was returned to the renter dashboard                                                                                                                                               |
| Registration: renter / owner                   | Pass                            | Backend suite covered both roles; browser completed owner and renter registration using the isolated DB                                                                                                           |
| Registration validation                        | Pass                            | Password mismatch, missing consent, duplicate email, disallowed admin role, invalid email/phone, and weak password rejected; API errors remained field-scoped                                                     |
| Registration API/network failure               | Pass                            | Clear error shown; entered form values remained available                                                                                                                                                         |
| Session after registration / logout            | Pass                            | Newly registered user was authenticated; smoke suite verified logout invalidates its token                                                                                                                        |
| Renter screens                                 | Pass                            | Dashboard, bookings, favorites, profile, contract, evidence rendered at mobile width                                                                                                                              |
| Owner screens                                  | Pass                            | Dashboard, fleet, listing wizard, and risk alerts rendered; advancing an empty wizard showed required-field validation                                                                                            |
| Admin screens                                  | Pass                            | Dashboard, car approvals, promotions, and risk alerts rendered                                                                                                                                                    |
| Admin modal                                    | Pass                            | At 430 px the dialog stayed inside the viewport; Shift+Tab remained trapped, Escape closed it, and focus returned to its trigger                                                                                  |
| Responsive matrix                              | Pass after remediation          | 90 screen/role/viewport checks across five widths; no horizontal overflow and one main landmark per route                                                                                                         |
| Initial loading width                          | Pass after fix                  | Eight fresh-load trials at 430 px remained within the viewport from the first measured frame                                                                                                                      |
| Reduced motion                                 | Pass                            | Drift car and ambient orb computed to `animation: none` under `prefers-reduced-motion`                                                                                                                            |
| Hidden-state animation                         | Partial                         | Synthetic `visibilitychange` paused the ambient orb and marked the drift illustration inactive; headless Chrome did not expose a real background-tab `visibilityState` transition                                 |
| Keyboard and nested interactive elements       | Pass                            | Skip link was first Tab stop and targets `#main-content`; no nested anchor/button controls were found in checked screens                                                                                          |
| Main landmark                                  | Pass after fix                  | Exactly one site-wide `<main id="main-content">` was found on each sampled public route; route content no longer creates nested landmarks                                                                         |
| Login failure announcement                     | Pass after fix                  | A 401 is shown in a `role="alert"` region, associated with both credential fields, and cleared when either field is edited                                                                                        |
| Post-fix 90-screen matrix                      | Pass                            | No overflow or missing-heading/landmark issue across 18 role/route combinations at five widths                                                                                                                    |
| Console / server errors                        | Pass with expected test traffic | No uncaught page exception or HTTP 5xx was observed. Font/image requests cancelled during route changes were navigation aborts; the isolated network-failure case was deliberately aborted and handled by the UI. |
| 200% zoom / automated contrast scan            | Not tested                      | No screen-reader/axe or physical-device test was available                                                                                                                                                        |
| Booking/payment/signing/upload/admin mutations | Not tested                      | Deliberately excluded from this read-only UI QA pass                                                                                                                                                              |

## 4. Findings

### QA-A11Y-001 — Missing site-wide main landmark

- **Severity:** Medium
- **Category:** Accessibility
- **Route / role:** Public and authenticated routes / all roles
- **Environment:** Local Chrome, 430–1440 px
- **Status:** Fixed and verified
- **Precondition:** Open a route other than registration.
- **Steps:** Inspect the accessibility landmark tree or query `main` elements on
  `/` and `/login`.
- **Expected:** One site-level main landmark containing the current route; the
  skip link should move focus to it.
- **Actual before fix:** `#main-content` was a focusable `DIV`; some routes
  exposed no `<main>`, while registration had an inconsistent inner landmark.
- **Fix / verification:** The shared wrapper is now the single semantic
  `<main id="main-content">`; nested page-level main elements were converted to
  non-landmark containers. Five public routes and the 90-route/role/viewpor
  matrix each exposed exactly one main landmark.
- **Impact:** Screen-reader users cannot reliably navigate to the primary
  content landmark even though the skip-link anchor itself works.
- **Evidence:** DOM inspection; skip link target `#main-content`.

### QA-A11Y-002 — Login error is not announced or associated with fields

- **Severity:** Medium
- **Category:** Accessibility / Authentication UX
- **Route / role:** `/login` / gues
- **Environment:** Local Chrome
- **Status:** Fixed and verified
- **Precondition:** Submit a valid demo email with an incorrect password.
- **Steps:** Open `/login`, enter `renter@pacecar.vn` and an incorrect password,
  then submit.
- **Expected:** The authentication error is announced and programmatically
  connected to the relevant credential fields.
- **Actual before fix:** “Email hoặc mật khẩu không đúng” appeared in a plain
  paragraph without a live-region role or field associations.
- **Fix / verification:** Login failures now appear in a `role="alert"` region;
  both credential inputs receive `aria-invalid` and `aria-describedby`, and
  editing either field clears the stale failure. Invalid and valid credential
  flows were exercised in the browser.
- **Evidence:** DOM inspection after the API returned 401; no raw exception was
  shown.

### QA-RWD-001 — Two-pixel overflow on the initial mobile results frame

- **Severity:** Low
- **Category:** Responsive / Visual
- **Route / role:** `/cars` / gues
- **Environment:** Local Chrome, 430 × 932 CSS px
- **Status:** Fixed and verified (8/8 fresh-load trials)
- **Precondition:** Open `/cars` in a fresh 430 px viewport while the list is
  loading.
- **Steps:** Measure `document.documentElement.scrollWidth` immediately after
  `DOMContentLoaded`.
- **Expected:** Document width never exceeds the viewport.
- **Actual before fix:** Initial document width was 432 px for a 430 px clien
  viewport. The loading surface's grid item retained an intrinsic minimum
  width.
- **Fix / verification:** Added `min-w-0` to the loading surface and its
  results-page boundary. Eight delayed-response, fresh-load trials measured no
  overflow on the first frame.
- **Impact:** A brief, small horizontal scroll edge during initial loading.
- **Evidence:** `ui-refactor-evidence/cars-initial-430.png` and the measured
  initial/stable widths recorded during QA.

### QA-RWD-002 — Status badges overflow the owner dashboard at 1024 px

- **Severity:** Low
- **Category:** Responsive / Visual
- **Route / role:** `/dashboard/owner` / owner
- **Environment:** Local Chrome, 1024 × 900 CSS px
- **Status:** Fixed and verified
- **Precondition:** Sign in as the seeded owner and open the dashboard at 1024
  px.
- **Actual before fix:** A long alert status label stayed on the same flex row
  as its alert type, expanding the document to 1010 px against a 1009 px
  client viewport.
- **Fix / verification:** Allow alert and calendar status rows to wrap. The
  repeated 90-combination route/role/viewport matrix now has no horizontal
  overflow.

## 5. Regression and functional notes

- The pre-refactor landing screenshots show the former photographic hero; the
  new screenshots show the custom SVG car and responsive search surface.
- Rating/review summary assertions remain consistent in backend smoke tests.
- Owner/admin risk-alert routes rendered without a runtime exception.
- The listing wizard rejected progression from an empty required first step.
- Search failures offer a working “choose a new time” recovery action.
- Existing vehicle and destination images still depend on their existing
  Unsplash URLs; they were not replaced by new external assets.

## 6. Performance and animation

### Bundle comparison

| Build artifact | Before redesign (gzip) | After redesign (gzip) |           Change |
| -------------- | ---------------------: | --------------------: | ---------------: |
| CSS            |                7.03 KB |               8.66 KB |         +1.63 KB |
| JavaScript     |              117.59 KB |             123.40 KB |         +5.81 KB |
| Combined       |              124.62 KB |             132.06 KB | +7.44 KB (+6.0%) |

The new illustration is inline SVG/CSS; no video, animation package, or new
third-party image was introduced.

A single cold local-dev Chrome sample recorded FCP ≈ 2.90 s, LCP ≈ 2.96 s and
CLS ≈ 0.018. This is a non-throttled development measurement, not a production
performance guarantee; a comparable pre-refactor browser baseline was no
captured. The real background-tab transition could not be validated in
headless Chrome; its `visibilitychange` handler and paused CSS state were
verified synthetically.

## 7. Responsive and accessibility summary

- Stable layout checks passed at all five requested widths for the 90 tested
  route/role combinations.
- Registration is single-column at mobile width; all fields and role choices
  stayed within the viewport.
- The modal was contained at 430 px and passed basic keyboard close/focus
  behavior.
- Focus order reaches the skip link first; checked pages had no nested
  interactive link/button pairs.
- Reduced motion disables both the drift and ambient animation.
- Automated contrast measurement, 200% browser zoom, screen-reader output,
  physical mobile behavior, and non-Chromium browser behavior remain
  unverified.

## 8. Screenshots and logs

**Before (existing, preserved):**

- Desktop: `qa-evidence/home-1440.png`
- Mobile: `qa-evidence/home-430.png`

**After:**

- Home desktop: `ui-refactor-evidence/home-1440-after.png`
- Home mobile: `ui-refactor-evidence/home-430-after.png`
- Registration desktop: `ui-refactor-evidence/register-1440-after.png`
- Registration mobile: `ui-refactor-evidence/register-430-after.png`
- Initial-width observation: `ui-refactor-evidence/cars-initial-430.png`

## 9. Limitations and release gate

- QA used seeded demo accounts and generated test-only registration details on
  a local temporary database. Production was not modified.
- No real booking, payment, contract signature, upload, approval, rejection, or
  deletion was attempted.
- `/terms` and `/privacy` intentionally disclose that their content is demo
  information. Legal/privacy review is required before production accoun
  registration.
- Cold-load vitals and external image/font behavior need a production-like
  network/throttling pass before release.

## 10. Fix before release

1. Obtain legal/privacy approval for the terms and privacy text before enabling
   real account creation in production.

## 11. Optional follow-up

- Repeat performance sampling against the pre-refactor bundle in a production
  preview with the same throttling and cache conditions.
- Run automated contrast/accessibility checks and test with a screen reader.
- Verify background-tab pausing and 200% zoom in a headed browser and on a
  physical mobile device.
