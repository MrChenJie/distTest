/**
 * 供应商管理 - 准入邀请注册
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/8
 * @Copyright: Copyright (c), 2023, hand
 */

import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col, Input } from 'antd';
import intl from 'utils/intl';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
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
      id: null,
      BRNum: null,
      currentInviteType: null,
    };
  }

  @Bind()
  checkEmailFuc(rule, value, callback) {
    const { dispatch } = this.props;
    if (!value) {
      callback(
        intl.get('hzero.common.validation.notNull', {
          name: intl.get(`${prompt}.field.partnerMail`).d('合作伙伴邮箱'),
        })
      );
      return;
    }
    dispatch({
      type: 'accessToSupplierHK/getEmail',
      payload: {
        email: value.toLowerCase(),
      },
    }).then((res) => {
      if (res && res.failed === true) {
        // callback(res?.message);
        callback(intl.get(`${prompt}.form.validateFields.emailvaild`).d('您的邮箱已注册！'));
      } else {
        callback();
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator, setFieldsValue, getFieldsValue },
      tenantId,
      unitCodes,
      inviteType,
    } = this.props;
    const { currentInviteType } = this.state;
    return (
      <>
        <div className="customize-form">
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
                <Form.Item label={intl.get(`spfmhk.supplier.titile.invite.type`).d('邀请类型')}>
                  {getFieldDecorator('inviteType', {
                    // initialValue: intl.get(`${prompt}.field.mylink.supplier`).d('MyLink合作伙伴转供应商') ,
                    initialValue: '',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.titile.invite.type`).d('邀请类型'),
                        }),
                      },
                    ],
                  })(
                    <CusSelect
                      allowClear
                      options={inviteType}
                      onChange={(value) => {
                        this.setState({
                          currentInviteType: value,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.partnerName`).d('合作伙伴名称')}>
                  {getFieldDecorator('supId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.partnerName`).d('合作伙伴名称'),
                        }),
                      },
                    ],
                  })(
                    <CusLov
                      code={
                        currentInviteType === 'MYLINK' ? 'LINK.PARTNER_INVITE' : 'DICT.PARTNER_PASS'
                      }
                      lovOptions={{ displayField: 'supName', valueField: 'supId' }}
                      disabled={!currentInviteType}
                      onChange={(value, lovRecord) => {
                        setFieldsValue({
                          accountEmail: lovRecord.email,
                          email: lovRecord.email,
                          supName: lovRecord.supName,
                          dictPartnerId: lovRecord.dictPartnerId,
                        });
                        this.setState({
                          id: lovRecord.supId,
                          BRNum: lovRecord.brNumber,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={24} style={{ display: 'none' }}>
                <Form.Item>{getFieldDecorator('supName', {})(<CusInput disabled />)}</Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  required
                  label={intl.get(`${prompt}.field.partnerMail`).d('合作伙伴邮箱')}
                >
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        pattern: EMAIL,
                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                      },
                      // {
                      //   validator: this.checkEmailFuc,
                      // },
                    ],
                  })(<CusInput allowClear />)}
                </Form.Item>
              </Col>
              {/* 默认账号邮箱不显示 */}
              <Col span={24} style={{ display: 'none' }}>
                <Form.Item
                  required
                  label={intl.get(`${prompt}.field.partnerMail`).d('合作伙伴邮箱')}
                >
                  {getFieldDecorator('accountEmail')(<CusInput allowClear disabled />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.invite.description`).d('邀请说明')}>
                  {getFieldDecorator('inviteDesc')(<CusInput allowClear />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.cmhk.buyer`).d('CMHK采购员')}>
                  {getFieldDecorator('inviteUserId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.cmhk.buyer`).d('CMHK采购员'),
                        }),
                      },
                    ],
                    initialValue: getCurrentUser().id,
                  })(
                    <CusLov
                      allowClear
                      code="HKPC.APPLICATION"
                      textValue={getCurrentUser().realName}
                      lovOptions={{ displayField: 'realName', valueField: 'id' }}
                      queryParams={{
                        tenantId,
                        unitCode: unitCodes,
                      }}
                      onChange={(value, lovRecord) => {
                        setFieldsValue({
                          inviteUserName: lovRecord.realName,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={24} style={{ display: 'none' }}>
                <Form.Item label={intl.get(`${prompt}.field.cmhk.buyer`).d('CMHK采购员')}>
                  {getFieldDecorator('inviteUserName', {
                    initialValue: getCurrentUser().realName,
                  })(<CusInput disabled textValue={getCurrentUser().realName} />)}
                </Form.Item>
              </Col>
              <Col span={24} style={{ display: 'none' }}>
                <Form.Item label={intl.get(`${prompt}.field.cmhk.buyer`).d('id')}>
                  {getFieldDecorator('dictPartnerId')(<CusInput disabled />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
