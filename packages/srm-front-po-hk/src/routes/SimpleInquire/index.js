/**
 * index.js - 简易询价
 * @date: 2023-10-09
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import SimpleInquireForm from "./SimpleInquireForm"
import SimpleInquireResult from "./SimpleInquireResult"
// import { Form, Row, Col, Input } from 'antd';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { filterNullValueObject } from 'utils/utils';
// import moment from 'moment';
import { createPagination } from 'hzero-front/lib/utils/utils';
// import HedgeForm from './HedgeForm';
// import HedgeResults from './HedgeResults';
import { getCurrentUser } from 'utils/utils';
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
import { fastCodeLoader } from '@/utils/decorators';

const { Panel } = Collapse;

const currentUser = getCurrentUser();
const commonPrompt = 'HKPC.commom';
@fastCodeLoader([
  'HKPC.PRRECORDSSTATUS',
  "HKPC.BUDGETTYPE",
  'HKPC.PURCHASINGCATEGORY',
])

@formatterCollections({ code: [commonPrompt] })
@connect(({ loading = {}, simpleInquireModel = {} }) => ({
  simpleInquireModel,
  fetchListLoading: loading.effects['simpleInquireModel/queryInfo'],
}))

export default class SimpleInquire extends Component {
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
    const { dispatch } = this.props;
    dispatch({
      type: 'simpleInquireModel/init',
    });
    this.fetchDocumentList();
  }

  // 查询条件格式化
  @Bind()
  formatValues(values) {
    const { dateFrom, dateTo } = values || {};
    return {
      ...values,
      dateFrom: dateFrom ? dayjs(dateFrom).format('YYYY-MM-DD') : undefined,
      dateTo: dateTo ? dayjs(dateTo).format('YYYY-MM-DD') : undefined,
    };
  }

  /**
  * 查询-收款单据
  */
  @Bind()
  @Debounce(200)
  fetchDocumentList(page = {}) {
    const {
      dispatch,
    } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.current?.getFieldsValue(true));
    const handleFormValues = this.formatValues(filterValues);
    dispatch({
      type: 'simpleInquireModel/queryInfo',
      payload: {
        page,
        ...handleFormValues,
        type: 'simpleInquiry',
        lang: currentUser.language

      },
    })
  }

  render() {
    const { idpValueMap, simpleInquireModel, fetchListLoading = false } = this.props;
    const { activeKey, isPub } = this.state;

    const { evaluationList, evaluationListPagination, } = simpleInquireModel;
    const FormProps = {
      simpleInquireModel,
      onSearch: this.fetchDocumentList,
      onRef: (ref) => {
        this.filterForm = ref.form;
      },
      idpValueMap,
    };

    const SimpleInquireResultProps = {
      isPub,
      evaluationList,
      evaluationListPagination,
      onPageChange: this.fetchDocumentList, // 分页查询
    };

    return (
      <PageWrapper loading={fetchListLoading}>
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
            <SimpleInquireForm  {...FormProps} />
          </Panel>

          <Panel
            key="table"
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
              // buttons={
              //   <>
              //     <CusExcelExport
              //       // requestUrl={`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/supplier-evaluates/exportSupplierEvaluate`}
              //       queryParams={this.formatValues}
              //       downloadType="Blob"
              //       // 等标准出来再修改！！
              //       fileName={intl
              //         .get(`${commonPrompt}.view.export.standardEvaluate`)
              //         .d('标准产品供应商后评估导出数据')}
              //       otherButtonProps={{
              //         // icon: null,
              //         // mini: true,
              //         type: "primary"
              //       }}
              //       buttonText={intl.get('hzero.common.button.export').d('导出')}
              //     />
              //   </>
              // }
              />
            }>
            <SimpleInquireResult {...SimpleInquireResultProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    )
  }
}