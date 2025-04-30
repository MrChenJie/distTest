import React from 'react';
import { connect } from 'dva';
import { Collapse, Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';
import { includes, maxBy } from 'lodash';
import { numberRender } from 'utils/renderer';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusTabs from '_cus_components/CusTabs';
import CusSearchTabs from '_cus_components/CusSearchTabs';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import BaseInfo from './BaseInfo';
import FileList from './FileList';
import BudgetInfo from './BudgetInfo';
// import BudgetInfoTwo from './BudgetInfoTwo'
import PurchaseAskInfo from './PurchaseAskInfo';
import styles from './index.less';
import classnames from 'classnames';
import queryString from 'querystring';
import PriceInfoList from '../CusSingleDemanderConfirmation/PriceInfoList';
import PriceSummaryTalbe from '../CusSingleDemanderConfirmation/PriceSummaryTalbe';
import ProcurementForm from '../CusSingleDemanderConfirmation/ProcurementForm';
import PageMessage from '_cus_components/Page/PageMessage';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;
const { activityCode, state } = queryString.parse(location?.search?.substr(1)) || {}; 

@Form.create()

@fastCodeLoader(['HKPC.PURCHASINGCATEGORY'])
@formatterCollections({ code: [promptCode] })
@connect(({ singlePurchaseApplicationModel, singlePurchaseApplicationCusModel, loading }) => ({
  singlePurchaseApplicationModel,
  singlePurchaseApplicationCusModel,
  fetchLoading: loading.effects['singlePurchaseApplicationModel/handlePurchaseLineInfo'],
}))
export default class purchaseInquiryQuery extends React.Component {
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);
    const {
      location: { search = '' },
    } = props;
    const { formRecordId } = queryString.parse(search.substr(1)) || {};
    this.state = {
      activeKey: ['form', 'procurementForm', 'uploadTable', 'budgetInfoTable', 'purchaseRowTable', 'detail', 'priceSumTable'],
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      prThirdHeadId: formRecordId, //采购申请询价单主键Id
      round: null,
      searchTabActiveKey: 'procurement',
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.handleQuery();
    this.handlePriceSumList();
    this.listener();
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
          rowKey: uuidv4(),
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
        // 退回流程
        if (['BACK'].includes(e.data.submitType)) {
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
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: numberRender(params.totalAmount, 2),
                      })
                      .d(
                        `采购结果驳回-关于${params.prNumber}:${params.prName}采购结果驳回`
                      ), //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmPAReject', {
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: numberRender(params.totalAmount, 2),
                      })
                      .d(
                        `采购结果驳回-关于${params.prNumber}:${params.prName}采购结果驳回`
                      ), //待办流程名称
                    //下面内容为表单数据
                    ...params,
                  },
                },
                e.data.url
              );
            }
          });
          return;
        }
        // 提交 SUBMIT 保存 DRAFT_HANDLE 会签 GIVE  知会 NOTICE 查看流程 PROCESS_SHOW
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
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: numberRender(params.totalAmount, 2),
                      })
                      .d(
                        `采购结果审批-关于${params.prNumber}:${params.prName}采购结果审批`
                      ), //待办流程名称
                    subject: intl
                      .get('HKPC.commom.view.title.bpmPAApproval', {
                        prNumber: params.prNumber,
                        prName: params.prName,
                        amount: numberRender(params.totalAmount, 2),
                      })
                      .d(
                        `采购结果审批-关于${params.prNumber}:${params.prName}采购结果审批`
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

  // 查询项目信息数据
  @Bind()
  handleQuery() {
    const { dispatch } = this.props;
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
        });
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
        refPrFirstId: projectInfo?.prId,
        projectNumber: projectInfo?.projectNumber,
        currency: projectInfo?.currency,
        rounds: round || maxBy(projectInfo?.roundsList, 'value')?.value,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          quotationId: uuidv4(),
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

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    const { prThirdHeadId } = this.state;
    console.log('prThirdHeadId', prThirdHeadId);
    dispatch({
      type: 'singlePurchaseApplicationModel/handlePurchaseLineInfo',
      payload: {
        page,
        prThirdHeadId,
      },
    }).then((res) => {
      // 预算编号
      let budgetNumberCapex = '';
      let budgetNumberOpex = '';
      let budgetNumberMix = '';
      let budgetNumberINVENTORY = '';
      // 项目名称
      let entryNameCapex = '';
      let entryNameOpex = '';
      let entryNameMix = '';
      let entryNameINVENTORY = '';
      // 预算项目编号
      let budgetItemNumberCapex = '';
      let budgetItemNumberOpex = '';
      let budgetItemNumberMix = '';
      let budgetItemNumberINVENTORY = '';
      // 成本中心
      let costCenterCapex = '';
      let costCenterOpex = '';
      let costCenterMix = '';
      let costCenterINVENTORY = '';
      // 业务活动
      let businessActivitiesCapex = '';
      let businessActivitiesOpex = '';
      let businessActivitiesMix = '';
      let businessActivitiesINVENTORY = '';
      // 采购申请金额(原币)
      let purchaseAmountCapex = 0;
      let purchaseAmountOpex = 0;
      let purchaseAmountMix = 0;
      let purchaseAmountINVENTORY = 0;
      // 采购申请金额(HKD)
      let purchaseAmountHkdCapex = 0;
      let purchaseAmountHkdOpex = 0;
      let purchaseAmountHkdMix = 0;
      let purchaseAmountHkdINVENTORY = 0;
      // 预算信息
      let arr = [];
      const pagination = createPagination(res.purchaseLineInfo);
      const list = res.purchaseLineInfo.content.map((item) => {
        // 拆分获取预算信息table
        if (item.budgetType === 'CAPEX') {
          if (budgetNumberCapex) {
            budgetNumberCapex += `${
              item?.budgetNumber && item?.budgetNumber !== '/' ? `/${item?.budgetNumber}` : ''
            }`;
          } else {
            budgetNumberCapex += `${item?.budgetNumber}`;
          }
          if (entryNameCapex) {
            entryNameCapex += `${
              item?.entryName && item?.entryName !== '/' ? `/${item?.entryName}` : ''
            }`;
          } else {
            entryNameCapex += `${item?.entryName}`;
          }
          budgetItemNumberCapex +=
            budgetItemNumberCapex === ''
              ? `${item?.budgetItemNumber}`
              : `${
                  item?.budgetItemNumber && item?.budgetItemNumber !== '/'
                    ? `/${item?.budgetItemNumber}`
                    : ''
                }`;
          costCenterCapex +=
            costCenterCapex === ''
              ? `${item?.costCenter}`
              : `${item?.costCenter && item?.costCenter !== '/' ? `/${item?.costCenter}` : ''}`;
          businessActivitiesCapex +=
            businessActivitiesCapex === ''
              ? `${item?.businessActivities}`
              : `${
                  item?.businessActivities && item?.businessActivities !== '/'
                    ? `/${item?.businessActivities}`
                    : ''
                }`;
          purchaseAmountHkdCapex += item?.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          // 原币 = 港币 / 汇率
          const ipurchaseAmountHkd = item.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          const iexchangeRate = item.exchangeRate ? parseFloat(item.exchangeRate) : 0;
          purchaseAmountCapex += ipurchaseAmountHkd / iexchangeRate;
        } else if (item.budgetType === 'OPEX') {
          if (budgetNumberOpex) {
            budgetNumberOpex += `${
              item?.budgetNumber && item?.budgetNumber !== '/' ? `/${item?.budgetNumber}` : ''
            }`;
          } else {
            budgetNumberOpex += `${item?.budgetNumber}`;
          }
          if (entryNameOpex) {
            entryNameOpex += `${
              item?.entryName && item?.entryName !== '/' ? `/${item?.entryName}` : ''
            }`;
          } else {
            entryNameOpex += `${item?.entryName}`;
          }
          budgetItemNumberOpex +=
            budgetItemNumberOpex === ''
              ? `${item?.budgetItemNumber}`
              : `${
                  item?.budgetItemNumber && item?.budgetItemNumber !== '/'
                    ? `/${item?.budgetItemNumber}`
                    : ''
                }`;
          costCenterOpex +=
            costCenterOpex === ''
              ? `${item?.costCenter}`
              : `${item?.costCenter && item?.costCenter !== '/' ? `/${item?.costCenter}` : ''}`;
          businessActivitiesOpex +=
            businessActivitiesOpex === ''
              ? `${item?.businessActivities}`
              : `${
                  item?.businessActivities && item?.businessActivities !== '/'
                    ? `/${item?.businessActivities}`
                    : ''
                }`;
          purchaseAmountHkdOpex += item?.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          const ipurchaseAmountHkd = item.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          const iexchangeRate = item.exchangeRate ? parseFloat(item.exchangeRate) : 0;
          // 原币 = 港币 / 汇率
          purchaseAmountOpex += ipurchaseAmountHkd / iexchangeRate;
        } else if (item.budgetType === 'MIX') {
          if (budgetNumberMix) {
            budgetNumberMix += `${
              item?.budgetNumber && item?.budgetNumber !== '/' ? `/${item?.budgetNumber}` : ''
            }`;
          } else {
            budgetNumberMix += `${item?.budgetNumber}`;
          }
          if (entryNameMix) {
            entryNameMix += `${
              item?.entryName && item?.entryName !== '/' ? `/${item?.entryName}` : ''
            }`;
          } else {
            entryNameMix += `${item?.entryName}`;
          }
          budgetItemNumberMix +=
            budgetItemNumberMix === ''
              ? `${item?.budgetItemNumber}`
              : `${
                  item?.budgetItemNumber && item?.budgetItemNumber !== '/'
                    ? `/${item?.budgetItemNumber}`
                    : ''
                }`;
          costCenterMix +=
            costCenterMix === ''
              ? `${item?.costCenter}`
              : `${item?.costCenter && item?.costCenter !== '/' ? `/${item?.costCenter}` : ''}`;
          businessActivitiesMix +=
            businessActivitiesMix === ''
              ? `${item?.businessActivities}`
              : `${
                  item?.businessActivities && item?.businessActivities !== '/'
                    ? `/${item?.businessActivities}`
                    : ''
                }`;
          purchaseAmountHkdMix += item?.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          const ipurchaseAmountHkd = item.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          const iexchangeRate = item.exchangeRate ? parseFloat(item.exchangeRate) : 0;
          // 原币 = 港币 / 汇率
          purchaseAmountMix += ipurchaseAmountHkd / iexchangeRate;
        } else if(item.budgetType === 'INVENTORY') {
          if (budgetNumberINVENTORY) {
            budgetNumberINVENTORY += `${item?.budgetNumber && item?.budgetNumber !== '/' ? `/${item?.budgetNumber}` : ''}`;
          } else {
            budgetNumberINVENTORY += `${item?.budgetNumber}`;
          }
          if (entryNameINVENTORY) {
            entryNameINVENTORY += `${item?.entryName && item?.entryName !== '/' ? `/${item?.entryName}` : ''}`;
          } else {
            entryNameINVENTORY += `${item?.entryName}`;

          }
          budgetItemNumberINVENTORY += budgetItemNumberINVENTORY === '' ? `${item?.budgetItemNumber}` : `${item?.budgetItemNumber && item?.budgetItemNumber !== '/' ? `/${item?.budgetItemNumber}` : ''}`;
          costCenterINVENTORY += costCenterINVENTORY === '' ? `${item?.costCenter}` : `${item?.costCenter && item?.costCenter !== '/' ? `/${item?.costCenter}` : ''}`;
          businessActivitiesINVENTORY += businessActivitiesINVENTORY === '' ? `${item?.businessActivities}` : `${item?.businessActivities && item?.businessActivities !== '/' ? `/${item?.businessActivities}` : ''}`;
          purchaseAmountHkdINVENTORY += item?.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          // 原币 = 港币 / 汇率
          const ipurchaseAmountHkd = item.purchaseAmountHkd ? parseInt(item.purchaseAmountHkd) : 0;
          const iexchangeRate = item.exchangeRate ? parseFloat(item.exchangeRate) : 0;
          purchaseAmountINVENTORY += ipurchaseAmountHkd / iexchangeRate;
        }
        return {
          ...item,
          _status: 'update',
          rowId: uuidv4(),
        };
      });
      if (Array.isArray(list) && list.length > 0) {
        const typeArr = list.map((item) => {
          return item.budgetType;
        });
        if (includes(typeArr, 'CAPEX')) {
          arr.push({
            rowId: uuidv4(),
            budgetType: 'CAPEX',
            budgetNumber: budgetNumberCapex,
            entryName: entryNameCapex,
            budgetItemNumber: budgetItemNumberCapex,
            costCenter: costCenterCapex,
            businessActivities: businessActivitiesCapex,
            purchaseAmount: purchaseAmountCapex,
            purchaseAmountHkd: purchaseAmountHkdCapex,
          });
        }
        if (includes(typeArr, 'OPEX')) {
          arr.push({
            rowId: uuidv4(),
            budgetType: 'OPEX',
            budgetNumber: budgetNumberOpex,
            entryName: entryNameOpex,
            budgetItemNumber: budgetItemNumberOpex,
            costCenter: costCenterOpex,
            businessActivities: businessActivitiesOpex,
            purchaseAmount: purchaseAmountOpex,
            purchaseAmountHkd: purchaseAmountHkdOpex,
          });
        }
        if (includes(typeArr, 'MIX')) {
          arr.push({
            rowId: uuidv4(),
            budgetType: 'MIX',
            budgetNumber: budgetNumberMix,
            entryName: entryNameMix,
            budgetItemNumber: budgetItemNumberMix,
            costCenter: costCenterMix,
            businessActivities: businessActivitiesMix,
            purchaseAmount: purchaseAmountMix,
            purchaseAmountHkd: purchaseAmountHkdMix,
          });
        }
        if (includes(typeArr, 'INVENTORY')) {
          arr.push(
            {
              rowId: uuidv4(),
              budgetType: 'INVENTORY',
              budgetNumber: budgetNumberINVENTORY,
              entryName: entryNameINVENTORY,
              budgetItemNumber: budgetItemNumberINVENTORY,
              costCenter: costCenterINVENTORY,
              businessActivities: businessActivitiesINVENTORY,
              purchaseAmount: purchaseAmountINVENTORY,
              purchaseAmountHkd: purchaseAmountHkdINVENTORY,
            }
          )
        }
      }
      dispatch({
        type: 'singlePurchaseApplicationModel/updateState',
        payload: {
          purchaseApproveForm: res,
          purchaseApproveList: arr,
          purchaseApproveLineList: list,
          purchaseApproveLinePagination: pagination,
          prName: res?.prName,
          prNumber: res?.prNumber,
          totalAmount: res?.totalAmount,
          uuid: res?.uuid,
        },
      });
    });
  };

  /**
   * @description 提交
   */
  @Bind()
  save(callback) {
    const { singlePurchaseApplicationModel } = this.props;
    const { prName, prNumber, totalAmount } = singlePurchaseApplicationModel;
    const { prThirdHeadId } = this.state;
    callback({ prThirdHeadId, prName, prNumber, totalAmount });
  }

  render() {
    const { idpValueMap = {}, fetchLoading = false, singlePurchaseApplicationModel, form } = this.props;
    const { activeKey, searchTabActiveKey, projectInfo } = this.state;
    const { purchaseApproveForm, uuid } = singlePurchaseApplicationModel;
    
    const baseInfoProps = {
      singlePurchaseApplicationModel,
      idpValueMap,
      onRef: (ref) => {
        this.baseInfoForm = ref.baseInfoForm;
      },
    };

    const fileListProps = {
      ...this.props,
      bucketName: 'pr-apply',
      attachmentUUID: uuid,
      tenantId: getCurrentOrganizationId(),
    };

    const budgetInfoProps = {
      singlePurchaseApplicationModel,
    };

    const purchaseAskInfoProps = {
      singlePurchaseApplicationModel,
      onSearch: this.handleSearch,
    };

    const priceInfoListProps = {
      ...this.props,
      onChange: this.handlePriceInfo,
    };

    const priceSummaryProps = {
      ...this.props,
      isEdit: true,
      isFinancialApproval: false,
    }

    const ProcurementFormProps = {
      ...this.props,
      isEdit: true,
      onRef: (ref) => {
        this.baseForm = ref.baseForm
      }
    }
    
    console.info('activityCode', activityCode, state);

    const messageTitle = (() => {
      if(activityCode === 'CWJLSP02') {
        return intl.get('HKPC.commom.view.title.budgetVerify').d('核對項目預算');
      }
      if(['XURJLSP03', 'XQRZG02', 'CBZXSP03'].includes(activityCode)) {
        return intl.get('HKPC.commom.view.title.procurementResultApproval').d('審批采購結果');
      }
    })();

    return (
      <>
        {!['DONE', 'SENT'].includes(state) && <PageMessage
          message={messageTitle}
          style={{ color: '#F54A45' }}
        />}
        <PageWrapper loading={fetchLoading}>
          {purchaseApproveForm?.prApplyBudgetType !== 'INVENTORY' && <Collapse
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
              <BaseInfo {...baseInfoProps} />
            </Panel>
          </Collapse>}
          <div className={styles['tab-style']} style={{marginTop: '16px'}}>
            <CusTabs
              defaultActiveKey={'scoreDetailTwo'}
              onChange={this.handleTabChange}
              items={[
                purchaseApproveForm?.projectName && {
                  label: intl.get(`HKPC.commom.view.title.CreateProject`).d('立项'),
                  key: 'scoreDetail',
                  children: (
                    <CusSearchTabs
                      style={{
                        backgroundColor: '#fff',
                        padding: '16px 16px 0 16px',
                      }}
                      activeKey="0"
                      items={[
                        {
                          label: intl.get(`HKPC.commom.bid.title.projectinfo`).d('项目信息'),
                          key: '0',
                          children: (
                            <div className={styles['iframe-style']}>
                              <iframe
                                style={{ width: '100%', height: '100%' }}
                                src={`${process.env.ERP_HOST}/root/finance/projectInformation/update?id=${purchaseApproveForm.projectId}`}
                                width="100%"
                                // height="100vh !important"
                                frameBorder="0"
                              />
                            </div>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  label: intl.get(`HKPC.commom.view.title.Procurement`).d('采购'),
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
                          src={`/pub/ssrc-hk/purchaseApplicationErp/edit?id=${projectInfo?.prId}`}
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
                            showArrow={false}
                            header={
                              <PanelHeader
                                title={intl.get(`${promptCode}.view.title.projectinformation`).d('项目基本信息')}
                                arrowActive={activeKey.includes('procurementForm')}
                              />
                            }
                            key="procurementForm"
                          >
                            {/* <div className="customize-form">
                              <Row>
                                <Col span={24}>
                                  <Form.Item
                                    label={intl.get(`${promptCode}.view.title.applicantremarksportal`).d('需求部门备注')}
                                  >
                                    <CusInput.TextArea
                                      style={{height: 'auto'}}
                                      value={purchaseApproveForm?.demandDepartmentRemark}
                                      disabled
                                      rows={3}
                                      maxLength={500}
                                      showCharacter
                                    />
                                  </Form.Item>
                                </Col>
                              </Row>
                            </div>
                            <div style={{marginTop: '16px'}}>
                              <FileList {...fileListProps} />
                            </div> */}
                            <ProcurementForm {...ProcurementFormProps} />
                          </Panel>
                          <Panel
                            showArrow={false}
                            header={
                              <PanelHeader
                                title={intl
                                  .get(`HKPC.commom.view.title.budgetlinformation`)
                                  .d('预算信息')}
                                arrowActive={activeKey.includes('budgetInfoTable')}
                                // showArrow={false}
                              />
                            }
                            key="budgetInfoTable"
                          >
                            <BudgetInfo {...budgetInfoProps} />
                          </Panel>
                          <Panel
                            showArrow={false}
                            header={
                              <PanelHeader
                                title={intl
                                  .get(`HKPC.commom.view.title.Recommendedsupplierinformation`)
                                  .d('中选供应商信息')}
                                arrowActive={activeKey.includes('priceSumTable')}
                                // showArrow={false}
                              />
                            }
                            key="priceSumTable"
                          >
                            <PriceSummaryTalbe {...priceSummaryProps} />
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
                                          initialValue: maxBy(projectInfo?.roundsList, 'value')?.value
                                        })(
                                          <CusSelect
                                            style={{ width: '100%' }}
                                            options={projectInfo?.roundsList || []}
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
                          <Panel
                            showArrow={false}
                            header={
                              <PanelHeader
                                title={intl
                                  .get(
                                    `HKPC.commom.view.title.ProcurementRequisitionLineInformation`
                                  )
                                  .d('采购申请行信息')}
                                arrowActive={activeKey.includes('purchaseRowTable')}
                                showArrow={true}
                              />
                            }
                            key="purchaseRowTable"
                          >
                            <PurchaseAskInfo {...purchaseAskInfoProps} />
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
          {/* <div className={styles['out-div-search']}></div> */}
        </PageWrapper>
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
