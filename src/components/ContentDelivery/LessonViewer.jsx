import React, { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf'; // Assuming PDF.js is installed
import { Document, Page } from 'react-pdf';
import TestSystem from './TestSystem'; // Extend existing TestSystem
import usePersonalization from '../../hooks/usePersonalization'; // For AI simplification
import { useSupabaseGeminiService } from '../../services/supabaseGeminiService'; // For AI text simplification
import { useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const LessonViewer = ({ lesson }) => {
  const { userLevel } = usePersonalization();
  const geminiService = useSupabaseGeminiService();
  const [simplifiedText, setSimplifiedText] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [highlights, setHighlights] = useState([]); // For clickable highlights
  const [feedback, setFeedback] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const simplifyText = async () => {
      const response = await geminiService.simplifyText(lesson.text, userLevel);
      setSimplifiedText(response);
    };
    simplifyText();
  }, [lesson, userLevel, geminiService]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleHighlightClick = (highlight) => {
    // Show synonym or metadata
    alert(`Synonym: ${highlight.synonym}`);
  };

  // Assuming lesson.pdfUrl and lesson.highlights are provided
  return (
    <div className="lesson-viewer">
      <h2>{lesson.title}</h2>
      {lesson.audioUrl && <audio controls src={lesson.audioUrl} />}
      {lesson.videoUrl && <video controls src={lesson.videoUrl} />}
      <p>{simplifiedText}</p>
      {lesson.pdfUrl && (
        <Document file={lesson.pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
          {lesson.highlights.map((highlight, index) => (
            <div key={index} onClick={() => handleHighlightClick(highlight)} style={{ position: 'absolute', ...highlight.position }}>
              {highlight.text}
            </div>
          ))}
        </Document>
      )}
      <p>Page {pageNumber} of {numPages}</p>
      <TestSystem quiz={lesson.quiz} /> {/* Extended for quizzes */}
      {/* Microphone input for pronunciation practice */}
      <button 
        onClick={handlePronunciationPractice} 
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Practice Pronunciation
      </button>
    </div>
  );
};

export default LessonViewer;

const handlePronunciationPractice = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Speech recognition not supported in this browser.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => setIsRecording(true);
  recognition.onend = () => setIsRecording(false);
  recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;
    const response = await geminiService.getPronunciationFeedback(spokenText, lesson.text);
    setFeedback(response);
  };

  recognition.start();
};
{feedback && <p className="mt-4">Feedback: {feedback}</p>}
);
};

export default LessonViewer;