/**
 * index.js - 期间修改查询
 * @date: 2023-9-12
 * @author:  <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import { Input, Row, Col, Form } from 'antd';
import dayjs from 'dayjs';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { mediumScreenWidth } from '_cus_utils/constants';
import { Bind } from 'lodash-decorators';
import { getLFormGridSpan } from '_cus_utils/utils';

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
                label={intl.get(`HKPC.commom.view.title.prnumber`).d('采购申请编号')}
                wrapperCol={{ span: 24 }}
                name="prNumber"
            >
                <Input placeholder={intl.get(`HKPC.commom.view.title.inputPRnumber`).d('请输入采购申请编号')}/>
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.prname`).d('采购申请名称')}
                wrapperCol={{ span: 24 }}
                name="prName"
            >
                <Input placeholder={intl.get(`HKPC.commom.view.title.inputPRname`).d('请输入采购申请名称')}/>
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.aapplyingdepartment`).d('申请部门')}
                wrapperCol={{ span: 24 }}
                name="applyingDepartmentId"
            >
                <CusLov 
                    lovOptions={{displayField:'unitName',valueField:'unitId'}}
                    queryParams={{ tenantId }} 
                    code="HKPC.APPLICATIONDEPARTMENT"
                    placeholder={intl.get(`HKPC.commom.view.title.inputApplyingDepartment`).d('请选择申请部门')}
                    />
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.datefrom`).d('申请日期从')}
                wrapperCol={{ span: 24 }}
                name="applyingDateStart"
            >
                <CusDatePicker
                    format={getDateFormat()}
                    placeholder={intl.get(`HKPC.commom.view.title.inputPRdatefrom`).d('请选择申请日期')}
                    disabledDate={(currentDate) =>
                        dayjs.isDayjs(this.baseForm?.current?.getFieldValue('applyingDateEnd')) &&
                        currentDate &&
                        dayjs(currentDate).isAfter(
                            this.baseForm?.current?.getFieldValue('applyingDateEnd')
                        )
                    }
                />

            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.dateto`).d('申请日期至')}
                wrapperCol={{ span: 24 }}
                name="applyingDateEnd"
            >
                <CusDatePicker
                    placeholder={intl.get(`HKPC.commom.view.title.inputPRdateto`).d('请选择申请日期')}
                    format={getDateFormat()}
                    disabledDate={(currentDate) =>
                        // dayjs.isDayjs(this.baseForm?.current?.getFieldValue('applyingDateStart')) &&
                        currentDate &&
                        currentDate.isBefore(
                            this.baseForm?.current?.getFieldValue('applyingDateStart')
                        )
                    }
                />
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.PPStatus`).d('采购方案状态')}
                wrapperCol={{ span: 24 }}
                name="prPlanStatus"
            >
                <CusSelect
                    placeholder={intl.get(`HKPC.commom.view.message.inputplanstatus`).d('请选择方案状态')}
                    allowClear
                    popupClassName="customize-select"
                    style={{ width: '100%' }}
                    options={idpValueMap['HKPC.PPDOCUMENTSTATUS']}
                />
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.prtype`).d('采购申请类型')}
                wrapperCol={{ span: 24 }}
                name="prType"
            >
                <CusSelect 
                    placeholder={intl.get(`HKPC.commom.view.title.inputPRtype`).d('请选择采购申请类型')}
                    allowClear 
                    popupClassName="customize-select"
                    style={{ width: '100%' }} 
                    options={idpValueMap['HKPC.PRTYPE']} />
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.procurementhandler`).d('采购经办人')}
                wrapperCol={{ span: 24 }}
                name="prDealManId"
            >
                <CusLov 
                    placeholder={intl.get(`HKPC.commom.view.title.inputprocurementhandler`).d('请选择采购经办人')}
                    code='HKPC.PROCUREMENTAGENT' 
                    lovOptions={{displayField:'userName',valueField:'userId'}}/>
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)')}
                wrapperCol={{ span: 24 }}
                name="estimatedBudgetAmountHkd"
            >
                <Input placeholder={intl.get(`HKPC.commom.view.title.inputEstimatedBudgetAmountHKD`).d('请输入预估总金额（HKD）')}/>
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.applicant`).d('申请人')}
                wrapperCol={{ span: 24 }}
                name="applicantUserId"
            >
                <CusLov 
                    placeholder={intl.get(`HKPC.commom.view.titla.inputapplicant`).d('请选择申请人')}
                    queryParams={{ tenantId }} code='HKPC.APPLICATION' 
                    lovOptions={{displayField:'nameEn',valueField:'id'}}/>
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.PPnumber`).d('采购方案编号')}
                wrapperCol={{ span: 24 }}
                name="prPlanNum"
            >
                <Input placeholder={intl.get(`HKPC.commom.view.message.inputplannumber`).d('请输入采购方案编号')}/>
            </Form.Item>
        </Col>,
        <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`HKPC.commom.view.title.PPname`).d('采购方案名称')}
                wrapperCol={{ span: 24 }}
                name="prPlanName"
            >
                <Input placeholder={intl.get(`HKPC.commom.view.message.inputplantitle`).d('请输入采购方案名称')}/>
            </Form.Item>
        </Col>]

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