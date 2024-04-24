const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Availability = require('../models/Availability');
const { body, validationResult} = require('express-validator');
const Shift = require('../models/Shift');

// ROUTE 1: Get all the notes using GET "/api/notes/fetchallnotes" Login required
router.get('/availability',fetchuser, async (req, res)=>{
    try {
        const available = await Availability.find({user: req.user.id});
        res.json(available)    
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

// ROUTE 2: Add a New Note using POST "/api/notes/addnote" Login required
router.post('/availability',fetchuser, async (req, res)=>{

    try {
    
    let{date, startTime, endTime} = req.body;
    // if there are error return bad request and error
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

     startTime = date+"T"+startTime+":00Z"
     endTime = date+"T"+endTime+":00Z"

    const available = new Availability({
        date, startTime, endTime, user: req.user.id
    })

    const saveAvailablility = await available.save()

    res.json({success:true, saveAvailablility}) 
        
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})

router.get('/shifts',fetchuser, async (req, res)=>{
    try {
        const shift = await Shift.find({user: req.user.id});
        res.json(shift)    
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router