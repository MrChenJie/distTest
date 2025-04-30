import React, { Component } from 'react';
import { Form, Col } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusSpin from '_cus_components/CusSpin';
import CusTable from '_cus_components/CusTable';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import { tooltipRender } from '_cus_utils/render';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import { getLFormGridSpan } from '_cus_utils/utils';
import { numberRender } from 'utils/renderer';

const tenantId = getCurrentOrganizationId();

const gridSpan = getLFormGridSpan();
@Form.create({ fieldNameProp: null })

export default class PlanList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
      selectedRowKeys: []
    };
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const { onChangeRows = (e) => e } = this.props;
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
    onChangeRows(selectedRows);
  }

  @Bind
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form,
      planLoading,
      phoneBusinessListModal,
    } = this.props;

    const { planDataSource } = phoneBusinessListModal;

    const { getFieldDecorator } = form;
    const {
      selectedRowKeys,
    } = this.state;

    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.ppname').d('采购计划名称'),
        key: 'plan_header_name',
        dataIndex: 'plan_header_name',
        width: 220,
      },
      {
        title: intl.get(`HKPC.commom.view.title.ppnumber`).d('采购计划编号'),
        key: 'plan_header_number',
        dataIndex: 'plan_header_number',
        width: 150,
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: planDataSource,
      pagination: false,
      columns,
      rowKey: 'rowKey',
      rowSelection,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };

    return (
      <>
        <CusSpin spinning={planLoading}>
          {/* <Form ref={this.modalForm} className='customize-form'>
            <GenerateSearchFormGrid
              onQuery={onSearch}
              onReset={this.handleReset}
            >
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`HKPC.commom.view.title.Projectnumber`).d('项目编码')}>
                  {getFieldDecorator(
                    'projectCode',
                    {}
                  )(
                    <CusInput />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`HKPC.commom.view.title.projectname`).d('项目名称')}>
                  {getFieldDecorator(
                    'projectNameSearch',
                    {}
                  )(
                    <CusInput />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`HKPC.commom.view.title.projectmanager`).d('项目经理')}>
                  {getFieldDecorator(
                    'projectManagerName',
                    {}
                  )(
                    <CusInput />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`HKPC.commom.view.title.budgettype`).d('预算类型')}>
                  {getFieldDecorator(
                    'projectBudType',
                    {}
                  )(
                    <CusSelect
                      lovCode="HKPC.BUDGETTYPE"
                      allowClear
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </GenerateSearchFormGrid>
          </Form> */}
          <div style={{marginTop: '16px'}}>
            <CusTable {...tableProps} />
          </div>
        </CusSpin>
      </>
    )
  }
}