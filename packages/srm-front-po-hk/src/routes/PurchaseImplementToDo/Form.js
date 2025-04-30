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

export default class PurchaseImplementToDoFrom extends Component {
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
        return (
            <div className="customize-form">
                <Form ref={this.baseForm}>
                    <Row>
                        <Col {...gridSpan}>
                            <Form.Item
                                label={intl.get(`ssrchk.purchase.view.title.fileTitle`).d('文件标题')}
                                wrapperCol={{ span: 24 }}
                                name="supplierNum"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col {...gridSpan}>
                            <Form.Item
                                label={intl.get(`ssrchk.purchase.view.title.preprocessor`).d('前处理人')}
                                wrapperCol={{ span: 24 }}
                                name="companyNameEN"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col {...gridSpan}>
                            <Form.Item
                                label={intl.get(`ssrchk.purchase.view.title.currentState`).d('当前状态')}
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
                                    label={intl.get(`ssrchk.purchase.view.title.receiptTime`).d('收到时间')}
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