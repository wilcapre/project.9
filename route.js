const express = require('express');
const router = express.Router();
const auth = require('basic-auth');
const sequelize = require('./models').sequelize;
const User = require('./models').User; 
const Course = require('./models').Course;
const bcryptjs = require('bcryptjs');

sequelize
.authenticate()
.then(function(err) {
  console.log('Database connection has been established successfully.');
})
.catch(function (err) {
  console.log('Unable to connect to the database:', err);
});

// AsyncHandler function to wrap the routes
function asyncHandler(cb) {
  return async (req, res, next) => {
    try{
      await cb(req, res,next)
    } catch(err){
      next(err)
    }
  }
}

// AuthenticateUser middleware function in the routes module
const authenticateUser = async (req, res, next) => {

    // Null variable
    let message = null;
  
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
  
    // If the user's credentials are available...
    if (credentials) {
      // Attempt to retrieve the user from the data store
      // by their username (i.e. the user's "key"
      // from the Authorization header).
      const user = await User.findOne({
        where: {emailAddress: credentials.name}
      });
  
      // If a user was successfully retrieved from the data store...
      if (user) {
        // Use the bcryptjs npm package to compare the user's password
        // (from the Authorization header) to the user's password
        // that was retrieved from the data store.
        const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password);
  
        // If the passwords match...
        if (authenticated) {
          console.log(`Authentication successful for username: ${user.emailAddress}`);
  
          // Then store the retrieved user object on the request object
          // so any middleware functions that follow this middleware function
          // will have access to the user's information.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.emailAddress}`;
        }
      } else {
         message = `User not found for username: ${credentials.name}`;
      }
    } else {
    message = 'Valid user not found';
    }
  
    // If user authentication failed...
  if (message) {
    console.warn(message);
  
    // Return a response with a 401 Unauthorized HTTP status code.
    res.status(401).json({ message: 'Access Denied' });
  } else {
    // Or if user authentication succeeded...
    // Call the next() method.
    next();
  }
};

// Returns the currently authenticated user
router.get('/users', authenticateUser, (req, res, next) => {
  const user = req.currentUser;
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress
  });
});

// Create User
router.post('/users', async (req, res, next) => {
    try{ 
      await User.create(req.body); 
      res.location('/');
      res.status(201).end(); 
    } catch(err) {
      if (err.name === 'SequelizeValidationError') { 
        res.status(400).json({error: err.message}) 
      } else {
        return next(err); 
      }
    } 
});

// GET courses route
router.get('/courses', asyncHandler (async (req,res) => {
    try{
      const courses = await Course.findAll({
        order: [["id", "ASC"]],
        attributes: ['id', 'userId','title', 'description', 'estimatedTime', 'materialsNeeded'],
        include: [{ model: User, attributes: ['firstName', 'lastName', 'emailAddress']}] 
      });
      res.status(200).json(courses);
    } catch(err){
      res.json({message: err.message});
    }
}));

// GET course route by ID 
router.get('/courses/:id', async (req, res, next) => {
  try{
    const courses = await Course.findByPk(req.params.id, {
      attributes: ['id', 'userId','title', 'description', 'estimatedTime', 'materialsNeeded'],
      include: [{ model: User, attributes: ['firstName', 'lastName', 'emailAddress']}]  
    })

    if (courses) {
      res.status(200).json(courses); 
    } else {
      res.status(404).json({error: 'Course does not exist'})
    }  
  } catch(err){
    return next(err);
  }
});


// POST Course Route
router.post('/courses', authenticateUser, asyncHandler (async (req, res, next) => {
  try{ 
    req.body.userId = req.currentUser.id
    const course = await Course.create(req.body); 
    res.location('/courses/' + course.id);
    res.status(201).end(); 
  } catch(err) {
    if (err.name === 'SequelizeValidationError') { 
      res.status(400).json({error: err.message}) 
    } else {
      return next(err); 
    }
  } 
}));

// PUT Course to Updates/Edit a course and returns no content
router.put('/courses/:id', authenticateUser, asyncHandler (async (req, res, next) => {
  try {
    if (req.body.title && req.body.description){
      const course = await Course.findByPk(req.params.id);
      course.update(req.body);
      res.status(204).end();   
    } else {
      res.status(400).json({error: "Please enter the title and description"});
    }
  } catch (err) {
    if (err.name === 'SequelizeValidationError') { 
      res.status(400).json({error: err.message}) 
    } else {
      return next(err); 
    }
  }
}));

//DELETE a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler (async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    // Delete course
    course.destroy();
    res.status(204).end();
}));

module.exports = router;