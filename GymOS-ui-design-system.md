# GymOS — UI Design System & Development Guide

> **This document defines the visual design system for the GymOS web dashboard.**
> All UI components, pages, and layouts must follow these specifications.
> This is a design-system-only document — it does not define individual pages or routing.

---

## 1. Design Overview

**Product:** GymOS — Gym Management System
**Design Style:** Modern SaaS / Admin Dashboard
**Target Users:** Gym administrators, managers, trainers
**Design Direction:** Clean, professional, minimal, data-focused

The interface should communicate **professionalism, reliability, organization, and fitness** without looking overly sporty or flashy.

The visual design uses a **dark navy + green + neutral white/gray** color system.

---

## 2. Color Palette

### Primary Colors

| Color           | Hex       | Usage                                      |
| --------------- | --------- | ------------------------------------------ |
| Primary Green   | `#007A35` | Primary buttons, active states, highlights |
| Secondary Green | `#4C956C` | Charts, secondary indicators               |
| Dark Navy       | `#171B28` | Sidebar, dark panels                       |
| Deep Navy       | `#10131D` | Dark backgrounds / emphasis                |

#### Primary Green `#007A35`

Use for:
- Primary buttons
- Active navigation
- Success states
- Selected tabs
- Progress indicators
- Important numbers
- Links
- Positive statistics

The green should be used as an **accent**, rather than covering large areas of the interface.

---

## 3. Neutral Colors

| Color           | Hex       | Usage                               |
| --------------- | --------- | ----------------------------------- |
| Main Background | `#F8F7F8` | Main application background         |
| White           | `#FFFFFF` | Cards and panels                    |
| Light Gray      | `#F2F1F2` | Input backgrounds / secondary areas |
| Border Gray     | `#E1E1E4` | Card and input borders              |
| Medium Gray     | `#777777` | Secondary text                      |
| Dark Gray       | `#44444A` | Normal text                         |
| Black           | `#111318` | Main headings                       |

The interface should have a **very light, almost white background** with white cards placed on top of it.

---

## 4. Semantic Colors

### Success — `#00833F`
- Active members
- Paid status
- Checked-in status
- Successful actions
- Positive progress

### Error / Danger — `#D71920`
- Expired memberships
- Medical warnings
- Errors
- Failed payments
- Destructive actions

### Warning — `#F97316`
- Pending renewals
- Upcoming expiration
- Warnings
- Attention-required states

### Information — `#4F6BFF`
Used sparingly for:
- Informational indicators
- Neutral notifications
- Secondary data visualizations

---

## 5. Typography

### Primary Font: **Inter**

If Inter is unavailable, use `Manrope` or `system-ui` as fallbacks.

### Font Hierarchy

| Element          | Size       | Weight | Color     | Notes                      |
| ---------------- | ---------- | ------ | --------- | -------------------------- |
| Page Heading     | 28–32px    | 700    | `#111318` | e.g. "Welcome back, Admin" |
| Section Heading  | 15–16px    | 600    | `#111318` | e.g. "Revenue Overview"    |
| Card Heading     | 13–15px    | 600    | `#111318` |                            |
| Body Text        | 12–14px    | 400    | `#44444A` |                            |
| Secondary Text   | 11–12px    | 400    | `#777777` |                            |
| Statistics       | 20–24px    | 700    | `#111318` | Positive stats use `#007A35` |
| Uppercase Labels | 10–11px    | 600    | `#777777` | e.g. "TOTAL MEMBERS"      |

### Typography Characteristics

The typography should feel: **Clean, Compact, Professional, Highly Readable, Modern**

Avoid:
- Decorative or serif fonts
- Extremely bold text everywhere
- Large oversized headings
- Excessive uppercase text

Uppercase should mainly be used for small labels: `TOTAL MEMBERS`, `ACTIVE MEMBERS`, `PAYMENT STATUS`, `EXPIRY DATE`

---

## 6. Layout System

The overall interface uses a **12-column desktop grid**.

| Property              | Value       |
| --------------------- | ----------- |
| Maximum content width | 1440px      |
| Page padding          | 18–24px     |
| Column gap            | 14–18px     |
| Section spacing       | 20–24px     |

The design should have relatively **compact spacing**, matching SaaS dashboard conventions. The UI should not feel overly spacious.

---

## 7. Sidebar Design

