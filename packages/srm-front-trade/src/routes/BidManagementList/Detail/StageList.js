/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 17:18:09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Row, Col, Input } from 'antd';
import uuidv4 from 'uuid/v4';
import CusTable from '_cus_components/CusTable';
import CusSpin from '_cus_components/CusSpin';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusNotification from '_cus_components/CusNotification';
import { createPagination, getCurrentUser, tableScrollWidth, getDateTimeFormat } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import dayjs from 'dayjs';
import moment from 'moment';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
import EmailSendList from './EmailSendList';
import PayTradeList from './PayTradeList';

@Form.create()
export default class StageList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      editTimeVisible: false,
      milStoneId: '',
      payTradeVisible: false,
    }
  }

  // 预览
  handlePreview = (page = {}, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidManagementListModal/queryTradersListDetail',
      payload: {
        page,
        refHeadId: record?.refHeadId,
      },
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        this.setState({
          visible: true
        }, () => {
          dispatch({
            type: 'bidManagementListModal/updateState',
            payload: {
              emailDataSource: newDataSource,
              emailPagination: pagination,
              recordLine: record, // 预览阶段当前行数据
            },
          });
        })
      }
    })
  }

  // 全部发送
  handleSendAll = (record) => {
    const {
      dispatch,
      onSearch = (e) => e,
    } = this.props;
    dispatch({
      type: 'bidManagementListModal/handleSendAllEmail',
      payload: {
        refHeadId: record?.refHeadId,
      },
    }).then((res) => {
      if(res) {
        CusNotification.success({
          message: intl.get(`demoTitle1`).d('发送成功')
        })
        onSearch();
      }
    })
  }

  // 编辑时间
  handleEditTime = (record) => {
    const { form } = this.props;
    form.setFieldsValue({
      editTime: record?.milEndTime,
    })
    this.setState({
      editTimeVisible: true,
      milStoneId: record?.id
    })
  }

  // 进入
  handleLink = (record) => {
    const { headerInfo } = this.props;
    const templateCode = 'BPM_SCM_HDSQSP'; // 致远templateCode
    // 有caseId，在流程中，走这个link
    if(headerInfo.winCaseId) {
      const url = `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${headerInfo.winCaseId}`
      window.open(url, '_blank');
    } else {
      // 起草调用
      const url = `${
        process.env.APPROVAL_PROCESS
      }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
        `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/platform/quotation/Detail?activeId=${record.refHeadId}`
      )}`;
      window.open(url, '_blank');
    }
  }

  // 编辑时间确认
  handleOkTime = () => {
    const { dispatch, form, onChange = (e) => e } = this.props;
    const { milStoneId } = this.state;
    const params = form?.getFieldsValue();
    dispatch({
      type: 'bidManagementListModal/saveEditTime',
      payload: {
        id: milStoneId,
        milEndTime: dayjs(params?.milEndTime).format(DEFAULT_DATETIME_FORMAT),
      },
    }).then((res) => {
      if(res) {
        this.setState({
          editTimeVisible: false
        }, () => {
          onChange();
        })
      }
    })
  }

  // 付款详情
  handlePayDetail = (page = {}) => {
    const { dispatch, match }  =this.props;
    dispatch({
      type: 'bidManagementListModal/getPayTrade',
      payload: {
        page,
        refHeadId: match.params?.formRecordId
      },
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        this.setState({
          payTradeVisible: true
        }, () => {
          dispatch({
            type: 'bidManagementListModal/updateState',
            payload: {
              payTradeDataSource: newDataSource,
              payTradePagination: pagination,
            },
          });
        })
      }
    })
  }

  onSearchSupplierList = () => {
    const { onSearch = (e) => e } = this.props;
    onSearch();
  }

  render() {
    const {
      form,
      headerInfo,
      bidManagementListModal,
      tradeLoading = false,
      payTradeLoading = false,
      onChange = (e) => e,
    } = this.props;

    const { visible, editTimeVisible, payTradeVisible } = this.state;

    const { getFieldDecorator } = form;

    const {
      stageDetailSource,
      stageDetailPagination,
    } = bidManagementListModal;

    const columns = [
      {
        title: intl.get(`spfmhk.trade.view.title.ActStatus`).d('状态'),
        dataIndex: 'statusTryMeaning',
        width: 110,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.view.title.ActStage`).d('阶段安排'),
        dataIndex: 'milCodeTryMeaning',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.view.title.StageDeadline`).d('本阶段截止时间'),
        dataIndex: 'milEndTime',
        width: 140,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.view.title.Operation`).d('操作'),
        dataIndex: 'operator',
        width: 160,
        render: (_, record) => {
          console.log('quoteEndTime', dayjs().isBefore(headerInfo?.quoteEndTime));
          return (
            <>
              {record.milCode === 'InvitLetter' && <div>
                {['Inprogress', 'Completed'].includes(record.status) && <CusButton
                  type="plain"
                  onClick={() => this.handlePreview(_, record)}
                  style={{marginRight: '16px'}}
                >
                  {intl.get('spfmhk.trade.button.Preview').d('预览')}
                </CusButton>}
                {record?.status === 'Inprogress' && <CusButton
                  type="plain"
                  onClick={() => this.handleSendAll(record)}
                >
                  {intl.get('spfmhk.trade.button.SendAll').d('全部发送')}
                </CusButton>}
              </div>}
              {record.milCode === 'QuotaSub' && <div>
                {['NotStart', 'Inprogress'].includes(record.status) && <CusButton
                  type="plain"
                  onClick={() => this.handleEditTime(record)}
                  style={{marginRight: '16px'}}
                >
                  {intl.get('spfmhk.trade.button.EditTime').d('编辑时间')}
                </CusButton>}
                {['Completed'].includes(record.status) && <CusButton
                  type="plain"
                  onClick={() => this.handleLink(record)}
                >
                  {intl.get('spfmhk.trade.button.EntryDetails').d('进入详情')}
                </CusButton>}
              </div>}
              {record.milCode === 'Result' && ['PendingPay', 'Completed'].includes(headerInfo?.actStatus) && <CusButton
                type="plain"
                onClick={() => this.handlePayDetail()}
              >
                {intl.get('spfmhk.trade.field.paydetail').d('付款详情')}
              </CusButton>}
            </>
          )
        },
      },
    ];

    const emailSendListProps = {
      ...this.props,
      onSearchSupplierList: this.onSearchSupplierList
    }

    const payTradeListProps = {
      ...this.props
    }

    console.log('milEndTime', form.getFieldValue('milEndTime'))

    return (
      <>
        <CusTable
          rowKey="rowKey"
          columns={columns}
          dataSource={stageDetailSource}
          pagination={stageDetailPagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
        <CusModal
          title={intl.get('demoTitle1').d('邮件发送')}
          visible={visible}
          onCancel={() => {
            this.setState({
              visible: false
            })
          }}
          width={600}
          footer={
            <>
              <CusButton
                onClick={() => {
                  this.setState({
                    visible: false
                  })
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
          destroyOnClose
        >
          <CusSpin spinning={tradeLoading}>
            <EmailSendList {...emailSendListProps} />
          </CusSpin>
        </CusModal>
        <CusModal
          title={intl.get('spfmhk.trade.button.EditTime').d('编辑时间')}
          visible={editTimeVisible}
          onOk={this.handleOkTime}
          destroyOnClose
          onCancel={() => {
            this.setState({
              editTimeVisible: false,
            })
          }}
        >
          <Form className="customize-form">   
            <Row>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.button.EditTime`).d('编辑时间')}
                >
                  {getFieldDecorator('milEndTime', {
                    initialValue: dayjs(moment(form.getFieldValue('editTime')).format(DEFAULT_DATETIME_FORMAT)),
                  })(
                    <CusDatePicker
                      showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </CusModal>

        <CusModal
          title={intl.get('spfmhk.trade.field.paydetail').d('付款详情')}
          visible={payTradeVisible}
          onCancel={() => {
            this.setState({
              payTradeVisible: false
            })
          }}
          width={600}
          footer={
            <>
              <CusButton
                onClick={() => {
                  this.setState({
                    payTradeVisible: false
                  })
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
          destroyOnClose
        >
          <CusSpin spinning={payTradeLoading}>
            <PayTradeList {...payTradeListProps} />
          </CusSpin>
        </CusModal>
      </>
    );
  }
}
