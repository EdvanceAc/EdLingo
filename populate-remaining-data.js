require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateRemainingData() {
  try {
    console.log('📝 Creating vocabulary words (without problematic columns)...');
    
    // Create vocabulary without 'category' column
    const vocabularyWords = [
      {
        word: 'hello',
        translation: 'hola',
        pronunciation: '/həˈloʊ/',
        part_of_speech: 'interjection',
        level: 'beginner',
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
      console.error('❌ Error creating vocabulary:', vocabError);
    } else {
      console.log(`✅ Created ${vocabulary.length} vocabulary words`);
    }

    console.log('📚 Creating grammar lessons (without problematic columns)...');
    
    // Create grammar lessons without 'is_published' column
    const grammarLessons = [
      {
        title: 'Basic Greetings',
        description: 'Learn how to greet people in Spanish',
        level: 'beginner',
        lesson_order: 1,
        content: {
          introduction: 'Greetings are essential for any conversation',
          examples: ['Hola - Hello', 'Buenos días - Good morning', 'Buenas tardes - Good afternoon'],
          exercises: [
            { type: 'translation', question: 'How do you say "Hello" in Spanish?', answer: 'Hola' }
          ]
        },
        estimated_duration: 15,
        learning_objectives: ['Learn basic greetings', 'Practice pronunciation'],
        tags: ['greetings', 'basic']
      },
      {
        title: 'Present Tense Verbs',
        description: 'Master the present tense in Spanish',
        level: 'beginner',
        lesson_order: 2,
        content: {
          introduction: 'Present tense is the foundation of Spanish grammar',
          examples: ['Yo hablo - I speak', 'Tú hablas - You speak', 'Él habla - He speaks'],
          exercises: [
            { type: 'conjugation', question: 'Conjugate "hablar" for "yo"', answer: 'hablo' }
          ]
        },
        estimated_duration: 25,
        learning_objectives: ['Learn present tense conjugation', 'Practice regular verbs'],
        tags: ['verbs', 'present-tense']
      },
      {
        title: 'Adjective Agreement',
        description: 'Learn how adjectives agree with nouns',
        level: 'intermediate',
        lesson_order: 3,
        content: {
          introduction: 'Adjectives must agree in gender and number with nouns',
          examples: ['Casa blanca - White house', 'Casas blancas - White houses'],
          exercises: [
            { type: 'agreement', question: 'Make "rojo" agree with "casas"', answer: 'rojas' }
          ]
        },
        estimated_duration: 20,
        learning_objectives: ['Understand gender agreement', 'Practice plural forms'],
        tags: ['adjectives', 'agreement']
      }
    ];

    const { data: lessons, error: lessonsError } = await supabase
      .from('grammar_lessons')
      .insert(grammarLessons)
      .select();

    if (lessonsError) {
      console.error('❌ Error creating grammar lessons:', lessonsError);
    } else {
      console.log(`✅ Created ${lessons.length} grammar lessons`);
    }

    console.log('\n🎉 Remaining data population completed!');
    console.log('\n📊 Summary:');
    console.log(`   📝 Vocabulary Words: ${vocabulary?.length || 0}`);
    console.log(`   📚 Grammar Lessons: ${lessons?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error populating remaining data:', error);
  }
}

populateRemainingData();