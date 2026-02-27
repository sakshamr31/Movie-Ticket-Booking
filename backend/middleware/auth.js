import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
    try{
        const auth = req.auth?.();

        if (!auth || !auth.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { userId } = auth;

        const user = await clerkClient.users.getUser(userId);

        if(user.privateMetadata.role !== 'admin'){
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        next();
    }

    catch(error){
        console.log(error.response?.data || error.message || error);

        return res.status(500).json({
            success: false, 
            message: "Internal Server Error"
        });
    }
}