/**
 * index.js - 发布评委守则
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Button, Tabs, Input } from 'hzero-ui';
// import { DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import styles from './index.less';
import intl from 'utils/intl';

const TabPane = Tabs.TabPane;
const { TextArea } = Input;

export default class NoticesEdit extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    // this.fetchEnum(); // 查询值集
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/init',
    });
  }

  callback(key) {
    console.log(key);
  }

  commitNotice() {

  }

  render() {
    const { } = this.props;
    const { } = this.state;
    return (
      <Fragment>
        <Header
          // backPath="/sspo/online-purchase/quoteSource1"
          title={intl.get(`bid.bidcommon.view.title.publishexpertprinciple`).d('发布评委守则')}
        >
          <Button
            // disabled={!selectedRows.length}
            icon="check"
            type="primary"
            onClick={() => this.commitNotice()}
            // loading={loadingSourceCreate}
          >
            {intl.get(`bid.bidcommon.view.button.submit`).d('提交')}
          </Button>
        </Header>
        <Content>
        <Tabs defaultActiveKey="1">
          <TabPane tab='简体' key="1">
            <Form.Item label="守则内容：" className={styles['nativeLable']}>
              <TextArea placeholder='请输入' className={styles['nativeText']} />
            </Form.Item>
          </TabPane>
          <TabPane tab='繁體' key="2">
            <Form.Item label="守則內容：" className={styles['nativeLable']}>
              <TextArea placeholder='請輸入' className={styles['nativeText']} />
            </Form.Item>
          </TabPane>
          <TabPane tab='English' key="3">
            <Form.Item label="Code content：" className={styles['nativeLable']}>
              <TextArea placeholder='Please enter' className={styles['nativeText']} />
            </Form.Item>
          </TabPane>
        </Tabs>
        </Content>
      </Fragment>
    );
  }
}
