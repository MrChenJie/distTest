import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentOrganizationId, getAccessToken} from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import formatterCollections from 'utils/intl/formatterCollections';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import { HZERO_FILE } from 'utils/config';
import dayjs from 'dayjs';

const prompt = 'spfmhk.dict';
@Form.create()
@formatterCollections({ code: [prompt] })
@connect(() => ({
  tenantId: getCurrentOrganizationId(),
}))
export default class ListTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      fileDataSource: [],
      viewOnly: true,
    };
  }


  @Bind()
  handleViewFiles(partnerId) {
    const { dispatch } = this.props;
    this.setState({
      visible: true,
    });
    dispatch({
      type: 'registerManagementModel/queryPartnerFileData',
      payload: {
        partnerId,
      },
    }).then(res => {
      console.log(res, 'res');
      this.setState({
        fileDataSource: res,
      })
    });
  }

  @Bind()
  closeUploadModal() {
    this.setState({
      visible: false,
    })
  }

  // 新预览文件
  @Bind()
  handlePreviewFile = (item) => {
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const urlEncode = encodeURIComponent(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=${item.bucketName}&url=${item.fileUrl}`);
    const url = `${onlineApi}${urlEncode}`;
    console.log(url);
    window.open(url, '_blank');
    console.log(`${OOS_HOST}?file=` + encodeURIComponent(`https://scm-uat.cmhktry.com/gwapi/hfle/v1/30000001/files/download?access_token=c5a265b7-ffe7-472c-bded-5a9a497ee8f3&bucketName=private-bucket&url=https://scm-uat.cmhktry.com:9000/scm-private-bucket/30000670/61757128ddf94accb480438fe6d478b5@新建文本文档.txt`));
  };


  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      form: { getFieldDecorator },
      tenantId,
      rowKey,
    } = this.props;
    const { visible, viewOnly, fileDataSource } = this.state;
    const columns = [
      {
        title: intl.get(`spfmhk.dict.view.common.partnername`).d('合作伙伴名称'),
        width: 160,
        dataIndex: 'cmpanyName',
        key: 'cmpanyName',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式'),
        width: 160,
        dataIndex: 'collaborationMode',
        key: 'collaborationMode',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.dict.view.field.email`).d('邮箱'),
        width: 160,
        dataIndex: 'email',
        key: 'email',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.dict.view.field.telno`).d('电话'),
        width: 160,
        dataIndex: 'phone',
        key: 'phone',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.dict.view.field.registrationdate`).d('报名日期'),
        width: 160,
        dataIndex: 'registrationDate',
        key: 'registrationDate',
        render: (value, record) => {
          return (
            <>{dayjs(value).format('YYYY-MM-DD')}</>
          )
        }
      },
      {
        title: intl.get(`spfmhk.dict.view.balcklist.attachments`).d('附件'),
        width: 300,
        dataIndex: 'attachmentUuid',
        render: (value, record, index) => {
          return (
            <CusButton
              type="plain"
              onClick={() => this.handleViewFiles(record.partnerId)}
            >{intl.get(`spfmhk.dict.view.balcklist.attachments`).d('附件')}</CusButton>
          );
        },
      },
    ];
    const fileColumns = [
      {
        title: intl.get(`hzero.common.table.column.fileName`).d('附件名'),
        dataIndex: 'fileName',
      },
      {
        title: intl.get(`hzero.common.uploadFile.view.uploadTime`).d('上传时间'),
        dataIndex: 'creationDate',
      },
      {
        title: intl.get(`hzero.common.table.column.option`).d('操作'),
        render: (_, record) => {
          return (
            <>
              <CusButton type="plain">
                <a href={`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=${record.bucketName}&url=${record.fileUrl}`} target="_blank">{intl.get(`hzero.common.button.download`).d('下载')}</a>
              </CusButton>
              <CusButton
                type="plain"
                style={{ marginLeft: '16px' }}
                onClick={() => {
                  this.handlePreviewFile(record);
                }}
              >
                {intl.get(`hzero.common.button.preview`).d('预览')}
              </CusButton>
            </>
          );
        },
      },
    ];
    return (
      <>
        <CusTable
          rowKey={rowKey}
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
        <CusModal
          visible={visible}
          width={610}
          footer={
            <CusButton
              onClick={this.closeUploadModal}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          }
          onCancel={this.closeUploadModal}
          destroyOnClose
        >
          <CusTable columns={fileColumns}
                    dataSource={fileDataSource}
                    rowKey="fileKey"
          ></CusTable>
        </CusModal>
      </>
    );
  }
}
