import OpenAI from 'openai';
import { query } from '../config/database.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate IEP goal using OpenAI GPT-4
 * This is the cornerstone AI feature of SUMRY
 */
export async function generateIEPGoal(params) {
  const {
    studentName,
    gradeLevel,
    disability,
    goalArea,
    currentLevel,
    additionalContext,
    userId,
    studentId
  } = params;

  // Construct detailed prompt for GPT-4
  const prompt = `You are an expert special education teacher creating an IEP (Individualized Education Program) goal.

Student Information:
- Name: ${studentName}
- Grade Level: ${gradeLevel}
- Disability: ${disability}
- Goal Area: ${goalArea}
- Current Performance Level: ${currentLevel}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

Create a comprehensive, measurable IEP goal that follows best practices:

1. SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
2. Includes clear baseline data
3. Includes specific target with measurable criteria
4. Uses appropriate metric units
5. Is research-based and developmentally appropriate
6. Aligns with grade-level standards where applicable

Please provide the goal in the following JSON format:
{
  "goal_description": "Complete measurable goal statement",
  "baseline_value": numeric value,
  "baseline_description": "Description of current performance",
  "target_value": numeric value,
  "target_description": "Description of expected performance",
  "metric_unit": "appropriate unit of measurement",
  "suggested_accommodations": ["accommodation 1", "accommodation 2"],
  "progress_monitoring_strategy": "How to track progress",
  "recommended_frequency": "How often to collect data",
  "research_basis": "Brief explanation of research supporting this goal"
}

Generate a high-quality, professional IEP goal:`;

  try {
    console.log('🤖 Generating AI goal with OpenAI...');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert special education professional with 20+ years of experience writing IEP goals. You are knowledgeable about IDEA regulations, evidence-based practices, and developmentally appropriate expectations. You always create goals that are measurable, achievable, and aligned with best practices.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0].message.content;
    const goalData = JSON.parse(responseContent);

    // Log AI usage for tracking
    await query(
      `INSERT INTO ai_suggestions (user_id, student_id, suggestion_type, prompt, response, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        studentId,
        'iep_goal',
        prompt,
        responseContent,
        completion.usage.total_tokens
      ]
    );

    console.log('✅ AI goal generated successfully');
    console.log(`📊 Tokens used: ${completion.usage.total_tokens}`);

    return {
      success: true,
      goal: goalData,
      tokensUsed: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('❌ OpenAI API error:', error);

    // Return fallback for development/testing
    if (error.code === 'invalid_api_key' || !process.env.OPENAI_API_KEY) {
      console.warn('⚠️  No valid OpenAI API key - using fallback template');
      return generateFallbackGoal(params);
    }

    throw new Error(`AI goal generation failed: ${error.message}`);
  }
}

/**
 * Generate progress predictions using AI
 */
export async function generateProgressPrediction(params) {
  const {
    goalDescription,
    baselineValue,
    targetValue,
    progressData, // Array of {date, score} objects
    userId,
    studentId
  } = params;

  const prompt = `Analyze this IEP goal progress data and provide insights:

Goal: ${goalDescription}
Baseline: ${baselineValue}
Target: ${targetValue}

Progress Data (chronological):
${progressData.map(d => `- ${d.date}: ${d.score}`).join('\n')}

Provide analysis in JSON format:
{
  "trend_analysis": "Description of the trend",
  "predicted_achievement_date": "YYYY-MM-DD or null if unlikely",
  "confidence_level": "high/medium/low",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "areas_of_concern": ["concern 1", "concern 2"],
  "strengths": ["strength 1", "strength 2"],
  "suggested_interventions": ["intervention 1", "intervention 2"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst specializing in special education progress monitoring. You analyze student progress data and provide actionable insights for educators.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0].message.content;
    const analysis = JSON.parse(responseContent);

    // Log AI usage
    await query(
      `INSERT INTO ai_suggestions (user_id, student_id, suggestion_type, prompt, response, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        studentId,
        'progress_prediction',
        prompt,
        responseContent,
        completion.usage.total_tokens
      ]
    );

    return {
      success: true,
      analysis,
      tokensUsed: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    throw new Error(`Progress prediction failed: ${error.message}`);
  }
}

/**
 * Generate accommodation suggestions using AI
 */
export async function generateAccommodationSuggestions(params) {
  const {
    studentName,
    disability,
    goalArea,
    currentChallenges,
    userId,
    studentId
  } = params;

  const prompt = `Suggest appropriate accommodations for this student:

Student: ${studentName}
Disability: ${disability}
Goal Area: ${goalArea}
Current Challenges: ${currentChallenges}

Provide accommodation suggestions in JSON format:
{
  "accommodations": [
    {
      "name": "Accommodation name",
      "description": "How to implement",
      "category": "Presentation/Response/Setting/Timing/Scheduling",
      "research_basis": "Why this works",
      "implementation_tips": ["tip 1", "tip 2"]
    }
  ],
  "priority_recommendations": ["Most important accommodations"]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in special education accommodations and assistive technology. You recommend evidence-based accommodations that support student success.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0].message.content;
    const suggestions = JSON.parse(responseContent);

    // Log AI usage
    await query(
      `INSERT INTO ai_suggestions (user_id, student_id, suggestion_type, prompt, response, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        studentId,
        'accommodations',
        prompt,
        responseContent,
        completion.usage.total_tokens
      ]
    );

    return {
      success: true,
      suggestions,
      tokensUsed: completion.usage.total_tokens
    };

  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    throw new Error(`Accommodation suggestions failed: ${error.message}`);
  }
}

/**
 * Fallback goal generator when OpenAI is not available
 */
function generateFallbackGoal(params) {
  const { goalArea, currentLevel } = params;

  const templates = {
    Reading: {
      goal_description: `Given grade-level text, student will read with 95% accuracy at ${Math.max(parseInt(currentLevel) + 20, 80)} words per minute.`,
      baseline_value: parseInt(currentLevel) || 60,
      baseline_description: `Currently reads at ${currentLevel} words per minute with 85% accuracy`,
      target_value: Math.max(parseInt(currentLevel) + 20, 80),
      target_description: 'Read fluently at grade level with comprehension',
      metric_unit: 'words per minute',
      suggested_accommodations: ['Extended time', 'Audio support', 'Highlighted text'],
      progress_monitoring_strategy: 'Weekly 1-minute timed readings',
      recommended_frequency: 'Weekly',
      research_basis: 'Evidence-based fluency practices (NRP, 2000)'
    },
    Math: {
      goal_description: 'Given grade-level math problems, student will solve with 80% accuracy across 4 consecutive assessments.',
      baseline_value: 50,
      baseline_description: 'Currently solves math problems with 50% accuracy',
      target_value: 80,
      target_description: 'Solve grade-level math problems accurately',
      metric_unit: 'percent correct',
      suggested_accommodations: ['Calculator', 'Graph paper', 'Extended time'],
      progress_monitoring_strategy: 'Bi-weekly math probes',
      recommended_frequency: 'Twice weekly',
      research_basis: 'RTI math intervention research (Fuchs et al.)'
    }
  };

  const fallback = templates[goalArea] || templates.Reading;

  return {
    success: true,
    goal: fallback,
    tokensUsed: 0,
    isFallback: true
  };
}

export default {
  generateIEPGoal,
  generateProgressPrediction,
  generateAccommodationSuggestions
};
