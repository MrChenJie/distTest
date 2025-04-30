import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import { createPagination } from 'hzero-front/lib/utils/utils';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import FilterForm from './FilterForm';
import EmailReview from './EmailReview';
import { isEmpty } from 'lodash';

const { Panel } = Collapse;
const prompt = 'spfmhk.dict';
@formatterCollections({
  code: ['spfmhk.dict', 'hzero.common'],
})
@connect(({ loading, registerOfficialWebsiteModel }) => ({
  registerOfficialWebsiteModel,
  queryLoading: loading.effects['registerOfficialWebsiteModel/getRegisteTemplate'],
}))

@Form.create()
class SendEmail extends Component {
  constructor(props) {
    super(props);
    const { registId } = queryString.parse(location.search.substr(1));
    this.state = {
      activeKey: ['information', 'emailReview'],
      registId: registId,
      emailStatus: true, // 是否已经发送过邮件
      saveLoading: false,
      sendLoading: false,
    };
  }

  componentDidMount() {
    this.fetchEnum();
    this.handleQuery();
  }

  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'registerOfficialWebsiteModel/init',
    });
  }

  // 查询基本信息及邮件预览信息
  handleQuery = (code, registerRecordId) => {
    const { dispatch, form } = this.props;
    const { registId } = this.state;
    dispatch({
      type: 'registerOfficialWebsiteModel/getRegisteTemplate',
      payload: {
        registerRecordId: registerRecordId ? registerRecordId : registId,
        emailTemplate: code ? code : '',
      },
    }).then(res => {
      if (res) {
        // 查询基本信息及邮件预览信息
        dispatch({
          type: 'registerOfficialWebsiteModel/updateState',
          payload: {
            formData: res,
          },
        })
        this.setState({
          refuseId: res?.refuseRecordId,
          emailStatus: !res?.emailStatus ? true : res?.emailStatus === "draft",
        });
      }
    })
  }

  // 查询历史邮件记录
  getHistoryMail = (page = {}) => {
    const { dispatch } = this.props;
    const { registId } = this.state;
    dispatch({
      type: 'registerOfficialWebsiteModel/getRegisteHistoryEmail',
      payload: {
        registerRecordId: registId,
        page
      },
    }).then(res => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          emailId: uuidv4(),
        }));
        dispatch({
          type: 'registerOfficialWebsiteModel/updateState',
          payload: {
            emailDataSource: newDataSource,
            emailDataPagination: pagination,
          },
        })
      }
    })
  }

  // 查询邮件预览弹框内容
  getReviewMail = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'registerOfficialWebsiteModel/updateState',
      payload: {
        reviewData: record,
      },
    })
  }

  // 保存
  handleSave = (callback) => {
    const { dispatch, form } = this.props;
    const { refuseId, registId } = this.state;
    form.validateFields((err, values) => {
      if (!isEmpty(err)) {
        return;
      }
      if (typeof callback !== 'function') {
        this.setState({ saveLoading: true });
      }
      dispatch({
        type: 'registerOfficialWebsiteModel/saveRegisteInfo',
        payload: {
          refuseRecordId: refuseId, // 更新id(保存过的单据再次保存才传)
          registerRecordId: registId,
          ...form.getFieldsValue(),
        },
      }).then(res => {
        if (res && res.length > 0) {
          if (typeof callback === 'function') {
            callback(res[0]);
          } else {
            CusNotification.success({
              message: intl.get('hzero.common.notification.success.save').d('保存成功'),
            });
            // 保存成功之后重新查询一遍更新最新数据
            this.handleQuery();
            this.setState({ saveLoading: false });
          }
        } else {
          this.setState({ saveLoading: false, sendLoading: false });
        }
      }).catch(() => {
        this.setState({ saveLoading: false, sendLoading: false });
      })
    })
  }

  // 发送
  handleSend = () => {
    const { dispatch } = this.props;
    this.setState({ sendLoading: true });
    this.handleSave((res) => {
      if (res) {
        dispatch({
          type: 'registerOfficialWebsiteModel/sendRegisteEmail',
          payload: {
            refuseRecordId: res.refuseRecordId
          },
        }).then(result => {
          if (result) {
            CusNotification.success({
              message: intl.get(`${prompt}.view.field.sendsuccess`).d('发送成功'),
            });
            // 发送成功后更新编辑状态并获取最近发送时间
            dispatch({
              type: 'registerOfficialWebsiteModel/updateState',
              payload: {
                formData: result,
              },
            })
            this.setState({
              sendLoading: false,
              emailStatus: !result?.emailStatus ? true : result?.emailStatus === "draft",
            });
          } else {
            this.setState({ sendLoading: false });
          }
        }).catch(() => {
          this.setState({ sendLoading: false });
        })
      }
    })
  }

  // 切换邮件模板
  onChangeEmailTemplate = (code) => {
    this.handleQuery(code);
  }

  // 编辑发送邮件原因
  onChangeSendReason = (val) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ sendReason: val });
  }

  // 编辑邮件内容
  onEditEmail = (val) => {
    const { form: { setFieldsValue } } = this.props;
    setFieldsValue({ emailContent: val });
  }

  render() {
    const {
      queryLoading = false,
      registerOfficialWebsiteModel,
    } = this.props;
    const {
      enumMap,
      emailDataSource = [],
      emailDataPagination = {},
      formData = {},
      reviewData = {},
    } = registerOfficialWebsiteModel;
    const { activeKey, emailStatus, saveLoading, sendLoading } = this.state;
    const filterFormProps = {
      ...this.props,
      onRef: (ref) => {
        this.form = ref.form;
      },
      emailStatus,
      enumMap,
      formData,
      reviewData,
      onChangeEmailTemplate: this.onChangeEmailTemplate, // 切换邮件模板
    };
    const emailReviewProps = {
      ...this.props,
      emailStatus,
      onEditEmail: this.onEditEmail, // 编辑邮件内容
      onChangeSendReason: this.onChangeSendReason, // 编辑发送邮件原因
      formData,
      emailDataSource,
      emailDataPagination,
      reviewData,
      getHistoryMail: this.getHistoryMail, // 查询历史邮件记录
      getReviewMail: this.getReviewMail, // 查询邮件预览弹框内容
    };
    return (
      <>
        <PageWrapper loading={queryLoading}>
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
                  title={intl.get(`hzero.common.view.common.basicinformation`).d('基本信息')}
                  arrowActive={activeKey.includes('information')}
                />
              }
              key="information"
            >
              <FilterForm {...filterFormProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.back.emailpreview`).d('邮件预览')}
                  arrowActive={activeKey.includes('emailReview')}
                />
              }
              key="emailReview"
            >
              <EmailReview {...emailReviewProps} />
            </Panel>
          </Collapse>
          {emailStatus && (
            <footer
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '16px',
              }}
            >
              <CusButton onClick={this.handleSave} loading={saveLoading}>
                {intl.get(`hzero.common.view.button.save`).d('保存')}
              </CusButton>
              <CusButton type="primary" loading={sendLoading} onClick={this.handleSend}>
                {intl.get(`${prompt}.view.back.emailsend`).d('发送')}
              </CusButton>
            </footer>
          )}
        </PageWrapper>
      </>
    );
  }
}

export default SendEmail;