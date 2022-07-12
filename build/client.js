"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = exports.DEFAULT_DATA = exports.DEFAULT_CODE = exports.DEFAULT_MESSAGE = void 0;
const axios_1 = __importDefault(require("axios"));
const samtools_1 = require("@frade-sam/samtools");
exports.DEFAULT_MESSAGE = '系统异常';
exports.DEFAULT_CODE = 500;
exports.DEFAULT_DATA = null;
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
            const _response = {
                status: exports.DEFAULT_CODE,
                statusText: String(exports.DEFAULT_CODE),
                data: {
                    message: exports.DEFAULT_MESSAGE,
                    data: exports.DEFAULT_DATA,
                    code: exports.DEFAULT_CODE,
                },
                headers: {},
                config: {},
            };
            if (typeof error === 'string') {
                _response.data.message = error;
            }
            if ((0, samtools_1.isObject)(error) && !isNaN(Number(error.code))) {
                const { response = {}, code, config = {} } = error;
                _response.status = response.status || exports.DEFAULT_CODE;
                _response.statusText = response.status || exports.DEFAULT_CODE;
                _response.data = {
                    message: response.message || exports.DEFAULT_MESSAGE,
                    code: code || response.status,
                    data: exports.DEFAULT_DATA
                },
                    _response.headers = config.headers;
                _response.config = config;
            }
            if ((0, samtools_1.isObject)(error) && !isNaN(Number(error.code))) {
                const { message = '' } = error;
                _response.status = exports.DEFAULT_CODE;
                _response.statusText = String(exports.DEFAULT_CODE);
                _response.data.message = message || exports.DEFAULT_MESSAGE;
                _response.data.code = _response.status;
            }
            console.log('http error: ' + error);
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
