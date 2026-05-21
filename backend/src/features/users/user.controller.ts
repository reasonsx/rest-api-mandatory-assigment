import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { UserModel } from "./user.model";

export async function getProfile(req: AuthRequest, res: Response) {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: "Fetch failed", error: String(err) });
    }
}

export async function updateProfile(req: AuthRequest, res: Response) {
    try {
        const { userId } = req.params;
        const { username, profileImageUrl } = req.body;

        // Ensure user is updating their own profile or is an admin
        if (!req.user || (req.user.id !== userId && req.user.role !== 'admin')) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const update: any = {};
        if (username) update.username = username;
        if (profileImageUrl !== undefined) update.profileImageUrl = profileImageUrl;

        const user = await UserModel.findByIdAndUpdate(
            userId,
            { $set: update },
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: "Update failed", error: String(err) });
    }
}