/**
 * 供应商管理 - 准入邀请注册
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/8
 * @Copyright: Copyright (c), 2023, hand
 */

import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col, Input, AutoComplete } from 'antd';
import intl from 'utils/intl';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import CusNotification from '_cus_components/CusNotification';


const prompt = 'spfmhk.supplier';

@Form.create()
@connect(({ accessToSupplierHK, loading }) => ({
  accessToSupplierHK,
}))
export default class InvitationRegisterModal extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      inputValue: '',
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'accessToSupplierHK/updateState',
      payload: {
        invitedOptions: [],
      }
    })
  }

  @Bind()
  checkEmailFuc(rule, value, callback) {
    const {
      dispatch,
    } = this.props;
    if (!value) {
      callback(intl.get('hzero.common.validation.notNull', {
        name: intl.get(`${prompt}.field.invited.email`).d('供应商邮箱'),
      }));
      return;
    }
     dispatch({
      type: 'accessToSupplierHK/getEmail',
      payload: {
        email: value.toLowerCase(),
      }
    })
    .then((res) => {
      console.log(res);
      if( res && res.failed === true){
        // callback(res?.message);
        callback(intl.get(`${prompt}.form.validateFields.emailvaild`).d('您的邮箱已注册！'))
      }else {
        callback()
      }
    })
  }

  // 邀请供应商准入时，添加供应商查重功能
  @Bind()
  setInvitedOptions(text) {
    const { dispatch } = this.props;
    dispatch({
      type: 'accessToSupplierHK/updateState',
      payload: {
        invitedOptions: [],
      }
    })
    if (text) {
      this.setState({ inputValue: text });
      dispatch({
        type: 'accessToSupplierHK/getInvitedOptions',
        payload: {
          vagueName: text,
        }
      }).then((res) => {
        if (res) {
          const arr = res.map(item => {
            let newLabel = item.companyCaptureName;
            if (item.supplierNumber) {
              newLabel += '/' + item.supplierNumber;
            }
            if (item.supplierStatusMeaning) {
              newLabel += '/' + item.supplierStatusMeaning;
            }
            return {
              ...item,
              label: newLabel,
              value: item.companyName,
            }
          });
          dispatch({
            type: 'accessToSupplierHK/updateState',
            payload: {
              invitedOptions: arr,
            }
          })
        }
      })
    } else {
      this.setState({ inputValue: '' });
      dispatch({
        type: 'accessToSupplierHK/updateState',
        payload: {
          invitedOptions: [],
        }
      })
    }
  }

  render() {
    const { form: { getFieldDecorator }, tenantId, unitCodes, accessToSupplierHK: { invitedOptions } } = this.props;
    return (
      <>
        <div className='customize-form'>
          <Form>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.inviter`).d('邀请方')}>
                  {getFieldDecorator('inviteSource', {
                    initialValue: 'China Mobile Hong Kong Company Limited',
                  })(<CusInput disabled />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.invited.company`).d('供应商企业')}>
                  {getFieldDecorator('invitedCompany', {
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.invited.company`).d('供应商企业'),
                      }),
                    }],
                  })(
                    // <CusInput allowClear />
                    <AutoComplete
                      options={invitedOptions}
                      onSearch={(text) => this.setInvitedOptions(text)}
                      onSelect={(data, option) => {
                        this.setInvitedOptions('');
                        CusNotification.warning({
                          message: intl.get(`${prompt}.field.suprepeat.remind`).d('该供应商已登记，请勿重复操作。'),
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item required  label={intl.get(`${prompt}.field.invited.email`).d('供应商邮箱')}>
                  {getFieldDecorator('invitedEmail', {
                    rules: [
                      {
                        pattern: EMAIL,
                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                      },
                      {
                        validator: this.checkEmailFuc
                      }
                    ],
                  })(<CusInput allowClear />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.invite.description`).d('邀请说明')}>
                  {getFieldDecorator('inviteDescription')(<CusInput allowClear />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.cmhk.buyer`).d('CMHK采购员')}>
                  {getFieldDecorator('inviteOperatorId', {
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.cmhk.buyer`).d('CMHK采购员'),
                      }),
                    }],
                  })(<CusLov allowClear
                             code='HKPC.APPLICATION'
                             lovOptions={{ displayField: 'realName', valueField: 'id' }}
                             queryParams={{
                               tenantId,
                               unitCode: unitCodes
                             }}
                  />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
