import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpClient } from "./client";
export declare type Protocol = "http" | "https";
export declare type Instance = AxiosInstance;
export declare type Response<T = any, D = any> = AxiosResponse<T, D>;
export declare type Request<D = any> = AxiosRequestConfig<D>;
export declare type HttpClientOption = {
    host: string;
};
export declare abstract class IHttpPlugin<T = any, D = any> {
    constructor(...args: any);
    abstract request(config: Request<T>, client: HttpClient): Request<T>;
    abstract response(res: Response<D, T>, config: Request<T>, client: HttpClient): Response<D, T>;
}
//# sourceMappingURL=interface.d.ts.map