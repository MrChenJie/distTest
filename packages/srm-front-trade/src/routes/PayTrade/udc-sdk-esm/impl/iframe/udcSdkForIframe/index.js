function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * desc: 第三方与 UDC 标准页面通信的 SDK
 * author: zhongpz@seeyon.com
 */
import UdcComponent from "./UdcComponent";
import { currentSDK } from "../../index";
;
/** 消息身份标识，消息一级认证标识 */
var _identifying = "__SEEYON_UDC__";
/** SDK支持的消息类型枚举  */
export var MessageTypeEnum;
(function (MessageTypeEnum) {
  MessageTypeEnum["callMethod"] = "callMethod";
  MessageTypeEnum["message"] = "message";
  MessageTypeEnum["callEvent"] = "callEvent";
})(MessageTypeEnum || (MessageTypeEnum = {}));
;
/** UDC SDK支持的方法名枚举，在UDC平台需要有对应的方法支持  */
export var MethodNameEnum;
(function (MethodNameEnum) {
  MethodNameEnum["ready"] = "ready";
  MethodNameEnum["insertComponent"] = "insertComponent";
})(MethodNameEnum || (MethodNameEnum = {}));
;
;
;
;
;
;
;
;
var UdcSdkForIfame = /*#__PURE__*/function () {
  function UdcSdkForIfame() {
    var _this = this;
    _classCallCheck(this, UdcSdkForIfame);
    /** 消息一级标识  */
    _defineProperty(this, "_identifying", _identifying);
    /** 当前页面唯一标识  */
    _defineProperty(this, "_nameSpaceId", void 0);
    /** SDK准备完成标识  */
    _defineProperty(this, "_is_ready", false);
    /** 自定义事件池  */
    _defineProperty(this, "_customEvents", {});
    /** 事件监听函数  */
    _defineProperty(this, "_eventListener", function (e, callBack) {
      try {
        var message = e.data;
        if (!_this._msgValidator(message)) {
          return;
        }
        //  ready 回调
        _this._readyCallBack(message, callBack);
        //  事件调用
        _this._callEvent(message);
      } catch (e) {
        console.error(e);
      }
    });
    /** 事件监听句柄函数  */
    _defineProperty(this, "_eventListenerHandler", function () {
      return void 0;
    });
    /**
     * 契约组件: 在第三方页面声明的组件，在UDC一定存在相同组件。
     * 这类组件用于不需要获取UDC组件信息的场景，减少查询组件开销。
     * */
    _defineProperty(this, "contractComponent", function (UdcComponentType, config) {
      return new UdcComponent(_this, {
        type: UdcComponentType,
        id: config === null || config === void 0 ? void 0 : config.id,
        isContract: true
      });
    });
    /** 创建组件 */
    _defineProperty(this, "createComponent", function (componentContext) {
      return new UdcComponent(_this).createComponent(componentContext);
    });
    /** 注册组件自定义事件 */
    _defineProperty(this, "registerComponentCustomEvents", function (_ref) {
      var id = _ref.id,
        type = _ref.type,
        func = _ref.func;
      if (!_this._customEvents[id]) {
        _this._customEvents[id] = {};
      }
      _this._customEvents[id][type] = func;
    });
    /** 客制化服务 */
    _defineProperty(this, "_customization", {
      CMI: {
        /** 为SDK实例提供：插入按钮到工具栏指定索引位置的能力 */
        insertBtnForToolbar: function insertBtnForToolbar(message) {
          var position = message.position,
            btns = message.btns,
            id = message.id;
          var $udcToolbar = _this.contractComponent('UdcToolBar', {
            id: id
          });
          var $btns = [];
          btns === null || btns === void 0 ? void 0 : btns.forEach(function (btn) {
            $btns.push(_this.createComponent({
              type: 'UdcButton',
              props: btn
            }));
          });
          $udcToolbar.insertComponent($btns, {
            position: position
          });
        }
      }
    });
    /** 获取客户定制API */
    _defineProperty(this, "getCustomApi", function () {
      var _tenant = currentSDK.baseInfo.tenant;
      var _tenantApi = _this._customization[_tenant];
      if (!_tenantApi) {
        console.error(!_tenant ? '缺少tenant信息' : '该tenant未定制过API');
        return;
      }
      return _tenantApi;
    });
    this._nameSpaceId = this._uuid();
  }
  _createClass(UdcSdkForIfame, [{
    key: "_uuid",
    value: /** UUID生成函数  */
    function _uuid() {
      var uuid = "xxx_xxxx_xxxx_yxxx_xxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === "x" ? r : r & 0x3 | 0x8;
        return "".concat(v.toString(16));
      });
      return "x".concat(uuid);
    }
    /** 接收消息合法性校验  */
  }, {
    key: "_msgValidator",
    value: function _msgValidator(message) {
      if (Object.prototype.toString.call(message) === "[object Object]" &&
      //  判断数据格式是否正确
      message._identifying === _identifying &&
      // 判断身份标识是否正确
      MessageTypeEnum[message.type] &&
      // 判断消息类型是否合规
      message._nameSpaceId === this._nameSpaceId // 命名空间是否匹配
      ) {
        return true;
      }
      return false;
    }
  }, {
    key: "_readyCallBack",
    value: /** SDK Ready Callback  */
    function _readyCallBack(message, callBack) {
      var _message$data, _message$data2, _message$data3;
      var signatureMethods = (_message$data = message.data) === null || _message$data === void 0 ? void 0 : _message$data.signatureMethods;
      var version = (_message$data2 = message.data) === null || _message$data2 === void 0 ? void 0 : _message$data2.version;
      if (message.type === MessageTypeEnum.message && ((_message$data3 = message.data) === null || _message$data3 === void 0 ? void 0 : _message$data3.status) === "ready" && !this._is_ready) {
        this._is_ready = true;
        callBack && callBack(this, {
          parentRuntimeContext: null,
          runtimeContext: null
        });
      }
    }
  }, {
    key: "_registerEventListener",
    value: /** 注册事件监听  */
    function _registerEventListener(callBack) {
      var _this2 = this;
      this._eventListenerHandler = function (e) {
        _this2._eventListener(e, callBack);
      };
      window.addEventListener("message", this._eventListenerHandler);
    }
    /** 事件调用For _customEvents  */
  }, {
    key: "_callEvent",
    value: function _callEvent(message) {
      var _this3 = this;
      if (message.type !== MessageTypeEnum.callEvent) {
        return;
      }
      var callEvents = message.callEvents;
      callEvents === null || callEvents === void 0 ? void 0 : callEvents.forEach(function (event) {
        var _this3$_customEvents$, _this3$_customEvents$2;
        var id = event.id,
          type = event.type;
        (_this3$_customEvents$ = _this3._customEvents[id]) === null || _this3$_customEvents$ === void 0 ? void 0 : (_this3$_customEvents$2 = _this3$_customEvents$[type]) === null || _this3$_customEvents$2 === void 0 ? void 0 : _this3$_customEvents$2.call(_this3$_customEvents$);
      });
    }
    /** 销毁实例 */
  }, {
    key: "destory",
    value: function destory() {
      window.removeEventListener("message", this._eventListenerHandler);
    }
    /** SDK内部消息发送函数  */
  }, {
    key: "postMessage",
    value: function postMessage(message) {
      if (message.type === MessageTypeEnum.callMethod && message.methodName === MethodNameEnum.ready ||
      // 初始化消息
      this._is_ready // SDK准备好
      ) {
        window.parent.postMessage(_objectSpread(_objectSpread({}, message), {}, {
          _identifying: this._identifying,
          _nameSpaceId: this._nameSpaceId
        }), "*");
      }
    }
  }, {
    key: "ready",
    value: /** SDK 初始化成功后，通过callback函数可以安全的调用SDK */
    function ready(callBack) {
      this.postMessage({
        type: MessageTypeEnum.callMethod,
        methodName: MethodNameEnum.ready
      });
      this._registerEventListener(callBack);
    }
  }]);
  return UdcSdkForIfame;
}();
export { UdcSdkForIfame as default };