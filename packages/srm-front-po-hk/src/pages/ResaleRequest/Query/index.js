import React, { Component } from 'react';

import { connect } from 'dva';
import { isEmpty } from 'lodash';

import { Row, Col, Form, Input, Collapse, Dropdown } from 'antd';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import cusRequest from '_cus_utils/request';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import { getResponse } from '_cus_utils/utils';
import FilterForm from './Form';
import ListTable from './ListTable';
import dayjs from 'dayjs';
import { DATETIME_MIN } from 'utils/constants';
import PermissionContent from '@/components/PermissionContent';
import ExportHistoryData from '../ExportHistoryData';
import ellipsis from 'srm-front-common/lib/assets/ellipsis.svg';

const { Panel } = Collapse;
const commonPrompt = 'spcm.resaleQuery';
const organizationId = getCurrentOrganizationId();

async function fetchPermission(params) {
  return cusRequest(`/spfm/v1/${organizationId}/pub-ctl-permissions/edit`, {
    method: 'POST',
    body: params,
  });
}

@formatterCollections({ code: [commonPrompt] })
@fastCodeLoader([
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'SPCM.COST_REQUEST_STATUS',
  'RS_IP_APPROVAL_NODE',
  'SRSP.PAYMENT_REQUEST_SOURCE',
  'SPFM.YES_NO',
  'SPCM.COST_PRESS_LEVEL',
  'SRSP.ESTIMATE_CIRCUIT_ROLE_TYPE',
  'SPCM.PAYMENT_ADVICE_FLAG',
  'HPFM.FLAG',
])
@connect(({ loading, resaleRequest }) => ({
  resaleRequest,
  queryLoading: loading.effects['resaleRequest/queryList'],
  deleteLoading: loading.effects['resaleRequest/deleteList'],
  dataSource: resaleRequest?.dataSource,
  pagination: resaleRequest?.pagination,
}))
class ResaleRequest extends Component {
  constructor(props) {
    super(props);
    const {
      match: { path },
    } = props;
    const isView = path.includes('/spcm/payment-request-view/query');

    this.state = {
      isView,
      activeKey: ['form', 'table'],
      selectedRows: [], // 选中的rows
      selectedRowKeys: [], // 选中的rowKeys
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      spinning: false,
      exportLoading: false,
      asyncExportFormFlag: false,
      asyncExportListFlag: false,
    };
  }

  asyncExportForm = React.createRef();

  componentDidMount() {
    this.handleSearch();
    this.initPermission();
  }

  initPermission = () => {
    const currentUser = getCurrentUser();
    const { id, currentRoleId } = currentUser;
    fetchPermission({
      routePath: '/spcm/payment-request',
      userId: id,
      roleId: currentRoleId,
    }).then((res) => {
      if (getResponse(res)) {
        const { editFlag } = res;
        const { isView } = this.state;
        this.setState({
          isView: isView || editFlag !== 'Y',
        });
      }
    });
  };

