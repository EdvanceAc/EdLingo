import geminiService from './geminiService.js';
import aiService from './aiService.js';
import supabaseService from './supabaseService.js';

/**
 * Assessment Service
 * Handles AI-driven language proficiency assessment
 * Implements CEFR standards and IELTS-comparable scoring
 */
class AssessmentService {
  constructor() {
    this.isInitialized = false;
    this.currentSession = null;
    this.assessmentTasks = [];
    this.conversationHistory = [];
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Ensure AI services are ready
      await aiService.initialize();
      this.isInitialized = true;
      console.log('Assessment service initialized');
    } catch (error) {
      console.error('Failed to initialize assessment service:', error);
      throw error;
    }
  }

  /**
   * Start a new assessment session
   */
  async startAssessment(userId, targetLanguage = 'English', sessionType = 'initial') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Create new assessment session in database
      const sessionData = {
        user_id: userId,
        session_type: sessionType,
        target_language: targetLanguage,
        status: 'in_progress',
        started_at: new Date().toISOString()
      };

      const { data: session, error } = await supabaseService.client
        .from('assessment_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      this.currentSession = session;
      this.assessmentTasks = [];
      this.conversationHistory = [];

      // Generate assessment tasks
      await this.generateAssessmentTasks(session.id, targetLanguage);

      return {
        success: true,
        sessionId: session.id,
        tasks: this.assessmentTasks
      };
    } catch (error) {
      console.error('Failed to start assessment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate assessment tasks based on CEFR standards
   */
  async generateAssessmentTasks(sessionId, targetLanguage) {
    const tasks = [
      {
        task_type: 'conversation',
        task_order: 1,
        prompt: 'Let\'s start with a simple conversation. Please introduce yourself and tell me about your hobbies or interests. Speak naturally for about 2-3 minutes.',
        expected_duration_minutes: 3,
        max_score: 100
      },
      {
        task_type: 'writing',
        task_order: 2,
        prompt: 'Write a paragraph (100-150 words) describing your typical day. Include what you do in the morning, afternoon, and evening.',
        expected_duration_minutes: 5,
        max_score: 100
      },
      {
        task_type: 'grammar',
        task_order: 3,
        prompt: 'Complete this conversation naturally: "I was wondering if you could help me with something. Yesterday, I _____ to the store, but it _____ closed. If I _____ earlier, I _____ been able to buy what I needed."',
        expected_duration_minutes: 2,
        max_score: 100
      },
      {
        task_type: 'vocabulary',
        task_order: 4,
        prompt: 'Explain the difference between these word pairs and use each in a sentence: 1) "affect" vs "effect", 2) "advice" vs "advise", 3) "complement" vs "compliment"',
        expected_duration_minutes: 4,
        max_score: 100
      },
      {
        task_type: 'pronunciation',
        task_order: 5,
        prompt: 'Please read this passage aloud, focusing on clear pronunciation: "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore. How much wood would a woodchuck chuck if a woodchuck could chuck wood?"',
        expected_duration_minutes: 2,
        max_score: 100
      }
    ];

    // Insert tasks into database
    const tasksWithSessionId = tasks.map(task => ({
      ...task,
      session_id: sessionId
    }));

    const { data, error } = await supabaseService.client
      .from('assessment_tasks')
      .insert(tasksWithSessionId)
      .select();

    if (error) throw error;

    this.assessmentTasks = data;
    return data;
  }

  /**
   * Submit response for a specific task
   */
  async submitTaskResponse(taskId, response, audioUrl = null) {
    try {
      const task = this.assessmentTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Analyze the response using AI
      const analysis = await this.analyzeResponse(task, response, audioUrl);

      // Update task in database
      const { data, error } = await supabaseService.client
        .from('assessment_tasks')
        .update({
          user_response: response,
          audio_response_url: audioUrl,
          score: analysis.score,
          ai_feedback: analysis.feedback,
          skill_scores: analysis.skillScores,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Update local task
      const taskIndex = this.assessmentTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        this.assessmentTasks[taskIndex] = data;
      }

      return {
        success: true,
        score: analysis.score,
        feedback: analysis.feedback,
        skillScores: analysis.skillScores
      };
    } catch (error) {
      console.error('Failed to submit task response:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze user response using AI
   */
  async analyzeResponse(task, response, audioUrl = null) {
    const analysisPrompt = this.buildAnalysisPrompt(task, response);
    
    try {
      let aiResponse;
      
      // Use Gemini if available, fallback to other AI service
      if (geminiService.isReady()) {
        aiResponse = await geminiService.generateResponse(analysisPrompt);
      } else {
        aiResponse = await aiService.generateResponse(analysisPrompt);
      }

      // Parse AI response to extract structured data
      const analysis = this.parseAIAnalysis(aiResponse, task.task_type);
      
      return analysis;
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Return fallback analysis
      return this.getFallbackAnalysis(task, response);
    }
  }

  /**
   * Build analysis prompt for AI
   */
  buildAnalysisPrompt(task, response) {
    const basePrompt = `
You are an expert language assessment specialist. Analyze the following ${task.task_type} response according to CEFR standards.

Task: ${task.prompt}
User Response: ${response}

Provide a detailed analysis including:
1. Overall score (0-100)
2. CEFR level estimate (A1, A2, B1, B2, C1, C2)
3. Skill breakdown scores for:
   - Grammar (0-100)
   - Vocabulary (0-100)
   - Fluency (0-100)
   - Accuracy (0-100)
   - Complexity (0-100)
4. Specific strengths and weaknesses
5. Detailed feedback for improvement
6. Examples of errors with corrections

Format your response as JSON with the following structure:
{
  "overall_score": number,
  "cefr_level": "string",
  "skill_scores": {
    "grammar": number,
    "vocabulary": number,
    "fluency": number,
    "accuracy": number,
    "complexity": number
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "feedback": "detailed feedback string",
  "error_examples": [{"error": "string", "correction": "string", "explanation": "string"}]
}
`;

    // Add task-specific analysis criteria
    switch (task.task_type) {
      case 'conversation':
        return basePrompt + `\nFocus on natural flow, pronunciation indicators in text, and conversational appropriateness.`;
      case 'writing':
        return basePrompt + `\nFocus on coherence, cohesion, paragraph structure, and written accuracy.`;
      case 'grammar':
        return basePrompt + `\nFocus specifically on grammatical accuracy and understanding of complex structures.`;
      case 'vocabulary':
        return basePrompt + `\nFocus on vocabulary range, precision, and understanding of nuanced meanings.`;
      case 'pronunciation':
        return basePrompt + `\nNote: This is text analysis of a pronunciation task. Focus on phonetic awareness and potential pronunciation issues.`;
      default:
        return basePrompt;
    }
  }

  /**
   * Parse AI analysis response
   */
  parseAIAnalysis(aiResponse, taskType) {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: parsed.overall_score || 50,
          cefrLevel: parsed.cefr_level || 'A2',
          skillScores: parsed.skill_scores || {},
          feedback: {
            overall: parsed.feedback || 'Analysis completed',
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            errorExamples: parsed.error_examples || []
          }
        };
      }
    } catch (error) {
      console.error('Failed to parse AI analysis:', error);
    }

    // Fallback parsing
    return this.extractAnalysisFromText(aiResponse, taskType);
  }

  /**
   * Extract analysis from unstructured text
   */
  extractAnalysisFromText(text, taskType) {
    const scoreMatch = text.match(/score[:\s]*(\d+)/i);
    const cefrMatch = text.match(/([ABC][12])/i);
    
    return {
      score: scoreMatch ? parseInt(scoreMatch[1]) : 60,
      cefrLevel: cefrMatch ? cefrMatch[1].toUpperCase() : 'B1',
      skillScores: {
        grammar: 60,
        vocabulary: 60,
        fluency: 60,
        accuracy: 60,
        complexity: 60
      },
      feedback: {
        overall: text.substring(0, 500) + '...',
        strengths: ['Analysis completed'],
        weaknesses: ['Detailed analysis available'],
        errorExamples: []
      }
    };
  }

  /**
   * Get fallback analysis when AI fails
   */
  getFallbackAnalysis(task, response) {
    const wordCount = response.split(' ').length;
    const sentenceCount = response.split(/[.!?]+/).length;
    
    // Basic heuristic scoring
    let score = 50;
    if (wordCount > 50) score += 10;
    if (sentenceCount > 3) score += 10;
    if (response.includes('because') || response.includes('although')) score += 10;
    
    return {
      score: Math.min(score, 100),
      cefrLevel: score > 70 ? 'B1' : 'A2',
      skillScores: {
        grammar: score,
        vocabulary: score,
        fluency: score - 10,
        accuracy: score,
        complexity: score - 20
      },
      feedback: {
        overall: 'Basic assessment completed. For detailed feedback, please ensure AI services are properly configured.',
        strengths: ['Response provided'],
        weaknesses: ['Detailed analysis unavailable'],
        errorExamples: []
      }
    };
  }

  /**
   * Complete assessment and calculate final results
   */
  async completeAssessment() {
    if (!this.currentSession) {
      throw new Error('No active assessment session');
    }

    try {
      // Get all completed tasks
      const { data: tasks, error: tasksError } = await supabaseService.client
        .from('assessment_tasks')
        .select('*')
        .eq('session_id', this.currentSession.id)
        .not('completed_at', 'is', null);

      if (tasksError) throw tasksError;

      // Calculate overall results
      const results = this.calculateOverallResults(tasks);

      // Update assessment session
      const { data: session, error: sessionError } = await supabaseService.client
        .from('assessment_sessions')
        .update({
          status: 'completed',
          total_duration_minutes: results.totalDuration,
          overall_score: results.overallScore,
          cefr_level: results.cefrLevel,
          ielts_equivalent: results.ieltsEquivalent,
          proficiency_breakdown: results.skillBreakdown,
          ai_analysis: results.analysis,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.currentSession.id)
        .select()
        .single();

      if (sessionError) throw sessionError;

      this.currentSession = null;
      this.assessmentTasks = [];

      return {
        success: true,
        results: {
          sessionId: session.id,
          overallScore: results.overallScore,
          cefrLevel: results.cefrLevel,
          ieltsEquivalent: results.ieltsEquivalent,
          skillBreakdown: results.skillBreakdown,
          recommendations: results.recommendations
        }
      };
    } catch (error) {
      console.error('Failed to complete assessment:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate overall assessment results
   */
  calculateOverallResults(tasks) {
    if (!tasks || tasks.length === 0) {
      throw new Error('No completed tasks found');
    }

    // Calculate weighted average score
    const totalScore = tasks.reduce((sum, task) => sum + (task.score || 0), 0);
    const overallScore = totalScore / tasks.length;

    // Determine CEFR level based on score
    const cefrLevel = this.scoreToCEFR(overallScore);
    
    // Convert to IELTS equivalent
    const ieltsEquivalent = this.cefrToIELTS(cefrLevel);

    // Calculate skill breakdown
    const skillBreakdown = this.calculateSkillBreakdown(tasks);

    // Generate recommendations
    const recommendations = this.generateRecommendations(cefrLevel, skillBreakdown);

    return {
      totalDuration: tasks.reduce((sum, task) => sum + (task.expected_duration_minutes || 0), 0),
      overallScore: Math.round(overallScore * 100) / 100,
      cefrLevel,
      ieltsEquivalent,
      skillBreakdown,
      analysis: {
        taskResults: tasks.map(task => ({
          type: task.task_type,
          score: task.score,
          feedback: task.ai_feedback
        })),
        overallAssessment: `Based on the assessment, the user demonstrates ${cefrLevel} level proficiency.`
      },
      recommendations
    };
  }

  /**
   * Convert score to CEFR level
   */
  scoreToCEFR(score) {
    if (score >= 90) return 'C2';
    if (score >= 80) return 'C1';
    if (score >= 70) return 'B2';
    if (score >= 60) return 'B1';
    if (score >= 45) return 'A2';
    return 'A1';
  }

  /**
   * Convert CEFR to IELTS equivalent
   */
  cefrToIELTS(cefrLevel) {
    const mapping = {
      'A1': 2.5,
      'A2': 3.5,
      'B1': 5.0,
      'B2': 6.5,
      'C1': 7.5,
      'C2': 8.5
    };
    return mapping[cefrLevel] || 5.0;
  }

  /**
   * Calculate skill breakdown from tasks
   */
  calculateSkillBreakdown(tasks) {
    const skills = ['grammar', 'vocabulary', 'fluency', 'accuracy', 'complexity'];
    const breakdown = {};

    skills.forEach(skill => {
      const scores = tasks
        .map(task => task.skill_scores?.[skill])
        .filter(score => score !== undefined && score !== null);
      
      if (scores.length > 0) {
        breakdown[skill] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      } else {
        breakdown[skill] = 60; // Default score
      }
    });

    return breakdown;
  }

  /**
   * Generate learning recommendations
   */
  generateRecommendations(cefrLevel, skillBreakdown) {
    const recommendations = {
      level: cefrLevel,
      focusAreas: [],
      suggestedActivities: [],
      nextSteps: []
    };

    // Identify weak areas
    Object.entries(skillBreakdown).forEach(([skill, score]) => {
      if (score < 60) {
        recommendations.focusAreas.push(skill);
      }
    });

    // Generate activity suggestions based on level
    switch (cefrLevel) {
      case 'A1':
      case 'A2':
        recommendations.suggestedActivities = [
          'Basic vocabulary building',
          'Simple conversation practice',
          'Grammar fundamentals',
          'Listening to beginner content'
        ];
        break;
      case 'B1':
      case 'B2':
        recommendations.suggestedActivities = [
          'Intermediate reading comprehension',
          'Complex conversation topics',
          'Writing practice',
          'Advanced grammar structures'
        ];
        break;
      case 'C1':
      case 'C2':
        recommendations.suggestedActivities = [
          'Advanced literature reading',
          'Debate and discussion',
          'Academic writing',
          'Nuanced language use'
        ];
        break;
    }

    recommendations.nextSteps = [
      `Continue learning at ${cefrLevel} level`,
      'Focus on identified weak areas',
      'Regular practice and assessment',
      'Engage with native speakers'
    ];

    return recommendations;
  }

  /**
   * Get current session status
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * Get assessment history for a user
   */
  async getAssessmentHistory(userId, language = null) {
    try {
      let query = supabaseService.client
        .from('assessment_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (language) {
        query = query.eq('target_language', language);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, history: data };
    } catch (error) {
      console.error('Failed to get assessment history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's current proficiency profile
   */
  async getUserProficiencyProfile(userId, language) {
    try {
      const { data, error } = await supabaseService.client
        .from('user_proficiency_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('language', language)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      return { success: true, profile: data };
    } catch (error) {
      console.error('Failed to get proficiency profile:', error);
      return { success: false, error: error.message };
    }
  }
}

const assessmentService = new AssessmentService();
export default assessmentService;