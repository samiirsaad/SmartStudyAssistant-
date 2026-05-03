const fs = require('fs');
const path = require('path');

const CSV_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(CSV_DIR, 'users.csv');
const LECTURES_FILE = path.join(CSV_DIR, 'lectures.csv');
const SUBJECTS_FILE = path.join(CSV_DIR, 'subjects.csv');

// Ensure data directory exists
if (!fs.existsSync(CSV_DIR)) {
    fs.mkdirSync(CSV_DIR, { recursive: true });
}

// Initialize CSV files if they don't exist
const initializeCSVs = () => {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, 'id,name,email,password,createdAt\n');
    }
    if (!fs.existsSync(LECTURES_FILE)) {
        fs.writeFileSync(LECTURES_FILE, 'id,userId,subjectId,fileName,filePath,title,weekNumber,summary,quizData,uploadedAt\n');
    } else {
        // Migration: Check if lectures.csv has the old 7 columns and fix it
        const content = fs.readFileSync(LECTURES_FILE, 'utf8');
        const firstLine = content.split('\n')[0].trim();
        if (firstLine === 'id,userId,fileName,filePath,summary,quizData,uploadedAt') {
            console.log('🔄 Migrating lectures.csv to new format...');
            const lines = content.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length > 0);
            const newLines = ['id,userId,subjectId,fileName,filePath,title,weekNumber,summary,quizData,uploadedAt'];
            
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i]);
                if (values.length >= 7) {
                    const [id, userId, fileName, filePath, summary, quizData, uploadedAt] = values;
                    // Add missing fields: subjectId (default to ML), title, weekNumber
                    const subjectId = '1777815451520'; // Default subject ID
                    const title = fileName;
                    const weekNumber = '1';
                    
                    const row = [id, userId, subjectId, fileName, filePath, title, weekNumber, summary, quizData, uploadedAt]
                        .map(f => {
                            let str = String(f || '');
                            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                                return '"' + str.replace(/"/g, '""') + '"';
                            }
                            return str;
                        }).join(',');
                    newLines.push(row);
                }
            }
            fs.writeFileSync(LECTURES_FILE, newLines.join('\n') + '\n');
            console.log('✅ Migration complete!');
        }
    }
    if (!fs.existsSync(SUBJECTS_FILE)) {
        fs.writeFileSync(SUBJECTS_FILE, 'id,userId,name,description,color,completedLectures,totalQuizzes,avgScore,status,createdAt\n');
    }
};

// Parse CSV line respecting quoted fields
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Escaped quote - add single quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            // Field separator
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current);
    return values;
};

// Read CSV file
const readCSV = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    // Handle both \r\n and \n line endings
    const lines = content.replace(/\r\n/g, '\n').trim().split('\n');
    if (lines.length <= 1) return [];
    
    const headers = parseCSVLine(lines[0]).map(h => h.trim());
    return lines.slice(1)
        .filter(line => line.trim().length > 0) // Skip empty lines
        .map(line => {
            const values = parseCSVLine(line);
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = (values[i] || '').trim();
            });
            return obj;
        })
        .filter(obj => obj.id && obj.id.length > 0); // Skip entries with no ID
};