  handleSearch = (page = {}) => {
    setTimeout(() => {
      const { dispatch } = this.props;
      dispatch({
        type: 'resaleRequest/queryList',
        payload: {
          page,
          ...this.getQueryParams(),
        },
      });
    }, 10);
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
    };
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
      `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/singleSheetResalePaymentExport`,
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
        const fileName = intl.get(`${commonPrompt}.view.export.resaleQuery`).d('转售付款申请导出');
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
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
    cusRequest(`/hrpt/v1/${getCurrentOrganizationId()}/payment/export`, {
      method: 'POST',
      query: {
        ...queryParams,
        fileName: !isEmpty(fileDesc)
          ? `RESALE_${fileDesc}`
          : `RESALE_`,
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
      this.asyncExportForm?.current?.resetFields();
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
    // 判断记录集中的单据申请状态（可删除付款申请单据状态为‘草稿、撤销’单据）
    const isDelete = selectedRows.every((v) => {
      return v.requestStatus === 'DRAFT' || v.requestStatus === 'REVOKE';
    });
    if (!isDelete) {
      CusNotification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.only-to-delete`)
          .d('仅可以删除付款申请单据状态为‘草稿、撤销’的单据'),
        duration: 4.0,
      });
    } else {
      dispatch({
        type: 'resaleRequest/deleteList',
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
    if (!selectedRows || selectedRows.length === 0) {
      CusNotification.warning({
        message: intl.get(`${commonPrompt}.view.query.warning`).d('警告'),
        description: intl
          .get(`${commonPrompt}.view.query.select-to-copy`)
          .d('请选择需要复制的单据'),
        duration: 4.0,
      });
      return;
    }
    const that = this;
    CusModal.confirm({
      title: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
      content: intl
        .get(`${commonPrompt}.view.query.if-want-to-copy`)
        .d('是否对选中的单据进行复制?'),
      onOk() {
        if (selectedRows.length === 1) {
          that.setState({
            spinning: true,
          });
          cusRequest(
            `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/${
              mode === 'entire' ? 'copyAll' : 'copy'
            }/${selectedRows[0].costRequestId}`,
            {
              method: 'POST',
              query: mode === 'entire' ? { sourceCode: 'MANAUAL_COPY' } : {},
            }
          ).then((res) => {
            that.setState({
              spinning: false,
            });
            if (res.type === 'error' || res.type === 'warn') {
              CusNotification[res.type]({
                message: intl.get(`${commonPrompt}.view.query.tip`).d('提示'),
                description: res.message,
                duration: 4.0,
              });
            } else {
              const { costRequestId } = res.costPaymentRequest;
              const { isPub } = that.state;
              window.open(
                `${isPub ? '/pub' : ''}/spcm/payment-request/detail/${costRequestId}?newFlag=true`
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
        }
      },
      onCancel() {},
    });
  };

  addRecord = () => {
    const { isPub } = this.state;
    window.open(`${isPub ? '/pub' : ''}/spcm/payment-request/create`);
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
          .get('spcm.resaleQuery.resale.taskNameTooLong')
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
      idpValueMap = {},
      match: { path },
      queryLoading = false,
      deleteLoading = false,
    } = this.props;
    const {
      activeKey,
      isPub,
      selectedRowKeys,
      selectedRows,
      isView,
      spinning,
      exportLoading,
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
      isView,
      onChange: this.handleSearch,
      rowSelection: rowSelection,
    };
    return (
      <PermissionContent
        permissionList={
          path.includes('/spcm/payment-request-view/query')
            ? null
            : [
                {
                  code: `/spcm/payment-request.ps.default`,
                  type: 'visible',
                  meaning: '汇总页显示控制',
                },
              ]
        }
      >
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
                    isView ? undefined : (
                      <>
                        <CusExcelExport
                          requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/resalePaymentApproveTimeExport`}
                          queryParams={this.getQueryParams}
                          downloadType="Blob"
                          fileName={intl
                            .get('spcm.resaleQuery.filename.effectiveReport')
                            .d('转售付款申请审批时效报表')}
                          otherButtonProps={{
                            mini: true,
                          }}
                          buttonText={intl
                            .get(`hzero.common.button.approvalTimeReport`)
                            .d('审批时效')}
                          title={intl.get(`hzero.common.button.approvalTimeReport`).d('审批时效')}
                        />
                        {/* <CusButton mini onClick={() => this.handleExport()} loading={exportLoading}>
                          {intl.get('hzero.common.button.export').d('导出')}
                        </CusButton> */}
                        {/* <Dropdown
                          menu={{
                            items: [
                              { key: 'SYNC_EXPORT', label: intl.get('spcm.resaleQuery.asyncExport').d('同步导出') },
                              { key: 'ASYNC_EXPORT_LIST', label: intl.get('spcm.resaleQuery.asyncExportList').d('异步导出列表') }
                            ],
                            onClick: ({ key }) => {
                              // 同步导出
                              if (key === 'SYNC_EXPORT') {
                                this.handleAsyncExport();
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
                        <CusButton
                          mini
                          onClick={() => this.setState({ asyncExportListFlag: true })}
                        >
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
                          {intl.get(`hzero.common.button.delete`).d('删除')}
                        </CusButton>
                        <CusButton mini loading={spinning} onClick={() => this.copyRecord()}>
                          {intl.get(`hzero.common.button.copy`).d('复制')}
                        </CusButton>
                        <CusButton
                          mini
                          loading={spinning}
                          onClick={() => this.copyRecord('entire')}
                        >
                          {intl.get(`hzero.common.button.entireCcopy`).d('整单复制')}
                        </CusButton>
                        <CusButton type="primary" mini onClick={() => this.addRecord()}>
                          {intl.get(`hzero.common.button.add`).d('新增')}
                        </CusButton>
                      </>
                    )
                  }
                />
              }
              key="table"
            >
              <ListTable {...listTableProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusModal
          title={intl.get('spcm.resaleQuery.exportFileExport').d('转售采购成本付款申请导出')}
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
                  label={intl.get(`spcm.resaleQuery.fileDesc`).d('备注信息')}
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
          title={intl.get('spcm.resaleQuery.resaleExportList').d('转售采购成本付款申请导出列表')}
          visible={this.state.asyncExportListFlag}
          destroyOnClose={true}
          width={700}
          onCancel={() => {
            this.setState({
              asyncExportListFlag: !this.state.asyncExportListFlag,
            });
          }}
          footer={null}
        >
          <ExportHistoryData
            onCancel={() => {
              this.setState({
                asyncExportListFlag: !this.state.asyncExportListFlag,
              });
            }}
            taskName={'RESALE_'}
            fileName={intl
              .get('spcm.resaleQuery.resale.resaleExportFileName')
              .d('转售采购成本付款申请导出')}
            queryParams={{
              ...this.getQueryParams(),
              costRequestId: selectedRows.map((item = {}) => item.costRequestId),
              allCheckedFlag: 'Y',
            }}
            requestUrl={`/hrpt/v1/${organizationId}/payment/resale-export`}
          />
        </CusModal>
      </PermissionContent>
    );
  }
}

export default ResaleRequest;
