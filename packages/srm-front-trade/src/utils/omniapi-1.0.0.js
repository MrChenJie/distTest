      
/** OmniApi-SDK */
(function(){
    const OMNI_API_SDK_VERSION = "1.0.0.24741600";

    /** 运行环境定义 */
    class OmniApiEnv {
        static PROD = "PROD";
        static UAT = "UAT";
    }

    /** SDK设置 */
    class OmniApiSdkSettings {
        static enableShowBuiltInPageInitError = true;
    }

    /** SDK常量 */
    class OmniApiConstant {
        //消息返回码定义
        static MessageCode = {
            SUCCESS: '000000'
        }

        static MessageDesc = {
            SDK_NOT_INIT: 'OmniApiSdk has not been initialized',
            PAGE_NOT_INIT: 'Page has not been initialized',
            PARAM_CMHK_CHANNEL_NOT_FOUND: 'cmhkChannel not found'
        }

        //domain地址定义
        static ENV_PROD_DOMAIN = "https://omniapi.hk.chinamobile.com";
        static ENV_UAT_DOMAIN = "https://omniapi-uat.hk.chinamobile.com";

        //omniapi服务地址定义
        static omniApiServiceUrls = {
            getDeviceID: "/api/omni-channel-service-common/rest/single/getDeviceID",
            init: "/api/omni-channel-service-common/rest/access-flow/init"
        }

        //omniapi应用体系参数key定义
        static KEY_OMNI_API_SDK_VERSION = "omni-js-sdk-version";
        static KEY_ACCEPT_LANGUAGE = "Accept-Language";
        static KEY_OMNI_REFERER = "omni-referer";
        static KEY_OMNI_CONTENT_TYPE = "omni-content-type";
        static KEY_OMNI_PARTNER_TOKEN = "omni-partner-token";
        static KEY_CMHK_CHANNEL = "cmhkChannel";
        static KEY_CHANNEL_ID = "channelId";
        static KEY_CMHK_TOKEN = "cmhkToken";
        static KEY_OMNI_TOKEN = "omniToken";
        static KEY_OMNI_CLIENT_DEVICE_ID = "omni-client-device-id";
        static KEY_OMNI_TRACE_ID = "omni-trace-id";
        static KEY_OMNI_TRACE_ROUTE = "omni-trace-route";
        static KEY_STAFF_ID = "staffId";
        static KEY_ORG_ID = "orgId";
    }

    class OmniApiXhr {
        xhr = new XMLHttpRequest();
        GET = "GET";
        POST = "POST";
        CONTENT_TYPE = "content-type";
        APPLICATION_JSON = "application/json";

        constructor() {
            this.xhr.timeout = 60000;
            this.xhr.withCredentials = true;
        }

        async requestInterceptor({url, method, payload, headers}) {
            console.info('requestInterceptor', url)
            return {url, method, payload, headers};
        }

        async responseInterceptor(responseText) {
            console.info('responseInterceptor')
            return responseText;
        }

        async executeXhr(url, method, payload, headers) {
            return new Promise(async (resolve, reject) => {
                const requestInterceptorReturn = await this.requestInterceptor({url, method, payload, headers});
                requestInterceptorReturn.url && (url = requestInterceptorReturn.url);
                requestInterceptorReturn.method && (method = requestInterceptorReturn.method);
                requestInterceptorReturn.payload && (payload = requestInterceptorReturn.payload);
                requestInterceptorReturn.headers && (headers = requestInterceptorReturn.headers);
                //
                this.xhr.open(method, url);
                //
                if(headers instanceof Map){
                    headers.forEach((value, key, map) => {
                        this.xhr.setRequestHeader(key, value);
                    });
                }
                //
                this.xhr.onreadystatechange = async () => {
                    if(this.xhr.readyState === this.xhr.DONE){
                        if(this.xhr.status === 200){
                            const headerMap = new Map;
                            // Get the raw header string
                            const headers = this.xhr.getAllResponseHeaders();
                            // Convert the header string into an array
                            // of individual headers
                            const headerArr = headers.trim().split(/[\r\n]+/);
                            // Create a map of header names to values
                            headerArr.forEach(function (line) {
                                let parts = line.split(': ');
                                let headerName = parts.shift();
                                let headerValue = parts.join(': ');
                                headerMap.set(headerName, headerValue);
                            });
                            //console.log(xhr.responseText);
                            const _responseText = await this.responseInterceptor(this.xhr.responseText);
                            resolve({responseBody: JSON.parse(_responseText), responseHeaders: headerMap});
                        }else{
                            //console.log(xhr.status);
                            reject("OmniApi XHR:" + url + "|status=" + this.xhr.status);
                        }
                    }
                };
                this.xhr.send(payload);
            });
        }

        async jsonGet(url, payload, headers) {
            if(!(headers instanceof Map)){
                headers = new Map();
            }
            headers.set(this.CONTENT_TYPE, this.APPLICATION_JSON);
            const _payload = JSON.stringify(payload);
            const response = await this.executeXhr(url, this.GET, _payload, headers);
            return response;
        }

        async jsonPost(url, payload, headers) {
            if(!(headers instanceof Map)){
                headers = new Map();
            }
            headers.set(this.CONTENT_TYPE, this.APPLICATION_JSON);
            const _payload = JSON.stringify(payload);
            const response = await this.executeXhr(url, this.POST, _payload, headers);
            return response;
        }

        async formPost(url, payload, headers) {
            if(!(headers instanceof Map)){
                headers = new Map();
            }
            const response = await this.executeXhr(url, this.POST, payload, headers);
            return response;
        }
    }

    /** sdk-util */
    class OmniApiUtil {
        //生成uuid
        static uuid = (len, radix) => {
            let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            let uuid = [],
                i;
            radix = radix || chars.length;

            if (len) {
                // Compact form
                for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
            } else {
                // rfc4122, version 4 form
                let r;

                // rfc4122 requires these characters
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
                uuid[14] = '4';

                // Fill in random data.  At i==19 set the high bits of clock sequence as
                // per rfc4122, sec. 4.1.5
                for (i = 0; i < 36; i++) {
                    if (!uuid[i]) {
                        r = 0 | Math.random() * 16;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                    }
                }
            }

            return uuid.join('');
        }

        //判断是否是空值
        static isVoidValue(value){
            if(value != undefined && value != "" && value != null && value != "null"){
                return false;
            }
            return true;
        }

        //获取输入参数
        static getInputParam = (paramName, urlSearchParams, wujieSearchObjectArray, browserStorage) => {
            let paramValue = "";
            //try get from url-querystring
            let _paramValue = urlSearchParams.get(paramName);
            //try get from WUJIE
            if(OmniApiUtil.isVoidValue(_paramValue)){
                if (window.__POWERED_BY_WUJIE__) {
                    for(let i=0; i < wujieSearchObjectArray.length; i++){
                        let item = wujieSearchObjectArray[i];
                        if(typeof(item) == 'object'){
                            if(!OmniApiUtil.isVoidValue(item[paramName])){
                                _paramValue = item[paramName];
                                break;
                            }
                        }
                    }
                }
            }
            //try get from storage
            if(OmniApiUtil.isVoidValue(_paramValue)){
                _paramValue = browserStorage.getItem(paramName);
            }
            //
            if(!OmniApiUtil.isVoidValue(_paramValue)){
                paramValue = _paramValue;
            }
            //
            return paramValue;
        }

        /**
         * 保存输入的参数
         * @param {*} paramName key
         * @param {*} paramValue value
         * @param {*} browserStorage localStorage/sessionStorage
         */
        static store = (paramName, paramValue, browserStorage) => {
            browserStorage.setItem(paramName, paramValue);
        }

        /**
         * 获取cmhkChannel并保存
         * @returns
         */
        static getCmhkChannel = () => {
            let result = OmniApiUtil.getInputParam(OmniApiConstant.KEY_CMHK_CHANNEL
                , new URL(document.location).searchParams
                , [window.$wujie && window.$wujie.props && window.$wujie.props.data]
                , sessionStorage);
            OmniApiUtil.store(OmniApiConstant.KEY_CMHK_CHANNEL, result, sessionStorage);
            return result;
        }

        /**
         * 获取语言
         * @returns
         */
        static getAcceptLanguage = () => {
            let pathSplit = location.pathname.split("/");
            if(pathSplit.length > 2) {
                let pathLang = pathSplit[3];
                switch (pathLang) {
                    case "tc":
                        return "zh-HK";
                    case "sc":
                        return "zh-CN";
                    case "en":
                        return "en-US";
                }
            }
            return undefined;
        }

        /**
         * 获取OmniReferer
         * @returns
         */
        static getOmniReferer = () => {
            return location.pathname;
        }

        /**
         * 获取cmhkToken并保存
         * @returns
         */
        static getCmhkToken = () => {
            let result = OmniApiUtil.getInputParam(OmniApiConstant.KEY_CMHK_TOKEN
                , new URL(document.location).searchParams
                , [window.$wujie && window.$wujie.props && window.$wujie.props.data]
                , sessionStorage);
            OmniApiUtil.store(OmniApiConstant.KEY_CMHK_TOKEN, result, sessionStorage);
            return result;
        }

        /**
         * 获取omniToken并保存
         * @returns
         */
        static getOmniToken = () => {
            let result = OmniApiUtil.getInputParam(OmniApiConstant.KEY_OMNI_TOKEN
                , new URL(document.location).searchParams
                , [window.$wujie && window.$wujie.props && window.$wujie.props.data]
                , sessionStorage);
            OmniApiUtil.store(OmniApiConstant.KEY_OMNI_TOKEN, result, sessionStorage);
            return result;
        }

        /**
         * 获取staffId并保存
         * @returns
         */
        static getStaffId = () => {
            let result = OmniApiUtil.getInputParam(OmniApiConstant.KEY_STAFF_ID
                , new URL(document.location).searchParams
                , [window.$wujie && window.$wujie.props && window.$wujie.props.data, window.$wujie && window.$wujie.props && window.$wujie.props.data && window.$wujie.props.data.busiData]
                , sessionStorage);
            OmniApiUtil.store(OmniApiConstant.KEY_STAFF_ID, result, sessionStorage);
            return result;
        }

        /**
         * 获取orgId并保存
         * @returns
         */
        static getOrgId = () => {
            let result = OmniApiUtil.getInputParam(OmniApiConstant.KEY_ORG_ID
                , new URL(document.location).searchParams
                , [window.$wujie && window.$wujie.props && window.$wujie.props.data, window.$wujie && window.$wujie.props && window.$wujie.props.data && window.$wujie.props.data.busiData]
                , sessionStorage);
            OmniApiUtil.store(OmniApiConstant.KEY_ORG_ID, result, sessionStorage);
            return result;
        }

        /**
         * 获取设备ID并保存
         * @param {*} headers
         * @returns
         */
        static getDeviceId = (headers) => {
            return new Promise(async (resolve, reject) => {
                let deviceId = localStorage.getItem(OmniApiConstant.KEY_OMNI_CLIENT_DEVICE_ID);
                if(OmniApiUtil.isVoidValue(deviceId)){
                    let getDeviceIDResult = (await new OmniApiXhr().jsonPost(await OmniApiCore.getOmniApiDomain() + OmniApiConstant.omniApiServiceUrls.getDeviceID,{}, headers)).responseBody;
                    console.info('getDeviceIDResult', getDeviceIDResult);
                    if(getDeviceIDResult.code == OmniApiConstant.MessageCode.SUCCESS){
                        deviceId = getDeviceIDResult.data.deviceId;
                        //save
                        OmniApiUtil.store(OmniApiConstant.KEY_OMNI_CLIENT_DEVICE_ID, deviceId, localStorage);
                        //
                        resolve(deviceId);
                    }else{
                        reject("getDeviceId");
                    }
                }else{
                    resolve(deviceId);
                }
            });
        }
        // 生成traceId
        static async genTraceId(headers){
            return new Promise(async (resolve, reject) => {
                const traceId = (await OmniApiUtil.getDeviceId(headers)).replace("OCD", "TRA") + OmniApiUtil.uuid(8);
                resolve(traceId);
            })
        }
    }

    /** sdk-core */
    class OmniApiCore {
        static omniApiXhrConfig;
        static sdkIsInited = false;
        static pageIsInited = false;
        static omniApiDomain;
        static omniPartnerToken;
        static cmhkChannel;

        /**
         * 校验是否完成sdk初始化
         * @returns {boolean}
         */
        static checkSdkInitStateReady = () => {
            if (OmniApiCore.sdkIsInited) {
                return true;
            }
            return false;
        }

        /**
         * 校验是否完成sdk&page初始化
         * @returns {boolean}
         */
        static checkPageInitStateReady = () => {
            if (OmniApiCore.sdkIsInited && OmniApiCore.pageIsInited) {
                return true;
            }
            return false;
        }

        /**
         * 获取omniapi domain
         * @returns
         */
        static getOmniApiDomain = async () => {
            return new Promise(async (resolve, reject) => {
                if(!OmniApiCore.checkSdkInitStateReady()){
                    reject(OmniApiConstant.MessageDesc.SDK_NOT_INIT);
                    return;
                }
                resolve(OmniApiCore.omniApiDomain);
            });
        }

        /**
         * 获取referer
         * @returns
         */
        static getFixedRefererByEnv = () => {
            if (window.__POWERED_BY_WUJIE__) {
                return window.$wujie.shadowRoot.baseURI;
            } else {
                return top.location.href;
            }
        }

        /**
         * sdk初始化
         * @param {*} env 运营环境
         * @param {*} omniPartnerToken 合作伙伴token
         * @returns
         */
        static sdkInit = (env, omniPartnerToken) => {
            //根据环境判断domain
            if(OmniApiEnv.PROD == env) {
                OmniApiCore.omniApiDomain = OmniApiConstant.ENV_PROD_DOMAIN;
            }else if(OmniApiEnv.UAT == env){
                OmniApiCore.omniApiDomain = OmniApiConstant.ENV_UAT_DOMAIN;
            }else{
                console.info('invalid env:' + env);
            }
            if(OmniApiUtil.isVoidValue(omniPartnerToken)){
                console.info('invalid omniPartnerToken:' + omniPartnerToken);
            }
            OmniApiCore.omniPartnerToken = omniPartnerToken;
            OmniApiCore.cmhkChannel = OmniApiUtil.getCmhkChannel();
            OmniApiCore.sdkIsInited = true;
            console.info('sdkInit process over')
            return {isOK: true};
        }

        /**
         * 获取omniapi应用体系请求头
         * @returns
         */
        static getHeaders = async () => {
            return new Promise(async (resolve, reject) => {
                if(!OmniApiCore.checkSdkInitStateReady()){
                    resolve({isOK:false,detail:OmniApiConstant.MessageDesc.SDK_NOT_INIT});
                    return;
                }
                if(OmniApiUtil.isVoidValue(OmniApiUtil.getCmhkChannel())){
                    resolve({isOK:false,detail:OmniApiConstant.MessageDesc.PARAM_CMHK_CHANNEL_NOT_FOUND});
                    return;
                }
                let headers = new Map();
                headers.set(OmniApiConstant.KEY_OMNI_API_SDK_VERSION, OMNI_API_SDK_VERSION);
                headers.set(OmniApiConstant.KEY_OMNI_TRACE_ROUTE, "js-sdk");
                headers.set(OmniApiConstant.KEY_OMNI_CONTENT_TYPE, "omni/api");
                headers.set(OmniApiConstant.KEY_OMNI_PARTNER_TOKEN, OmniApiCore.omniPartnerToken);
                OmniApiUtil.isVoidValue(OmniApiUtil.getOmniReferer()) || headers.set(OmniApiConstant.KEY_OMNI_REFERER, OmniApiUtil.getOmniReferer());
                OmniApiUtil.isVoidValue(OmniApiUtil.getAcceptLanguage()) || headers.set(OmniApiConstant.KEY_ACCEPT_LANGUAGE, OmniApiUtil.getAcceptLanguage());
                OmniApiUtil.isVoidValue(OmniApiUtil.getCmhkChannel()) || headers.set(OmniApiConstant.KEY_CMHK_CHANNEL, OmniApiUtil.getCmhkChannel());
                OmniApiUtil.isVoidValue(OmniApiUtil.getCmhkChannel()) || headers.set(OmniApiConstant.KEY_CHANNEL_ID, OmniApiUtil.getCmhkChannel());//channelId=cmhkChannel
                OmniApiUtil.isVoidValue(OmniApiUtil.getCmhkToken()) || headers.set(OmniApiConstant.KEY_CMHK_TOKEN, OmniApiUtil.getCmhkToken());
                OmniApiUtil.isVoidValue(OmniApiUtil.getOmniToken()) || headers.set(OmniApiConstant.KEY_OMNI_TOKEN, OmniApiUtil.getOmniToken());
                OmniApiUtil.isVoidValue(OmniApiUtil.getStaffId()) || headers.set(OmniApiConstant.KEY_STAFF_ID, OmniApiUtil.getStaffId());
                OmniApiUtil.isVoidValue(OmniApiUtil.getOrgId()) || headers.set(OmniApiConstant.KEY_ORG_ID, OmniApiUtil.getOrgId());
                OmniApiUtil.isVoidValue(await OmniApiUtil.getDeviceId(headers)) || headers.set(OmniApiConstant.KEY_OMNI_CLIENT_DEVICE_ID, await OmniApiUtil.getDeviceId(headers));
                OmniApiUtil.isVoidValue(await OmniApiUtil.genTraceId(headers)) || headers.set(OmniApiConstant.KEY_OMNI_TRACE_ID, await OmniApiUtil.genTraceId(headers));
                resolve({isOK:true,detail:headers});
            });
        }

        /**
         * 页面初始化
         * @returns
         */
        static pageInit = async () => {
            return new Promise(async (resolve, reject) => {
                if(!OmniApiCore.checkSdkInitStateReady()){
                    OmniApiCore.showBuiltInPageInitErrorIfEnabled(OmniApiConstant.MessageDesc.SDK_NOT_INIT);
                    resolve({isOK:false,detail:OmniApiConstant.MessageDesc.SDK_NOT_INIT});
                    return;
                }
                //set headers
                const {isOK, detail} = await OmniApiCore.getHeaders();
                if(!isOK){
                    OmniApiCore.showBuiltInPageInitErrorIfEnabled(detail);
                    resolve({isOK, detail});
                    return;
                }
                const headers = detail;
                console.info("headers", headers);
                //call service
                const initResult = await new OmniApiXhr().jsonPost(OmniApiCore.omniApiDomain + OmniApiConstant.omniApiServiceUrls.init, {}, headers);
                const responseBody = initResult.responseBody;
                console.info('initResult', initResult)
                resolve({isOK: responseBody.code === OmniApiConstant.MessageCode.SUCCESS
                    , detail: responseBody});
                OmniApiCore.pageIsInited = true;
                console.info('pageInit process over')
            });
        }

        static showBuiltInPageInitErrorIfEnabled = (textContent) => {
            if(!OmniApiSdkSettings.enableShowBuiltInPageInitError) {
                return;
            }
            //
            document.body.innerHTML = "";
            //
            const errorOverlay = document.createElement('div');
            errorOverlay.className = "omniapi-sdk-errorOverlay";
            errorOverlay.style.position = 'fixed';
            errorOverlay.style.top = '0';
            errorOverlay.style.left = '0';
            errorOverlay.style.width = '100%';
            errorOverlay.style.height = '100%';
            errorOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            errorOverlay.style.backdropFilter = 'blur(5px)';
            errorOverlay.style.display = 'flex';
            errorOverlay.style.justifyContent = 'center';
            errorOverlay.style.alignItems = 'center';
            errorOverlay.style.zIndex = '9999';
            // 创建SVG图标元素
            const ns = "http://www.w3.org/2000/svg";
            // 创建SVG元素
            let svg = document.createElementNS(ns, "svg");
            svg.setAttribute("width", "90%");
            svg.setAttribute("height", "250");
            svg.setAttribute("viewBox", "0 0 200 250");
            // 创建圆形元素
            let circle = document.createElementNS(ns, "circle");
            circle.setAttribute("cx", "100");
            circle.setAttribute("cy", "100");
            circle.setAttribute("r", "80");
            circle.setAttribute("stroke", "#000000");
            circle.setAttribute("stroke-width", "10");
            circle.setAttribute("fill", "none");
            // 创建斜杠元素
            let line = document.createElementNS(ns, "line");
            line.setAttribute("x1", "30");
            line.setAttribute("y1", "30");
            line.setAttribute("x2", "170");
            line.setAttribute("y2", "170");
            line.setAttribute("stroke", "#000000");
            line.setAttribute("stroke-width", "10");
            // 创建文字元素
            let text = document.createElementNS(ns, "text");
            text.setAttribute("x", "100"); // 文字起始点的x坐标
            text.setAttribute("y", "220"); // 文字起始点的y坐标
            text.setAttribute("font-family", "Arial, sans-serif");
            text.setAttribute("font-size", "24");
            text.setAttribute("text-anchor", "middle"); // 设置水平居中
            text.textContent = textContent;
            // 将圆形和斜杠添加到SVG
            svg.appendChild(circle);
            svg.appendChild(line);
            svg.appendChild(text);
            errorOverlay.appendChild(svg);
            document.body.appendChild(errorOverlay)
        }

        /**
         * 请求拦截器
         * @param interceptor
         * @returns {Promise<void>}
         */
        static requestXhrInterceptor = async (interceptor) => {
            if(!OmniApiCore.checkSdkInitStateReady()){
                throw new Error(OmniApiConstant.MessageDesc.SDK_NOT_INIT);
                return;
            }
            OmniApiCore.omniApiXhrConfig.requestInterceptor = interceptor;
        }

        /**
         * 响应拦截器
         * @param interceptor
         * @returns {Promise<void>}
         */
        static responseXhrInterceptor = async (interceptor) => {
            if(!OmniApiCore.checkSdkInitStateReady()){
                throw new Error(OmniApiConstant.MessageDesc.SDK_NOT_INIT);
                return;
            }
            OmniApiCore.omniApiXhrConfig.responseInterceptor = interceptor;
        }

        /**
         * JSON协议GET方法请求接口
         * @param url
         * @param payload
         * @param headers
         * @returns {Promise<any>}
         */
        static jsonGetXhr = async (url, payload, headers) => {
            if(!OmniApiCore.checkPageInitStateReady()){
                throw new Error(OmniApiConstant.MessageDesc.PAGE_NOT_INIT);
            }
            if(!(headers instanceof Map)){
                headers = new Map();
            }
            const {isOK, detail} = await OmniApiCore.getHeaders();
            if(!isOK){
                resolve({isOK, detail});
                return;
            }
            const omniHeaders = detail;
            omniHeaders.forEach((value, key, map) => {
                headers.set(key, value);
            });
            const xhr = new OmniApiXhr();
            return (await xhr.jsonGet(url, payload, headers)).responseBody;
        }

        /**
         * JSON协议POST方法请求接口
         * @param url
         * @param payload
         * @param headers
         * @returns {Promise<any>}
         */
        static jsonPostXhr = async (url, payload, headers) => {
            if(!OmniApiCore.checkPageInitStateReady()){
                throw new Error(OmniApiConstant.MessageDesc.PAGE_NOT_INIT);
            }
            if(!(headers instanceof Map)){
                headers = new Map();
            }
            const {isOK, detail} = await OmniApiCore.getHeaders();
            if(!isOK){
                resolve({isOK, detail});
                return;
            }
            const omniHeaders = detail;
            omniHeaders.forEach((value, key, map) => {
                headers.set(key, value);
            });
            const xhr = new OmniApiXhr();
            return (await xhr.jsonPost(url, payload, headers)).responseBody;
        }

        /**
         * FORM-DATA协议POST方法请求接口
         * @param url
         * @param payload - FormData类型
         * @param headers
         * @returns {Promise<any>}
         */
        static formPostXhr = async (url, payload, headers) => {
            if(!OmniApiCore.checkPageInitStateReady()){
                throw new Error(OmniApiConstant.MessageDesc.PAGE_NOT_INIT);
            }
            if(!(headers instanceof Map)){
                headers = new Map();
            }
            const {isOK, detail} = await OmniApiCore.getHeaders();
            if(!isOK){
                resolve({isOK, detail});
                return;
            }
            const omniHeaders = detail;
            omniHeaders.forEach((value, key, map) => {
                headers.set(key, value);
            });
            const xhr = new OmniApiXhr();
            return (await xhr.formPost(url, payload, headers)).responseBody;
        }

    }

    /** public OmniApiEnv */
    window.OmniApiEnv = OmniApiEnv;
    /** public OmniApi */
    window.OmniApi = {
        settings: OmniApiSdkSettings,
        sdkInit: OmniApiCore.sdkInit,
        pageInit: OmniApiCore.pageInit,
        jsonGetXhr: OmniApiCore.jsonGetXhr,
        jsonPostXhr: OmniApiCore.jsonPostXhr,
        formPostXhr: OmniApiCore.formPostXhr
    };
})();

    
