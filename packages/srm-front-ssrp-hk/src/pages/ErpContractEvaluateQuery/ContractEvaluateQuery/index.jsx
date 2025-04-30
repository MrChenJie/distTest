import React, { PureComponent, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import ExcelExport from '@/components/ExcelExport';
import intl from 'utils/intl';
// import { QueryBarMore } from '@/common/utils';
import { ERP } from '@/common/config';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Avatar, Button, Col, Row } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';
import exportBtn from '@/assets/buttonIcons/导出.png';
import { evaluateQueryDS } from './dataset/ContractEvaluateQueryDS';
import queryBar from '../components/querybar';

const commonPrompt = 'spcm.erp';
@formatterCollections({ code: [commonPrompt] })
export default class ContractEvaluateQuery extends PureComponent {
  evaluateQueryDS = new DataSet(evaluateQueryDS({ commonPrompt }));

  state = {
    exportQueryParams: {},
  };

  getExportQueryParams() {
    const data = this.evaluateQueryDS.queryDataSet.toData();
    if (data.length > 0) {
      this.setState({
        exportQueryParams: data[0],
      });
    }
  }

  openDetail(record) {
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    this.props.history.push({
      pathname: `${isPub ? '/pub' : ''}/spcm/contract/evaluate/detail/list`,
      query: record.data,
      state: {
        backPath: this.props.location.pathname,
      },
    });
  }

  get columns() {
    return [
      {
        name: 'evaluateDateType',
        width: 120,
      },
      {
        name: 'dateFrom',
        width: 120,
      },
      {
        name: 'dateTo',
        width: 120,
      },
      {
        name: 'vendorName',
        width: 400,
      },
      {
        name: 'totalScore',
        width: 120,
        align: 'center',
        renderer: ({ record }) => (
          <Button
            funcType="flat"
            color="primary"
            onClick={() => this.openDetail(record)}
            style={{ float: 'left' }}
          >
            {record.data.totalScore}
          </Button>
        ),
      },
      {
        name: 'needDepart',
        width: 100,
      },
      // {
      //   name: 'needDepartment',
      //   width: 200,
      // },
    ];
  }

  get buttons() {
    return [
      <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar size="small" src={queryResBtn} />
            <span style={{ verticalAlign: 'middle' }}>
              {intl.get('hzero.common.button.result').d('结果')}
            </span>
          </div>
        </Col>
        <Col span={12} className="customize-buttons">
          <span>
            <ExcelExport
              onClick={() => this.getExportQueryParams()}
              requestUrl={`${ERP}/v1/contract-infos/contract/evaluate/summary/exportExcel`}
              queryParams={this.state.exportQueryParams}
              otherButtonProps={{
                icon: null,
              }}
              buttonText={
                <>
                  <img src={exportBtn} alt="" />
                  {intl.get('hzero.common.button.export').d('导出')}
                </>
              }
            />
          </span>
        </Col>
      </Row>,
    ];
  }

  render() {
    return (
      <Fragment>
        <Content>
          <Table
            dataSet={this.evaluateQueryDS}
            columns={this.columns}
            buttons={this.buttons}
            queryBar={queryBar}
          />
        </Content>
      </Fragment>
    );
  }
}
