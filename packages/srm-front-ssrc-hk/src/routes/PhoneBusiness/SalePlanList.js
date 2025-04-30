import React from 'react';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { Form } from 'hzero-ui';
import EditTable from '_cus_components/EditTable';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
const organizationId = getCurrentOrganizationId();
const promptCode = 'HKPC.commom';
const currentDate = dayjs();
@Form.create()
export default class DetailList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  // 获取库存组织的现有量
  handleItemQty = (record, item) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'phoneBusinessListModal/getItemQty',
      payload: {
        itemNumber: item.itemNumber,
        invOrgCode: item.organizationCode,
      }
    }).then((res) => {
      if(res) {
        record.stockQty = res?.quantityOnhand; // 现有量
        record.$form.setFieldsValue({
          stockQty: res?.quantityOnhand, // 现有量
        })
      }
    })
  }

  render() {
    const {
      form,
      idpValueMap,
      rowSelection,
      phoneBusinessListModal,
      basicForm,
      readyOnly = false,
      onChange = (e) => e,
    } = this.props;

    console.log('readyOnly', readyOnly);
    

    const { salePlanDetailSource, salePlanDetailPagination, brandList } = phoneBusinessListModal;
    console.log('salePlanDetailSource', salePlanDetailSource);
    console.log('brandList', brandList);
    

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        dataIndex: 'orderSeq',
        key: 'orderSeq',
        width: 80,
        render: (val, record, index) => {
          return <span>{index + 1}</span>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'matName',
        width: 150,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.matName)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('matNumberVal', {
                initialValue: record.matName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`HKPC.commom.view.title.materialname`).d('物料名称'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="CMHK.CATEGORY.ORGANIZATION"
                  queryParams={{tenantId: organizationId, brandCode: brandList}}
                  textValue={record.matName}
                  lovOptions={{ displayField: 'itemDescription', valueField: 'itemNumber' }}
                  onChange={(_, item) => {
                    console.log('item',item)
                    record.matName = item?.itemDescription; // 物料名称
                    record.matNumber = item?.itemNumber; // 物料code
                    record.brandName = item?.productLineName; // 品牌名称
                    record.brandCode = item?.productLineCode; // 品牌code
                    record.model = item?.itemLongDescription; // 规格型号
                    record.$form.setFieldsValue({
                      matName: item?.itemDescription, // 物料名称
                      matNumber: item?.itemNumber, // 物料code
                      brandName: item?.productLineName, // 品牌名称
                      brandCode: item?.productLineCode, // 品牌code
                      model: item?.itemLongDescription, // 规格型号
                    })
                    this.handleItemQty(record, item);
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.brand`).d('品牌'),
        dataIndex: 'brandName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'model',
        width: 200,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.model)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator(`model`, {
                initialValue: record?.model,
              })(
                <CusInput.TextArea
                  autoChangeSize
                  onChange={(e) => {
                    record.model = e.target.value;
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
        dataIndex: 'qty',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.qty)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('qty', {
                initialValue: record.qty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.purchasequantity`).d('采购数量'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  min={0}
                  precision={4}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.cost`).d('成本(HKD)'),
        dataIndex: 'cost',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            <div style={{ textAlign: 'right' }}>{numberRender(record?.cost, 4)}</div>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('cost', {
                initialValue: record.cost,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.cost`).d('成本(HKD)'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  precision={4}
                  min={0}
                  className="cus-input-money"
                  allowThousandth
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.rebate`).d('回赠(HKD)'),
        dataIndex: 'feedback',
        width: 180,
        render: (_, record) => {
          return readyOnly ? (
            <div style={{ textAlign: 'right' }}>{numberRender(record?.feedback, 4)}</div>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('feedback', {
                initialValue: record.feedback,
              })(
                <CusInputNumber
                  className="cus-input-money"
                  style={{ width: '100%' }}
                  precision={4}
                  step={0.01}
                  min={0}
                  allowThousandth
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.netcost`).d('净成本(HKD)'),
        dataIndex: 'netCose',
        width: 180,
        render: (_, record) => {
          const netCose = record?.$form?.getFieldValue('feedback') ? record?.$form?.getFieldValue('cost') - record?.$form?.getFieldValue('feedback') : record?.$form?.getFieldValue('cost');
          record.netCose = netCose ? Number(netCose, 4) : record.netCose;
          return (
            <div style={{ textAlign: 'right' }}>{numberRender(record.netCose, 4)}</div>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.subscriptionprice`).d('售价(HKD)'),
        dataIndex: 'sellingPrice',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            <div style={{ textAlign: 'right' }}>{numberRender(record?.sellingPrice, 4)}</div>
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('sellingPrice', {
                initialValue: record.sellingPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.subscriptionprice`).d('售价'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  className="cus-input-money"
                  style={{ width: '100%' }}
                  precision={4}
                  step={0.01}
                  min={0}
                  allowThousandth
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.profitmargin`).d('利润率(%)'),
        dataIndex: 'profit',
        width: 180,
        render: (_, record) => {
          const netCose = record?.$form?.getFieldValue('feedback') ? record?.$form?.getFieldValue('cost') - record?.$form?.getFieldValue('feedback') : record?.$form?.getFieldValue('cost');
          const profit = 
          netCose == 0 ? 100 : (record?.$form?.getFieldValue('sellingPrice') - netCose) /
          netCose *
          100;
          record.profit = profit ? profit : record.profit;
          return (
            <div style={{ textAlign: 'right' }}>{numberRender(record.profit, 4)}</div>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.currentinv`).d('当前库存量'),
        dataIndex: 'stockQty',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.stockQty)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('stockQty', {
                initialValue: record.stockQty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.currentinv`).d('当前库存量'),
                    }),
                  },
                ],
              })(<CusInputNumber min={0} precision={4} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.outstand`).d('未送货PO数量'),
        dataIndex: 'unsentQty',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.unsentQty)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('unsentQty', {
                initialValue: record.unsentQty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.outstand`)
                        .d('未送货PO数量'),
                    }),
                  },
                ],
              })(<CusInputNumber min={0} precision={4} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.totalinv`).d('总库存量(包括本张订单)'),
        dataIndex: 'allStockQty',
        width: 180,
        render: (_, record) => {
          const allStockQty =
            Number(record?.$form?.getFieldValue('qty')) + // 采购数量
            Number(record?.$form?.getFieldValue('stockQty')) + // 当前库存量
            Number(record?.$form?.getFieldValue('unsentQty')); // 未送货PO数量
            record.allStockQty = allStockQty ? allStockQty : record.allStockQty;
          return (
            numberRender(record.allStockQty, 4)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.dailysales7days`).d('日售量(近7日)'),
        dataIndex: 'dailySales',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.dailySales)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('dailySales', {
                initialValue: record.dailySales,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.dailysales7days`).d('日售量(近7日)'),
                    }),
                  },
                ],
              })(<CusInputNumber min={0} precision={0} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.stocklastfor`).d('库存可售天数'),
        dataIndex: 'avaDays',
        width: 180,
        render: (_, record) => {
          // 总库存量
          const allStockQty =
          Number(record?.$form?.getFieldValue('qty')) + // 采购数量
          Number(record?.$form?.getFieldValue('stockQty')) + // 当前库存量
          Number(record?.$form?.getFieldValue('unsentQty')); // 未送货PO数量
          const dailySales = record?.$form?.getFieldValue('dailySales'); // 日售量
          record.avaDays = numberRender(Math.floor((allStockQty / dailySales)), 0) ? numberRender(Math.floor((allStockQty / dailySales)), 0) : record.avaDays;
          return (
            tooltipRender(record.avaDays)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.stocklasttill`).d('库存可售到(日期)'),
        dataIndex: 'avaDate',
        width: 180,
        render: (_, record) => {
          // 总库存量
          const allStockQty =
          Number(record?.$form?.getFieldValue('qty')) + // 采购数量
          Number(record?.$form?.getFieldValue('stockQty')) + // 当前库存量
          Number(record?.$form?.getFieldValue('unsentQty')); // 未送货PO数量
          const dailySales = record?.$form?.getFieldValue('dailySales'); // 日售量
          const avaDays = numberRender(Math.floor(allStockQty / dailySales), 0); // 库存可售天数
          const avaDate = avaDays ? currentDate.add(Number(avaDays.replace(/,/g, '')), 'day').format(DEFAULT_DATE_FORMAT) : null; // 库存可售到(日期)
          record.avaDate = avaDate ? avaDate + ' 00:00:00' : record.avaDate;
          return (
            record.avaDate === 'Invalid Date 00:00:00' ? tooltipRender('99999-12-31') : tooltipRender(dayjs(record.avaDate).format('YYYY-MM-DD'))
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.forcastsales`).d('预测日销量'),
        dataIndex: 'forDailySales',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.forDailySales)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('forDailySales', {
                initialValue: record.forDailySales,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.forcastsales`).d('预测日销量'),
                    }),
                  },
                ],
              })(<CusInputNumber min={0} precision={0} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.forecaststocklasttill`).d('预测库存可售天数'),
        dataIndex: 'forAvaDays',
        width: 180,
        render: (_, record) => {
          // 总库存量
          const allStockQty =
          Number(record?.$form?.getFieldValue('qty')) + // 采购数量
          Number(record?.$form?.getFieldValue('stockQty')) + // 当前库存量
          Number(record?.$form?.getFieldValue('unsentQty')); // 未送货PO数量
          const forDailySales = record?.$form?.getFieldValue('forDailySales'); // 预测日销量
          record.forAvaDays = numberRender(Math.floor((allStockQty / forDailySales)), 0) ? numberRender(Math.floor((allStockQty / forDailySales)), 0) : record.forAvaDays;
          return (
            tooltipRender(record.forAvaDays)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.forecaststocklasttilldate`).d('预测库存可售日期'),
        dataIndex: 'forAvaDate',
        width: 180,
        render: (_, record) => {
          // 总库存量
          const allStockQty =
          Number(record?.$form?.getFieldValue('qty')) + // 采购数量
          Number(record?.$form?.getFieldValue('stockQty')) + // 当前库存量
          Number(record?.$form?.getFieldValue('unsentQty')); // 未送货PO数量
          const forDailySales = record?.$form?.getFieldValue('forDailySales'); // 预测日销量
          const forAvaDays = numberRender(Math.floor((allStockQty / forDailySales)), 0); // 预测库存可售天数
          const forAvaDate = forAvaDays ? currentDate.add(Number(forAvaDays.replace(/,/g, '')), 'day').format(DEFAULT_DATE_FORMAT) : null; // 预测库存可售日期
          record.forAvaDate = forAvaDate ? forAvaDate + ' 00:00:00' : record.forAvaDate;
          return (
            record.forAvaDate === 'Invalid Date 00:00:00' ? tooltipRender('99999-12-31') : tooltipRender(dayjs(record.forAvaDate).format('YYYY-MM-DD'))
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.deliveryleadtime`).d('交货需要时间'),
        dataIndex: 'dealTime',
        width: 180,
        required: true,
        render: (_, record) => {
          return readyOnly ? (
            tooltipRender(record.dealTime)
          ) : (
            <Form.Item>
              {record?.$form?.getFieldDecorator('dealTime', {
                initialValue: record.dealTime,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.view.title.deliveryleadtime`)
                        .d('交货需要时间'),
                    }),
                  },
                ],
              })(
                  <CusInputNumber min={0} precision={0} />
                )}
            </Form.Item>
          );
        },
      },
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          rowSelection={readyOnly ? false : rowSelection}
          dataSource={salePlanDetailSource}
          pagination={salePlanDetailPagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
