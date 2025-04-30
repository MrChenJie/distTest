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
import uuid from 'uuid/v4';


/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const ROW_KEY = 'refType';
@Form.create()
export default class DataTableInfo extends React.Component {
  constructor(props) {
    super(props);
    // const { onRef } = props;
    // if (onRef) {
    //   onRef(this);
    // }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
      attachmentSourceValue: []
    };
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    console.log(this.props.ictPrAttachList == undefined);
    if (this.props.ictPrAttachList != [] && this.props.ictPrAttachList != undefined) {
      this.setState({
        attachmentSourceValue: [...this.props.attachmentSource, ...this.props.ictPrAttachList]
      })
    }
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
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { businessType, enquiryPriceId, enquiryPriceRoundsId } = record;
    let url = '';
    switch (businessType) {
      case 'STANDARD':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/standard-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'ICTS':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'CHINA_DIA':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/china-dia-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
    }
    window.open(url);
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
    const { onDetele = (e) => e, dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    // if (selectedRows.length === 0) {
    //   CusNotification.error({
    //     message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
    //   });
    //   return 0;
    // }
    if (record) {
      selectedRows.push(record)
    }
    console.log(selectedRows, 'selectedRows')
    // console.log(this.state.attachmentSourceValue, 'attachmentSourceValue')
    this.setState({
      attachmentSourceValue: this.state.attachmentSourceValue.filter(ele => !selectedRows.includes(ele))
    })
    let idList = []
    selectedRows.map((item) => {
      idList.push(item.id)
    })
    this.props.getChildDelFileList(idList)
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
    console.log('newSRows', newSRows);
    this.props.getChildDelFileList(newSRows)
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

  /**
   * 操作render
   */
  @Bind()
  optionsRender(_, record) {
    const { match } = this.props;
    const operators = [
      {
        key: 'upload',
        ele: (
          <CusUpload getfileList={this.getfileList.bind(this)} />
        ),
        len: 2,
        title: intl.get('hzero.common').d('上传'),
      },
      {
        key: 'delete',
        ele: (
          <Popconfirm
            title={intl.get('hpfm.prompt.model.message.confirm.remove').d('确认删除此条记录？')}
            onConfirm={() => {
              this.handleDelete(record);
            }}
          >
            <ButtonPermission
              type='text'
              permissionList={[
                {
                  code: `${match.path}.button.delete`,
                  type: 'button',
                  meaning: '表单配置行-删除',
                },
              ]}
              style={{ marginLeft: 8, width: '50px', float: 'left' }}
            >
              <span>{intl.get('hzero.common.button.delete').d('删除')}</span>
            </ButtonPermission>
          </Popconfirm>
        ),
        len: 2,
        title: intl.get('hzero.common.button.delete').d('删除'),
      },
    ];
    return operatorRender(operators, record);
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
      ictPrAttachList,
      flag,
      delIdList
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
      attachmentSourceValue
    } = this.state;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.label`).d('附件名称'),
        dataIndex: 'refType',
        width: 160,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {
                  record.refType
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('上传时间'),
        dataIndex: 'uploadTime',
        width: 220,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {
                  record.uploadTime
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('文件大小'),
        dataIndex: 'fileSize',
        width: 120,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {
                  record.fileSize
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('创建人'),
        dataIndex: 'createdBy',
        width: 120,
        render: (val, record) => {
          return (
            <Form className="customize-from">
              <Form.Item>
                {
                  record.createdBy
                }
              </Form.Item>
            </Form>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.label`).d('备注'),
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
        render: this.optionsRender,
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
          dataSource={[...attachmentSourceValue, ...attachmentSource]}
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
