/**
 * 供应商评审 - 手工评审
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/1/4
 * @Copyright: Copyright (c), 2024, hand
 */
import React, { Component } from 'react';
import { Collapse } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { Form } from 'hzero-ui';
import CusTabs from '_cus_components/CusTabs';
import CusNotification from '_cus_components/CusNotification';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import BasicSearchForm from '@/routes/SupplierEvaluationList/components/BasicSearchForm';
import queryString from 'querystring';
import NeederForm from '@/routes/SupplierEvaluationList/components/NeederForm';
import DeliveryForm from '@/routes/SupplierEvaluationList/components/DeliveryForm';
import ProcurementForm from '@/routes/SupplierEvaluationList/components/ProcurementForm';
import { tableScrollWidth } from 'utils/utils';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ evaluation = {}, loading = {} }) => ({
  evaluation,
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser(),
  supplierData: evaluation.supplierData || [],
  purchaseOrderList: evaluation.purchaseOrderList || {},
  evaluationDetail: evaluation.evaluationDetail,
  loading: loading.effects['evaluation/getPurchaseOrderData'],
}))
export default class AddEvaluation extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'tabs', 'tab1', 'tab2', 'tab3', 'tab4'],
      tabActiveKey: '1',
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      currentNode: null, // 需求人打分：XQRDF01  需求部门经理审批：XQBMJL02  采购员打分：CGYDF03  采购主管审批：CGZGSP04
      currentState: null,
      permissionType: null,
    };
    this.platform = {};
    this.neederForm = {};
    this.purchaseForm = {};
    this.deliveryForm = {};
  }

  componentDidMount() {
    this.init();
  }

  // 初始化
  @Bind()
  init() {
    this.getSupplierDataById();
    this.getEvaluationDetail();
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 撤回 知会 会签 查看流程
        if (
          ['SUBMIT', 'DRAFT_HANDLE', 'SEND', 'AGREE'].includes(
            e.data.submitType
          )
        ) {
          this.handleSave((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  formData: {
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
              formData: {
                //下面内容为表单数据
              },
            },
            e.data.url
          );
        }
        // else {
        //   this.handleSave((params) => {
        //     if (params) {
        //       top?.postMessage({
        //         success: true, //表单数据验证成功或不需要验证时传true，否则传false
        //         submitType: e.data.submitType,//将此字段值回传
        //         messageType: 'GET_FORM_DATA', //获取表单数据消息
        //         formData: {
        //           //下面内容为表单数据
        //           ...params,
        //         },
        //       }, e.data.url);
        //     }
        //   });
        // }
      }
    });
  }

  // 手工评审采购订单信息查询
  @Bind()
  onSearch(page = {}) {
    const {
      location: { search },
      dispatch,
    } = this.props;
    const { formRecordId } = queryString.parse(
      search.substring(1)
    );
    this.platform.props.form.validateFields((error, values) => {
      if (!error) {
        let params;
        if (formRecordId && formRecordId !== 'null') {
          params = {
            prApplyType: values.prApplyType,
            revYear: values.revYear.format('YYYY'),
            revQuarter: values.revQuarter,
            prPeople: values.prPeople,
            demander: values.demander,
            needDep: values.needDep,
            supplierNumber: values.supplierNumber,
            revId: formRecordId,
            deliveryPerson: values.deliveryPerson,
          };
        } else {
          params = {
            prApplyType: values.prApplyType,
            revYear: values.revYear.format('YYYY'),
            revQuarter: values.revQuarter,
            prPeople: values.prPeople,
            demander: values.demander,
            needDep: values.needDep,
            supplierNumber: values.supplierNumber,
            deliveryPerson: values.deliveryPerson,
          };
        }
        dispatch({
          type: 'evaluation/getPurchaseOrderData',
          payload: {
            ...params,
            page,
          },
        });
      }
    });
  }

  // 查询供应商基础信息
  @Bind()
  getSupplierDataById() {
    const { location: { search }, dispatch } = this.props;
    const { supplierId } = queryString.parse(search.substring(1));
    if (supplierId) {
      dispatch({
        type: 'evaluation/getSupplierDetail',
        payload: { supplierId },
      });
    }
  }

  // 查询评审信息
  @Bind()
  getEvaluationDetail() {
    const { location: { search }, dispatch } = this.props;
    const { formRecordId, activityCode, state, permissionType } = queryString.parse(search.substring(1));
    if (formRecordId && formRecordId !== 'null') {
      dispatch({
        type: 'evaluation/queryEvaluationDetailBySupplierId',
        payload: {
          id: formRecordId,
        },
      }).then(res => {
        console.log(res, 'res');
        console.log(activityCode, 'activityCode');
        if (activityCode === 'XQRDF01' || activityCode === 'XQBMJL02') {
          this.setState({
            tabActiveKey: '2',
            currentNode: activityCode, // 审批流程当前节点
            currentState: state,
            permissionType,
          });
        } else if (activityCode === 'CGYDF03' || activityCode === 'CGZGSP04') {
          this.setState({
            tabActiveKey: '3',
            currentNode: activityCode, // 审批流程当前节点
            currentState: state,
            permissionType,
          });
        } else if(activityCode === 'SHRDF02') {
          this.setState({
            tabActiveKey: '4',
            currentNode: activityCode, // 审批流程当前节点
            currentState: state,
            permissionType,
          });
        } else {
          this.setState({
            currentNode: activityCode, // 审批流程当前节点
            currentState: state,
            permissionType,
          });
        }
      });
    }
  }

  @Bind()
  handleSave(callback) {
    const { dispatch, evaluationDetail } = this.props;
    const { currentNode } = this.state;
    let revHead = {}; // 基本信息
    let demandInfo = []; // 需求部打分项
    let demandAttach = {}; // 需求部附件
    let procureInfo = []; // 采购部打分项
    let procureAttach = {}; // 采购部附件
    let deliveryInfo = []; // 供应商交付打分项
    let deliveryAttach = {}; // 采购部附件
    let payload = {};
    this.onSearch();
    console.log('evaluationDetail', evaluationDetail);
    if(currentNode === 'XQRDF01' && evaluationDetail?.revHead?.demander === evaluationDetail?.revHead?.deliveryPerson) {
      this.neederForm.props.form.validateFields((neederFormErr, neederFormValues) => {
        this.deliveryForm?.props.form.validateFields((deliveryFormErr, deliveryFormValues) => {
          if(!neederFormErr && !deliveryFormErr) {
            if (evaluationDetail?.demand?.demandInfo?.length > 0) {
              demandInfo = evaluationDetail?.demand?.demandInfo;
              // 编辑
              if (neederFormValues.quality === undefined || neederFormValues.quality === 'N/A') {
                demandInfo = demandInfo.map((i) => {
                  if (i.revScoreItem === 'quality') {
                    return {
                      ...i,
                      isScore: 'N', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'quality',
                    };
                  } else {
                    return i;
                  }
                });
              } else {
                demandInfo = demandInfo.map((i) => {
                  if (i.revScoreItem === 'quality') {
                    return {
                      ...i,
                      isScore: 'Y', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'quality',
                      score: +neederFormValues.quality, // 转为数字
                    };
                  } else {
                    return i;
                  }
                });
              }
              if (neederFormValues.pricePerformance === undefined || neederFormValues.pricePerformance === 'N/A') {
                demandInfo = demandInfo.map((i) => {
                  if (i.revScoreItem === 'pricePerformance') {
                    return {
                      ...i,
                      isScore: 'N', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'pricePerformance',
                    };
                  } else {
                    return i;
                  }
                });
              } else {
                demandInfo = demandInfo.map((i) => {
                  if (i.revScoreItem === 'pricePerformance') {
                    return {
                      ...i,
                      isScore: 'Y', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'pricePerformance',
                      score: +neederFormValues.pricePerformance, // 转为数字
                    };
                  } else {
                    return i;
                  }
                });
              }
              if (
                neederFormValues.afterSalesServiceAndTechnicalOrRepairServiceSupport === undefined ||
                neederFormValues.afterSalesServiceAndTechnicalOrRepairServiceSupport === 'N/A'
              ) {
                demandInfo = demandInfo.map((i) => {
                  if (
                    i.revScoreItem === 'afterSalesServiceAndTechnicalOrRepairServiceSupport'
                  ) {
                    return {
                      ...i,
                      isScore: 'N', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                    };
                  } else {
                    return i;
                  }
                });
              } else {
                demandInfo = demandInfo.map((i) => {
                  if (
                    i.revScoreItem === 'afterSalesServiceAndTechnicalOrRepairServiceSupport'
                  ) {
                    return {
                      ...i,
                      isScore: 'Y', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                      score: +neederFormValues.afterSalesServiceAndTechnicalOrRepairServiceSupport, // 转为数字
                    };
                  } else {
                    return i;
                  }
                });
              }
              if (
                neederFormValues.orderAndContractFulfillment === undefined ||
                neederFormValues.orderAndContractFulfillment === 'N/A'
              ) {
                demandInfo = demandInfo.map((i) => {
                  if (
                    i.revScoreItem === 'orderAndContractFulfillment'
                  ) {
                    return {
                      ...i,
                      isScore: 'N', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'orderAndContractFulfillment',
                    };
                  } else {
                    return i;
                  }
                });
              } else {
                demandInfo = demandInfo.map((i) => {
                  if (
                    i.revScoreItem === 'orderAndContractFulfillment'
                  ) {
                    return {
                      ...i,
                      isScore: 'Y', // 是否打分
                      revDepType: 'demand',
                      revScoreItem: 'orderAndContractFulfillment',
                      score: +neederFormValues.orderAndContractFulfillment, // 转为数字
                    };
                  } else {
                    return i;
                  }
                });
              }
            } else {
              // 新增
              if (neederFormValues.quality === undefined || neederFormValues.quality === 'N/A') {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'quality',
                  },
                ];
              } else {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'quality',
                    score: +neederFormValues.quality, // 转为数字
                  },
                ];
              }
              if (neederFormValues.pricePerformance === undefined || neederFormValues.pricePerformance === 'N/A') {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'pricePerformance',
                  },
                ];
              } else {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'pricePerformance',
                    score: +neederFormValues.pricePerformance, // 转为数字
                  },
                ];
              }
              if (
                neederFormValues.afterSalesServiceAndTechnicalOrRepairServiceSupport === undefined ||
                neederFormValues.afterSalesServiceAndTechnicalOrRepairServiceSupport === 'N/A'
              ) {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                  },
                ];
              } else {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                    score: +neederFormValues.afterSalesServiceAndTechnicalOrRepairServiceSupport, // 转为数字
                  },
                ];
              }
              if (
                neederFormValues.orderAndContractFulfillment === undefined ||
                neederFormValues.orderAndContractFulfillment === 'N/A'
              ) {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'orderAndContractFulfillment',
                  },
                ];
              } else {
                demandInfo = [
                  ...demandInfo,
                  {
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'orderAndContractFulfillment',
                    score: +neederFormValues.orderAndContractFulfillment, // 转为数字
                  },
                ];
              }
            }
            if (evaluationDetail?.delivery?.deliveryInfo?.length > 0) {
              deliveryInfo = evaluationDetail?.delivery?.deliveryInfo;
              // 编辑
              if (deliveryFormValues.deliveryPerformance === undefined || deliveryFormValues.deliveryPerformance === 'N/A') {
                deliveryInfo = deliveryInfo.map((i) => {
                  if (i.revScoreItem === 'deliveryPerformance') {
                    return {
                      ...i,
                      isScore: 'N', // 是否打分
                      revDepType: 'delivery',
                      revScoreItem: 'deliveryPerformance',
                    };
                  } else {
                    return i;
                  }
                });
              } else {
                deliveryInfo = deliveryInfo.map((i) => {
                  if (i.revScoreItem === 'deliveryPerformance') {
                    return {
                      ...i,
                      isScore: 'Y', // 是否打分
                      revDepType: 'delivery',
                      revScoreItem: 'deliveryPerformance',
                      score: +deliveryFormValues.deliveryPerformance, // 转为数字
                    };
                  } else {
                    return i;
                  }
                });
              }
            } else {
              // 新增
              if (deliveryFormValues.deliveryPerformance === undefined || deliveryFormValues.deliveryPerformance === 'N/A') {
                deliveryInfo = [
                  ...deliveryInfo,
                  {
                    isScore: 'N', // 是否打分
                    revDepType: 'delivery',
                    revScoreItem: 'deliveryPerformance',
                  },
                ];
              } else {
                deliveryInfo = [
                  ...deliveryInfo,
                  {
                    isScore: 'Y', // 是否打分
                    revDepType: 'delivery',
                    revScoreItem: 'deliveryPerformance',
                    score: +deliveryFormValues.deliveryPerformance, // 转为数字
                  },
                ];
              }
            }

            revHead = {
              ...evaluationDetail.revHead,
              requireDepSug: neederFormValues.requireDepSug,
              deliveryDepSug: deliveryFormValues.deliveryDepSug,
            };
            demandAttach = {
              attachmentUuid: neederFormValues.attachmentUuid,
              revDepType: 'demand',
            };
            deliveryAttach = {
              attachmentUuid: deliveryFormValues.attachmentUuid,
              revDepType: 'delivery',
            };
            payload = {
              revHead,
              delivery: {
                deliveryInfo,
                deliveryAttach,
              },
              demand: {
                demandInfo,
                demandAttach,
              },
            };
            console.log('仓储部payload', payload);
            dispatch({
              type: 'evaluation/evaluationSave',
              payload,
            }).then((res) => {
              if (typeof callback === 'function') {
                callback({
                  ...res,
                  formRecordId: res?.revHead?.id,
                  affairTitle:
                    intl.get(`${prompt}.todotask.supplie.review`).d('供应商评审：') +
                    res?.revHead?.companyNameCh,
                  xuqiuren: res?.revHead?.demander,
                  caigouyuan: res?.revHead?.prPeople,
                  Recipient: res?.revHead?.deliveryPerson,
                  isEqual: res?.revHead?.demander === res?.revHead?.deliveryPerson ? 'Y' : 'N', // 判断需求人和送货人是否相等
                });
              }
            });
          } else {
            if(neederFormErr) {
              this.setState({
                tabActiveKey: '2',
              })
            } else if(deliveryFormErr) {
              this.setState({
                tabActiveKey: '4',
              })
            }
          }
        })
      });
    } else {
    // 需求打分审批 XQRDF01
    if (currentNode === 'XQRDF01') {
      this.neederForm.props.form.validateFields((err, values) => {
        if (!err) {
          if (evaluationDetail?.demand?.demandInfo?.length > 0) {
            demandInfo = evaluationDetail?.demand?.demandInfo;
            // 编辑
            if (values.quality === undefined || values.quality === 'N/A') {
              demandInfo = demandInfo.map((i) => {
                if (i.revScoreItem === 'quality') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'quality',
                  };
                } else {
                  return i;
                }
              });
            } else {
              demandInfo = demandInfo.map((i) => {
                if (i.revScoreItem === 'quality') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'quality',
                    score: +values.quality, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
            if (values.pricePerformance === undefined || values.pricePerformance === 'N/A') {
              demandInfo = demandInfo.map((i) => {
                if (i.revScoreItem === 'pricePerformance') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'pricePerformance',
                  };
                } else {
                  return i;
                }
              });
            } else {
              demandInfo = demandInfo.map((i) => {
                if (i.revScoreItem === 'pricePerformance') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'pricePerformance',
                    score: +values.pricePerformance, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
            if (
              values.afterSalesServiceAndTechnicalOrRepairServiceSupport === undefined ||
              values.afterSalesServiceAndTechnicalOrRepairServiceSupport === 'N/A'
            ) {
              demandInfo = demandInfo.map((i) => {
                if (
                  i.revScoreItem === 'afterSalesServiceAndTechnicalOrRepairServiceSupport'
                ) {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                  };
                } else {
                  return i;
                }
              });
            } else {
              demandInfo = demandInfo.map((i) => {
                if (
                  i.revScoreItem === 'afterSalesServiceAndTechnicalOrRepairServiceSupport'
                ) {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                    score: +values.afterSalesServiceAndTechnicalOrRepairServiceSupport, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
            if (
              values.orderAndContractFulfillment === undefined ||
              values.orderAndContractFulfillment === 'N/A'
            ) {
              demandInfo = demandInfo.map((i) => {
                if (
                  i.revScoreItem === 'orderAndContractFulfillment'
                ) {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'orderAndContractFulfillment',
                  };
                } else {
                  return i;
                }
              });
            } else {
              demandInfo = demandInfo.map((i) => {
                if (
                  i.revScoreItem === 'orderAndContractFulfillment'
                ) {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'demand',
                    revScoreItem: 'orderAndContractFulfillment',
                    score: +values.orderAndContractFulfillment, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
          } else {
            // 新增
            if (values.quality === undefined || values.quality === 'N/A') {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'quality',
                },
              ];
            } else {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'quality',
                  score: +values.quality, // 转为数字
                },
              ];
            }
            if (values.pricePerformance === undefined || values.pricePerformance === 'N/A') {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'pricePerformance',
                },
              ];
            } else {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'pricePerformance',
                  score: +values.pricePerformance, // 转为数字
                },
              ];
            }
            if (
              values.afterSalesServiceAndTechnicalOrRepairServiceSupport === undefined ||
              values.afterSalesServiceAndTechnicalOrRepairServiceSupport === 'N/A'
            ) {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                },
              ];
            } else {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'afterSalesServiceAndTechnicalOrRepairServiceSupport',
                  score: +values.afterSalesServiceAndTechnicalOrRepairServiceSupport, // 转为数字
                },
              ];
            }
            if (
              values.orderAndContractFulfillment === undefined ||
              values.orderAndContractFulfillment === 'N/A'
            ) {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'orderAndContractFulfillment',
                },
              ];
            } else {
              demandInfo = [
                ...demandInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'demand',
                  revScoreItem: 'orderAndContractFulfillment',
                  score: +values.orderAndContractFulfillment, // 转为数字
                },
              ];
            }
          }
          revHead = {
            ...evaluationDetail.revHead,
            requireDepSug: values.requireDepSug,
          };
          demandAttach = {
            attachmentUuid: values.attachmentUuid,
            revDepType: 'demand',
          };
          // // （实际打分/实际有效总分）
          // // 实际打分
          // let trueScore = 0;
          // // 实际有效总分
          // let trueTotalScore = 0;
          // demandInfo.map((item) => {
          //   if (item.isScore === 'Y') {
          //     trueScore += item.score;
          //     trueTotalScore += 5;
          //   }
          // });
          // this.neederForm.props.form.setFieldsValue({
          //   requireTotalScore: trueScore + '/' + trueTotalScore,
          // });
          payload = {
            revHead,
            demand: {
              demandInfo,
              demandAttach,
            },
          };
          console.log('需求payload', payload);
          dispatch({
            type: 'evaluation/evaluationSave',
            payload,
          }).then((res) => {
            if (typeof callback === 'function') {
              callback({
                ...res,
                formRecordId: res?.revHead?.id,
                affairTitle:
                  intl.get(`${prompt}.todotask.supplie.review`).d('供应商评审：') +
                  res?.revHead?.companyNameCh,
                xuqiuren: res?.revHead?.demander,
                caigouyuan: res?.revHead?.prPeople,
                Recipient: res?.revHead?.deliveryPerson,
                isEqual: res?.revHead?.demander === res?.revHead?.deliveryPerson ? 'Y' : 'N', // 判断需求人和送货人是否相等
              });
            }
          });
        }
      });
    }
    // 采购打分审批
    else if (currentNode === 'CGYDF03') {
      this.purchaseForm.props.form.validateFields((err, values) => {
        if (!err) {
          if (evaluationDetail?.procure?.procureInfo?.length > 0) {
            procureInfo = evaluationDetail?.procure?.procureInfo;
            // 编辑
            if (values.preSalesServices === undefined || values.preSalesServices === 'N/A') {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'preSalesServices') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'preSalesServices',
                  };
                } else {
                  return i;
                }
              });
            } else {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'preSalesServices') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'preSalesServices',
                    score: +values.preSalesServices, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
            if (
              values.poPricePerformance === undefined ||
              values.poPricePerformance === 'N/A'
            ) {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'poPricePerformance') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'poPricePerformance',
                  };
                } else {
                  return i;
                }
              });
            } else {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'poPricePerformance') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'poPricePerformance',
                    score: +values.poPricePerformance, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
            if (values.poPaymentTerms === undefined || values.poPaymentTerms === 'N/A') {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'poPaymentTerms') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'poPaymentTerms',
                  };
                } else {
                  return i;
                }
              });
            } else {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'poPaymentTerms') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'poPaymentTerms',
                    score: +values.poPaymentTerms, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
            if (
              values.contractGovernance === undefined ||
              values.contractGovernance === 'N/A'
            ) {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'contractGovernance') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'contractGovernance',
                  };
                } else {
                  return i;
                }
              });
            } else {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'contractGovernance') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'contractGovernance',
                    score: +values.contractGovernance, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
            if (
              values.businessReputationAndPartnership === undefined ||
              values.businessReputationAndPartnership === 'N/A'
            ) {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'businessReputationAndPartnership') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'businessReputationAndPartnership',
                  };
                } else {
                  return i;
                }
              });
            } else {
              procureInfo = procureInfo.map((i) => {
                if (i.revScoreItem === 'businessReputationAndPartnership') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'procure',
                    revScoreItem: 'businessReputationAndPartnership',
                    score: +values.businessReputationAndPartnership, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
          } else {
            // 新增
            if (values.preSalesServices === undefined || values.preSalesServices === 'N/A') {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'preSalesServices',
                },
              ];
            } else {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'preSalesServices',
                  score: +values.preSalesServices, // 转为数字
                },
              ];
            }
            if (
              values.poPricePerformance === undefined ||
              values.poPricePerformance === 'N/A'
            ) {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'poPricePerformance',
                },
              ];
            } else {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'poPricePerformance',
                  score: +values.poPricePerformance, // 转为数字
                },
              ];
            }
            if (values.poPaymentTerms === undefined || values.poPaymentTerms === 'N/A') {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'poPaymentTerms',
                },
              ];
            } else {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'poPaymentTerms',
                  score: +values.poPaymentTerms, // 转为数字
                },
              ];
            }
            if (
              values.contractGovernance === undefined ||
              values.contractGovernance === 'N/A'
            ) {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'contractGovernance',
                },
              ];
            } else {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'contractGovernance',
                  score: +values.contractGovernance, // 转为数字
                },
              ];
            }
            if (
              values.businessReputationAndPartnership === undefined ||
              values.businessReputationAndPartnership === 'N/A'
            ) {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'businessReputationAndPartnership',
                },
              ];
            } else {
              procureInfo = [
                ...procureInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'procure',
                  revScoreItem: 'businessReputationAndPartnership',
                  score: +values.businessReputationAndPartnership, // 转为数字
                },
              ];
            }
          }
          revHead = {
            ...evaluationDetail.revHead,
            prDepSug: values.prDepSug,
          };
          procureAttach = {
            attachmentUuid: values.attachmentUuid,
            revDepType: 'procure',
          };
          // // （实际打分/实际有效总分）
          // // 实际打分
          // let trueScore = 0;
          // // 实际有效总分
          // let trueTotalScore = 0;
          // procureInfo.map((item) => {
          //   if (item.isScore === 'Y') {
          //     trueScore += item.score;
          //     trueTotalScore += 5;
          //   }
          // });
          // this.purchaseForm.props.form.setFieldsValue({
          //   totalScore: trueScore + '/' + trueTotalScore,
          // });
          payload = {
            revHead,
            demand: evaluationDetail?.demand,
            procure: {
              procureInfo,
              procureAttach,
            },
          };
          console.log('采购payload', payload);
          dispatch({
            type: 'evaluation/evaluationSave',
            payload,
          }).then((res) => {
            if (typeof callback === 'function') {
              callback({
                ...res,
                formRecordId: res?.revHead?.id,
                affairTitle:
                  intl.get(`${prompt}.todotask.supplie.review`).d('供应商评审：') +
                  res?.revHead?.companyNameCh,
                xuqiuren: res?.revHead?.demander,
                caigouyuan: res?.revHead?.prPeople,
                Recipient: res?.revHead?.deliveryPerson,
                isEqual: res?.revHead?.demander === res?.revHead?.deliveryPerson ? 'Y' : 'N', // 判断需求人和送货人是否相等
              });
            }
          });
        }
      });
    }
    // 仓储部打分审批
    else if(currentNode === 'SHRDF02') {
      this.deliveryForm.props.form.validateFields((err, values) => {
        if (!err) {
          if (evaluationDetail?.delivery?.deliveryInfo?.length > 0) {
            deliveryInfo = evaluationDetail?.delivery?.deliveryInfo;
            // 编辑
            if (values.deliveryPerformance === undefined || values.deliveryPerformance === 'N/A') {
              deliveryInfo = deliveryInfo.map((i) => {
                if (i.revScoreItem === 'deliveryPerformance') {
                  return {
                    ...i,
                    isScore: 'N', // 是否打分
                    revDepType: 'delivery',
                    revScoreItem: 'deliveryPerformance',
                  };
                } else {
                  return i;
                }
              });
            } else {
              deliveryInfo = deliveryInfo.map((i) => {
                if (i.revScoreItem === 'deliveryPerformance') {
                  return {
                    ...i,
                    isScore: 'Y', // 是否打分
                    revDepType: 'delivery',
                    revScoreItem: 'deliveryPerformance',
                    score: +values.deliveryPerformance, // 转为数字
                  };
                } else {
                  return i;
                }
              });
            }
          } else {
            // 新增
            if (values.deliveryPerformance === undefined || values.deliveryPerformance === 'N/A') {
              deliveryInfo = [
                ...deliveryInfo,
                {
                  isScore: 'N', // 是否打分
                  revDepType: 'delivery',
                  revScoreItem: 'deliveryPerformance',
                },
              ];
            } else {
              deliveryInfo = [
                ...deliveryInfo,
                {
                  isScore: 'Y', // 是否打分
                  revDepType: 'delivery',
                  revScoreItem: 'deliveryPerformance',
                  score: +values.deliveryPerformance, // 转为数字
                },
              ];
            }
          }
          revHead = {
            ...evaluationDetail.revHead,
            deliveryDepSug: values.deliveryDepSug,
          };
          deliveryAttach = {
            attachmentUuid: values.attachmentUuid,
            revDepType: 'delivery',
          };
          payload = {
            revHead,
            delivery: {
              deliveryInfo,
              deliveryAttach,
            },
          };
          console.log('仓储部payload', payload);
          dispatch({
            type: 'evaluation/evaluationSave',
            payload,
          }).then((res) => {
            if (typeof callback === 'function') {
              callback({
                ...res,
                formRecordId: res?.revHead?.id,
                affairTitle:
                  intl.get(`${prompt}.todotask.supplie.review`).d('供应商评审：') +
                  res?.revHead?.companyNameCh,
                xuqiuren: res?.revHead?.demander,
                caigouyuan: res?.revHead?.prPeople,
                Recipient: res?.revHead?.deliveryPerson,
                isEqual: res?.revHead?.demander === res?.revHead?.deliveryPerson ? 'Y' : 'N', // 判断需求人和送货人是否相等
              });
            }
          });
        }
      });
    }
    else if (['XQBMJL02', 'CGZGSP04'].includes(currentNode)) {
      payload = {
        ...evaluationDetail,
      };
      dispatch({
        type: 'evaluation/evaluationSave',
        payload,
      }).then((res) => {
        if (typeof callback === 'function') {
          callback({
            ...res,
            formRecordId: res?.revHead?.id,
            affairTitle:
              intl.get(`${prompt}.todotask.supplie.review`).d('供应商评审：') +
              res?.revHead?.companyNameCh,
            xuqiuren: res?.revHead?.demander,
            caigouyuan: res?.revHead?.prPeople,
            Recipient: res?.revHead?.deliveryPerson,
            isEqual: res?.revHead?.demander === res?.revHead?.deliveryPerson ? 'Y' : 'N', // 判断需求人和送货人是否相等
          });
        }
      });
    } else {
      this.platform.props.form.validateFields((err, values) => {
        if (!err) {
          revHead = {
            prPeople: values.prPeople,
            supplierNumber: values.supplierNumber,
            companyNameEn: values.companyNameEn,
            companyNameCh: values.companyNameCh,
            revType: values.revType,
            revQuarter: values.revQuarter,
            revYear: values.revYear.format('YYYY'),
            startTime: values.startTime && values.startTime.format('YYYY-MM-DD 00:00:00'),
            endTime: values.endTime && values.endTime.format('YYYY-MM-DD 00:00:00'),
            demander: values.demander,
            needDep: values.needDep,
            deliveryPerson: values.deliveryPerson,
          };
          if (evaluationDetail?.revHead?.id) {
            revHead = {
              ...revHead,
              id: evaluationDetail.revHead.id,
            };
          }
          payload = {
            revHead,
          };
          const {
            evaluation: { purchaseOrderList },
          } = this.props;
          const { content = [] } = purchaseOrderList;
          if (content?.length === 0 && values.revType === 'ManualAssessment') {
            CusNotification.warning({
              message: intl
                .get(`${prompt}.form.validateFields.assesspo`)
                .d('该PO已被评审，请刷新页面重新查询！'),
            });
          }
          // else {
            dispatch({
              type: 'evaluation/evaluationSave',
              payload,
            }).then((res) => {
              if (res.type === 'error') {
                CusNotification.error({ message: res.message });
              } else {
                if (typeof callback === 'function') {
                  callback({
                    ...res,
                    formRecordId: res?.revHead?.id,
                    affairTitle:
                      intl.get(`${prompt}.todotask.supplie.review`).d('供应商评审：') +
                      res?.revHead?.companyNameCh,
                    xuqiuren: res?.revHead?.demander,
                    caigouyuan: res?.revHead?.prPeople,
                    Recipient: res?.revHead?.deliveryPerson,
                    isEqual: res?.revHead?.demander === res?.revHead?.deliveryPerson ? 'Y' : 'N', // 判断需求人和送货人是否相等
                  });
                }
              }
            });
          // }
        }
      });
    }
  }
}

  handleOpenErpPage = (record) => {
    const { ERP_HOST } = process.env;
    const url = `${ERP_HOST}/root/po/purchaseOrder/purchaseOrderManagement/update?id=${record.orderId}&open=fs`;
    window.open(url, '_blank');
  }

  renderPOColumns() {
    return [
      {
        title: intl.get(`${prompt}.view.table.info.PONo`).d('订单编号'),
        dataIndex: 'orderNumber',
        render: (val, record) => {
          return <a onClick={() => {this.handleOpenErpPage(record)}}>
            {record.orderNumber }
          </a>
        },
      },
      {
        title: intl.get(`${prompt}.view.table.orderTheme`).d('订单主题'),
        dataIndex: 'orderSub',
      },
      {
        title: intl.get(`${prompt}.view.table.orderGetDate`).d('完全收货日期'),
        dataIndex: 'receiptDate',
      },
      {
        title: intl.get(`${prompt}.view.table.purchaseAmount`).d('采购金额'),
        dataIndex: 'prAmount',
        render: (val, record) => {
          return numberRender(record.prAmount);
        },
      },
    ];
  }

  renderDemanderReview() {
    const { form: { getFieldDecorator }, tenantId, evaluationDetail } = this.props;
    const { currentNode, currentState } = this.state;
    const questionOneOptions = [
      {
        label: intl.get(`${prompt}.list.Assess.answerOne`).d('超出期望(5)'),
        value: '5',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerTwo`).d('优于期望(4)'),
        value: '4',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerThree`).d('达到期望(3)'),
        value: '3',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerFour`).d('稍低于期望(2)'),
        value: '2',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerFive`).d('未达到期望(1)'),
        value: '1',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerSix`).d('不能接受(0)'),
        value: '0',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerSeven`).d('N/A'),
        value: 'N/A',
      },
    ];
    const neederFormProps = {
      onRef: ref => this.neederForm = ref,
      questionOneOptions,
      tenantId,
      evaluationDetail,
      disabled: currentNode !== 'XQRDF01' || currentState === 'DONE',
    };
    return (
      <NeederForm {...neederFormProps} />
    );
  }

  // 仓储部评估打分明细
  renderDeliveryReview(initialValues) {
    const { form: { getFieldDecorator }, tenantId, evaluationDetail } = this.props;
    const { currentNode, currentState } = this.state;
    const questionOneOptions = [
      {
        label: intl.get(`${prompt}.list.Assess.answerOne`).d('超出期望(5)'),
        value: '5',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerTwo`).d('优于期望(4)'),
        value: '4',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerThree`).d('达到期望(3)'),
        value: '3',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerFour`).d('稍低于期望(2)'),
        value: '2',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerFive`).d('未达到期望(1)'),
        value: '1',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerSix`).d('不能接受(0)'),
        value: '0',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerSeven`).d('N/A'),
        value: 'N/A',
      },
    ];
    const deliveryFormProps = {
      onRef: ref => this.deliveryForm = ref,
      questionOneOptions,
      tenantId,
      evaluationDetail,
      disabled: !( (currentNode === 'XQRDF01' && initialValues?.deliveryPerson === initialValues?.demander) || (currentNode === 'SHRDF02' && initialValues?.deliveryPerson !== initialValues?.demander) ) || currentState === 'DONE',
    };
    return (
      <DeliveryForm {...deliveryFormProps} />
    );
  }

  renderProcurementReview() {
    const { form: { getFieldDecorator }, tenantId, evaluationDetail } = this.props;
    const { currentNode, currentState } = this.state;
    const questionOneOptions = [
      {
        label: intl.get(`${prompt}.list.Assess.answerOne`).d('超出期望(5)'),
        value: '5',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerTwo`).d('优于期望(4)'),
        value: '4',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerThree`).d('达到期望(3)'),
        value: '3',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerFour`).d('稍低于期望(2)'),
        value: '2',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerFive`).d('未达到期望(1)'),
        value: '1',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerSix`).d('不能接受(0)'),
        value: '0',
      },
      {
        label: intl.get(`${prompt}.list.Assess.answerSeven`).d('N/A'),
        value: 'N/A',
      },
    ];
    const procurementFormProps = {
      onRef: ref => this.purchaseForm = ref,
      questionOneOptions,
      tenantId,
      evaluationDetail,
      disabled: currentNode !== 'CGYDF03' || currentState === 'DONE',
    };
    return (
      <ProcurementForm {...procurementFormProps} />
    );
  }

  render() {
    const {
      activeKey,
      tabActiveKey,
      currentNode,
      currentState,
      permissionType,
    } = this.state;
    const {
      tenantId,
      currentUser,
      supplierData,
      purchaseOrderList,
      evaluation: { purchaseOrderListPagination },
      evaluationDetail,
    } = this.props;
    const initialValues = evaluationDetail?.revHead ? {
      ...supplierData?.head,
      ...supplierData?.line,
      ...evaluationDetail?.revHead,
    } : {
      ...supplierData?.head,
      ...supplierData?.line,
    };
    const tabItems = [
      {
        key: '1',
        label: intl.get(`${prompt}.view.title.POInformation`).d('采购订单信息'),
        children: (
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            style={{ border: 'none' }}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              data-border={false}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.POInformation`).d('采购订单信息')}
                  arrowActive={activeKey.includes('tab1')}
                />
              }
              key='tab1'
            >
              <CusTable
                bordered
                columns={this.renderPOColumns()}
                dataSource={purchaseOrderList?.content || []}
                pagination={purchaseOrderListPagination}
                scroll={{ x: tableScrollWidth(this.renderPOColumns()) }}
                onChange={this.onSearch}
                rowKey='id'
              />
            </Panel>
          </Collapse>
        ),
      },
      {
        key: '2',
        label: intl.get(`${prompt}.view.title.demanderReview`).d('需求部评审'),
        children: (
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            style={{ border: 'none' }}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              data-border={false}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.demanderReview`).d('需求部评审')}
                  arrowActive={activeKey.includes('tab2')}
                />
              }
              key='tab2'
            >
              {this.renderDemanderReview()}
            </Panel>
          </Collapse>
        ),
      },
      {
        key: '4',
        label: intl.get(`${prompt}.field.recipient.review`).d('收货人评估'),
        forceRender: true,
        children: (
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            style={{ border: 'none' }}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              data-border={false}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.field.recipient.review`).d('收货人评估')}
                  arrowActive={activeKey.includes('tab4')}
                />
              }
              key='tab4'
            >
              {this.renderDeliveryReview(initialValues)}
            </Panel>
          </Collapse>
        ),
      },
      {
        key: '3',
        label: intl.get(`${prompt}.view.title.ProcurementReview`).d('采购部评审'),
        children: (
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            style={{ border: 'none' }}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              data-border={false}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.ProcurementReview`).d('采购部评审')}
                  arrowActive={activeKey.includes('tab3')}
                />
              }
              key='tab3'
            >
              {this.renderProcurementReview()}
            </Panel>
          </Collapse>
        ),
      },
    ].filter(Boolean);

    const basicSearchFormProps = {
      tenantId,
      currentUser,
      onSearch: this.onSearch,
      onRef: ref => this.platform = ref,
      initialValues,
      disabled: ['XQRDF01', 'XQBMJL02', 'CGYDF03', 'CGZGSP04', 'SHRDF02', 'Start'].includes(currentNode) && currentState !== 'READY' && !(currentState === 'PENDING' && permissionType === 'SEND'),
    };

    return (
      <PageWrapper>
        <Collapse
          className='customize-collapse'
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
          style={{ marginBottom: '16px',paddingTop: '0px'}}
        >
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                arrowActive={activeKey.includes('basic')}
              />
            }
            key='basic'
          >
            <BasicSearchForm {...basicSearchFormProps} />
          </Panel>
          {/*<Panel*/}
          {/*  collapsible='disabled'*/}
          {/*  showArrow={false}*/}
          {/*  header={*/}
          {/*    <PanelHeader*/}
          {/*      showArrow={false}*/}
          {/*      title={intl.get(`${prompt}.view.title.POInformation`).d('采购订单信息')}*/}
          {/*      arrowActive={activeKey.includes('tabs')}*/}
          {/*    />*/}
          {/*  }*/}
          {/*  key='tabs'*/}
          {/*>*/}

          {/*</Panel>*/}
        </Collapse>
        <CusTabs
          isNumber
          activeKey={tabActiveKey}
          items={tabItems}
          moreIcon={false}
          onChange={(key) => {
            this.setState({ tabActiveKey: key });
          }}
        />
        {/* <CusButton type='primary' onClick={this.handleSave}>TEST</CusButton> */}
      </PageWrapper>
    );
  }
}
