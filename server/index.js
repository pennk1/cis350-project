const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//load .env file
require('dotenv').config();

const app = express();
const UsersModel = require('./models/Users');
const RecordsModel = require('./models/Records');

app.use(express.json());
app.use(cors());


if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
}

mongoose.connect(process.env.DATABASE_URL)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('Server is running...\nport: ' + PORT);
});

app.get('/getUser', (req, res) => {
    const user = req.body;
    UsersModel.find({name: user.name}).then ( data => {
        res.json(data);
    });
});

app.post('/createUser', async (req, res) => {
    const user = req.body;
    UsersModel.find({name: user.name}).then ( async (data) => {
        if (!data.length) {
            const newUser = new UsersModel(user);
            await newUser.save();
            res.json(newUser);
        } else {
            res.json(data[0]);
        }
    });
});

app.get('/getRecords', (req, res) => {
    const user = req.body;
    RecordsModel.find({user: user.user}).then ( data => {
        res.json(data);
    });
});

app.post('/createRecord', async (req, res) => {
    const record = req.body;
    const newRecord = new RecordsModel(record);
    await newRecord.save();
    res.json(record);
});

app.get('/getSleepStats', (req, res) => {
    const user = req.body;
    RecordsModel.find({user: user.user}).then ( data => {
        var dateMap = {};
        var totalSleepDuration = 0;
        data.forEach(record => {
            var start = new Date(record.start_time);
            var end = new Date(record.end_time);
            var date = start.toLocaleDateString();
            var duration = end - start; // measured in milliseconds

            dateMap[date] = (dateMap[date] || 0) + (end - start);
            totalSleepDuration += duration;
        });

        var numDays = Object.keys(dateMap).length;
        var averageSleepDuration = totalSleepDuration / numDays;

        res.json({
            dates: dateMap,
            average: averageSleepDuration,
        });
    });
})