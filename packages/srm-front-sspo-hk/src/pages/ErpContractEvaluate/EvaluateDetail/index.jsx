import React from 'react';
import { Row, Col, Divider, Radio } from 'choerodon-ui';
import { Input, Form } from 'hzero-ui';
import { Button, DataSet, notification } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// import axios from 'axios';
import { PageHeaderWrapper } from 'hzero-boot/lib/components/Page';
import request from 'utils/request';
// import { formSubmitDS } from './dataset/FormSubmitDS';
import formatterCollections from 'utils/intl/formatterCollections';
import querystring from 'querystring';
import { getCurrentOrganizationId } from 'utils/utils';
import { detailTreeDS } from './dataset/DetailTreeDS';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();

function queryEvaluateResultData(params) {
  return request(`/spuc/v1/0/erp-contract-evaluates/${params}/getEvaluateTplData`, {
    method: 'GET',
  });
}

function getEvalTemplates(params) {
  return request(`/sslm/v1/${organizationId}/eval-templates?evalTplId=${params}`, {
    method: 'GET',
  });
}

const RadioGroup = Radio.Group;
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
const detailStyle = {
  display: 'inline-block',
  height: '30px',
  lineHeight: '30px',
};
const titleStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center',
};

const subTitleStyle = {
  fontSize: '14px',
  textAlign: 'center',
};

const scoreStyle = {
  fontSize: '14px',
  textAlign: 'center',
};

const indicatorTopStyle = {
  fontSize: '14px',
  fontWeight: 'bold',
};

const radioInputDesStyle = {
  width: 300,
  height: 30,
  marginLeft: 10,
};

