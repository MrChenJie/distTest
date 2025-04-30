/** -- 邀请供应商
 * @date: 2022/03/29 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 1.0
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Upload } from 'antd';
import CusInput from '_cus_components/CusInput';
import { Bind, Debounce } from 'lodash-decorators';
import styles from './index.less';
import { EMAIL, PHONE } from 'utils/regExp';
import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';
import CusModal from '_cus_components/CusModal';
import intl from 'utils/intl';
import { SRM_BID } from '@/common/config';
import {
  getCurrentOrganizationId,
  tableScrollWidth,
  getResponse,
  getCurrentLanguage,
  getCurrentUser,
} from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import { queryMapIdpValue } from 'services/api';
import notification from 'utils/notification';

import CusExcelExport from '_cus_components/CusExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';

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
      'HKPC.SUPPLIERTYPE': 'HKPC.SUPPLIERTYPE',
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
    this.props.onChangeTabsFlag && this.props.onChangeTabsFlag();
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
      CusModal.confirm({
        content: intl
          .get('bid.bidcommon.view.message.confirmgetout')
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okType: 'normal',
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
    const { loginName } = getCurrentUser();
    const {
      proId,
      dataSource = [],
      pagination = {},
      onSave = (e) => e,
      fetchLoading = false,
      saveLoading = false,
      deleteLoading = false,
      isSaveFlag = false,
      getDetailList,
    } = this.props;
    const { selectedRowKeys = [], visible = false, fastCodes = {} } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: getCurrentLanguage() === 'zh_CN' ? 62 : 125,
        editable: true,
        fixed: 'left',
        dataIndex: 'orderSeq',
        render: (val, row, index) => {
          return <div style={{ textAlign: 'center' }}>{index + 1}</div>;
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.Type`).d('类型'),
        dataIndex: 'supplierSourceType',
        required: true,
        width: 200,
        render: (_, record) => {
          return ['completed', 'closed'].includes(getDetailList?.proState) ||
            (this.props.getDetailList.proState === 'in_process' &&
              this.props.getDetailList.purchasingEmpNum !== loginName &&
              this.props.getDetailList.transferorEmpNum !== loginName) ? (
            <div>{record.supplierSourceTypeMeaning}</div>
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`supplierSourceType`, {
                initialValue: record.supplierSourceType,
                rules: [
                  {
                    required: true,
                    message: intl.get(`hzero.common.validation.notNull`, {
                      name: intl.get(`HKPC.commom.view.title.Type`).d('类型'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  options={fastCodes['HKPC.SUPPLIERTYPE']}
                  onChange={() => {
                    this.props.isTrue();
                    record.contact = null;
                    record.contactinformation = null;
                    record.mail = null;
                    record.supplierName = null;
                    record.$form.setFieldsValue({
                      realName: undefined,
                      phone: undefined,
                      email: undefined,
                      portalCompanyName: undefined,
                    });
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        key: 'portalCompanyName',
        dataIndex: 'portalCompanyName',
        required: true,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => {
          const type = record.$form.getFieldValue('supplierSourceType');
          return type === undefined ||
            ['completed', 'closed'].includes(getDetailList?.proState) ||
            (this.props.getDetailList.proState === 'in_process' &&
              this.props.getDetailList.purchasingEmpNum !== loginName &&
              this.props.getDetailList.transferorEmpNum !== loginName) ? (
            <div>{record.supplierName}</div>
          ) : (
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
              })(
                type === 'internal' ? (
                  <CusLov
                    code="CMHK.QUALIFIED_SUPPLIER"
                    lovOptions={{ displayField: 'companyNameCh', valueField: 'companyNameCh' }}
                    textValue={record.supplierName}
                    onChange={(_, lovRecord) => {
                      record.contact = lovRecord.name;
                      record.contactinformation = lovRecord.phoneNumber;
                      record.mail = lovRecord.email;
                      record.$form.setFieldsValue({
                        realName: lovRecord.name,
                        phone: lovRecord.phoneNumber,
                        email: lovRecord.email,
                      });
                      this.props.isTrue();
                    }}
                  />
                ) : (
                  <CusInput.TextArea
                    autoChangeSize={true}
                    onChange={() => {
                      this.props.isTrue();
                    }}
                  />
                )
              )}
            </Form.Item>
          );
        },
      },
      // {
      //   title: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
      //   key: 'processState',
      //   dataIndex: 'processState',
      //   required: true,
      //   width: getCurrentLanguage() === 'zh_CN' ? 110 : 150,
      //   onHeaderCell: () => ({ className: styles['table-thead-required'] }),
      //   render: (val, record) =>
      //     ['completed', 'closed'].includes(getDetailList?.proState) ||
      //     (this.props.getDetailList.proState === 'in_process' &&
      //       this.props.getDetailList.purchasingEmpNum !== loginName &&
      //       this.props.getDetailList.transferorEmpNum !== loginName) ? (
      //       <div>{record.processStateMeaning}</div>
      //     ) : (
      //       <Form.Item>
      //         {record.$form.getFieldDecorator('invitationCode', {
      //           initialValue: record.processState,
      //           rules: [
      //             {
      //               required: true,
      //               message: intl.get('hzero.common.validation.notNull', {
      //                 name: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
      //               }),
      //             },
      //           ],
      //         })(
      //           <CusSelect
      //             style={{ width: '100%' }}
      //             options={fastCodes['BID.POTENCY_STATUS']}
      //             lazyLoad={false}
      //             onChange={() => {
      //               this.props.isTrue();
      //             }}
      //           />
      //         )}
      //       </Form.Item>
      //     ),
      // },
      {
        title: intl.get(`bid.bidcommon.view.title.contactor`).d('联系人'),
        key: 'realName',
        dataIndex: 'realName',
        required: true,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (_, record) => {
          const type = record.$form.getFieldValue('supplierSourceType');
          console.log('type', type);
          return (
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
              })(
                type === 'external' ? (
                  <CusInput.TextArea autoChangeSize={true} />
                ) : (
                  tooltipRender(record.contact)
                )
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.contactphone`).d('联系方式'),
        key: 'phone',
        dataIndex: 'phone',
        required: true,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (_, record) => {
          const type = record.$form.getFieldValue('supplierSourceType');
          return (
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
              })(
                type === 'external' ? (
                  <CusInput.TextArea
                    autoChangeSize={true}
                    placeholder={intl
                      .get('bid.bidcommon.view.title.Countrycodetelephoneextensionnumber')
                      .d('国家代码+电话号码+分机号')}
                    onChange={() => {
                      this.props.isTrue();
                    }}
                  />
                ) : (
                  tooltipRender(record.contactinformation)
                )
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.biddashbord.view.title.mail`).d('电子邮箱'),
        key: 'email',
        dataIndex: 'email',
        required: true,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => {
          const type = record.$form.getFieldValue('supplierSourceType');
          return (
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
              })(
                type === 'external' ? (
                  <CusInput.TextArea
                    autoChangeSize={true}
                    onChange={() => {
                      this.props.isTrue();
                    }}
                  />
                ) : (
                  tooltipRender(record.mail)
                )
              )}
            </Form.Item>
          );
        },
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
      getCheckboxProps: (record) => ({
        disabled:
          ['completed', 'closed'].includes(getDetailList?.proState) ||
          (this.props.getDetailList.proState === 'in_process' &&
            this.props.getDetailList.purchasingEmpNum !== loginName &&
            this.props.getDetailList.transferorEmpNum !== loginName),
      }),
    };

    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };

    return (
      <CusSpin spinning={loading}>
        <div>
          {/* {isEdit && ( */}
          <div
            style={{
              marginBottom: '16px',
              float: 'right',
            }}
          >
            <CusExcelExport
              requestUrl={`${SRM_BID}/v1/${organizationId}/bid-suppliers/exportSupplierInfo?proId=${proId}`}
              downloadType="Blob"
              fileName="邀请供应商导出"
              otherButtonProps={{
                type: 'default',
                icon: null,
                mini: true,
              }}
              buttonText={<>{intl.get('bid.bidcommon.view.button.export').d('导出')}</>}
            />
            {!(selectedRowKeys.length === 0 || loading) && (
              <CusButton
                onClick={this.handleDeleteLine}
                mini
                disabled={selectedRowKeys.length === 0 || loading}
                loading={deleteLoading}
              >
                {intl.get('bid.bidcommon.view.button.delete').d('删除')}
              </CusButton>
            )}
            {!(
              ['completed', 'closed'].includes(getDetailList?.proState) ||
              (this.props.getDetailList.proState === 'in_process' &&
                this.props.getDetailList.purchasingEmpNum !== loginName &&
                this.props.getDetailList.transferorEmpNum !== loginName)
            ) && (
              <CusButton mini onClick={this.handleAddLine}>
                {intl.get('bid.bidcommon.view.button.add').d('添加')}
              </CusButton>
            )}
            {isSaveFlag ||
              (!(
                ['completed', 'closed'].includes(getDetailList?.proState) ||
                (this.props.getDetailList.proState === 'in_process' &&
                  this.props.getDetailList.purchasingEmpNum !== loginName &&
                  this.props.getDetailList.transferorEmpNum !== loginName)
              )) && (
                <CusButton mini onClick={onSave} loading={saveLoading}>
                  {intl.get('bid.bidcommon.view.button.save').d('保存')}
                </CusButton>
              )}
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
        </div>
      </CusSpin>
    );
  }
}
