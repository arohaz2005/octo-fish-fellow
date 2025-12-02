import User from "../model/User.js";
import FriendRequest from "../model/FriendRequest.js";



export async function getRecomendedUsers(req, res) {

    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recomendedUsers = await User.find({
            $and: [
                {_id:{$ne: currentUserId} },    //exclude current users
                {_id: {$nin: currentUser.friends} },    //exclude current user's Friends
                {isOnboarded: true}
            ]
        });

        res.status(200).json(recomendedUsers);

    } catch (error) {
        console.error("Error in getRecomendedUsers controller", error.message);
    }
}

export async function getMyFriends(req, res) {
    
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends", "username profilePicture nativeLanguage learningLanguage");

        res.status(200).json(user.friends);

    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const{ id: recipientId} = req.params

        //prevent sending req to yourself
        if(myId === recipientId)
            return res.status(400).json({ message: "You can't send request to yourself" });

        //check if recipient exist or not
        const recipient = await User.findById(recipientId)

        if(!recipient)
            return res.status(404).json({ message: "Recipient not found" });
        
        //check if user is already friends
        if(recipient.friends.includes(myId))
            return res.status(400).json({ message: "You're already friend with this user"});

        //checck if a req already exists
        const existingReq = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId },
            ],
        });

        if(existingReq) {
            return res
                .status(400)
                .json({ message: "A friend request already exists between you and the user" });
            }

        //establish the friend req
        const friendRequest = await FriendRequest.create({
            sender: myId, 
            recipient: recipientId,
        })

        res.status(201).json(friendRequest)


    } catch (error) {
        console.error("Error in sendFriendrequest controller", error.message)
        res.status(500).json({ message: "Internal server error" })
    }

    
}

export async function acceptFriendrequest(req, res) {
    try {
        const { id:requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) 
            return res.status(404).json({ message: "Friend request not found" });

        //verify the current user is the recipient
        if(friendRequest.recipient.toString() !== req.user.id)
            return res.status(403).json({ message: "You're not authorized to accept this request" });

        friendRequest.status = "accepted";
        await friendRequest.save();

        //add each user to other's Friends array *NOTE: &addToSet: adds elements to an array only if they do not exist.
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });

        res.status(200).json({ message: "Friend request accepted" });

    } catch (error) {
        console.error("Error in acceptFriendrequest controller", error.message );
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getFriendRequests(req, res) {
     
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "username profilePicture nativelanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "username profilePicture");

        res.status(200).json({ incomingReqs, acceptedReqs});

    } catch (error) {
        console.error("Error in getFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient", "username profilePicture nativelanguage learningLanguage");

        res.status(200).json(outgoingReqs);

    } catch (error) {
        console.error("Error in getOutgoingFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
