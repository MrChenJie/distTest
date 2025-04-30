import React from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth, getCurrentUser, createPagination } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusTable from '_cus_components/CusTable';
import uuid from 'uuid/v4';
import dayjs from 'dayjs';
import { Checkbox } from 'antd';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import CusNotification from '_cus_components/CusNotification';
import { getDateTimeFormat, getCurrentLanguage, } from 'utils/utils';
import QuotationDocumentSubmitEditModal from './QuotationDocumentSubmitEditModal'
import RequestInquiryModal from './RequestInquiryModal'
// import ExportHistoryData from './components/ExportHistoryData';
import { operatorRender, numberRender } from 'utils/renderer';
import classnames from 'classnames';
import styles from './index.less';
import { getEditTableData } from 'hzero-front/lib/utils/utils';

const currentUser = getCurrentUser();
const language = getCurrentLanguage();

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'prThirdStageId';


@connect(({ purchaseApplicationModel, loading = {} }) => ({
  purchaseApplicationModel,
  queryLoading: loading.effects['purchaseApplicationModel/stageQuery'],
  sendLoading: loading.effects['purchaseApplicationModel/supplierSend'],
  submitLoading: loading.effects['purchaseApplicationModel/editTimeSave'] ||
  loading.effects['purchaseApplicationModel/addNextRoundSave'],
}))

@formatterCollections({ code: [promptCode] })
export default class StageTable extends React.Component {
  constructor(props) {
    super(props);
    // const { onRef } = props;
    // if (onRef) {
    //   onRef(this);
    // };
    this.state = {
      querySupplierLoading: false, //供应商列表数据查询loading
      reviewModalVisible: false, // 询价邀请预览-modal
      modalVisible: false, // 编辑时间-modal
      quotationForm: {}, // 报价文件递交参数；
      stage: undefined, //用于判断是编辑时间还是添加下一轮 stage ='one'—— 编辑时间 , stage ='two' —— 添加下一轮
      priceModalVisible: false,
      priceColumns: [],
      selectData: [], //选择报价勾选中的数据
      allocationAmountModalVisible: false,
      isCheckSend: '',
      selectSupplierVisible: false,
      milestoneId: null,
    };
  }

  /**
  * @description 打开询价邀请 预览Modal
  */
  @Bind()
  openRequestInquiryModal(record) {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { refHeadId } = purchaseApplicationModel;

    this.setState({
      reviewModalVisible: true,
      querySupplierLoading: true,
    })

    // 这里还要调一个查询供应商列表的接口
    this.handleStagePreview(refHeadId);
  }

  /**
 * @description 关闭询价邀请 预览Modal
 */
  @Bind()
  handleCloseReviewModal() {
    const { purchaseApplicationModel } = this.props
    const { refHeadId } = purchaseApplicationModel;
    this.setState({
      reviewModalVisible: false,
    });
    this.handleStageQuery(refHeadId);
  }

  /**
  * @description 阶段查询；
  */
  @Bind()
  handleStageQuery(refHeadId) {
    const { dispatch } = this.props;
    // 发送全部邀请 接口
    // 调用阶段查询接口；
    dispatch({
      type: `purchaseApplicationModel/stageQuery`,
      payload: {
        refHeadId,  // 基本信息id
      }
    }).then(res => {
      let rounds = 0;
      const stageList = res?.map(item => {
        if (item.stageArrangement.includes('submissionOfQuotationDocuments')) {
          rounds++;
          return {
            ...item,
            _status: 'update',
            prThirdStageId: uuid(),
            rounds: rounds.toString(),
          }
        } else {
          return {
            ...item,
            _status: 'update',
            prThirdStageId: uuid(),
          }
        }
      })
      dispatch({
        type: `purchaseApplicationModel/updateState`,
        payload: {
          stageList,
        }
      })
    })
  }
  /**
  * @description 阶段预览；
  */
  @Bind()
  handleStagePreview(refHeadId) {
    const { dispatch } = this.props;
    // 发送全部邀请 接口
    // 调用阶段查询接口；
    return dispatch({
      type: `purchaseApplicationModel/stagePreview`,
      payload: {
        refHeadId,  // 基本信息id
      }
    }).then(res => {
      if (res) {
        dispatch({
          type: `purchaseApplicationModel/updateState`,
          payload: {
            supplierList: res,  // 供应商列表
          }
        })

        this.setState({
          querySupplierLoading: false,
        })

      }
    })
  }

