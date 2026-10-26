const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const mockStore = require('../mockStore');

// Login route with auto-seed and fallback
router.post('/login', async (req, res) => {
    try {
        const cleanUsername = (req.body.username || '').trim().toLowerCase();
        const cleanPassword = (req.body.password || '').trim();
        console.log(`Login attempt for username: "${cleanUsername}"`);

        // Case A: MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            let user = await User.findOne({ username: new RegExp('^' + cleanUsername + '$', 'i') }).populate('role department programme');
            
            // Auto-seed default accounts if missing from DB
            if (!user) {
                const defaultMatch = mockStore.users.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);
                if (defaultMatch) {
                    console.log(`Auto-seeding missing user "${cleanUsername}" into MongoDB...`);
                    let role = await Role.findOne({ name: defaultMatch.role.name });
                    if (!role) {
                        role = new Role({ name: defaultMatch.role.name });
                        await role.save();
                    }
                    user = new User({
                        username: defaultMatch.username,
                        password: defaultMatch.password,
                        email: defaultMatch.email,
                        role: role._id
                    });
                    await user.save();
                    user = await User.findById(user._id).populate('role department programme');
                }
            }

            if (user && (await user.comparePassword(cleanPassword))) {
                const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || mockStore.JWT_SECRET);
                return res.send({ user, token });
            }
        }

        // Case B: MongoDB is disconnected or offline fallback
        const mockUser = mockStore.users.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);
        if (mockUser) {
            console.log(`Authenticated "${cleanUsername}" using built-in system store`);
            const token = jwt.sign({ _id: mockUser._id }, process.env.JWT_SECRET || mockStore.JWT_SECRET);
            const userCopy = { ...mockUser };
            delete userCopy.password;
            return res.send({ user: userCopy, token });
        }

        return res.status(400).send({ error: 'Invalid login credentials' });
    } catch (error) {
        console.error('Login error:', error);
        
        const cleanUsername = (req.body.username || '').trim().toLowerCase();
        const cleanPassword = (req.body.password || '').trim();
        const mockUser = mockStore.users.find(u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword);
        if (mockUser) {
            const token = jwt.sign({ _id: mockUser._id }, process.env.JWT_SECRET || mockStore.JWT_SECRET);
            const userCopy = { ...mockUser };
            delete userCopy.password;
            return res.send({ user: userCopy, token });
        }

        res.status(400).send({ error: 'Invalid login credentials' });
    }
});

// Initial SuperAdmin creation
router.post('/setup-admin', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            let adminRole = await Role.findOne({ name: 'SuperAdmin' });
            if (!adminRole) {
                adminRole = new Role({ name: 'SuperAdmin' });
                await adminRole.save();
            }

            let existingAdmin = await User.findOne({ username: 'admin' });
            if (!existingAdmin) {
                const user = new User({
                    username: 'admin',
                    password: 'adminpassword',
                    email: 'admin@tms.com',
                    role: adminRole._id
                });
                await user.save();
                return res.status(201).send({ message: 'SuperAdmin created successfully', user });
            }
            return res.status(400).send({ error: 'SuperAdmin already exists' });
        }
        res.send({ message: 'SuperAdmin available in offline store', user: mockStore.users[0] });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;

