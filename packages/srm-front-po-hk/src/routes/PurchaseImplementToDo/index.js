/**
 * index.js - 手工对冲查询页面
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import PurchaseImplementToDoFrom from "./Form"
import PurchaseImplementToDoResults from "./Results"
// import { Form, Row, Col, Input } from 'antd';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import intl from 'utils/intl';
// import uuidv4 from 'uuid/v4';
// import { filterNullValueObject } from 'utils/utils';
// import moment from 'moment';
// import { createPagination } from 'hzero-front/lib/utils/utils';
// import HedgeForm from './HedgeForm';
// import HedgeResults from './HedgeResults';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
// import CusModal from '_cus_components/CusModal';
// import CusNotification from '_cus_components/CusNotification';
// import CusMultiLov from '_cus_components/CusMultiLov';
// import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import dayjs from 'dayjs';
// import { Form, Spin, Tabs } from 'hzero-ui';
import { Tabs } from 'antd';
import styles from './index.less';


const commonPrompt = 'sslm.standardEvaluate';
const { Panel } = Collapse;
@formatterCollections({
  code: [
    'srsp.collectiondisplay',
  ],
})
@connect(({ loading = {}, evaluationList = {} }) => ({
  evaluationList,
}))

export default class PurchaseImplement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: {}, // 查询条件
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'table'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
    };
  }

  // 查询条件格式化
  @Bind()
  formatValues() {
    const values = this.baseForm.current?.getFieldsValue(true);
    const { startDate, endDate } = values || {};
    console.log(values);
    return {
      ...values,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : undefined,
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : undefined,
    };
  }

  @Bind
  aaa(){
    console.log(this.baseForm.current.getFieldsValue());
  }

  render() {
    const { evaluationList } = this.props
    const { activeKey } = this.state
    const PurchaseImplementToDoResultsProps = {
      evaluationList
    }

    const FormProps = {
      onRef: (ref) => {
        this.baseForm = ref.baseForm
      }
    }

    return (
      <PageWrapper>
        <Collapse className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}>
          <Panel
            key="form"
            showArrow={false}
            header={
              <PanelHeader
                arrowActive={activeKey.includes('form')}
                title={intl.get(`hzero.common.view.title.Search`).d('查询')}
              />
            }
          >
            <PurchaseImplementToDoFrom  {...FormProps} />
          </Panel>

          <Panel
            key="table"
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.view.title.Reasulttable`).d('结果展示')}
                buttons={
                  <>
                    {
                      <CusButton onClick={this.aaa} mini>
                        {intl.get('HKPC.commom.view.button.handover').d('项目交接')}
                      </CusButton>
                    }
                    <CusExcelExport
                      // requestUrl={`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/supplier-evaluates/exportSupplierEvaluate`}
                      queryParams={this.formatValues}
                      type='mini'
                      downloadType="Blob"
                      // 等标准出来再修改！！
                      fileName={intl
                        .get(`${commonPrompt}.view.export.standardEvaluate`)
                        .d('标准产品供应商后评估导出数据')}
                      otherButtonProps={{
                        // icon: null,
                        // mini: true,
                        // type: "primary"
                      }}
                      buttonText={intl.get('HKPC.commom.view.button.export').d('导出')}
                    />
                  </>
                }
              />
            }>

            {/* <Spin > */}
            <Tabs className={styles['tabStyle']} tabBarStyle={{ borderBottom: 'unset' }} animated={false}>
              <Tabs.TabPane
                tab={intl.get('HKPC.commom.view.button.total').d('总项目数量')}
                key="message"
              >
                <PurchaseImplementToDoResults {...PurchaseImplementToDoResultsProps}></PurchaseImplementToDoResults>
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('HKPC.commom.view.button.ongoing').d('进行中')}
                key="notice"
              >
                {/* <MessageTabPane {...noticeProps} type="notice" ref={this.noticeTabPaneRef} /> */}
                222
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('HKPC.commom.view.button.Completed').d('已完成')}
                key="announce"
              >
                {/* <MessageTabPane {...announceProps} type="announce" ref={this.announceTabPaneRef} /> */}
                333
              </Tabs.TabPane>
            </Tabs>
            {/* </Spin> */}
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}