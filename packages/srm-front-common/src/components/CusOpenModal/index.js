import * as ReactDOM from 'react-dom';
import React from 'react';

export default function openModal(MyModal, config) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  let currentConfig = {
    ...config,
    visible: true,
    onCancel: (e) => {
      if (config.onCancel) {
        config.onCancel(e);
      }
      close();
    },
    onOk: (e) => {
      if (config.onOk) {
        config.onOk(e);
      }
      close();
    },
  };

  function destroy() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
  }

  function render(props) {
    /**
     * https://github.com/ant-design/ant-design/issues/23623
     *
     * Sync render blocks React event. Let's make this async.
     */
    setTimeout(() => {
      ReactDOM.render(<MyModal {...props} />, div);
    });
  }

  function close() {
    currentConfig = {
      ...currentConfig,
      visible: false,
      afterClose: destroy,
    };
    render(currentConfig);
  }

  render(currentConfig);
}
