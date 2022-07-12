import axios from "axios";
import { isObject } from '@frade-sam/samtools'
import { HttpClientOption, IHttpPlugin, Instance, Response, Request } from ".";

export const DEFAULT_MESSAGE = '系统异常';
export const DEFAULT_CODE = 500;
export const DEFAULT_DATA = null;


export class HttpClient {
  private static client: HttpClient;
  private static plugins: Map<Function, IHttpPlugin> = new Map;
  constructor(private readonly options: HttpClientOption) {
    return this.createClient()
  }

  private client!: Instance

  private requestConfig(_config: Request<any>) {
    const plugins = Array.from(HttpClient.plugins.values());
    return plugins.reduce((config, plugin) => {
      if (typeof plugin.request === 'function') return plugin.request(config, this);
      return config;
    }, _config)
  }

  private response(_res: Response<any, any>) {
    const plugins = Array.from(HttpClient.plugins.values());
    return plugins.reduce((res, plugin) => {
      if (typeof plugin.response === 'function') return plugin.response(res, _res.config, this);
      return res;
    }, _res.data)
  }

  private createClient() {
    if (HttpClient.client) {
      return HttpClient.client;
    }
    HttpClient.client = this;
    const { host = '' } = this.options || {};
    HttpClient.client.client = axios.create({
      baseURL: host,
      withCredentials: true,
      timeout: 5000
    })
    HttpClient.client.client.interceptors.request.use(this.requestConfig, (err) => {
      console.log(err);
      return Promise.reject(err);
    })
    HttpClient.client.client.interceptors.response.use(this.response, (error): any => {
      const _response: Response<any, any> = {
        status: DEFAULT_CODE,
        statusText: String(DEFAULT_CODE),
        data: {
          message: DEFAULT_MESSAGE,
          data: DEFAULT_DATA,
          code: DEFAULT_CODE,
        },
        headers: {},
        config: {},
      }

      if (typeof error === 'string') {
        _response.data.message = error;
      }
      if (isObject(error) && !isNaN(Number(error.code))) {
        const { response = {}, code, config = {} } = error;
        _response.status = response.status || DEFAULT_CODE;
        _response.statusText = response.status || DEFAULT_CODE;
        _response.data = {
          message: response.message || DEFAULT_MESSAGE,
          code: code || response.status,
          data: DEFAULT_DATA
        },
          _response.headers = config.headers;
        _response.config = config;
      }
      if (isObject(error) && !isNaN(Number(error.code))) {
        const { message = '' } = error;
        _response.status = DEFAULT_CODE;
        _response.statusText = String(DEFAULT_CODE);
        _response.data.message = message || DEFAULT_MESSAGE;
        _response.data.code = _response.status;
      }
      console.log('http error: ' + error);
      return this.response(_response);
    })
    return HttpClient.client;
  }

  getPlugin<T = IHttpPlugin>(plugin: Function): T | IHttpPlugin | undefined {
    const _plugin = HttpClient.plugins.get(plugin);
    if (!_plugin) return undefined
    return _plugin;
  }

  use(plugin: IHttpPlugin) {
    HttpClient.plugins.set(plugin.constructor, plugin)
    return this
  }

  post<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D> {
    return this.client.post(url, data, config).then((res) => res.data)
  }

  get<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D> {
    return this.client.get(url, { ...config, params: data })
  }
  delete<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D> {
    return this.client.delete(url, { ...config, params: data })
  }
  put<D = any>(url: string, data?: any, config?: Request<any> | undefined): Promise<D> {
    return this.client.put(url, { ...config, params: data })
  }
}