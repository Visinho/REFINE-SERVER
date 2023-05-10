import User from "../mongodb/models/user.js";

const getAllUsers = async (req, res) => {
    try {
        // Find all users and set a limit
        const users = await User.find({}).limit(req.query._end);
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
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


const getUserInfoByID = async (req, res) => {
    try {
        //To get the Id and the properties of the user with the ID
        const { id } = req.params;
        const user = await User.findOne({ _id: id}).populate("allProperties");

        //check if user exists
        if(user) {
            res.status(200).json(user)
        } else {res.status(404).json({ message: "User not found!"})}

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};



export {getAllUsers, createUser, getUserInfoByID}; 