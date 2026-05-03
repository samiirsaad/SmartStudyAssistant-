const fs = require('fs');
const path = require('path');

// Initialize data directory and CSV files
const DATA_DIR = path.join(__dirname, '../../data');

const connectDB = () => {
    try {
        // Ensure data directory exists
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        // Initialize CSV files if they don't exist
        const usersFile = path.join(DATA_DIR, 'users.csv');
        const lecturesFile = path.join(DATA_DIR, 'lectures.csv');

        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(usersFile, 'id,name,email,password,createdAt\n');
        }
        
        if (!fs.existsSync(lecturesFile)) {
            fs.writeFileSync(lecturesFile, 'id,userId,fileName,filePath,summary,quizData,uploadedAt\n');
        }

        console.log('✅ CSV Storage Connected Successfully!');
        console.log(`📁 Data directory: ${DATA_DIR}`);
    } catch (err) {
        console.error('❌ CSV Storage Error:', err.message);
        throw err;
    }
};

module.exports = connectDB;