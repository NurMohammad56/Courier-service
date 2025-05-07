import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    email:
    {
        type: String,
        required: true,
        unique: true
    },
    phone:
    {
        type: String,
        required: true,
    },
    role:
    {
        type: String,
        enum: ['admin', 'hubManager', 'user'],
        required: true
    },
    password:
    {
        type: String,
        required: true
    },
    hubId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hub', required: function () { return this.role === 'hubManager'; }
    },
    isVerified:
    {
        type: Boolean,
        default: false
    },
    verificationCode:
    {
        type: String,
        required: false
    },
    resetCode:
    {
        type: String,
        required: false
    },
    totalProductsShipped:
    {
        type: Number,
        default: 0
    },
    totalAmountShipped:
    {
        type: Number,
        default: 0
    },
    totalProductsTransported:
    {
        type: Number,
        default: 0
    },
    totalAmountTransported:
    {
        type: Number,
        default: 0
    },
    totalProductsReceived:
    {
        type: Number,
        default: 0
    },
    totalAmountReceived:
    {
        type: Number,
        default: 0
    },
    refreshToken:
    {
        type: String,
        required: false
    },
    createdAt:
    {
        type: Date,
        default: Date.now
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Validate password
userSchema.methods.isPasswordValid = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Generate tokens
userSchema.methods.generateTokens = function () {
    const accessToken = jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '7d' }
    );
    const refreshToken = jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    );
    this.refreshToken = refreshToken;
    return { accessToken, refreshToken };
};

export const User = mongoose.model('User', userSchema);