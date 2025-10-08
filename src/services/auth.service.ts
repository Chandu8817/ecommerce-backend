import { IShippingAddress, IUser, User } from "../models/User";
import { AppError } from "../utils/AppError";

export const register = async (userInput: Partial<IUser>) => {

    const { email } = userInput;

    const exists = await User.findOne({ email });
    if (exists) throw new Error("User already exists");
    const user = await User.create(userInput);
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


export const getAuthUser = async (_id: string) => {

    const user = await User.findById(_id);
    return user


}

export const addShippingAddress = async (_id: string, shippingAddress: IShippingAddress) => {

    const user = await User.findById(_id);
    if (!user) throw new Error("User not found");
    user.shippingAddress.push(shippingAddress);
    await user.save();
    return user

}

export const removeShippingAddress = async (_id: string, id: number) => {

    const user = await User.findById(_id);
    if (!user) throw new Error("User not found");
    const addresses = user.shippingAddress;
    addresses.splice(id, 1);
    user.shippingAddress = addresses;
    await user.save();
    return user

}

export const getShippingAddress = async (_id: string) => {

    const user = await User.findById(_id);
    if (!user) throw new Error("User not found");
    const shippingAddress = user.shippingAddress;
    return shippingAddress

}
