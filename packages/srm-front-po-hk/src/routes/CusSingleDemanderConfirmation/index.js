import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse, Checkbox } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId, createPagination } from 'utils/utils';
import { Bind, Debounce } from 'lodash-decorators';
import { numberRender } from 'utils/renderer';
import { SRM_SSRC } from '_utils/config';
import querystring from 'querystring';
import { fastCodeLoader } from '@/utils/decorators';
import { Form } from 'hzero-ui';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusTabs from '_cus_components/CusTabs';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import BaseInfo from './BaseInfo2';
import InquireInfo from './InquireInfo2';
import BudgetInfo from './BudgetInfo2';
import MaterialDetailList from './materialDetailList';
// import BudgetInfoTwo from './BudgetInfoTwo'
import InquireResult from './InquireResult2';
import InquireDetail from './inquireDetail';
import styles from './index.less';
import classnames from 'classnames';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import queryString from 'querystring';
import uuid from 'uuid/v4';
import ProjectForm from '@/components/ProjectModal';
import { join, map } from 'lodash';
import { getEditTableData } from 'hzero-front/lib/utils/utils';
import ProcurementForm from './ProcurementForm';
import PriceSummaryTalbe from './PriceSummaryTalbe';
import PriceInfoList from './PriceInfoList';
import EditMatComponent from '@/components/EditMatComponent';
import PageMessage from '_cus_components/Page/PageMessage';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const { ERP_HOST } = process.env;
const currentUser = getCurrentUser();
const { Panel } = Collapse;

