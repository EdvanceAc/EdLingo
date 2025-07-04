const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function populateSampleData() {
  console.log('🌱 Populating EdLingo database with sample data...');
  
  try {
    // Skip user creation for now and focus on other data
    console.log('⏭️ Skipping user creation, focusing on vocabulary and lessons...');
    
    let users = [];
    
    // Try to get existing users from the database
    try {
      const { data: existingUsers, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      if (!error && existingUsers && existingUsers.length > 0) {
        users = existingUsers;
        console.log(`✅ Found ${users.length} existing users`);
      } else {
        console.log('ℹ️ No existing users found, will create sample data without user references');
      }
    } catch (err) {
      console.log('ℹ️ Users table not accessible, proceeding with other data');
    }

    // Create user progress for each user (if we have users)
    if (users.length > 0) {
      console.log('📊 Creating user progress...');
      const userProgressData = users.map(user => ({
        user_id: user.id,
        current_level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        total_xp: Math.floor(Math.random() * 5000) + 500,
        current_streak: Math.floor(Math.random() * 30) + 1,
        longest_streak: Math.floor(Math.random() * 50) + 10,
        lessons_completed: Math.floor(Math.random() * 50) + 5,
        words_learned: Math.floor(Math.random() * 200) + 20,
        grammar_mastered: Math.floor(Math.random() * 20) + 2,
        time_studied: Math.floor(Math.random() * 1000) + 100,
        chat_messages: Math.floor(Math.random() * 100) + 10,
        daily_goal: 30,
        daily_progress: Math.floor(Math.random() * 35),
        daily_goal_completed: Math.random() > 0.5
      }));

      const { error: progressError } = await supabase
        .from('user_progress')
        .insert(userProgressData);

      if (progressError) {
        console.error('Error creating user progress:', progressError);
      } else {
        console.log(`✅ Created progress for ${users.length} users`);
      }
    } else {
      console.log('⏭️ Skipping user progress creation (no users available)');
    }

    // Create sample grammar lessons
    console.log('📚 Creating sample grammar lessons...');
    const grammarLessons = [
      {
        title: 'Present Simple Tense',
        description: 'Learn the basics of present simple tense in English',

        lesson_order: 1,
        content: {
          introduction: 'The present simple tense is used for habits, facts, and general truths.',
          examples: ['I work every day', 'She likes coffee', 'The sun rises in the east'],
          exercises: ['Fill in the blanks', 'Multiple choice questions']
        },
        learning_objectives: ['Understand present simple structure', 'Use present simple in sentences'],
        tags: ['grammar', 'tense', 'beginner'],

      },
      {
        title: 'Past Simple Tense',
        description: 'Master the past simple tense for talking about completed actions',
        level: 'beginner',
        lesson_order: 2,
        content: {
          introduction: 'The past simple tense is used for completed actions in the past.',
          examples: ['I worked yesterday', 'She visited Paris last year', 'They finished the project'],
          exercises: ['Regular and irregular verbs', 'Sentence transformation']
        },
        learning_objectives: ['Form past simple sentences', 'Distinguish regular and irregular verbs'],
        tags: ['grammar', 'tense', 'past'],
        is_published: true
      },
      {
        title: 'Present Continuous Tense',
        description: 'Learn to express ongoing actions with present continuous',

        lesson_order: 3,
        content: {
          introduction: 'The present continuous tense describes actions happening now.',
          examples: ['I am working now', 'She is reading a book', 'They are playing football'],
          exercises: ['Form sentences', 'Choose correct tense']
        },
        learning_objectives: ['Use present continuous correctly', 'Understand time expressions'],
        tags: ['grammar', 'tense', 'continuous'],
        is_published: true
      },
      {
        title: 'Modal Verbs',
        description: 'Understand and use modal verbs like can, could, should, must',
        level: 'intermediate',
        lesson_order: 4,
        content: {
          introduction: 'Modal verbs express ability, possibility, permission, and obligation.',
          examples: ['I can swim', 'You should study', 'We must leave now'],
          exercises: ['Choose the right modal', 'Complete conversations']
        },
        learning_objectives: ['Use modal verbs appropriately', 'Express different meanings'],
        tags: ['grammar', 'modals', 'intermediate'],
        is_published: true
      },
      {
        title: 'Conditional Sentences',
        description: 'Master first, second, and third conditional structures',

        lesson_order: 5,
        content: {
          introduction: 'Conditional sentences express hypothetical situations and their results.',
          examples: ['If it rains, I will stay home', 'If I were rich, I would travel', 'If I had studied, I would have passed'],
          exercises: ['Complete conditionals', 'Transform sentences']
        },
        learning_objectives: ['Form all conditional types', 'Use conditionals in context'],
        tags: ['grammar', 'conditionals', 'advanced']
      }
    ];

    const { data: lessons, error: lessonsError } = await supabase
      .from('grammar_lessons')
      .insert(grammarLessons)
      .select();

    if (lessonsError) {
      console.error('Error creating grammar lessons:', lessonsError);
    } else {
      console.log(`✅ Created ${lessons.length} grammar lessons`);
    }

    // Create sample vocabulary words
    console.log('📝 Creating sample vocabulary...');
    const vocabularyWords = [
      {
        word: 'hello',
        translation: 'hola',
        pronunciation: '/həˈloʊ/',
        part_of_speech: 'interjection',
        level: 'beginner',
        category: 'greetings',
        example_sentence: 'Hello, how are you?',
        example_translation: 'Hola, ¿cómo estás?',
        difficulty_score: 1,
        tags: ['greeting', 'basic']
      },
      {
        word: 'beautiful',
        translation: 'hermoso/a',
        pronunciation: '/ˈbjuːtɪfəl/',
        part_of_speech: 'adjective',
        level: 'beginner',
        category: 'adjectives',
        example_sentence: 'The sunset is beautiful.',
        example_translation: 'El atardecer es hermoso.',
        difficulty_score: 2,
        tags: ['adjective', 'description']
      },
      {
        word: 'accomplish',
        translation: 'lograr',
        pronunciation: '/əˈkʌmplɪʃ/',
        part_of_speech: 'verb',
        level: 'intermediate',
        category: 'verbs',
        example_sentence: 'I want to accomplish my goals.',
        example_translation: 'Quiero lograr mis objetivos.',
        difficulty_score: 3,
        tags: ['verb', 'achievement']
      },
      {
        word: 'serendipity',
        translation: 'casualidad afortunada',
        pronunciation: '/ˌserənˈdɪpəti/',
        part_of_speech: 'noun',
        level: 'advanced',
        category: 'abstract',
        example_sentence: 'Meeting you was pure serendipity.',
        example_translation: 'Conocerte fue pura casualidad afortunada.',
        difficulty_score: 5,
        tags: ['noun', 'abstract', 'advanced']
      },
      {
        word: 'perseverance',
        translation: 'perseverancia',
        pronunciation: '/ˌpɜːrsəˈvɪrəns/',
        part_of_speech: 'noun',
        level: 'advanced',
        category: 'character',
        example_sentence: 'Success requires perseverance.',
        example_translation: 'El éxito requiere perseverancia.',
        difficulty_score: 4,
        tags: ['noun', 'character', 'motivation']
      }
    ];

    const { data: vocabulary, error: vocabError } = await supabase
      .from('vocabulary')
      .insert(vocabularyWords)
      .select();

    if (vocabError) {
      console.error('Error creating vocabulary:', vocabError);
    } else {
      console.log(`✅ Created ${vocabulary.length} vocabulary words`);
    }

    // Create sample learning sessions (assignments) if we have users
    if (users.length > 0) {
      console.log('🎯 Creating sample learning sessions...');
      const learningSessions = [];
      
      users.forEach(user => {
        // Create 2-4 sessions per user
        const sessionCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < sessionCount; i++) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
          
          const isCompleted = Math.random() > 0.3; // 70% completion rate
          const completedDate = isCompleted ? new Date(startDate.getTime() + Math.random() * 3600000) : null;
          
          learningSessions.push({
            user_id: user.id,
            session_type: ['grammar', 'vocabulary', 'pronunciation', 'conversation'][Math.floor(Math.random() * 4)],
            duration_minutes: Math.floor(Math.random() * 45) + 15,
            xp_earned: isCompleted ? Math.floor(Math.random() * 100) + 20 : 0,
            activities_completed: isCompleted ? Math.floor(Math.random() * 10) + 1 : 0,
            accuracy_percentage: isCompleted ? Math.floor(Math.random() * 40) + 60 : null,
            session_data: {
              lesson_id: lessons && lessons.length > 0 ? lessons[Math.floor(Math.random() * lessons.length)]?.id : null,
              exercises_completed: isCompleted ? Math.floor(Math.random() * 5) + 1 : 0
            },
            started_at: startDate.toISOString(),
            completed_at: completedDate?.toISOString() || null
          });
        }
      });

      const { data: sessions, error: sessionsError } = await supabase
        .from('learning_sessions')
        .insert(learningSessions)
        .select();

      if (sessionsError) {
        console.error('Error creating learning sessions:', sessionsError);
      } else {
        console.log(`✅ Created ${sessions.length} learning sessions`);
      }
    } else {
      console.log('⏭️ Skipping learning sessions creation (no users available)');
    }

    // Create sample achievements
    console.log('🏆 Creating sample achievements...');
    const achievements = [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'milestone',
        criteria: { lessons_completed: 1 },
        xp_reward: 50
      },
      {
        name: 'Vocabulary Master',
        description: 'Learn 100 new words',
        icon: '📚',
        category: 'vocabulary',
        criteria: { words_learned: 100 },
        xp_reward: 200
      },
      {
        name: 'Grammar Guru',
        description: 'Complete 10 grammar lessons',
        icon: '📝',
        category: 'grammar',
        criteria: { grammar_lessons_completed: 10 },
        xp_reward: 300
      },
      {
        name: 'Streak Keeper',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'streak',
        criteria: { streak_days: 7 },
        xp_reward: 150
      },
      {
        name: 'Time Master',
        description: 'Spend 10 hours learning',
        icon: '⏰',
        category: 'practice',
        criteria: { time_spent_minutes: 600 },
        xp_reward: 250
      }
    ];

    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .insert(achievements)
      .select();

    if (achievementsError) {
      console.error('Error creating achievements:', achievementsError);
    } else {
      console.log(`✅ Created ${achievementsData.length} achievements`);
    }

    console.log('\n🎉 Sample data population completed!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📚 Grammar Lessons: ${lessons?.length || 0}`);
    console.log(`   📝 Vocabulary Words: ${vocabulary?.length || 0}`);
    console.log(`   🎯 Learning Sessions: ${users.length > 0 ? 'Created' : 'Skipped (no users)'}`);
    console.log(`   🏆 Achievements: ${achievementsData?.length || 0}`);
    console.log('\n🚀 Your admin dashboard is now ready with sample data!');
    
  } catch (error) {
    console.error('❌ Error populating sample data:', error);
  }
}

// Run the population script
populateSampleData();