| Property   | Value                        |
| ---------- | ---------------------------- |
| Background | `#171B28`                    |
| Width      | 150–165px                    |
| Logo text  | "GymOS" — 18–20px, 700, `#FFFFFF` |
| Subtitle   | "Management System" — 8–10px, `#8B8E98` |

### Navigation Items

| State   | Background    | Text Color |
| ------- | ------------- | ---------- |
| Default | transparent   | `#777B87`  |
| Active  | `#007A35`     | `#FFFFFF`  |

- Active items have `border-radius: 5–7px`
- Use small icons alongside text
- Icon style: **Lucide / Feather-style line icons**
- Avoid large filled icons

---

## 8. Header Design

| Property      | Value                      |
| ------------- | -------------------------- |
| Height        | 48–52px                    |
| Background    | `#FFFFFF`                  |
| Border-bottom | `1px solid #E1E1E4`       |
| Elements      | Search, Notifications, User Profile |

### Search Field

| Property      | Value               |
| ------------- | ------------------- |
| Background    | `#F5F4F5`           |
| Border        | none                |
| Border-radius | 16–20px             |
| Height        | 30–34px             |
| Placeholder   | "Search members, plans..." |
| Font          | 12px, `#777777`     |

---

## 9. Cards

The card design is one of the most important parts of the visual system.

| Property      | Value                       |
| ------------- | --------------------------- |
| Background    | `#FFFFFF`                   |
| Border        | `1px solid #E1E1E4`        |
| Border-radius | 7–9px                       |
| Shadow        | Very subtle or none         |
| Padding       | 14–16px                     |

Cards should look **flat and clean**, rather than floating heavily above the background.

### Statistic Cards

Structure: `LABEL` above `VALUE`

```
ACTIVE
MEMBERS

210
```

| Element | Style                          |
| ------- | ------------------------------ |
| Label   | 10–11px, uppercase, `#777777`  |
| Value   | 20–24px, 700, `#111318`       |

Color indicators: Green → positive, Red → negative, Orange → warning

### Dark Feature Cards

For special cards (e.g. workout cards):

| Property       | Value     |
| -------------- | --------- |
| Background     | `#171B28` |
| Text           | `#FFFFFF` |
| Secondary text | `#9A9DA7` |
| Primary action | `#007A35` |

---

## 10. Buttons

### Primary Button
| Property      | Value     |
| ------------- | --------- |
| Background    | `#007A35` |
| Text          | `#FFFFFF` |
| Border        | none      |
| Border-radius | 5–7px     |

### Secondary Button
| Property      | Value                  |
| ------------- | ---------------------- |
| Background    | `#FFFFFF`              |
| Text          | `#44444A`              |
| Border        | `1px solid #DADADD`    |
| Border-radius | 5–7px                  |

### Danger Button
| Property   | Value     |
| ---------- | --------- |
| Background | `#D71920` |
| Text       | `#FFFFFF` |

Use only for destructive actions.

### Button Typography
- Font: Inter, 11–13px, Weight 600
- Buttons should be compact rather than oversized

---

## 11. Status Badges

Small pill-shaped badges:

| Status  | Background | Text      |
| ------- | ---------- | --------- |
| Active  | `#DDF5E7`  | `#007A35` |
| Premium | `#DDF5E7`  | `#007A35` |
| Expired | `#FDE4E4`  | `#D71920` |
| Pending | `#FFF0E0`  | `#F97316` |

Badge styling: `font-size: 9–10px`, `font-weight: 600`, `border-radius: 10px`, `padding: 3px 7px`

---

## 12. Tables

| Element           | Style                          |
| ----------------- | ------------------------------ |
| Header background | `#FFFFFF`                      |
| Header text       | `#777777`, 10–11px, 600        |
| Row height        | 38–45px                        |
| Row border        | `border-bottom: 1px solid #E8E8EA` |
| Primary info      | `#333333`                      |
| Secondary info    | `#777777`                      |

- Avoid heavy borders around every cell
- Clean SaaS-style appearance

---

## 13. Charts

Charts should use the green palette:

| Usage     | Color     |
| --------- | --------- |
| Primary   | `#007A35` |
| Shade 1   | `#4C956C` |
| Shade 2   | `#78AA8C` |
| Shade 3   | `#A9C6B4` |
| Shade 4   | `#C8DDD0` |

