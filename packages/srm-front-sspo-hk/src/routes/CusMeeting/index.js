/**
 * @Description: 上会纪要
 * @date 2020-11-24
 * @author <luhaitao@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { Collapse } from 'antd';
import request from 'utils/request';
import uuidv4 from 'uuid/v4';
import { getEditTableData } from 'utils/utils';
import ProjectQaInfo from './projectQaInfo';
import BiddingRound from './biddingRound';
import notification from '_cus_components/CusNotification';
import dayjs from 'dayjs';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getCurrentOrganizationId,
  createPagination,
} from 'hzero-front/lib/utils/utils';
import { SRM_BID } from '@/common/config';
import intl from 'utils/intl';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import { closeWindow } from '_cus_utils/utils';


const ROW_KEY = 'qaId';
const { Panel } = Collapse;
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'sodr.purchaseOrder',
    'hzero.common'
  ],
})
@connect(({ loading, projectQaModels, contractMaintain }) => ({
  projectQaModels,
  contractMaintain,
  poHeaderInfo: projectQaModels.poHeaderInfo,
  poHeaderMilestonesInfo: projectQaModels.poHeaderMilestonesInfo,
  submitDecisionInfoLoading: loading.effects['contractMaintain/submitDecisionInfo'],
}))
@Form.create({ fieldNameProp: null })
class CusMeeting extends Component {
  constructor(props) {
    super(props);
    const {
      location,
    } = this.props;
    // 判断是否汇总页面跳转过来
    // const { isSummary = false } = state;
    this.state = {
      activeKey: [
        'form',
        'table',
      ],
      clarificationDataSource: [],
      clarificationPagination: {},
      //   groupUnsaveFlag: false
      milState: '',
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    this.init();
  }

  @Bind
  upData(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: data, // 头信息
        poHeaderMilestonesInfo: {},
      },
    });
    this.setState({
      clarificationDataSource: [],
    })

  }

  @Bind
  upChange(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        poHeaderInfo: data, // 头信息
        poHeaderMilestonesInfo: {},
      },
    });


  }

  @Bind
  init() {
    this.getPurchaseReply();
    this.queryProjectQaInfo();
    this.queryProjectQaMilestonesInfo();
  }

  /**
   * 查询基本头信息
   */
  @Bind
  queryProjectQaInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/queryProjectQaInfo',
      payload: {
        proId: match.params.proId,
      },
    }).then(res => {
      if (res) {
        const { dispatch } = this.props;
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            poHeaderInfo: res, // 头信息
          },
        });
      }
    });
  }

  /**
   * 查询轮次信息
   */
  @Bind
  queryProjectQaMilestonesInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/queryProjectQaMilestonesInfo',
      payload: {
        milestoneId: match.params.milestoneId,
      },
    }).then(res => {
      if (res) {
        // 初次未提交milestoneState应是返回undefined
        if (res.milestoneState !== undefined) {
          this.setState({ milState: res.milestoneState })
        } else {
          this.setState({ milState: '' })
        }
      }
    });
    dispatch({
      type: 'contractMaintain/fetchDetailEnum',
    });


  }

  // 获取CMI答复内容数据
  @Bind
  getPurchaseReply(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/fetchPurchaseReplyList',
      payload: {
        page,
        proId: match.params.proId,
        milestoneId: match.params.milestoneId,
        // type: 3, // 0 自己供应商提问/ 1 其他人提问/ 2 CMI主动澄清的内容/ 3 CMI回复/ 4 需求人答疑
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
        dispatch({
          type: 'projectQaModels/updateState',
          payload: {
            purchaseReplyDataSource: newDataSource,
            purchaseReplyPagination: pagination,
          },
        });
        this.setState({
          groupUnsaveFlag: false,
        });
      }
    });
  }

  @Bind
  onCollapseChange(value) {
    this.setState({
      activeKey: value,
    });
  }

  // 保存数据
  @Bind
  saveData(callback) {
    const { poHeaderInfo } = this.props;
    let poHeaderInfoNew = {...poHeaderInfo}
    const organizationId = getCurrentOrganizationId()
    this.props.form.validateFields({ force: true }, (err, values) => {
      poHeaderInfoNew.decisionType = values.decisionType
      poHeaderInfoNew.decisionMeetingDate = dayjs(values.decisionMeetingDate).format('YYYY-MM-DD HH:mm:ss')
      // poHeaderInfoNew.decisionDate = values.decisionDate
      console.log(values, 'value',poHeaderInfoNew)
    })
    if (
      poHeaderInfoNew.decisionType &&
      poHeaderInfoNew.decisionMeetingDate &&
      // poHeaderInfoNew.decisionDate &&
      poHeaderInfoNew.decisionFileUrls) {
      request(
        `${SRM_BID}/v1/${organizationId}/bid-pro-infos/saveProDecisionInfo`,
        {
          method: 'POST',
          body: [poHeaderInfoNew]
        }
      ).then((res) => {
        if (res) {
          if(typeof callback === 'function') {
            callback();
          } else {
            notification.success();
            this.queryProjectQaMilestonesInfo();
            this.queryProjectQaInfo();
          }
        }
      })
    } else {
      notification.error({
        message: intl.get(`bid.bidcommon.view.message.decisiontypebitian`).d('请填写决策类型、决策会议日期、决策会期、决策纪要必填项！')
      })
    }
  }

  // 提交数据
  @Bind
  submitData() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/submitDecisionInfo',
      payload: {
        proId: match.params.proId,
      }
    }).then((res) => {
      if(res) {
        notification.success();
        this.queryProjectQaMilestonesInfo();
        this.queryProjectQaInfo();
        window.close();
        // 飞书提交审批后关闭tag页
        closeWindow();
      }
    })
  }

  // 提交按钮
  @Debounce(500)
  @Bind
  handleSubmit() {
    this.saveData(() => {
      this.submitData()
    })
  }

  render() {
    const {
      form,
      location,
      projectQaModels: {
        code = {},
      },
      contractMaintain: { detailEnumMap = {} },
      poHeaderInfo,
      match,
      submitDecisionInfoLoading = false,
    } = this.props;
    const { activeKey, milState } = this.state;
    const projectQaInfoProps = {
      form,
      poHeaderInfo,
      code,
      flag: false,
      detailEnumMap,
      onSave: this.upData,
      onChange: this.upChange,
      milState,
    };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面

    return (
      <>
        <PageWrapper loading={submitDecisionInfoLoading}>
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
                  title={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <ProjectQaInfo {...projectQaInfoProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.meetingjiyao`).d('上会纪要')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >
              <BiddingRound {...projectQaInfoProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          <>
            {milState !== '' && milState !== 'published' && poHeaderInfo.decisionInfoState !== 'y' && <div>
              <CusButton type="primary" onClick={this.handleSubmit}>
                {intl.get('bid.bidcommon.view.button.submit').d('提交')}
              </CusButton>
              <CusButton onClick={this.saveData}>
                {intl.get('bid.bidcommon.view.button.save').d('保存')}
              </CusButton>
            </div>}
          </>
        </CusApprovalButtons>
      </>
    );
  }
}

export default CusMeeting;
