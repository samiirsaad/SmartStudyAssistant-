import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { createSubject, getUserSubjects, deleteSubject } from '../services/api';
import { Plus, BookOpen, Trash2, Eye, Settings, ArrowLeft } from 'lucide-react';
import styles from '../styles/Subjects.module.css';

const Subject = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#5b21b6'
    });

    const colors = [
        '#5b21b6', // Purple
        '#0891b2', // Cyan
        '#059669', // Green
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#06b6d4', // Sky
        '#ec4899'  // Pink
    ];

    useEffect(() => {
        if (user?.id) {
            loadSubjects();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const loadSubjects = async () => {
        try {
            setLoading(true);
            const response = await getUserSubjects(user.id);
            setSubjects(response.data.subjects || []);
        } catch (error) {
            console.error('Error loading subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await createSubject(user.id, formData.name, formData.description, formData.color);
            setFormData({ name: '', description: '', color: '#5b21b6' });
            setShowForm(false);
            await loadSubjects();
        } catch (error) {
            console.error('Error creating subject:', error);
            alert('Failed to create subject');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
            try {
                setLoading(true);
                await deleteSubject(subjectId);
                await loadSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
                alert('Failed to delete subject');
            } finally {
                setLoading(false);
            }
        }
    };

    const getCompletionColor = (percentage) => {
        if (percentage >= 80) return '#22c55e';
        if (percentage >= 60) return '#f59e0b';
        if (percentage >= 40) return '#3b82f6';
        return '#ef4444';
    };

    return (
        <div className={styles.subjectsPage} dir="rtl">
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>📚 المواد الدراسية</h1>
                    <p>نظم دراستك حسب المواد</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.backBtn}
                        onClick={() => navigate(-1)}
                        title="Go back"
                    >
                        <ArrowLeft size={18} />
                        رجوع
                    </button>

                    <button
                        className={styles.createBtn}
                        onClick={() => setShowForm(true)}
                        disabled={loading}
                    >
                        <Plus size={20} />
                        مادة جديدة
                    </button>
                </div>
            </div>

            {showForm && (
                <div className={styles.formContainer}>
                    <div className={styles.formCard}>
                        <h2>إنشاء مادة جديدة</h2>
                        <form onSubmit={handleCreateSubject}>
                            <div className={styles.formGroup}>
                                <label>اسم المادة *</label>
                                <input
                                    type="text"
                                    placeholder="مثال: الذكاء الاصطناعي، شبكات، إلخ"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>الوصف</label>
                                <textarea
                                    placeholder="أدخل وصف المادة..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>اللون المميز</label>
                                <div className={styles.colorPicker}>
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={styles.colorOption}
                                            style={{
                                                backgroundColor: color,
                                                border: formData.color === color ? '3px solid white' : 'none'
                                            }}
                                            onClick={() => setFormData({ ...formData, color })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setShowForm(false)}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={loading || !formData.name}
                                >
                                    إنشاء المادة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={styles.subjectsGrid}>
                {loading && subjects.length === 0 ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>جاري تحميل المواد...</p>
                    </div>
                ) : subjects.length === 0 ? (
                    <div className={styles.emptyState}>
                        <BookOpen size={48} />
                        <h3>لا توجد مواد دراسية</h3>
                        <p>قم بإنشاء مادتك الأولى للبدء!</p>
                    </div>
                ) : (
                    subjects.map(subject => (
                        <div
                            key={subject.id}
                            className={styles.subjectCard}
                            style={{ borderLeftColor: subject.color }}
                        >
                            <div className={styles.cardHeader}>
                                <div className={styles.subjectInfo}>
                                    <h3>{subject.name}</h3>
                                    <p className={styles.status}>{subject.status}</p>
                                </div>
                                <div className={styles.cardActions}>
                                    <button
                                        className={styles.viewBtn}
                                        onClick={() => navigate(`/study`)}
                                        title="عرض المحاضرات"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className={styles.deleteBtn}
                                        onClick={() => handleDeleteSubject(subject.id)}
                                        title="حذف المادة"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {subject.description && (
                                <p className={styles.description} title={subject.description}>{subject.description}</p>
                            )}

                            <div className={styles.stats}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>محاضرات</span>
                                    <span className={styles.statValue}>{subject.totalLectures}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>مكتمل</span>
                                    <span className={styles.statValue}>{subject.completedLectures}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>كويزات</span>
                                    <span className={styles.statValue}>{subject.totalQuizzes}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>متوسط</span>
                                    <span className={styles.statValue}>{Math.round(subject.avgScore)}%</span>
                                </div>
                            </div>

                            <div className={styles.progressSection}>
                                <div className={styles.progressHeader}>
                                    <span>التقدم</span>
                                    <span className={styles.percentage}>{subject.completionPercentage}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${subject.completionPercentage}%`,
                                            backgroundColor: getCompletionColor(subject.completionPercentage)
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                className={styles.editBtn}
                                onClick={() => navigate(`/upload?subject=${subject.id}`)}
                            >
                                <Plus size={16} />
                                إضافة محاضرة
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Subject;
