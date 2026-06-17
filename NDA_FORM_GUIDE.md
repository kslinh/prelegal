# NDA Form Guide

## Overview

The **NDA Form** (NDA Generator) is a step-by-step wizard that guides users through creating a customized Non-Disclosure Agreement. It collects essential party information, agreement details, and terms, then pre-populates the selected NDA template with the provided information.

## Features

### 🧙 4-Step Wizard Interface

The form guides users through four progressive steps:

1. **Template Selection** - Choose NDA type
2. **Party Information** - Enter company/individual details
3. **Agreement Details** - Set dates, purpose, and jurisdiction
4. **Terms & Conditions** - Define agreement duration and survival periods

### ✨ Key Features

- **Step-by-Step Guidance** - Clear, organized form layout
- **Progress Indicator** - Visual progress bar showing completion
- **Input Validation** - Real-time error checking with helpful messages
- **Jurisdiction Selection** - Dropdown with 90+ jurisdiction options
- **Template Type Selection** - Choose between Standard, Mutual, or Comprehensive NDA
- **Entity Type Selection** - Support for Corporation, LLC, Individual, Partnership
- **Context Integration** - Automatically populates TemplateContext on submit
- **Auto-Navigation** - Submits to template viewer with pre-filled data

## User Flow

```
1. User clicks "Create NDA" button on dashboard
   ↓
2. Navigate to /nda/create
   ↓
3. Step 1: Select NDA type (Standard/Mutual/Comprehensive)
   ↓
4. Step 2: Enter party information
   - Disclosing Party (your company)
   - Receiving Party (counterparty)
   - Addresses for both parties
   ↓
5. Step 3: Set agreement details
   - Effective date
   - Purpose of disclosure
   - Governing law/jurisdiction
   ↓
6. Step 4: Configure terms
   - Agreement duration
   - Termination notice period
   - Confidentiality survival period
   - Information return period
   ↓
7. Click "Generate NDA"
   ↓
8. Form submits to TemplateContext
   ↓
9. Redirect to template viewer (/templates/[templateId])
   ↓
10. Template is pre-populated with all form values
   ↓
11. User can view, edit, download, or save as draft
```

## Form Structure

### Step 1: Template Selection

**Component:** Radio button group with 3 options

```
[ ] Standard NDA (One-Way)
    Description: Standard one-way NDA for protecting your confidential information
    
[ ] Mutual NDA (Two-Way)
    Description: Mutual NDA for two-way confidentiality obligations
    
[✓] Comprehensive NDA (Advanced)
    Description: Advanced NDA with comprehensive provisions for complex agreements
```

**Data Field:**
- `templateType`: 'nda' | 'mnda' | 'nda-comprehensive'

### Step 2: Party Information

**Section A: Disclosing Party (You)**
- Company/Individual Name (text input, required)
- Entity Type (select dropdown, required)
  - Corporation
  - LLC (Limited Liability Company)
  - Individual
  - Partnership
- Address (textarea, required)

**Section B: Receiving Party (Counterparty)**
- Company/Individual Name (text input, required)
- Entity Type (select dropdown, required)
- Address (textarea, required)

**Data Fields:**
```typescript
disclosingPartyName: string
disclosingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership'
disclosingPartyAddress: string
receivingPartyName: string
receivingPartyType: 'corporation' | 'llc' | 'individual' | 'partnership'
receivingPartyAddress: string
```

### Step 3: Agreement Details

- **Effective Date** (date picker, required)
  - Format: YYYY-MM-DD
  - Default: Today's date

- **Purpose of Disclosure** (text input, required)
  - Placeholder: "e.g., Business partnership evaluation, Technology evaluation"
  - Examples: "Potential Business Partnership", "Technology Evaluation", "Strategic Alliance"

- **Jurisdiction/Governing Law** (select dropdown, required)
  - 90+ options including:
    - All 50 US States
    - 14 International jurisdictions
    - 27 EU countries
  - Default: California

**Data Fields:**
```typescript
effectiveDate: string (YYYY-MM-DD)
purpose: string
jurisdiction: string
```

### Step 4: Terms & Conditions

- **Agreement Duration** (text input, required)
  - Placeholder: "e.g., 2 years, 3 years"
  - Examples: "2 years", "3 years", "1 year"

