import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Form, Collapse } from 'antd';
import { fastCodeLoader } from '@/utils/decorators';
import { map, omit } from 'lodash';
import cusRequest from '_cus_utils/request';
import dayjs from 'dayjs';
import {
  getEditTableData,
  createPagination,
  getCurrentUser,
  getCurrentOrganizationId
} from 'utils/utils';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { handleImport } from '@/services/partnerAssessmentService';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusTabs from '_cus_components/CusTabs';
import CusNotification from '_cus_components/CusNotification';
import ImportModal from '_cus_components/CusModal/ImportModal';
import BasicForm from './BasicForm';
import DetailList from './DetailList';

const { Panel } = Collapse;
const prompt = 'spfmhk.mylink';
const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['LINK.PARTNER_EVAL_ITEM', 'LINK.PARTNER_EVAL_SCORE'])
@connect(({ loading, partnerAssessmentModal }) => ({
  partnerAssessmentModal,
  qeuryLoading: loading.effects['partnerAssessmentModal/queryHeadInfo'] ||
    loading.effects['partnerAssessmentModal/getJudgesSource'],
  saveLoading: loading.effects['partnerAssessmentModal/saveJudges'],
  exportLoading: loading.effects['partnerAssessmentModal/handleExport'],
}))
export default class Detail extends React.Component {

  constructor(props) {
    super(props);
    window.parent?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', this.handleClickBtn);
    const {
      location,
    } = this.props;
    const isPub = location.pathname.includes('/pub'); // 判断是否为pub页面
    const { formRecordId, activityCode } =
      queryString.parse(location?.search?.substr(1)) || {};
    this.state = {
      formRecordId: formRecordId,
      activityCode: activityCode,
      isPub,
      activeKey: ['form'],
      templateCode: 'TRADE_PRODUCT_IMPORT',
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {},
      productVisible: false,
      judgesSource: [],
      importModalVisible: false,
      judgesActiveKey: activityCode === '04' ? 'MANAGER' : 'SALES_MAN',
    };
  }

  componentDidMount() {
    if (this.state.formRecordId) {
      this.queryHeadInfo();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleClickBtn);
  }

  /**
   * @name: 监听事件 - 监听致远点击按钮
   * @param {object} e
   */
  handleClickBtn = (e) => {
    console.log('监听的message', e);
    const { submitType, messageType, url } = e.data || {};

    const handlePostMessage = (params) => {

      window.parent?.postMessage(
        {
          success: true,
          submitType: submitType,
          messageType: messageType,
          formData: {
            formRecordId: params?.formRecordId,
            // subject: params?.subject,
            ...params,
          },
        },
        url,
      );
    };

    if (e.data.messageType === 'GET_FORM_DATA') {
      if (['DRAFT_HANDLE', 'SEND', 'SUBMIT'].includes(submitType)) {
        // 保存 提交
        this.handleSave((params) => {
          console.log('save&submit', params);
          if (params) {
            handlePostMessage({
              formRecordId: params?.formRecordId,
              // subject: params?.subject,
              ...params,
            });
          }
        });
      } else {
        // 其他按钮
        handlePostMessage();
      }
    }
  };

