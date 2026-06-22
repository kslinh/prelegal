# Prelegal - Legal Document Template Platform

A modern web application for browsing, customizing, and managing legal document templates with support for multiple jurisdictions and interactive draft editing.

## Project Status

✅ **PL-3 COMPLETE** - User dashboard for viewing and managing templates (PRODUCTION READY)

```
Version: 2.0
Last Updated: June 2026
Features Implemented: 100% of PL-3 requirements
```

## Overview

Prelegal is a legal technology platform that simplifies the process of customizing and managing legal document templates. The application provides:

- **Template Dashboard**: Browse and search legal templates across multiple categories
- **Intelligent Customization**: Dynamic forms with text inputs and jurisdiction selection dropdowns
- **Interactive Editing**: Edit template sections with real-time preview and draft persistence
- **Multi-Jurisdiction Support**: 90+ jurisdictions covering US states, EU countries, and international regions
- **Responsive Design**: Fully responsive UI optimized for mobile, tablet, and desktop

## Features

### ✅ Dashboard (PL-3)
- Search templates by name and description
- Filter templates by category (Non-Disclosure, Services, Employment, Commercial)
- Browse templates in responsive grid layout
- View template metadata (name, description, category, version)
- Add/remove templates from favorites
- Real-time result counter
- Sticky header with persistent navigation

### ✅ Template Viewer (PL-3)
- Display full legal documents with organized sections
- View read-only vs. editable sections with lock icons
- Download templates as JSON or plain text
- Manage template favorites with heart icon
- View version and category information
- Back navigation to dashboard

### ✅ Customization System (PL-3)
- Dynamic field-based template customization
- Support for text input and select dropdown fields
- Real-time template preview with applied customizations
- **90+ jurisdiction options** for governing law/jurisdiction selection
- Required field indicators
- Reset customization fields
- Placeholder guidance for each field

### ✅ Edit Mode with Draft Management (PL-3)
- Toggle between view and edit modes
- Inline editing of template sections (textarea)
- Visual indicators for editable vs. read-only sections
- Auto-save edits as drafts (localStorage persistence)
- Restore or discard saved drafts
- Draft timestamps for tracking last saved date
- Unsaved changes warning banner
- Section-level content modification

## Templates Included

| Template ID | Name | Category | Sections | Fields | Jurisdictions |
|-------------|------|----------|----------|--------|----------------|
| nda-001 | Non-Disclosure Agreement | Non-Disclosure | 8 | 5 | 20+ |
| mnda-001 | Mutual NDA | Non-Disclosure | 10+ | 6 | 20+ |
| nda-comprehensive | Comprehensive NDA v2.0 | Non-Disclosure | 11 | 14 | **90+** |
| sa-001 | Service Agreement | Services | 9+ | 8+ | Standard |

## Jurisdiction Support

The application includes support for:
- ✅ **All 50 US States** (Alabama - Wyoming)
- ✅ **International Jurisdictions** (UK, Canada, Australia, India, Singapore, Hong Kong, Japan, South Korea, UAE, New Zealand, Ireland, Mexico, Brazil, Israel)
- ✅ **EU Countries** (All 27 members: Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden)

**Total: 90+ jurisdictions available for selection**

## Technology Stack

**Frontend:**
- Next.js 14.2.0 with React 18
- TypeScript (strict mode enforced)
- Tailwind CSS for utility-first styling
- React Context API for state management
- SWR for client-side data fetching
- localStorage for client-side persistence

**Backend (Ready for Integration):**
- Python template loader utility available
- FastAPI integration structure ready
- RESTful API routes implemented

**Development Tools:**
- npm for package management
- TypeScript for type safety
- Tailwind CSS for UI styling

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Quick Start

```bash
# Clone the repository
git clone https://github.com/kslinh/prelegal.git
cd prelegal/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
npm run build
npm run start
```

## Usage Guide

### Browsing Templates
1. Visit the dashboard at `/`
2. Use the search bar to find templates by name or description
3. Click category filter pills to filter by type
4. Click "View →" on a template card to open the template viewer

