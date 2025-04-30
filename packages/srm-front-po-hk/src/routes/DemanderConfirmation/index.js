import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse, Row } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, createPagination, getEditTableData } from 'utils/utils';
import { Bind } from 'lodash-decorators';
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
import CusSearchTabs from '_cus_components/CusSearchTabs';
import BaseInfo from './BaseInfo';
import InquireInfo from './InquireInfo';
import BudgetInfo from './BudgetInfo';
// import BudgetInfoTwo from './BudgetInfoTwo'
import InquireResult from './InquireResult';
import InquireDetail from './InquireDetail';
import styles from './index.less';
import classnames from 'classnames';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import queryString from 'querystring';
import uuid from 'uuid/v4';
import ProjectForm from '@/components/ProjectModal';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;

@fastCodeLoader(['HKPC.PURCHASINGCATEGORY'])
@formatterCollections({
  code: [promptCode],
})
@Form.create()
@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
  fetchLoading:
    loading.effects['purchaseApplicationModel/demanderEditQuery'] ||
    loading.effects['purchaseApplicationModel/demanderCreateQuery'] ||
    loading.effects['purchaseApplicationModel/getInquireDetail'],
  submitLoading:
    loading.effects['resaleRfq/submitSummary'] ||
    loading.effects['resaleRfq/ictsSubmitSummary'] ||
    loading.effects['resaleRfq/submitValidateSummary'] ||
    loading.effects['resaleRfq/ictsSubmitValidateSummary'] ||
    loading.effects['resaleRfq/submitEnquiryPriceSummary'] ||
    loading.effects['resaleRfq/submitValidateCommonSummary'],
  publishLoading:
    loading.effects['resaleRfq/publishSummary'] ||
    loading.effects['resaleRfq/ictsPublishSummary'] ||
    loading.effects['resaleRfq/publishEnquiryPriceSummary'] ||
    loading.effects['resaleRfq/submitValidateCommonSummary'],
  deleteLoading: loading.effects['resaleRfq/deleteEnquiryPriceByList'],
  queryRfqResponseLoading: loading.effects['resaleRfq/queryRfqResponse'],
  exportLoading: loading.effects['resaleRfq/enquiryExport'],
}))
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);
    const {
      location: { search = '' },
    } = props;
    const { formRecordId, state, activityCode } = queryString.parse(search.substr(1)) || {};
    this.state = {
      activeKey: [
        'form',
        'applicationTable',
        'uploadTable',
        'materialbudgetinformationTable',
        'inquiryResultTable',
        'detail',
      ],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      SearchTabActiveKey: '0',
      prThirdHeadId: formRecordId, //采购申请询价单主键Id
      state,
      activityCode,
      allOpex: false,
      basincModal: false,
      setRowsItem: '',
      clearFlag: false,
      projectEditVal: '',
    };
  }

  componentDidMount() {
    this.query();
    this.handleInquireDetail();
    this.listener();
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
        if (['SEND', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
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
                      .get('HKPC.commom.view.title.bpmPCExcuteapproval', {
                        prname: params.prNumber + ':' + params.prName,
                      })
                      .d(
                        `采购申请执行审批-关于${params.prNumber}:${params.prName}采购申请执行审批`
                      ), //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmPCExcuteapproval', {
                        prname: params.prNumber + ':' + params.prName,
                      })
                      .d(
                        `采购申请执行审批-关于${params.prNumber}:${params.prName}采购申请执行审批`
                      ), //待办流程名称
                    //下面内容为表单数据
                    ...params,
                  },
                },
                e.data.url
              );
            }
          });
        } else if (['SUBMIT'].includes(e.data.submitType)) {
          const { dispatch } = this.props;
          console.log('采购方案接口50W');
          this.save((params) => {
            if (params) {
              // 首次提交的时候触发金额检验
              const projectNumber = params.prNumber;
              const projectType = params.projectType;
              const newPriceList = (params.prThirdMaterialBudgs || []).map((item) => ({
                budType: item?.budgetType, // 预算类型
                budCode: item?.budgetItemNumber, // 预算项目编号
                amount: Number(item?.purchaseAmountHkdSummary), // 金额
                busActivityName: item?.businessActivities, // 业务活动名称
              }));
              console.log('采购方案接口50Wparams', params);
              // 首次提交的时候触发金额检验
              dispatch({
                type: 'purchaseApplicationModel/getPriceValidate',
                payload: {
                  applyType: projectType,
                  projectCode: projectNumber,
                  lines: newPriceList,
                },
              }).then((res) => {
                if (res) {
                  if (res.code == '204') {
                    CusModal.warning({
                      content:
                        res.msg +
                        intl
                          .get('HKPC.commom.view.title.budgetinsufficient')
                          .d('预算金额不足，请重新检查'),
                    });
                  } else {
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
                            .get('HKPC.commom.view.title.bpmPCExcuteapproval', {
                              prname: params.prNumber + ':' + params.prName,
                            })
                            .d(
                              `采购申请执行审批-关于${params.prNumber}:${params.prName}采购申请执行审批`
                            ), //待办流程名称
                          subject: intl
                            .get('HKPC.commom.view.title.bpmPCExcuteapproval', {
                              prname: params.prNumber + ':' + params.prName,
                            })
                            .d(
                              `采购申请执行审批-关于${params.prNumber}:${params.prName}采购申请执行审批`
                            ), //待办流程名称
                          //下面内容为表单数据
                          ...params,
                        },
                      },
                      e.data.url
                    );
                  }
                }
              });
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

  /**
   * @description 查询
   */
  @Bind()
  query() {
    const { dispatch } = this.props;
    const { prThirdHeadId, state } = this.state;
    // 从已办进入
    if (state === 'DONE' || state === 'REVOKE') {
      dispatch({
        type: `purchaseApplicationModel/demanderEditQuery`,
        payload: {
          prThirdHeadId: prThirdHeadId,
        },
      }).then((res) => {
        if (res) {
          const budgetInfoList = res?.prThirdMaterialBudgs?.map((item) => {
            return {
              ...item,
              _status: 'update',
              uuid: uuid(),
              budgetTypeFlag: item.budgetType,
            };
          });
          const inquiryResultList = res?.prThirdInquirys?.map((item) => {
            return {
              ...item,
              _status: 'update',
              uuid: uuid(),
            };
          });
          dispatch({
            type: `purchaseApplicationModel/updateState`,
            payload: {
              budgetInfoList,
              inquiryResultList,
              projectName: res?.projectName,
              projectNumber: res.projectName
                ? res?.projectNumber || res?.projectNum
                : res?.projectNum,
              prNumber: res?.prNumber, // 项目编号
              projectType: res?.projectType, // 关联类型
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
    } else {
      // 从待办进入,但是有可能是下一节点退回生成的待办;
      // 先调一下编辑进入的接口,看下有没有数据;
      dispatch({
        type: `purchaseApplicationModel/demanderEditQuery`,
        payload: {
          prThirdHeadId: prThirdHeadId,
        },
      }).then((res) => {
        if (res) {
          // 如果有值,说明该单子是退回的.
          if (res.isNewOrUpdate === 'UPDATE') {
            const budgetInfoList = res?.prThirdMaterialBudgs?.map((item) => {
              return {
                ...item,
                _status: 'update',
                uuid: uuid(),
                budgetTypeFlag: item.budgetType,
              };
            });
            const inquiryResultList = res?.prThirdInquirys?.map((item) => {
              return {
                ...item,
                _status: 'update',
                uuid: uuid(),
              };
            });
            dispatch({
              type: `purchaseApplicationModel/updateState`,
              payload: {
                budgetInfoList,
                inquiryResultList,
                projectName: res?.projectName,
                prNumber: res?.prNumber, // 项目编号
                projectType: res?.projectType, // 关联类型
                projectNum: res.projectName
                  ? res?.projectNumber || res?.projectNum
                  : res?.projectNum,
                projectNumber: res.projectName
                  ? res?.projectNumber || res?.projectNum
                  : res?.projectNum,
                prName: res?.prName,
                purchasingCategories: res?.purchasingCategories,
                purchasingCategoriesCode: res?.purchasingCategories,
                refPrFirstId: res?.refPrFirstId,
              },
            });
            this.setState({
              allOpex: res.projectName ? false : true,
            });
          } else {
            dispatch({
              type: `purchaseApplicationModel/demanderCreateQuery`,
              payload: {
                refHeadId: prThirdHeadId,
              },
            }).then((res) => {
              if (res) {
                const budgetInfoList = res?.prThirdSettingList?.map((item) => {
                  return {
                    ...item,
                    _status: 'update',
                    headId: prThirdHeadId,
                    uuid: uuid(),
                    budgetTypeFlag: item.budgetType,
                  };
                });
                const inquiryResultList = res?.prThirdQuoteTotalList?.map((item) => {
                  return {
                    ...item,
                    _status: 'update',
                    uuid: uuid(),
                  };
                });
                dispatch({
                  type: `purchaseApplicationModel/updateState`,
                  payload: {
                    budgetInfoList,
                    inquiryResultList,
                    projectName: res?.projectName,
                    prNumber: res?.prNumber, // 项目编号
                    projectType: res?.projectType, // 关联类型
                    projectNumber: res?.projectNumber || res?.projectNum,
                    prName: res?.prName,
                    refPrFirstId: res?.refPrFirstId,
                  },
                });
                this.setState({
                  allOpex: res.projectName ? false : true,
                });
              }
              // console.log('res', res);
            });
          }
        }
      });
    }
  }

  // 查询报价详情
  handleInquireDetail = () => {
    const { dispatch } = this.props;
    const { prThirdHeadId } = this.state;
    dispatch({
      type: `purchaseApplicationModel/getInquireDetail`,
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
        type: `purchaseApplicationModel/updateState`,
        payload: {
          inquireDetailList: data,
          inquireDetailPagination,
        },
      });
    });
  };

  /**
   * @description 保存
   */
  @Bind()
  save(callback) {
    const { dispatch, purchaseApplicationModel } = this.props;
    // const { purchasingCategories } = this.categoryForm.getFieldsValue();
    const { prThirdHeadId } = this.state;
    const {
      budgetInfoList,
      inquiryResultList,
      projectName,
      projectNumber,
      prName,
      purchasingCategories,
    } = purchaseApplicationModel;
    const budgetInfoData = getEditTableData(budgetInfoList);
    // this.categoryForm.validateFields(async (err) => {
    setTimeout(() => {
      if (budgetInfoData.length > 0) {
        this.budgetInfoForm.validateFieldsAndScroll(async (err2) => {
          // let categoryErr = err || [];
          let budgetInfoErr = err2 || [];
          if (budgetInfoErr.length === 0) {
            dispatch({
              type: `purchaseApplicationModel/demanderSave`,
              payload: {
                prThirdMaterialBudgs: budgetInfoList,
                prThirdInquirys: inquiryResultList,
                purchasingCategories,
                prThirdHeadId,
                projectName,
                projectNum: projectNumber,
                projectNumber,
              },
            }).then((res) => {
              if (res) {
                if (typeof callback === 'function') {
                  callback(res);
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

    // });
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    const { dispatch } = this.props;
    const deleteFlag = data.every((item) => item.enquiryPriceStatus === 'NEW');
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('${promptCode}.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'resaleRfq/deleteEnquiryPriceByList',
            payload: data,
          }).then((res) => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl.get(`${promptCode}.tips.onlyDeleteNEW`).d('只能删除状态为“起草”的询价单'),
      });
    }
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
    const { dispatch, purchaseApplicationModel } = this.props;
    const { refPrFirstId, budgetInfoList } = purchaseApplicationModel;
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
                type: 'purchaseApplicationModel/projectEditName',
                payload: {
                  refPrFirstId: refPrFirstId, // 采购申请ID
                  projectName: setRowsItem?.projectName, // 项目名称
                  projectNumber: setRowsItem?.projectCode, // 项目编码
                  projectBudType: setRowsItem?.projectBudType, // 预算类型
                },
              }).then((res) => {
                if (res) {
                  dispatch({
                    type: `purchaseApplicationModel/updateState`,
                    payload: {
                      projectName: setRowsItem?.projectName,
                      prNumber: setRowsItem?.projectCode, // 项目编码
                      projectNumber: setRowsItem?.projectCode, // 项目编码
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

  render() {
    // const form = {}
    // const listProps = {
    //   form,
    //   enumMap,
    //   dispatch,
    //   pcHeaderId,
    //   addLoading,
    //   collectionSource,
    //   collectionPagination,
    //   contractConfiguration,
    //   loading: queryListLoading,
    //   onSearch: this.fetchList,
    // };

    const {
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      purchaseApplicationModel,
      form,
    } = this.props;

    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      SearchTabActiveKey,
      state,
      activityCode,
      allOpex,
      basincModal,
      clearFlag,
      projectEditVal,
    } = this.state;

    const baseInfoProps = {
      purchaseApplicationModel,
      form,
      onRef: (ref) => {
        this.projectForm = ref.props.form;
      },
      allOpex,
    };
    const inquireInfoProps = {
      purchaseApplicationModel,
      isEdit: state === 'DONE' || state === 'REVOKE' || activityCode !== 'SQR01' ? true : false,
      onRef: (ref) => {
        this.categoryForm = ref.props.form;
      },
    };
    const inquiryResultProps = {
      purchaseApplicationModel,
    };
    const inquiryDetailProps = {
      purchaseApplicationModel,
    };
    const budgetInfoProps = {
      idpValueMap,
      purchaseApplicationModel,
      clearFlag,
      form,
      isEdit: state === 'DONE' || state === 'REVOKE' || activityCode !== 'SQR01' ? true : false,
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

    return (
      <>
        <PageWrapper loading={fetchLoading}>
          <Collapse
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
                            this.handleBasicInfoModal('demand');
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
          </Collapse>
          <div className={classnames(styles['out-div-tab'])}>
            <CusTabs
              defaultActiveKey={'scoreDetailTwo'}
              onChange={this.handleTabChange}
              items={[
                !allOpex && {
                  label: intl.get(`${promptCode}.view.title.CreateProject`).d('立项'),
                  key: 'scoreDetail',
                  children: <></>,
                },
                {
                  label: intl.get(`${promptCode}.view.title.Procurement`).d('采购'),
                  key: 'scoreDetailTwo',
                  children: <></>,
                },
              ]}
            />
          </div>
          <div className={styles['out-div-search']}>
            <CusSearchTabs
              style={{
                backgroundColor: '#fff',
                padding: '16px 16px 0 16px',
              }}
              defaultActiveKey="0"
              activeKey={SearchTabActiveKey}
              items={[
                {
                  label: intl.get(`${promptCode}.view.title.ProcurementRequisition`).d('采购申请'),
                  key: '1',
                  children: (
                    <div style={{ height: '100vh' }}>
                      <iframe
                        style={{ width: '100%', height: '100%' }}
                        src={`/pub/ssrc-hk/purchaseApplicationErp/edit?id=${purchaseApplicationModel?.refPrFirstId}`}
                        width="100%"
                        height="100% !important"
                        frameBorder="0"
                      />
                    </div>
                  ),
                },
                {
                  label: intl
                    .get(`${promptCode}.view.title.procurementimplementation`)
                    .d('采购实施'),
                  key: '0',
                  children: (
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
                  title={intl.get(`${promptCode}.view.title.InformationofInquiry`).d('询价信息')}
                  arrowActive={activeKey.includes('applicationTable')}
                />
              }
              key="applicationTable"
            >
              <InquireInfo {...inquireInfoProps} />
            </Panel> */}
                        <Panel
                          showArrow={false}
                          header={
                            <PanelHeader
                              title={intl
                                .get(`${promptCode}.view.title.materialbudgetinformation`)
                                .d('完善物料')}
                              arrowActive={activeKey.includes('materialbudgetinformationTable')}
                              // showArrow={false}
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
                                .get(`${promptCode}.view.title.inquiryresult`)
                                .d('询价结果')}
                              arrowActive={activeKey.includes('inquiryResultTable')}
                              showArrow={true}
                            />
                          }
                          key="inquiryResultTable"
                        >
                          <InquireResult {...inquiryResultProps} />
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
                            />
                          }
                          key="detail"
                        >
                          <InquireDetail {...inquiryDetailProps} />
                        </Panel>
                      </Collapse>
                    </>
                  ),
                },
              ]}
              onChange={(val) => this.setState({ SearchTabActiveKey: val })}
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
        {/* <CusApprovalButtons
          children={
            <CusButton onClick={this.save}>
              {intl.get(`hzero.common.view.button`).d('提交')}
            </CusButton>
          }
        ></CusApprovalButtons> */}
      </>
    );
  }
}
