import React from 'react';
import { Modal, Table, Button } from 'hzero-ui';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import request from 'utils/request';
import notification from 'utils/notification';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import saveIcon from '@/assets/buttonIcons/更新.png';
import addIcon from '@/assets/buttonIcons/新建.png';
const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();

async function fetchBank({ vendorCompanyNum }) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/bank-accounts/for-supplier/list`, {
    method: 'GET',
    query: { vendorNum: vendorCompanyNum },
  });
}

async function createBankInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/bank-acc-change-reqs/single/new`, {
    method: 'POST',
    body: params,
  });
}

async function updateBankInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/bank-acc-change-reqs/single/new-for-update`, {
    method: 'POST',
    body: params,
  });
}

export default class SelectSupplierBank extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      createLoading: false,
      updateLoading: false,
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.queryBankAccounts();
  }

  @Bind
  queryBankAccounts() {
    const { vendorCompanyNum } = this.props;
    this.setState({
      loading: true,
    });
    fetchBank({ vendorCompanyNum }).then((res) => {
      this.setState({
        loading: false,
      });
      if (getResponse(res)) {
        this.setState({
          dataSource: res.map((item) => ({ ...item, rowKey: uuidv4() })),
        });
      }
    });
  }

  @Bind
  handleCreate() {
    const { vendorCompanyNum, costRequestId, history, onCancel = (e) => e, isPub } = this.props;
    this.setState({
      createLoading: true,
    });
    createBankInfo({
      vendorNum: vendorCompanyNum,
      sourceCode: 'SPCM_COST_PAYMENT_REQUEST',
      sourceId: costRequestId === '-1' ? undefined : costRequestId,
    }).then((res) => {
      this.setState({
        createLoading: false,
      });
      if (getResponse(res)) {
        onCancel();
        history.push({
          pathname: `${isPub ? '/pub' : ''}/sslm/new-supplier-bank/detail/${res.bankAcctReqId}`,
          state: { source: `/spcm/cost/payment/request/detail/${costRequestId}` },
        });
      }
    });
  }

  @Bind
  handleUpdate(selectedRows) {
    const { costRequestId, history, onCancel = (e) => e, isPub } = this.props;
    const { companyId, basicCompanyId, sourceId } = selectedRows[0];
    this.setState({
      updateLoading: true,
    });
    updateBankInfo({
      companyId,
      basicCompanyId,
      companyBankAccountId: sourceId,
      sourceCode: 'SPCM_COST_PAYMENT_REQUEST',
      sourceId: costRequestId === '-1' ? undefined : costRequestId,
    }).then((res) => {
      this.setState({
        updateLoading: false,
      });
      if (getResponse(res)) {
        onCancel();
        history.push({
          pathname: `${isPub ? '/pub' : ''}/sslm/new-supplier-bank/detail/${res.bankAcctReqId}`,
          state: { source: `/spcm/cost/payment/request/detail/${costRequestId}` },
        });
      }
    });
  }

  @Bind
  handleOk() {
    const { onOk = (e) => e } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows[0]) {
      const { enabledFlag, cnapsCode, bankCountryCode, approvalStatus, creatorName } =
        selectedRows[0];
      if (enabledFlag === '0') {
        notification.warning({
          message: intl.get(`spcm.costPayment.message.warning.enabledFlag`).d('不能选择禁用数据'),
        });
        return false;
      }
      // if (!cnapsCode && bankCountryCode === 'CN') {
      //   notification.warning({
      //     message: intl
      //       .get(`spcm.costPayment.message.warning.cnapsCode`)
      //       .d('请补充选择银行的银行联行号，谢谢！'),
      //   });
      //   return false;
      // }
      if (
        !(
          (approvalStatus === 'NEW' && creatorName === currentUser.realName) ||
          approvalStatus === 'WAIT_FINANCIAL_REVIEW' ||
          approvalStatus === 'FINISHED'
        )
      ) {
        notification.warning({
          message: intl
            .get(`spcm.costPayment.message.warning.approvalStatus`)
            .d('请选择本人新建、待财务复核或已完成的银行！'),
        });
        return false;
      }
      onOk(selectedRows[0]);
    } else {
      notification.warning({
        message: intl.get(`spcm.costPayment.message.warning.select`).d('请选择一条数据'),
      });
    }
  }

  @Bind()
  handleJump(record) {
    const { isPub } = this.props;
    if (record.sourceTable === 'SPFM_COMPANY_BANK_ACCOUNT') {
      window.open(
        `${isPub ? '/pub' : ''}/spfm/participants-suppliers-all/preview/${record.basicCompanyId}`
      );
    } else if (record.sourceTable === 'SPFM_COM_BANK_ACC_REQ') {
      window.open(`${isPub ? '/pub' : ''}/sslm/new-supplier-bank/detail/${record.changeReqId}`);
    }
  }

  render() {
    const { visible, onCancel = (e) => e } = this.props;
    const {
      loading = false,
      createLoading = false,
      updateLoading = false,
      dataSource,
      selectedRows,
      selectedRowKeys,
    } = this.state;
    const columns = [
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.approvalStatus').d('审批状态'),
        dataIndex: 'approvalStatusMeaning',
        width: 150,
      },
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
        title: intl.get('spcm.costPayment.model.selectSupplierBank.cnapsCode').d('银行联行号'),
        dataIndex: 'cnapsCode',
        width: 200,
      },
      {
        title: intl
          .get('spcm.costPayment.model.selectSupplierBank.entrustedAccountFlag')
          .d('是否委托代收账户'),
        dataIndex: 'entrustedAccountFlag',
        width: 150,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`spcm.costPayment.model.selectSupplierBank.bankCountry`).d('国家'),
        dataIndex: 'bankCountryName',
        width: 140,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.bankFirm').d('银行国际代码'),
        dataIndex: 'bankFirm',
        width: 190,
      },
      {
        title: intl.get(`spcm.costPayment.model.selectSupplierBank.bankName`).d('银行名称'),
        dataIndex: 'bankName',
        width: 180,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.bankAddress').d('银行地址'),
        dataIndex: 'bankAddress',
        width: 150,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.bankBranchName').d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 150,
      },
      {
        title: intl
          .get('spcm.costPayment.model.selectSupplierBank.bankAccountName')
          .d('收款人名称'),
        dataIndex: 'bankAccountName',
        width: 150,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.bankAccountNum').d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 180,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.currency').d('账户币种'),
        dataIndex: 'currency',
        width: 120,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.payeeAddress').d('收款人地址'),
        dataIndex: 'payeeAddress',
        width: 150,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.contact').d('CMI联系人'),
        dataIndex: 'contactIdMeaning',
        width: 150,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.accountType').d('账户类型'),
        dataIndex: 'accountTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('spcm.costPayment.model.selectSupplierBank.businessType').d('业务类型'),
        dataIndex: 'businessType',
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
      <Modal
        title={intl.get('spcm.costPayment.view.selectSupplierBank').d('选择供应商银行')}
        visible={visible}
        onCancel={onCancel}
        width={1000}
        destroyOnClose
        onOk={this.handleOk}
      >
        <div
          style={{
            marginBottom: '10px',
            float: 'right',
          }}
          className="customize-buttons"
        >
          <div>
            <Button
              onClick={() => {
                this.handleUpdate(selectedRows);
              }}
              loading={updateLoading}
              disabled={
                selectedRows.length <= 0 ||
                (selectedRows[0] && selectedRows[0].approvalStatus !== 'WAIT_FINANCIAL_REVIEW')
              }
            >
              <img src={saveIcon} alt="" />
              {intl.get('hzero.common.button.update').d('更新')}
            </Button>
            <Button onClick={this.handleCreate} loading={createLoading}>
              <img src={addIcon} alt="" />
              {intl.get('hzero.common.btn.add').d('新增')}
            </Button>
          </div>
        </div>
        <div style={{ clear: 'both' }} />
        <Table
          bordered
          rowKey="rowKey"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={false}
        />
      </Modal>
    );
  }
}
