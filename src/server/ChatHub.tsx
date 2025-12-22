import * as signalR from "@microsoft/signalr";
import { BaseUrl, ServiceUrl } from "../utils/constant/Constant";

class ChatHub {
    private static instance: ChatHub | null = null;
    private connection: signalR.HubConnection | null = null;
    private onReadyCallbacks: (() => void)[] = [];

    private constructor() { }

    public static getInstance(): ChatHub {
        if (!ChatHub.instance) {
            ChatHub.instance = new ChatHub();
        }
        return ChatHub.instance;
    }

    public startConnection = async (token: string) => {
        if (this.connection?.state === signalR.HubConnectionState.Connected
            || this.connection?.state === signalR.HubConnectionState.Connecting
        ) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${BaseUrl}${ServiceUrl.CHAT_HUB}`, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect()
            .build();

        this.connection.onreconnected(() => {
            console.log("Reconnected to SignalR hub");
            this.notifyReady();
        });

        this.connection.onclose((err) => {
            console.warn("SignalR connection closed", err);
        });

        try {
            await this.connection.start();
            this.notifyReady();
        } catch (error) {
            console.error("SignalR connection error:", error);
        }
    };

    private notifyReady = () => {
        this.onReadyCallbacks.forEach(callback => callback());
        this.onReadyCallbacks = [];
    };

    public onReady = (callback: () => void) => {
        if (this.connection?.state === signalR.HubConnectionState.Connected) {
            callback();
        } else {
            this.onReadyCallbacks.push(callback);
        }
    };

    public stopConnection = async (): Promise<void> => {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            this.onReadyCallbacks = [];
        }
    };

    public getConnection = () => {
        return this.connection;
    }
}

export default ChatHub;
