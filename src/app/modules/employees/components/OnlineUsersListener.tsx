import { useEffect } from "react";
import ChatHub from "../../../../server/ChatHub";
import { resetOnlineUsers, setOnlineUsers } from "../../../Redux/Reducers/onlineUsersSlice";
import { useAppDispatch } from "../../../Redux/hooks";

export const OnlineUsersListener = () => {
    const dispatch = useAppDispatch();
    const chatHub = ChatHub.getInstance();

    useEffect(() => {
        const setupListener = () => {
            const chatHubConnection = chatHub.getConnection();
            if (!chatHubConnection) return;

            const handleUserOnlineStatus = (userIds: string[]) => {
                dispatch(setOnlineUsers(userIds));
            };

            chatHubConnection.on("employeeOnlineStatus", handleUserOnlineStatus);
            // Invoke to get initial online users list
            chatHubConnection.invoke("NotifyOnlineUserPresence").catch(() => { });

            return () => {
                chatHubConnection.off("employeeOnlineStatus", handleUserOnlineStatus);
            };
        };

        // Subscribe when connection is ready
        chatHub.onReady(() => {
            setupListener();
        });

        return () => {
            dispatch(resetOnlineUsers());
        };
    }, [chatHub, dispatch]);

    return null;
};
