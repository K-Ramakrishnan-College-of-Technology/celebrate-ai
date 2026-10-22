# Aura Celebrations — AI Event & Celebration Planner

> A production-grade, full-stack celebration planning assistant powered by Google Gemini, designed to organize weddings, milestone birthdays, and community festivals with dynamic budgets, day-of timelines, vendor checklists, and personalized creative concepts.

---

## 🌟 Key Features

### 1. Multi-Event Architecture & AI Plan Synthesis
- **Preloaded Sample Celebrations**: Immediate exploration across different event formats:
  - *Elena & Marcus's Coastal Sunset Wedding* (120 guests, Big Sur cliffside)
  - *Leo's 10th Superhero Academy Birthday* (35 guests, community garden)
  - *Oakwood Summer Solstice Arts & Food Festival* (450 attendees, city park)
- **AI Celebration Architect**: Generate bespoke plans specifying event type, guest count, budget ceiling, aesthetic vibe, location, and constraints. Gemini synthesizes a complete theme, budget allocation, run-of-show schedule, vendor roster, and custom ideas.

### 2. Chronological Run of Show & Day-Of Timelines
- **Phased Event Navigation**: Filter across milestones: *Morning Prep*, *Arrival & Welcome*, *Ceremony / Kickoff*, *Dining & Toasts*, *Celebration & Dancing*, *Send-Off*, and *Wrap-up*.
- **Safety Buffer Math**: Embedded safety cushions (`+buffer minutes`) to prevent delays during dinner service and golden hour photo sessions.
- **AI Pacing Audit**: Pinpoint timeline bottlenecks, transition delays, and sound check timing.
- **Printable Day-Of Sheet**: One-click print / export formatted specifically for on-site venue managers, DJs, and coordinators.

### 3. Financial Ledger & AI Budget Optimization
- **Category Allocation Targets**: Visual distribution bars for venue, catering, photography, audio, florals, and contingency funds.
- **Itemized Ledger**: Real-time tracking of estimated vs. actual expenses with tabular numeral alignment (`font-mono tabular-nums`).
- **Payment & Invoice Tracking**: Mark deposits and invoices as paid/unpaid, with automatic variance calculations.
- **AI Budget Audit**: Analyzes spending against target ceilings to recommend high-impact cost-saving hacks, fund reallocations, and vendor negotiation tips.

### 4. Vendor Management & Automated RFP Generator
- **Status Lifecycle Pipeline**: Track vendors from *Researching* → *Contacted* → *Quote Received* → *Booked* → *Deposit Paid*.
- **Contract Risk Checklist**: Flags for liability insurance verification and deposit payments.
- **Curated Vetting Questions**: Top 3 crucial questions to ask each vendor category before signing contracts.
- **1-Click AI Inquiry / RFP Drafter**: Generates tailored outreach messages including event specs, budget expectations, and questions, ready to copy and send.

### 5. Creative Vision Studio & Speechwriter
- **Color Palette Cards**: Harmonious palettes complete with hex codes and design roles (primary accents, floral undertones, structural neutrals).
- **GenAI Concept Brainstorm Studio**: Instant ideation for signature mocktails/cocktails, interactive guest moments, keepsakes/favors, and rain contingencies.
- **Celebration Toast Assistant**: Custom speechwriter that drafts speeches for Maids of Honor, Best Men, Hosts, and Parents with bracketed delivery cues (`[Pause for laughter]`, `[Raise glass]`), speaking times, and stage presence tips.

### 6. Guest List & Caterer Dietary Breakdown
- **RSVP Tracking**: Confirmed *Attending*, *Awaiting*, and *Declined* tallies.
- **Catering Meal Counter**: Automatically parses complex dietary preferences (e.g. Vegetarian, Gluten-Free, Halal, Nut Allergies) and accounts for plus-ones for accurate caterer submissions.

---

## 🛡️ Security & Architecture

- **Server-Side AI Isolation**: All Gemini SDK calls run on an Express server (`server.ts`). The API key (`GEMINI_API_KEY`) is strictly server-bound and is never exposed in client bundles.
- **HTTP Security Headers**: Implements `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict request size limits (`2mb`).
- **Input Sanitization**: Parameter validation and boundary limits on all user-submitted fields to prevent memory exhaustion and injection attacks.
- **Zero Broken Images**: Resilient image handling with graceful SVG/CSS gradient fallbacks.

---

## ♿ Accessibility (WCAG 2.1 AA)

- **Skip Navigation**: Accessible `<a href="#main-content">Skip to main content</a>` link for screen readers and keyboard users.
- **Focus Indicators**: Visible `focus-visible:ring-2 focus-visible:ring-stone-900` outlines on all interactive elements.
- **Accessible Modals**: Implements `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `Escape` key listeners to dismiss overlays.
- **High-Contrast Palette**: Text meets or exceeds the 4.5:1 WCAG contrast ratio on all backgrounds.
- **Tabular Figures**: Numeric dashboards and timestamps enforce `tabular-nums` to prevent visual jitter.

---

## 🧪 Automated Testing

A comprehensive test suite built with **Vitest** covers core business logic:

```bash
npm test
```

### Test Coverage Highlights:
- **Budget Metrics**: Allocated targets, actual committed spend, invoice settlements, variance, and over-budget triggers.
- **Timeline Calculations**: Buffer minute aggregation, milestone completion rates, and phase filters.
- **Dietary Parser**: Multi-dietary item extraction, plus-one accounting, and RSVP status filtering.
- **Date Math**: Calendar countdown calculations for past, today, and future dates.
- **Input Validation**: Boundary conditions and required parameter checks.

---

## 🚀 Quickstart

### Prerequisites
- Node.js (v18+)
- Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/aura-celebrations.git
   cd aura-celebrations
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   PORT=3000
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Express, Node.js, tsx
- **AI SDK**: `@google/genai` (Gemini 3.8 Flash)
- **Testing**: Vitest
- **Build Tool**: Vite

---

## 📄 License

This project is licensed under the Apache-2.0 License.
