import React from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import {
  getCurrentUser,
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import dayjs from 'dayjs';
import queryString from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusTabs from '_cus_components/CusTabs';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusSpin from '_cus_components/CusSpin';
import BasicForm from './BasicForm';
import OtherTab from './OtherTabs';
import SummaryTab from './SummaryTabs';

const { Panel } = Collapse;
const { id } = getCurrentUser();
const prompt = 'spfmhk.mylink';

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['LINK.PARTNER_EVAL_ITEM', 'LINK.PARTNER_EVAL_SCORE'])
@connect(({ loading, partnerAssessmentSummaryModal }) => ({
  partnerAssessmentSummaryModal,
  qeuryLoading: loading.effects['partnerAssessmentSummaryModal/queryHeadInfo'] ||
    loading.effects['partnerAssessmentSummaryModal/queryList'] ||
    loading.effects['partnerAssessmentSummaryModal/getJudgesSummarySource'],
  saveLoading: loading.effects['partnerAssessmentSummaryModal/'],
  withdrawalRequestLoading: loading.effects['partnerAssessmentSummaryModal/handleWithdrawalRequest'] ||
  loading.effects['partnerAssessmentSummaryModal/generateCaseId'],
}))
export default class Detail extends React.Component {

  constructor(props) {
    super(props);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { formRecordId } =
      queryString.parse(location?.search?.substr(1)) || {};
    this.state = {
      formRecordId: formRecordId,
      isPub,
      activeKey: ['form'],
      activePanelKey: ['table'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      judgesSource: [],
      importModalVisible: false,
      exitApplyVisible: false,
    };
  }

  componentDidMount() {
    if (this.state.formRecordId) {
      this.queryHeadInfo();
    }
  }

  // 查询基本信息
  queryHeadInfo = (id) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'partnerAssessmentSummaryModal/queryHeadInfo',
      payload: {
        evalGatherId: formRecordId
      },
    }).then(res => {
      if (res) {
        this.setState({
          headerInfo: res
        }, () => {
          this.queryCooperationModel();
        })
      }
    })
  }

  // 查询合作模式
  queryCooperationModel = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'partnerAssessmentSummaryModal/queryCooperationModel',
      payload: {
        evalGatherId: formRecordId
      }
    }).then((res) => {
      if(res) {
        const summary = {
          partnerMode: intl.get(`${prompt}.field.halfyear.sum`).d('半年度汇总'),
          modeId: 'summary'
        }

        console.log('res?.evalGatherMode', res?.evalGatherMode);
        
        dispatch({
          type: 'partnerAssessmentSummaryModal/updateState',
          payload: {
            tabsItem: [
              ...(res?.evalGatherMode || []),
              summary
            ],
          }
        })
        this.setState({
          judgesActiveKey: res?.evalGatherMode[0].modeId ||'summary',
        }, () => {
          this.queryJudgesInfo(res?.evalGatherMode[0].modeId || 'summary');
        })
      }
    })
  }

  queryJudgesInfo = (activeKey) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'partnerAssessmentSummaryModal/getJudgesSummarySource',
      payload: {
        evalGatherId: formRecordId,
        partnerModeId: activeKey === 'summary' ? null : activeKey
      },
    }).then((res) => {
      if (res) {
        const { partnerEvalScore = [], partnerEvalScoreTitle = [], evalNo } = res;
        const newDataSource = partnerEvalScore.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'partnerAssessmentSummaryModal/updateState',
          payload: {
            judgesSource: newDataSource, // 评分数据
            partnerEvalItems: partnerEvalScoreTitle, // 评分项标题（列表表头循环使用）
            evalNo: evalNo,
          }
        })
      }
    });
  };

  // 详情导出
  handleOtherExport = () => {
    const { dispatch } = this.props;
    const { formRecordId, judgesActiveKey } = this.state;
    dispatch({
      type: 'partnerAssessmentSummaryModal/handleOtherExport',
      payload: {
        evalGatherId: formRecordId,
        partnerModeId: judgesActiveKey,
      }
    }).then(res => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`${prompt}.button.detail.export`).d('详情导出') + `(${dayjs().format('YYYY-MM-DD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          Promise.resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  // 半年度汇总tab退出申请
  handleWithdrawalRequest = () => {
    debugger
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'partnerAssessmentSummaryModal/handleWithdrawalRequest',
      payload: {
        evalGatherId: formRecordId,
      }
    }).then((res) => {
      if(res) {
        const newDataSource = res.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }))
        dispatch({
          type: 'partnerAssessmentSummaryModal/updateState',
          payload: {
            exitApplyDataSource: newDataSource
          }
        })
      }
    })
  }

  // 半年度汇总tab导出
  handleSummaryExport = () => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'partnerAssessmentSummaryModal/handleSummaryExport',
      payload: {
        evalGatherId: formRecordId,
      }
    }).then(res => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`${prompt}.field.halfyear.sum`).d('半年度汇总') + `(${dayjs().format('YYYY-MM-DD')})`;
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
          Promise.resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.xlsx`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  handleChangeTabs = (activeKey) => {
    debugger
    const { dispatch, partnerAssessmentSummaryModal } = this.props;
    this.setState({
      judgesActiveKey: activeKey
    }, () => {
      this.queryJudgesInfo(activeKey)
    })

  }

  closeModal = () => {
    this.setState({ exitApplyVisible: false })
  }

  handleExitApply = (record) => {
    const { APPROVAL_PROCESS } = process.env;
    if(record.caseId) {
      const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
      this.setState({
        exitApplyVisible: false
      }, () => {
        window.open(url, '_blank')
      });
    } else {
      // 后端发起致远流程，调用接口生成caseId
      this.generateCaseId(record);
    }
  }

  generateCaseId = (record) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    const { APPROVAL_PROCESS } = process.env;
    dispatch({
      type: 'partnerAssessmentSummaryModal/generateCaseId',
      payload: {
        evalGatherId: formRecordId,
        partnerId: record.partnerId,
      }
    }).then((res) => {
      if(res) {
        const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
        this.setState({
          exitApplyVisible: false
        }, () => {
          window.open(url, '_blank')
        });
      }
    })
  }

  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      saveLoading = false,
      withdrawalRequestLoading = false,
      partnerAssessmentSummaryModal,
    } = this.props;
    const { tabsItem = [], exitApplyDataSource = [] } = partnerAssessmentSummaryModal;
    const {
      activeKey,
      selectedRowKeys,
      headerInfo,
      headId,
      formRecordId,
      judgesSource,
      judgesActiveKey,
      importModalVisible = false,
      importUploading = false,
      activePanelKey,
      exitApplyVisible = false,
    } = this.state;

    // 申请状态 = 审批中 （不可编辑单据）
    const readyOnly = ['Inapproval', 'Approved'].includes(headerInfo?.applyStatus) || (headerInfo?.createdBy && headerInfo?.createdBy !== id);
    console.log(headerInfo)
    const basicFormProps = {
      ...this.props,
      headerInfo,
      detailList,
      idpValueMap,
      onRef: (ref) => {
        this.basicForm = ref.props.form;
      },
    };
    const rowSelection = {
      selectedRowKeys,
      columnWidth: 50,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const otherTabProps = {
      ...this.props,
      handleOtherExport: this.handleOtherExport,
    };

    const summaryTabProps = {
      ...this.props,
      handleWithdrawalRequest: () => {
        this.setState({
          exitApplyVisible: true
        }, () => {
          this.handleWithdrawalRequest();
        })
      },
      handleSummaryExport: this.handleSummaryExport,
    };

    console.log('tabsItem', tabsItem);

    const exitApplyColumns = [
      {
        title: intl.get(`${prompt}.field.partner.name`).d('合作伙伴名称'),
        dataIndex: 'partnerName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.field.score`).d('得分'),
        dataIndex: 'evalScore',
        width: 130,
      },
      {
        title: intl.get(`${prompt}.field.level`).d('等级'),
        dataIndex: 'evalGrade',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 120,
        render: (_, record) => {
          return (
            <>
              <CusButton
                type="plain"
                onClick={() => this.handleExitApply(record)}
              >
                {intl.get(`${prompt}.button.exit.apply`).d('退出申请')}
              </CusButton>
            </>
          )
        },
      }
    ];

    return (
      <PageWrapper loading={qeuryLoading || saveLoading}>
        <Collapse
          className="customize-collapse"
          bordered={false}
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
                title={intl.get(`${prompt}.view.title.basicinfo`).d('基本信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <BasicForm {...basicFormProps} />
          </Panel>
        </Collapse>

        <div style={{ paddingBottom: '16px' }} />

        <CusTabs
          isInit={false}
          activeKey={judgesActiveKey}
          defaultActiveKey={judgesActiveKey}
          onChange={(activeKey) => {
            this.handleChangeTabs(activeKey)
          }}
          items={tabsItem.map((item) => ({
            label: item.partnerMode,
            key: item.modeId,
            children: (
              <div style={{ padding: ' 0px 16px 16px' }}>
                <Collapse
                  className="customize-collapse"
                  defaultActiveKey={activePanelKey}
                  onChange={(collapseKeys) => {
                    this.setState({ activePanelKey: collapseKeys });
                  }}
                >
                  <Panel
                    showArrow={false}
                    collapsible="disabled"
                    header={
                      <PanelHeader
                        showArrow={false}
                        title={intl.get(`${prompt}.field.summary.detail`).d('汇总详情')}
                        arrowActive={activePanelKey.includes('table')}
                      />
                    }
                    key="table"
                  >
                    {item?.modeId === 'summary' ? (
                      <SummaryTab {...summaryTabProps} />
                    )
                      : (
                      <OtherTab {...otherTabProps} />
                    )
                    }
                  </Panel>
                </Collapse>
              </div>
            )
          }))}
        />
        <CusModal
          width={800}
          title={intl.get(`${prompt}.button.exit.apply`).d('退出申请')}
          visible={exitApplyVisible}
          onCancel={this.closeModal}
          footer={
            <>
              <CusButton onClick={this.closeModal}>
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
        >
          <CusSpin spinning={withdrawalRequestLoading}>
            <CusTable
              rowKey="rowKey"
              columns={exitApplyColumns}
              dataSource={exitApplyDataSource}
              rowSelection={false}
              pagination={false}
            />
          </CusSpin>
        </CusModal>
      </PageWrapper>
    );
  }
}
