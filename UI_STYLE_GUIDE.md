# GreenConstructAI — UI Design System & Theme Style Guide

This guide documents the official design system, color tokens, typography hierarchy, and UI component standards for the **GreenConstructAI** platform.

---

## 1. Typography

The platform uses two primary Google Fonts to blend technical engineering precision with clean architectural aesthetics.

| Role | Font Family | Weights | Usage |
| :--- | :--- | :--- | :--- |
| **Headings & Badges** | `Space Grotesk, sans-serif` | `600`, `700`, `800` | Titles (`h1`–`h4`), telemetry numbers, badge pills, module labels, buttons |
| **Body & Form Controls** | `Inter, sans-serif` | `400`, `500`, `600`, `700` | Paragraphs, tables, input fields, labels, helper text |

### Google Fonts Import:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet">
```

---

## 2. Color Palette

### A. Architectural Canvas & Surfaces (Sage Theme)

| Token Name | Hex Code | Description | Usage |
| :--- | :--- | :--- | :--- |
| `--background-primary` | `#E1E9E2` | Warm Architectural Sage | Default page background |
| `--background-secondary` | `#D4E1D6` | Medium Sage | Section alternation & card backdrops |
| `--background-tertiary` | `#C7D7CA` | Deep Sage | Footers & grounding structural areas |
| `--background-blueprint` | `#DFE8EE` | Slate / Blueprint Tint | Plan Analyzer & technical diagrams |
| `--surface` | `#FFFFFF` | Crisp Pure White | Primary interactive cards |
| `--surface-secondary` | `#E8F1E9` | Sage Surface Fill | Inner containers, table headers, chip fills |
| `--surface-muted` | `#DCE8DE` | Muted Sage | Inactive items & subtle card backgrounds |

---

### B. Brand & Green Spectrum

| Role | Hex Code | Description | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Brand Green** | `#1E5438` | Deep Forest Green | Primary buttons, active tabs, main logos |
| **Header / Arch Dark** | `#0F2D1E` | Night Forest Green | Global navigation header & dark architecture section |
| **Emerald Highlight** | `#65D28A` | Vibrant Spring Emerald | Glowing indicators, active header underlines, logo `AI` |
| **Secondary Green** | `#3A7255` | Mid Forest Sage | Secondary buttons, progress bars |
| **Sage Green** | `#6F9E7B` | Organic Architectural Sage | Environmental badges, module card accents |
| **Sage Light** | `#CDE2D2` | Pale Mint Sage | Badge backgrounds, active chip pills |

---

### C. Module-Specific Accent System

Each of the 4 intelligent system modules has a dedicated accent color:

| Module Number & Name | Brand Accent | Light Tint Fill | Border / Focus Ring |
| :--- | :--- | :--- | :--- |
| **01 Building Plan Analyzer** | `#245D8C` (Blueprint Blue) | `#DEE9EF` / `#C8DDF0` | `rgba(36, 93, 140, 0.28)` |
| **02 Material Recommendations** | `#1E5438` (Forest Sage) | `#DCE9DF` / `#C6E2CD` | `rgba(30, 84, 56, 0.28)` |
| **03 Green Building Pre-Assessment** | `#3E7452` (Deep Sage) | `#DCF2E2` / `#C6E5CF` | `rgba(62, 116, 82, 0.28)` |
| **04 Fire-Safety Compliance** | `#C0542C` (Terracotta) | `#F9E7E0` / `#F2D4C7` | `rgba(192, 84, 44, 0.28)` |

---

### D. Typography & Neutral Text

| Token Name | Hex Code | Description |
| :--- | :--- | :--- |
| `--text-primary` | `#14221B` | High-contrast Charcoal (Titles & Main Text) |
| `--text-secondary` | `#42554A` | Slate Forest (Body & Subtitles) |
| `--text-muted` | `#6D8174` | Soft Sage Grey (Captions, Placeholders, Hints) |
| `--text-accent` | `#1E5438` | Brand Forest Accent |

---

### E. Status & Performance Scoring

| Metric Tier | Background Fill | Text Color | Border |
| :--- | :--- | :--- | :--- |
| **Excellent / High** | `#DCEFE2` | `#17542E` | `rgba(23, 84, 46, 0.26)` |
| **Good / Info** | `#DEEAF5` | `#1F5480` | `rgba(31, 84, 128, 0.26)` |
| **Review Required / Amber** | `#F9F0DB` | `#9A6608` | `rgba(188, 129, 22, 0.26)` |
| **Warning / Terracotta** | `#F9E7E0` | `#A6401B` | `rgba(192, 84, 44, 0.26)` |
| **Critical / Low** | `#F8E2E0` | `#B02016` | `rgba(176, 32, 22, 0.26)` |

---

## 3. UI Component Standards

### Cards (`.glass-card`)
```css
.glass-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(235, 244, 237, 0.94));
  border: 1px solid #BDCEBF;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(20, 34, 27, 0.08), 0 1px 4px rgba(20, 34, 27, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(20, 34, 27, 0.10), 0 20px 48px rgba(30, 84, 56, 0.14);
  border-color: rgba(30, 84, 56, 0.32);
}
```

### Form Inputs & Dropdowns
```css
input, select, textarea {
  background: #E8F1EA;
  border: 1.5px solid #BACBBD;
  color: #14221B;
  border-radius: 8px;
  padding: 0.72rem 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  background: #FFFFFF;
  outline: none;
  border-color: #1E5438;
  box-shadow: 0 0 0 3px rgba(30, 84, 56, 0.15);
}
```

### Primary Buttons
```css
.btn-premium {
  background: #1E5438;
  color: #FFFFFF;
  border: 1px solid #1E5438;
  border-radius: 10px;
  padding: 0.85rem 1.75rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(30, 84, 56, 0.26);
  transition: all 0.2s ease;
}

.btn-premium:hover {
  background: #143C28;
  box-shadow: 0 6px 22px rgba(30, 84, 56, 0.36);
  transform: translateY(-1px);
}
```

---

## 4. Key Design Rules for Teammates
1. **Never use pure harsh black (`#000000`)**: Use `#14221B` (Charcoal) or `#0F2D1E` (Dark Forest).
2. **Never place white inputs on white cards**: Inputs should have `--surface-secondary` (`#E8F1EA`) fill by default, turning `#FFFFFF` only on focus.
3. **Use Space Grotesk for structure**: All labels, headings, stats, buttons, and navigation must use `Space Grotesk`.
4. **Maintain Module Accents**: When building sub-pages or features for Plan Analyzer, Material Recommender, Green Assessment, or Fire Safety, apply the corresponding module color for cards, borders, and badges.
