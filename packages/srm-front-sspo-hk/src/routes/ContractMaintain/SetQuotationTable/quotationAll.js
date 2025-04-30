/** -- 报总价
 * @date: 2022/03/29 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 1.0
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Modal, Upload, Select, InputNumber, Tooltip } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import styles from './index.less';
import uuidv4 from 'uuid/v4';

import intl from 'utils/intl';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId, tableScrollWidth, getResponse } from 'utils/utils';
import EditTable from 'components/EditTable';
import { queryMapIdpValue } from 'services/api';
import notification from 'utils/notification';
import { addItemToPagination } from 'hzero-front/lib/utils/utils';

import deleteIcon from '@/assets/buttonIcons/删除.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import importIcon from '@/assets/buttonIcons/导入.png';
import { downloadFile } from 'hzero-front/lib/services/api';

import Lov from 'components/Lov';
import ExcelExport from '@/components/ExcelExport';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';

const status = ['create', 'update'];
const organizationId = getCurrentOrganizationId();
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

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
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    // this.checkPermission();
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
    // onPageChange(page);
  }

  @Bind
  beforeUpload(file) {
    const {
      // args,
      templateCode = 'BID.PRICE_CONFIGS',
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
              message: intl.get('bid.bidcommon.view.title.operationfailed').d('操作失败'),
            });
          } else if (res) {
            // notification.success({
            //   message: intl.get('hzero.common.notification.success').d('导入成功'),
            // });
            // 导入成功后查一遍数据进行导入的数据展示
            const params = {
              templateCode: templateCode,
              batch: res,
            };
            // this.handleImportData(params);
            setTimeout(()=>{ 
              this.handleImportData(params, file)},500)
          }
        })
        // .finally(() => {
        //   this.setState({
        //     uploadLoading: false,
        //   });
        // });
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
    setTimeout(()=>{
      this.setState({
        uploadLoading: false,
      });
    },500)
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
    console.log('data',dataSource)
    const { proId } = matchs.params;
    const { quotationMode = [] } = detailEnumMap;
    const { selectItem } = this.state;
    const { selectedRowKeys = [], visible = false } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: 70,
        render: (val, record, index) => {
          return index + 1;
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.purchaseitems`).d('采购内容'),
        key: 'purchaseContent',
        dataIndex: 'purchaseContent',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('purchaseContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.purchaseitems`).d('采购内容'),
                    }),
                  },
                ],
              })(<Input disabled={disabled} maxLength={300}
                onChange={()=>{
                  this.props.isTrue()
                }}
              />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        key: 'serviceContent',
        dataIndex: 'serviceContent',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
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
              })(<Input disabled={disabled} maxLength={300}
                onChange={()=>{
                  this.props.isTrue()
                }}
              />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.quotecurrency2').d('报价货币'),
        key: 'priceCurrency',
        dataIndex: 'priceCurrency',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
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
              <Lov
                disabled={disabled}
                style={{ width: '200px' }}
                code="HPFM.CURRENCY"
                textValue={val}
                queryParams={{ tenantId: organizationId }}
                onChange={()=>{
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
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
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
            })(<InputNumber disabled={disabled} style={{ width: '100%' }} step={1} 
            onChange={()=>{
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
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('unit', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`bid.bidcommon.view.title.unit`).d('计量单位'),
                  }),
                },
              ],
            })(
              <Lov
                disabled={disabled}
                style={{ width: '200px' }}
                code="HPFM.UOM"
                textValue={record.unitMeaning}
                queryParams={{ tenantId: organizationId }}
                onChange={()=>{
                  this.props.isTrue()
                }}
              />
            )}
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
        <div
          style={{
            marginBottom: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Form className={styles['header-form']}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`bid.bidcommon.view.title.quotemode`).d('报价模式')}
            >
              <Select
                disabled={priceFlag || getDetailList.priceType !== null}
                defaultValue={getDetailList.priceType || intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                style={{ width: 150 }}
                onChange={this.handleChangeFormItem}
              >
                {quotationMode.map((n) => (
                  <Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Option>
                ))}
              </Select>
            </FormItem>
          </Form>

          {/* {isEdit && ( */}
          <div className="customize-buttons">
            <Button
              disabled={disabled}
              style={{ marginRight: '8px' }}
              onClick={() => this.handleDownloadTemplateClick()}
            >
              <img src={importIcon} alt="" />
              {intl.get('bid.bidcommon.view.button.download').d('下载模板/下载')}
            </Button>
            <Upload {...uploadProps}>
              <Button
                disabled={
                  selectItem === '' ||
                  (selectItem === 'totalPrice' && dataSource.length > 0) ||
                  (getDetailList.priceType === 'totalPrice' && dataSource.length > 0) ||
                  disabled
                }
              >
                <img src={importIcon} alt="" />
                {intl.get('bid.bidcommon.view.button.import').d('导入')}
              </Button>
            </Upload>
            <ExcelExport
              disabled={disabled || selectItem === ''}
              requestUrl={`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/exportProInfo?proId=${proId}`}
              // queryParams={formatValues()}
              //   queryParams={this.quotationList}
              downloadType="Blob"
              fileName={intl
                .get(`view.export.estimateCode`)
                .d('报价表设置导出')}
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
              disabled={selectedRowKeys.length === 0 || loading || disabled}
              //  loading={deleteLoading}
            >
              <img src={deleteIcon} alt="" />
              {intl.get('bid.bidcommon.view.button.delete').d('删除')}
            </Button>
            <Button
              onClick={this.handleAddLine}
              disabled={
                selectItem === '' ||
                (selectItem === 'totalPrice' && dataSource.length > 0) ||
                (getDetailList.priceType === 'totalPrice' && dataSource.length > 0) ||
                disabled
              }
            >
              <img src={addIcon} alt="" />
              {intl.get('bid.bidcommon.view.button.add').d('添加')}
            </Button>
            <Button onClick={onSave} disabled={disabled || selectItem === ''}>
              <img src={saveIcon} alt="" style={{ width: '15px' }} />
              {intl.get('bid.bidcommon.view.button.save').d('保存')}
            </Button>
          </div>
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
    );
  }
}
