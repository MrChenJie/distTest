/**
 * 合作伙伴信息更新 - 基本信息
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/11/1
 * @Copyright: Copyright (c), 2024, hand
 */
import React from 'react';
import { Row, Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusSelect from '_cus_components/CusSelect';
import formatterCollections from 'utils/intl/formatterCollections';
import dayjs from 'dayjs';
import { getCurrentLanguage } from 'utils/utils';

const prompt = 'spfmhk.dict';
const language = getCurrentLanguage();

@formatterCollections({ code: [prompt] })
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
      editType,
      isSupplier,
      optionList,
    } = this.props;
    const { getFieldDecorator } = form;
    const options = optionList.map(item => {
      return {
        ...item,
        meaning: language === 'zh_CN' ? item.modeType : item.modeTypeEn,
        value: item.modeNoticeId,
      };
    });

    return (
      <div className="customize-form">
        <Form>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.applicationno`).d('申请单号')}>
                {getFieldDecorator('applyNum', {
                  initialValue: headerInfo?.applyNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.partnerInfoUpdate.changeType`).d('变更类型')}>
                {getFieldDecorator('editType', {
                  initialValue: headerInfo?.editType || editType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.dict.view.field.partnerInfoUpdate.changeType`).d('变更类型'),
                      }),
                    },
                  ],
                })(<CusSelect disabled options={idpValueMap['DICT.EDIT_TYPE']} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.applicantion.date`).d('申请日期')}>
                {getFieldDecorator('creationDate', {
                  initialValue: headerInfo?.creationDate && headerInfo?.editRecordId ? dayjs(headerInfo?.creationDate).format('YYYY-MM-DD') : undefined,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.partnerInfoUpdate.changeReason`).d('变更原因')}>
                {getFieldDecorator('editReason', {
                  initialValue: headerInfo?.editReason,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.dict.view.field.partnerInfoUpdate.changeReason`).d('变更原因'),
                      }),
                    },
                  ],
                })(<Input disabled={readOnly} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.companynameen`).d('公司名称（英文）')}>
                {getFieldDecorator('cmpanyNameEn', {
                  initialValue: headerInfo?.cmpanyNameEn,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.companynamecn`).d('公司名称（中文）')}>
                {getFieldDecorator('cmpanyNameCh', {
                  initialValue: headerInfo?.cmpanyNameCh,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式')}>
                {getFieldDecorator('modeNoticeId', {
                  initialValue: headerInfo?.modeNoticeId ? headerInfo?.modeNoticeId.split(',').map(Number) : [],
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.dict.view.field.cooperationmode`).d('变更原因'),
                      }),
                    },
                  ],
                })(<CusSelect mode="multiple"
                              disabled={readOnly || isSupplier || editType === 'FINANCE'}
                              options={options}
                />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.partner.code`).d('合作伙伴编号')}>
                {getFieldDecorator('partnerNum', {
                  initialValue: headerInfo?.partnerNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态')}>
                {getFieldDecorator('applyStatus', {
                  initialValue: headerInfo?.editApplyStatus ? headerInfo?.editApplyStatus : 'PENDING_REFER',
                })(<CusSelect options={idpValueMap['DICT.PARTNER_EDIT_APPLY_STATUS']} disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.supplier.code`).d('供应商编号')}>
                {getFieldDecorator('supplierNumber', {
                  initialValue: headerInfo?.supplierNumber,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
