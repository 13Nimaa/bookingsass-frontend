# Dashboard Audit — Independent Validation

| Field | Value |
| ----- | ----- |
| Original report | `design-audit/reports/dashboard-audit.md` |
| Validator role | Principal Product Designer (independent) |
| Evidence reviewed | `desktop-1440x900.png`, `tablet-768x1024.png`, `mobile-390x844.png` + `PRODUCT_CONTEXT.md` |
| Scope | Validate reported findings only — no new issues, no code changes, original audit untouched |
| Date | 2026-11-03 |

---

## Validation method

For each finding: check screenshot support → classify (visual defect / usability / product decision / preference) → challenge the recommendation → note side effects → verdict.

Verdicts used: **APPROVED** · **APPROVED WITH MODIFICATIONS** · **REJECTED** · **NEEDS PRODUCT DECISION**

---

## Finding-by-finding validation

### UI-001: Tablet layout crushes hub cards beside a full sidebar

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported.** Sidebar remains at tablet width; main canvas is narrow; hub cards look cramped relative to desktop. PRODUCT_CONTEXT confirms sidebar appears from `md` (~768px) at ~232px. Grid uses three columns from that same breakpoint — the squeeze is real. |
| Classification | **Usability problem** (readability / touch target comfort), not taste. |
| Challenge to recommendation | “Hide or collapse the sidebar” is a larger IA/chrome change than the evidence requires. Forcing **2 columns while the sidebar is present** fixes card width without redesigning shell chrome. Collapsing the sidebar earlier is valid only if product wants tablet to behave like mobile. |
| Negative side effects | Collapsing the sidebar at tablet removes persistent IA that desktop users may expect on iPad landscape. A 2-column grid with sidebar keeps orientation and only changes density. |
| Is the improvement better? | **Yes**, if scoped to grid columns (or a later sidebar collapse *after* product agrees). |
| Better alternative | Prefer: keep sidebar; switch hub to **2 columns for `md`–`lg`**, 3 columns only when content width can sustain ≥ ~200px cards. Treat full sidebar collapse as a separate chrome decision. |

**Verdict: APPROVED WITH MODIFICATIONS**  
Downgrade implementation scope to **responsive grid adjustment first**. Severity **High** is fair for readability.

---

### UI-002: Mobile shows “داشبورد” twice in the first viewport

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Clearly supported** by `mobile-390x844.png`: glass bar title and in-body H2 both read «داشبورد». |
| Classification | **Visual hierarchy / usability** — duplicate page name wastes attention (PRODUCT_CONTEXT “one job per screen region”). |
| Challenge to recommendation | Either keep glass **or** keep body title — both work. Removing the body H2 is cleaner because the glass bar is the established mobile chrome pattern; keep the supporting sentence under the glass spacer. |
| Negative side effects | Removing the body block without relocating the subtitle would leave mobile with title-only and no instructional line. Do not remove both title and subtitle. |
| Is the improvement better? | **Yes.** |
| Better alternative | Remove redundant in-body H2; retain subtitle; align remaining text to system tokens (see UI-008). |

**Verdict: APPROVED**  
Severity **High** is slightly strong for a non-blocking hierarchy issue, but still justified as first-viewport noise. Acceptable as **High** for a calm CRM home.

---

### UI-003: Five-card grid leaves a permanent empty slot

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported** on all three screenshots: last row is incomplete (desktop 3+2, mobile 2+2+1). |
| Classification | Mostly **visual composition / preference**, not a task blocker. Odd counts always leave a hole unless you change structure. |
| Challenge to recommendation | Calling this Medium and urging recomposition overstates user harm. Non-technical owners are not failing tasks because of an empty cell. “2×3 with a full-width CTA” invents a sixth interaction without product need. A 2-column desktop grid is a legitimate alternative, but it trades density for balance — not strictly “more correct.” |
| Negative side effects | Full-width CTA row invites fake secondary actions. Strict 2-column desktop makes the hub taller and can worsen the “empty lower canvas” perception (UI-004) unless content strategy changes. |
| Is the improvement better? | **Maybe** — balance improves; product clarity does not automatically improve. |
| Better alternative | **Accept asymmetric last row** as normal for five modules, **or** move to 2 columns primarily to improve card readability (aligns with UI-001), not to “fill the hole.” Do not add placeholder tiles. |

**Verdict: APPROVED WITH MODIFICATIONS**  
Keep as a **Low–Medium visual polish** item. Do not treat as a usability defect requiring structural invention. Preferred fix path: shared with UI-001 (column rules), not a decorative fill.

---

### UI-004: Large unused lower canvas on desktop and tablet

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported visually** — large empty region below the grid on desktop and tablet. |
| Classification | **Ambiguous: preference vs product maturity.** PRODUCT_CONTEXT prioritizes clarity over density and calm premium CRM. Sparse launcher + whitespace can be intentional. |
| Challenge to recommendation | Framing empty space as “abandoned” pushes toward filling. Suggested “footer hint / what’s next / secondary panel” risks decorative filler or fabricated owner value — which the original audit itself warns against. Half-empty canvas is often **intentional breathing room** on a short hub, not a defect. |
| Negative side effects | Adding panels without real data creates a fake dashboard, raises maintenance cost, and conflicts with “don’t invent Bookings/metrics.” Tightening spacing alone may look denser without helping tasks. |
| Is the improvement better? | **Not as stated.** Filling is not better. Mild top-spacing tighten is optional polish only. |
| Better alternative | Do **not** hand this to engineering as “add content.” Address expectation via **naming** (UI-009) when product decides. Leave whitespace until real owner summary content exists. |

