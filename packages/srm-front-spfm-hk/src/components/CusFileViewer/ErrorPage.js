import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // 用于标识子组件是否产生错误
    this.state = { hasError: false };
  }
  // 生命周期函数，一旦后台组件报错，就会触发，当Parent的子组件出现错误时会触发getDerivedStateFromError
  static getDerivedStateFromError(error) {
    // 在render之前触发
    // 返回新的state
    return { hasError: true };
  }
  //如果子组件发生错误，会调用该生命周期函数
  componentDidCatch(error, info) {
    // 统计页面的错误。发送请求发送到后台去
    console.log('Error::::', error);
  }
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>error! please contact the administrator.</h1>;
    }
    return this.props.children;
  }
}
