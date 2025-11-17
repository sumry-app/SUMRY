# SUMRY Smart Templates System

A powerful, flexible template system for creating IEP goals, meeting notes, progress reports, and more.

## Features

- **50+ Pre-built Templates** - Comprehensive collection covering all IEP categories
- **Variable Substitution** - Dynamic placeholders like `{{studentName}}`, `{{grade}}`
- **Conditional Logic** - If/else statements for flexible content
- **Category Organization** - Reading, Math, Writing, Behavior, Communication, Social Skills, Motor Skills, Transition, etc.
- **Search & Filter** - Find templates quickly by name, category, or tags
- **Favorites & Recent** - Quick access to frequently used templates
- **Template Editor** - Rich editing interface with variable insertion and preview
- **Import/Export** - Share templates or backup custom ones
- **Auto-fill** - Smart field detection and suggestions
- **Template Validation** - Ensures templates are well-formed

## Quick Start

### 1. Import Components

```jsx
import { TemplateManager, TemplateLibrary, TemplateEditor } from '@/components/templates';
import { templateEngine, renderTemplate } from '@/lib/templateEngine';
import { loadPrebuiltTemplates } from '@/lib/prebuiltTemplates';
```

### 2. Initialize Templates (one-time setup)

```jsx
// Load pre-built templates
loadPrebuiltTemplates(templateEngine);
```

### 3. Use Template Manager

```jsx
function MyComponent() {
  const handleUseTemplate = (template) => {
    // Handle template selection
    const rendered = renderTemplate(template, {
      studentName: 'John Doe',
      baseline: '45',
      target: '68',
      endDate: '06/15/2025'
    });
    console.log(rendered);
  };

  return (
    <TemplateManager
      onUseTemplate={handleUseTemplate}
      onClose={() => console.log('closed')}
    />
  );
}
```

## Components

### TemplateManager

Main component that integrates library and editor.

```jsx
<TemplateManager
  onUseTemplate={(template) => {}}  // Called when template is selected
  onClose={() => {}}                // Called when manager should close
  className="custom-class"          // Optional CSS class
/>
```

### TemplateLibrary

Browse and search templates.

```jsx
<TemplateLibrary
  onSelectTemplate={(template) => {}}   // Called when template is selected
  onCreateTemplate={() => {}}           // Called when "Create" is clicked
  className="custom-class"
/>
```

### TemplateEditor

Create or edit templates.

```jsx
<TemplateEditor
  template={existingTemplate}     // Optional: template to edit
  onSave={(template) => {}}       // Called when template is saved
  onCancel={() => {}}             // Called when editor is cancelled
  className="custom-class"
/>
```

## Template Engine API

### Basic Operations

```js
// Get all templates
const allTemplates = templateEngine.getAllTemplates();

// Filter by category
const readingTemplates = templateEngine.filterTemplates({
  category: 'reading'
});

// Search templates
const fluencyTemplates = templateEngine.filterTemplates({
  search: 'fluency'
});

// Get favorites
const favorites = templateEngine.getFavoriteTemplates();

// Get recent
const recent = templateEngine.getRecentTemplates();

// Toggle favorite
templateEngine.toggleFavorite(templateId);
```

### Template Rendering

```js
import { renderTemplate } from '@/lib/templateEngine';

const template = templateEngine.getTemplate(templateId);
const data = {
  studentName: 'Jane Smith',
  baseline: '50',
  target: '75',
  accuracy: '85',
  trials: '4',
  totalTrials: '5',
  endDate: '06/15/2025'
};

const rendered = renderTemplate(template, data);
```

### Creating Custom Templates

```js
import { Template } from '@/lib/templateEngine';

const customTemplate = new Template({
  name: 'My Custom Goal',
  content: `{{studentName}} will improve from {{baseline}} to {{target}} with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} trials by {{endDate}}.`,
  category: 'custom',
  description: 'Custom IEP goal template',
  tags: ['custom', 'personalized'],
  isPublic: false
});

templateEngine.addTemplate(customTemplate);
```

### Template Validation

```js
const validation = templateEngine.validate(template);

if (validation.isValid) {
  console.log('Template is valid');
} else {
  console.error('Errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}

console.log('Variables:', validation.variables);
```

### Import/Export

