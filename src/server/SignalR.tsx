// this hook connect to signalR hub
import * as signalR from "@microsoft/signalr";
import { BaseUrl, ServiceUrl } from "../utils/constant/Constant";
import { queryClient } from "../app/query/queryClient";
import { getLocalKey } from "../app/modules/auth";

class Connector {
    private static instance: Connector | null = null;
    private connection: signalR.HubConnection | null = null;
    private activeToken: string | null = null;

    private constructor() { }

    public static getInstance(): Connector {
        if (!Connector.instance) {
            Connector.instance = new Connector();
        }
        return Connector.instance;
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
                .withUrl(`${BaseUrl}${ServiceUrl.NOTIFICATION_HUB}`, {
                    accessTokenFactory: () => getLocalKey()?.token ?? this.activeToken ?? "",
                })
                .withAutomaticReconnect()
                .build();

            this.connection.onreconnected(() => {
                // Reconnection can follow a period in which another user
                // changed data. Refresh all cached API reads when the channel
                // becomes healthy again.
                void queryClient.invalidateQueries({ refetchType: "all" });
            });

            this.connection.onclose((err) => {
                console.warn("SignalR connection closed", err);
            });
        }

        try {
            await this.connection.start();
        } catch (error) {
            console.error("SignalR connection error:", error);
        }
    };

    public stopConnection = async (): Promise<void> => {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            this.activeToken = null;
        }
    };

    public getConnection = () => {
        return this.connection;
    }
}

export default Connector;
