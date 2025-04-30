import React from 'react';
import { Button } from 'hzero-ui';

export default class Test extends React.PureComponent {
  init() {
    document.addEventListener('message', function(event) {
      console.log(event);
    });
    window.iframe_test_function = function(routerParam) {
      console.log('iframe_test_function');
      console.log('outer pages', routerParam);
      if (routerParam.opt === 'ok') {
        console.log('点击确认 关闭对话框');
      } else if (routerParam.opt === 'close') {
        console.log('点击关闭 关闭对话框');
      }
    };
  }

  render() {
    return (
      // <iframe src={`/app/pub/gotoClose?opt=ok&requestId=10`} />
      <Button
        onClick={() => {
          window.location.href = '/app/pub/gotoClose?opt=ok&requestId=10';
        }}
      >
        点击
      </Button>
    );
  }
}
