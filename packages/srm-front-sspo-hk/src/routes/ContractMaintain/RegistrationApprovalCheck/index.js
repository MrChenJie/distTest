/**
 * index.js - 报名审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Row, Col, Card, Form, Input, Modal, Tooltip, LocaleProvider, Select } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { Header, Content } from 'components/Page';
import { getCurrentLanguage, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import UploadFile from './UploadFile';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

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
      type: 'contractApproval/fetchDetailEnum',
    });
    dispatch({
      type: 'contractMaintain/getSupplierApprovalTableList',
      payload: {
        proId: proId,
        page,
      },
    });
    dispatch({
      type: 'contractMaintain/checkColludeBidQuery',
      payload: {
        proId: proId,
      },
    });
  }

  // 发放标书
  @Bind()
  handleClick(record, flag) {
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
  handleRefresh(flag) {
    const { dispatch, contractMaintain, match } = this.props;
    const { proId } = match.params;
    const { checkList } = contractMaintain
    const params = getEditTableData(checkList)
    dispatch({
      type: 'contractMaintain/checkColludeBidSave',
      payload: [...params]
    }).then((res) => {
      if (res) {
        if (flag) {
          dispatch({
            type: 'contractMaintain/checkColludeBidSubmit',
            payload: {
              proId: proId,
            },
          }).then(e => {
            if (e) {
              notification.success();
            }
          });
        } else {
          notification.success({
            message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
          });
        }
        this.fetchList();
      }
    })

  }

  render() {
    const {
      contractMaintain,
      form: { getFieldDecorator },
      confirmLoading,
      fetchLoading,
    } = this.props;
    const { dataRegistration, checkList, enumMap = {} } = contractMaintain;
    const { visible = false, visibleEmail = false, html } = this.state;
    const { checkListFlag = [] } = enumMap;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
        render:(val) =>{
          return (
            <Form.Item>
                <Tooltip
                  placement="topLeft"
                  trigger={['focus', 'hover']}
                  title={val}
                >
                  {val}
                </Tooltip>
              </Form.Item>
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.contactor`).d('联系人'),
        dataIndex: 'contact',
        width: 350,
        render:(val) =>{
          return (
            <Form.Item>
                <Tooltip
                  placement="topLeft"
                  trigger={['focus', 'hover']}
                  title={val}
                >
                  {val}
                </Tooltip>
              </Form.Item>
          )
        }
      },
      // {
      //   title: intl.get(`bid.bidcommon.view.title.telephone`).d('电话'),
      //   dataIndex: 'contactinformation',
      //   width: 150,
      // },
      {
        title: intl.get(`bid.bidcommon.view.title.situation`).d('情形'),
        dataIndex: 'situation ',
        width: 380,
        render: (val, record) => {
          if (record.situation === 'Y') {
            return (
              <Form.Item>
                <Tooltip
                  placement="topLeft"
                  trigger={['focus', 'hover']}
                  title={dataRegistration.proInfoWording ? 
                    intl.get(`bid.bidcommon.view.message.situation`).d('不同投标人委托同一单位或者个人办理投标事宜')
                    : intl.get(`bid.bidcommon.view.message.situationnew`).d('不同应答人委托同一单位或者个人办理应答事宜')}
                >
                  {dataRegistration.proInfoWording ? 
                    intl.get(`bid.bidcommon.view.message.situation`).d('不同投标人委托同一单位或者个人办理投标事宜')
                    : intl.get(`bid.bidcommon.view.message.situationnew`).d('不同应答人委托同一单位或者个人办理应答事宜')}
                </Tooltip>
              </Form.Item>
            )
          } else {
            return (
              <Form.Item>
                -
              </Form.Item>
            )
          }

        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.checkpoint`).d('检查点'),
        dataIndex: 'checkPoint ',
        width: 380,
        render: (val, record) => {
          if (record.checkPoint === 'Y') {
            return (
              <Form.Item>
                <Tooltip
                  placement="topLeft"
                  trigger={['focus', 'hover']}
                  title={dataRegistration.proInfoWording ? 
                    intl.get(`bid.bidcommon.view.message.checkpoint`).d('投标联系人（或授权代表人）姓名、联系方式一致')
                    : intl.get(`bid.bidcommon.view.message.checkpointnew`).d('应答联系人（或授权代表人）姓名、联系方式一致')}
                >
                  {dataRegistration.proInfoWording ? 
                    intl.get(`bid.bidcommon.view.message.checkpoint`).d('投标联系人（或授权代表人）姓名、联系方式一致')
                    : intl.get(`bid.bidcommon.view.message.checkpointnew`).d('应答联系人（或授权代表人）姓名、联系方式一致')}
                </Tooltip>
              </Form.Item>
            )
          } else {
            return (
              <Form.Item>
                -
              </Form.Item>
            )
          }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.identificationresult`).d('是否认定串标行为'),
        dataIndex: 'identificationResult ',
        width: 350,
        render: (text, record, index) => {
          if (record.$form != undefined) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`identificationResult`, {
                  initialValue: record.identificationResult != undefined ? record.identificationResult : '',
                  // validateTrigger: 'onChange',
                  // rules: [
                  //   {
                  //     required: true,
                  //     message: intl.get('hzero.common.validation.notNull', {
                  //       name: intl.get(`bid.bidcommon.view.title.whetherthebidwaswon`).d('是否中选'),
                  //     })
                  //   }
                  // ]
                })(
                  <Select allowClear style={{ minWidth: 120 }} disabled={record.checkSubmitState === 'y'}
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                  // onChange={(value, lovRecord) => { this.changeChosen(value, lovRecord, record, index); this.handleDataChange() }}
                  >
                    {checkListFlag.map((n) => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )
          }
        }
      },

    ];

    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    return (
      <Fragment>
        <Header>

          <div style={{ marginRight: '16px' }}>
            <Button onClick={() => this.handleRefresh(false)}  >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
          {/* <div style={{ marginRight: '16px' }} >
            <Button onClick={() => this.handleRefresh(true)} type="primary">
              {intl.get(`hzero.common.button.submit`).d('提交')}
            </Button>
          </div> */}
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
              dataSource={checkList}
              pagination={false}
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
