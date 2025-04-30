/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-08-26 09:53:30
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Row, Col } from 'antd';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';

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

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
@Form.create()
export default class QuatationClause extends React.Component {
  constructor(props) {
    super(props);
    // const { onRef } = props;
    // if (onRef) {
    //   onRef(this);
    // };
    this.state = {
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
      aaa: false
    };
  }


  render() {
    const {
      dispatch,
      enterQuotationModel,
    } = this.props;
    const { quotationClauseDataSource = [], enumMap = {}, quotationDetailDataSource = [] } = enterQuotationModel;
    const {
      deliveryTermsOptions = [],
      paymentTermsOptions = [],
      paymentMethodOptions = [],
    } = enumMap;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.DeliveryTerms`).d('发货条款'),
        dataIndex: 'deliveryClause',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            <>
              <Row>
                <Col span={record.$form.getFieldValue('deliveryClause') === 'N/A' ? 12 : 24}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('deliveryClause', {
                      initialValue: record.deliveryClause || 'DDP',
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${promptCode}.view.title.DeliveryTerms`).d('发货条款'),
                          }),
                        },
                      ],
                    })(
                      <CusSelect
                        allowClear
                        style={{ width: '100%' }}
                        options={deliveryTermsOptions}
                      />
                    )}
                  </Form.Item>
                </Col>
                {record.$form.getFieldValue('deliveryClause') === 'N/A' && <Col span={12}>
                  <Form.Item>
                    {record.$form.getFieldDecorator('deliveryClauseInput', {
                      initialValue: record.deliveryClauseInput,
                    })(
                      <CusInput.TextArea
                        rows={3}
                        autosize={{ minRows: 3, maxRows: 3 }}
                      />
                    )}
                  </Form.Item>
                </Col>}
              </Row>
            </>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
        dataIndex: 'paymentClause',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            <>
            <Row>
              <Col span={record.$form.getFieldValue('paymentClause') === 'OTHERS' ? 12 : 24}>
                <Form.Item>
                  {record.$form.getFieldDecorator('paymentClause', {
                    initialValue: record.paymentClause || '30D',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
                        }),
                      },
                    ],
                  })(
                    <CusSelect
                      allowClear
                      style={{ width: '100%' }}
                      options={paymentTermsOptions}
                    />
                  )}
                </Form.Item>
              </Col>
              {record.$form.getFieldValue('paymentClause') === 'OTHERS' && <Col span={12}>
                <Form.Item>
                  {record.$form.getFieldDecorator('paymentClauseInput', {
                    initialValue: record.paymentClauseInput,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
                        }),
                      },
                    ],
                  })(
                    <CusInput.TextArea
                      rows={3}
                      autosize={{ minRows: 3, maxRows: 3 }}
                    />
                  )}
                </Form.Item>
              </Col>}
            </Row>
            </>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
        dataIndex: 'paymentMethod',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            <>
            <Row>
              <Col span={record.$form.getFieldValue('paymentMethod') === 'P_NA' ? 12 : 24}>
                <Form.Item>
                  {record.$form.getFieldDecorator('paymentMethod', {
                    initialValue: record.paymentMethod,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
                        }),
                      },
                    ],
                  })(
                    <CusSelect
                      allowClear
                      style={{ width: '100%' }}
                      options={paymentMethodOptions}
                    />
                  )}
                </Form.Item>
              </Col>
              {record.$form.getFieldValue('paymentMethod') === 'P_NA' && <Col span={12}>
                <Form.Item>
                  {record.$form.getFieldDecorator('paymentMethodInput', {
                    initialValue: record.paymentMethodInput,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
                        }),
                      },
                    ],
                  })(
                    <CusInput.TextArea
                      rows={3}
                      autosize={{ minRows: 3, maxRows: 3 }}
                    />
                  )}
                </Form.Item>
              </Col>}
            </Row>
            </>
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentArrangement`).d('付款安排'),
        dataIndex: 'paymentArrangement',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('paymentArrangement', {
                initialValue: record.paymentArrangement,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.PaymentArrangement`).d('付款安排'),
                    }),
                  },
                ],
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
        title: intl.get(`${promptCode}.view.title.Quotationnumber`).d('报价单编号'),
        dataIndex: 'quotationNumber',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationNumber', {
                initialValue: record.quotationNumber,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.Quotationnumber`).d('报价单编号'),
                    }),
                  },
                ],
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
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        dataIndex: 'warranty',
        required: true,
        width: 160,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('warranty', {
                initialValue: record.warranty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
                    }),
                  },
                ],
              })(
                <CusInput.TextArea
                  rows={3}
                  autosize={{ minRows: 3, maxRows: 3 }}
                  onBlur={(e) => {
                    dispatch({
                      type: 'enterQuotationModel/updateState',
                      payload: {
                        quotationDetailDataSource: (quotationDetailDataSource || []).map((item) => {
                          item.$form.resetFields();
                          return {
                            ...item,
                            warranty: e.target.value
                          }
                        })
                      }
                    })
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
    ];


    return (
      <>
        <EditTable
          rowKey='rowKey'
          dataSource={quotationClauseDataSource}
          pagination={false}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
