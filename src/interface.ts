import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpClient } from "./client";

export type Protocol = "http" | "https";
export type Instance = AxiosInstance;
export type Response<T = any, D = any> = AxiosResponse<T, D>;
export type Request<D = any> = AxiosRequestConfig<D>;

export type HttpClientOption = {
  host: string
}

export abstract class IHttpPlugin<T = any, D = any> {
  constructor(...args: any) { }
  abstract request(config: Request<T>, client: HttpClient): Request<T>;
  abstract response(res: Response<D, T>, config: Request<T>, client: HttpClient): Response<D, T>
}
