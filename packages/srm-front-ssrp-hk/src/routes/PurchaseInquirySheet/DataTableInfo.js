import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { dateRender, operatorRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import { Button as ButtonPermission } from 'components/Permission';
import CusUpload from '../../components/CusUpload';
import { Popconfirm } from 'hzero-ui';
import { Form } from 'hzero-ui';
import { getCurrentUser } from 'utils/utils';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'refType';
@Form.create()
export default class DataTableInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }


  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    });
  }


  /**
   * @description 提交生成采购审批
   */
  @Bind()
  handleSubmitToApproval() {
    const { onSubmitToApproval = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onSubmitToApproval(selectedRows);
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDelete(record) {
    const { onDetele = (e) => e, dispatch, purchaseInquirySheetModel } = this.props;
    const { ictPrAttachList } = purchaseInquirySheetModel
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    if (record) {
      selectedRows.push(record);
    }
    dispatch({
      type: 'purchaseInquirySheetModel/commentUpdateState',
      payload: {
        ictPrAttachList: ictPrAttachList.filter(ele => !selectedRows.includes(ele))
      }
    })
    let idList = [];
    selectedRows.map((item) => {
      idList.push(item.id);
    });
    console.log(idList,'idList')
    this.props.getChildDelFileList(idList);
    onDetele(selectedRows, this.clearState);
  }

  /**
   * @description 发布询价
   */
  @Bind()
  handlePublish() {
    const { onPublish = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onPublish(selectedRows);
  }

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.props.getChildDelFileList(newSRows);
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  @Bind()
  onSelectAll(selected, _, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, ROW_KEY);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  // 获取子组件文件信息
  @Bind()
  getfileList(fileList) {
    this.props.getFatherFileList(fileList);
  }

  renderButtons = ({ parent }) => {
    const {
      publishLoading = false,
      submitLoading = false,
      deleteLoading = false,
      exportLoading = false,
    } = parent.props;
    const {
      onMassCreate = (e) => e,
      onOpenModal = (e) => e,
      onExport = (e) => e,
    } = this.props;

    return (
      <>
        <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleSubmitToApproval}
          loading={submitLoading}
        >
          {intl.get(`${promptCode}.button.submitToApproval`).d('提交')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleDelete}
          loading={deleteLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handlePublish}
          loading={publishLoading}
        >
          {intl.get(`${promptCode}.button.publish`).d('发布询价')}
        </CusButton>
        <CusButton mini onClick={onMassCreate}>
          {intl.get(`${promptCode}.button.massCreate`).d('批量创建')}
        </CusButton>
        <CusButton mini onClick={onOpenModal} type='primary'>
          {intl.get('hzero.common.button.create').d('新建')}
        </CusButton>
      </>
    );
  };

  render() {
    const {
      onChange = (e) => e,
      getQueryParams = (e) => (e),
      attachmentSource,
      flag,
      delIdList,
      form,
      purchaseInquirySheetModel
    } = this.props;
    const { ictPrAttachList, prApplyStatus } = purchaseInquirySheetModel
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.attachmentname`).d('附件名称'),
        dataIndex: 'refType',
        width: 160,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>{record?.refType}</Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}`).d('上传时间'),
        dataIndex: 'uploadTime',
        width: 220,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>{record?.uploadTime}</Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.size`).d('文件大小'),
        dataIndex: 'fileSize',
        width: 120,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>{record?.fileSize}</Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}`).d('创建人'),
        dataIndex: 'createdBy',
        width: 120,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>{record?.createdBy}</Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.remarks`).d('备注'),
        dataIndex: 'remark',
        width: 120,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {
                  // record.$form.getFieldDecorator(`${record['fileKey']}#remark`)
                  // (<span>record.$form.getFieldValue(`${record['fileKey']}#remark`)</span>)
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('操作'),
        dataIndex: 'operation',
        width: 120,
        align: 'left',
        render: (text, record) => {
          // console.log(record, 'record');
          return (
            <>
              {prApplyStatus == 'PENDING_REFER' ? (
                <>
                  <CusUpload getfileList={this.getfileList.bind(this)} />
                  <CusButton
                    style={{ marginLeft: '8px' }}
                    type="plain"
                    onClick={() => this.handleDelete(record)}
                  >
                    {intl.get('hzero.common.view.button.delete').d('删除')}
                  </CusButton>
                </>
              ) : (
                <>
                  <CusButton type="plain">
                    <a href={record.filePath}>
                      {intl.get(`hzero.common.view.button.download`).d('下载')}
                    </a>
                  </CusButton>
                </>
              )}
            </>
          );
        },
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    return (
      <>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={ictPrAttachList || []}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