**Verdict: REJECTED** (as an actionable visual defect)  
Reclassify as **observation / product maturity note**, not a fix ticket. Empty space here is not proven harmful relative to product principles.

---

### UI-005: Sidebar has no active item on the Dashboard home

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported** on desktop/tablet screenshots: no sidebar item uses the `primary-soft` active treatment; page title alone signals location. Mobile tab correctly marks Dashboard. |
| Classification | **Product / IA decision**, with a light usability angle (“you are here”). |
| Challenge to recommendation | Adding a Dashboard sidebar item **creates another duplicate** of the hub (and of mobile’s Dashboard tab). Applying “active” styling with no corresponding nav item is confusing. Current IA treats `/dashboard` as hub-via-title, modules-via-sidebar — asymmetric but coherent. |
| Negative side effects | Extra sidebar row increases duplication with hub cards (UI-006 tension). Active-but-not-a-destination patterns teach the wrong mental model. |
| Is the improvement better? | **Only if product wants Dashboard in the persistent IA.** Not automatically better. |
| Better alternative | **Option A (preferred default):** leave as-is; page title is enough. **Option B:** add explicit «داشبورد» / «میز کار» to sidebar after product agrees. Do not invent a non-link active ghost state. |

**Verdict: NEEDS PRODUCT DECISION**  
Not safe to implement from audit alone.

---

### UI-006: Desktop hub cards mirror the sidebar with equal visual weight

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported** — same five destinations appear as sidebar links and as large cards. |
| Classification | Largely **product pattern / preference**. PRODUCT_CONTEXT explicitly allows an intentional hub grid alongside sidebar chrome and calls out dual chrome as preserved. |
| Challenge to recommendation | For non-technical salon owners, large labeled cards with descriptions are **useful shortcuts**, not pure waste. Sidebar is efficient for return visits; cards teach the IA. Removing or “slimming” the hub to welcome-only hurts recognition and target size. Equal card weight is appropriate when no module is privileged by product yet (Bookings not shipped). |
| Negative side effects | Task-ordering cards without real usage data invents priority. Status lines without live data become fake. Relying only on sidebar raises cognitive load for novices. |
| Is the improvement better? | **Not as a removal/slim mandate.** Optional future differentiation is fine; redundancy alone is not a defect here. |
| Better alternative | Preserve dual entry. If improving: slightly richer card affordance (already present via descriptions) is enough. Do not remove the grid on desktop. |

**Verdict: REJECTED** (as a defect requiring differentiation/removal)  
Document as **intentional dual chrome** aligned with PRODUCT_CONTEXT. Revisit only when modules gain unequal operational urgency (e.g. Bookings live).

---

### UI-007: Profile appears twice in mobile chrome + hub

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported** — Profile in bottom tab and as first hub card. |
| Classification | **Minor redundancy / polish.** Mild usability nuance for thumb reach, not a failure. |
| Challenge to recommendation | Omitting Profile from the grid is reasonable. Reordering to “operational first” is taste unless backed by owner task priority (often Business/Services first — plausible). Do not also strip Business solely because the tab says «کسب‌وکارها» — those can be different destinations. |
| Negative side effects | Grid no longer lists “every module”; novices who ignore the tab lose a large Profile target (still available in tab). |
| Is the improvement better? | **Slightly**, if Profile stays in the tab and hub leads with salon ops. |
| Better alternative | On mobile only: omit Profile from hub **or** move it last; keep all other modules. Optional — not blocking. |

**Verdict: APPROVED WITH MODIFICATIONS**  
Severity **Low** stands. Scope: mobile hub ordering/omission only; no desktop change required.

---

### UI-008: Mobile body title uses off-token warm ink

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported in implementation intent** (`#221F1C` vs system `#1e1b4b`). Screenshot difference is subtle; audit’s metric claim is plausible. PRODUCT_CONTEXT treats hardcoded near-matches as drift when they break the ink contract. |
| Classification | **Minor visual consistency / token fidelity** — not a usability blocker. |
| Challenge to recommendation | If UI-002 removes the H2, this finding **dissolves**. Fixing color alone while keeping duplicate titles is incomplete. |
| Negative side effects | None meaningful if swapped to `text-text-primary`. |
| Is the improvement better? | **Yes**, only if the element remains. |
| Better alternative | Fold into UI-002: delete duplicate H2 **or** retoken remaining title. |

**Verdict: APPROVED WITH MODIFICATIONS**  
Treat as **subsumed by UI-002** unless the body title is kept.

---

### UI-009: “داشبورد” naming vs launcher-only content

