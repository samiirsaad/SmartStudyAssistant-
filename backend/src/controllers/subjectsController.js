const {
    addSubject,
    getSubjectsByUserId,
    getSubjectById,
    updateSubject,
    deleteSubject,
    getLecturesBySubjectId
} = require('../services/csvService');
const fs = require('fs');
const path = require('path');

const QUIZ_RESULTS_FILE = path.join(__dirname, '../../data/quiz_results.csv');

const getAllQuizResults = () => {
    try {
        if (!fs.existsSync(QUIZ_RESULTS_FILE)) return [];
        const content = fs.readFileSync(QUIZ_RESULTS_FILE, 'utf8');
        const lines = content.replace(/\r\n/g, '\n').trim().split('\n');
        if (lines.length <= 1) return [];
        
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h.trim()] = values[i] || '');
            return obj;
        });
    } catch (e) {
        return [];
    }
};

// Create a new subject
const createSubject = (req, res) => {
    try {
        const { userId, name, description, color } = req.body;

        if (!userId || !name) {
            return res.status(400).json({ error: 'User ID and Subject name are required' });
        }

        const subject = addSubject({
            userId,
            name,
            description: description || '',
            color: color || '#5b21b6',
            completedLectures: 0,
            totalQuizzes: 0,
            avgScore: 0,
            status: 'Not Started'
        });

        res.status(201).json({
            success: true,
            message: '✅ Subject created successfully',
            subject
        });
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all subjects for a user — with REAL computed stats
const getUserSubjects = (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const subjects = getSubjectsByUserId(userId);
        const allQuizResults = getAllQuizResults();

        // Calculate real progress for each subject dynamically
        const subjectsWithProgress = subjects.map(subject => {
            const lectures = getLecturesBySubjectId(subject.id);
            const totalLectures = lectures.length;

            const subjectQuizResults = allQuizResults.filter(r => String(r.subjectId).trim() === String(subject.id).trim());
            const completedLectureIds = new Set(subjectQuizResults.map(r => r.lectureId));

            // A lecture is "completed" if the user has taken a quiz for it
            const completedLectures = completedLectureIds.size;

            // Total quiz questions across all lectures
            const totalQuizQuestions = lectures.reduce((sum, l) => {
                return sum + (Array.isArray(l.quizData) ? l.quizData.length : 0);
            }, 0);

            // Completion percentage
            const completionPercentage = totalLectures > 0
                ? Math.round((completedLectures / totalLectures) * 100)
                : 0;

            // Calculate average score
            let avgScore = 0;
            if (subjectQuizResults.length > 0) {
                const totalScore = subjectQuizResults.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0);
                avgScore = Math.round(totalScore / subjectQuizResults.length);
            }

            // Dynamic status in Arabic
            let status = 'لم يبدأ';
            if (completionPercentage >= 100 && totalLectures > 0) status = 'مكتمل ✅';
            else if (completionPercentage > 0) status = 'قيد التقدم 📖';

            console.log(`📊 Subject "${subject.name}": ${totalLectures} lectures, ${completedLectures} completed, ${totalQuizQuestions} quiz Qs, ${completionPercentage}%, Avg: ${avgScore}%`);

            return {
                ...subject,
                totalLectures,
                completedLectures,
                totalQuizzes: subjectQuizResults.length,
                avgScore,
                completionPercentage,
                status
            };
        });

        res.status(200).json({
            success: true,
            subjects: subjectsWithProgress
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get subject details with lectures
const getSubjectDetails = (req, res) => {
    try {
        const { subjectId } = req.params;

        if (!subjectId) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        const subject = getSubjectById(subjectId);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const lectures = getLecturesBySubjectId(subjectId);
        const allQuizResults = getAllQuizResults();
        const subjectQuizResults = allQuizResults.filter(r => String(r.subjectId).trim() === String(subjectId).trim());
        const completedLectureIds = new Set(subjectQuizResults.map(r => r.lectureId));
        
        const completedLectures = completedLectureIds.size;

        const completionPercentage = lectures.length > 0
            ? Math.round((completedLectures / lectures.length) * 100)
            : 0;

        res.status(200).json({
            success: true,
            subject: {
                ...subject,
                lectures,
                totalLectures: lectures.length,
                completedLectures,
                completionPercentage
            }
        });
    } catch (error) {
        console.error('Error fetching subject details:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update subject
const updateSubjectDetails = (req, res) => {
    try {
        const { subjectId } = req.params;
        const updates = req.body;

        if (!subjectId) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        const updated = updateSubject(subjectId, updates);

        if (!updated) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json({
            success: true,
            message: '✅ Subject updated successfully',
            subject: updated
        });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete subject
const deleteSubjectHandler = (req, res) => {
    try {
        const { subjectId } = req.params;

        if (!subjectId) {
            return res.status(400).json({ error: 'Subject ID is required' });
        }

        const deleted = deleteSubject(subjectId);

        if (!deleted) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json({
            success: true,
            message: '✅ Subject deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSubject,
    getUserSubjects,
    getSubjectDetails,
    updateSubjectDetails,
    deleteSubjectHandler
};
