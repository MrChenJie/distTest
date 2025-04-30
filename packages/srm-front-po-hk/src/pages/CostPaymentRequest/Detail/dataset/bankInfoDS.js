import intl from 'utils/intl';

export default ({ prompt }) => ({
  name: 'bankInfo',
  primaryKey: 'bankInfoId',
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'bankApprovalStatus',
      type: 'string',
    },
    {
      name: 'bankApprovalStatusMeaning',
      type: 'string',
      label: intl.get(`${prompt}.model.bankInfo.bankApprovalStatus`).d('审批状态'),
    },
    {
      name: 'changeReqNum',
      type: 'string',
      label: intl.get(`hzero.common.button.detail`).d('详情'),
    },
    {
      name: 'bankAccountName',
      type: 'string',
      label: intl.get(`${prompt}.model.bankInfo.bankAccountName`).d('银行账户名称'),
    },
    {
      name: 'bankId',
      type: 'string',
    },
    {
      name: 'bankName',
      type: 'string',
      label: intl.get(`${prompt}.model.bankInfo.bankName`).d('收款银行'),
    },
    {
      name: 'bankAccountNum',
      type: 'string',
      label: intl.get(`${prompt}.model.bankInfo.bankAccountNum`).d('收款银行账号'),
    },
    {
      name: 'iban',
      type: 'string',
      label: intl.get(`${prompt}.model.bankInfo.iban`).d('IBAN'),
    },
    {
      name: 'bankFirm',
      type: 'string',
      label: intl.get(`${prompt}.model.bankInfo.bankFirm`).d('SWIFT Code'),
    },
    {
      name: 'poNumber',
      type: 'string',
      label: intl.get(`${prompt}.model.bankInfo.poNumber`).d('采购订单编号'),
    },
  ],
});
