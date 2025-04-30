import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Collapse, Input } from 'antd';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import { closeWindow } from '_cus_utils/utils';
import CusRequest from '_cus_utils/request';
import { uniqBy } from 'lodash';
import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getCurrentUser,
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import dayjs from 'dayjs';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { downloadFile } from 'hzero-front/lib/services/api';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import CusMultiLov from '_cus_components/CusMultiLov';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import BasicForm from './BasicForm';
import DrawJudgeList from './DrawJudgeList';
import CusTabs from '_cus_components/CusTabs';
import CusInput from '_cus_components/CusInput';
import PageMessage from '_cus_components/Page/PageMessage';
import { getLFormGridSpan } from '_cus_utils/utils';
import ShopForm from './ShopForm'
import MylinkForm from './MylinkForm'
import CusSelect from '_cus_components/CusSelect';
import './index.less';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
const { loginName } = getCurrentUser();
const gridSpan = getLFormGridSpan();

const approvalDetailInfoRes = JSON.parse(localStorage.getItem('approvalDetailInfo'));

@formatterCollections({ code: ['spfmhk.mylink', 'HKPC.commom'] })
@fastCodeLoader(['HKTB.HEAD_BIDALL', 'HKTB.LINE_BIDRULE', 'HKTB.ACTIVITY_STATUS'])
@connect(({ loading, PartnerInformationModal }) => ({
  PartnerInformationModal,
  qeuryLoading: loading.effects['PartnerInformationModal/getDrawjudgeList'] ||
  loading.effects['PartnerInformationModal/getRedrawList'],
  submitLoading: loading.effects['PartnerInformationModal/submitBeginProcess']
}))

@Form.create({ fieldNameProp: null })

