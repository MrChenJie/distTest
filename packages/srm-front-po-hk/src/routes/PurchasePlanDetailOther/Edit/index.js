import React from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { isEqual } from 'lodash';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';

import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import PlanInfo from './PlanInfo'
import ProjectManager from './ProjectManager'
import PackageInfo from './PackageInfo'
import styles from './index.less';
import classnames from 'classnames';
import { Form } from 'hzero-ui';
import { getDFormGridSpan } from '_cus_utils/utils';
import DecisionInfo from '@/routes/PurchasePlanDetail/Edit/DecisionInfo';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const tempCode = 'hzero.common'
const { Panel } = Collapse;

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

@formatterCollections({ code: [promptCode,tempCode, 'bid.bidcommon'] })

export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm

  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'projectManagerTab', 'planInfoTab', 'uploadTable', 'inquireInfoTab', 'stageTab', 'pacInfo', 'decisionInfoTab'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      SearchTabActiveKey: '0',
      tabId: "0", // 标包信息的id
      isControlMainShow: false, // 点击上方保存按钮的flag

      pacContent : true , //待办进来的
      listIntoFlag : true,
      smallHaveData : false , //子标包有数据
      todoFlag :'',
      fileSource: [],
      decisionInfo: {}, // 决策信息
      isOverTwoInfo: false,
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

  componentDidMount() {
    // 如果是方案进来的走方案号
    // const fucFlag = this.props.location.state
    const searchParams = new URLSearchParams(window.location.search);
    const fucFlag = searchParams.get('flag');
    const prNum = searchParams.get('prNumber');
    const { location: { search } } = this.props;
    const { id, formRecordId } = querystring.parse(search.substring(1));
    console.log(fucFlag,'fucFlag');
    console.log(prNum,'prNum');
    if(fucFlag == 'true'){
      this.getDataInit0(prNum,formRecordId);
      this.handleDecisionInfo(id);
      this.setState({
        todoFlag : 'true'
      })
    }else {
      this.getDataInit();
      this.handleDecisionInfo(id);
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
     },800)

    //  if(fucFlag !== 'true'){
      // 从列表进
      //  this.listener();
    // }
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
          projectDesc: res?.head.prReason + res?.head.prReq + res?.head.prBakup + res?.head.supBakup, // 拼的三个字段
          prPlan: res?.head.prSuggestion,  //采购实施计划data0
          dataSpliceFlag : true ,  //init0时给true用作【项目概况】【采购实施计划】渲染值来自采购申请的Falg
          bidProInfo:res?.bidProInfo,
          // fileSource:res?.attach || [],
          UUid : res?.attach?.[0]?.attachmentUuid || ''
        },
      })
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
          UUid : res?.attach?.[0]?.attachmentUuid || ''
        },
      })
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

  @Bind
  // 链接到sspo分标包页面（杰哥页面）
  handlePackageChecked = (packageNum) => {
    const { match ,purchasePlan} = this.props;
    const {lastPrNum} = purchasePlan
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const url = `${isPub ? '/pub' : ''}/sspo/isErpInfo/query/${lastPrNum}`
    this.handleSave1();
    setTimeout(() => {
      window.open(url, '_blank');
      console.log(lastPrNum,'方案编号(项目设置)');
    }, 800);
  }

  // 生成主包编号【保存】
  @Bind
  handleSave1(callback) {
    const { dispatch, match ,purchasePlan} = this.props
    const { headFromDataSource, attachDataSource,fileSource } = purchasePlan
    if(this.state?.tempId){
      headFromDataSource['id'] = this.state?.tempId
    }
    this.planInfoForm.validateFields((err)=>{
      if(!err){
        dispatch({
          type:'purchasePlan/prPlanSave',
          payload :{
            attach:fileSource,
            head:headFromDataSource
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
              callback({tempId:r?.head?.id, ...r.bidProInfo,amount: headFromDataSource?.estimatedBudgetAmount,applyUserCode:headFromDataSource?.applyUserCode});
            }
            const searchParams = new URLSearchParams(window.location.search);
            const prPlanNum = searchParams.get('prPlanNum');
            // window.close()
            CusNotification.success();
          }
        })
      }else {
        console.log(err,'err');
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
    console.log(allProId,'allProIdallProIdallProId');
     if(allProId.length> 1){
      dispatch({
        type: 'purchasePlan/getJudgeInfo',
        payload: {
          proId: allProId[time],
        },
      }).then(res=>{
        if(res){
          console.log('评委组',res);
          dispatch({
            type: 'purchasePlan/updateState',
            payload: {
              budgeInfo: res.page.content,
              selectInfo: res.judgesCount,
              proId: allProId[time]
            },
          })
        }
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
          console.log('评委组',res);
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
     }
  }

    // 获取【是否客观分】【分值类型】
    @Bind 
    // @Debounce(200)
    getBothData2 =(time)=>{
      const {dispatch ,purchasePlan} = this.props
      const {allProId} = purchasePlan
      if(allProId.length > 1){
         console.log(allProId,'allProId222222');
        dispatch({
          type: 'purchasePlan/getBothData',
          payload: {
            proId: allProId[time],
          },
        }).then(res=>{
          if(res){
            // console.log('评委组',res);
            dispatch({
              type: 'purchasePlan/updateState',
              payload: {
                bothInfo: res,
                proId: allProId[time]
              },
            })
          }
        })
       }else {
        console.log(allProId,'allProId0000');
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
    const {lastPrNum} = purchasePlan
    console.log(lastPrNum,'初始化调用子标包信息的（方案编号）');

    // 因为这个接口如果不要参数的话会请求到所有标包信息
    lastPrNum && dispatch({
      type:'purchasePlan/getSmallPac',
      payload:{
        prPlanNum:lastPrNum
      }
    }).then((res)=>{
      console.log('res.packageContent分标包数据+++++++++++++',res?.packageContent);
      console.log('res.packageContent的length长度+++++++++++++',res?.packageContent.length);
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
        this.getBudgeInfo(1)
        this.getBothData2(1)
      }
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
    console.log(formRecordId,'formRecordId++++++');
    top?.postMessage({ hasListener: true }, '*');
    
    window.addEventListener('message', (e) => {
      console.log(e,'e');
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'UNDO', 'NOTICE', 'GIVE', 'PROCESS_SHOW', 'SEND'].includes(e.data.submitType)) {
          this.handleSave1((params) => {
            console.log('params+++++++++++',params);
            console.log(headFromDataSource?.amount,'金额');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                // actionInfo: {
                //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                // },
                formData: {
                  formRecordId: id || params.tempId || formRecordId !=='null' ,//表单记录id（Long）
                  // caseSender: getCurrentUser().loginName, // 致远需要再提供
                  affairTitle: '采购方案', //待办流程名称
                  //下面内容为表单数据
                  ...params,
                  jine:params?.amount, //金额
                  xuqiuren:params?.applyUserCode // 需求人
                },
              }, e.data.url);
            }
          });
        } else {
          this.handleSave1((params) => {
            if (params) {
              console.log('params_______',params);
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                // actionInfo: {
                //   preventClose: !['SEND', 'AGREE'].includes(e.data.submitType), // 阻止页面关闭
                // },
                formData: {
                  formRecordId: id  || params.tempId || formRecordId !=='null',//表单记录id（Long）
                  // caseSender: getCurrentUser().loginName, // 致远需要再提供
                  affairTitle: '采购方案', //待办流程名称
                  //下面内容为表单数据
                  ...params,
                  jine:params?.amount, //金额
                },
              }, e.data.url);
            }
          });
        }
      }
    });
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
    
    const { headFromDataSource,attachDataSource, pacFormDataSource, scoreDataSource, quoteDataSource, judgeDataSource,bidProInfo,smallPacInfo,allProId,budgeInfo,bothInfo,selectInfo,proId,lastPrNum,projectDesc,prPlan,dataSpliceFlag,delSelectedRows,UUid, } = purchasePlan
    // console.log(smallPacInfo,'!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    const { activeKey, tabId, isControlMainShow ,listIntoFlag,todoFlag,fileSource, decisionInfo, isOverTwoInfo } = this.state;
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
      prPlan,
      dataSpliceFlag,
      todoFlag,
      delSelectedRows,
      purchasePlan
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
      isOverTwoInfo,
    }
    // console.log(lastPrNum,'方案编号index');
    // 标包编号
    // 修改修改
    const packageNum = pacFormDataSource[tabId];
    // console.log(listIntoFlag,'listIntoFlag');
    // console.log(isControlMainShow,'isControlMainShow');

    const decisionInfoProps = {
      ...this.props,
      decisionInfo,
    }

    // 根据采购申请类型判断小于等于100万的隐藏
    const isShowContent = !['simpleInquiry1', 'generalProcurement1', 'frameworkProcurement1', 'frameworkProcurement2', 'frameworkProcurement3'].includes(headFromDataSource?.prType);

    return (
      <>
        <PageWrapper loading={fetchLoading}>
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
                    title={intl.get(`bid.bidcommon.view.title.meetingjiyao`).d('上会纪要')}
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
                <Collapse
                  className={classnames('customize-collapse', styles['show-border'])}
                  defaultActiveKey={activeKey}
                  onChange={(collapseKeys) => {
                    this.setState({ activeKey: collapseKeys });
                  }}
                >
                  <Panel
                    showArrow={false}
                    header={
                      <PanelHeader
                        verticalLine={false}
                        title={intl.get(`HKPC.commom.view.title.PackageInformation`).d('标包信息')}
                        arrowActive={activeKey.includes('pacInfo')}
                      />
                    }
                    key="pacInfo"
                  >
                    <PackageInfo {...packageInfoProps} />
                  </Panel>
                </Collapse>
              </Panel>
            </Collapse>
          </>
        </PageWrapper >
      </>
    );
  }
}
