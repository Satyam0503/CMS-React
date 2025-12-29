import { useEffect } from "react";
import ChatHub from "../../../../server/ChatHub";
import { removeOnlineUser, resetOnlineUsers, setOnlineUsers } from "../../../Redux/Reducers/onlineUsersSlice";
import { useAppDispatch } from "../../../Redux/hooks";

export const OnlineUsersListener = () => {
    const dispatch = useAppDispatch();
    const chatHub = ChatHub.getInstance();

    useEffect(() => {
        let cleanupListeners: (() => void) | undefined;
        const setupListener = () => {
            const chatHubConnection = chatHub.getConnection();
            if (!chatHubConnection) return;

            const handleUserOnlineStatus = (data: { userIds: string[] }) => {
                dispatch(setOnlineUsers(data.userIds));
            };
            const handleUserOfflineStatus = (data: { userId: string }) => {
                dispatch(removeOnlineUser(data.userId));
            }

            chatHubConnection.on("employeeOnline", handleUserOnlineStatus);
            chatHubConnection.on("employeeOffline", handleUserOfflineStatus);

            cleanupListeners = () => {
                chatHubConnection.off("employeeOnline", handleUserOnlineStatus);
                chatHubConnection.off("employeeOffline", handleUserOfflineStatus);
            };
        };

        // Subscribe when connection is ready
        chatHub.onReady(() => {
            cleanupListeners?.();
            setupListener();
        });

        return () => {
            dispatch(resetOnlineUsers());
        };
    }, []);

    return null;
};
