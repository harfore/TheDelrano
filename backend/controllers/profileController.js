const pool = require('../config/database');
const { getProfile, updateProfile } = require('../services/profileService');

exports.getUserProfile = async (req, res, next) => {
    try {
        const profile = await getProfile(req.user.id, pool);
        res.status(200).json({
            status: 'success',
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUserProfile = async (req, res, next) => {
    try {
        const updatedProfile = await updateProfile(req.user.id, req.body, pool);
        res.status(200).json({
            status: 'success',
            data: updatedProfile
        });
    } catch (error) {
        next(error);
    }
};