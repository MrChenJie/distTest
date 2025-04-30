import React from 'react';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import EditTable from '_cus_components/EditTable';
import { dateRender, operatorRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import CusUpload from '_cus_components/CusUpload';

const commonPrompt = 'spfmhk.dict';
@Form.create()

export default class QaListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const {
      history,
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
      idpValueMap,
      isAnswer,
    } = this.props;
    
    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.qatype`).d('问题分类'),
        width: 160,
        dataIndex: 'caseTypeLov',
        key: 'caseTypeLov',
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.qadetails`).d('问题详情'),
        width: 180,
        dataIndex: 'qaContent',
        key: 'qaContent ',
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.qaaskdate`).d('提问日期'),
        width: 160,
        dataIndex: 'submitTime',
        key: 'submitTime ',
        render: dateRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.attachment`).d('附件上传'),
        width: 160,
        dataIndex: 'attchment',
        key: 'attchment',
        render: (val, record) => (
          <CusUpload
            attachmentUUID={record.qaUuid}
            bucketName="dict"
            filePreview
            viewOnly={true}
            // disabled={!isEdit}
            showReUploadIcon={false}
            isEncrypt
          />
        ),
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portaldictreply`).d('DICT答复内容'),
        width: 180,
        dataIndex: 'answerContent',
        key: 'answerContent',
        render: (_, record) => {
          return (
            <Form.Item>
              {getFieldDecorator('answerContent', {
                initialValue: record.answerContent,
              })(
                <Input
                  disabled={record.replyStatus === 'COMPLETED' || !isAnswer}
                  onChange={(e) => {
                    record.answerContent = e.target.value;
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      // {
      //   title: '答复时间',
      //   dataIndex: 'replyTime',
      //   key: 'replyTime',
      // },
    ];
    return (
      <>
        <EditTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
