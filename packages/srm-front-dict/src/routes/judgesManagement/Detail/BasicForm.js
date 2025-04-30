/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 09:47:05
 * Copyright (c) 2024, All Rights Reserved.
 */
import React from 'react';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import { getDFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';

const gridSpan = getDFormGridSpan();
const tenantId = getCurrentOrganizationId();

@Form.create()
export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      form,
      readOnly = false,
      idpValueMap,
      headerInfo,
      handleDep,
    } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className="customize-form">
        {/* <Form>
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}> */}
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.applicationno`).d('申请单号')}>
            {getFieldDecorator('applyNum', {
              initialValue: headerInfo?.applyNum,
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态')}>
            {getFieldDecorator('applyStatus', {
              initialValue: headerInfo?.applyStatus ? headerInfo?.applyStatus : 'PENDING_REFER',
            })(<CusSelect options={idpValueMap['DICT.JUDGE_APPLY_STATUS']} disabled/>)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.judge.scoredepartment`).d('评分部门')}>
            {getFieldDecorator('unitCode', {
              initialValue: headerInfo?.unitCode ? headerInfo?.unitCode : headerInfo?.unitName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfmhk.dict.view.field.judge.scoredepartment`).d('评分部门'),
                  }),
                },
              ],
            })(<CusLov
              code="DICT.JUDGE_DEPART"
              queryParams={{ tenantId: tenantId }}
              textValue={headerInfo?.unitName}
              disabled={readOnly}
              onChange={(_, item) => {
                console.log("item",item,form,readOnly)
                handleDep({
                  ...item
                })
              }}
            />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.judge.scoregroupname`).d('评分组名')}>
            {getFieldDecorator('judgeGroupName', {
              initialValue: headerInfo?.judgeGroupName,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfmhk.dict.view.field.judge.scoregroupname`).d('评分组名'),
                  }),
                },
              ],
            })(<Input disabled/>)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.judge.scoregroupdescription`).d('评分组描述')}>
            {getFieldDecorator('groupDescribe', {
              initialValue: headerInfo?.groupDescribe,
            })(<Input disabled={readOnly}/>)}
          </Form.Item>
        </Col>
      </div>
    );
  }
}