```js
// Export single template
const json = templateEngine.exportTemplate(templateId);
// Save to file or share

// Export all templates
const allJson = templateEngine.exportAllTemplates();

// Import template
const imported = templateEngine.importTemplate(jsonString);

// Import multiple templates
const imported = templateEngine.importTemplates(jsonString);
```

## Template Syntax

### Variables

Use double curly braces for variables:

```
{{studentName}} will read {{target}} words per minute.
```

### Conditional Logic

#### Simple If Statement

```
{{#if useVisualSupports}}
Visual supports will be provided.
{{/if}}
```

#### If/Else Statement

```
{{#if useCurriculum}}
Using district curriculum
{{else}}
Using alternative materials
{{/if}}
```

#### Comparison Operators

```
{{#if accuracy >= 80}}
Student has mastered this skill.
{{/if}}

{{#if trials > 3}}
Extended practice provided.
{{/if}}
```

Supported operators:
- `===` - equals
- `!==` - not equals
- `>` - greater than
- `>=` - greater or equal
- `<` - less than
- `<=` - less or equal

#### Unless Statement

```
{{#unless completed}}
Student is still working on this goal.
{{/unless}}
```

## Template Categories

The system supports these pre-defined categories:

- **Reading** - Fluency, comprehension, phonics, decoding
- **Math** - Computation, word problems, number sense, geometry
- **Writing** - Sentences, paragraphs, essays, grammar
- **Behavior** - On-task, compliance, self-regulation, social interactions
- **Communication** - Expressive, receptive, articulation, AAC
- **Social Skills** - Greetings, turn-taking, conflict resolution
- **Motor Skills** - Fine motor, gross motor, handwriting
- **Transition** - Post-secondary planning, independent living, vocational
- **Progress Monitoring** - Data collection, quarterly reports
- **Meeting Notes** - IEP meetings, parent conferences
- **Reports** - Progress reports, evaluation summaries
- **Custom** - User-created templates

## Variable Types

The system recognizes these variable groups:

### Student Variables
- `studentName`, `studentAge`, `studentGrade`, `studentId`, `studentGender`

### Academic Variables
- `currentLevel`, `baseline`, `target`, `subject`, `skill`, `accuracy`, `frequency`

### Date Variables
- `startDate`, `endDate`, `reviewDate`, `meetingDate`, `currentDate`, `schoolYear`

### Staff Variables
- `teacherName`, `caseManager`, `provider`, `evaluator`

### Progress Variables
- `attempts`, `trials`, `successRate`, `progressLevel`, `mastery`

## Auto-fill Feature

The template engine can automatically suggest values:

```js
// Auto-fill with student data
const suggestions = templateEngine.autoFill(template, {
  name: 'John Doe',
  age: 12,
  grade: '6th',
  teacher: 'Ms. Smith'
});

// Get baseline/target suggestions
const suggestions = templateEngine.suggestBaselineTarget('reading', 45);
// Returns: { baseline: 45, target: 68, measurement: 'words per minute (WPM)' }
```

## Pre-built Templates

The system includes 50+ pre-built templates:

### Reading (10 templates)
- Reading Fluency - Words Per Minute
- Reading Comprehension - Main Idea
- Reading Comprehension - Inferencing
- Phonics - Letter Sound Correspondence
- Phonemic Awareness - Blending
- Vocabulary Development
- Reading Comprehension - Question Answering
- Reading - Sight Words
- Reading Comprehension - Story Elements
- Reading - Multi-Syllabic Decoding

### Math (10 templates)
- Math Computation - Basic Operations
- Math Word Problems
- Number Sense - Place Value
- Fractions - Basic Concepts
- Math Fact Fluency
- Geometry - Shapes and Properties
- Measurement - Units and Conversion
- Data Analysis - Graphs and Charts
- Algebra - Patterns and Relationships
- Multi-Step Problem Solving

### Writing (8 templates)
- Writing - Sentence Construction
- Writing - Paragraph Development
- Writing - Narrative Story
- Writing - Opinion/Persuasive
- Writing - Informative/Explanatory
- Writing - Grammar and Conventions
- Writing - Editing and Revision
- Writing - Research Skills

### Behavior (8 templates)
- Behavior - On-Task Engagement
- Behavior - Following Directions
- Behavior - Appropriate Social Interactions
- Behavior - Self-Regulation
- Behavior - Transition Management
- Behavior - Work Completion
- Behavior - Respectful Communication
- Behavior - Accepting Feedback

