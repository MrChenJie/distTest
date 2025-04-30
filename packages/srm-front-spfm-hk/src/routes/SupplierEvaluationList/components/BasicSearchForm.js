import React, { PureComponent } from 'react';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import PropTypes from 'prop-types';
import CusSelect from 'srm-front-common/lib/components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusButton from '_cus_components/CusButton';
import dayjs from 'dayjs';
import { getCurrentOrganizationId} from 'utils/utils';

const prompt = 'spfmhk.supplier';
const tenantId = getCurrentOrganizationId();

@Form.create()
export default class BasicSearchForm extends PureComponent {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      colSpan: 12,
      isShowMore: true,
      userId: null,
      unitName: null
    };
  }

  componentDidMount() {
  }

  render() {
    const {
      form: { getFieldDecorator, setFieldsValue },
      tenantId,
      currentUser,
      initialValues,
      onSearch,
      disabled,
    } = this.props;
    const {
      colSpan,
      isShowMore,
    } = this.state;

    return (
      <div className='customize-form'>
        <Form>
          <Row gutter={24}>
            <Col span={colSpan}>
              <Form.Item label={intl.get(`${prompt}.field.info.reviewNumber`).d('评审单号')}>
                {getFieldDecorator('revNo', {
                  initialValue: initialValues?.revNo,
                })(<CusInput disabled />)}
              </Form.Item>
            </Col>
            <Col span={colSpan}>
              <Form.Item label={intl.get(`${prompt}.field.info.reviewStatus`).d('评审状态')}>
                {getFieldDecorator('revStatus', {
                  initialValue: initialValues?.revStatusMeaning,
                })(<CusInput disabled />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={colSpan}>
              <Form.Item label={intl.get(`${prompt}.field.info.buyer`).d('采购员')}>
                {getFieldDecorator('prPeople', {
                  initialValue: initialValues?.prPeople,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.info.buyer`).d('采购员'),
                    }),
                  }],
                })(<CusLov allowClear
                           code='HKPC.APPLICATION'
                           lovOptions={{
                             displayField: 'realName',
                             valueField: 'loginName',
                           }}
                           textValue={initialValues?.prPeopleMeaning}
                           queryParams={{
                             unitCode: 'D0022,D0094',
                             tenantId
                           }}
                           disabled={disabled}
                />)}
              </Form.Item>
            </Col>
            <Col span={colSpan}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
                {getFieldDecorator('supplierNumber', {
                  initialValue: initialValues?.supplierNumber,
                })(<CusInput allowClear disabled />)}
              </Form.Item>
            </Col>
          </Row>
          <Col span={24} style={{ display: isShowMore ? 'block' : 'none' }}>
            <Row gutter={24}>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
                  {getFieldDecorator('companyNameEn', {
                    initialValue: initialValues?.companyNameEn,
                  })(<CusInput allowClear disabled />)}
                </Form.Item>
              </Col>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
                  {getFieldDecorator('companyNameCh', {
                    initialValue: initialValues?.companyNameCh,
                  })(<CusInput allowClear disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.info.reviewType`).d('评审类型')}>
                  {getFieldDecorator('revType', {
                    initialValue: initialValues?.revType || 'ManualAssessment',
                  })(<CusSelect allowClear
                                lovCode='HKSP.ASSESSMENT_TYPE'
                                disabled
                  />)}
                </Form.Item>
              </Col>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.info.reviewQuater`).d('评审季度')}>
                  {getFieldDecorator('revQuarter', {
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.info.reviewQuater`).d('评审季度'),
                      }),
                    }],
                    initialValue: initialValues?.revQuarter,
                  })(<CusSelect allowClear
                                lovCode='HKSP.ASSESSMENT_QUARTER'
                                disabled={disabled}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.info.reviewYear`).d('评审年度')}>
                  {getFieldDecorator('revYear', {
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.info.reviewYear`).d('评审年度'),
                      }),
                    }],
                    initialValue: initialValues?.revYear ? dayjs(initialValues?.revYear) : undefined,
                  })(<CusDatePicker allowClear
                                    popupClassName='customize-select'
                                    picker='year'
                                    disabledDate={(currentDate) => {
                                      return (currentDate && currentDate.isAfter(dayjs()));
                                    }}
                                    disabled={disabled}
                  />)}
                </Form.Item>
              </Col>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.info.startDate`).d('发起日期')}>
                  {getFieldDecorator('startTime', {
                    initialValue: initialValues?.startTime ? dayjs(initialValues?.startTime) : undefined,
                  })(<CusDatePicker allowClear
                                    disabledDate={(currentDate) => {
                                      return (currentDate && currentDate.isAfter(dayjs()));
                                    }}
                                    disabled={disabled}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.info.endDate`).d('结束日期')}>
                  {getFieldDecorator('endTime', {
                    initialValue: initialValues?.endTime ? dayjs(initialValues?.endTime) : undefined,
                  })(<CusDatePicker disabled />)}
                </Form.Item>
              </Col>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.Demander`).d('需求人')}>
                  {getFieldDecorator('demander', {
                    initialValue: initialValues?.demander,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.Demander`).d('需求人'),
                      }),
                    }],
                  })(<CusLov allowClear
                             code='HKSP.DEMANDER'
                             queryParams={{ tenantId }}
                             lovOptions={{
                               displayField: 'realName',
                               valueField: 'loginName',
                             }}
                             textValue={initialValues?.demanderMeaning}
                             disabled={disabled}
                             onChange={(_, row) => {
                               console.log(row, 'row');
                               this.setState({
                                 userId: row?.id,
                               });
                               setFieldsValue({
                                 needDep: row.unitCode,
                                 unitName: row.unitName,
                               });
                             }}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.DemanderDepart`).d('需求部门')}>
                  {getFieldDecorator('needDep', {
                    initialValue: initialValues?.needDep,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.DemanderDepart`).d('需求部门'),
                      }),
                    }],
                  })(<CusLov allowClear
                             code='HKSP.DEMANDER_UNIT'
                             lovOptions={{
                               displayField: 'unitName',
                               valueField: 'unitCode',
                             }}
                             queryParams={{
                               tenantId,
                               userId: this.state?.userId,
                               lang: currentUser.language,
                             }}
                             textValue={this.state?.unitName || initialValues?.needDepMeaning}
                             textField="unitName"
                             disabled={disabled}
                             onChange={(val) => {
                               if(!val) {
                                 this.setState({
                                   userId: null
                                 })
                               }
                             }}
                  />)}
                </Form.Item>
              </Col>
              <Col span={colSpan}>
                <Form.Item label={intl.get(`${prompt}.field.recipient`).d('收货人')}>
                  {getFieldDecorator('deliveryPerson', {
                    initialValue: initialValues?.deliveryPerson,
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.recipient`).d('收货人'),
                      }),
                    }],
                  })(<CusLov allowClear
                             code='HKSP.DEMANDER'
                             queryParams={{ tenantId }}
                             lovOptions={{
                               displayField: 'realName',
                               valueField: 'loginName',
                             }}
                             textValue={initialValues?.deliveryPersonMeaning}
                             disabled={disabled}
                             onChange={(_, row) => {
                               console.log(row, 'row');
                             }}
                  />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Row gutter={24} style={{ float: 'right' }}>
            <Col span={24}>
              <CusButton onClick={() => {
                this.setState({
                  isShowMore: !isShowMore,
                });
              }}>{isShowMore ? intl.get('hzero.common.button.packUp').d('收起') : intl.get('hzero.common.button.unfold').d('展开')}</CusButton>
              {!disabled && <CusButton type='primary'
                                       onClick={onSearch}>{intl.get('hzero.common.button.search').d('查询')}</CusButton>}
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
