/**
 * TechnicalGradeTable - 技术评分
 * @date: 2023-10-26
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Select } from 'hzero-ui';
import EditTable from '_cus_components/EditTable';
// import { Tooltip } from 'antd';
import { tableScrollWidth,getCurrentLanguage } from 'utils/utils';
// import { pullAllBy } from 'lodash';
// import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
// import querystring from 'querystring';
import { numberRender, dateRender } from 'utils/renderer';
// import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import { Input, Tooltip } from 'antd';
// import { Button, Dropdown, Form, Icon, Menu, Modal, Progress, Select, Tooltip } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';


const promptCode = 'HKPC.commom';
const FormItem = Form.Item

export default class TechnicalGradeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      footerTotalSource: 0,
    };
  }

  @Form.create()

  render() {
    const { footerTotalSource } = this.state
    const {
      form,idpValueMap,scoreDataSource
    } = this.props
    const disabled = true
    const getDetailList = {
      tenRate:1,
      technicalProportion:1
    }
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.serialnumber`).d('序号'),
        width: 62,
        // fixed: 'left',
        dataIndex: 'lineNo',
        render: (_, record, index) => {
          // if (index == scoreDataSource.length - 1) {
          //   return {
          //     children: intl.get(`bid.bidcommon.view.title.proportion`).d('加权得分')
          //     + '（' + `${getDetailList.tenRate || getDetailList.technicalProportion || 0}` + '%' + '）',
          //     props: {
          //       colSpan: 3
          //     }
          //   }
          // } else if (index == scoreDataSource.length - 2) {
          //   return {
          //     children: intl.get(`bid.bidcommon.view.title.totalscore`).d('总分(百分制)'),
          //     props: {
          //       colSpan: 3
          //     }
          //   }
          // } else {
            return (
              <div style={{ textAlign: 'center' }}>
                {index + 1}
              </div>
            );
          // }
        }
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评分大项'),
        dataIndex: 'majorScore',
        width: 150,
        required: !disabled,
        render: (text, record, index) => {
          // if (index < scoreDataSource.length - 2 && record.$form !== undefined) {
          //   if (index == scoreDataSource.length - 2) {
          //     return {
          //       children: <div style={{ textAlign: 'right' }}>{numberRender(footerTotalSource, 2)}</div>,
          //       props: {
          //         // style:{borderLeft: 'none'},
          //         colSpan: 1
          //       }
          //     }
          //   } else if (index == scoreDataSource.length - 1) {
          //     return {
          //       children: <div style={{ textAlign: 'right' }}>{numberRender((footerTotalSource * (getDetailList.tenRate || getDetailList.technicalProportion) / 100), 2)}</div>,
          //       props: {
          //         colSpan: 1
          //       }
          //     }
          //   } else {
              return (
                // disabled ?
                //   tooltipRender(record.majorScore) : 
                  <Form.Item>
                    {record.$form && record.$form.getFieldDecorator('majorScore', {
                      initialValue: record.majorScore,
                      rules: [{
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.scoringprojects`).d('评审大项'),
                        }),
                      }]
                    })(
                      <CusInput.TextArea
                        autoChangeSize={true}
                        onChange={() => {
                          record.majorScore = record.$form.getFieldValue('majorScore')
                            // this.props.isTrue()
                        }}
                      />
                    )}
                  </Form.Item>
              )
            }
          // }
        // },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
        dataIndex: 'detailScore',
        width: 550,
        required: !disabled,
        render: (text, record, index) => {
          console.log('record.$form',record.$form);
          // if (record.$form !== undefined) {
            // if (index == scoreDataSource.length - 1 || index == scoreDataSource.length - 2) {
            //   return {
            //     props: {
            //       colSpan: 0
            //     }
            //   }
            // } else {
              return (
                disabled ?
                  tooltipRender(text) : (<Form.Item>
                    {record.$form && record.$form.getFieldDecorator('detailScore', {
                      initialValue: record.detailScore,
                      rules: [{
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.scoringitems`).d('评分细项'),
                        }),
                      }]
                    })(
                      <CusInput.TextArea
                        autoChangeSize={true}
                        onChange={() => {
                          record.detailScore = record.$form.getFieldValue('detailScore')
                          // this.props.isTrue()
                        }}
                        // onBlur={(e) => {
                        //   this.handleCheck(e, record)
                        // }}
                      />
                    )}
                  </Form.Item>)
              )
            // }
          // } else {
          //   return {
          //     props: {
          //       style: { borderLeft: 'none' },
          //     }
          //   }
          // }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
        dataIndex: 'score',
        required: !disabled,
        width: 100,
        render: (text, record, index) => {
          // console.log('record', record)
          // if (record.$form !== undefined) {
            // if (index < scoreDataSource.length - 2) {
            // if (index == scoreDataSource.length - 1 || index == scoreDataSource.length - 2) {
            //   return {
            //     props: {
            //       colSpan: 3
            //     }
            //   }
            // } else {
              return (
                disabled ?
                  <div style={{ textAlign: 'right' }}>
                    {tooltipRender(numberRender(record.score, 2))}
                  </div>
                  : (<Form.Item>
                    {record.$form && record.$form.getFieldDecorator('score', {
                      initialValue: record.score,
                      rules: [{
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.score`).d('分值'),
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
                        onInput={() => record.score = record.$form.getFieldValue('score')}
                      />
                    )}
                  </Form.Item>)
              )
            // }
          // } else {
          //   return {
          //     props: {
          //       style: { borderLeft: 'none' },
          //     }
          //   }
          // }
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.objective`).d('是否客观分'),
        dataIndex: 'isObjective',
        required: !disabled,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 115 : 105) : (!disabled ? 110 : 105), // 根据try英文环境调整
        render: (_, record, index) => {
          // if (record.$form !== undefined) {
            // if (index < scoreDataSource.length - 2) {
            // if (index == scoreDataSource.length - 1 || index == scoreDataSource.length - 2) {
            //   return {
            //     props: {
            //       colSpan: 0
            //     }
            //   }
            // } else {
              return (
                // disabled ?
                  tooltipRender(record.isObjective)
                  // <Form.Item>
                  //   {record.$form && record.$form.getFieldDecorator('isObjectiveScore', {
                  //     initialValue: record.isObjectiveScore ? record.isObjectiveScore : '',
                  //     rules: [
                  //       {
                  //         required: true,
                  //         message: intl.get('hzero.common.validation.notNull', {
                  //           name: intl.get(`bid.bidcommon.view.title.objective`).d('是否客观分'),
                  //         }),
                  //       },
                  //     ],
                  //   })(
                  //     <CusSelect
                  //       allowClear
                  //       options={yesNo}
                  //       onChange={(val) => {
                  //         record.isObjectiveScore = record.$form.getFieldValue('isObjectiveScore')
                  //         // this.props.isTrue()
                  //         // this.handleIsScoreCheck(val, record)
                  //       }}
                  //     />
                  //   )}
                  // </Form.Item>
              )
            // }
          // } else {
          //   return {
          //     props: {
          //       style: { borderLeft: 'none' },
          //     }
          //   }
          // }
        },
      },
      {
        // width: 300,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 305 : 300) : (!disabled ? 510 : 515),
        title: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
        dataIndex: 'scoreType',
        required: !disabled,
        render: (_, record, index) => {
          // if (index == scoreDataSource.length - 1 || index == scoreDataSource.length - 2) {
          //   return {
          //     props: {
          //       colSpan: 0
          //     }
          //   }
          // } else {
          //   if (disabled) {
          //     return (
          //       tooltipRender(record.scoreTypeMeaning)
          //     )
          //   }
          //   if (record.$form && (record.$form.getFieldValue('isObjectiveScore') === 'YES' || record.$form.getFieldValue('isObjectiveScore') === '是')) {
              return (
                <Form.Item>
                  {record.$form && record.$form.getFieldDecorator('scoreType', {
                    initialValue: record.$form.getFieldValue('isObjectiveScore') === record.isObjectiveScore ? record.scoreType : '',
                    // initialValue: record.scoreType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
                        }),
                      }
                    ],
                  })(
                    <CusSelect
                      allowClear
                      options={scoreType1}
                      onChange={() => {
                        record.scoreType = record.$form.getFieldValue('scoreType')
                          // this.props.isTrue()
                      }}
                    />
                  )}
                </Form.Item>
              )
            // } else if (record.$form && (record.$form.getFieldValue('isObjectiveScore') === 'NO' || record.$form.getFieldValue('isObjectiveScore') === '否')) {
            //   return (
            //     <Form.Item>
            //       {record.$form && record.$form.getFieldDecorator('scoreType', {
            //         initialValue: record.$form.getFieldValue('isObjectiveScore') === record.isObjectiveScore ? record.scoreType : '',
            //         // initialValue: record.scoreType,
            //         rules: [
            //           {
            //             required: true,
            //             message: intl.get('hzero.common.validation.notNull', {
            //               name: intl.get(`bid.bidcommon.view.title.scoretype`).d('分值类型'),
            //             }),
            //           },
            //         ],
            //       })(
            //         <CusSelect
            //           allowClear
            //           options={scoreType}
            //           onChange={() => {
            //             record.scoreType = record.$form.getFieldValue('scoreType')
            //             // this.props.isTrue()
            //           }}
            //         />
            //       )}
            //     </Form.Item>
            //   )
            // }
          // }
        },
      },
      {
        // width: 300,
        width: getCurrentLanguage() === 'zh_CN' ? (!disabled ? 168 : 155) : (!disabled ? 148 : 135),
        required: !disabled,
        title: (
          labelTip({
            label: intl.get(`bid.bidcommon.view.title.scorevalue`).d('设置分值下拉值'),
            tip: intl.get(`bid.bidcommon.view.title.setscoreprompt`).d('设置分值下拉值')
          })
        ),
        dataIndex: 'dropDownScore',
        render: (text, record, index) => {
          // if (index == scoreDataSource.length - 1 || index == scoreDataSource.length - 2) {
          //   return {
          //     props: {
          //       colSpan: 0
          //     }
          //   }
          // } else {
          //   if (disabled) {
          //     return (
          //       tooltipRender(record.setScore)
          //     )
          //   }
          //   if (record.$form && record.$form.getFieldValue('scoreType') === 'objectiveMetrology_binninglinear') {
          //     return (
          //       <CusInput.TextArea
          //         autoChangeSize={true}
          //         inputChinese={false}
          //         onChange={() => {
          //           // this.props.isTrue()
          //         }}
          //       />
          //     )
          //   } else {
              // if (record.$form && record.$form.getFieldValue('isObjectiveScore')) {
                return (
              //     disabled ?
              //       tooltipRender(record.setScore)
              //       :
                    <Form.Item>
                      {record.$form && record.$form.getFieldDecorator('setScore', {
                        initialValue: record.setScore,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get('bid.bidcommon.view.title.scorevalue').d('分值下拉值'),
                            }),
                          },
                          {
                            pattern: /^[,~.0-9]*$/,
                            message: intl
                              .get(`bid.bidcommon.view.title.Onlynumbersandtsfh`)
                              .d('只能输入数字和~,.'),
                          },
                        ],
                      })(
                        <CusInput.TextArea
                          autoChangeSize={true}
                          inputChinese={false}
                          onChange={() => {
                            record.setScore = record.$form.getFieldValue('setScore')
                            // this.props.isTrue()
                          }}
                        />
                      )}
                    </Form.Item>
                )
              // } else {
              //   return (
              //     <Form.Item>
              //       <CusInput.TextArea
              //         autoChangeSize={true}
              //         inputChinese={false}
              //         placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
              //         onChange={() => {
              //           // this.props.isTrue()
              //         }}
              //       />
              //     </Form.Item>
              //   )
              // }
            // }
          // }
        }
      },
    ].filter(Boolean);

    const listProps = {
      dataSource: scoreDataSource,
      pagination: false,
      rowKey: 'poOrderId',
      // rowSelection: {
      //   selectedRowKeys,
      //   onChange: this.onRowSelectChange,
      //   getCheckboxProps: record => ({
      //     disabled: record._status === undefined || disabled,
      //   }),
      // },
      columns,
      scroll: { x: tableScrollWidth(columns), y: 440 }, // y: 480
    }
    return <>
      <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
        <CusButton>{intl.get(`${promptCode}.view.button.TemplateDownload`).d('模板下载')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.export`).d('导出')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.Import`).d('导入')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
      </div>
      <EditTable {...listProps}/>
    </>;
  }
}