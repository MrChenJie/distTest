import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import CusTable from '_cus_components/CusTable';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Col, Form, Row } from 'antd';
import CusInput from '_cus_components/CusInput';
const FormItem = Form.Item;

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const ROW_KEY = 'enquiryPriceRoundsId';
export default class RfqResponse extends React.Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = {
      ResDataSource: [],
    }
  }

  // componentDidMount() {
  //   const { dispatch, nowRecord } = this.props;
  //   const { enquiryPriceId, enquiryPriceRoundsId } = nowRecord;
  //   dispatch({
  //     type: 'resaleRfq/queryRfqResponse',
  //     payload: {
  //       enquiryPriceId,
  //       enquiryPriceRoundsId,
  //     },
  //   }).then(res => {
  //     if (res) {
  //       this.setState({
  //         ResDataSource: res,
  //       });
  //     };
  //   });
  // }

  render() {
    const { queryRfqResponseLoading = false } = this.props;
    const { ResDataSource } = this.state;

    const columns = [
      {
        title: intl.get(`${promptCode}.model.label.supplierNum`).d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.quotationLineStatus`).d('报价状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.model.label.validQuotation`).d('有效报价'),
        dataIndex: 'validQuotation',
        width: 160,
      },
    ];

    return (
      <React.Fragment>
        {/* <CusTable
          rowKey={ROW_KEY}
          columns={columns}
          loading={queryRfqResponseLoading}
          dataSource={ResDataSource}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        /> */}
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={24}>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StageName`).d('阶段名称')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusInput disabled></CusInput>
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.Round`).d('轮次')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusInput disabled></CusInput>
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StartTime`).d('开始时间')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusDatePicker
                    style={{ width: '100%' }}
                  // disabledDate={this.disabledDate}
                  />
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StageDealine`).d('本阶段截止时间')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusDatePicker
                    style={{ width: '100%' }}
                  // disabledDate={this.disabledDate}
                  />
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.applicantremarks`).d('需求部门给供应商的备注')}
                  wrapperCol={{ span: 24 }}
                  name=""
                >
                  <CusInput></CusInput>
                </FormItem>
                <FormItem
                  label=" "
                  style={{ marginBottom: '-8px' }}
                >
                  <div style={{ color: '#8996a1', fontSize: '13px' }}>{intl.get(`${promptCode}.view.title.Description`).d('说明')}</div>
                </FormItem>
                <FormItem
                  label=" "
                >
                  <div style={{ color: '#8996a1', fontSize: '13px' }}>{intl.get(`${promptCode}.view.title.Quotationfileeditingtimegysc`).d('供应商须在截止时间前递交报价文件')}</div>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}
