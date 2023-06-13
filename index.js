import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.Routes.js";
import propertyRouter from "./routes/property.Routes.js";
import bodyParser from "body-parser";




dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send({message: "Hello World"})
});


app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter);

const startServer = async () => {
    try {
        connectDB(process.env.MONGODB_URL)

        app.listen(8080, () => console.log("Server started  on port 8080"));
    } catch (error) {
        console.log(error);
    }
}

startServer();