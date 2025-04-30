import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import EditTable from '_cus_components/EditTable';
import CusUpload from '_cus_components/CusUpload';
import queryString from 'querystring';
import { tooltipRender } from '_cus_utils/render';
const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class ProjectListTable extends React.Component {
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
      type: 'partnerReview/getProjectInfo',
      payload: {
        partnerId: partnerId || formRecordId,
      },
    });
  }

  render() {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const {
      history,
      rowSelection,
      projectList = [],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
      idpValueMap,
      isAnswer,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.field.portalcooperatecompany`).d('合作公司'),
        dataIndex: 'cooperativeCompany',
        width: 280,
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalprojectintro`).d('项目介绍'),
        width: 280,
        dataIndex: 'projectDesc',
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalprojectamo`).d('项目金额'),
        dataIndex: 'projectAmount',
        width: 280,
        render: (val) => {
          return (
            <div style={{textAlign: 'right'}}>{numberRender(val, 2)}</div>
          )
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcurrency`).d('币种'),
        dataIndex: 'currency',
        width: 280,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalcertificationdoc`).d('证明文件'),
        dataIndex: 'projectFileUuid',
        width: 120,
        render: (val, record) => (
          <CusUpload
            attachmentUUID={record.projectFileUuid}
            bucketName="dict"
            filePreview
            viewOnly
            showReUploadIcon={false}
            isEncrypt
          />
        ),
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={projectList}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
