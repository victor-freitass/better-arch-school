import { Request, Response } from "express";
import { CustomRequest } from "../config/auth-validate/verifyJWT";
import { JwtPayload } from "jsonwebtoken";
import imgurValidate from "../config/imgurValidate";
import client from "../config/database/pgConnection";
import queries from "./queries";

class PhotoController {
    async create (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { url } = req.body;
        if (!url) return res.status(400).send('Set a url from imgur');
        
        try {
            await imgurValidate(url);
        } catch (msg) {
            return res.status(400).send(msg);
        }
        try {
            const verifyUrl = (await client.query(queries.getPhotoAlreadyExists, [user_name, url])).rows[0];
            if (verifyUrl) return res.status(400).send('Duplicate photos are not allowed');
            await client.query(queries.insert, [url, user_name]);
        } catch (e) {
            console.log(e);
            return res.status(500).send();
        }

        return res.status(201).send('Photo published successfully!');
    }

    async getAll (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const allPhotos = (await client.query(queries.getAll, [user_name])).rows;

        return res.json(allPhotos);
    }

    async deleteById (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { id } = req.params;
        if (Number.isNaN(Number(id))) return res.status(400).send('Only numbers are allowed');

        const delResponse = (await client.query(queries.delete, [id, user_name])).rows[0];
        if(!delResponse) return res.status(404).send();

        return res.status(204).send();
    }

    async updateProfilePhoto (req: Request, res: Response) {
        const user_name = ((req as CustomRequest).token as JwtPayload).payload.user_name;
        const { url } = req.body;
        
        try {
            await imgurValidate(url);
        } catch (msg) {
            return res.status(400).send(msg);
        }

        const upResponse = (await client.query(queries.updateProfile, [url, user_name])).rows[0];
        if (!upResponse) return res.status(404).send();
        
        return res.status(204).send('Profile photo updated successfully');
    }

}

export default new PhotoController();