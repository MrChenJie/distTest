/**
 * index.js - 报名审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Row, Col, Card, Form, Input, Modal, Tooltip, LocaleProvider } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Link } from 'dva/router';
import EditTable from 'components/EditTable';
import { Header, Content } from 'components/Page';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import UploadFile from './UploadFile';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import CusNotification from '_cus_components/CusNotification';

const formlayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@Form.create({ fieldNameProp: null })
@connect(({ loading, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  fetchSourceList: loading.effects['contractMaintain/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceList'],
  confirmLoading: loading.effects['contractMaintain/issueTenders'],
  fetchLoading: loading.effects['contractMaintain/getSupplierApprovalTableList'],
  contractMaintain,
}))
@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'hzero.common'],
})
export default class ReginstrationApproval extends Component {
  state = {
    visible: false,
    supplierId: '',
    whetherFlag: false,
    visibleEmail: false,
    html: '',
  };

  componentDidMount() {
    this.fetchList(); // 查询数据
    this.fetchArea(); // 查询值集
  }

  @Bind()
  fetchArea() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/init',
    });
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
    if(record.blackFlag && flag) {
      CusNotification.error({
        message: intl
          .get(`bid.bidcommon.view.message.blacklist1${record.supplierName}`, {
          })
          .d(`供应商${record.supplierName}`) +
          intl.get(`bid.bidcommon.view.message.blacklist2`).d(`已被列入黑名单，无法参与公司的项目。`),
        closable: false,
      });
      return;
    }
    dispatch({
      type: 'contractMaintain/issueTenders',
      payload: {
        whether: flag,
        supplierId: record.id,
        reason: '',
      },
    }).then((res) => {
      if (res) {
        notification.success({
          message: intl.get('hzero.co1mmon.notification.success').d('发送成功'),
        });
        this.fetchList();
      }
    });
  }

  @Bind
  handleOk(record, flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/issueTenders',
      payload: {
        whether: flag,
        supplierId: record.id,
        reason: '',
      },
    }).then((res) => {
      if (res) {
        notification.success({
          message: intl.get('hzero.co1mmon.notification.success').d('发送成功'),
        });
        this.fetchList();
      }
    });
  }

  // 关闭弹出框
  @Bind
  onCancel() {
    this.setState({
      visible: false,
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
      confirmLoading,
      fetchLoading,
    } = this.props;
    const { dataRegistration, paginationApproval, enumMap = {} , checkFlag = false } = contractMaintain;
    const { visible = false, visibleEmail = false, html } = this.state;
    const { area = [] } = enumMap;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.contactor`).d('联系人'),
        dataIndex: 'contact',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.telephone`).d('电话'),
        dataIndex: 'contactinformation',
        width: 150,
      },
      {
        title: intl.get(`bid.biddashbord.view.title.mail`).d('电子邮箱'),
        dataIndex: 'mail',
        width: 150,
        render: (val, record) => {
          return (
            <Tooltip title={record.mail} placement="topLeft">
              <span>{record.mail}</span>
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.Region`).d('地区'),
        dataIndex: 'region',
        width: 150,
        render: (val, record) => {
          return (
            <Tooltip title={record.region} placement="topLeft">
              <span>{record.region}</span>
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.ClickRegistrationTime`).d('点击报名时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: (val, record) => {
          return (
            <Tooltip title={record.creationDate} placement="topLeft">
              <span>{record.creationDate}</span>
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.bid.button.WhetherToIssueTender`).d('是否发放标书'),
        dataIndex: 'processState',
        width: 150,
        render: (val, record) => {
          const operators = [];
          operators.push(
            {
              key: 'adopt',
              ele: (
                <a
                  onClick={() => {
                    this.handleClick(record, true);
                  }}
                  // disabled={record.isSendBiddingDocument !== null || record.isColludeBid !== null}
                  disabled={record.isSendBiddingDocument !== null}
                >
                  {intl.get('bid.bidcommon.bid.button.Adopt').d('通过')}
                </a>
              ),
              len: 3,
              title: intl.get('bid.bidcommon.bid.button.Adopt').d('通过'),
            },
            {
              key: 'noAdopt',
              ele: (
                <a
                  onClick={() => {
                    this.handleClick(record, false);
                  }}
                  disabled={record.isSendBiddingDocument !== null}
                >
                  {intl.get('bid.bidcommon.bid.button.NoAdopt').d('不通过')}
                </a>
              ),
              len: 4,
              title: intl.get('bid.bidcommon.bid.button.NoAdopt').d('不通过'),
            }
          );
          return operatorRender(operators, record);
        },
      },
      {
        title:
          intl.get('bid.bidcommon.bid.button.NoAdopt').d('不通过') +
          intl.get('bid.bidcommon.bid.title.Reason').d('理由'),
        dataIndex: 'isSendBiddingDocument',
        width: 150,
        render: (val, record) => {
          const operators = [];
          if (record.isSendBiddingDocument === 0) {
            operators.push({
              key: 'emailLook',
              ele: (
                <a onClick={() => this.openEmailDrawer(record)}>
                  {intl.get('hzero.common.status.1edit').d('邮件预览')}
                </a>
              ),
              len: 5,
              title: intl.get(`hzero.common.button.ed1t`).d('邮件预览'),
            });
          } else {
            return <span>-</span>;
          }
          return operatorRender(operators, record);
        },
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.TimeOfTenderIssuance`).d('发放标书时间'),
        dataIndex: 'sendBiddingDate',
        width: 150,
        render: (val, record) => {
          return (
            <Tooltip title={record.sendBiddingDate} placement="topLeft">
              <span>{record.sendBiddingDate}</span>
            </Tooltip>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.HasTheBidBeenDownloaded`).d('是否已经下载标书'),
        dataIndex: 'isDownloadBddingDocument',
        render: (value, record) => {
          return <div>{record.isDownloadBddingDocument === 0 ? intl.get(`bid.bidcommon.view.title.no`).d('否') : intl.get(`bid.bidcommon.view.title.yes`).d('是')}</div>;
        },
      },
      {
        title: intl.get(`bid.bidcommon.bid.title.DownloadTenderTime`).d('下载标书时间'),
        dataIndex: 'downloadBddingDocumentTime',
        width: 150,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'bidingDocumentFileUrls',
        width: 150,
        render: (value, record) => {
          return (
            <UploadFile
              onUploadSuccess={(item) => onUploadSuccess(item, record)}
              onDeleteSuccess={() => onDeleteSuccess(record)}
              tableName="SPUC_PO_CON_ATTACH"
              parentId={record.id}
              value={value}
              disabled
            />
          );
        },
      },
    ];

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    return (
      <Fragment>
        <Header>
          {
          // checkFlag &&
          <div style={{ marginRight: '16px' }}>
            <Button >
              <Link to={`${isPub ? '/pub' : ''}/sspo/online-purchase/registrationCheck/${this.props.match.params.proId}`}>
                {intl.get('bid.bidcommon.view.button.checkingcollusion').d('稽查串标')}
              </Link>
            </Button>
          </div>}
          <div style={{ marginRight: '16px' }}>
            <Button icon="sync" onClick={this.handleRefresh}>
              {intl.get('hzero.common.button.refresh').d('刷新')}
            </Button>
          </div>
        </Header>
        <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
          <Content>
            <Card
              key="contractHeaderInformation"
              id="registrantionInformation"
              className={DETAIL_CARD_CLASSNAME}
              bordered={false}
              title={
                <h3>{intl.get(`bid.bidcommon.bid.title.EssentialInformation`).d('基本信息')}</h3>
              }
            >
              <Form>
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item
                      {...formlayout}
                      label={intl
                        .get('bid.bidcommon.view.title.purchaseschemename')
                        .d('采购方案名称')}
                    >
                      <Tooltip
                        placement="topLeft"
                        trigger={['focus', 'hover']}
                        title={dataRegistration.proName}
                      >
                        {getFieldDecorator('proName', {
                          initialValue: dataRegistration.proName,
                        })(<Input disabled />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...formlayout}
                      label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                    >
                      <Tooltip
                        placement="topLeft"
                        trigger={['focus', 'hover']}
                        title={dataRegistration.packageName}
                      >
                        {getFieldDecorator('packageName', {
                          initialValue: dataRegistration.packageName,
                        })(<Input disabled />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...formlayout}
                      label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                    >
                      <Tooltip
                        placement="topLeft"
                        trigger={['focus', 'hover']}
                        title={dataRegistration.packageNo}
                      >
                        {getFieldDecorator('packageNo', {
                          initialValue: dataRegistration.packageNo,
                        })(<Input disabled />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...formlayout}
                      label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                    >
                      <Tooltip
                        placement="topLeft"
                        trigger={['focus', 'hover']}
                        title={dataRegistration.proCode}
                      >
                        {getFieldDecorator('proCode', {
                          initialValue: dataRegistration.proCode,
                        })(<Input disabled />)}
                      </Tooltip>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
            <EditTable
              rowKey="id"
              bordered
              columns={columns}
              dataSource={dataRegistration.bidSupplierProcessVos}
              pagination={paginationApproval}
              loading={fetchLoading}
              onChange={this.fetchList}
            />
          </Content>
        </LocaleProvider>
        {/* 查看邮件 */}
        <Modal
          title={intl.get('hitf.interfaces.view.button.ad1d').d('不通过理由')}
          visible={visibleEmail}
          destroyOnClose
          width="50%"
          footer={null}
          maskClosable
          onCancel={this.handleEmailCancel}
          cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
        >
          <div dangerouslySetInnerHTML={{ __html: html }}></div>
        </Modal>
      </Fragment>
    );
  }
}
