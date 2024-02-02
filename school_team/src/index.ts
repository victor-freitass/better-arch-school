import express, { Express } from 'express';
import dotenv from 'dotenv';
dotenv.config(); 

import SchoolTeamRoutes from './routes/SchoolTeamRoutes';
import client from './config/database/pgConnection';

import mongoose from 'mongoose';

const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_PORT, MONGO_NAME } = process.env;

class App { 
    express: Express;

    constructor () {
        this.express = express();
        this.middlewares();
        this.routes();
        this.connection();
    }

    middlewares () {
        this.express.use(express.json());
    }

    routes () { 
        this.express.use(SchoolTeamRoutes);
    }

    async connection () {
        mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_NAME}?authSource=admin`)
        .then(_ => {

            console.log('Connected to MongoDB');
            client.connect().then(_ => {
                console.log('Connected to Postgres');
                this.express.listen(process.env.PORT_TEAM, () => console.log('School_team API on...'));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }
}

new App();