- **Termination Notice Period** (text input, required)
  - Placeholder: "e.g., 30 days, 60 days"
  - Examples: "30 days", "60 days", "90 days"

- **Confidentiality Survival Period** (text input, required)
  - Placeholder: "e.g., 3 years, 5 years after termination"
  - Defines how long confidentiality obligations continue after agreement termination
  - Default: "3 years"

- **Return of Information Period** (text input, required)
  - Placeholder: "e.g., 30 days"
  - Timeframe for returning/destroying confidential information
  - Default: "30 days"

- **Technical Information Survival Period** (text input, optional)
  - Only shown when Comprehensive NDA is selected
  - Different survival period for technical/trade secret information
  - Example: "5 years"

**Data Fields:**
```typescript
termDuration: string
terminationNotice: string
survivalPeriod: string
returnPeriod: string
technicalSurvivalPeriod?: string (for comprehensive NDA only)
```

## Data Mapping

When the form is submitted, field values are mapped to template customization fields:

| Form Field | Template Field(s) |
|-----------|------------------|
| `effectiveDate` | "Effective Date" |
| `purpose` | "Purpose", "Purpose of Disclosure" |
| `disclosingPartyName` | "Disclosing Party" |
| `disclosingPartyType` | "Disclosing Party Entity Type" |
| `disclosingPartyAddress` | "Disclosing Party Address" |
| `receivingPartyName` | "Receiving Party" |
| `receivingPartyType` | "Receiving Party Entity Type" |
| `receivingPartyAddress` | "Receiving Party Address" |
| `jurisdiction` | "Jurisdiction", "Governing Law" |
| `termDuration` | "Agreement Term", "MNDA Term" |
| `terminationNotice` | "Termination Notice Period" |
| `survivalPeriod` | "Survival Period", "Term of Confidentiality" |
| `returnPeriod` | "Return Period" |
| `technicalSurvivalPeriod` | "Technical Information Survival Period" |

## Validation Rules

### Step 1 Validation
- ✓ Template type must be selected (not null/empty)

### Step 2 Validation
- ✓ Disclosing Party Name: required
- ✓ Disclosing Party Address: required
- ✓ Receiving Party Name: required
- ✓ Receiving Party Address: required

### Step 3 Validation
- ✓ Effective Date: required
- ✓ Purpose: required
- ✓ Jurisdiction: required

### Step 4 Validation
- ✓ Term Duration: required
- ✓ Termination Notice: required
- ✓ Survival Period: required
- ✓ Return Period: required
- ✓ Technical Survival Period: optional (only for comprehensive NDA)

## UI Components

### Progress Indicator
- 4 circular steps (1, 2, 3, 4)
- Active step: Blue with number
- Completed steps: Green with checkmark
- Upcoming steps: Gray
- Connected by progress bars

### Navigation Buttons
- **Previous Button** (Left)
  - Disabled on Step 1
  - Allows going back to previous steps
  
- **Next Button** (Right, Steps 1-3)
  - Validates current step before proceeding
  - Displays "Next →"
  
- **Generate NDA Button** (Right, Step 4)
  - Green button with checkmark icon
  - Validates all steps
  - Submits form and creates template

### Error Messages
- Appear below invalid fields in red text
- Red border on invalid input
- Clear message explaining what's required

### Form Fields
- All inputs use consistent styling
- Consistent spacing (4px vertical between fields)
- Help text/placeholders in all fields
- Entity type and jurisdiction use `<select>` for valid options

## Navigation & Routing

### Entry Points
1. **Dashboard Button** - "Create NDA" button in header
2. **Direct URL** - `/nda/create`

### Exit Points
1. **Back Link** - "← Back to Dashboard" at top
2. **Form Submission** - Redirects to `/templates/[templateId]`

### URL Routes
- Form: `/nda/create`
- Template Viewer (after submit): `/templates/nda-001` (or other template ID)

## Integration with TemplateContext

When form is submitted, it dispatches `SET_FIELD` actions to populate the template context:

```typescript
dispatch({
  type: 'SET_FIELD',
  templateId: 'nda-comprehensive', // Selected template type
  fieldName: 'Effective Date',      // Template field name
  value: '2026-06-16',              // Form value
});
```

