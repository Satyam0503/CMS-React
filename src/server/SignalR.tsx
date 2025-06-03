// this hook connect to signalR hub
import * as signalR from "@microsoft/signalr";
import { BaseUrl } from "../utils/constant/Constant";

const NOTICEBOARDURL = '/notice-board'

class Connector {
    private static instance: Connector | null = null;
    private connection: signalR.HubConnection | null = null;

    private constructor() { }

    public static getInstance(): Connector {
        if (!Connector.instance) {
            Connector.instance = new Connector();
        }
        return Connector.instance;
    }

    public startConnection = async (token: string) => {
        if (this.connection) return; // Prevent duplicate connections

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${BaseUrl}${NOTICEBOARDURL}`, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect()
            .build();

        this.connection.onreconnected(() => {
            console.log("Reconnected to SignalR hub");
        });

        this.connection.onclose((err) => {
            console.warn("SignalR connection closed", err);
        });

        try {
            await this.connection.start();
            console.log("SignalR connection established");
        } catch (error) {
            console.error("SignalR connection error:", error);
        }
    };

    public stopConnection = async (): Promise<void> => {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            console.log("SignalR connection stopped");
        }
    };

    public getConnetion = () => {
        return this.connection;
    }
}

export default Connector;
