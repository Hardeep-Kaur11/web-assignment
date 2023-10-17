const express = require('express');
const cors = require('cors')
const {response, json} = require("express");

const app = express();

const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://hardeep:VceAPiLMkSzMurJY@cluster0.iztq4xc.mongodb.net/assignment?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// Global for general use
let currentCollection;

client.connect(err => {
    currentCollection = client.db("assignment").collection("users");
    // perform actions on the collection object
    console.log ('Database up!'+err);

});

app.get('/', (req, res) => {
  res.send('Hello World!')
})


 
app.post('/loadAppointment', async function (req, res) {
    let {email} = req.body;
    console.log(email);
    const details = await client.db("assignment").collection("bookAppointment").findOne({email: email});

    if (details) {
        try {
            // Get the current date and time
            const now = new Date();
            console.log(now);
            const savedDate = new Date(details.date + "T" + details.time);
            // const appointmentDateTime = new Date(appointment.);
            if (savedDate > now) {
                res.json({message: 'load appointment details', details});
            }
        }catch (e){
            console.log(e);
        }
    }


});


app.post('/updatePassword', async (req, res) => {
    let {email, password} = req.body;

    try {
        let user = await currentCollection.findOne({email: email});

        if (user) {
            console.log('user found:', JSON.stringify(user));
            const result = await currentCollection.updateOne(
                { email },
                {
                    $set: { password: password },
                }
            );

            if (result.modifiedCount === 1) {
                res.status(200).json({ message: 'Password updated successfully' });
            } else {
                res.status(400).json({ message: 'User not found' });
            }
        } else {
            console.log('Email not found');
            return res.status(400).json({message: 'Unable to update Password.'});
        }



    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({message: 'Server error'});
    }
});

//forgotPassword

app.post('/forgotPassword', async (req, res) => {
    let {email, password} = req.body;

    try {
        let user = await currentCollection.findOne({email: email});

        if (user) {
            console.log('user found:', JSON.stringify(user));
            let jsonData= JSON.stringify(user)
            res.json({ message: 'Email sent successfully', user });
        } else {
            console.log('Email not found');
            return res.status(400).json({message: 'Kindly check your registered email address'});
        }



    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({message: 'Server error'});
    }
});


// Login route
app.post('/login', async (req, res) => {
    let {email, password} = req.body;

    try {
        let user = await currentCollection.findOne({email: email, password: password});

        if (user) {
            console.log('user found:', JSON.stringify(user));
            res.json({ message: 'Login successfully', user });
        } else {
            console.log('User not found');
            return res.status(400).json({message: 'Kindly check your credentials'});
        }



    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({message: 'Server error'});
    }
});
app.put('/editProfile', async (req, res) => {
    const { email,age, state} = req.body;
    console.log(req.body);
    try {
        let user = await currentCollection.findOne({email: email});
        if (user) {
            const result = await currentCollection.updateOne(
                { email },
                {
                    $set: { age: age,state:state},
                }
        );

            if (result.modifiedCount === 1) {
                let user = await currentCollection.findOne({email: email});
                console.log( "Profile updated successfully");
                res.json({ message: 'Profile updated successfully', user });
            } else {
                res.status(400).json({ message: 'User not found' });
            }
        } else {
            console.log('Email not found');
            return res.status(400).json({message: 'Unable to update Profile.'});
        }

    }catch (e){
        console.log(e);
    }
});
// Register User
app.post('/register', async (req, res) => {

    const { fName, lName,age, state, email, password } = req.body;
    //Check if the user already exists in the database
    try {
        const userEmail = await currentCollection.findOne({email: email});

        if (userEmail) {
            console.log('Email already exists.');
            return res.status(400).json({message: 'Email already exists.'});
        } else {
            // Create a new user document
            const newUser = {
                fName,
                lName,
                age,
                state,
                email,
                password: password,
            };
            console.log(newUser);
            // Insert the new user into the database
            await currentCollection.insertOne(newUser);
            console.log("User registered successfully.") ;
            return res.status(200).json({message: 'User registered successfully.'});
        }

    }catch (e){
        console.log(e);
    }

});

// send message
app.post('/message', async (req, res) => {
    //Check if the user already exists in the database
    try {
            console.log(req.body);
            // Insert the new user into the database
            await  client.db("assignment").collection("message").insertOne(req.body);
            console.log("Query sent successfully.") ;
            return res.status(200).json({message: 'Query sent successfully.'});

    }catch (e){
        console.log(e);
    }

});

//book appointment
app.post('/bookAppointment', async (req, res) => {
    //Check if the user already exists in the database
    try {
        console.log(req.body);
        // Insert the new user into the database
        await  client.db("assignment").collection("bookAppointment").insertOne(req.body);
        console.log("Appointment booked successfully.") ;
        return res.status(200).json({message: 'Appointment booked successfully.'});

    }catch (e){
        console.log(e);
    }

});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`) 
});
