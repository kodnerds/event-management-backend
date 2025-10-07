import bcrypt from 'bcrypt';
const SALT_ROUNDS = Number(10);

export const hashPassword = async(password:string):Promise<string> =>{
    const hashed = await bcrypt.hash(password,SALT_ROUNDS)
    return hashed;
}

export const comparePassword = async(password:string,hashedPassword:string):Promise<boolean> =>{
    return bcrypt.compare(password,hashedPassword)
};