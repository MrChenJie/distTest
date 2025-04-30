/**
 * index.js - 评委评分
 * @date: 2022-04-07
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Row, Col, Collapse, Form, Upload } from 'antd';
import CusButton from '_cus_components/CusButton';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import { Bind, Debounce } from 'lodash-decorators';
import { cloneDeep, pullAllBy, isUndefined } from 'lodash';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './FilterForm';
import TenderDocuments from './TenderDocuments'; // 招标文件
import BiddingDocuments from './BiddingDocuments'; // 投标文件
import PriceDocuments from './PriceDocuments'; // 报价文件
import TechCAandQA from './TechCAandQA'; // 技术澄清提问
import PhaseTwoTechCAandQA from './PhaseTwoTechCAandQA'; // 价格评审汇总确认后开启的技术澄清提问阶段
import ContractMidlle from './ContractMidlle'; // 商务应答表
import ContractMidlleJs from './ContractMidlleJs'; // 技术应答表
import TechnicalScore from './TechnicalScore'; // 技术评分表
import Comprehensive from './Comprehensive'; // 符合性审查表-初审
import ComprehensiveFirst from './ComprehensiveFirst'; // 符合性审查表-初评
import MergePanel from './MergePanel'; // 阶段合并面板
import expand from '@/assets/expand.png';
import fold from '@/assets/fold.png';
import styles from './index.less';
import { createPagination, tableScrollWidth } from 'utils/utils';
import { Scrollbars } from 'react-custom-scrollbars';
import { tooltipRender } from '_cus_utils/render';
import { dateTimeRender } from 'utils/renderer';
import querystring from 'querystring';
import { closeWindow } from '_cus_utils/utils';

const { Panel } = Collapse;
const prompt = 'bid.bidcommon';
const milcommon = 'bid.milestonecommon';
const routerParam = querystring.parse(location.search.substr(1));
const { type } = routerParam;
const MAX_LENGTH = 600;

@connect(({ loading = {}, contractJudgesCusSorce = {} }) => ({
  queryListLoading: loading.effects['contractJudgesCusSorce/getProjectInfo'],
  getTenderListLoading: loading.effects['contractJudgesCusSorce/getTenderList'], // 查询招标文件loading
  getDiddingListLoading: loading.effects['contractJudgesCusSorce/getDiddingList'], // 查询投标文件loading
  getPriceFileListLoading: loading.effects['contractJudgesCusSorce/getPriceFileList'], // 查询报价文件loading
  getAnswerListJsLoading: loading.effects['contractJudgesCusSorce/getAnswerListJs'],  // 技术应答表loading
  getAnswerListLoading: loading.effects['contractJudgesCusSorce/getAnswerList'], // 商务应答表loading
  mySourceLoading: loading.effects['contractJudgesCusSorce/getcaqaList'], // 查询评委自己提出的问题loading
  otherSourceLoading: loading.effects['contractJudgesCusSorce/getOtherCaqaList'], // 查询其他评委提出的问题loading
  complianceLoading: loading.effects['contractJudgesCusSorce/getCompliance'], // 查询符合性审查表loading
  passListLoading: loading.effects['contractJudgesCusSorce/getPassFrame'], // 查询是否允许供应商继续评分loading
  judgesSorceList: loading.effects['contractJudgesCusSorce/getTechnical'], // 查询技术评分表loading
  contractJudgesCusSorce,
  infoSource: contractJudgesCusSorce?.infoSource, // 基本信息数据源
}))
@formatterCollections({
  code: [
    'hzero.common',
    'bid.bidcommon',
    'bid.biddashbord',
    'bid.milestonecommon',
    'HKPC.commom'
  ]
})
export default class JudgesSorceNew extends React.Component {
  constructor(props) {
    super(props);
    this.leftPageRef = React.createRef(); //为左侧的pagearapper设置ref属性，用于后期获取高度
    this.rightPageRef = React.createRef(); //为右侧的pagearapper设置ref属性，用于后期获取高度
    this.pageRef = React.createRef(); //需要设置的元素
    const { match } = this.props;
    this.state = {
      activeKeyAll: ['allTables'],
      activeKey: [
        'contractHeaderInformation',
        'tenderDocuments',
        'biddingDocuments',
        'priceDocuments',
        'contractMidlleJs',
        'contractMidlle',
        'techCAandQA',
        'technicalScore',
        'comprehensive',
        'comprehensiveFirst',
        'techCAandQA2',
      ],
      dataSource: [],
      purchaseType: match.params.purchaseType,
      anchorFlag: true,
      milestoneId: '',
      fileFlag: undefined, // 文件查阅阶段
      milestonesEnd: true, // 技术商务澄清阶段
      saveCAandQAFlag: false, // 澄清提问是否已保存
      saveCompreFlag: false, // 符合性审查表是否已保存
      isSubmit: true, // 符合性审查表-初评是否已提交
      trialResultSubmit: true, // 符合性审查表-初审是否已提交
      saveScoreFlag: false, // 技术评分表是否已保存
      submitState: true, // 技术评分表是否已经提交
      paStating: false, // 默认进来禁止编辑，评委确认供应商通过且采购是否在里程碑点击了【确认开始】评分按钮
      disableFlags: false,
      screenHeight: window.innerHeight,
      leftHeight: null,
      rightHeight: null,
      rightWidth: null,
      windowHeight: window.innerWidth,
      showButtonDocumenttb: true,
      showButtonDocument: true,
      showButtonPrice: true,
      showButtonMidlleJs: true,
      showButtonMidlle: true,
      applicationList: [],
      applicationPagination: {},
      scrollOpacity: 0,
      submitAllLoading: false,
      saveAllLoading: false,
      present: '000',
      milestonesEndTwo: true, // 第二阶段的技术商务澄清阶段
      btnMilestonesEnd: true,
      btnMilestonesEndTwo: true,
      applicationListTwo: [],
      applicationPaginationTwo: {},
      milestoneIdTwo: '',
      reasonModal: false, // 退回理由弹框
    };
    // this.getHeight = this.getHeight.bind(this);
  }

  componentDidMount() {
    this.fetchEnum(); // 查询值集
    this.getProjectInfo(); // 查询基本信息
    this.getIsRefreshChance(); // 查询阶段状态
    this.init();
    // 在页面加载完成后等待一段时间再获取元素高度;
    window.setTimeout(() => {
      // this.getHeight();
    }, 3000);
    // window.addEventListener('resize', this.getHeight);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.getHeight);
  }

  rightTipForm = React.createRef();

  @Bind()
  init() {
    // this.getMilestoneIdInProId(); // 查询里程碑信息
    this.getProjectInfo(); // 查询基本信息:折叠多个表格的基本信息展开的时候查询
  }

  // 获取高度/宽度
  @Bind()
  getHeight() {
    const leftHeight = this.leftPageRef?.current?.offsetHeight;
    const rightHeight = this.rightPageRef?.current?.offsetHeight;
    const windowHeight = window.innerHeight;
    const rightWidth = this.rightPageRef?.current?.offsetWidth;
    const windowWidth = window.innerWidth;
    this.setState({
      leftHeight,
      rightHeight,
      windowHeight,
      rightWidth,
      windowWidth,
    });
  }

  /**
   * 查询值集
   */
  fetchEnum = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/init',
    });
  }
  
  foldAnchor = () => {
    const { anchorFlag } = this.state;
    this.setState({
      anchorFlag: !anchorFlag,
    })
  }

  // 查询阶段状态(是否允许保存/提交)
  getIsRefreshChance = (caAndQamilestoneId) => {
    const { dispatch, match } = this.props;
    const { isSubmit, trialResultSubmit, purchaseType, milstonesInfo, milstonesInfoTwo } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/isRefreshChance',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res) {
        let disableFlagValue = false;
        // present=000:文件查阅;present=001:技术澄清提问;present=002:初审;present=003:初评/技术评分表
        // button=true允许编辑
        if (res.present) {
          disableFlagValue = res.button
        }
        if (res.present === '000') {
          this.setState({ fileFlag: true });
        } else {
          this.setState({ fileFlag: false });
        }
        if (res.present === '001') {
          // this.setState({ milestonesEnd: false, trialResultSubmit: true, isSubmit: true, submitState: true })
          if (milstonesInfo && milstonesInfo[0].milestoneState === "in_process") {
            // 针对技术澄清提问的切换轮次，不是最新轮次且不是进行中，禁止新增删除(技术澄清提问)
            if (caAndQamilestoneId && caAndQamilestoneId === milstonesInfo[0].milestoneId) {
              // this.setState({ btnEnd: false });
              disableFlagValue = false;
            }
            // 提交后根据最新的里程碑id判断
            else if (!caAndQamilestoneId && res.milestoneId && res.milestoneId === milstonesInfo[0].milestoneId) {
              // this.setState({ btnEnd: false });
              disableFlagValue = true;
            } else {
              // this.setState({ btnEnd: true });
              disableFlagValue = true;
            }
          }
        }
        // if (res.present === '002' && trialResultSubmit && purchaseType !== 'single_source') { // 初审
        //   this.setState({ btnEnd: false })
        // }
        // if (res.present === '003' && isSubmit && purchaseType === 'single_source') { // 单一来源：初评为最后流程的情况
        //   this.setState({ btnEnd: false })
        // }
        // if (res.present === '003' && isSubmit && purchaseType !== 'invited_bidding' && purchaseType !== 'public_bidding' && res.gradingState === 'y') { // 初评
        //   this.setState({ btnEnd: false })
        // }
        // if (res.present === '003' && (purchaseType === 'invited_bidding' || purchaseType === 'public_bidding') && res.gradingState === 'y') { // 技术评分表
        //   this.setState({ btnEnd: false })
        // }
        // 单一来源评审汇总后开启的第二阶段技术澄清提问按钮状态
        if (res.present === '004' && ['single_source', 'internal_source'].includes(purchaseType)) {
          if (milstonesInfoTwo && milstonesInfoTwo[0].milestoneState === "in_process") {
            // 针对单一第二段技术澄清提问的切换轮次，不是最新轮次且不是进行中，禁止新增删除(技术澄清提问)
            if (caAndQamilestoneId && caAndQamilestoneId === milstonesInfoTwo[0].milestoneId) {
              disableFlagValue = false;
            }
            // 提交后根据最新的里程碑id判断
            else if (!caAndQamilestoneId && res.milestoneId && res.milestoneId === milstonesInfoTwo[0].milestoneId) {
              disableFlagValue = true;
            } else {
              disableFlagValue = true;
            }
          }
        }
        let stageVal;
        if (res.present === '000') {
          stageVal = 0;
          this.setState({ milestoneId: res.milestoneId, milestonesEnd: res.milestonesEnd, fileLookUp: false })
        } else if (res.present === '001') {
          stageVal = 1;
          this.setState({ milestoneId: res.milestoneId, milestonesEnd: res.milestonesEnd, fileLookUp: true })
        } else if (res.present === '002') {
          stageVal = 2;
          this.setState({ milestoneId: res.milestoneId, milestonesEnd: res.milestonesEnd, fileLookUp: true })
        } else if (res.present === '003') {
          stageVal = 3;
          this.setState({ milestoneId: res.milestoneId, milestonesEnd: res.milestonesEnd, fileLookUp: true })
        } else if (res.present === '004') {
          stageVal = 4;
          this.setState({ milestoneIdTwo: res.milestoneId, milestonesEndTwo: res.milestonesEnd, fileLookUp: true })
        }
        this.setState({
          // milestoneId: res.milestoneId,
          milestoneEndTime: res.milestoneEndTime,
          milestoneStartTime: res.milestoneStartTime,
          milestoneState: res.milestoneState,
          disableFlags: disableFlagValue,
          // lastPresent: res.submit, // 判断最新阶段是否已提交
          fileLookUp: res.fileLookUp,
          // milestonesEnd: res.milestonesEnd,
          trialResultSubmit: res.trialResultSubmit,
          isSubmit: res.isSubmit,
          submitState: res.submitState,
          present: res.present, // 记录当前阶段'000'/'001'/'002'/'003'
          stage: stageVal, // 记录当前阶段0/1/2/3
          instruceValue: res.prompt, // 使用说明
        })
        // 查询处理意见
        this.getJudgesDetails(stageVal);
      }
    })
  }

  // 针对技术澄清提问的切换轮次，不是最新轮次且不是进行中，禁止新增删除(技术澄清提问)
  changeRoundCAandQA = (milestoneId) => {
    this.getIsRefreshChance(milestoneId);
  }

  // 查询处理意见
  getJudgesDetails = (stage) => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getJudgesDetails',
      payload: {
        proId: match.params.proId,
        stage,
      },
    }).then((res) => {
      if (res.hasOwnProperty('suggestion')) {
        this.rightTipForm?.current?.setFieldsValue({ resolution: res.suggestion })
      } else { // 各个阶段初始进入的默认处理意见
        if (stage === 0) { // 文件查阅初始进入
          this.rightTipForm?.current?.setFieldsValue({ resolution: intl.get(`bid.bidcommon.view.message.Hr`).d('已阅') })
        } else { // 其余阶段初始进入
          this.rightTipForm?.current?.setFieldsValue({ resolution: intl.get(`bid.bidcommon.view.title.Submitted`).d('已提交') })
        }
      }
      this.handleDetailInput(this.rightTipForm?.current?.getFieldValue('resolution'));
    })
  }

  // 获取使用说明模板（9-21跟后台约到整合到查询阶段状态的接口）
  getInstructions = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getInstructions',
      payload: {
        proId: match.params.proId,
      },
    })
  }

  // 根据proId查询里程碑信息
  // getMilestoneIdInProId = () => {
  //   const { dispatch, match } = this.props;
  //   dispatch({
  //     type: 'contractJudgesCusSorce/getMilestoneIdInProId',
  //     payload: {
  //       proId: match.params.proId,
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       this.form?.current?.setFieldsValue({
  //         ...this.props.infoSource
  //       })
  //     }
  //   })
  // }

  // 查询基本信息
  getProjectInfo = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getProjectInfo',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res) {
        this.filterForm?.current?.setFieldsValue({
          ...this.props?.infoSource
        })
        // 是否可以发起评委打分
        if (res.gradingState === 'y') {
          this.setState({ paStating: true })
        } else {
          this.setState({ paStating: false })
        }
      }
    })
  }

  /**
   * fetchCAandQAList - 查询自己的技术澄清提问表格信息
   */
  fetchCAandQAList = (page = {}, getMilestoneId, newList) => {
    const { dispatch, match } = this.props;
    const { milestoneId } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/getcaqaList',
      payload: {
        page,
        milestoneId: milestoneId !== '' ? (getMilestoneId ? getMilestoneId : milestoneId) : (getMilestoneId ? getMilestoneId : -1),
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res.page) {
        const { content } = res.page;
        this.setState({
          milstonesInfo: res.milestones,
          saveCAandQAFlag: false,
          applicationList: newList ? newList : content.map(item => ({
            ...item,
            tempId: uuidv4(),
            canEdit: false,
            _status: 'update',
          })),
          applicationPagination: createPagination(res.page),
        }, () => {
          dispatch({
            type: 'contractJudgesCusSorce/updateState',
            payload: {
              groupUnsaveFlag: false,
              milstonesInfo: res.milestones, // 技术商务澄清轮次信息
            },
          });
        })
        // 页面初始化的时候判断最新轮次是否在截止时间内
        let today = moment().format('YYYY-MM-DD HH:mm:ss');
        if (today > res.milestones[0].milestoneEndTime || res.milestones[0].milestoneState === 'completed') {
          this.setState({ btnMilestonesEnd: false });
        }
      }
    })
  }

  /**
   * fetchCAandQAListTwo - 查询自己的技术澄清提问表格信息
   */
  fetchCAandQAListTwo = (page = {}, getMilestoneId, newList) => {
    const { dispatch, match } = this.props;
    const { milestoneIdTwo } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/getcaqaListTwo',
      payload: {
        page,
        milestoneId: milestoneIdTwo !== '' ? (getMilestoneId ? getMilestoneId : milestoneIdTwo) : (getMilestoneId ? getMilestoneId : -2),
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res.page) {
        const { content } = res.page;
        this.setState({
          milstonesInfoTwo: res.milestones,
          saveCAandQAFlag: false,
          applicationListTwo: newList ? newList : content.map(item => ({
            ...item,
            tempId: uuidv4(),
            canEdit: false,
            _status: 'update',
          })),
          applicationPaginationTwo: createPagination(res.page),
        }, () => {
          dispatch({
            type: 'contractJudgesCusSorce/updateState',
            payload: {
              groupUnsaveFlagTwo: false,
              milstonesInfoTwo: res.milestones, // 技术商务澄清轮次信息
            },
          });
        })
        // 页面初始化的时候判断最新轮次是否在截止时间内
        let today = moment().format('YYYY-MM-DD HH:mm:ss');
        if (today > res.milestones[0].milestoneEndTime || res.milestones[0].milestoneState === 'completed') {
          this.setState({ btnMilestonesEndTwo: false });
        }
      }
    })
  }

  @Debounce(200)
  handleAddQusetionLine = () => {
    const { match, dispatch } = this.props;
    const {
      milestoneId,
      milestoneState,
      milestoneEndTime,
      milestoneStartTime,
      applicationList,
      applicationPagination,
      stage,
      purchaseType,
      applicationListTwo,
      applicationPaginationTwo,
      milestoneIdTwo,
    } = this.state;
    // 获取当前时间
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    if (milestoneStartTime === '' && milestoneEndTime === '') { // 待开展
      CusNotification.error({
        message: intl.get(`${prompt}.view.message.remindsetdate`).d('请联系采购创建技术、商务澄清里程碑有效时间')
      })
    } else {
      if (today > milestoneEndTime || milestoneState === 'completed') { // 已完成
        CusNotification.error({
          message: intl.get(`${prompt}.view.message.techqaend`)
            .d('本轮技术商务澄清里程碑已完成，若需再提交疑问，请联系采购发起下一轮技术澄清里程碑')
        })
      } else if (today < milestoneStartTime) { // 未开展
        CusNotification.error({
          message: intl.get(`${prompt}.view.message.techqanotstart`).d('本轮技术商务澄清还未开展，请与采购确认澄清的有效期限')
        })
      } else {
        dispatch({
          type: 'contractJudgesCusSorce/getMilDeadline',
          payload: (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? milestoneIdTwo : milestoneId,
        }).then((res) => {
          if (!isUndefined(res)) {
            if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
              const newDataSource = [
                ...applicationListTwo,
                {
                  canEdit: 1, // 编辑标识
                  _status: 'create',
                  organizationId: getCurrentOrganizationId(),
                  proId: match.params.proId, // 项目ID测试:61
                  milestoneId: milestoneIdTwo,
                  tempId: uuidv4(),
                  published: 'n',
                },
              ];
              this.setState({
                applicationListTwo: newDataSource,
                applicationPaginationTwo: {
                  ...applicationPaginationTwo,
                  pageSize:
                    newDataSource.length > (applicationPaginationTwo.pageSize || 10)
                      ? (applicationPaginationTwo.pageSize || 10) + 1
                      : applicationPaginationTwo.pageSize,
                },
              });
            } else {
              const newDataSource = [
                ...applicationList,
                {
                  canEdit: 1, // 编辑标识
                  _status: 'create',
                  organizationId: getCurrentOrganizationId(),
                  proId: match.params.proId, // 项目ID测试:61
                  milestoneId: milestoneId,
                  tempId: uuidv4(),
                  published: 'n',
                },
              ];
              this.setState({
                applicationList: newDataSource,
                applicationPagination: {
                  ...applicationPagination,
                  pageSize:
                    newDataSource.length > (applicationPagination.pageSize || 10)
                      ? (applicationPagination.pageSize || 10) + 1
                      : applicationPagination.pageSize,
                },
              });
            }
          }
        })
      }
    }
  }

  /**
   * 新建未保存数据删除
   */
  @Bind()
  deleteNewRows(deleteRow, newList) {
    const {
      stage,
      purchaseType,
      applicationPaginationTwo,
    } = this.state;
    // 若有已保存的数据删除
    if (deleteRow.length > 0) {
      let data = deleteRow;
      this.props.dispatch({
        type: 'contractJudgesCusSorce/deleteClarification',
        payload: { data },
      }).then((res) => {
        if (res) {
          if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
            this.fetchCAandQAListTwo(applicationPaginationTwo, '', newList);
            this.setState({ applicationListTwo: newList });
          } else {
            this.fetchCAandQAList(this.state.applicationPagination, '', newList);
            this.setState({ applicationList: newList });
          }
          CusNotification.success();
        }
      });
    } else {
      if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
        this.setState({ applicationListTwo: newList });
      } else {
        this.setState({ applicationList: newList });
      }
      CusNotification.success();
    }
  }

  /**
   * 接口删除
   */
  @Bind()
  deleteExistRows(deleteRow, newList) {
    const { dispatch } = this.props;
    const {
      applicationPagination,
      stage,
      purchaseType,
      applicationPaginationTwo,
    } = this.state;
    let data = deleteRow;
    dispatch({
      type: 'contractJudgesCusSorce/deleteClarification',
      payload: { data },
    }).then((res) => {
      if (res) {
        if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
          this.fetchCAandQAListTwo(applicationPaginationTwo, '', newList);
        } else {
          this.fetchCAandQAList(applicationPagination, '', newList);
        }
        this.deleteNewRows(data, newList);
      }
    });
  }

  // 确认删除评委提问
  sureDeleteCAandQA = (selectedRows, selectedRowKeys) => {
    const { applicationList, applicationPagination, milestoneId,
      stage,
      purchaseType,
      applicationListTwo,
      applicationPaginationTwo,
      milestoneIdTwo,
    } = this.state;
    let newApplicationList;
    if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
      newApplicationList = cloneDeep(applicationListTwo);
    } else {
      newApplicationList = cloneDeep(applicationList);
    }
    const newSelectedRows = [];
    selectedRowKeys && newApplicationList.forEach((i) => {
      selectedRowKeys.forEach((j) => {
        if (i.tempId === j) {
          newSelectedRows.push(i);
        }
      });
    });
    if (newSelectedRows && newSelectedRows.length > 0 && (milestoneId !== '' || milestoneIdTwo !== '')) {
      // 选中行的新建行
      const newRows = newSelectedRows.filter((n) => n._status === 'create');
      // 选中行的已有行
      const existRows = newSelectedRows.filter((n) => n._status !== 'create');
      let newList = [];
      if (newRows) {
        newList = pullAllBy(newApplicationList, newRows, 'tempId');
      }
      if (existRows) {
        newList = pullAllBy(newApplicationList, existRows, 'tempId');
      }

      this.props.dispatch({
        type: 'contractJudgesCusSorce/getMilDeadline',
        payload: (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? milestoneIdTwo : milestoneId,
      }).then((res) => {
        if (!isUndefined(res)) {
          // let data = existRows.map((n) => n.tempId);
          if (newRows.length > 0) {
            CusModal.CusDeleteConfirm(() => this.deleteNewRows(existRows, newList));
          } else if (existRows.length > 0) {
            CusModal.CusDeleteConfirm(() => this.deleteExistRows(existRows, newList));
          } else {
            CusModal.confirm({
              content: intl.get(`${prompt}.view.message.suredelete`).d('是否确认删除'),
              okType: 'normal',
              onOk: () => {
                let data = existRows;
                this.props.dispatch({
                  type: 'contractJudgesCusSorce/deleteClarification',
                  payload: { data },
                }).then((res) => {
                  if (res) {
                    if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
                      this.setState({ applicationListTwo: newList });
                      this.fetchCAandQAListTwo(applicationPaginationTwo, '', newList);
                    } else {
                      this.setState({ applicationList: newList });
                      this.fetchCAandQAList(applicationPagination, '', newList);
                    }
                    CusNotification.success();
                  }
                });
              }
            })
          }
        }
      })
    } else {
      CusNotification.warning({
        message: intl.get(`${prompt}.view.message.leastdata`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * 查询别人的技术澄清提问表格信息
  */
  fetchOtherList = (page = {}, getMilestoneId) => {
    const { dispatch, match } = this.props;
    const { milestoneId } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/getOtherCaqaList',
      payload: {
        page,
        milestoneId: milestoneId !== '' ? (getMilestoneId ? getMilestoneId : milestoneId) : (getMilestoneId ? getMilestoneId : -1),
        proId: match.params.proId,
      }
    })
  }

  /**
   * 查询别人的技术澄清提问表格信息
  */
  fetchOtherListTwo = (page = {}, getMilestoneId) => {
    const { dispatch, match } = this.props;
    const { milestoneIdTwo } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/getOtherCaqaListTwo',
      payload: {
        page,
        milestoneId: milestoneIdTwo !== '' ? (getMilestoneId ? getMilestoneId : milestoneIdTwo) : (getMilestoneId ? getMilestoneId : -2),
        proId: match.params.proId,
      }
    })
  }

  /**
   * fetchCompliance - 查询符合性审查表信息-初评
   */
  fetchCompliance = (page = {}) => {
    const { dispatch, match } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractJudgesCusSorce/getCompliance',
      payload: {
        page,
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ saveCompreFlag: false });
        dispatch({
          type: 'contractJudgesCusSorce/updateState',
          payload: {
            compreUnsaveFlag: false,
          },
        });
      }
    });
  }

  /**
   * 查询技术符合审查表信息-初审
  */
  getPassFrame = (page = {}) => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getPassFrame',
      payload: {
        page,
        proId: match.params.proId,
        all: 'NO'
      },
    }).then((res) => {
      if (res) {
        this.setState({ saveCompreFlag: false });
        dispatch({
          type: 'contractJudgesCusSorce/updateState',
          payload: {
            compreFirstUnsaveFlag: false,
          },
        });
      }
    })
  }

  /**
   * fetchScoreTable - 查询技术评分表格信息
   */
  fetchScoreTable = () => {
    const { dispatch, match, history } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getTechnical',
      payload: {
        proId: match.params.proId
      },
    }).then((res) => {
      if (res) {
        if (res.length > 0) {
          let newDataSource = res.map((item) => ({
            ...item,
            _status: 'update',
          }));
          let lists = [];
          newDataSource.map((item) => {
            lists.push(item.list)
          })
          lists.map((item) => 
            item.map(ids => {
              ids.uuid = uuidv4(); // 分值uuid
              ids.uuid2 = uuidv4(); // 理由uuid
            })
          )
          dispatch({
            type: 'contractJudgesCusSorce/updateState',
            payload: {
              judgesSorceDataSource: [...newDataSource, {}, {}],
            },
          });
          this.setState({ newDatasource: [...newDataSource], saveScoreFlag: false })
        }
        this.setState({ groupUnsaveScoreFlag: false })
        // 评委收到被退回的评分的待办，打开后触发【退回理由】弹框
        // if (type !== undefined && type === 'consult') {
        //   this.handleOpen();
        // }
      }
    })
  }

  // 保存澄清提问
  @Bind
  saveCAandQA(callback) {
    const { dispatch, contractJudgesCusSorce: { mySource = [] } } = this.props;
    const { milestoneId, saveCAandQAFlag, applicationList, stage, purchaseType, applicationListTwo, milestoneIdTwo } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/getMilDeadline',
      payload: (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? milestoneIdTwo : milestoneId,
    }).then((res) => {
      if (!isUndefined(res)) {
        this.caAndQaRef?.caAndQaForm?.current?.validateFields().then((values) => {
          const newData = (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? 
            applicationListTwo.map((item) =>
              item._status === 'create'
                ? {
                  ...item,
                  tempId: undefined,
                } : item
            ) : applicationList.map((item) =>
            item._status === 'create'
              ? {
                ...item,
                tempId: undefined,
              } : item
          );
          for (let i = 0; i < newData.length; i++) {
            if (!newData[i].type) {
              newData[i].type = 'judges_rate'
            }
          }
          let data = newData;
          if (data.length > 0 && (milestoneId !== '' || milestoneIdTwo !== '')) {
            dispatch({
              type: 'contractJudgesCusSorce/saveClarification',
              payload: {
                milestoneId: (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? milestoneIdTwo : milestoneId,
                data,
              },
            }).then((res) => {
              if (res) {
                if (typeof callback === 'function') {
                  callback();
                } else {
                  if (!saveCAandQAFlag || this.state.fileLookUp) {
                    CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功') });
                  }
                  if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
                    this.fetchCAandQAListTwo();
                  } else {
                    this.fetchCAandQAList();
                  }
                  this.setState({ saveCAandQAFlag: true });
                }
                this.setState({ saveAllLoading: false })
              }
            });
          } else { // 评委无疑问，提交处理意见
            callback();
          }
        }).catch(() => {
          this.setState({ saveAllLoading: false, submitAllLoading: false })
        })
      }
    })
  }

  // 保存符合性审查表(初评阶段)+（初审）
  @Bind()
  saveCompliance(callback) {
    const { match, dispatch, contractJudgesCusSorce: { complianceSource = [], passStatus = [] } } = this.props;
    const { saveCompreFlag, trialResultSubmit, isSubmit } = this.state;
    if (!trialResultSubmit) {
      this.compreRef?.compreForm?.current?.validateFields().then((values) => {
        let newCompData = [];
        passStatus.map((item) => {
          if (item.unqualifiedSupplier) {
            newCompData.push({
              supplierId: item.supplierId,
              unqualifiedSupplier: item.unqualifiedSupplier
            })
          }
        })
        if (newCompData.length > 0) {
          dispatch({
            type: 'contractJudgesCusSorce/supplierPass',
            payload: {
              proId: match.params.proId,
              passList: [...newCompData],
            },
          }).then((res) => {
            if (res.message == 'ok') {
              if (typeof callback === 'function') {
                callback();
              } else {
                if (!saveCompreFlag || this.state.fileLookUp) {
                  CusNotification.success({
                    message: intl.get(`${prompt}.view.title.savesuccessfully`).d('保存成功'),
                  });
                }
                this.fetchCompliance();
                this.setState({ saveCompreFlag: true })
              }
            } else {
              CusNotification.error()
            }
            this.setState({ saveAllLoading: false })
          });
        }
      }).catch(() => {
        this.setState({ saveAllLoading: false, submitAllLoading: false });
      });
    }
    if (!isSubmit) {
      this.compreRefFirst?.compreFormFirst?.current?.validateFields().then((values) => {
        console.log('values', values)
        let saveDate = [];
        let newCompData = [];
        saveDate = complianceSource.filter((item) => item._status === 'update');
        newCompData = saveDate.filter((item) => (item.examineReason !== undefined || item.examineResult !== undefined) && item);
        for (let i = 0; i < saveDate.length; i++) {
          saveDate[i].proId = match.params.proId
        }
        if (newCompData.length > 0) {
          dispatch({
            type: 'contractJudgesCusSorce/saveCompliance',
            payload: {
              saveDate: [...saveDate],
            },
          }).then((res) => {
            if (res.message == 'ok') {
              if (typeof callback === 'function') {
                callback();
              } else {
                if (!saveCompreFlag || this.state.fileLookUp) {
                  CusNotification.success({
                    message: intl.get(`${prompt}.view.title.savesuccessfully`).d('保存成功'),
                  });
                }
                this.getPassFrame();
                this.setState({ saveCompreFlag: true })
              }
            } else {
              CusNotification.error()
            }
            this.setState({ saveAllLoading: false })
          });
        }
      }).catch(() => {
        this.setState({ saveAllLoading: false, submitAllLoading: false })
      })
    }
  }

  // 保存技术评分表
  @Bind()
  saveTechnicalScore(callback) {
    const {
      match,
      dispatch,
      contractJudgesCusSorce: { judgesSorceDataSource = [] }
    } = this.props;
    const { saveScoreFlag } = this.state;
    this.scoreRef?.scoreForm?.current?.validateFields().then((values) => {
      const saveScoreDate = [...judgesSorceDataSource.map((item) =>
        item.list
      )];
      let scoreInfo = [];
      for (let i = 0; i < saveScoreDate.length - 2; i++) {
        scoreInfo.push(...saveScoreDate[i])
      }
      for (let j = 0; j < scoreInfo.length; j++) {
        scoreInfo[j].proId = match.params.proId;
      }
      if (saveScoreDate.length > 0) {
        dispatch({
          type: 'contractJudgesCusSorce/saveScore',
          payload: { scoreInfo },
        }).then((res) => {
          if (res.message === 'ok') {
            if (typeof callback === 'function') {
              callback();
            } else {
              if (!saveScoreFlag || this.state.fileLookUp) {
                CusNotification.success({
                  message: intl.get(`${prompt}.view.title.savesuccessfully`).d('保存成功'),
                });
              }
              this.fetchScoreTable();
              this.setState({ saveScoreFlag: true })
            }
          } else {
            if (!saveScoreFlag || this.state.fileLookUp) {
              CusNotification.error({
                message: intl.get(`${prompt}.view.title.scoreoutofrange`).d('分数不在设置范围')
              })
            } else {
              CusNotification.error()
            }
          }
          if (typeof callback === 'function') {
            this.setState({ saveAllLoading: false, submitAllLoading: false })
          } else {
            this.setState({ saveAllLoading: false })
          }
        });
      }
    }).catch(() => {
      this.setState({ saveAllLoading: false, submitAllLoading: false })
    })
  }

  // 保存处理意见
  saveJudgesDetails = (callback) => {
    const { dispatch, match } = this.props;
    const { stage, fileLookUp, milestoneId, purchaseType, milestoneIdTwo } = this.state;
    this.rightTipForm?.current?.validateFields().then((values) => {
      dispatch({
        type: 'contractJudgesCusSorce/saveJudgesDetails',
        payload: { 
          proId: match.params.proId,
          suggestion: this.rightTipForm?.current?.getFieldValue('resolution'),
          stage,
          milestoneId: (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? milestoneIdTwo : milestoneId,
        }
      }).then((res) => {
        if (res) {
          if (typeof callback === 'function') {
            callback();
          } else {
            if (!fileLookUp) {
              CusNotification.success({
                message: intl.get(`${prompt}.view.title.savesuccessfully`).d('保存成功'),
              });
            }
            this.getJudgesDetails(stage);
            this.setState({ saveAllLoading: false, fileLookUp: true })
          }
        }
      })
    }).catch(() => {
      this.setState({ saveAllLoading: false, submitAllLoading: false })
    })
  }

  // 保存评委评分页面可保存的数据
  @Debounce(500)
  saveAll = () => {
    const { milestonesEnd, submitState, trialResultSubmit, isSubmit, fileLookUp, milestonesEndTwo, stage } = this.state;
    this.setState({ saveAllLoading: true });
    setTimeout(() => {
      // 12.5新需求，保存不保存处理意见，提交才调用
      // 保存处理意见
      if (!fileLookUp && stage === 0) {
        this.saveJudgesDetails();
      }
      // 保存澄清提问：当澄清提问里程碑结束时不进行保存
      if (!milestonesEnd || !milestonesEndTwo) {
        fileLookUp && this.saveJudgesDetails();
        this.saveCAandQA();
      }
      // 保存符合性审查表-初评/初审
      if (!trialResultSubmit || !isSubmit) {
        fileLookUp && this.saveJudgesDetails();
        this.saveCompliance();
      }
      // 保存技术评分表：当采购点击完里程碑的【确认评分】可以进行保存，此判断在saveAll的disable里判断了paStating
      if (!submitState) {
        fileLookUp && this.saveJudgesDetails();
        this.saveTechnicalScore();
      }
    }, 300)
  }

  // 提交澄清提问
  submitCAandQA = () => {
    const { match, dispatch } = this.props;
    const { milestoneId, stage, purchaseType, milestoneIdTwo } = this.state;
    CusModal.confirm({
      content: intl.get('bid.bidcommon.view.title.submitconfirmQa').d('请确认提交当前问题，等待供应商答复后开始评审'),
      onOk: () => {
        dispatch({
          type: 'contractJudgesCusSorce/getMilDeadline',
          payload: (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? milestoneIdTwo : milestoneId,
        }).then((res) => {
          if (!isUndefined(res)) {
            dispatch({
              type: 'contractJudgesCusSorce/submit',
              payload: {
                milestoneId: (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) ? milestoneIdTwo : milestoneId,
                proId: match.params.proId,
              },
            }).then((res) => {
              if (res.message == 'ok') {
                this.setState({ saveCAandQAFlag: false });
                CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
                setTimeout(() => {
                  window.close();
                  closeWindow();
                }, 300);
                if (stage === 4 && ['single_source', 'internal_source'].includes(purchaseType)) {
                  this.fetchCAandQAListTwo();
                } else {
                  this.fetchCAandQAList();
                }
                this.getIsRefreshChance();
              } else {
                CusNotification.error()
              }
              this.setState({ submitAllLoading: false });
            })
          }
        })
      },
    });
  }

  // 提交符合性审查表(初评阶段)
  submitComplianceFirst = () => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/submitCompliance',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ saveCompreFlag: false });
        this.fetchCompliance();
        this.getIsRefreshChance();
        CusNotification.success({
          message: intl.get(`${prompt}.view.title.submitsuccessfully`).d('提交成功')
        });
        setTimeout(() => {
          window.close();
          closeWindow();
        }, 300);
      } else {
        CusNotification.error()
      }
      this.setState({ submitAllLoading: false });
    });
  }

  // 提交技术符合审查表信息(初审)
  submitCompliancePrel = () => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getPassFrameSubmit',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ saveCompreFlag: false })
        this.getPassFrame();
        this.getIsRefreshChance();
        CusNotification.success({
          message: intl.get(`${prompt}.view.title.submitsuccessfully`).d('提交成功')
        });
        setTimeout(() => {
          window.close();
          closeWindow();
        }, 300);
      } else {
        CusNotification.error()
      }
      this.setState({ submitAllLoading: false });
    });

  }

  // 提交技术评分表
  submitTechnicalScore = () => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/submitScore',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res.message === 'ok') {
        this.setState({ saveScoreFlag: false })
        this.fetchScoreTable();
        this.getIsRefreshChance();
        CusNotification.success({ message: intl.get(`${prompt}.view.title.submitsuccessfully`).d('提交成功') });
        setTimeout(() => {
          window.close();
          closeWindow();
        }, 300);
      } else {
        CusNotification.error()
      }
      this.setState({ submitAllLoading: false });
    })
  }

  // 提交处理意见
  submitJudgesDetails = () => {
    const { dispatch, match } = this.props;
    const { stage, fileLookUp } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/submitJudgesDetails',
      payload: {
        proId: match.params.proId,
        suggestion: this.rightTipForm?.current?.getFieldValue('resolution'),
        stage,
      }
    }).then((res) => {
      if (res) {
        this.getJudgesDetails(stage);
        this.getIsRefreshChance();
        if (!fileLookUp && stage === 0) {
          CusNotification.success({ message: intl.get(`${prompt}.view.title.submitsuccessfully`).d('提交成功') });
          setTimeout(() => {
            window.close();
          }, 300);
          this.setState({ submitAllLoading: false });
        }
      }
    })
  }

  // 根据当前里程碑状态提交当前可提交的
  // 当存在里程碑，且里程碑有效期内，提交过的数据不支持修改
  @Debounce(500)
  submitAll = () => {
    const {
      milestonesEnd,
      submitState,
      trialResultSubmit,
      isSubmit,
      fileLookUp,
      milestonesEndTwo,
      stage,
    } = this.state;
    this.setState({ submitAllLoading: true });
    setTimeout(() => {
      // 提交处理意见-文件查阅阶段
      if (!fileLookUp && stage === 0) {
        this.saveJudgesDetails(() => {
          this.submitJudgesDetails();
        })
      }
      // 提交澄清提问
      if (!milestonesEnd || !milestonesEndTwo) { // 未提交
        this.saveCAandQA(() => {
          // 处理意见-非文件查阅阶段
          fileLookUp && this.saveJudgesDetails(() => {
            this.submitJudgesDetails();
            this.submitCAandQA();
          })
        });
      }
      // 提交符合性审查表-初审
      if (!trialResultSubmit) {
        this.saveCompliance(() => {
          // 处理意见-非文件查阅阶段
          fileLookUp && this.saveJudgesDetails(() => {
            this.submitJudgesDetails();
            this.submitCompliancePrel();
          })
        });
      }
      // 提交技术符合审查表信息(初评)
      if (!isSubmit) {
        this.saveCompliance(() => {
          // 处理意见-非文件查阅阶段
          fileLookUp && this.saveJudgesDetails(() => {
            this.submitJudgesDetails();
            this.submitComplianceFirst();
          })
        });
      }
      // }
      // 提交技术评分表
      if (!submitState) {
        this.saveTechnicalScore(() => {
          // 处理意见-非文件查阅阶段
          fileLookUp && this.saveJudgesDetails(() => {
            this.submitJudgesDetails();
            this.submitTechnicalScore();
          })
        });
      }
    }, 300)
  }

  // 获取投标文件轮次
  getMilestones = (stateMilestoneId, page = {}) => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getDiddingRound',
      payload: {
        page,
        proId: match.params.proId,
        milestoneId: stateMilestoneId ? stateMilestoneId : -1,
      },
    })
  }

  // 切换投标文件轮次
  handleChangeFormItem = (stateMilestoneId) => {
    this.setState({ biddingMilestoneId: stateMilestoneId })
    this.getMilestones(stateMilestoneId);
  }

  // 全部下载
  @Bind()
  downLoadAll(e) {
    e.stopPropagation();
    const { dispatch, match, contractJudgesCusSorce: { infoSource } } = this.props;
    const { purchaseType } = this.state;
    dispatch({
      type: 'contractJudgesCusSorce/downLoadTenderFilesZip',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      // 创建下载的链接
      const url = window.URL.createObjectURL(
        new Blob(
          [res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        )
      );
      const location = document.createElement('a');
      location.style.display = 'none';
      let newLanguage = '';
      if (['single_source', 'internal_source', 'public_negotiation', 'invite_negotiation'].includes(purchaseType)) {
        newLanguage = intl.get(`bid.milestonecommon.view.title.negotiationdocument`).d('谈判文件');
      } else if (['public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(purchaseType)) {
        newLanguage = intl.get(`bid.milestonecommon.view.title.inquirydocument`).d('询价文件');
      } else {
        newLanguage = intl.get(`${prompt}.view.title.documentcategorynew`).d('比选文件');
      }
      const fileName = infoSource.proInfoWording ? intl.get(`${prompt}.view.title.biddingdocument`).d('招标文件') : newLanguage +'.zip';
      location.download = fileName;
      location.href = url;
      document.body.appendChild(location);
      location.click();
      // 释放的 URL 对象以及移除 a 标签
      URL.revokeObjectURL(location.href);
      document.body.removeChild(location);
    });
  }

  // 获取报价文件轮次
  getPriceMilestones = (stateMilestoneId, page = {}) => {
    const { match, dispatch } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getPriceRound',
      payload: {
        page,
        proId: match.params.proId,
        milestoneId: stateMilestoneId ? stateMilestoneId : -1,
      },
    })
  }

  // 切换报价文件轮次
  handleChangePriceRound = (stateMilestoneId) => {
    this.setState({ priceMilestoneId: stateMilestoneId })
    this.getPriceMilestones(stateMilestoneId);
  }

  // 技术应答表
  @Bind()
  getMidlleJs(milestoneId, page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getAnswerListJs',
      payload: {
        page,
        milestoneId: milestoneId !== undefined ? milestoneId : -1,
        proId: match.params.proId, // 测试proId：3
        state: 0, //技术应答表
      },
    })
  }

  // 切换技术应答表轮次
  @Bind()
  handleChangeMidlleJs(milestoneId) {
    this.getMidlleJs(milestoneId);
  }

  // 商务应答表
  @Bind()
  getMidlle(milestoneId, page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getAnswerList',
      payload: {
        page,
        milestoneId: milestoneId !== undefined ? milestoneId : -1,
        proId: match.params.proId, // 测试proId：3
        state: 1, //商务应答表
      },
    })
  }

  // 切换商务应答表轮次
  @Bind()
  handleChangeMidlle(milestoneId) {
    this.getMidlle(milestoneId);
  }

  getScrollBarFn = (className) => {
    const { scrollOpacity } = this.state;
    return ({ style, props }) => (
      <div
        {...props}
        style={{ ...style, opacity: scrollOpacity }}
        className={className}
      />
    )
  }
  updateScrollOpacity = (value) => {
    this.setState({
      scrollOpacity: value,
    });
  }

  // 技术评分表导出
  @Bind()
  technicalScoreExportClick(e) {
    this.scoreRef?.handleExport(e);
  }

  // 关闭技术评分表退回理由弹框
  handleCancel = () => {
    this.setState({ reasonModal: false });
  }

  // 打开技术评分表退回理由弹框
  // handleOpen = () => {
  //   this.getRevertReason();
  //   this.setState({ reasonModal: true });
  // }

  // 打开技术评分表退回理由弹框
  getRevertReason = (page) => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesCusSorce/getRevertReason',
      payload: {
        page,
        proId: match.params.proId
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          reasonKey: uuidv4(),
        }));
        dispatch({
          type: 'contractJudgesCusSorce/updateState',
          payload: {
            revertReasonList: newDataSource,
            revertReasonPagination: pagination,
          },
        });
      }
    })
  }

  // 计算申请标题剩余字符
  handleDetailInput = (value) => {
    if (value && typeof value === 'string') {
      this.setState({
        requestRemarksLen: value.length,
      });
    } else {
      this.setState({
        requestRemarksLen: 0,
      });
    }
    // const textarea = document.getElementById('myTextarea');
    // const charCount = document.getElementById('charCount');
    // if (textarea && charCount) {
    //   textarea.style.paddingBottom = `${charCount.offsetHeight}px`;
    //   textarea.scrollTop = textarea.scrollHeight;
    // }
  }

  render() {
    const {
      match,
      queryListLoading = false,
      getTenderListLoading = false,
      getDiddingListLoading = false,
      getPriceFileListLoading = false,
      getAnswerListJsLoading = false,
      getAnswerListLoading = false,
      mySourceLoading = false,
      otherSourceLoading = false,
      complianceLoading = false,
      passListLoading = false,
      judgesSorceList = false,
      contractJudgesCusSorce: {
        infoSource,
        milestonesTb,
        milestonesBj,
        answerMilestonesJs,
        answerMilestones,
        revertReasonList,
        revertReasonPagination,
      },
    } = this.props;
    const {
      activeKey,
      purchaseType,
      anchorFlag,
      milestoneId,
      milestoneEndTime,
      milestoneStartTime,
      milestoneState,
      milstonesInfo,
      paStating,
      fileFlag,
      milestonesEnd,
      trialResultSubmit,
      isSubmit,
      submitState,
      disableFlags,
      rightHeight,
      windowHeight,
      windowWidth,
      rightWidth,
      showButtonDocumenttb,
      showButtonDocument,
      showButtonPrice,
      showButtonMidlleJs,
      showButtonMidlle,
      applicationList, // 技术澄清提问新建删除操作的最新数据源
      applicationPagination,
      biddingMilestoneId,
      priceMilestoneId,
      submitAllLoading,
      saveAllLoading,
      activeKeyAll,
      present,
      instruceValue,
      btnMilestonesEnd,
      btnMilestonesEndTwo,
      milstonesInfoTwo,
      milestonesEndTwo,
      milestoneIdTwo,
      applicationListTwo,
      applicationPaginationTwo,
      reasonModal,
    } = this.state;
    const isPub = this.props.location.pathname.includes('pub/');
    window.addEventListener('resize', this.getHeight); // 解决缩放窗口的时候需要手动滑动左边块才渲染宽度的bug
    const leftTipBoxWidth = !anchorFlag ? '100%' : (window.innerWidth - 340 - (isPub ? 32 : 111)) + 'px';
    // 基本信息
    const filterFormProps = {
      ...this.props,
      onRef: (ref) => {
        this.filterForm = ref.filterForm;
      },
      bidType: match.params.purchaseType,
    }
    const headerInfoFormProps = {
      ...this.props,
      paStating,
      basicInfo: infoSource,
      bidType: match.params.purchaseType,
      applicationList,
      applicationPagination,
      fetchCAandQAList: this.fetchCAandQAList, // 查询自己的技术澄清提问
      deleteCAandQA: this.sureDeleteCAandQA,
      handleAddQusetionLine: this.handleAddQusetionLine,
      deleteNewRows: this.deleteNewRows,
      deleteExistRows: this.deleteExistRows,
      fetchOtherList: this.fetchOtherList,
      fetchScoreTable: this.fetchScoreTable, // 查询技术评分表
      fetchCompliance: this.fetchCompliance, // 查询符合性审查表(初评阶段)
      getPassFrame: this.getPassFrame, // 查询技术符合审查表信息(初审)
      getPriceMilestones: this.getPriceMilestones, // 查询报价文件
      getMilestones: this.getMilestones, // 查询投标文件
      getMidlle: this.getMidlle, // 查询商务应答文件
      getMidlleJs: this.getMidlleJs, // 查询技术应答文件
      onRef: (ref) => {
        this.tbAndBjForm = ref.tbAndBjForm;
        this.compreForm = ref.compreForm;
        this.compreFormFirst = ref.compreFormFirst;
        this.contractForm = ref.contractForm;
        this.caAndQaForm = ref.caAndQaForm;
        this.scoreForm = ref.scoreForm;
      },
      milestoneId,
      milestoneEndTime,
      milestoneStartTime,
      milestoneState,
      milestonesEnd, // 澄清提问表-是否已提交
      milstonesInfo,
      isSubmit, // 初评
      submitState, // 技术评分表-是否已经提交
      trialResultSubmit, // 初审
      biddingMilestoneId,
      priceMilestoneId,
      queryListLoading, // 基本信息loading
      getTenderListLoading, // 查询招标文件loading
      getDiddingListLoading, // 查询投标文件loading
      getPriceFileListLoading, // 查询报价文件loading
      getAnswerListJsLoading,  // 技术应答表loading
      getAnswerListLoading, // 商务应答表loading
      mySourceLoading, // 查询评委自己提出的问题loading
      otherSourceLoading, // 查询其他评委提出的问题loading
      complianceLoading, // 查询符合性审查表loading
      judgesSorceList, // 技术评分表Loading
      changeRoundCAandQA: this.changeRoundCAandQA,
      // btnEnd: this.state.btnEnd,
      disableFlags,
      present,
      btnMilestonesEnd,
      btnMilestonesEndTwo,
      fetchCAandQAListTwo: this.fetchCAandQAListTwo, // 查询价格评审汇总确认后开启的技术澄清提问阶段,自己的技术澄清提问
      fetchOtherListTwo: this.fetchOtherListTwo,
      applicationListTwo,
      applicationPaginationTwo,
      milstonesInfoTwo,
      milestonesEndTwo,
      milestoneIdTwo,
      downLoadAll: this.downLoadAll, // 全部下载
    };
    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: (file) => {this.scoreRef?.beforeUpload(file)},
      showUploadList: false,
    };
    const reasonColumns = [
      {
        title: intl.get(`${prompt}.view.title.revertcounts`).d('退回次数'),
        dataIndex: 'returnNum',
        width: 90,
      },{
        title: intl.get(`${prompt}.view.title.purchasername`).d('采购员姓名'),
        dataIndex: 'selected',
        width: 105,
        render: (_, record) => tooltipRender(record.purchaseName)
      },{
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
        render: (_, record) => tooltipRender(record.supplierName)
      },{
        title: intl.get(`${prompt}.view.title.reverttime`).d('退回时间'),
        dataIndex: 'lineNum',
        width: 170,
        render: (_, record) => dateTimeRender(record.returnDate)
      },{
        title: intl.get(`${prompt}.view.title.revertreason`).d('退回理由'),
        dataIndex: 'returnReason',
        width: 200,
        render: (_, record) => tooltipRender(record.returnReason)
      }
    ].filter(Boolean);
    let newLanguage = '';
    if (['single_source', 'internal_source', 'public_negotiation', 'invite_negotiation'].includes(purchaseType)) {
      newLanguage = intl.get(`bid.milestonecommon.view.title.negotiationdocument`).d('谈判文件');
    } else if (['public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(purchaseType)) {
      newLanguage = intl.get(`bid.milestonecommon.view.title.inquirydocument`).d('询价文件');
    } else {
      newLanguage = intl.get(`${prompt}.view.title.documentcategorynew`).d('比选文件');
    }
    return (
      <div className={styles.pageBackground}>
        <img
          className={styles[!anchorFlag ? '_cus_fold' : '_cus_expand']}
          src={!anchorFlag ? expand : fold}
          onClick={() => this.foldAnchor()}
        />
        <div
          onMouseEnter={() => this.updateScrollOpacity(1)}
          onMouseLeave={() => this.updateScrollOpacity(0)}
          className={styles['leftTipBox']}
          style={{ transition: 'width 0.5s', width: leftTipBoxWidth }}
        >
          <Scrollbars
            universal
            autoHeight
            autoHeightMin={0}
            autoHeightMax={1000}
            renderTrackHorizontal={this.getScrollBarFn('track-horizontal')}
            renderTrackVertical={this.getScrollBarFn('track-vertical')}
            renderThumbHorizontal={this.getScrollBarFn('thumb-horizontal')}
            renderThumbVertical={this.getScrollBarFn('thumb-vertical')}
          >
            <div className={styles['wrapper']}>
              <PageWrapper
                loading={
                  queryListLoading ||
                  getTenderListLoading ||
                  getDiddingListLoading ||
                  getPriceFileListLoading ||
                  getAnswerListJsLoading ||
                  getAnswerListLoading ||
                  mySourceLoading ||
                  otherSourceLoading ||
                  complianceLoading ||
                  judgesSorceList
                }
                ref={this.leftPageRef}
              >
                {/* 文件查阅阶段面板样式 */}
                {/* {fileFlag && 
                  <Collapse
                    className="customize-collapse"
                    defaultActiveKey={activeKey}
                    onChange={(collapseKeys) => {
                      this.setState({
                        activeKey: collapseKeys,
                        showButtonDocumenttb: collapseKeys.includes('biddingDocuments'),
                        showButtonDocument: collapseKeys.includes('tenderDocuments'),
                        showButtonPrice: collapseKeys.includes('priceDocuments'),
                        showButtonMidlleJs: collapseKeys.includes('contractMidlleJs'),
                        showButtonMidlle: collapseKeys.includes('contractMidlle'),
                      });
                    }}
                  >
                  </Collapse>
                } */}
                {/* 文件查阅之后阶段的两个面板样式 */}
                {/* {!fileFlag &&
                  <> */}
                    <Collapse
                      className="customize-collapse"
                      defaultActiveKey={activeKey}
                      onChange={(collapseKeys) => {
                        this.setState({
                          activeKey: collapseKeys,
                        });
                      }}
                    >
                      <Panel
                        showArrow={false}
                        header={
                          <PanelHeader
                            title={intl.get(`${prompt}.bid.title.EssentialInformation`).d('基本信息')}
                            arrowActive={activeKey.includes('contractHeaderInformation')}
                          />
                        }
                        key="contractHeaderInformation"
                      >
                        <FilterForm {...filterFormProps} />
                      </Panel>
                      <Panel
                        showArrow={false}
                        header={
                          <PanelHeader
                            title={infoSource.proInfoWording ?
                              intl.get(`${prompt}.view.title.biddingdocumenttb`).d('投标文件')
                              : intl.get(`${prompt}.view.title.biddingdocumenttbnew`).d('应答文件')
                            }
                            arrowActive={activeKey.includes('biddingDocuments')}
                            buttons={
                              showButtonDocumenttb && <>
                                <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                                <Form className={styles.roundForm}>
                                  {milestonesTb.length > 0 &&
                                    <Form.Item name='tbRound' initialValue={milestonesTb[0]?.value} >
                                      <CusSelect style={{ width: 80 }}
                                        options={milestonesTb}
                                        onChange={(e) => this.handleChangeFormItem(e)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Form.Item>
                                  }
                                </Form>
                              </>
                            }
                          />
                        }
                        key="biddingDocuments"
                      >
                        <BiddingDocuments {...headerInfoFormProps} onRef={ref => (this.tbAndBjRef = ref)} />
                      </Panel>
                      {['single_source', 'internal_source'].includes(purchaseType) && <Panel
                        showArrow={false}
                        className={styles['panelHeader']}
                        header={
                          <PanelHeader
                            title={intl.get(`${milcommon}.view.title.quotationdocument`).d('报价文件')}
                            arrowActive={activeKey.includes('priceDocuments')}
                            buttons={
                              showButtonPrice && <>
                                <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                                <Form className={styles.roundForm}>
                                  {milestonesBj.length > 0 &&
                                    <Form.Item name='bjRound' initialValue={milestonesBj[0]?.value} >
                                      <CusSelect style={{ width: 80 }}
                                        options={milestonesBj}
                                        onChange={(e) => this.handleChangePriceRound(e)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Form.Item>
                                  }
                                </Form>
                              </>
                            }
                          />
                        }
                        key="priceDocuments"
                      >
                        <PriceDocuments {...headerInfoFormProps} onRef={ref => (this.tbAndBjRef = ref)} />
                      </Panel>}
                      {infoSource.isNeedAnswer == 0 && <Panel
                        showArrow={false}
                        className={styles['panelHeader']}
                        header={
                          <PanelHeader
                            title={intl.get(`${prompt}.view.title.jishubiao`).d('技术应答表')}
                            arrowActive={activeKey.includes('contractMidlleJs')}
                            buttons={
                              showButtonMidlleJs && <>
                                <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                                <Form className={styles.roundForm}>
                                  {answerMilestonesJs.length > 0 &&
                                    <Form.Item name='tbRound' initialValue={answerMilestonesJs[0]?.value} >
                                      <CusSelect style={{ width: 80 }}
                                        options={answerMilestonesJs}
                                        onChange={(e) => this.handleChangeMidlleJs(e)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Form.Item>
                                  }
                                </Form>
                              </>
                            }
                          />
                        }
                        key="contractMidlleJs"
                      >
                        <ContractMidlleJs {...headerInfoFormProps} onRef={ref => (this.contractFormRef = ref)} />
                      </Panel>}
                      {infoSource.isNeedAnswerBusiness == 0 && <Panel
                        showArrow={false}
                        className={styles['panelHeader']}
                        header={
                          <PanelHeader
                            title={intl.get(`${prompt}.view.title.shangwubiao`).d('商务应答表')}
                            arrowActive={activeKey.includes('contractMidlle')}
                            buttons={
                              showButtonMidlle && <>
                                <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                                <Form className={styles.roundForm}>
                                  {answerMilestones.length > 0 &&
                                    <Form.Item name='tbRound' initialValue={answerMilestones[0]?.value} >
                                      <CusSelect style={{ width: 80 }}
                                        options={answerMilestones}
                                        onChange={(e) => this.handleChangeMidlle(e)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Form.Item>
                                  }
                                </Form>
                              </>
                            }
                          />
                        }
                        key="contractMidlle"
                      >
                        <ContractMidlle {...headerInfoFormProps} onRef={ref => (this.contractFormRef = ref)} />
                      </Panel>}
                      {/* !milestonesEnd=进行中，或(milestonesEnd && present === '001');milestonesEnd=已完成并且present === '002' || present === '003' || present === '004'时显示 */}
                      {((!milestonesEnd || (milestonesEnd && present === '001')) || milestonesEnd && (present === '002' || present === '003' || present === '004')) &&
                        <Panel
                          showArrow={false}
                          header={
                            <PanelHeader
                              title={intl.get(`${prompt}.view.title.tecclarifyquiz`).d('技术澄清提问')}
                              arrowActive={activeKey.includes('techCAandQA')}
                            />
                          }
                          key="techCAandQA"
                        >
                          <TechCAandQA {...headerInfoFormProps} onRef={ref => (this.caAndQaRef = ref)} />
                        </Panel>
                      }
                      {/* !trialResultSubmit=进行中trialResultSubmit已完成,且当前阶段是003  */}
                      {(!(['public_inquiry', 'invitation_inquiry'].includes(purchaseType))) && ((!trialResultSubmit || (trialResultSubmit && present === '002') || (trialResultSubmit && present === '003')) && (purchaseType !== 'single_source' && purchaseType !== 'internal_source')) && <Panel
                        showArrow={false}
                        header={
                          <PanelHeader
                            title={intl.get(`${prompt}.view.title.PreliminaryReview`).d('符合性审查表(初评阶段)')}
                            arrowActive={activeKey.includes('comprehensive')}
                          />
                        }
                        key="comprehensive"
                      >
                        <Comprehensive {...headerInfoFormProps} onRef={ref => (this.compreRef = ref)} />
                      </Panel>}
                      {/* 单一来源：若开启了第二段技术商务澄清004，初评就显示 */}
                      {((!isSubmit || (isSubmit && present === '003') && purchaseType !== 'invited_bidding' && purchaseType !== 'public_bidding') || (isSubmit && present === '004' && ['single_source', 'internal_source'].includes(purchaseType))) && <Panel
                        showArrow={false}
                        header={
                          <PanelHeader
                            title={intl.get(`${prompt}.view.title.conformancetab`).d('符合性审查表(最终评审)')}
                            arrowActive={activeKey.includes('comprehensiveFirst')}
                          />
                        }
                        key="comprehensiveFirst"
                      >
                        <ComprehensiveFirst {...headerInfoFormProps} onRef={ref => (this.compreRefFirst = ref)} />
                      </Panel>}
                      {((!submitState || (submitState && present === '003')) && (purchaseType === 'invited_bidding' || purchaseType === 'public_bidding')) && <Panel
                        showArrow={false}
                        className={styles['panelHeader']}
                        header={
                          <PanelHeader
                            title={intl.get(`${prompt}.view.title.techscoretab`).d('技术评分表')}
                            arrowActive={activeKey.includes('technicalScore')}
                            buttons={
                              <>
                                {/* {infoSource.importYesOrNo && <CusButton mini onClick={this.handleOpen}>
                                  {intl.get(`${prompt}.view.title.revertreason`).d('退回理由')}
                                </CusButton>} */}
                                {!infoSource.importYesOrNo && <CusButton mini onClick={(e) => this.technicalScoreExportClick(e)}>
                                  {intl.get(`${prompt}.view.button.export`).d('导出')}
                                </CusButton>}
                                {!infoSource.rateYesOrNo ? (
                                  !submitState && paStating && 
                                    <Upload {...uploadProps}>
                                      <CusButton mini>
                                        {intl.get(`${prompt}.view.button.import`).d('导入')}
                                      </CusButton>
                                    </Upload>
                                  ) : (
                                    !infoSource.importYesOrNo && !submitState && paStating && 
                                    <Upload {...uploadProps}>
                                      <CusButton mini>
                                        {intl.get(`${prompt}.view.button.import`).d('导入')}
                                      </CusButton>
                                    </Upload>
                                  )
                                }
                              </>
                            }
                          />
                        }
                        key="technicalScore"
                      >
                        <TechnicalScore {...headerInfoFormProps} onRef={ref => (this.scoreRef = ref)} />
                      </Panel>}
                      {(!milestonesEndTwo || (isSubmit && present === '004')) && ['single_source', 'internal_source'].includes(purchaseType) &&
                        <Panel
                          showArrow={false}
                          header={
                            <PanelHeader
                              title={intl.get(`${prompt}.view.title.tecclarifyquiz`).d('技术澄清提问')}
                              arrowActive={activeKey.includes('techCAandQA2')}
                            />
                          }
                          key="techCAandQA2"
                        >
                          <PhaseTwoTechCAandQA {...headerInfoFormProps} onRef={ref => (this.caAndQaRef = ref)} />
                        </Panel>
                      }
                    </Collapse>
                  {/* </>
                } */}
              </PageWrapper>
            </div>
          </Scrollbars>
        </div>
        <div className={styles['rightTipBox']} style={{ transition: 'display 1s', display: !anchorFlag ? 'none' : 'block' }}>
          {(disableFlags) &&
            <div className={styles.opinionBox}>
              <Collapse
                ref={this.rightPageRef}
                className="customize-collapse"
                defaultActiveKey='resolution'
              >
                <Panel
                  showArrow={false}
                  collapsible="disabled"
                  header={
                    <PanelHeader
                      title={intl.get(`bid.bidcommon.view.title.Opinions`).d('处理意见')}
                      showArrow={false}
                    />
                  }
                  key="resolution"
                >
                  <Form ref={this.rightTipForm}>
                    <Form.Item
                      name='resolution'
                      rules={[
                        { required: true, message: intl.get(`bid.bidcommon.view.message.Pfo`).d('请填写处理意见') }
                      ]}
                    >
                      {/* <CusInput.TextArea
                        rows={9}
                        autoSize={{ minRows: 9, maxRows: 9 }}
                        maxLength={100}
                      /> */}
                      <div className="textarea-wrapper">
                        <CusInput.TextArea
                          id="myTextarea"
                          rows={9}
                          maxLength={600}
                          value={this.rightTipForm?.current?.getFieldValue('resolution')}
                          onChange={(e) =>{
                            const { value } = e.target;
                            if ((value.length - 1) === MAX_LENGTH) {
                              e.preventDefault();
                              return;
                            } else if ((value.length - 1) > MAX_LENGTH) {
                              const newValue = value.slice(0, MAX_LENGTH);
                              e.target.value = newValue;
                            }
                            this.handleDetailInput(e.target.value);
                          }}
                          style={{ height: '190px', paddingBottom: '22px' }}
                        />
                        <span id="charCount" style={{
                          display: 'block', lineHeight: '19px', height: '19px', color: '#aaa',
                          position: 'absolute', bottom: '5px', right: '5px',
                        }}>
                          {`${(MAX_LENGTH - (this.state.requestRemarksLen || 0)) < 0 ? 0 : (MAX_LENGTH - (this.state.requestRemarksLen || 0))}/${MAX_LENGTH}`}
                        </span>
                      </div>
                    </Form.Item>
                  </Form>
                  <Row gutter={8} className={styles['tipButton']}>
                    <Col span={12}>
                      <CusButton
                        type='primary'
                        style={{ width: '100%', marginLeft: '-3px' }}
                        onClick={this.submitAll}
                        // disabled={!disableFlags || this.state.btnEnd}
                        loading={submitAllLoading}
                      >
                        {intl.get('hzero.common.button.submit').d('提交')}
                      </CusButton>
                    </Col>
                    <Col span={12}>
                      <CusButton
                        style={{ width: '100%', marginLeft: '3px' }}
                        onClick={this.saveAll}
                        // disabled={!disableFlags || this.state.btnEnd}
                        loading={saveAllLoading}
                      >
                        {intl.get('hzero.common.button.save').d('保存')}
                      </CusButton>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </div>
          }
          <div className={styles['tipBox']} style={{ height: windowHeight - rightHeight - 48 + 'px' }}>
            <p style={{ fontWeight: 'bold', color: '#1F2329' }}>{intl.get(`${prompt}.view.title.instructions`).d('使用说明')}</p>
            <div className={styles['p-tip-box']} style={{ height: windowHeight - rightHeight - 48 - 53 + 'px' }} dangerouslySetInnerHTML={{ __html: instruceValue }} />
          </div>
        </div>
        {/* 技术评分表退回理由弹框 */}
        {/* <CusModal
          title={intl.get(`${prompt}.view.title.revertreason`).d('退回理由')}
          visible={reasonModal}
          width="40%"
          footer={
            <CusButton onClick={this.handleCancel}>
              {intl.get(`hzero.common.model.button.close`).d('关闭')}
            </CusButton>
          }
        >
          <CusTable
            columns={reasonColumns}
            scroll={{ x: tableScrollWidth(reasonColumns) }}
            dataSource={revertReasonList}
            pagination={revertReasonPagination}
            rowKey='reasonKey'
            onChange={this.getRevertReason}
          />
        </CusModal> */}
      </div>
    );
  }
}
