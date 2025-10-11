import { UserRole } from "../entities";
import { UserRepository } from "../repositories";
import { hashPassword } from "../utils/hash";

// eslint-disable-next-line max-params
export const signUp = async(firstName:string,lastName:string,email:string,password:string,age:number,favouriteArtists:string[],favouriteGenres:string[]) => {
   try {
     const userRepository = new UserRepository()
 
     if (!firstName || !lastName || !email || !password) {
         return {
             code:401,
             success:false,
             error:"Firstname,Lastname or Email included",
             data:null
         }
     }
 
     const hashed = await hashPassword(password);
 
     const newUser = await userRepository.create({
         firstName,lastName,email,
         password:hashed,
         role:UserRole.USER,
         favouriteGenres,
     })
 
     return{
         code:200,
         success:true,
         message:"User created successfully",
         data:{
             firstName:newUser.firstName,
             lastName:newUser.lastName,
             password:newUser.password,
             role:newUser.role
         }
     }
   } catch (error) {
        return{
            code:500,
            success:false,
            message:"User not created successfully",
            error,
            data:null
        }
   }
}
