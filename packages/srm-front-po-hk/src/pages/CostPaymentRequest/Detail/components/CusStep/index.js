import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import styles from './index.less';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import notification from 'utils/notification';
import { Spin, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import moment from 'moment';

async function queryPayProgressNodeDetail(params) {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/payment-progresss/queryPayProgressNodeDetail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

class Index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hoverItem: undefined, // 鼠标经过的节点
      onclickItem: undefined, // 点击的节点
      nodeDetail: '', // 节点详细信息
      loading: false,
    };
  }

  nodeLabels = {
    operatorName: intl.get('spcm.costPayment.view.cusStep.operatorName').d('处理人'),
    operateDate: intl.get('spcm.costPayment.view.cusStep.operateDate').d('操作时间'),
    nodeStartDate: intl.get('spcm.costPayment.view.cusStep.nodeStartDate').d('当前节点开始时间'),
    nodeEndDate: intl.get('spcm.costPayment.view.cusStep.nodeEndDate').d('当前节点结束时间'),
    nodeAvgHandleTime: intl
      .get('spcm.costPayment.view.cusStep.nodeAvgHandleTime')
      .d('当前节点历史平均处理时间'),
    forecastDate: intl.get('spcm.costPayment.view.cusStep.forecastDate').d('当前节点预测完成日期'),
    forecastDateTip: intl
      .get('spcm.costPayment.view.forecastDate.tooltip')
      .d('当前节点开始时间+当前节点平均处理时长'),
    avgHandlePayTime: intl
      .get('spcm.costPayment.view.cusStep.avgHandlePayTime')
      .d('待复核节点至付款平均处理时长'),
    forecastPayDate: intl
      .get('spcm.costPayment.view.cusStep.forecastPayDate')
      .d('付款申请预测完成日期'),
    forecastPayDateTip: intl
      .get('spcm.costPayment.view.forecastPayDate.tooltip')
      .d('待复核节点开始时间+待复核节点至付款平均处理时长'),
    paymentDate: intl.get('spcm.costPayment.view.cusStep.paymentDate').d('付款日期'),
    dateSuffix: intl.get('spcm.costPayment.view.cusStep.dateSuffix').d('天'),
  };

  /**
   * 每个节点需要显示的字段
   * @param nodeStatus
   * @returns {(string|string)[]}
   */
  @Bind
  nodeShowFields(nodeStatus) {
    const common = ['nodeStartDate', 'nodeEndDate', 'nodeAvgHandleTime', 'forecastDate'];
    switch (nodeStatus) {
      case 'DRAFT':
      case 'DM_APPROVAL':
      case 'GM_APPROVAL':
        return ['operatorName', 'operateDate', ...common];
      case 'WITHHOLD_APPROVAL':
      case 'FIN_FIRST_CHECK':
      case 'DRAFT_ADD':
      case 'FIN_SECOND_CHECK':
        return ['operatorName', 'operateDate', ...common, 'avgHandlePayTime', 'forecastPayDate'];
      case '01':
      case '02':
      case '03':
        return [...common, 'avgHandlePayTime', 'forecastPayDate'];
      case 'PAID':
        return ['paymentDate'];
      default:
        return [...common];
    }
  }

  /**
   * 判断当前节点: 经过节点，即hasPassFlag为Y的最后一个对象
   * @param data
   * @returns {{currentParentNode: *, currentChildNode}}
   */
  @Bind
  handleCurrentNode(data) {
    const parentData = data.filter((p) => p.hasPassFlag === 'Y');
    const currentParentData = parentData[parentData.length - 1];
    let currentChildNode = undefined;
    let currentParentNode;
    // 当前节点排除已支付
    if (currentParentData?.nodeStatus === 'PAID') {
      currentParentNode = undefined;
    } else {
      currentParentNode = currentParentData?.nodeStatus;
    }
    if (currentParentData?.haveChildFlag === 'Y') {
      const childData = currentParentData.childPaymentProgressStatusList.filter(
        (c) => c.hasPassFlag === 'Y'
      );
      const currentChildData = childData[childData.length - 1];
      currentChildNode = currentChildData?.nodeStatus;
    }
    this.setState({
      currentParentNode,
      currentChildNode,
    });
    return {
      currentParentNode,
      currentChildNode,
    };
  }

  @Bind
  handleNodeClick(e) {
    const { costRequestId, pressLevel } = this.props;
    const { currentParentNode, currentChildNode } = this.state;
    this.setState({ loading: true, onclickItem: e.id, nodeDetail: '' });
    queryPayProgressNodeDetail({
      requestId: costRequestId,
      costRequestType: 'COST_PAYMENT',
      nodeStatus: e.id,
      pressLevel,
    }).then((res) => {
      if (res) {
        if (res.failed) {
          this.setState({
            loading: false,
          });
          notification.warning({
            description: res.message,
          });
          return;
        }
        const { paymentDate } = res;
        let result = { ...res, paymentDate: paymentDate ? moment(paymentDate).format('YYYY-MM-DD') : undefined };
        if (currentChildNode) {
          if (currentChildNode === e.id) {
            result = { ...result, nodeEndDate: undefined }
          };
        } else if (currentParentNode === e.id) {
          result = { ...result, nodeEndDate: undefined }
        };
        const nodeDetail = this.nodeShowFields(e.id).map((item) => {
          if (item === 'forecastDate' || item === 'forecastPayDate') {
            return (
              <>
                {this.nodeLabels[item]}
                <Tooltip title={this.nodeLabels[item + 'Tip']}>
                  <Icon style={{ color: '#0085d0' }} type="help_outline" />
                </Tooltip>
                :&nbsp;{result[item] ? result[item] : ''}
                <br />
              </>
            );
          } else if (item === 'nodeAvgHandleTime' || item === 'avgHandlePayTime') {
            return (
              <>
                {this.nodeLabels[item]}:&nbsp;
                {result[item] || result[item] === 0 ? result[item] + this.nodeLabels['dateSuffix'] : ''}
                <br />
              </>
            );
          } else {
            return (
              <>
                {this.nodeLabels[item]}:&nbsp;
                {result[item] ? result[item] : ''}
                <br />
              </>
            );
          }
        });
        // 判断节点右边的位置是否小于350，若小于350，详细信息绝对定位right：0
        let positionRight = false;
        if (e.offsetParent.clientWidth - e.offsetLeft < 350) {
          positionRight = true;
        }
        this.setState({
          positionRight,
          nodeDetail,
          loading: false,
        });
      }
    });
  }

  render() {
    const {
      hoverItem,
      onclickItem,
      nodeDetail,
      loading = false,
      positionRight = false,
    } = this.state;
    const { data = [] } = this.props;
    const currentNode = this.handleCurrentNode(data);
    return (
      <div className={styles['cus-steps']}>
        {data.map((item, index) => {
          const isPassFlag =
            item.hasPassFlag === 'Y' && item.nodeStatus !== currentNode.currentParentNode;
          return (
            <div
              className={styles['cus-steps-item']}
              title={item.nodeName}
              id={`${item.nodeStatus}`}
              onMouseEnter={() => {
                this.setState({ hoverItem: item.nodeStatus });
              }}
              onMouseLeave={() => {
                this.setState({ hoverItem: undefined, onclickItem: undefined, nodeDetail: '' });
              }}
              onClick={(e) => {
                // 当有子节点或当前节点没经过时，不能查询详细信息
                if (item.haveChildFlag === 'Y' || item.hasPassFlag !== 'Y') return;
                this.handleNodeClick(e.currentTarget);
              }}
              style={{
                cursor:
                  item.haveChildFlag === 'Y' || item.hasPassFlag !== 'Y'
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              <div
                className={`${styles['cus-steps-item-icon']} ${
                  item.hasPassFlag === 'Y' && ['Y', null].includes(item.hasPccwFlag)
                    ? ''
                    : styles['cus-steps-item-wait']
                }`}
              >
                <span className={`${isPassFlag ? styles['cus-icon-check'] : styles['cus-icon']}`}>
                  {isPassFlag ? null : index + 1}
                </span>
              </div>
              <div className={styles['cus-steps-item-content-warp']}>
                <div className={styles['cus-steps-item-content']}>
                  <div className={styles['cus-steps-item-title']}>{item.nodeName}</div>
                </div>
              </div>
              <div style={{ height: '10px' }} />
              {/* 节点详细信息 */}
              {item.hasPassFlag === 'Y' &&
                item.haveChildFlag !== 'Y' &&
                onclickItem === item.nodeStatus && (
                  <>
                    <div
                      className={styles['item-detail']}
                      style={positionRight ? { right: '0' } : { left: '0' }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Spin spinning={loading} size="small">
                        {nodeDetail}
                      </Spin>
                    </div>
                  </>
                )}
              {/* 子节点 */}
              {item.haveChildFlag === 'Y' && (
                <div
                  className={styles['cus-steps-item-child']}
                  style={{ display: hoverItem === item.nodeStatus ? 'block' : 'none' }}
                >
                  {item.childPaymentProgressStatusList?.map((child, childIndex) => {
                    const isPassFlag =
                      child.hasPassFlag === 'Y' &&
                      child.nodeStatus !== currentNode.currentChildNode;
                    return (
                      <div
                        className={styles['child-wrap']}
                        id={child.nodeStatus}
                        onClick={(e) => {
                          // 当前节点未经过时，不响应
                          if (child.hasPassFlag !== 'Y') return;
                          this.handleNodeClick(e.currentTarget);
                        }}
                        style={{ cursor: child.hasPassFlag !== 'Y' ? 'not-allowed' : 'pointer' }}
                      >
                        <div
                          className={`${styles['cus-steps-item-icon']} ${
                            child.hasPassFlag === 'Y' ? '' : styles['cus-steps-item-wait']
                          }`}
                        >
                          <span
                            className={`${
                              isPassFlag ? styles['cus-icon-check'] : styles['cus-icon']
                            }`}
                          >
                            {isPassFlag ? null : `${index + 1}.${childIndex + 1}`}
                          </span>
                        </div>
                        <div className={styles['child-title']}>{child.nodeName}</div>
                        {/* 节点详细信息 */}
                        {child.hasPassFlag === 'Y' && onclickItem === child.nodeStatus && (
                          <>
                            <div className={styles['child-detail-bridge']} />
                            <div className={styles['child-detail-caret-down']} />
                            <div
                              className={styles['child-detail']}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Spin spinning={loading} size="small">
                                {nodeDetail}
                              </Spin>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

export default Index;
