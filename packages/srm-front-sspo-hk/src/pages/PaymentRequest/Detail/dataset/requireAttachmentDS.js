import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
// const prefix = 'spcm.paymentRequest';
export default ({ onDeleteSuccess = (e) => e }) => ({
  name: 'requireAttachment',
  autoCreate: false,
  autoQuery: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'fileType',
      type: 'string',
      lookupCode: 'RS_IP_ATTACHMENT_TYPE',
      label: intl.get(`spcm.paymentRequest.model.fileType`).d('附件类型'),
      lovPara: {
        tag: ['2', '3'],
      },
      lookupAxiosConfig: () => ({
        transformResponse: (data) => {
          // const contentType = headers['content-type'];
          if (Array.isArray(data)) {
            return data.filter((item) => ['2', '3'].includes(item.tag));
          } else {
            try {
              const a = JSON.parse(data);
              if (Array.isArray(a)) {
                return a.filter((item) => ['2', '3'].includes(item.tag));
              }
            } catch (e) {
              console.log(e);
            }
          }
        },
      }),
    },
    {
      name: 'fileName',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.fileName`).d('附件名称'),
    },
    {
      name: 'necessaryFlag',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.necessaryFlag`).d('是否必要'),
      lookupCode: 'SPFM.YES_NO',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.remark`).d('备注'),
    },
    {
      name: 'uuid',
      type: 'string',
      label: intl.get(`spcm.paymentRequest.model.attachment`).d('附件'),
    },
    {
      name: 'fileQuantity',
      type: 'number',
    },
  ],
  transport: {
    read: () => {},
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/resale-line-filess`,
        method: 'DELETE',
        data,
      };
    },
  },
  feedback: {
    submitSuccess: (resp) => {
      if (resp.success) {
        onDeleteSuccess();
      }
    },
  },
});
