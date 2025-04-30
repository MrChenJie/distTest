/** -- 邀请供应商
 * @date: 2022/03/29 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 1.0
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Modal, Upload } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import styles from './index.less';
import { EMAIL, PHONE } from 'utils/regExp';

import intl from 'utils/intl';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId, tableScrollWidth, getResponse } from 'utils/utils';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { queryMapIdpValue } from 'services/api';
import notification from 'utils/notification';

import deleteIcon from '@/assets/buttonIcons/删除.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import importIcon from '@/assets/buttonIcons/导入.png';
import { downloadFile } from 'hzero-front/lib/services/api';

import Lov from 'components/Lov';
import ExcelExport from '@/components/ExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';

const status = ['create', 'update'];
const organizationId = getCurrentOrganizationId();

@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord'],
})
export default class InviteSuppliersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      visible: false,
      fastCodes: {},
    };
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    this.fetchFastCode();
  }

  checkStatus(record) {
    const { isEdit } = this.props;
    return status.includes(record._status) && isEdit;
  }

  fetchFastCode() {
    const codes = {
      'BID.POTENCY_STATUS': 'BID.POTENCY_STATUS',
    };
    queryMapIdpValue(codes).then((res) => {
      const response = getResponse(res);
      if (response) {
        this.setState({
          fastCodes: response,
        });
      }
    });
  }

  /**
   * 添加行
   *
   * @memberof InviteSuppliersList
   */
  @Bind
  handleAddLine() {
    const { onAddLine = (e) => e } = this.props;
    onAddLine();
  }

  /**
   *删除行
   *
   * @memberof InviteSuppliersList
   */
  @Bind
  @Debounce(300, { leading: true })
  handleDeleteLine() {
    const { onDeleteLine = (e) => e } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    onDeleteLine(selectedRowKeys, selectedRows, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
    });
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof InviteSuppliersList
   */
  @Bind
  handleDataChange() {
    const { unsaveFlag } = this.props;
    if (!unsaveFlag) {
      const { onEdit = (e) => e } = this.props;
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof InviteSuppliersList
   */
  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e, unsaveFlag } = this.props;
    if (unsaveFlag) {
      Modal.confirm({
        title: intl
        .get('bid.bidcommon.view.message.confirmgetout')
        .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        onOk: () => {
          onPageChange(page);
        },
      });
    } else {
      onPageChange(page);
    }
  }

  @Bind
  beforeUpload(file) {
    const {
      // args,
      templateCode = 'BID.PRICE_CONFIG',
      param = {},
    } = this.props;
    const formData = new FormData();
    formData.append('excel', file, file.name);
    // if (args) {
    // formData.append('param', JSON.stringify(args));
    // }
    if (file.uid) {
      const url = `${SRM_BID}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
      this.setState({
        uploadLoading: true,
      });
      request(url, {
        method: 'POST',
        query: param,
        body: formData,
        responseType: 'text',
      })
        .then((res) => {
          if (this.isJSON(res)) {
            notification.error({
              message: intl.get('hzero.common.notification.error').d('操作失败'),
            });
          } else if (res) {
            notification.success({
              message: intl.get('hzero.common.notification.success').d('导入成功'),
            });
            // 导入成功后查一遍数据进行导入的数据展示
            const params = {
              templateCode: templateCode,
              batch: res,
            };
            this.handleImportData(params);
          }
        })
        .finally(() => {
          this.setState({
            uploadLoading: false,
          });
        });
    }
    return false;
  }

  /**
   * 处理数据导入后的数据展示(保存)
   *
   * @memberof Import
   */
  @Bind()
  handleImportData(params) {
    request(
      `${SRM_BID}/v1/${organizationId}/import/data?templateCode=${params.templateCode}&batch=${params.batch}`,
      {
        method: 'GET',
      }
    ).then();
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    this.setState({
      visible: true,
    });
  }

  @Bind
  handleCancel() {
    this.setState({
      visible: false,
      priceFileList: [],
      message: '',
    });
  }

  @Bind
  handleOk() {
    const { priceEntry, upload } = this.state;
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面;
    if (upload) {
      openTab({
        title: intl.get(`1entry.input.title`).d('价格数据录入'),
        key: `${isPub ? '/pub' : ''}${SRM_BID}/price-entry/detail/${priceEntry.priceGroupId}`,
        path: `${isPub ? '/pub' : ''}${SRM_BID}/price-entry/detail/${priceEntry.priceGroupId}`,
        icon: 'edit',
        closable: true,
      });
    }
    this.setState({
      visible: false,
      message: '',
      priceFileList: [],
      upload: false,
    });
  }

  render() {
    const {
      proId,
      dataSource = [],
      pagination = {},
      onSave = (e) => e,
      fetchLoading = false,
      saveLoading = false,
      deleteLoading = false,
    } = this.props;
    const { selectedRowKeys = [], visible = false, fastCodes = {} } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: 70,
        render: (val, record, index) => {
          return index + 1;
        },
      },

      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        key: 'portalCompanyName',
        dataIndex: 'portalCompanyName',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('portalCompanyName', {
              initialValue: record.supplierName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
                  }),
                },
              ],
            })(<Input
              onChange={()=>{
                this.props.isTrue()
              }}
            />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
        key: 'processState',
        dataIndex: 'processState',
        width: 120,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('invitationCode', {
              initialValue: record.processState,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
                  }),
                },
              ],
            })(
              <ValueList
                style={{ width: '100%' }}
                // options={fastCodes['POTENCY_STATUS']}
                options={fastCodes['BID.POTENCY_STATUS']}
                lazyLoad={false}
                allowClear
                onChange={()=>{
                  this.props.isTrue()
                }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.contactor`).d('联系人'),
        key: 'realName',
        dataIndex: 'realName',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('realName', {
              initialValue: record.contact,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.contactor`).d('联系人'),
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.contactphone`).d('联系方式'),
        key: 'phone',
        dataIndex: 'phone',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('phone', {
              initialValue: record.contactinformation,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.contactphone`).d('联系方式'),
                  }),
                },
                // {
                //   pattern: PHONE,
                //   message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                // },
              ],
            })(<Input
              placeholder={intl.get('bid.bidcommon.view.title.Countrycodetelephoneextensionnumber').d('国家代码+电话号码+分机号')}
              onChange={()=>{
                this.props.isTrue()
              }}
              />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.biddashbord.view.title.mail`).d('电子邮箱'),
        key: 'email',
        dataIndex: 'email',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('email', {
              initialValue: record.mail,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.biddashbord.view.title.mail`).d('电子邮箱'),
                  }),
                },
                {
                  pattern: EMAIL,
                  message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                },
                {
                  max: 60,
                  message: intl.get('hzero.common.validation.max', {
                    max: 60,
                  }),
                },
              ],
            })(<Input
              onChange={()=>{
                this.props.isTrue()
              }}
            />)}
          </Form.Item>
        ),
      },
    ];

    const loading = saveLoading || deleteLoading || fetchLoading;

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };

    return (
      <div style={{ marginTop: '-10px' }}>
        {/* {isEdit && ( */}
        <div
          style={{
            marginBottom: '10px',
            float: 'right',
          }}
          className="customize-buttons"
        >
          <ExcelExport
            requestUrl={`${SRM_BID}/v1/${organizationId}/bid-suppliers/exportSupplierInfo?proId=${proId}`}
            // queryParams={formatValues()}
            //   queryParams={this.supplierList}
            downloadType="Blob"
            fileName='邀请供应商导出'
            otherButtonProps={{
              type: 'default',
              icon: null,
            }}
            buttonText={
              <>
                <img src={exportIcon} alt="" />
                {intl.get('bid.bidcommon.view.button.export').d('导出')}
              </>
            }
          />
          <Button
            onClick={this.handleDeleteLine}
            disabled={selectedRowKeys.length === 0 || loading}
            loading={deleteLoading}
          >
            <img src={deleteIcon} alt="" />
            {intl.get('bid.bidcommon.view.button.delete').d('删除')}
          </Button>
          <Button onClick={this.handleAddLine}>
            <img src={addIcon} alt="" />
            {intl.get('bid.bidcommon.view.button.add').d('添加')}
          </Button>
          <Button onClick={onSave} loading={saveLoading}>
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </Button>
        </div>
        {/* )} */}
        <div style={{ clear: 'both' }} />
        <EditTable
          bordered
          rowKey="poOrderId"
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handlePageChange}
          columns={columns}
          loading={fetchLoading}
          rowSelection={rowSelection}
          onDataChange={this.handleDataChange}
          scroll={{ x: tableScrollWidth(columns) }}
        />

        {/* <Modal
          title={intl.get('hzero.common.button.import.result').d('导入结果')}
          visible={visible}
          footer={null}
          destroyOnClose
          width={300}
          style={{ top: 150 }}
          className={styles.priceEntry}
          onCancel={this.handleCancel}
        >
          <p
            style={{
              fontSize: '14px',
              marginTop: '10px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {this.state.message}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Button
              key="submit"
              type="primary"
              style={{ textAlign: 'center' }}
              onClick={this.handleOk}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        </Modal> */}
      </div>
    );
  }
}
