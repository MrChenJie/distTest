/**
 * @Description: 邮件预览
 * @date 2025-03-04
 * @author <shuming。xu@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2025, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { getDateTimeFormat } from 'utils/utils';
import { EMAIL } from 'utils/regExp';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import StaticTextEditor from './StaticTextEditor';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import './index.less';

const FormItem = Form.Item;
const prompt = 'spfmhk.dict';

@Form.create()
export default class EmailReview extends Component {
    constructor(props) {
        super(props);
        this.staticTextEditor = React.createRef();
        this.state = {
            emailList: false, // 邮件历史弹框
            reviewMailBox: false, // 邮件预览弹框
        }
    }

    // 打开邮件记录页面
    openHistoryEmail = () => {
        const { getHistoryMail = (e) => e } = this.props;
        this.setState({ emailList: true });
        // 获取历史记录数据
        getHistoryMail();
    }

    // 邮件预览-打开预览弹框
    reviewMail = (record) => {
        const { getReviewMail = (e) => e } = this.props;
        this.setState({ reviewMailBox: true });
        // 查询预览弹框内容
        getReviewMail(record);
    }

    render() {
        const {
            form: { getFieldDecorator, setFieldValue },
            emailStatus,
            onEditEmail = (e) => e,
            getHistoryMail = (e) => e,
            emailDataSource,
            emailDataPagination,
            formData,
            reviewData,
        } = this.props;
        const { emailList, reviewMailBox } = this.state;
        const columns = [
            {
                title: intl.get(`${prompt}.view.back.emailproject`).d('邮件主题'),
                width: 180,
                dataIndex: 'emailSubjuct',
                render: tooltipRender,
            },
            {
                title: intl.get(`${prompt}.view.field.historicalemailsendtime`).d('邮件发送时间'),
                width: 180,
                dataIndex: 'refuseDate',
                render: tooltipRender,
            },
            {
                title: intl.get(`${prompt}.view.field.historicalemailsender`).d('发件人'),
                width: 200,
                dataIndex: 'senderName',
                render: tooltipRender,
            },
            {
                title: intl.get(`${prompt}.view.field.operate`).d('操作'),
                width: 120,
                render: (_, record) => {
                    return (
                       <CusButton type='plain' onClick={() => {
                        this.reviewMail(record)
                       }}>{intl.get(`${prompt}.view.back.emailpreview`).d('邮件预览')}</CusButton> 
                    )
                },
            }
        ]
        return (
            <>
                <Form className="customize-form">
                    <Row gutter={24}>
                        <Col span={13}>
                            <FormItem label={intl.get(`${prompt}.view.back.sendemailtime`).d('最近发送时间')}>
                            {getFieldDecorator('refuseDate', {
                                initialValue: formData?.refuseDate ? dayjs(formData?.refuseDate, getDateTimeFormat()) : undefined,
                            })(
                                <CusDatePicker style={{ width: '92.8%' }} disabled format={getDateTimeFormat()} />
                            )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={13}>
                            <FormItem label={intl.get(`${prompt}.view.back.emailproject`).d('邮件主题')}>
                            {getFieldDecorator('emailSubjuct', {
                                initialValue: formData?.emailSubjuct,
                                rules: [
                                    {
                                        required: true,
                                        message: intl.get('hzero.common.validation.notNull', {
                                            name: intl.get(`${prompt}.view.back.emailproject`).d('邮件主题'),
                                        }),
                                    },
                                ],
                            })(
                                <CusInput
                                    style={{ width: '92.8%' }}
                                    disabled={!emailStatus}
                                />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={13}>
                            <FormItem label={intl.get(`${prompt}.view.back.emailsendtosb`).d('发送至')}>
                            {getFieldDecorator('sendTo', {
                                initialValue: formData?.sendTo,
                                rules: [
                                    {
                                        required: true,
                                        message: intl.get('hzero.common.validation.notNull', {
                                            name: intl.get(`${prompt}.view.back.emailsendtosb`).d('发送至'),
                                        }),
                                    },
                                    {
                                        pattern: EMAIL,
                                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                                    },
                                ],
                            })(
                                <CusInput style={{ width: '92.8%' }} disabled={!emailStatus} />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={13}>
                            <FormItem label={intl.get(`${prompt}.view.back.emailcctosb`).d('抄送至')}>
                            {getFieldDecorator('ccTo', {
                                initialValue: formData?.ccTo,
                                rules: [
                                    {
                                        pattern: EMAIL,
                                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                                    },
                                ],
                            })(
                                <CusInput
                                    style={{ width: '92.8%' }}
                                    disabled={!emailStatus}
                                />)}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={13}>
                            <FormItem label={intl.get(`${prompt}.view.field.historicalemail`).d('历史邮件')}>
                            {getFieldDecorator('historicalMail', {
                                initialValue: intl.get(`${prompt}.view.field.historicalemailrecord`).d('历史邮件记录'),
                            })(
                                <div style={{ height: '32px', width: '92.8%' }}>
                                    <CusInput disabled style={{ cursor: 'pointer' }} />
                                    <a
                                        onClick={this.openHistoryEmail}
                                        style={{ position: 'relative', top: '-17px', left: '9px' }}
                                    >
                                        {intl.get(`${prompt}.view.field.historicalemailrecord`).d('历史邮件记录')}
                                    </a>
                                    {/* <span style={{ position: 'relative', top: '-32px', left: '9px' }}/>} */}
                                </div>
                            )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={24} style={{ paddingLeft: '36px' }}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('emailContent', {
                                    initialValue: formData.emailContent,
                                })(
                                    !emailStatus ?
                                        <StaticTextEditor
                                            key='email1'
                                            content={formData.emailContent || ''}
                                            isDisabled={true}
                                            onRef={staticTextEditor => {
                                                this.staticTextEditor = staticTextEditor;
                                            }}
                                            onEditChange={(val) => { onEditEmail(val) }}
                                        />
                                        :
                                        <StaticTextEditor
                                            key='email2'
                                            content={formData.emailContent || ''}
                                            onRef={staticTextEditor => {
                                            this.staticTextEditor = staticTextEditor;
                                            }}
                                            onEditChange={(val) => { onEditEmail(val) }}
                                        />
                                    
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
                <CusModal
                    title={intl.get(`${prompt}.view.field.historicalemailrecord`).d('历史邮件记录')}
                    visible={emailList}
                    destroyOnClose
                    width='50%'
                    onCancel={() => {
                        this.setState({ emailList: false });
                    }}
                    footer={
                        <CusButton onClick={() => this.setState({ emailList: false })} >
                            {intl.get('hzero.common.button.close').d('关闭')}
                        </CusButton>
                    }
                >
                    <CusTable
                        columns={columns}
                        dataSource={emailDataSource}
                        pagination={emailDataPagination}
                        rowKey="emailId"
                        onChange={(page) => { getHistoryMail(page) }}
                    /> 
                </CusModal>
                <CusModal
                    title={intl.get(`${prompt}.view.field.historicalemailcontent`).d('内容')}
                    visible={reviewMailBox}
                    destroyOnClose
                    width='50%'
                    onCancel={() => {
                        this.setState({ reviewMailBox: false });
                    }}
                    footer={
                        <CusButton onClick={() => this.setState({ reviewMailBox: false })} >
                            {intl.get('hzero.common.button.close').d('关闭')}
                        </CusButton>
                    }
                >
                    <Form className="customize-form">
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem label={intl.get(`${prompt}.view.back.emailproject`).d('邮件主题')}>
                                {getFieldDecorator('reviewEmailSubjuct', {
                                    initialValue: reviewData.emailSubjuct
                                })(
                                    <CusInput disabled />
                                )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem label={intl.get(`${prompt}.view.back.emailsendtosb`).d('发送至')}>
                                {getFieldDecorator('reviewSendTo', {
                                    initialValue: reviewData.sendTo
                                })(
                                    <CusInput disabled />
                                )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem label={intl.get(`${prompt}.view.back.emailcctosb`).d('抄送至')}>
                                {getFieldDecorator('reviewCcTo', {
                                    initialValue: reviewData.ccTo
                                })(
                                    <CusInput disabled />
                                )}
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                    <div className='contentDiv'>
                        <span dangerouslySetInnerHTML={{ __html: reviewData.emailContent }} />
                    </div>
                </CusModal>
            </>
        );
    }
}