- Do not use many unrelated colors
- Charts should remain minimal and easy to understand

---

## 14. Progress Bars

| Element  | Value     |
| -------- | --------- |
| Track    | `#E7E8E8` |
| Progress | `#007A35` |
| Height   | 3–5px     |
| Radius   | 4px       |

Keep them thin and subtle.

---

## 15. Forms and Inputs

| Property      | Value                |
| ------------- | -------------------- |
| Background    | `#FFFFFF`            |
| Border        | `1px solid #DCDDE0`  |
| Border-radius | 5–7px                |
| Height        | 34–40px              |
| Label         | 12px, 500–600, `#44444A` |
| Placeholder   | `#999999`            |
| Focus border  | `#007A35`            |

Avoid large, heavily rounded input fields.

---

## 16. Member Profile Design

| Element            | Style                          |
| ------------------ | ------------------------------ |
| Profile image      | Rounded rectangle              |
| Member name        | 24–26px, 700, `#111318`        |
| Contact info       | 11–12px, `#777777`             |
| Status             | Use standard status badges     |

---

## 17. Tabs

| State  | Style                                  |
| ------ | -------------------------------------- |
| Default | Color: `#44444A`                      |
| Active  | Color: `#007A35`, 2px green bottom border |

```
Overview   Attendance   Payments   Progress
────────
```

Only the active tab receives the green underline.

---

## 18. Icons

**Library:** Lucide Icons

| Property | Value           |
| -------- | --------------- |
| Style    | Outline         |
| Stroke   | 1.5–2px         |
| Size     | 14–18px         |
| Color    | Gray by default |

- Active icons → white or green depending on context
- Avoid mixing filled icons, 3D icons, emoji, or different icon styles

---

## 19. Border Radius System

| Element        | Radius   |
| -------------- | -------- |
| Small controls | 5–6px    |
| Cards          | 7–9px    |
| Buttons        | 5–7px    |
| Badges         | 10–12px  |
| Search         | 16–20px  |
| Avatars        | 50%      |

The design should **not** use extremely rounded cards.

---

## 20. Shadows

- Preferred: **No shadow**
- If needed: extremely subtle `0 1px 3px rgba(...)`
- Borders should do most of the visual separation
- Avoid large drop shadows or floating glassmorphism effects

---

## 21. Background Surface System

Three primary surface levels:

| Level | Surface                | Color     |
| ----- | ---------------------- | --------- |
| 1     | Application background | `#F8F7F8` |
| 2     | Cards                  | `#FFFFFF` |
| 3     | Secondary elements     | `#F2F1F2` |

This creates subtle depth without heavy shadows.

---

## 22. Spacing System

4px-based spacing scale:

| Token | Value |
| ----- | ----- |
| XS    | 4px   |
| SM    | 8px   |
| MD    | 12px  |
| LG    | 16px  |
| XL    | 24px  |
| XXL   | 32px  |

| Context         | Spacing   |
| --------------- | --------- |
| Card padding    | 16px      |
| Between cards   | 12–16px   |
| Section spacing | 20–24px   |
| Page padding    | 20–24px   |

---

## 23. Visual Personality

The final visual personality should be:

**Professional + Minimal + Modern + Fitness-focused + Enterprise**

It should resemble a high-quality **SaaS Administration Dashboard** rather than a Sports/Fitness Marketing Website.

The interface should prioritize **information clarity and usability**.

---

## 24. Design Tokens Summary

```
FONT
Primary: Inter

COLORS
Primary:        #007A35
Secondary:      #4C956C
Dark Navy:      #171B28
Background:     #F8F7F8
Surface:        #FFFFFF
Muted Surface:  #F2F1F2
Border:         #E1E1E4
Text:           #111318
Secondary Text: #777777
Success:        #00833F
Danger:         #D71920
Warning:        #F97316

RADIUS
Small:          5px
Medium:         7px
Card:           8px
Pill:           12px
Search:         18px

TYPOGRAPHY
Page Heading:   28–32px / 700
Section:        15–16px / 600
Body:           12–14px / 400
Small:          10–12px / 400
Statistics:     20–24px / 700

SPACING
XS:             4px
SM:             8px
MD:             12px
LG:             16px
XL:             24px
XXL:            32px

BORDERS
Standard:       1px solid #E1E1E4

SHADOW
Default:        none
Optional:       very subtle 0 1px 3px shadow
```
