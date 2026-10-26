const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, isAdmin } = require('../middleware/auth');
const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const RoomNumber = require('../models/RoomNumber');
const Role = require('../models/Role');
const User = require('../models/User');
const mockStore = require('../mockStore');

// Apply auth to all routes, isAdmin only to modifications
router.use(auth);

// Helper for generic CRUD (optional, but let's be specific for clarity)

// --- Department ---
router.post('/departments', isAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const dept = new Department(req.body);
            await dept.save();
            return res.status(201).send(dept);
        }
        const newDept = { _id: '6600000000000000000000' + Math.floor(Math.random() * 899 + 100), ...req.body };
        mockStore.departments.push(newDept);
        res.status(201).send(newDept);
    } catch (e) { res.status(400).send(e); }
});

router.get('/departments', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const depts = await Department.find({});
            return res.send(depts);
        }
        res.send(mockStore.departments);
    } catch (e) { res.status(500).send(e); }
});

router.put('/departments/:id', isAdmin, async (req, res) => {
    try {
        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!dept) return res.status(404).send();
        res.send(dept);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/departments/:id', isAdmin, async (req, res) => {
    try {
        const dept = await Department.findByIdAndDelete(req.params.id);
        if (!dept) return res.status(404).send();
        res.send(dept);
    } catch (e) { res.status(500).send(e); }
});

// --- Programme ---
router.post('/programmes', isAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const prog = new Programme(req.body);
            await prog.save();
            const populated = await Programme.findById(prog._id).populate('department');
            return res.status(201).send(populated || prog);
        }
        const deptObj = mockStore.departments.find(d => d._id === req.body.department || d.name === req.body.department) || mockStore.departments[0];
        const newProg = {
            _id: '6600000000000000000000' + Math.floor(Math.random() * 899 + 100),
            name: req.body.name,
            code: req.body.code || req.body.name?.slice(0, 4).toUpperCase(),
            department: deptObj
        };
        mockStore.programmes.push(newProg);
        res.status(201).send(newProg);
    } catch (e) { res.status(400).send(e); }
});

router.get('/programmes', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const progs = await Programme.find({}).populate('department');
            return res.send(progs);
        }
        res.send(mockStore.programmes);
    } catch (e) { res.status(500).send(e); }
});

router.put('/programmes/:id', isAdmin, async (req, res) => {
    try {
        const prog = await Programme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!prog) return res.status(404).send();
        res.send(prog);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/programmes/:id', isAdmin, async (req, res) => {
    try {
        const prog = await Programme.findByIdAndDelete(req.params.id);
        if (!prog) return res.status(404).send();
        res.send(prog);
    } catch (e) { res.status(500).send(e); }
});

// --- Block ---
router.post('/blocks', isAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const block = new Block(req.body);
            await block.save();
            return res.status(201).send(block);
        }
        const newBlock = { _id: '6600000000000000000000' + Math.floor(Math.random() * 899 + 100), ...req.body };
        mockStore.blocks.push(newBlock);
        res.status(201).send(newBlock);
    } catch (e) { res.status(400).send(e); }
});

router.get('/blocks', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const blocks = await Block.find({}).populate('department programme');
            return res.send(blocks);
        }
        res.send(mockStore.blocks);
    } catch (e) { res.status(500).send(e); }
});

router.put('/blocks/:id', isAdmin, async (req, res) => {
    try {
        const block = await Block.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!block) return res.status(404).send();
        res.send(block);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/blocks/:id', isAdmin, async (req, res) => {
    try {
        const block = await Block.findByIdAndDelete(req.params.id);
        if (!block) return res.status(404).send();
        res.send(block);
    } catch (e) { res.status(500).send(e); }
});

// --- Room Number ---
router.post('/rooms', isAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const room = new RoomNumber(req.body);
            await room.save();
            return res.status(201).send(room);
        }
        const newRoom = { _id: '6600000000000000000000' + Math.floor(Math.random() * 899 + 100), ...req.body };
        mockStore.rooms.push(newRoom);
        res.status(201).send(newRoom);
    } catch (e) { res.status(400).send(e); }
});

router.get('/rooms', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const rooms = await RoomNumber.find({}).populate('department programme block');
            return res.send(rooms);
        }
        res.send(mockStore.rooms);
    } catch (e) { res.status(500).send(e); }
});

router.put('/rooms/:id', isAdmin, async (req, res) => {
    try {
        const room = await RoomNumber.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).send();
        res.send(room);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/rooms/:id', isAdmin, async (req, res) => {
    try {
        const room = await RoomNumber.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).send();
        res.send(room);
    } catch (e) { res.status(500).send(e); }
});

// --- Role ---
router.post('/roles', isAdmin, async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        res.status(201).send(role);
    } catch (e) { res.status(400).send(e); }
});

router.get('/roles', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const roles = await Role.find({});
            return res.send(roles);
        }
        res.send(mockStore.roles);
    } catch (e) { res.status(500).send(e); }
});

router.put('/roles/:id', isAdmin, async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!role) return res.status(404).send();
        res.send(role);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/roles/:id', isAdmin, async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).send();
        res.send(role);
    } catch (e) { res.status(500).send(e); }
});

// --- User Screen (Management) ---
router.post('/users', isAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const user = new User(req.body);
            await user.save();
            const populated = await User.findById(user._id).populate('role department programme');
            return res.status(201).send(populated || user);
        }
        const roleObj = mockStore.roles.find(r => r._id === req.body.role || r.name === req.body.role) || mockStore.roles[1];
        const deptObj = mockStore.departments.find(d => d._id === req.body.department || d.name === req.body.department) || mockStore.departments[0];
        const newUser = {
            _id: '6600000000000000000000' + Math.floor(Math.random() * 899 + 100),
            username: req.body.username,
            email: req.body.email || `${req.body.username}@tms.com`,
            role: roleObj,
            department: deptObj,
            phone: req.body.phone || '9876543210'
        };
        mockStore.users.push({ ...newUser, password: req.body.password || 'password123' });
        res.status(201).send(newUser);
    } catch (e) { res.status(400).send(e); }
});

router.get('/users', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const users = await User.find({}).populate('role department programme');
            return res.send(users);
        }
        const safeUsers = mockStore.users.map(u => {
            const copy = { ...u };
            delete copy.password;
            return copy;
        });
        res.send(safeUsers);
    } catch (e) { res.status(500).send(e); }
});

router.put('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send();

        Object.keys(req.body).forEach((update) => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send();
        res.send(user);
    } catch (e) { res.status(500).send(e); }
});

module.exports = router;
