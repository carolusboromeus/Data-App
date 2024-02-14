const mongoose = require('mongoose');
const Client = require('./db.cjs');
const ObjectId = require('mongoose').Types.ObjectId;

const fs = require('fs');

let bucket;
const storage = (async () => {
    try {
        await Client;
        const { db } = mongoose.connection;
        bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
    }
    catch(err) {
        console.log(err);
    }
})();

function saveFoto(foto, idFile) {

    const typeFile = foto.mimetype;
    
    if(  typeFile != 'image/png' && typeFile != 'image/jpg' && typeFile != 'image/jpeg' )
    {
        return res.status(400).send('No type file image');
    }
    else if(foto.truncated == true) {
        return res.status(400).send('Files Size Max.');
    }
    else
    {
        fs.createReadStream(foto.tempFilePath).
            pipe(bucket.openUploadStream(foto.name, {
                chunkSizeBytes: 1048576,
                contentType: foto.mimetype,
                id: new ObjectId(idFile),
            }));
    }
}

async function loadDatabase(db, value, database,) {

    let result;
    if(database == "lecturers")
    {
        result = db.collection(database).find({nitk: parseInt(value)});
    }
    else if(database == "students")
    {
        result = db.collection(database).find({nim: parseInt(value)});
    }

    let data;
    await result.forEach((item) => {
        data = item;
    });

    return data;
}

async function loadFoto (value, database) {
    const { db } = mongoose.connection;

    const data = loadDatabase(db, value, database);

    let id;
    await data.then((item) => {
        id = item;
    });

    const dbImages = db.collection("images.chunks").find({files_id: new ObjectId(id.idFoto)});

    let img;
    await dbImages.forEach((item) => {
        img = item;
    });

    return img;
}

async function deleteFoto (value, database) {
    const { db } = mongoose.connection;

    const data = loadDatabase(db, value, database);

    let id;
    await data.then((item) => {
        id = item;
    });


    if(id.idFoto)
    {
        bucket.delete(new ObjectId(id.idFoto));
    }
}

function updateFoto (value, idFile, newId) {

    if(idFile)
    {
        bucket.delete(new ObjectId(idFile));
    }

    saveFoto(value, newId);
}

module.exports = {saveFoto, loadFoto, deleteFoto, updateFoto}