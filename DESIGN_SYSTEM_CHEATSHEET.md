# Design System - Quick Reference Cheat Sheet

## 🎨 Colors

### Primary Actions
```
Blue (#2563EB) - Main CTAs, primary buttons
Green (#059669) - Success, positive feedback
```

### Feedback
```
✅ Success: #10B981 (light: #D1FAE5)
❌ Error: #EF4444 (light: #FEE2E2)
⚠️ Warning: #F59E0B (light: #FEF3C7)
ℹ️ Info: #0EA5E9 (light: #CFFAFE)
```

### Backgrounds
```
Primary: #F8FAFC (light grey)
White: #FFFFFF
Text Primary: #1E293B (dark)
Text Secondary: #64748B (medium)
Text Tertiary: #94A3B8 (light)
```

## 📏 Spacing Scale (4px base)
```
xs: 4px    (margins/padding for compact)
sm: 8px    (small gaps)
md: 12px   (standard small spacing)
lg: 16px   (standard spacing) ← USE MOST
xl: 24px   (large sections)
2xl: 32px  (major sections)
3xl: 48px  (large blocks)
4xl: 64px  (fullscreen sections)
```

## 📝 Typography

### Sizes
```
Display: 28px (page hero)
H1: 24px (page title)
H2: 20px (section title)
H3: 18px (subsection)
Body: 14px (default text)
Small: 13px (secondary text)
Label: 12px (form labels)
Caption: 11px (hints)
```

### Weights
```
Bold (700): Headings, emphasis
Semibold (600): Important labels, selected states
Regular (400): Body text ← DEFAULT
```

### Font Families
```
Primary: Inter, -apple-system, BlinkMacSystemFont, Roboto
Arabic: Cairo (in addition to Inter)
```

## 🔘 Common Components

### Button Sizes
```html
<!-- Standard: 44px height -->
<button class="btn btn-primary">Click me</button>

<!-- Large: 56px height (primary actions) -->
<button class="btn btn-primary btn-lg">Upload PDF</button>

<!-- Icon-only: 44x44px -->
<button class="btn btn-icon">⚙️</button>
```

### Input Fields
```html
<div class="input-group">
  <label for="name">Label</label>
  <input id="name" type="text" placeholder="Enter..." />
</div>
```
**Min height**: 44px | **Border radius**: 8px

### Cards
```html
<!-- Standard card -->
<div class="card">Content</div>

<!-- Card with accent border -->
<div class="card card-accent">Content</div>

<!-- Quiz card option -->
<div class="quiz-card">Option</div>
```

### Progress Bar
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 65%"></div>
</div>
```

## 🎯 Buttons Reference

| Type | Class | Usage |
|------|-------|-------|
| Primary | `.btn.btn-primary` | Main action (blue) |
| Secondary | `.btn.btn-secondary` | Alternative action (outline) |
| Tertiary | `.btn.btn-tertiary` | Text-only link |
| Danger | `.btn.btn-danger` | Destructive action (red) |
| Success | `.btn.btn-success` | Positive action (green) |
| Large | `.btn.btn-lg` | 56px height |
| Icon | `.btn.btn-icon` | Square 44x44px |

## 🎨 Badge/Chip Usage

```html
<!-- Primary badge -->
<span class="badge primary">Learning</span>

<!-- Success badge -->
<span class="badge success">Correct!</span>

<!-- Error badge -->
<span class="badge error">Incorrect</span>
```

## 📱 Responsive Breakpoints

```css
/* Mobile (default) */
.container { padding: 16px; }

/* Tablet+ 768px */
@media (min-width: 768px) {
  .container { padding: 24px; }
}

/* Desktop+ 1024px */
@media (min-width: 1024px) {
  .container { padding: 32px; }
}
```

## ✨ Common Patterns

### Page Layout
```html
<div class="container">
  <div class="section">
    <h2>Title</h2>
    <div class="section-content">
      <!-- Cards, content here -->
    </div>
  </div>
</div>
```

### Form Group
```html
<div class="input-group">
  <label for="input">Label</label>
  <input id="input" type="text" />
</div>
```

### Action Buttons
```html
<div style="display: flex; gap: var(--space-lg);">
  <button class="btn btn-primary">Primary</button>
  <button class="btn btn-secondary">Secondary</button>
</div>
```

### Card List
```html
<div style="display: flex; flex-direction: column; gap: var(--space-lg);">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>
```

## 🎯 HCI Principles Checklist

- [ ] **Hick's Law**: Limit choices to 3-5 primary options per screen
- [ ] **Fitts's Law**: Primary buttons 48-56px height, adequate spacing
- [ ] **Jakob's Law**: Using familiar patterns (cards, buttons, inputs)
- [ ] **Miller's Law**: Chunk information into groups of 5-7 items
- [ ] **Accessibility**: WCAG AA contrast, keyboard navigation, labels
- [ ] **Feedback**: Visual response for all interactions (hover, focus, active)
- [ ] **User Control**: Back button available, easy cancellation

## 🚫 What NOT to Do

```css
/* ❌ Don't hard-code colors */
.button { background: #2563EB; }

/* ✅ Do use CSS variables */
.button { background: var(--color-primary-blue); }

/* ❌ Don't create custom sizes */
.button { padding: 10px 15px; border-radius: 6px; }

/* ✅ Do use spacing scale */
.button { padding: var(--space-md) var(--space-lg); border-radius: var(--radius-md); }

/* ❌ Don't create arbitrary transitions */
.button { transition: all 0.15s linear; }

/* ✅ Do use predefined transitions */
.button { transition: all var(--transition-standard); }
```

## 📐 Accessibility Essentials

### Touch Targets
- **Minimum**: 44x44px
- **Preferred**: 48-56px for primary actions
- **Spacing**: 8px minimum between targets

### Color Contrast (WCAG AA)
- **Text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **Non-text**: 3:1

### Keyboard Navigation
- **Tab order**: logical, left-to-right, top-to-bottom
- **Focus visible**: 2px colored outline
- **Enter/Space**: activates buttons

### Semantic HTML
```html
<!-- ✅ Correct -->
<button type="submit">Submit</button>
<label for="input">Label</label>
<h1>Page Title</h1>

<!-- ❌ Avoid -->
<div onclick="submit()">Submit</div>
<span>Label</span>
<div style="font-size: 28px;">Page Title</div>
```

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `design-tokens.css` | All CSS variables & token definitions |
| `styles.css` | Component styles using tokens |
| `chat.css` | Chat interface specific styles |
| `nav.css` | Navigation bar styles |
| `DESIGN_SYSTEM.md` | Complete design specification |
| `DESIGN_IMPLEMENTATION_GUIDE.md` | How to use the system |

---

## 🚀 Quick Start for New Developer

1. **Import design-tokens.css first** in your entry file:
   ```js
   import './assets/design-tokens.css';
   import './assets/styles.css';
   ```

2. **Use CSS variables** instead of hard-coded values:
   ```css
   .my-component {
     background: var(--color-bg-white);
     padding: var(--space-lg);
     border-radius: var(--radius-md);
   }
   ```

3. **Check existing components** before creating new styles

4. **Test on mobile** first (320px width minimum)

5. **Verify accessibility**: keyboard nav, color contrast, focus states

---

**Last Updated**: April 11, 2026 | Version 1.0.0
