import { HttpClientOption, IHttpPlugin, Request } from ".";
export declare const DEFAULT_MESSAGE = "\u7CFB\u7EDF\u5F02\u5E38";
export declare const DEFAULT_CODE = 500;
export declare const DEFAULT_DATA: null;
export declare class HttpClient {
    private readonly options;
    private static client;
    private static plugins;
    constructor(options: HttpClientOption);
    private client;
    private requestConfig;
    private response;
    private createClient;
    getPlugin<T = IHttpPlugin>(plugin: Function): T | IHttpPlugin | undefined;
    use(plugin: IHttpPlugin): this;
    post<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D>;
    get<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D>;
    delete<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D>;
    put<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D>;
}
//# sourceMappingURL=client.d.ts.map