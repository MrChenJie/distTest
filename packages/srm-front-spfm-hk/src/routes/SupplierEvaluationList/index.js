/**
 * index.js - 供应商考评列表
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import SupplierForm from './SupplierForm';
import SupperlierResults from './SupperlierResults';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse, Row, Form, Col } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusModal from '_cus_components/CusModal';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import dayjs from 'dayjs';
import notification from 'utils/notification';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@formatterCollections({ code: [prompt] })
@connect(({ loading = {}, evaluation = {} }) => ({
  evaluation,
  evaluationList: evaluation.evaluationList,
  platformLoading: loading.effects['evaluation/queryEvaluationList'],
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser(),
}))

export default class SupplierEvaluationList extends Component {

  supplierModalForm = React.createRef();

  constructor(props) {
    super(props);
    this.searchForm = {}; // 查询条件
    this.CMHK_SUPPLIER = '/cmhk-supplier';
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'table'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
      addSupplierModalShow: false,
      supplierStatus: null,
    };
  }

  componentDidMount() {
    const { evaluation: { evaluationListPagination = {} } } = this.props;
    this.onSearch(evaluationListPagination);
  }

  /**
   * 查询供应商评审列表
   * @param page
   */
  @Bind()
  onSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = (this.baseForm && this.baseForm.current?.getFieldsValue()) || {};
    values.revYear = values.revYear && values.revYear.format('YYYY');
    dispatch({
      type: 'evaluation/queryEvaluationList',
      payload: {
        tenantId,
        page,
        ...values,
      },
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

  @Bind()
  handelChoiceSupplier = async () => {
    const { supplierStatus } = this.state;
    const url = '/pub/spfm-hk/supplier/supplier-evaluation-list/detail';
    if (supplierStatus && supplierStatus === 'QUALIFIED') {
      const values = await this.supplierModalForm.current?.validateFields();
      if (values) {
        this.setState({
          addSupplierModalShow: false,
        });
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM-GYSPS&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=${url}?supplierId=${values.supplierId}`)}`);
      }
    } else {
      CusModal.info({
        content: intl.get(`${prompt}.view.field.supselect.tips`).d('选中供应商为非合格供应商，确认是否继续？'),
        onOk: async () => {
          const values = await this.supplierModalForm.current?.validateFields();
          if (values) {
            this.setState({
              addSupplierModalShow: false,
            });
            window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM-GYSPS&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=${url}?supplierId=${values.supplierId}`)}`);
          }
        },
      });
    }
  };

  @Bind()
  handleAddtion() {
    this.setState({ addSupplierModalShow: true });
  }

  @Bind()
  handleCancel() {
    this.setState({ addSupplierModalShow: false });
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
    };
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: 'evaluation/delEvaluationListInfo',
      payload: {
        selectedRowKeys,
      },
    }).then(res => {
      notification.success();
      this.onSearch();
    });
  }

  render() {
    const {
      evaluationList,
      evaluation: { evaluationListPagination },
      tenantId,
      dispatch,
      platformLoading,
    } = this.props;
    const {
      activeKey,
      addSupplierModalShow,
      isPub,
      selectedRows,
    } = this.state;
    const listProps = {
      rowKey: 'revNo',
      loading: platformLoading,
      pagination: evaluationListPagination,
      dataSource: evaluationList?.content || [],
      handleTableChange: this.onSearch,
      rowSelection: {
        onChange: this.handleSelectRows,
      },
      onChange: this.onSearch,
      isPub,
      dispatch,
    };

    const formProps = {
      onRef: (ref) => {
        this.baseForm = ref.baseForm;
      },
      onSearch: this.onSearch,
      tenantId,
    };

    const dataExportProps = {
      requestUrl: `${this.CMHK_SUPPLIER}/v1/${tenantId}/cmhk-supplier-review/list/export`,
      method: 'GET',
      downloadType: 'Blob',
      buttonText: intl.get(`${prompt}.view.button.list.export`).d('列表导出'),
      fileName: intl.get(`${prompt}.file.export`).d('导出') + dayjs().format('YYYY-MM-DD'),
      queryParams: this.getQueryParams,
    };

    return (
      <PageWrapper>
        <Collapse className='customize-collapse'
                  defaultActiveKey={activeKey}
                  onChange={(collapseKeys) => {
                    this.setState({ activeKey: collapseKeys });
                  }}>
          <Panel
            key='form'
            showArrow={false}
            header={
              <PanelHeader
                arrowActive={activeKey.includes('form')}
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
              />
            }
          >
            <SupplierForm {...formProps} />
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
                    <CusButton mini disabled={selectedRows.length === 0}
                               onClick={this.handleDelete}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
                    <CusButton onClick={() => this.handleAddtion()} mini type='primary'>
                      {intl.get('hzero.common.button.add').d('新增')}
                    </CusButton>
                  </>
                }
              />
            }>
            <SupperlierResults {...listProps}></SupperlierResults>
          </Panel>
        </Collapse>
        {/* 新增modal */}
        <CusModal
          title={intl.get(`${prompt}.field.SelectSupplier`).d('选择供应商')}
          visible={addSupplierModalShow}
          destroyOnClose
          width={600}
          onCancel={() => this.setState({ addSupplierModalShow: false })}
          onOk={this.handelChoiceSupplier}
        >
          <div className='customize-form'>
            <Form ref={this.supplierModalForm}>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    label={intl.get(`${prompt}.field.Supplier`).d('供应商')}
                    name='supplierId'
                    rules={[
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.Supplier`).d('供应商'),
                        }),
                      },
                    ]}
                  >
                    <CusLov code='HKSP.ACCESS_REV_SUPPLIER' onChange={(val, row) => {
                      this.setState({
                        supplierStatus: row?.supplierStatus,
                      });
                    }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </CusModal>
      </PageWrapper>
    );
  }
}
