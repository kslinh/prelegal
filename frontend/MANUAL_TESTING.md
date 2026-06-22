# Frontend Manual Testing Guide

Manual testing complements automated tests by verifying user experience, UI/UX, and integration scenarios.

## Quick Start

### Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Scenarios

### 1. Dashboard & Template Discovery

**Objective:** Verify users can browse and find templates

**Steps:**
1. ✅ Page loads without errors
2. ✅ Template grid displays all templates
3. ✅ Search bar is visible and clickable
4. ✅ Category filter buttons are visible
5. ✅ Results counter shows correct count

**Success Criteria:**
- All templates load within 2 seconds
- Search updates results in real-time
- Categories filter correctly
- No console errors

**Test Cases:**

| Action | Expected | Status |
|--------|----------|--------|
| Load dashboard | All templates visible | ✅ |
| Type in search | Results filter | ✅ |
| Click category | Category filters apply | ✅ |
| Clear search | All results return | ✅ |
| Scroll | Infinite scroll works | ✅ |

---

### 2. Template Selection & Viewing

**Objective:** Verify template display and interaction

**Steps:**
1. ✅ Click on a template card
2. ✅ Template details page loads
3. ✅ Template content displays correctly
4. ✅ Sections are readable
5. ✅ Back button returns to dashboard

**Success Criteria:**
- Template loads within 1 second
- All sections visible and styled properly
- Responsive on mobile/tablet/desktop
- No broken layouts

**Test Cases:**

| Template | Expected Behavior | Status |
|----------|-------------------|--------|
| NDA-001 | Shows 8 sections | ✅ |
| MNDA-001 | Shows 10+ sections | ✅ |
| Service Agreement | Shows 9+ sections | ✅ |
| Edit mode | Textarea appears | ✅ |
| Download | JSON/Text download works | ✅ |

---

### 3. Customization

**Objective:** Test dynamic field customization

**Steps:**
1. ✅ Open template
2. ✅ Scroll to customization form
3. ✅ Fill in required fields
4. ✅ Select dropdown options
5. ✅ Watch preview update

**Success Criteria:**
- Form fields are visible and functional
- Preview updates in real-time
- No JavaScript errors
- Styling is clean and professional

**Test Cases:**

| Field | Input | Expected |
|-------|-------|----------|
| Company Name | "Acme Inc" | Updated in preview |
| Effective Date | "2026-01-01" | Formatted correctly |
| Jurisdiction | Select country | Preview reflects choice |
| Reset | Click reset | Form clears |
| Validation | Leave required field empty | Error message appears |

---

### 4. Favorites

**Objective:** Test favorite/bookmark functionality

**Steps:**
1. ✅ Open a template card
2. ✅ Click heart icon
3. ✅ Verify heart fills
4. ✅ Close and reopen
5. ✅ Favorite persists

**Success Criteria:**
- Heart icon toggles on click
- Favorite state persists on page reload
- localStorage updates correctly
- Favorites visible across sessions

**Test Cases:**

| Action | Expected | Status |
|--------|----------|--------|
| Click heart | Heart fills | ✅ |
| Reload page | Favorite persists | ✅ |
| Remove favorite | Heart empties | ✅ |
| Toggle multiple | All states correct | ✅ |

---

### 5. Draft Management

**Objective:** Test edit mode and draft saving

**Steps:**
1. ✅ Open template in edit mode
2. ✅ Modify a section
3. ✅ Close browser/tab
4. ✅ Reopen template
5. ✅ Changes persist

**Success Criteria:**
- Draft saves to localStorage
- Unsaved changes warning appears
- Draft restore works correctly
- Can discard drafts

**Test Cases:**

| Action | Expected | Status |
|--------|----------|--------|
| Edit section | Content updates | ✅ |
| Leave page | "Unsaved changes" warning | ✅ |
| Reload | Draft restored | ✅ |
| Clear draft | Content reverts | ✅ |
| Download draft | JSON with edits | ✅ |

---

### 6. Responsive Design

**Objective:** Test on different screen sizes

**Steps:**
1. ✅ Open DevTools (F12)
2. ✅ Toggle device toolbar
3. ✅ Test mobile view (375px)
4. ✅ Test tablet view (768px)
5. ✅ Test desktop (1920px)

**Success Criteria:**
- Layout adapts to screen size
- Touch targets are adequate (44px+)
- Text is readable without zooming
- No horizontal scrolling

**Test Cases:**

| Screen Size | Expected Layout | Status |
|-------------|-----------------|--------|
| iPhone 12 (390px) | Single column | ✅ |
| iPad (768px) | Two columns | ✅ |
| Desktop (1440px) | Grid layout | ✅ |
| Ultra-wide (2560px) | Properly constrained | ✅ |

---

### 7. Performance

