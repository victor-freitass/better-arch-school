function emailValidator (email1: string, email2?:string): boolean {
    if (email1 && email2) {
        return /^\S+@\S+\.\S+$/.test(email1) && /^\S+@\S+\.\S+$/.test(email2) ? true : false;
    } 
    return /^\S+@\S+\.\S+$/.test(email1); 
}

import axios from 'axios';

async function imgurValidate(url: string): Promise<boolean> {

    const imgurHost = new URL('', 'https://i.imgur.com/').hostname;
    const checkUrl = new URL('', url).hostname;

    if (imgurHost !== checkUrl) {
        throw "Only Imgur photos are allowed. Create a photo there if you don't have.";
    }

    const validateImage = await axios.get(url)
        .then(res => {
            return res.status;
        }).catch(_ => false);

    if (!validateImage || validateImage === 404) {
        throw 'Insert an existing photo from imgur.com';
    }

    return true;
}

export { emailValidator, imgurValidate }; 