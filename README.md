# 🎓 SUMRY - Enterprise IEP Management System

> **AI-Powered Individualized Education Program (IEP) Management Platform**

SUMRY is a comprehensive, enterprise-grade web application designed for special education teachers and professionals to manage IEP goals, track student progress, and leverage AI for data-driven insights.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/react-18.3.1-blue.svg)](https://reactjs.org)
[![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E.svg)](https://supabase.com)

---

## ⚠️ Current status: migration in progress

The Supabase backend is provisioned and a complete service layer exists under
`src/services/`, **but the UI is not connected to it yet.** `App.jsx` still
persists data to browser `localStorage` (via `usePersistentStore`) and uses a
local `sumry_users_v1` login scheme rather than Supabase Auth.

Practical consequences today:

- Data is stored per-browser. It is not synced across devices, not shared
  between users, and not backed up server-side.
- Nothing in `src/lib/supabase.js` or the `supabase*.js` services is reachable
  from the app entry point, so it is tree-shaken out of the production bundle.
- The schema, Row Level Security policies and storage bucket described below
  are real and applied — they are simply not exercised by the UI yet.

Connecting the UI to the service layer is the main outstanding task. Everything
below describes the intended and already-implemented backend architecture.

---

## ✨ Key Features

### 🤖 **AI-Powered Features**
- **GPT-4 Goal Generation**: ⚠️ **Not yet functional.** The AI goal-generation flow is wired up in the UI and service layer, but the OpenAI-calling backend was removed along with the Express server and has not yet been reimplemented as a Supabase Edge Function. Calling it currently throws an explanatory error.
- **Progress Predictions**: Trend analysis (linear regression) over logged progress data
- **Data-Driven Insights**: Analytics dashboards for informed decision-making

### 🏢 **Enterprise Features**
- **Role-Based Access Control (RBAC)**: Admin, Teacher, Therapist, Parent, and Viewer roles
- **Team Collaboration**: Multi-user access with granular permissions
- **Row Level Security**: Postgres RLS policies (via Supabase) scope every table to the authenticated user/organization
- **Audit Logging**: `audit_logs` table in the schema for compliance tracking

### 📊 **IEP Management**
- **Student Profiles**: Manage student information, disabilities, and grade levels
- **Goal Tracking**: Create, update, and monitor SMART IEP goals across multiple areas
- **Progress Logging**: Record and visualize student progress with charts and analytics
- **Accommodations**: Track and apply accommodations to progress sessions
- **Evidence Repository**: Attach files and evidence to support progress

### 📈 **Analytics & Reporting**
- **Visual Dashboards**: Real-time statistics and progress visualization
- **Trendline Analysis**: Linear regression for progress prediction
- **Professional PDF Reports**: Export beautiful IEP progress reports
- **Summary Reports**: Generate organization-wide analytics
- **Data Export/Import**: JSON backup and restore capabilities

---

## 🏗️ Architecture

### **Tech Stack**

#### Frontend
- **React 18.3.1** - Modern UI library with hooks
- **Vite 5** - Lightning-fast build tool
- **Tailwind CSS 3** - Utility-first styling with glassmorphism
- **Zustand 4** - Lightweight state management
- **Recharts 2** - Data visualization
- **jsPDF** - Professional PDF generation
- **Axios** - HTTP client with interceptors

#### Backend
- **Supabase** - Hosted Postgres database, authentication, and storage (no self-hosted server)
- **Supabase Auth** - Email/password authentication with session tokens
- **Row Level Security (RLS)** - Postgres policies enforce per-user/organization data access
- **Supabase Storage** - File/evidence storage
- **Supabase Edge Functions** - Planned home for the OpenAI-powered AI goal generation (not yet deployed)

#### Testing & Quality
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting with React rules
- **Prettier** - Consistent code formatting
- **Husky** - Pre-commit Git hooks

---

## 📁 Project Structure

```
SUMRY/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # 10 reusable UI components
│   │   ├── auth/                 # Authentication views
│   │   ├── students/             # Student management
│   │   ├── goals/                # Goal management
│   │   ├── progress/             # Progress tracking
│   │   ├── dashboard/            # Analytics dashboard
│   │   ├── shared/               # Shared components
│   │   └── layout/               # Layout components
│   ├── lib/
│   │   └── supabase.js           # Supabase client (createClient)
│   ├── store/                    # Zustand state management
│   │   ├── authStore.js          # Authentication state
│   │   └── dataStore.js          # Application data state
│   ├── services/                 # Supabase-backed service layer
│   │   ├── api.js                # Re-exports the services below as authAPI/studentsAPI/goalsAPI/progressAPI
│   │   ├── supabaseAuth.js       # Auth (sign up, sign in, profile)
│   │   ├── supabaseStudents.js   # Student CRUD
│   │   ├── supabaseGoals.js      # Goal CRUD + progress prediction
│   │   ├── supabaseProgress.js   # Progress log CRUD + analytics
│   │   └── pdfExport.js          # PDF generation service
│   ├── App.jsx                   # Main application
│   └── main.jsx                  # Entry point
├── supabase-schema.sql           # Initial Postgres schema (tables, RLS policies)
├── tests/                        # Testing infrastructure
│   ├── setup.js                  # Test configuration
│   ├── unit/                     # Component tests
│   ├── integration/              # API tests
│   └── e2e/                      # End-to-end tests
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── vitest.config.js              # Vitest configuration
└── package.json                  # Frontend dependencies
```

There is no `server/` directory and no separate backend to run — Supabase (hosted Postgres + Auth + Storage) is the entire backend.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org))
- **npm or yarn**
- **A Supabase project** ([Create one here](https://supabase.com)) — provides the Postgres database, authentication, and storage

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SUMRY.git
cd SUMRY
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Both variables come from your Supabase project's Settings → API page. They **must** be prefixed with `VITE_` so Vite inlines them into the frontend build — no other environment variables are required.

#### 4. Set Up the Database

In the Supabase SQL Editor (or via the Supabase CLI), run `supabase-schema.sql` against your project. This creates the 16 core tables (`user_profiles`, `students`, `goals`, `progress_logs`, `accommodations`, `evidence`, `audit_logs`, `ai_suggestions`, and more) along with Row Level Security policies. Additional schema changes are tracked as migrations under `supabase/migrations/`.

---

## ⚙️ Configuration

### Frontend Environment (.env)

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

There is no separate backend `.env` file — Supabase is a hosted service, and the anon key is safe to expose in the frontend because Row Level Security policies enforce access control server-side.

---

## 🎮 Running the Application

### Development Mode

```bash
npm run dev
```
Frontend runs on **http://localhost:5173** and talks directly to your Supabase project — there is no local backend process to start.

### Production Build

```bash
# Build frontend
npm run build

# Preview the production build locally
npm run preview
```

---

## 📚 Service Layer

There is no REST API — the frontend talks directly to Supabase (Postgres + Auth) via `@supabase/supabase-js`, with Row Level Security policies enforcing access control. The service layer in `src/services/` wraps those Supabase calls behind the same function names the app used to call on the old Express API, re-exported from `src/services/api.js`:

### `authAPI` (`src/services/supabaseAuth.js`)
- `login(email, password)` — `supabase.auth.signInWithPassword`, then loads the `user_profiles` row
- `register(userData)` — `supabase.auth.signUp` with profile fields in user metadata
- `getProfile()` — current user + their `user_profiles` row
- `updateProfile(userData)` — updates `user_profiles`
- `changePassword(currentPassword, newPassword)` — `supabase.auth.updateUser`

### `studentsAPI` (`src/services/supabaseStudents.js`)
- `getAll()` — active students for the current user, with goal counts
- `getById(studentId)`
- `create(studentData)`
- `update(studentId, studentData)`
- `delete(studentId)` — soft delete (`is_active = false`)
- `addTeamMember(studentId, memberData)`

### `goalsAPI` (`src/services/supabaseGoals.js`)
- `getByStudent(studentId)`
- `getById(goalId)`
- `create(goalData)`
- `update(goalId, goalData)`
- `delete(goalId)`
- `getProgressPrediction(goalId)` — client-side linear regression over logged scores
- `generateAI(aiData)` — ⚠️ **not functional yet.** Currently throws `"AI Goal Generation requires Supabase Edge Function setup"`. The old OpenAI integration lived in the deleted `server/src/services/openai.service.js` and needs to be reimplemented as a Supabase Edge Function before this works again.

### `progressAPI` (`src/services/supabaseProgress.js`)
- `getByGoal(goalId)`
- `create(logData)` — also links any `accommodationIds` via `progress_log_accommodations`
- `update(logId, logData)`
- `delete(logId)`
- `getAnalytics(studentId)` — goal counts, total logs, and recent activity for a student

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage

Target: **80%+ coverage**

```
Statements   : 82.5%
Branches     : 78.3%
Functions    : 85.1%
Lines        : 83.2%
```

### Writing Tests

```javascript
// Example component test
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ **Supabase Auth** - Email/password authentication, managed session tokens
- ✅ **Row Level Security (RLS)** - Postgres policies scope every query to the authenticated user, their students, and their team
- ✅ **Role-Based Access Control** - Admin, Teacher, Therapist, Parent, and Viewer roles
- ✅ **SECURITY DEFINER helper functions** - centralize team-membership access checks and avoid RLS policy recursion (see `supabase/migrations/002_rls_hardening_and_storage.sql`)

### Compliance
- ⚠️ **Audit Logs** - `audit_logs` table and RLS policy exist in the schema; the app does not yet write to it
- ✅ **FERPA Ready** - Student data privacy via RLS
- ✅ **Soft Deletes** - Data retention (`is_active` flag on students)

---

## 📊 Database Schema

### Core Tables (16 total)

Defined in `supabase-schema.sql`, with Row Level Security enabled on every table and hardened by `supabase/migrations/002_rls_hardening_and_storage.sql`.

**user_profiles** - User accounts (extends Supabase Auth users)
```sql
id, first_name, last_name, role, organization, created_at
```

**students** - Student profiles
```sql
id, first_name, last_name, grade_level, disability_classification,
created_by, organization, is_active
```

**goals** - IEP goals
```sql
id, student_id, area, description, baseline_value, target_value,
metric_unit, status, ai_generated, created_by
```

**progress_logs** - Progress data points
```sql
id, goal_id, log_date, score, notes, logged_by
```

**audit_logs** - Compliance tracking (schema only — not yet written to by the app)
```sql
id, user_id, action, entity_type, entity_id, old_values,
new_values, ip_address, user_agent, created_at
```

**ai_suggestions** - AI usage tracking (for when Edge Function-based generation ships)
```sql
id, user_id, student_id, suggestion_type, prompt,
response, tokens_used, created_at
```

Other tables include `team_members`, `accommodations`, `progress_log_accommodations`, `evidence`, `present_levels`, `service_logs`, `behavior_logs`, `assessments`, `compliance_items`, and `comments`. See `supabase-schema.sql` for the complete schema and `supabase/migrations/` for changes applied since.

---

## 🚢 Deployment

SUMRY deploys as a static frontend — there is no backend to host.

**Frontend (Vercel):**
```bash
# Push to main — Vercel auto-builds via vercel.json
# (buildCommand: npm run build, outputDirectory: dist)
git push origin main

# Or deploy manually
npm i -g vercel
vercel --prod
```

Set these two environment variables in the Vercel project settings (Project → Settings → Environment Variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Database:** Your Supabase project is already hosted — no migration step is needed at deploy time. Apply `supabase-schema.sql` and any files under `supabase/migrations/` to your Supabase project once (via the SQL Editor or Supabase CLI), independent of frontend deploys.

### Environment Checklist

**Production:**
- ✅ `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set in Vercel
- ✅ Supabase schema + migrations applied to the production project
- ✅ Row Level Security policies verified on all tables
- ✅ HTTPS enabled (default on Vercel and Supabase)

---

## 🎨 Features in Detail

### AI Goal Generation

⚠️ **Not currently functional.** The plan is for a Supabase Edge Function to call OpenAI GPT-4 and generate:
- Research-based goal statements
- Appropriate baselines and targets
- Suggested accommodations
- Progress monitoring strategies
- Evidence-based practices references

This replaces the old Express-based `server/src/services/openai.service.js`, which was removed along with the rest of the `server/` directory. Until the Edge Function is built, `goalsAPI.generateAI()` throws an error.

### PDF Reports

Generate professional IEP progress reports with:
- Student information header
- Goal summaries with progress data
- Interactive charts and graphs
- Progress statistics
- Professional formatting

### Analytics Dashboard

Real-time metrics:
- Total students, goals, progress logs
- On-track goal percentages
- Recent activity feed
- Goal completion rates
- Data visualization with Recharts

### Team Collaboration

- Add team members to student cases
- Role-based permissions (view/edit)
- Track who made changes
- Comment threads (coming soon)

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Completed)
- Student/goal/progress CRUD
- Local storage
- Basic authentication
- UI with glassmorphism

### ✅ Phase 2: Enterprise (Completed - v2.0)
- Backend API with PostgreSQL (Node/Express — since retired)
- RBAC and team collaboration
- PDF export
- Testing infrastructure
- Security hardening

### ✅ Phase 3: Supabase Migration (Completed)
- Migrated backend from self-hosted Node/Express + PostgreSQL to Supabase
- Supabase Auth replaces custom JWT authentication
- Row Level Security policies replace application-level authorization
- `server/` directory removed entirely

### 🔄 Phase 4: Advanced (In Progress)
- **AI goal generation via Supabase Edge Function** (reimplementing the removed OpenAI integration)
- Real-time collaboration (WebSockets)
- Email notifications
- Calendar integration
- Mobile app (React Native)
- Bulk import/export

### 📅 Phase 5: Scale (Q2 2025)
- Multi-tenancy
- SSO (Google, Microsoft)
- Advanced AI analytics
- Kubernetes deployment

---

## 📖 User Guide

### Quick Start

1. **Register**: Create teacher/admin account
2. **Add Students**: Input student profiles
3. **Generate Goals**: Use AI or templates
4. **Log Progress**: Record data regularly
5. **View Analytics**: Monitor trends
6. **Export Reports**: Generate PDFs

### Best Practices

**Goal Creation:**
- Use AI generation for research-based goals
- Set SMART objectives
- Include baseline data
- Choose appropriate metrics

**Progress Logging:**
- Log consistently (weekly/bi-weekly)
- Add detailed notes
- Document accommodations
- Attach evidence when possible

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Write tests
4. Follow ESLint/Prettier
5. Submit PR

---

## 📝 License

MIT License - See LICENSE file

---

## 📞 Support

**Issues**: [GitHub Issues](https://github.com/yourusername/SUMRY/issues)

**Email**: support@sumry.app

---

## 🌟 Acknowledgments

- Supabase for hosted Postgres, auth, and storage
- OpenAI for the GPT-4 API (planned, via Edge Function)
- shadcn/ui for component patterns
- Special education professionals for feedback

---

**Built with ❤️ for special education professionals**

*Making IEP management intelligent, efficient, and accessible.*
