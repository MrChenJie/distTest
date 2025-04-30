/*
 * PurchaseContractTypeHeader - 协议类型管理头信息
 * @date: 2019-05-24
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import DisplayFormItem from '../../components/DisplayFormItem';

const FormItem = Form.Item;
const commonPrompt = 'spcm.purchaseRequisitionCreation.model';

/**
 * PurchaseContractTypeHeader - 协议类型管理头信息

 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['spcm.purchaseRequisitionCreation'],
})
export default class PurchaseContractTypeHeader extends Component {
  render() {
    const { editable, form = {}, dataSource = {} } = this.props;
    // const { kinds = [] } = detailEnumMap;
    const { getFieldDecorator = e => e } = form;
    const { amount, pcNum, creationDate, companyName, companyId } = dataSource;
    return (
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.pcTypeCode`).d('协议类型编码')}
              value={pcNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.pcTypeName`).d('协议类型名称')}
              value={pcNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {editable
                ? getFieldDecorator('companyId', {
                    initialValue: companyId,
                    rules: [
                      {
                        required: editable,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.company.tag`).d('公司'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      textValue={companyName}
                      queryParams={{ enabledFlag: 1 }}
                    />
                  )
                : companyName}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem label={intl.get(`entity.roles.creator`).d('创建人')} value={amount} />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`hzero.common.date.creationDate`).d('创建日期')}
              value={creationDate}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
