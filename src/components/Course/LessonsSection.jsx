import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Lock, CheckCircle, Star, Trophy, ArrowRight, Zap, Mic, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../renderer/components/ui/Card';
import { Progress } from '../../renderer/components/ui/Progress';
import { Badge } from '../../renderer/components/ui/Badge';
import Button from '../../renderer/components/ui/Button';
import { supabase } from '../../renderer/config/supabaseConfig';
import { AuthContext } from '../../renderer/contexts/AuthContext';
import { simplifyText, adjustTTSSpeed, analyzePronunciation } from '../../services/textSimplification';
import useProgression from '../../hooks/useProgression';
import { useHistory } from 'react-router-dom'; // For navigation to conversation
// Assume ImageLibraryService exists or create if needed
// import { getWordImage } from '../../services/imageLibrary'; // Placeholder, implement if needed
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const LessonsSection = ({ courseId }) => {
  const { user } = useContext(AuthContext);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [userLevel, setUserLevel] = useState(user?.placement_level || 'A1');
  const { progress, updateProgress } = useProgression();

  useEffect(() => {
    fetchTerms();
  }, [courseId]);

  const fetchTerms = async () => {
    const { data, error } = await supabase.from('terms').select('*').eq('course_id', courseId).order('order_number');
    if (error) console.error('Error fetching terms:', error);
    else setTerms(data);
  };

  const fetchLessons = async (termId) => {
    const { data, error } = await supabase.from('lessons').select('*').eq('term_id', termId);
    if (error) console.error('Error fetching lessons:', error);
    else {
      const personalizedLessons = await Promise.all(data.map(async (lesson) => ({
        ...lesson,
        content: await simplifyText(lesson.content, userLevel),
        isUnlocked: checkUnlock(lesson, progress)
      })));
      setLessons(personalizedLessons);
    }
  };

  const checkUnlock = (lesson, progress) => {
    // Implement dripping system logic
    return progress.total_xp >= lesson.required_xp && /* check prerequisites */ true;
  };

  const fetchLessonDetails = async (lessonId) => {
    const { data: materials } = await supabase.from('lesson_materials').select('*').eq('lesson_id', lessonId);
    const { data: book } = await supabase.from('books').select('*').eq('lesson_id', lessonId).single();
    if (book) setPdfUrl(book.pdf_url);
    const { data: hl } = await supabase.from('word_highlights').select('*').eq('book_id', book.id);
    setHighlights(hl);
  };

  const fetchImagesForLesson = async (lesson) => {
    // Extract words from content, fetch images
    const words = lesson.content.split(' '); // Simplified
    const imgs = {};
    for (let word of words) {
      imgs[word] = await getWordImage(word);
    }
    setImages(imgs);
  };
  const loadConversationHistory = async () => {
    const { data } = await supabase.from('learning_sessions').select('session_data').eq('user_id', user.id).eq('session_type', 'conversation');
    setConversationHistory(data.map(d => d.session_data));
  };
  const handleLessonStart = async (lesson) => {
    if (!lesson.isUnlocked) return;
    setSelectedLesson(lesson);
    await fetchLessonDetails(lesson.id);
    // Adjust TTS speed
    const speed = await adjustTTSSpeed(userLevel);
    // Start lesson logic
  };

  const handleAssessment = async (lessonId) => {
    // Run quiz, save results, provide feedback
    // If passed, update progress and unlock next
  };

  const handleQuizSubmit = async (answers) => {
    // Submit to AI for grading, save to learning_sessions
    // If passed, updateProgress()
  };
  const handleWritingSubmit = async (text) => {
    // Send to AI for feedback
    setWritingFeedback('AI feedback here');
  };
  const handlePronunciationSubmit = async (audio) => {
    const feedback = await analyzePronunciation(audio);
    setPronunciationFeedback(feedback);
  };

  return (
    <motion.div className="space-y-6">
      {/* Terms List */}
      {terms.map(term => (
        <Card key={term.id} onClick={() => { setSelectedTerm(term); fetchLessons(term.id); }}>
          <CardHeader><CardTitle>{term.name}</CardTitle></CardHeader>
        </Card>
      ))}
      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map(lesson => (
          <Card key={lesson.id}>
            <CardHeader>
              <CardTitle>{lesson.name} ({lesson.level})</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={/* lesson progress */ 0} />
              <Button disabled={!lesson.isUnlocked} onClick={() => handleLessonStart(lesson)}>
                {lesson.isUnlocked ? 'Start' : <Lock />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default LessonsSection;