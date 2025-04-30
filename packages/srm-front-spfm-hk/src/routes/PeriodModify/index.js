/**
 * index.js - 期间修改查询
 * @date: 2023-1-26
 * @author:  <jinkai.lu@hand-china.com>
 */

import React, { Component } from 'react';
import PurchasePlanForm from "./From"
import PurchasePlanResults from "./Results"
// import { Form, Row, Col, Input } from 'antd';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import intl from 'utils/intl';
// import uuidv4 from 'uuid/v4';
import { filterNullValueObject } from 'utils/utils';
// import moment from 'moment';
// import { createPagination } from 'hzero-front/lib/utils/utils';
// import HedgeForm from './HedgeForm';
// import HedgeResults from './HedgeResults';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button, Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusExcelExport from '_cus_components/CusExcelExport';
// import CusModal from '_cus_components/CusModal';
// import CusNotification from '_cus_components/CusNotification';
// import CusMultiLov from '_cus_components/CusMultiLov';
// import CusLov from '_cus_components/CusLov';
import { isEmpty, isUndefined } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';

const { Panel } = Collapse;
const commonPrompt = 'HKPC.commom';
const organizationId = getCurrentOrganizationId();
import dayjs from 'dayjs';
@formatterCollections({
  code: [
    'HKPC.commom',
    'hzero.common',
    'spfmhk.supplier'
  ],
})
@connect(({ loading = {}, supplierReport = {} }) => ({
  supplierReport,
  resultLoading: loading.effects['supplierReport/getPeriodModifyInfo'],
}))

export default class PeriodModify extends Component {
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

  componentDidMount() {
    // 值集配置
    const { dispatch } = this.props;
    // dispatch({
    //   type: 'purchasePlan/init',
    // });

    // 初始化数据
    this.handleSearch();
  }

  /**
   * 处理表单中的日期查询条件
   */
  @Bind()
  handleFormQuery(fieldValues) {
    if (fieldValues === undefined) {
      return {
        creationMethod: 'ADD',
      };
    } else {
      const { applyingDateStart, applyingDateEnd } =
        fieldValues;
      return {
        ...fieldValues,
        applyingDateStart: applyingDateStart
          ? applyingDateStart.format('YYYY-MM-DD 00:00:00')
          : undefined,
        applyingDateEnd: applyingDateEnd
          ? applyingDateEnd.format('YYYY-MM-DD 23:59:59')
          : undefined,
      };
    }
  }

  @Bind()
  handleSearch(page={}) {
    const { dispatch } = this.props;
    const handleFormValues = this.handleFormQuery(this.baseForm?.current?.getFieldsValue());
    console.log(handleFormValues,'handleFormValues');
    const newHandleFormValues = this.formatValues(handleFormValues)
    dispatch({
      type: 'supplierReport/getPeriodModifyInfo',
      payload: {
        ...newHandleFormValues,
        page
      },
    });
  }

  // 查询条件格式化
  @Bind()
  formatValues(val) {
    const { versionsUpdateStartTime, versionsUpdateEndTime } = val || {};
    return {
      ...val,
      versionsUpdateStartTime: versionsUpdateStartTime ? dayjs(versionsUpdateStartTime).format('YYYY-MM-DD hh:mm:ss') : undefined,
      versionsUpdateEndTime: versionsUpdateEndTime ? dayjs(versionsUpdateEndTime).format('YYYY-MM-DD hh:mm:ss') : undefined,
    };
  }

  render() {
    // 取model
    const {
      supplierReport,
      downLoading = false,
      resultLoading = false,
      idpValueMap,
      history
    } = this.props
    const {
      // enumMap = [], // 值集
      modifyDataSource,
      modifyPagination
    } = supplierReport;
    const { activeKey } = this.state
    const resultsProps = {
      modifyDataSource,
      modifyPagination,
      history,
      onPageChange:this.handleSearch
    }
    const FormProps = {
      onRef: (ref) => {
        this.baseForm = ref.baseForm
      },
      onSearch: this.handleSearch,
      idpValueMap
    }

    const purchaseDataExportProps = {
      requestUrl: `/cmhk-supplier/v1/${organizationId}/cmhk-supplier-report/period-update/export`,
      method: "GET",
      downloadType: "Blob",
      buttonText: intl.get(`${commonPrompt}.view.button.export`).d('导出'),
      fileName: intl.get(`${commonPrompt}.view.button.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.handleFormQuery(this.baseForm?.current?.getFieldsValue())
    };


    return (
      <PageWrapper loading={resultLoading}>
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
            <PurchasePlanForm {...FormProps}/>
          </Panel>

          <Panel
            key="table"
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
                buttons={
                  <>
                    <CusExcelExport loading={downLoading} mini {...purchaseDataExportProps} />
                  </>
                }
              />
            }>
            <PurchasePlanResults {...resultsProps}></PurchasePlanResults>
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}