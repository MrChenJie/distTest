import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import BasicData from './BasicData';
import MailEdit from './MailEdit';
import notification from 'utils/notification';
import queryString from 'querystring';

const { Panel } = Collapse;

const commonPrompt = 'spfmhk.dict';

@formatterCollections({ code: ['spfmhk.dict'] })
@fastCodeLoader(['DICT.REFUSE_PARTNER_EMAIL'])
@connect(({ loading, partnerReview }) => ({
  partnerReview,
  partnerInfo: partnerReview?.partnerInfo,
  mailInfo: partnerReview?.mailInfo,
  queryLoading: loading.effects['partnerReview/getRefuseEmail'],
  saveLoading:
    loading.effects['partnerReview/saveRefuseRmail'] ||
    loading.effects['partnerReview/sendRefuseRmail'],
}))
class ReturnMail extends Component {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const { search = '' } = location;
    const { formRecordId, partnerId } = queryString.parse(search?.substring(1));
    this.state = {
      activeKey: ['basicData', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      isEdit: true,
      partnerId: formRecordId || partnerId,
      isModelSelected: false,
      isEdit: true,
    };
  }

  componentDidMount() {
    this.setMailModel();
  }

  // 保存列表
  handleSave = (type) => {
    this.basicForm.validateFieldsAndScroll((basicErr) => {
      if (!basicErr) {
        this.mailForm.validateFieldsAndScroll((mailErr) => {
          if (!mailErr) {
            const { dispatch, mailInfo } = this.props;
            const basicData = this.basicForm.getFieldsValue();
            const mailData = this.mailForm.getFieldsValue();
            let params = {
              ...basicData,
              ...mailData,
              partnerId: mailInfo.partnerId,
            };
            if (mailInfo.refuseRecordId) {
              params.refuseRecordId = mailInfo.refuseRecordId;
            }

            dispatch({
              type: 'partnerReview/saveRefuseRmail',
              payload: [params],
            }).then((res) => {
              if (type === 'save') {
                if (res) {
                  notification.success({
                    message: intl.get('hzero.common.notification.success.save').d('保存成功'),
                  });
                }
              } else {
                dispatch({
                  type: 'partnerReview/sendRefuseRmail',
                  payload: {
                    refuseRecordId: res[0].refuseRecordId,
                  },
                }).then((res) => {
                  if (res) {
                    notification.success({
                      message: intl.get(`hzero.common.notification.success`).d('操作成功'),
                    });
                    this.setMailModel();
                    window.close();
                  }
                });
              }
            });
          }
        });
      }
    });
  };

  // 选择模板
  @Bind()
  setMailModel(code = null) {
    const { dispatch } = this.props;
    const { partnerId } = this.state;
    dispatch({
      type: 'partnerReview/getRefuseEmail',
      payload: {
        partnerId,
        emailTemplate: code,
      },
    }).then((res) => {
      this.mailForm?.setFieldsValue({
        emailSubjuct: res.emailSubjuct,
        emailContent: res.emailContent,
        sendTo: res.sendTo,
      });
      this.setState({
        isEdit: res.emailStatus === 'draft' || !res.emailStatus,
        isModelSelected: code || res.emailTemplate ? true : false,
      });
      dispatch({
        type: 'partnerReview/updateState',
        payload: {
          mailInfo: res,
        },
      });
    });
  }

  render() {
    const {
      queryLoading = false,
      idpValueMap = {},

      saveLoading,
      mailInfo = {},
    } = this.props;
    const { activeKey, isModelSelected, isEdit } = this.state;
    const basicFormProps = {
      idpValueMap,
      onRef: (node) => {
        this.basicForm = node.props.form;
        this.basic = node;
      },

      mailInfo,
      loading: queryLoading,
      isEdit,
      setMailModel: this.setMailModel,
    };

    const mailProps = {
      idpValueMap,

      mailInfo,
      loading: queryLoading,
      isModelSelected,
      isEdit,
      onRef: (node) => {
        this.mailForm = node.props.form;
        this.mail = node;
      },
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
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`hzero.common.srsp.region.basicInformation`).d('基本信息')}
                arrowActive={activeKey.includes('basicData')}
              />
            }
            key="basicData"
          >
            <BasicData {...basicFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`${commonPrompt}.view.back.emailpreview`).d('邮件预览')}
                arrowActive={activeKey.includes('table')}
              />
            }
            key="table"
          >
            <MailEdit {...mailProps} />
          </Panel>
        </Collapse>
        {isEdit && (
          <footer
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            <CusButton
              onClick={() => {
                this.handleSave('save');
              }}
              loading={saveLoading}
            >
              {intl.get(`hzero.common.view.button.save`).d('保存')}
            </CusButton>
            <CusButton
              onClick={() => {
                this.handleSave('send');
              }}
              loading={saveLoading}
              type="primary"
            >
              {intl.get(`${commonPrompt}.view.back.emailsend`).d('发送')}
            </CusButton>
          </footer>
        )}
      </PageWrapper>
    );
  }
}

export default ReturnMail;
