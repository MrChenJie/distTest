/**
 * 供应商黑名单 - 手动发起
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/9
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Collapse } from 'antd';
import { Bind } from 'lodash-decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import intl from 'utils/intl';
import BasicForm from '@/routes/Blacklist/components/BasicForm';
import StatusForm from '@/routes/Blacklist/components/StatusForm';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
export default class Launch extends Component {
  constructor(props) {
    super(props);
    this.blacklistBasicForm = {};
    this.CMHK_SUPPLIER = '/cmhk-supplier';
    this.state = {
      activeKey: ['basic', 'status'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
    }
  }

  componentDidMount() {
  }

  render() {
    const {
      activeKey,
      isPub,
    } = this.state;
    return (
      <PageWrapper>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title="基础信息"
                arrowActive={activeKey.includes('basic')}
              />
            }
            key="basic"
          >
            <BasicForm onRef={ref => {
              this.blacklistBasicForm = ref;
            }}></BasicForm>
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title="状态变更信息"
                arrowActive={activeKey.includes('status')}
              />
            }
            key="status"
          >
            <StatusForm onRef={ref => {
              this.blacklistBasicForm = ref;
            }}/>
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}
