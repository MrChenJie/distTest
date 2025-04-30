/**
 * ContractPartnerHeader - 采购协议头信息
 * @date: 2019-05-15
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Tooltip } from 'hzero-ui';
import classnames from 'classnames';
import Switch from 'components/Switch';
import { isUndefined } from 'lodash';
// import moment from 'moment';
import warning from '@/assets/warning.svg';

import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';

const { TextArea } = Input;
// const FormItem = Form.Item;
const commonPrompt = 'spcm.purchaseContractType.model';
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * ContractPartnerHeader - 采购协议头信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ContractPartnerHeader extends Component {
  render() {
    const {
      editable,
      form = {},
      dataSource = [],
      handleCompany,
      editContractType = false,
    } = this.props;
    const { getFieldDecorator = e => e } = form;
    const {
      createByRealName,
      creationDate,
      // companyName,
      remark,
      pcTypeName,
      // companyId,
      pcTypeCode,
      pcTypeId,
      enabledFlag,
      dataFlag,
      orderQuantityFlag,
      rebateFlag,
    } = dataSource;
    return (
      <Form>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.pcTypeCode`).d('协议类型编码')}
            >
              {pcTypeId
                ? pcTypeCode
                : getFieldDecorator(`pcTypeCode`, {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.pcTypeCode`).d('协议类型编码'),
                        }),
                      },
                      {
                        max: 12,
                        message: intl.get('hzero.common.validation.max', { max: 12 }),
                      },
                      {
                        pattern: /^[A-Z\d]+$/,
                        message: intl
                          .get(`${commonPrompt}.capitalLettersOrNumbersOnly`)
                          .d('协议类型编码只能由大写字母或数字组成'),
                      },
                    ],
                    initialValue: pcTypeCode,
                  })(<Input typeCase="upper" />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.pcTypeName`).d('协议类型名称')}
            >
              {getFieldDecorator(`pcTypeName`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.pcTypeName`).d('协议类型名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
                initialValue: pcTypeName,
              })(<Input disabled={editContractType} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.company.tag`).d('公司')}
            >
              {pcTypeId ? (
                <div>
                  <span>
                    <a disabled={!enabledFlag} onClick={() => handleCompany()}>
                      {intl.get(`spcm.common.view.title.distributionCompany`).d('分配公司')}
                    </a>
                  </span>
                  {dataFlag ? null : (
                    <span style={{ marginLeft: 4 }}>
                      <Tooltip title="您尚未未分配任何公司">
                        <img src={warning} alt="img" />
                      </Tooltip>
                    </span>
                  )}
                </div>
              ) : (
                <Tooltip title="您尚未未分配任何公司">
                  <img src={warning} alt="img" />
                </Tooltip>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`entity.roles.creator`).d('创建人')}
            >
              {createByRealName}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get('hzero.common.date.creation').d('创建日期')}
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {creationDate}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.orderQuantityFlag`).d('控制下单数量')}
            >
              {getFieldDecorator('orderQuantityFlag', {
                initialValue: orderQuantityFlag || 0,
              })(<Switch disabled={editContractType} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.rebateFlag`).d('是否返利')}
            >
              {getFieldDecorator('rebateFlag', {
                initialValue: rebateFlag,
              })(<Switch disabled={editContractType} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              {...formItemLayout}
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`${commonPrompt}.enabledFlag`).d('启用')}
            >
              {getFieldDecorator('enabledFlag', {
                initialValue: isUndefined(enabledFlag) ? 1 : enabledFlag,
              })(<Switch />)}
            </Form.Item>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames('last-form-item', editable ? 'half-row' : 'read-half-row')}
        >
          <Col {...FORM_COL_2_LAYOUT}>
            <Form.Item label={intl.get(`hzero.common.remark`).d('备注')} {...formItemLayout}>
              {editable
                ? getFieldDecorator('remark', {
                    initialValue: remark,
                    rules: [
                      {
                        max: 480,
                        message: intl.get('hzero.common.validation.max', { max: 480 }),
                      },
                    ],
                  })(<TextArea rows={2} disabled={editContractType} />)
                : remark}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
