const mongoose = require('mongoose');

// Membuat Schema
const lecturerSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
    },
    noHP: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    nitk: {
        type: Number,
        required: true,
    },
    programStudi: {
        type: String,
        required: true,
    },
    idFoto: { 
        type: String,
    },
},{timestamps: true});

const Lecturer = mongoose.model('lecturer', lecturerSchema);

module.exports = Lecturer;