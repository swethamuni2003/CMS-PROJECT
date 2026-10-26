const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { auth, isAdmin } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const mockStore = require('../mockStore');

// Raise a complaint (User and SuperAdmin)
router.post('/raise', auth, async (req, res) => {
    try {
        const deptName = req.body.department || 
            (req.user?.department?.name || req.user?.department) || 
            'Computer Applications (MCA)';

        if (mongoose.connection.readyState === 1) {
            const complaint = new Complaint({
                ...req.body,
                raisedBy: req.user._id,
                department: deptName
            });
            await complaint.save();
            return res.status(201).send(complaint);
        }

        // Offline fallback
        const newComplaint = {
            _id: '6600000000000000000000' + Math.floor(Math.random() * 899 + 100),
            ...req.body,
            department: deptName,
            block: mockStore.blocks.find(b => b._id === req.body.block) || { name: 'Main Block' },
            roomNumber: mockStore.rooms.find(r => r._id === req.body.roomNumber) || { number: '101' },
            raisedBy: req.user,
            assignedTo: null,
            status: 'Pending',
            createdAt: new Date().toISOString()
        };
        mockStore.complaints.unshift(newComplaint);
        res.status(201).send(newComplaint);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get Dashboard Stats
router.get('/dashboard', auth, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const query = {};
            if (req.user.role.name === 'User') {
                query.raisedBy = req.user._id;
            } else if (req.user.role.name !== 'SuperAdmin') {
                query.assignedTo = req.user._id;
            }

            const total = await Complaint.countDocuments(query);
            const pending = await Complaint.countDocuments({ ...query, status: 'Pending' });
            const assigned = await Complaint.countDocuments({ ...query, status: 'Assigned' });
            const completed = await Complaint.countDocuments({ ...query, status: 'Completed' });
            const closed = await Complaint.countDocuments({ ...query, status: 'Closed' });

            return res.send({ total, pending, assigned, completed, closed });
        }

        // Offline fallback
        const cList = mockStore.complaints;
        res.send({
            total: cList.length,
            pending: cList.filter(c => c.status === 'Pending').length,
            assigned: cList.filter(c => c.status === 'Assigned').length,
            completed: cList.filter(c => c.status === 'Completed').length,
            closed: cList.filter(c => c.status === 'Closed').length
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Complaints List
router.get('/list', auth, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            let query = {};
            if (req.user.role.name === 'User') {
                query.raisedBy = req.user._id;
            } else if (req.user.role.name === 'SuperAdmin') {
                // Can see all
            } else {
                query.assignedTo = req.user._id;
            }

            const complaints = await Complaint.find(query)
                .populate('block roomNumber raisedBy assignedTo')
                .sort({ createdAt: -1 });
            return res.send(complaints);
        }

        // Offline fallback
        res.send(mockStore.complaints);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Assign Complaint (SuperAdmin only)
router.patch('/assign/:id', auth, isAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const complaint = await Complaint.findByIdAndUpdate(
                req.params.id,
                { assignedTo: req.body.assignedTo, status: 'Assigned' },
                { new: true }
            );
            return res.send(complaint);
        }

        const c = mockStore.complaints.find(x => x._id === req.params.id);
        if (c) {
            const staffUser = mockStore.users.find(u => u._id === req.body.assignedTo);
            c.assignedTo = staffUser || { username: 'Staff Technician' };
            c.status = 'Assigned';
            return res.send(c);
        }
        res.status(404).send({ error: 'Complaint not found' });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Update Status (Technician / Staff / SuperAdmin)
router.patch('/status/:id', auth, async (req, res) => {
    try {
        const allowedStatuses = ['In-Progress', 'OnHold', 'Completed'];
        if (req.user.role.name === 'SuperAdmin') allowedStatuses.push('Closed');

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).send({ error: 'Invalid status update' });
        }

        if (mongoose.connection.readyState === 1) {
            const query = { _id: req.params.id };
            if (req.user.role.name !== 'SuperAdmin') {
                query.assignedTo = req.user._id;
            }

            const complaint = await Complaint.findOneAndUpdate(
                query,
                { status: req.body.status },
                { new: true }
            );

            if (!complaint) return res.status(404).send({ error: 'Complaint not found or not assigned to you' });
            return res.send(complaint);
        }

        const c = mockStore.complaints.find(x => x._id === req.params.id);
        if (c) {
            c.status = req.body.status;
            return res.send(c);
        }
        res.status(404).send({ error: 'Complaint not found' });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Report Generation (SuperAdmin only)
router.get('/report', auth, isAdmin, async (req, res) => {
    try {
        const { department, programme, type, status, assignee } = req.query;
        if (mongoose.connection.readyState === 1) {
            let query = {};
            if (department) query.department = department;
            if (programme) query.programme = programme;
            if (type) query.type = type;
            if (status) query.status = status;
            if (assignee) query.assignedTo = assignee;

            const reports = await Complaint.find(query)
                .populate('block roomNumber raisedBy assignedTo')
                .sort({ createdAt: -1 });
            return res.send(reports);
        }

        let filtered = [...mockStore.complaints];
        if (type) filtered = filtered.filter(c => c.type === type);
        if (status) filtered = filtered.filter(c => c.status === status);
        res.send(filtered);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Delete Complaint (SuperAdmin only)
router.delete('/delete/:id', auth, isAdmin, async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const complaint = await Complaint.findByIdAndDelete(req.params.id);
            if (!complaint) {
                return res.status(404).send({ error: 'Complaint not found' });
            }
            return res.send(complaint);
        }

        const idx = mockStore.complaints.findIndex(x => x._id === req.params.id);
        if (idx !== -1) {
            const removed = mockStore.complaints.splice(idx, 1)[0];
            return res.send(removed);
        }
        res.status(404).send({ error: 'Complaint not found' });
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
