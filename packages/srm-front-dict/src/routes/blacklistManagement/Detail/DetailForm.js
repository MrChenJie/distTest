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
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusUpload from '_cus_components/CusUpload';
import { getDFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATETIME_FORMAT , DEFAULT_DATE_FORMAT} from 'utils/constants';
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
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.involveevent`).d('涉及事件')}>
            {getFieldDecorator('involeCase', {
              initialValue: headerInfo?.involeCase,
            })(<Input disabled={readOnly}/>)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.happenperiod`).d('具体发生期间')}>
            {getFieldDecorator('involeCaseDate', {
              initialValue: headerInfo?.involeCaseDate,
            })(<Input disabled={readOnly} />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.disabledatefrom`).d('禁用日期起')}>
            {getFieldDecorator('forbidDateStart', {
              initialValue: headerInfo?.forbidDateStart && dayjs(headerInfo?.forbidDateStart).format(DEFAULT_DATE_FORMAT),
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.disabledateto`).d('禁用日期至')}>
            {getFieldDecorator('forbidDateTo', {
              initialValue: headerInfo?.forbidDateTo && dayjs(headerInfo?.forbidDateTo).format(DEFAULT_DATE_FORMAT),
            })(<Input disabled />)}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.resaonforblacklist`).d('拉黑原因')}>
            {getFieldDecorator('blackReason', {
              initialValue: headerInfo?.blackReason,
              rules: [
                {
                  required: true,
                  message: intl.get(`hzero.common.validation.notNull`, {
                    name: intl.get(`spfmhk.dict.view.balcklist.resaonforblacklist`).d('拉黑原因'),
                  }),
                },
              ],
            })(
              <CusInput.TextArea
                rows={3}
                autoSize={{ minRows: 3, maxRows: 3 }}
                maxLength={700}
                showCharacter
                disabled={readOnly}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.remarks`).d('备注')}>
            {getFieldDecorator('remark', {
              initialValue: headerInfo?.remark,
            })(
              <CusInput.TextArea
                rows={3}
                autoSize={{ minRows: 3, maxRows: 3 }}
                maxLength={700}
                showCharacter
                disabled={readOnly}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={intl.get(`spfmhk.dict.view.balcklist.attachments`).d('附件')}>
            {getFieldDecorator('uuid', {
              initialValue: headerInfo?.uuid,
            })(
              <CusUpload
                filePreview
                bucketName="dict"
                tenantId={tenantId}
                attachmentUUID={headerInfo?.uuid}
                viewOnly={readOnly}
                isEncrypt
              />
            )}
          </Form.Item>
        </Col>

        {/* </GenerateFormGrid>
          </Form> */}
      </div>
    );
  }
}
