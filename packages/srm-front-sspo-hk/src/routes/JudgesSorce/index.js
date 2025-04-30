/**
 * index.js - 评委评分
 * @date: 2022-04-07
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Row, Col, Card, Tabs, Input, Form, LocaleProvider } from 'hzero-ui';
import { connect } from 'dva';

import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { 
  FORM_COL_2_LAYOUT,
} from 'utils/constants';
import { getCurrentLanguage } from 'hzero-front/lib/utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import TenderDocuments from '../JudgesSorce/TenderDocuments'; // 招标文件
import BiddingDocuments from '../JudgesSorce/BiddingDocuments'; // 招标文件
import PriceDocuments from '../JudgesSorce/PriceDocuments'; // 报价文件
import TechCAandQA from '../JudgesSorce/TechCAandQA'; // 技术澄清提问
import ContractMidlle from '../JudgesSorce/ContractMidlle'; // 商务应答表
import ContractMidlleJs from '../JudgesSorce/ContractMidlleJs'; // 技术应答表
import TechnicalScore from '../JudgesSorce/TechnicalScore'; // 技术评分表
import Comprehensive from '../JudgesSorce/Comprehensive'; // 符合性审查表
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

const { TabPane } = Tabs;

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  queryListLoading: loading.effects['contractJudgesSorce/unitsQueryLazyTree'],
  contractJudgesSorce,
}))
@formatterCollections({
  code: [ 'bid.milestonecommon', 'bid.bidcommon' ]
})
export default class JudgesSorce extends Component {
  constructor(props) {
    super(props);
    const { } = this.props;
    this.state = {
      dataSource: [],
      basicInfo: [],
      // packageName: '',
      purchaseType: '',
      fileFlag: 0,
      tabFlag: 0,
    };
  }

  componentDidMount() {
    this.fetchEnum(); // 查询值集
    this.getPackageName();
    this.getProjectInfo();
  }

  // 查询基本信息
  @Bind
  getProjectInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getProjectInfo',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res) {
        this.props.contractJudgesSorce.infoSource = res
      }
    })
  }

  /**
   * getPackageName - 根据跳转带过来的packageName拿到标包名称
   */
  @Bind()
  getPackageName() {
    const { match } = this.props;
    if (match.params.proId !== undefined) {
      this.setState({
        // packageName: match.params.packageName, 
        purchaseType: match.params.purchaseType
      })
    }
  }
  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesSorce/init',
    });
  }

  @Bind()
  changeFlag() {
    this.setState({
      upFlag: false
    })
  }

  @Bind()
  callback(key) {
    // if(key == 1){ // 招标文件
    //   this.setState({ fileFlag: 0 })
    // }
    // if(key == 2){ // 投标文件
    //   this.setState({ fileFlag: 1 })
    // }
    if (key == 4) { // 技术应答表
      this.setState({
        tabFlag: 0,
        upFlag: true
      })
    }
    if (key == 5) { // 商务应答表
      this.setState({
        upFlag: true,
        tabFlag: 1
      })
    }
  }

  render() {
    const {
      queryListLoading,
      contractJudgesSorce: { infoSource = [] },
      location: { state: { _back } = {} },
      match,
      form,
      enumMap
    } = this.props;
    const {
      fileFlag,
      tabFlag,
      upFlag,
      // packageName,
      purchaseType,
    } = this.state;
    const headerInfoFormProps = {
      match,
      enumMap,
      // jsFileFlag: fileFlag, //招标文件/投标文件表区分
      jsTableFlag: tabFlag, // 
      flag: upFlag,
      onChangeFlag: this.changeFlag,
      paStatus: infoSource.gradingState,
      basicInfo: infoSource,
      bidType: match.params.purchaseType,
    };
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    return (
      <Fragment>
        {/* <Header
          title={intl.get(`bid.bidcommon.view.title.expertscore`).d('评委评审')}
          backPath={`${isPub ? '/pub' : ''}/sspo/online-purchase/JudgesDashbord`}
        ></Header> */}
        <Content>
          <Card
            key="contractHeaderInformation"
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
              </h3>
            }
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                  {...FORM_COL_2_LAYOUT}
                >
                  <Input style={{ width: '70vw' }} disabled value={infoSource.packageName} />
                </Form.Item>
              </Col>
              {/* <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('entity.business.tag1').d('轮次')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input placeholder='第一轮' disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('entity.business.tag1').d('截止时间')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input placeholder='第一轮' disabled />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item style={{ display: 'flex' }}
                  label={intl.get('entity.business.tag1').d('递交投标时间')}
                  {...FORM_COL_3_LAYOUT}
                >
                  <Input placeholder='第一轮' disabled />
                </Form.Item>
              </Col> */}
            </Row>
          </Card>
          <Row gutter={24}>
            <Col span={24}>
              <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
                <Tabs defaultActiveKey="1" onChange={this.callback}>
                  <TabPane tab={intl.get(`bid.milestonecommon.view.title.biddingdocument`).d('招标文件')} key="1"><TenderDocuments {...headerInfoFormProps} /></TabPane>
                  <TabPane tab={intl.get(`bid.bidcommon.view.title.biddingdocumenttb`).d('投标文件')} key="2"><BiddingDocuments {...headerInfoFormProps} /></TabPane>
                  {purchaseType === 'single_source' && <TabPane tab={intl.get(`bid.milestonecommon.view.title.quotationdocument`).d('报价文件')} key="3"><PriceDocuments {...headerInfoFormProps} /></TabPane>}
                  {infoSource.isNeedAnswer == 0 && <TabPane tab={intl.get(`bid.bidcommon.view.title.jishubiao`).d('技术应答表')} key="4"><ContractMidlleJs {...headerInfoFormProps} /></TabPane>}
                  {infoSource.isNeedAnswerBusiness == 0 && <TabPane tab={intl.get(`bid.bidcommon.view.title.shangwubiao`).d('商务应答表')} key="5"><ContractMidlle {...headerInfoFormProps} /></TabPane>}
                  <TabPane tab={intl.get(`bid.bidcommon.view.title.tecclarifyquiz`).d('技术澄清提问')} key="6"><TechCAandQA {...headerInfoFormProps} /></TabPane>
                  {(purchaseType === 'invited_bidding' || purchaseType === 'public_bidding') && <TabPane tab={intl.get(`bid.bidcommon.view.title.techscoretab`).d('技术评分表')} key="7"><TechnicalScore {...headerInfoFormProps} /></TabPane>}
                  {(purchaseType !== 'invited_bidding' && purchaseType !== 'public_bidding') && <TabPane tab={intl.get(`bid.bidcommon.view.title.conformancetab`).d('符合性审查表')} key="8"><Comprehensive {...headerInfoFormProps} /></TabPane>}
                </Tabs>
              </LocaleProvider>
            </Col>
          </Row>
        </Content>
      </Fragment>
    );
  }
}
