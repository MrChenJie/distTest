import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, createPagination, getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import { Bind, Debounce } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import { numberRender } from 'utils/renderer';
import { isEqual } from 'lodash';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
// import CusNotification from '@/components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import FilterSearch from './FilterSearch';
import PlanInfo from './PlanInfo'
import ProjectManager from './ProjectManager'
// import InquireInfoTableTwo from './InquireInfoTableTwo'
import PackageInfo from './PackageInfo'
import styles from './index.less';
import classnames from 'classnames';
import { Form } from 'hzero-ui';
import TechnicalScore from './TechnicalScore'
import QuotationTable from './QuotationTable'
import JudgingPanel from './JudgingPanel'
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusInput from '_cus_components/CusInput';
import DecisionInfo from './DecisionInfo';
import { queryFileList } from '@/utils/utils';
import { getResponse } from '_cus_utils/utils';
import PageMessage from '_cus_components/Page/PageMessage';

// import queryString from 'querystring';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const tempCode = 'hzero.common'
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const gridSpan = getDFormGridSpan();
const { ERP_HOST } = process.env;
const { activityCode, state } = querystring.parse(location?.search?.substr(1)) || {}; 

@fastCodeLoader([
  'HKPC.PPDOCUMENTSTATUS',
  'HKPC.PPPROCUREMENTMETHOD',
  'BID.PROCUREMENT_METHOD_1',
  'BID.DECISION_TYPE',
])
@connect(({ loading = {}, purchasePlan = {} }) => ({
  purchasePlan,
}))

@Form.create()

