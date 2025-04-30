import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import intl from 'utils/intl';
import queryString from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import BasicForm from './BasicForm';
import DetailForm from './DetailForm';

const { Panel } = Collapse;

@formatterCollections({ code: ['spfmhk.dict'] })
@fastCodeLoader(['DICT.COOPERATE_APPLY_STATUS', 'DICT.PARTNER_FILE_TYPE', 'DICT.MODE_FILE_TYPE', 'DICT.JUDGE_APPLY_STATUS', 'DICT.BLACK_APPLY_STATUS', 'DICT.BLACK_APPLY_TYPE', 'DICT.BLACK_CHANGE_TYPE','DICT.BLACK_CHANGE_MODE'])
@connect(({ loading, blacklistManagementModel }) => ({
  blacklistManagementModel,
  qeuryLoading: loading.effects['blacklistManagementModel/queryList'],
}))
export default class Detail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      blackId: null,
      // formRecordId: formRecordId === 'null' ? activeId : formRecordId,
      activeKey: ['basicForm', 'detailForm'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      readOnly: false,
    };
  }

  componentDidMount() {
    this.pageInit();
  }

  pageInit = () => {
    const { location: { search }, dispatch } = this.props;
    const { blackId, partnerId, formRecordId, state, permissionType } = queryString.parse(search.substring(1));
    this.setState({
      formRecordId: blackId || formRecordId,
      readOnly: formRecordId?.indexOf('null') < 0 && state !== 'READY' && !(state === 'PENDING' && permissionType === 'SEND'), // 只有草稿和退回单可编辑,
    });
    console.log(blackId, formRecordId);
    if (blackId || formRecordId !== 'null') {
      const params = {
        blackId: blackId || formRecordId,
      };
      this.queryDetail(params);
    } else {
      this.queryBasic(partnerId);
    }
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 提交 保存 退回 会签 注销 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'GIVE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            console.log(params, '===params===');
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
            console.log(params, '===params===');
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
  };

  queryBasic = (partnerId) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'blacklistManagementModel/queryBasic',
      payload: {
        id: partnerId,
      },
    }).then((res) => {
      console.log('合作伙伴', res);
      const partnerInfo = {
        partnerId: partnerId,
        partnerNum: res.partnerNum,
        cmpanyNameCh: res.cmpanyNameCh,
        cmpanyNameEn: res.cmpanyNameEn,
      };
      if (res) {
        this.setState({
          headerInfo: { ...partnerInfo },
        });
      }
    });
  };

  queryDetail = (params) => {
    const { dispatch } = this.props;
    const { blackId } = params;
    dispatch({
      type: 'blacklistManagementModel/queryDetail',
      payload: {
        id: blackId,
      },
    }).then((res) => {
      console.log('详情', res);
      if (res) {
        this.setState({
          headerInfo: { ...res },
        });
      }
    });
  };


  @Bind()
  handleSave = (callback) => {
    const { dispatch, blacklistManagementModel } = this.props;
    const { headerInfo } = this.state;
    this.detailForm.validateFields((err, values) => {
      if (!err) {
        // 数据汇总
        console.log('values', values, headerInfo);
        dispatch({
          type: 'blacklistManagementModel/saveInfo',
          payload: {
            blackId: headerInfo?.blackId,
            partnerId: headerInfo?.partnerId,
            partnerNum: headerInfo?.partnerNum,
            applyType: headerInfo?.applyType,
            changeType: headerInfo?.changeType || 'PASS_TO_BLACK',
            involeCase: values.involeCase,
            involeCaseDate: values.involeCaseDate,
            blackReason: values.blackReason,
            remark: values.remark,
            uuid: values.uuid,
          },
        }).then(res => {
          if (res) {
            console.log(res);
            const blackId = res.blackId;
            const params = { blackId: blackId };
            this.queryDetail(params);
            if (typeof callback === 'function') {
              console.log('待办标题: ', intl.get('hzero.common.title.dictblacklist.management').d('黑名单流程') + '：' + headerInfo.cmpanyNameCh);
              callback({
                ...res,
                formRecordId: blackId,
                affairTitle: intl.get('hzero.common.title.dictblacklist.management').d('黑名单流程') + '：' + headerInfo.cmpanyNameCh,
              });
            }
          }
        }).catch(err => {
          console.log(err);
        });
      }
    });

  };


  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      blacklistManagementModel,
    } = this.props;
    const {
      activeKey,
      headerInfo,
      readOnly,
    } = this.state;

    const basicFormProps = {
      ...this.props,
      readOnly,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
    };

    const detailFormProps = {
      ...this.props,
      readOnly,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.detailForm = ref.props.form;
      },
    };

    return (
      <PageWrapper loading={qeuryLoading}>
        <Collapse
          className="customize-collapse"
          // bordered={false}
          style={{ marginTop: '16px' }}
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            showArrow={false}
            bordered={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.dict.view.common.basicinformation`).d('基本信息')}
                arrowActive={activeKey.includes('basicForm')}
              />
            }
            key="basicForm"
          >
            <BasicForm {...basicFormProps}></BasicForm>
          </Panel>
          <Panel
            showArrow={false}
            bordered={false}
            header={
              <PanelHeader
                title={intl.get(`spfmhk.dict.view.balcklist.statuschangeinfo`).d('状态变更信息')}
                arrowActive={activeKey.includes('detailForm')}
              />
            }
            key="detailForm"
          >
            <DetailForm {...detailFormProps}></DetailForm>
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
