import React, { PureComponent, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import ExcelExport from '@/components/ExcelExport';
import intl from 'utils/intl';
// import { QueryBarMore } from '@/common/utils';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Avatar, Button, Col, Row } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';
import exportBtn from '@/assets/buttonIcons/导出.png';
import { evaluateDetailDS } from './dataset/ContractEvaluateDetailDS';
import queryBar from '../components/querybar';

const ERP = '/hscm-erp';
const commonPrompt = 'spcm.erp';

function queryEvaluateResultData(params) {
  return request(`/spuc/v1/0/erp-contract-evaluates/${params}/getEvaluateTplData`, {
    method: 'GET',
  });
}

@formatterCollections({ code: [commonPrompt] })
export default class ContractEvaluateDetail extends PureComponent {
  constructor(props) {
    super(props);
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    this.state = {
      /* eslint-disable */
      evaluateDetailDS: new DataSet(evaluateDetailDS({ props, commonPrompt })),
      /* eslint-enable */
      exportQueryParams: {},
      isPub,
    };
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps);
    // console.log(nextProps.history.location.query);
    if (nextProps.history.location.query) {
      // 重新进入界面
      this.setState({
        /* eslint-disable */
        evaluateDetailDS: new DataSet(evaluateDetailDS({ props: nextProps, commonPrompt })),
        /* eslint-enable */
      });
    }
  }
  // evaluateDetailDS = new DataSet(evaluateDetailDS({ props: this.props, commonPrompt }));

  getExportQueryParams() {
    const data = this.state.evaluateDetailDS.queryDataSet.toData();
    if (data.length > 0) {
      this.setState({
        exportQueryParams: data[0],
      });
    }
  }

  openDetail(record) {
    const { isPub } = this.state;
    queryEvaluateResultData(record.data.contractId).then((res) => {
      if (res) {
        const evaluateResultData = res[0];
        if (evaluateResultData.evaluateFlag) {
          this.props.history.push({
            pathname: `${isPub ? '/pub' : ''}/spcm/contract/evaluate/detail/score/${
              record.data.contractId
            }/N`,
            search: `?isReturn=true`,
          });
        }
      }
    });
  }

  exportExcel() {
    document.querySelector('#exportExcel>button').click();
  }

  get columns() {
    return [
      {
        name: 'contractNo',
        width: 150,
      },
      {
        name: 'contractName',
        width: 300,
      },
      {
        name: 'vendorName',
        width: 400,
      },
      {
        name: 'score',
        align: 'center',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => this.openDetail(record)}>{record.data.score}</a>
        ),
      },
      {
        name: 'needDepart',
        width: 120,
      },
      {
        name: 'needDepartment',
        width: 200,
      },
      {
        name: 'evaluateUser',
        width: 120,
      },
      {
        name: 'approvalDate',
        width: 120,
      },
      {
        name: 'evaluateDate',
        width: 120,
      },
      // {
      //   header: intl.get(`${commonPrompt}.model.evaluate.detail.cloumn`).d('评估结果明细'),
      //   width: 100,
      //   renderer: () => (
      //     <Button
      //       funcType="flat"
      //       color="primary"
      //       // onClick={}
      //     >
      //       {intl.get(`${commonPrompt}.model.evaluate.detail`).d('明细')}
      //     </Button>
      //   ),
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
              requestUrl={`${ERP}/v1/contract-infos/contract/evaluate/detail/exportExcel`}
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
    const { state = {} } = this.props.location;
    const { backPath } = state;
    return (
      <Fragment>
        {backPath && (
          <Header
            backPath={backPath}
          />
        )}
        <Content>
          <Table
            dataSet={this.state.evaluateDetailDS}
            buttons={this.buttons}
            columns={this.columns}
            queryBar={queryBar}
          />
        </Content>
      </Fragment>
    );
  }
}