### Communication (6 templates)
- Communication - Expressive Language
- Communication - Receptive Language
- Communication - Articulation
- Communication - Requesting Help
- Communication - Turn-Taking in Conversation
- Communication - AAC Device Usage

### Social Skills (5 templates)
- Social Skills - Greeting Others
- Social Skills - Sharing and Turn-Taking
- Social Skills - Reading Social Cues
- Social Skills - Joining Group Activities
- Social Skills - Conflict Resolution

### Motor Skills (4 templates)
- Fine Motor - Handwriting
- Fine Motor - Scissor Skills
- Gross Motor - Coordination and Balance
- Fine Motor - Manipulating Objects

### Transition (3 templates)
- Transition - Post-Secondary Planning
- Transition - Independent Living Skills
- Transition - Vocational Skills

### Progress Monitoring (2 templates)
- Progress Monitoring - Data Collection Template
- Progress Monitoring - Quarterly Report

### Meeting Notes (2 templates)
- IEP Meeting Notes
- Parent-Teacher Conference Notes

## Examples

### Example 1: Simple Goal Generation

```jsx
import { templateEngine, renderTemplate } from '@/lib/templateEngine';

// Get a reading fluency template
const templates = templateEngine.filterTemplates({
  category: 'reading',
  search: 'fluency'
});
const template = templates[0];

// Render with student data
const goal = renderTemplate(template, {
  studentName: 'Alex Johnson',
  baseline: '35',
  target: '60',
  endDate: '05/30/2025'
});

console.log(goal);
```

### Example 2: Form Integration

```jsx
function GoalCreator() {
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [goalText, setGoalText] = useState('');

  const handleGenerate = () => {
    const rendered = renderTemplate(template, formData);
    setGoalText(rendered);
  };

  return (
    <div>
      <TemplateLibrary onSelectTemplate={setTemplate} />
      {template && (
        <>
          <form>
            {/* Form fields for variables */}
          </form>
          <button onClick={handleGenerate}>Generate Goal</button>
          <textarea value={goalText} />
        </>
      )}
    </div>
  );
}
```

### Example 3: Batch Goal Creation

```jsx
const students = [
  { name: 'John', baseline: 45, target: 68 },
  { name: 'Jane', baseline: 52, target: 75 },
  { name: 'Bob', baseline: 38, target: 60 }
];

const template = templateEngine.getTemplate(templateId);

const goals = students.map(student => {
  return renderTemplate(template, {
    studentName: student.name,
    baseline: student.baseline,
    target: student.target,
    accuracy: '85',
    trials: '4',
    totalTrials: '5',
    endDate: '06/15/2025'
  });
});

console.log(goals);
```

## Best Practices

1. **Test templates with sample data** before using in production
2. **Use descriptive variable names** for clarity
3. **Add tags to templates** for better searchability
4. **Validate templates** before saving
5. **Export custom templates** regularly for backup
6. **Use conditionals** to create flexible, reusable templates
7. **Organize templates by category** for easy discovery
8. **Favorite frequently used templates** for quick access

## Troubleshooting

### Template not rendering correctly

Check that:
- All variables in the template have corresponding data values
- Conditional syntax is correct (matching `{{#if}}` and `{{/if}}`)
- Variable names match exactly (case-sensitive by default)

### Variables not being substituted

Ensure:
- Variables are wrapped in double curly braces: `{{variableName}}`
- Variable names don't contain spaces or special characters
- Data object keys match variable names

### Import failing

Verify:
- JSON is valid and properly formatted
- Template contains required fields (name, content)
- File is a valid template export

## Advanced Usage

### Custom Variable Types

```js
// Add custom variable handling
const customRender = (template, data) => {
  // Pre-process data
  const processedData = {
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
    schoolYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  };

  return renderTemplate(template, processedData);
};
```

### Template Versioning

Templates include a version field for compatibility:

```js
const template = new Template({
  name: 'My Template',
  content: 'Content here',
  version: '1.0.0'
});
```

### Statistics

```js
const stats = templateEngine.getStats();
console.log(stats);
// {
//   total: 52,
//   favorites: 5,
//   recent: 10,
//   byCategory: { reading: 10, math: 10, ... },
//   public: 50,
//   custom: 2
// }
```

## Support

For issues, questions, or feature requests, please contact the SUMRY development team.

## License

Copyright (c) 2024 SUMRY. All rights reserved.
