const express = require('express')
const passport = require('passport')
const Patient = require('../models/patient')
const customErrors = require('../../lib/custom_errors')


const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership


const removeBlanks = require('../../lib/remove_blank_fields')

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// INDEX
// GET /examples
router.get('/patients', requireToken, (req, res, next) => {
 
  Patient.find({owner: req.user.id})
    .then(patients => res.status(200).json({patients: patients}))
    .catch(next)
  
  // // Option 2 get user's examples
  // // must import User model and User model must have virtual for examples
  // User.findById(req.user.id) 
    // .populate('examples')
    // .then(user => res.status(200).json({ examples: user.examples }))
    // .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/patients/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Patient.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "example" JSON
    .then(patient => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, patient)
    
      res.status(200).json({ patient: patient.toObject() })
    })
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /examples
router.post('/patients', requireToken, (req, res, next) => {
  // set owner of new example to be current user
  req.body.patient.owner = req.user.id

  Patient.create(req.body.patient)
    // respond to succesful `create` with status 201 and JSON of new "example"
    .then(patient => {
      res.status(201).json({ patient: patient.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/patients/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.patient.owner

  Patient.findById(req.params.id)
    .then(handle404)
    .then(patient => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, patient)

      // pass the result of Mongoose's `.update` to the next `.then`
      return patient.update(req.body.patient)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.status(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/patients/:id', requireToken, (req, res, next) => {
  Patient.findById(req.params.id)
    .then(handle404)
    .then(Patient => {
      // throw an error if current user doesn't own `example`
      requireOwnership(req, Patient)
      // delete the example ONLY IF the above didn't throw
      Patient.remove()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router