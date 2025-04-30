/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-08-26 09:53:30
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import { multiply, reduce, map, debounce } from 'lodash';
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
import CusInputNumber from '_cus_components/CusInputNumber';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
@Form.create()
export default class QuatationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 查询汇率
  handleSearchRate = (lovRecord, record) => {
    const { enterQuotationModel, dispatch } = this.props;
    const { quotationDetailDataSource = [] } = enterQuotationModel;
    dispatch({
      type: 'enterQuotationModel/getPurchaseApplicationRate',
      payload: {
        currencyCode: lovRecord.currencyCode,
        rateDate: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      },
    }).then((res) => {
      if(res) {
        record.priceHkd = res.rate * (record.priceOriginak ? record.priceOriginak : 0);
        record.rate = res.rate;
        const data = quotationDetailDataSource?.map((item) => {
          // 需求：选择一个下拉框整个值都改变
          item.exchangeRate = res.rate;
          item.currency = res.fromCurrencyCode;
          item.priceHkd = res.rate * (item.priceOriginak ? item.priceOriginak : 0);
          // if (item.isQuote === 'Y') {
          //   item.$form.setFieldsValue({ currency: res.fromCurrencyCode, exchangeRate: res.rate });
          // }
          item.$form.setFieldsValue({ currency: res.fromCurrencyCode, exchangeRate: res.rate });
          return item;
        });
        dispatch({
          type: 'enterQuotationModel/updateState',
          payload: {
            quotationDetailDataSource: data,
          },
        });
      }
    })
  }

  // 计算合计
  handleComputeAmount = debounce((e, record) => {
    const { dispatch, enterQuotationModel } = this.props;
    const { quotationDetailDataSource } = enterQuotationModel;
    record.unitPrice = e;
    record.priceOriginak = multiply(record.unitPrice ? record.unitPrice : 0, record.quantity);
    record.priceHkd = multiply(
      multiply(record.unitPrice ? record.unitPrice : 0, record.quantity),
      record.exchangeRate
    );
    record.$form.setFieldsValue({
      unitPrice: e,
      priceOriginak: multiply(record.unitPrice ? record.unitPrice : 0, record.quantity),
      priceHkd: multiply(
        multiply(record.unitPrice ? record.unitPrice : 0, record.quantity),
        record.exchangeRate
      ),
    });
    const total = reduce(quotationDetailDataSource, (acc, item) => {
      if(!item.isTotalRow) {
        acc.priceOriginak += Number(item.priceOriginak) || 0;
        acc.priceHkd += Number(item.priceHkd) || 0;
      }
      return acc;
    }, {
      priceOriginak: 0,
      priceHkd: 0
    })
    const updatedData = map(quotationDetailDataSource, item => {
      if(item.isTotalRow) {
        item.priceOriginak = total.priceOriginak;
        item.priceHkd = total.priceHkd
      }
      return item
    })
    dispatch({
      type: 'enterQuotationModel/updateState',
      payload: {
        quotationDetailDataSource: updatedData,
      },
    });
  }, 300)

  render() {
    const {
      dispatch,
      enterQuotationModel,
    } = this.props;
    const { quotationDetailDataSource = [], enumMap = {} } = enterQuotationModel;
    const {
      isofferOptions = [],
    } = enumMap;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'matName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'model',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.offerornot`).d('是否报价'),
        dataIndex: 'isQuote',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            record?.isTotalRow ? <></> : <Form.Item>
              {record.$form.getFieldDecorator('isQuote', {
                initialValue: record.isQuote || 'Y',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.offerornot`).d('是否报价'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  allowClear
                  style={{ width: '100%' }}
                  options={isofferOptions}
                  onChange={(val) => {
                    record.isQuote = val;
                    if(val === 'N') {
                      record.currency = null;
                      record.unitPrice = null;
                      record.priceOriginak = 0;
                      record.priceHkd = 0;
                      record.$form.setFieldsValue({
                        currency: null,
                        unitPrice: null,
                        otherExpenseName: null,
                        otherExpensePrice: null,
                        warranty: null,
                        bakup: null,
                        priceOriginak: 0,
                        priceHkd: 0,
                      });
                      const total = reduce(quotationDetailDataSource, (acc, item) => {
                        if(!item.isTotalRow) {
                          acc.priceOriginak += item.priceOriginak || 0;
                          acc.priceHkd += item.priceHkd || 0;
                        }
                        return acc;
                      }, {
                        priceOriginak: 0,
                        priceHkd: 0
                      })
                      const updatedData = map(quotationDetailDataSource, item => {
                        if(item.isTotalRow) {
                          item.priceOriginak = total.priceOriginak;
                          item.priceHkd = total.priceHkd
                        }
                        return item
                      })
                      dispatch({
                        type: 'enterQuotationModel/updateState',
                        payload: {
                          quotationDetailDataSource: updatedData,
                        },
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        dataIndex: 'currency',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            (record?.isTotalRow || record?.isQuote === 'N') ? <></> : <Form.Item>
              {record.$form.getFieldDecorator('currency', {
                initialValue: record.currency,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="CMHKHPFM.CURRENCY"
                  lovOptions={{ displayField: 'currencyCode', valueField: 'currencyCode' }}
                  textValue={record.currency}
                  onChange={(_, lovRecord) => {
                    this.handleSearchRate(lovRecord, record)
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价(原币)'),
        dataIndex: 'unitPrice',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            (record?.isTotalRow || record?.isQuote === 'N')? <></> : <Form.Item>
              {record.$form.getFieldDecorator('unitPrice', {
                initialValue: record.unitPrice,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.unitpriceoportal`).d('单价(原币)'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  className='cus-input-money'
                  min={0}
                  precision={4}
                  step={0.01}
                  allowThousandth
                  // formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  // parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  onChange={(e) => {
                    this.handleComputeAmount(e, record);
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.otherfeename`).d('其他费用名称'),
      //   dataIndex: 'otherExpenseName',
      //   width: 160,
      //   render: (_, record) => {
      //     return (
      //       (record?.isTotalRow || record?.isQuote === 'N') ? <></> : <Form.Item>
      //         {record.$form.getFieldDecorator('otherExpenseName', {
      //           initialValue: record.otherExpenseName,
      //         })(
      //           <CusInput.TextArea
      //             rows={3}
      //             autosize={{ minRows: 3, maxRows: 3 }}
      //           />
      //         )}
      //       </Form.Item>
      //     )
      //   }
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.otherfeeamount`).d('其他费用金额'),
      //   dataIndex: 'otherExpensePrice',
      //   width: 160,
      //   render: (_, record) => {
      //     return (
      //       (record?.isTotalRow || record?.isQuote === 'N') ? <></> : <Form.Item>
      //         {record.$form.getFieldDecorator('otherExpensePrice', {
      //           initialValue: record.otherExpensePrice,
      //         })(
      //           <CusInputNumber
      //             className='cus-input-money'
      //             precision={2}
      //             step={0.01}
      //             formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      //             parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
      //           />
      //         )}
      //       </Form.Item>
      //     )
      //   }
      // },
      {
        title: intl.get(`${promptCode}.view.title.totalpriceoportal`).d('总价(原币)'),
        dataIndex: 'priceOriginak',
        width: 160,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record?.priceOriginak, 4)}
            </div>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        dataIndex: 'warranty',
        width: 160,
        required: true,
        render: (_, record) => {
          return (
            (record?.isTotalRow || record?.isQuote === 'N') ? <></> : <Form.Item>
              {record.$form.getFieldDecorator('warranty', {
                initialValue: record.warranty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
                    }),
                  }
                ]
              })(
                <CusInput.TextArea
                  rows={3}
                  autosize={{ minRows: 3, maxRows: 3 }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        dataIndex: 'bakup',
        width: 160,
        render: (_, record) => {
          return (
            (record?.isTotalRow || record?.isQuote === 'N') ? <></> : <Form.Item>
              {record.$form.getFieldDecorator('bakup', {
                initialValue: record.bakup,
              })(
                <CusInput.TextArea
                  rows={3}
                  autosize={{ minRows: 3, maxRows: 3 }}
                />
              )}
            </Form.Item>
          )
        }
      },
    ];


    return (
      <>
        <div style={{ marginBottom: '16px' }}>
          {intl
            .get(`${promptCode}.bid.messaget.quotereminder`)
            .d('最终下单数量可能会低于报价表展示的数量')}
        </div>
        <EditTable
          rowKey='rowKey'
          dataSource={quotationDetailDataSource}
          pagination={false}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
