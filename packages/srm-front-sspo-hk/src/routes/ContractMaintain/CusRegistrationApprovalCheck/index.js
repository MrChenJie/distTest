/**
 * index.js - 报名审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import EditTable from '_cus_components/EditTable';
import { getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Row, Col, Collapse, Input, Tooltip, Select } from 'antd';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { largeScreenWidth } from '_cus_utils/constants';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusSelect from '_cus_components/CusSelect';
import { tooltipRender } from '_cus_utils/render';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';

const screenWidth = window.screen.width;
const { Panel } = Collapse;

@Form.create({ fieldNameProp: null })
@connect(({ loading, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  fetchSourceList: loading.effects['contractMaintain/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceList'],
  fetchLoading: loading.effects['contractMaintain/getSupplierApprovalTableList'],
  contractMaintain,
}))
@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'hzero.common'],
})
export default class ReginstrationApproval extends Component {
  state = {
    activeKey: ['form', 'table']
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

  // 保存
  @Bind
  handleSave() {
    const { dispatch, contractMaintain } = this.props;
    const { checkList } = contractMaintain
    const params = getEditTableData(checkList)
    dispatch({
      type: 'contractMaintain/checkColludeBidSave',
      payload: [...params]
    }).then((res) => {
      if (res) {
        CusNotification.success({
          message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
        });
        this.fetchList();
      }
    })

  }

  render() {
    const {
      contractMaintain,
      form: { getFieldDecorator },
      fetchLoading,
    } = this.props;
    const { dataRegistration, checkList, enumMap = {} } = contractMaintain;
    const { activeKey } = this.state;
    const { checkListFlag = [] } = enumMap;
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
        width: 350,
        render: tooltipRender,
      },
      {
        title: intl.get(`bid.bidcommon.view.title.situation`).d('情形'),
        dataIndex: 'situation ',
        width: 380,
        render: (_, record) => {
          return (
            tooltipRender(record.situation === 'Y' ?
            dataRegistration.proInfoWording ?
            intl.get(`bid.bidcommon.view.message.situation`).d('不同投标人委托同一单位或者个人办理投标事宜')
            :
            intl.get(`bid.bidcommon.view.message.situationnew`).d('不同应答人委托同一单位或者个人办理应答事宜')
            : '-')
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.checkpoint`).d('检查点'),
        dataIndex: 'checkPoint ',
        width: 500,
        render: (_, record) => {
          return (
            tooltipRender(record.checkPoint === 'Y' ?
            dataRegistration.proInfoWording ?
            intl.get(`bid.bidcommon.view.message.checkpoint`).d('投标联系人（或授权代表人）姓名、联系方式一致')
            :
            intl.get(`bid.bidcommon.view.message.checkpointnew`).d('应答联系人（或授权代表人）姓名、联系方式一致')
            : '-')
          )
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.identificationresult`).d('是否认定串标行为'),
        dataIndex: 'identificationResult ',
        width: 180,
        render: (_, record) => {
          if (record.$form != undefined) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`identificationResult`, {
                  initialValue: record.identificationResult != undefined ? record.identificationResult : '',
                })(
                  <CusSelect
                    allowClear
                    style={{ minWidth: 120 }}
                    disabled={record.checkSubmitState === 'y'}
                    options={checkListFlag}
                  >
                  </CusSelect>
                )}
              </Form.Item>
            )
          }
        }
      },
    ];

    const gridSpan = getDFormGridSpan();
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
                <GenerateFormGrid isPackUp={false}>
                  <Col { ...gridSpan }>
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
                  <Col { ...gridSpan }>
                    <Form.Item
                        label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                    >
                      {getFieldDecorator('packageName', {
                        initialValue: dataRegistration.packageName,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col { ...gridSpan }>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                    >
                      {getFieldDecorator('packageNo', {
                        initialValue: dataRegistration.packageNo,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                  <Col { ...gridSpan }>
                    <Form.Item
                      label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                    >
                      {getFieldDecorator('proCode', {
                        initialValue: dataRegistration.proCode,
                      })(<Input disabled />)}
                    </Form.Item>
                  </Col>
                </GenerateFormGrid>
              </Form>
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.button.checkingcollusionD`).d('稽查串标详情')}
                  arrowActive={activeKey.includes('table')}
                />
              }
              key="table"
            >
              <EditTable
                rowKey="id"
                columns={columns}
                dataSource={checkList}
                pagination={false}
              />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons>
          <CusButton onClick={this.handleSave}  >
            {intl.get('hzero.common.button.save').d('保存')}
          </CusButton>
        </CusApprovalButtons>
      </>
    );
  }
}
