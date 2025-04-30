/**
 * 供应商黑名单 - 草稿&自动发起详情
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
import BasicForm from '@/routes/Blacklist/components/BasicForm';
import StatusForm from '@/routes/Blacklist/components/StatusForm';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import queryString from 'querystring';
import dayjs from 'dayjs';
import formatterCollections from 'utils/intl/formatterCollections';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  blackUpdateInfo: supplierHK.blackUpdateInfo,
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser(),
  loading: loading.effects['supplierHK/blackInfoDetail'],
}))
export default class EditBlacklist extends Component {
  constructor(props) {
    super(props);
    this.CMHK_SUPPLIER = '/cmhk-supplier';
    this.state = {
      activeKey: ['basic', 'status'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      applyNumber: null,
      id: null,
      refHeadId: null,
      disabled: false,
    };
    this.platform = {};
    this.headForm = {};
  }

  componentDidMount() {
    this.getDetailData();
  }

  /**
   * 黑名单详情
   */
  @Bind()
  getDetailData() {
    const { location: { search }, dispatch } = this.props;
    const { id, applyNumber, formRecordId } = queryString.parse(search.substring(1));
    let supplierName;
    if (id) {
      dispatch({
        type: 'supplierHK/newBlack',
        payload: {
          supplierId: id,
        },
      });
      this.setState({
        refHeadId: id,
      });
    }
    if (applyNumber || formRecordId !== 'null') {
      dispatch({
        type: 'supplierHK/blackInfoDetail',
        payload: {
          applyNumber: applyNumber || formRecordId,
        },
      }).then(res => {
        if (res) {
          this.setState({
            data: res,
            id: res?.head?.id,
            refHeadId: res?.head?.refHeadId,
            disabled: ['Inapproval', 'Approved'].includes(res?.head?.applyStatus),
          });
          supplierName = res?.head?.companyNameCh;
        }
      });
    }
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'UNDO', 'NOTICE', 'GIVE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        } else {
          this.handleSave((params) => {
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        }
      }
    });
  }

  @Bind()
  handleSave(callback) {
    const { location: { search }, dispatch, blackUpdateInfo } = this.props;
    const { getFieldValue } = this.headForm.props.form;
    const { id, refHeadId } = this.state;
    this.platform.props.form.validateFields((err, values) => {
      if (!err) {
        let head = {
          applyNo: getFieldValue('applyNo'),
          applyStatus: getFieldValue('applyStatus'),
          applyType: getFieldValue('applyType'),
          supplierNumber: getFieldValue('supplierNumber'),
          companyNameEn: getFieldValue('companyNameEn'),
          companyNameCh: getFieldValue('companyNameCh'),
          needer: getFieldValue('needer'),
          needDep: getFieldValue('needDep'),
          applier: getFieldValue('applier'),
          applyDate: dayjs.isDayjs(getFieldValue('applyDate'))
            ? getFieldValue('applyDate').format('YYYY-MM-DD HH:mm:ss')
            : undefined,
          changeType: getFieldValue('changeType'),
          changeMethod: getFieldValue('changeMethod'),
          event: values.event,
          occur: values.occur,
          blackStartTime: dayjs.isDayjs(values.blackStartTime)
            ? values.blackStartTime.format('YYYY-MM-DD 00:00:00')
            : undefined,
          blackEndTime: dayjs.isDayjs(values.blackEndTime)
            ? values.blackEndTime.format('YYYY-MM-DD 00:00:00')
            : undefined,
          reason: values.reason,
          backup: values.backup,
          refHeadId: refHeadId,
          id: blackUpdateInfo?.head?.id,
        };
        if (id) {
          head = {
            ...head,
            id: id,
          };
        }
        dispatch({
          type: 'supplierHK/blackListSave',
          payload: {
            head,
            attch: {
              attachmentUuid: values?.attachmentUuid,
            },
          },
        }).then(res => {
          if (typeof callback === 'function') {
            callback({
              ...res,
              formRecordId: res.head.id,//表单记录id（Long）
              affairTitle: intl.get(`${prompt}.todotask.blacksupplier.apply`).d('黑名单供应商申请：') + head.companyNameCh, //待办流程名称
            });
            console.log('affairTitle', intl.get(`${prompt}.todotask.blacksupplier.apply`).d('黑名单供应商申请：') + head.companyNameCh);
          }
        });
      }
    });
  }

  render() {
    const {
      activeKey,
      disabled,
    } = this.state;
    const {
      tenantId,
      blackUpdateInfo,
      currentUser,
      loading,
    } = this.props;
    const statusFormProps = {
      tenantId,
      initialValue: blackUpdateInfo,
      currentUser,
      disabled,
    };
    return (
      <PageWrapper loading={loading}>
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
