/**
 * @Description: 核价
 * @date 2022-04-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import dayjs from 'dayjs';
import request from 'utils/request';
import { SRM_BID } from '@/common/config';
import { Bind, Debounce } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { Collapse, Row, Col } from 'antd';
import PanelHeader from '_cus_components/CusCollapse';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import PageWrapper from '_cus_components/Page/PageWrapper';
import classnames from 'classnames';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import uuidv4 from 'uuid/v4';
import { getDateTimeFormat, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import CusExcelExport from '_cus_components/CusExcelExport';
import ProjectQaInfo from '../CusProjectQa/projectQaInfo';
import BiddingRound from '../CusProjectQa/biddingRound';
import PricingSingleTable from './pricingSingle';
import PricingAllTable from './pricingAll';
import QuotationTermsList from './quotationTermsList';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { routerRedux } from 'dva/router';
import formatterCollections from 'utils/intl/formatterCollections';
import CusNotification from '_cus_components/CusNotification';
import { isEmpty } from 'lodash';
import style from './index.less';
import { round } from 'lodash';
import PageMessage from '_cus_components/Page/PageMessage';
import CusInput from '_cus_components/CusInput';

const FormItem = Form.Item;
const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_BID}/v1/${organizationId}`;
@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'bid.milestonecommon', 'HKPC.commom'],
})
@connect(({ loading, projectQaModels, pricingModels }) => ({
  projectQaModels,
  pricingModels,
  poHeaderInfo: projectQaModels?.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels?.poHeaderMilestonesInfo,
  fetchLoading: loading.effects['pricingModels/fetchPricingList'],
}))
@Form.create({ fieldNameProp: null })
class Pricing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['projectQaInfo', 'biddingRound', 'pricingTable', 'quotationTerms'],
      pricingAllDataSource: [],
      pricingAllPagination: {},
      pricingSingleDataSource: [],
      pricingSinglePagination: {},
      addTurn: false,
      milestoneCode: '',
      HkdVal: 0,
      timeFlag: false,
      submitFlag: false,
      endFlag: false,
      confirmPriceFlag: false,
      milestoneList: [],
      groupUnsaveFlag: false,
      editConfirmPriceFlag: true,
    };
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: {}, // 头信息
        poHeaderMilestonesInfo: {},
      },
    });
  }

  @Bind
  init() {
    this.queryProjectQaInfo();
    this.queryProjectQaMilestonesInfo();
    this.getMilestone();
  }

  // 获取当日汇率接口
  @Bind
  computeRate(record) {
    if (record) {
      const newDate = new Date();
      const { dispatch } = this.props;
      const currencyCode = record.priceCurrency;
      return new Promise((resolve, reject) => {
        dispatch({
          type: 'pricingModels/computeRate',
          payload: {
            currencyCode,
            rateDate: dayjs(newDate).format('YYYY-MM-DD 00:00:00'),
          },
        }).then((res) => {
          if (res && !isEmpty(res)) {
            this.setState({
              HkdVal: res.rate,
            });
            resolve(res.rate);
          } else if (currencyCode === 'HKD') {
            this.setState({
              HkdVal: 1,
            });
            resolve(1);
          } else {
            this.setState({
              HkdVal: 0,
            });
            resolve(undefined);
          }
        });
      });
    }
  }

  /**
   * 查询基本头信息
   */
  @Bind
  queryProjectQaInfo() {
    const { dispatch, match } = this.props;
    const proId = match.params.proId;
    dispatch({
      type: 'projectQaModels/queryProjectQaInfo',
      payload: {
        proId: proId,
      },
    }).then((res) => {
      if (res) {
        this.getPricingList();
        this.queryQuotationTermsList();
      }
    });
  }

  /**
   * 查询轮次信息
   */
  @Bind
  queryProjectQaMilestonesInfo() {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    const newDateTime = new Date().getTime();
    dispatch({
      type: 'projectQaModels/queryProjectQaMilestonesInfo',
      payload: {
        milestoneId: milestoneId,
      },
    }).then((res) => {
      if (res) {
        const endTime = Date.parse(new Date(res.milestoneEndTime));
        if (newDateTime < endTime) {
          this.setState({
            timeFlag: true,
          });
        }
        this.setState({
          endFlag: res.priceTotalMilestoneState === 'affirmed',
          submitFlag: res.milestoneState === 'completed',
          confirmPriceFlag: res.newPriceClassfyMilestoneState === 'completed', // 每个报价文件最后一个价格澄清的里程碑状态
        });
      }
    });
  }

  @Bind()
  handleSubmit() {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    const { milestoneIdNew } = this.state;

    const isPub = location.pathname.includes('pub');
    dispatch(
      routerRedux.push({
        pathname: `${
          isPub ? '/pub' : ''
        }/sspo/online-purchase/PriceScore/${proId}/${milestoneIdNew} `,
      })
    );
  }

  /**
   * getPricingList - 报总价模式数据/特殊报价数据
   * priceType: specialQuotation - 特殊报价
   */
  @Bind
  @Debounce(500)
  getPricingList(page = {}) {
    const { dispatch, match, poHeaderInfo = {} } = this.props;
    const { proId, milestoneId } = match.params;
    const { priceType } = poHeaderInfo;
    dispatch({
      type: 'pricingModels/fetchPricingList',
      payload: {
        page,
        proId: proId,
        milestoneId: milestoneId,
        priceType: priceType || 'specialQuotation',
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        this.setState({
          groupUnsaveFlag: false,
        });
        if (priceType === 'unitPrice') {
          dispatch({
            type: 'pricingModels/updateState',
            payload: {
              pricingSingleDataSource: newDataSource,
              pricingSinglePagination: pagination,
            },
          });
          this.computeRate(content ? content[0].answerVOList[0] : []);
        } else {
          dispatch({
            type: 'pricingModels/updateState',
            payload: {
              pricingAllDataSource: newDataSource,
              pricingAllPagination: pagination,
            },
          });
          this.computeRate(content ? content[0] : []);
        }
      }
    });
  }

  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
  }

  @Bind
  addMore() {
    CusModal.confirm({
      content: intl
        .get('bid.bidcommon.view.button.initiatemultipleroundsofquotation')
        .d('是否开启多轮报价'),
      okType: 'normal',
      onOk: () => {
        this.setState({ addTurn: true, milestoneCode: 'price_file_upload' });
      },
    });
  }

  @Bind
  addPrice() {
    CusModal.confirm({
      content: intl.get('bid.bidcommon.view.message.surepricecla').d('是否添加价格澄清'),
      okType: 'normal',
      onOk: () => {
        this.setState({ addTurn: true, milestoneCode: 'price_clarification' });
      },
    });
  }

  @Bind()
  onOk() {
    const { form, match } = this.props;
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      let param = {
        milestoneEndTime: dayjs(values.beforeTimeNew).format('YYYY-MM-DD HH:mm:ss'),
        milestoneStartTime: dayjs(values.startTime).format('YYYY-MM-DD HH:mm:ss'),
        milestoneId: match.params.milestoneId,
        milestoneCode: this.state.milestoneCode,
        nextRoundReason: values.nextRoundReasonPrice,
      };
      if (this.state.milestoneCode == 'price_clarification') {
        param = { ...param, isNeedCloseCurrentMilestone: 'n' };
      }
      // console.log('123',param)
      request(`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-milestones/addNextRound`, {
        method: 'POST',
        body: param,
      }).then((res) => {
        this.init();
      });
    });
    this.setState({ addTurn: false });
  }

  @Bind
  onCancel() {
    this.setState({ addTurn: false });
  }

  @Bind()
  handlePrice() {
    const isPub = location.pathname.includes('pub');
    const { dispatch, match, poHeaderInfo = {} } = this.props;
    const { priceType } = poHeaderInfo;
    const { proId, milestoneId } = match.params;
    dispatch(
      routerRedux.push({
        pathname: `${
          isPub ? '/pub' : ''
        }/sspo/pricing/priceComparison/${proId}/${milestoneId}/${priceType}`,
      })
    );
  }

  // 特殊报价保存
  @Debounce(300, { leading: true })
  @Bind
  handleSaveSpecial() {
    const { dispatch, match, pricingModels } = this.props;
    const { proId, milestoneId } = match.params;
    const { pricingAllDataSource = [] } = pricingModels;
    const data = getEditTableData(pricingAllDataSource).map((item) =>
      item._status === 'create'
        ? {
            ...item,
            poOrderId: undefined,
          }
        : {
            ...item,
            remarks: 'specialQuotation',
            proId: proId,
            milestoneId: milestoneId,
            answerBy: item.userId,
            referencePriceHkd: round(item.referencePriceHkd, 2),
          }
    );

    return new Promise((resolve, reject) => {
      if (data.length > 0) {
        dispatch({
          type: 'pricingModels/saveAllQuotation',
          payload: {
            data,
          },
        }).then((res) => {
          if (res) {
            this.getPricingList();
            // CusNotification.success();
            resolve(true);
          } else {
            reject();
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  // 总价模式保存
  @Debounce(300, { leading: true })
  @Bind
  handleSaveQuotation() {
    const { dispatch, pricingModels } = this.props;
    const { pricingAllDataSource = [] } = pricingModels;
    const data = getEditTableData(pricingAllDataSource).map((item) =>
      item._status === 'create'
        ? {
            ...item,
            poOrderId: undefined,
          }
        : {
            ...item,
            referencePriceHkd: round(item.referencePriceHkd, 2),
          }
    );

    return new Promise((resolve, reject) => {
      if (data.length > 0) {
        dispatch({
          type: 'pricingModels/saveAllQuotation',
          payload: {
            data,
          },
        }).then((res) => {
          if (res) {
            this.getPricingList();
            // CusNotification.success();
            resolve(true);
          } else {
            reject();
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  // 单价模式保存
  @Debounce(300, { leading: true })
  @Bind
  handleSaveSingle(dataSource) {
    const {
      dispatch,
      pricingModels: { pricingSingleDataSource = [] },
    } = this.props;
    const newData = [];
    let newDataSource = [];
    console.log('pricingSingleDataSource', pricingSingleDataSource);
    if (pricingSingleDataSource) {
      pricingSingleDataSource.map((e, j) => {
        e.answerVOList.map((i, k) => {
          if (i.proPriceConfigAnswerId) {
            newData.push({
              ...i,
              dataSourceIndex: j,
              referencePriceHkd: round(i.afterTaxPrice * i.referenceRate, 2),
              confirmPrice: i.afterTaxPrice,
              supplierName: e.supplierName,
              userId: e.userId,
              eIndex: k,
              fileDTOList: e.fileDTOList,
              _status: 'update',
            });
          }
          // newDataSource = [
          //   ...newDataSource,
          //   {
          //     ...i,
          //     dataSourceIndex: j,
          //     referencePriceHkd: round(i.referencePriceHkd, 2),
          //     supplierName: e.supplierName,
          //     userId: e.userId,
          //     eIndex: k,
          //     fileDTOList: e.fileDTOList,
          //     _status: 'update',
          //   },
          // ];
        });
      });
    }
    pricingSingleDataSource.map((item) => {
      if (item.proPriceConfigAnswerId) {
        item.referencePriceHkd = round(item.referencePriceHkd, 2);
        newData.push(item);
      }
    });

    console.log('data111111111', ...newData);
    return new Promise((resolve, reject) => {
      if (newData.length > 0) {
        dispatch({
          type: 'pricingModels/saveAllQuotation',
          payload: {
            data: newData,
          },
        }).then((res) => {
          if (res) {
            this.getPricingList();
            // CusNotification.success();
            resolve(true);
          } else {
            reject();
          }
        });
      } else {
        resolve(true);
      }
    });
    // }
  }

  // 确认核价
  @Bind
  handleConfirmPrice(data) {
    const { poHeaderInfo } = this.props;
    const { priceType } = poHeaderInfo;
    if (priceType === 'totalPrice') {
      this.handleSaveQuotation().then((res) => {
        if (res) {
          this.onConfirm();
        }
      });
    } else if (priceType === 'unitPrice') {
      this.handleSaveSingle(data).then((res) => {
        if (res) {
          this.onConfirm();
        }
      });
    } else {
      this.handleSaveSpecial().then((res) => {
        if (res) {
          this.onConfirm();
        }
      });
    }
  }

  // 确认核价
  @Bind
  onConfirm() {
    const { dispatch, match } = this.props;
    const { milestoneId } = match.params;
    dispatch({
      type: 'pricingModels/handleConfirm',
      payload: {
        milestoneId: milestoneId,
      },
    }).then((res) => {
      if (res) {
        this.queryProjectQaMilestonesInfo();
        CusNotification.success();
        this.setState({
          editConfirmPriceFlag: false,
        });
      }
    });
  }

  // 修改核价
  @Bind
  handleEditConfirmPrice() {
    this.setState({
      editConfirmPriceFlag: true,
    });
  }

  // 查询里程碑列表
  @Bind()
  getMilestone() {
    const { dispatch, match } = this.props;
    const { proId } = match.params;
    dispatch({
      type: 'pricingModels/milestone',
      payload: {
        proId: proId,
      },
    }).then((res) => {
      let milestoneIdNew;
      if (res) {
        res.map((item) => {
          if (
            item.milestoneCode == 'price_file_total' ||
            item.milestoneCode == 'total_price_review'
          ) {
            milestoneIdNew = item.milestoneId;
          }
        });
        this.setState({
          milestoneList: res,
          milestoneIdNew,
        });
      }
    });
  }

  // 点击全局保存选择触发局部保存
  @Bind()
  handleSave() {
    const { poHeaderInfo } = this.props;
    if (poHeaderInfo.specialPrice === 'YES' || poHeaderInfo.priceSecret === 'YES') {
      this.handleSaveSpecial();
    } else {
      if (poHeaderInfo.priceType === 'totalPrice') {
        this.handleSaveQuotation();
      } else {
        this.handleSaveSingle();
      }
    }
  }

  // 查询报价条款
  @Bind()
  queryQuotationTermsList(page = {}) {
    const { dispatch, match } = this.props;
    const { proId, milestoneId } = match.params;
    dispatch({
      type: 'pricingModels/getQuotationTermsList',
      payload: {
        page,
        proId: proId,
        milestoneId: milestoneId,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          poOrderId: uuidv4(),
        }));
        dispatch({
          type: 'pricingModels/updateState',
          payload: {
            quotationTermsSource: newDataSource,
            quotationTermsPagination: pagination,
          },
        });
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      form,
      pricingModels: {
        pricingAllDataSource = [],
        pricingAllPagination = {},
        pricingSingleDataSource = [],
        pricingSinglePagination = {},
      },
      poHeaderInfo,
      poHeaderMilestonesInfo,
      match,
      dispatch,
      location: { search },
      deleteLoading = false,
      saveLoading = false,
    } = this.props;
    const { proId } = match.params;
    const {
      activeKey,
      addTurn,
      milestoneCode,
      HkdVal,
      timeFlag,
      submitFlag,
      endFlag,
      milestoneList,
      confirmPriceFlag,
      groupUnsaveFlag,
      editConfirmPriceFlag,
    } = this.state;
    const projectQaInfoProps = {
      form,
      poHeaderInfo,
    };
    const biddingRoundInfoProps = {
      form,
      poHeaderMilestonesInfo,
    };
    const flagShow = poHeaderInfo.specialPrice !== 'YES' && poHeaderInfo.priceSecret !== 'YES';
    const pricingAllTableProps = {
      form,
      fetchLoading,
      poHeaderMilestonesInfo,
      dataSource: pricingAllDataSource,
      pagination: pricingAllPagination,
      isShow: flagShow,
      timeFlag,
      submitFlag,
      confirmPriceFlag,
      editConfirmPriceFlag,
      HkdVal,
      unsaveFlag: groupUnsaveFlag,
      onSave:
        poHeaderInfo.priceType === 'totalPrice' ? this.handleSaveQuotation : this.handleSaveSpecial,
      onConfirmPrice: this.handleConfirmPrice,
      onEditConfirmPrice: this.handleEditConfirmPrice,
      onPageChange: this.getPricingList,
      onEdit: (flag) => {
        this.setState({
          groupUnsaveFlag: flag,
        });
      },
      poHeaderInfo,
    };

    const pricingSingleTableProps = {
      form,
      fetchLoading,
      dispatch,
      poHeaderMilestonesInfo,
      timeFlag,
      submitFlag,
      HkdVal,
      confirmPriceFlag,
      editConfirmPriceFlag,
      dataSource: pricingSingleDataSource,
      pagination: pricingSinglePagination,
      onSave: this.handleSaveSingle,
      onConfirmPrice: this.handleConfirmPrice,
      onEditConfirmPrice: this.handleEditConfirmPrice,
    };

    const QuotationTermsListProps = {
      ...this.props,
      onPageChange: this.queryQuotationTermsList,
    };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    // purChase为公开招标和邀请招标时为true
    const purChase =
      poHeaderInfo.purchaseType === 'public_bidding' ||
      poHeaderInfo.purchaseType === 'invited_bidding';
    console.log('purChase', purChase);
    let milestoneFlag = false;
    let addPrice = false;
    milestoneList.map((item) => {
      if (
        poHeaderMilestonesInfo.milestoneId === item.parentId &&
        item.milestoneCode === 'price_clarification'
      ) {
        milestoneFlag = true;
      }
      if (item.milestoneCode === 'price_file_upload') {
        if (item.milestoneId > poHeaderMilestonesInfo.milestoneId) {
          addPrice = true;
        }
      }
    });
    const loading = saveLoading || deleteLoading || fetchLoading;
    let newData = [];
    if (pricingSingleDataSource) {
      pricingSingleDataSource.map((e, j) => {
        e.answerVOList.map((i, k) => {
          newData = [
            ...newData,
            {
              ...i,
              dataSourceIndex: j,
              supplierName: e.supplierName,
              userId: e.userId,
              eIndex: k,
              fileDTOList: e.fileDTOList,
              _status: 'update',
            },
          ];
        });
      });
    }

    const supplierDataExportProps = {
      requestUrl: `${prefix}/bid-pro-price-configs/view/bidProPriceExport?proId=${match.params.proId}&milestoneId=${match.params.milestoneId}`,
      method: 'POST',
      downloadType: 'Blob',
      buttonText: intl.get(`HKPC.commom.view.button.export`).d('导出'),
      fileName:
        intl.get(`HKPC.commom.view.title.QuotationContent`).d('报价表') +
        dayjs().format('YYYY-MM-DD'),
      // queryParams: this.getQueryParams,
    };

    return (
      <>
        <PageWrapper loading={fetchLoading}>
          <Collapse
            className={classnames('customize-collapse')}
            defaultActiveKey={activeKey}
            onChange={this.onCollapseChange}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  arrowActive={activeKey.includes('projectQaInfo')}
                />
              }
              key="projectQaInfo"
            >
              <ProjectQaInfo {...projectQaInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={
                    poHeaderInfo.proInfoWording
                      ? intl.get(`bid.bidcommon.view.title.bidzbluncirr`).d('招标轮次')
                      : intl.get(`bid.bidcommon.view.title.bidzbluncirrnew`).d('比选轮次')
                  }
                  arrowActive={activeKey.includes('biddingRound')}
                />
              }
              key="biddingRound"
            >
              <BiddingRound {...biddingRoundInfoProps} />
            </Panel>
            {poHeaderInfo.specialPrice !== 'YES' && poHeaderInfo.priceSecret !== 'YES' && (
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={
                      poHeaderInfo.priceType === 'totalPrice'
                        ? intl.get(`bid.bidcommon.view.title.totalmode`).d('报总价模式')
                        : intl.get(`bid.bidcommon.view.title.unitmode`).d('报单价模式')
                    }
                    arrowActive={activeKey.includes('pricingTable')}
                    buttons={
                      <>
                        {poHeaderInfo.priceType === 'totalPrice' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {/* {!(loading || submitFlag && !editConfirmPriceFlag || timeFlag) && <CusButton
                              mini
                              onClick={this.handleSaveQuotation}
                            >
                              {intl.get('hzero.common.button.save').d('保存')}
                            </CusButton>} */}
                            {!submitFlag && (
                              <CusButton mini onClick={() => this.handleConfirmPrice(newData)}>
                                {intl
                                  .get('bid.bidcommon.view.button.checkhejiaprice')
                                  .d('确认核价')}
                              </CusButton>
                            )}
                            {!editConfirmPriceFlag && (
                              <CusButton mini onClick={() => this.handleEditConfirmPrice(newData)}>
                                {intl.get('bid.bidcommon.view.title.modifyprice').d('修改价格')}
                              </CusButton>
                            )}
                          </div>
                        )}
                        {!(poHeaderInfo.priceType === 'totalPrice') && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {/* {!(loading || submitFlag && !editConfirmPriceFlag || timeFlag) && <CusButton
                              onClick={this.handleSaveSingle}
                              mini
                            >
                              {intl.get('hzero.common.button.save').d('保存')}
                            </CusButton>} */}
                            <CusExcelExport
                              otherButtonProps={{ mini: true }}
                              {...supplierDataExportProps}
                            />
                            {!submitFlag && (
                              <CusButton onClick={this.handleConfirmPrice} mini>
                                {intl
                                  .get('bid.bidcommon.view.button.checkhejiaprice')
                                  .d('确认核价')}
                              </CusButton>
                            )}
                            {/* {!(editConfirmPriceFlag) && <CusButton
                              onClick={this.handleEditConfirmPrice}
                              mini
                            >
                              {intl.get('bid.bidcommon.view.title.modifyprice').d('修改价格')}
                            </CusButton>} */}
                          </div>
                        )}
                      </>
                    }
                  />
                }
                key="pricingTable"
              >
                {/* <div style={{margin: '-16px', marginBottom: '16px'}}>
                  <PageMessage>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: intl
                        .get('bid.bidcommon.view.message.description1')
                        .d('说明：<br/> 参考汇率取自于EBS的财务数据<br/> 具体汇率以当月财务数据为准	'),
                    }}
                  />
                  </PageMessage>
                </div> */}
                {poHeaderInfo.priceType === 'totalPrice' && (
                  <PricingAllTable {...pricingAllTableProps} />
                )}
                {poHeaderInfo.priceType === 'unitPrice' && (
                  <PricingSingleTable
                    {...pricingSingleTableProps}
                    onRef={(node) => (this.PricingSingleTable = node)}
                  />
                )}
              </Panel>
            )}
            {(poHeaderInfo.specialPrice === 'YES' || poHeaderInfo.priceSecret === 'YES') && (
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`bid.bidcommon.view.title.specialquotation`).d('特殊报价')}
                    arrowActive={activeKey.includes('pricingTable')}
                    buttons={
                      <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {/* {!(loading || submitFlag && !editConfirmPriceFlag || timeFlag) && <CusButton
                            mini
                            onClick={this.handleSaveSpecial}
                          >
                            {intl.get('hzero.common.button.save').d('保存')}
                          </CusButton>} */}
                          {!submitFlag && (
                            <CusButton mini onClick={this.handleConfirmPrice}>
                              {intl.get('bid.bidcommon.view.button.checkhejiaprice').d('确认核价')}
                            </CusButton>
                          )}
                          {!editConfirmPriceFlag && (
                            <CusButton mini onClick={this.handleEditConfirmPrice}>
                              {intl.get('bid.bidcommon.view.title.modifyprice').d('修改价格')}
                            </CusButton>
                          )}
                        </div>
                      </>
                    }
                  />
                }
                key="pricingTable"
              >
                {/* <div style={{margin: '-16px', marginBottom: '16px'}}>
                  <PageMessage>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: intl
                          .get('bid.bidcommon.view.message.description1')
                          .d('说明：<br/> 参考汇率取自于EBS的财务数据<br/> 具体汇率以当月财务数据为准	'),
                      }}
                    />
                  </PageMessage>
                </div> */}
                <PricingAllTable
                  {...pricingAllTableProps}
                  onRef={(node) => (this.PricingAllTable = node)}
                />
              </Panel>
            )}
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`HKPC.commom.view.title.QuotationTerms`).d('报价条款')}
                  arrowActive={activeKey.includes('quotationTerms')}
                  buttons={
                    <CusExcelExport
                      requestUrl={`${SRM_BID}/v1/${organizationId}/bid-pro-price-config-answers/exportThirdSupClause/${match.params.proId}/${match.params.milestoneId}`}
                      downloadType="Blob"
                      fileName={
                        intl.get(`HKPC.commom.view.title.QuotationTerms`).d('报价条款')
                      }
                      otherButtonProps={{
                        mini: true,
                        icon: null,
                      }}
                      queryParams={{
                        proId: match.params.proId,
                        milestoneId: match.params.milestoneId
                      }}
                    />
                  }
                />
              }
              key="quotationTerms"
            >
              <QuotationTermsList {...QuotationTermsListProps} />
            </Panel>
          </Collapse>
          <CusModal
            title={intl.get(`bid.bidcommon.view.button.add`).d('添加')}
            visible={addTurn}
            onOk={this.onOk}
            onCancel={this.onCancel}
            footer={[
              <CusButton key="back" onClick={this.onCancel}>
                {intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}
              </CusButton>,
              <CusButton key="submit" type="primary" onClick={this.onOk}>
                {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
              </CusButton>,
            ]}
          >
            <Form className="customize-form">
              <Row>
                <Col span={24}>
                  <FormItem
                    label={intl.get(`bid.bidcommon.view.title.starttime`).d('下轮开始时间')}
                    style={{ display: 'flex' }}
                  >
                    {form.getFieldDecorator('startTime', {
                      initialValue: '' && dayjs(''),
                    })(
                      <CusDatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateTimeFormat()}
                        showTime
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem
                    label={intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间')}
                    style={{ display: 'flex' }}
                  >
                    {form.getFieldDecorator('beforeTimeNew', {
                      initialValue: '' && dayjs(''),
                    })(
                      <CusDatePicker
                        style={{ width: '100%' }}
                        placeholder=""
                        format={getDateTimeFormat()}
                        showTime
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem
                    label={intl.get(`HKPC.commom.view.title.Remark`).d('备注')}
                  >
                    {form.getFieldDecorator('nextRoundReasonPrice', {
                      initialValue: '',
                    })(
                      <CusInput.TextArea
                        maxLength={500}
                        showCharacter
                        autoSize={{ minRows: 2, maxRows: 2 }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </CusModal>
        </PageWrapper>
        <CusApprovalButtons>
          {/* {!(loading || (submitFlag && !editConfirmPriceFlag) || timeFlag) && (
            <CusButton onClick={this.handleSave}>
              {intl.get('hzero.common.button.save').d('保存')}
            </CusButton>
          )} */}
          {purChase && submitFlag && (
            <CusButton onClick={() => this.handleSubmit()}>
              {intl.get('bid.bidcommon.view.button.pricescore').d('价格评分')}
            </CusButton>
          )}
          {!purChase && submitFlag && (
            <CusButton onClick={() => this.handleSubmit()}>
              {intl.get('bid.bidcommon.view.button.pricescore').d('价格评分')}
            </CusButton>
          )}
          {purChase && !endFlag && submitFlag && !addPrice && (
            <CusButton onClick={this.addMore}>
              {intl
                .get('bid.bidcommon.view.button.initiatemultipleroundsofquotation')
                .d('发起多轮报价')}
            </CusButton>
          )}
          {!purChase && !endFlag && submitFlag && !addPrice && (
            <CusButton onClick={this.addMore}>
              {intl
                .get('bid.bidcommon.view.button.initiatemultipleroundsofquotation')
                .d('发起多轮报价')}
            </CusButton>
          )}
          {purChase && !milestoneFlag && !endFlag && (
            <CusButton onClick={() => this.addPrice()}>
              {intl.get('bid.milestonecommon.view.title.priceclarification').d('价格澄清')}
            </CusButton>
          )}
          {!purChase && !submitFlag && !milestoneFlag && !endFlag && (
            <CusButton onClick={() => this.addPrice()}>
              {intl.get('bid.milestonecommon.view.title.priceclarification').d('价格澄清')}
            </CusButton>
          )}
          {/* {poHeaderInfo.priceType && (
            <CusButton onClick={this.handlePrice}>
              {intl.get('bid.bidcommon.view.button.pricecomparison').d('比价')}
            </CusButton>
          )} */}
        </CusApprovalButtons>
      </>
    );
  }
}

export default Pricing;
