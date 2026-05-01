import {Schema, model} from "mongoose";
import {User} from "../interfaces/user.interface";

const userSchema = new Schema<User>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            minlength: 5,
            maxlength: 100,
            trim: true,
            lowercase: true,
        },

        username: {
            type: String,
            minlength: 3,
            maxlength: 30,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
            minlength: 60,
            maxlength: 100,
            select: false,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const UserModel = model<User>("User", userSchema);