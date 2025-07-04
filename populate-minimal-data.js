require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateMinimalData() {
  try {
    console.log('📝 Creating vocabulary words (minimal columns only)...');
    
    // Create vocabulary with only essential columns
    const vocabularyWords = [
      {
        word: 'hello',
        translation: 'hola',
        level: 'beginner'
      },
      {
        word: 'beautiful',
        translation: 'hermoso/a',
        level: 'beginner'
      },
      {
        word: 'accomplish',
        translation: 'lograr',
        level: 'intermediate'
      },
      {
        word: 'serendipity',
        translation: 'casualidad afortunada',
        level: 'advanced'
      },
      {
        word: 'perseverance',
        translation: 'perseverancia',
        level: 'advanced'
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

    console.log('📚 Creating grammar lessons (minimal columns only)...');
    
    // Create grammar lessons with only essential columns
    const grammarLessons = [
      {
        title: 'Basic Greetings',
        description: 'Learn how to greet people in Spanish',
        level: 'beginner',
        lesson_order: 1,
        content: {
          introduction: 'Greetings are essential for any conversation',
          examples: ['Hola - Hello', 'Buenos días - Good morning']
        }
      },
      {
        title: 'Present Tense Verbs',
        description: 'Master the present tense in Spanish',
        level: 'beginner',
        lesson_order: 2,
        content: {
          introduction: 'Present tense is the foundation of Spanish grammar',
          examples: ['Yo hablo - I speak', 'Tú hablas - You speak']
        }
      },
      {
        title: 'Adjective Agreement',
        description: 'Learn how adjectives agree with nouns',
        level: 'intermediate',
        lesson_order: 3,
        content: {
          introduction: 'Adjectives must agree in gender and number with nouns',
          examples: ['Casa blanca - White house', 'Casas blancas - White houses']
        }
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

    console.log('\n🎉 Minimal data population completed!');
    console.log('\n📊 Summary:');
    console.log(`   📝 Vocabulary Words: ${vocabulary?.length || 0}`);
    console.log(`   📚 Grammar Lessons: ${lessons?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error populating minimal data:', error);
  }
}

populateMinimalData();