import express, { Express } from 'express';
import dotenv from 'dotenv';
dotenv.config(); 

import SchoolTeamRoutes from './routes/SchoolTeamRoutes';
import client from './config/database/pgConnection';

//tirei swegger. Se ainda quiser fazer isso, baixa ai. ACho q n vou fazer... n vou perder 30hrs de vida.

import mongoose from 'mongoose';
const mongoConnection = process.env.MONGO_CONNECTION as string;

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
        mongoose.connect(mongoConnection).then(_ => {
            console.log('Connected to MongoDB');
            client.connect().then(_ => {
                console.log('Connected to Postgres');
                this.express.listen(process.env.PORT, () => console.log('School_team API on...'));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }
}

new App();