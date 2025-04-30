import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import FilterForm from './Form';
import ListTable from './ListTable';

const { Panel } = Collapse;
const dateFormat = getDateFormat(); 

@formatterCollections({ code: [] })
@connect(({ loading, questionSurvey }) => ({
  questionSurvey,
  queryLoading: loading.effects['questionSurvey/queryQuestionSurvey'],
}))
class QuestionSurveyList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'questionSurvey/queryQuestionSurvey',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'questionSurvey/updateState',
          payload: {
            questionSurveySource: newDataSource,
            questionSurveyPagination: pagination,
          },
        });
      }
    });
  };

  getQueryParams = () => {
    const fieldsValue = this.form?.current?.getFieldsValue(true);
    return {
      ...fieldsValue,
      submitDateStart: fieldsValue?.submitDate ? fieldsValue.submitDate[0].format(dateFormat) : null,
      submitDateEnd: fieldsValue?.submitDate ? fieldsValue.submitDate[1].format(dateFormat) : null,
      submitDate: null,
    };
  };

  render() {
    const { queryLoading = false } = this.props;
    const {
      activeKey,
    } = this.state;
    const filterFormProps = {
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const listTableProps = {
      ...this.props,
      onChange: this.handleSearch,
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
                title={intl.get(`hzero.common.panel.header.searchForm`).d('查询')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <FilterForm {...filterFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            collapsible="disabled"
            header={
              <PanelHeader
                showArrow={false}
                title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                arrowActive={activeKey.includes('table')}
                buttons={
                  <>
                    <CusExcelExport
                      requestUrl={`/srm-portal/v1/${getCurrentOrganizationId()}/portal-survey-question/search-list-export`}
                      otherButtonProps={{
                          mini: true,
                      }}
                      fileName={intl.get(`hzero.common.export.excel.wenjuan`).d('问卷结果')}
                      queryParams={{
                        ...this.getQueryParams()
                      }}
                      method="GET"
                      downloadType="Blob"
                      buttonText={intl.get('hzero.common.button.export').d('导出')}
                    />
                  </>
                }
              />
            }
            key="table"
          >
            <ListTable {...listTableProps} />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}

export default QuestionSurveyList;