  // 获取当前行里程碑状态
  @Bind()
  handleMilestoneState(record, callback) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/getMilestoneState',
      payload: {
        stageId: record.id, // 里程碑id
      }
    }).then((res) => {
      if(res) {
        if(res.status === 'completed') {
          CusNotification.warning({
            message: intl.get('HKPC.commom.view.title.deadlinepassed').d('已过此阶段的截止时间')
          })
          if (typeof callback === 'function') {
            callback(false);
          }
        } else {
          if (typeof callback === 'function') {
            callback(true);
          }
        }
      }
    })
  }


  /**
  * @description 打开 编辑时间 Modal
  * @param {object} record  - 当前行数据
  * @param {object} stage  - 用于判断是点击编辑时间还是添加下一轮； one是编辑时间，two是添加下一轮
  */
  @Bind()
  openEditTimeModal(record, stage) {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { refHeadId, stageList } = purchaseApplicationModel;
    let rounds = 0;
    if (stage === 'one') {
      this.handleMilestoneState({ ...record }, (res) => {
        if (res) {
          this.setState({
            modalVisible: true,
            quotationForm: {
              ...record,
              stageRounds: record?.rounds,
            },
            stage,
          });
        }
      });
    } else {
      // 查询供应商信息；
      dispatch({
        type: `purchaseApplicationModel/stagePreview`,
        payload: {
          refHeadId, // 基本信息id
        },
      }).then((res) => {
        if (res) {
          const quotationForm = {
            ...record,
            supplierList: res,
            stageRounds: `${parseInt(record?.rounds) + 1}`,
            rounds: `${parseInt(record?.rounds) + 1}`,
            stageArrangement: `submissionOfQuotationDocuments(${parseInt(record?.rounds) + 1})`,
            stageArrangementMeaning: `${
              language === 'zh_CN' ? '报价文件递交' : 'Submission of quotation documents'
            }(${parseInt(record?.rounds) + 1})`,
            startTime: '',
            deadline: '',
            reason: '',
          };
          this.setState({
            modalVisible: true,
            quotationForm,
            stage,
          });
        }
      });
    }
  }

  /**
 * @description 全部发送
 */
  @Bind()
  sendAllemail() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { supplierList = [], refHeadId } = purchaseApplicationModel;
    // 发送
    dispatch({
      type: `purchaseApplicationModel/supplierSend`,
      payload: {
        prThirdSupList: supplierList,
      }
    }).then(res => {
      // console.log('res', res);
      if (res) {
        // 多语言待完善
        CusNotification.success({
          message: intl
            .get(`${promptCode}.view.message`)
            .d('发送成功'),
        });
        this.handleStagePreview(refHeadId);
      }
    })

  }


  // 查询条件格式化
  @Bind()
  formatValues(values) {
    const { startTime, deadline } = values || {};
    return {
      ...values,
      startTime: startTime ? dayjs(startTime).format(getDateTimeFormat()) : undefined,
      deadline: deadline ? dayjs(deadline).format(getDateTimeFormat()) : undefined,
    };
  }


  /**
 * @description 报价文件提交
 */
  @Bind()
  submitQuotation() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { selectedRowKeys, refHeadId } = purchaseApplicationModel;
    const { quotationForm, stage } = this.state;

    // console.log('stage', stage);
    const qForm = this.qForm.getFieldsValue();
    const newQuotationForm = { ...quotationForm, ...qForm };
    const handleQuotationForm = this.formatValues(newQuotationForm);
    handleQuotationForm.stageName = handleQuotationForm.stageArrangement; // 阶段名称字段和前面不一致；
    handleQuotationForm.refStageId = handleQuotationForm.id;
    handleQuotationForm.id = null;
    handleQuotationForm.tenantId = currentUser.tenantId;
    const record = {
      id: handleQuotationForm.refStageId
    }
    if (stage === 'one') {
      this.handleMilestoneState({ ...record }, (res) => {
        if (res) {
          // 编辑时间入口
          // 拿当前时间做判断，如果已经超过了截止时间，那就不让编辑时间继续保存了，并且退出的时候刷新一下页面；
          // 下述代码就是实现逻辑，要用的时候放开就行，加一个多语言提示；
          // console.log('handleQuotationForm', handleQuotationForm);
          // const currentTime = dayjs(); //当前时间
          // const deadline = dayjs(handleQuotationForm?.deadline); //截止时间
          // if (currentTime.isAfter(deadline)) {
          //   return window.location.reload();
          // }
          // -----------------------------------------------------

          // 提交接口
          dispatch({
            type: `purchaseApplicationModel/editTimeSave`,
            payload: {
              ...handleQuotationForm,
            },
          }).then(() => {
            this.setState({
              modalVisible: false,
            });
            this.handleStageQuery(refHeadId);
          });
        }
      });
    } else if (stage === 'two') {
      // 添加下一轮入口
      const { supplierList } = quotationForm;
      let newSupplierList = supplierList.filter((itemA) => selectedRowKeys.includes(itemA.id));
      newSupplierList = newSupplierList?.map((item) => {
        return {
          ...item,
          currStatus: '1',
          deadline: handleQuotationForm.deadline,
        };
      });

      // console.log('newSupplierList', newSupplierList); //这里的newSupplierList 就是在报价文件提交时候，选择的供应商；
      // 提交接口
      dispatch({
        type: `purchaseApplicationModel/addNextRoundSave`,
        payload: {
          ...handleQuotationForm,
          prThirdSups: newSupplierList,
        },
      }).then((res) => {
        this.setState({
          modalVisible: false,
        });
        this.handleStageQuery(refHeadId);
      });
    }
  }


  // 跳转报价文件详情页面
  @Bind()
  handleDetailsPage(record) {
    //获取跳转页面所需要带的参数
    const { purchaseApplicationModel, prName, prNumber } = this.props;
    const { inquireBaseInfo } = purchaseApplicationModel;
    //采购中心采购申请询价单主表 id 
    const id = inquireBaseInfo?.id;
    //关联采购申请ID refPrFirstId
    const refPrFirstId = inquireBaseInfo?.refPrFirstId;
    //项目编码 projectNumber
    const projectNumber = inquireBaseInfo?.refProjectNo;
    //报价货币 currency
    const currency = inquireBaseInfo?.currency;
    //轮次 rounds
    const rounds = record.rounds;
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    let url = `${isPub ? '/pub' : ''}/ssrc-hk/quotation-document-detail-page?id=${id}&refPrFirstId=${refPrFirstId}&projectNumber=${projectNumber}&currency=${currency}&rounds=${rounds}&prNumber=${prNumber}&prName=${prName}`;
    window.open(url, '_blank');
  }

  // // 跳转价格汇总表页面
  // @Bind()
  // handlePriceSummaryPage() {
  //   //获取跳转页面所需要带的参数
  //   const { purchaseApplicationModel, caseId, } = this.props;
  //   const { inquireBaseInfo, stageList = [], equal } = purchaseApplicationModel;
  //   //采购中心采购申请询价单主表 id 
  //   const id = inquireBaseInfo?.id;
  //   //关联采购申请ID refPrFirstId
  //   const refPrFirstId = inquireBaseInfo?.refPrFirstId;
  //   //项目编码 projectNumber
  //   const projectNumber = inquireBaseInfo?.refProjectNo;
  //   //报价货币 currency
  //   const currency = inquireBaseInfo?.currency;
  //   if (caseId) {
  //     window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
  //   } else {
  //     window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_yibancaigoushishi&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/price-summary-detail-page&refHeadId=${id}`)}`);
  //   }
  //   // window.open(`/ssrc-hk/price-summary-detail-page?refHeadId=${id}`);

  // }

  @Bind
  changeCheck(record, index) {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { reviewPriceData = [] } = purchaseApplicationModel;
    const selectDataId = record.data[index].supId;
    const newReviewPriceData = reviewPriceData.map((item, index2) => {
      item.data.map(i => {
        if (i.supId === selectDataId) {
          i.seleted = true;
          this.setState({
            selectData: [
              {
                ...i,
                roundNum: item.roundNum
              }
            ]
          })
        } else {
          i.seleted = false;
        }
        return i
      })
      return item;
    })
    dispatch({
      type: `purchaseApplicationModel/updateState`,
      payload: {
        reviewPriceData: newReviewPriceData,
      }
    })
  }

  // isSelectSup
  // Y:已申请，N未申请
  @Bind()
  handlePriceSummaryPage(record) {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { priceSummaryList = [], refHeadId, inquireBaseInfo } = purchaseApplicationModel;
    console.log('inquireBaseInfo', inquireBaseInfo)
    dispatch({
      type: `purchaseApplicationModel/getCheckSend`,
      payload: {
        refHeadId,
      }
    }).then((checkResult) => {
      this.setState({
        isCheckSend: checkResult.isSelectSup,
        milestoneId: record?.id,
      }, () => {
        if(checkResult.isSelectSup === 'Y' && inquireBaseInfo?.isFrameAgreement === 'Y') {
          this.getFrameAgreementList();
        } else {
          this.getSelectSupplierList();
        }
      })
    })
  }

  // 框架协议表查询-调接口的查询
  @Bind()
  getFrameAgreementList() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { refHeadId } = purchaseApplicationModel;
    dispatch({
      type: 'purchaseApplicationModel/getPriceSumlList',
      payload: {
        refHeadId,
      }
    }).then((res) => {
      const newDataSource = res.map((item) => ({
        ...item,
        _status: 'update',
        supId: uuid(),
      }));
      this.setState({
        allocationAmountModalVisible: true,
      }, () => {
        dispatch({
          type: `purchaseApplicationModel/updateState`,
          payload: {
            allocationAmountDataSource: newDataSource,
          },
        });
      })
    })
  }

  // 选择供应商和报价表
  @Bind()
  getSelectSupplierList() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const {
      priceSummaryList = [],
      refHeadId
    } = purchaseApplicationModel;
    const { isCheckSend } = this.state;

    dispatch({
      type: `purchaseApplicationModel/getReviewPrice`,
      payload: {
        id: refHeadId,
        refHeadId,
      }
    }).then(res => {
      if (res) {
        let columns = [
          {
            title: intl.get(`${promptCode}.view.title.Round`).d('轮次'),
            dataIndex: 'roundNum',
            width: 150,
          },
        ];

        res?.supResultVoList?.map((item, index) => {
          const obj = {
            title: `${item.supName}`, // 供应商1、2、3
            key: uuid(),
            width: 160,
            render: (val, record) => {
              record?.data.map((item) => {
                record?.selectSupList.map((el) => {
                  if(item.refSupId === el) {
                    item.seleted = true
                  }
                })
              })
              return (
                <>
                  <Checkbox
                    disabled={record?.data[index]?.priceTotal === null}
                    checked={record?.data[index]?.seleted}
                    onChange={() => isCheckSend === 'N' && this.changeCheck(record, index)}
                  >
                    {record?.data[index]?.priceTotal === null
                      ? intl.get(`${promptCode}.view.title.notsubmitquotation`).d('未报价')
                      : numberRender(record?.data[index]?.priceTotal, 2)}
                  </Checkbox>
                </>
              )
            }
          };
          columns.push(obj);
        })

        this.setState({
          priceColumns: columns,
          supList: res?.supResultVoList
        })

        const dataSource = res?.roundVoList?.map((i) => {
          let obj = {
            roundNum: i.roundNum,
            data: [],
            selectSupList: i.selectSupList
          }
          i.supPriceVoList.map((item, index) => {
            obj.data.push({
              priceTotal: item.priceTotal,
              seleted: false,
              supId: uuid(),
              refSupId: item.refSupId,
            })
          });
          return obj;
        })
        dispatch({
          type: `purchaseApplicationModel/updateState`,
          payload: {
            reviewPriceData: dataSource
          }
        })
        this.setState({
          priceModalVisible: true
        })
      }
    })
  }

  // 选择报价弹框取消
  @Bind()
  handleCancel() {
    this.setState({
      priceModalVisible: false,
    });
  }

  // 框架协议表取消
  @Bind()
  handleAllocationCancel() {
    this.setState({
      priceModalVisible: true,
      allocationAmountModalVisible: false,
    });
  }

  // 选择供应商报价表，区分是否是框架协议
  // Y：打开框架协议表，分配金额，这里选报价后，框架协议表的数据是本地的
  // N：直接保存
  @Bind()
  handleOk() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { refHeadId, inquireBaseInfo } = purchaseApplicationModel;
    const { selectData, supList, milestoneId } = this.state;
    const url = `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_yibancaigoushishi&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/demander-confirmation-implement&refHeadId=${refHeadId}`)}`;
    console.log('selectData', selectData)
    console.log('supList', supList)
    if(inquireBaseInfo?.isFrameAgreement === 'Y') {
      // 框架协议走这里
      const newDataSource = selectData.map((item) => {
        const foundSup = supList.find((el) => el.supId === item.refSupId);
        return {
          refHeadId: refHeadId,
          refSupId: item.refSupId,
          rounds: item.roundNum,
          supName: foundSup ? foundSup.supName : '',
          priceOriginak: item.priceTotal,
          supId: item.supId,
          _status: 'update',
        }
      })
      this.setState({
        allocationAmountModalVisible: true,
        priceModalVisible: false,
      }, () => {
        dispatch({
          type: `purchaseApplicationModel/updateState`,
          payload: {
            allocationAmountDataSource: newDataSource,
          },
        });
      })
    } else {
      const params = selectData.map((item) => {
        const foundSup = supList.find((el) => el.supId === item.refSupId);
        return {
          refHeadId: refHeadId,
          refSupId: item.refSupId,
          rounds: item.roundNum,
          supName: foundSup ? foundSup.supName : '',
        }
      })
      dispatch({
        type: `purchaseApplicationModel/saveSelectSupplier`,
        payload: {
          priceTolList: params,
          url,
          templateCode: 'BPM_SCM_yibancaigoushishi', // 询价1
          refHeadId,
          stageId: milestoneId,
        }
      }).then((res) => {
        if(res) {
          this.setState({
            priceModalVisible: false,
          });
        }
      })
    }
  }

  @Bind
  handleSave() {
    const { dispatch, purchaseApplicationModel } = this.props;
    const { refHeadId, allocationAmountDataSource } = purchaseApplicationModel;
    const { milestoneId } = this.state;
    const url = `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_yibancaigoushishi&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/demander-confirmation-implement&refHeadId=${refHeadId}`)}`;
    const params = getEditTableData(allocationAmountDataSource).map((item) => ({
      refHeadId: item.refHeadId,
      refSupId: item.refSupId,
      rounds: item.rounds,
      supName: item.supName,
      selectedAmount: item.selectedAmount,
    }))
    dispatch({
      type: `purchaseApplicationModel/saveSelectSupplier`,
      payload: {
        priceTolList: params,
        url,
        templateCode: 'BPM_SCM_yibancaigoushishi', // 询价1
        refHeadId,
        stageId: milestoneId,
      }
    }).then((res) => {
      if(res) {
        this.setState({
          allocationAmountModalVisible: false,
        });
      }
    })
  }

  // 录入报价
  handleEnterQuotation = (page = {}, record) => {
    console.log('record', record);
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/getEnterQuotationList',
      payload: {
        page,
        isTry: 'Y',
        refHeadId: record?.refHeadId,
        refRoundsId: record?.refRoundsId,
      } 
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuid(),
        }));
        this.setState({
          selectSupplierVisible: true,
          selectSupplierDataSource: newDataSource,
          selectSupplierPagination: createPagination(res),
          lineRecord: record,
        })
      }
    })
  }

  // 选择报价
  handleSaveSupplier = () => {
    const { selectedRows = [], lineRecord } = this.state;
    const [ singleRow ] = selectedRows;
    console.log('lineRecord', lineRecord);
    
    if(selectedRows.length > 0) {
      console.log('singleRow', singleRow);
      const url = `/pub/ssrc-hk/enter-quotation-detail?refSupId=${singleRow?.id}&refHeadId=${singleRow?.refHeadId}&refStageId=${lineRecord?.id}&rounds=${lineRecord?.rounds}&refRoundsId=${lineRecord?.refRoundsId}`
      window.open(url, '_black');
      this.setState({
        selectSupplierVisible: false,
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      })
    }
  }

  render() {
    const {
      // onChange = (e) => e,
      // getQueryParams = (e) => (e),
      purchaseApplicationModel,
      dispatch,
      queryLoading,
      sendLoading = false,
      submitLoading = false,
      isSendAllFlag,
    } = this.props;
    const {
      stageList = [],
      inquireBaseInfo = {},
      supplierList = [],
      allocationAmountDataSource = [],
      reviewPriceData = [],
      InviteSuppliersList
    } = purchaseApplicationModel;
    const {
      stage,
      modalVisible,
      reviewModalVisible,
      querySupplierLoading,
      quotationForm,
      priceModalVisible,
      priceColumns,
      isCheckSend,
      allocationAmountModalVisible,
      selectSupplierVisible,
      selectSupplierDataSource,
      selectSupplierPagination,
      selectedRowKeys,
      lineRecord,
    } = this.state;
    // console.log('stageList', stageList);
    let deadline;  // 有编辑时间
    let arrangement = stageList.filter(item => item.stageArrangement.includes('submissionOfQuotationDocuments'));
    if (arrangement && arrangement.length > 0) {
      deadline = arrangement[arrangement.length - 1]?.deadline;
    }
    let isSendAll; //是否已经全部发送过；
    if (supplierList.length > 0) {
      isSendAll = supplierList.filter(i => i.isInviteSended === 'false').length > 0 ? false : true;
    } else {
      isSendAll = true;
    }

    const requestInquiryModalProps = {
      dispatch,
      isSendAllFlag,
      querySupplierLoading,
      purchaseApplicationModel,
      stagePreview: this.handleStagePreview,
    }
    const quotationDocumentSubmitEditProps = {
      stage,
      dispatch,
      purchaseApplicationModel,
      quotationForm,
      stagePreview: this.handleStagePreview,
      onRef: (ref) => {
        this.qForm = ref.props.form;
      },
    }
    const priceModalProps = {
      columns: priceColumns,
      dataSource: reviewPriceData,
      pagination: false,
      scroll: { x: tableScrollWidth(priceColumns) },
    };

    const allocationAmountColumns = [
      {
        dataIndex: 'supName',
        key: 'supName',
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'priceOriginak',
        key: 'priceOriginak',
        title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）'),
        width: 180,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.Selectedamount`).d('分配预算金额'),
        dataIndex: 'selectedAmount',
        width: getCurrentLanguage() === 'zh_CN' ? 150 : 120,
        render: (_, record) => {
          return (
            isCheckSend === 'Y' ?
            <div style={{textAlign: 'right'}}>
              {tooltipRender(numberRender(record.selectedAmount, 2))}
            </div>
            :
            <Form.Item>
              {record.$form.getFieldDecorator(`selectedAmount`, {
                initialValue: record.selectedAmount,
              })(
                <CusInputNumber
                  className="cus-input-money"
                  precision={2}
                  step={0.01}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              )}
            </Form.Item>
          );
        },
      },
    ];

    const allocationAmountModalProps = {
      rowKey: 'supId',
      columns: allocationAmountColumns,
      dataSource: allocationAmountDataSource,
      pagination: false,
      scroll: { x: tableScrollWidth(allocationAmountColumns) },
    }
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.Status`).d('状态')),
        dataIndex: 'statusMeaning',
        width: 160,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.StageArrangement`).d('阶段安排')),
        dataIndex: 'stageArrangementMeaning',
        width: 180,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.StageDealine`).d('本阶段截止时间')),
        dataIndex: 'deadline',
        width: 160,
      },
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.operate`).d('操作')),
        width: 120,
        render: (text, record) => {
          const operators = [];
          // 询价邀请  inquiryInvitation
          if (record.stageArrangement === 'inquiryInvitation') {
            operators.push({
              key: 'preview',
              ele: (
                <a onClick={() => this.openRequestInquiryModal(record)}>
                  {intl.get(`${promptCode}.view.button.Preview`).d('预览')}
                </a>
              ),
              title: intl.get(`${promptCode}.view.button.Preview`).d('预览'),
            });
            if (deadline && !isSendAll && isSendAllFlag === 'N') {
              operators.push({
                key: 'sendAll',
                ele: (
                  <a onClick={this.sendAllemail}>
                    {intl.get(`${promptCode}.view.button.Sendall`).d('全部发送')}
                  </a>
                ),
                title: intl.get(`${promptCode}.view.button.Sendall`).d('全部发送'),
              });
            }
            // 报价文件递交  submissionOfQuotationDocuments
          } else if (record.stageArrangement.includes('submissionOfQuotationDocuments')) {
            if (record?.status !== 'to_be_carried_out') {
              operators.push(
                {
                  key: 'enter',
                  ele: (
                    <a onClick={() => this.handleDetailsPage(record)}>
                      {intl.get(`${promptCode}.view.button.Enter`).d('进入')}
                    </a>
                  ),
                  title: intl.get(`${promptCode}.view.button.Enter`).d('进入'),
                },
              )
            }
            if (inquireBaseInfo?.status === 'PENDING_REFER' && (record?.status !== 'completed')) {
              operators.push(
                {
                  key: 'editTime',
                  ele: (
                    <a onClick={() => this.openEditTimeModal(record, 'one')}>
                      {intl.get(`${promptCode}.view.button.EditTime`).d('编辑时间')}
                    </a>
                  ),
                  title: intl.get(`${promptCode}.view.button.EditTime`).d('编辑时间'),
                }
              )
            }
            let arrangement = stageList.filter(item => item.stageArrangement.includes('submissionOfQuotationDocuments'));
            // console.log('arrangement', arrangement);
            let isDone;
            let isSummarized;
            if (arrangement && arrangement.length > 0) {
              isDone = record.rounds === arrangement[arrangement.length - 1].rounds;
              isSummarized = stageList[stageList.length - 1].status !== 'summarized';
            }
            if ((record?.status === 'completed') && isDone && isSummarized) {
              operators.push(
                {
                  key: 'addRound',
                  ele: (
                    <a onClick={() => this.openEditTimeModal(record, 'two')}>
                      {intl.get(`${promptCode}.view.button.AddRound`).d('添加下一轮')}
                    </a>
                  ),
                  title: intl.get(`${promptCode}.view.button.AddRound`).d('添加下一轮'),
                }
              )
            }
            if(record?.status === 'ongoning') {
              operators.push(
                {
                  key: 'enterQuotation',
                  ele: (
                    <a onClick={() => this.handleEnterQuotation(_, record)}>
                      {intl.get(`HKPC.commom.view.title.inputqoute`).d('录入报价')}
                    </a>
                  ),
                  title: intl.get(`HKPC.commom.view.title.inputqoute`).d('录入报价'),
                }
              )
            }
            // 价格汇总  priceSummary
          } else if (record.stageArrangement === 'priceSummary') {
            let arrangement = stageList.filter(item => item.stageArrangement.includes('submissionOfQuotationDocuments'));
            let isDone;
            if (arrangement && arrangement.length > 0) {
              isDone = arrangement[arrangement.length - 1].status;
            }
            if (isDone === 'completed' && record.status !== 'to_be_carried_out') {
              operators.push({
                key: 'priceSummary',
                ele: (
                  <a onClick={() => this.handlePriceSummaryPage(record)}>
                    {intl.get(`${promptCode}.view.button.PriceSummary`).d('价格汇总表')}
                  </a>
                ),
                title: intl.get(`${promptCode}.view.button.PriceSummary`).d('价格汇总表'),
              });
            }
          }

          return operatorRender(operators, record);
        },
      },
    ];

    const selectSupplierColumns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: 75,
        dataIndex: 'orderSeq',
        render: (val, record, index) => {
          return <span>{index + 1}</span>
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Type`).d('类型'),
        dataIndex: 'typeMeaning',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'name',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.MailAddress`).d('联系邮箱'),
        dataIndex: 'email',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Contact`).d('联系人'),
        dataIndex: 'contacts',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Telephone`).d('联系方式'),
        dataIndex: 'phone',
        width: 160,
        render: tooltipRender,
      },
    ];

    const rowSelection = {
      type: 'radio',
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    }; 

    const selectSupplierTableProps = {
      rowKey: 'rowKey',
      columns: selectSupplierColumns,
      dataSource: selectSupplierDataSource,
      rowSelection: rowSelection,
      pagination: selectSupplierPagination,
      onChange: (page) => this.handleEnterQuotation(page, lineRecord),
      scroll: { x: tableScrollWidth(selectSupplierColumns) },
    }

    return (
      <React.Fragment>
        <EditTable
          rowKey={ROW_KEY}
          dataSource={stageList}
          className={classnames(styles['edit-table-markers'])}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
        <CusModal
          visible={reviewModalVisible}
          width={800}
          title={intl.get(`${promptCode}.view.title.requestforinquiry`).d('询价邀请')}
          destroyOnClose
          footer={
            <>
              {deadline && !isSendAll && isSendAllFlag === 'N' &&
                <CusButton loading={sendLoading} onClick={this.sendAllemail} >
                  {intl.get(`${promptCode}.view.button.Sendall`).d('全部发送')}
                </CusButton>
              }
              <CusButton onClick={this.handleCloseReviewModal}>
                {intl.get(`${promptCode}.view.button.close`).d('关闭')}
              </CusButton>
            </>
          }
        >
          <RequestInquiryModal {...requestInquiryModalProps} />
        </CusModal>

        <CusModal
          visible={modalVisible}
          width={800}
          title={intl.get(`${promptCode}.view.title.QuotationSubmit`).d('报价文件递交')}
          onCancel={() => this.setState({
            modalVisible: false,
          })}
          onOk={this.submitQuotation}
          destroyOnClose
          confirmLoading={submitLoading}
        >
          <QuotationDocumentSubmitEditModal {...quotationDocumentSubmitEditProps} />
        </CusModal>
        <CusModal
          visible={priceModalVisible}
          width={800}
          title={intl.get(`${promptCode}.view.message.Selecthistoricalquote`).d('建议中选供应商')}
          footer={
            <>
              {isCheckSend === 'N' && <div>
                <CusButton
                  onClick={this.handleCancel}
                >
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </CusButton>
                <CusButton
                  type='primary'
                  onClick={() => 
                    CusModal.confirm({
                      content: intl.get('HKPC.commom.view.title.givepricetoapplicant').d('提交报价给申请部门!'),
                      okType: 'primary',
                      onOk: this.handleOk,
                    })
                  }
                >
                  {intl.get('hzero.common.cusModal.button.confirm').d('确认')}
                </CusButton>
              </div>}
              {isCheckSend === 'Y' && <CusButton
                onClick={() => {
                  this.setState({
                    priceModalVisible: false
                  })
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>}
            </>
          }
        >
          <EditTable {...priceModalProps} />
        </CusModal>
        <CusModal
          visible={allocationAmountModalVisible}
          width={800}
          title={intl.get(`${promptCode}.view.title`).d('分配供应商金额')}
          onCancel={this.handleAllocationCancel}
          onOk={this.handleSave}
          footer={
            <>
              {isCheckSend === 'N' && <div>
                <CusButton
                  onClick={this.handleAllocationCancel}
                >
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </CusButton>
                <CusButton
                  type='primary'
                  onClick={this.handleSave}
                >
                  {intl.get('hzero.common.cusModal.button.confirm').d('确认')}
                </CusButton>
              </div>}
              {isCheckSend === 'Y' && <CusButton
                onClick={() => {
                  this.setState({
                    allocationAmountModalVisible: false
                  })
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>}
            </>
          }
        >
          <EditTable {...allocationAmountModalProps} />
        </CusModal>
        <CusModal
          visible={selectSupplierVisible}
          width={1000}
          title={intl.get(`${promptCode}.view.title.ChooseSupplier`).d('选择供应商')}
          onCancel={() => {
            this.setState({
              selectSupplierVisible: false
            })
          }}
          // onOk={this.handleSave}
          footer={
            <>
              <CusButton
                onClick={() => {
                  this.setState({
                    selectSupplierVisible: false
                  })
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </CusButton>
              <CusButton
                type='primary'
                onClick={this.handleSaveSupplier}
              >
                {intl.get('hzero.common.cusModal.button.confirm').d('确认')}
              </CusButton>
            </>
          }
        >
          <CusTable {...selectSupplierTableProps} />
        </CusModal>
      </React.Fragment >
    );
  }
}
