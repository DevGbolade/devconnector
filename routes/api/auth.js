const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config');

const authMiddleware = require('../../middlewares/auth');
const User = require('../../models/User');

/**
 * @route  GET api/v1/auth
 * @desc   Test route
 * @access Public
 */
router
    .get('/', authMiddleware, async (req, res) => {
        try {
            const user = (await User.findById(req.user.id).select('-password'));
            res.json(user);
        } catch (error) {
            console.log(error.message);
            res.status(500).json({message: 'server error'})
            
        }
    });
/**
 * @route  POST api/v1/auth/signin
 * @desc   Login User
 * @access Public
 */
    router.
        post('/signin', [
        check('email','please enter a valid email').isEmail(),
        check('password','password is Required').exists(),
    ],
    async (req, res) => {
         const errors = validationResult(req);
         if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array()});
         }
         const {  email, password } = req.body;
         try {
             let user = await User.findOne({ email });
             if (!user) {
                return res.status(400).json({ errors: [ {msg: 'Invalid Credentials'}]});
             }
           const isMatch = await bcrypt.compare(password, user.password);
           if (!isMatch) {
            return res.status(400).json({ errors: [ {msg: 'Invalid Credentials'}]});
           }
            
           const payload = {
               user: {
                   id: user.id,
               }
           }
           jwt.sign(
               payload,
               config.get('jwtSecret'),
               {
                   expiresIn: 36000,

               }, 
               (err, token) => {
                   if(err) throw err;
                   res.json({ token })
               });

        //    return res.status(201).json({ status: 'success', data: user})
         } catch (error) {
             console.error(error.message);
            return res.status(500).send('server error');
         }
})


module.exports = router;