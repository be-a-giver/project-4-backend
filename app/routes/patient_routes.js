// Express
const express = require('express')
// Passport 
const passport = require('passport')
// pull in Mongoose model for  Patient
const Patient = require('../models/patient')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// INDEX
// GET /Patient
router.get('/patients', requireToken, (req, res, next) => {
  
  // Option 1 get user's Patients
  Patient.find({owner: req.user.id})
    .then(patients => res.status(200).json({patients: patients}))
    .catch(next)
})

// SHOW
// GET /Patients/5a7db6c74d55bc51bdf39793
router.get('/patients/:id', requireToken, (req, res, next) => {
  Patient.findById(req.params.id)
    .then(handle404)
    .then(patient => {
      requireOwnership(req, patient)
      res.status(200).json({ patient: patient.toObject() })

    }).catch(next)
})

// CREATE
// POST /Patient
router.post('/patients', requireToken, (req, res, next) => {
  req.body.patient.owner = req.user.id
  Patient.create(req.body.patient)
    .then(patient => {
      res.status(201).json({ patient: patient.toObject() })
    })
    .catch(next)
})

// UPDATE
// PATCH /Patients/5a7db6c74d55bc51bdf39793
   router.put('/patients/:id', requireToken, removeBlanks, (req, res, next) => {
   delete req.body.patient.owner
   Patient.findById(req.params.id)
    .then(handle404)
    .then(patient => {
      requireOwnership(req, patient)
      return patient.update(req.body.patient)

    }).then(() => res.sendStatus(204)
    
    ).catch(next)
})

// DESTROY
// DELETE /Patient/5a7db6c74d55bc51bdf39793
router.delete('/patients/:id', requireToken, (req, res, next) => {
  Patient.findById(req.params.id)
    .then(handle404)
    .then(Patient => {
       requireOwnership(req, Patient)
       Patient.remove()

    }).then(() => res.sendStatus(204)
    ).catch(next)
})

 module.exports = router