### Customizing Templates
1. Open a template from the dashboard
2. Fill in customizable fields in the right sidebar
3. View real-time preview in the main content area
4. **Select jurisdiction from dropdown** when available (90+ options)
5. Click "Download JSON" or "Download Text" to export

### Editing Templates
1. Click the "Edit" button in the template viewer header
2. Edit template section content in text areas
3. Click "Save Draft" to persist changes to localStorage
4. Your draft is saved locally with timestamp
5. Click "Restore" to load saved changes or "Discard" to remove draft
6. Unsaved changes warning appears when draft exists

### Managing Favorites
- Click the heart icon to add/remove templates from favorites
- Favorites persist across browser sessions
- Access favorite status in template cards (filled red heart icon)

## Architecture

### Project Structure
```
prelegal/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/               # Next.js app directory (SSR)
│   │   │   ├── page.tsx       # Dashboard home
│   │   │   ├── templates/[id] # Template viewer (dynamic route)
│   │   │   ├── api/templates  # API routes
│   │   │   │   ├── route.ts   # GET /api/templates
│   │   │   │   └── [id]/route.ts # GET /api/templates/[id]
│   │   │   ├── layout.tsx     # Root layout + providers
│   │   │   └── globals.css    # Global styles
│   │   ├── components/        # Reusable React components
│   │   │   ├── TemplateViewer.tsx    # Main template viewer
│   │   │   ├── TemplateCard.tsx      # Template grid card
│   │   │   ├── SearchBar.tsx         # Search input
│   │   │   ├── CategoryFilter.tsx    # Category pills
│   │   │   └── TemplateGrid.tsx      # Grid layout
│   │   ├── context/           # State management
│   │   │   └── TemplateContext.tsx   # Global template state
│   │   ├── lib/               # Utilities
│   │   │   ├── utils.ts       # Utility functions
│   │   │   └── templateLoader.ts # Template loading
│   │   └── types/             # TypeScript types
│   │       └── template.ts    # Template interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── templates/                  # Legal template data (JSON)
│   ├── index.json             # Template registry + categories
│   ├── nda.json               # NDA template
│   ├── mnda.json              # Mutual NDA template
│   ├── nda_comprehensive.json  # Comprehensive NDA v2.0
│   ├── service_agreement.json  # Service agreement
│   ├── laws_reference.json    # Jurisdiction reference data
│   └── loader.py              # Python template loader utility
├── README.md                   # This file
├── LICENSE                     # MIT License
└── .gitignore
```

### State Management

The application uses React Context with useReducer for global state:

```typescript
interface TemplateState {
  favorites: Set<string>                    // Favorite template IDs
  customizations: Record<string, {}>        // User customizations per template
  drafts: Record<string, Draft>             // Saved draft edits with timestamps
  editingSectionId: string | null           // Current edit section ID
  editingSectionContent: string             // Edited content
}

interface Draft {
  templateId: string
  sections: Record<string, string>          // Edited section content
  customizations: CustomizationMap          // Applied customizations
  savedAt: number                           // Timestamp
}

type Action = 
  | TOGGLE_FAVORITE | SET_FIELD | RESET_FIELDS
  | START_EDIT_SECTION | UPDATE_EDIT_CONTENT | CANCEL_EDIT_SECTION
  | SAVE_DRAFT | DELETE_DRAFT | RESTORE_DRAFT
  | LOAD_PERSISTED
```

### Data Flow
```
User visits dashboard (/)
    ↓
Next.js loads page.tsx
    ↓
SWR fetches /api/templates
    ↓
Template loader reads templates/index.json
    ↓
Dashboard renders TemplateGrid with TemplateCards
    ↓
User clicks template card
    ↓
Navigate to /templates/[id]
    ↓
Template loader reads templates/[id].json
    ↓
TemplateViewer renders with TemplateContext
    ↓
User customizes fields → dispatch SET_FIELD action
    ↓
Real-time preview updates with customizations
    ↓
User saves draft → dispatch SAVE_DRAFT action
    ↓
Drafts persisted to localStorage
    ↓
Page reload → LOAD_PERSISTED action hydrates state
```

