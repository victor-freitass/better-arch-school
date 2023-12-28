function emailValidator (email1: string, email2?:string): boolean {
    if (email1 && email2) {
        return /^\S+@\S+\.\S+$/.test(email1) && /^\S+@\S+\.\S+$/.test(email2) ? true : false;
    } 
    return /^\S+@\S+\.\S+$/.test(email1); 
}

export { emailValidator }; 