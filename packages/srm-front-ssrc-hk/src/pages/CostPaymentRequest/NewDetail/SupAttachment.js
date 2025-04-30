/**
 * @Description: 补充附件
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import uuidv4 from 'uuid/v4';
import dayjs from 'dayjs';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import {
  tableScrollWidth,
  getCurrentOrganizationId,
  getCodeMeaning,
  createPagination,
  addItemToPagination,
  delItemsToPagination,
  getEditTableData,
} from 'utils/utils';
import { getCurrentUser } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusUpload from '_cus_components/CusUpload';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusSpin from '_cus_components/CusSpin';
import CusNotification from '_cus_components/CusNotification';
import { tooltipRender } from '_cus_utils/render';

const ROW_KEY = 'costAttachFileId';
const prompt = 'spcm.costPayment';

@connect(({ costRequest, loading }) => ({
  costRequest,
  viewButtonFlag: costRequest.supAttViewButtonFlag, // 补充附件按钮控制
  queryLoading: loading.effects['costRequest/getSupplyAttachFiles'],
  saveLoading: loading.effects['costRequest/saveSupplyAttachFiles'],
  deleteLoading: loading.effects['costRequest/deleteSupplyAttachFiles'],
}))
export default class SupAttachment extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      dataSource: [],
      pagination: {},
    };
  }

  componentDidMount() {
    this.querySupplyAttachFiles();
    this.getPaymentAdvicePer();
  }

  /**
   * 补充附件按钮权限
   */
  @Bind
  getPaymentAdvicePer() {
    const { dispatch } = this.props;
    dispatch({
      type: 'costRequest/getPaymentAdvicePer',
    });
  }

  @Bind
  querySupplyAttachFiles(page = {}) {
    const { dispatch, costRequestId } = this.props;
    if (costRequestId === '-1') {
      return false;
    }
    dispatch({
      type: 'costRequest/getSupplyAttachFiles',
      payload: {
        costRequestId,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, _status: 'update' })),
          pagination: createPagination(res),
        });
      }
    });
  }

  isEdit(record) {
    const { viewButtonFlag } = this.props;
    return ['create', 'update'].includes(record._status) && viewButtonFlag;
  }

  @Bind
  handleCreate() {
    const { dataSource = [], pagination = {} } = this.state;
    const newPagination = addItemToPagination(dataSource.length, pagination);
    this.setState({
      dataSource: [{ [ROW_KEY]: uuidv4(), _status: 'create' }, ...dataSource],
      pagination: newPagination,
    });
  }

  @Bind
  @Debounce(300, { leading: true })
  handleSave() {
    const { dispatch, costRequestId } = this.props;
    const { dataSource = [] } = this.state;
    const saveList = getEditTableData(dataSource, [ROW_KEY]);
    if (saveList.length === 0) {
      return false;
    }
    dispatch({
      type: 'costRequest/saveSupplyAttachFiles',
      payload: {
        costRequestId,
        saveList,
      },
    }).then((res) => {
      if (res) {
        CusNotification.success();
        this.querySupplyAttachFiles();
      }
    });
  }

  @Bind
  handleDelete() {
    const { dataSource, pagination, selectedRowKeys, selectedRows } = this.state;
    const updateLines = selectedRows.filter((item) => item._status === 'update');
    const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[ROW_KEY]));
    const newPagination = delItemsToPagination(selectedRows.length, dataSource.length, pagination);
    if (updateLines.length > 0) {
      const { dispatch } = this.props;
      dispatch({
        type: 'costRequest/deleteSupplyAttachFiles',
        payload: updateLines,
      }).then((res) => {
        if (res) {
          CusNotification.success();
          if (newDataSource.length === 0) {
            this.querySupplyAttachFiles();
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
            });
          } else {
            this.setState({
              dataSource: newDataSource,
              pagination: newPagination,
              selectedRows: [],
              selectedRowKeys: [],
            });
          }
        }
      });
    } else {
      this.setState({
        dataSource: newDataSource,
        pagination: newPagination,
        selectedRows: [],
        selectedRowKeys: [],
      });
    }
  }

  render() {
    const {
      viewButtonFlag,
      idpValueMap = {},
      queryLoading = false,
      infoFlag,
      isCreate,
      saveLoading = false,
      deleteLoading = false,
    } = this.props;
    const { selectedRows, dataSource, pagination } = this.state;

    const columns = [
      {
        title: intl.get(`${prompt}.model.supply.fileType`).d('附件类型'),
        dataIndex: 'fileType',
        width: 150,
        required: true,
        render: (text, record) =>
          this.isEdit(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`fileType`, {
                initialValue: record.fileType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.model.supply.fileType`).d('附件类型'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  options={idpValueMap['RS_IP_ATTACHMENT_TYPE']?.filter((item) => item.tag === '4')}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(getCodeMeaning(text, idpValueMap['RS_IP_ATTACHMENT_TYPE']))
          ),
      },
      {
        title: intl.get(`${prompt}.model.supply.customerRef`).d('客户参考编号'),
        dataIndex: 'customerRef',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.model.supply.attachDescription`).d('附件描述'),
        dataIndex: 'attachDescription',
        width: 150,
        render: (text, record) =>
          this.isEdit(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`attachDescription`, {
                initialValue: record.attachDescription,
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.model.supply.creator`).d('上传人'),
        dataIndex: 'creator',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.model.supply.creationDate`).d('上传日期'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.model.supply.remarks`).d('备注'),
        dataIndex: 'remarks',
        width: 150,
        render: (text, record) =>
          this.isEdit(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remarks`, {
                initialValue: record.remarks,
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.model.supply.attachment`).d('附件'),
        dataIndex: 'uuid',
        width: 170,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`uuid`, {
              initialValue: record.uuid,
            })(
              <CusUpload
                isEncrypt
                bucketName="payment-advice"
                tenantId={getCurrentOrganizationId()}
                viewOnly={!this.isEdit(record)}
                attachmentUUID={record.$form.getFieldValue('uuid')}
                showReUploadIcon={false}
                onChange={(attachmentUUID) => {
                  record.$form.setFieldsValue({
                    uuid: attachmentUUID,
                  });
                  Object.assign(record, {
                    uuid: attachmentUUID,
                    creationDate: dayjs().format(DEFAULT_DATETIME_FORMAT),
                    creator: getCurrentUser().realName,
                  });
                  this.setState({});
                }}
              />
            )}
          </Form.Item>
        ),
      },
    ];

    const rowSelection = viewButtonFlag
      ? {
          selectedRowKeys: selectedRows.map((item) => item[ROW_KEY]),
          onChange: (keys, rows) => {
            this.setState({
              selectedRows: rows,
              selectedRowKeys: keys,
            });
          },
        }
      : null;

    return (
      <>
        <CusSpin spinning={queryLoading}>
          {viewButtonFlag && (
            <div style={{ position: 'absolute', right: '32px', top: '-48px' }}>
              <CusButton
                mini
                loading={saveLoading}
                disabled={isCreate || dataSource.length === 0}
                onClick={this.handleSave}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </CusButton>
              <CusButton
                mini
                disabled={selectedRows.length === 0}
                loading={deleteLoading}
                onClick={() => CusModal.CusDeleteConfirm(() => this.handleDelete())}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </CusButton>
              <CusButton mini type="primary" onClick={this.handleCreate}>
                {intl.get('hzero.common.button.create').d('新建')}
              </CusButton>
            </div>
          )}
          {infoFlag && dataSource.length === 0 && (
            <div className="customize-info-message">
              {intl
                .get(`${prompt}.view.message.supplyAttachment.notProvided`)
                .d('银行自付款日起30天，尚未提供付款凭证信息')}
            </div>
          )}
          <EditTable
            rowKey={ROW_KEY}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => this.querySupplyAttachFiles(page)}
            scroll={{ x: tableScrollWidth(columns) }}
          />
        </CusSpin>
      </>
    );
  }
}
