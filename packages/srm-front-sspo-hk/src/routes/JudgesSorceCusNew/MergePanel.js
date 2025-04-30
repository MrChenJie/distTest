/**CusCollapse
 * index.js - 评委评分合并的panel样式
 * @date: 2023-09-21
 * @author: xushuming <shuming.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2023, Hand
 */
import React from 'react';
import { Form, Collapse } from 'antd';
import CusButton from '_cus_components/CusButton';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusSelect from '_cus_components/CusSelect';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterForm from './FilterForm'; // 基本信息
import TenderDocuments from './TenderDocuments'; // 招标文件
import BiddingDocuments from './BiddingDocuments'; // 投标文件
import PriceDocuments from './PriceDocuments'; // 报价文件
import TechCAandQA from './TechCAandQA'; // 技术澄清提问
import ContractMidlle from './ContractMidlle'; // 商务应答表
import ContractMidlleJs from './ContractMidlleJs'; // 技术应答表
import Comprehensive from './Comprehensive'; // 符合性审查表-初审
import ComprehensiveFirst from './ComprehensiveFirst'; // 符合性审查表（初评阶段）
import styles from './index.less';

const { Panel } = Collapse;
const prompt = 'bid.bidcommon';
const milcommon = 'bid.milestonecommon';

@formatterCollections({
  code: [
    'hzero.common',
    'bid.bidcommon',
    'bid.biddashbord',
    'bid.milestonecommon',
  ]
})
export default class MergePanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: [
        'contractHeaderInformation',
        'tenderDocuments',
        'biddingDocuments',
        'priceDocuments',
        'contractMidlleJs',
        'contractMidlle',
        'techCAandQA',
        'comprehensive',
        'comprehensiveFirst',
      ],
      showButtonDocumenttb: true,
      showButtonDocument: true,
      showButtonPrice: true,
      showButtonMidlleJs: true,
      showButtonMidlle: true,
    };
  }

  // 切换投标文件轮次
  handleChangeFormItem = (stateMilestoneId) => {
    const { getMilestones = (e) => e } = this.props;
    this.setState({ biddingMilestoneId: stateMilestoneId })
    getMilestones(stateMilestoneId);
  }

  // 切换报价文件轮次
  handleChangePriceRound = (stateMilestoneId) => {
    const { getPriceMilestones = (e) => e } = this.props;
    this.setState({ priceMilestoneId: stateMilestoneId })
    getPriceMilestones(stateMilestoneId);
  }

  // 切换技术应答表轮次
  handleChangeMidlleJs = (milestoneId) => {
    const { getMidlleJs = (e) => e } = this.props;
    getMidlleJs(milestoneId);
  }

  // 切换商务应答表轮次
  handleChangeMidlle = (milestoneId) => {
    const { getMidlle = (e) => e } = this.props;
    getMidlle(milestoneId);
  }

  render() {
    const {
      match,
      contractJudgesCusSorce: {
        infoSource,
        milestonesTb,
        milestonesBj,
        answerMilestonesJs,
        answerMilestones,
        myMilestones,
      },
      paStating,
      milestoneId,
      milestoneEndTime,
      milestoneStartTime,
      milestoneState,
      milestonesEnd, // 澄清提问表-是否已提交
      milstonesInfo,
      isSubmit, // 初评
      submitState, // 技术评分表-是否已经提交
      trialResultSubmit, // 初审
      applicationList,
      applicationPagination,
      biddingMilestoneId,
      priceMilestoneId,
      fetchCAandQAList = (e) => e, // 查询自己的技术澄清提问
      sureDeleteCAandQA = (e) => e,
      handleAddQusetionLine = (e) => e,
      deleteNewRows = (e) => e,
      deleteExistRows = (e) => e,
      fetchOtherList = (e) => e,
      fetchScoreTable = (e) => e, // 查询技术评分表
      fetchCompliance = (e) => e, // 查询符合性审查表(初评阶段)
      getPassFrame = (e) => e, // 查询技术符合审查表信息(初审)
      queryListLoading, // 基本信息loading
      getTenderListLoading, // 查询招标文件loading
      getDiddingListLoading, // 查询投标文件loading
      getPriceFileListLoading, // 查询报价文件loading
      getAnswerListJsLoading,  // 技术应答表loading
      getAnswerListLoading, // 商务应答表loading
      mySourceLoading, // 查询评委自己提出的问题loading
      otherSourceLoading, // 查询其他评委提出的问题loading
      complianceLoading, // 查询符合性审查表loading
      judgesSorceList, // 技术评分表Loading
      changeRoundCAandQA = (e) => e, // 切换技术商务澄清轮次
      present,
      getMilestones = (e) => e,
      getPriceMilestones = (e) => e,
      downLoadAll = (e) => e,
    } = this.props;
    const {
      activeKey,
      showButtonDocumenttb,
      showButtonDocument,
      showButtonPrice,
      showButtonMidlleJs,
      showButtonMidlle,
    } = this.state;
    // 基本信息
    const filterFormProps = {
      ...this.props,
      onRef: (ref) => {
        this.filterForm = ref.filterForm;
      },
      bidType: match.params.purchaseType,
    }
    const headerInfoFormProps = {
      ...this.props,
      paStating,
      basicInfo: infoSource,
      bidType: match.params.purchaseType,
      applicationList,
      applicationPagination,
      fetchCAandQAList,
      deleteCAandQA: sureDeleteCAandQA,
      handleAddQusetionLine,
      deleteNewRows,
      deleteExistRows,
      fetchOtherList,
      fetchScoreTable,
      fetchCompliance,
      getPassFrame,
      milestoneId,
      milestoneEndTime,
      milestoneStartTime,
      milestoneState,
      milestonesEnd, // 澄清提问表-是否已提交
      milstonesInfo,
      isSubmit, // 初评
      submitState, // 技术评分表-是否已经提交
      trialResultSubmit, // 初审
      onRef: (ref) => {
        this.tbAndBjForm = ref.tbAndBjForm;
        this.compreForm = ref.compreForm;
        this.compreFormFirst = ref.compreFormFirst;
        this.contractForm = ref.contractForm;
        this.caAndQaForm = ref.caAndQaForm;
        this.scoreForm = ref.scoreForm;
      },
      getPriceMilestones: getPriceMilestones, // 查询报价文件
      getMilestones: getMilestones, // 查询投标文件
      biddingMilestoneId,
      priceMilestoneId,
      changeRoundCAandQA,
    };
    let newLanguage = '';
    if (['single_source', 'internal_source', 'public_negotiation', 'invite_negotiation'].includes(match.params.purchaseType)) {
      newLanguage = intl.get(`bid.milestonecommon.view.title.negotiationdocument`).d('谈判文件');
    } else if (['public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(match.params.purchaseType)) {
      newLanguage = intl.get(`bid.milestonecommon.view.title.inquirydocument`).d('询价文件');
    } else {
      newLanguage = intl.get(`${prompt}.view.title.documentcategorynew`).d('比选文件');
    }
    return (
      <PageWrapper loading={
        queryListLoading ||
        getTenderListLoading ||
        // getDiddingListLoading ||
        // getPriceFileListLoading ||
        getAnswerListJsLoading ||
        getAnswerListLoading ||
        mySourceLoading ||
        otherSourceLoading ||
        complianceLoading
      }>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({
              activeKey: collapseKeys,
              showButtonDocumenttb: collapseKeys.includes('biddingDocuments'),
              showButtonDocument: collapseKeys.includes('tenderDocuments'),
              showButtonPrice: collapseKeys.includes('priceDocuments'),
              showButtonMidlleJs: collapseKeys.includes('contractMidlleJs'),
              showButtonMidlle: collapseKeys.includes('contractMidlle'),
            });
          }}
        >
          <Panel
            key="contractHeaderInformation"
            showArrow={false}
            data-border={false}
          >
            <FilterForm {...filterFormProps} />
          </Panel>
          {/* <Panel
            key="tenderDocuments"
            showArrow={false}
            data-border={false}
            header={
              <PanelHeader
                title={infoSource.proInfoWording ? intl.get(`${milcommon}.view.title.biddingdocument`).d('招标文件') : newLanguage}
                arrowActive={activeKey.includes('tenderDocuments')}
                // verticalLine={false}
                buttons={
                showButtonDocument && <>
                  <CusButton onClick={(e) => downLoadAll(e)}>
                    {intl.get(`bid.bidcommon.view.button.downloadall`).d('全部下载')}
                  </CusButton>
                </>
                }
              />
            }
          >
            <TenderDocuments {...headerInfoFormProps} />
          </Panel> */}
          <Panel
            key="biddingDocuments"
            showArrow={false}
            data-border={false}
            header={
              <PanelHeader
                title={infoSource.proInfoWording ?
                  intl.get(`${prompt}.view.title.biddingdocumenttb`).d('投标文件')
                  : intl.get(`${prompt}.view.title.biddingdocumenttbnew`).d('应答文件')
                }
                arrowActive={activeKey.includes('biddingDocuments')}
                // verticalLine={false}
                buttons={
                  showButtonDocumenttb && <>
                    <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                    <Form className={styles.roundForm}>
                      {milestonesTb.length > 0 &&
                        <Form.Item name='tbRound' initialValue={milestonesTb[0]?.value} >
                          <CusSelect style={{ width: 80 }}
                            options={milestonesTb}
                            onChange={(e) => this.handleChangeFormItem(e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Form.Item>
                      }
                    </Form>
                  </>
                }
              />
            }
          >
            <BiddingDocuments {...headerInfoFormProps} onRef={ref => (this.tbAndBjRef = ref)} />
          </Panel>
          {['single_source', 'internal_source'].includes(match.params.purchaseType) && <Panel
            showArrow={false}
            data-border={false}
            header={
              <PanelHeader
                title={intl.get(`${milcommon}.view.title.quotationdocument`).d('报价文件')}
                arrowActive={activeKey.includes('priceDocuments')}
                // verticalLine={false}
                buttons={
                  showButtonPrice && <>
                    <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                    <Form className={styles.roundForm}>
                      {milestonesBj.length > 0 &&
                        <Form.Item name='bjRound' initialValue={milestonesBj[0]?.value} >
                          <CusSelect style={{ width: 80 }}
                            options={milestonesBj}
                            onChange={(e) => this.handleChangePriceRound(e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Form.Item>
                      }
                    </Form>
                  </>
                }
              />
            }
            key="priceDocuments"
          >
            <PriceDocuments {...headerInfoFormProps} onRef={ref => (this.tbAndBjRef = ref)} />
          </Panel>}
          {infoSource.isNeedAnswer == 0 && <Panel
            showArrow={false}
            data-border={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.jishubiao`).d('技术应答表')}
                arrowActive={activeKey.includes('contractMidlleJs')}
                // verticalLine={false}
                buttons={
                  showButtonMidlleJs && <>
                    <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                    <Form className={styles.roundForm}>
                      {answerMilestonesJs.length > 0 &&
                        <Form.Item name='tbRound' initialValue={answerMilestonesJs[0]?.value} >
                          <CusSelect style={{ width: 80 }}
                            options={answerMilestonesJs}
                            onChange={(e) => this.handleChangeMidlleJs(e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Form.Item>
                      }
                    </Form>
                  </>
                }
              />
            }
            key="contractMidlleJs"
          >
            <ContractMidlleJs {...headerInfoFormProps} onRef={ref => (this.contractFormRef = ref)} />
          </Panel>}
          {infoSource.isNeedAnswerBusiness == 0 && <Panel
            showArrow={false}
            data-border={false}
            className={styles['panelHeader']}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.shangwubiao`).d('商务应答表')}
                arrowActive={activeKey.includes('contractMidlle')}
                // verticalLine={false}
                buttons={
                  showButtonMidlle && <>
                    <span className={styles['font-span']}>{intl.get(`bid.bidcommon.view.title.round`).d('轮次')}</span>
                    <Form className={styles.roundForm}>
                      {answerMilestones.length > 0 &&
                        <Form.Item name='tbRound' initialValue={answerMilestones[0]?.value} >
                          <CusSelect style={{ width: 80 }}
                            options={answerMilestones}
                            onChange={(e) => this.handleChangeMidlle(e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Form.Item>
                      }
                    </Form>
                  </>
                }
              />
            }
            key="contractMidlle"
          >
            <ContractMidlle {...headerInfoFormProps} onRef={ref => (this.contractFormRef = ref)} />
          </Panel>}
          {/* milestonesEnd已完成,且当前阶段是002||003显示在基本信息中  */}
          {milestonesEnd && (present === '002' || present === '003' || present === '004') &&
            <Panel
              showArrow={false}
              data-border={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.tecclarifyquiz`).d('技术澄清提问')}
                  arrowActive={activeKey.includes('techCAandQA')}
                  // verticalLine={false}
                />
              }
              key="techCAandQA"
            >
              <TechCAandQA {...headerInfoFormProps} onRef={ref => (this.caAndQaRef = ref)} />
            </Panel>
          }
          {/* trialResultSubmit已完成,且当前阶段是003显示在基本信息中  */}
          {(!(['public_inquiry', 'invitation_inquiry'].includes(match.params.purchaseType))) && (trialResultSubmit && present === '003' && (match.params.purchaseType !== 'single_source' && match.params.purchaseType !== 'internal_source')) &&
            <Panel
              showArrow={false}
              data-border={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.PreliminaryReview`).d('符合性审查表(初评阶段)')}
                  arrowActive={activeKey.includes('comprehensive')}
                  // verticalLine={false}
                />
              }
              key="comprehensive"
            >
              <Comprehensive {...headerInfoFormProps} onRef={ref => (this.compreRef = ref)} />
            </Panel>
          }
          {/* 单一来源：若开启了第二段技术商务澄清004，初评就显示在基本信息并折叠 */}
          {isSubmit && present === '004' && ['single_source', 'internal_source'].includes(match.params.purchaseType) &&
            <Panel
              showArrow={false}
              data-border={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.conformancetab`).d('符合性审查表（最终评审）')}
                  arrowActive={activeKey.includes('comprehensiveFirst')}
                />
              }
              key="comprehensiveFirst"
            >
              <ComprehensiveFirst {...headerInfoFormProps} onRef={ref => (this.compreRefFirst = ref)} />
            </Panel>
          }
        </Collapse>
      </PageWrapper>
    );
  }
}