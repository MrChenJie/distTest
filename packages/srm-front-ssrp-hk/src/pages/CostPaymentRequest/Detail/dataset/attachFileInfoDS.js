import { DataSet } from 'choerodon-ui/pro';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const attachFileInfo = (prompt, require) => ({
  name: 'attachFileInfo',
  autoCreate: false,
  autoQuery: false,
  paging: false,
  autoLocateAfterCreate: false,
  primaryKey: 'costAttachFileId',
  fields: [
    {
      name: 'costAttachFileId',
      type: FieldType.number,
    },
    {
      name: 'costRequestId',
      type: FieldType.number,
    },
    {
      name: 'fileQuantity',
      type: FieldType.number,
    },
    {
      name: 'fileType',
      textField: 'meaning',
      valueField: 'value',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.attach.fileType`).d('附件类型'),
      required: true,
      options: new DataSet({
        name: 'fileLookupData',
        selection: 'single',
        autoQuery: true,
        transport: {
          read: () => {
            const url = `/hpfm/v1/${organizationId}/lovs/data?lovCode=RS_IP_ATTACHMENT_TYPE`;
            return {
              url,
              method: 'GET',
              transformResponse: (data) => {
                const responseData = JSON.parse(data);
                if (responseData.length) {
                  if (require) {
                    return responseData.filter((item) => {
                      return item.tag === '1';
                    });
                  } else {
                    return responseData.filter((item) => {
                      return item.tag === '0';
                    });
                  }
                }
              },
            };
          },
        },
      }),
    },
    {
      name: 'attachDescription',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.attach.fileName`).d('附件描述'),
    },
    {
      name: 'realName',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.attach.realName`).d('上传人'),
    },
    {
      name: 'creationDate',
      type: FieldType.date,
      label: intl.get(`${prompt}.view.attach.creationDate`).d('上传日期'),
    },
    {
      name: 'remarks',
      type: FieldType.string,
      label: intl.get(`${prompt}.view.attach.attachDescription`).d('说明'),
    },
    {
      name: 'uuid',
      type: 'string',
      label: intl.get('hzero.common.upload.modal.title').d('附件'),
    },
  ],
  transport: {
    read: () => {
      const url = `${SRM_SPUC}/v1/${organizationId}/cost-attach-files`;
      return {
        url,
        method: 'GET',
        params: {
          requiredFlag: require ? '1' : '0',
        },
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/cost-attach-files`,
        method: 'DELETE',
      };
    },
  },
  events: {
    create: ({ record }) => {
      // 附件类型设置默认值 fileType: "INVOICE"
      if (require) {
        record.set('fileType', 'INVOICE');
      } else {
        record.set('fileType', 'OTHER');
      }
    },
    query: ({ params }) => {
      const { requiredFlag, costRequestId } = params;
      if (requiredFlag && costRequestId) {
        return params;
      } else {
        return false;
      }
    },
    update: ({ record, name, value, oldValue }) => {
      if (name === 'fileType' && !value) {
        record.set(name, oldValue); // 禁止删除附件类型的值，防止保存时值为空。
      }
    },
  },
});

export default attachFileInfo;
