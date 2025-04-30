import React, { Component } from 'react';
import CusModal from '_cus_components/CusModal';
import intl from 'utils/intl';
import { format_object } from '@/utils/JsonFn';

class JsonModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }
  render() {
    let { jsonData } = this.props;
    const { visible } = this.state;
    try {
      jsonData = JSON.parse(jsonData)
    }catch (e) {
      console.log(e);
    }
    console.log(jsonData);
    return (
      <>
        <a
          href="#"
          onClick={() => {
            this.setState({
              visible: true,
            });
          }}
        >
          {intl.get('hzero.common.button.view').d('查看')}
        </a>
        {visible && (
          <CusModal
            visible={visible}
            onCancel={() => {
              this.setState({
                visible: false,
              });
            }}
            cancelText={intl.get('hzero.common.button.close').d('关闭')}
            destroyOnClose
            width={800}
          >
            <div dangerouslySetInnerHTML={{ __html: format_object(jsonData, 2) }}></div>
          </CusModal>
        )}
      </>
    );
  }
}

export default JsonModal;