@formatterCollections({ code: [promptCode,tempCode, 'bid.bidcommon', 'bid.biddashbord'] })
@fastCodeLoader([

])
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm

  constructor(props) {
    super(props);

    this.state = {
      activeKey: [
        'form',
        'projectManagerTab',
        'planInfoTab',
        'uploadTable',
        'inquireInfoTab',
        'stageTab',
        'pacInfo',
        'decisionInfoTab'
      ],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      searchTabActiveKey: 'procurement',
      tabId: "0", // 标包信息的id
      isControlMainShow: false, // 点击上方保存按钮的flag

      pacContent : true , //待办进来的
      listIntoFlag : true,
      smallHaveData : false , //子标包有数据
      todoFlag :'',
      tabActiveKey: '0',
      tabKey: 'purchase',
      isControlJud: true,
      isOverTwoInfo: false,
      fileSource: [],
      supplierList: [],
      supplierPagination: {},
      decisionInfo: {}, // 决策信息
      fileInfoList: [],
    }
  }

  componentDidUpdate(prevProps,preSate){
    const {purchasePlan} = this.props;
    const {UUid} = purchasePlan
    // console.log('???',preSate);
    if(prevProps!=this.props){
      console.log(1);
      this.getFileList(UUid || '-1')
    }
  }

  componentDidMount() {
    // 如果是方案进来的走方案号
    // const fucFlag = this.props.location.state
    const searchParams = new URLSearchParams(window.location.search);
    const fucFlag = searchParams.get('flag');
    const prNum = searchParams.get('prNumber');
    const { location: { search } } = this.props;
    const { id, formRecordId } = querystring.parse(search.substring(1));
    // console.log(fucFlag,'fucFlag');
    // console.log(prNum,'prNum');
    if(fucFlag == 'true'){
      this.getDataInit0(prNum,formRecordId) 
      this.setState({
        todoFlag : 'true'
      })
    }else {
      this.getDataInit();
      // this.setState({
      //   todoFlag : 'false'
      // })
    }
    // fucFlag ? this.getDataInit0() : this.getDataInit()
    if(fucFlag){
      // 待办进入的
      this.setState({
        pacContent : false
      })
    }else {
      this.setState({
        pacContent : true
      })
    }
     // 获取子标包信息
     setTimeout(()=>{
       this.getSmallPac();
     },1000)
    this.listener();
  }

  // 查询决策信息
  @Bind()
  handleDecisionInfo(refHeadId) {
    const { dispatch } = this.props;
    if(isEqual(refHeadId, undefined)) {
      return;
    }
    dispatch({
      type: 'purchasePlan/getDecisionInfo',
      payload: {
        refHeadId: refHeadId
      }
    }).then((res) => {
      if(res) {
        this.setState({
          decisionInfo: res
        }, () => {
          dispatch({
            type: 'purchasePlan/updateState',
            payload: {
              decisionFileUrlsUpdateState: res?.decisionFileUrls
            }
          })
        })
      }
    })
  }

  // 保存决策信息
  @Bind()
  saveDecisionInfo(params, refHeadId) {
    const { dispatch, purchasePlan } = this.props;
    const { decisionFileUrlsUpdateState } = purchasePlan;
    dispatch({
      type: 'purchasePlan/saveDecisionInfo',
      payload: [
        {
          id: params.id,
          decisionType: params.decisionType,
          decisionMeetingDate: params.decisionMeetingDate && dayjs(params.decisionMeetingDate).format(getDateTimeFormat()),
          decisionDate: params.decisionDate,
          decisionFileUrls: decisionFileUrlsUpdateState,
          refHeadId: refHeadId,
        }
      ]
    }).then((res) => {
      if(res) {
        this.handleDecisionInfo(refHeadId);
      }
    })
  }

  // 判断节点信息
  @Bind()
  getNode(val){
    const { dispatch } = this.props;
    dispatch({
      type: 'purchasePlan/judgementNode',
      payload: {
        formRecordId: val,
        templateCode:'BPM_SCM_YBCGFA'
      },
    }).then(res =>{
      // console.log(res,"判断节点的resssssss");
      if(res?.nextActivityCode == 'Start'){
        // 除了发起节点，都给disabled
        this.setState({
          todoFlag:'true'
        })
      }else {
        this.setState({
          todoFlag:'false'
        })
      }
    })
  }

  @Bind()
  getFileList(attachmentUUID){
    const { dispatch } = this.props;
    const bucketName = 'spfm-comp';
    dispatch({
      type:'purchasePlan/getFileList',
      payload:{
        attachmentUUID,
        bucketName
      }
    }).then((res)=>{
      if(res){
        this.setState({
          fileSource: res
        })
        console.log('ressssssss',res);
      }
    })
  }

  // 基本信息——————申请号！！！
  @Bind()
  getDataInit0(prNum,formRecordId) {
    // console.log(this.props?.location.state.fucInfo,'fucInfo调用时');
    const { dispatch } = this.props
    // const prNum = this.props?.location.state.fucInfo;
    dispatch({
      type: 'purchasePlan/getPrDetailData0',
      payload: {
        prNum: prNum || formRecordId ,
      },
    }).then(res => {
      // res.id = null
      console.log('res',res);
      dispatch({
        type: 'purchasePlan/updateState',
        payload: {
          // 申请进来没有文件信息
          headFromDataSource: {
            ...res.head,
            // 避免第一次进来反了id也重置为null
            id: res.head.id ? res.head.id : null,
          }, // 方案信息及方案负责人数据源
          lastPrNum: res?.head.prPlanNum, //方案编号
          prPlan: res?.head.prSuggestion,  //采购实施计划data0
          dataSpliceFlag : true ,  //init0时给true用作【项目概况】【采购实施计划】渲染值来自采购申请的Falg
          bidProInfo:res?.bidProInfo,
          // fileSource:res?.attach || [],
          purchaseId: res.head.id ? res.head.id : null, 
          projectCode: res.head.projectNumber,
          purchaseIdIframe: res?.head.refApplyHeadId, //申请iframe需要的id
          UUid : res?.attach?.[0]?.attachmentUuid || ''
        },
      })
      this.handleDecisionInfo(res?.head?.id);
      // 查询采购申请信息
      this.handleApplyInfo(res?.head?.refApplyHeadId);
      // 通过uuid查询基本信息附件信息
      if(res?.head?.attachUuid) {
        this.handleFileInfo(res?.head?.attachUuid);
      }
    })
  }

  @Bind()
  handleFileInfo(attachmentUUID) {
    queryFileList({
      tenantId: getCurrentOrganizationId(),
      bucketName: 'spfm-comp',
      attachmentUUID,
    }).then((fileInfoList) => {
      if (getResponse(fileInfoList)) {
        this.setState({
          fileInfoList,
        });
      }
    });
  }

  @Bind()
  handleApplyInfo(refApplyHeadId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchasePlan/getApplyInfo',
      payload: {
        id: refApplyHeadId,
      }
    }).then((res) => {
      if(res) {
        dispatch({
          type: 'purchasePlan/updateState',
          payload: {
            projectDesc: intl.get('HKPC.commom.view.title.projectoverviewcontent', {
              prReason: res?.prReason + '\n', // 采购原因
              proHis: res?.performanceHistory ? res?.performanceHistory + '\n' : '\n', // 历史执行情况
            }).d(`采购原因：${res?.prReason}\n采购内容：${res?.prReq}\n备注（给采购）：${res?.prBakup}\n备注（给供应商）：${res?.supBakup}`), // 拼的三个字段
            principleofWinning: intl.get('HKPC.commom.view.title.projecttechnicalcontent', {
              techSpec: res?.techSpecs ? res?.techSpecs + '\n' : '\n', // 技术规范
              delArr: res?.deliveryReqs ? res?.deliveryReqs + '\n' : '\n', // 交付要求
              techScoCriteria: res?.techScoCriteria ? res?.techScoCriteria + '\n' : '\n', // 技术评分细则建议
            }).d(`技术规范：${res?.techSpecs}\n交付要求：${res?.deliveryReqs}\n历史执行情况：${res?.performanceHistory}`), // 拼的三个字段
            projectreviewcontent: intl.get('HKPC.commom.view.title.projectreviewcontent', {
              supplierCriteria: res?.supplierCriteria ? res?.supplierCriteria + '\n' : '\n', // 供应商资格条件
              prBakup: res?.prBakup + '\n', // 备注（给采购）
              supBakup: res?.supBakup, // 备注（给供应商）
            }).d(`供应商资格条件:${res?.supplierCriteria}\n技术评分细则建议:${res?.techScoCriteria}\n`), // 拼的2个字段
            prPlan: intl.get('HKPC.commom.view.title.projectrequirement', {
              prReq: res?.prReq + '\n', // 采购内容
            }).d(`采购内容: ${res?.prReq}`)
          }
        })
      }
    })
  }

  // 基本信息-----方案号！！
  @Bind()
  getDataInit() {
    const searchParams = new URLSearchParams(window.location.search);
    // const prPlanNum = searchParams.get('id');
    const {dispatch, match, location: { search } } = this.props;
    const { id, formRecordId,tempId } = querystring.parse(search.substring(1));
    // console.log(id,'接收的id');
    // console.log(formRecordId,'接收的formRecordId');
    // console.log(tempId,'接收的tempId');
    const nFormRecordId = formRecordId ==='null' ? '' : formRecordId;
    
    const idValue = id  || tempId || nFormRecordId;
    this.getNode(idValue)
    // const prPlanNum = match.params.prPlanNum;
    dispatch({
      type: 'purchasePlan/getPrDetailData',
      payload: {
        prPlanNum: id  || tempId || formRecordId ,
      },
    }).then(res => {
      dispatch({
        type: 'purchasePlan/updateState',
        payload: {
          headFromDataSource: res?.head || {}, // 方案信息及方案负责人数据源
          // fileSource: res?.attach || [], // 采购方案-附件信息数据源
          // pacFormDataSource: res.pacAll || [], // 采购方案-标包基本信息数据源 ,
          // scoreDataSource: res.pacAll[this.state.tabId].score || [], // 技术评分表设置数据源 ,
          // quoteDataSource: res.pacAll[this.state.tabId].quote || [], // 报价表格式设置数据源 ,
          // judgeDataSource: res.pacAll[this.state.tabId].judge || [], // 评委组设置数据源 ,
          lastPrNum: res?.head.prPlanNum,
          bidProInfo:res?.bidProInfo,
          purchaseId: res.head.id ? res.head.id : null, //申请iframe需要的id
          projectCode: res.head.projectNumber,
          purchaseIdIframe: res?.head.refApplyHeadId,
          UUid : res?.attach?.[0]?.attachmentUuid || ''
        },
      })
      this.handleDecisionInfo(res?.head?.id);
      // 查询采购申请信息
      this.handleApplyInfo(res?.head?.refApplyHeadId);
      // 通过uuid查询附件信息
      if(res?.head?.attachUuid) {
        this.handleFileInfo(res?.head?.attachUuid);
      }
    })
  }

  // 流程穿越-查询项目id
  @Bind()
  searchProjectInfo(projectCode) {
    const { dispatch } = this.props;
    console.log('入参',projectCode);
    dispatch({
      type: 'purchasePlan/getProjectId',
      payload: {
        projectCode,
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'purchasePlan/updateState',
          payload: {
            projectId: res.projectId,
          },
        });
      }
    })
  }

  /**
   * @description 打开新建询价单Modal
   */
  @Bind()
  handleOpenModal() {
    this.setState({
      modalVisible: true,
    });
  }

  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  @Bind
  translateEbsCode(code) {
    const { idpValueMap = {} } = this.props;
    const valuelist = idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY'] || [];
    const { meaning } = valuelist.find((item) => item.value === code) || {};
    return meaning;
  }

  /**
   * 转义值集
   * @param {*} list - 值集列表
   * @param {*} value - 值
   */
  @Bind()
  getFastCode(list = [], value) {
    const item = list.find((e) => e.value === value);
    if (item) {
      return item.description;
    }
  }





  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const deleteFlag = data.every(item => item.enquiryPriceStatus === 'NEW');
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('HKPC.commom.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'resaleRfq/deleteEnquiryPriceByList',
            payload: data,
          }).then(res => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
            ;
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyDeleteNEW`).d('只能删除状态为“起草”的询价单'),
      });
    }
    ;
  }


  /**
   * @description 批量创建
   */
  @Bind()
  handleMassCreate() {
    const { history } = this.props;
    const { isPub } = this.state;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/ssrc/resale-rfq/batchImport`,
    });
  }

  @Bind()
  handleSubmit(onlySubmit = 'N') {
    const { dispatch } = this.props;
    const { selectSubmitData = [] } = this.state;
    dispatch({
      type: 'resaleRfq/submitValidateSummary',
      payload: selectSubmitData.map(item => {
        return {
          enquiryPriceId: item.enquiryPriceId,
          enquiryPriceRoundsId: item.enquiryPriceRoundsId,
        };
      }),
    }).then(r => {
      if (r) {
        dispatch({
          type: 'resaleRfq/submitSummary',
          payload: {
            enquiryPriceList: selectSubmitData,
            onlySubmit,
          },
        }).then(res => {
          if (res) {
            this.setState({
              submitModalVisible: false,
            });
            CusNotification.success();
            this.handleSearch();
          }
          ;
        });
      }
      ;
    });
  }

  // @Bind
  // handlePackageChecked = (packageNum) => {
  //   const { history } = this.props;
  //   // history.push(`/ssrc-hk/purchase-plan-list/sub-package/${pacNum}`);
  //   history.push(`/ssrc-hk/purchase-plan-list/sub-package/${packageNum}`);
  // }

  @Bind
  handlePackageChecked = (packageNum) => {
    const { match ,purchasePlan} = this.props;
    const {lastPrNum} = purchasePlan
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const url = `${isPub ? '/pub' : ''}/sspo/isErpInfo/query/${lastPrNum}`
    this.handleSave((params) => {
      if(params) {
        setTimeout(() => {
          window.open(url, '_blank');
          console.log(lastPrNum,'方案编号(项目设置)');
        }, 800);
      }
    });
  }

  // 生成主包编号【保存】
  @Bind
  handleSave(callback) {
    const { dispatch, match ,purchasePlan} = this.props
    const { headFromDataSource,UUid } = purchasePlan
    if(this.state?.tempId){
      headFromDataSource['id'] = this.state?.tempId
    }

    this.planInfoForm.validateFields((err, values)=>{
      if(!err){
        dispatch({
          type:'purchasePlan/prPlanSave',
          payload :{
            attach:[{attachmentUuid: UUid}],
            head:{
              ...headFromDataSource,
              supplement: values.supplement,
              winPrinciple: values.winPrinciple,
            }
          }
        }).then((r)=>{
          if(r){
            this.setState({
              isControlMainShow : true,
              listIntoFlag: 'true',
              pacContent:true,//生成主包了，
              tempId: r.head.id
            })
            // 把主包信息生成出来！！！！！！！！！！
            dispatch({
              type:'purchasePlan/updateState',
              payload :{
                bidProInfo:r.bidProInfo,
              }
            })
            if (typeof callback === 'function') {
              callback({
                tempId: r?.head?.id,
                ...r.bidProInfo,
                amount: headFromDataSource?.estimatedBudgetAmountHkd,
                applyUserCode: headFromDataSource?.applyUserCode,
                ppname: headFromDataSource?.prPlanName,
                ppNumber: headFromDataSource?.prPlanNum,
                decisionType: values.decisionType === 'ecMeeting' ? 'EC' : 'PC',
              });
            }
            CusNotification.success();
            this.saveDecisionInfo(values, r?.head?.id);
          }
        })
      }else {
        CusNotification.warning({
          message: intl.get('HKPC.commom.view.title.submitprompt').d('有必填字段未填写，请检查表单数据')
        })
      }
    })
  }

  @Bind
  handleChangePage (){
    const { dispatch, match ,purchasePlan} = this.props;
    // 采购方案编号
    const {lastPrNum} =  purchasePlan;
    dispatch({
      type:'purchasePlan/goToPage',
      payload :{
        prPlanNum:lastPrNum
      }
    }).then((res)=>{
      if(res.code == '200'){
        const url = '/pub/sspo/online-purchase/list';
        window.open(url, '_blank');
      }else {
        CusNotification.error({
          message: intl.get(`tips.onlyDeleteNEW`).d('错误'),
        });
      }
    })

  }


  // 获取评委信息
  @Bind 
  getBudgeInfo =(time)=>{
    const {dispatch ,purchasePlan} = this.props
    const {allProId} = purchasePlan
    // console.log(allProId,'allProIdallProIdallProId');
     if(allProId.length> 1){
      dispatch({
        type: 'purchasePlan/getJudgeInfo',
        payload: {
          proId: time === 'init' ? allProId[0] : allProId[time],
        },
      }).then(res=>{
        if(res){
          dispatch({
            type: 'purchasePlan/updateState',
            payload: {
              budgeInfo: res.page.content,
              selectInfo: res.judgesCount,
              proId: time === 'init' ? allProId[0] : allProId[time]
            },
          })
        }
      })
      // 调用邀请供应商接口
      dispatch({
        type: 'purchasePlan/getSupplierList',
        payload: {
          proId: time === 'init' ? allProId[0] : allProId[time],
        }
      }).then((res) => {
        this.setState({
          supplierList: res.content || [],
          supplierPagination: createPagination(res)
        })
      })
     }else {
      // 项目设置来的主标包没有分标包时
      dispatch({
        type: 'purchasePlan/getJudgeInfo',
        payload: {
          proId: allProId[0],
        },
      }).then(res=>{
        if(res){
          dispatch({
            type: 'purchasePlan/updateState',
            payload: {
              budgeInfo: res.page.content,
              selectInfo: res.judgesCount,
              proId: allProId[0]
            },
          })
        }
      })
      // 调用邀请供应商接口
      dispatch({
        type: 'purchasePlan/getSupplierList',
        payload: {
          proId: allProId[0],
        }
      }).then((res) => {
        if(res) {
          this.setState({
            supplierList: res.content || [],
            supplierPagination: createPagination(res)
          })
        }
      })
     }
  }

    // 获取【是否客观分】【分值类型】
    @Bind 
    // @Debounce(200)
    getBothData2 =(time)=>{
      const {dispatch ,purchasePlan} = this.props
      const {allProId} = purchasePlan
      if(allProId.length > 1){
        dispatch({
          type: 'purchasePlan/getBothData',
          payload: {
            proId: time === 'init' ? allProId[0] : allProId[time],
          },
        }).then(res=>{
          if(res){
            // console.log('评委组',res);
            dispatch({
              type: 'purchasePlan/updateState',
              payload: {
                bothInfo: res,
                proId: time === 'init' ? allProId[0] : allProId[time],
              },
            })
          }
        })
       }else {
        dispatch({
          type: 'purchasePlan/getBothData',
          payload: {
            proId: allProId[0],
          },
        }).then(res=>{
          if(res){
            // console.log('评委组',res);
            dispatch({
              type: 'purchasePlan/updateState',
              payload: {
                bothInfo: res,
                proId: allProId[0]
              },
            })
          }
        })
       }
    }

  @Bind 
  changeInfo(data){
    if(data?.length >= 2){
      this.setState({
        isOverTwoInfo : true
      })
      data?.shift();
      return data = data.map((item)=>{
        return {
          ...item,
          lastFlag:this.changeFlag(item)
        }
      })
    }else {
      return data
    }
  }

  @Bind
  changeFlag(val){
    if(val['procurementType'] == 'public_bidding' || val['procurementType'] == 'invited_bidding'){
      return true
    }else {
      return false
    }
  }


  // 获取子标包信息
  @Bind
  getSmallPac(){
    const { dispatch, match,purchasePlan } = this.props
    // 采购方案编号
    // const prPlanNum = match.params.prPlanNum;
    const searchParams = new URLSearchParams(window.location.search);
    const prPlanNum = searchParams.get('prPlanNum');
    const {lastPrNum,headFromDataSource,smallPacInfo} = purchasePlan
    // console.log(lastPrNum,'初始化调用子标包信息的（方案编号）');

    // 因为这个接口如果不要参数的话会请求到所有标包信息
    lastPrNum && dispatch({
      type:'purchasePlan/getSmallPac',
      payload:{
        prPlanNum:lastPrNum
      }
    }).then((res)=>{
      // console.log('res.packageContent分标包数据+++++++++++++',res?.packageContent);
      // console.log('res.packageContent的length长度+++++++++++++',res?.packageContent.length);
      let renderSmallPacFlag = false;
      res?.packageContent.map((item)=>{
        if(item.packageName){
          renderSmallPacFlag = true;
        }
      })
      const packageContentFlag = res?.packageContent ? renderSmallPacFlag : false
      if(res?.packageContent.length !== 0 && packageContentFlag){
        this.setState({
          // 子标包有数据了
          smallHaveData: true
        })
        // this.getDataInit();
        dispatch(
          {
            type:'purchasePlan/updateState',
            payload:{
              // 子标包信息存储
              // smallPacInfo:res.packageContent,
              smallPacInfo:this.changeInfo(res.packageContent),
              allProId:res.packageContent.map((item)=>{
                  return item.proId
                })
              }
            }
        )
        this.getBudgeInfo('init');
        this.getBothData2('init');
      }


        //获取子标包的采购方式 
        // const { smallPacInfo,headFromDataSource} = this.props;
        // const amountK = headFromDataSource?.estimatedBudgetAmountHkd;
        // // 金额在50<amount<100 为true
        // const amountFlage = (Number(amountK) >= 500000 && Number(amountK) <= 1000000) ? true : false;
        // const procurementType =  this.changeInfo(res?.packageContent)[0]['procurementType'];
        // // console.log('0000000',this.changeInfo(res?.packageContent)[0]['procurementType']);
        // if((procurementType == 'public_inquiry' || procurementType == 'invitation_inquiry' || procurementType == 'single_source' || procurementType == 'internal_source' || procurementType == 'direct_negotiation') && amountFlage ){
        //   this.setState ({
        //     isControlJud : false
        //   })
        // }else if((procurementType == 'single_source' || procurementType == 'internal_source') && !amountFlage){
        //   this.setState ({
        //     isControlJud : false
        //   })
        // }
        // console.log('procurementType', procurementType)
    })
  }

    // 接收子组件传递过来的文件信息
    @Bind()
    getFatherFileList(fileList) {
      const { purchaseApplicationModel, dispatch } = this.props;
      console.log(fileList,'————————————————————————');
      dispatch({
        type: 'purchasePlan/updateState',
        payload: {
          fileSource: fileList,
          // attachDataSource:fileList
        },
      });
      // console.log(fileList);
      // const { attachmentSource } = this.state;
      // attachmentSource.push(fileList[0]);
      // const filteredArr = attachmentSource.filter(item => item.refType !== '');
      // console.log(filteredArr);
      // this.setState({
      //   attachmentSource: filteredArr,
      // });
    }

    //致远流程
  @Bind()
  listener() {
    // debugger
    const { location: { search },purchasePlan,dispatch } = this.props
    const { headFromDataSource} = purchasePlan
    const { id, formRecordId } = querystring.parse(search.substring(1));
    const amountK = headFromDataSource?.estimatedBudgetAmountHkd;
    // 金额在50<amount<100 为true
    const amountFlage = (Number(amountK) >= 500000 && Number(amountK) <= 1000000) ? true : false;
    // console.log(formRecordId,'formRecordId++++++');
    console.log('amountK', amountK)
    console.log('amountFlage', amountFlage)
    top?.postMessage({ hasListener: true }, '*');
    
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 退回流程
        if (['BACK'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            // console.log('params+++++++++++',params);
            // console.log(headFromDataSource?.amount,'金额');
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  // actionInfo: {
                  //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                  // },
                  formData: {
                    formRecordId: id || params.tempId || formRecordId !== 'null', //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPPReject', {
                        prNumber: params.ppNumber,
                        prName: params.ppname,
                        amount: numberRender(params.amount, 4),
                      })
                      .d(`采购方案驳回-关于${params.ppNumber}:${params.ppname}采购方案驳回`), //待办流程名称, //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmPPReject', {
                        prNumber: params.ppNumber,
                        prName: params.ppname,
                        amount: numberRender(params.amount, 4),
                      })
                      .d(`采购方案驳回-关于${params.ppNumber}:${params.ppname}采购方案驳回`),
                    //下面内容为表单数据
                    ...params,
                    jine: params?.amount, //金额
                    xuqiuren: params?.applyUserCode, // 需求人
                    huiyileixing: params?.decisionType, // 会议类型
                  },
                },
                e.data.url
              );
            }
          });
          return;
        }
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'UNDO', 'NOTICE', 'GIVE', 'PROCESS_SHOW', 'SEND'].includes(e.data.submitType)) {
          if(['SEND'].includes(e.data.submitType)) {
            const { location: { search },purchasePlan,dispatch } = this.props
            const { headFromDataSource} = purchasePlan
            const { id, formRecordId } = querystring.parse(search.substring(1));
            const amountK = headFromDataSource?.estimatedBudgetAmountHkd;
            // 金额在50<amount<100 为true
            const amountFlage = (Number(amountK) >= 500000 && Number(amountK) <= 1000000) ? true : false;
            // console.log(formRecordId,'formRecordId++++++');
            console.log('amountK', amountK)
            console.log('amountFlage', amountFlage)
        
            dispatch({
              type: 'purchasePlan/getDataCheck',
              payload: {
                proCode: headFromDataSource?.prPlanNum,
                whetMill: amountFlage ? 'NO' : 'YES'
              }
            }).then((res) => {
              if(res.message === 'YES') {
                this.handleSave((params) => {
                  // console.log('params+++++++++++',params);
                  // console.log(headFromDataSource?.amount,'金额');
                  if (params) {
                    top?.postMessage(
                      {
                        success: true, //表单数据验证成功或不需要验证时传true，否则传false
                        submitType: e.data.submitType, //将此字段值回传
                        messageType: 'GET_FORM_DATA', //获取表单数据消息
                        // actionInfo: {
                        //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                        // },
                        formData: {
                          formRecordId: id || params.tempId || formRecordId !== 'null', //表单记录id（Long）
                          // caseSender: getCurrentUser().loginName, // 致远需要再提供
                          affairTitle: intl
                            .get('HKPC.commom.view.title.bpmPPApproval', {
                              prNumber: params.ppNumber,
                              prName: params.ppname,
                              amount: numberRender(params.amount, 4),
                            })
                            .d(`采购方案审批-关于${params.ppNumber}:${params.ppname}采购方案审批`), //待办流程名称, //待办流程名称
                          subject: intl
                            .get('HKPC.commom.view.title.bpmPPApproval', {
                              prNumber: params.ppNumber,
                              prName: params.ppname,
                              amount: numberRender(params.amount, 4),
                            })
                            .d(`采购方案审批-关于${params.ppNumber}:${params.ppname}采购方案审批`),
                          //下面内容为表单数据
                          ...params,
                          jine: params?.amount, //金额
                          xuqiuren: params?.applyUserCode, // 需求人
                          huiyileixing: params?.decisionType, // 会议类型
                        },
                      },
                      e.data.url
                    );
                  }
                });
              }
            })
          } else {
            this.handleSave((params) => {
              // console.log('params+++++++++++',params);
              // console.log(headFromDataSource?.amount,'金额');
              if (params) {
                top?.postMessage(
                  {
                    success: true, //表单数据验证成功或不需要验证时传true，否则传false
                    submitType: e.data.submitType, //将此字段值回传
                    messageType: 'GET_FORM_DATA', //获取表单数据消息
                    // actionInfo: {
                    //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                    // },
                    formData: {
                      formRecordId: id || params.tempId || formRecordId !== 'null', //表单记录id（Long）
                      // caseSender: getCurrentUser().loginName, // 致远需要再提供
                      affairTitle: intl
                        .get('HKPC.commom.view.title.bpmPPApproval', {
                          prNumber: params.ppNumber,
                          prName: params.ppname,
                          amount: numberRender(params.amount, 4),
                        })
                        .d(`采购方案审批-关于${params.ppNumber}:${params.ppname}采购方案审批`), //待办流程名称, //待办流程名称
                      subject: intl
                        .get('HKPC.commom.view.title.bpmPPApproval', {
                          prNumber: params.ppNumber,
                          prName: params.ppname,
                          amount: numberRender(params.amount, 4),
                        })
                        .d(`采购方案审批-关于${params.ppNumber}:${params.ppname}采购方案审批`),
                      //下面内容为表单数据
                      ...params,
                      jine: params?.amount, //金额
                      xuqiuren: params?.applyUserCode, // 需求人
                      huiyileixing: params?.decisionType, // 会议类型
                    },
                  },
                  e.data.url
                );
              }
            });
          }
        } else {
          this.handleSave((params) => {
            if (params) {
              console.log('params_______',params);
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  // actionInfo: {
                  //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                  // },
                  formData: {
                    formRecordId: id || params.tempId || formRecordId !== 'null', //表单记录id（Long）
                    // caseSender: getCurrentUser().loginName, // 致远需要再提供
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPPApproval', {
                        prNumber: params.ppNumber,
                        prName: params.ppname,
                        amount: numberRender(params.amount, 4),
                      })
                      .d(`采购方案审批-关于${params.ppNumber}:${params.ppname}采购方案审批`), //待办流程名称, //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmPPApproval', {
                        prNumber: params.ppNumber,
                        prName: params.ppname,
                        amount: numberRender(params.amount, 4),
                      })
                      .d(`采购方案审批-关于${params.ppNumber}:${params.ppname}采购方案审批`),
                    //下面内容为表单数据
                    ...params,
                    jine: params?.amount, //金额
                    xuqiuren: params?.applyUserCode, // 需求人
                    huiyileixing: params?.decisionType, // 会议类型
                  },
                },
                e.data.url
              );
            }
          });
        }
      }
    });
  }

  @Bind()
  handleTabChange(activeKey = '') {
    const {purchasePlan} = this.props;
    const { projectCode } =  purchasePlan;
    // console.log(activeKey, 'activeKey');
    this.setState({
      tabKey: activeKey,
    });
    this.searchProjectInfo(projectCode);
  }

  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      form,
      purchasePlan,
      dispatch,
      match,
    } = this.props;
    //判断当前页面是否为菜单页面跳转而来
    // const listIntoFlag = match.params.listIntoFlag;
    
    const {
      headFromDataSource,
      attachDataSource,
      pacFormDataSource,
      scoreDataSource,
      quoteDataSource,
      judgeDataSource,
      bidProInfo,
      smallPacInfo,
      allProId,
      budgeInfo,
      bothInfo,
      selectInfo,
      proId,
      lastPrNum,
      projectDesc,
      principleofWinning,
      projectreviewcontent,
      prPlan,
      dataSpliceFlag,
      delSelectedRows,
      projectId,
      purchaseIdIframe,
      UUid,
    } = purchasePlan
    console.log('UUid',UUid);
    console.log('purchasePlan',purchasePlan);
    // console.log(projectId,'!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    const {
      activeKey,
      searchTabActiveKey,
      tabId,
      isControlMainShow,
      pacContent,
      listIntoFlag,
      todoFlag,
      tabActiveKey,
      tabKey,
      isControlJud,
      isOverTwoInfo,
      fileSource,
      supplierList,
      supplierPagination,
      decisionInfo,
      fileInfoList,
    } = this.state;
    // console.log(pacContent,'pacContent');

    const { getFieldDecorator = (e) => e } = form
    const searchParams = new URLSearchParams(window.location.search);
    // const fucFlag = searchParams.get('flag') == 'true' ? 'true' : 'false';

    // <------------------------------------>
    const filterSearchProps = {
      form,
      headFromDataSource
    }

    const projectManagerProps = {
      form,
      headFromDataSource
    }

    const planInfoProps = {
      form,
      onRef:(node)=>{
        this.planInfoForm = node.props.form;
      },
      headFromDataSource,
      attachDataSource,
      idpValueMap,
      listIntoFlag,
      fileSource,
      dispatch,
      projectDesc,
      principleofWinning,
      projectreviewcontent,
      prPlan,
      dataSpliceFlag,
      todoFlag,
      delSelectedRows,
      purchasePlan,
      fileDataSource: fileInfoList,
    }

    const getTabId = (thisTabId) => {
      this.setState({
        tabId: thisTabId
      })
      // this.getDataInit()
    }

    const packageInfoProps = {
      form,
      headFromDataSource,
      pacFormDataSource, scoreDataSource, quoteDataSource, judgeDataSource,
      getTabId,
      dispatch,
      idpValueMap,
      isControlMainShow ,  // 判断是不是主包信息
      bidProInfo, //主包信息
      smallPacInfo, //所有信息（主包+子包）
      allProId, // 所有proId
      budgeInfo, //针对性的评委组数据
      bothInfo,//【是否客观分+分值类型】
      match,
      selectInfo,// 默认展示下拉框的值
      proId,
      lastPrNum, //采购方案编号！！
      getBudgeInfo:this.getBudgeInfo, //获取评委数据方法
      getBothData2:this.getBothData2, //获取both的方法
      fatherFun:this.fatherFun ,
      todoFlag,
      isControlJud,
      isOverTwoInfo,
      supplierList: supplierList,
      supplierPagination: supplierPagination,
    }
    // console.log(lastPrNum,'方案编号index');
    // 标包编号
    // 修改修改
    const packageNum = pacFormDataSource[tabId];
    // console.log(listIntoFlag,'listIntoFlag');
    // console.log(isControlMainShow,'isControlMainShow');
    // console.log(purchaseIdIframe);

    const decisionInfoProps = {
      ...this.props,
      todoFlag,
      headFromDataSource,
      decisionInfo,
    };

    // 根据采购申请类型判断小于等于100万的隐藏
    const isShowContent = !['simpleInquiry1', 'generalProcurement1', 'frameworkProcurement1', 'frameworkProcurement2', 'frameworkProcurement3'].includes(headFromDataSource?.prType);

    console.info('activityCode', activityCode);

    const messageTitle = (() => {
      if (todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft') {
        return intl.get('HKPC.commom.view.title.procurementPlanEdit').d('起草采購方案');
      } else {
        if(activityCode === 'SCM03') {
          return intl.get('HKPC.commom.view.title.procurementPlanVerify').d('核對采購方案');
        }
        if(['SCM04', 'SCM05', 'DSZ'].includes(activityCode)) {
          return intl.get('HKPC.commom.view.title.procurementPlanApproval').d('審批采購方案');
        }
      }
    })();

    return (
      <>
      {!['DONE', 'SENT'].includes(state) && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45', margin: '0 0 16px 0' }}
        />}
        <PageWrapper loading={fetchLoading}>
          <div style={{margin: '-16px'}}>
            {headFromDataSource?.projectNumber !== 'INVENTORY' && <Collapse
              className="customize-collapse"
              defaultActiveKey={activeKey}
              onChange={(collapseKeys) => {
                this.setState({ activeKey: collapseKeys });
              }}
            >
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`HKPC.commom.view.title.basicinformation`).d('基本信息')}
                    arrowActive={activeKey.includes('form')}
                  />
                }
                key="form"
              >
                <FilterSearch  {...filterSearchProps} />
              </Panel>
            </Collapse>}
            <div className={styles['tab-style']} style={{marginTop: '16px'}}>
              <CusTabs
                defaultActiveKey={'purchase'}
                onChange={this.handleTabChange}
                items={[
                  headFromDataSource?.projectName && {
                    label: intl.get(`HKPC.commom.view.title.CreateProject`).d('立项'),
                    key: 'approval',
                    children: (
                      <div style={{ height: '100vh' }}>
                        <iframe
                          style={{ width: '100%', height: '100%' }}
                          src={`${ERP_HOST}/root/finance/projectInformation/update?id=${projectId}`}
                          width="100%"
                          height="100% !important"
                          frameBorder="0"
                        />
                      </div>
                    ),
                  },
                  {
                    label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
                    key: 'purchase',
                    children: (
                      <div className={styles['cusTabs-panelBody']}>
                      <div style={{ display: 'flex' }} className={styles['tab-panel']}>
                        <div
                          className={
                            searchTabActiveKey === 'purchase' ? styles['tab-panel-active'] : styles['tab-panel-default']
                          }
                          onClick={() => this.setState({ searchTabActiveKey: 'purchase' })}
                        >
                          <div className={styles['tab-panel-title']}>
                            {intl.get(`${promptCode}.view.title.ProcurementRequisition`).d('采购申请')}
                          </div>
                          {searchTabActiveKey === 'purchase' && <div className={styles['tab-panel-active-line']} />}
                        </div>
                        <div style={{marginRight: '36px'}}>|</div>
                        <div
                          className={
                            searchTabActiveKey === 'procurement'
                              ? styles['tab-panel-active']
                              : styles['tab-panel-default']
                          }
                          onClick={() => {
                            this.setState({ searchTabActiveKey: 'procurement' });
                          }}
                        >
                          <div className={styles['tab-panel-title']}>
                            {intl.get(`HKPC.commom.view.title.ProcurementScheme`).d('采购方案')}
                          </div>
                          {searchTabActiveKey === 'procurement' && <div className={styles['tab-panel-active-line']} />}
                        </div>
                      </div>

                      {searchTabActiveKey === 'purchase' ? (
                        <div style={{ height: '100vh' }}>
                          <iframe
                            style={{ width: '100%', height: '100%' }}
                            src={`${this.state.isPub ? '/pub' : ''}/ssrc-hk/purchaseApplicationErp/edit?id=${purchaseIdIframe}`}
                            width="100%"
                            height="100% !important"
                            frameBorder="0"
                          />
                        </div>
                      ) : (
                        <>
                          <Collapse
                            className="customize-collapse"
                            defaultActiveKey={activeKey}
                            onChange={(collapseKeys) => {
                              this.setState({ activeKey: collapseKeys });
                            }}
                          >
                            {/* <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl.get(`HKPC.commom.view.title.Plandirector`).d('方案负责人')}
                                  arrowActive={activeKey.includes('projectManagerTab')}
                                />
                              }
                              key="projectManagerTab"
                            >
                              <ProjectManager {...projectManagerProps} />
                            </Panel> */}
                            <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl.get(`HKPC.commom.view.title.SchemeInformation`).d('方案信息')}
                                  arrowActive={activeKey.includes('planInfoTab')}
                                />
                              }
                              key="planInfoTab"
                            >
                              <PlanInfo getFatherFileList={this.getFatherFileList.bind(this)} {...planInfoProps} />
                            </Panel>
                            {isShowContent && <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl.get(`bid.bidcommon.view.title.meetingjiyao`).d('决策记录')}
                                  arrowActive={activeKey.includes('decisionInfoTab')}
                                />
                              }
                              key="decisionInfoTab"
                            >
                              <DecisionInfo {...decisionInfoProps} />
                            </Panel>}
                            <Panel
                              showArrow={false}
                              header={
                                <PanelHeader
                                  title={intl.get(`HKPC.commom.view.title.projectinformation`).d('项目基本信息')}
                                  arrowActive={activeKey.includes('stageTab')}
                                  showArrow={true}
                                  buttons={(todoFlag == 'true' || headFromDataSource?.prPlanStatus == 'PP_Draft') && <CusButton onClick={() => {
                                    this.handlePackageChecked(packageNum)
                                  }}>{intl.get(`HKPC.commom.view.title.ProjectSettings`).d('项目设置')}</CusButton>}
                                />
                              }
                              key="stageTab"
                            >
                              {smallPacInfo.length > 0 && <PackageInfo {...packageInfoProps} />}
                              {/* <div style={{ fontWeight: 700 }}>
                                {intl.get(`HKPC.commom.view.title.PackageInformation`).d('标包信息')}
                              </div>
                              <PackageInfo {...packageInfoProps} /> */}
                            </Panel>
                          </Collapse>
                        </>
                      )}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </PageWrapper>
        {/* { true  &&
          <CusApprovalButtons
          children={
            <>
              <CusButton onClick={this.handleSave}>
                {intl.get(`hzero.common.view.button.save`).d('保存')}
              </CusButton>
              <CusButton onClick={this.handleChangePage}>
              跳转
            </CusButton>
          </>
          }
        ></CusApprovalButtons>} */}
      </>
    );
  }
}
