/**
 * 获取组件 props 关于运行态相关的 props
 */
export var getUdcComponentRuntimeProps = function getUdcComponentRuntimeProps(props) {
  var runtimeContext = props.runtimeContext;
  if (runtimeContext) {
    var udcRuntimeCoreVersion = props.udcRuntimeCoreVersion,
      isUdcApp = props.isUdcApp,
      visible = props.visible,
      disabled = props.disabled,
      pairValue = props.pairValue,
      readonly = props.readonly,
      required = props.required,
      udcSdk = props.udcSdk;
    return {
      udcRuntimeCoreVersion: udcRuntimeCoreVersion,
      isUdcApp: isUdcApp,
      visible: visible,
      disabled: disabled,
      pairValue: pairValue,
      readonly: readonly,
      required: required,
      runtimeContext: runtimeContext,
      udcSdk: udcSdk
    };
  }
  return {};
};