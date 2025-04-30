/**
 * index.js - 手工对冲查询页面
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse, Row, Form, Col } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusExcelExport from '_cus_components/CusExcelExport';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import dayjs from 'dayjs';
import SupplierResultsSummary from '@/routes/SupplierEvaluationSummary/SupplierResultsSummary';
import SupplierFormSummary from '@/routes/SupplierEvaluationSummary/SupplierFormSummary';

const { Panel } = Collapse;

@formatterCollections({ code: ['spfmhk.supplier'] })
@connect(({ loading = {}, evaluation = {} }) => ({
  evaluation,
  evaluationCollectList: evaluation.evaluationCollectList,
  platformLoading: loading.effects['evaluation/queryEvaluationCollectList'],
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser(),
}))

export default class SupplierEvaluationList extends Component {

  constructor(props) {
    super(props);
    this.searchForm = {}; // 查询条件
    this.CMHK_SUPPLIER = '/cmhk-supplier';
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'table'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
      loading: false
    };
  }

  componentDidMount() {
    const { evaluation: { evaluationCollectPagination = {} } } = this.props;
    this.onSearch(evaluationCollectPagination);
  }

  /**
   * 查询供应商评审汇总列表
   * @param page
   */
  @Bind()
  onSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = (this.baseForm && this.baseForm.current?.getFieldsValue()) || {};
    values.revYear = values.revYear && values.revYear.format('YYYY');
    values.gatTime = values.gatTime && values.gatTime.format('YYYY-MM-DD 00:00:00');
    console.log(values, 'values');
    dispatch({
      type: 'evaluation/queryEvaluationCollectList',
      payload: {
        tenantId,
        page,
        ...values
      }
    });
  }

  /**
   * 列表选择数据
   * @param selectedRowKeys
   * @param selectedRows
   */
  @Bind()
  handleSelectRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const values = (this.baseForm && this.baseForm.current?.getFieldsValue()) || {};
    const { revYear } = values;
    return {
      ...values,
      revYear: values.revYear ? values.revYear.format('YYYY') : undefined,
      gatTime: values.gatTime ? values.gatTime.format('YYYY-MM-DD') : undefined,
    };
  }

  /**
   * 考评结果到处
   */
  @Bind()
  resultDataExport() {
    const { dispatch } = this.props;
    this.setState({
      loading: true
    });
    dispatch({
      type: 'evaluation/resultDataExport',
      payload: {
        ...this.getQueryParams(),
      }
    }).then(res => {
      if(res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`spfmhk.supplier.button.evaluationResult`).d('考评结果导出报表') + `(${dayjs().format('YYYYMMDD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          Promise.resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        this.setState({
          loading: false
        })
      } else {
        this.setState({
          loading: false
        })
      }
    })
  }

  render() {
    const {
      evaluationCollectList,
      evaluation: { evaluationCollectPagination },
      tenantId,
      dispatch,
      platformLoading,
    } = this.props;
    const {
      activeKey,
      isPub,
      loading,
    } = this.state;
    const formProps = {
      onRef: (ref) => {
        this.baseForm = ref.baseForm;
      },
      onSearch: this.onSearch,
      tenantId
    };
    const supplierResultsProps = {
      rowKey: 'id',
      loading: platformLoading,
      pagination: evaluationCollectPagination,
      dataSource: evaluationCollectList?.content || [],
      handleTableChange: this.onSearch,
      rowSelection: {
        onChange: this.handleSelectRows
      },
      onChange: this.onSearch,
      isPub,
      dispatch
    };

    const dataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier-review/gatherList/export`,
      method: "GET",
      downloadType: "Blob",
      buttonText: intl.get(`spfmhk.supplier.view.button.list.export`).d('列表导出'),
      fileName: intl.get(`spfmhk.supplier.file.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams
    }

    return (
      <PageWrapper>
        <Collapse
          className='customize-collapse'
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}>
          <Panel
            key='form'
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
          >
            <SupplierFormSummary {...formProps} />
          </Panel>

          <Panel
            key='table'
            showArrow={false}
            collapsible='disabled'
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                buttons={
                  <>
                    <CusExcelExport mini {...dataExportProps} />
                    <CusButton loading={loading} mini type="primary" onClick={this.resultDataExport}>{intl.get(`spfmhk.supplier.button.evaluationResult`).d('考评结果导出')}</CusButton>
                  </>
                }
              />
            }>
            <SupplierResultsSummary {...supplierResultsProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
