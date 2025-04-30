import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';

import { getDateFormat } from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import BasicData from './BasicData';
import QuestionListTable from './QuestionListTable';
import notification from '_cus_components/CusNotification';
import queryString from 'querystring';

const { Panel } = Collapse;
const dateFormat = getDateFormat();
const commonPrompt = 'spfmhk.dict';

@formatterCollections({ code: ['spfmhk.dict'] })
@fastCodeLoader(['DICT.QUESTION_REPLY_STATUS', 'DICT.QUESTION_TYPE'])
@connect(({ loading, qaManagementModel }) => ({
  qaManagementModel,
  partnerInfo: qaManagementModel?.partnerInfo,
  queryLoading:
    loading.effects['qaManagementModel/getPartnerInfo'] ||
    loading.effects['qaManagementModel/queryQAList'],
  saveLoading:
    loading.effects['qaManagementModel/saveQAList'] ||
    loading.effects['qaManagementModel/subQAList'],
  dataSource: qaManagementModel?.dataSource,
  pagination: qaManagementModel?.pagination,
}))
class Detail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['basicData', 'table'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      selectedRowKeys: [],
      selectedRows: [],
      isEdit: true,
    };
  }

  componentDidMount() {
    // this.handleSearch();
    this.getPartnerInfo();
  }

  // 获取基本信息
  getPartnerInfo() {
    const { dispatch, location } = this.props;
    const { search = '' } = location;
    const { qaId } = queryString.parse(search?.substring(1));

    dispatch({
      type: 'qaManagementModel/getPartnerInfo',
      payload: {
        qaId,
      },
    }).then((res) => {
      if (res.replyStatus === 'COMPLETED') {
        this.setState({ isEdit: false });
      }
      // this.handleSearch();
    });
  }

  // // 获取列表
  // handleSearch = (page = {}) => {
  //   const { dispatch, location } = this.props;
  //   const { search = '' } = location;
  //   const { qaId } = queryString.parse(search?.substring(1));
  //   dispatch({
  //     type: 'qaManagementModel/queryQAList',
  //     payload: {
  //       page,
  //       qaId,
  //     },
  //   });
  // };

  // 保存列表
  handleSave = () => {
    const { dispatch, dataSource } = this.props;
    let data = {};
    if (dataSource.length) {
      data = dataSource[0];
    } else {
      return false;
    }

    dispatch({
      type: 'qaManagementModel/saveQAList',
      payload: {
        ...data,
      },
    }).then((res) => {
      if (res) {
        notification.success({
          message: intl.get('hzero.common.notification.success.save').d('保存成功'),
        });
        this.getPartnerInfo();
      }
    });
  };

  // 提交列表
  handleSubmit = () => {
    const { dispatch, dataSource } = this.props;
    let data = {};
    if (dataSource.length) {
      data = dataSource[0];
    } else {
      return false;
    }
    dispatch({
      type: 'qaManagementModel/subQAList',
      payload: {
        ...data,
      },
    }).then((res) => {
      if (res) {
        notification.success({
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        this.getPartnerInfo();
      }
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue(true);

    return {
      ...fieldsValue,
    };
  };

  render() {
    const {
      queryLoading = false,
      idpValueMap = {},
      location = { search },
      match,
      dataSource,
      partnerInfo,
      saveLoading,
    } = this.props;
    const { search = '' } = location;
    const { qaId, type } = queryString.parse(search?.substring(1));
    let isAnswer = true;
    if (type !== 'answer') {
      isAnswer = false;
    }

    const { activeKey, isPub, selectedRowKeys, isEdit } = this.state;

    const filterFormProps = {
      idpValueMap,
      // onRef: (ref) => {
      //   this.form = ref.form;
      // },
      partnerInfo,
      loading: queryLoading,
    };
    const rowSelection = {
      // columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };
    const listTableProps = {
      ...this.props,
      isPub,
      rowSelection,
      onChange: this.handleSearch,
      dataSource,
      idpValueMap,
      loading: queryLoading,
      isAnswer,
    };
    return (
      <PageWrapper loading={queryLoading}>
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
                title={intl.get(`hzero.common.srsp.region.basicInformation`).d('基本信息')}
                arrowActive={activeKey.includes('basicData')}
              />
            }
            key="basicData"
          >
            <BasicData {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`${commonPrompt}.view.field.portaldictreply`).d('DICT答复内容')}
                arrowActive={activeKey.includes('table')}
              />
            }
            key="table"
          >
            <QuestionListTable {...listTableProps} />
          </Panel>
        </Collapse>

        {isEdit && isAnswer && (
          <CusApprovalButtons>
            <CusButton onClick={this.handleSave} loading={saveLoading}>
              {intl.get(`hzero.common.view.button.save`).d('保存')}
            </CusButton>
            <CusButton type="primary" onClick={this.handleSubmit} loading={saveLoading}>
              {intl.get('hzero.common.view.button.submit').d('提交')}
            </CusButton>
          </CusApprovalButtons>
        )}
      </PageWrapper>
    );
  }
}

export default Detail;
