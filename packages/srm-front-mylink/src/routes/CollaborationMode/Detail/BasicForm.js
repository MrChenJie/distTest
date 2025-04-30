/*
 * @Author: 陆海涛 haitao.lu02@hand-china.com
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved.
 */
import React from 'react';
import { Col, Input, Form, InputNumber } from 'antd';
import { Checkbox } from 'hzero-ui';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import CusSelect from '_cus_components/CusSelect';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentUser } from 'utils/utils';

const gridSpan = getLFormGridSpan();
const { realName, loginName } = getCurrentUser();

export default class BasicForm extends React.PureComponent {
  form = React.createRef();

  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      readyOnly = false,
      headerInfo,
      CollaborationModeModal,
      getEffectiveOrNot = (e) => e,
      getEcommerceServiceOrNot = (e) => e,
      itemKey,
    } = this.props;
    console.log(readyOnly, 'readyOnly');
    const { productDetailSource } = CollaborationModeModal;
    return (
      <div className="customize-form">
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.apply.num`).d('申请单号')}
            name="applicationNo"
          >
            <Input value={headerInfo?.partnerMode?.applicantDate} disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态')}
            name="applicationStatus"
          >
            <Input value={headerInfo?.partnerMode?.applicationStatus} disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.mylink.field.applicant`).d('创建人')} name="applicant">
            <Input value={headerInfo?.partnerMode?.applicantDate} disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.apply.date`).d('创建时间')}
            name="applicantDate"
          >
            <Input value={headerInfo?.partnerMode?.applicantDate} disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作方式')}
            name="cooperationMode"
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`spfmhk.mylink.field.cooperate.mode.`).d('合作方式'),
                }),
              },
            ]}
          >
            <Input disabled={readyOnly} />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.sort`).d('排序')}
            name="sort"
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`spfmhk.mylink.field.sort`).d('排序'),
                }),
              },
              {
                validator: (_, value) => {
                  if (!value || /^[0-9]*$/.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(intl.get(`hzero.common.validation.requireNumber`).d('请只输入数字'))
                  );
                },
              },
            ]}
          >
            <Input min={0} disabled={itemKey != 0 || readyOnly} />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.effective.not`).d('是否生效')}
            name="effectiveOrNot"
            initialValue={'Effective'}
          >
            <Checkbox
              checkedValue="Effective"
              unCheckedValue="Ineffective"
              disabled={itemKey != 0 || readyOnly}
              onChange={(val) => getEffectiveOrNot(val.target.checked)}
            />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.color`).d('颜色')}
            name="modeRgb"
            rules={[
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`spfmhk.mylink.field.color`).d('yans'),
                }),
              },
            ]}
          >
            <Input
              disabled={itemKey != 0 || readyOnly}
              placeholder={intl
                .get(`spfmhk.mylink.field.tips.color`)
                .d('请填写#开头的六位颜色编码')}
            />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.mylink.field.Service.not`).d('是否电商服务')}
            name="ecommerceServiceOrNot"
            initialValue={'N'}
          >
            <Checkbox
              checkedValue="Y"
              unCheckedValue="N"
              disabled={itemKey != 0 || readyOnly}
              onChange={(val) => getEcommerceServiceOrNot(val.target.checked)}
            />
          </Form.Item>
        </Col>
        <div style={{ display: 'none' }}>
          <Col>
            <Form.Item name="cooperationModeList">
              <Checkbox checkedValue="Effective" unCheckedValue="Ineffective" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.effective.not`).d('是否生效')}
              name="descriptionList"
              initialValue={'Effective'}
            >
              <Checkbox checkedValue="Effective" unCheckedValue="Ineffective" />
            </Form.Item>
          </Col>
        </div>
      </div>
    );
  }
}
