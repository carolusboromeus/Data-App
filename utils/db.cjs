const mongoose = require('mongoose');

const Client = mongoose.connect('mongodb://127.0.0.1:27017/university')
    .then(() => console.log('Connected!'))
    .catch(() => console.log('Not Connected!'));

    module.exports = Client;


