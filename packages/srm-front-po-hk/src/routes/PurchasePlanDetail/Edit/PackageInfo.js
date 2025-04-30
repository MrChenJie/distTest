import React from 'react';
import intl from 'utils/intl';
import { Bind,Debounce } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import QuotationDocumentSubmitEditModal from './QuotationDocumentSubmitEditModal'
import QuotationDocumentSubmitNextModal from './QuotationDocumentSubmitNextModal'
// import ExportHistoryData from './components/ExportHistoryData';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import styles from './index.less';
import { Col, Collapse, Input, Row } from 'antd';
import { Form } from 'hzero-ui'
import { getDFormGridSpan } from '_cus_utils/utils';
import TechnicalScore from './TechnicalScore'
import QuotationTable from './QuotationTable'
import JudgingPanel from './JudgingPanel'
import classnames from 'classnames';
import { routerRedux } from 'dva/router';
import PanelHeader from '_cus_components/CusCollapse';
import CusInputNumber from '_cus_components/CusInputNumber';
import SupplierList from './SupplierList';
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceId';
const gridSpan = getDFormGridSpan();
const { Panel } = Collapse;
export default class PackageInfo extends React.Component {

  constructor(props) {
    super(props);
    // const { onRef } = props;
    // if (onRef) {
    //   onRef(this);
    // };
    
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
      // 判断子标包有数据的话，默认activeKey为1
      SearchTabActiveKey: '0', //默认展示的是第一个子标包信息
      activeKey:['childPa','childPb','childPc', 'childPd'],
      isControleJudShow: true, //默认评委组表展示
      isSupplier: true,
      isControlJud: true
    };
  }

  componentDidMount (){
    const {smallPacInfo,headFromDataSource} = this.props;
    const defaultActiveKey = smallPacInfo;
    setTimeout(() => {
      this.isSupplier(0);
      this.isControlJud(0);
    }, 2000)
    // if(defaultActiveKey.length > 1){
    //   this.setState({
    //     SearchTabActiveKey: defaultActiveKey.length > 1  ? '1':'0', //默认展示的是第一个子标包信息
    //   })
    // }
    // 默认展示第一个子包的信息
    // setTimeout(() => {
    //   this.getBudgeInfo(1)
    //   this.getBothData2(1)
    // }, 1000);
  }



  @Bind
  goToEdit = (pacNum) => {
    // const { dispatch } = this.props;

    // const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    // let url = `${isPub ? '/pub' : ''}/ssrc-hk/purchase-plan-list/sub-package/${pacNum}`;
    // if(isPub){
    //   dispatch(
    //     routerRedux.push({
    //       pathname: `/pub/ssrc-hk/purchase-plan-list/sub-package/${pacNum}`,
    //     })
    //   );
    // }else{
    //   dispatch(
    //     routerRedux.push({
    //       pathname: `/ssrc-hk/purchase-plan-list/sub-package/${pacNum}`,
    //     })
    //   );
    // }

    const { match } = this.props;
    const { prPlanNum } = match.params;
    const url = `${isPub ? '/pub' : ''}/sspo/isErpInfo/query/${prPlanNum}`
    console.log(packageNum);
    window.open(url, '_blank');
  }

  // // 获取评委信息
  // @Bind 
  // getBudgeInfo =(time)=>{
  //   const {dispatch ,allProId} = this.props
  //   console.log(allProId,'allProIdallProIdallProId');
  //    if(allProId.length> 1){
  //     dispatch({
  //       type: 'purchasePlan/getJudgeInfo',
  //       payload: {
  //         proId: allProId[time],
  //       },
  //     }).then(res=>{
  //       if(res){
  //         console.log('评委组',res);
  //         dispatch({
  //           type: 'purchasePlan/updateState',
  //           payload: {
  //             budgeInfo: res.page.content,
  //             selectInfo: res.judgesCount,
  //             proId: allProId[time]
  //           },
  //         })
  //       }
  //     })
  //    }
  // }

  @Bind
  isSupplier(val) {
    const { smallPacInfo,headFromDataSource} = this.props;
    const amountK = headFromDataSource?.estimatedBudgetAmountHkd;
    console.log('拿到HKD',amountK);
    // 金额在50<amount<100 为true
    const amountFlage = (Number(amountK) >= 500000 && Number(amountK) <= 1000000) ? true : false;
    const procurementType =  smallPacInfo.length > 0 && smallPacInfo[val]['procurementType'];
    console.log(smallPacInfo.length > 0 && smallPacInfo[val]['procurementType']);
    if(amountFlage && ['public_bidding'].includes(procurementType)) {
      this.setState({
        isSupplier: false
      })
    } else if(!amountFlage && ['public_bidding', 'public_inquiry'].includes(procurementType)) {
      this.setState({
        isSupplier: false
      })
    } else {
      this.setState({
        isSupplier: true
      })
    }
  }
  
  @Bind
  isControlJud(val) {
    const { smallPacInfo,headFromDataSource} = this.props;
    const amountK = headFromDataSource?.estimatedBudgetAmountHkd;
    // 金额在50<amount<100 为true
    const amountFlage = (Number(amountK) >= 500000 && Number(amountK) <= 1000000) ? true : false;
    console.log(smallPacInfo);
    const procurementType =  smallPacInfo.length > 0 && smallPacInfo[val]['procurementType'];
    console.log('最后的采购方式',procurementType);
    if((procurementType == 'public_inquiry' || procurementType == 'invitation_inquiry' || procurementType == 'single_source' || procurementType == 'internal_source' || procurementType == 'direct_negotiation') && amountFlage) {
      this.setState({
        isControlJud: false
      })
    } else if((procurementType == 'single_source' || procurementType == 'internal_source') && !amountFlage) {
      this.setState({
        isControlJud: false
      })
    } else {
      this.setState({
        isControlJud: true
      })
    }
  }

  //获取子标包的采购方式 
  @Bind
  getPurchaseFuc = (val)=>{
    // const { smallPacInfo,headFromDataSource} = this.props;
    // const amountK = headFromDataSource?.estimatedBudgetAmountHkd;
    // console.log('拿到HKD',amountK);
    // // 金额在50<amount<100 为true
    // const amountFlage = (Number(amountK) >= 500000 && Number(amountK) <= 1000000) ? true : false;
    // const procurementType =  smallPacInfo[val]['procurementType'];
    // console.log(smallPacInfo[val]['procurementType']);
    // if((procurementType == 'public_inquiry' || procurementType == 'invitation_inquiry' || procurementType == 'single_source' || procurementType == 'internal_source' || procurementType == 'direct_negotiation') && amountFlage ){
    //   this.setState ({
    //     isControleJudShow : false
    //   })
    // }else if((procurementType == 'single_source' || procurementType == 'internal_source') && !amountFlage){
    //   this.setState ({
    //     isControleJudShow : false
    //   })
    // }

    this.isSupplier(val);
    this.isControlJud(val);
  }



  render() {
    const { SearchTabActiveKey,activeKey,isControleJudShow, isSupplier ,isControlJud } = this.state;
    const { match,bothInfo,budgeInfo,form,allProId,getTabId,idpValueMap,bidProInfo,smallPacInfo,selectInfo,proId,todoFlag,isOverTwoInfo, supplierList = [], supplierPagination = {}} = this.props;
    // console.log('isControlJudjj',isControlJud);

    // console.log(smallPacInfo,'能拿到smallPacInfo？？？');
    

    const { getFieldDecorator = (e) => e } = form

    // 三个Table数据源
    const TechnicalScoreProps = {
      dataSource: smallPacInfo[SearchTabActiveKey],
      idpValueMap,
      bothInfo,
      match,
      allProId,
      proId,
      todoFlag,
    }

    const QuotationTableProps = {
      dataSource:smallPacInfo[SearchTabActiveKey],
      idpValueMap,
      match,
      allProId,
      proId,
      todoFlag,
    }

    const JudgingPanelProps = {
      // dataSource:smallPacInfo[SearchTabActiveKey],
      idpValueMap,
      proId:allProId[SearchTabActiveKey],
      dataSource:budgeInfo,
      selectInfo
    }

    // 邀请供应商
    const supplierListProps = {
      proId,
      match,
      allProId,
      proId,
      todoFlag,
      supplierList: supplierList,
      supplierPagination: supplierPagination,
      ...this.props,
    }

    console.log('isSupplier', isSupplier)



    // console.log(smallPacInfo[SearchTabActiveKey],"=====");


    // console.log(smallPacInfo,'smallPacInfo?????????');
    // console.log(smallPacInfo[SearchTabActiveKey][lastFlag],'8888888');
    //只含主包的情况（江川接口）
    // const itemTab0 = smallPacInfo?.map((item,index)=>{
    //   if(index == '0'){
    //     return  {
    //         label: intl.get(`HKPC.commom.view.title.package`, {
    //           package: `${(index).toString().padStart(2, '0')}`
    //         }).d(`标包：${(index).toString().padStart(2, '0')}`),
    //         key: index.toString(),
    //         children:(
    //           <div>
    //             <Form className={classnames('customize-form',styles['customFormPadding'])} style={{marginBottom: '24px !important'}}>
    //             <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
    //                 name='pacNum '
    //               >
    //                 {getFieldDecorator('packageNo', {
    //                   initialValue: item?.packageNo,
    //                 })(<CusInput 
    //                   disabled
    //                   className={classnames(styles['inputText'])}
    //                   // addonAfter={
    //                   //   <a onClick={()=>{
    //                   //     // this.goToEdit(item?.pac.packageNo)
    //                   //     this.goToEdit()
    //                   //   }}>{item?.packageNo}</a>
    //                   // }
    //                 ></CusInput>)}
    //               </Form.Item>
    //             </Col>
    //             <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.PackageName`).d('标包名称')}
    //                 name='packageName'
    //               >
    //                 {getFieldDecorator('packageName', {
    //                   initialValue: item?.packageName,
    //                 })(<Input disabled />)}
    //               </Form.Item>
    //             </Col>
    //             <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
    //                 name='procurementType'
    //               >
    //                 {getFieldDecorator('procurementType ', {
    //                   initialValue: item?.procurementType ,
    //                 })(<CusSelect  
    //                   lovCode='BID.PROCUREMENT_METHOD'  
    //                   disabled />)}
    //               </Form.Item>
    //             </Col>
    //             {/* <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.buyer`).d('采购方')}
    //                 name='buyer'
    //               >
    //                 {getFieldDecorator('buyer', {
    //                   initialValue: item?.buyer,
    //                 })(<Input disabled />)}
    //               </Form.Item>
    //             </Col> */}
    //             <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.CapexBudgetAmountHKD`).d('Capex预算金额(HKD)')}
    //                 name='capexCurrency'
    //               >
    //                 {getFieldDecorator('capexCurrency', {
    //                   initialValue: item?.capexCurrency,
    //                 })(<CusInputNumber
    //                   min={0}
    //                   precision={2}
    //                   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    //                   parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
    //                   disabled
    //                 />)}
    //               </Form.Item>
    //             </Col>
    //             <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.OpexBudgetAmountHKD`).d('Opex预算金额(HKD)')}
    //                 name='opexCurrency'
    //               >
    //                 {getFieldDecorator('opexCurrency', {
    //                   initialValue: item?.opexCurrency,
    //                 })(<CusInputNumber
    //                   min={0}
    //                   precision={2}
    //                   formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    //                   parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
    //                   disabled
    //                 />)}
    //               </Form.Item>
    //             </Col>
    //             {
    //               smallPacInfo[0]['lastFlag'] && <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.TechnicalProportion`).d('技术比例')}
    //                 name='technicalProportion'
    //               >
    //                 {getFieldDecorator('technicalProportion', {
    //                   initialValue: item?.technicalProportion,
    //                 })(<Input disabled />)}
    //               </Form.Item>
    //             </Col>
    //             }
    //             {
    //               smallPacInfo[0]['lastFlag'] && <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.PriceProportion`).d('价格比例')}
    //                 name='priceProportion'
    //               >
    //                 {getFieldDecorator('priceProportion', {
    //                   initialValue: item?.priceProportion,
    //                 })(<Input disabled />)}
    //               </Form.Item>
    //             </Col>
    //             }
    //             <Col {...gridSpan}>
    //               <Form.Item
    //                 required
    //                 label={intl.get(`${promptCode}.view.title.NumberofSuccessfulBidders`).d('中标人数')}
    //                 name='bidWinningAmount'
    //               >
    //                 {getFieldDecorator('bidWinningAmount', {
    //                   initialValue: item?.bidWinningAmount,
    //                 })(<Input disabled />)}
    //               </Form.Item>
    //             </Col>
    //             <Col {...gridSpan}>
    //               <Form.Item
    //                 label={intl
    //                   .get(`HKPC.commom.view.title.eettimatedbudgetamountH`)
    //                   .d('预算总金额（HKD）')}
    //               >
    //                 {getFieldDecorator('talCurrencyZero', {
    //                   initialValue: item?.capexCurrency + item?.opexCurrency,
    //                 })(
    //                   <CusInputNumber
    //                     min={0}
    //                     precision={2}
    //                     formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
    //                     parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
    //                     disabled
    //                   />
    //                 )}
    //               </Form.Item>
    //             </Col>
    //           </Form>
    //             <Collapse
    //               className={classnames('customize-collapse',styles['show-border'])}
    //               defaultActiveKey={activeKey}
    //               onChange={(collapseKeys) => {
    //                 this.setState({ activeKey: collapseKeys });
    //               }}
    //             >
    //               {
    //                 smallPacInfo[0]['lastFlag'] &&<Panel
    //                 showArrow={false}
    //                 header={
    //                   <PanelHeader
    //                     verticalLine={false}
    //                     title={intl.get(`${promptCode}.view.title.TechnicalScoringTableSettings`).d('技术评分表设置')}
    //                     arrowActive={activeKey.includes('childPa')}
    //                   // showArrow={false}
    //                   />
    //                 }
    //                 key="childPa"
    //               >
    //                 {
    //                   <>
    //                     <TechnicalScore  {...TechnicalScoreProps} />
    //                   </>
    //                 }
    //               </Panel>
    //               }

    //               <Panel
    //                 showArrow={false}
    //                 header={
    //                   <PanelHeader
    //                     verticalLine={false}
    //                     title={intl.get(`${promptCode}.view.title.QuotationList`).d('报价表清单')}
    //                     arrowActive={activeKey.includes('childPb')}
    //                   />
    //                 }
    //                 key="childPb"
    //               >
    //                 <QuotationTable {...QuotationTableProps} />
    //               </Panel>

    //               {isControlJud  && <Panel
    //                 showArrow={false}
    //                 header={
    //                   <PanelHeader
    //                     verticalLine={false}
    //                     title={intl.get(`${promptCode}.view.title.ExpertGroupSettings`).d('评委组设置')}
    //                     arrowActive={activeKey.includes('childPc')}
    //                   />
    //                 }
    //                 key="childPc"
    //               >
    //                 <JudgingPanel {...JudgingPanelProps} />
    //               </Panel>}
    //               {isSupplier && <Panel
    //                 showArrow={false}
    //                 header={
    //                   <PanelHeader
    //                     verticalLine={false}
    //                     title={intl.get(`bid.bidcommon.view.title.invitesuppliers`).d("邀请供应商")}
    //                     arrowActive={activeKey.includes('childPd')}
    //                   />
    //                 }
    //                 key="childPd"
    //               >
    //                 <SupplierList {...supplierListProps} />
    //               </Panel>}
    //             </Collapse>
    //           </div>
    //         )
    //       }
    //   }
    // })

    const itemTab = smallPacInfo?.map((item,index)=>{
      // if(index == '0'){
      //   return null
      // }
      return  {
          // label: intl.get(`HKPC.commom.view.title.package`, {
          //   package: `${isOverTwoInfo ? (index + 1).toString().padStart(2, '0') : (index).toString().padStart(2, '0')}`
          // }).d(`标包：${isOverTwoInfo ? (index + 1).toString().padStart(2, '0') : (index).toString().padStart(2, '0')}`),
          label: `${isOverTwoInfo ? (index + 1).toString().padStart(2, '0') : (index).toString().padStart(2, '0')}`,
          key: index.toString(),
          children:(
            <div>
              <Form className={classnames('customize-form',styles['customFormPadding'])} >
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
                  name='pacNum '
                >
                  {getFieldDecorator('packageNo', {
                    initialValue: item?.packageNo,
                  })(<CusInput 
                    disabled
                    className={classnames(styles['inputText'])}
                    // addonAfter={
                    //   <a onClick={()=>{
                    //     // this.goToEdit(item?.pac.packageNo)
                    //     this.goToEdit()
                    //   }}>{item?.packageNo}</a>
                    // }
                  ></CusInput>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.PackageName`).d('标包名称')}
                  name='packageName'
                >
                  {getFieldDecorator('packageName', {
                    initialValue: item?.packageName,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
                  name='procurementType '
                >
                  {getFieldDecorator('procurementType ', {
                    initialValue: item?.procurementType ,
                  })(<CusSelect  
                      lovCode='BID.PROCUREMENT_METHOD'  
                      disabled />)}
                </Form.Item>
              </Col>
              {/* <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.buyer`).d('采购方')}
                  name='buyer'
                >
                  {getFieldDecorator('buyer', {
                    initialValue: item?.buyer,
                  })(<Input disabled />)}
                </Form.Item>
              </Col> */}
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.CapexBudgetAmountHKD`).d('Capex预算金额(HKD)')}
                  name='capexCurrency'
                >
                  {getFieldDecorator('capexCurrency', {
                    initialValue: item?.capexCurrency,
                  })(<CusInputNumber
                    min={0}
                    precision={2}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    disabled
                  />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.OpexBudgetAmountHKD`).d('Opex预算金额(HKD)')}
                  name='opexCurrency'
                >
                  {getFieldDecorator('opexCurrency', {
                    initialValue: item?.opexCurrency,
                  })(<CusInputNumber
                    min={0}
                    precision={2}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    disabled
                  />)}
                </Form.Item>
              </Col>
              {smallPacInfo[SearchTabActiveKey]['lastFlag'] && (<>
                  <Col {...gridSpan}>
                    <Form.Item
                      required
                      label={intl.get(`${promptCode}.view.title.TechnicalProportion`).d('技术比例')}
                      name='technicalProportion'
                    >
                      {getFieldDecorator('technicalProportion', {
                        initialValue: item?.technicalProportion,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item
                      required
                      label={intl.get(`${promptCode}.view.title.PriceProportion`).d('价格比例')}
                      name='priceProportion'
                    >
                      {getFieldDecorator('priceProportion', {
                        initialValue: item?.priceProportion,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                </>)}
              <Col {...gridSpan} style={{ display: 'none' }}>
                <Form.Item
                  required
                  label={intl.get(`${promptCode}.view.title.NumberofSuccessfulBidders`).d('中标人数')}
                  name='bidWinningAmount'
                >
                  {getFieldDecorator('bidWinningAmount', {
                    initialValue: item?.bidWinningAmount,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                  <Form.Item
                    label={intl
                      .get(`HKPC.commom.view.title.eettimatedbudgetamountH`)
                      .d('预算总金额（HKD）')}
                  >
                    {getFieldDecorator('talCurrencyZero', {
                      initialValue: item?.capexCurrency + item?.opexCurrency,
                    })(
                      <CusInputNumber
                        min={0}
                        precision={2}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        disabled
                      />
                    )}
                  </Form.Item>
                </Col>
            </Form>

            <Collapse
                className={classnames('customize-collapse',styles['show-border'])}
                  defaultActiveKey={activeKey}
                  onChange={(collapseKeys) => {
                    this.setState({ activeKey: collapseKeys });
                  }}
                >
              {
                smallPacInfo[SearchTabActiveKey]['lastFlag'] &&<Panel
                showArrow={false}
                header={
                  <PanelHeader
                    verticalLine={false}
                    title={intl.get(`${promptCode}.view.title.TechnicalScoringTableSettings`).d('技术评分表设置')}
                    arrowActive={activeKey.includes('childPa')}
                  // showArrow={false}
                  />
                }
                key="childPa"
              >
                  <TechnicalScore  {...TechnicalScoreProps} />
              </Panel>
              }

              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    verticalLine={false}
                    title={intl.get(`${promptCode}.view.title.QuotationList`).d('报价表清单')}
                    arrowActive={activeKey.includes('childPb')}
                  // showArrow={false}
                  />
                }
                key="childPb"
              >
                <QuotationTable {...QuotationTableProps}/>
              </Panel>

              {/* {
                isControlJud  && <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    verticalLine={false}
                    title={intl.get(`${promptCode}.view.title.ExpertGroupSettings`).d('评委组设置')}
                    arrowActive={activeKey.includes('childPc')}
                  />
                }
                key="childPc"
              >
                <JudgingPanel {...JudgingPanelProps}/>
              </Panel>
              } */}
              {isSupplier && <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    verticalLine={false}
                    title={intl.get(`bid.bidcommon.view.title.invitesuppliers`).d("邀请供应商")}
                    arrowActive={activeKey.includes('childPd')}
                  />
                }
                key="childPd"
              >
                <SupplierList {...supplierListProps} />
              </Panel>}
            </Collapse>
            </div>
          )
        }
    })
    // .filter((item)=>{
    //     return item != null
    // })

    const itemTabMain =[{
      // label: intl
      //   .get(`HKPC.commom.view.title.package`, {
      //     package: '00'
      //   }).d('标包：00'),
      label: '00',
      key: '0',
      children:(
        <div>
          <Form className='customize-form'>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
                name='packageNo'
              >
                {getFieldDecorator('packageNo', {
                  // 如果进入到方法页面，子标包+主标包是初始化会获取到的
                  // 靠刘伟接口生成的数据要有save这个动作
                  initialValue : bidProInfo ? bidProInfo?.packageNo  ? bidProInfo?.packageNo : '' : ''
                })(<CusInput 
                  disabled
                  className={classnames(styles['inputText'])}
                ></CusInput>)}
              </Form.Item>
            </Col>
          </Form>
        </div>
      )
    }]
    // console.log(itemTab,'itemTab有吗？');
    // console.log(itemTab.length ,'itemTab的长度');
    // console.log(itemTab.length >= 1,'子标包数量是否大于等于1');
    

    return (
      <React.Fragment>
        <div className={styles['out-div-search']}>
          <CusSearchTabs
            activeKey={SearchTabActiveKey}
            // 若子标包(itemtab)的数据大于0，则表明有子标包
            // items={itemTab.length >= 1 ? itemTab : itemTabMain}
            // items={itemTab.length > 1 ? itemTab : (itemTab.length == 1 ? itemTab0 :itemTabMain)}
            items={smallPacInfo.length > 0 ? itemTab : itemTabMain}
            onChange={(val) => {
              console.log(val);
              if(itemTab.length > 1){
                this.setState({ SearchTabActiveKey: val })
                getTabId(val)
                // 根据tabid获取评委组数据
                this.props.getBudgeInfo(val)
                // 获取both
                this.props.getBothData2(val)
                // 获取【采购方式】
                this.getPurchaseFuc(val)
              }else {
                this.setState({ SearchTabActiveKey: "0" })
                this.getPurchaseFuc(val)
              }
            }}
          />
        </div>

        <div className={styles['out-ant-input']}>
          
        </div>
      </React.Fragment>
    );
  }
}
