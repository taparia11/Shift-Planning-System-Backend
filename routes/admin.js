const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Availability = require('../models/Availability');
const Shift = require('../models/Shift');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get employee's list
router.get('/availability', fetchuser, async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'Admin' } });
        res.json(users)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Get employee availability using id
router.get('/availability/:id', fetchuser, async (req, res) => {
    try {
        const available = await Availability.find({ user: req.params.id });
        res.json(available);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 3: Get employee available during perticular period 
router.post('/shiftavailability', fetchuser, async (req, res) => {
    try {
        // find the note to be updated and update it
        let { date, startTime, endTime } = req.body;
        startTime = date + "T" + startTime + ":00Z"
        endTime = date + "T" + endTime + ":00Z"

        const available = await Availability.find({ date: date });
        const employee = await User.find();
        available.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        const userStartTime = new Date(startTime);
        const userEndTime = new Date(endTime);

        // Filter data between user-provided startTime and endTime
        const filteredData = available.filter(entry => {
            const entryStartTime = new Date(entry.startTime);
            const entryEndTime = new Date(entry.endTime);
            return (entryStartTime >= userStartTime && entryStartTime <= userEndTime) || (entryEndTime <= userEndTime && entryEndTime >= userStartTime) ||
                (entryStartTime <= userStartTime && entryEndTime >= userEndTime) || (entryStartTime >= userStartTime && entryEndTime <= userEndTime);
        });
        const employees = filteredData.map(item => {
            const matchingUser = employee.find(obj => obj._id == `${item.user}`);
            return {
                _id: item.user,
                name: matchingUser ? matchingUser.name : "unknown"
            };
        });
        if (employees.length === 0) {
            res.json({ success: false })
        }
        else {
            res.json({ success: true, employees });

        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 4: Assign a shift to employee
router.post('/shift', fetchuser, async (req, res) => {
    try {
        let { date, startTime, endTime, user } = req.body;
        let start = startTime
        let end = endTime
        startTime = date + "T" + startTime + ":00Z"
        endTime = date + "T" + endTime + ":00Z"

        const shift = new Shift({
            user, date, startTime, endTime
        })
        start = new Date(startTime);
        end = new Date(endTime);

        const prevAvailable = await Shift.find({ date: date });

        if (prevAvailable && prevAvailable.length > 0) {
            for (let i = 0; i < prevAvailable.length; i++) {
                const existingShiftStart = new Date(prevAvailable[i].startTime);
                const existingShiftEnd = new Date(prevAvailable[i].endTime);
                console.log(start)
                console.log(end)
                console.log(existingShiftStart)
                console.log(existingShiftEnd)
                console.log("Hi")
                if ((start >= existingShiftStart && start <= existingShiftEnd) || (start >= existingShiftStart && end <= existingShiftEnd) ||
                    (end >= existingShiftStart && end <= existingShiftEnd) || (start <= existingShiftStart && end >= existingShiftEnd) 
                    ) {
                    res.json({ success: false, msg: "Already assigned free slot in this range" });
                    return; // Exit the function early since we found an overlap
                }
            }
            const saveShift = await shift.save()
            res.json({ success: true, saveShift })
        }

        else {
            const saveShift = await shift.save()
            res.json({ success: true, saveShift })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router