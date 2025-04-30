/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-03-20 17:34:21
 * Copyright (c) 2024, All Rights Reserved. 
 */
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

export default class ProjectList extends Component {
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
      dataSource,
      pagination,
      form,
      onSearch = (e) => e,
      projectNumber,
    } = this.props;

    const projectNumberArray = projectNumber?.split(',') || [];

    const { getFieldDecorator } = form;
    const {
      selectedRowKeys,
    } = this.state;

    const rowSelection = {
      type: projectNumberArray.length > 1 ? 'checkbox' : 'radio',
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: !(record.id)
      })
    }; 

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.Projectnumber').d('项目编码'),
        key: 'projectCode',
        dataIndex: 'projectCode',
        width: 150,
      },
      {
        title: intl.get(`HKPC.commom.view.title.projectname`).d('项目名称'),
        dataIndex: 'projectName',
        width: 220,
      },
      {
        title: intl.get('HKPC.commom.view.title.projectbudgettype').d('项目预算类型'),
        key: 'projectBudType',
        dataIndex: 'projectBudType',
        width: 150,
      },
      {
        title: intl.get('HKPC.commom.view.title.capexbudbalance').d('CAPEX剩余预算金额（HKD）'),
        key: 'capexSpentAmount',
        dataIndex: 'capexSpentAmount',
        width: 150,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{record.capexSpentAmount === 0 ? '/' : numberRender(record.capexSpentAmount, 2)}</div>;
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.opexbudbalance').d('OPEX剩余预算金额（HKD）'),
        key: 'opexSpentAmount',
        dataIndex: 'opexSpentAmount',
        width: 150,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{record.opexSpentAmount === 0 ? '/' : numberRender(record.opexSpentAmount, 2)}</div>;
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.budgettype').d('预算类型'),
        key: 'budType',
        dataIndex: 'budType',
        width: 150,
      },
      {
        title: intl.get('HKPC.commom.view.title.budbalance').d('剩余预算金额（HKD）'),
        key: 'spentAmount',
        dataIndex: 'spentAmount',
        width: 150,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{record.spentAmount === 0 ? '/' : numberRender(record.spentAmount, 2)}</div>;
        }
      },
      {
        title: intl.get(`HKPC.commom.view.title.BudgetProjectnumber`).d('预算项目编号'),
        dataIndex: 'budCode',
        width: 150,
      },
      {
        title: intl.get(`HKPC.commom.view.title.costcenter`).d('成本中心'),
        dataIndex: 'costCenterName',
        width: 150,
      },
      {
        title: intl.get(`HKPC.commom.view.title.BusinessActivities`).d('业务活动'),
        dataIndex: 'busActivityName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.projectmanager').d('项目经理'),
        key: 'projectManagerName',
        dataIndex: 'projectManagerName',
        width: 180,
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource,
      pagination,
      columns,
      rowKey: 'id',
      rowSelection,
      childrenColumnName: 'lines',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      onChange: onSearch,
    };

    return (
      <>
        <CusSpin spinning={false}>
          <Form ref={this.modalForm} className='customize-form'>
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
                <Form.Item label={intl.get(`HKPC.commom.view.title.projectmanage`).d('项目经理')}>
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
          </Form>
          <div style={{marginTop: '16px'}}>
            <CusTable {...tableProps} />
          </div>
        </CusSpin>
      </>
    )
  }
}