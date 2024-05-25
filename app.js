const dotenv = require("dotenv");
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const app = express();
const faceapi = require('face-api.js');
const path = require('path'); 
const MODEL_URL = path.join(__dirname, './src/models/models'); // Path to your models directory

const loadModels = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
};

dotenv.config({ path: './config.env' });
require("./src/models/connection/conn");

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(require('./src/routes/face-verification'));

const PORT = process.env.PORT || 5002;
 
app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})