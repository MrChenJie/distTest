/*
 * @Description: 步骤条
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-04 11:40:33
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import { getCostProgress, getCostProgressDetail } from '@/services/costRequestService';
import { Popover } from 'choerodon-ui';
import { Tooltip } from 'antd';
import { Skeleton } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import moment from 'moment';
import tipIcon from '@/assets/tips.svg';
import styles from './index.less';

export default class index extends Component {
  state = {
    stepData: [], // 进度条数据
    itemDetail: {}, // 明细详情
    positionRight: false, // 提示框是否右对齐
  };

  componentDidMount = () => {
    this.handleQueryProgress();
  };

  /**
   * @name: 查询 - 进度条数据
   */
  handleQueryProgress = async () => {
    const { requestId } = this.props;
    let res = await getCostProgress({ requestId, paymentType: 'COST_PAYMENT' });
    // 父节点经过【hasPassFlag】的节点，且最后一个为当前节点
    const parentData = res.filter((p) => p.hasPassFlag === 'Y') || [];
    const currentParentData = parentData[parentData.length - 1] || {};
    const currentParentNode = currentParentData?.nodeStatus;
    // 子节点经过【hasPassFlag】的节点，且最后一个为当前节点
    const childData =
      currentParentData.childPaymentProgressStatusList?.filter((c) => c.hasPassFlag === 'Y') || [];
    const currentChildNode = childData[childData.length - 1]?.nodeStatus;

    res = res.map((list, num) => {
      // --------- 判断父节点状态 ----------
      let nodeFlag = 'wait'; // 未到节点
      let { childPaymentProgressStatusList } = list;
      if (list.hasPassFlag === 'Y') {
        nodeFlag = 'complete'; // 已完成节点
      }
      if (
        list.hasPassFlag === 'Y' &&
        list.nodeStatus === currentParentNode &&
        num !== res.length - 1
      ) {
        nodeFlag = 'execution'; // 当前节点
      }
      // --------- 判断子节点状态 ----------
      if (list.haveChildFlag === 'Y') {
        childPaymentProgressStatusList = list.childPaymentProgressStatusList.map((list2, num2) => {
          let nodeFlag2 = 'wait'; // 未到节点
          if (list2.hasPassFlag === 'Y') {
            nodeFlag2 = 'complete'; // 已完成节点
          }
          if (list2.hasPassFlag === 'Y' && list2.nodeStatus === currentChildNode) {
            nodeFlag2 = 'execution'; // 当前节点
          }
          return { ...list2, nodeFlag: nodeFlag2 };
        });
      }
      return { ...list, nodeFlag, childPaymentProgressStatusList };
    });
    if (res) {
      this.setState({ stepData: res });
    }
  };

  /**
   * @name: 操作 - 打开明细弹框
   * @param {data} itemData 流程数据
   * @param {object} e 标签元素
   * @param {number} indexNum 流程序号
   */
  handleClickItem = async (itemData, e, indexNum) => {
    const { itemDetail } = this.state;
    if (itemDetail[itemData.nodeStatus]) {
      this.setState({
        positionRight: e.offsetParent.clientWidth - e.offsetLeft < 120,
      });
    } else {
      this.setState({
        itemDetail: {
          ...itemDetail,
          [itemData.nodeStatus]: (
            <div style={{ width: '250px', height: '80px' }}>
              <Skeleton active skeletonTitle={false} paragraph={{ rows: 3 }} />
            </div>
          ),
        },
        positionRight: e.offsetParent.clientWidth - e.offsetLeft < 120,
      });
      if (itemData.haveChildFlag !== 'Y' && itemData.hasPassFlag === 'Y') {
        const data = await this.handleDetailPanel(itemData.nodeStatus);
        if (data) {
          this.setState({
            itemDetail: { ...itemDetail, [itemData.nodeStatus]: data },
          });
        }
      } else {
        const childDetailPanel = []; // 子节点明细
        for (let i = 0; i < itemData.childPaymentProgressStatusList.length; i++) {
          if (itemData.childPaymentProgressStatusList[i].hasPassFlag === 'Y') {
            const childDetailItem = await this.handleDetailPanel(
              itemData.childPaymentProgressStatusList[i].nodeStatus
            );
            if (childDetailItem) {
              childDetailPanel[i] = childDetailItem;
            }
          }
        }

        const data = (
          <div className={styles.tipMenuPanel}>
            {itemData.childPaymentProgressStatusList.map((list, num) => {
              let iconPanel = (
                <div className={styles.stepIconWait}>
                  {indexNum + 1}.{num + 1}
                </div>
              );
              if (list.hasPassFlag === 'Y') {
                iconPanel = <div className={styles.stepIconComplete} />;
              }
              if (list.nodeFlag === 'execution') {
                iconPanel = (
                  <div className={styles.stepIconExecution}>
                    {indexNum + 1}.{num + 1}
                  </div>
                );
              }
              return (
                <Popover
                  trigger={list.hasPassFlag === 'Y' ? 'hover' : 'contextMenu'}
                  placement={this.state.positionRight ? 'leftTOP' : 'rightTop'}
                  overlayClassName={styles.cusPopover}
                  content={
                    <div style={{ position: 'relative' }}>
                      {childDetailPanel[num]}
                      <div className={styles.trianglePanel} />
                    </div>
                  }
                  overlayStyle={{ paddingLeft: 30 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: num === 0 ? '0' : '8px',
                    }}
                    onMouseEnter={() => {
                      if (list.hasPassFlag === 'Y') {
                        this.handleClickItem(list, e, num);
                      }
                    }}
                  >
                    {iconPanel}
                    {list.nodeName}
                  </div>
                </Popover>
              );
            })}
          </div>
        );
        this.setState({ itemDetail: { ...itemDetail, [itemData.nodeStatus]: data } });
      }
    }
  };

  /**
   * @name: 方法 - 查询节点明细
   * @param {string} nodeStatus
   * @return {*} 反回节点详情面板
   */
  handleDetailPanel = async (nodeStatus) => {
    const { pressLevel = 'GENERAL', requestId } = this.props;
    const res = await getCostProgressDetail({
      costRequestType: 'COST_PAYMENT',
      nodeStatus,
      pressLevel,
      requestId,
    });
    if (res) {
      const operatorName = (
        <div style={{ margin: '4px 0' }}>
          {intl.get('spcm.costPayment.view.cusStep.operatorName').d('处理人')}：{res.operatorName}
        </div>
      );
      const operateDate = (
        <div style={{ margin: '4px 0' }}>
          {intl.get('spcm.costPayment.view.cusStep.operateDate').d('操作时间')}：{res.operateDate}
        </div>
      );
      const nodeStartDate = (
        <div style={{ margin: '4px 0' }}>
          {intl.get('spcm.costPayment.view.cusStep.nodeStartDate').d('当前节点开始时间')}：
          {res.nodeStartDate}
        </div>
      );
      const nodeEndDate = (
        <div style={{ margin: '4px 0' }}>
          {intl.get('spcm.costPayment.view.cusStep.nodeEndDate').d('当前节点结束时间')}：
          {res.nodeEndDate}
        </div>
      );
      const nodeAvgHandleTime = (
        <div style={{ margin: '4px 0' }}>
          {intl
            .get('spcm.costPayment.view.cusStep.nodeAvgHandleTime')
            .d('当前节点历史平均处理时间')}
          ：{res.nodeAvgHandleTime}
          {intl.get('spcm.costPayment.view.cusStep.dateSuffix').d('天')}
        </div>
      );
      const forecastDate = (
        <div style={{ margin: '4px 0' }}>
          {intl.get('spcm.costPayment.view.cusStep.forecastDate').d('当前节点预测完成日期')}
          <Tooltip
            title={intl
              .get('spcm.costPayment.view.forecastDate.tooltip')
              .d('当前节点开始时间+当前节点平均处理时长')}
            overlayClassName="customize-tooltip"
            color="#646A73"
            trigger="hover"
          >
            <img src={tipIcon} alt="tip" style={{ width: 15, height: 15, marginLeft: 4 }} />
          </Tooltip>
          ：{res.forecastDate}
        </div>
      );
      const avgHandlePayTime = (
        <div style={{ margin: '4px 0' }}>
          {intl
            .get('spcm.costPayment.view.cusStep.avgHandlePayTime')
            .d('待复核节点至付款平均处理时长')}
          ：{res.avgHandlePayTime}
          {intl.get('spcm.costPayment.view.cusStep.dateSuffix').d('天')}
        </div>
      );
      const forecastPayDate = (
        <div style={{ margin: '4px 0' }}>
          {intl.get('spcm.costPayment.view.cusStep.forecastPayDate').d('付款申请预测完成日期')}
          <Tooltip
            title={intl
              .get('spcm.costPayment.view.forecastPayDate.tooltip')
              .d('待复核节点开始时间+待复核节点至付款平均处理时长')}
            overlayClassName="customize-tooltip"
            color="#646A73"
            trigger="hover"
          >
            <img src={tipIcon} alt="tip" style={{ width: 15, height: 15, marginLeft: 4 }} />
          </Tooltip>
          ：{res.forecastPayDate}
        </div>
      );
      const paymentDate = (
        <div style={{ margin: '4px 0' }}>
          {intl.get('spcm.costPayment.view.cusStep.paymentDate').d('付款日期')}：
          {res.paymentDate ? moment(res.paymentDate).format('YYYY-MM-DD') : ''}
        </div>
      );

      const common = ['nodeStartDate', 'nodeEndDate', 'nodeAvgHandleTime', 'forecastDate'];
      let fieldArray = [];
      if (['DRAFT', 'DM_APPROVAL', 'GM_APPROVAL'].includes(nodeStatus)) {
        fieldArray = ['operatorName', 'operateDate', ...common];
      } else if (
        ['WITHHOLD_APPROVAL', 'FIN_FIRST_CHECK', 'DRAFT_ADD', 'FIN_SECOND_CHECK'].includes(
          nodeStatus
        )
      ) {
        fieldArray = [
          'operatorName',
          'operateDate',
          ...common,
          'avgHandlePayTime',
          'forecastPayDate',
        ];
      } else if (['01', '02', '03'].includes(nodeStatus)) {
        fieldArray = [...common, 'avgHandlePayTime', 'forecastPayDate'];
      } else if (['PAID'].includes(nodeStatus)) {
        fieldArray = ['paymentDate'];
      } else {
        fieldArray = common;
      }

      const data = (
        <div style={{ minWidth: 120 }}>
          {fieldArray.includes('operatorName') && operatorName}
          {fieldArray.includes('operateDate') && operateDate}
          {fieldArray.includes('nodeStartDate') && nodeStartDate}
          {fieldArray.includes('nodeEndDate') && nodeEndDate}
          {fieldArray.includes('nodeAvgHandleTime') && nodeAvgHandleTime}
          {fieldArray.includes('forecastDate') && forecastDate}
          {fieldArray.includes('avgHandlePayTime') && avgHandlePayTime}
          {fieldArray.includes('forecastPayDate') && forecastPayDate}
          {fieldArray.includes('paymentDate') && paymentDate}
        </div>
      );
      return data;
    } else {
      return false;
    }
  };

  render() {
    const { stepData, itemDetail, positionRight } = this.state;
    return (
      stepData.length > 0 && (
        <div className={styles.stepWrap}>
          <div className={styles.stepPanel}>
            {stepData.map((list, indexNum) => {
              // 生成图标
              let stepIcon = <div className={styles.stepIconWait}>{indexNum + 1}</div>;
              if (list.hasPassFlag === 'Y' && list.hasPccwFlag === 'N') {
                stepIcon = <div className={styles.stepIconAutoComplete} />;
              } else if (list.hasPassFlag === 'Y') {
                stepIcon = <div className={styles.stepIconComplete} />;
              } else if (list.nodeFlag === 'execution') {
                stepIcon = <div className={styles.stepIconExecution}>{indexNum + 1}</div>;
              }
              // 生成线段
              let stepLint;
              if (indexNum !== stepData.length - 1) {
                if (list.hasPassFlag === 'Y') {
                  stepLint = <div className={styles.stepLineComplete} />;
                } else {
                  stepLint = <div className={styles.stepLineWait} />;
                }
                if (list.nodeFlag === 'execution') {
                  stepLint = <div className={styles.stepLineWait} />;
                }
              }

              return (
                <>
                  <Popover
                    trigger={
                      list.hasPassFlag === 'Y' || list.haveChildFlag === 'Y'
                        ? 'hover'
                        : 'contextMenu'
                    }
                    placement={positionRight ? 'bottomRight' : 'bottomLeft'}
                    content={itemDetail[list.nodeStatus]}
                    overlayClassName={styles.cusPopover}
                  >
                    <div
                      className={styles.stepItem}
                      onMouseEnter={(e) => {
                        if (list.hasPassFlag === 'Y' || list.haveChildFlag === 'Y') {
                          this.handleClickItem(list, e.currentTarget, indexNum);
                        }
                      }}
                    >
                      {stepIcon}
                      <div className={styles.stepTitle}>{list.nodeName}</div>
                    </div>
                  </Popover>
                  {stepLint}
                </>
              );
            })}
          </div>
        </div>
      )
    );
  }
}
