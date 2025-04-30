import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
const organizationId = getCurrentOrganizationId();

export default ({ costRequestId }) => ({
  name: 'bankInfo',
  primaryKey: 'bankInfoId',
  autoCreate: false,
  autoQuery: false,
  selection: false,
  paging: false,
  transport: {
    read: () => ({
      url: `${SRM_SPUC}/v1/${organizationId}/payment-bank-infos/queryBankInfo/${costRequestId}`,
      method: 'GET',
      data: {},
      transformResponse: async (data, headers) => {
        if (headers['content-type'] && headers['content-type'].startsWith('application/json')) {
          const res = JSON.parse(data);
          if (isEmpty(res)) {
            return [];
          } else {
            return [res];
          }
        }
      },
    }),
    destroy: ({ data }) => ({
      url: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/payment-bank-infos/${data[0].bankInfoId}`,
      method: 'DELETE',
    }),
  },
  fields: [
    {
      name: 'bankApprovalStatus',
      type: 'string',
    },
    {
      name: 'bankApprovalStatusMeaning',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.bankInfo.bankApprovalStatus`).d('审批状态'),
    },
    {
      name: 'changeReqNum',
      type: 'string',
      label: intl.get(`hzero.common.button.detail`).d('详情'),
    },
    {
      name: 'bankAccountName',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.bankInfo.bankAccountName`).d('银行账户名称'),
    },
    {
      name: 'bankId',
      type: 'string',
    },
    {
      name: 'bankName',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.bankInfo.bankName`).d('收款银行'),
    },
    {
      name: 'bankAccountNum',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.bankInfo.bankAccountNum`).d('收款银行账号'),
    },
    {
      name: 'iban',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.bankInfo.iban`).d('IBAN'),
    },
    {
      name: 'bankFirm',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.bankInfo.bankFirm`).d('SWIFT Code'),
    },
    {
      name: 'poNumber',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.bankInfo.poNumber`).d('采购订单编号'),
    },
  ],
});
