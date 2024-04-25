const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'nikhilji';

//ROUTE 1: Create a user using POST "/api/auth/register" No Login required
router.post('/register', [
    body('name', 'Enter a valid Name').isLength({ min: 1 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('contact', 'Enter a valid Contact').isLength({ min: 10 }),
    body('password', 'Enter a valid Password').isLength({ min: 3 }),

], async (req, res) => {
    const errors = validationResult(req);
    success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, errors: { msg: "Sorry a user with this email already exists" } })
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            contact: req.body.contact,
            role: req.body.role
        });

        const data = {
            user: {
                id: user.id,
                role: user.role
            }
        }
        success = true;
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ success, authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Authenticate a user using POST "/api/auth/login" Login required
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password cannot be blanck').exists(),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Please try to login with correct credentials' });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: 'Please try to login with correct credentials' });
        }

        const data = {
            user: {
                id: user.id,
                role: user.role,
                name: user.name
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal Server error");
    }

})

// ROUTE 3: Get loggedin user details using POST "/api/auth/getuser" Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("internal Server error");
    }
})

module.exports = router