@fastCodeLoader(['HKPC.PURCHASINGCATEGORY', 'HKPC.BUDGETTYPE'])
@formatterCollections({
  code: [promptCode],
})
@Form.create()
@connect(({ singlePurchaseApplicationCusModel, loading }) => ({
  singlePurchaseApplicationCusModel,
  fetchLoading:
    loading.effects['singlePurchaseApplicationCusModel/demanderEditQuery'] ||
    loading.effects['singlePurchaseApplicationCusModel/demanderCreateQuery'] ||
    loading.effects['singlePurchaseApplicationCusModel/getMatSup'] ||
    loading.effects['singlePurchaseApplicationCusModel/getInquireDetail'],
}))
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);
    const {
      location: { search = '' },
    } = props;
    const { refHeadId, formRecordId, state, activityCode } = queryString.parse(search.substr(1)) || {};
    this.state = {
      activeKey: [
        'form',
        'applicationTable',
        'uploadTable',
        'materialbudgetinformationTable',
        'inquiryResultTable',
        'detail',
        'procurementForm',
        'priceSumTable',
      ],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      searchTabActiveKey: 'procurement',
      prThirdHeadId: refHeadId || formRecordId, //采购申请询价单主键Id
      state,
      activityCode,
      allOpex: false,
      basincModal: false,
      setRowsItem: [],
      clearFlag: false,
      projectEditVal: '',
      columns: [],
      selectData: {}, //选择报价勾选中的数据
      addMatModalVisible: false,
      round: '1',
    };
  }

  componentDidMount() {
    this.query();
    this.handleInquireDetail();
    this.handleQuery();
    this.listener();
  }

  // 查询项目信息数据
  @Bind()
  handleQuery() {
    const { dispatch, singlePurchaseApplicationCusModel } = this.props;
    const { prThirdHeadId } = this.state;
    // 查询报价文件详情数据
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getPriceCollect',
      payload: {
        id: prThirdHeadId,
      },
    }).then((res) => {
      if (res) {
        const priceBasicInfo = {
          ...res,
          numberRenderEstimatedHKD: numberRender(res?.estimatedHKD, 2),
          capexBudgetAmountHkd: numberRender(res?.capexBudgetAmountHkd, 2),
          opexBudgetAmountHkd: numberRender(res?.opexBudgetAmountHkd, 2),
        };
        dispatch({
          type: `singlePurchaseApplicationCusModel/updateState`,
          payload: {
            priceBasicInfo,
          },
        });
        this.setState({
          projectInfo: res,
        }, () => {
          // 报价明细
          this.handlePriceInfo();
          // 价格汇总表
          this.handlePriceSumList();
        });
      }
    });
  }

  // 查询价格汇总表数据
  @Bind()
  handlePriceSumList() {
    const { dispatch } = this.props;
    const { prThirdHeadId } = this.state;
    dispatch({
      type: `singlePurchaseApplicationCusModel/getPriceTolList`,
      payload: {
        refHeadId: prThirdHeadId,
      },
    }).then((res) => {
      if (res) {
        const newDataSource = res.map((item) => ({
          ...item,
          _status: 'update',
          materialName: item.matName,
          rowKey: uuid(),
        }));
        dispatch({
          type: `singlePurchaseApplicationCusModel/updateState`,
          payload: {
            priceSummaryList: newDataSource,
          },
        });
      }
    });
  }

  // 致远流程
  @Bind()
  listener() {
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        console.log('e.data.submitType', e.data.submitType);
        // 提交 SEND 保存 DRAFT_HANDLE 会签 GIVE  知会 NOTICE 查看流程 PROCESS_SHOW
        if (['SUBMIT', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          this.save((params) => {
            if (params) {
              console.log('params', params);
              console.log('top', top);
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId: params?.prThirdHeadId, //表单记录id（Long）
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        prNumber: params.prRequestNumber,
                        prName: params.prRequestName,
                        amount: numberRender(params.jine, 2),
                      })
                      .d(
                        `采购结果审批-关于${params.prRequestNumber}:${params.prRequestName}采购结果审批`
                      ), //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        prNumber: params.prRequestNumber,
                        prName: params.prRequestName,
                        amount: params.jine,
                      })
                      .d(
                        `采购结果审批-关于${params.prRequestNumber}:${params.prRequestName}采购结果审批`
                      ), //待办流程名称
                    //下面内容为表单数据
                    ...params,
                  },
                },
                e.data.url
              );
            }
          });
        } else if (['SEND'].includes(e.data.submitType)) {
          console.log('采购方案50-100W');
          const { dispatch } = this.props;
          this.save((params) => {
            if (params) {
              // // 首次提交的时候触发金额检验
              // const projectNumber = params.prNumber;
              // const projectType = params.projectType;
              // const newPriceList = (params.prThirdMaterialBudgs || []).map((item) => ({
              //   budType: item?.budgetType, // 预算类型
              //   budCode: item?.budgetItemNumber, // 预算项目编号
              //   amount: Number(item?.purchaseAmountHkdSummary), // 金额
              //   busActivityName: item?.businessActivities, // 业务活动名称
              // }));
              // console.log('采购方案接口50-100Wparams', params);
              // // 首次提交的时候触发金额检验
              // dispatch({
              //   type: 'singlePurchaseApplicationCusModel/getPriceValidate',
              //   payload: {
              //     applyType: projectType,
              //     projectCode: projectNumber,
              //     lines: newPriceList,
              //   },
              // }).then((res) => {
              //   if (res) {
              //     if (res.code == '204') {
              //       CusModal.warning({
              //         content:
              //           res.msg +
              //           intl
              //             .get('HKPC.commom.view.title.budgetinsufficient')
              //             .d('预算金额不足，请重新检查'),
              //       });
              //     } else {
              //       console.log('params', params);
              //       console.log('top', top);
                    top?.postMessage(
                      {
                        success: true, //表单数据验证成功或不需要验证时传true，否则传false
                        submitType: e.data.submitType, //将此字段值回传
                        messageType: 'GET_FORM_DATA', //获取表单数据消息
                        formData: {
                          formRecordId: params?.prThirdHeadId, //表单记录id（Long）
                          affairTitle: intl
                          .get('HKPC.commom.view.title.bpmPAApproval', {
                            prNumber: params.prRequestNumber,
                            prName: params.prRequestName,
                            amount: numberRender(params.jine, 2),
                          })
                          .d(
                            `采购结果审批-关于${params.prRequestNumber}:${params.prRequestName}采购结果审批`
                          ), //待办流程名称
                          subject: intl
                          .get('HKPC.commom.view.title.bpmPAApproval', {
                            prNumber: params.prRequestNumber,
                            prName: params.prRequestName,
                            amount: params.jine,
                          })
                          .d(
                            `采购结果审批-关于${params.prRequestNumber}:${params.prRequestName}采购结果审批`
                          ), //待办流程名称
                          //下面内容为表单数据
                          ...params,
                        },
                      },
                      e.data.url
                    );
              //     }
              //   }
              // });
            }
          });
        } else if(['BACK'].includes(e.data.submitType)) {
          this.save((params) => {
            if (params) {
              console.log('params', params);
              console.log('top', top);
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
                    formRecordId: params?.prThirdHeadId, //表单记录id（Long）
                    affairTitle: intl
                      .get('HKPC.commom.view.title.bpmPAReject', {
                        prNumber: params.prRequestNumber,
                        prName: params.prRequestName,
                        amount: numberRender(params.jine, 2),
                      })
                      .d(
                        `采购结果驳回-关于${params.prRequestNumber}:${params.prRequestName}采购结果驳回`
                      ), //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmPAReject', {
                        prNumber: params.prRequestNumber,
                        prName: params.prRequestName,
                        amount: params.jine,
                      })
                      .d(
                        `采购结果驳回-关于${params.prRequestNumber}:${params.prRequestName}采购结果驳回`
                      ), //待办流程名称
                    //下面内容为表单数据
                    ...params,
                  },
                },
                e.data.url
              );
            }
          });
        } else {
          top?.postMessage(
            {
              success: true, //表单数据验证成功或不需要验证时传true，否则传false
              submitType: e.data.submitType, //将此字段值回传
              messageType: 'GET_FORM_DATA', //获取表单数据消息
            },
            e.data.url
          );
        }
      }
    });
  }

  @Bind()
  handlePriceInfo(page = {}) {
    const { dispatch } = this.props;
    const { projectInfo = {}, round } = this.state;
    console.log('projectInfo', projectInfo)
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getQuotationListDetail',
      payload: {
        page,
        id: projectInfo?.id,
        // refPrFirstId: projectInfo?.prId,
        // projectNumber: projectInfo?.projectNumber,
        // currency: projectInfo?.currency,
        rounds: round,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          quotationId: uuid(),
        }));
        dispatch({
          type: 'singlePurchaseApplicationCusModel/updateState',
          payload: {
            quotationList: newDataSource,// 报价明细数据
            quotationPagination: pagination, // 报价明细分页
          }
        })
      }
    })
  }

  /**
   * @description 查询
   */
  @Bind()
  query() {
    const { dispatch } = this.props;
    const { prThirdHeadId, state } = this.state;
    dispatch({
      type: `singlePurchaseApplicationCusModel/demanderEditQuery`,
      payload: {
        prThirdHeadId: prThirdHeadId,
      },
    }).then((res) => {
      if (res) {
        this.getMaterialList(_, prThirdHeadId);
        const inquiryResultList = res?.prThirdInquirys?.map((item) => {
          return {
            ...item,
            _status: 'update',
            uuid: uuid(),
          };
        });

        const budgetInfoList = res?.prThirdMaterialBudgs?.map((item) => {
          return {
            ...item,
            _status: 'update',
            uuid: uuid(),
            budgetTypeFlag: item.budgetType,
          };
        });
        dispatch({
          type: `singlePurchaseApplicationCusModel/updateState`,
          payload: {
            budgetInfoList,
            inquiryResultList,
            projectName: res?.projectName,
            prNumber: res?.prNumber, // 项目编号
            projectType: res?.projectType, // 关联类型
            projectId: res?.projectNum,
            prName: res?.prName,
            purchasingCategories: res?.purchasingCategories,
            purchasingCategoriesCode: res?.purchasingCategories,
            refPrFirstId: res?.refPrFirstId,
          },
        });
        this.setState({
          allOpex: res.projectName ? false : true,
        });
      }
    });
  }

  // 查询报价详情
  handleInquireDetail = () => {
    const { dispatch } = this.props;
    const { prThirdHeadId } = this.state;
    dispatch({
      type: `singlePurchaseApplicationCusModel/getInquireDetail`,
      payload: {
        prThirdId: prThirdHeadId,
      },
    }).then((res) => {
      const { content = [] } = res;
      const data = content.map((item) => {
        return {
          ...item,
          _status: 'update',
          rowId: uuid(),
        };
      });
      const inquireDetailPagination = createPagination(res);
      dispatch({
        type: `singlePurchaseApplicationCusModel/updateState`,
        payload: {
          inquireDetailList: data,
          inquireDetailPagination,
        },
      });
    });
  };

  /**
   * 物料查询
   */
  @Bind()
  @Debounce(200)
  getMaterialList(page = {}, refHeadId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'singlePurchaseApplicationCusModel/getMatSup',
      payload: {
        page,
        refHeadId,
      },
    });
  }

  /**
   * @description 保存
   */
  @Bind()
  save(callback) {
    const { dispatch, singlePurchaseApplicationCusModel } = this.props;
    const { prThirdHeadId } = this.state;
    const {
      budgetInfoList,
      inquiryResultList,
      projectName,
      projectId,
      prName,
      purchasingCategories,
      priceSummaryList,
      priceBasicInfo,
    } = singlePurchaseApplicationCusModel;
    const budgetInfoData = getEditTableData(budgetInfoList);
    const priceSumList = getEditTableData(priceSummaryList, ['name', 'materialName']);
    this.baseForm.current.validateFields().then((values) => {
      setTimeout(() => {
        if (budgetInfoData.length > 0) {
          this.budgetInfoForm.validateFieldsAndScroll((err2) => {
            let budgetInfoErr = err2 || [];
            if (budgetInfoErr.length === 0) {
              dispatch({
                type: 'singlePurchaseApplicationCusModel/priceSummarySave',
                payload: priceSumList
              })
              dispatch({
                type: `singlePurchaseApplicationCusModel/demanderSave`,
                payload: {
                  prThirdMaterialBudgs: budgetInfoList,
                  prThirdInquirys: inquiryResultList,
                  purchasingCategories,
                  prThirdHeadId,
                  projectName,
                  projectNum: projectId,
                  uuid: this.baseForm.current.getFieldValue('uuid'),
                  demandDepartmentRemark: this.baseForm.current.getFieldValue('demandDepartmentRemark')
                },
              }).then((res) => {
                if (res) {
                  const params = {
                    ...res,
                    shenqingren: priceBasicInfo?.applyApplicantCode, // 申请人
                    shenqingbumen: priceBasicInfo?.applicantDeptCode, // 申请部门
                    equal: parseInt(priceBasicInfo?.applyUserId) === parseInt(priceBasicInfo?.applicantId), // 需求人是否与申请人一致
                    xuqiuren: priceBasicInfo?.needUserCode, // 需求人
                    jine: res?.totalAmount, // 金额
                    caigouyuan: priceBasicInfo?.procurementHandlerCode, // 采购经办人
                    prRequestNumber: priceBasicInfo?.prNumber, // 采购申请编号-待办标题用的
                    prRequestName: priceBasicInfo?.prName, // 采购申请名称-待办标题用的
                  }
                  if (typeof callback === 'function') {
                    callback(params);
                  }
                }
              });
            }
          });
        } else {
          CusNotification.warning({
            message: intl.get('HKPC.commom.view.message.executeprocurement').d('请完善物料信息'),
          });
        }
      }, 300);
    })
    .catch((err) => {})
  }

  /**
   * @description 获取最新变化值；
   */
  @Bind()
  getNewAllOpex(changes) {
    this.setState({ allOpex: changes });
  }

  // 项目变更管理
  @Bind()
  handleBasicInfoModal(val) {
    this.setState({
      basincModal: true,
      projectEditVal: val,
    });
  }

  @Bind
  getRowsItem(item) {
    if (item) {
      this.setState({
        setRowsItem: item,
      });
    }
  }

  @Bind
  handleOk() {
    const { dispatch, singlePurchaseApplicationCusModel } = this.props;
    const { refPrFirstId, budgetInfoList } = singlePurchaseApplicationCusModel;
    const { setRowsItem } = this.state;
    console.log('this.props', this.props);
    console.log('setRowsItem', setRowsItem);
    this.projectEditForm.validateFields((err, values) => {
      if (!err) {
        if (setRowsItem) {
          CusModal.confirm({
            content: intl.get('HKPC.commom.view.title.changproject').d('请确认是否变更项目'),
            onOk: () => {
              dispatch({
                type: 'singlePurchaseApplicationCusModel/projectEditName',
                payload: {
                  refPrFirstId: refPrFirstId, // 采购申请ID
                  projectName: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectName'), ',') : setRowsItem?.projectName, // 项目名称
                  projectNumber: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectCode'), ',') : setRowsItem?.projectCode, // 项目编码
                  projectBudType: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectBudType'), ',') : setRowsItem?.projectBudType, // 预算类型
                },
              }).then((res) => {
                if (res) {
                  dispatch({
                    type: `singlePurchaseApplicationCusModel/updateState`,
                    payload: {
                      projectName: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectName'), ',') : setRowsItem?.projectName,
                      prNumber: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectCode'), ',') : setRowsItem?.projectCode, // 项目编码
                      projectId: Array.isArray(setRowsItem) ? join(map(setRowsItem, 'projectCode'), ',') : setRowsItem?.projectCode, // 项目编码
                      budgetInfoList: (budgetInfoList || []).map((item) => ({
                        ...item,
                        taskCode: item.$form.setFieldsValue({ taskCode: null }),
                        taskName: item.$form.setFieldsValue({ taskName: null }),
                        budgetItemNumber: item.$form.setFieldsValue({ budgetItemNumber: null }),
                        businessActivitiesCode: item.$form.setFieldsValue({
                          businessActivitiesCode: null,
                        }),
                        businessActivities: item.$form.setFieldsValue({ businessActivities: null }),
                        costCenterCode: item.$form.setFieldsValue({ costCenterCode: null }),
                        costCenter: item.$form.setFieldsValue({ costCenter: null }),
                      })),
                    },
                  });
                  this.setState({
                    basincModal: false,
                    clearFlag: true,
                  });
                }
              });
            },
          });
        }
      }
    });
  }

  @Bind()
  changeCheck(record, index) {
    const { dispatch, singlePurchaseApplicationCusModel } = this.props;
    const { reviewPriceData = [] } = singlePurchaseApplicationCusModel;
    const selectDataId = record.data[index].supId;
    const selectData = [];
    const newReviewPriceData = reviewPriceData.map((item, index2) => {
      item.data.map((i) => {
        if (i.supId === selectDataId) {
          i.seleted = !i.seleted;
        }
        if (i.seleted) {
          selectData.push({ ...i, roundNum: item.roundNum });
        }
        return i;
      });
      return item;
    });
    this.setState({
      selectData,
    });
    dispatch({
      type: `singlePurchaseApplicationCusModel/updateState`,
      payload: {
        reviewPriceData: newReviewPriceData,
      },
    });
  }

  // 选择报价
  @Bind()
  handleComparePricebutton() {
    const { dispatch, singlePurchaseApplicationCusModel } = this.props;
    const { prThirdHeadId } = this.state;
    const { priceSummaryList = [], priceBasicInfo = {} } = singlePurchaseApplicationCusModel;
    const { projectNumber, currency } = priceBasicInfo;
    dispatch({
      type: `singlePurchaseApplicationCusModel/getReviewPrice`,
      payload: {
        id: prThirdHeadId,
        projectNumber,
        currency,
      },
    }).then((res) => {
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
            render: (_, record) => {
              return (
                <Checkbox
                  disabled={record?.data[index]?.priceTotal === null}
                  checked={record?.data[index]?.seleted}
                  onChange={() => this.changeCheck(record, index)}
                >
                  {record?.data[index]?.priceTotal === null
                    ? intl.get(`${promptCode}.view.title.notsubmitquotation`).d('未报价')
                    : numberRender(record?.data[index]?.priceTotal, 2)}
                </Checkbox>
              );
            },
          };
          columns.push(obj);
        });

        this.setState({
          columns,
          supplierNameList: res?.supResultVoList,
        });

        const dataSource = res?.roundVoList?.map((i) => {
          let obj = {
            roundNum: i.roundNum,
            data: [],
          };
          i.supPriceVoList.map((item, index) => {
            obj.data.push({
              priceTotal: item.priceTotal,
              seleted: false,
              supId: uuid(),
              refSupId: item.refSupId,
              supName: item.supName,
            });
          });
          return obj;
        });

        // 第二次进来应该默认勾选原有数据
        if (priceSummaryList && priceSummaryList.length > 0) {
          dataSource.map((item) => {
            return item.data.map((i) => {
              priceSummaryList.map((n, index) => {
                if (
                  item.roundNum === priceSummaryList[index].rounds &&
                  i.refSupId === priceSummaryList[index].refSupId
                ) {
                  i.seleted = true;
                }
              });
            });
          });
        }

        dispatch({
          type: `singlePurchaseApplicationCusModel/updateState`,
          payload: {
            reviewPriceData: dataSource,
          },
        });
        const selectList = dataSource.flatMap((item) =>
          item.data
          .filter((i) => i.seleted)
          .map((el) => ({
            ...el,
            roundNum: item.roundNum
          }))
        );

        this.setState({
          modalVisible: true,
          selectData: selectList,
        });
      }
    });
  }

  // 选择报价modal的取消
  @Bind
  handleCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  // 选择报价modal的确认
  @Bind
  handleSave() {
    const { dispatch } = this.props;
    const { prThirdHeadId, selectData } = this.state;
    const params = (selectData || []).map((item) => {
      return {
        supName: item.supName,
        refHeadId: prThirdHeadId,
        refSupId: parseInt(item?.refSupId),
        rounds: item?.roundNum,
        selectedAmount: item.priceTotal,
      };
    });
    dispatch({
      type: `singlePurchaseApplicationCusModel/saveSelectSupplier`,
      payload: params
    }).then((res) => {
      if(res) {
        this.setState({
          modalVisible: false,
        }, () => {
          this.handlePriceSumList();
        })
      }
    })
    // dispatch({
    //   type: `singlePurchaseApplicationCusModel/getPriceSummaryList`,
    //   payload: params || [],
    // }).then((res) => {
    //   if (res) {
    //     dispatch({
    //       type: `singlePurchaseApplicationCusModel/updateState`,
    //       payload: {
    //         priceSummaryList: (res || []).map((item) => ({
    //           ...item,
    //           rowKey: uuid(),
    //           _status: 'update',
    //         })),
    //       },
    //     });
    //     this.setState({
    //       modalVisible: false,
    //     });
    //   }
    // });
  }

  handleAddMat = () => {
    const { dispatch } = this.props;
    this.setState({
      addMatModalVisible: true
    })
    dispatch({
      type: `singlePurchaseApplicationCusModel/updateState`,
      payload: {
        editMatDataSource: [],
      },
    });
  }

  handleOkMat = () => {
    const { dispatch, singlePurchaseApplicationCusModel } = this.props;
    const { editMatDataSource } = singlePurchaseApplicationCusModel;
    const params = getEditTableData(editMatDataSource, ['poOrderId']).map((item) => ({
      ...item,
      deliverDate: dayjs(item.deliverDate).format('YYYY-MM-DD HH:mm:ss')
    }));
    if(params.length > 0) {
      dispatch({
        type: 'singlePurchaseApplicationCusModel/saveEditMat',
        payload: params
      }).then((res) => {
        if(res) {
          this.setState({
            addMatModalVisible: false
          }, () => {
            this.handleQuery();
          })
        }
      })
    }
  }

  @Bind()
  handleQueryAll() {
    this.query();
    this.handlePriceSumList();
  }

  render() {
    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      singlePurchaseApplicationCusModel,
      form,
    } = this.props;

    const { reviewPriceData = [], priceBasicInfo = {}, projectType } = singlePurchaseApplicationCusModel;

    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      searchTabActiveKey,
      state,
      activityCode,
      allOpex,
      basincModal,
      clearFlag,
      projectEditVal,
      columns,
      addMatModalVisible,
      prThirdHeadId,
    } = this.state;

    const { projectNumber } = priceBasicInfo;

    const projectNumberArray = projectNumber?.split(',') || []; 

    const baseInfoProps = {
      singlePurchaseApplicationCusModel,
      form,
      onRef: (ref) => {
        this.projectForm = ref.props.form;
      },
      allOpex,
    };
    const inquireInfoProps = {
      singlePurchaseApplicationCusModel,
      isEdit: ('DONE', 'REVOKE', 'SENT').includes(state) || (activityCode && activityCode !== 'Start'),
      onRef: (ref) => {
        this.categoryForm = ref.props.form;
      },
    };

    const inquiryResultProps = {
      singlePurchaseApplicationCusModel,
    };
    const inquiryDetailProps = {
      singlePurchaseApplicationCusModel,
    };
    const budgetInfoProps = {
      idpValueMap,
      projectNumberArray,
      singlePurchaseApplicationCusModel,
      clearFlag,
      form,
      isEdit: ('DONE', 'REVOKE', 'SENT').includes(state) || (activityCode && activityCode !== 'Start'),
      onRef: (node) => {
        this.budgetInfoForm = node.props.form;
      },
      getNewAllOpex: this.getNewAllOpex,
    };

    const projectFormProps = {
      ...this.props,
      projectEditVal,
      onRef: (node) => {
        this.projectEditForm = node.props.form;
      },
      onRowsItem: this.getRowsItem,
    };

    const ProcurementFormProps = {
      ...this.props,
      isEdit: ('DONE', 'REVOKE', 'SENT').includes(state) || (activityCode && activityCode !== 'Start'),
      onRef: (ref) => {
        this.baseForm = ref.baseForm
      }
    }

    const priceSummaryProps = {
      state,
      isEdit: ('DONE', 'REVOKE', 'SENT').includes(state) || (activityCode && activityCode !== 'Start'),
      prThirdHeadId,
      ...this.props,
      onQuery: this.handleQueryAll
    };

    const editTableProps = {
      columns,
      dataSource: reviewPriceData,
      pagination: false,
    };

    const editMatComponentProps = {
      ...this.props,
    }

    const priceInfoListProps = {
      ...this.props,
      onChange: this.handlePriceInfo,
    };

    console.info('activityCode', activityCode);

    const messageTitle = (() => {
      if (!(state === 'DONE' || state === 'REVOKE' || (activityCode && activityCode !== 'Start'))) {
        return intl.get(`${promptCode}.view.title.procurementResultDraft`).d('起草采購結果');
      } else {
        if(activityCode === 'XQR01') {
          return intl.get(`${promptCode}.view.title.procurementResultVerify`).d('核對采購結果');
        }
      }
    })();

    return (
      <>
        {!['DONE', 'REVOKE', 'SENT'].includes(state) && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45' }}
        />}
        <PageWrapper loading={fetchLoading}>
          {['0', '1'].includes(projectType) && <Collapse
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
                  title={intl.get(`${promptCode}.view.title.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                  buttons={
                    <>
                      {!allOpex && (
                        <CusButton
                          mini
                          onClick={() => {
                            this.handleBasicInfoModal('single');
                          }}
                        >
                          {intl
                            .get(`${promptCode}.view.title.projectchangemanagement`)
                            .d('项目变更管理')}
                        </CusButton>
                      )}
                    </>
                  }
                />
              }
              key="form"
            >
              <BaseInfo {...baseInfoProps} />
            </Panel>
          </Collapse>}
          <div className={styles['tab-style']} style={{marginTop: '16px'}}>
            <CusTabs
              defaultActiveKey={'scoreDetailTwo'}
              onChange={this.handleTabChange}
              items={[
                !allOpex && projectNumberArray.length < 2 && {
                  label: intl.get(`${promptCode}.view.title.CreateProject`).d('立项'),
                  key: 'scoreDetail',
                  children: (
                    <div style={{ height: '100vh' }}>
                      <iframe
                        style={{ width: '100%', height: '100%' }}
                        src={`${ERP_HOST}/root/finance/projectInformation/update?id=${priceBasicInfo?.projectId}`}
                        width="100%"
                        height="100% !important"
                        frameBorder="0"
                      />
                    </div>
                  ),
                },
                {
                  label: intl.get(`${promptCode}.view.title.Procurement`).d('采购'),
                  key: 'scoreDetailTwo',
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
                      <div
                        className={
                          searchTabActiveKey === 'procurement'
                            ? styles['tab-panel-active']
                            : styles['tab-panel-default']
                        }
                        onClick={() => {
                          this.setState({ searchTabActiveKey: 'procurement' });
                          this.query();
                        }}
                      >
                        <div className={styles['tab-panel-title']}>
                          {intl.get(`${promptCode}.view.title.procurementimplementation`).d('采购实施')}
                        </div>
                        {searchTabActiveKey === 'procurement' && <div className={styles['tab-panel-active-line']} />}
                      </div>
                    </div>

                    {searchTabActiveKey === 'purchase' ? (
                      <div style={{ height: '100vh' }}>
                        <iframe
                          style={{ width: '100%', height: '100%' }}
                          src={`/pub/ssrc-hk/purchaseApplicationErp/edit?id=${singlePurchaseApplicationCusModel?.refPrFirstId}`}
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
                          <Panel
                            key="procurementForm"
                            showArrow={false}
                            header={
                              <PanelHeader
                                arrowActive={activeKey.includes('procurementForm')}
                                title={intl.get(`${promptCode}.view.title.projectinformation`).d('项目基本信息')}
                              />
                            }
                          >
                            <ProcurementForm  {...ProcurementFormProps} />
                          </Panel>
                          <Panel
                            key="priceSumTable"
                            showArrow={false}
                            header={
                              <PanelHeader
                                arrowActive={activeKey.includes('priceSumTable')}
                                title={intl.get(`${promptCode}.view.title.Recommendedsupplierinformation`).d('中选供应商信息')}
                                buttons={
                                  <>
                                    {!(state === 'DONE' || state === 'REVOKE' || (activityCode && activityCode !== 'Start')) && <div>
                                      <CusButton
                                        mini
                                        onClick={
                                          this.handleComparePricebutton
                                        }
                                      >
                                        {intl.get(`${promptCode}.view.button.ChooseQuotation`).d('选择报价')}
                                      </CusButton>
                                      <CusButton mini onClick={this.handleAddMat}>
                                        {intl.get('HKPC.commom.view.title.additem').d('新增物料')}
                                      </CusButton>
                                    </div>}
                                  </>
                                }
                              />
                            }>
                            <PriceSummaryTalbe {...priceSummaryProps} />
                          </Panel>
                          <Panel
                            showArrow={false}
                            header={
                              <PanelHeader
                                title={intl
                                  .get(`${promptCode}.view.title.materialbudgetinformation`)
                                  .d('完善物料')}
                                arrowActive={activeKey.includes('materialbudgetinformationTable')}
                              />
                            }
                            key="materialbudgetinformationTable"
                          >
                            <BudgetInfo {...budgetInfoProps} />
                          </Panel>
                          <Panel
                            showArrow={false}
                            header={
                              <PanelHeader
                                title={intl
                                  .get(`${promptCode}.view.title.quotationdetail`)
                                  .d('报价详情')}
                                arrowActive={activeKey.includes('detail')}
                                showArrow={true}
                                buttons={
                                  <>
                                    <Form className='customize-form'>
                                      <Form.Item
                                        label={intl.get(`${promptCode}.view.title.Round`).d('轮次')}
                                      >
                                        {form.getFieldDecorator('round', {
                                          // initialValue: priceBasicInfo?.roundsList,
                                        })(
                                          <CusSelect
                                            style={{ width: '100%' }}
                                            options={priceBasicInfo?.roundsList || []}
                                            defaultValue="1"
                                            onChange={(val) => {
                                              this.setState({
                                                round: val
                                              }, () => {
                                                this.handlePriceInfo();
                                              })
                                            }}
                                          />
                                        )}
                                      </Form.Item>
                                    </Form>
                                  </>
                                }
                              />
                            }
                            key="detail"
                          >
                            <PriceInfoList {...priceInfoListProps} />
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
        </PageWrapper>
        <CusModal
          title={intl.get(`${promptCode}.view.title.projectchangemanagement`).d('项目变更管理')}
          visible={basincModal}
          destroyOnClose={true}
          width={800}
          onCancel={() => {
            this.setState({
              basincModal: false,
            });
          }}
          onOk={this.handleOk}
        >
          <ProjectForm {...projectFormProps} />
        </CusModal>
        <CusModal
          visible={modalVisible}
          width={800}
          title={intl.get(`${promptCode}.view.message.Selecthistoricalquote`).d('建议中选供应商')}
          onCancel={this.handleCancel}
          onOk={this.handleSave}
        >
          <EditTable {...editTableProps} />
        </CusModal>
        <CusModal
          title={intl.get('HKPC.commom.view.title.additem').d('新增物料')}
          visible={addMatModalVisible}
          width={1000}
          maskClosable={false}
          destroyOnClose
          onCancel={() => {
            this.setState({
              addMatModalVisible: false,
            });
          }}
          onOk={this.handleOkMat}
        >
          <EditMatComponent {...editMatComponentProps} />
        </CusModal>
        {/* <CusApprovalButtons
          children={
            <CusButton
              onClick={this.save}
            >
              {intl.get(`hzero.common.view.button`).d('提交')}
            </CusButton>
          }
        ></CusApprovalButtons> */}
      </>
    );
  }
}
