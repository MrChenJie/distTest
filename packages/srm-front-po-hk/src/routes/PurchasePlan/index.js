/**
 * index.js - 采购方案
 * @date: 2023-10-29
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import PurchasePlanForm from "./From"
import PurchasePlanResults from "./Results"
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import { getCurrentOrganizationId } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const commonPrompt = 'HKPC.commom';
const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: [
    'HKPC.commom',
    'hzero.common'
  ],
})
@fastCodeLoader([
  'HKPC.PPPROCUREMENTMETHOD',
  'HKPC.PPDOCUMENTSTATUS',
  'HKPC.NUMBEROFPROJECTJUDGES',
  'HKPC.YES_OR_NO', // 是否客观分
  'HKPC.SCORE_TYPE_OBJECTIVE', //分值类型
  'HKPC.SCORE_TYPE_SUBJECTIVE', // 分值类型 （否）
  'HKPC.PRTYPE',//采购申请类型
])
@connect(({ loading = {}, purchasePlan = {} }) => ({
  purchasePlan,
  resultLoading: loading.effects['purchasePlan/queryList'],
  downLoading: loading.effects['purchasePlan/goDownInfo'],
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
      dispatch({
        type: 'purchasePlan/queryList',
        params: {
          ...handleFormValues,
          page
        },
      });
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

  render() {
    // 取model
    const { purchasePlan,downLoading = false,resultLoading = false,idpValueMap,history } = this.props
    const {
      // enumMap = [], // 值集
      dataSource,
      pagination
    } = purchasePlan;
    const { activeKey } = this.state
    const resultsProps = {
      dataSource,
      pagination,
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
      requestUrl: `/cmhk-pr-center/v1/${organizationId}/pr-second/synthesisExport`,
      method: "GET",
      downloadType: "Blob",
      buttonText: intl.get(`${commonPrompt}.view.button.export`).d('导出'),
      fileName: intl.get(`${commonPrompt}.view.button.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.handleFormQuery(this.baseForm?.current?.getFieldsValue()),
      otherButtonProps: {
        mini: true,
      }
    };

    return (
      <PageWrapper loading={resultLoading}>
        <Collapse className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
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
                    <CusExcelExport loading={downLoading} {...purchaseDataExportProps} />
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