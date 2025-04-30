import React, { PureComponent, useState } from 'react';
import { DataSet, Table, Form, notification } from 'choerodon-ui/pro';
import { Row, Col, Tooltip } from 'choerodon-ui';
import Icons from 'components/Icons';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button } from 'hzero-ui';
import style from './index.less';
import { evaluateResultDS } from './dataset/EvaluateTplResultDS';
import { templateDS } from './dataset/EvaluateTemplateDS';

const commonPrompt = 'sslm.erp';

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
    this.state = {
      /* eslint-disable */
      resultDS: new DataSet(evaluateResultDS(props, this.evaluateResultLoadSucess)),
      /* eslint-enable */
      evaluateResultData: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.state = {
      /* eslint-disable */
      resultDS: new DataSet(evaluateResultDS(nextProps, this.evaluateResultLoadSucess)),
      /* eslint-enable */
      evaluateResultData: {},
    };
  }

  /**
   * 评估结果回调函数
   * @param {}} res
   */
  evaluateResultLoadSucess = (res) => {
    this.setState({ evaluateResultData: res[0] });
    const { evaluateResultData } = this.state;
    // console.log(evaluateResultData);
    // if (!evaluateResultData.viewFlag && Object.keys(evaluateResultData).length !== 0) {
    //   this.props.history.push({
    //     pathname: `/pub/spcm/not/access`,
    //   });
    // } else if (evaluateResultData.evaluateFlag) {
    //   this.props.history.push({
    //     pathname: `/pub/spcm/contract/evaluate/detail/${this.props.match.params.contractId}/${this.props.match.params.evaluateFlag}`,
    //     query: evaluateResultData,
    //   });
    // }
    if (evaluateResultData.evaluateFlag) {
      this.props.history.push({
        pathname: `/pub/spcm/contract/evaluate/detail/score/${this.props.match.params.contractId}/${this.props.match.params.evaluateFlag}`,
      });
    }
  };

  tableDS = new DataSet(templateDS());

  get columns() {
    return [
      {
        name: 'evalTplCode',
        width: 250,
      },
      {
        name: 'evalTplName',
        width: 800,
        renderer: ({ text }) => {
          return (
            <Tooltip placement="topLeft" title={text}>
              {text}
            </Tooltip>
          );
        },
      },
      {
        name: 'versionNum',
        width: 100,
      },
      // {
      //   name: 'evalTplType',
      //   width: 200,
      // },
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
              // console.log('Please Select One Template');
              notification.error({
                message: intl
                  .get('sslm.erp.view.contract.evaluate.template.select')
                  .d('请选择一条数据'),
              });
            } else {
              const { match = {} } = this.props;
              const { params } = match;
              // console.log(this.tableDS.currentSelected[0].data);
              // this.props.history.push('/pub/erp/contract/evaluate/detail/'+params.contractId+'/'+this.tableDS.currentSelected[0].data.toJSONData());
              this.props.history.push({
                pathname: `/pub/spcm/contract/evaluate/detail/score/${params.contractId}/${params.evaluateFlag}`,
                search: `?evalTplId=${this.tableDS.currentSelected[0].data.evalTplId}`,
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
