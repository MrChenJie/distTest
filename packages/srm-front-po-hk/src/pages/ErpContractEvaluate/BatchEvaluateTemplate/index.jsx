import React, { PureComponent, useState } from 'react';
import queryString from 'querystring';
import { DataSet, Table, Form, notification } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import Icons from 'components/Icons';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import intl from 'utils/intl';
import request from 'utils/request';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button } from 'hzero-ui';
import style from './index.less';
import { templateDS } from '../SelectEvaluateTemplate/dataset/EvaluateTemplateDS';

const commonPrompt = 'sslm.erp';
const SSLM = '/sslm';

function QueryBarMore(props) {
  const { queryFields, queryDataSet, dataSet, buttons } = props;
  const queryFieldsLimit = queryFields.length >= 3 ? 3 : queryFields.length;
  const [hidden, setHidden] = useState(false);
  const handleToggle = () => {
    setHidden(!hidden);
  };
  const query = async () => {
    if (await dataSet.validate(false, false)) {
      await dataSet.query();
    }
  };
  return (
    <div>
      {queryDataSet ? (
        <div style={{ alignItems: 'flex-start' }}>
          <Row>
            <Col span={queryFieldsLimit === 1 ? 7 : queryFieldsLimit === 2 ? 14 : 21}>
              <Form
                className={style.formInfo}
                columns={queryFieldsLimit}
                dataSet={queryDataSet}
                onKeyDown={(e) => {
                  if (e.keyCode === 13) return query();
                }}
              >
                {hidden ? queryFields.slice(0, 3) : queryFields}
              </Form>
            </Col>
            <div style={{ float: 'right', width: '50px' }}>
              {queryFields.length > 3 &&
                (hidden ? (
                  <Icons
                    onClick={handleToggle}
                    type="fdoi-arrow-down"
                    size="25"
                    style={{ cursor: 'pointer' }}
                    title={intl
                      .get(`${commonPrompt}.view.contract.evaluate.button.viewMore`)
                      .d('更多查询')}
                  />
                ) : (
                  <Icons
                    onClick={handleToggle}
                    type="fdoi-arrow-up"
                    size="25"
                    style={{ cursor: 'pointer' }}
                    title={intl
                      .get(`${commonPrompt}.view.contract.evaluate.button.collected`)
                      .d('收起查询')}
                  />
                ))}
            </div>
          </Row>
        </div>
      ) : null}
      {buttons && buttons.length ? <div style={{ marginBottom: 4 }}>{buttons}</div> : null}
    </div>
  );
}
@formatterCollections({ code: [commonPrompt] })
export default class SelectEvaluateTemplate extends PureComponent {
  constructor(props) {
    super(props);
    const { location } = this.props;
    const search = queryString.parse(location.search.substr(1)) || {};
    const { evalTplId } = search;

    this.tableDS = new DataSet(templateDS(evalTplId));
  }

  get columns() {
    return [
      {
        name: 'evalTplCode',
        width: 250,
      },
      {
        name: 'evalTplName',
        width: 250,
      },
      {
        name: 'versionNum',
        width: 250,
      },
    ];
  }

  get buttons() {
    return [
      <div
        style={{
          float: 'right',
        }}
      >
        <Button
          style={{
            backgroundColor: '#fff',
            borderColor: '#ccc',
            marginLeft: '10px',
            marginRight: '10px',
          }}
          className={style.resetButton}
          onClick={() => {
            this.queryDataSet.current.reset();
          }}
        >
          {intl.get(`${commonPrompt}.button.reset`).d('重置')}
        </Button>
        <Button
          type="primary"
          style={{ marginRight: '10px' }}
          className={style.addButton}
          onClick={() => this.tableDS.query()}
        >
          {intl.get(`${commonPrompt}.button.search`).d('查询')}
        </Button>
        <Button
          onClick={() => {
            if (typeof this.tableDS.currentSelected[0] === 'undefined') {
              notification.error({
                message: intl
                  .get('sslm.erp.view.contract.evaluate.template.select')
                  .d('请选择一条数据'),
              });
            } else {
              const { match = {} } = this.props;
              const { params } = match;
              request(`${SSLM}/v1/batch-contracts/eval/template/export/${params.batchId}`, {
                method: 'POST',
                body: this.tableDS.currentSelected[0].data,
                responseType: 'blob',
              }).then((res) => {
                if (res) {
                  const link = document.createElement('a');
                  link.style.display = 'none';
                  link.href = URL.createObjectURL(res);
                  link.download = intl
                    .get(`${commonPrompt}.view.contract.batch.export.fileName`)
                    .d('评价模板导出.xlsx');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              });
            }
          }}
        >
          {intl.get(`${commonPrompt}.view.contract.evaluate.template.select.button`).d('选择')}
        </Button>
      </div>,
      <div style={{ clear: 'both' }} />,
    ];
  }

  render() {
    return (
      <PageHeaderWrapper
        title={intl
          .get(`${commonPrompt}.view.contract.evaluate.template.select.title`)
          .d('模板选择')}
      >
        <Table
          pagination={{
            showPager: true,
            showQuickJumper: true,
          }}
          rowKey="evalTplId"
          buttons={this.buttons}
          dataSet={this.tableDS}
          columns={this.columns}
          queryBar={(props) => {
            this.queryDataSet = props.queryDataSet;
            return <QueryBarMore {...props} />;
          }}
        />
      </PageHeaderWrapper>
    );
  }
}
