const express = require('express');
const router = express.Router();
const {
    createSubject,
    getUserSubjects,
    getSubjectDetails,
    updateSubjectDetails,
    deleteSubjectHandler
} = require('../controllers/subjectsController');

// Create a new subject
router.post('/', createSubject);

// Get all subjects for a user
router.get('/user/:userId', getUserSubjects);

// Get subject details with lectures
router.get('/:subjectId', getSubjectDetails);

// Update subject
router.put('/:subjectId', updateSubjectDetails);

// Delete subject
router.delete('/:subjectId', deleteSubjectHandler);

module.exports = router;
