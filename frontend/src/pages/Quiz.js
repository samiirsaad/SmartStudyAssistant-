import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, RotateCw, ArrowLeft, BookOpen, LayoutGrid, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import TopBar from '../components/TopBar';
import HomeButton from '../components/HomeButton';
import { getUserSubjects, saveQuizResult } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Quiz.module.css';

export default function Quiz() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  // Fetch all subjects and lectures
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📚 Fetching subjects and lectures...');
        const userId = user?.id || 'test-user';

        const [subjectsRes, lecturesRes] = await Promise.all([
          getUserSubjects(userId).catch(() => ({ data: { subjects: [] } })),
          fetch('http://localhost:5000/api/study/lectures')
        ]);

        if (subjectsRes?.data?.success && subjectsRes.data.subjects) {
          setSubjects(subjectsRes.data.subjects);
        }

        const data = await lecturesRes.json();
        if (data.success && data.data) {
          // Filter lectures that have quiz data
          const lecturesWithQuiz = data.data.filter(lecture =>
            lecture.quizData && Array.isArray(lecture.quizData) && lecture.quizData.length > 0
          );
          console.log('✅ Lectures fetched:', lecturesWithQuiz);
          setLectures(lecturesWithQuiz);
        }
        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Load quiz when a lecture is selected
  useEffect(() => {
    if (selectedLecture) {
      const questions = selectedLecture.quizData.map((q, idx) => ({
        id: idx,
        question: q.question || '',
        options: q.options || [],
        correctAnswer: q.answer
      }));
      setQuizQuestions(questions);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      console.log('✅ Quiz loaded with', questions.length, 'questions');
    }
  }, [selectedLecture]);

  if (loading) {
    return (
      <div className={styles.quizPage}>
        <TopBar title="Quiz" showBackButton={true} />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.quizPage}>
        <TopBar title="Quiz" showBackButton={true} />
        <div className={styles.errorContainer}>
          <p>Error loading quizzes: {error}</p>
        </div>
      </div>
    );
  }

  if (lectures.length === 0) {
    return (
      <div className={styles.quizPage}>
        <TopBar title="Quiz" showBackButton={true} />
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>📚</div>
          <p>No quizzes available yet</p>
          <p className={styles.emptySubtext}>Upload a PDF lecture first to generate a quiz</p>
        </div>
      </div>
    );
  }

  // Filter lectures based on subject
  const filteredLectures = selectedSubjectId === 'all' 
    ? lectures 
    : lectures.filter(l => l.subjectId === selectedSubjectId);

  // Lecture Selection Screen
  if (!selectedLecture) {
    return (
      <div className={styles.quizPage}>
        <TopBar title="الاختبارات - اختر محاضرة" showBackButton={true} />
        
        <div className={styles.mainLayout}>
          {/* SIDEBAR */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                className={styles.sidebar}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.sidebarHeader}>
                  <div className={styles.sidebarTitle}>
                    <LayoutGrid size={20} className={styles.sidebarIcon} />
                    <h3>المواد الدراسية</h3>
                  </div>
                </div>

                <div className={styles.sidebarContent}>
                  <div
                    className={`${styles.subjectItem} ${selectedSubjectId === 'all' ? styles.subjectItemActive : ''}`}
                    onClick={() => setSelectedSubjectId('all')}
                  >
                    <div className={styles.subjectIcon} style={{ background: 'var(--color-primary)' }}>
                      <BookOpen size={18} color="#fff" />
                    </div>
                    <div className={styles.subjectInfoText}>
                      <h4>جميع المواد</h4>
                      <p>كل الاختبارات المتاحة</p>
                    </div>
                  </div>

                  {subjects.map(subject => (
                    <div
                      key={subject.id}
                      className={`${styles.subjectItem} ${selectedSubjectId === subject.id ? styles.subjectItemActive : ''}`}
                      onClick={() => setSelectedSubjectId(subject.id)}
                    >
                      <div className={styles.subjectIcon} style={{ background: subject.color }}>
                        <BookOpen size={18} color="#fff" />
                      </div>
                      <div className={styles.subjectInfoText}>
                        <h4>{subject.name}</h4>
                        <p>{subject.totalLectures || 0} محاضرات</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* LECTURES LIST AREA */}
          <div className={styles.lecturesArea}>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderLeft}>
                <button
                  className={styles.toggleSidebarBtn}
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  title="تبديل القائمة"
                >
                  {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                </button>
                <div className={styles.chatInfo}>
                  <h2>اختر اختباراً للبدء</h2>
                  <p>اختر من المحاضرات المتاحة للمادة المحددة</p>
                </div>
              </div>
            </div>

            <div className={styles.lectureSelector}>
              {filteredLectures.length === 0 ? (
                 <div className={styles.emptyContainer}>
                   <p>لا توجد اختبارات لهذه المادة</p>
                 </div>
              ) : (
                <div className={styles.lecturesGrid}>
                  {filteredLectures.map((lecture, index) => (
                    <motion.button
                      key={index}
                      className={styles.lectureCard}
                      onClick={() => setSelectedLecture(lecture)}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={styles.lectureIcon}>📝</div>
                      <div className={styles.lectureInfo}>
                        <h3>{lecture.title || lecture.fileName || `Lecture ${index + 1}`}</h3>
                        <p>{lecture.quizData?.length || 0} أسئلة</p>
                      </div>
                      <ChevronLeft size={20} className={styles.lectureArrow} />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <HomeButton />
      </div>
    );
  }

  // Save quiz result to backend
  const saveResult = async (score, total, correct, lecture) => {
    try {
      await saveQuizResult({
        subjectId: lecture.subjectId || '',
        lectureId: lecture.id,
        userId: user?.id || 'anonymous',
        score,
        totalQuestions: total,
        correctAnswers: correct
      });
      console.log('✅ Quiz result saved successfully');
    } catch (err) {
      console.error('❌ Failed to save quiz result:', err);
    }
  };

  // Quiz Results Screen
  if (showResults) {
    const totalQuestions = quizQuestions.length;
    const correctAnswers = quizQuestions.filter((q) => {
      const userAnswer = answers[q.id];
      if (!userAnswer) return false;
      const userLetter = userAnswer.trim().charAt(0).toUpperCase();
      const correctLetter = q.correctAnswer ? String(q.correctAnswer).trim().charAt(0).toUpperCase() : '';
      return userLetter === correctLetter;
    }).length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
      <div className={styles.quizPage}>
        <TopBar title="Quiz Results" showBackButton={false} />
        <motion.div
          className={styles.resultsContainer}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className={styles.resultsHeader}>
            <CheckCircle size={64} className={styles.resultsIcon} />
            <h2>Quiz Complete!</h2>
          </div>

          <div className={styles.scoreBoard}>
            <div className={styles.scoreCircle}>
              <div className={styles.scorePercentage}>{percentage}%</div>
              <div className={styles.scoreText}>Score</div>
            </div>

            <div className={styles.scoreDetails}>
              <div className={styles.scoreRow}>
                <span>Correct Answers:</span>
                <span className={styles.correctCount}>{correctAnswers}/{totalQuestions}</span>
              </div>
              <div className={styles.scoreRow}>
                <span>Accuracy:</span>
                <span className={styles.accuracyText}>
                  {percentage >= 80 ? '🎉 Excellent!' : percentage >= 60 ? '👍 Good!' : '💪 Keep practicing!'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.answersSummary}>
            <h3>مراجعة الإجابات</h3>
            {quizQuestions.map((question, idx) => {
              const userAnswer = answers[question.id];
              const userLetter = userAnswer ? userAnswer.trim().charAt(0).toUpperCase() : null;
              const correctLetter = question.correctAnswer ? String(question.correctAnswer).trim().charAt(0).toUpperCase() : '';
              const isCorrect = userLetter === correctLetter;
              return (
                <motion.div
                  key={idx}
                  className={`${styles.answerItem} ${isCorrect ? styles.correct : styles.incorrect}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className={styles.answerNumber}>{idx + 1}</div>
                  <div className={styles.answerContent}>
                    <p className={styles.answerQuestion}>{question.question}</p>
                    <p className={styles.answerGiven}>
                      Your answer: <strong>{answers[question.id] || 'Not answered'}</strong>
                    </p>
                    {!isCorrect && (
                      <p className={styles.correctAnswerText}>
                        Correct answer: <strong>{question.correctAnswer}</strong>
                      </p>
                    )}
                  </div>
                  <div className={styles.answerStatus}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className={styles.resultsActions}>
            <button
              className={styles.retryBtn}
              onClick={() => {
                setSelectedLecture(null);
                setAnswers({});
                setShowResults(false);
              }}
            >
              <RotateCw size={18} />
              Back to Lectures
            </button>
            <button
              className={styles.restartBtn}
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers({});
                setShowResults(false);
              }}
            >
              <RotateCw size={18} />
              إعادة الاختبار
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz Question Screen
  const question = quizQuestions[currentQuestion];

  // Safety check - if no question exists, go back to lecture selection
  if (!question) {
    return (
      <div className={styles.quizPage}>
        <TopBar title="Quiz" showBackButton={false} />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className={styles.quizPage}>
      <TopBar title="Quiz" showBackButton={false} />

      <div className={styles.quizContainer}>
        {/* Progress Bar */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressInfo}>
            <span className={styles.questionNumber}>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span className={styles.progressPercentage}>{Math.round(progress)}%</span>
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            className={styles.questionCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Back Button */}
            <button
              className={styles.backToLectureBtn}
              onClick={() => setSelectedLecture(null)}
              title="Back to lecture selection"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Question */}
            <div className={styles.questionText}>
              <h3>{question.question}</h3>
            </div>

            {/* Options as Checkboxes */}
            <div className={styles.optionsContainer}>
              {question.options.map((option, idx) => {
                const isSelected = answers[question.id] === option;
                return (
                  <motion.label
                    key={idx}
                    className={`${styles.optionCheckbox} ${isSelected ? styles.selected : ''}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAnswers(prev => ({
                            ...prev,
                            [question.id]: option
                          }));
                        } else {
                          setAnswers(prev => {
                            const updated = { ...prev };
                            delete updated[question.id];
                            return updated;
                          });
                        }
                      }}
                    />
                    <span className={styles.checkbox}></span>
                    <span className={styles.optionText}>{option}</span>
                  </motion.label>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className={styles.navigationBar}>
          <button
            className={styles.prevBtn}
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronRight size={20} />
            Previous
          </button>

          <button
            className={styles.nextBtn}
            onClick={() => {
              if (currentQuestion < quizQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
              }
            }}
            disabled={currentQuestion === quizQuestions.length - 1}
          >
            Next
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Submit Button - Only show on last question */}
        {currentQuestion === quizQuestions.length - 1 && (
          <motion.div
            className={styles.submitSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className={styles.submitBtn}
              onClick={() => {
                // Calculate and save result
                const total = quizQuestions.length;
                const correct = quizQuestions.filter((q) => {
                  const ua = answers[q.id];
                  if (!ua) return false;
                  const ul = ua.trim().charAt(0).toUpperCase();
                  const cl = q.correctAnswer ? String(q.correctAnswer).trim().charAt(0).toUpperCase() : '';
                  return ul === cl;
                }).length;
                const pct = Math.round((correct / total) * 100);
                saveResult(pct, total, correct, selectedLecture);
                setShowResults(true);
              }}
            >
              <CheckCircle size={20} />
              تسليم الاختبار
            </button>
          </motion.div>
        )}
      </div>

      <HomeButton />
    </div>
  );
}
