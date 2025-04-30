/**
 * 供应商黑名单 - 自动发起
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/9
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Collapse } from 'antd';
import { Bind } from 'lodash-decorators';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import intl from 'utils/intl';
import BasicForm from '@/routes/Status/components/BasicForm';
import StatusForm from '@/routes/Status/components/StatusForm';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import queryString from 'querystring';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ status, loading }) => ({
  status,
  statusUpdateInfo: status.statusUpdateInfo,
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser(),
  loading: loading.effects['status/queryStatusUpdateInfoById'],
}))
export default class AutoLaunch extends Component {
  constructor(props) {
    super(props);
    this.CMHK_SUPPLIER = '/cmhk-supplier';
    this.state = {
      activeKey: ['basic', 'status'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      currentState: null
    };
    this.platform = {};
    this.headForm = {};
  }

  componentDidMount() {
    this.getDetail();
  }

  @Bind()
  getDetail() {
    const { location: { search }, dispatch } = this.props;
    const { formRecordId, state } = queryString.parse(search.substring(1));
    let data;
    dispatch({
      type: 'status/queryStatusUpdateInfoById',
      payload: { id: formRecordId },
    }).then(res => {
      if (res) {
        data = res;
        this.setState({
          currentState: state
        })
      }
    });
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'UNDO', 'NOTICE', 'GIVE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            if(params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params
                },
              }, e.data.url);
            }
          })
        } else {
          this.handleSave((params) => {
            if(params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params
                },
              }, e.data.url);
            }
          })
        }
      }
    });
  }

  @Bind()
  handleSave(callback) {
    const { location: { search }, dispatch, statusUpdateInfo } = this.props;
    this.platform.props.form.validateFields((err, values) => {
      if(!err) {
        dispatch({
          type: 'status/statusInfoSave',
          payload: {
            head: {
              ...statusUpdateInfo?.head,
              backup: values.backup,
            },
            attach: {
              attachmentUuid: values?.attachmentUuid,
            },
          },
        }).then(res => {
          if(typeof callback === 'function') {
            callback({
              ...res,
              formRecordId: statusUpdateInfo?.head.id,
              affairTitle: intl.get(`${prompt}.todotask.blacksupplier.apply`).d('黑名单供应商申请：') + statusUpdateInfo?.head?.companyNameCh, //待办流程名称
            })
          }
        })
      }
    })
  }

  render() {
    const {
      activeKey,
      currentState,
    } = this.state;
    const {
      tenantId,
      currentUser,
      statusUpdateInfo,
    } = this.props;
    const statusFormProps = {
      tenantId,
      initialValue: statusUpdateInfo,
      currentUser,
      disabled: ['READY', 'DONE'].includes(currentState)
    };
    return (
      <PageWrapper>
        <Collapse
          className='customize-collapse'
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            collapsible='disabled'
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`${prompt}.view.title.basicInfo`).d('基础信息')}
                arrowActive={activeKey.includes('basic')}
              />
            }
            key='basic'
          >
            <BasicForm
              {...statusFormProps}
              onRef={ref => {
                this.headForm = ref;
              }} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible='disabled'
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`${prompt}.view.title.status.update.info`).d('状态更新信息')}
                arrowActive={activeKey.includes('status')}
              />
            }
            key='status'
          >
            <StatusForm
              {...statusFormProps}
              onRef={ref => {
                this.platform = ref;
              }} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
