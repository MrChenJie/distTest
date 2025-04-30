/**
 * index.js - 简易询价Form
 * @date: 2023-10-09
 * @author:  <jinkai.lu@hand-china.com>
 */


import React, { Component } from 'react';
import { Input, Row, Col, Form, InputNumber } from 'antd';
// import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { connect } from 'dva';
import dayjs from 'dayjs';
import formatterCollections from 'utils/intl/formatterCollections';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusMultiLov from '_cus_components/CusMultiLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { mediumScreenWidth } from '_cus_utils/constants';
import { Bind } from 'lodash-decorators';
import { getLFormGridSpan, } from '_cus_utils/utils';
// const FormItem = Form.Item;
const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();

const promptCode = 'HKPC.commom';
@formatterCollections({ code: [promptCode] })
export default class SimpleInquireForm extends Component {
    constructor(props) {
        super(props)
        props?.onRef(this);
        this.state = {
            isShowMore: false,
            colSpan: 8,
        }
    }

    form = React.createRef();

    componentDidMount() {
        window.addEventListener('resize', this.setPageWidth);
    }

    // 查询条件展开/收起
    @Bind()
    handleShowMore = () => {
        const { isShowMore } = this.state;
        this.setState({
            isShowMore: !isShowMore,
        });
    };


    /**
     * onReset - 重置按钮事件
     */
    @Bind()
    handleReset = () => {
        this.form.current?.resetFields();
    };

    @Bind()
    setPageWidth() {
        const widthSize = window.innerWidth;
        this.setState({
            colSpan: widthSize > mediumScreenWidth ? 8 : 12
        })
    }


    render() {
        const {
            idpValueMap,
            onSearch = (e) => e,
        } = this.props;
        const { isShowMore, colSpan } = this.state;
        const { getFieldValue } = this.form.current || {};

        // 总共的itemlist
        const formItemList = [
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.RQnumber`).d('询价单号')}
                    wrapperCol={{ span: 24 }}
                    name="rqNumber"
                >
                    <Input placeholder={intl.get(`${promptCode}.view.title.inputRQnumber`).d('请输入询价单号')} />
                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.RQname`).d('询价单名称')}
                    wrapperCol={{ span: 24 }}
                    name="rqName"
                >
                    <Input placeholder={intl.get(`${promptCode}.view.title.inputRQname`).d('请输入询价单名称')} />
                </Form.Item>
            </Col>,
            // <Col span={colSpan}>
            //     <Form.Item
            //         label={intl.get(`${promptCode}.view.title.RQstatus`).d('询价单状态')}
            //         wrapperCol={{ span: 24 }}
            //         name="rqStatus"
            //     >
            //         <CusSelect
            //             lovCode="HKPC.PRRECORDSSTATUS"
            //             allowClear
            //             popupClassName="customize-select"
            //             style={{ width: '100%' }}
            //             placeholder={intl.get(`${promptCode}.view.title.inputRQstatus`).d('请选择询价单状态')}
            //         />
            //     </Form.Item>
            // </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}
                    wrapperCol={{ span: 24 }}
                    name="prNumber"
                >
                    <Input placeholder={intl.get(`${promptCode}.view.title.inputPRnumber`).d('请输入采购申请编号')} />
                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
                    wrapperCol={{ span: 24 }}
                    name="prName"
                >
                    <Input placeholder={intl.get(`${promptCode}.view.title.inputPRname`).d('请输入采购申请名称')} />
                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.eettimatedbudgetamountH`).d('预算总金额（HKD）')}
                    wrapperCol={{ span: 24 }}
                    name="estimatedBudgetAmountHkd"
                >
                    <Input placeholder={intl.get(`${promptCode}.view.title.inputEstimatedBudgetAmount(HKD)`).d('请输入预估总金额（HKD）')} />
                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门')}
                    wrapperCol={{ span: 24 }}
                    name="applyingDepartmentId"
                >
                    <CusLov
                        code="HKPC.APPLICATIONDEPARTMENT"
                        queryParams={{ tenantId }}
                        lovOptions={{ displayField: 'unitName', valueField: 'unitId' }}
                        placeholder={intl.get(`${promptCode}.view.title.inputApplyingDepartment`).d('请选择申请部门')}
                    />
                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.datefrom`).d('申请日期从')}
                    wrapperCol={{ span: 24 }}
                    name="dateFrom"
                >
                    <CusDatePicker
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                            dayjs.isDayjs(this.form?.current?.getFieldValue('datefrom')) &&
                            currentDate &&
                            dayjs(currentDate).isAfter(
                                this.form?.current?.getFieldValue('datefrom')
                            )
                        }
                        placeholder={intl.get(`${promptCode}.view.title.inputPRdatefrom`).d('请选择申请日期')}
                    />

                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.dateto`).d('申请日期至')}
                    wrapperCol={{ span: 24 }}
                    name="dateTo"
                >
                    <CusDatePicker
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                            dayjs.isDayjs(this.form?.current?.getFieldValue('dateto')) &&
                            currentDate &&
                            dayjs(currentDate).isBefore(
                                this.form?.current?.getFieldValue('dateto')
                            )
                        }
                        placeholder={intl.get(`${promptCode}.view.title.inputPRdateto`).d('请选择申请日期')}
                    />
                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.budgettype`).d('预算类型')}
                    wrapperCol={{ span: 24 }}
                    name="budgetType"
                >
                    <CusSelect
                        lovCode="HKPC.BUDGETTYPE"
                        allowClear
                        popupClassName="customize-select"
                        style={{ width: '100%' }}
                        placeholder={intl.get(`${promptCode}.view.title.inputbudgettype`).d('请选择预算类型')}
                    />
                </Form.Item>
            </Col>,
            // <Col span={colSpan}>
            //     <Form.Item
            //         label={intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')}
            //         wrapperCol={{ span: 24 }}
            //         name="purchasingCategory"
            //     >
            //         <CusSelect
            //             lovCode="HKPC.PURCHASINGCATEGORY"
            //             allowClear
            //             popupClassName="customize-select"
            //             style={{ width: '100%' }}
            //             placeholder={intl.get(`${promptCode}.view.title.inputpurchasingcategory`).d('请选择采购类别')}
            //         />
            //     </Form.Item>
            // </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
                    wrapperCol={{ span: 24 }}
                    name="applicantUserId"
                >
                    <CusLov
                        code="CMHK_ALL_USER"
                        queryParams={{ tenantId }}
                        lovOptions={{ displayField: 'realName', valueField: 'id' }}
                        placeholder={intl.get(`${promptCode}.view.title.inputapplicant`).d('请选择申请人')}
                    />
                </Form.Item>
            </Col>,
            <Col span={colSpan}>
                <Form.Item
                    label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                    wrapperCol={{ span: 24 }}
                    name="procurementHandler"
                >
                    <CusLov
                        code="HKPC.PROCUREMENTAGENT"
                        queryParams={{ tenantId }}
                        lovOptions={{ displayField: 'userName', valueField: 'loginName' }}
                        placeholder={intl.get(`${promptCode}.view.title.inputprocurementhandler`).d('请选择采购经办人')}
                    />
                </Form.Item>
            </Col>,
        ];

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
            <Form ref={this.form} className="customize-form">
                <Row>
                    <Col span={24}>
                        <Row>
                            {showItemList.map(item => {
                                return item;
                            })}
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
                                    isShowMoreButton={expandFormItemList.length > 0}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        )
    }
}