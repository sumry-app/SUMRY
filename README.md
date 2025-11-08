# SUMRY - IEP Management System

A comprehensive React application for managing Individualized Education Programs (IEPs) in special education settings.

## Features

### Core Functionality
- **Student Management** - Track student profiles, grades, and disabilities
- **IEP Goals** - Create, edit, and monitor educational goals
- **Progress Tracking** - Log student progress with data visualization
- **AI-Powered Goal Generation** - Generate research-based IEP goals instantly
- **Goal Templates** - Quick-start templates for common goal types
- **Analytics Dashboard** - Overview of students, goals, and progress metrics

### Advanced Features
- **Statistical Analysis** - Trendline analysis and progress projections
- **Status Indicators** - Automatic on-track/off-track goal monitoring
- **Progress Charts** - Interactive visualizations with baseline and target lines
- **Data Export/Import** - JSON format for backup and transfer
- **Offline Support** - Works without internet, syncs when online
- **Progress Reports** - Generate downloadable progress reports

## Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Beautiful, accessible component library
- **Recharts** - Powerful charting library
- **Lucide React** - Icon system
- **Local Storage** - Client-side data persistence

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Usage Guide

### 1. Add Students
Navigate to the "Students" tab and click "Add Student" to create student profiles with:
- Name
- Grade level
- Disability classification (optional)

### 2. Create Goals
In the "Goals" tab, create IEP goals using:
- **AI Assistant** - Generate goals based on area, focus, and current level
- **Templates** - Choose from pre-built goal templates
- **Manual Entry** - Create custom goals from scratch

Each goal includes:
- Goal area (Reading, Math, Writing, Behavior, etc.)
- Measurable description
- Baseline performance
- Target performance
- Measurement metric

### 3. Log Progress
Track student progress in the "Progress" tab:
- Select a goal
- Enter the date and score
- Add optional notes
- Attach evidence (optional)

### 4. Monitor & Analyze
View progress through:
- **Interactive charts** with trendlines
- **Statistical analysis** showing trajectory
- **Status indicators** (on-track/off-track/needs data)
- **Progress reports** for IEP meetings

### 5. Export/Import Data
- **Export** - Download all data as JSON for backup
- **Import** - Restore data from a previous export

## Data Storage

All data is stored locally in your browser's localStorage under the key `sumry_complete_v1`. This means:
- ✅ No server required
- ✅ Works offline
- ✅ Fast performance
- ⚠️ Data is tied to your browser/device
- ⚠️ Clearing browser data will delete your information

**Important**: Regularly export your data for backup!

## Goal Progress Analysis

SUMRY uses statistical analysis to help monitor goal progress:

- **Trendline Analysis** - Linear regression shows trajectory
- **Projections** - Predicts if student will reach target
- **Data Validity** - Recommends 7-12 data points for reliable trends
- **Status Alerts** - Flags goals that may need IEP team review

### Status Indicators
- 🟢 **On Track** - Current trajectory meets 80%+ of target
- 🔴 **Off Track** - IEP team review recommended
- ⚪ **Need More Data** - Collect more data points (minimum 3 required)

## AI Goal Generator

The AI assistant provides research-based goal templates for:

**Reading**
- Fluency (WPM)
- Comprehension
- Phonics/decoding

**Math**
- Computation
- Word problems
- Math facts fluency

**Writing**
- Composition
- Mechanics
- Spelling

**Behavior**
- On-task behavior
- Social skills
- Self-regulation

## File Structure

```
SUMRY/
├── src/
│   ├── components/
│   │   └── ui/          # Reusable UI components
│   ├── lib/
│   │   └── utils.js     # Utility functions
│   ├── App.jsx          # Main application
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── postcss.config.js    # PostCSS configuration
```

## Contributing

This is a special education tool designed for teachers and educational professionals. Contributions that improve accessibility, usability, and educational value are welcome.

## License

MIT License - Feel free to use and modify for educational purposes.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ for special education teachers