@formatterCollections({ code: ['sslm.erp'] })
@Form.create({ fieldNameProp: null })
export default class EvaluateDetail extends React.Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { isReturn } = querystring.parse(search.substr(1));
    this.state = {
      evaluateResultData: {},
      isReturn,
      score: 0, // 分数
      radioSelectResult: [], // 选择数据
      detailData: [], // 指标树数据
    };
  }

  componentDidMount() {
    this.fetchEvaluateResultData();
  }

  fetchEvaluateResultData = () => {
    const {
      location: { search },
    } = this.props;
    const { contractId } = this.props.match.params;
    const { evalTplId } = querystring.parse(search.substr(1));
    queryEvaluateResultData(contractId).then((res) => {
      if (res) {
        const evaluateResultData = res[0];
        if (evaluateResultData.evaluateFlag) {
          this.setState({
            evaluateResultData,
            /* eslint-disable */
            treeDS: new DataSet(
              detailTreeDS(this.props, evaluateResultData.evalTplId, this.deatailLoadSucess)
            ),
            score: 0,
            radioSelectResult: [],
            detailData: [],
          });
        } else {
          getEvalTemplates(evalTplId).then((res) => {
            if (res) {
              this.setState({
                evaluateResultData: res.content[0] || {},
                treeDS: new DataSet(
                  detailTreeDS(this.props, res.content[0].evalTplId, this.deatailLoadSucess)
                ),
                score: 0,
                radioSelectResult: [],
                detailData: [],
              });
            }
          });
        }
      }
    });
  };

  /** 选择描述输入框change函数 */
  // HTML DOM getAttribute() 方法 返回string类型
  onSelectInputChange = (e) => {
    const { radioSelectResult } = this.state;
    const newRadioSelectResult = [...radioSelectResult];
    for (const radioSelect of newRadioSelectResult) {
      /* eslint-disable */
      if (radioSelect.indicatorId == e.target.getAttribute('indicatorId')) {
        if (radioSelect.ruleName == e.target.getAttribute('ruleName')) {
          radioSelect.selectDescription = e.target.value;
          break;
        }
      }
      /* eslint-enable */
    }
    this.setState({ radioSelectResult: newRadioSelectResult });
  };

  /** 单选框选择按钮change函数 */
  onRadioSelectChange = (e) => {
    const radioSelectData = {
      indicatorId: e.target.indicatorId,
      evalWeight: e.target.evalWeight,
      ruleName: e.target.value,
      scoreValue: e.target.scoreValue,
      selectDescription: '',
      // parentEvalWeight:e.target.parentEvalWeight,
    };
    this.updateRadioSelectState(radioSelectData);
  };

  /**
   * 更新选择结果数据
   */
  updateRadioSelectState = (radioSelectData) => {
    const { radioSelectResult } = this.state;
    let newRadioSelectResult = [...radioSelectResult];
    newRadioSelectResult = newRadioSelectResult.filter(
      (item) => item.indicatorId !== radioSelectData.indicatorId
    );
    newRadioSelectResult = [...newRadioSelectResult, radioSelectData];
    // radioSelectResult.set(e.target.value,e.target.scoreValue);
    let score = 0;
    /** 计算分值 = 当前分值 *当前指标权重*父指标权重 */
    for (const radioSelect of newRadioSelectResult) {
      // console.log(radioSelect);
      // score = score + radioSelect.scoreValue * radioSelect.evalWeight/100 * radioSelect.parentEvalWeight/100;
      // score += radioSelect.scoreValue * radioSelect.evalWeight;
      // console.log(score);
      score += this.multiply(radioSelect.scoreValue, radioSelect.evalWeight);
    }
    this.setState({ radioSelectResult: newRadioSelectResult, score });
  };

  /**
   * 乘法数据处理
   * @param {*} a
   * @param {*} b
   */
  multiply = (a, b) => {
    /**
     * m累计参数a和b的小数位数
     */
    let m = 0;
    const c = a.toString();
    const d = b.toString();
    /* eslint-disable */
    try {
      m += c.split('.')[1].length;
    } catch (e) {}
    try {
      m += d.split('.')[1].length;
    } catch (e) {}
    return (Number(c.replace('.', '')) * Number(d.replace('.', ''))) / Math.pow(10, m);
    /* eslint-enable */
  };

  /**
   *
   * 指标Tree数据加载回调函数
   *
   */
  deatailLoadSucess = (res) => {
    /**
     * 更新当前选择值
     */
    const newRadioSelectResult = [];
    this.getRadioSelectData(res, newRadioSelectResult);
    // console.log(newRadioSelectResult);
    let score = 0;
    /** 计算分值 = 当前分值 *当前指标权重*父指标权重 */
    for (const radioSelect of newRadioSelectResult) {
      // score += radioSelect.scoreValue * radioSelect.evalWeight;
      score += this.multiply(radioSelect.scoreValue, radioSelect.evalWeight);
    }
    // console.log(score);
    // console.log('deatailLoadSucess');
    this.setState({ detailData: res, radioSelectResult: newRadioSelectResult, score });
  };

  getRadioSelectData = (detailData, newRadioSelectResult) => {
    if (detailData instanceof Array) {
      for (const item of detailData) {
        this.getRadioSelectData(item, newRadioSelectResult);
      }
    } else if (detailData.ruleIndicatorFlag) {
      for (const item of detailData.children) {
        for (const rule of item.ruleList) {
          if (rule.selectFlag) {
            const radioSelectData = {
              indicatorId: rule.indicatorId,
              evalWeight: item.evalWeight,
              ruleName: rule.ruleName,
              scoreValue: rule.scoreValue,
              selectDescription: rule.selectDescription,
            };
            newRadioSelectResult.push(radioSelectData);
          }
        }
      }
    } else {
      this.getRadioSelectData(detailData.children, newRadioSelectResult);
    }
  };

  /**
   * 构建指标评估模板
   * @param {*} detailData
   */
  generateDetail = (detailData) => {
    const detailList = [];
    const { getFieldDecorator } = this.props.form;
    /**
     * 指标第一层
     */
    if (detailData instanceof Array) {
      const list = [];
      for (const item of detailData) {
        list.push(
          <Row>
            <Col offset={item.evalLevel - 1}>
              <div style={indicatorTopStyle}>{item.indicatorName}</div>
            </Col>
          </Row>
        );
        list.push(
          <Form className={styles['form-explain-right']}>{this.generateDetail(item)}</Form>
          // this.generateDetail(item)
        );
      }
      detailList.push(list);
    } else if (detailData.ruleIndicatorFlag) {
      /**
       * 选项构建（底层）
       */
      for (const item of detailData.children) {
        const options = [];
        let inputDes = null;
        let selectValue = '';
        for (const rule of item.ruleList) {
          if (rule.selectFlag) {
            selectValue = rule.ruleName;
          }

          /**
           * 判断当前是否需要显示输入框
           */
          let inputDesFlag = false;
          if (rule.ruleName === 'C' || rule.ruleName === 'D' || rule.ruleName === 'E') {
            /**
             * 当前选择结果
             */
            const { radioSelectResult } = this.state;
            for (const radioSelect of radioSelectResult) {
              if (radioSelect.indicatorId === rule.indicatorId) {
                if (radioSelect.ruleName === rule.ruleName) {
                  inputDesFlag = true;
                }
                break;
              }
            }
          }
          /* eslint-enable */

          // options.push({value: rule.ruleName,label: rule.description});
          options.push(
            <Radio
              required
              value={rule.ruleName}
              style={radioStyle}
              indicatorId={rule.indicatorId}
              evalWeight={item.evalWeight}
              scoreValue={rule.scoreValue}
              parentEvalWeight={detailData.evalWeight}
            >
              {rule.ruleDescription}
            </Radio>
          );
          if (inputDesFlag) {
            inputDes = (
              <Form.Item className={styles['form-explain-right']}>
                {getFieldDecorator(`${rule.indicatorId}`, {
                  initialValue: rule.selectDescription,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get('sslm.erp.view.contract.evaluate.input.value')
                        .d('请录入低分原因！'),
                    },
                  ],
                })(
                  <Input
                    disabled={this.props.match.params.evaluateFlag === 'N'}
                    type="text"
                    indicatorId={rule.indicatorId}
                    ruleName={rule.ruleName}
                    onChange={this.onSelectInputChange}
                    defaultValue={rule.selectDescription}
                    placeholder={intl
                      .get('sslm.erp.view.contract.evaluate.input.value')
                      .d('请录入低分原因！')}
                    style={radioInputDesStyle}
                  />
                )}
              </Form.Item>
            );
          }
        }
        detailList.push(
          <div>
            <Row>
              <Col offset={item.evalLevel - 1}>
                <div style={detailStyle}>
                  {item.indicatorName}({item.evalWeight * 100}%)
                </div>
                <div style={{ display: 'inline-block' }}>{inputDes}</div>
              </Col>
            </Row>
            {item.evalStandard && (
              <Row>
                <Col offset={item.evalLevel}>
                  <div style={detailStyle}>{item.evalStandard}</div>
                </Col>
              </Row>
            )}
            <Row>
              <Col offset={item.evalLevel + 1}>
                {/* <RadioGroup options={options} /> */}
                <RadioGroup
                  disabled={this.props.match.params.evaluateFlag === 'N'}
                  name={item.indicatorCode}
                  defaultValue={selectValue}
                  onChange={this.onRadioSelectChange}
                >
                  {options}
                </RadioGroup>
              </Col>
            </Row>
          </div>
        );
      }
    } else {
      /**
       * 中间层级，往下遍历
       */
      const list = [];
      // list.push(<Row><Col offset={detailData.evalLevel - 1}>{detailData.indicatorName}</Col></Row>)
      list.push(this.generateDetail(detailData.children));
      detailList.push(list);
    }
    return detailList;
  };

  /**
   * 提交保存
   */
  submitForm = () => {
    const { form } = this.props;
    const { radioSelectResult, score, detailData, evaluateResultData } = this.state;
    const radioGroup = detailData.filter((item) => item.children !== null);

    let radioGroupCount = 0;
    for (const item of radioGroup) {
      radioGroupCount += item.children.length;
    }
    if (radioSelectResult.length !== radioGroupCount) {
      const notSelectedCount = radioGroupCount - radioSelectResult.length;
      // const msg = '请选择每个选项值!还有' + notSelectedCount + '未选择!';
      notification.error({
        placement: 'bottomRight',
        message: intl
          .get('sslm.erp.view.contract.evaluate.radio.notSelected', {
            notSelectedCount,
          })
          .d('未全部选择！'),
      });
    } else {
      const result = {
        evaluateRecordList: radioSelectResult,
        contractId: this.props.match.params.contractId,
        evalTplId: evaluateResultData.evalTplId,
        score,
        templateCode: evaluateResultData.evalTplCode,
        templateName: evaluateResultData.evalTplName,
        versionNum: evaluateResultData.versionNum,
      };
      const param = [];
      param.push(result);
      let flag = true;
      form.validateFields((err) => {
        if (err) {
          flag = false;
        }
      });
      for (const item of result.evaluateRecordList) {
        if (item.ruleName === 'C' || item.ruleName === 'D' || item.ruleName === 'E') {
          if (item.selectDescription === undefined || item.selectDescription === '') {
            notification.error({
              message: intl
                .get('sslm.erp.view.contract.evaluate.input.value')
                .d('请录入低分原因！'),
              placement: 'bottomRight',
            });
            flag = false;
            break;
          }
        }
      }
      if (flag) {
        request(`/spuc/v1/0/erp-contract-evaluates/submitErpEvaluate`, {
          method: 'POST',
          body: param,
        })
          .then((resonseData) => {
            // console.log(resonseData);
            if (resonseData.failed) {
              notification.error({
                description: resonseData.message,
                placement: 'bottomRight',
              });
            } else {
              notification.success({
                placement: 'bottomRight',
                message: intl
                  .get(`sslm.erp.view.contract.evaluate.submit.success`, {
                    score,
                  })
                  .d(`您的评价总分数为${score}分，保存成功!`),
              });
              window.close();
            }
          })
          .catch(() => {
            // console.log('err');
            // console.log(err);
            notification.error({
              description: 'error',
              placement: 'bottomRight',
            });
          });
      }
      // const submitDS = new DataSet(formSubmitDS(param));
      // submitDS.data[0].status = 'add';
      // submitDS.submit().then(() => {
      //   notification.success({
      //     message: intl
      //       .get(`sslm.erp.view.contract.evaluate.submit.success`, {
      //         score,
      //       })
      //       .d(`您的评价总分数为${score}分，保存成功!`),
      //   });
      // window.location.href = `http://172.22.141.70:8080/cmi/business/contract/purContract/purContractScmEvacaluteSucess.jsp?score=${score}&subtitle=${evaluateResultData.evalTplCode}-${evaluateResultData.evalTplName}-${evaluateResultData.versionNum}`;
      // window.postMessage(result, 'http://172.22.141.70:8080');
      // document.write(
      //   `<form action='${ERP_HOST}/business/contract/purContract/purContractScmEvacaluteSucess.jsp' method=post name=closeForm style='display:none'>`
      // );
      // document.write(`<input type=hidden name=score value=${score} />`);
      // document.write(
      //   `<input type=hidden name=subtitle value='${this.props.location.query.evalTplCode}-${this.props.location.query.evalTplName}-${this.props.location.query.versionNum}'/>`
      // );
      // document.write('</form>');
      // document.closeForm.submit();
      // const ajaxdata = {
      //   score,
      //   subtitle: `${evaluateResultData.evalTplCode}-${evaluateResultData.evalTplName}-${evaluateResultData.versionNum}`,
      //   success: 'Y',
      // };
      // parent.PccwCommonPopupWindow.ajaxdata = ajaxdata; // 回传的json数据
      // parent.PccwCommonPopupWindow.close(); // 关闭弹出窗口
      // });

      // console.log(submitDS.submit());
      // axios.post(API_HOST+'/spuc/v1/0/erp-contract-evaluates/submitErpEvaluate',param).then(function (response) {
      //     notification.success({message : intl.get(`sslm.erp.view.contract.evaluate.submit.success`).d('评估成功')});
      // }).catch(function (err) {
      //     //console.log(err);
      //     notification.error({message : intl.get(`sslm.erp.view.contract.evaluate.submit.failed`).d('评估失败')});
      // });
    }
  };

  /**
   * 取消
   */
  cancel = () => {
    const { match = {} } = this.props;
    const { params } = match;
    // 取消
    /* eslint-disable */
    this.setState({ treeDS: {} });
    /* eslint-enable */
    /**
     * 跳转上一层选择
     */
    this.props.history.push(
      `/pub/spcm/contract/select/evaluate/template/${params.contractId}/${params.evaluateFlag}`
    );
    /**
     * 关闭窗口
     */
    // parent.PccwCommonPopupWindow.close(); // 关闭弹出窗口
    // const url = 'http://172.22.141.70:8080/cmi/purContract.do?method=scmEvaluateSucess';
    // window.location.href = 'http://172.22.141.70:8080/cmi/purContract.do?method=scmEvaluateSucess';
    // window.location.href =
    //   "http://172.22.141.70:8080/cmi/business/contract/purContract/purContractScmEvacaluteSucess.jsp?opt=close&subtitle='template";
    // document.write(
    //   `<form action='${ERP_HOST}/business/contract/purContract/purContractScmEvacaluteSucess.jsp' method=post name=closeForm style='display:none'>`
    // );
    // document.write("<input name=opt value='close'/>");
    // document.write('</form>');
    // document.closeForm.submit();
    // this.props.history.push(url);
    // axios
    //   .post(url)
    //   .then(function (response) {
    //     console.log('response');
    //     console.log(response);
    //   })
    //   .catch(function (err) {
    //     console.log('err');
    //     console.log(err);
    //   });
    // window.postMessage('data', 'http://172.22.141.70:8080');
    // console.log('trst1');
    // window.parent.opener = null;
    // window.parent.open('', '_top');
    // window.parent.top.close();
    // window.parent.top.setTimeout(function () {
    //   window.parent.top.close();
    // }, 100);
    // console.log('trst2');
    // window.parent.PccwCommonPopupWindow.close();
  };

  render() {
    // const { treeDS } = this.state;
    // console.log(params.contractId);
    const { score, detailData, evaluateResultData, isReturn = false } = this.state;
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    // console.log(detailData);
    return (
      <PageHeaderWrapper
        headerProps={{
          backPath: isReturn
            ? `${isPub ? '/pub' : ''}/spcm/contract/evaluate/detail/list`
            : undefined,
        }}
      >
        {/* <Form dataSet={treeDS} method="post"> */}
        {/* <input name="evalTplId" value={evaluateResultData.evalTplId}></input> */}
        <Row>
          <Col span={8} offset={8} style={{ textAlign: 'center' }}>
            <div style={titleStyle}>
              {intl.get(`sslm.erp.view.contract.evaluate.title`).d('供应商合作表现评价')}
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={8} offset={8} style={{ textAlign: 'center' }}>
            <div style={subTitleStyle}>
              {evaluateResultData.evalTplCode}-{evaluateResultData.evalTplName}-
              {evaluateResultData.versionNum}
            </div>
          </Col>
          <Col span={4} offset={1} style={{ textAlign: 'center' }}>
            <div style={scoreStyle}>分数：{score}</div>
          </Col>
        </Row>
        <Row>
          <Col span={18} offset={3}>
            <Divider />
          </Col>
        </Row>
        <Row>
          <Col>
            {/* {this.generateDetail(treeData)} */}
            {this.generateDetail(detailData)}
          </Col>
        </Row>
        <Row style={{ textAlign: 'right', paddingRight: '30px' }}>
          <Col style={{ display: 'inline-block' }}>
            <Button
              color="primary"
              style={{ display: this.props.match.params.evaluateFlag === 'N' ? 'none' : '' }}
              onClick={this.submitForm}
            >
              {intl.get(`hzero.common.button.confirm`).d('确认')}
            </Button>
            <Button
              type="primary"
              style={{ display: evaluateResultData.evaluateFlag ? 'none' : '', marginLeft: '20px' }}
              onClick={this.cancel}
              disabled={evaluateResultData.evaluateFlag}
            >
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </Col>
        </Row>
        {/* </Form> */}
      </PageHeaderWrapper>
    );
  }
}
