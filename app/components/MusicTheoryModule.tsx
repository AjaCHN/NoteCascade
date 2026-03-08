// app/components/MusicTheoryModule.tsx v2.4.2
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, CheckCircle, Circle, Play, Award, ArrowRight } from 'lucide-react';
import { getTheoryLessons } from '../lib/theory-lessons';
import { useLocale } from '../lib/store';
import { translations, Translation } from '../lib/translations';

interface MusicTheoryModuleProps {
  activeNotes: Map<number, number>;
}

export function MusicTheoryModule({ activeNotes }: MusicTheoryModuleProps) {
  const locale = useLocale();
  const t = (translations[locale] || translations.en) as Translation;
  const theoryLessons = getTheoryLessons(locale);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(theoryLessons[0].id);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = React.useRef(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const currentLesson = theoryLessons.find(l => l.id === selectedLessonId) || theoryLessons[0];

  const handleLessonSelect = (id: string) => {
    setSelectedLessonId(id);
    setQuizMode(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    scoreRef.current = 0;
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleStartQuiz = () => {
    setQuizMode(true);
  };

  const handleAnswer = (index: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentLesson.quiz[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      scoreRef.current += 1;
    }

    setTimeout(() => {
      if (currentQuestionIndex < currentLesson.quiz.length - 1) {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        setQuizCompleted(true);
        if (scoreRef.current === currentLesson.quiz.length) {
          setCompletedLessons(prev => new Set(prev).add(currentLesson.id));
        }
      }
    }, 1500);
  };

  return (
    <div className="flex h-full w-full bg-slate-900 text-slate-200 overflow-hidden rounded-xl border border-slate-800">
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-slate-100">{t.theory.title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {theoryLessons.map(lesson => (
            <button
              key={lesson.id}
              onClick={() => handleLessonSelect(lesson.id)}
              className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between transition-colors ${
                selectedLessonId === lesson.id 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                  : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span className="text-sm font-medium">{lesson.title}</span>
              {completedLessons.has(lesson.id) ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 opacity-30" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-950">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              {!quizMode ? (
                <motion.div
                  key="lesson"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h1 className="text-3xl font-black text-white mb-4">{currentLesson.title}</h1>
                    <div className="prose prose-invert prose-indigo max-w-none">
                      {currentLesson.content.map((paragraph, idx) => (
                        <p key={idx} className="text-slate-300 leading-relaxed text-lg mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Element Placeholder */}
                  {currentLesson.interactiveElement && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 my-8">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">{t.theory.interactivePractice}</h3>
                      <p className="text-slate-300 mb-4">{currentLesson.interactiveElement.instruction}</p>
                      <div className="h-32 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                        <span className="text-slate-500">{t.theory.playNotesOnKeyboard}</span>
                        {/* Here we could render active notes specifically for the lesson */}
                        {activeNotes.size > 0 && (
                          <div className="absolute mt-16 flex gap-2">
                            {Array.from(activeNotes.keys()).map(note => (
                              <div key={note} className="px-3 py-1 bg-indigo-500 rounded-full text-white font-bold text-sm">
                                Note {note}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-8 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleStartQuiz}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      {t.theory.startQuiz}
                    </button>
                  </div>
                </motion.div>
              ) : !quizCompleted ? (
                <motion.div
                  key="quiz"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="max-w-2xl mx-auto pt-10"
                >
                  <div className="mb-8 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-300">{t.theory.quizTitle}: {currentLesson.title}</h2>
                    <div className="text-sm font-medium text-slate-500">
                      {t.theory.questionOf.replace('{current}', (currentQuestionIndex + 1).toString()).replace('{total}', currentLesson.quiz.length.toString())}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-xl">
                    <h3 className="text-2xl font-bold text-white mb-8 leading-tight">
                      {currentLesson.quiz[currentQuestionIndex].question}
                    </h3>

                    <div className="space-y-3">
                      {currentLesson.quiz[currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = selectedAnswer === idx;
                        const isCorrect = idx === currentLesson.quiz[currentQuestionIndex].correctAnswer;
                        
                        let buttonClass = "w-full text-left px-6 py-4 rounded-xl border transition-all font-medium text-lg ";
                        
                        if (!showFeedback) {
                          buttonClass += "bg-slate-900/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-300";
                        } else {
                          if (isCorrect) {
                            buttonClass += "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                          } else if (isSelected) {
                            buttonClass += "bg-rose-500/20 border-rose-500 text-rose-400";
                          } else {
                            buttonClass += "bg-slate-900/50 border-slate-800 text-slate-600 opacity-50";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            disabled={showFeedback}
                            className={buttonClass}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center pt-20 text-center"
                >
                  <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                    <Award className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-2">{t.theory.quizCompleted}</h2>
                  <p className="text-xl text-slate-400 mb-8">
                    {t.theory.youScored.replace('{score}', score.toString()).replace('{total}', currentLesson.quiz.length.toString())}
                  </p>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setQuizMode(false)}
                      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                    >
                      {t.theory.reviewLesson}
                    </button>
                    {score === currentLesson.quiz.length && currentLesson.id !== theoryLessons[theoryLessons.length - 1].id && (
                      <button
                        onClick={() => {
                          const nextIdx = theoryLessons.findIndex(l => l.id === currentLesson.id) + 1;
                          if (nextIdx < theoryLessons.length) {
                            handleLessonSelect(theoryLessons[nextIdx].id);
                          }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all"
                      >
                        {t.theory.nextLesson}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