**Objective:** Verify page load and responsiveness

**Steps:**
1. ✅ Open DevTools (F12)
2. ✅ Go to Network tab
3. ✅ Reload page
4. ✅ Check load times
5. ✅ Check bundle sizes

**Success Criteria:**
- Page loads in < 3 seconds
- First contentful paint < 1.5s
- Bundle size < 500KB (gzipped)
- No 4xx/5xx errors

**Metrics to Check:**

| Metric | Target | Status |
|--------|--------|--------|
| Load Time | < 3s | ✅ |
| FCP | < 1.5s | ✅ |
| LCP | < 2.5s | ✅ |
| Bundle Size | < 500KB | ✅ |

---

### 8. Accessibility

**Objective:** Test keyboard navigation and screen readers

**Steps:**
1. ✅ Use Tab key to navigate
2. ✅ Tab focus should be visible
3. ✅ Test Enter key on buttons
4. ✅ Test with screen reader (Mac: VoiceOver)

**Success Criteria:**
- All interactive elements are keyboard accessible
- Focus indicators are visible
- Semantic HTML is used
- ARIA labels where needed

**Checklist:**

- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Buttons respond to Enter/Space
- [ ] Links are underlined or distinguished
- [ ] Form labels are associated
- [ ] Images have alt text
- [ ] Color isn't only indicator (contrast OK)

---

### 9. Cross-Browser Testing

**Objective:** Test on different browsers

**Browsers to Test:**
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

**Common Issues:**
| Issue | Fix |
|-------|-----|
| Styles not applying | Clear cache (Ctrl+Shift+R) |
| Layout broken | Check viewport meta tag |
| JS not running | Check console for errors |
| Fonts not loading | Check network tab |

---

### 10. Error Scenarios

**Objective:** Test error handling

**Steps:**
1. ✅ Simulate offline (DevTools → Network → Offline)
2. ✅ Open app offline
3. ✅ Try to search/filter
4. ✅ Go back online
5. ✅ Verify recovery

**Test Cases:**

| Scenario | Expected Behavior |
|----------|-------------------|
| Offline mode | Show helpful message |
| Corrupted data | Show error, not crash |
| Missing template | 404 page |
| Invalid URL | Redirect home |
| API failure | Graceful fallback |

---

## Testing Checklist

Print this and check off as you test:

### Functional Testing
- [ ] All templates load
- [ ] Search works correctly
- [ ] Filters work correctly
- [ ] Template details display
- [ ] Customization works
- [ ] Favorites toggle
- [ ] Drafts save/restore
- [ ] Downloads work
- [ ] Navigation works

### Visual Testing
- [ ] Styling is consistent
- [ ] Colors match design
- [ ] Typography is correct
- [ ] Spacing looks good
- [ ] Images load
- [ ] Icons display
- [ ] Responsive layout
- [ ] No layout shift
- [ ] Animations smooth

### Performance Testing
- [ ] Page loads quickly
- [ ] No lag when typing
- [ ] Smooth scrolling
- [ ] Animations 60fps
- [ ] No memory leaks
- [ ] Console clean

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus visible
- [ ] Color contrast OK
- [ ] No flashing content
- [ ] Form labels present
- [ ] Alt text present

### Browser Testing
- [ ] Chrome ✅
- [ ] Firefox ✅
- [ ] Safari ✅
- [ ] Edge ✅
- [ ] Mobile browser ✅

---

## Reporting Issues

### Format for bug reports:

**Title:** Brief description of the issue

**Reproduction Steps:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots/Videos:**
Attach visual evidence

**Environment:**
- Browser: Chrome 120
- OS: macOS 13
- Device: MacBook Pro

**Severity:**
- Critical (site broken)
- Major (feature broken)
- Minor (cosmetic)

---

## Performance Testing with Lighthouse

### Run Lighthouse audit:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Check metrics:
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 90

---

## Quick Test Script

Copy and paste into DevTools Console:

```javascript
// Check for errors
console.log('Checking for errors...')
console.log('Errors:', performance.getEntriesByType('error').length)

// Check load time
console.log('Load time:', performance.timing.loadEventEnd - performance.timing.navigationStart)

// Check for missing images
const images = document.querySelectorAll('img')
let brokenImages = 0
images.forEach(img => {
  if (!img.complete || img.naturalHeight === 0) brokenImages++
})
console.log('Broken images:', brokenImages)

// Check for accessibility issues
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
console.log('Headings:', headings.length)
console.log('Missing h1:', document.querySelectorAll('h1').length === 0)
```

---

## Recording Tests

Use screen recording to document testing:
```bash
# macOS - QuickTime
# Windows - Xbox Game Bar (Win+G)
# Linux - OBS Studio
```

Save recordings to `frontend/recordings/` for future reference.
