import React, { PureComponent } from 'react';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import Checkbox from 'components/Checkbox';
import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import CusSpin from '_cus_components/CusSpin';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { tableScrollWidth } from 'utils/utils';


const LAYOUT = {
  lg: 12,
  md: 12,
  sm: 12,
  xl: 12,
  xs: 12,
  xxl: 12,
};

const prompt = 'spfmhk.supplier';
@Form.create()
export default class BasicInfoForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      backInfoFlag: false,
    }
  }

  componentDidMount() {
  }

  render() {
    const { data = {}, form, registerState, loading = false, pagination = {}, onChange = e => e, } = this.props;
    const { backInfoFlag = false } = this.state
    const { getFieldDecorator, getFieldValue } = form;
    const dataSource = data?.cmhkSupplierReturnHisList;
    const columns = [
      {
        title: intl.get(`spfmhk.supplier.field.returndate`).d('退回日期'),
        dataIndex: 'returnDate',
        width: 280,
      },
      {
        title: intl.get(`spfmhk.supplier.field.returnremark`).d('退回意见'),
        dataIndex: 'returnRemark',
        width: 280,
      }
    ]
    return (
      <CusSpin spinning={loading}>
        <Form className="customize-form">
          <Row>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.application.num`).d('申请单号')}>
                {getFieldDecorator('applyNumber', {
                  initialValue: data.applyNumber
                })(<CusInput trimAll typeCase="lower" allowClear disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.request.status`).d('申请状态')}>
                {getFieldDecorator('applyStatus', {
                  initialValue: data.applyStatus
                })(<CusSelect lovCode="HKSP.APPLICATION_STATUS" disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.request.date`).d('申请日期')}>
                {getFieldDecorator('applyDate', {
                  initialValue: data.applyDate
                })(<CusInput trimAll typeCase="lower" allowClear disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
                {getFieldDecorator('supplierNumber', {
                  initialValue: data.supplierNumber
                })(<CusInput trimAll typeCase="lower" allowClear disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（中文）')}>
                {getFieldDecorator('companyNameCh', {
                  initialValue: data.companyNameCh
                })(<CusInput trimAll typeCase="lower" allowClear disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（英文）')}>
                {getFieldDecorator('companyNameEn', {
                  initialValue: data.companyNameEn
                })(<CusInput trimAll typeCase="lower" allowClear disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.view.table.applicant`).d('申请人')}>
                {getFieldDecorator('salesman', {
                  initialValue: registerState !== 'bankUpdate' ? data.salesman : data?.applyUser
                })(<CusInput trimAll typeCase="lower" allowClear disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.reason.change`).d('变更原因')}>
                {getFieldDecorator('editReason', {
                  initialValue: data.editReason,
                })(<CusInput trimAll typeCase="lower" allowClear disabled />)}
              </Form.Item>
            </Col>
            {data?.returnDate && <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.returnsup.remark`).d('退回供应商意见')}>
                {getFieldDecorator('supplierAccessTime', {
                  initialValue: data.supplierAccessTime,
                })(
                  <CusButton type='plain' onClick={() => this.setState({
                    backInfoFlag: true,
                  })}>
                    {intl.get(`${prompt}.field.returnsup.remark`).d('退回供应商意见')}
                  </CusButton>
                 )}
              </Form.Item>
            </Col>}
          </Row>
        </Form>
        <CusModal
          title={intl.get(`spfmhk.supplier.field.returnremark`).d('退回商户')}
          width={800}
          visible={backInfoFlag}
          destroyOnClose
          onCancel={() => {
            this.setState({
              backInfoFlag: false,
            })
          }}
          // onOk={() => { this.returnPortal() }}
        >
          <CusTable 
            rowKey="returnDate"
            pagination={pagination}
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={onChange}
          />
        </CusModal>
      </CusSpin>
    )
  }

}
