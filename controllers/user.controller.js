import User from "../mongodb/models/user.js";

const getAllUsers = async (req, res) => {

};


const createUser = async (req, res) => {
    //get data from the frontend
    const { name, email, avatar } = req.body;

    try {
    //check if user exists
     const userExists = await User.findOne({ email });
     if(userExists){
         return res.status(200).json(userExists);
     };

     //create new user
     const newUser = await User.create({
         name, email, avatar
     });
     res.status(200).json(newUser);
    } catch (error) {
     res.status(500).json({message: error.message});
    }
};


const getUserInfoByID = async (req, res) => {};



export {getAllUsers, createUser, getUserInfoByID}; 