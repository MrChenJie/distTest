import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import CusDatePicker from '_cus_components/CusDatePicker';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import dayjs from 'dayjs';
import { getDateTimeFormat } from 'utils/utils';
import CusInput from '_cus_components/CusInput';
import EditTable from 'components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';
import classnames from 'classnames';
import styles from './modal.less';
const FormItem = Form.Item;

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceRoundsId';

//时间禁用,当天之前的日期不可选
const disabledDate = (current) => {
  return current && current < dayjs().startOf('days');
};
@formatterCollections({ code: [promptCode] })
@Form.create()
export default class RfqResponse extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

  }


  form = React.createRef();



  render() {
    const {
      form,
      singlePurchaseApplicationModel,
      quotationForm,
      dispatch,
      stage,
    } = this.props;
    const { selectedRowKeys = [] } = singlePurchaseApplicationModel;
    const { supplierList = [] } = quotationForm
    const { getFieldDecorator, getFieldValue } = form;

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'name'
      },
    ]
    const rowSelection = {
      fixed: true,
      selectedRowKeys,
      onChange: (keys) => {
        dispatch({
          type: `singlePurchaseApplicationModel/updateState`,
          payload: {
            selectedRowKeys: keys,
          }
        })
      },
      getCheckboxProps: (record) => ({
        disabled: record.isInviteSended === 'true' ? false : true, // 选择框的是否可选
      }),
    };
    const editTableProps = {
      bordered: true,
      rowKey: "id",
      columns,
      dataSource: supplierList,
      pagination: false,
      rowSelection,
    }

    return (
      <React.Fragment>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={24}>
                {stage === 'two' && <FormItem
                  label={intl.get(`${promptCode}.view.title.ChooseSupplier`).d('选择供应商')}
                  wrapperCol={{ span: 24 }}
                >
                  <EditTable {...editTableProps} />

                </FormItem>
                }
                {stage === 'two' && <FormItem
                  label={intl.get(`${promptCode}.view.title.Reason`).d('再次报价理由')}
                  wrapperCol={{ span: 24 }}
                >
                  {getFieldDecorator('reason', {
                    initialValue: quotationForm.reason,
                  })(
                    <CusInput.TextArea
                      allowClear
                      autoSize={{ minRows: 3, maxRows: 6 }} />
                  )}
                </FormItem>
                }
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StageName`).d('阶段名称')}
                  wrapperCol={{ span: 24 }}
                >
                  {getFieldDecorator('stageArrangementMeaning', {
                    initialValue: quotationForm.stageArrangementMeaning,
                  })(
                    <CusInput disabled></CusInput>
                  )}

                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.Round`).d('轮次')}
                  wrapperCol={{ span: 24 }}
                >
                  {getFieldDecorator('rounds', {
                    initialValue: intl.get(`${promptCode}.view.message.rounds`, { rounds: quotationForm.rounds }).d(`第${quotationForm.rounds}轮`),
                  })(
                    <CusInput disabled></CusInput>
                  )}
                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StartTime`).d('开始时间')}
                  wrapperCol={{ span: 24 }}
                >
                  {getFieldDecorator('startTime', {
                    initialValue: quotationForm.startTime ? dayjs(quotationForm.startTime) : undefined,
                  })(
                    <CusDatePicker
                      showTime
                      style={{ width: '100%' }}
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) => {
                        return (
                          (dayjs.isDayjs(
                            getFieldValue('deadline') &&
                              dayjs(getFieldValue('deadline'))
                          ) &&
                            currentDate &&
                            currentDate.isAfter(
                              getFieldValue('deadline') &&
                                dayjs(getFieldValue('deadline'))
                            )) ||
                          (currentDate && dayjs(currentDate).isBefore(dayjs(), 'day'))
                        )
                      }}
                    />
                  )}

                </FormItem>
                <FormItem
                  label={intl.get(`${promptCode}.view.title.StageDealine`).d('本阶段截止时间')}
                  wrapperCol={{ span: 24 }}
                >
                  {getFieldDecorator('deadline', {
                    initialValue: quotationForm.deadline ? dayjs(quotationForm.deadline) : undefined,
                  })(
                    <CusDatePicker
                      showTime
                      style={{ width: '100%' }}
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(
                            getFieldValue('startTime') && dayjs(getFieldValue('startTime'))
                          ) &&
                          currentDate &&
                          currentDate.isBefore(
                            getFieldValue('startTime') && dayjs(getFieldValue('startTime'))
                          )
                        )
                      }}
                    />
                  )}
                </FormItem>
                {stage === 'one' && <FormItem
                  label={intl.get(`${promptCode}.view.title.applicantremarks`).d('需求部门给供应商的备注')}
                  wrapperCol={{ span: 24 }}
                >
                  {getFieldDecorator('remark', {
                    initialValue: quotationForm.remark,
                  })(
                    <CusInput></CusInput>
                  )}
                </FormItem>
                }
                <FormItem
                  label=' '
                  className={classnames(styles['des-item'])}
                >
                  <div>
                    <p style={{ color: '#8996a1', fontSize: '13px' }}>{intl.get(`${promptCode}.view.title.Description`).d('说明:')}</p>
                    <p style={{ color: '#8996a1', fontSize: '13px' }}>{intl.get(`${promptCode}.view.title.Quotationfileeditingtimegys`).d('供应商须在截止时间前递交报价文件')}</p>
                  </div>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </React.Fragment>
    )
  }
}