// Write CSV file
const writeCSV = (filePath, data, headers) => {
    const headerLine = headers.join(',');
    const dataLines = data.map(row => 
        headers.map(header => {
            // Escape commas and quotes in fields
            let val = row[header] || '';
            if (typeof val === 'object') val = JSON.stringify(val);
            if (val.includes(',') || val.includes('"')) {
                val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        }).join(',')
    );
    fs.writeFileSync(filePath, headerLine + '\n' + dataLines.join('\n') + '\n');
};

// User operations
const addUser = (user) => {
    initializeCSVs();
    const users = readCSV(USERS_FILE);
    user.id = Date.now().toString();
    user.createdAt = new Date().toISOString();
    users.push(user);
    writeCSV(USERS_FILE, users, ['id', 'name', 'email', 'password', 'createdAt']);
    return user;
};

const findUserByEmail = (email) => {
    initializeCSVs();
    const users = readCSV(USERS_FILE);
    return users.find(u => u.email === email);
};

const getAllUsers = () => {
    initializeCSVs();
    return readCSV(USERS_FILE);
};

// Lecture operations
const addLecture = (lecture) => {
    initializeCSVs();
    const lectures = readCSV(LECTURES_FILE);
    lecture.id = Date.now().toString();
    lecture.uploadedAt = new Date().toISOString();
    // Store quiz data as JSON string since CSV doesn't handle arrays well
    if (typeof lecture.quizData !== 'string') {
        lecture.quizData = JSON.stringify(lecture.quizData || []);
    }
    lectures.push(lecture);
    const headers = ['id', 'userId', 'subjectId', 'fileName', 'filePath', 'title', 'weekNumber', 'summary', 'quizData', 'uploadedAt'];
    writeCSV(LECTURES_FILE, lectures, headers);
    return lecture;
};

const getLecturesByUserId = (userId) => {
    initializeCSVs();
    const lectures = readCSV(LECTURES_FILE);
    return lectures.filter(l => l.userId === userId).map(l => ({
        ...l,
        quizData: typeof l.quizData === 'string' ? JSON.parse(l.quizData || '[]') : l.quizData
    }));
};

const getAllLectures = () => {
    initializeCSVs();
    const lectures = readCSV(LECTURES_FILE);
    return lectures.map(l => ({
        ...l,
        quizData: typeof l.quizData === 'string' ? JSON.parse(l.quizData || '[]') : l.quizData
    }));
};

// Subject operations
const addSubject = (subject) => {
    initializeCSVs();
    const subjects = readCSV(SUBJECTS_FILE);
    subject.id = Date.now().toString();
    subject.createdAt = new Date().toISOString();
    subjects.push(subject);
    writeCSV(SUBJECTS_FILE, subjects, ['id', 'userId', 'name', 'description', 'color', 'completedLectures', 'totalQuizzes', 'avgScore', 'status', 'createdAt']);
    return subject;
};

const getSubjectsByUserId = (userId) => {
    initializeCSVs();
    return readCSV(SUBJECTS_FILE).filter(s => s.userId === userId);
};

const getSubjectById = (id) => {
    initializeCSVs();
    return readCSV(SUBJECTS_FILE).find(s => String(s.id) === String(id));
};

const updateSubject = (id, updates) => {
    initializeCSVs();
    let subjects = readCSV(SUBJECTS_FILE);
    const index = subjects.findIndex(s => String(s.id) === String(id));
    if (index === -1) return null;
    subjects[index] = { ...subjects[index], ...updates };
    writeCSV(SUBJECTS_FILE, subjects, ['id', 'userId', 'name', 'description', 'color', 'completedLectures', 'totalQuizzes', 'avgScore', 'status', 'createdAt']);
    return subjects[index];
};

const deleteSubject = (id) => {
    initializeCSVs();
    let subjects = readCSV(SUBJECTS_FILE);
    const initialLength = subjects.length;
    subjects = subjects.filter(s => String(s.id) !== String(id));
    if (subjects.length !== initialLength) {
        writeCSV(SUBJECTS_FILE, subjects, ['id', 'userId', 'name', 'description', 'color', 'completedLectures', 'totalQuizzes', 'avgScore', 'status', 'createdAt']);
        return true;
    }
    return false;
};

const getLecturesBySubjectId = (subjectId) => {
    initializeCSVs();
    const lectures = readCSV(LECTURES_FILE);
    return lectures
        .filter(l => String(l.subjectId).trim() === String(subjectId).trim())
        .map(l => {
            let parsedQuiz = [];
            try {
                parsedQuiz = typeof l.quizData === 'string' ? JSON.parse(l.quizData || '[]') : (l.quizData || []);
            } catch (e) {
                parsedQuiz = [];
            }
            return { ...l, quizData: parsedQuiz };
        });
};

// Initialize on module load
initializeCSVs();

const deleteLecture = (id) => {
    initializeCSVs();
    const lectures = readCSV(LECTURES_FILE);
    const initialLength = lectures.length;
    const updatedLectures = lectures.filter(l => String(l.id) !== String(id));
    
    if (initialLength !== updatedLectures.length) {
        // Use comprehensive headers to preserve all data
        const headers = ['id', 'userId', 'subjectId', 'fileName', 'filePath', 'title', 'weekNumber', 'summary', 'quizData', 'uploadedAt'];
        writeCSV(LECTURES_FILE, updatedLectures, headers);
        return true;
    }
    return false;
};

module.exports = {
    addUser,
    findUserByEmail,
    getAllUsers,
    addLecture,
    getLecturesByUserId,
    getAllLectures,
    deleteLecture,
    addSubject,
    getSubjectsByUserId,
    getSubjectById,
    updateSubject,
    deleteSubject,
    getLecturesBySubjectId
};