export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    this.state = {
      isPub,
      activeKey: ['form', 'table'],
      activeKeyDetail: ['detail'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      productVisible: false,
      headerInfo: {
        partnerCategory: approvalDetailInfoRes?.approvalDetailInfo?.partnerCategory,
        partnerCategoryMeaning: approvalDetailInfoRes?.approvalDetailInfo?.partnerCategoryMeaning,
        revStartMan: approvalDetailInfoRes?.approvalDetailInfo?.revStartMan,
        revStartManId: approvalDetailInfoRes?.approvalDetailInfo?.revStartManId,
        judgeNum: approvalDetailInfoRes?.approvalDetailInfo?.judgeNum
      },
      partnerList: approvalDetailInfoRes?.approvalDetailInfo?.partner?.map((item) => ({
        ...item,
        rowKey: uuidv4(),
        _status: 'update',
      }))
    };
  }

  componentDidMount() {
    this.addDrawJudgeList();
  }

  componentWillUnmount() {
    localStorage.removeItem('approvalDetailInfo');
  }

  // 通过评委人数自动新增对应列
  addDrawJudgeList = () => {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    const judgeNum = headerInfo?.judgeNum;
    const drawJudgeSource = Array.from({ length: judgeNum }, () => ({
      _status: 'create',
      rowKey: uuidv4(),
    }));
    dispatch({
      type: 'PartnerInformationModal/updateState',
      payload: {
        drawJudgeSource,
      },
    })
    this.handleDrawjudge();
  }

  // 新增合作伙伴
  @Bind()
  handleAddLine = (item) => {
    const { partnerList } = this.state;
    const newDataSource = [
      ...partnerList,
      ...item.map(i => ({
        ...i,
        rowKey: uuidv4(),
        _status: 'create',
      })),
    ]
    if(newDataSource.length > 10) {
      CusNotification.error({
        message: intl.get('demoTitle1').d('只能选10条,请重新选择'),
      });
    } else {
      this.setState({
        partnerList: newDataSource,
      })
    }
  }

  // 删除合作伙伴
  @Bind()
  handleDeleteLine = () => {
    const { selectedRowKeys, partnerList } = this.state;
    if (selectedRowKeys.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        // 本地删除
        const newDataSource = partnerList.filter((item) => !selectedRowKeys.includes(item['rowKey']));
        this.setState({
          partnerList: newDataSource,
          selectedRowKeys: [],
        })
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  // 评委抽取
  handleDrawjudge = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/getDrawjudgeList',
      payload: {}
    }).then((res) => {
      if(res) {
        const newDataSource = res?.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'create',
        }))
        dispatch({
          type: 'PartnerInformationModal/updateState',
          payload: {
            drawJudgeSource: newDataSource,
          },
        });
      }
    })
  }

  // 重新抽取
  handleRedraw = (record) => {
    console.log('record', record);
    const { dispatch } = this.props;
    dispatch({
      type: 'PartnerInformationModal/getRedrawList',
      payload: {
        judgeId: record?.judgeId,
        judgeUnitCode: record?.judgeUnitCode,
      }
    }).then((res) => {
      if(res) {
        record.judgeDepartment = res?.judgeDepartment;
        record.judgeId = res?.judgeId;
        record.judgeName = res?.judgeName;
        record.judgePhone = res?.judgePhone;
        record.judgeEmail = res?.judgeEmail;
        record.$form.setFieldsValue({
          judgeDepartment: res?.judgeDepartment,
          judgeId: res?.judgeId,
          judgeName: res?.judgeName,
          judgePhone: res?.judgePhone,
          judgeEmail: res?.judgeEmail,
        })
      }
    })
  }

  // 发起评审流程
  @Bind()
  handleSubmit = () => {
    const { dispatch, PartnerInformationModal } = this.props;
    const { headerInfo, partnerList } = this.state;
    const { drawJudgeSource } = PartnerInformationModal;
    const drawJudgeSourceData = getEditTableData(drawJudgeSource, ['rowKey']);
    console.log('partnerList', partnerList);
    console.log('drawJudgeSourceData', drawJudgeSourceData);
    if(drawJudgeSourceData.length > 0) {
      dispatch({
        type: 'PartnerInformationModal/submitBeginProcess',
        payload: {
          partnerId: partnerList.map(item => item.partnerId),
          judge: drawJudgeSourceData,
        }
      }).then((res) => {
        if(res) {
          window.close();
          // 飞书提交审批后关闭tag页
          closeWindow();
        }
      })
    }
  }

  render() {
    const {
      form,
      qeuryLoading = false,
      submitLoading = false,
      idpValueMap,
      PartnerInformationModal,
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      activeKey,
      activeKeyDetail,
      selectedRows,
      selectedRowKeys,
      headerInfo,
      productVisible,
      importUploading = false,
      headId,
      formRecordId,
      partnerList,
    } = this.state;

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = ['InApproval', 'Approved'].includes(headerInfo?.status) || (headerInfo?.createrCode && headerInfo?.createrCode !== loginName);

    const basicFormProps = {
      ...this.props,
      readyOnly,
      headerInfo,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    const shopFormProps = {
      ...this.props,
      partnerList,
      rowSelection,
    }

    const drawJudgeProps = {
      ...this.props,
      readyOnly,
      idpValueMap,
      basicForm: this.basicForm?.getFieldsValue(),
      handleRedraw: this.handleRedraw,
      onChange: (page) => this.queryListDetail(page, (formRecordId || headId))
    };

    return (
      <>
        <PageWrapper loading={qeuryLoading || submitLoading}>
          <Collapse
            className="customize-collapse"
            style={{ marginTop: '16px' }}
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.view.title.basicinfo`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              bordered={false}
              key="form"
            >
              <BasicForm {...basicFormProps} />
              <Collapse
                className="customize-collapse"
                style={{ marginTop: '16px' }}
                bordered={false}
                defaultActiveKey={activeKeyDetail}
                onChange={(collapseKeys) => {
                  this.setState({ activeKeyDetail: collapseKeys });
                }}
              >
                <Panel
                  showArrow={false}
                  style={{ borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}
                  key="detail"
                  collapsible="disabled"
                  className='padding-class'
                  header={
                    <PanelHeader
                      showArrow={false}
                      verticalLine={false}
                      title={false}
                      arrowActive={activeKeyDetail.includes('detail')}
                      buttons={
                        <>
                          <CusButton
                            mini
                            onClick={this.handleDeleteLine}
                          >
                            {intl.get('hzero.common.view.button.delete').d('删除')}
                          </CusButton>
                          <CusMultiLov
                            mini
                            isButton
                            code="LINK.PARTNER_INFO"
                            queryParams={{ tenantId: organizationId }}
                            lovOptions={{ displayField: 'companyName', valueField: 'partnerId' }}
                            type='primary'
                            onChange={(_, item) => this.handleAddLine(item)}
                          >
                            {intl.get('hzero.common.button.create').d('新增')}
                          </CusMultiLov>
                        </>
                      }
                    />
                  }
                >
                <div style={{margin: '-4px -16px -24px -16px'}}>
                  <ShopForm {...shopFormProps} />
                </div>
                </Panel>
              </Collapse>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.mylink.title.drawjudge`).d('评委抽取')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >
              <div style={{margin: '-16px'}}>
                <PageMessage>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: intl
                        .get('spfmhk.mylink.field.extract.expert.tip1')
                        .d('提示：<br/> （1）市场部默认抽取一名专家<br/> （2）Mylink部门默认抽取两名专家评委'),
                    }}
                  />
                </PageMessage>
              </div>
              <Collapse
                className="customize-collapse"
                style={{ marginTop: '16px' }}
                bordered={false}
                defaultActiveKey={activeKeyDetail}
                onChange={(collapseKeys) => {
                  this.setState({ activeKeyDetail: collapseKeys });
                }}
              >
                <Panel
                  showArrow={false}
                  style={{ border: 'none' }}
                  className='padding-class'
                  key="detail"
                  header={
                    <PanelHeader
                      verticalLine={false}
                      title={false}
                      arrowActive={activeKeyDetail.includes('detail')}
                      buttons={
                        <>
                          <div className="customize-form" style={{ display: 'flex' }}>
                            <Form>
                              <Form.Item
                                label={intl.get(`spfmhk.mylink.field.judge.num`).d('评委人数')}
                              >
                                {getFieldDecorator('judgeNum', {
                                  initialValue: headerInfo?.judgeNum,
                                })(<Input disabled />)}
                              </Form.Item>
                            </Form>
                            <CusButton
                              mini
                              onClick={this.handleDrawjudge}
                            >
                              {intl.get('spfmhk.mylink.title.drawjudge').d('评委抽取')}
                            </CusButton>
                          </div>
                        </>
                      }
                    />
                  }
                >
                <div style={{margin: '-4px -16px -24px -16px'}}>
                  <DrawJudgeList {...drawJudgeProps} />
                </div>
                </Panel>
              </Collapse>
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          <CusButton
            type="primary"
            onClick={this.handleSubmit}
            loading={submitLoading}
          >
            {intl.get(`spfmhk.mylink.button.ReviewPro`).d('发起评审流程')}
          </CusButton>
        </CusApprovalButtons>
      </>
    );
  }
}
