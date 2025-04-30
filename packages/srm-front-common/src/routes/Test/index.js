import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Collapse, Form } from 'antd';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import PageWrapper from '../../components/Page/PageWrapper';
import PanelHeader from '@/components/CusCollapse';
import CusButton from '@/components/CusButton';
import CusNotification from '@/components/CusNotification';
import CusApprovalButtons from '@/components/CusButton/CusApprovalButtons';
import notification from 'utils/notification';
import FilterForm from './Form';
import FormH0 from './FormH0';
import ListTable from './ListTable';
import ListTableH0 from './ListTableH0';
import Tabs from './CusTabs';
import CusExcelExport from '@/components/CusExcelExport';
import CusLov from '@/components/CusLov';
import CusModal from '@/components/CusModal';
import SingleFormModal from './SingleFormModal';
import ButtonInBodyModal from './ButtonInBodyModal';
import ImportModal from '@/components/CusModal/ImportModal';

const { Panel } = Collapse;
const prompt = 'spfm.interfaceErrors';

@formatterCollections({ code: [prompt] })
@fastCodeLoader(['SPFM.SANCTIONS_TYPE', 'CMI_COA_INTERCO'])
@connect(({ loading, interfaceErrors }) => ({
  interfaceErrors,
  queryLoading: loading.effects['interfaceErrors/queryList'],
  dataSource: interfaceErrors?.dataSource,
  pagination: interfaceErrors?.pagination,
}))
class InterfaceErrors extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table', 'tabs'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      dataSource: [{ _status: 'update' }],
    };
  }

  componentDidMount() {
    // this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch } = this.props;
    console.log(this.getQueryParams());
    // dispatch({
    //   type: 'interfaceErrors/queryList',
    //   payload: {
    //     page,
    //     ...this.getQueryParams(),
    //   },
    // });
  };

  getQueryParams = () => {
    const fieldsValue = this.form.current?.getFieldsValue(true);
    // const fieldsValue = this.form.getFieldsValue();
    // const { dateFromStr, dateToStr } = fieldsValue;
    console.log('fieldsValue', fieldsValue);
    return {
      ...fieldsValue,
      // dateFromStr: moment.isMoment(dateFromStr) ? dateFromStr.format(DEFAULT_DATETIME_FORMAT) : undefined,
      // dateToStr: moment.isMoment(dateToStr) ? dateToStr.format(DEFAULT_DATETIME_FORMAT) : undefined,
    };
  };

  handleSave = () => {
    const { dataSource } = this.state;
    console.log('dataSource: ', dataSource);
    dataSource.forEach((item) => {
      if (item.$form) {
        const { validateFieldsAndScroll } = item.$form || {};
        validateFieldsAndScroll((errs, values) => {
          console.log('errs: ', errs, values);
        });
      }
      return item;
    });
  };

  render() {
    const { queryLoading = false, idpValueMap = {} } = this.props;
    const { activeKey, isPub, importModal = false } = this.state;
    const filterFormProps = {
      idpValueMap,
      onRef: (ref) => {
        this.form = ref.form;
      },
      onSearch: this.handleSearch,
    };
    const listTableProps = {
      ...this.props,
      isPub,
      dataSource: this.state.dataSource,
      onChange: this.handleSearch,
    };
    const cusTabsProps = {};

    return (
      <>
        <PageWrapper loading={queryLoading} requiredColor>
          <PanelHeader
            title={intl.get(`hzero.common.panel.header`).d('测试')}
            // arrowActive={activeKey.includes('form')}
            showArrow={false}
            style={{ paddingLeft: '0px' }}
            verticalLine={false}
          />

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
                  title={intl.get(`hzero.common.panel.header.tabs`).d('Tabs测试')}
                  arrowActive={activeKey.includes('tabs')}
                />
              }
              key="tabs"
            >
              <Tabs {...cusTabsProps} />
            </Panel>
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
              header={
                <PanelHeader
                  title={intl.get(`hzero.common.panel.header.H0form`).d('H0form')}
                  arrowActive={activeKey.includes('form')}
                  buttons={
                    <>
                      <CusLov code="SPFM.COMPANY_BASIC_NEW" isButton mini>
                        测试
                      </CusLov>
                      <CusButton onClick={() => {
                        CusModal.confirm({
                          content: '111'
                        })
                      }
                      }>
                        confirm
                      </CusButton>
                    </>
                  }
                />
              }
              key="H0form"
            >
              <FormH0 {...filterFormProps} />
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
                      <SingleFormModal />
                      <ButtonInBodyModal />
                      <div>
                        <CusButton onClick={() => {
                          this.setState({
                            importModal: true,
                          })
                        }}>importModal</CusButton>
                        <ImportModal visible={importModal} />
                      </div>

                      <CusLov
                        code="SSLM.COST_SUPPLIER_INFO"
                        form={this.form?.current}
                        textField="interfaceLov"
                        isButton
                        mini
                      >
                        测试
                      </CusLov>
                      <CusExcelExport
                        requestUrl={`/hrpt/v1/463/ap-invoice/export`}
                        otherButtonProps={{
                          mini: true,
                          type: 'primary',
                        }}
                        method="POST"
                        downloadType="Blob"
                        fileName={intl.get(`${prompt}.view.export.filename`).d('应付发票查询导出')}
                        buttonText={intl.get(`${prompt}.button.export`).d('导出')}
                      />
                    </>
                  }
                />
              }
              key="table"
            >
              <ListTable {...listTableProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`hzero.common.panel.header.H0table`).d('H0table')}
                  arrowActive={activeKey.includes('form')}
                  buttons={
                    <>
                      <CusButton onClick={this.handleSave}>保存</CusButton>
                      <CusButton onClick={() => {
                        CusNotification.warning({
                          message: '操作异常操作异常操作异常操作异常操作异常操作异常操作异常操作异常',
                          description: '消息消息消息消息消息消息消息消息消息消息消息消息消息消息消息消息消息消息消息消息'
                        });
                      }
                      }>notification</CusButton>
                    </>
                  }
                />
              }
              key="H0table"
            >
              <ListTableH0 {...listTableProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
        <CusApprovalButtons
          approvalRequestButtonVOList={[
            {
              name: intl.get(`hzero.common.button.submit`).d('提交'),
              nameE: intl.get(`hzero.common.button.submit`).d('提交'),
              onClick: () => {
                console.log('111');
              },
              // disabled: true,
            },
          ]}
        />
      </>
    );
  }
}

export default InterfaceErrors;