## API Endpoints

### GET /api/templates
Returns all available templates and categories.

**Response:**
```json
{
  "templates": [
    {
      "id": "nda-001",
      "name": "Non-Disclosure Agreement",
      "description": "One-way NDA...",
      "category": "non-disclosure",
      "version": "1.0"
    }
  ],
  "categories": [
    {
      "name": "non-disclosure",
      "description": "Agreements for protecting confidential information"
    },
    {
      "name": "services",
      "description": "Agreements for service relationships"
    }
  ]
}
```

### GET /api/templates/[id]
Returns details of a specific template with sections and customizable fields.

**Example: GET /api/templates/nda-comprehensive**

**Response:**
```json
{
  "id": "nda-comprehensive",
  "name": "Comprehensive Non-Disclosure Agreement",
  "description": "Advanced NDA with detailed provisions...",
  "category": "non-disclosure",
  "version": "2.0",
  "sections": [
    {
      "id": "definitions",
      "title": "Definitions and Interpretation",
      "content": "1.1 \"Confidential Information\" means...",
      "required": true,
      "modifiable": true
    }
  ],
  "customizableFields": [
    {
      "name": "Effective Date",
      "placeholder": "[e.g., June 16, 2026]",
      "type": "text",
      "required": true
    },
    {
      "name": "Jurisdiction",
      "placeholder": "Select a jurisdiction...",
      "type": "select",
      "options": ["California", "Delaware", ..., "Sweden"],
      "required": true
    }
  ]
}
```

## Features & Implementation Status

### Completed Features ✅
- Dashboard with search and filtering
- Template browsing with metadata display
- Dynamic customization forms
- **Jurisdiction selection dropdowns** (90+ options)
- Edit mode with inline editing
- Draft auto-saving and management
- Download as JSON/Text
- Favorites management
- localStorage persistence
- Responsive design (mobile, tablet, desktop)
- Type-safe state management (TypeScript)
- SEO-optimized pages (Next.js SSR)
- Error handling and loading states

### Future Features (Post-PL-3) 🚀
- Backend integration (FastAPI)
- User authentication and accounts
- PDF export
- Collaboration features
- Approval workflows
- Template versioning
- E-signature integration
- Advanced search
- Admin template management
- Analytics and usage tracking

## Recent Updates

### Version 2.0 - Jurisdiction Selection & Enhanced Templates
- Added select field type to customizable fields
- Created comprehensive NDA template with 11 sections and 14 fields
- Added 90+ jurisdiction dropdown options
- Implemented edit mode with draft management
- Added laws reference data file

### Version 1.0 - Initial Dashboard
- Template browsing dashboard
- Search and category filtering
- Template viewer with customization
- Favorites management
- Download functionality

## Development & Contributing

### Local Development
```bash
cd frontend
npm install
npm run dev
```

Development server runs on http://localhost:3000 with hot reload enabled.

### TypeScript & Code Quality
```bash
npm run type-check  # TypeScript compilation check
npm run build       # Production build optimization
```

### Adding New Templates
1. Create a new JSON file in the `templates/` directory following the template schema
2. Add entry to `templates/index.json` with metadata
3. Include customizable fields with proper types (text or select)
4. For jurisdiction selection, use select type with options array
5. Templates reload automatically on page refresh

### Template Schema
```typescript
interface Template {
  id: string                      // Unique identifier (kebab-case)
  name: string                    // Display name
  description: string             // Brief description
  category: string                // Category tag
  version: string                 // Semantic version
  sections: TemplateSection[]     // Document sections
  customizableFields: CustomizableField[]
}

interface TemplateSection {
  id: string                      // Unique section ID
  title: string                   // Section title
  content: string                 // Content with [placeholder] fields
  required: boolean               // Must be included
  modifiable: boolean             // Can user edit in edit mode?
}

interface CustomizableField {
  name: string                    // Field name (matches [placeholders])
  placeholder: string             // Hint text
  type: 'text' | 'select'         // Input type
  options?: string[]              // For select type
  required: boolean               // Validation
}
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2026 kslinh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