  // 查询基本信息
  queryHeadInfo = () => {
    const { dispatch } = this.props;
    const { formRecordId, judgesActiveKey } = this.state;
    dispatch({
      type: 'partnerAssessmentModal/queryHeadInfo',
      payload: {
        id: formRecordId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          headerInfo: res
        }, () => {
          this.queryJudgesInfo(judgesActiveKey);
        })
      }
    })
  }

  queryJudgesInfo = (activeKey) => {
    const { dispatch } = this.props;
    const { formRecordId } = this.state;
    dispatch({
      type: 'partnerAssessmentModal/getJudgesSource',
      payload: {
        evalId: formRecordId,
        currentUserId: activeKey === 'MANAGER' ? null : getCurrentUser()?.id,
        tabType: activeKey,
      },
    }).then((res) => {
      if (res) {
        const { partnerEvalScore = [], partnerEvalScoreTitle = [] } = res;
        const newDataSource = partnerEvalScore.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'partnerAssessmentModal/updateState',
          payload: {
            judgesSource: newDataSource, // 评分数据
            partnerEvalItems: partnerEvalScoreTitle, // 评分项标题（列表表头循环使用）
          }
        })
      }
    });
  };

  handleExport = () => {
    const { dispatch } = this.props;
    const { formRecordId, judgesActiveKey } = this.state;
    dispatch({
      type: 'partnerAssessmentModal/handleExport',
      payload: {
        evalId: formRecordId,
        currentUserId: getCurrentUser()?.id,
        tabType: judgesActiveKey,
      }
    }).then(res => {
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = intl.get(`${prompt}.button.template.export`).d('模版导出') + `(${dayjs().format('YYYY-MM-DD')})`;
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

  /**
   * @name: 操作 - 上传文件
   * @param {array} payFileList 上传文件列表
   */
  payUpload = async (payFileList = []) => {
    const { dispatch } = this.props;
    const { formRecordId, judgesActiveKey } = this.state;
    const formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    this.setState({
      importUploading: true,
    });
    const params = {
      currentUserId: getCurrentUser()?.id,
      tabType: judgesActiveKey,
    }
    const res = await handleImport(formData, formRecordId, params);
    debugger
    // 判断返回的值是不是JSON格式的字符串
    if (res) {
      const { failed, message, payload = [] } = res;
      if (failed) {
        CusNotification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: message,
        });
        this.setState({ importUploading: false });
      } else {
        const newDataSource = payload.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        dispatch({
          type: 'partnerAssessmentModal/updateState',
          payload: {
            judgesSource: newDataSource, // 评分数据
            changeJudgesSource: newDataSource, // 导入后改过的评分数据，防止切换后数据被刷新
          }
        })
        this.setState({
          importUploading: false,
          importModalVisible: false,
        });
      }
    }
    this.setState({ importUploading: false });
  };

  handleChangeTabs = (activeKey) => {
    const { dispatch, partnerAssessmentModal } = this.props;
    const { activityCode } = this.state;
    const { changeJudgesSource = []} = partnerAssessmentModal
    this.setState({
      judgesActiveKey: activeKey
    }, () => {
      if(!((activityCode === '04' ? 'MANAGER' : 'SALES_MAN') === activeKey)) {
        this.queryJudgesInfo(activeKey);
      } else {
        if(changeJudgesSource.length > 0) {
          const newDataSource = changeJudgesSource.map((item) => ({
            ...item,
            rowKey: uuidv4(),
            _status: 'update',
          }));
          dispatch({
            type: 'partnerAssessmentModal/updateState',
            payload: {
              judgesSource: newDataSource, // 评分数据
            }
          })
        } else {
          this.queryJudgesInfo(activeKey);
        }
      }
    })
  }

  @Bind()
  handleSave = (callback) => {
    const { dispatch, partnerAssessmentModal } = this.props;
    const { judgesSource } = partnerAssessmentModal;
    const { formRecordId, judgesActiveKey } = this.state;
    const judgeData = getEditTableData(judgesSource, 'rowKey');
    if(judgeData.length > 0) {
      const newJudgeData = map(judgeData, (item) => ({
        // 由于是动态的，后端无法接收所有参数，所以删除对象中的这些字段
        ...omit(item, ['totalScore', 'rowKey', 'salesPerson', '_status', 'partnerName', 'partnerId', 'evalUserId', 'evalScoreSum', 'evalId']),
      }));
      debugger
      dispatch({
        type: 'partnerAssessmentModal/saveJudges',
        payload: {
          list: newJudgeData,
        },
      }).then((res) => {
        debugger
        if(res) {
          if (typeof callback === 'function') {
            callback({
              formRecordId,
              // subject: `标题测试`,
            });
          }
          this.queryJudgesInfo(judgesActiveKey)
        }
      })
    }
  }

  render() {
    const {
      qeuryLoading = false,
      detailList = {},
      idpValueMap,
      saveLoading = false,
      exportLoading = false,
    } = this.props;
    const {
      activeKey,
      selectedRowKeys,
      headerInfo,
      headId,
      formRecordId,
      activityCode,
      judgesSource,
      judgesActiveKey,
      importModalVisible = false,
      importUploading = false,
    } = this.state;

    // 申请状态 = 审批中 || 第三人查看 || 流程中的人员只能查看自己的tab （不可编辑单据）
    const readyOnly = !activityCode || headerInfo.evalStatus === 'Approved' || (judgesActiveKey !== (activityCode === '04' ? 'MANAGER' : 'SALES_MAN'));
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

    console.log('judgesActiveKey', judgesActiveKey, activityCode);
    
    const detailListProps = {
      ...this.props,
      judgesSource,
      readyOnly,
      basicForm: this.basicForm?.getFieldsValue(),//列表中的评委需要限制在basicForm中的部门里
      onRef: (ref) => {
        this.detailListForm = ref.props.form;
      },
      onChange: (page) => {
        this.queryJudgesInfo(page, (formRecordId || headId));
      },

      handleExport: this.handleExport,
      handleImport: () => {
        this.setState({ importModalVisible: true });
      },
      judgesActiveKey,
    };

    return (
      <PageWrapper loading={qeuryLoading || saveLoading || exportLoading}>
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
          activeKey={judgesActiveKey}
          defaultActiveKey={judgesActiveKey}
          onChange={(activeKey) => {
            this.handleChangeTabs(activeKey)
          }}
          items={[
            {
              label: intl.get(`${prompt}.field.user.score`).d('业务员打分'),
              key: 'SALES_MAN',
              children: (
                <div style={{ padding: '0px 16px' }}>
                  <DetailList {...detailListProps} />
                </div>
              ),
            },
            {
              label: intl.get(`${prompt}.field.manage.score`).d('经理打分'),
              key: 'MANAGER',
              children: (
                <div style={{ padding: '0px 16px' }}>
                  <DetailList {...detailListProps} />
                </div>
              )
            }
          ]}
        />
        
        <ImportModal
          visible={importModalVisible}
          onCancel={() => this.setState({ importModalVisible: false })}
          importUploading={importUploading}
          payUpload={this.payUpload}
        />
      </PageWrapper>
    );
  }
}
