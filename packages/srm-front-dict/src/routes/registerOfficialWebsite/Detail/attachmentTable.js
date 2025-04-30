/*
 * @Description:
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2025-03-04 17:23:47
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusUpload from '_cus_components/CusUpload';

const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class AttachmentTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { attachmentList = [], idpValueMap } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.attachmenttype`).d('附件类型'),
        align: 'left',
        width: 150,
        dataIndex: 'fileType',
        render: (_, record) => {
          const attachmentTypeOptions = idpValueMap['DICT.PARTNER_FILE_TYPE'] || [];
          return attachmentTypeOptions.filter((item) => item.value === record.fileType)[0]?.meaning;
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.field.attachmentdescription`).d('附件描述'),
        width: 180,
        dataIndex: 'fileDesc',
      },
      {
        title: intl.get(`${commonPrompt}.view.field.attachmentuploaddate`).d('最后更新时间'),
        dataIndex: 'lastUpdateDate',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${commonPrompt}.view.field.attachment`).d('附件上传'),

        width: 120,
        align: 'left',
        render: (_, record) => {
          return (
            <CusUpload
              attachmentUUID={record.fileUuid}
              bucketName={record.bucketName || 'dict'}
              filePreview
              viewOnly
              showReUploadIcon={false}
              isEncrypt
            />
          );
        },
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          dataSource={attachmentList}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
