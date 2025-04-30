import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
// const prefix = 'spcm.paymentRequest';

export default () => ({
  name: 'attachmentTable',
  autoCreate: false,
  autoQuery: false,
  autoLocateAfterCreate: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      name: 'fileType',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.attachmentType`).d('附件类型'),
      lookupCode: 'RS_IP_ATTACHMENT_TYPE',
      required: true,
      defaultValue: 'RS_OTHER',
      lovPara: {
        tag: '2',
      },
    },
    {
      name: 'attachDescription',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.attachDescription`).d('附件描述'),
    },
    {
      name: 'realName',
      label: intl.get(`spcm.paymentRequest.model.creator`).d('上传人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.uploadDate`).d('上传日期'),
    },
    {
      name: 'remarks',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.description`).d('说明'),
    },
    {
      name: 'uuid',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.attachment`).d('附件'),
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
        url: `${SRM_SPUC}/v1/${organizationId}/cost-attach-files`,
        method: 'DELETE',
        data,
      };
    },
    read: () => {},
  },
  feedback: {
    submitSuccess: (resp) => {
      if (resp.success) {
        notification.success();
      }
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
