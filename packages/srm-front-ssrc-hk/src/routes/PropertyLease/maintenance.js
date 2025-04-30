import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Col, Input } from 'antd';
import dayjs from 'dayjs';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import CusNotification from '_cus_components/CusNotification';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { fastCodeLoader } from '@/utils/decorators';
import { getDFormGridSpan } from '_cus_utils/utils';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusModal from '_cus_components/CusModal';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusButton from '_cus_components/CusButton';
import queryString from 'querystring';
import UploadList from '@/components/uploadList';

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
  'HKPC.FORM_STATUS',
  'HKPC.DISTRICTS_OF_HONGKONG',
])
@connect(({ propertyLeaseModel }) => ({
  propertyLeaseModel,
}))
@Form.create()
class Maintenance extends React.Component {
  constructor(props) {
    super(props);
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    this.state = {
      activeKey: ['form'],
      isPub,
      headerInfo: {},
    };
  }
  getStoreDetail = () => {
    const { match, dispatch } = this.props;
    const storeNumber = match.params.storeNumber;
    if (storeNumber) {
      dispatch({
        type: 'propertyLeaseModel/queryStoreDetail',
        payload: {
          storeNumber,
        },
      }).then((res) => {
        this.setState({
          headerInfo: res,
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
  };
  componentDidMount() {
    const { dispatch } = this.props;
    const { isModify } = queryString.parse(location?.search?.substr(1)) || {};
    if (isModify) {
      this.handleStatus(isModify);
    }
    this.getStoreDetail();
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
          creatorName: res.content[0].realName,
          creatorCode: res.content[0].userId,
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
          if (!err || type == 'save') {
            console.log('Received values of form: ', values);
            dispatch({
              type: 'propertyLeaseModel/submitStoreInfo',
              payload: {
                data: [
                  {
                    ...headerInfo,
                    ...values,
                    status: 'submitted',
                    createDate: `${dayjs(values.createDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
                  },
                ],
              },
            }).then((res) => {
              if (res) {
                window.close()
              }
            });
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
    this.props.form.validateFields(['storeNumber'], (err, value) => {
      if (!err) {
        dispatch({
          type: 'propertyLeaseModel/submitStoreInfo',
          payload: {
            data: [
              {
                ...headerInfo,
                ...values,
                status: isModify?isModify:'draft',
                createDate: `${dayjs(values.createDate).format(DEFAULT_DATE_FORMAT)} 00:00:00`,
              },
            ],
          },
        }).then((res) => {
          if (res) {
            CusNotification.success({
              message: intl.get(`HKPC.commom.view.message.savesuccessfully`).d('保存成功'),
            });
            if(res.storeNumber){
                window.location.href=`/pub/ssrc-hk/propertyLease/maintenance/${res.storeNumber}`
            }
            if (match.params.storeNumber) {
              this.getStoreDetail();
            }
            
          }
        });
      }
    });
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
    const { form, idpValueMap, propertyLeaseModel } = this.props;
    const { status } = propertyLeaseModel;
    const { activeKey, headerInfo } = this.state;
    const { getFieldDecorator } = form;
    const { isModify } = queryString.parse(location?.search?.substr(1)) || {};
    const readyOnly = isModify ? false : ['submitted'].includes(headerInfo?.status);
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
                    <Form.Item  label={intl.get(`${promptCode}.view.title.propertyno`).d('主体编号')}>
                      {getFieldDecorator('storeNumber', {
                         rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.propertyno`).d('主体编号'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.storeNumber,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.propertynameen`).d('主体名称(英文)')}>
                      {getFieldDecorator('storeNameEn', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.propertynameen`).d('主体名称(英文)'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.storeNameEn,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.propertynamecn`).d('主体名称（中文）')}>
                      {getFieldDecorator('storeNameCn', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.propertynamecn`).d('主体名称（中文）'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.storeNameCn,
                      })(<Input disabled={readyOnly} />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.propertysize`).d('主体尺寸(Sq.ft)')}>
                      {getFieldDecorator('storeSize', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.propertysize`).d('主体尺寸(Sq.ft)'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.storeSize,
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
                  <Col span={24}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.propertyaddressen`).d('主体地址（英文）')}>
                      {getFieldDecorator('storeAddressEn', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.propertyaddressen`).d('主体地址（英文）'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.storeAddressEn,
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
                    <Form.Item label={intl.get(`${promptCode}.view.title.propertyaddresscn`).d('主体地址（中文）')}>
                      {getFieldDecorator('storeAddressCn', {
                         rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${promptCode}.view.title.propertyaddresscn`).d('主体地址（中文）'),
                            }),
                          },
                        ],
                        initialValue: headerInfo?.storeAddressCn,
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
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.districtsofhk`).d('香港十八区')}>
                      {getFieldDecorator('area', {
                        initialValue: headerInfo?.area,
                      })(
                        <CusSelect
                          options={idpValueMap['HKPC.DISTRICTS_OF_HONGKONG']}
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>

                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.headofgrid`).d('网格长')}>
                      {getFieldDecorator('griderCode', {
                        initialValue: headerInfo?.griderCode,
                      })(
                        <CusLov
                          code="CMHK_REPORT_REQUESTER"
                          textValue={headerInfo?.griderCodeMeaning}
                          lovOptions={{ displayField: 'requester', valueField: 'loginName' }}
                          onChange={(_,value) => {
                            console.log('value',value)
                          }}
                          disabled={readyOnly}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.fillindate`).d('填写日期')}>
                      {getFieldDecorator('createDate', {
                        initialValue: headerInfo?.createDate
                          ? dayjs(headerInfo?.createDate).format(DEFAULT_DATE_FORMAT)
                          : dayjs().format(DEFAULT_DATE_FORMAT),
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.writer`).d('填写人')}>
                      {getFieldDecorator('creatorName', {
                        initialValue: headerInfo?.creatorName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${promptCode}.view.title.formstate`).d('单据状态')}>
                      {getFieldDecorator('status', {
                        initialValue: isModify?isModify:(headerInfo?.status ? headerInfo?.status : 'draft'),
                      })(<CusSelect options={idpValueMap['HKPC.FORM_STATUS']} disabled />)}
                    </Form.Item>
                  </Col>
                </GenerateFormGrid>
                {(status == 'draft' || headerInfo?.status !== 'submitted'||isModify) && (
                  <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                    <CusButton mini onClick={(e) => this.handleSave()}>
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
export default Maintenance;
