import Property from "../mongodb/models/property.js";
import User from "../mongodb/models/user.js";
import mongoose from "mongoose";

import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    api_key: process.env.CLOUDINARY_API_KEY,
});


const createProperty = async (req, res) => {
    try {
        const { title, description, propertyType, location, price, photo, email } = req.body;

    //Start a new session
    const session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findOne({ email }).session(session);
    if(!user){
        throw new Errpr("User not found!");
    }

    //uploading photos to cloudinary
    const photourl = await cloudinary.uploader.upload(photo);

    //create new property
    const newProperty = await Property.create({
        title, propertyType, description, location, price, photo: photourl.url, creator: user._id
    });

    //appending property to user
    user.allProperties.push(newProperty._id);
    await user.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: "Property created successfully! "});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    
};


const getAllProperties = async (req, res) => {
    try {
       const properties = await Property.find({}).limit(req.query._end); 

       res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPropertyDetail = async (req, res) => {};


const updateProperty = async (req, res) => {};


const deleteProperty = async (req, res) => {};


export {getAllProperties, getPropertyDetail, createProperty, updateProperty, deleteProperty}; 