/**
 * TechnicalGradeTable - 技术评分
 * @date: 2023-10-26
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import { numberRender, dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender, labelTip } from '_cus_utils/render';
import CusSelect from '_cus_components/CusSelect';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusLov from '_cus_components/CusLov';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { Col } from 'antd';
import { getCurrentOrganizationId } from 'utils/utils';
const organizationId = getCurrentOrganizationId();
import uuid from 'uuid/v4';
import { pullAllBy } from 'lodash';
import CusNotification from 'utils/notification';

const promptCode = 'HKPC.commom';
@Form.create()
export default class TechnicalGradeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      isControlButtons: true,
      disabled: false,
      controlScoreDropDown: false, // 控制【设置分值下拉框】是否可选
      controlScoreType: true, //控制【分值类型】的【值集】
    };
  }

  @Bind
  changeType(val) {
    if (val == 'OnlineRresponse_no') {
      this.setState({
        isControlButtons: false
      })
    } else {
      this.setState({
        isControlButtons: true
      })
    }
  }

  //技术应答打开导入弹框
  @Bind
  handleOpenExport() {
    this.setState({ payVisible: true })
  }

  // 导入
  @Bind()
  handleExport(payFileList) {
    const { match } = this.props
    const pacNum = match.params.pacNum;
    this.setState({ importUploading: true })
    let formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    // debugger
    console.log('formData', formData);
    request(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/pac/tech-reply-import/${pacNum}`, {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (res.failed) {
        CusNotification.error({
          message: intl.get('hzero.common.CusNotification.error').d('操作失败'),
          description: res.message,
        });
        this.setState({
          importUploading: false,
        });
        return;
      } else {
        this.setState({
          importUploading: false,
          payVisible: false,
        })
      }
    })
  }

  // 导入模板下载
  @Bind
  payTemplateDownload() {
    let templateField;
    templateField = this.payDs.getField('tecGrad');
    // const { value } = templateField.props.lookup[0];
    console.log(templateField, '123123');
    // if (value) {
    const api = ''
      .concat(HZERO_FILE, '/v1/')
      .concat(isTenantRoleLevel() ? ''.concat(organizationId, '/') : '', 'files/download');
    downloadFile({
      requestUrl: api,
      queryParams: [
        {
          name: 'url',
          value: encodeURIComponent('http://cmhk-erp-scm-cmi-gnc-minio1.cmhk-erp-scm-cmi-gnc-admin.svc.cluster.local:9000/scm-himp/himp01/0/87646f880aac4c6e9a22a95379c8cf7a@采购方案-技术评分表设置导入模板.xlsx'),
        },
        {
          name: 'bucketName',
          value: 'himp',
        },
      ],
    });
    // }
  }

  // 关闭导入弹框
  @Bind
  handleCancel() {
    this.setState({
      payVisible: false,
      payFileList: [],
    });
  }

  // 新建
  @Bind()
  handleAdd() {
      this.setState({
        disabled:true
      })
      const {
        dispatch,
        pacId,
      } = this.props;
      const { scoreDataSource } = this.props
      dispatch({
        type: `purchasePlan/updateState`,
        payload: {
          scoreDataSource: [
            ...scoreDataSource,
            {
              // _status: 'create',
              // qqq: uuid(),
              // detailTerm : '' , //细节条款
              // isDel : '0' , // 删除状态
              // isKpi : '' , // 是否关键指标code
              // isKpiMeaning :'',  // 是否关键指标
              // lineNo : scoreDataSource.length + 1, // 序号
              // processMessage : '' , // 处理信息
              // refHeadId : pacId , // 标包ID
              // tenantId: organizationId.toString(),
              // term : '', //大条款

              _status: 'create',
              kkk: uuid(),
              detailScore :  '',//评分细项
              dropDownScore : '' ,//设置分值下拉值
              isDel : '0' ,//
              isObjective : '' ,//是否客观分
              lineNo : scoreDataSource.length + 1, // 序号
              majorScore : '' ,//评分大项
              processMessage : '' ,//处理信息
              refHeadId : pacId ,// 标包ID
              score : null , //分值
              scoreType : '' ,//分值类型
              tenantId: organizationId.toString(),
            },
          ],
        },
      })
  }

  // 选中行
  @Bind()
  handleSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n.kkk !== record.kkk);
    // 选择的行key
    let newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item.kkk);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
    console.log("选中的key", newSelectedRowKeys);
  }

  // 全选/全不选
  @Bind()
  handleSelectAll(selected, newSelectedRows, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, 'kkk');
    let newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item.kkk);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  // 删除
  @Bind()
  handleDelete() {
    const {
      dispatch,
      scoreDataSource
    } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length > 0) {
      const newscoreDataSource = scoreDataSource
        .map((item) => {
          //  如果选择的是后端返回的数据，就把这个数据的状态改为1
          if (selectedRowKeys.includes(item.kkk)) {
            item.isDel = '1';
            return item;
          } else {
            return item;
          }
        })
        // 过滤出 后端反的（删掉了） || 选择的是后端反的 但是排除掉被勾选的（同时也保留了新增的数据）
        .filter((i) => i.isDel !== '1');

      // dispatch({
      //   type: `${NAME_SPACE}/updateState`,
      //   payload: {
      //     scoreDataSource: [...newscoreDataSource],
      //   },
      // });
      this.setState({ selectedRowKeys: [] });
      console.log(newscoreDataSource, '删除之后的数据');
    } else {
      CusNotification.info({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
        placement: 'bottomRight',
      });
    }
  }

  // 是否客观分判断
  @Bind
  handleIsObjective(val){
    
  }

  render() {
    const {isControlButtons,disabled,selectedRowKeys,controlScoreDropDown} = this.state
    const {
      form, scoreDataSource, scoreDataPagination, idpValueMap
    } = this.props
    console.log(scoreDataSource,'这是技术评分');
    console.log('controlScoreDropDown', controlScoreDropDown);
    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onSelect: this.handleSelect,
      onSelectAll: this.handleSelectAll,
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: 62,
        // fixed: 'left',
        dataIndex: 'lineNo',
        render: (_, record, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              {index + 1}
            </div>
          );
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoringItem`).d('评分大项'),
        dataIndex: 'majorScore',
        width: 150,
        required: true,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('majorScore', {
                initialValue: record.majorScore,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.ScoringItem`).d('评分大项'),
                  }),
                }]
              })(
                <CusInput
                  onBlur={(event)=>{
                    record.majorScore = event.target.value
                  }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoringDetails`).d('评分细项'),
        dataIndex: 'detailScore',
        width: 550,
        required: true,
        render: (val,record)=>{
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('detailScore', {
                initialValue: record.detailScore,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.ScoringDetails`).d('评分细项'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.detailScore = event.target.value
                }}
                />
              )}
            </Form.Item>):val
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Score`).d('分值'),
        dataIndex: 'score',
        required: true,
        width: 100,
        render: (text, record, index) => {
          return (
           (<Form.Item>
                {record.$form && record.$form.getFieldDecorator('score', {
                  initialValue: record.score,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.Score`).d('分值'),
                    }),
                  }]
                })(
                  <CusInputNumber
                    min={0}
                    // onChange={(text) => {
                    //   this.props.isTrue()
                    //   this.changeTotal(text, index)
                    // }}
                    className="cus-input-money"
                    precision={2}
                    // onChange={(e) => record.score = record.$form.getFieldValue('score')}
                    onChange={(event)=>{
                      record.score = event
                    }}
                  />
                )}
              </Form.Item>)
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ObjectiveScore`).d('是否客观分'),
        dataIndex: 'isObjective',
        required: true,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 115 : 105) : (!disabled ? 110 : 105), // 根据try英文环境调整
        render: (_, record, index) => {
          return (
              <Form.Item>
                {record.$form && record.$form.getFieldDecorator('isObjective', {
                  initialValue: record.isObjective,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.ObjectiveScore`).d('是否客观分'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    allowClear
                    options={idpValueMap['HKPC.YES_OR_NO']}
                    onChange={(val)=>{
                      record.isObjective = val;
                      console.log(val,'是否客观分？？');
                      // 根据"是"修改分值类型的code为HKPC.SCORE_TYPE_OBJECTIVE
                      // “否”对应“HKPC.SCORE_TYPE_SUBJECTIVE”
                      if(val == 'YES'){
                        this.setState({
                          controlScoreType: true
                        })
                      }else {
                        this.setState({
                          controlScoreType: false
                        })
                      }
                    }}
                  />
                )}
              </Form.Item>
          )
        },
      },
      {
        // width: 300,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 305 : 300) : (!disabled ? 510 : 515),
        title: intl.get(`${promptCode}.view.title.ScoreType`).d('分值类型'),
        dataIndex: 'scoreType',
        required: true,
        render: (_, record, index) => {
          return (
            <Form.Item>
              {record.$form && record.$form.getFieldDecorator('scoreType', {
                initialValue: record.$form.getFieldValue('isObjectiveScore') === record.isObjectiveScore ? record.scoreType : '',
                // initialValue: record.scoreType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.ScoreType`).d('分值类型'),
                    }),
                  }
                ],
              })(
                <CusSelect
                  allowClear
                  options={this.state.controlScoreType == true ? idpValueMap['HKPC.SCORE_TYPE_OBJECTIVE']:idpValueMap['HKPC.SCORE_TYPE_SUBJECTIVE']}
                  onChange={(e) => {
                    // debugger
                    if( e == 'Objective_measurement_formula_(graded_linear)'){
                      // alert('有人不可编辑')
                      this.setState({
                        controlScoreDropDown :  true
                      });
                    }else {
                      this.setState({
                        controlScoreDropDown :  false
                      });
                    }
                    // 这里的e是code
                    record.scoreType = e
                    console.log(e,'e');
                  }}
                />
              )}
            </Form.Item>
          )
        },
      },
      {
        // width: 300,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 168 : 155) : (!disabled ? 148 : 135),
        required: true,
        title: (
          labelTip({
            label: intl.get(`${promptCode}.view.title.scorevalue`).d('设置分值下拉值'),
            tip: intl.get(`${promptCode}.view.title.setscoreprompt`).d('设置分值下拉值')
          })
        ),
        dataIndex: 'dropDownScore',
        render: (text, record, index) => {
          return (
            <Form.Item>
              {record.$form && record.$form.getFieldDecorator('dropDownScore', {
                initialValue: record.dropDownScore,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('${promptCode}.view.title.scorevalue').d('分值下拉值'),
                    }),
                  },
                  {
                    pattern: /^[,~.0-9]*$/,
                    message: intl
                      .get(`${promptCode}.view.title.Onlynumbersandtsfh`)
                      .d('只能输入数字和~,.'),
                  },
                ],
              })(
                <CusInput.TextArea
                  autoChangeSize={true}
                  disabled={controlScoreDropDown}
                  inputChinese={false}
                  onChange={(e) => {
                    record.dropDownScore = e.target.value
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: scoreDataSource,
      pagination: scoreDataPagination,
      rowKey: 'kkk',
      rowSelection: rowSelection,
      columns,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    }

    return (<>
      <div style={{ margin: '16px 0', textAlign: 'right', display: 'flex', flexDirection: 'row-reverse' }}>
          <CusButton onClick={this.handleAdd}>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
          <CusButton onClick={this.handleDelete}>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
          <CusButton onClick={() => {
            this.handleOpenExport()
          }}>{intl.get(`${promptCode}.view.button.Import`).d('导入')}</CusButton>
          {/* <CusButton>{intl.get(`${promptCode}.view.button.export`).d('导出')}</CusButton> */}
          <CusButton onClick={this.payTemplateDownload}>{intl.get(`${promptCode}.view.button.TemplateDownload`).d('模板下载')}</CusButton>
      </div>
      <EditTable {...tableProps} />
    </>)
  }
}