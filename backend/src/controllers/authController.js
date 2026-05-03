const { addUser, findUserByEmail } = require('../services/csvService');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
        }

        // Check if user already exists
        const existingUser = findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'البريد الإلكتروني مستخدم بالفعل' });
        }

        // Create new user
        const newUser = addUser({ name, email, password });
        res.status(201).json({ 
            message: "تم إنشاء الحساب بنجاح",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'البريد والكلمة المرورية مطلوبة' });
        }

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'البريد أو الكلمة المرورية غير صحيحة' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'البريد أو الكلمة المرورية غير صحيحة' });
        }

        res.json({ 
            message: "تم تسجيل الدخول بنجاح",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };