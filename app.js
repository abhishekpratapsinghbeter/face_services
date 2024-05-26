const dotenv = require("dotenv");
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const cors = require('cors');
const app = express();
const faceapi = require('face-api.js');
const path = require('path'); 
const MODEL_URL = path.join(__dirname, './src/models/models'); // Path to your models directory


dotenv.config({ path: './config.env' });
require("./src/models/connection/conn");

const corsOptions = {
    origin: 'https://attendxpert.onrender.com', // Allow requests from this origin
    methods: ['GET', 'POST'], // Allow only GET and POST requests
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  };
  app.use(cors(corsOptions));
  
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(require('./src/routes/face-verification'));

const PORT = process.env.PORT || 5002;
 
app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`);
})