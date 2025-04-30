/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 09:47:05
 * Copyright (c) 2024, All Rights Reserved.
 */
import React from 'react';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import CusSelect from '_cus_components/CusSelect';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getDFormGridSpan } from '_cus_utils/utils';
import { getCurrentUser, } from 'utils/utils';

const prompt = 'spub.interfaceErrors';
const gridSpan = getDFormGridSpan();
const { realName, loginName } = getCurrentUser();

@Form.create()
export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      form,
      readyOnly = false,
      reasonReadOnly = false,
      idpValueMap,
      headerInfo,
      itemKey,
      setLapse,
    } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className="customize-form">
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
            })(<CusSelect options={idpValueMap['DICT.COOPERATE_APPLY_STATUS']} disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.applicant`).d('创建人')}>
            {getFieldDecorator('createUserName', {
              initialValue: headerInfo?.createUserName ? headerInfo?.createUserName : realName,
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.creationdate`).d('创建时间')}>
            {getFieldDecorator('creationDate', {
              initialValue: headerInfo?.creationDate
                ? dayjs(headerInfo?.creationDate).format(DEFAULT_DATE_FORMAT)
                : dayjs().format(DEFAULT_DATE_FORMAT),
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          {itemKey == 0 ? (
            <Form.Item label={intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式')}>
              {getFieldDecorator('modeTypeChSimple', {
                initialValue: headerInfo?.modeTypeChSimple,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式'),
                    }),
                  },
                ],
              })(<Input disabled={readyOnly} />)}
            </Form.Item>
          ) : itemKey == 1 ? (
            <Form.Item label={intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式')}>
              {getFieldDecorator('modeTypeChTrad', {
                initialValue: headerInfo?.modeTypeChTrad,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式'),
                    }),
                  },
                ],
              })(<Input disabled={readyOnly} />)}
            </Form.Item>
          ) : (
            <Form.Item label={intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式')}>
              {getFieldDecorator('modeTypeEn', {
                initialValue: headerInfo?.modeTypeEn,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.cooperationmode`).d('合作模式'),
                    }),
                  },
                ],
              })(<Input disabled={readyOnly} />)}
            </Form.Item>
          )}
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.field.serisno`).d('排序')}>
            {getFieldDecorator('modeOrder', {
              initialValue: headerInfo?.modeOrder,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spfmhk.dict.view.field.serisno`).d('排序'),
                  }),
                },
              ],
            })(<Input disabled={readyOnly} />)}
          </Form.Item>
        </Col>

        {(setLapse || headerInfo.applyExpireNum) && (
          <>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.ineffectiveno`).d('失效单号')}>
                {getFieldDecorator('applyExpireNum', {
                  initialValue: headerInfo?.applyExpireNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.dict.view.field.ineffectivereason`).d('失效原因')}>
                {getFieldDecorator('applyExpireReason', {
                  initialValue: headerInfo?.applyExpireReason,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.dict.view.field.ineffectivereason`).d('失效原因'),
                      }),
                    },
                  ],
                })(<Input disabled={readyOnly && reasonReadOnly} />)}
              </Form.Item>
            </Col>
          </>
        )}
      </div>
    );
  }
}
