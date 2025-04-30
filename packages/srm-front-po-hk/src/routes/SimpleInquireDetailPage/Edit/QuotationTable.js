// 报价表格式列表
import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage, getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy, filter } from 'lodash';
import dayjs from 'dayjs';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInputNumber from '_cus_components/CusInputNumber';
import InputLov from './component/CusLov';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const organizationId = getCurrentOrganizationId();
export default class QuatationTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }

  render() {
    const {
      purchaseApplicationModel,
      disabled = false,
      rowSelection,
      isReady,
    } = this.props;
    const { quotationFormatList = [], detailEnumMap = {}, headerInfo = {}, inquireBaseInfo= {} } = purchaseApplicationModel;
    const { purchaseCategoryList, budgetTypeList } = detailEnumMap;
    const { projectNumber = inquireBaseInfo?.projectNumber, projectType = inquireBaseInfo?.projectType } = headerInfo;
    console.log('quotationFormatList', quotationFormatList)
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
        required: true,
        render: (val, record) => {
          let budgetTypeListData;
          if(projectType == '2') {
            budgetTypeListData = filter(budgetTypeList, (item) =>
              ['INVENTORY'].includes(item.value)
            );
          } else {
            budgetTypeListData = filter(budgetTypeList, (item) =>
              ['CAPEX', 'OPEX'].includes(item.value)
            );
          }
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator(`budgetType`, {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`HKPC.commom.view.title.estimatedbudgettype`)
                        .d('预估预算类型'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  allowClear
                  style={{ width: '100%' }}
                  options={budgetTypeListData}
                  onChange={(e) => {
                    record.budgetType = e;
                    record.purchasingCategoryMeaning = null
                    record.purchasingCategory = null
                    record.$form.setFieldsValue({
                      purchasingCategoryMeaning: null,
                      purchasingCategory: null,
                    })
                  }}
                />
              )}
            </Form.Item>
            :
            tooltipRender(val)
          );
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategory',
        required: true,
        width: 350,
        render: (_, record) => {
          let purchaseCategoryFilteredData
          if(record.budgetType === 'OPEX') {
            purchaseCategoryFilteredData = filter(purchaseCategoryList, (item) =>
              ['NET_CELL_SITE', 'GP_OPEX', 'INV_DEMO'].includes(item.value)
            );
          } else if(record.budgetType === 'CAPEX') {
            purchaseCategoryFilteredData = filter(purchaseCategoryList, (item) =>
              ['GP_CAPEX_P', 'GP_CAPEX_NP'].includes(item.value)
            );
          } else {
            purchaseCategoryFilteredData = filter(purchaseCategoryList, (item) =>
              ['INV', 'INV_ICTS', 'INVS_COUP'].includes(item.value)
            );
          }
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator(`purchasingCategory`, {
                initialValue: record?.purchasingCategory,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.prcategory`).d('采购类别'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  options={purchaseCategoryFilteredData}
                  disabled={!(record.budgetType)}
                  lazyLoad={false}
                  allowClear
                  onChange={(val) => {
                    record.purchasingCategory = val
                    record.$form.setFieldsValue({
                      purchasingCategory: val
                    })
                  }}
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.purchasingCategoryMeaning)
          );
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.materialname`).d('物料名称'),
        key: 'matName',
        width: 300,
        dataIndex: 'matName',
        required: true,
        render: (val, record) => (
          isReady ? (<Form.Item>
              {record.$form.getFieldDecorator('matNameVal', {
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
                (
                  projectType == '2' ?
                  <CusLov
                    code="CMHK.CATEGORY.ORGANIZATION"
                    lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                    queryParams={{ tenantId: organizationId, purchasingCategory: record.purchasingCategory }}
                    textValue={val}
                    disabled={!(record.purchasingCategory)}
                    onChange={(_, item) => {
                      record.matName = item?.itemDescription;
                      record.unit = item?.uomCode;
                      record.matNumber = item?.itemNumber;
                      record.$form.setFieldsValue({
                        matName: item?.itemDescription,
                        matType: item?.itemLongDescription,
                        unit: item?.uomCode,
                        matNumber: item?.itemNumber,
                      });
                    }}
                  />
                  :
                  <InputLov
                    isInput
                    code="CMHK.CATEGORY.ORGANIZATION"
                    lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                    queryParams={{ tenantId: organizationId, purchasingCategory: record.purchasingCategory }}
                    textValue={val}
                    disabled={!(record.purchasingCategory)}
                    onChange={(val, item) => {
                      if(item) {
                        record.matName = item?.itemDescription;
                        record.unit = item?.uomCode;
                        record.matNumber = item?.itemNumber;
                        record.$form.setFieldsValue({
                          matName: item?.itemDescription,
                          matType: item?.itemLongDescription,
                          unit: item?.uomCode,
                          matNumber: item?.itemNumber,
                        });
                      } else {
                        // 手动输入的时候
                        record.matNumber = '';
                        record.matName = val;
                      }
                    }}
                  />
                )}
          </Form.Item>)
          :
          tooltipRender(val)
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        key: 'matType',
        width: 300,
        // required: true,
        dataIndex: 'matType',
        render: (_, record) => {
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('matType', {
                initialValue: record.matType,
              })(
                <CusInput.TextArea autoChangeSize />
              )}
            </Form.Item>
            :
            tooltipRender(record.matType)
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.quotationCurrency').d('报价货币'),
        key: 'currency',
        width: 120,
        dataIndex: 'currency',
        render: tooltipRender,
        // render: (_, record) => {
        //   return (
        //     isReady ? <Form.Item>
        //       {record.$form.getFieldDecorator('currency', {
        //         initialValue: record.currency,
        //         rules: [
        //           {
        //             required: true,
        //             message: intl.get('hzero.common.validation.notNull', {
        //               name: intl.get('HKPC.commom.view.title.quotationCurrency').d('报价货币'),
        //             }),
        //           },
        //         ],
        //       })(
        //         <CusLov
        //           allowClear={false}
        //           code="HPFM.CURRENCY"
        //           textValue={record.currency}
        //         />
        //       )}
        //     </Form.Item>
        //     :
        //     tooltipRender(record.currency)
        //   )
        // }
      },
      {
        title: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
        key: 'qty',
        width: 110,
        required: true,
        dataIndex: 'qty',
        render: (_, record) => {
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('qty', {
                initialValue: record.qty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.quantity').d('数量'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  min={1}
                  precision={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  className='cus-input-money'
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.qty)
          )
        }
      },
      {
        title: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
        key: 'unit',
        width: 180,
        required: true,
        dataIndex: 'unit',
        render: (_, record) => {
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('unit', {
                initialValue: record.unit,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('bid.bidcommon.view.title.unit').d('计量单位'),
                    }),
                  },
                ],
              })(
                <CusLov
                  allowClear={false}
                  code="CMHKHPFM.UOM"
                  textValue={record.unit}
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.unit)
          )
        }
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`HKPC.commom.view.title.CostCentre`).d('成本中心'),
        dataIndex: 'costCenterName',
        key: 'costCenterName',
        width: 150,
        render: tooltipRender,
      },
      ['0', '1'].includes(projectType) && {
        title: intl.get(`HKPC.commom.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'businessActivitiesName',
        key: 'businessActivitiesName',
        width: 180,
        required: true,
        render: (_, record) => {
          console.log('record', record)
          return (
            isReady ? <Form.Item>
            {record.$form.getFieldDecorator(`businessActivitiesName`, {
              initialValue: record.businessActivitiesName,
              rules: [
                {
                  required: record.budgetType === 'OPEX',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`HKPC.commom.view.title.BusinessActivities`).d('业务活动'),
                  }),
                },
              ],
            })(
              (record.budgetType === 'OPEX' || record.businessActivitiesName) ?
              <CusLov
                code="CPEX.OPEX"
                queryParams={{
                  tenantId: getCurrentOrganizationId(),
                  projectCode: projectNumber,
                  applyType: projectType,
                }}
                textValue={record.businessActivitiesName}
                onChange={(_, item) => {
                  record.budgetItemNumber = item.budCode; // 预算项目编码
                  record.businessActivitiesCode = item.busActivityCode; // 业务活动编码
                  record.businessActivitiesName = item.busActivityName; // 业务活动名称
                  record.costCenterCode = item.costCenterCode; // 成本中心编码
                  record.costCenterName = item.costCenternName; // 成本中心名称
                }}
              />
              :
              <></>
            )}
            </Form.Item>
            :
            tooltipRender(record.businessActivitiesName)
          )
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
        key: 'addressCode',
        width: 300,
        required: true,
        dataIndex: 'addressCode',
        render: (_, record) => {
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('addressCode', {
                initialValue: record.deliverAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.deliveryaddress').d('送货地址'),
                    }),
                  },
                ],
              })(
                <CusLov
                  allowClear={false}
                  code="CMHK.ERP.ADDRESS"
                  lovOptions={{ displayField: 'detailedAddress', valueField: 'addressCode' }}
                  textValue={record.deliverAddress}
                  onChange={(_, item) => {
                    record.deliverAddress = item?.detailedAddress
                    record.deliveryContactCode = item?.employeeNumber
                    record.deliverContact = item?.name
                    record.deliveryPhoneNumber = item?.contactTel
                    record.$form.setFieldsValue({
                      deliverAddress: item?.detailedAddress,
                      deliveryContactCode: item?.employeeNumber,
                      deliverContact: item?.name,
                      deliveryPhoneNumber: item?.contactTel,
                    })
                  }}
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.deliverAddress)
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddresscontacter').d('送货地址联系人'),
        key: 'deliverContact',
        width: 220,
        required: true,
        dataIndex: 'deliverContact',
        render: (_, record) => {
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('deliverContact', {
                initialValue: record.deliverContact,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.deliveryaddresscontacter').d('送货地址联系人'),
                    }),
                  },
                ],
              })(
                <CusLov
                  allowClear={false}
                  lovOptions={{ displayField: 'name', valueField: 'name' }}
                  code="CMHK.API.DELIVERYADDRESSPERSON"
                  textValue={record.deliverContact}
                  onChange={(_, item) => {
                    record.deliveryContactCode = item?.employeeNumber
                    record.deliveryPhoneNumber = item?.contactTel
                    record.$form.setFieldsValue({
                      deliveryContactCode: item?.employeeNumber,
                      deliveryPhoneNumber: item?.contactTel
                    })
                  }}
                />
              )}
            </Form.Item>
            :
            tooltipRender(record.deliverContact)
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliveryaddressremrks').d('送货地址备注'),
        key: 'deliverAddressBakup',
        width: 300,
        dataIndex: 'deliverAddressBakup',
        render: (_, record) => {
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('deliverAddressBakup', {
                initialValue: record.deliverAddressBakup,
              })(
                <CusInput.TextArea autoChangeSize />
              )}
            </Form.Item>
            :
            tooltipRender(record.deliverAddressBakup)
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliverydate').d('送货日期'),
        key: 'deliverDate',
        width: 160,
        required: true,
        dataIndex: 'deliverDate',
        render: (_, record) => {
          console.log('creationDate', record.creationDate)
          console.log('deliverDate', record.deliverDate)
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('deliverDate', {
                initialValue: record.deliverDate && dayjs(record.deliverDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.deliverydate').d('送货日期'),
                    }),
                  },
                ],
              })(
                <CusDatePicker
                  format={getDateFormat()}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
            :
            tooltipRender(dateRender(record.deliverDate))
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.deliverycontactnumber').d('送货联系电话'),
        key: 'deliveryPhoneNumber',
        width: 150,
        required: true,
        dataIndex: 'deliveryPhoneNumber',
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.Remark').d('备注'),
        key: 'deliveryAddressRemarks',
        width: 180,
        dataIndex: 'deliveryAddressRemarks',
        render: (_, record) => {
          return (
            isReady ? <Form.Item>
              {record.$form.getFieldDecorator('deliveryAddressRemarks', {
                initialValue: record.deliveryAddressRemarks,
              })(
                <CusInput.TextArea autoChangeSize />
              )}
            </Form.Item>
            :
            tooltipRender(record.deliveryAddressRemarks)
          )
        }
      },
    ].filter(Boolean);

    return (
      <>
        <EditTable
          rowKey='rowKey'
          dataSource={quotationFormatList}
          rowSelection={rowSelection}
          pagination={false}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
