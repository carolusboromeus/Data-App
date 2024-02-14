import { createRequire } from "module";
const require = createRequire(import.meta.url);
import express from 'express';
import expressLayouts from 'express-ejs-layouts';

import { body, validationResult, check } from 'express-validator';
import methodOverride from 'method-override';

import session from 'express-session';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';

import fileUpload from 'express-fileupload';
//import fs from 'fs';

// Setup MongoDB
const ObjectId = require('mongoose').Types.ObjectId;
const Mahasiswa = require('./model/students.cjs');
const Dosen = require('./model/lecturers.cjs');

const {countMahasiswa, countDosen, filterJurusan, loadProgramStudi, loadJurusanDB} = require('./utils/data.cjs');
const {saveFoto, loadFoto, deleteFoto, updateFoto} = require('./utils/files.cjs')

// Setup Express
const app = express();
const port = 3000;

// Setup method override
app.use(methodOverride('_method'));

// Setup EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Setup flash
app.use(cookieParser('secret'));
app.use(session( {
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
app.use(flash());

// Setup File Upload
app.use(fileUpload({
    limits: {
        fileSize: 5242880
    },
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

// Setup Storage
// storage;

// Halaman Home
app.get('/', async (req, res) => {
    const mahasiswa = await Mahasiswa.find().estimatedDocumentCount();
    const dosen = await Dosen.find().estimatedDocumentCount();
    

    const countMhs = await countMahasiswa();
    const countDsn = await countDosen();
    const jurusan = await loadJurusanDB();

    res.render('dashboard', {   
        title:'Halaman Home',
        nama:'Selamat Datang!',
        layout: 'layouts/main-layout',
        page_name: 'dashboard',
        mahasiswa,
        dosen,
        jurusan,
        countMhs,
        countDsn
    });
});

// Halaman Data Mahasiswa
app.get('/mahasiswa', async (req, res) => {
    const mahasiswa = await Mahasiswa.find();

    res.render('students', {   
        title:'Halaman Data Mahasiswa',
        nama:'Selamat Datang!',
        mahasiswa,
        layout: 'layouts/main-layout',
        msg: req.flash('msg'),
        page_name: 'students',
    });
});

// Halaman Form Tambah Data Mahasiswa
app.get('/mahasiswa/add', (req,res) => {

    const programStudi = loadProgramStudi();

    res.render('add-students', {
        title: 'Form Tambah Data Mahasiwa',
        layout: 'layouts/main-layout',
        programStudi,
        page_name: 'students',
    })
});

//Proses Tambah Data Mahasiswa
app.post('/mahasiswa', [
    body('nim').custom( async (value) => {
        const duplikat = await Mahasiswa.findOne({ nim: value });
        if(duplikat) {
            throw new Error ('NIM sudah terdaftar!');
        }
        else {
            return true;
        }
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('noHP', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {

    //Find The Valitador
    const errors = validationResult(req);
    const programStudi = loadProgramStudi();

    if(!errors.isEmpty()) {
        //return res.status(400).json({ errors: errors.array() });
        res.render('add-students', {
            title: 'Form Tambah Data Mahasiswa',
            layout: 'layouts/main-layout',
            page_name: 'students',
            programStudi,
            errors: errors.array(),
        })
    } else {
        let idFile;
        if(req.files) {
            idFile = new ObjectId().toString();
            saveFoto(req.files.foto, idFile);
        }
        Mahasiswa.insertMany([
            { 
                nama: req.body.nama,
                noHP: req.body.noHP,
                email: req.body.email,
                nim: req.body.nim,
                jurusan: req.body.jurusan,
                semester: req.body.semester,
                idFoto: idFile
            }
        ]).then((result) => {
            
            //kirim massage ke halaman
            req.flash('msg', 'Data Mahasiswa berhasil ditambahkan!');
    
            //kembali ke halaman daftar dosen
            res.redirect('/mahasiswa');
        });

    }
});

// Proses Delete Mahasiswa
app.delete('/mahasiswa', (req, res) => {
    deleteFoto(req.body.nim, "students");
    Mahasiswa.deleteOne( { nim: req.body.nim }).then((result) => {

        //kirim massage ke halaman
        req.flash('msg', 'Data Mahasiswa berhasil dihapus!');
        //kembali ke halaman daftar mahasiswa
        res.redirect('/mahasiswa');
    });
});

// Halaman Form Ubah Data Mahasiswa
app.get('/mahasiswa/edit/:nim', async (req,res) => {
    const mahasiswa = await Mahasiswa.findOne( { nim: req.params.nim });
    const image = await loadFoto(req.params.nim, "students");
    const programStudi = loadProgramStudi();

    res.render('edit-students', {
        title: 'Form Ubah Data Mahasiwa',
        layout: 'layouts/main-layout',
        mahasiswa,
        image,
        programStudi,
        page_name: 'students',
    })
});

//Proses Ubah Data Mahasiswa
app.put('/mahasiswa/', [
    check('email', 'Email tidak valid!').isEmail(),
    check('noHP', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {

    //find the valitador
    const errors = validationResult(req);
    const programStudi = loadProgramStudi();

    if(!errors.isEmpty()) {
        res.render('edit-students', {
            title: 'Form Ubah Data Mahasiswa',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            mahasiswa: req.body,
            programStudi,
            page_name: 'students',
        })
    } else {
        let idFile;

        if(req.files) {
            idFile = new ObjectId().toString();
            updateFoto(req.files.foto, req.body.idFile, idFile);
        }
        
        Mahasiswa.updateOne({ _id: req.body._id }, { $set: { nama: req.body.nama, noHP: req.body.noHP, email: req.body.email, semester: req.body.semester, jurusan: req.body.jurusan, idFoto: idFile} })
            .then((result) => {
                
                //kirim massage ke halaman
                req.flash('msg', 'Data Mahasiswa berhasil diubah!');
                //kembali ke halaman daftar mahasiswa
                res.redirect('/mahasiswa');
            });
    } 
});

// Halaman Detail Mahasiswa
app.get('/mahasiswa/:nim', async (req, res) => {

    // Supaya bisa menjalankan promise pakai async await
    const mahasiswa = await Mahasiswa.findOne( { nim: req.params.nim });
    const image = await loadFoto(req.params.nim, "students");

    res.render('detail-students', {
        layout: 'layouts/main-layout',
        title: 'Halaman Detail Mahasiswa',
        mahasiswa,
        image,
        page_name: 'students',
    });
});

// Halaman Data Dosen
app.get('/dosen', async (req, res) => {
    const dosen = await Dosen.find();

    res.render('lecturers', {   
        title:'Halaman Data Dosen',
        nama:'Selamat Datang!',
        dosen,
        layout: 'layouts/main-layout',
        msg: req.flash('msg'),
        page_name: 'lecturers',
    });
});

// Halaman Form Tambah Data Dosen
app.get('/dosen/add', (req,res) => {

    const programStudi = loadProgramStudi();

    res.render('add-lecturers', {
        title: 'Form Tambah Data Dosen',
        layout: 'layouts/main-layout',
        programStudi,
        page_name: 'lecturers',
    })
});

//Proses Tambah Data Dosen
app.post('/dosen', [
    body('nitk').custom( async (value) => {
        const duplikat = await Dosen.findOne({ nitk: value });
        if(duplikat) {
            throw new Error ('NITK sudah terdaftar!');
        }
        else {
            return true;
        }
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('noHP', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {

    //Find The Valitador
    const errors = validationResult(req);
    const programStudi = loadProgramStudi();

    if(!errors.isEmpty()) {
        //return res.status(400).json({ errors: errors.array() });
        res.render('add-lecturers', {
            title: 'Form Tambah Data Dosen',
            layout: 'layouts/main-layout',
            page_name: 'lecturers',
            programStudi,
            errors: errors.array(),
        })
    } else {

        let idFile;
        if(req.files) {
            idFile = new ObjectId().toString();
            saveFoto(req.files.foto, idFile);
        }
        
        Dosen.insertMany([
            { 
                nama: req.body.nama,
                noHP: req.body.noHP,
                email: req.body.email,
                nitk: req.body.nitk,
                programStudi: req.body.jurusan,
                idFoto: idFile
            }
        ]).then((result) => {
            
            //kirim massage ke halaman
            req.flash('msg', 'Data Dosen berhasil ditambahkan!');
    
            //kembali ke halaman daftar dosen
            res.redirect('/dosen');
        });
    }
});

// Proses Delete Dosen
app.delete('/dosen', (req, res) => {
    deleteFoto(req.body.nitk, "lecturers");
    Dosen.deleteOne( { nitk: req.body.nitk }).then((result) => {

        //kirim massage ke halaman
        req.flash('msg', 'Data Dosen berhasil dihapus!');
        //kembali ke halaman daftar mahasiswa
        res.redirect('/dosen');
    });
});

// Halaman Form Ubah Data Dosen
app.get('/dosen/edit/:nitk', async (req,res) => {
    const dosen = await Dosen.findOne( { nitk: req.params.nitk });
    const image = await loadFoto(req.params.nitk, "lecturers");
    const programStudi = loadProgramStudi();

    res.render('edit-lecturers', {
        title: 'Form Ubah Data Dosen',
        layout: 'layouts/main-layout',
        dosen,
        programStudi,
        image,
        page_name: 'lecturers',
    })
});

//Proses Ubah Data Dosen
app.put('/dosen/', [
    check('email', 'Email tidak valid!').isEmail(),
    check('noHP', 'No HP tidak valid!').isMobilePhone('id-ID')
], (req, res) => {

    //find the valitador
    const errors = validationResult(req);
    const programStudi = loadProgramStudi();

    if(!errors.isEmpty()) {
        res.render('edit-lecturers', {
            title: 'Form Ubah Data Dosen',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            dosen: req.body,
            programStudi,
            page_name: 'lecturers',
        })
    } else {
        let idFile;
        if(req.files) {
            
            idFile = new ObjectId().toString();
            updateFoto(req.files.foto, req.body.idFile, idFile);
        }
        
        Dosen.updateOne({ _id: req.body._id }, { $set: { nama: req.body.nama, noHP: req.body.noHP, email: req.body.email, programStudi: req.body.jurusan, idFoto: idFile} })
            .then((result) => {
                //kirim massage ke halaman
                req.flash('msg', 'Data Dosen berhasil diubah!');
                //kembali ke halaman daftar mahasiswa
                res.redirect('/dosen');
            });
    } 
});

// Halaman Detail Dosen
app.get('/dosen/:nitk', async (req, res) => {
    // Supaya bisa menjalankan promise pakai async await
    const dosen = await Dosen.findOne( { nitk: req.params.nitk });
    const image = await loadFoto(req.params.nitk, "lecturers");

    res.render('detail-lecturers', {
        layout: 'layouts/main-layout',
        title: 'Halaman Detail Dosen',
        dosen,
        image,
        page_name: 'lecturers',
    });
});

app.listen(port, () => {
    console.log(`Application | listening at http://localhost:${port}`);
})


