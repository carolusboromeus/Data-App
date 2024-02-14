const mongoose = require('mongoose');

// Membuat Schema
const studentSchema = new mongoose.Schema({
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
    nim: {
        type: Number,
        required: true,
    },
    jurusan: {
        type: String,
        required: true,
    },
    semester: {
        type: Number,
        required: true,
    },
    idFoto: { 
        type: String,
    },
},{timestamps: true});

const Student = mongoose.model('student', studentSchema);

module.exports = Student;