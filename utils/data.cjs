const Mahasiswa = require('../model/students.cjs');
const Dosen = require('../model/lecturers.cjs');
const mongoose = require('mongoose');

function loadProgramStudi () {
    const programStudi = [
        {
            jurusan: 'Data Science',
            falkutas: 'Teknologi dan Desain',
        },
        {
            jurusan: 'Desain Interaktif',
            falkutas: 'Teknologi dan Desain',
        },
        {
            jurusan: 'Desain Komunikasi Visual',
            falkutas: 'Teknologi dan Desain',
        },
        {
            jurusan: 'Teknik Informatika',
            falkutas: 'Teknologi dan Desain',
        },
        {
            jurusan: 'Sistem Informasi',
            falkutas: 'Teknologi dan Desain',
        },
        {
            jurusan: 'Akuntansi',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
        {
            jurusan: 'Bahasa Inggris',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
        {
            jurusan: 'Bahasa Mandarin',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
        {
            jurusan: 'Bisnis Digital',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
        {
            jurusan: 'Hospitality & Pariwisata',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
        {
            jurusan: 'Ilmu Komunikasi',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
        {
            jurusan: 'Manajamen',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
        {
            jurusan: 'Psikologi',
            falkutas: 'Ilmu Sosial dan Humaniora',
        },
    ]

    return programStudi;
}

function loadJurusanDB () {
    const programStudi = loadProgramStudi();

    let array= [];
    programStudi.forEach(async (value) => {
        array.push(value.jurusan);
    })
    array = array.sort();

    return array;
}

const countMahasiswa = (async () => {
    const jurusan = loadJurusanDB();
    
    let temp = [];
    for(let i = 0; i < jurusan.length; i++)
    {
        const countQuery = Mahasiswa.where({jurusan: jurusan[i]}).countDocuments();
        await countQuery.then((value) => {
            temp.push(value);
            
        })
    }
    // temp = temp.filter((item,index) => { 
    //     return item !== 0;
    // });

    return temp;
});

const countDosen = (async () => {
    const jurusan = loadJurusanDB();

    let temp = [];
    for(let i = 0; i < jurusan.length; i++)
    {
        const countQuery = Dosen.where({programStudi: jurusan[i]}).countDocuments();
        await countQuery.then((value) => {
            temp.push(value);
            
        })
    }
    // temp = temp.filter((item,index) => { 
    //     return item !== 0;
    // });

    return temp;
});

const filterJurusan = (async () => {
    //Program Studi
    const { db } = mongoose.connection;
    const result = db.collection("students").find();
    let data =[];
    await result.forEach((item, index) => {
        data.push(item.jurusan);
    });

    data = data.filter((item,index) => data.indexOf(item) === index);
    data = data.sort();

    return data;
})

module.exports = {countMahasiswa, countDosen, filterJurusan, loadProgramStudi, loadJurusanDB};