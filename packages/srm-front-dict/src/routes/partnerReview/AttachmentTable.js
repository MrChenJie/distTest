import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import queryString from 'querystring';
import CusUpload from '_cus_components/CusUpload';

const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class AttachmentTable extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.getInfo();
  }

  // 获取列表
  getInfo() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId, partnerId } = queryString.parse(search?.substring(1));
    dispatch({
      type: 'partnerReview/getAttachmentInfo',
      payload: {
        partnerId: partnerId || formRecordId,
      },
    });
  }

  render() {
    const {
      rowSelection,
      attachmentList = [],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
      idpValueMap,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.attachmenttype`).d('附件类型'),
        align: 'left',
        width: 150,
        dataIndex: 'fileTypeMeaning',
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
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={attachmentList}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
