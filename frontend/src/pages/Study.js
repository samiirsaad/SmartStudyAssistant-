import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, BookMarked, Award, Clock,
  Trash2, AlertTriangle, X, BookOpen, LayoutGrid, ChevronDown, PanelLeftClose, PanelLeftOpen, RefreshCw
} from 'lucide-react';
import TopBar from '../components/TopBar';
import HomeButton from '../components/HomeButton';
import styles from '../styles/Study.module.css';

export default function Study() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  const [lectures, setLectures] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteToConfirm, setDeleteToConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [keypointsOpen, setKeypointsOpen] = useState(true);
  const [subjectsSidebarOpen, setSubjectsSidebarOpen] = useState(true);
  const [lecturesSidebarOpen, setLecturesSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = user?.id || 'test-user';

        const [lecturesRes, subjectsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/study/lectures?t=${Date.now()}`),
          fetch(`http://localhost:5000/api/subjects/user/${userId}?t=${Date.now()}`)
        ]);

        const lecturesData = await lecturesRes.json();
        const subjectsData = await subjectsRes.json();

        if (lecturesData.success && lecturesData.data) {
          const transformed = lecturesData.data.map((lecture) => {
            // Calculate dynamic stats
            const quizArray = Array.isArray(lecture.quizData) ? lecture.quizData : [];
            const summaryWords = (lecture.summary || '').split(/\s+/).length;
            
            // Estimate duration: reading summary (150 words/min) + quiz (1.5 min/question)
            const estimatedMinutes = Math.max(5, Math.round((summaryWords / 150) + (quizArray.length * 1.5)));
            
            // Estimate difficulty
            let difficulty = 'سهل';
            let difficultyColor = '#10b981'; // Green
            if (quizArray.length > 15) {
                difficulty = 'صعب';
                difficultyColor = '#ef4444'; // Red
            } else if (quizArray.length >= 8) {
                difficulty = 'متوسط';
                difficultyColor = '#d97706'; // Orange
            }

            return {
              id: lecture.id,
              title: lecture.title || lecture.fileName?.replace('.pdf', '') || 'Untitled',
              summary: lecture.summary || 'لا توجد ملخص متاح',
              keyPoints: quizArray.length > 0
                ? quizArray.map(q => q.question || q.text).slice(0, 4)
                : [],
              duration: `${estimatedMinutes} دقيقة`,
              difficulty: difficulty,
              difficultyColor: difficultyColor,
              uploadedAt: lecture.uploadedAt,
              subjectId: lecture.subjectId || null,
              originalData: lecture
            };
          });
          setLectures(transformed);
          if (transformed.length > 0) setSelectedLectureId(transformed[0].id);
        }

        if (subjectsData.success && subjectsData.subjects) {
          setSubjects(subjectsData.subjects);
        }

        setLoading(false);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📚 Page visible - refreshing lectures...');
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Filter by selected subject, then by search
  const filteredBySubject = selectedSubjectId === 'all'
    ? lectures
    : selectedSubjectId === 'uncategorized'
      ? lectures.filter(l => !l.subjectId || l.subjectId === 'undefined' || l.subjectId === 'null')
      : lectures.filter(l => l.subjectId === selectedSubjectId);

  const filteredLectures = filteredBySubject.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentLecture = lectures.find(l => l.id === selectedLectureId);

  const handleSelectSubject = (id) => {
    setSelectedSubjectId(id);
    // auto-select first lecture in that subject
    const first = id === 'all'
      ? lectures[0]
      : lectures.find(l => l.subjectId === id);
    setSelectedLectureId(first?.id || null);
    setSearchTerm('');
  };

  const handleDeleteLecture = async () => {
    if (!deleteToConfirm) return;
    const realId = deleteToConfirm.originalData?.id || deleteToConfirm.id;
    if (!realId) { setDeleteToConfirm(null); return; }
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/study/lectures/${realId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        const updated = lectures.filter(l => (l.originalData?.id || l.id) !== realId);
        setLectures(updated);
        const nextFirst = selectedSubjectId === 'all'
          ? updated[0]
          : updated.find(l => l.subjectId === selectedSubjectId);
        setSelectedLectureId(nextFirst?.id || null);
      }
    } catch (err) {
      console.error('❌ Delete failed:', err);
    } finally {
      setIsDeleting(false);
      setDeleteToConfirm(null);
    }
  };

  const handleRefreshLectures = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 'test-user';

      const [lecturesRes, subjectsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/study/lectures?t=${Date.now()}`),
        fetch(`http://localhost:5000/api/subjects/user/${userId}?t=${Date.now()}`)
      ]);

      const lecturesData = await lecturesRes.json();
      const subjectsData = await subjectsRes.json();

      if (lecturesData.success && lecturesData.data) {
        const transformed = lecturesData.data.map((lecture) => {
          const quizArray = Array.isArray(lecture.quizData) ? lecture.quizData : [];
          const summaryWords = (lecture.summary || '').split(/\s+/).length;
          const estimatedMinutes = Math.max(5, Math.round((summaryWords / 150) + (quizArray.length * 1.5)));
          
          let difficulty = 'سهل';
          let difficultyColor = '#10b981';
          if (quizArray.length > 15) {
              difficulty = 'صعب';
              difficultyColor = '#ef4444';
          } else if (quizArray.length >= 8) {
              difficulty = 'متوسط';
              difficultyColor = '#d97706';
          }

          return {
            id: lecture.id,
            title: lecture.title || lecture.fileName?.replace('.pdf', '') || 'Untitled',
            summary: lecture.summary || 'لا توجد ملخص متاح',
            keyPoints: quizArray.length > 0
              ? quizArray.map(q => q.question || q.text).slice(0, 4)
              : [],
            duration: `${estimatedMinutes} دقيقة`,
            difficulty: difficulty,
            difficultyColor: difficultyColor,
            uploadedAt: lecture.uploadedAt,
            subjectId: lecture.subjectId || null,
            originalData: lecture
          };
        });
        setLectures(transformed);
        if (transformed.length > 0) setSelectedLectureId(transformed[0].id);
      }

      if (subjectsData.success && subjectsData.subjects) {
        setSubjects(subjectsData.subjects);
      }
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.studyPage}>
        <TopBar title="المحاضرات والشروحات" showBackButton={true} />
        <div className={styles.centerState}>
          <div className={styles.spinner} />
          <p>جاري تحميل المحاضرات...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────
  if (error) {
    return (
      <div className={styles.studyPage}>
        <TopBar title="المحاضرات والشروحات" showBackButton={true} />
        <div className={styles.centerState} style={{ color: 'var(--color-error)' }}>
          <p>خطأ في تحميل البيانات: {error}</p>
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────
  if (lectures.length === 0) {
    return (
      <div className={styles.studyPage}>
        <TopBar title="المحاضرات والشروحات" showBackButton={true} />
        <div className={styles.centerState}>
          <BookOpen size={52} style={{ color: 'var(--color-text-tertiary)', marginBottom: '1rem' }} />
          <p>لا توجد محاضرات مرفوعة حتى الآن</p>
          <a href="/upload" className={styles.uploadLink}>انقر هنا لرفع محاضرة</a>
        </div>
      </div>
    );
  }

  // ── Main ─────────────────────────────────────────────
  return (
    <div className={styles.studyPage}>
      <TopBar title="المحاضرات والشروحات" showBackButton={true} />

      <div className={styles.studyLayout}>

        {/* ── SUBJECTS SIDEBAR ── */}
        <aside className={`${styles.subjectsSidebar} ${!subjectsSidebarOpen ? styles.sidebarCollapsed : ''}`}>
          <div className={styles.subjectsSidebarHeader}>
            {subjectsSidebarOpen && (
              <>
                <LayoutGrid size={16} />
                <span>المواد</span>
              </>
            )}
            <button
              className={styles.sidebarToggleBtn}
              onClick={() => setSubjectsSidebarOpen(o => !o)}
              title={subjectsSidebarOpen ? 'طي قائمة المواد' : 'فتح قائمة المواد'}
            >
              {subjectsSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>
          {subjectsSidebarOpen && (
            <ul className={styles.subjectsList}>
              {/* All */}
              <li>
                <button
                  className={`${styles.subjectItem} ${selectedSubjectId === 'all' ? styles.subjectItemActive : ''}`}
                  onClick={() => handleSelectSubject('all')}
                >
                  <span className={styles.subjectDot} style={{ background: '#6366f1' }} />
                  <span className={styles.subjectName}>الكل</span>
                  <span className={styles.subjectCount}>{lectures.length}</span>
                </button>
              </li>

              {subjects.map(subject => {
                const count = lectures.filter(l => l.subjectId === subject.id).length;
                return (
                  <li key={subject.id}>
                    <button
                      className={`${styles.subjectItem} ${selectedSubjectId === subject.id ? styles.subjectItemActive : ''}`}
                      onClick={() => handleSelectSubject(subject.id)}
                    >
                      <span className={styles.subjectDot} style={{ background: subject.color || '#6366f1' }} />
                      <span className={styles.subjectName}>{subject.name}</span>
                      <span className={styles.subjectCount}>{count}</span>
                    </button>
                  </li>
                );
              })}

              {/* Uncategorized */}
              {lectures.some(l => !l.subjectId || l.subjectId === 'undefined' || l.subjectId === 'null') && (
                <li>
                  <button
                    className={`${styles.subjectItem} ${selectedSubjectId === 'uncategorized' ? styles.subjectItemActive : ''}`}
                    onClick={() => handleSelectSubject('uncategorized')}
                  >
                    <span className={styles.subjectDot} style={{ background: '#94a3b8' }} />
                    <span className={styles.subjectName}>بدون مادة</span>
                    <span className={styles.subjectCount}>{lectures.filter(l => !l.subjectId || l.subjectId === 'undefined' || l.subjectId === 'null').length}</span>
                  </button>
                </li>
              )}
            </ul>
          )}
        </aside>

        {/* ── LECTURES SIDEBAR ── */}
        <aside className={`${styles.lecturesSidebar} ${!lecturesSidebarOpen ? styles.sidebarCollapsed : ''}`}>
          <div className={styles.lecturesSidebarHeader}>
            {lecturesSidebarOpen && <span>المحاضرات</span>}
            <div className={styles.sidebarButtonsGroup}>
              <button
                className={styles.sidebarToggleBtn}
                onClick={handleRefreshLectures}
                title="تحديث المحاضرات"
                style={{ opacity: loading ? 0.5 : 1 }}
                disabled={loading}
              >
                <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              </button>
              <button
                className={styles.sidebarToggleBtn}
                onClick={() => setLecturesSidebarOpen(o => !o)}
                title={lecturesSidebarOpen ? 'طي قائمة المحاضرات' : 'فتح قائمة المحاضرات'}
              >
                {lecturesSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
              </button>
            </div>
          </div>
          {lecturesSidebarOpen && (
            <>
              <div className={styles.searchContainer}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="ابحث عن محاضرة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <ul className={styles.lecturesList}>
                {filteredLectures.length > 0 ? (
                  filteredLectures.map((lecture) => (
                    <li key={lecture.id} className={styles.lectureListItem}>
                      <button
                        onClick={() => setSelectedLectureId(lecture.id)}
                        className={`${styles.lectureItem} ${selectedLectureId === lecture.id ? styles.lectureItemActive : ''}`}
                      >
                        <div className={styles.lectureItemContent}>
                          <h4 className={styles.lectureItemTitle}>{lecture.title}</h4>
                          <div className={styles.lectureItemMeta}>
                            <span className={styles.lectureItemDuration}>{lecture.duration}</span>
                          </div>
                        </div>
                      </button>
                      <button
                        className={styles.deleteLectureBtn}
                        onClick={(e) => { e.stopPropagation(); setDeleteToConfirm(lecture); }}
                        title="حذف المحاضرة"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))
                ) : (
                  <li className={styles.emptyLectures}>
                    <BookOpen size={32} />
                    <p>لا توجد محاضرات</p>
                  </li>
                )}
              </ul>
            </>
          )}
        </aside>

        {/* ── STUDY CONTENT ── */}
        <main className={styles.studyContent}>
          {currentLecture ? (
            <>
              {/* Header */}
              <div className={styles.lectureHeader}>
                <div>
                  <h2 className={styles.lectureTitle}>{currentLecture.title}</h2>
                  <div className={styles.badgesContainer}>
                    <span className={styles.difficultyBadge} style={{ borderColor: currentLecture.difficultyColor || '#d97706', color: currentLecture.difficultyColor || '#d97706' }}>
                      <Award size={14} style={{ color: currentLecture.difficultyColor || '#d97706' }} />
                      {currentLecture.difficulty}
                    </span>
                    <span className={styles.durationBadge}>
                      <Clock size={14} />
                      {currentLecture.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary — collapsible */}
              <div className={styles.accordionCard}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setSummaryOpen(o => !o)}
                  aria-expanded={summaryOpen}
                >
                  <span>ملخص المحاضرة</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.accordionChevron} ${summaryOpen ? styles.accordionChevronOpen : ''}`}
                  />
                </button>
                <div className={`${styles.accordionBody} ${summaryOpen ? styles.accordionBodyOpen : ''}`}>
                  <p className={styles.summaryText}>{currentLecture.summary}</p>
                </div>
              </div>

              {/* Key Points — collapsible */}
              <div className={styles.accordionCard}>
                <button
                  className={styles.accordionHeader}
                  onClick={() => setKeypointsOpen(o => !o)}
                  aria-expanded={keypointsOpen}
                >
                  <span>النقاط الرئيسية</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.accordionChevron} ${keypointsOpen ? styles.accordionChevronOpen : ''}`}
                  />
                </button>
                <div className={`${styles.accordionBody} ${keypointsOpen ? styles.accordionBodyOpen : ''}`}>
                  <ul className={styles.keypointsList}>
                    {currentLecture.keyPoints && currentLecture.keyPoints.length > 0 ? (
                      currentLecture.keyPoints.map((point, index) => (
                        <li key={index} className={styles.keypointsItem}>
                          <span className={styles.keypointsNumberCircle}>{index + 1}</span>
                          <span className={styles.keypointsText}>{point}</span>
                        </li>
                      ))
                    ) : (
                      <li style={{ color: '#999', padding: '0.5rem 0' }}>لا توجد نقاط رئيسية متاحة</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Quiz Button */}
              <button onClick={() => navigate('/quiz')} className={styles.startQuizBtn}>
                <BookMarked size={20} />
                ابدأ الاختبار الآن
              </button>
            </>
          ) : (
            <div className={styles.noLectureSelected}>
              <BookOpen size={56} />
              <h3>اختر محاضرة</h3>
              <p>اختر مادة ثم محاضرة من القائمة لعرض تفاصيلها</p>
            </div>
          )}
        </main>
      </div>

      <HomeButton />

      {/* Delete Confirmation Modal */}
      {deleteToConfirm && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <button className={styles.modalClose} onClick={() => setDeleteToConfirm(null)}>
              <X size={20} />
            </button>
            <div className={styles.modalIcon}>
              <AlertTriangle size={36} />
            </div>
            <h3 className={styles.modalTitle}>حذف المحاضرة</h3>
            <p className={styles.modalMessage}>
              هل أنت متأكد من حذف<br />
              <strong>«{deleteToConfirm.title}»</strong>؟<br />
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteToConfirm(null)} disabled={isDeleting}>
                إلغاء
              </button>
              <button className={styles.modalConfirm} onClick={handleDeleteLecture} disabled={isDeleting}>
                {isDeleting ? 'جارٍ الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
