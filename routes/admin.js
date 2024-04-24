const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Availability = require('../models/Availability');
const Shift = require('../models/Shift');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');


router.get('/availability', fetchuser, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.get('/availability/:id', fetchuser, async (req, res) => {
    try {
        // find the note to be updated and update it
        const available = await Availability.find({ user: req.params.id });
        res.json(available);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

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
            return entryStartTime >= userStartTime || entryEndTime <= userEndTime;
        });
        const employees = filteredData.map(item => {
            const matchingUser = employee.find(obj => obj._id == `${item.user}`);
            return {
                _id: item.user,
                name: matchingUser ? matchingUser.name : "unknown"
            };
        });
        res.json({ success: true, employees });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.post('/shift', fetchuser, async (req, res) => {
    try {
        // find the note to be updated and update it
        let { date, startTime, endTime, user } = req.body;
        startTime = date + "T" + startTime + ":00Z"
        endTime = date + "T" + endTime + ":00Z"

        const shift = new Shift({
            user, date, startTime, endTime
        })
    
        const saveShift = await shift.save()
    
        res.json({success:true, saveShift}) 
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2: Add a New Note using POST "/api/notes/addnote" Login required
// router.post('/availability',fetchuser, async (req, res)=>{

//     try {

//     let{date, startTime, endTime} = req.body;
//     // if there are error return bad request and error
//     const errors = validationResult(req);
//     if(!errors.isEmpty()){
//         return res.status(400).json({errors:errors.array()});
//     }

//      startTime = date+"T"+startTime+":00Z"
//      endTime = date+"T"+endTime+":00Z"

//     const available = new Availability({
//         date, startTime, endTime, user: req.user.id
//     })

//     const saveAvailablility = await available.save()

//     res.json({success:true, saveAvailablility}) 

// } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Internal Server Error");
// }
// })

module.exports = router