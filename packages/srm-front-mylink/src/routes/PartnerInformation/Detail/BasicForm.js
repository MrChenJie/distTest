/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Input, Checkbox } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import CusSelect from '_cus_components/CusSelect';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusInfoItem from '_cus_components/CusInfoItem';
import {
  getCurrentUser,
} from 'utils/utils';
import { dateTimeRender, dateRender } from 'utils/renderer';

const gridSpan = getDFormGridSpan();
const { realName, loginName } = getCurrentUser();
@Form.create({ fieldNameProp: null })

export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      readyOnly = false,
      dispatch,
      idpValueMap,
      headerInfo,
      PartnerInformationModal,
    } = this.props;

    const { partnerBase } = PartnerInformationModal;

    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.apply.num`).d('申请单号')}
                value={partnerBase?.applyNum}
              />
            </Col>
            <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`spfmhk.mylink.field.changetype`).d('更新类型')}
              >
                {this.props.form.getFieldDecorator('businessCategory', {
                  initialValue: 'XXGX',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.changetype`).d('商盟伙伴类别'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    disabled
                    options={idpValueMap['LINK_UPDATE_TYPE']}
                  />
                )}
              </Form.Item>
              {/* <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.initia`).d('更新类型')}
                value={partnerBase?.editTypeMeaning || partnerBase?.editType}
              /> */}
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态')}
              >
                {this.props.form.getFieldDecorator('applyStatus', {
                  initialValue: partnerBase?.applyStatus,
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    disabled
                    options={idpValueMap['HKSM.APPLICATION.STATUS']}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.application.date`).d('申请日期')}
                value={dateRender(partnerBase?.creationDate)}
              />
            </Col>
            
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.title.user`).d('业务员')}
                value={partnerBase?.saleManName}
              />
            </Col>
            <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`spfmhk.mylink.field.parnercate`).d('更新类型')}
              >
                {this.props.form.getFieldDecorator('partnerCategory', {
                  initialValue: 'MYLINK',
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    disabled
                    options={idpValueMap['LINK.PARTNER_CATEGORY']}
                  />
                )}
              </Form.Item>
              {/* <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.parnercate`).d('合作伙伴类别')}
                value={partnerBase?.partnerCategoryMeaning || partnerBase?.partnerCategory}
              /> */}
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
