/**
 * index.js - 报名审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col, Input, Collapse } from 'antd';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Link } from 'dva/router';
import EditTable from '_cus_components/EditTable';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadFile from './UploadFile';
import { largeScreenWidth } from '_cus_utils/constants';
import CusNotification from '_cus_components/CusNotification';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusInput from '_cus_components/CusInput';
import { tooltipRender } from '_cus_utils/render';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';

const screenWidth = window.screen.width;
const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@connect(({ loading, contractMaintain = {} }) => ({
  confirmLoading: loading.effects['contractMaintain/issueTenders'],
  fetchLoading: loading.effects['contractMaintain/getSupplierApprovalTableList'],
  getEmailInfoLoading: loading.effects['contractMaintain/getEmailInfo'],
  contractMaintain,
}))
@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'hzero.common', 'HKPC.commom', 'spfmhk.supplier'],
})
export default class ReginstrationApproval extends Component {
  state = {
    visibleEmail: false,
    html: '',
    activeKey: ['form', 'table'],
    reasonFlag: false,
  };

  componentDidMount() {
    this.fetchList(); // 查询数据
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch, match } = this.props;
    const { proId } = match.params;
    dispatch({
      type: 'contractMaintain/getSupplierApprovalTableList',
      payload: {
        proId: proId,
        page,
      },
    });
  }

  // 发放标书
  @Bind()
  handleClick(record, flag) {
    const { dispatch } = this.props;
    if (record.blackFlag && flag) {
      CusNotification.error({
        message:
          intl
            .get(`bid.bidcommon.view.message.blacklist1${record.supplierName}`, {})
            .d(`供应商${record.supplierName}`) +
          intl
            .get(`bid.bidcommon.view.message.blacklist2`)
            .d(`已被列入黑名单，无法参与公司的项目。`),
        closable: false,
      });
      return;
    }
    if(flag) {
      dispatch({
        type: 'contractMaintain/issueTenders',
        payload: {
          whether: flag,
          supplierId: record.id,
          reason: '',
        },
      }).then((res) => {
        if (res) {
          CusNotification.success({
            message: intl.get('bid.bidcommon.view.message.SeSuccessfully').d('发送成功'),
          });
          this.fetchList();
        }
      });
    } else {
      this.setState({
        reasonFlag: true,
        recordReason: record,
      })
    }
  }

  @Bind
  reasonSave() {
    const { dispatch } = this.props;
    const { recordReason } = this.state;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        dispatch({
          type: 'contractMaintain/issueTenders',
          payload: {
            whether: false,
            supplierId: recordReason.id,
            reason: values.reason,
          },
        }).then((res) => {
          if (res) {
            CusNotification.success({
              message: intl.get('bid.bidcommon.view.message.SeSuccessfully').d('发送成功'),
            });
            this.setState({
              reasonFlag: false,
            }, () => {
              this.fetchList();
            })
          }
        });
      }
    });
  }

  @Bind
  openEmailDrawer(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getEmailInfo',
      payload: {
        supplierId: record.id,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          visibleEmail: true,
          html: res.content,
        });
      }
    });
  }

  // 关闭查看邮件弹框
  @Bind
  handleEmailCancel() {
    this.setState({
      visibleEmail: false,
    });
  }

  // 刷新按钮
  @Bind
  handleRefresh() {
    this.fetchList();
  }

  render() {
    const {
      contractMaintain,
      form: { getFieldDecorator },
      fetchLoading,
      getEmailInfoLoading = false,
      confirmLoading = false,
    } = this.props;
    const { dataRegistration, paginationApproval } = contractMaintain;
    const { visibleEmail = false, html, activeKey, reasonFlag } = this.state;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.contactor`).d('联系人'),
        dataIndex: 'contact',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.telephone`).d('电话'),
        dataIndex: 'contactinformation',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.biddashbord.view.title.mail`).d('电子邮箱'),
        dataIndex: 'mail',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.contactaddress`).d('联络地址'),
        dataIndex: 'contactAddress',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.Region`).d('地区'),
        dataIndex: 'region',
        width: 150,
        render: tooltipRender,
      },

      {
        title: intl.get(`spfmhk.supplier.field.supplier.status`).d('供应商状态'),
        dataIndex: 'supplierStatusMeaning',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.approvedsup`).d('经审核供应商'),
        dataIndex: 'supplierWayMeaning',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.ClickRegistrationTime`).d('点击报名时间'),
        dataIndex: 'creationDate',
        width: getCurrentLanguage() === 'zh_CN' ? 155 : 170,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.bid.button.WhetherToIssueTender`).d('是否发放标书'),
        dataIndex: 'processState',
        width: getCurrentLanguage() === 'zh_CN' ? 125 : 175,
        render: (_, record) => {
          return (
            <>
              {record.isSendBiddingDocument === null && (
                <CusButton
                  type="plain"
                  onClick={() => {
                    this.handleClick(record, true);
                  }}
                  disabled={record.isSendBiddingDocument !== null}
                >
                  {intl.get('bid.bidcommon.bid.button.Adopt').d('通过')}
                </CusButton>
              )}
              {record.isSendBiddingDocument === null && (
                <CusButton
                  type="plain"
                  style={{ marginLeft: '16px' }}
                  onClick={() => {
                    this.handleClick(record, false);
                  }}
                  disabled={record.isSendBiddingDocument !== null}
                >
                  {intl.get('bid.bidcommon.bid.button.NoAdopt').d('不通过')}
                </CusButton>
              )}
              {record.isSendBiddingDocument === 1 && (
                <CusButton
                  type="plain"
                  style={{ marginLeft: '16px' }}
                  onClick={() => {
                    this.handleClick(record, true);
                  }}
                >
                  {intl.get('HKPC.commom.view.button.resend').d('重新发送')}
                </CusButton>
              )}
            </>
          );
        },
      },
      {
        title: intl.get('bid.bidcommon.bid.button.NoAdoptReason').d('不通过理由'),
        dataIndex: 'isSendBiddingDocument',
        width: getCurrentLanguage() === 'zh_CN' ? 125 : 135,
        render: (_, record) => {
          return record.isSendBiddingDocument === 0 ? (
            <>
              <CusButton
                type="plain"
                onClick={() => {
                  this.openEmailDrawer(record);
                }}
              >
                {intl.get('bid.bidcommon.view.button.EmailView').d('邮件预览')}
              </CusButton>
            </>
          ) : (
            <span>-</span>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.TimeOfTenderIssuance`).d('发放标书时间'),
        dataIndex: 'sendBiddingDate',
        width: getCurrentLanguage() === 'zh_CN' ? 155 : 175,
        render: tooltipRender,
      },
      // {
      //   title: intl.get(`bid.bidcommon.bid.title.HasTheBidBeenDownloaded`).d('是否已经下载标书'),
      //   dataIndex: 'isDownloadBddingDocument',
      //   width: getCurrentLanguage() === 'zh_CN' ? 165 : 210,
      //   render: (_, record) => {
      //     return (
      //       <div>
      //         {record.isDownloadBddingDocument === 0
      //           ? intl.get(`bid.bidcommon.view.title.no`).d('否')
      //           : intl.get(`bid.bidcommon.view.title.yes`).d('是')}
      //       </div>
      //     );
      //   },
      // },
      // {
      //   title: intl.get(`bid.bidcommon.bid.title.DownloadTenderTime`).d('下载标书时间'),
      //   dataIndex: 'downloadBddingDocumentTime',
      //   width: getCurrentLanguage() === 'zh_CN' ? 155 : 170,
      //   render: tooltipRender,
      // },
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'bidingDocumentFileUrls',
        width: getCurrentLanguage() === 'zh_CN' ? 120 : 135,
        render: (value, record) => {
          return (
            <UploadFile
              tableName="SPUC_PO_CON_ATTACH"
              parentId={record.id}
              value={value}
              disabled
            />
          );
        },
      },
    ];

    const colSpan = screenWidth > largeScreenWidth ? 8 : 12;
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
                  title={intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <Form className="customize-form">
                <Row>
                  <Col span={colSpan}>
                    <Form.Item
                      label={intl
                        .get('bid.bidcommon.view.title.purchaseschemename')
                        .d('采购方案名称')}
                    >
                      {getFieldDecorator('proName', {
                        initialValue: dataRegistration.proName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col span={colSpan}>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                    >
                      {getFieldDecorator('packageName', {
                        initialValue: dataRegistration.packageName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col span={colSpan}>
                    <Form.Item label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}>
                      {getFieldDecorator('packageNo', {
                        initialValue: dataRegistration.packageNo,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col span={colSpan}>
                    <Form.Item
                      label={intl
                        .get('bid.bidcommon.view.title.purchaseschemeno')
                        .d('采购方案编号')}
                    >
                      {getFieldDecorator('proCode', {
                        initialValue: dataRegistration.proCode,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl
                    .get(`bid.bidcommon.view.title.RegistrationApprovalD`)
                    .d('报名审批详情')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >
              <EditTable
                rowKey="id"
                columns={columns}
                dataSource={dataRegistration.bidSupplierProcessVos}
                pagination={paginationApproval}
                onChange={this.fetchList}
              />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          <CusButton onClick={this.handleRefresh}>
            {intl.get('hzero.common.button.refresh').d('刷新')}
          </CusButton>
          <CusButton>
            <Link
              to={`${isPub ? '/pub' : ''}/sspo/online-purchase/registrationCheck/${
                this.props.match.params.proId
              }`}
            >
              {intl.get('bid.bidcommon.view.button.checkingcollusion').d('稽查串标')}
            </Link>
          </CusButton>
        </CusApprovalButtons>
        {/* 查看邮件 */}
        <CusModal
          title={
            intl.get('bid.bidcommon.bid.button.NoAdopt').d('不通过') +
            intl.get('bid.bidcommon.bid.title.Reason').d('理由')
          }
          visible={visibleEmail}
          destroyOnClose
          loading={getEmailInfoLoading}
          width={1000}
          footer={
            <CusButton
              onClick={() => {
                this.setState({ visibleEmail: false });
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          }
          maskClosable
          onCancel={this.handleEmailCancel}
        >
          <div dangerouslySetInnerHTML={{ __html: html }}></div>
        </CusModal>
        {/* 不通过理由 */}
        <CusModal
          title={
            intl.get('bid.bidcommon.bid.button.NoAdopt').d('不通过') +
            intl.get('bid.bidcommon.bid.title.Reason').d('理由')
          }
          visible={reasonFlag}
          destroyOnClose
          confirmLoading={confirmLoading}
          width={500}
          maskClosable
          onOk={() => { this.reasonSave() }}
          onCancel={() => {
            this.setState({ reasonFlag: false });
          }}
        >
          <div className="customize-form" style={{ paddingLeft: '16px' }}>
            <Form ref={this.reasonForm} >
              <Form.Item
              >
                {getFieldDecorator('reason', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('bid.bidcommon.bid.button.NoAdopt').d('不通过') +
                        intl.get('bid.bidcommon.bid.title.Reason').d('理由'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    rows={3}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    maxLength={200}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Form>
          </div>
        </CusModal>
      </>
    );
  }
}
