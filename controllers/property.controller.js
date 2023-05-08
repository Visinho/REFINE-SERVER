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

    //adding sorting and filter logic 
    const { _end, _order, _start, _sort, title_like = "", propertyType = "" } = req.query;

    const query = {};

    //checking if propertytype and title_like exist
    if(propertyType !== ""){
        query.propertyType = propertyType;
    }

    if(title_like !== ""){
        query.title = { $regex: title_like, $options: "i" };
    }

    try {

    //get number of documents
    const count = await Property.countDocuments({query});

    //find these documents through specified parameters
    const properties = await Property
    .find(query)
    .limit(_end)
    .skip(_start)
    .sort({[_sort]: _order})

    //passing total number of elements to the front end
    res.header("x-total-count", count);
    res.header("Access-Control-Expose-Headers", "x-total-count");

       res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getPropertyDetail = async (req, res) => {
    // To get the ID of a property
    const { id } = req.params;

    //To get a particular property
    const propertyExists = await Property.findOne({ _id: id}).populate("creator");

    if(propertyExists) 
    {res.status(200).json(propertyExists)}
    else{
       res.status(404).json({ message: "Property not found"});
    }
};


const updateProperty = async (req, res) => {
    try {
        // To get the ID of a property
        const {id} = req.params;
        const { title, description, propertyType, location, price, photo } = req.body;

        //uploading photos to cloudinary
        const photourl = await cloudinary.uploader.upload(photo);

        await Property.findByIdAndUpdate({ _id: id }, {
            title,
            description,
            propertyType,
            location,
            price,
            photo: photourl.url || photo
        })

        res.status(200).json({message: "Property Updated Successfully"})
    } catch (error) {
        res.status(500).json({message: "An error occured!"})
    }
};


const deleteProperty = async (req, res) => {
    try {
        // To get the ID of a property
        const {id} = req.params;
        const propertyToDelete = await Property.findById({_id:id}).populate("creator");
        if(!propertyToDelete){
            throw new Error("Property not found!");
        }
        const session = await mongoose.startSession();
        session.startTransaction();

        propertyToDelete.deleteOne({ _id: id }, { session });
        propertyToDelete.creator.allProperties.pull(propertyToDelete);

        await propertyToDelete.creator.save({session});
        await session.commitTransaction();

        res.status(200).json({message: "Property deleted successfully"})
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};


export {getAllProperties, getPropertyDetail, createProperty, updateProperty, deleteProperty}; 