/**
 * index.js - 期间新增查询
 * @date: 2023-1-26
 * @author:  <jinkai.lu@hand-china.com>
 */


import React, { Component } from 'react';
import { Input, Row, Col, Form, InputNumber } from 'antd';
import dayjs from 'dayjs';
// import intl from 'utils/intl';
// import { getDateFormat } from 'utils/utils';
// import { connect } from 'dva';
// import dayjs from 'dayjs';
// import formatterCollections from 'utils/intl/formatterCollections';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import CusLov from '_cus_components/CusLov';
import CusMultiLov from '_cus_components/CusMultiLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { mediumScreenWidth } from '_cus_utils/constants';
import { Bind } from 'lodash-decorators';
import { getLFormGridSpan } from '_cus_utils/utils';

// const FormItem = Form.Item;
const screenWidth = window.screen.width;
const tenantId = getCurrentOrganizationId();
const gridSpan = getLFormGridSpan();

export default class PurchasePlanForm extends Component {
    baseForm = React.createRef()
    constructor(props) {
        super(props)
        props?.onRef(this);
        this.state = {
            isShowMore: false,
            colSpan: 8,
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.setPageWidth);
    }

    // 监控页面实时大小
    @Bind()
    setPageWidth() {
        const widthSize = window.innerWidth;
        this.setState({
            colSpan: widthSize > mediumScreenWidth ? 8 : 12
        })
    }

    @Bind
    handleShowMore = () => {
        const { isShowMore } = this.state;
        this.setState({
            isShowMore: !isShowMore,
        });
    };

    @Bind
    handleReset = () => {
        this.baseForm.current?.resetFields();
    };
    render() {
        const { isShowMore,colSpan } = this.state;
        const { onSearch = (e) => e, idpValueMap } = this.props;

        const formItemList = [<Col {...gridSpan}>
            <Form.Item
                label={intl.get(`spfmhk.supplier.view.table.supplier.num`).d('供应商编号')}
                wrapperCol={{ span: 24 }}
                name="supplierNumber"
            >
                <Input />
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`spfmhk.supplier.view.table.company.name.en`).d('公司名称（英文）')}
                wrapperCol={{ span: 24 }}
                name="companyNameEn"
            >
                <Input />
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
        <Form.Item
            label={intl.get(`spfmhk.supplier.view.table.company.name.cn`).d('公司名称（中文）')}
            wrapperCol={{ span: 24 }}
            name="companyNameCh"
        >
            <Input />
        </Form.Item>
    </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`spfmhk.supplier.field.StartDate`).d('开始日期')}
                wrapperCol={{ span: 24 }}
                name="supplierAccessStartTime"
            >
                <CusDatePicker
                    format={getDateFormat()}
                    disabledDate={(currentDate) =>
                        dayjs.isDayjs(this.baseForm?.current?.getFieldValue('supplierAccessEndTime')) &&
                        currentDate &&
                        dayjs(currentDate).isAfter(
                            this.baseForm?.current?.getFieldValue('supplierAccessEndTime')
                        )
                    }
                />

            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`spfmhk.supplier.field.EndDate`).d('结束日期')}
                wrapperCol={{ span: 24 }}
                name="supplierAccessEndTime"
            >
                <CusDatePicker
                    format={getDateFormat()}
                    disabledDate={(currentDate) =>
                        dayjs.isDayjs(this.baseForm?.current?.getFieldValue('supplierAccessStartTime')) &&
                        currentDate &&
                        currentDate.isBefore(
                            this.baseForm?.current?.getFieldValue('supplierAccessStartTime')
                        )
                    }
                />
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`spfmhk.supplier.field.inclusion.reason`).d('入围原因')}
                wrapperCol={{ span: 24 }}
                name="reason"
            >
                <CusSelect
                    allowClear
                    popupClassName="customize-select"
                    style={{ width: '100%' }}
                    options={idpValueMap['HKSP.REASON.REGISTER']}
                />
            </Form.Item>
        </Col>,
        ]

        // 默认展示的item;
        let showItemList = [];
        // 放折叠框里的item;
        let expandFormItemList = [];
        if (colSpan === 8) {
            // width>=1000;
            if (formItemList.length > 6) {
                // 查询条件>6个时
                showItemList = formItemList.slice(0, 5);
                expandFormItemList = formItemList.slice(5);
            } else {
                showItemList = formItemList;
            }
        } else {
            // width<1000;
            if (formItemList.length > 3) {
                // 查询条件>6个时
                showItemList = formItemList.slice(0, 3);
                expandFormItemList = formItemList.slice(3);
            } else {
                showItemList = formItemList;
            }
        }
        return (
            <div className="customize-form">
                <Form ref={this.baseForm}>
                    <Row>
                        {showItemList.map(item => {
                            return item;
                        })}
                        {/* <div style={{ display: isShowMore ? 'block' : 'none' }}>


                        </div> */}
                        {expandFormItemList.length > 0 && (
                            <div style={{ display: isShowMore ? 'block' : 'none' }}>
                                {expandFormItemList.map(item => {
                                    return item;
                                })}
                            </div>
                        )}
                        <Col {...gridSpan} style={{ float: 'right' }}>
                            <CusQueryButtons
                                onQuery={onSearch}
                                onReset={() => this.handleReset()}
                                onShowMore={() => this.handleShowMore()}
                                isShowMore={isShowMore}
                                isShowMoreButton ={expandFormItemList.length > 0}
                            />
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}