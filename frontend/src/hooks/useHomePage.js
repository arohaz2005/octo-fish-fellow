import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getOutgoingFriendReqs, getRecommendedUsers, getUserFriends, sendFriendRequest } from "../lib/api.js";

const useHomePage = () => {

    // const queryClient = useQueryClient();

    // const [ outgoingRequestIds, setOutgoingRequestIds ] = useState({})

    // const { data:frineds=[], isLoading:loadingFriends } = useQuery({
    //     queryKey: ["friends"],
    //     queryFn: getUserFriends,
    // })

    // const { data:recommendedUsers=[], isLoading:loadingUsers } = useQuery({
    //     queryKey: ["users"],
    //     queryFn: getRecommendedUsers,
    // })

    // const { data:outgoingFriendReqs=[] } = useQuery({
    //     queryKey: ["outgoingFriendReqs"],
    //     queryFn: getOutgoingFriendReqs,
    // })

    // const { 
    //     mutate:sendRequestMutation, 
    //     isPending
    // } = useMutation({
    //     mutationFn: sendFriendRequest,
    //     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] })
    // })

    return (
    <div>useHomePage</div>
  )
}

export default useHomePage