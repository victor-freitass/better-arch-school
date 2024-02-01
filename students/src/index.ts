import express, { Express } from 'express';
import dotenv from 'dotenv';
dotenv.config(); 

import routes from './routes';
import client from './config/database/pgConnection';

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
        this.express.use(routes);
    }

    async connection () {
        mongoose.connect(mongoConnection).then(_ => {
            console.log('Connected to MongoDB');
            client.connect().then(_ => {
                console.log('Connected to Postgres');
                this.express.listen(process.env.PORT_STUDENTS, () => console.log('Student API on...'));
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }
}

new App();