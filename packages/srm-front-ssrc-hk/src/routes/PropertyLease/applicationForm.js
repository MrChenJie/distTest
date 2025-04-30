import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Col, Input } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { fastCodeLoader } from '@/utils/decorators';
import { getDFormGridSpan } from '_cus_utils/utils';
import { numberRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusNotification from '_cus_components/CusNotification';
import { queryFileList } from '@/utils/utils';
import CusModal from '_cus_components/CusModal';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusButton from '_cus_components/CusButton';
import UploadList from '@/components/uploadList';
import queryString from 'querystring';
import { head } from 'lodash';

const { Panel } = Collapse;
const gridSpan = getDFormGridSpan();
const organizationId = getCurrentOrganizationId();
const { id } = getCurrentUser();
const promptCode = 'HKPC.commom';
@formatterCollections({ code: ['spfmhk.trade'] })
@fastCodeLoader([
  'HKTB.HEAD_BIDALL',
  'HKTB.LINE_BIDRULE',
  'CMHK.Y_N',
  'HKPC.PRTYPE',
  'HKPC.FORM_STATUS',
])
@connect(({ propertyLeaseModel }) => ({
  propertyLeaseModel,
}))
@Form.create()
class PropertyLeaseForm extends React.Component {
  constructor(props) {
    super(props);
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    this.state = {
      activeKey: ['form'],
      isPub,
      headerInfo: {},
      stateAttachmentUUID: uuidv4(),
    };
  }
  getLeaseDetail() {
    const { dispatch, match } = this.props;
    const laNumber = match.params.laNumber;
    if (laNumber) {
      dispatch({
        type: 'propertyLeaseModel/queryLeaseDetail',
        payload: {
          laNumber,
        },
      }).then((res) => {
        this.setState({
          headerInfo: res,
        });
        this.handleStoreIdChange(res.storeNumber, res.leaseStartDate);
        dispatch({
          type: 'propertyLeaseModel/updateState',
          payload: {
            storeNumber: res.storeNumber,
          },
        });
      });
    } else {
      dispatch({
        type: 'propertyLeaseModel/updateState',
        payload: {
          status: 'draft',
        },
      });
    }
  }
  componentDidMount() {
    const { dispatch } = this.props;
    const { isModify } = queryString.parse(location?.search?.substr(1)) || {};
    if (isModify) {
      this.handleStatus(isModify);
    }
    this.getLeaseDetail();
    dispatch({
      type: 'propertyLeaseModel/getUserUnit',
      payload: {
        tenantId: organizationId,
        userId: id,
        lang: getCurrentLanguage(),
      },
    }).then((res) => {
      const { headerInfo } = this.state;
      this.setState({
        headerInfo: {
          ...headerInfo,
          applyDepName: res.content[0].unitName,
          applyUserName: res.content[0].realName,
        },
      });
    });
  }

  handleSubmit = () => {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    CusModal.confirm({
      content: intl.get('HKPC.commom.view.title.confirmtosubmit').d('请确认是否提交？'),
      onOk: () => {
        this.props.form.validateFields((err, values) => {
          console.log('values',values)
          if (!err) {
            console.log('Received values of form: ', values);
            queryFileList({
              tenantId: organizationId,
              bucketName: 'spfm-comp',
              attachmentUUID: values.uuid,
            }).then((fileList)=>{
              if(fileList.length>0){
                dispatch({
                  type: 'propertyLeaseModel/submitPropertyLeaseInfo',
                  payload: {
                    data: [
                      {
                        ...headerInfo,
                        ...values,
                        status: 'submitted',
                        applyDate: `${dayjs(values.applyDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
                        approveStart: `${dayjs(values.approveStart).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
                        approveEnd: `${dayjs(values.approveEnd).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
                        leaseStartDate: `${dayjs(values.leaseStartDate).format(
                          DEFAULT_DATE_FORMAT
                        )} 00:00:00`,
                        leaseEndDate: `${dayjs(values.leaseEndDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
                      },
                    ],
                  },
                }).then((res) => {
                  if (res) {
                    window.close();
                  }
                });
              }else{
                CusNotification.warning({
                  message: intl.get('demo').d('请上传附件'),
                })
              }
            })

          }
        });
      },
    });


  };
  handleSave = () => {
    const { dispatch, match } = this.props;
    const { headerInfo } = this.state;
    const { isModify } = queryString.parse(location?.search?.substr(1)) || {};
    const values = this.props.form.getFieldsValue();
    dispatch({
      type: 'propertyLeaseModel/submitPropertyLeaseInfo',
      payload: {
        data: [
          {
            ...headerInfo,
            ...values,
            status: isModify ? isModify : 'draft',
            applyDate: `${dayjs(values.applyDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
            approveStart: `${dayjs(values.approveStart).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
            approveEnd: `${dayjs(values.approveEnd).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
            leaseStartDate: `${dayjs(values.leaseStartDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
            leaseEndDate: `${dayjs(values.leaseEndDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
          },
        ],
      },
    }).then((res) => {
      if (res) {
        CusNotification.success({
          message: intl.get(`HKPC.commom.view.message.savesuccessfully`).d('保存成功'),
        });
        if (res.laNumber) {
          window.location.href = `/pub/ssrc-hk/propertyLease/applicationForm/${res.laNumber}`;
        }
        if (match.params.laNumber) {
          this.getLeaseDetail();
        }
      }
    });
  };
  handleStoreIdChange = (storeNumber, leaseStartDate) => {
    const { dispatch } = this.props;
    if (storeNumber && leaseStartDate) {
      dispatch({
        type: 'propertyLeaseModel/queryHistoryStore',
        payload: {
          storeNumber,
          leaseStartDate: `${dayjs(leaseStartDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
        },
      }).then((res) => {
        dispatch({
          type: 'propertyLeaseModel/updateState',
          payload: {
            ...res,
          },
        });
      });
    }
  };
  // 计算到期季度
  getQuarter = (month) => {
    if (month < 3) return 'Q1'; // 1月到3月为Q1
    if (month < 6) return 'Q2'; // 4月到6月为Q2
    if (month < 9) return 'Q3'; // 7月到9月为Q3
    return 'Q4'; // 10月到12月为Q4
  };
  getLeaseMonth = (start, end) => {
    let monthDiff = end?.diff(start, 'month');
    if (end?.date() >= start?.date()) {
      monthDiff += 1;
    }

    if (monthDiff > 0) {
      return monthDiff;
    } else if (monthDiff === 0) {
      return 1;
    } else {
      return 0;
    }
  };
  handleStartDateChange = (value) => {
    const { dispatch, propertyLeaseModel } = this.props;
    const { storeNumber } = { propertyLeaseModel };
    this.props.form.setFieldsValue({
      months: this.props.form.getFieldValue('leaseEndDate')
        ? this.getLeaseMonth(value, this.props.form.getFieldValue('leaseEndDate'))
        : '',
    });
  };
  handleEndDateChange = (value) => {
    this.props.form.setFieldsValue({
      leaseEndYear: dayjs(value).year(),
      leaseEndQuarter: this.getQuarter(dayjs(value).month()),
      months: this.props.form.getFieldValue('leaseStartDate')
        ? this.getLeaseMonth(this.props.form.getFieldValue('leaseStartDate'), value)
        : '',
    });
  };
  getSquarePrice = (monthlyRent, storeSize) => {
    return monthlyRent / storeSize;
  };
  handleMonthRentChange = (value) => {
    this.props.form.setFieldsValue({
      footPrice: this.props.form.getFieldValue('storeSize')
        ? this.getSquareSize(value, this.props.form.getFieldValue('storeSize'))
        : '',
    });
  };
  handleStoreSizeChange = (value) => {
    this.props.form.setFieldsValue({
      footPrice: this.props.form.getFieldValue('monthlyRent')
        ? this.getSquareSize(this.props.form.getFieldValue('monthlyRent'), value)
        : '',
    });
  };

  handleStoreLink = (id) => {
    const url = `/pub/ssrc-hk/propertyLease/maintenance/${id}`;
    window.open(url, '_blank');
  };
  handleStatus = (isModify) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'propertyLeaseModel/updateState',
      payload: {
        status: isModify,
      },
    });
  };
  render() {
    const { form, idpValueMap, propertyLeaseModel, dispatch } = this.props;
    const { status } = propertyLeaseModel;
    const { activeKey, headerInfo } = this.state;
    const { isModify } = queryString.parse(location?.search?.substr(1)) || {};
    const readyOnly = isModify ? false : ['submitted'].includes(headerInfo?.status);
    const { getFieldDecorator } = form;
    const { stateAttachmentUUID } = this.state;
    const {
      contactsPhone,
      contactsEmail,
      supContacts,
      storeNumber,
      lastOneFp,
      lastOneMr,
      lastOneTime,
      lastTwoFp,
      lastTwoMr,
      lastTwoTime,
    } = propertyLeaseModel;
    return (
      <PageWrapper>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`hitf.interfaceLogs.view.message.baseMessage`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <div className="customize-form">
              <Form>
                <GenerateFormGrid defaultPackUp={false} isPackUp={false}>
                  <Col {...gridSpan}>
                    <Form.Item
                      required
                      label={intl
                        .get(`${promptCode}.view.title.applicaitonformname`)
                        .d('申请单名称')}
                    >
                      {getFieldDecorator('laName', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.applicaitonformname`)
                                .d('申请单名称'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.laName,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.applicationformno`).d('申请单编号')}
                    >
                      {getFieldDecorator('laNumber', {
                        initialValue: headerInfo?.laNumber,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.propertyname`).d('主体名称')}
                    >
                      {getFieldDecorator('storeName', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.propertyname`).d('主体名称'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.storeNameEn,
                      })(
                        <CusLov
                          textValue={headerInfo?.storeNameEn}
                          code="HKPC.SELECT_PROPERTY"
                          lovOptions={{ displayField: 'storeNameEn', valueField: 'storeNumber' }}
                          onChange={(_, lovData) => {
                            dispatch({
                              type: 'propertyLeaseModel/updateState',
                              payload: {
                                storeNumber: lovData.storeNumber,
                              },
                            });
                            this.handleStoreIdChange(lovData.storeNumber, headerInfo?.leaseStartDate)
                          }}
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.propertyno`).d('主体编号')}
                    >
                      {getFieldDecorator('storeNumber', {
                        initialValue: storeNumber || headerInfo?.storeNumber,
                      })(
                        <div
                          className="ant-input ant-input-disabled"
                          style={{ background: '#EFF0F1', borderColor: '#D0D3D6' }}
                        >
                          <a
                            onClick={() =>
                              this.handleStoreLink(storeNumber || headerInfo?.storeNumber)
                            }
                          >
                            {storeNumber || headerInfo?.storeNumber}
                          </a>
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.prade`).d('申请日期')}>
                      {getFieldDecorator('applyDate', {
                        initialValue: headerInfo?.applyDate
                          ? dayjs(headerInfo?.applyDate).format(DEFAULT_DATE_FORMAT)
                          : dayjs().format(DEFAULT_DATE_FORMAT),
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.leasestartdate`).d('租赁开始日期')}
                    >
                      {getFieldDecorator('leaseStartDate', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.leasestartdate`)
                                .d('租赁开始日期'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.leaseStartDate
                          ? dayjs(headerInfo?.leaseStartDate)
                          : '',
                      })(
                        <CusDatePicker
                          format={DEFAULT_DATE_FORMAT}
                          onChange={(value) => {
                            this.handleStartDateChange(value);
                            this.handleStoreIdChange(storeNumber, value);
                          }}
                          disabled={readyOnly}
                          disabledDate={(currentDate) =>
                            dayjs.isDayjs(this.props.form?.getFieldValue('leaseEndDate')) &&
                            currentDate &&
                            dayjs(currentDate).isAfter(this.props.form?.getFieldValue('leaseEndDate'))
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.leaseenddate`).d('租赁结束日期')}
                    >
                      {getFieldDecorator('leaseEndDate', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.leaseenddate`)
                                .d('租赁结束日期'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.leaseEndDate
                          ? dayjs(headerInfo?.leaseEndDate)
                          : '',
                      })(
                        <CusDatePicker
                          format={DEFAULT_DATE_FORMAT}
                          onChange={this.handleEndDateChange}
                          disabled={readyOnly}
                          disabledDate={(currentDate) =>
                            dayjs.isDayjs(this.props.form?.getFieldValue('leaseStartDate')) &&
                            currentDate &&
                            dayjs(currentDate).isBefore(this.props.form?.getFieldValue('leaseStartDate'))
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.maturityyear`).d('到期年份')}
                    >
                      {getFieldDecorator('leaseEndYear', {
                        initialValue: headerInfo?.leaseEndYear,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.quarterdue`).d('到期季度')}
                    >
                      {getFieldDecorator('leaseEndQuarter', {
                        initialValue: headerInfo?.leaseEndQuarter,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.actualmonthlyrent`)
                        .d('实际月租(HK$)')}
                    >
                      {getFieldDecorator('monthlyRent', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.actualmonthlyrent`)
                                .d('实际月租(HK$)'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.monthlyRent,
                      })(
                        <CusInputNumber
                          onChange={this.handleMonthRentChange}
                          min={0}
                          step={1}
                          precision={4}
                          allowThousandth
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.actualscaleprice`)
                        .d('实际尺价(HK$)')}
                    >
                      {getFieldDecorator('footPrice', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.actualscaleprice`)
                                .d('实际尺价(HK$)'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.footPrice,
                      })(
                        <CusInputNumber
                          min={0}
                          step={1}
                          precision={4}
                          allowThousandth
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.actualavemonthlyrent`)
                        .d('实际平均月租(HK$)')}
                    >
                      {getFieldDecorator('monthlyRentAvg', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.actualavemonthlyrent`)
                                .d('实际平均月租(HK$)'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.monthlyRentAvg,
                      })(
                        <CusInputNumber
                          min={0}
                          step={1}
                          precision={4}
                          allowThousandth
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.actualavefootprice`)
                        .d('实际平均尺价(HK$)')}
                    >
                      {getFieldDecorator('footPriceAvg', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.actualavefootprice`)
                                .d('实际平均尺价(HK$)'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.footPriceAvg,
                      })(
                        <CusInputNumber
                          min={0}
                          step={1}
                          precision={4}
                          allowThousandth
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.rentalmonth`).d('租期月数')}
                    >
                      {getFieldDecorator('months', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.rentalmonth`).d('租期月数'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.months,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.rental`).d('租金总额')}>
                      {getFieldDecorator('amounts', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.rental`).d('租金总额'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.amounts,
                      })(
                        <CusInputNumber
                          min={0}
                          step={1}
                          precision={4}
                          allowThousandth
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.previousperiod`)
                        .d('前一期租赁时间')}
                    >
                      {getFieldDecorator('lastOneTime', {
                        initialValue: lastOneTime,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.previousmonthlyrental`)
                        .d('前一期月租金额(HK$)')}
                    >
                      {getFieldDecorator('lastOneMr', {
                        initialValue: lastOneMr,
                      })(
                        <CusInputNumber
                          min={0}
                          step={0.01}
                          precision={4}
                          allowThousandth
                          disabled
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.previousunitprice`)
                        .d('前一期月租尺价(HK$)')}
                    >
                      {getFieldDecorator('lastOneFp', {
                        initialValue: lastOneFp,
                      })(
                        <CusInputNumber
                          min={0}
                          step={0.01}
                          precision={4}
                          allowThousandth
                          disabled
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.periodbeforelast`)
                        .d('前两期租赁时间')}
                    >
                      {getFieldDecorator('lastTwoTime', {
                        initialValue: lastTwoTime,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.rentalbefore`)
                        .d('前两期月租金额(HK$)')}
                    >
                      {getFieldDecorator('lastTwoMr', {
                        initialValue: lastTwoMr,
                      })(
                        <CusInputNumber
                          min={0}
                          step={0.01}
                          precision={4}
                          allowThousandth
                          disabled
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.unitpricebefore`)
                        .d('前两期月租尺价(HK$)')}
                    >
                      {getFieldDecorator('lastTwoFp', {
                        initialValue: lastTwoFp,
                      })(
                        <CusInputNumber
                          min={0}
                          step={0.01}
                          precision={4}
                          allowThousandth
                          disabled
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称')}
                    >
                      {getFieldDecorator('supName', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.SupplierName`)
                                .d('供应商名称'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.supName,
                      })(
                        <CusLov
                          textValue={headerInfo?.supName}
                          code="CMHK.QUALIFIED_SUPPLIER"
                          lovOptions={{
                            displayField: 'companyNameCh',
                            valueField: 'companyNameCh',
                          }}
                          disabled={readyOnly}
                          onChange={(_, supplier) => {
                            dispatch({
                              type: 'propertyLeaseModel/updateState',
                              payload: {
                                supContacts: supplier.realName,
                                contactsPhone: supplier.phone,
                                contactsEmail: supplier.email,
                              },
                            });
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.Contact`).d('联系人')}>
                      {getFieldDecorator('supContacts', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.Contact`).d('联系人'),
                            }),
                          },
                        ],
                        initialValue: supContacts || headerInfo?.supContacts,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.responsiblepersonnumber`)
                        .d('联系电话')}
                    >
                      {getFieldDecorator('contactsPhone', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.responsiblepersonnumber`)
                                .d('联系电话'),
                            }),
                          },
                        ],
                        initialValue: contactsPhone || headerInfo?.contactsPhone,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.email`).d('电子邮箱')}>
                      {getFieldDecorator('contactsEmail', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.email`).d('电子邮箱'),
                            }),
                            pattern: /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                          },
                        ],
                        initialValue: contactsEmail || headerInfo?.contactsEmail,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.agency`).d('代理机构')}>
                      {getFieldDecorator('agt', {
                        initialValue: headerInfo?.agt,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}>
                      {getFieldDecorator('applyUserName', {
                        initialValue: headerInfo?.applyUserName,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
                            }),
                          },
                        ],
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.applyingdepartment`)
                        .d('申请人部门')}
                    >
                      {getFieldDecorator('applyDepName', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.applyingdepartment`)
                                .d('申请人部门'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.applyDepName,
                      })(
                        <CusLov
                          textValue={headerInfo?.applyDepName}
                          code="CMHK_USER_DEPT"
                          queryParams={{
                            tenantId: organizationId,
                            userId: id,
                            lang: getCurrentLanguage(),
                          }}
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.formstate`).d('单据状态')}>
                      {getFieldDecorator('status', {
                        initialValue: isModify
                          ? isModify
                          : headerInfo?.status
                          ? headerInfo?.status
                          : 'draft',
                      })(<CusSelect options={idpValueMap['HKPC.FORM_STATUS']} disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.compareammount`).d('初始报价')}
                    >
                      {getFieldDecorator('initAmounts', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.compareammount`)
                                .d('初始报价'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.initAmounts,
                      })(
                        <CusInputNumber
                          min={0}
                          step={0.01}
                          precision={2}
                          allowThousandth
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.PAAmountH`).d('最终报价')}>
                      {getFieldDecorator('finalAmounts', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.PAAmountH`).d('最终报价'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.finalAmounts,
                      })(
                        <CusInputNumber
                          min={0}
                          step={0.01}
                          precision={2}
                          allowThousandth
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.savingrate`).d('节省比例(%)')}
                    >
                      {getFieldDecorator('save', {
                        initialValue:
                          numberRender(
                            ((this.props.form.getFieldValue('initAmounts') -
                              this.props.form.getFieldValue('finalAmounts')) /
                              this.props.form.getFieldValue('initAmounts')) *
                              100,
                            2
                          ) + '%',
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>

                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.approvalstartdate`)
                        .d('审批开始日期')}
                    >
                      {getFieldDecorator('approveStart', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.approvalstartdate`)
                                .d('审批开始日期'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.approveStart
                          ? dayjs(headerInfo?.approveStart)
                          : '',
                      })(<CusDatePicker format={DEFAULT_DATE_FORMAT} disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.approvalenddate`).d('审批结束日期')}
                    >
                      {getFieldDecorator('approveEnd', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`${promptCode}.view.title.approvalenddate`)
                                .d('审批结束日期'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.approveEnd ? dayjs(headerInfo?.approveEnd) : '',
                      })(<CusDatePicker format={DEFAULT_DATE_FORMAT} disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}>
                      {getFieldDecorator('uuid', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.Attachment`).d('附件'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.uuid || stateAttachmentUUID,
                      })(
                        <UploadList
                          viewOnly={readyOnly}
                          multiple={true}
                          bucketName="spfm-comp"
                          tenantId={getCurrentOrganizationId()}
                          showUploadList={{
                            removePopConfirmTitle: intl
                              .get('hzero.common.message.confirm.delete')
                              .d('是否删除此条记录？'),
                            showRemoveIcon: readyOnly,
                          }}
                          filePreview
                          onUploadSuccess={(file, fileList, attachmentUUID) => {
                            headerInfo.uuid = attachmentUUID;
                          }}
                          attachmentUUID={headerInfo?.uuid || stateAttachmentUUID}
                          setLoading={(uploading = false) => {
                            this.setState({
                              uploading,
                            });
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.view.title.leaseorderremarks`)
                        .d('租赁订单说明')}
                    >
                      {getFieldDecorator('laDesc', {
                        initialValue: headerInfo?.laDesc,
                      })(
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={1000}
                          showCharacter
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      label={intl.get(`${promptCode}.view.title.poremrks`).d('采购订单备注')}
                    >
                      {getFieldDecorator('poDesc', {
                        initialValue: headerInfo?.poDesc,
                      })(
                        <CusInput.TextArea
                          rows={3}
                          autoSize={{ minRows: 3, maxRows: 3 }}
                          maxLength={1000}
                          showCharacter
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </GenerateFormGrid>
                {(status == 'draft' || headerInfo?.status !== 'submitted' || isModify) && (
                  <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <CusButton mini onClick={() => this.handleSave()}>
                      {intl.get('hzero.common.view.button.save').d('保存')}
                    </CusButton>
                    <CusButton mini type="primary" onClick={(e) => this.handleSubmit()}>
                      {intl.get('hzero.common.view.button.submit').d('提交')}
                    </CusButton>
                  </Col>
                )}
              </Form>
            </div>
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
export default PropertyLeaseForm;
