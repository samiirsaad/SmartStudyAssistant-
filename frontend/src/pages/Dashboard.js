import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, BookOpen, MessageCircle, Brain,
  TrendingUp, Target, Zap, Award, Clock,
  ChevronRight, Flame, LayoutGrid, Plus,
  FileText, Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TopBar from '../components/TopBar';
import HomeButton from '../components/HomeButton';
import styles from '../styles/Dashboard.module.css';

// Greeting based on time of day
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return '☀️ صباح الخير';
  if (h < 17) return '🌤️ مساء النشاط';
  return '🌙 مساء النور';
}

// Circular progress SVG
function CircularProgress({ value = 0, color = '#6366f1', size = 64, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
}

// Linear progress bar
function LinearBar({ value = 0, color = '#6366f1' }) {
  return (
    <div className={styles.linearBarBg}>
      <div
        className={styles.linearBarFill}
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate streak from lecture upload dates
  const calculateStreak = (lecturesList) => {
    if (!lecturesList || lecturesList.length === 0) return 0;
    
    const dates = lecturesList
      .map(l => {
        try {
          return new Date(l.uploadedAt).toISOString().split('T')[0];
        } catch { return null; }
      })
      .filter(Boolean);
    
    const uniqueDates = [...new Set(dates)].sort().reverse();
    if (uniqueDates.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if the most recent activity was today or yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
    
    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i + 1]);
      const diff = (curr - prev) / 86400000;
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const userId = user?.id || 'test-user';
        const [lecRes, subRes] = await Promise.all([
          fetch(`http://localhost:5000/api/study/lectures?t=${Date.now()}`),
          fetch(`http://localhost:5000/api/subjects/user/${userId}?t=${Date.now()}`)
        ]);
        const lecData = await lecRes.json();
        const subData = await subRes.json();
        if (lecData.success) setLectures(lecData.data || []);
        if (subData.success) setSubjects(subData.subjects || []);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Derived stats
  const totalLectures = lectures.length;
  const totalSubjects = subjects.length;
  const streak = calculateStreak(lectures);
  const totalQuestions = lectures.reduce((acc, l) => {
    try {
      const q = typeof l.quizData === 'string' ? JSON.parse(l.quizData) : (l.quizData || []);
      return acc + (Array.isArray(q) ? q.length : 0);
    } catch { return acc; }
  }, 0);

  // Lectures per subject with REAL progress
  // subjects from the API already contain computed totalLectures, completedLectures, completionPercentage
  const subjectStats = subjects.map(sub => {
    const total = sub.totalLectures || 0;
    const completed = sub.completedLectures || 0;
    const progress = sub.completionPercentage || 0;
    return { ...sub, total, completed, progress };
  });

  // Recent lectures (last 4)
  const recentLectures = [...lectures]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 4);

  // Overall progress
  const overallProgress = totalLectures > 0
    ? Math.round((subjectStats.reduce((acc, s) => acc + s.completed, 0) / totalLectures) * 100)
    : 0;

  const subjectColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
    '#10b981', '#06b6d4', '#f59e0b', '#ef4444'
  ];

  if (loading) {
    return (
      <div className={styles.dashboardPage}>
        <TopBar title="مساعد الدراسة الذكي" showBackButton={false} />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <TopBar title="مساعد الدراسة الذكي" showBackButton={false} />

      <main className={styles.dashboardMain}>

        {/* ══ HERO ══════════════════════════════════════════════ */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <p className={styles.heroGreeting}>{getGreeting()}</p>
            <h1 className={styles.heroTitle}>
              {user?.name ? `مرحباً، ${user.name}!` : 'مرحباً بك!'}
            </h1>
            <p className={styles.heroSubtitle}>
              دراسة أذكى، تعلم أسرع، نجاح أكيد ✨
            </p>
            <div className={styles.heroActions}>
              <button className={styles.heroPrimary} onClick={() => navigate('/upload')}>
                <Plus size={18} /> رفع محاضرة جديدة
              </button>
              <button className={styles.heroSecondary} onClick={() => navigate('/study')}>
                <BookOpen size={18} /> مراجعة المحاضرات
              </button>
            </div>
          </div>

          {/* Overall circular progress */}
          <div className={styles.heroRight}>
            <div className={styles.overallProgress}>
              <div className={styles.circleWrapper}>
                <CircularProgress value={overallProgress} color="#6366f1" size={120} stroke={10} />
                <div className={styles.circleInner}>
                  <span className={styles.circleValue}>{overallProgress}%</span>
                  <span className={styles.circleLabel}>مكتمل</span>
                </div>
              </div>
              <p className={styles.overallLabel}>التقدم الكلي</p>
            </div>

            {/* Streak */}
            <div className={styles.streakBadge}>
              <Flame size={20} style={{ color: '#f97316' }} />
              <span>{streak} أيام متواصلة 🔥</span>
            </div>
          </div>
        </section>

        {/* ══ STAT CARDS ═══════════════════════════════════════ */}
        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard} style={{ '--accent': '#6366f1', '--accent-bg': 'rgba(99,102,241,0.12)' }}>
              <div className={styles.statIcon}><FileText size={22} /></div>
              <div className={styles.statBody}>
                <p className={styles.statValue}>{totalLectures}</p>
                <p className={styles.statLabel}>محاضرة مرفوعة</p>
              </div>
              <div className={styles.statGlow} />
            </div>

            <div className={styles.statCard} style={{ '--accent': '#10b981', '--accent-bg': 'rgba(16,185,129,0.12)' }}>
              <div className={styles.statIcon}><LayoutGrid size={22} /></div>
              <div className={styles.statBody}>
                <p className={styles.statValue}>{totalSubjects}</p>
                <p className={styles.statLabel}>مادة دراسية</p>
              </div>
              <div className={styles.statGlow} />
            </div>

            <div className={styles.statCard} style={{ '--accent': '#f59e0b', '--accent-bg': 'rgba(245,158,11,0.12)' }}>
              <div className={styles.statIcon}><Brain size={22} /></div>
              <div className={styles.statBody}>
                <p className={styles.statValue}>{totalQuestions}</p>
                <p className={styles.statLabel}>سؤال تدريبي</p>
              </div>
              <div className={styles.statGlow} />
            </div>

            <div className={styles.statCard} style={{ '--accent': '#ec4899', '--accent-bg': 'rgba(236,72,153,0.12)' }}>
              <div className={styles.statIcon}><Flame size={22} /></div>
              <div className={styles.statBody}>
                <p className={styles.statValue}>{streak}</p>
                <p className={styles.statLabel}>أيام الدراسة المتواصلة</p>
              </div>
              <div className={styles.statGlow} />
            </div>
          </div>
        </section>

        {/* ══ SUBJECTS PROGRESS ════════════════════════════════ */}
        {subjectStats.length > 0 && (
          <section className={styles.progressSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Target size={20} /> تقدمك في المواد
              </h2>
              <button className={styles.seeAllBtn} onClick={() => navigate('/subjects')}>
                عرض الكل <ChevronRight size={16} />
              </button>
            </div>
            <div className={styles.subjectsProgressGrid}>
              {subjectStats.slice(0, 6).map((sub, idx) => {
                const color = sub.color || subjectColors[idx % subjectColors.length];
                return (
                  <div
                    key={sub.id}
                    className={styles.subjectProgressCard}
                    onClick={() => navigate('/study')}
                    style={{ '--sub-color': color }}
                  >
                    <div className={styles.subjectProgressTop}>
                      <div className={styles.subjectInfo}>
                        <span className={styles.subjectDot} style={{ background: color }} />
                        <span className={styles.subjectName}>{sub.name}</span>
                      </div>
                      <span className={styles.subjectPercent}>{sub.progress}%</span>
                    </div>
                    <LinearBar value={sub.progress} color={color} />
                    <div className={styles.subjectMeta}>
                      <span>{sub.total} محاضرة</span>
                      <span>{sub.completed} مكتملة</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ RECENT LECTURES ══════════════════════════════════ */}
        {recentLectures.length > 0 && (
          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Clock size={20} /> آخر المحاضرات المرفوعة
              </h2>
              <button className={styles.seeAllBtn} onClick={() => navigate('/study')}>
                عرض الكل <ChevronRight size={16} />
              </button>
            </div>
            <div className={styles.recentGrid}>
              {recentLectures.map((lec, idx) => {
                const sub = subjects.find(s => s.id === lec.subjectId);
                const color = sub?.color || subjectColors[idx % subjectColors.length];
                return (
                  <div
                    key={lec.id}
                    className={styles.recentCard}
                    onClick={() => navigate('/study')}
                    style={{ '--card-accent': color }}
                  >
                    <div className={styles.recentCardIcon} style={{ background: `${color}22`, color }}>
                      <BookOpen size={20} />
                    </div>
                    <div className={styles.recentCardBody}>
                      <h4 className={styles.recentCardTitle}>{lec.title || lec.fileName?.replace('.pdf', '')}</h4>
                      {sub && <span className={styles.recentCardSubject} style={{ color }}>{sub.name}</span>}
                      <p className={styles.recentCardDate}>
                        {lec.uploadedAt ? new Date(parseInt(lec.uploadedAt)).toLocaleDateString('ar-EG') : '---'}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══ QUICK ACTIONS ════════════════════════════════════ */}
        <section className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>
            <Zap size={20} /> إجراءات سريعة
          </h2>
          <div className={styles.actionsGrid}>
            {[
              { icon: <Upload size={24} />, label: 'رفع محاضرة', sub: 'أضف PDF جديد', route: '/upload', color: '#6366f1' },
              { icon: <BookOpen size={24} />, label: 'مراجعة الشروحات', sub: 'اقرأ ملخصاتك', route: '/study', color: '#10b981' },
              { icon: <Award size={24} />, label: 'ابدأ اختبار', sub: 'اختبر معلوماتك', route: '/quiz', color: '#f59e0b' },
              { icon: <MessageCircle size={24} />, label: 'اسأل المساعد', sub: 'تحدث مع الذكاء الاصطناعي', route: '/chat', color: '#ec4899' },
              { icon: <LayoutGrid size={24} />, label: 'إدارة المواد', sub: 'أضف أو احذف مادة', route: '/subjects', color: '#8b5cf6' },
              { icon: <TrendingUp size={24} />, label: 'إحصائياتك', sub: 'تابع تقدمك', route: '/', color: '#06b6d4' },
            ].map((action) => (
              <button
                key={action.route + action.label}
                className={styles.actionCard}
                onClick={() => navigate(action.route)}
                style={{ '--action-color': action.color }}
              >
                <div className={styles.actionIcon} style={{ color: action.color, background: `${action.color}18` }}>
                  {action.icon}
                </div>
                <div className={styles.actionBody}>
                  <p className={styles.actionLabel}>{action.label}</p>
                  <p className={styles.actionSub}>{action.sub}</p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)' }} />
              </button>
            ))}
          </div>
        </section>

        {/* ══ MOTIVATION BANNER ════════════════════════════════ */}
        <section className={styles.motivationBanner}>
          <Star size={20} style={{ color: '#fbbf24' }} />
          <p>"العلم نور، والجهل ظلام. كل محاضرة تقرأها خطوة نحو النجاح!"</p>
          <Star size={20} style={{ color: '#fbbf24' }} />
        </section>

      </main>
      <HomeButton />
    </div>
  );
}
