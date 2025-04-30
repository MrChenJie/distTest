import React, { Component } from 'react';

import { connect } from 'dva';
import { isEmpty } from 'lodash';

import { Row, Col, Form, Input, Collapse, Dropdown } from 'antd';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import cusRequest from '_cus_utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './Form';
import ListTable from './ListTable';
import dayjs from 'dayjs';
import { DATETIME_MIN } from 'utils/constants';
import PrepayWriteOff from './components/PrepayWriteOff';
import ExportHistoryData from '../ExportHistoryData';
import ellipsis from 'srm-front-common/lib/assets/ellipsis.svg';
import qs from 'querystring';

const { Panel } = Collapse;
const commonPrompt = 'spcm.costPayment';

@formatterCollections({ code: [commonPrompt] })
@fastCodeLoader([
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'SPCM.COST_REQUEST_STATUS',
  'RS_IP_APPROVAL_NODE',
  'SRSP.PAYMENT_REQUEST_SOURCE',
  'SPFM.YES_NO',
  'SPCM.COST_PRESS_LEVEL',
  'SPCM.PAYMENT_ADVICE_FLAG',
  'HPFM.FLAG',
])
@connect(({ loading, costRequest }) => ({
  costRequest,
  queryLoading: loading.effects['costRequest/queryList'],
  deleteLoading: loading.effects['costRequest/deleteList'],
  dataSource: costRequest?.dataSource,
  pagination: costRequest?.pagination,
}))
class CostRequest extends Component {
  constructor(props) {
    super(props);
    const { customerPayFlag = 0 } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      activeKey: ['form', 'table'],
      selectedRows: [], // 选中的rows
      selectedRowKeys: [], // 选中的rowKeys
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      prepayWriteOffVisible: false,
      customerPayFlag, // 是否对客户付款， 由‘付款申请【是否对客户付款】’菜单跳转传入
      asyncExportFormFlag: false,
      asyncExportListFlag: false,
    };
  }

  asyncExportForm = React.createRef();

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'costRequest/queryList',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form?.current?.getFieldsValue(true) || {};
    const {
      requestDateFrom,
      requestDateTo,
      invoiceDateFrom,
      invoiceDateTo,
      importEbsDateFrom,
      importEbsDateTo,
      termsDateFrom,
      termsDateTo,
      expectPaymentDateFrom,
      expectPaymentDateTo,
    } = fieldsValue;
    const { customerPayFlag } = this.state;
    return {
      ...fieldsValue,
      requestDateFrom: dayjs.isDayjs(requestDateFrom)
        ? requestDateFrom.format(DATETIME_MIN)
        : undefined,
      requestDateTo: dayjs.isDayjs(requestDateTo) ? requestDateTo.format(DATETIME_MIN) : undefined,
      invoiceDateFrom: dayjs.isDayjs(invoiceDateFrom)
        ? invoiceDateFrom.format(DATETIME_MIN)
        : undefined,
      invoiceDateTo: dayjs.isDayjs(invoiceDateTo) ? invoiceDateTo.format(DATETIME_MIN) : undefined,
      importEbsDateFrom: dayjs.isDayjs(importEbsDateFrom)
        ? importEbsDateFrom.format(DATETIME_MIN)
        : undefined,
      importEbsDateTo: dayjs.isDayjs(importEbsDateTo)
        ? importEbsDateTo.format(DATETIME_MIN)
        : undefined,
      termsDateFrom: dayjs.isDayjs(termsDateFrom) ? termsDateFrom.format(DATETIME_MIN) : undefined,
      termsDateTo: dayjs.isDayjs(termsDateTo) ? termsDateTo.format(DATETIME_MIN) : undefined,
      expectPaymentDateFrom: dayjs.isDayjs(expectPaymentDateFrom)
        ? expectPaymentDateFrom.format(DATETIME_MIN)
        : undefined,
      expectPaymentDateTo: dayjs.isDayjs(expectPaymentDateTo)
        ? expectPaymentDateTo.format(DATETIME_MIN)
        : undefined,
      customerPayFlag,
    };
  };

  // 打开报表的Modal
  openPrepayModal = () => {
    this.setState({
      prepayWriteOffVisible: true,
    });
  };

  /**
   * 同步导出
   */
  handleExport = () => {
    this.setState({
      exportLoading: true,
    });
    const queryParams = this.getQueryParams();
    cusRequest(
      `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/singleSheetCostDetailExport`,
      {
        method: 'GET',
        responseType: 'blob',
        query: queryParams,
      }
    ).then((res) => {
      this.setState({
        exportLoading: false,
      });
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl
          .get(`${commonPrompt}.view.export.costPayment`)
          .d('成本类付款申请清单明细');
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  };

  /**
   * 异步导出
   * @param {String} fileDesc 备注信息
   */
  handleAsyncExport = (fileDesc = undefined) => {
    const { selectedRows } = this.state;
    const queryParams = this.getQueryParams();
    cusRequest(`/hrpt/v1/${getCurrentOrganizationId()}/payment-cost/cost-export`, {
      method: 'POST',
      query: {
        ...queryParams,
        fileName: !isEmpty(fileDesc) ? `BUSINESS_${fileDesc}` : `BUSINESS_`,
        async: true,
        exportType: 'DATA',
        costRequestId: selectedRows.map((item = {}) => item.costRequestId),
        allCheckedFlag: 'Y',
      },
      body: {
        costRequestIdList: selectedRows.map((item = {}) => item.costRequestId),
        costInvoiceIdList: selectedRows.map((item = {}) => item.costInvoiceId),
      },
    }).then((res) => {
      if (res && res.failed) {
        CusNotification.error({
          message: res.message,
        });
      } else {
        CusNotification.success();
        // this.setState({
        //   asyncExportListFlag: true
        // });
      }
    });
  };

  // 删除
  delRecords = () => {
    // 获取选中的记录集
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    if (!selectedRows || selectedRows.length === 0) {
      CusNotification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.select-to-delete`)
          .d('请选择需要删除的单据'),
        duration: 4.0,
      });
      return;
    }
    // 判断记录集中的单据申请状态（可删除付款申请单据状态为‘草稿’单据）
    const isDelete = selectedRows.every((v) => {
      return v.requestStatus === 'DRAFT';
    });
    if (!isDelete) {
      CusNotification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.only-to-delete`)
          .d('仅可以删除付款申请单据状态为‘草稿’的单据'),
        duration: 3.0,
      });
    } else {
      dispatch({
        type: 'costRequest/deleteList',
        payload: selectedRows,
      }).then((res) => {
        if (res) {
          this.setState({
            selectedRows: [], // 选中的rows
            selectedRowKeys: [], // 选中的rowKeys
          });
          CusNotification.success();
          this.handleSearch();
        }
      });
    }
  };

  // 复制 mode === 'entire' 为整单复制
  copyRecord = (mode) => {
    const { selectedRows } = this.state;
    const that = this;
    if (!selectedRows || selectedRows.length === 0) {
      CusNotification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.select-to-copy`)
          .d('请选择需要复制的单据'),
        duration: 3.0,
      });
      return;
    }
    CusModal.confirm({
      title: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
      content: intl
        .get(`${commonPrompt}.view.query.if-want-to-copy`)
        .d('是否对选中的单据进行复制?'),
      onOk() {
        that.setState({
          costRequestLoading: true,
        });
        // 获取选中的记录集
        if (selectedRows.length === 1) {
          cusRequest(
            `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/${
              mode === 'entire' ? 'copyAll' : 'copy'
            }/${selectedRows[0].costRequestId}`,
            {
              method: mode === 'entire' ? 'GET' : 'POST',
              query: mode === 'entire' ? { sourceCode: 'MANAUAL_COPY' } : {},
            }
          ).then((res) => {
            if (res.type === 'error' || res.type === 'warn') {
              CusNotification[res.type]({
                message: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
                description: res.message,
                duration: 3.0,
              });
              that.setState({
                costRequestLoading: false,
              });
            } else {
              // 复制成功跳转到详情页
              that.setState({
                costRequestLoading: false,
              });
              const { costRequestId } = res.costPaymentRequest;
              window.open(
                `${
                  that.state.isPub ? '/pub' : ''
                }/spcm/cost/payment/request/detail/${costRequestId}`
              );
            }
          });
        } else if (selectedRows.length > 1) {
          CusNotification.warning({
            message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
            description: intl
              .get(`${commonPrompt}.view.query.only-one-copy`)
              .d('仅能选择一项记录进行复制'),
            duration: 3.0,
          });
          that.setState({
            costRequestLoading: false,
          });
        }
      },
      onCancel() {},
    });
  };

  addRecord = () => {
    const { isPub, customerPayFlag } = this.state;
    let url = `${isPub ? '/pub' : ''}/spcm/cost/payment/request/detail/-1`;
    if (+customerPayFlag === 1) {
      url += `?customerPayFlag=${customerPayFlag}`;
    }
    window.open(url);
  };

  /**
   * 导出输入“备注信息”弹框  确认
   */
  exportFormHandleOk = () => {
    const { fileDesc } = this.asyncExportForm?.current?.getFieldsValue();
    let len = 0;
    if (!isEmpty(fileDesc)) {
      for (let i = 0; i < fileDesc.length; i++) {
        const char = fileDesc.charAt(i);
        if (char.match(/[^\x00-\xff]/gi) !== null) {
          len += 3;
        } else {
          len += 1;
        }
      }
    }
    if (len > 150) {
      console.log(len);
      CusNotification.error({
        message: intl
          .get('spcm.costPayment.resale.taskNameTooLong')
          .d('【备注信息】字段最多可填入150个字符（最多全中文可填入50个汉字）；'),
      });
      return;
    }
    this.handleAsyncExport(fileDesc);
    this.setState({
      asyncExportFormFlag: !this.state.asyncExportFormFlag,
    });
  };

  /**
   * 导出输入“备注信息”弹框  取消
   */
  exportFormHandleCancel = () => {
    this.asyncExportForm?.current?.resetFields();
    this.setState({
      asyncExportFormFlag: !this.state.asyncExportFormFlag,
    });
  };

  render() {
    const {
      queryLoading = false,
      deleteLoading = false,

      idpValueMap = {},
    } = this.props;
    const {
      activeKey,
      isPub,
      exportLoading = false,
      costRequestLoading = false,
      prepayWriteOffVisible,
      selectedRowKeys,
      selectedRows,
    } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const listTableProps = {
      ...this.props,
      isPub,
      onChange: this.handleSearch,
      rowSelection: rowSelection,
    };
    return (
      <PageWrapper loading={queryLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <FilterForm {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  <>
                    <CusButton mini onClick={() => this.openPrepayModal()}>
                      {intl.get('hzero.common.button.prepayWriteOffReportForm').d('预付款核销报表')}
                    </CusButton>
                    <CusExcelExport
                      requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/costPaymentApproveTimeExport`}
                      queryParams={this.getQueryParams}
                      downloadType="Blob"
                      fileName={intl
                        .get('spcm.costPayment.filename.effectiveReport')
                        .d('成本付款申请审批时效报表')}
                      otherButtonProps={{
                        icon: null,
                        mini: true,
                      }}
                      buttonText={intl.get(`hzero.common.button.approvalTimeReport`).d('审批时效')}
                      title={intl.get(`hzero.common.button.approvalTimeReport`).d('审批时效')}
                    />
                    {/* <CusButton mini onClick={() => this.handleExport()} loading={exportLoading}>
                      {intl.get('hzero.common.button.export').d('导出')}
                    </CusButton> */}
                    {/* <Dropdown
                      menu={{
                        items: [
                          { key: 'SYNC_EXPORT', label: intl.get('spcm.costPayment.asyncExport').d('同步导出') },
                          { key: 'ASYNC_EXPORT_LIST', label: intl.get('spcm.costPayment.asyncExportList').d('异步导出列表') }
                        ],
                        onClick: ({ key }) => {
                          // 同步导出
                          if (key === 'SYNC_EXPORT') {
                            this.handleExport();
                          }
                          // 异步导出列表
                          if (key === 'ASYNC_EXPORT_LIST') {
                            this.setState({ asyncExportListFlag: true });
                          }
                        }
                      }}
                      placement="bottom"
                    >
                      <CusButton
                        className="customize-button-normal"
                        style={{ padding: '0 8px', minWidth: '44px', display: 'flex', alignItems: 'center' }}
                      >
                        {intl.get('hzero.common.button.export').d('导出')}
                        <img style={{ marginTop: '2px', marginLeft: '8px' }} src={ellipsis} alt="ellipsis" />
                      </CusButton>
                    </Dropdown> */}
                    <CusButton
                      mini
                      onClick={
                        // () => this.handleAsyncExport()
                        () => this.setState({ asyncExportFormFlag: true })
                      }
                    >
                      {intl.get('hzero.common.button.export').d('导出')}
                    </CusButton>
                    <CusButton mini onClick={() => this.setState({ asyncExportListFlag: true })}>
                      {intl.get('hzero.common.button.exportRecord').d('导出记录')}
                    </CusButton>
                    <CusButton
                      mini
                      loading={deleteLoading}
                      onClick={() =>
                        CusModal.CusDeleteConfirm(() => {
                          this.delRecords();
                        })
                      }
                    >
                      {intl.get('hzero.common.button.delete').d('删除')}
                    </CusButton>
                    <CusButton mini loading={costRequestLoading} onClick={() => this.copyRecord()}>
                      {intl.get('hzero.common.button.copy').d('复制')}
                    </CusButton>
                    <CusButton
                      mini
                      loading={costRequestLoading}
                      onClick={() => this.copyRecord('entire')}
                    >
                      {intl.get(`hzero.common.button.entireCcopy`).d('整单复制')}
                    </CusButton>
                    <CusButton mini type="primary" onClick={() => this.addRecord()}>
                      {intl.get('hzero.common.button.add').d('新增')}
                    </CusButton>
                  </>
                }
              />
            }
            key="table"
          >
            <ListTable {...listTableProps} />
          </Panel>
        </Collapse>
        {/* 预付款核销报表Modal */}
        {prepayWriteOffVisible && (
          <CusModal
            title={intl
              .get('spcm.costPayment.view.title.prepayWriteOffExport')
              .d('预付款核销报表导出')}
            visible={prepayWriteOffVisible}
            onCancel={() => this.setState({ prepayWriteOffVisible: false })}
            footer={null}
            width={800}
            destroyOnClose
            marginBottom={40}
          >
            <PrepayWriteOff idpValueMap={idpValueMap} />
          </CusModal>
        )}
        <CusModal
          title={intl.get('spcm.costPayment.exportFileExport').d('业务运营成本付款申请导出')}
          visible={this.state.asyncExportFormFlag}
          destroyOnClose={true}
          width={500}
          onOk={this.exportFormHandleOk}
          onCancel={this.exportFormHandleCancel}
        >
          <Form ref={this.asyncExportForm} className="customize-form">
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spcm.costPayment.fileDesc`).d('备注信息')}
                  wrapperCol={{ span: 24 }}
                  name="fileDesc"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </CusModal>
        <CusModal
          title={intl.get('spcm.costPayment.resaleExportList').d('业务运营成本付款申请导出列表')}
          visible={this.state.asyncExportListFlag}
          destroyOnClose={true}
          width={700}
          onCancel={() => {
            this.setState({
              asyncExportListFlag: !this.state.asyncExportListFlag,
            });
          }}
          footer={null}
          marginBottom={40}
        >
          <ExportHistoryData
            onCancel={() => {
              this.setState({
                asyncExportListFlag: !this.state.asyncExportListFlag,
              });
            }}
            taskName={'BUSINESS_'}
            fileName={intl
              .get('spcm.costPayment.resale.exportDefaultFileName')
              .d('业务运营成本付款申请导出')}
            queryParams={{
              ...this.getQueryParams(),
              costRequestId: selectedRows.map((item = {}) => item.costRequestId),
              allCheckedFlag: 'Y',
            }}
            requestUrl={`/hrpt/v1/${getCurrentOrganizationId()}/payment-cost/export`}
          />
        </CusModal>
      </PageWrapper>
    );
  }
}

export default CostRequest;
