/**
 * index.js - 采购实施
 * @date: 2023-9-27
 * @author:  <jinkai.lu@hand-china.com>
 */


import React, { Component } from 'react';
import { Input, Row, Col, Form, InputNumber } from 'antd';
// import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
// import { connect } from 'dva';
import dayjs from 'dayjs';
// import formatterCollections from 'utils/intl/formatterCollections';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
// import CusMultiLov from '_cus_components/CusMultiLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { mediumScreenWidth } from '_cus_utils/constants';
import { Bind } from 'lodash-decorators';
// import { getLFormGridSpan } from '@/utils/utils/common.js';
// import { getLFormGridSpan} from 'packages/srm-front-common/src/utils/utils/common.js'
import { getDFormGridSpan, getLFormGridSpan } from '_cus_utils/utils';

// const FormItem = Form.Item;
const screenWidth = window.screen.width;

const gridSpan = getLFormGridSpan();

export default class PurchaseImplementFrom extends Component {
    baseForm = React.createRef();

    constructor(props) {
        super(props)
        props?.onRef(this);
        this.state = {
            isShowMore: false
        }
    }

    @Bind()
    handleShowMore = () => {
        const { isShowMore } = this.state;
        this.setState({
            isShowMore: !isShowMore,
        });
    };

    @Bind()
    handleReset = () => {
        this.baseForm.current?.resetFields();
    };

    render() {
        const { isShowMore } = this.state;
        const { idpValueMap } = this.props;
        return (
            <div className="customize-form">
                <Form ref={this.baseForm}>
                    <Row>
                        <Col {...gridSpan}>
                            <Form.Item
                                label={intl.get(`HKPC.commom.view.title.prnumber`).d('采购申请编号')}
                                wrapperCol={{ span: 24 }}
                                name="supplierNum"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col {...gridSpan}>
                            <Form.Item
                                label={intl.get(`HKPC.commom.view.title.prname`).d('采购申请名称')}
                                wrapperCol={{ span: 24 }}
                                name="companyNameEN"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col {...gridSpan}>
                            <Form.Item
                                label={intl.get(`HKPC.commom.view.title.aapplyingdepartment`).d('申请部门')}
                                wrapperCol={{ span: 24 }}
                                name="companyNameCN"
                            >
                                {/* <Input /> */}
                                <CusLov
                                // code="SRSP.CUST_VENDOR_LOCATION"
                                // lovOptions={{ displayField: 'location', valueField: 'location' }}
                                />
                            </Form.Item>
                        </Col>
                        <div style={{ display: isShowMore ? 'block' : 'none' }}>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.datefrom`).d('申请日期从')}
                                    wrapperCol={{ span: 24 }}
                                    name="startDate"
                                >
                                    <CusDatePicker
                                        format={getDateFormat()}
                                        disabledDate={(currentDate) =>
                                            dayjs.isDayjs(this.baseForm?.current?.getFieldValue('endDate')) &&
                                            currentDate &&
                                            dayjs(currentDate).isAfter(
                                                this.baseForm?.current?.getFieldValue('endDate')
                                            )
                                        }
                                    />

                                </Form.Item>
                            </Col>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.dateto`).d('申请日期至')}
                                    wrapperCol={{ span: 24 }}
                                    name="endDate"
                                >
                                    <CusDatePicker
                                        format={getDateFormat()}
                                        disabledDate={(currentDate) =>
                                            dayjs.isDayjs(this.baseForm?.current?.getFieldValue('startDate')) &&
                                            currentDate &&
                                            dayjs(currentDate).isBefore(
                                                this.baseForm?.current?.getFieldValue('startDate')
                                            )
                                        }
                                    />
                                </Form.Item>
                            </Col>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.PEStatus`).d('采购实施状态')}
                                    wrapperCol={{ span: 24 }}
                                    name="inclusionReason"
                                >
                                    <CusSelect
                                        allowClear
                                        popupClassName="customize-select"
                                        style={{ width: '100%' }}
                                        options={idpValueMap['HKPC.PESTAUS']}
                                    />
                                </Form.Item>
                            </Col>

                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.prtype`).d('采购申请类型')}
                                    wrapperCol={{ span: 24 }}
                                    name="inclusionReason"
                                >
                                    <CusSelect
                                        allowClear
                                        popupClassName="customize-select"
                                        style={{ width: '100%' }}
                                        options={idpValueMap['HKPC.PRTYPE']}
                                    />
                                </Form.Item>
                            </Col>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.procurementhandler`).d('采购经办人')}
                                    wrapperCol={{ span: 24 }}
                                    name="inclusionReason"
                                >
                                    <CusLov
                                    // code="SRSP.CUST_VENDOR_LOCATION"
                                    // lovOptions={{ displayField: 'location', valueField: 'location' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.eettimatedbudgetamountH`).d('预算总金额(HKD)')}
                                    wrapperCol={{ span: 24 }}
                                    name="inclusionReason"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.applicant`).d('申请人')}
                                    wrapperCol={{ span: 24 }}
                                    name="inclusionReason"
                                >
                                    <CusLov
                                    // code="SRSP.CUST_VENDOR_LOCATION"
                                    // lovOptions={{ displayField: 'location', valueField: 'location' }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.PPnumber`).d('采购方案编号')}
                                    wrapperCol={{ span: 24 }}
                                    name="inclusionReason"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col {...gridSpan}>
                                <Form.Item
                                    label={intl.get(`HKPC.commom.view.title.PPname`).d('采购方案名称')}
                                    wrapperCol={{ span: 24 }}
                                    name="inclusionReason"
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </div>
                        <Col {...gridSpan} style={{ float: 'right' }}>
                            <CusQueryButtons
                                // onQuery={onSearch}
                                onReset={() => this.handleReset()}
                                onShowMore={() => this.handleShowMore()}
                                isShowMore={isShowMore}
                            />
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}