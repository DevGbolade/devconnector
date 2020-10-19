const express = require("express");
const request = require('request');
const config = require('config');
const router = express.Router();
const { check, validationResult, body } = require("express-validator");

const authMiddleware = require("../../middlewares/auth");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");
const User = require("../../models/User");
const { response } = require("express");

/**
 * @route  GET api/v1/profile
 * @desc   Gegt Current users profile
 * @access Private
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      res.status(400).json({ message: "There is no profile for this user" });
      return;
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server Error");
  }
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  "/",
  [
    authMiddleware,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    // Check Validation
    if (!errors.isEmpty()) {
      // Return any errors with 400 status
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //   Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    //Skills - Spilt into array
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //   Social
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //   create
      profile = new Profile(profileFields);
      await profile.save();
      console.log(profileFields);

      return res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// @route   Get api/v1/profile
// @desc    Get all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    return res.json(profiles);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

// @route   Get api/v1/profile/user/userId
// @desc    Get profile by User ID
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(500).json({ message: "Profile not found" });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(500).json({ message: "Profile not found" });
    }
    return res.status(500).send("Server Error");
  }
});

// @route   Delete api/v1/profile
// @desc    Delete Profile, user & post
// @access  Private
router.delete("/", authMiddleware, async (req, res) => {
  try {
    //  Remove post
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //  Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    return res.json({ message: "User Deleted" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});
// @route   Put api/v1/profile/experience
// @desc    Add profile experience
// @access  Private

router.put(
  "/experience",
  [
    authMiddleware,
    [
      check("title", "Title is Required").not().isEmpty(),
      check("company", "Company is Required").not().isEmpty(),
      check("from", "from date is Required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      return res.status(201).json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route   Delete api/v1/profile/experience/:expId
// @desc    Delete Profile, user & post
// @access  Private
router.delete("/experience/:expId", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get remove Index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.expId);

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});

// @route   Put api/v1/profile/education
// @desc    Add profile education
// @access  Private

router.put(
  "/education",
  [
    authMiddleware,
    [
      check("school", "school is Required").not().isEmpty(),
      check("degree", "degree is Required").not().isEmpty(),
      check("fieldofstudy", "field of study is Required").not().isEmpty(),
      check("from", "from date is Required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      return res.status(201).json(profile);
    } catch (error) {
      console.error(error.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route   Delete api/v1/profile/education/:expId
// @desc    Delete profile education
// @access  Private
router.delete("/education/:eduId", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // Get remove Index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.eduId);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});
// @route   Get api/v1/profile/github/:username
// @desc    Get profile github
// @access  Public
router.get("/github/:username", ({params: {username}}, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${username}/repos?per_page=5&sort=created:asc&client_id=${config.get("githubClientId")}&client_secret=${config.get("githubClientSecret")}`,
      method: 'GET',
      headers:{ 'user-agent': 'node.js'}
    }

     request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({
          msg: 'No Github profile found'
        })
      }
      return res.json(JSON.parse(body))
    })
    
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server Error");
  }
});
module.exports = router;
