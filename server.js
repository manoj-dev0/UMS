require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const sequelize = require('./data/connection/databaseConnection');
const routes = require('./routes/index')
const errorHandler = require('./middleware/errorHandler');

const app = express();

require('./data/models/user/profileModel')
require('./data/models/user/sessionModel')
require('./data/models/user/tokenModel')
require('./data/models/user/userModel')
require('./data/models/access/permissionModel')
require('./data/models/access/roleModel')
require('./data/models/access/rolePermissionModel')


app.use(express.json());
app.use(morgan('dev'));
app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.use('/api', routes);
app.use(errorHandler);

const startServer = async () => {
    try {
        await sequelize.authenticate();

        console.log("Database connection established successfully.");

        await sequelize.sync()
        console.log("Database synchronized successfully.");
        app.listen(process.env.PORT, () => {
            console.log("Server is running on port 3000");
        });
    } catch (err) {
        console.error("Unable to connect to the database:", err);
        process.exit(1);
    }
};


startServer();
