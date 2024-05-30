const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const Descriptor = require('../models/descriptors');
const faceapi = require('face-api.js');
const { Canvas, Image, ImageData } = require('canvas');
const canvas = require('canvas');
const path =require('path')
// Monkey-patch the environment for face-api.js
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load models
const MODEL_URL = path.join(__dirname,'../models/models'); 
const loadModels = async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
};

// Call loadModels when your application starts
loadModels();

// Endpoint to get photo URL by user ID
router.get('/get-photo/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const student = await Student.findOne({ student_cllgid: userId });
    if (student) {
      res.json({ imageUrl: student.student_photo });
    } else {
      res.status(404).send('Student not found');
    }
  } catch (error) {
    res.status(500).send('Error fetching student data');
  }
});

router.post('/user-faceid1', async (req, res) => {
  const { userId, imageData } = req.body;
  console.log(userId,imageData)
  try {
    const img = await canvas.loadImage(imageData);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      return res.status(400).send('No face detected');
    }

    const userID1 = userId;
    const faceDescriptor = Array.from(detection.descriptor); // Convert Float32Array to regular array

    const newDescriptor = new Descriptor({ userId: userID1, descriptor: faceDescriptor });
    await newDescriptor.save();

    res.send('Face descriptor stored successfully');
  } catch (error) {
    console.error('Error storing face descriptor:', error);
    res.status(500).send('Error storing face descriptor');
  }
});
// Endpoint to store face descriptor
router.post('/user-faceid', async (req, res) => {
  const { userId, imageData } = req.body;
  console.log(userId,imageData)
  try {
    const img = await canvas.loadImage(imageData);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      return res.status(400).send('No face detected');
    }

    const username = await Student.findOne({ student_cllgid: userId }); // Fix: await added here
    const userID1 = username._id;
    const faceDescriptor = Array.from(detection.descriptor); // Convert Float32Array to regular array

    const newDescriptor = new Descriptor({ userId: userID1, descriptor: faceDescriptor });
    await newDescriptor.save();

    res.send('Face descriptor stored successfully');
  } catch (error) {
    console.error('Error storing face descriptor:', error);
    res.status(500).send('Error storing face descriptor');
  }
});

// Endpoint to verify face
router.post('/verify-face', async (req, res) => {
  const { image, userId } = req.body;
  console.log(image)
  console.log(`Received image data of size: ${image.length} characters`); 
  try {
    const img = await canvas.loadImage(image);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

    if (!detection) {
      return res.status(400).send('No face detected');
    }

    const student = await Student.findOne({ student_cllgid: userId });

    if (!student) {
      return res.status(404).send('User not found');
    }

    const faceDescriptor = detection.descriptor;
    const userDescriptors = await Descriptor.find({ userId: student._id });

    if (!userDescriptors.length) {
      return res.status(404).send('No descriptors found for this user');
    }

    // Convert descriptors to Float32Array
    const labeledDescriptors = userDescriptors.map(d => new Float32Array(d.descriptor));

    // Find the best match for the given descriptor
    let bestMatch = null;
    let minDistance = Number.MAX_VALUE;

    labeledDescriptors.forEach((descriptor, index) => {
      const distance = faceapi.euclideanDistance(faceDescriptor, descriptor);
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = { distance, descriptorIndex: index };
      }
    });

    if (minDistance < 0.6) { // Adjust the threshold as needed
      console.log("success")
      res.json({ success: true, match: bestMatch });
    } else {
      console.log("fail")
      res.json({ success: false, match: bestMatch });
    }
  } catch (error) {
    console.error('Error verifying face:', error);
    res.status(500).send('Error verifying face');
  }
});

module.exports = router;
