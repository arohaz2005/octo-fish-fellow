import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js"   
import { 
    acceptFriendrequest, 
    getFriendRequests, 
    getMyFriends, 
    getOutgoingFriendRequests, 
    getRecomendedUsers, 
    sendFriendRequest 
} from "../controllers/user.controller.js";


const router = express.Router();

//apply auth middleware
router.use(protectRoute);

router.get("/", getRecomendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendrequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);


export default router;
