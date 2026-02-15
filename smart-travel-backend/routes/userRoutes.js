const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { name, email, phone, bio, profileImage } = req.body;
    const userId = req.user?.id; // This would come from auth middleware
    
    // For now, we'll find by email since we don't have auth middleware set up
    const user = await User.findOneAndUpdate(
      { email },
      { name, phone, bio, profileImage },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      profileImage: user.profileImage
    }});
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
