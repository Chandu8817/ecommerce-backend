import { IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";

export const register = async (userInput: Partial<IUser>) => {

    const { name, email, password ,role} = userInput;
    
    const exists = await User.findOne({ email });
   if (exists) throw new Error("User already exists");
    const user = await User.create({ name, email, password,role });
    return user;


}

export const login = async (userInput: Partial<IUser>) => {

    const { email, password } = userInput;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password as string))) {
        return user
    } else {
         throw new AppError(
                "INVALID CREDIENTAILS",
                "Invalid credientails",
                404,
                [{ field: "userId", issue: "Does not exist in database" }]
              );
    }




}

export const  getAuthUser = async (_id :string)=>{

    const user = await User.findById(_id);
    return user


}
