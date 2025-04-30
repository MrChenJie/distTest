/*
 * ui 修改
 * @date: 2023-08-04
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Modal, Upload, Select, InputNumber, Tooltip } from 'antd';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusSpin from '_cus_components/CusSpin';
import CusInput from '_cus_components/CusInput';
import { Bind, Debounce } from 'lodash-decorators';
import styles from './index.less';
import intl from 'utils/intl';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId, tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import notification from 'utils/notification';
import { downloadFile } from 'hzero-front/lib/services/api';
import CusLov from '_cus_components/CusLov';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import { tooltipRender } from '_cus_utils/render';
import { numberRender, dateRender } from 'utils/renderer';

const status = ['create', 'update'];
const organizationId = getCurrentOrganizationId();
const FormItem = Form.Item;

@formatterCollections({
  code: ['bid.bidcommon'],
})
export default class QuotationAllList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      code: 'BID.PRICE_CONFIGS',
      selectItem: props.getDetailList.priceType || '',
      uploadLoading: false
    };
  }

  componentDidMount() {
  }

  checkStatus(record) {
    const { isEdit } = this.props;
    return status.includes(record._status) && isEdit;
  }

  @Bind
  handleChangeFormItem(val) {
    const { onChangeFormItem = (e) => e } = this.props;
    onChangeFormItem(val);
    this.setState({
      selectItem: val,
    });
  }

  /**
   * 添加行
   *
   * @memberof QuotationAllList
   */
  @Bind
  handleAddLine() {
    const { onAddLine = (e) => e } = this.props;
    onAddLine();
    //  this.handleDataChange();
  }

  /**
   *删除行
   *
   * @memberof QuotationAllList
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
   * @memberof QuotationAllList
   */
  @Bind
  handleDataChange() {
    const { onEdit = (e) => e, unsaveFlag } = this.props;
    if (!unsaveFlag) {
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof QuotationAllList
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
          onPageChange();
        },
      });
    } else {
      onPageChange(page);
    }
  }

  @Bind
  beforeUpload(file) {
    const {
      templateCode = 'BID.PRICE_CONFIGS',
      param = {},
    } = this.props;
    const formData = new FormData();
    formData.append('excel', file, file.name);
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
              message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败'),
            });
          } else if (res) {
            // 导入成功后查一遍数据进行导入的数据展示
            const params = {
              templateCode: templateCode,
              batch: res,
            };
            setTimeout(() => {
              this.handleImportData(params, file)
            }, 500)
          }
        })
    }
    return false;
  }

  isJSON(str) {
    let result;
    try {
      result = JSON.parse(str);
    } catch (e) {
      return false;
    }
    return isObject(result) && !isString(result);
  }

  /**
   * 处理数据导入后的数据展示(保存)
   *
   * @memberof Import
   */
  @Bind()
  handleImportData(params) {
    const { onImportData = (e) => e } = this.props;
    onImportData(params);
    setTimeout(() => {
      this.setState({
        uploadLoading: false,
      });
    }, 500)
  }

  /**
   * 下载模板
   */
  @Bind()
  handleDownloadTemplateClick() {
    const { code } = this.state;
    const api = `${SRM_BID}/v1/${organizationId}/import/template/${code}/excel`;
    downloadFile({ requestUrl: api, queryParams: [{ name: 'tenantId', value: '0' }] });
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      onSave = (e) => e,
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      priceFlag = false,
      getDetailList = {},
      matchs,
      detailEnumMap = {},
      disabled
    } = this.props;
    console.log('data', priceFlag ,getDetailList ,getDetailList.priceType !== null)
    const { proId } = matchs.params;
    const { quotationMode = [] } = detailEnumMap;
    const { selectItem } = this.state;
    const { selectedRowKeys = [] } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: getCurrentLanguage() === 'zh_CN' ? 62 : 130,
        fixed: 'left',
        dataIndex: 'orderSeq',
        render: (val, row, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              {index + 1}
            </div>
          );
        }
      },
      {
        title: intl.get(`HKPC.commom.view.title.estimatedbudgettype`).d('预估预算类型'),
        dataIndex: 'budgetType',
        key: 'budgetType',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategoryMeaning',
        width: 350,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.materialname`).d('物料名称'),
        key: 'purchaseContent',
        width: 300,
        dataIndex: 'purchaseContent',
        required: !disabled,
        render: (val, record) => (
          disabled ? tooltipRender(val) : (<Form.Item>
              {record.$form.getFieldDecorator('purchaseContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.materialname`).d('物料名称'),
                    }),
                  },
                ],
              })
                (<CusInput.TextArea autoChangeSize={true} maxLength={300}
                  onChange={() => {
                    this.props.isTrue()
                  }}
                />)}
          </Form.Item>)
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        key: 'serviceContent',
        dataIndex: 'serviceContent',
        required: !disabled,
        width: 400,
        render: (val, record) => (
          disabled ? tooltipRender(val) : (<Form.Item>
              {record.$form.getFieldDecorator('serviceContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.type`).d('规格型号/服务内容'),
                    }),
                  },
                ],
              })(<CusInput.TextArea autoChangeSize={true} maxLength={300}
                onChange={() => {
                  this.props.isTrue()
                }}
              />)}
          </Form.Item>)
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.quotecurrency2').d('报价货币'),
        key: 'priceCurrency',
        dataIndex: 'priceCurrency',
        required: !disabled,
        width: 120,
        render: (val, record) => (
          disabled ? tooltipRender(val) :
          <Form.Item>
            {record.$form.getFieldDecorator('priceCurrency', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.quotecurrency2`).d('报价货币'),
                  }),
                },
              ],
            })(
              <CusLov
                code="HPFM.CURRENCY"
                lovOptions={{ displayField: 'currencyCode', valueField: 'currencyCode' }}
                textValue={val}
                queryParams={{ tenantId: organizationId }}
                onChange={() => {
                  this.props.isTrue()
                }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
        key: 'count',
        dataIndex: 'count',
        width: 110,
        required: !disabled,
        render: (val, record) => (
          disabled ? <div style={{textAlign: 'right'}}>{numberRender(val, 0)}</div> : <Form.Item>
            {record.$form.getFieldDecorator('count', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.quantity`).d('数量'),
                  }),
                },
              ],
            })(<InputNumber style={{ width: '100%' }} step={1}
              onChange={() => {
                this.props.isTrue()
              }}
            />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
        key: 'unit',
        dataIndex: 'unit',
        width: 110,
        required: !disabled,
        render: (_, record) => (
          disabled ? tooltipRender(record.unitMeaning ? record.unitMeaning : record.unit) :
          <Form.Item>
            {record.$form.getFieldDecorator('unit', {
              initialValue: record.unit,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.unit`).d('计量单位'),
                  }),
                },
              ],
            })(
              <CusLov
                code="HPFM.UOM"
                textValue={record.unitMeaning ? record.unitMeaning : record.unit}
                lovOptions={{ displayField: 'uomName', valueField: 'uomCode' }}
                queryParams={{ tenantId: organizationId }}
                onChange={() => {
                  this.props.isTrue()
                }}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
        key: 'deliverAddress',
        width: 300,
        required: !disabled,
        dataIndex: 'deliverAddress',
        render: tooltipRender
      },
      ['0', '1'].includes(getDetailList?.projectType) && {
        title: intl.get(`HKPC.commom.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenterName',
        key: 'costCenterName',
        width: 150,
        render: tooltipRender,
      },
      ['0', '1'].includes(getDetailList?.projectType) && {
        title: intl.get(`HKPC.commom.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivitiesName',
        key: 'businessActivitiesName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddresscontacter').d('送货地址联系人'),
        key: 'deliverContact',
        width: 220,
        required: !disabled,
        dataIndex: 'deliverContact',
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddressremrks').d('送货地址备注'),
        key: 'deliverAddressBakup',
        width: 300,
        required: !disabled,
        dataIndex: 'deliverAddressBakup',
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.deliverydate').d('送货日期'),
        key: 'deliverDate',
        width: 160,
        required: !disabled,
        dataIndex: 'deliverDate',
        render: dateRender
      },
      {
        title: intl.get('HKPC.commom.view.title.deliverycontactnumber').d('送货联系电话'),
        key: 'deliveryPhoneNumber',
        width: 150,
        required: !disabled,
        dataIndex: 'deliveryPhoneNumber',
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.Remark').d('备注'),
        key: 'deliveryAddressRemarks',
        width: 180,
        dataIndex: 'deliveryAddressRemarks',
        render: tooltipRender
      },
    ].filter(Boolean);

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
      getCheckboxProps: record => ({
        disabled: record._status === undefined || disabled,
      }),
    };

    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
    };

    return (
      <CusSpin spinning={fetchLoading || saveLoading || deleteLoading}>
        <div>
          <Form className="customize-form" >
            <div
              className="formItemLabel"
              style={{
                display: 'flex',
                float: 'right'
              }}
            >
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.quotemode`).d('报价模式')}
              >
                <CusSelect
                  style={{ width: '100%' }}
                  disabled={priceFlag || getDetailList.priceType !== null}
                  defaultValue={getDetailList.priceType}
                  options={quotationMode}
                  onChange={this.handleChangeFormItem}
                >
                </CusSelect>
              </FormItem>
              <CusExcelExport
                requestUrl={`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/exportProInfo?proId=${proId}`}
                downloadType="Blob"
                fileName={intl
                  .get(`bid.bidcommon.view.title.quotationformsetting`)
                  .d('报价表导出')}
                otherButtonProps={{
                  mini: true,
                  icon: null,
                }}
                buttonText={
                  <>
                    {intl.get('bid.bidcommon.view.button.export').d('导出')}
                  </>
                }
              />
              {!disabled && <FormItem>
                <CusButton
                  mini
                  onClick={() => this.handleDownloadTemplateClick()}
                >
                  {intl.get('bid.bidcommon.view.button.download').d('下载模板/下载')}
                </CusButton>
                <Upload {...uploadProps}>
                  <CusButton
                    mini
                    disabled={
                      selectItem === '' ||
                      (selectItem === 'totalPrice' && dataSource.length > 0) ||
                      (getDetailList.priceType === 'totalPrice' && dataSource.length > 0)
                    }
                  >
                    {intl.get('bid.bidcommon.view.button.import').d('导入')}
                  </CusButton>
                </Upload>
                <CusButton
                  onClick={this.handleDeleteLine}
                  mini
                  disabled={selectedRowKeys.length === 0 || loading}
                >
                  {intl.get('bid.bidcommon.view.button.delete').d('删除')}
                </CusButton>
                <CusButton
                  onClick={this.handleAddLine}
                  mini
                  disabled={
                    selectItem === '' ||
                    (selectItem === 'totalPrice' && dataSource.length > 0) ||
                    (getDetailList.priceType === 'totalPrice' && dataSource.length > 0)
                  }
                >
                  {intl.get('bid.bidcommon.view.button.add').d('添加')}
                </CusButton>
                {/* <CusButton
                  mini
                  onClick={onSave}
                  disabled={selectItem === ''}
                >
                  {intl.get('bid.bidcommon.view.button.save').d('保存')}
                </CusButton> */}
              </FormItem>}

            </div>
          </Form>
          <div style={{ marginTop: '16px' }}>
            <EditTable
              rowKey="poOrderId"
              dataSource={dataSource}
              pagination={pagination}
              onChange={this.handlePageChange}
              columns={columns}
              rowSelection={rowSelection}
              onDataChange={this.handleDataChange}
              scroll={{ x: tableScrollWidth(columns) }}
            />
          </div>
        </div>
      </CusSpin>

    );
  }
}
