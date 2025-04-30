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
import { getDFormGridSpan } from '_cus_utils/utils';
import {
  getCurrentUser,
} from 'utils/utils';

const prompt = 'spub.interfaceErrors';
const gridSpan = getDFormGridSpan();
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
      dispatch,
      idpValueMap,
      headerInfo,
      CollaborationCaseModal,
    } = this.props;
    console.log(readyOnly, 'readyOnly');

    const { productDetailSource } = CollaborationCaseModal;
    return (
      <div className="customize-form">
        <Form ref={this.form}>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.apply.num`).d('申请单号')}
              name='applicationNo'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态')}
              name='applicationStatusMeaning'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.applicant`).d('创建人')}
              name='applicant'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.apply.date`).d('创建时间')}
              name='applicantDate'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作方式')}
              name='cooperationMode'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.sort`).d('排序')}
              name='sort'
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfmhk.mylink.field.sort`).d('排序'),
                  })
                },
                {
                  validator: (_, value) => {
                      if (!value || /^[0-9]*$/.test(value)) {
                          return Promise.resolve();
                      }
                      return Promise.reject(new Error(intl.get(`hzero.common.validation.requireNumber`).d('请只输入数字')));
                  },
              },
              ]}
            >
              <Input min={0} disabled={readyOnly} />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.effective.not`).d('是否生效')}
              name='effectiveOrNot'
              initialValue={'Effective'}
            >
              <Checkbox
                checkedValue="Effective" unCheckedValue="Ineffective" disabled={readyOnly} 
                onChange={(val) => this.form?.current?.setFieldsValue({
                  effectiveOrNot: val.target.checked
                })}
              />
            </Form.Item>
          </Col>
        </Form>
      </div>
    );
  }
}
