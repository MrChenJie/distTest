import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Form } from 'hzero-ui'
import { Col, Input, Row } from 'antd';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';

// import styles from './index.less'
/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

export default class ProjectBaseInfoForm extends React.Component {
  baseForm = React.createRef();
  constructor(props) {
    super(props);
    const { onRef } = this.props;

    onRef(this);
    this.state = {
      isShowMore: false,
      controlBudgetFlag: true, //控制预算的两个下拉框显示与否
    };
  }

  form = React.createRef();

  componentDidUpdate(preState, preProps) {
    // if(this.props.packageHeadFromDataSource !== preProps.packageHeadFromDataSource){
    //     // if(this.props.packageHeadFromDataSource.prMode == "公开招标" || this.props.packageHeadFromDataSource.prMode == "邀请招标" ){
    //       if(this.props.packageHeadFromDataSource.prMode == "ppopentender" || this.props.packageHeadFromDataSource.prMode == "邀请招标" ){
    //         const {dispatch} = this.props
    //         dispatch({
    //           type:'purchasePlan/updateState',
    //           payload: {
    //             controlTecResp: true
    //           }
    //         })
    //     }
    // else {
    //   // this.state.controlBudgetFlag = false
    //   const {dispatch} = this.props
    //   dispatch({
    //     type:'purchasePlan/updateState',
    //     payload: {
    //       controlTecResp: false
    //     }
    //   })
    // }
    // }


  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.form.current?.resetFields();
    onSearch();
  }


  // 修改采购方式
  @Bind
  changeType(val) {
    console.log(val, "改变的值");
    if (val === "opentender" || val === "invitedtender") {
      this.setState({
        controlBudgetFlag: true
      })

      const { dispatch } = this.props
      dispatch({
        type: 'purchasePlan/updateState',
        payload: {
          controlTecResp: true
        }
      })
    } else {
      this.setState({
        controlBudgetFlag: false
      })
      const { dispatch } = this.props
      dispatch({
        type: 'purchasePlan/updateState',
        payload: {
          controlTecResp: false
        }
      })
    }


  }


  render() {
    const { idpValueMap, packageHeadFromDataSource, form, controlTecResp } = this.props
    // const {controlTecResp} = purchasePlan
    let { controlBudgetFlag } = this.state
    const { getFieldDecorator = (e) => e } = form
    const renderRatio = () => {
      return (
        <>


        </>
      )
    }


    return (
      <div >
        <Form className='customize-form'>
          <GenerateFormGrid isPackUp={true}>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PPnumber`).d('采购方案编号')}
                name='prPlanNum'
              >
                {getFieldDecorator('prPlanNum', {
                  initialValue: packageHeadFromDataSource?.prPlanNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PPname`).d('采购方案名称')}
                name='prPlanName'
              >
                {getFieldDecorator('prPlanName', {
                  initialValue: packageHeadFromDataSource?.prPlanName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
                name='pacNum'
              >
                {getFieldDecorator('pacNum', {
                  initialValue: packageHeadFromDataSource?.pacNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PackageName`).d('标包名称')}
                name='pacName'
              >
                {getFieldDecorator('pacName', {
                  initialValue: packageHeadFromDataSource?.pacName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
                name='prMode'
              >
                {getFieldDecorator('prMode', {
                  initialValue: packageHeadFromDataSource?.prMode,
                })(<CusSelect
                  allowClear
                  onChange={this.changeType}
                  popupClassName="customize-select"
                  style={{ width: '100%' }}
                  options={idpValueMap['HKPC.PROCUREMENTMETHOD']}
                />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.Purchaser`).d('采购方')}
                name='prPurchaser'
              >
                {getFieldDecorator('prPurchaser', {
                  initialValue: packageHeadFromDataSource?.prPurchaser,
                })(<CusLov code='HKPC.PURCHASER' textField="prPurchaser" />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.CapexBudgetAmountHKD`).d('Capex预算金额(HKD)')}
                name='capexBudgetAmount'
              >
                {getFieldDecorator('capexBudgetAmount', {
                  initialValue: packageHeadFromDataSource?.capexBudgetAmount,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.OpexBudgetAmountHKD`).d('Opex预算金额(HKD)')}
                name='opexBudgetAmount'
              >
                {getFieldDecorator('opexBudgetAmount', {
                  initialValue: packageHeadFromDataSource?.opexBudgetAmount,
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            {/* 根据【采购方式】判断展示与否 */}
            {this.props.packageHeadFromDataSource.prMode == "ppopentender"  && <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.TechnicalProportion`).d('技术比例')}
                name='techRatio'
              >
                {getFieldDecorator('techRatio', {
                  initialValue: packageHeadFromDataSource?.techRatio,
                })(<Input />)}
              </Form.Item>
            </Col>}

            {this.props.packageHeadFromDataSource.prMode == "ppopentender"  &&
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.PriceProportion`).d('价格比例')}
                  name='priceRatio '
                >
                  {getFieldDecorator('priceRatio ', {
                    initialValue: packageHeadFromDataSource?.priceRatio,
                  })(<Input />)}
                </Form.Item>
              </Col>
            }


            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.NumberofSuccessfulBidders`).d('中标人数')}
                name='bidNum'
              >
                {getFieldDecorator('bidNum', {
                  initialValue: packageHeadFromDataSource?.bidNum,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                name='prDealMan'
              >
                {getFieldDecorator('prDealMan', {
                  initialValue: packageHeadFromDataSource?.prDealMan,
                })(<Input />)}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
