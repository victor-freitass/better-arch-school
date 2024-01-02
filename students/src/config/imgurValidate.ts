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

export default imgurValidate;