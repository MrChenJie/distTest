  /**
   * index.js - 评委评分
   * @date: 2022-04-07
   * @author: xushuming <shuming.xu@hand-china.com>
   * @version: 0.0.1
   * @copyright: Copyright (c) 2018, Hand
   */
  import React from 'react';
  import { connect } from 'dva';
  import { Row, Col, Collapse, Form } from 'antd';
  import CusButton from '_cus_components/CusButton';
  import PanelHeader from '_cus_components/CusCollapse';
  import PageWrapper from '_cus_components/Page/PageWrapper';
  import CusSelect from '_cus_components/CusSelect';
  import CusModal from '_cus_components/CusModal';
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
  import ContractMidlle from './ContractMidlle'; // 商务应答表
  import ContractMidlleJs from './ContractMidlleJs'; // 技术应答表
  import TechnicalScore from './TechnicalScore'; // 技术评分表
  import Comprehensive from './Comprehensive'; // 符合性审查表-初审
  import ComprehensiveFirst from './ComprehensiveFirst'; // 符合性审查表-初评
  import expand from '@/assets/expand.png';
  import fold from '@/assets/fold.png';
  import styles from './index.less';
  import { createPagination } from 'utils/utils';
  import { Scrollbars } from 'react-custom-scrollbars';

  const { Panel } = Collapse;
  const prompt = 'bid.bidcommon';
  const milcommon = 'bid.milestonecommon';

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
  //  saveLoading: loading.effects['contractJudgesCusSorce/saveClarification'],
  //  submitLoading: loading.effects['contractJudgesCusSorce/submit'],
  //  saveScoreLoading: loading.effects['contractJudgesCusSorce/saveScore'],
  //  submitScoreLoading: loading.effects['contractJudgesCusSorce/submitScore'],
  //  saveCompLoading: loading.effects['contractJudgesCusSorce/saveCompliance'], // 符合性审查表保存loading
  //  submitCompLoading: loading.effects[
  //    'contractJudgesCusSorce/submitCompliance',
  //    'contractJudgesCusSorce/getPassFrameSubmit'
  //  ], // 符合性审查表提交loading
    contractJudgesCusSorce,
    // enumMap: contractJudgesCusSorce?.enumMap, // 值集
    infoSource: contractJudgesCusSorce?.infoSource, // 基本信息数据源
    // complianceSource: contractJudgesCusSorce?.complianceSource, // 符合性审查表(初评阶段)数据源
    // compliancePagination: contractJudgesCusSorce?.compliancePagination,
    // passStatus: contractJudgesCusSorce?.passStatus, // 技术符合审查(初审)数据源
    // passPagination: contractJudgesCusSorce?.passPagination,
  }))
  @formatterCollections({
    code: [
      'hzero.common',
      'bid.bidcommon',
      'bid.biddashbord',
      'bid.milestonecommon',
    ]
  })
  export default class JudgesSorce extends React.Component {
    constructor(props) {
      super(props);
      this.leftPageRef = React.createRef(); //为左侧的pagearapper设置ref属性，用于后期获取高度
      this.rightPageRef = React.createRef(); //为右侧的pagearapper设置ref属性，用于后期获取高度
      this.pageRef = React.createRef(); //需要设置的元素
      const { match } = this.props;
      this.state = {
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
        ],
        dataSource: [],
        basicInfo: {},
        purchaseType: match.params.purchaseType,
        anchorFlag: true,
        milestoneId: '',
        milestonesEnd: true,
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
        windowHeight: null,
        showButtonDocumenttb: true,
        showButtonDocument: true,
        showButtonPrice: true,
        showButtonMidlleJs: true,
        showButtonMidlle: true,
        applicationList: [],
        applicationPagination: {},
        scrollOpacity: 0,
        submitLoading: false,
        submitCompLoading: false,
        submitScoreLoading: false,
        saveLoading: false,
        saveCompLoading: false,
        saveScoreLoading: false,
        submitAllLoading: false,
        saveAllLoading: false,
      };
    }

    componentDidMount() {
      this.getIsRefreshChance();
      this.getInstructions();
      this.fetchEnum(); // 查询值集
      this.getProjectInfo();
      // window.scrollTo(100, 0);
      // 在页面加载完成后等待一段时间再获取元素高度;
      window.setTimeout(() => {
        this.getHeight();
      }, 3000);
      window.addEventListener('resize', this.getHeight);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.getHeight);
    }

    // 获取高度
    @Bind()
    getHeight() {
      const leftHeight = this.leftPageRef?.current.offsetHeight;
      const rightHeight = this.rightPageRef?.current.offsetHeight;
      const windowHeight = window.innerHeight;
      this.setState({
        leftHeight,
        rightHeight,
        windowHeight,
      });
    }
    // 获取使用说明模板
    getInstructions = () => {
      const { dispatch, match } = this.props;
      dispatch({
        type: 'contractJudgesCusSorce/getInstructions',
        payload: {
          proId: match.params.proId,
        }
      })
    }
    
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
    // 是否允许保存/提交
    getIsRefreshChance = (caAndQamilestoneId) => {
      const { dispatch, match } = this.props;
      const { isSubmit, submitState, trialResultSubmit, purchaseType, milstonesInfo } = this.state;
      dispatch({
        type: 'contractJudgesCusSorce/isRefreshChance',
        payload: {
          proId: match.params.proId,
        },
      }).then((res) => {
        if (res) {
          let disableFlagValue = false;
          // present=001:技术澄清提问;present=002:初评/初审;present=003:技术评分表
          // button=true允许编辑
          if (res.present) {
            disableFlagValue = res.button
          }
          if (res.present === '001' && res.button === true) {
            this.setState({ milestonesEnd: false, trialResultSubmit: true, isSubmit: true, submitState: true })
            if (milstonesInfo && milstonesInfo[0].milestoneState === "in_process") {
              // 针对技术澄清提问的切换轮次，不是最新轮次且不是进行中，禁止新增删除(技术澄清提问)
              if (caAndQamilestoneId && caAndQamilestoneId === milstonesInfo[0].milestoneId) {
                this.setState({ btnEnd: false });
              }
              // 提交后根据最新的里程碑id判断
              else if (!caAndQamilestoneId && res.milestoneId && res.milestoneId === milstonesInfo[0].milestoneId) {
                this.setState({ btnEnd: false });
              } else {
                this.setState({ btnEnd: true });
              }
            }
          }
          if (res.present === '002' && res.button === true && trialResultSubmit && purchaseType !== 'single_source' && purchaseType !== 'internal_source') { // 初审
            this.setState({ milestonesEnd: true, trialResultSubmit: false, isSubmit: true, submitState: true, btnEnd: false })
          }
          if (res.present === '003' && res.button === true && isSubmit && ['single_source', 'internal_source'].includes(purchaseType)) { // 单一来源：初评为最后流程的情况
            this.setState({ milestonesEnd: true, trialResultSubmit: true, isSubmit: false, submitState: true, btnEnd: false })
          }
          if (res.present === '003' && res.button === true && isSubmit && purchaseType !== 'invited_bidding' && purchaseType !== 'public_bidding' && res.gradingState === 'y') { // 初评
            this.setState({ milestonesEnd: true, trialResultSubmit: true, isSubmit: false, submitState: true, btnEnd: false })
          }
          if (res.present === '003' && res.button === true && (purchaseType === 'invited_bidding' || purchaseType === 'public_bidding') && res.gradingState === 'y') { // 技术评分表
            this.setState({ milestonesEnd: true, trialResultSubmit: true, isSubmit: true, submitState: false, btnEnd: false })
          }
          this.setState({
            milestoneId: res.milestoneId,
            milestoneEndTime: res.milestoneEndTime,
            milestoneStartTime: res.milestoneStartTime,
            milestoneState: res.milestoneState,
            disableFlags: disableFlagValue
          })
        }
      })
    }

    // 针对技术澄清提问的切换轮次，不是最新轮次且不是进行中，禁止新增删除(技术澄清提问)
    changeRoundCAandQA = (milestoneId) => {
      // if (milestoneId === milstonesInfo[0].milestoneId && milstonesInfo[0].milestoneState === "in_process") {
      //   this.setState({ btnEnd: false });
      // } else {
      //   this.setState({ btnEnd: true });
      // }
      this.getIsRefreshChance(milestoneId);
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
          milestoneId: milestoneId !== '' ? getMilestoneId ? getMilestoneId : milestoneId : -1,
          proId: match.params.proId,
        },
      }).then((res) => {
        if (res) {
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
          })
          dispatch({
            type: 'contractJudgesCusSorce/updateState',
            payload: {
              groupUnsaveFlag: false,
            },
          });
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
            payload: milestoneId,
          }).then((res) => {
            if(!isUndefined(res)) {
              const newDataSource = [
                ...applicationList,
                {
                  canEdit: 1, // 编辑标识
                  _status: 'create',
                  organizationId: getCurrentOrganizationId(),
                  proId: match.params.proId, // 项目ID测试:61
                  milestoneId: milestoneId,
                  tempId: uuidv4(),
                  // supplierName: '',
                  // questTo: '',
                  // qaType: '',
                  // qaTypeNew: '',
                  // caseDetail: '',
                  // qaContent: '',
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
          })
        }
      }
    }

    /**
     * 新建未保存数据删除
     */
    @Bind()
    deleteNewRows(deleteRow, newList) {
      // 若有已保存的数据删除
      if (deleteRow.length > 0) {
        let data = deleteRow;
        this.props.dispatch({
          type: 'contractJudgesCusSorce/deleteClarification',
          payload: { data },
        }).then((res) => {
          if (res) {
            this.fetchCAandQAList(this.state.applicationPagination, this.state.milestoneId, newList);
            CusNotification.success();
            this.setState({ applicationList: newList });
          }
        });
      } else {
        CusNotification.success();
        this.setState({ applicationList: newList });
      }
    }

    /**
     * 接口删除
     */
    @Bind()
    deleteExistRows(deleteRow, newList) {
      const { dispatch } = this.props;
      const { applicationPagination } = this.state;
      let data = deleteRow;
      dispatch({
        type: 'contractJudgesCusSorce/deleteClarification',
        payload: { data },
      }).then((res) => {
        if (res) {
          this.fetchCAandQAList(applicationPagination, this.state.milestoneId, newList);
          this.deleteNewRows(data, newList);
        }
      });
    }
    // 确认删除评委提问
    sureDeleteCAandQA = (selectedRows, selectedRowKeys) => {
      const { applicationList, applicationPagination, milestoneId } = this.state;
      const newApplicationList = cloneDeep(applicationList);
      const newSelectedRows = [];
      selectedRowKeys && newApplicationList.forEach((i) => {
        selectedRowKeys.forEach((j) => {
          if (i.tempId === j) {
            newSelectedRows.push(i);
          }
        });
      });
      if (newSelectedRows && newSelectedRows.length > 0 && milestoneId !== '') {
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
          payload: milestoneId,
        }).then((res) => {
          if(!isUndefined(res)) {
            // let data = existRows.map((n) => n.tempId);
            if (newRows.length > 0) {
              CusModal.CusDeleteConfirm(() => this.deleteNewRows(existRows, newList));
            } else if (existRows.length > 0) {
              CusModal.CusDeleteConfirm(() => this.deleteExistRows(existRows, newList));
            } else {
              CusModal.confirm({
                content: intl.get(`${prompt}.view.message.suredelete`).d('是否确认删除'),
                okText: intl.get(`${prompt}.view.title.sure`).d('确定'),
                cancelText: intl.get(`${prompt}.view.button.cancel`).d('取消'),
                onOk: () => {
                  let data = existRows;
                  this.props.dispatch({
                    type: 'contractJudgesCusSorce/deleteClarification',
                    payload: { data },
                  }).then((res) => {
                    if (res) {
                      this.setState({ applicationList: newList });
                      this.fetchCAandQAList(applicationPagination, this.state.milestoneId, newList);
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
          milestoneId: milestoneId !== '' ? getMilestoneId ? getMilestoneId : milestoneId : -1,
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
          this.setState({ saveCompreFlag : false });
          dispatch({
            type: 'contractJudgesCusSorce/updateState',
            payload: {
              compreUnsaveFlag: false,
            },
          });
        }
        // if (res && res.content.length > 0 && res.content[0].gradeGetState === 'y') {
        //   // this.setState({ isSubmit: true })
        //   this.setState({ isSubmit: true, disableFlags: true })
        // } else {
        //   this.setState({ disableFlags: false })
        // }
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
          this.setState({ saveCompreFlag : false });
          dispatch({
            type: 'contractJudgesCusSorce/updateState',
            payload: {
              compreFirstUnsaveFlag: false,
            },
          });
        }
        // if (res) {
        //   if (res.trialResultSubmit === 'y') { // 初审是否已提交
        //     this.setState({ trialResultSubmit: true })
        //   } else {
        //     this.setState({ trialResultSubmit: false })
        //   }
        // }
      })
    }

    /**
     * fetchScoreTable - 查询技术评分表格信息
     */
    fetchScoreTable = () => {
      const { dispatch, match } = this.props;
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
              scoreId: uuidv4(),
            }));
            let lists = [];
            newDataSource.map((item) => {
              lists.push(item.list)
            })
            lists.map((item) => ({
              ...item,
              uuid: uuidv4(),
            }))
            dispatch({
              type: 'contractJudgesCusSorce/updateState',
              payload: {
                judgesSorceDataSource: [...newDataSource, {}, {}],
              },
            });
            this.setState({ newDatasource: [...newDataSource], saveScoreFlag: false })
            // if (lists.length > 0) {
            //   for (let j = 0; j < newDataSource.length; j++) {
            //     let total = 0;
            //     for (let i = 0; i < lists[j].length; i++) {
            //       if (newDataSource[j] !== undefined && newDataSource[j].list !== undefined && newDataSource[j].list[i] !== undefined) {
            //         total += Number(newDataSource[j].list[i].answerGetScore)
            //         newDataSource[j].list[i].total = total
            //       } else {
            //         newDataSource[j].list[i].total = 0;
            //       }
            //       total = 0;
            //     }
            //   }
            //   dispatch({
            //     type: 'contractJudgesCusSorce/updateState',
            //     payload: {
            //       judgesSorceDataSource: [...newDataSource, {}, {}],
            //     },
            //   });
            // }
          }
          this.setState({ groupUnsaveScoreFlag: false })
          // if (res[0] && res[0].submit === true) {
          //   this.setState({ submitState: true, disableFlags: true })
          // } else {
          //   this.setState({ submitState: false, disableFlags: false })
          // }
        }
      })
    }
    // 保存澄清提问
    @Bind
    saveCAandQA(callback) {
      const { dispatch, contractJudgesCusSorce: { mySource = [] } } = this.props;
      const { milestoneId, saveCAandQAFlag, applicationList } = this.state;
      dispatch({
        type: 'contractJudgesCusSorce/getMilDeadline',
        payload: milestoneId,
      }).then((res) => {
        if(!isUndefined(res)) {
          this.caAndQaRef?.caAndQaForm?.current?.validateFields().then((values) => {
            const newData = applicationList.map((item) =>
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
            if (data.length > 0 && milestoneId !== '') {
              dispatch({
                type: 'contractJudgesCusSorce/saveClarification',
                payload: {
                  milestoneId: milestoneId,
                  data,
                },
              }).then((res) => {
                if (res) {
                  if (typeof callback === 'function') {
                    callback();
                  } else {
                    if (!saveCAandQAFlag) {
                      CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功') });
                    }
                    this.fetchCAandQAList();
                    this.setState({ saveCAandQAFlag: true });
                  }
                  this.setState({ saveAllLoading: false, submitAllLoading: false })
                }
              });
            }
          }).catch(() => {
            this.setState({ saveAllLoading: false, submitAllLoading: false })
          })
        }
      })
    }
    // 保存符合性审查表(初评阶段)+（初审）
    @Bind
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
                  if (!saveCompreFlag) {
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
              this.setState({ saveAllLoading: false, submitAllLoading: false })
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
                  if (!saveCompreFlag) {
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
              this.setState({ saveAllLoading: false, submitAllLoading: false })
            });
          }
        }).catch(() => {
          this.setState({ saveAllLoading: false, submitAllLoading: false })
        })
      }
    }

    // 保存技术评分表
    @Bind
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
                if (!saveScoreFlag) {
                  CusNotification.success({
                    message: intl.get(`${prompt}.view.title.savesuccessfully`).d('保存成功'),
                  });
                }
                this.fetchScoreTable();
                this.setState({ saveScoreFlag: true })
              }
            } else {
              if (!saveScoreFlag) {
                CusNotification.error({
                  message: intl.get(`${prompt}.view.title.scoreoutofrange`).d('分数不在设置范围')
                })
              } else {
                CusNotification.error()
              }
            }
            this.setState({ saveAllLoading: false, submitAllLoading: false })
          });
        }
      }).catch(() => {
        this.setState({ saveAllLoading: false, submitAllLoading: false })
      })
    }

    // 保存评委评分页面可保存的数据
    @Debounce(200)
    saveAll = () => {
      const { milestonesEnd, submitState, trialResultSubmit, isSubmit } = this.state;
      this.setState({ saveAllLoading: true });
      setTimeout(() => {
        // 保存澄清提问：当澄清提问里程碑结束时不进行保存
        if (!milestonesEnd) {
          this.saveCAandQA();
        }
        // 保存符合性审查表-初评/初审
        if (!trialResultSubmit || !isSubmit) {
          this.saveCompliance();
        }
        // 保存技术评分表：当采购点击完里程碑的【确认评分】可以进行保存，此判断在saveAll的disable里判断了paStating
        if (!submitState) {
          this.saveTechnicalScore();
        }
      }, 300)
    }

    // 提交澄清提问
    submitCAandQA = () => {
      const { match, dispatch } = this.props;
      const { milestoneId } = this.state;
      dispatch({
        type: 'contractJudgesCusSorce/getMilDeadline',
        payload: milestoneId,
      }).then((res) => {
        if(!isUndefined(res)) {
          dispatch({
            type: 'contractJudgesCusSorce/submit',
            payload: {
              milestoneId: milestoneId,
              proId: match.params.proId,
            },
          }).then((res) => {
            if (res.message == 'ok') {
              this.setState({ saveCAandQAFlag: false });
              CusNotification.success({ message: intl.get(`bid.bidcommon.view.title.submitsuccessfully`).d('提交成功') });
              this.fetchCAandQAList();
              this.getIsRefreshChance();
            } else {
              CusNotification.error()
            }
            this.setState({ submitAllLoading: false });
          })
        }
      })
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
          }, 300);
        } else {
          CusNotification.error()
        }
        this.setState({ submitAllLoading: false });
      })
    }

    // 根据当前里程碑状态提交当前可提交的
    // 当存在里程碑，且里程碑有效期内，提交过的数据不支持修改
    @Debounce(200)
    submitAll = () => {
      const {
        milestonesEnd,
        submitState,
        trialResultSubmit,
        isSubmit,
      } = this.state;
      this.setState({ submitAllLoading: true });
      setTimeout(() => {
        // 提交澄清提问
        if (!milestonesEnd) { // 未提交
          this.saveCAandQA(() => {
            this.submitCAandQA();
          });
        }
        // 判断是否答疑完结，若完结=true则可以开始提交符合性审查
        // if (!this.state.paStating && (this.props.contractJudgesCusSorce.editPassFrame || !this.props.contractJudgesCusSorce.editPassFrame)) {
          // 提交符合性审查表-初审
          if (!trialResultSubmit) {
            this.saveCompliance(() => {
              this.submitCompliancePrel();
            });
          }
          // 提交技术符合审查表信息(初评)
          if (!isSubmit) {
            this.saveCompliance(() => {
              this.submitComplianceFirst();
            });
          }
        // }
        // 提交技术评分表
        if (!submitState) {
          this.saveTechnicalScore(() => {
            this.submitTechnicalScore();
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
      this.setState({ biddingMilestoneId: stateMilestoneId})
      this.getMilestones(stateMilestoneId);
    }
    // 全部下载
    @Bind
    downLoadAll(e) {
      e.stopPropagation();
      const { dispatch, match, contractJudgesCusSorce: { infoSource } } = this.props;
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
        const fileName = infoSource.proInfoWording ?
          intl.get(`${prompt}.view.title.biddingdocument`).d('招标文件')
          : intl.get(`${prompt}.view.title.documentcategorynew`).d('比选文件') +'.zip';
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
      this.setState({ priceMilestoneId: stateMilestoneId})
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
    @Bind
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
    @Bind
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
      //  saveLoading = false,
      //  submitLoading = false,
      //  saveScoreLoading = false,
      //  submitScoreLoading = false,
      //  saveCompLoading = false,
      //  submitCompLoading = false,
        contractJudgesCusSorce: {
          infoSource,
          instruceValue,
          myMilestones,
          milestonesTb,
          milestonesBj,
          answerMilestonesJs,
          answerMilestones,
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
        milestonesEnd,
        milstonesInfo,
        paStating,
        isSubmit,
        submitState,
        disableFlags,
        trialResultSubmit,
        rightHeight,
        windowHeight,
        showButtonDocumenttb,
        showButtonDocument,
        showButtonPrice,
        showButtonMidlleJs,
        showButtonMidlle,
        applicationList,
        applicationPagination,
        biddingMilestoneId,
        priceMilestoneId,
        submitLoading,
        submitCompLoading,
        submitScoreLoading,
        saveLoading,
        saveCompLoading,
        saveScoreLoading,
        submitAllLoading,
        saveAllLoading,
      } = this.state;
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
        fetchCAandQAList: this.fetchCAandQAList, // 查询自己的技术澄清提问
        deleteCAandQA: this.sureDeleteCAandQA,
        handleAddQusetionLine: this.handleAddQusetionLine,
        deleteNewRows: this.deleteNewRows,
        deleteExistRows: this.deleteExistRows,
        applicationList,
        applicationPagination,
        fetchOtherList: this.fetchOtherList,
        fetchScoreTable: this.fetchScoreTable, // 查询技术评分表
        fetchCompliance: this.fetchCompliance, // 查询符合性审查表(初评阶段)
        getPassFrame: this.getPassFrame, // 查询技术符合审查表信息(初审)
        milestoneId,
        milestoneEndTime,
        milestoneStartTime,
        milestoneState,
        milestonesEnd, // 澄清提问表-是否已提交
        milstonesInfo,
        isSubmit, // 初评
        submitState, // 技术评分表-是否已经提交
        trialResultSubmit, // 初审
        onRef: (ref) => {
          this.tbAndBjForm = ref.tbAndBjForm;
          this.compreForm = ref.compreForm;
          this.compreFormFirst = ref.compreFormFirst;
          this.contractForm = ref.contractForm;
          this.caAndQaForm = ref.caAndQaForm;
          this.scoreForm = ref.scoreForm;
        },
        getPriceMilestones: this.getPriceMilestones, // 查询报价文件
        getMilestones: this.getMilestones, // 查询投标文件
        biddingMilestoneId,
        priceMilestoneId,
        changeRoundCAandQA: this.changeRoundCAandQA,
        btnEnd: this.state.btnEnd,
      };
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
            style={{ transition: 'width 0.5s', width: !anchorFlag ? '100%' : '73.6%' }}
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
                  //   getTenderListLoading ||
                  //   getDiddingListLoading ||
                  //   getPriceFileListLoading ||
                  //   getAnswerListJsLoading ||
                  //   getAnswerListLoading ||
                  //   mySourceLoading ||
                  //   otherSourceLoading ||
                  //   complianceLoading ||
                  //   passListLoading ||
                    judgesSorceList
                }
              >
                <Collapse
                  ref={this.leftPageRef}
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
                    className={styles['tenderDocuments-tip']}
                    header={
                      <PanelHeader
                        title={infoSource.proInfoWording ?
                          intl.get(`${prompt}.view.title.biddingdocument`).d('招标文件')
                          : intl.get(`${prompt}.view.title.documentcategorynew`).d('比选文件')
                        }
                        arrowActive={activeKey.includes('tenderDocuments')}
                        buttons={
                          showButtonDocument && <>
                            <CusButton onClick={(e) => this.downLoadAll(e)}>
                              {intl.get(`bid.bidcommon.view.button.downloadall`).d('全部下载')}
                            </CusButton>
                          </>
                        }
                      />
                    }
                    key="tenderDocuments"
                  >
                    <TenderDocuments {...headerInfoFormProps} />
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
                  {(purchaseType !== 'single_source' && purchaseType !== 'internal_source') && <Panel
                    showArrow={false}
                    header={
                      <PanelHeader
                        title={intl.get(`${prompt}.view.title.PreliminaryReview`).d('技术符合审查(初审)')}
                        arrowActive={activeKey.includes('comprehensive')}
                      />
                    }
                    key="comprehensive"
                  >
                    <Comprehensive {...headerInfoFormProps} onRef={ref => (this.compreRef = ref)} />
                  </Panel>}
                  {(purchaseType !== 'invited_bidding' && purchaseType !== 'public_bidding') && <Panel
                    showArrow={false}
                    header={
                      <PanelHeader
                        title={intl.get(`${prompt}.view.title.conformancetab`).d('符合性审查表（初评阶段）')}
                        arrowActive={activeKey.includes('comprehensiveFirst')}
                      />
                    }
                    key="comprehensiveFirst"
                  >
                    <ComprehensiveFirst {...headerInfoFormProps} onRef={ref => (this.compreRefFirst = ref)} />
                  </Panel>}
                  {(purchaseType === 'invited_bidding' || purchaseType === 'public_bidding') && <Panel
                    showArrow={false}
                    className={styles['panelHeader']}
                    header={
                      <PanelHeader
                        title={intl.get(`${prompt}.view.title.techscoretab`).d('技术评分表')}
                        arrowActive={activeKey.includes('technicalScore')}
                      />
                    }
                    key="technicalScore"
                  >
                    <TechnicalScore {...headerInfoFormProps} onRef={ref => (this.scoreRef = ref)} />
                  </Panel>}
                </Collapse>
              </PageWrapper>
              </div>
            </Scrollbars>
          </div>
          <div className={styles['rightTipBox']} style={{ transition: 'display 1s', display: !anchorFlag ? 'none' : 'block' }}>
            <Row gutter={8} ref={this.rightPageRef} className={styles['tipButton']}>
              <Col span={12}>
                <CusButton
                  type='primary'
                  style={{ width: '100%', marginLeft: '0' }}
                  onClick={this.submitAll}
                  // disabled={milestonesEnd || isSubmit || submitState || trialResultSubmit}
                  disabled={!disableFlags || this.state.btnEnd}
                  loading={submitAllLoading}
                //  loading={submitLoading || submitScoreLoading || submitCompLoading || saveLoading || saveScoreLoading || saveCompLoading}
                >
                  {intl.get('hzero.common.button.submit').d('提交')}
                </CusButton>
              </Col>
              <Col span={12}>
                <CusButton
                  style={{ width: '100%', marginLeft: '0' }}
                  onClick={this.saveAll}
                  // disabled={milestonesEnd || isSubmit || submitState || trialResultSubmit}
                  disabled={!disableFlags || this.state.btnEnd}
                  loading={saveAllLoading}
                //  loading={saveLoading || saveScoreLoading || saveCompLoading}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </CusButton>
              </Col>
            </Row>
            <div className={styles['tipBox']} style={{ height: windowHeight - rightHeight - 48 + 'px' }}>
              <p style={{ fontWeight: 'bold', color: '#1F2329' }}>{intl.get(`${prompt}.view.title.instructions`).d('使用说明')}</p>
              <p className={styles['p-tip-box']} style={{ height: windowHeight - rightHeight - 48 - 53 + 'px' }} dangerouslySetInnerHTML={{ __html: instruceValue }}></p>
            </div>
          </div>
        </div>
      );
    }
  }
