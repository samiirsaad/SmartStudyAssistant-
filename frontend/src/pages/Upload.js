import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload as UploadIcon, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Trash2,
  Home,
  Settings,
  Zap
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from '../styles/Upload.module.css';
import TopBar from '../components/TopBar';
import HomeButton from '../components/HomeButton';

// Steps
const STEP_SUBJECT = 1;
const STEP_SETTINGS = 2;
const STEP_UPLOAD = 3;
const STEP_PROCESSING = 4;
const STEP_RESULTS = 5;

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Management
  const [currentStep, setCurrentStep] = useState(STEP_SUBJECT);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [lectureTitle, setLectureTitle] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [isCustomCount, setIsCustomCount] = useState(false);
  const [customCount, setCustomCount] = useState(10);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);

  const location = useLocation();

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
    const queryParams = new URLSearchParams(location.search);
    const subjectParam = queryParams.get('subject');
    if (subjectParam) {
      setSelectedSubjectId(subjectParam);
      setCurrentStep(STEP_SETTINGS);
    }
  }, [location.search]);

  // Load subjects from API
  const loadSubjects = async () => {
    try {
      const userId = user?.id || 'test-user';
      const response = await axios.get(`http://localhost:5000/api/subjects/user/${userId}`, {
        headers: { 'x-user-id': userId }
      });
      // The response.data should have a `subjects` array based on the controller
      setSubjects(response.data?.subjects || response.data || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      setSubjects([]);
    }
  };

  // Create new subject
  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Subject name required');
      return;
    }

    setCreatingSubject(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/subjects',
        {
          userId: user?.id || 'test-user',
          name: newSubjectName,
          description: newSubjectDescription,
          color: generateColor()
        },
        {
          headers: { 'x-user-id': user?.id || 'test-user' }
        }
      );

      const newSubject = response.data.subject || response.data;
      setSubjects([...subjects, newSubject]);
      setSelectedSubjectId(newSubject.id);
      setNewSubjectName('');
      setNewSubjectDescription('');
      setShowCreateSubject(false);
      toast.success('Subject created!');
      setCurrentStep(STEP_SETTINGS);
    } catch (error) {
      console.error('Failed to create subject:', error);
      toast.error('Failed to create subject');
    } finally {
      setCreatingSubject(false);
    }
  };

  // Generate random color
  const generateColor = () => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Select subject and proceed
  const handleSelectSubject = () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first');
      return;
    }
    setCurrentStep(STEP_SETTINGS);
  };

  // Get effective question count
  const getEffectiveQuestionCount = () => {
    return isCustomCount ? customCount : questionCount;
  };

  const onDrop = React.useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: Math.random().toString(36),
      file,
      name: file.name,
      size: file.size,
      status: 'pending', // pending | uploading | processing | success | error
      progress: 0,
      summary: null,
      quiz: null
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Dropzone setup
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024, // 50MB
    disabled: isProcessing,
    multiple: true,
    onDropRejected: (rejections) => {
      rejections.forEach(({ errors }) => {
        errors.forEach((error) => {
          if (error.code === 'file-invalid-type') {
            toast.error('Only PDF files are allowed');
          } else if (error.code === 'file-too-large') {
            toast.error('File too large (max 50MB)');
          }
        });
      });
    }
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Upload files
  const handleUploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one PDF file');
      return;
    }

    if (!lectureTitle.trim()) {
      toast.error('Please enter a lecture title');
      return;
    }

    setCurrentStep(STEP_PROCESSING);
    setIsProcessing(true);
    const effectiveCount = getEffectiveQuestionCount();

    for (const fileItem of files) {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'uploading', progress: 10 } : f
          )
        );

        const formData = new FormData();
        formData.append('pdf', fileItem.file);
        formData.append('lectureTitle', lectureTitle);
        formData.append('weekNumber', weekNumber || '1');
        formData.append('subjectId', selectedSubjectId);
        formData.append('questionCount', effectiveCount);

        // Upload
        const response = await axios.post(
          'http://localhost:5000/api/study/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'x-user-id': user?.id || 'test-user'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === fileItem.id ? { ...f, progress: percentCompleted } : f
                )
              );
            }
          }
        );

        // Success
        const result = response.data.data || response.data; // Handle both nested and unnested
        const actualCount = result.quizData?.length || result.quiz?.length || 0;

        console.log(`📊 Question Count Validation:
          Expected: ${effectiveCount}
          Actual: ${actualCount}
          Match: ${actualCount === effectiveCount ? '✅ YES' : '❌ NO'}`);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: 'success',
                  progress: 100,
                  summary: result.summary,
                  quiz: result.quizData || result.quiz,
                  actualCount
                }
              : f
          )
        );

        toast.success(`✅ Processed: ${fileItem.name}`);
      } catch (error) {
        console.error(`Upload error for ${fileItem.name}:`, error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: 'error',
                  error: error.response?.data?.message || 'Upload failed'
                }
              : f
          )
        );
        toast.error(`Failed: ${fileItem.name}`);
      }
    }

    setIsProcessing(false);
    setCurrentStep(STEP_RESULTS);
  };

  const handleRemoveFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleResetFlow = () => {
    setCurrentStep(STEP_SUBJECT);
    setFiles([]);
    setLectureTitle('');
    setWeekNumber('');
    setQuestionCount(10);
    setIsCustomCount(false);
    setSelectedSubjectId(null);
    setShowCreateSubject(false);
    setNewSubjectName('');
    setNewSubjectDescription('');
    loadSubjects(); // Reload subjects to show newly created ones
  };

  // ==================== RENDER ====================
  return (
    <div className={styles.uploadPage}>
      <TopBar title="📚 Upload Lecture" showBackButton={true} />

      <main className={styles.uploadMain}>
        {/* STEP INDICATOR */}
        <motion.div
          className={styles.stepIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.stepTracker}>
            {[STEP_SUBJECT, STEP_SETTINGS, STEP_UPLOAD, STEP_PROCESSING, STEP_RESULTS].map((step) => (
              <div
                key={step}
                className={`${styles.stepDot} ${currentStep >= step ? styles.stepDotActive : ''}`}
              >
                {step}
              </div>
            ))}
          </div>
          <p className={styles.stepLabel}>
            {currentStep === STEP_SUBJECT && 'Step 1: Select Subject'}
            {currentStep === STEP_SETTINGS && 'Step 2: Configure Settings'}
            {currentStep === STEP_UPLOAD && 'Step 3: Upload PDF'}
            {currentStep === STEP_PROCESSING && 'Processing...'}
            {currentStep === STEP_RESULTS && 'Complete! View Results'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT SUBJECT */}
          {currentStep === STEP_SUBJECT && (
            <motion.div
              className={styles.stepCard}
              key="subject-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.stepHeader}>
                <Settings size={28} className={styles.stepIcon} />
                <h2>Select Your Subject</h2>
              </div>

              {/* Existing Subjects */}
              {subjects.length > 0 && (
                <div className={styles.subjectsList}>
                  <h3>Your Subjects</h3>
                  <div className={styles.subjectsGrid}>
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        className={`${styles.subjectCard} ${
                          selectedSubjectId === subject.id ? styles.subjectCardSelected : ''
                        }`}
                        onClick={() => setSelectedSubjectId(subject.id)}
                      >
                        <div
                          className={styles.subjectColor}
                          style={{ background: subject.color || '#6366f1' }}
                        />
                        <div className={styles.subjectInfo}>
                          <h4>{subject.name}</h4>
                          {subject.description && <p>{subject.description}</p>}
                        </div>
                        {selectedSubjectId === subject.id && (
                          <CheckCircle size={24} className={styles.selectedIcon} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Create New Subject */}
              {!showCreateSubject && (
                <button
                  className={styles.createNewButton}
                  onClick={() => setShowCreateSubject(true)}
                >
                  Create New Subject
                </button>
              )}

              {showCreateSubject && (
                <motion.div
                  className={styles.createSubjectForm}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3>Create New Subject</h3>
                  <input
                    type="text"
                    placeholder="Subject name"
                    className={styles.formInput}
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                  <textarea
                    placeholder="Subject description (optional)"
                    className={styles.formTextarea}
                    value={newSubjectDescription}
                    onChange={(e) => setNewSubjectDescription(e.target.value)}
                    rows={3}
                  />
                  <div className={styles.formButtons}>
                    <button
                      className={styles.buttonSecondary}
                      onClick={() => {
                        setShowCreateSubject(false);
                        setNewSubjectName('');
                        setNewSubjectDescription('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.buttonPrimary}
                      onClick={handleCreateSubject}
                      disabled={creatingSubject}
                    >
                      {creatingSubject ? 'Creating...' : 'Create Subject'}
                    </button>
                  </div>
                </motion.div>
              )}

              <div className={styles.actionButtons}>
                <button className={styles.buttonSecondary} onClick={() => navigate('/')}>
                  Cancel
                </button>
                <button className={styles.buttonPrimary} onClick={handleSelectSubject}>
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SETTINGS */}
          {currentStep === STEP_SETTINGS && (
            <motion.div
              className={styles.stepCard}
              key="settings-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.stepHeader}>
                <Zap size={28} className={styles.stepIcon} />
                <h2>Configure Settings</h2>
              </div>

              <div className={styles.settingsForm}>
                <div className={styles.formGroup}>
                  <label>Lecture Title *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g., Introduction to Machine Learning"
                    value={lectureTitle}
                    onChange={(e) => setLectureTitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Week Number (optional)</label>
                  <input
                    type="number"
                    className={styles.formInput}
                    placeholder="e.g., 5"
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Number of Questions *</label>
                  <div className={styles.questionCountOptions}>
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        className={`${styles.countButton} ${
                          !isCustomCount && questionCount === num ? styles.countButtonActive : ''
                        }`}
                        onClick={() => {
                          setQuestionCount(num);
                          setIsCustomCount(false);
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    className={`${styles.countButton} ${isCustomCount ? styles.countButtonActive : ''}`}
                    onClick={() => setIsCustomCount(true)}
                  >
                    Custom
                  </button>

                  {isCustomCount && (
                    <input
                      type="number"
                      className={styles.formInput}
                      placeholder="Enter custom count"
                      value={customCount}
                      onChange={(e) => setCustomCount(parseInt(e.target.value) || 10)}
                      min="1"
                      max="50"
                      style={{ marginTop: '0.5rem' }}
                    />
                  )}
                </div>

                <div className={styles.infoBox}>
                  <p>
                    <strong>Selected:</strong> {getEffectiveQuestionCount()} questions will be generated
                  </p>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={styles.buttonSecondary} onClick={() => setCurrentStep(STEP_SUBJECT)}>
                  Back
                </button>
                <button className={styles.buttonPrimary} onClick={() => setCurrentStep(STEP_UPLOAD)}>
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: UPLOAD */}
          {currentStep === STEP_UPLOAD && (
            <motion.div
              className={styles.stepCard}
              key="upload-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.stepHeader}>
                <UploadIcon size={28} className={styles.stepIcon} />
                <h2>Upload PDF</h2>
              </div>

              <div
                {...getRootProps()}
                className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''} ${
                  isProcessing ? styles.dropzoneDisabled : ''
                }`}
              >
                <input {...getInputProps()} />
                <div className={styles.dropzoneContent}>
                  <FileText size={48} className={styles.dropzoneIcon} />
                  <h3>Drop your PDF here</h3>
                  <p>or click to select files</p>
                  <p className={styles.dropzoneHint}>Max 50MB per file</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className={styles.filesList}>
                  <h3>Selected Files ({files.length})</h3>
                  {files.map((file) => (
                    <div key={file.id} className={styles.fileItem}>
                      <FileText size={20} className={styles.fileIcon} />
                      <div className={styles.fileDetails}>
                        <p className={styles.fileName}>{file.name}</p>
                        <p className={styles.fileSize}>{formatFileSize(file.size)}</p>
                      </div>

                      {file.status === 'uploading' && (
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${file.progress}%` }}
                          >
                            <span className={styles.progressText}>{file.progress}%</span>
                          </div>
                        </div>
                      )}

                      {file.status === 'success' && (
                        <CheckCircle size={20} className={styles.successIcon} />
                      )}

                      {file.status === 'error' && (
                        <AlertCircle size={20} className={styles.errorIcon} />
                      )}

                      {file.status === 'pending' && !isProcessing && (
                        <button
                          className={styles.removeButton}
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.actionButtons}>
                <button
                  className={styles.buttonSecondary}
                  onClick={() => setCurrentStep(STEP_SETTINGS)}
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  className={styles.buttonPrimary}
                  onClick={handleUploadFiles}
                  disabled={isProcessing || files.length === 0}
                >
                  {isProcessing ? 'Uploading...' : 'Upload & Process'}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: PROCESSING */}
          {currentStep === STEP_PROCESSING && (
            <motion.div
              className={styles.stepCard}
              key="processing-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.processingState}>
                <div className={styles.spinner} />
                <h2>Processing Your Lecture</h2>
                <p>Extracting content and generating questions...</p>

                {files.length > 0 && (
                  <div className={styles.processingProgress}>
                    {files.map((file) => (
                      <div key={file.id} className={styles.processingItem}>
                        <p className={styles.processingFileName}>{file.name}</p>
                        {file.status === 'success' && (
                          <p className={styles.processingSuccess}>✅ Complete</p>
                        )}
                        {file.status === 'uploading' && (
                          <p style={{ color: '#6b7280' }}>⏳ Processing...</p>
                        )}
                        {file.status === 'error' && (
                          <p className={styles.processingError}>❌ {file.error || 'Failed'}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: RESULTS */}
          {currentStep === STEP_RESULTS && (
            <motion.div
              className={styles.resultsCard}
              key="results-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.resultsHeader}>
                <Zap size={48} style={{ color: '#10b981' }} />
                <h2>✅ Upload Complete!</h2>
                <p>Your lecture has been processed successfully</p>
              </div>

              {files.map((file) => (
                <div key={file.id} className={styles.resultCard}>
                  <h3>📄 {file.name}</h3>

                  {file.summary && (
                    <div className={styles.summarySection}>
                      <h4>Lecture Summary</h4>
                      <p>{file.summary}</p>
                    </div>
                  )}

                  {file.quiz && file.quiz.length > 0 && (
                    <div className={styles.quizSection}>
                      <h4>
                        🎯 Quiz Generated ({file.actualCount || file.quiz.length} questions)
                        {file.actualCount !== getEffectiveQuestionCount() && (
                          <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>
                            ⚠️ Expected {getEffectiveQuestionCount()}
                          </span>
                        )}
                      </h4>
                      <div style={{ marginTop: '1rem' }}>
                        <button 
                          className={styles.buttonPrimary} 
                          onClick={() => navigate('/quiz')}
                          style={{ width: '100%', justifyContent: 'center', background: '#10b981', borderColor: '#10b981' }}
                        >
                          ابدأ الاختبار الآن
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className={styles.actionButtons}>
                <button className={styles.buttonSecondary} onClick={() => navigate('/')}>
                  <Home size={20} />
                  Home
                </button>
                <button className={styles.buttonPrimary} onClick={handleResetFlow}>
                  Upload Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <HomeButton />
    </div>
  );
};

export default Upload;
