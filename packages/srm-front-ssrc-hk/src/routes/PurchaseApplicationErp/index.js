import React from 'react';
import { connect } from 'dva';
import dayjs from 'dayjs';
import { Col, Collapse, Form, Row } from 'antd';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUser } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import { fastCodeLoader } from '@/utils/decorators';

import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusSelect from '_cus_components/CusSelect';
import FilterSearch from './FilterSearch';
import DataTable from './DataTable';

/**
 * 国际化前缀
 */
const promptCode = 'HKPC.commom';
const currentUser = getCurrentUser();
const { Panel } = Collapse;

@formatterCollections({ code: [promptCode] })
@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
  fetchLoading: loading.effects['purchaseApplicationModel/queryPurchaseApplicationList'],
  submitLoading:
    loading.effects['resaleRfq/submitSummary'] ||
    loading.effects['resaleRfq/ictsSubmitSummary'] ||
    loading.effects['resaleRfq/submitValidateSummary'] ||
    loading.effects['resaleRfq/ictsSubmitValidateSummary'] ||
    loading.effects['resaleRfq/submitEnquiryPriceSummary'] ||
    loading.effects['resaleRfq/submitValidateCommonSummary'],
  publishLoading:
    loading.effects['resaleRfq/publishSummary'] ||
    loading.effects['resaleRfq/ictsPublishSummary'] ||
    loading.effects['resaleRfq/publishEnquiryPriceSummary'] ||
    loading.effects['resaleRfq/submitValidateCommonSummary'],
  deleteLoading: loading.effects['resaleRfq/deleteEnquiryPriceByList'],
  queryRfqResponseLoading: loading.effects['resaleRfq/queryRfqResponse'],
  exportLoading: loading.effects['resaleRfq/enquiryExport'],
}))
@fastCodeLoader([
  'ISP.RFP_HEADER_STATUS',
  'ISP.RFP_QUICK_SEARCH_CONDITION',
  'RS_IBOSS_PRODUCT_TYPE_ISP_RFP',
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'RS_RFQ_HEAD_STATUS',
  'HKPC.PRTYPE',
  'HKPC.RELATEDTOPROJECT',
  'HKPC.PURCHASINGCATEGORY',
  'HKPC.BUDGETTYPE',
  'HKPC.PRRECORDSSTATUS',
  'HKPC.PROGRESSQUERY',
])
export default class purchaseApplicationErp extends React.Component {
  modalForm = React.createRef();
  // 创建新单据表单
  createForm;

  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      modalVisible: false,
      submitModalVisible: false,
      isPub: props.location.pathname.includes('pub'), // 判断是否为pub页面
      purchaseTypeVisible: false,
      idList: [],
      prType: '',
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  // 查询采购申请列表数据
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseApplicationModel/queryPurchaseApplicationList',
      payload: {
        page,
        lang: currentUser.language,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if (res) {
        if (this.table) {
          const { clearState = (e) => e } = this.table;
          clearState();
        }
      }
    });
  }

  /**
   * @description 打开新建询价单Modal
   */
  @Bind()
  handleOpenModal() {
    this.setState({
      modalVisible: true,
    });
  }

  @Bind()
  onTableRef(ref) {
    this.table = ref;
  }

  /**
   * @description 获取查询参数
   */
  @Bind()
  getQueryParams() {
    const fieldsValue = this.form?.current?.getFieldsValue();
    const {
      creationDateFrom,
      creationDateTo,
      enquiryStartDateFrom,
      enquiryStartDateTo,
      enquiryEndDateFrom,
      enquiryEndDateTo,
      applyingDateStart,
      applyingDateEnd,
    } = fieldsValue || {};
    return {
      ...fieldsValue,
      creationDateFrom: dayjs.isDayjs(creationDateFrom)
        ? creationDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      creationDateTo: dayjs.isDayjs(creationDateTo)
        ? creationDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryStartDateFrom: dayjs.isDayjs(enquiryStartDateFrom)
        ? enquiryStartDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryStartDateTo: dayjs.isDayjs(enquiryStartDateTo)
        ? enquiryStartDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      enquiryEndDateFrom: dayjs.isDayjs(enquiryEndDateFrom)
        ? enquiryEndDateFrom.format('YYYY-MM-DD 00:00:00')
        : undefined,
      enquiryEndDateTo: dayjs.isDayjs(enquiryEndDateTo)
        ? enquiryEndDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      applyingDateStart: dayjs.isDayjs(applyingDateStart)
        ? applyingDateStart.format('YYYY-MM-DD 00:00:00')
        : undefined,
      applyingDateEnd: dayjs.isDayjs(applyingDateEnd)
        ? applyingDateEnd.format('YYYY-MM-DD 23:59:59')
        : undefined,
    };
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDetele(data = [], callback = (e) => e) {
    let idList = [];
    data.map((item) => {
      idList.push(item.id);
    });
    const { dispatch } = this.props;
    const deleteFlag = data.every((item) => item.prStatus === 'PENDING_REFER');
    if (data.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    }
    if (deleteFlag) {
      CusModal.confirm({
        content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'purchaseApplicationModel/delPurchaseApplicationList',
            payload: { id: idList },
          }).then((res) => {
            if (res) {
              this.handleSearch();
              CusNotification.success();
              callback();
            }
          });
        },
        okType: 'normal',
      });
    } else {
      CusNotification.error({
        message: intl
          .get(`${promptCode}.view.message.onlyDeleteNEW`)
          .d('只能删除状态为"草稿"的单据。'),
      });
    }
  }

  // 新增采购申请类型
  @Bind()
  addPurchaseType(e) {
    this.setState({
      purchaseTypeVisible: true,
    });
  }

  // 隐藏采购申请类型弹框
  @Bind()
  hidePurchaseTypeModal() {
    this.setState({
      purchaseTypeVisible: false,
    });
  }

  // 采购申请类型弹窗确认事件
  @Bind()
  handleSavePurchaseType() {
    const modalFormValue = this.modalForm?.current?.getFieldsValue();
    const related = modalFormValue?.relatedToProject;
    console.log(related, 'related');
    let id = '';
    let relatedNumber = '';
    if (related == 'yes') {
      relatedNumber = 0;
    } else {
      relatedNumber = 1;
    }
    this.modalForm?.current?.validateFields().then((values) => {
      this.setState({
        purchaseTypeVisible: false,
      });
      if (modalFormValue.prType === 'frameworkSubOrder') {
        // 跳转框架子订单页面
        const url = `${process.env.APPROVAL_PROCESS
          }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_KJZDDCGSQ&pcThirdContentPageUrl=${encodeURIComponent(
            `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/frame-sub-order/edit?related=${relatedNumber}&prType=${modalFormValue.prType}`
          )}`;
        window.open(url, '_blank');
      } else {
        window.open(
          `${process.env.APPROVAL_PROCESS
          }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_jianyixunjiacaigoushenqing&pcThirdContentPageUrl=${encodeURIComponent(
            `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/purchaseApplication/edit?related=${relatedNumber}&prType=${this.state.prType}`
          )}`,
          '_blank'
        );
      }
    })
    // if (modalFormValue.prType === undefined || modalFormValue.relatedToProject === undefined) {
    //   this.modalForm?.current?.validateFields((err, values) => {
    //     if (err) {
    //       CusNotification.warning({
    //         message: intl.get(`scpc.CollaborationWrite.validateNotPass`).d('存在必输字段未维护！'),
    //       });
    //     }
    //   });
    // } else {
    //   this.setState({
    //     purchaseTypeVisible: false,
    //   });
    //   if (modalFormValue.prType === 'frameworkSubOrder') {
    //     // 跳转框架子订单页面
    //     const url = `${process.env.APPROVAL_PROCESS
    //       }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_KJZDDCGSQ&pcThirdContentPageUrl=${encodeURIComponent(
    //         `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/frame-sub-order/edit?related=${relatedNumber}&prType=${modalFormValue.prType}`
    //       )}`;
    //     window.open(url, '_blank');
    //   } else {
    //     window.open(
    //       `${process.env.APPROVAL_PROCESS
    //       }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_jianyixunjiacaigoushenqing&pcThirdContentPageUrl=${encodeURIComponent(
    //         `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/purchaseApplication/edit?related=${relatedNumber}&prType=${this.state.prType}`
    //       )}`,
    //       '_blank'
    //     );
    //   }
    // }
  }

  @Bind()
  getSelectedRows(idListValue) {
    this.setState({
      idList: idListValue,
    });
  }

  render() {
    const {
      dispatch,
      idpValueMap = {},
      fetchLoading = false,
      submitLoading = false,
      purchaseApplicationModel,
      language,
    } = this.props;
    const {
      activeKey,
      modalVisible = false,
      submitModalVisible = false,
      purchaseTypeVisible,
      isPub,
      prType,
    } = this.state;
    const formProps = {
      idpValueMap,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.form;
      },
      language,
    };
    const tableProps = {
      isPub,
      idpValueMap: idpValueMap['HKPC.PRTYPE'],
      ...this.props,
      onRef: this.onTableRef,
      onDetele: this.handleDetele,
      onChange: this.handleSearch,
      onOpenModal: this.handleOpenModal,
      getQueryParams: this.getQueryParams,
      purchaseApplicationModel,
      dispatch,
    };

    return (
      <>
        <PageWrapper loading={fetchLoading}>
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
                  title={intl.get(`hzero.common.view.button.search`).d('查询')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <FilterSearch {...formProps} />
            </Panel>

            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`hzero.common.view.title.Resulttable`).d('结果展示')}
                  arrowActive={activeKey.includes('table')}
                  showArrow={false}
                  buttons={
                    <>
                      {/*<CusButton onClick={() => this.exportPurchaseApplicationList()} mini>{intl.get(`HKPC.commom.view.button.export`).d('导出')}</CusButton>*/}
                      <CusButton onClick={() => this.handleDetele(this.state.idList)} mini>
                        {intl.get(`hzero.common.view.button.delete`).d('删除')}
                      </CusButton>
                      <CusButton mini onClick={(e) => this.addPurchaseType(e)} type="primary">
                        {intl.get(`hzero.common.view.button.add`).d('新建')}
                      </CusButton>
                    </>
                  }
                />
              }
              key="table"
            >
              <DataTable getSelectedRows={this.getSelectedRows.bind(this)} {...tableProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusModal
          title={intl.get('HKPC.commom.view.title.inputPRtype').d('请选择采购申请类型')}
          width={500}
          visible={purchaseTypeVisible}
          onCancel={this.hidePurchaseTypeModal}
          destroyOnClose
          okText={intl.get('hzero.common.view.button.confirm').d('确认')}
          onOk={this.handleSavePurchaseType}
        >
          <Form ref={this.modalForm} className="customize-form">
            <Row>
              <Col>
                <Form.Item
                  label={intl.get('HKPC.commom.view.title.prtype').d('采购申请类型')}
                  name="prType"
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型'),
                      }),
                    },
                  ]}
                >
                  <CusSelect
                    allowClear
                    options={idpValueMap['HKPC.PRTYPE']}
                    onChange={(_, option) => {
                      if (option?.value == 'frameworkSubOrder') {
                        this.modalForm?.current?.setFieldsValue({
                          relatedToProject: 'yes',
                        });
                      }
                      setTimeout(() => {
                        // console.log('option', option)
                        this.setState({
                          prType: option.value,
                        });
                      }, 1000);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Item
                  label={intl.get(`${promptCode}.view.title.relatedtoproject`).d('是否关联立项')}
                  name="relatedToProject"
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.relatedtoproject`)
                          .d('是否关联立项'),
                      }),
                    },
                  ]}
                >
                  <CusSelect
                    disabled={prType == 'frameworkSubOrder'}
                    allowClear
                    options={idpValueMap['HKPC.RELATEDTOPROJECT']}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </CusModal>
      </>
    );
  }
}
