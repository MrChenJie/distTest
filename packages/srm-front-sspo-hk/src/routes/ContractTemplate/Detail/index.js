/**
 * PurchaseLineInfo - 模板编辑
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import querystring from 'querystring';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import EditorOnline from '../../components/EditorOnline';
import styles from './index.less';

const viewMessagePrompt = 'spcm.purchaseContactType.view.message';
@connect(({ contractTemplate = {} }) => ({
  contractTemplate,
}))
@formatterCollections({
  code: ['spcm.purchaseContactType'],
})
export default class contractTemplate extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcTemplateId } = querystring.parse(search.substr(1));
    this.state = { pcTemplateId, fullScreenFlag: false };
  }

  /**
   * handleVisible - 通过协议-打开模态框
   */
  @Bind()
  fullScreen(field, flag) {
    this.setState({ [field]: !!flag });
  }

  render() {
    const { pcTemplateId, fullScreenFlag } = this.state;
    const ModalProps = {
      width: '100%',
      height: document.body.clientHeight,
      visible: fullScreenFlag,
      onCancel: () => this.fullScreen('fullScreenFlag', false),
      footer: null,
      closable: false,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.theTemplateEditor`).d('模板编辑')}
          backPath="/spcm/contract-template/list"
        >
          <Button icon="arrows-alt" onClick={() => this.fullScreen('fullScreenFlag', true)}>
            {intl.get(`${viewMessagePrompt}.fullScreenMode`).d('全屏模式')}
          </Button>
        </Header>
        <Content style={{ padding: 0, margin: 0 }}>
          <EditorOnline
            templateFlag
            iframeStyle={{
              width: '100%',
              height: `${(document.body.clientHeight - 96) * 0.93}px`,
              // height: `${document.body.clientHeight - 96}px`,
            }}
            pcTemplateId={pcTemplateId}
          />
          <Modal
            wrapClassName={styles['full-modal-wrapper']}
            bodyStyle={{ height: `${document.body.clientHeight - 39}px` }}
            {...ModalProps}
            title={
              <Button
                icon="shrink"
                style={{ float: 'right' }}
                onClick={() => this.fullScreen('fullScreenFlag', false)}
              >
                {intl.get(`${viewMessagePrompt}.exitFullScreen`).d('退出全屏')}
              </Button>
            }
          >
            <EditorOnline
              templateFlag
              iframeStyle={{
                width: '100%',
                height: `${document.body.clientHeight - 39}px`,
              }}
              pcTemplateId={pcTemplateId}
              fullScreenFlag={fullScreenFlag}
            />
          </Modal>
        </Content>
      </Fragment>
    );
  }
}
