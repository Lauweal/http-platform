import axios from "axios";
import { HttpClientOption, IHttpPlugin, Instance, Response, Request } from ".";

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
      if (typeof error === 'string') {
        return this.response({
          status: 500,
          statusText: '500',
          data: { message: error, data: null },
          headers: {},
          config: {},
        });
      }
      const { response = {}, message = '', code, config = {} } = error;
      console.log('http error: ' + error)
      const _response: Response<any, any> = {
        status: response.status,
        statusText: response.status,
        data: {
          message: response.message,
          data: null,
          code: code || response.status,
        },
        headers: config.headers,
        config,
      }
      if (['ERR_NETWORK'].includes(error.code)) {
        _response.status = 500;
        _response.statusText = '500';
        _response.data.message = message || '网络异常';
        _response.data.code = _response.status;
      }
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