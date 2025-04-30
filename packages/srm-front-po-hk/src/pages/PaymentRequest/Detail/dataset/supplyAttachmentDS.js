import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
// const prefix = 'spcm.paymentRequest';

export default ({ detailInfoDS }) => ({
  name: 'attachmentTable',
  autoCreate: false,
  autoQuery: false,
  autoLocateAfterCreate: false,
  autoLocateFirst: false,
  primaryKey: 'costAttachFileId',
  fields: [
    {
      name: 'fileType',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.supply.fileType`).d('附件类型'),
      lookupCode: 'RS_IP_ATTACHMENT_TYPE',
      required: true,
      lovPara: {
        tag: '4',
      },
    },
    {
      name: 'customerRef',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.supply.customerRef`).d('客户参考编号'),
    },
    {
      name: 'attachDescription',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.supply.attachDescription`).d('附件描述'),
    },
    {
      name: 'creator',
      label: intl.get(`spcm.paymentRequest.model.supply.creator`).d('上传人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.supply.creationDate`).d('上传日期'),
    },
    {
      name: 'remarks',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.supply.remarks`).d('备注'),
    },
    {
      name: 'uuid',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.supply.attachment`).d('附件'),
    },
    {
      name: 'fileQuantity',
      type: 'number',
      defaultValue: 0,
    },
  ],
  transport: {
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice`,
        method: 'DELETE',
        data,
      };
    },
    read: ({ data, params }) => {
      const { costRequestId } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice`,
        method: 'GET',
        data: {
          costRequestId,
        },
        params,
      };
    },
    create: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice/${detailInfoDS.current.get('costRequestId')}`,
        method: 'POST',
      };
    },
    update: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice/${detailInfoDS.current.get('costRequestId')}`,
        method: 'POST',
      };
    },
  },
  feedback: {
    submitSuccess: (resp) => {
      if (resp.success) {
        detailInfoDS.children.supplyAttachmentList.query();
      };
    },
  },
  events: {
    remove: ({ dataSet, records }) => {
      const keys = records.map((record) => record.key);
      setTimeout(() => {
        // eslint-disable-next-line no-param-reassign
        dataSet.records = dataSet.filter((record) => !keys.includes(record.key));
      }, 0);
    },
    update: ({ record, name, value, oldValue }) => {
      if (name === 'fileType' && !value) {
        record.set(name, oldValue); // 禁止删除附件类型的值，防止保存时值为空。
      }
    },
  },
});
