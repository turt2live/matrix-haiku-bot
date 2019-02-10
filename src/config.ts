import * as config from "config";

interface IConfig {
    homeserverUrl: string;
    accessToken: string;
    dataPath: string;
}

export default <IConfig>config;