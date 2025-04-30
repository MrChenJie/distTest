import React from 'react';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { SRM_PLATFORM, SRM_SSLM, SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import cusRequest from '_cus_utils/request';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { enableRender, yesOrNoRender, totalRender } from 'utils/renderer';
import { PAGE_SIZE_OPTIONS } from 'utils/constants';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';
import qs from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';

const currentUser = getCurrentUser();
const organizationId = getCurrentOrganizationId();

async function fetchBank({ vendorCompanyNum, approvalStatus }) {
  return cusRequest(
    `${SRM_PLATFORM}/v1/${organizationId}/companies/bank-accounts/for-supplier/list`,
    {
      method: 'GET',
      query: {
        vendorNum: vendorCompanyNum,
        approvalStatus: approvalStatus,
        viewAllFlag: 'Y',
      },
    }
  );
}

async function createBankInfo(params) {
  return cusRequest(`${SRM_SSLM}/v1/${organizationId}/bank-acc-change-reqs/single/new`, {
    method: 'POST',
    body: params,
  });
}

async function updateBankInfo(params) {
  return cusRequest(`${SRM_SSLM}/v1/${organizationId}/bank-acc-change-reqs/single/new-for-update`, {
    method: 'POST',
    body: params,
  });
}

async function callBackBankExoSystem(params) {
  return cusRequest(`${SRM_PLATFORM}/v1/exo-system/callBackBankExoSystem`, {
    method: 'POST',
    body: params,
  });
}

@formatterCollections({ code: ['spcm.paymentRequest'] })
@fastCodeLoader(['SPFM.SUPPLIER_BANK_ERP_HOST'])
export default class Index extends React.Component {
  constructor(props) {
    super(props);
    const { vendorCompanyNum, costRequestId, history } = props;
    const search = qs.parse(history.location.search.substr(1)) || {};
    this.state = {
      loading: false,
      createLoading: false,
      updateLoading: false,
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
      vendorCompanyNum: vendorCompanyNum || search.vendorCompanyNum,
      costRequestId: costRequestId || search.requestId,
      sourceSystem: search.sourceSystem,
      requestId: search.requestId,
      requestType: search.requestType,
      currencyCode: search.currency,
      companyOrgCode: search.cmiEntity,
      pageSize: 10,
      current: 1,
    };
  }

  componentDidMount() {
    this.queryBankAccounts();
  }

  @Bind
  queryBankAccounts() {
    const { bankModifyFlag } = this.props;
    const { vendorCompanyNum } = this.state;
    this.setState({
      loading: true,
    });
    fetchBank({ vendorCompanyNum, approvalStatus: bankModifyFlag ? 'FINISHED' : '' }).then(
      (res) => {
        this.setState({
          loading: false,
        });
        if (cusGetResponse(res)) {
          this.setState({
            dataSource: res.map((item) => ({ ...item, rowKey: uuidv4() })),
          });
        }
      }
    );
  }

  @Bind
  handleCreate() {
    const { vendorCompanyNum, costRequestId, sourceSystem } = this.state;
    this.setState({
      createLoading: true,
    });
    createBankInfo({
      sourceSystem,
      vendorNum: vendorCompanyNum,
      sourceCode: 'SPCM_COST_PAYMENT_REQUEST',
      sourceId: costRequestId === '-1' ? undefined : costRequestId,
    }).then((res) => {
      this.setState({
        createLoading: false,
      });
      if (cusGetResponse(res)) {
        this.handleCancel();
        window.open(`/pub/sslm/new-supplier-bank/viewOnly/detail/${res.bankAcctReqId}`);
      }
    });
  }

  @Bind
  handleUpdate(selectedRows) {
    const { costRequestId, sourceSystem } = this.state;
    const { companyId, basicCompanyId, sourceId } = selectedRows[0];
    this.setState({
      updateLoading: true,
    });
    updateBankInfo({
      sourceSystem,
      companyId,
      basicCompanyId,
      companyBankAccountId: sourceId,
      sourceCode: 'SPCM_COST_PAYMENT_REQUEST',
      sourceId: costRequestId === '-1' ? undefined : costRequestId,
    }).then((res) => {
      this.setState({
        updateLoading: false,
      });
      if (cusGetResponse(res)) {
        this.handleCancel();
        window.open(`/pub/sslm/new-supplier-bank/viewOnly/detail/${res.bankAcctReqId}`);
      }
    });
  }

  @Bind
  async handleOk(selectedRows) {
    const { onOk = (e) => e, idpValueMap = {}, currencyCode, companyOrgCode } = this.props;
    const { sourceSystem, requestId, requestType } = this.state;
    if (!selectedRows[0]) {
      CusNotification.error({
        message: intl.get(`spcm.paymentRequest.message.warning.select`).d('请选择一条数据'),
      });
      return false;
    }
    const { enabledFlag, approvalStatus, creatorName } = selectedRows[0];
    if (enabledFlag === '0') {
      CusNotification.error({
        message: intl.get(`spcm.paymentRequest.message.warning.enabledFlag`).d('不能选择禁用数据'),
      });
      return false;
    }
    if (
      !(
        (approvalStatus === 'NEW' && creatorName === currentUser.realName) ||
        approvalStatus === 'WAIT_FINANCIAL_REVIEW' ||
        approvalStatus === 'FINISHED'
      )
    ) {
      CusNotification.error({
        message: intl
          .get(`spcm.paymentRequest.message.warning.approvalStatus`)
          .d('请选择本人新建、待财务复核或已完成的银行！'),
      });
      return false;
    }
    if (approvalStatus === 'NEW' && sourceSystem) {
      if (sourceSystem !== selectedRows[0].sourceSystem) {
        CusNotification.error({
          message: intl
            .get(`spcm.paymentRequest.message.warning.sourceSystem`)
            .d('不能选择非本系统创建的新建状态的银行！'),
        });
        return false;
      }
    }

    // cmi-srm-5264 新增银行信息校验（6月版本ERP调用不触发校验）
    if (sourceSystem !== 'ERP') {
      console.log('cmiEntity', companyOrgCode || this.state.companyOrgCode || '');
      console.log('currency', currencyCode || this.state.currencyCode || '');
      const res = await cusRequest(
        `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/check-bank-info`,
        {
          method: 'POST',
          query: {
            companyOrgCode: companyOrgCode || this.state.companyOrgCode || '',
            currencyCode: currencyCode || this.state.currencyCode || '',
          },
          body: selectedRows[0],
        }
      ).then((res) => {
        cusGetResponse(res);
        return res;
      });
      if (res && res.failed) {
        return false;
      }
    }

    // 如果有来源系统，则调用外围系统的回调接口
    if (sourceSystem === 'ERP') {
      const { sourceId, sourceTable } = selectedRows[0];
      let erpHost;
      if (requestType === '05') {
        erpHost = idpValueMap['SPFM.SUPPLIER_BANK_ERP_HOST']?.find((item) => item.value === '05')
          .tag;
      } else {
        erpHost = idpValueMap['SPFM.SUPPLIER_BANK_ERP_HOST']?.find((item) => item.value === '!05')
          .tag;
      }
      window.location = `${erpHost}bussinessId=${requestId}&bussinessType=${requestType}&bankId=${sourceId}&bankSource=${
        sourceTable === 'SPFM_COMPANY_BANK_ACCOUNT' ? 0 : 1
      }`;
    } else if (sourceSystem === 'MIP') {
      callBackBankExoSystem({ ...selectedRows[0], requestId, requestType, sourceSystem }).then(
        (res) => {
          if (cusGetResponse(res)) {
            if (res.processStatus === 'E') {
              CusNotification.error({
                message: res.processMsg,
              });
            } else {
              this.handleCancel();
              CusNotification.success();
            }
          }
        }
      );
    } else {
      onOk(selectedRows[0]);
    }
  }

  @Bind
  handleCancel() {
    const { onCancel = (e) => e, idpValueMap = {} } = this.props;
    const { sourceSystem, requestId, requestType } = this.state;
    const mipHost = idpValueMap['SPFM.SUPPLIER_BANK_ERP_HOST']?.find(
      (item) => item.value === 'mipHost'
    ).tag;
    if (sourceSystem === 'MIP') {
      window.location = `${mipHost}`;
    } else if (sourceSystem === 'ERP') {
      let erpHost;
      if (requestType === '05') {
        erpHost = idpValueMap['SPFM.SUPPLIER_BANK_ERP_HOST']?.find((item) => item.value === '05')
          .tag;
      } else {
        erpHost = idpValueMap['SPFM.SUPPLIER_BANK_ERP_HOST']?.find((item) => item.value === '!05')
          .tag;
      }
      window.location = `${erpHost}bussinessId=${requestId}&bussinessType=${requestType}`;
    } else {
      onCancel();
    }
  }

  @Bind()
  handleJump(record) {
    if (record.sourceTable === 'SPFM_COMPANY_BANK_ACCOUNT') {
      window.open(`/pub/spfm/participants-suppliers/viewOnly/preview/${record.basicCompanyId}`);
    } else if (record.sourceTable === 'SPFM_COM_BANK_ACC_REQ') {
      window.open(`/pub/sslm/new-supplier-bank/viewOnly/detail/${record.changeReqId}`);
    }
  }

  @Bind()
  handleRow(record) {
    const { rowKey } = record;
    return {
      onDoubleClick: () => {
        this.handleOk([record]);
      },
      onClick: () => {
        this.setState({
          selectedRows: [record],
          selectedRowKeys: [rowKey],
        });
      },
    };
  }


  render() {
    const { isOnlyView = false, bankModifyFlag } = this.props;
    const {
      loading = false,
      createLoading = false,
      updateLoading = false,
      dataSource,
      selectedRows,
      selectedRowKeys,
      pageSize,
      current,
    } = this.state;
    const columns = [
      {
        title: intl.get(`hzero.common.button.detail`).d('详情'),
        dataIndex: 'changeReqNum',
        width: 80,
        render: (val, record) => {
          return (
            <a onClick={() => this.handleJump(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          );
        },
      },
      {
        title: intl
          .get('spcm.paymentRequest.model.selectSupplierBank.approvalStatus')
          .d('审批状态'),
        dataIndex: 'approvalStatusMeaning',
        width: 150,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.bankFirm').d('银行国际代码'),
        dataIndex: 'bankFirm',
        width: 190,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.selectSupplierBank.bankName`).d('银行名称'),
        dataIndex: 'bankName',
        width: 250,
        render: tooltipRender,
      },
      {
        title: intl
          .get('spcm.paymentRequest.model.selectSupplierBank.bankAccountNum')
          .d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 250,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.iban').d('IBAN'),
        dataIndex: 'iban',
        width: 180,
      },
      {
        title: intl
          .get('spcm.paymentRequest.model.selectSupplierBank.bankAccountName')
          .d('收款人名称'),
        dataIndex: 'bankAccountName',
        width: 150,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.selectSupplierBank.bankCountry`).d('国家'),
        dataIndex: 'bankCountryName',
        width: 140,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.bankAddress').d('银行地址'),
        dataIndex: 'bankAddress',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl
          .get('spcm.paymentRequest.model.selectSupplierBank.bankBranchName')
          .d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 150,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.currency').d('账户币种'),
        dataIndex: 'currency',
        width: 120,
      },
      {
        title: intl
          .get('spcm.paymentRequest.model.selectSupplierBank.payeeAddress')
          .d('收款人地址'),
        dataIndex: 'payeeAddress',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.cnapsCode').d('National ID'),
        dataIndex: 'cnapsCode',
        width: 200,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.model.selectSupplierBank.settlementSystem`)
          .d('结算系统'),
        dataIndex: 'settlementSystem',
        width: 160,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.contact').d('CMI联系人'),
        dataIndex: 'contactIdMeaning',
        width: 150,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.accountType').d('账户类型'),
        dataIndex: 'accountTypeMeaning',
        width: 150,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.businessType').d('业务类型'),
        dataIndex: 'businessType',
        width: 120,
      },
      {
        title: intl
          .get('spcm.paymentRequest.model.selectSupplierBank.entrustedAccountFlag')
          .d('是否委托代收账户'),
        dataIndex: 'entrustedAccountFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get('spcm.paymentRequest.model.selectSupplierBank.dataSource').d('来源类型'),
        dataIndex: 'dataSourceMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: (val) => enableRender(Number(val)),
      },
    ];
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    return (
      <>
        {!isOnlyView && !bankModifyFlag && (
          <>
            <div style={{ color: '#f54a45', marginBottom: '8px', marginTop: '-8px' }}>
              {intl
                .get('spcm.paymentRequest.model.selectSupplierBank.info')
                .d(
                  '如系统中有供应商银行信息，请选择；如系统中没有供应商银行信息或者没有需要的银行的信息，请点击【新增】按钮添加供应商银行信息'
                )}
            </div>
            <div style={{ marginBottom: '16px', float: 'right' }}>
              <CusButton
                mini
                onClick={() => {
                  this.handleUpdate(selectedRows);
                }}
                loading={updateLoading}
                disabled={
                  selectedRows.length <= 0 ||
                  (selectedRows[0] && selectedRows[0].approvalStatus !== 'WAIT_FINANCIAL_REVIEW')
                }
              >
                {intl.get('hzero.common.button.update').d('更新')}
              </CusButton>
              <CusButton mini type="primary" onClick={this.handleCreate} loading={createLoading}>
                {intl.get('hzero.common.btn.add').d('新增')}
              </CusButton>
            </div>
            <div style={{ clear: 'both' }} />
          </>
        )}
        <CusTable
          bordered
          rowKey="rowKey"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          rowSelection={isOnlyView ? null : rowSelection}
          onRow={this.handleRow}
          pagination={{
            pageSize: pageSize, // 每页大小
            current: current,
            total: dataSource.length,
          }}
        />
        {!isOnlyView && (
          <div className="cus-modal-body-buttons">
            <CusButton onClick={this.handleCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </CusButton>
            <CusButton
              style={{ marginLeft: '8px' }}
              type="primary"
              onClick={() => this.handleOk(selectedRows)}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </CusButton>
          </div>
        )}
      </>
    );
  }
}
