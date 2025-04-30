/**
 * @Description: 核价
 * @date 2022-04-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import request from 'utils/request';
import { SRM_BID, HZERO_FILE } from '@/common/config';

import { Bind, Debounce } from 'lodash-decorators';
import { Form, Button, LocaleProvider, Spin, Collapse, Modal, DatePicker, Input } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
//  import styles from './index.less';
import uuidv4 from 'uuid/v4';
import {
  getCurrentLanguage,
  getDateTimeFormat,
  getCurrentOrganizationId,
  getEditTableData,
} from 'utils/utils';
import ProjectQaInfo from '../ProjectQa/projectQaInfo';
import BiddingRound from '../ProjectQa/biddingRound';
import PricingSingleTable from './pricingSingle';
import PricingAllTable from './pricingAll';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { routerRedux } from 'dva/router';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import style from './index.less';
import { round } from 'lodash';

const FormItem = Form.Item;
const { Panel } = Collapse;
@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'bid.milestonecommon'],
})
@connect(({ loading, projectQaModels, pricingModels }) => ({
  projectQaModels,
  pricingModels,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels.poHeaderMilestonesInfo,
  revokeLoading: loading.effects['pricingModels/fetchPricingList'],
  fetchLoading: loading.effects['pricingModels/fetchPricingList'],
}))
@Form.create({ fieldNameProp: null })
class Pricing extends Component {
  constructor(props) {
    super(props);
    // const {
    //   match
    // } = this.props;
    // 只读界面
    // const isViewOnly = match.path.includes('viewOnly');
    // 判断是否汇总页面跳转过来
    // const { isSummary = false } = state;
    this.state = {
      activeKey: ['projectQaInfo', 'biddingRound', 'pricingTable'],
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
      editConfirmPriceFlag: false
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
    this.getPricingList();
    this.getMilestone();
  }

  // @Bind
  // handlePriceFlag() {
  //   const {
  //     location: {search}
  //   } = this.props;
  //   console.log('search', search)
  // }

  @Bind
  computeRate(record) {
    if (record) {
      const newDate = new Date();
      const { dispatch } = this.props;
      const fromCurrency = record.priceCurrency;
      return new Promise((resolve, reject) => {
        dispatch({
          type: 'pricingModels/computeRate',
          payload: {
            fromCurrency,
            toCurrency: 'HKD',
            conversionDate: moment(newDate).format('YYYY-MM-DD 00:00:00'),
          },
        }).then((res) => {
          if (res && !isEmpty(res)) {
            this.setState({
              HkdVal: res[0].conversionRate,
            });
            resolve(res[0].conversionRate);
          } else if (fromCurrency === 'HKD') {
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
    const isPub = location.pathname.includes('pub');
    // console.log(123)
    dispatch(
      routerRedux.push({
        pathname: `${isPub ? '/pub' : ''}/sspo/online-purchase/PriceScore/${proId}/${milestoneId} `,
      })
    );
  }

  /**
   * getPricingList - 报总价模式数据/特殊报价数据
   * priceType: specialQuotation - 特殊报价
   */
  @Bind
  @Debounce(300)
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
    Modal.confirm({
      title: intl
        .get('bid.bidcommon.view.button.initiatemultipleroundsofquotation')
        .d('是否开启多轮报价'),
      onOk: () => {
        this.setState({ addTurn: true, milestoneCode: 'price_file_upload' });
      },
    });
  }

  @Bind
  addPrice() {
    Modal.confirm({
      title: intl.get('bid.bidcommon.view.message.surepricecla').d('是否添加价格澄清'),
      onOk: () => {
        this.setState({ addTurn: true, milestoneCode: 'price_clarification' });
      },
    });
  }

  @Bind()
  onOk() {
    const { form, match } = this.props;
    form.validateFieldsAndScroll({ force: true }, (err, values) => {
      // const params = [
      //   {
      //     milestoneEndTime: moment(values.beforeTime),
      //     milestoneId: match.params.milestoneId,
      //   },
      // ];
      // request(`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-milestones`, {
      //   method: 'POST',
      //   body: params,
      // });
      let param = {
        milestoneEndTime: moment(values.beforeTimeNew).format('YYYY-MM-DD HH:mm:ss'),
        milestoneStartTime: moment(values.startTime).format('YYYY-MM-DD HH:mm:ss'),
        milestoneId: match.params.milestoneId,
        milestoneCode: this.state.milestoneCode,
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
        pathname: `${isPub ? '/pub' : ''
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
            notification.success();
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
            notification.success();
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
    const { dispatch } = this.props;
    const newData = [];
    dataSource.map((item) => {
      if (item.proPriceConfigAnswerId) {
        item.referencePriceHkd = round(item.referencePriceHkd, 2)
        newData.push(item);
      }
    });

    console.log('data111111111', ...newData);
    // if (newData.length > 0) {
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
            notification.success();
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
        notification.success();
        this.setState({
          editConfirmPriceFlag: false
        })
      }
    });
  }

  // 修改核价
  @Bind
  handleEditConfirmPrice() {
    this.setState({
      editConfirmPriceFlag: true
    })
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
      if (res) {
        this.setState({
          milestoneList: res,
        });
      }
    });
  }

  render() {
    const {
      revokeLoading = false,
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
    } = this.props;
    console.log('报单价数据', pricingSingleDataSource);
    console.log('报总价数据', pricingAllDataSource);
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
      editConfirmPriceFlag
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
        poHeaderInfo.purchaseType === 'totalPrice'
          ? this.handleSaveQuotation
          : this.handleSaveSpecial,
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
      // unsaveFlag: groupUnsaveFlag,
      onSave: this.handleSaveSingle,
      onConfirmPrice: this.handleConfirmPrice,
      onEditConfirmPrice: this.handleEditConfirmPrice,
      // onPageChange: this.getPricingList,
      // onEdit: (flag) => {
      //   this.setState({
      //     groupUnsaveFlag: flag,
      //   });
      // },
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
      if (poHeaderMilestonesInfo.milestoneId === item.parentId && item.milestoneCode === 'price_clarification') {
        milestoneFlag = true;
      }
      if (item.milestoneCode === 'price_file_upload') {
        if (item.milestoneId > poHeaderMilestonesInfo.milestoneId) {
          addPrice = true;
        }
      }
    });
    // if(submitFlag) {
    //   if(poHeaderInfo.purchaseType === 'public_bidding' || poHeaderInfo.purchaseType === 'invited_bidding') {
    //     isButtonFlag = false
    //   } else {
    //     isPriceFlag = false
    //   }
    // } else {
    //   if(timeFlag) {
    //     // 截止时间没到
    //     if(poHeaderInfo.purchaseType === 'public_bidding' || poHeaderInfo.purchaseType === 'invited_bidding') {
    //       isButtonFlag = true
    //     }
    //   } else {
    //     if(poHeaderInfo.purchaseType === 'public_bidding' || poHeaderInfo.purchaseType === 'invited_bidding') {
    //       isButtonFlag = true
    //     }
    //   }
    // }
    console.log('addPrice', addPrice)
    return (
      <Fragment>
        <Header>
          {/* <div style={{ marginRight: '16px' }} > */}
          {purChase && submitFlag && (
            <Button
              // disabled={timeFlag || submitFlag}
              type="primary"
              onClick={() => this.handleSubmit()}
            >
              {intl.get('bid.bidcommon.view.button.pricescore').d('价格评分')}
            </Button>
          )}
          {!purChase && submitFlag && (
            <Button
              // disabled={timeFlag || submitFlag}
              type="primary"
              onClick={() => this.handleSubmit()}
            >
              {intl.get('bid.bidcommon.view.button.pricescore').d('价格评分')}
            </Button>
          )}
          {purChase && !endFlag && submitFlag && !addPrice && (
            <Button
              // disabled={endFlag || (timeFlag && submitFlag)}
              type="primary"
              onClick={this.addMore}
            >
              {intl
                .get('bid.bidcommon.view.button.initiatemultipleroundsofquotation')
                .d('发起多轮报价')}
            </Button>
          )}
          {!purChase && !endFlag && submitFlag && !addPrice && (
            <Button
              // disabled={endFlag || (timeFlag && submitFlag)}
              type="primary"
              onClick={this.addMore}
            >
              {intl
                .get('bid.bidcommon.view.button.initiatemultipleroundsofquotation')
                .d('发起多轮报价')}
            </Button>
          )}
          {purChase && !milestoneFlag && !endFlag && (
            <Button
              // disabled={timeFlag || submitFlag}
              type="primary"
              onClick={() => this.addPrice()}
            >
              {intl.get('bid.milestonecommon.view.title.priceclarification').d('价格澄清')}
            </Button>
          )}
          {!purChase && !submitFlag && !milestoneFlag && !endFlag && (
            <Button
              // disabled={timeFlag || submitFlag}
              type="primary"
              onClick={() => this.addPrice()}
            >
              {intl.get('bid.milestonecommon.view.title.priceclarification').d('价格澄清')}
            </Button>
          )}
          {poHeaderInfo.priceType && (
            <Button type="primary" onClick={this.handlePrice}>
              {intl.get('bid.bidcommon.view.button.pricecomparison').d('比价')}
            </Button>
          )}

          {/* </div> */}
        </Header>
        <Content className="content-bottom">
          <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
            <div>
              <Spin spinning={revokeLoading}>
                <Collapse activeKey={activeKey} onChange={this.onCollapseChange}>
                  <Panel
                    header={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                    key="projectQaInfo"
                  >
                    <ProjectQaInfo {...projectQaInfoProps} />
                  </Panel>
                  <Panel
                    header={poHeaderInfo.proInfoWording ?
                      intl.get(`bid.bidcommon.view.title.bidzbluncirr`).d('招标轮次')
                      : intl.get(`bid.bidcommon.view.title.bidzbluncirrnew`).d('比选轮次')
                    }
                    key="biddingRound"
                  >
                    <BiddingRound {...biddingRoundInfoProps} />
                  </Panel>
                  {poHeaderInfo.specialPrice !== 'YES' && poHeaderInfo.priceSecret !== 'YES' && (
                    <Panel
                      header={
                        poHeaderInfo.priceType === 'totalPrice'
                          ? intl.get(`bid.bidcommon.view.title.totalmode`).d('报总价模式')
                          : intl.get(`bid.bidcommon.view.title.unitmode`).d('报单价模式')
                      }
                      key="pricingTable"
                    >
                      {poHeaderInfo.priceType === 'totalPrice' && (
                        <PricingAllTable {...pricingAllTableProps} />
                      )}
                      {poHeaderInfo.priceType === 'unitPrice' && (
                        <PricingSingleTable {...pricingSingleTableProps} />
                      )}
                    </Panel>
                  )}
                  {(poHeaderInfo.specialPrice === 'YES' || poHeaderInfo.priceSecret === 'YES') && (
                    <Panel
                      header={intl.get(`bid.bidcommon.view.title.specialquotation`).d('特殊报价')}
                      key="pricingTable"
                    >
                      <PricingAllTable {...pricingAllTableProps} />
                    </Panel>
                  )}
                </Collapse>
              </Spin>
            </div>
          </LocaleProvider>
        </Content>
        <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
          <Modal
            title={intl.get(`bid.bidcommon.view.button.add`).d('添加')}
            visible={addTurn}
            onOk={this.onOk}
            onCancel={this.onCancel}
            footer={[
              <Button key="back" onClick={this.onCancel}>
                {intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}
              </Button>,
              <Button key="submit" type="primary" onClick={this.onOk}>
                {intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
              </Button>,
            ]}
          >
            {/* {milestoneCode !== 'price_clarification' && (
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.benlunddline`).d('本轮截止时间')}
              style={{ display: 'flex' }}

              // {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('beforeTime', {
                initialValue: '' && moment(''),
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl
                //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                //         .d('预审截止时间'),
                //     }),
                //   },
                // ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime
                />
              )}
            </FormItem>
          )}
          {milestoneCode !== 'price_clarification' && (
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.deadline`).d('本轮截止原因')}
              style={{ display: 'flex' }}

              // {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('beforeTime1', {
                initialValue: '' && moment(''),
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl
                //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                //         .d('预审截止时间'),
                //     }),
                //   },
                // ],
              })(<Input></Input>)}
            </FormItem>
          )} */}
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.starttime`).d('下轮开始时间')}
              style={{ display: 'flex' }}
              className={style['labelStyle']}
            // {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('startTime', {
                initialValue: '' && moment(''),
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl
                //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                //         .d('预审截止时间'),
                //     }),
                //   },
                // ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime
                />
              )}
            </FormItem>
            <FormItem
              label={intl.get(`bid.milestonecommon.view.title.deadline`).d('截止时间')}
              style={{ display: 'flex' }}
              className={style['labelStyle']}
            // {...EDIT_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('beforeTimeNew', {
                initialValue: '' && moment(''),
                // rules: [
                //   {
                //     required: true,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl
                //         .get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`)
                //         .d('预审截止时间'),
                //     }),
                //   },
                // ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateTimeFormat()}
                  showTime
                />
              )}
            </FormItem>
          </Modal>
        </LocaleProvider>
      </Fragment>
    );
  }
}

export default Pricing;
