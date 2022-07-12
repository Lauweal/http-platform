"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
class HttpClient {
    options;
    static client;
    static plugins = new Map;
    constructor(options) {
        this.options = options;
        return this.createClient();
    }
    client;
    requestConfig(_config) {
        const plugins = Array.from(HttpClient.plugins.values());
        return plugins.reduce((config, plugin) => {
            if (typeof plugin.request === 'function')
                return plugin.request(config, this);
            return config;
        }, _config);
    }
    response(_res) {
        const plugins = Array.from(HttpClient.plugins.values());
        return plugins.reduce((res, plugin) => {
            if (typeof plugin.response === 'function')
                return plugin.response(res, _res.config, this);
            return res;
        }, _res.data);
    }
    createClient() {
        if (HttpClient.client) {
            return HttpClient.client;
        }
        HttpClient.client = this;
        const { host = '' } = this.options || {};
        HttpClient.client.client = axios_1.default.create({
            baseURL: host,
            withCredentials: true,
            timeout: 5000
        });
        HttpClient.client.client.interceptors.request.use(this.requestConfig, (err) => {
            console.log(err);
            return Promise.reject(err);
        });
        HttpClient.client.client.interceptors.response.use(this.response, (error) => {
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
            console.log('http error: ' + error);
            const _response = {
                status: response.status,
                statusText: response.status,
                data: {
                    message: response.message,
                    data: null,
                    code: code || response.status,
                },
                headers: config.headers,
                config,
            };
            if (['ERR_NETWORK'].includes(error.code)) {
                _response.status = 500;
                _response.statusText = '500';
                _response.data.message = message || '网络异常';
                _response.data.code = _response.status;
            }
            return this.response(_response);
        });
        return HttpClient.client;
    }
    getPlugin(plugin) {
        const _plugin = HttpClient.plugins.get(plugin);
        if (!_plugin)
            return undefined;
        return _plugin;
    }
    use(plugin) {
        HttpClient.plugins.set(plugin.constructor, plugin);
        return this;
    }
    post(url, data, config) {
        return this.client.post(url, data, config).then((res) => res.data);
    }
    get(url, data, config) {
        return this.client.get(url, { ...config, params: data });
    }
    delete(url, data, config) {
        return this.client.delete(url, { ...config, params: data });
    }
    put(url, data, config) {
        return this.client.put(url, { ...config, params: data });
    }
}
exports.HttpClient = HttpClient;
