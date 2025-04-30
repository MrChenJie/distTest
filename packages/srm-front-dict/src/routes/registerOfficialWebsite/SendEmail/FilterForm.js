/**
 * @Description: 基本信息
 * @date 2025-03-04
 * @author <shuming。xu@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2025, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import intl from 'utils/intl';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';

const FormItem = Form.Item;
const prompt = 'spfmhk.dict';

@Form.create()
export default class FilterForm extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        const {
            form: { getFieldDecorator },
            emailStatus,
            enumMap,
            formData,
            reviewData,
            onChangeEmailTemplate = (e) => e,
            onChangeSendReason = (e) => e,
        } = this.props;
        const { emailCode = [] } = enumMap;
        const gridSpan = getDFormGridSpan();
        return (
            <Form className="customize-form">
                <Col {...gridSpan}>
                    <FormItem label={intl.get(`${prompt}.view.common.partnername`).d('合作伙伴名称')}>
                    {getFieldDecorator('cmpanyName', {
                        initialValue: formData.cmpanyName || reviewData.cmpanyName,
                    })(<CusInput disabled />)}
                    </FormItem>
                </Col>
                <Col {...gridSpan}>
                    <FormItem label={intl.get(`${prompt}.view.back.emailtemplate`).d('邮件模板')}>
                    {getFieldDecorator('emailTemplate', {
                        initialValue: formData.emailTemplate || reviewData.emailTemplate,
                        rules: [
                            {
                                required: true,
                                message: intl.get('hzero.common.validation.notNull', {
                                    name: intl.get(`${prompt}.view.back.emailtemplate`).d('邮件模板'),
                                }),
                            },
                        ],
                    })(
                        <CusSelect options={emailCode} onChange={(val) => { onChangeEmailTemplate(val) }} disabled={!emailStatus} />
                    )}
                    </FormItem>
                </Col>
                <Col {...gridSpan}>
                    <FormItem label={intl.get(`${prompt}.view.back.reasonofsendemail`).d('发送邮件原因')}>
                    {getFieldDecorator('sendReason', {
                        initialValue: formData.sendReason || reviewData.sendReason,
                    })(
                        <CusInput onChange={(val) => { onChangeSendReason(val) }} disabled={!emailStatus} />)}
                    </FormItem>
                </Col>
            </Form>
        );
    }
}