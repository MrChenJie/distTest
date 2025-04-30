/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 09:47:05
 * Copyright (c) 2024, All Rights Reserved.
 */
import React from 'react';
import { Row, Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import CusInput from '_cus_components/CusInput';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import { getDFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  getCurrentUser,
} from 'utils/utils';
import { getEditTableData } from 'hzero-front/lib/utils/utils';

const prompt = 'spub.interfaceErrors';
const gridSpan = getDFormGridSpan();
const { realName, loginName } = getCurrentUser();
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
      dispatch,
      idpValueMap,
      headerInfo,
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
              initialValue: headerInfo?.applyStatus ? headerInfo?.applyStatus : 'DRAFT',
            })(<CusSelect options={idpValueMap['DICT.BLACK_APPLY_STATUS']} disabled/>)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.appliactiontype`).d('申请类型')}>
            {getFieldDecorator('applyType', {
              initialValue: headerInfo?.applyType ? headerInfo?.applyType : 'PARTNER_STATUS_CHANGE',
            })(<CusSelect options={idpValueMap['DICT.BLACK_APPLY_TYPE']} disabled/>)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get('spfmhk.dict.view.field.partner.code').d('合作伙伴编号')}>
            {getFieldDecorator('partnerNum', {
              initialValue: headerInfo?.partnerNum,
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.companynameen`).d('公司名称（英文）')}>
            {getFieldDecorator('cmpanyNameEn', {
              initialValue: headerInfo?.cmpanyNameEn,
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.companynamecn`).d('公司名称（中文）')}>
            {getFieldDecorator('cmpanyNameCh', {
              initialValue: headerInfo?.cmpanyNameCh,
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.applicant`).d('创建人')}>
            {getFieldDecorator('creator', {
              initialValue: headerInfo?.creator ? headerInfo?.creator : realName,
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.applicantion.date`).d('申请日期')}>
            {getFieldDecorator('applyDate', {
              initialValue: headerInfo?.applyDate
              ? dayjs(headerInfo?.applyDate).format(DEFAULT_DATE_FORMAT)
              : dayjs().format(DEFAULT_DATE_FORMAT),
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.partnerInfoUpdate.changeType`).d('变更类型')}>
            {getFieldDecorator('changeType', {
              initialValue: headerInfo?.changeType ? headerInfo?.changeType : 'PASS_TO_BLACK',
            })(<CusSelect options={idpValueMap['DICT.BLACK_CHANGE_TYPE']} disabled/>)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.changemethod`).d('变更方式')}>
            {getFieldDecorator('changeMode', {
               initialValue: headerInfo?.changeMode ? headerInfo?.changeMode : 'HAND',
              })(<CusSelect options={idpValueMap['DICT.BLACK_CHANGE_MODE']} disabled/>)}
          </Form.Item>
        </Col>

        {/* </GenerateFormGrid>
          </Form> */}
      </div>
    );
  }
}
