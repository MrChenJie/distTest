import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import queryString from 'querystring';
import BasicData from './BasicData';
import LegalData from './LegalData';
import ContactTable from './ContactListTable';
import CustomerTable from './CustomerTable';
import FinancialTable from './FinancialTable';
import AttachmentTable from './AttachmentTable';
import ProjectListTable from './ProjectListTable';
import ScoreTable from './ScoreTable';

const { Panel } = Collapse;
const commonPrompt = 'spfmhk.dict';

@Form.create()
@formatterCollections({ code: [commonPrompt] })
@fastCodeLoader([
  'DICT.QUESTION_REPLY_STATUS',
  'DICT.QUESTION_TYPE',
  'HKSP.COMPANY_TYPE',
  'HKSP.PERSONNEL_COMMUNICATING',
  'HPFM.COUNTRY',
  'HPFM.CURRENCY',
  'HKSP.COMPANY_TYPE',
  'HKSP.COMPANY_CATEG',
  'HKSP.BUSINESS_NATURE',
  'HKSP.SUP_PROD_CATEGORY',
  'HKSP.DELI_TERMS',
  'HKSP.CREDIT_PERIOD',
  'HKSP.PAYMENT_METHOD',
  'LINK.PART_MODE',
  'DICT.MODE_NOTICE',
  'HKSP.CONTACT_TYPE',
  'DICT.REVIEW_APPLICATION_STATUS',
  'LINK.PARTNER_CATEGORY',
  'DICT.PARTNER_FILE_TYPE',
  'DICT.START_APPRAISAL_WAY',
  'DICT.SCORE_ITEM',
])
@connect(({ loading, partnerReview }) => ({
  partnerReview,
  partnerInfo: partnerReview?.partnerInfo,
  queryLoading:
    loading.effects['partnerReview/getPartnerInfo'] ||
    loading.effects['partnerReview/getContactInfo'] ||
    loading.effects['partnerReview/getCustomersInfo'] ||
    loading.effects['partnerReview/getFinancialInfo'] ||
    loading.effects['partnerReview/getAttachmentInfo'] ||
    loading.effects['partnerReview/getProjectInfo'] ||
    loading.effects['partnerReview/getScoreInfo'] ||
    loading.effects['partnerReview/getJudgePartnerInfo'],
  saveLoading: loading.effects['partnerReview/saveScoreInfo'],
  contactList: partnerReview?.contactList,
  customerList: partnerReview?.customerList,
  financialList: partnerReview?.financialList,
  attachmentList: partnerReview?.attachmentList,
  projectList: partnerReview?.projectList,
  scoreList: partnerReview?.scoreList,
}))
class PartnerReview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: [
        'basicData',
        'contactTable',
        'legalData',
        'customerTable',
        'financialTable',
        'attachmentTable',
        'projectListTable',
        'scoreTable',
      ],
      selectedRowKeys: [],
      selectedRows: [],
      type: '',
      isReturn: false, // 是否是回退节点
      isNodeOne: false, // 是否是资格评审
      isNodeTwo: false, // 是否是技术评审
      isDetail: false,
      partnerId: '',
      isDone: false, // 是否已办
      techAssessor: '',
      isManager: false, // 是否管理员节点
      qualifyAssessor: '',
    };
  }

  componentDidMount() {
    this.getPartnerInfo();
  }

  // 获取基本信息
  getPartnerInfo() {
    const { location, dispatch } = this.props;
    const { search = '' } = location;
    const { formRecordId, state, permissionType, partnerId, type } = queryString.parse(
      search.substring(1),
    );
    this.setState({
      isDetail: type === 'detail',
      isReturn: state === 'PENDING' && (permissionType === 'SEND' || permissionType === 'JOINTLY'),
      partnerId: partnerId || formRecordId,
      isDone: ['SENT', 'DONE', 'REVOKE'].includes(state),
    });
    dispatch({
      type: 'partnerReview/getPartnerInfo',
      payload: {
        partnerId: partnerId || formRecordId,
      },
    });
    dispatch({
      type: 'partnerReview/getJudgePartnerInfo',
      payload: {
        partnerId: partnerId || formRecordId,
      },
    }).then((res) => {
      this.setState({
        isManager: res?.activityCode === 'DICTmanager',
        isNodeOne: res.judgeType === 'qualify',
        isNodeTwo: res.judgeType === 'tech',
        techAssessor: res.techAssessor,
        qualifyAssessor: res.qualifyAssessor,
      });
      if (res.judgeType === 'tech') {
        this.getInfo();
      }
    });
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 提交 保存 退回 会签 注销 查看流程
        if (['SUBMIT', 'GIVE', 'BACK'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            console.log(params, '===params===');
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
                e.data.url,
              );
            }
          }, 'submit');
        } else if (['DRAFT_HANDLE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            console.log(params, '===params===');
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
                e.data.url,
              );
            }
          }, 'save');
        } else {
          this.handleSave((params) => {
            console.log(params, '===params===');
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
                e.data.url,
              );
            }
          });
        }
      }
    });
  }

  // 格式化数字
  formatNumber(value,maxValue) {
    let num = parseFloat(value);
    if (isNaN(num)) {
      return null;
    }
    num = Math.round(num);
    num = Math.max(0, Math.min(num, maxValue));
    return num;
  }

  // 保存&&提交列表
  handleSave = (callback, type) => {
    const { dispatch, scoreList, partnerInfo } = this.props;
    const { isNodeOne, techAssessor, partnerId, isManager, qualifyAssessor } = this.state;
    if (this.scoreForm) {
      this.scoreForm.validateFields((err) => {
        scoreList.forEach((item) => {
          item.score = this.formatNumber(item.score,Number(item.scoreValue.split('-')[1]));
        });
        if (!err) {
          dispatch({
            type: type === 'save' ? 'partnerReview/saveScoreInfo' : 'partnerReview/submitScoreInfo',
            payload: {
              data: scoreList,
              partnerId,
            },
          }).then((res) => {
            console.log('待办标题：', intl.get('hzero.common.title.register.management.process').d('报名审批流程') + '：' + partnerInfo.cmpanyName);
            this.getInfo();
            if (typeof callback === 'function') {
              callback({
                ...res,
                formRecordId: res[0].partnerId,
                affairTitle: intl.get('hzero.common.title.register.management.process').d('报名审批流程') + '：' + partnerInfo.cmpanyName,
              });
            }
          });
        }
      });
    } else {
      if (typeof callback === 'function') {
        console.log('待办标题：', intl.get('hzero.common.title.register.management.process').d('报名审批流程') + '：' + partnerInfo.cmpanyName);
        let params = {
          formRecordId: this.state.partnerId,
          affairTitle: intl.get('hzero.common.title.register.management.process').d('报名审批流程') + '：' + partnerInfo.cmpanyName,
        };
        if(isManager) {
          params = {
            ...params,
            QuanAssessor: qualifyAssessor,
          }
        } else if (isNodeOne) {
          params = {
            ...params,
            TechAssessor: techAssessor,
          };
        }
        callback({
          ...params,
        });
      }
    }
  };

  // 跳转发送邮件页面
  handleMail = () => {
    const { location } = this.props;
    const { search = '' } = location;
    const { formRecordId, partnerId } = queryString.parse(search?.substring(1));

    window.open(`/pub/dict/reviewReturn?partnerId=${partnerId || formRecordId}`, '_blank');
  };

  // 获取评分列表
  getInfo() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId, partnerId } = queryString.parse(search?.substring(1));
    dispatch({
      type: 'partnerReview/getScoreInfo',
      payload: {
        partnerId: partnerId || formRecordId,
      },
    });
  }

  render() {
    const {
      queryLoading = false,
      idpValueMap = {},
      form,
      partnerInfo,
      saveLoading,
      partnerReview: { scoreList = [] },
    } = this.props;

    const { activeKey, type, isReturn, isNodeOne, isNodeTwo, isDetail, isDone } = this.state;

    const filterFormProps = {
      idpValueMap,
      partnerInfo,
      loading: queryLoading,
    };
    const rowSelection = {
      getCheckboxProps: () => ({
        disabled: true, // 选择框的是否可选
      }),
    };
    const listTableProps = {
      ...this.props,
      rowSelection,
      idpValueMap,
      loading: queryLoading,
    };
    const scoreProps = {
      ...this.props,
      idpValueMap,
      loading: queryLoading,
      form,
      onRef: (node) => {
        this.scoreList = node;
        this.scoreForm = node.props.form;
      },
      isDone,
      scoreList,
    };
    return (
      <PageWrapper loading={queryLoading}>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          {!isDetail && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${commonPrompt}.view.field.common.basicinfo`).d('基础信息')}
                  arrowActive={activeKey.includes('basicData')}
                />
              }
              key="basicData"
            >
              <BasicData {...filterFormProps} />
            </Panel>
          )}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${commonPrompt}.view.common.basicinformation`).d('基本信息')}
                arrowActive={activeKey.includes('legalData')}
              />
            }
            key="legalData"
          >
            <LegalData {...filterFormProps} />
          </Panel>
          {(
            <>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`${commonPrompt}.view.field.portalcontactinfo`).d('联系人信息')}
                    arrowActive={activeKey.includes('contactTable')}
                  />
                }
                key="contactTable"
              >
                <ContactTable {...listTableProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`${commonPrompt}.view.common.clientinformation`).d('客户信息')}
                    arrowActive={activeKey.includes('customerTable')}
                  />
                }
                key="customerTable"
              >
                <CustomerTable {...listTableProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl
                      .get(`${commonPrompt}.view.field.portalfinacncecondition`)
                      .d('财务条件')}
                    arrowActive={activeKey.includes('financialTable')}
                  />
                }
                key="financialTable"
              >
                <FinancialTable {...listTableProps} />
              </Panel>
            </>
          )}
          {(
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl
                    .get(`${commonPrompt}.view.field.portalfinacncepex`)
                    .d('信息化项目经验')}
                  arrowActive={activeKey.includes('projectListTable')}
                />
              }
              key="projectListTable"
            >
              <ProjectListTable {...listTableProps} />
            </Panel>
          )}
          {isNodeTwo && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${commonPrompt}.view.field.tech.judgescore`).d('评委评分')}
                  arrowActive={activeKey.includes('scoreTable')}
                />
              }
              key="scoreTable"
            >
              <ScoreTable {...scoreProps} />
            </Panel>
          )}
          {(
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${commonPrompt}.view.common.companyattachments`).d('公司附件')}
                  arrowActive={activeKey.includes('attachmentTable')}
                />
              }
              key="attachmentTable"
            >
              <AttachmentTable {...listTableProps} />
            </Panel>
          )}
        </Collapse>
        {/*<CusButton onClick={this.handleSave}>11</CusButton>*/}
        {
          <footer
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            {/* <CusButton onClick={this.handleSave} loading={saveLoading}>
              {intl.get(`hzero.common.view.button.save`).d('保存')}
            </CusButton> */}
            {isReturn && (
              <CusButton onClick={this.handleMail} loading={saveLoading} type="primary">
                {intl.get(`${commonPrompt}.view.selectjudge.sendemail`).d('发送门户/邮件')}
              </CusButton>
            )}
          </footer>
        }
      </PageWrapper>
    );
  }
}

export default PartnerReview;
