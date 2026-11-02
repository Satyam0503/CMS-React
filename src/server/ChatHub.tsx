import * as signalR from "@microsoft/signalr";
import { BaseUrl, ServiceUrl } from "../utils/constant/Constant";
import { getLocalKey } from "../app/modules/auth";

class ChatHub {
    private static instance: ChatHub | null = null;
    private connection: signalR.HubConnection | null = null;
    private onReadyCallbacks: (() => void)[] = [];
    private activeToken: string | null = null;

    private constructor() { }

    public static getInstance(): ChatHub {
        if (!ChatHub.instance) {
            ChatHub.instance = new ChatHub();
        }
        return ChatHub.instance;
    }

    public startConnection = async (token: string) => {
        const currentState = this.connection?.state;
        if (
            currentState === signalR.HubConnectionState.Connected ||
            currentState === signalR.HubConnectionState.Connecting ||
            currentState === signalR.HubConnectionState.Reconnecting
        ) {
            return;
        }

        if (this.connection && this.activeToken !== token) {
            await this.stopConnection();
        }

        if (!this.connection) {
            this.activeToken = token;
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${BaseUrl}${ServiceUrl.CHAT_HUB}`, {
                    accessTokenFactory: () => getLocalKey()?.token ?? this.activeToken ?? "",
                })
                .withAutomaticReconnect()
                .build();

            this.connection.onreconnected(() => {
                // Optionally add logging here for development only
                this.notifyReady();
            });

            this.connection.onclose((err) => {
                console.warn("SignalR connection closed", err);
            });
        }

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
            this.activeToken = null;
            this.onReadyCallbacks = [];
        }
    };

    public getConnection = () => {
        return this.connection;
    }
}

export default ChatHub;
