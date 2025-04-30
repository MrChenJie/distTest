/**
 * index.js - 手工对冲查询页面
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import React, { Component } from 'react';
import ProjectBaseInfoForm from "./ProjectBaseInfoForm"
import TechnicalResponseTable from "./TechnicalResponseTable"
import BusinessResponseTable from './BusinessResponseTable'
import TechnicalGradeTable from './TechnicalGradeTable'
import QuotationTable from './QuotationTable'
import JudgeTable from './JudgeTable'
// import { Form, Row, Col, Input } from 'antd';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
// import { filterNullValueObject } from 'utils/utils';
// import moment from 'moment';
// import { createPagination } from 'hzero-front/lib/utils/utils';
// import HedgeForm from './HedgeForm';
// import HedgeResults from './HedgeResults';
import formatterCollections from 'utils/intl/formatterCollections';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
// import CusNotification from '_cus_components/CusNotification';
// import CusMultiLov from '_cus_components/CusMultiLov';
// import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import dayjs from 'dayjs';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import { Form } from 'hzero-ui';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import SelectMaterialModal from './SelectMaterialModal';
import { fastCodeLoader } from '@/utils/decorators';
import { createPagination } from 'hzero-front/lib/utils/utils';

const commonPrompt = 'sslm.standardEvaluate';
const { Panel } = Collapse;
@formatterCollections({
  code: [
    'srsp.collectiondisplay',
  ],
})
@connect(({ loading = {}, purchasePlan = {} }) => ({
  purchasePlan,
}))

@fastCodeLoader([
  'HKPC.PROCUREMENTMETHOD', //采购方式
  'HKPC.ONLINERESPONSE', //线上应答
  'HKPC.KEYINDICATORS', //是否关键指标
  'HKPC.YES_OR_NO', //是否客观分
  'HKPC.SCORE_TYPE_OBJECTIVE', //分值类型（是）
  'HKPC.SCORE_TYPE_SUBJECTIVE', //分值类型（否）
  'HKPC.NUMBEROFPROJECTJUDGES',//项目评委人数
  'HKPC.ONLINERESPONSE',//线上应答
  'HKPC.PURCHASER',  // 采购方
  'MATERIALNAME'// 物料名称
])

@Form.create()
export default class PeriodAddition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchForm: {}, // 查询条件
      selectedRows: [],
      selectedRowKeys: [],
      activeKey: ['form', 'projectSettingPanel'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
      modalShowFlag: true,
      pacId: null,  //标包ID
    };
  }

  componentDidMount(){
    this.getDataInit()
  }

   // 基本信息
   @Bind()
   getDataInit() {
     const { dispatch,match } = this.props
     const pacNum = match.params.pacNum;
     dispatch({
       type:'purchasePlan/getSubcontractInfo',
       payload: {
        pacNum:pacNum,
       },
     }).then(res=>{
      this.setState({
        pacId: res?.pac?.id
      })
      dispatch({
        type:'purchasePlan/updateState',
        payload: {
          packageHeadFromDataSource:res.pac, // 分标包头部信息（基本信息）
          techReplyDataSource:res.techReply.map(item=>{
            return {
              ...item,
              _status:'update',
              qqq:uuidv4()
            }
          }),//技术应答表
          techReplyDataPagination:createPagination(res.techReply),

          busReplyDataSource:res.busReply.map(item=>{
            return {
              ...item,
              _status:'update',
              poOrderId:uuidv4()
            }
          }),//商务应答
          busReplyDataPagination:createPagination(res.busReply),

          scoreDataSource:res.score.map(item=>{
            return {
              ...item,
              _status:'update',
              kkk:uuidv4()
            }
          }),//技术评分
          scoreDataPagination:createPagination(res.score),
          quoteDataSource:res.quote.map(item=>{
            return {
              ...item,
              _status:'update',
              eee:uuidv4()
            }
          }),//报价表格式
          quoteDataPagination:createPagination(res.quote),

          judgeDataSource:res.judge.map(item=>{
            return {
              ...item,
              _status:'update',
              iii:uuidv4()
            }
          }),//评委组
          judgeDataPagination:createPagination(res.judge)
        },
      })
    })
   }

  //  页面大保存
   @Bind
   handleSave () {
      const {purchasePlan} = this.props
      const {techReplyDataSource,packageHeadFromDataSource,busReplyDataSource,scoreDataSource,quoteDataSource,judgeDataSource} = purchasePlan;
      console.log("这是新的技术应答？",techReplyDataSource);
      console.log('这是头部信息',packageHeadFromDataSource);
      console.log('商务',busReplyDataSource);
      console.log('技术评分',scoreDataSource);
      console.log('目前表头信息',this.baseForm.getFieldsValue());

      const currentHeadPacInfo = this.baseForm.getFieldsValue()
      const newHeadPacInfo = {...packageHeadFromDataSource,...currentHeadPacInfo}
      newHeadPacInfo.bidNum = Number(currentHeadPacInfo.bidNum)
      // quantity转为Number
      const newquoteDataSource = {...quoteDataSource}
      newquoteDataSource.quantity = Number(quoteDataSource.quantity)
      console.log("合并表头",newHeadPacInfo);

      const pacInfoPramas = {
        pac:newHeadPacInfo,
        techReply:techReplyDataSource,
        busReply:busReplyDataSource,
        score:scoreDataSource,
        quote:quoteDataSource,
        judge:judgeDataSource
      }
      console.log(pacInfoPramas,'参数');
      const { dispatch } = this.props
      // dispatch({
      //   type:'purchasePlan/pacSave',
      //   payload: {
      //     pacSave:pacInfoPramas,
      //   },
      // }).then(res=>{
      //   // 保存成功之后重新初始化model数据
      //   dispatch({
      //     type:'purchasePlan/updateState',
      //     payload: {
      //       packageHeadFromDataSource:res.pac, // 分标包头部信息（基本信息）
      //       techReplyDataSource:res.techReply.map(item=>{
      //         return {
      //           ...item,
      //           _status:'update',
      //           qqq:uuidv4()
      //         }
      //       }),//技术应答表
      //       techReplyDataPagination:createPagination(res.techReply),
  
      //       busReplyDataSource:res.busReply.map(item=>{
      //         return {
      //           ...item,
      //           _status:'update',
      //           poOrderId:uuidv4()
      //         }
      //       }),//商务应答
      //       busReplyDataPagination:createPagination(res.busReply),
  
      //       scoreDataSource:res.score.map(item=>{
      //         return {
      //           ...item,
      //           _status:'update',
      //           kkk:uuidv4()
      //         }
      //       }),//技术评分
      //       scoreDataPagination:createPagination(res.score),
      //       quoteDataSource:res.quote.map(item=>{
      //         return {
      //           ...item,
      //           _status:'update',
      //           eee:uuidv4()
      //         }
      //       }),//报价表格式
      //       quoteDataPagination:createPagination(res.quote),
  
      //       judgeDataSource:res.judge.map(item=>{
      //         return {
      //           ...item,
      //           _status:'update',
      //           iii:uuidv4()
      //         }
      //       }),//评委组
      //       judgeDataPagination:createPagination(res.judge)
      //     },
      //   })
      // })
   }
   

  render() {
    const { form,idpValueMap = {},purchasePlan,match,dispatch } = this.props
    const {
      packageHeadFromDataSource,
      techReplyDataSource,
      busReplyDataSource,
      scoreDataSource,
      scoreDataPagination,
      quoteDataSource,
      judgeDataSource,
      techReplyDataPagination,
      busReplyDataPagination,
      quoteDataPagination,
      judgeDataPagination,
      controlTecResp
    } = purchasePlan
    const { activeKey ,pacId} = this.state
    // 判断技术评分表是否显示
    
    const technicalResponseTableProps = {
      form,idpValueMap,techReplyDataSource,match,techReplyDataPagination,pacId,dispatch
    }

    const businessResponseTableProps = {
      form,idpValueMap,busReplyDataSource,busReplyDataPagination,pacId,dispatch
    }

    const technicalGradeTableProps = {
      form,idpValueMap,scoreDataSource,scoreDataPagination,pacId,dispatch
    }

    const quotationTableProps = {
      form,idpValueMap,quoteDataSource,quoteDataPagination,pacId,dispatch
    }

    const judgeTableProps = {
      form,idpValueMap,judgeDataSource,judgeDataPagination,pacId,dispatch
    }

    const FormProps = {
      onRef: (ref) => {
        this.baseForm = ref.props.form
      },
      dispatch,
      idpValueMap,
      packageHeadFromDataSource,
      form,
      controlTecResp
    }

    const renderTecResp = ()=>{
      return (
        <>
        <div style={{ fontWeight: 700 }}>{intl.get(`HKPC.commom.view.title.TechnicalScoringTableSettings`).d('技术评分表设置')}</div>
      <TechnicalGradeTable fatherTake={this.fatherTake} {...technicalGradeTableProps}></TechnicalGradeTable></>
      )
    }


    console.log(controlTecResp,'controlTecResp');
    return (
      <>
        <PageWrapper>
          <Collapse className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}>
            <Panel
              key="form"
              showArrow={false}
              header={
                <PanelHeader
                  arrowActive={activeKey.includes('form')}
                  title={intl.get(`HKPC.commom.view.title.projectinformation`).d('项目基本信息')}
                />
              }
            >
              <ProjectBaseInfoForm  {...FormProps} />
            </Panel>
            <Panel
              key="projectSettingPanel"
              showArrow={false}
              // collapsible="disabled"
              header={
                <PanelHeader
                  // showArrow={false}
                  arrowActive={activeKey.includes('projectSettingPanel')}
                  title={intl.get(`HKPC.commom.view.title.ProjectSettings`).d('项目设置')}
                />
              }>
              <div style={{ fontWeight: 700 }}>{intl.get(`HKPC.commom.view.title.TechnicalResponseTableSettings`).d('技术应答表设置')}</div>
              <TechnicalResponseTable fatherTake={this.fatherTake} {...technicalResponseTableProps}></TechnicalResponseTable>

              <div style={{ fontWeight: 700 }}>{intl.get(`HKPC.commom.view.title.BusinessResponseTableSettings`).d('商务应答表设置')}</div>
              <BusinessResponseTable fatherTake={this.fatherTake} {...businessResponseTableProps}></BusinessResponseTable>

              {packageHeadFromDataSource.prMode == "ppopentender" && renderTecResp()}

              <div style={{ fontWeight: 700 }}>{intl.get(`HKPC.commom.view.title.FormatSettingOfQuotationTable`).d('报价表格式设置')}</div>
              <QuotationTable fatherTake={this.fatherTake} {...quotationTableProps}></QuotationTable>

              <div style={{ fontWeight: 700 }}>{intl.get(`HKPC.commom.view.title.ExpertGroupSettings`).d('评委组设置')}</div>
              <JudgeTable fatherTake={this.fatherTake} {...judgeTableProps}></JudgeTable>
            </Panel>
          </Collapse>
        </PageWrapper>

        <CusApprovalButtons
          children={
            <CusButton onClick= {this.handleSave}>
              {intl.get(`hzero.common.view.button.save`).d('保存')}
            </CusButton>
          }
        ></CusApprovalButtons>
      </>
    )
  }
}