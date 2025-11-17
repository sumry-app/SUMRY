/**
 * Pre-built IEP Goal Templates
 *
 * Comprehensive collection of 50+ ready-to-use templates for various IEP goal categories
 */

import { TEMPLATE_CATEGORIES, createTemplate } from './templateEngine';

export const PREBUILT_TEMPLATES = [
  // ============================================================================
  // READING TEMPLATES (10+)
  // ============================================================================
  {
    name: 'Reading Fluency - Words Per Minute',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Standard reading fluency goal measured in words per minute',
    tags: ['fluency', 'reading', 'wpm', 'benchmark'],
    content: `Given a grade-level passage, {{studentName}} will read aloud with fluency and accuracy, achieving {{target}} words per minute (WPM) with 95% accuracy, as measured by curriculum-based measurements, in 4 out of 5 trials by {{endDate}}.

Current Performance: {{baseline}} WPM
Target: {{target}} WPM
Measurement: Reading fluency probe`,
    variables: ['studentName', 'target', 'endDate', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Reading Comprehension - Main Idea',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Goal for identifying main idea and supporting details',
    tags: ['comprehension', 'reading', 'main idea', 'details'],
    content: `When reading a grade-level passage, {{studentName}} will identify the main idea and {{detailsCount}} supporting details with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} trials, as measured by comprehension assessments by {{endDate}}.

{{#if useGraphicOrganizer}}
Support: Graphic organizer provided for organizing thoughts
{{/if}}`,
    variables: ['studentName', 'detailsCount', 'accuracy', 'trials', 'totalTrials', 'endDate', 'useGraphicOrganizer'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Reading Comprehension - Inferencing',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Making inferences from text',
    tags: ['comprehension', 'reading', 'inferencing', 'critical thinking'],
    content: `After reading a grade-level text, {{studentName}} will make logical inferences about characters, events, or outcomes using text evidence, with {{accuracy}}% accuracy in 4 out of 5 opportunities by {{endDate}}.

Baseline: {{baseline}}% accuracy
Strategy: {{strategy}}`,
    variables: ['studentName', 'accuracy', 'endDate', 'baseline', 'strategy'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Phonics - Letter Sound Correspondence',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Letter-sound relationship mastery',
    tags: ['phonics', 'reading', 'decoding', 'foundational'],
    content: `{{studentName}} will correctly identify and produce the sounds of {{letterCount}} letters (including consonants, vowels, and digraphs) with {{accuracy}}% accuracy across 3 consecutive sessions by {{endDate}}.

Current Mastery: {{baseline}} letters
Target: {{letterCount}} letters
Assessment: Letter sound fluency check`,
    variables: ['studentName', 'letterCount', 'accuracy', 'endDate', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Phonemic Awareness - Blending',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Sound blending skills',
    tags: ['phonemic awareness', 'reading', 'blending', 'foundational'],
    content: `Given {{wordType}} words presented orally in segmented phonemes, {{studentName}} will blend the sounds to form complete words with {{accuracy}}% accuracy in 4 out of 5 trials by {{endDate}}.

Word Types: {{wordType}}
Current Level: {{baseline}}% accuracy`,
    variables: ['studentName', 'wordType', 'accuracy', 'endDate', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Vocabulary Development',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Academic vocabulary acquisition',
    tags: ['vocabulary', 'reading', 'academic language'],
    content: `{{studentName}} will demonstrate understanding of {{vocabularyCount}} grade-level academic vocabulary words by correctly using them in written and oral contexts with {{accuracy}}% accuracy, as measured by curriculum assessments, by {{endDate}}.

Focus Areas: {{focusAreas}}
Assessment Method: {{assessmentMethod}}`,
    variables: ['studentName', 'vocabularyCount', 'accuracy', 'endDate', 'focusAreas', 'assessmentMethod'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Reading Comprehension - Question Answering',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Answering comprehension questions',
    tags: ['comprehension', 'reading', 'questions', 'analysis'],
    content: `After reading grade-level text, {{studentName}} will answer literal, inferential, and evaluative comprehension questions with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Question Types:
- Literal (who, what, when, where)
- Inferential (why, how)
- Evaluative (author's purpose, point of view)

{{#if provideCues}}
Accommodations: Visual cues and sentence starters provided
{{/if}}`,
    variables: ['studentName', 'accuracy', 'trials', 'totalTrials', 'endDate', 'provideCues'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Reading - Sight Words',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'High-frequency sight word recognition',
    tags: ['sight words', 'reading', 'fluency', 'recognition'],
    content: `{{studentName}} will correctly read {{sightWordCount}} high-frequency sight words from the {{wordList}} list with automaticity (within 3 seconds) and {{accuracy}}% accuracy across 3 consecutive sessions by {{endDate}}.

Current Mastery: {{baseline}} words
Target: {{sightWordCount}} words
List: {{wordList}}`,
    variables: ['studentName', 'sightWordCount', 'wordList', 'accuracy', 'endDate', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Reading Comprehension - Story Elements',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Identifying narrative story elements',
    tags: ['comprehension', 'reading', 'story elements', 'narrative'],
    content: `When reading or listening to a narrative text, {{studentName}} will identify and describe key story elements (characters, setting, problem, solution, sequence of events) with {{accuracy}}% accuracy in 4 out of 5 opportunities by {{endDate}}.

Support Tools: {{supportTools}}
Assessment: Story map completion`,
    variables: ['studentName', 'accuracy', 'endDate', 'supportTools'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Reading - Multi-Syllabic Decoding',
    category: TEMPLATE_CATEGORIES.READING,
    description: 'Decoding complex words',
    tags: ['decoding', 'reading', 'phonics', 'advanced'],
    content: `{{studentName}} will decode multi-syllabic words using syllable division strategies with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} trials by {{endDate}}.

Strategies Taught: {{strategies}}
Current Performance: {{baseline}}% accuracy
Word Types: {{wordTypes}}`,
    variables: ['studentName', 'accuracy', 'trials', 'totalTrials', 'endDate', 'strategies', 'baseline', 'wordTypes'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // MATH TEMPLATES (10+)
  // ============================================================================
  {
    name: 'Math Computation - Basic Operations',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Basic arithmetic operations',
    tags: ['math', 'computation', 'operations', 'fluency'],
    content: `Given {{problemCount}} {{operation}} problems at the {{gradeLevel}} grade level, {{studentName}} will solve them with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} trials by {{endDate}}.

Current Performance: {{baseline}} out of {{problemCount}} correct
Target: {{target}} out of {{problemCount}} correct
Operation: {{operation}}
Time Limit: {{timeLimit}}`,
    variables: ['studentName', 'problemCount', 'operation', 'gradeLevel', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline', 'target', 'timeLimit'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Math Word Problems',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Solving mathematical word problems',
    tags: ['math', 'word problems', 'problem solving', 'application'],
    content: `When presented with grade-level math word problems involving {{skillArea}}, {{studentName}} will identify the correct operation, solve accurately, and show work with {{accuracy}}% accuracy in 4 out of 5 trials by {{endDate}}.

Problem Types: {{problemTypes}}
{{#if useVisualSupports}}
Supports: Visual models and manipulatives provided
{{/if}}
Strategy: {{strategy}}`,
    variables: ['studentName', 'skillArea', 'accuracy', 'endDate', 'problemTypes', 'useVisualSupports', 'strategy'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Number Sense - Place Value',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Understanding place value concepts',
    tags: ['math', 'number sense', 'place value', 'foundational'],
    content: `{{studentName}} will demonstrate understanding of place value by identifying, reading, writing, and comparing numbers up to {{numberRange}} with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Skills Include:
- Identifying place value positions
- Reading and writing numbers in standard and expanded form
- Comparing and ordering numbers

Current Level: {{baseline}}`,
    variables: ['studentName', 'numberRange', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Fractions - Basic Concepts',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Understanding and working with fractions',
    tags: ['math', 'fractions', 'rational numbers'],
    content: `{{studentName}} will demonstrate understanding of fractions by {{skill}} with {{accuracy}}% accuracy in 4 out of 5 trials by {{endDate}}.

Skills: {{skill}}
Visual Supports: {{visualSupports}}
Current Performance: {{baseline}}%`,
    variables: ['studentName', 'skill', 'accuracy', 'endDate', 'visualSupports', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Math Fact Fluency',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Automatic recall of math facts',
    tags: ['math', 'fluency', 'facts', 'automaticity'],
    content: `{{studentName}} will demonstrate fluency with {{operation}} facts ({{factRange}}) by correctly answering {{target}} problems in {{timeLimit}} minutes with {{accuracy}}% accuracy across 3 consecutive sessions by {{endDate}}.

Current Rate: {{baseline}} correct in {{timeLimit}} minutes
Target Rate: {{target}} correct in {{timeLimit}} minutes
Strategy Instruction: {{strategies}}`,
    variables: ['studentName', 'operation', 'factRange', 'target', 'timeLimit', 'accuracy', 'endDate', 'baseline', 'strategies'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Geometry - Shapes and Properties',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Understanding geometric shapes',
    tags: ['math', 'geometry', 'shapes', 'spatial reasoning'],
    content: `{{studentName}} will identify, describe, and classify {{shapeTypes}} based on their properties (sides, angles, vertices) with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Shape Categories: {{shapeTypes}}
Skills: Identification, classification, property analysis
Manipulatives: {{manipulatives}}`,
    variables: ['studentName', 'shapeTypes', 'accuracy', 'trials', 'totalTrials', 'endDate', 'manipulatives'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Measurement - Units and Conversion',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Measuring and converting units',
    tags: ['math', 'measurement', 'units', 'conversion'],
    content: `{{studentName}} will accurately measure objects using {{units}} and convert between units with {{accuracy}}% accuracy in 4 out of 5 trials by {{endDate}}.

Measurement Types: {{measurementTypes}}
Tools: {{tools}}
Conversion Skills: {{conversionSkills}}`,
    variables: ['studentName', 'units', 'accuracy', 'endDate', 'measurementTypes', 'tools', 'conversionSkills'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Data Analysis - Graphs and Charts',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Interpreting and creating data displays',
    tags: ['math', 'data', 'graphs', 'analysis'],
    content: `{{studentName}} will interpret and create {{graphTypes}} to analyze data, answer questions, and draw conclusions with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Graph Types: {{graphTypes}}
Skills: Reading data, creating displays, analyzing trends
Application: {{application}}`,
    variables: ['studentName', 'graphTypes', 'accuracy', 'trials', 'totalTrials', 'endDate', 'application'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Algebra - Patterns and Relationships',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Identifying and extending patterns',
    tags: ['math', 'algebra', 'patterns', 'reasoning'],
    content: `{{studentName}} will identify, describe, and extend {{patternTypes}} patterns and relationships with {{accuracy}}% accuracy in 4 out of 5 trials by {{endDate}}.

Pattern Types: {{patternTypes}}
Skills: Identification, extension, rule generation
Current Level: {{baseline}}`,
    variables: ['studentName', 'patternTypes', 'accuracy', 'endDate', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Multi-Step Problem Solving',
    category: TEMPLATE_CATEGORIES.MATH,
    description: 'Complex multi-step mathematical problems',
    tags: ['math', 'problem solving', 'multi-step', 'reasoning'],
    content: `When presented with multi-step math problems, {{studentName}} will use a systematic problem-solving approach to identify necessary operations, show all work, and arrive at correct solutions with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} trials by {{endDate}}.

Problem-Solving Steps:
1. Read and understand the problem
2. Identify known and unknown information
3. Determine necessary operations
4. Solve step-by-step
5. Check reasonableness of answer

{{#if useGraphicOrganizer}}
Support: Problem-solving graphic organizer provided
{{/if}}`,
    variables: ['studentName', 'accuracy', 'trials', 'totalTrials', 'endDate', 'useGraphicOrganizer'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // WRITING TEMPLATES (8+)
  // ============================================================================
  {
    name: 'Writing - Sentence Construction',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Writing complete, grammatically correct sentences',
    tags: ['writing', 'sentences', 'grammar', 'foundational'],
    content: `{{studentName}} will write {{sentenceCount}} complete sentences with correct capitalization, punctuation, and grammar with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Sentence Types: {{sentenceTypes}}
Current Performance: {{baseline}} correct sentences
Support: {{supports}}`,
    variables: ['studentName', 'sentenceCount', 'accuracy', 'trials', 'totalTrials', 'endDate', 'sentenceTypes', 'baseline', 'supports'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Writing - Paragraph Development',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Structured paragraph writing',
    tags: ['writing', 'paragraphs', 'organization', 'structure'],
    content: `{{studentName}} will write a well-organized paragraph containing a topic sentence, {{detailCount}} supporting details, and a concluding sentence with {{accuracy}}% accuracy in 4 out of 5 writing samples by {{endDate}}.

Paragraph Structure:
- Topic sentence
- {{detailCount}} supporting details with examples
- Concluding sentence

{{#if useOrganizer}}
Support: Paragraph organizer template provided
{{/if}}
Topics: {{topics}}`,
    variables: ['studentName', 'detailCount', 'accuracy', 'endDate', 'useOrganizer', 'topics'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Writing - Narrative Story',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Writing narrative stories with story elements',
    tags: ['writing', 'narrative', 'story', 'creative'],
    content: `{{studentName}} will write a narrative story of at least {{wordCount}} words that includes clear characters, setting, problem, and solution, with proper sequencing and {{accuracy}}% accuracy in grammar and conventions, as scored by a rubric, by {{endDate}}.

Story Elements Required:
- Characters with descriptions
- Clear setting
- Problem/conflict
- Series of events
- Resolution/solution

Scoring Rubric: {{rubric}}`,
    variables: ['studentName', 'wordCount', 'accuracy', 'endDate', 'rubric'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Writing - Opinion/Persuasive',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Writing persuasive arguments',
    tags: ['writing', 'opinion', 'persuasive', 'argument'],
    content: `{{studentName}} will write an opinion piece stating a clear position, providing {{reasonCount}} reasons supported by evidence, and including a conclusion, with {{accuracy}}% accuracy in organization and conventions in 4 out of 5 writing samples by {{endDate}}.

Structure:
- Clear opinion statement
- {{reasonCount}} supporting reasons
- Evidence and examples
- Concluding statement

{{#if includeCounterargument}}
Advanced: Address counterarguments
{{/if}}`,
    variables: ['studentName', 'reasonCount', 'accuracy', 'endDate', 'includeCounterargument'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Writing - Informative/Explanatory',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Writing to inform or explain',
    tags: ['writing', 'informative', 'explanatory', 'expository'],
    content: `{{studentName}} will write an informative/explanatory piece about {{topic}} that includes an introduction, {{paragraphCount}} body paragraphs with facts and details, and a conclusion, with {{accuracy}}% accuracy in organization and conventions by {{endDate}}.

Required Elements:
- Introduction with topic statement
- {{paragraphCount}} organized body paragraphs
- Facts, definitions, and details
- Transitions between ideas
- Concluding paragraph

Research Support: {{researchSupport}}`,
    variables: ['studentName', 'topic', 'paragraphCount', 'accuracy', 'endDate', 'researchSupport'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Writing - Grammar and Conventions',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Proper use of grammar and writing conventions',
    tags: ['writing', 'grammar', 'conventions', 'mechanics'],
    content: `{{studentName}} will demonstrate mastery of grade-level grammar and conventions including {{grammarSkills}} with {{accuracy}}% accuracy across writing samples by {{endDate}}.

Grammar Skills: {{grammarSkills}}
Current Performance: {{baseline}}% accuracy
Practice Focus: {{focusAreas}}`,
    variables: ['studentName', 'grammarSkills', 'accuracy', 'endDate', 'baseline', 'focusAreas'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Writing - Editing and Revision',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Editing and revising written work',
    tags: ['writing', 'editing', 'revision', 'metacognition'],
    content: `{{studentName}} will edit and revise writing by checking for {{editingFocus}} and making appropriate corrections with {{accuracy}}% accuracy in 4 out of 5 opportunities by {{endDate}}.

Editing Checklist:
{{editingFocus}}

Process:
- Self-edit using checklist
- Peer review (if applicable)
- Teacher conference
- Final revision

Tools: {{tools}}`,
    variables: ['studentName', 'editingFocus', 'accuracy', 'endDate', 'tools'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Writing - Research Skills',
    category: TEMPLATE_CATEGORIES.WRITING,
    description: 'Conducting research and citing sources',
    tags: ['writing', 'research', 'sources', 'citations'],
    content: `{{studentName}} will conduct short research using {{sourceCount}} sources, take notes, and write a {{pageCount}}-page report with proper citations and bibliography with {{accuracy}}% accuracy by {{endDate}}.

Research Process:
- Select appropriate sources
- Take organized notes
- Avoid plagiarism
- Cite sources correctly
- Create bibliography

Citation Style: {{citationStyle}}`,
    variables: ['studentName', 'sourceCount', 'pageCount', 'accuracy', 'endDate', 'citationStyle'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // BEHAVIOR TEMPLATES (8+)
  // ============================================================================
  {
    name: 'Behavior - On-Task Engagement',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Remaining on-task during instruction',
    tags: ['behavior', 'attention', 'engagement', 'focus'],
    content: `{{studentName}} will remain on-task and engaged during {{activity}} for {{duration}} minutes with no more than {{redirections}} redirections in {{trials}} out of {{totalTrials}} observations by {{endDate}}.

Current Performance: {{baseline}} minutes on-task
Target: {{duration}} minutes on-task
Supports: {{supports}}
Reinforcement: {{reinforcement}}`,
    variables: ['studentName', 'activity', 'duration', 'redirections', 'trials', 'totalTrials', 'endDate', 'baseline', 'supports', 'reinforcement'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Behavior - Following Directions',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Following multi-step directions',
    tags: ['behavior', 'compliance', 'directions', 'executive function'],
    content: `When given {{stepCount}}-step directions, {{studentName}} will follow them independently within {{timeframe}} with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

{{#if useVisualSupports}}
Supports: Visual schedule and direction cards
{{/if}}
Current Performance: {{baseline}}-step directions
Reinforcement System: {{reinforcement}}`,
    variables: ['studentName', 'stepCount', 'timeframe', 'accuracy', 'trials', 'totalTrials', 'endDate', 'useVisualSupports', 'baseline', 'reinforcement'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Behavior - Appropriate Social Interactions',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Positive peer interactions',
    tags: ['behavior', 'social', 'peers', 'interactions'],
    content: `{{studentName}} will engage in appropriate social interactions with peers during {{setting}} by {{behaviors}} with no more than {{incidents}} incidents per {{timeframe}} in {{trials}} out of {{totalTrials}} observations by {{endDate}}.

Target Behaviors: {{behaviors}}
Replacement Behaviors Taught: {{replacementBehaviors}}
Current Rate: {{baseline}} incidents per {{timeframe}}
Data Collection: {{dataCollection}}`,
    variables: ['studentName', 'setting', 'behaviors', 'incidents', 'timeframe', 'trials', 'totalTrials', 'endDate', 'replacementBehaviors', 'baseline', 'dataCollection'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Behavior - Self-Regulation',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Managing emotions and self-regulation',
    tags: ['behavior', 'self-regulation', 'coping', 'emotional'],
    content: `When experiencing frustration or difficulty, {{studentName}} will use taught self-regulation strategies ({{strategies}}) to calm down and return to task within {{duration}} minutes with {{accuracy}}% success rate in {{trials}} out of {{totalTrials}} occurrences by {{endDate}}.

Regulation Strategies: {{strategies}}
Current Performance: {{baseline}} minute recovery time
Supports: {{supports}}
Progress Monitoring: {{monitoring}}`,
    variables: ['studentName', 'strategies', 'duration', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline', 'supports', 'monitoring'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Behavior - Transition Management',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Smooth transitions between activities',
    tags: ['behavior', 'transitions', 'routine', 'flexibility'],
    content: `{{studentName}} will transition between activities independently within {{timeLimit}} minutes of the transition cue with {{accuracy}}% success rate and no more than {{incidents}} disruptive behaviors in {{trials}} out of {{totalTrials}} transitions by {{endDate}}.

Transition Types: {{transitionTypes}}
{{#if useVisualSchedule}}
Visual Supports: Visual schedule and transition warnings provided
{{/if}}
Current Performance: {{baseline}} minutes per transition`,
    variables: ['studentName', 'timeLimit', 'accuracy', 'incidents', 'trials', 'totalTrials', 'endDate', 'transitionTypes', 'useVisualSchedule', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Behavior - Work Completion',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Completing assigned work',
    tags: ['behavior', 'completion', 'persistence', 'work habits'],
    content: `{{studentName}} will complete {{percentage}}% of assigned classroom work within the allotted time with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Current Completion Rate: {{baseline}}%
Accommodations: {{accommodations}}
Reinforcement: {{reinforcement}}
Modifications: {{modifications}}`,
    variables: ['studentName', 'percentage', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline', 'accommodations', 'reinforcement', 'modifications'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Behavior - Respectful Communication',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Using respectful language and tone',
    tags: ['behavior', 'communication', 'respect', 'social'],
    content: `{{studentName}} will use respectful language and appropriate tone when communicating with adults and peers during {{setting}}, maintaining {{accuracy}}% compliance in {{trials}} out of {{totalTrials}} interactions by {{endDate}}.

Expected Behaviors:
- Appropriate volume and tone
- Respectful word choice
- Active listening
- Turn-taking in conversation

Current Performance: {{baseline}}% respectful interactions
Social Skills Instruction: {{instruction}}`,
    variables: ['studentName', 'setting', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline', 'instruction'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Behavior - Accepting Feedback',
    category: TEMPLATE_CATEGORIES.BEHAVIOR,
    description: 'Accepting corrective feedback appropriately',
    tags: ['behavior', 'feedback', 'resilience', 'growth mindset'],
    content: `When receiving corrective feedback from adults, {{studentName}} will respond appropriately ({{expectedBehaviors}}) without arguing or refusing within {{timeframe}} in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Expected Responses: {{expectedBehaviors}}
Current Performance: {{baseline}} appropriate responses per {{totalTrials}} opportunities
Replacement Behaviors: {{replacementBehaviors}}
Support Strategies: {{strategies}}`,
    variables: ['studentName', 'expectedBehaviors', 'timeframe', 'trials', 'totalTrials', 'endDate', 'baseline', 'replacementBehaviors', 'strategies'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // COMMUNICATION TEMPLATES (6+)
  // ============================================================================
  {
    name: 'Communication - Expressive Language',
    category: TEMPLATE_CATEGORIES.COMMUNICATION,
    description: 'Using complete sentences to express needs',
    tags: ['communication', 'expressive', 'language', 'speech'],
    content: `{{studentName}} will use complete sentences of {{wordCount}}+ words to express needs, wants, and ideas with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Sentence Structure: {{sentenceStructure}}
Current Performance: {{baseline}}-word utterances
AAC Support: {{aacSupport}}
Communication Partner: {{partner}}`,
    variables: ['studentName', 'wordCount', 'accuracy', 'trials', 'totalTrials', 'endDate', 'sentenceStructure', 'baseline', 'aacSupport', 'partner'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Communication - Receptive Language',
    category: TEMPLATE_CATEGORIES.COMMUNICATION,
    description: 'Understanding and following verbal directions',
    tags: ['communication', 'receptive', 'comprehension', 'language'],
    content: `{{studentName}} will demonstrate understanding of {{complexity}} verbal directions and questions by responding appropriately with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Language Complexity: {{complexity}}
{{#if useVisuals}}
Visual Supports: Picture cues and gestures provided
{{/if}}
Assessment Method: {{assessment}}`,
    variables: ['studentName', 'complexity', 'accuracy', 'trials', 'totalTrials', 'endDate', 'useVisuals', 'assessment'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Communication - Articulation',
    category: TEMPLATE_CATEGORIES.COMMUNICATION,
    description: 'Correct pronunciation of target sounds',
    tags: ['communication', 'articulation', 'speech', 'phonology'],
    content: `{{studentName}} will correctly produce the {{targetSounds}} sound(s) in {{position}} position of words at the {{level}} level with {{accuracy}}% accuracy across 3 consecutive sessions by {{endDate}}.

Target Sounds: {{targetSounds}}
Word Position: {{position}}
Current Level: {{currentLevel}}
Target Level: {{level}}
Stimulability: {{stimulability}}`,
    variables: ['studentName', 'targetSounds', 'position', 'level', 'accuracy', 'endDate', 'currentLevel', 'stimulability'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Communication - Requesting Help',
    category: TEMPLATE_CATEGORIES.COMMUNICATION,
    description: 'Appropriately requesting assistance',
    tags: ['communication', 'requesting', 'functional', 'self-advocacy'],
    content: `{{studentName}} will appropriately request help using {{method}} when needed during {{setting}} with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Communication Method: {{method}}
{{#if useAAC}}
AAC Device/System: {{aacSystem}}
{{/if}}
Current Performance: {{baseline}} appropriate requests
Teaching Strategy: {{strategy}}`,
    variables: ['studentName', 'method', 'setting', 'accuracy', 'trials', 'totalTrials', 'endDate', 'useAAC', 'aacSystem', 'baseline', 'strategy'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Communication - Turn-Taking in Conversation',
    category: TEMPLATE_CATEGORIES.COMMUNICATION,
    description: 'Engaging in reciprocal conversation',
    tags: ['communication', 'conversation', 'pragmatics', 'social'],
    content: `{{studentName}} will engage in reciprocal conversation by taking {{turnCount}} turns, staying on topic, and asking relevant questions with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} conversations by {{endDate}}.

Conversation Skills:
- Initiating conversation
- Taking turns
- Staying on topic
- Asking follow-up questions
- Appropriate eye contact/body language

Current Performance: {{baseline}} turns per conversation
Support: {{support}}`,
    variables: ['studentName', 'turnCount', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline', 'support'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Communication - AAC Device Usage',
    category: TEMPLATE_CATEGORIES.COMMUNICATION,
    description: 'Using augmentative communication device',
    tags: ['communication', 'AAC', 'assistive technology', 'device'],
    content: `{{studentName}} will use {{aacDevice}} to communicate {{messageTypes}} with {{accuracy}}% accuracy and {{independence}}% independence in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

AAC Device: {{aacDevice}}
Message Types: {{messageTypes}}
Vocabulary Size: {{vocabularySize}}
Current Performance: {{baseline}}% accuracy, {{currentIndependence}}% independence
Training Focus: {{trainingFocus}}`,
    variables: ['studentName', 'aacDevice', 'messageTypes', 'accuracy', 'independence', 'trials', 'totalTrials', 'endDate', 'vocabularySize', 'baseline', 'currentIndependence', 'trainingFocus'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // SOCIAL SKILLS TEMPLATES (5+)
  // ============================================================================
  {
    name: 'Social Skills - Greeting Others',
    category: TEMPLATE_CATEGORIES.SOCIAL_SKILLS,
    description: 'Appropriately greeting peers and adults',
    tags: ['social', 'greetings', 'interactions', 'manners'],
    content: `{{studentName}} will appropriately greet peers and adults using {{greetingMethods}} with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Greeting Methods: {{greetingMethods}}
Settings: {{settings}}
Current Performance: {{baseline}}% appropriate greetings
Social Skills Instruction: {{instruction}}`,
    variables: ['studentName', 'greetingMethods', 'accuracy', 'trials', 'totalTrials', 'endDate', 'settings', 'baseline', 'instruction'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Social Skills - Sharing and Turn-Taking',
    category: TEMPLATE_CATEGORIES.SOCIAL_SKILLS,
    description: 'Sharing materials and taking turns',
    tags: ['social', 'sharing', 'cooperation', 'play'],
    content: `During {{activity}}, {{studentName}} will share materials and take turns with peers appropriately with no more than {{prompts}} prompts in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Activities: {{activity}}
Expected Behaviors:
- Wait for turn
- Share materials willingly
- Use polite requests
- Accept "no" appropriately

Current Performance: {{baseline}} prompts needed
Reinforcement: {{reinforcement}}`,
    variables: ['studentName', 'activity', 'prompts', 'trials', 'totalTrials', 'endDate', 'baseline', 'reinforcement'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Social Skills - Reading Social Cues',
    category: TEMPLATE_CATEGORIES.SOCIAL_SKILLS,
    description: 'Interpreting nonverbal communication',
    tags: ['social', 'nonverbal', 'cues', 'awareness'],
    content: `{{studentName}} will identify and respond appropriately to {{cueTypes}} social cues (facial expressions, body language, tone of voice) with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Social Cues: {{cueTypes}}
Teaching Method: {{teachingMethod}}
Practice Activities: {{activities}}
Current Performance: {{baseline}}% accurate interpretation`,
    variables: ['studentName', 'cueTypes', 'accuracy', 'trials', 'totalTrials', 'endDate', 'teachingMethod', 'activities', 'baseline'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Social Skills - Joining Group Activities',
    category: TEMPLATE_CATEGORIES.SOCIAL_SKILLS,
    description: 'Appropriately joining ongoing activities',
    tags: ['social', 'joining', 'groups', 'initiation'],
    content: `{{studentName}} will appropriately join ongoing group activities or conversations by {{strategies}} with {{accuracy}}% success rate in {{trials}} out of {{totalTrials}} attempts by {{endDate}}.

Joining Strategies: {{strategies}}
- Wait for appropriate moment
- Make eye contact
- Ask to join
- Follow group rules/norms

Settings: {{settings}}
Current Success Rate: {{baseline}}%
Social Coaching: {{coaching}}`,
    variables: ['studentName', 'strategies', 'accuracy', 'trials', 'totalTrials', 'endDate', 'settings', 'baseline', 'coaching'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Social Skills - Conflict Resolution',
    category: TEMPLATE_CATEGORIES.SOCIAL_SKILLS,
    description: 'Resolving conflicts peacefully',
    tags: ['social', 'conflict', 'problem solving', 'peace'],
    content: `When experiencing a conflict with peers, {{studentName}} will use taught conflict resolution strategies ({{strategies}}) to resolve the situation peacefully without adult intervention in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Resolution Strategies: {{strategies}}
- Calm down first
- Express feelings using "I" statements
- Listen to others' perspective
- Propose solutions
- Compromise

Current Performance: {{baseline}} independent resolutions
Support Level: {{supportLevel}}`,
    variables: ['studentName', 'strategies', 'trials', 'totalTrials', 'endDate', 'baseline', 'supportLevel'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // MOTOR SKILLS TEMPLATES (4+)
  // ============================================================================
  {
    name: 'Fine Motor - Handwriting',
    category: TEMPLATE_CATEGORIES.MOTOR_SKILLS,
    description: 'Legible handwriting skills',
    tags: ['motor', 'fine motor', 'handwriting', 'writing'],
    content: `{{studentName}} will write {{letterTypes}} legibly with proper letter formation, size, and spacing with {{accuracy}}% accuracy in {{trials}} out of {{totalTrials}} writing samples by {{endDate}}.

Letter Types: {{letterTypes}}
Focus Areas: {{focusAreas}}
Current Performance: {{baseline}}% legible
Adaptations: {{adaptations}}
OT Support: {{otSupport}}`,
    variables: ['studentName', 'letterTypes', 'accuracy', 'trials', 'totalTrials', 'endDate', 'focusAreas', 'baseline', 'adaptations', 'otSupport'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Fine Motor - Scissor Skills',
    category: TEMPLATE_CATEGORIES.MOTOR_SKILLS,
    description: 'Using scissors to cut accurately',
    tags: ['motor', 'fine motor', 'scissors', 'cutting'],
    content: `{{studentName}} will cut along {{lineTypes}} with {{accuracy}}% accuracy staying within {{tolerance}} of the line in {{trials}} out of {{totalTrials}} attempts by {{endDate}}.

Line Types: {{lineTypes}}
Current Performance: {{baseline}}
Scissor Type: {{scissorType}}
Hand Dominance: {{handDominance}}
Grip: {{grip}}`,
    variables: ['studentName', 'lineTypes', 'accuracy', 'tolerance', 'trials', 'totalTrials', 'endDate', 'baseline', 'scissorType', 'handDominance', 'grip'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Gross Motor - Coordination and Balance',
    category: TEMPLATE_CATEGORIES.MOTOR_SKILLS,
    description: 'Improving coordination and balance',
    tags: ['motor', 'gross motor', 'coordination', 'balance'],
    content: `{{studentName}} will demonstrate improved gross motor coordination by successfully completing {{activities}} with {{accuracy}}% success rate in {{trials}} out of {{totalTrials}} attempts by {{endDate}}.

Activities: {{activities}}
Current Performance: {{baseline}}% success
Safety Considerations: {{safety}}
Equipment: {{equipment}}
PT Support: {{ptSupport}}`,
    variables: ['studentName', 'activities', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline', 'safety', 'equipment', 'ptSupport'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Fine Motor - Manipulating Objects',
    category: TEMPLATE_CATEGORIES.MOTOR_SKILLS,
    description: 'Manipulating small objects',
    tags: ['motor', 'fine motor', 'manipulation', 'dexterity'],
    content: `{{studentName}} will manipulate small objects ({{objects}}) to complete tasks such as {{tasks}} with {{accuracy}}% success in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Objects/Tasks: {{objects}}, {{tasks}}
Skills Targeted: {{skills}}
Current Performance: {{baseline}}%
Accommodations: {{accommodations}}`,
    variables: ['studentName', 'objects', 'tasks', 'accuracy', 'trials', 'totalTrials', 'endDate', 'skills', 'baseline', 'accommodations'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // TRANSITION TEMPLATES (3+)
  // ============================================================================
  {
    name: 'Transition - Post-Secondary Planning',
    category: TEMPLATE_CATEGORIES.TRANSITION,
    description: 'Planning for life after high school',
    tags: ['transition', 'post-secondary', 'career', 'independent living'],
    content: `{{studentName}} will develop and implement a post-secondary transition plan by completing {{activities}} with {{accuracy}}% completion rate by {{endDate}}.

Transition Activities:
{{activities}}

Areas Addressed:
- Education/training goals
- Employment goals
- Independent living skills
- Community participation

Current Progress: {{baseline}}
Supports: {{supports}}
Agency Involvement: {{agencies}}`,
    variables: ['studentName', 'activities', 'accuracy', 'endDate', 'baseline', 'supports', 'agencies'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Transition - Independent Living Skills',
    category: TEMPLATE_CATEGORIES.TRANSITION,
    description: 'Daily living and self-care skills',
    tags: ['transition', 'independent living', 'daily living', 'self-care'],
    content: `{{studentName}} will demonstrate {{skillCount}} independent living skills ({{skills}}) with {{accuracy}}% independence in {{trials}} out of {{totalTrials}} opportunities by {{endDate}}.

Target Skills: {{skills}}
Current Independence Level: {{baseline}}%
Instruction Setting: {{setting}}
Community-Based Instruction: {{cbi}}`,
    variables: ['studentName', 'skillCount', 'skills', 'accuracy', 'trials', 'totalTrials', 'endDate', 'baseline', 'setting', 'cbi'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Transition - Vocational Skills',
    category: TEMPLATE_CATEGORIES.TRANSITION,
    description: 'Work readiness and job skills',
    tags: ['transition', 'vocational', 'employment', 'career'],
    content: `{{studentName}} will demonstrate {{skillCount}} vocational skills necessary for {{jobType}} employment including {{skills}} with {{accuracy}}% proficiency by {{endDate}}.

Vocational Skills: {{skills}}
Job Interest Area: {{jobType}}
Work Experience: {{workExperience}}
Current Proficiency: {{baseline}}%
Job Coach Support: {{jobCoach}}`,
    variables: ['studentName', 'skillCount', 'jobType', 'skills', 'accuracy', 'endDate', 'workExperience', 'baseline', 'jobCoach'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // PROGRESS MONITORING TEMPLATES (2+)
  // ============================================================================
  {
    name: 'Progress Monitoring - Data Collection Template',
    category: TEMPLATE_CATEGORIES.PROGRESS_MONITORING,
    description: 'Standard progress monitoring form',
    tags: ['progress', 'monitoring', 'data', 'tracking'],
    content: `Progress Monitoring Report for {{studentName}}
Goal Area: {{goalArea}}
Monitoring Period: {{startDate}} to {{endDate}}

Baseline Data: {{baseline}}
Current Performance: {{currentPerformance}}
Target Goal: {{target}}

Progress Summary:
{{#if targetMet}}
✓ Target goal has been met or exceeded
{{else}}
Current progress: {{progressPercentage}}% toward goal
{{/if}}

Data Collection Method: {{method}}
Frequency: {{frequency}}
Next Review Date: {{nextReview}}

Recommendations:
{{recommendations}}

Provider: {{provider}}
Date: {{currentDate}}`,
    variables: ['studentName', 'goalArea', 'startDate', 'endDate', 'baseline', 'currentPerformance', 'target', 'targetMet', 'progressPercentage', 'method', 'frequency', 'nextReview', 'recommendations', 'provider', 'currentDate'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Progress Monitoring - Quarterly Report',
    category: TEMPLATE_CATEGORIES.PROGRESS_MONITORING,
    description: 'Quarterly progress report for IEP goals',
    tags: ['progress', 'quarterly', 'report', 'IEP'],
    content: `Quarterly Progress Report
Student: {{studentName}}
Quarter: {{quarter}}
School Year: {{schoolYear}}

IEP Goal: {{goalStatement}}

Progress Rating: {{progressRating}}
[ ] Mastered (100% of goal achieved)
[ ] Adequate Progress (on track to meet annual goal)
[ ] Some Progress (making progress but may not meet annual goal)
[ ] Minimal Progress (little to no progress)
[ ] Regression (skills have decreased)

Data Summary:
- Baseline: {{baseline}}
- Current Level: {{currentLevel}}
- Target: {{target}}
- Progress: {{progressPercentage}}%

Narrative:
{{narrative}}

Instructional Modifications/Supports:
{{modifications}}

Recommendations:
{{recommendations}}

Next Steps:
{{nextSteps}}

Reported by: {{teacherName}}
Date: {{reportDate}}`,
    variables: ['studentName', 'quarter', 'schoolYear', 'goalStatement', 'progressRating', 'baseline', 'currentLevel', 'target', 'progressPercentage', 'narrative', 'modifications', 'recommendations', 'nextSteps', 'teacherName', 'reportDate'],
    isPublic: true,
    author: 'SUMRY',
  },

  // ============================================================================
  // MEETING NOTES TEMPLATES (2+)
  // ============================================================================
  {
    name: 'IEP Meeting Notes',
    category: TEMPLATE_CATEGORIES.MEETING_NOTES,
    description: 'Comprehensive IEP meeting notes',
    tags: ['meeting', 'IEP', 'notes', 'documentation'],
    content: `IEP Team Meeting Notes
Student: {{studentName}} (ID: {{studentId}})
Date: {{meetingDate}}
Meeting Type: {{meetingType}}
Duration: {{duration}}

Attendees:
{{attendees}}

Purpose of Meeting:
{{purpose}}

Discussion Points:
{{discussionPoints}}

Decisions Made:
{{decisions}}

Action Items:
{{actionItems}}

Parent Concerns/Input:
{{parentInput}}

Next Meeting Date: {{nextMeetingDate}}

Notes Prepared by: {{preparedBy}}`,
    variables: ['studentName', 'studentId', 'meetingDate', 'meetingType', 'duration', 'attendees', 'purpose', 'discussionPoints', 'decisions', 'actionItems', 'parentInput', 'nextMeetingDate', 'preparedBy'],
    isPublic: true,
    author: 'SUMRY',
  },
  {
    name: 'Parent-Teacher Conference Notes',
    category: TEMPLATE_CATEGORIES.MEETING_NOTES,
    description: 'Parent-teacher conference documentation',
    tags: ['meeting', 'parent', 'conference', 'communication'],
    content: `Parent-Teacher Conference
Student: {{studentName}}
Date: {{meetingDate}}
Participants: {{participants}}

Academic Progress:
{{academicProgress}}

Behavioral/Social Progress:
{{behavioralProgress}}

Strengths:
{{strengths}}

Areas of Concern:
{{concerns}}

Parent Questions/Concerns:
{{parentConcerns}}

Teacher Recommendations:
{{recommendations}}

Home Support Strategies:
{{homeStrategies}}

Follow-Up Actions:
{{followUp}}

Next Contact: {{nextContact}}

Teacher: {{teacherName}}`,
    variables: ['studentName', 'meetingDate', 'participants', 'academicProgress', 'behavioralProgress', 'strengths', 'concerns', 'parentConcerns', 'recommendations', 'homeStrategies', 'followUp', 'nextContact', 'teacherName'],
    isPublic: true,
    author: 'SUMRY',
  },
];

/**
 * Initialize pre-built templates in the template engine
 */
export function loadPrebuiltTemplates(engine) {
  const loadedTemplates = [];

  for (const templateData of PREBUILT_TEMPLATES) {
    try {
      const template = createTemplate({
        ...templateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      engine.addTemplate(template);
      loadedTemplates.push(template);
    } catch (error) {
      console.error(`Failed to load template "${templateData.name}":`, error);
    }
  }

  return loadedTemplates;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category) {
  return PREBUILT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Search templates
 */
export function searchTemplates(query) {
  const lowerQuery = query.toLowerCase();
  return PREBUILT_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export default PREBUILT_TEMPLATES;