| Check | Assessment |
| ----- | ---------- |
| Evidence support | **Supported** — title «داشبورد»; content is module navigation; subtitle already explains “pick a section.” |
| Classification | **Product / copy decision** (expectation mismatch), not a visual defect. |
| Challenge to recommendation | Retitling to «میز کار» may help; it also breaks consistency with the mobile tab label «داشبورد». Adding a status strip without real data recreates the UI-004 filler risk. Subtitle already mitigates much of the mismatch. |
| Negative side effects | Rename without updating tab/sidebar language fragments IA vocabulary. Premature KPI strip creates a fake operational dashboard. |
| Is the improvement better? | **Only after product picks a naming model** (launcher vs future overview). |
| Better alternative | Keep current title until Bookings/summary exists **or** explicitly decide “hub” naming across glass title, body, and tab together. |

**Verdict: NEEDS PRODUCT DECISION**  
Not a coding-agent ticket by itself.

---

## Cross-cutting challenges (as requested)

| Theme | Independent take |
| ----- | ---------------- |
| Empty space vs intentional whitespace | UI-004’s empty lower canvas is closer to **intentional calm** than a defect. Do not fill. |
| Navigation duplication vs shortcuts | UI-006 duplication is **useful for novices** and matches preserved dual chrome. Do not remove the hub. |
| Dashboard naming vs scope | UI-009 is real conceptually; fix is **copy/IA**, not layout. |
| Responsive trade-offs | UI-001 is the strongest validated issue. Prefer grid column fix over early sidebar removal. |
| Consistency vs uniformity | UI-008 token drift is real but minor. UI-003 empty cell ≠ mandatory uniformity. |
| Density vs breathing room | Sparse hub aligns with PRODUCT_CONTEXT clarity-over-density. Score should not be punished for refusing fake widgets. |

---

## Score challenge

Original overall score: **6.5 / 10**.

Independent view: **7.0–7.5 / 10** is fairer if UI-004 and UI-006 are not counted as defects. Remaining real drag: tablet squeeze (UI-001), mobile double title (UI-002), mild odd-grid polish (UI-003), unresolved naming (UI-009 as product debt).

Dimension scores that look over-penalized: **Information Density (5)** and parts of **Layout (5.5)** — they punish launcher emptiness that product principles allow.

---

## Verdict summary

| ID | Original severity | Verdict | Notes |
| -- | ----------------- | ------- | ----- |
| UI-001 | High | **APPROVED WITH MODIFICATIONS** | Fix columns before collapsing sidebar |
| UI-002 | High | **APPROVED** | Remove duplicate mobile title; keep subtitle |
| UI-003 | Medium | **APPROVED WITH MODIFICATIONS** | Polish only; don’t invent a sixth tile/CTA |
| UI-004 | Medium | **REJECTED** | Intentional whitespace / no fill without real content |
| UI-005 | Medium | **NEEDS PRODUCT DECISION** | Sidebar home item is IA, not a craft fix |
| UI-006 | Medium | **REJECTED** | Intentional dual chrome; keep hub cards |
| UI-007 | Low | **APPROVED WITH MODIFICATIONS** | Optional mobile Profile omit/reorder |
| UI-008 | Low | **APPROVED WITH MODIFICATIONS** | Subsume into UI-002 if H2 removed |
| UI-009 | Medium | **NEEDS PRODUCT DECISION** | Naming model across title + tab |

---

## Safe to hand to a coding agent

Implement only these, in order:

1. **UI-001 (modified)** — At tablet widths where the 232px sidebar is visible, use a **2-column** hub grid (keep 3-column only when content width comfortably supports it). Do **not** hide the sidebar unless a separate product ticket says so.
2. **UI-002** — On mobile dashboard home, show **one** «داشبورد» title (prefer glass `PageHeader`). Remove the redundant in-body H2. **Keep** the supporting sentence.
3. **UI-008 (if needed)** — Any remaining mobile home title/subtitle text should use system text tokens (`text-text-primary` / muted), not `#221F1C` drift.
4. **UI-007 (optional, Low)** — Mobile hub only: omit Profile from the card grid **or** place it last so operational modules lead. Do not change desktop hub for this.

### Explicitly **not** safe for a coding agent yet

- **UI-004** — no filler panels, footers, or fake “what’s next.”
- **UI-005** — no sidebar Dashboard item / ghost active state without product sign-off.
- **UI-006** — do not remove or “slim” the desktop hub vs sidebar.
- **UI-009** — no rename / KPI strip without product sign-off.
- **UI-003** — only as a side effect of the UI-001 column rule; no decorative recomposition project.

---

## Final assessment

The original audit is **directionally careful** and correctly avoids inventing Bookings UI. Its strongest evidence-backed finding is **tablet card crush (UI-001)** plus **mobile duplicate title (UI-002)**. It over-reaches when it treats **calm empty canvas** and **intentional hub/sidebar duplication** as Medium defects — those conflict with PRODUCT_CONTEXT’s clarity-over-density and dual-chrome decisions.

Hand the modified short list above to engineering. Park IA/naming items for product. Preserve the indigo RTL launcher identity.