This allows the template viewer to automatically show the customized template with all form values applied.

## Browser Compatibility

- Chrome/Chromium ✓
- Firefox ✓
- Safari ✓
- Edge ✓
- Mobile browsers ✓

## Accessibility Features

- Semantic HTML form structure
- Clear, descriptive labels for all inputs
- Error messages associated with fields
- Keyboard navigation support
- Focus indicators on interactive elements
- Progress indicator shows current step

## Mobile Responsiveness

- Single column layout on mobile
- Full-width form inputs
- Readable font sizes (16px minimum)
- Touch-friendly button sizes
- Proper spacing for mobile devices

## Form Submission Flow

```typescript
// 1. User fills all 4 steps
// 2. Validates each step
// 3. On submit:
const customizations = {
  'Effective Date': '2026-06-16',
  'Disclosing Party': 'Acme Corp',
  'Jurisdiction': 'California',
  // ... all other mapped fields
};

// 4. Dispatch SET_FIELD actions for each field
Object.entries(customizations).forEach(([fieldName, value]) => {
  dispatch({
    type: 'SET_FIELD',
    templateId: formData.templateType,
    fieldName,
    value,
  });
});

// 5. Redirect to template viewer
window.location.href = `/templates/${formData.templateType}`;

// 6. Template viewer renders with customizations applied
```

## Example User Scenario

**Alice creates an NDA for a business discussion:**

1. Clicks "Create NDA" on dashboard
2. **Step 1**: Selects "Comprehensive NDA (Advanced)"
3. **Step 2**: 
   - Disclosing Party: "Tech Innovations Inc."
   - Entity Type: Corporation
   - Address: "123 Tech Street, San Francisco, CA 94102"
   - Receiving Party: "Digital Solutions LLC"
   - Entity Type: LLC
   - Address: "456 Innovation Ave, Los Angeles, CA 90001"
4. **Step 3**:
   - Effective Date: June 16, 2026
   - Purpose: "Exploration of potential technology partnership"
   - Jurisdiction: "California"
5. **Step 4**:
   - Duration: "2 years"
   - Termination Notice: "30 days"
   - Survival: "3 years after termination"
   - Return Period: "30 days"
   - Technical Survival: "5 years"
6. Clicks "Generate NDA"
7. Redirected to template viewer with all data populated
8. Can review, edit, download, or save as draft

## Technical Details

### Component Location
- **Component:** `frontend/src/components/NDAForm.tsx`
- **Page:** `frontend/src/app/nda/create/page.tsx`
- **Type:** Client-side React component
- **Size:** ~621 lines of code

### Dependencies
- React hooks (useState)
- Next.js Link for navigation
- TemplateContext for state management

### Performance
- Form loads instantly
- No API calls (client-side only)
- Lightweight component (~25KB minified)

### State Management
- Local component state for form data
- Local error state for validation
- Context dispatch on submission

## Future Enhancements

1. **Template Selection Modal** - Show template previews while selecting
2. **Form Auto-Save** - Save form progress to localStorage
3. **Form Templates** - Save frequently used forms as templates
4. **Bulk NDA Creation** - Create multiple NDAs from CSV
5. **Form Validation Rules** - Custom validation for specific fields
6. **PDF Preview** - Show PDF preview before download
7. **E-Signature Integration** - Sign NDAs directly
8. **Template Comparison** - Compare before/after templates

## FAQ

**Q: Can I go back to previous steps?**
A: Yes, click the "Previous" button to go back and edit your answers.

**Q: What if I don't know all the information?**
A: You can fill in what you have and edit the template directly after submission.

**Q: Which NDA should I choose?**
- Standard (One-Way): You're sharing info, they're receiving it
- Mutual (Two-Way): Both parties are sharing confidential info
- Comprehensive: Complex agreements with extensive provisions

**Q: Can I edit the NDA after generation?**
A: Yes, the template viewer has an Edit Mode for making changes.

**Q: Is the form data saved?**
A: Form data is only saved if you save the template as a draft in the viewer.

**Q: Can I create multiple NDAs?**
A: Yes, go back to the dashboard and click "Create NDA" again.

## Support

For issues or feature requests regarding the NDA form, please refer to the main project documentation or contact support.
