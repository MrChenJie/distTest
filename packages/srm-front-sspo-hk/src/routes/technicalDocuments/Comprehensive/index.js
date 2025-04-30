/**
 * index.js - 符合性审查表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, Row, Col } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';

// const viewMessagePrompt = 'spcm.common.view.message.title';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  fetchSourceList: loading.effects['contractJudgesSorce/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractJudgesSorce/fetchEnum'],
  contractJudgesSorce,
}))

export default class Comprehensive extends Component {
    constructor(props) {
      super(props);
      const {
        // match,
      } = this.props;
      this.state = {
        isSave: false, // 是否进行了保存
      };
    }
    componentDidMount() {
      this.fetchCompliance(); // 查询数据
    }
    /**
     * fetchCompliance - 查询符合性审查表信息
     */
    @Bind()
    fetchCompliance(page = {}) {
      const { dispatch, match } = this.props;
      this.setState({ selectedRows: [], selectedRowKeys: [] });
      dispatch({
        type: 'contractJudgesSorce/getCompliance',
        payload: {
          proId: 3, // match.params.proId
        },
      });
    }

    /**
     * 设置选中行
     * @param {Array} selectedRowKeys
     * @param {Array} selectedRows
     */
    @Bind()
    onRowSelectChange(selectedRowKeys, selectedRows) {
      this.setState({
        selectedRows,
        selectedRowKeys,
      });
    }

    // 保存
    @Bind()
    handleSave() {
      const { dispatch, contractJudgesSorce } = this.props;
      const { complianceSource = [] } = contractJudgesSorce;
      const saveDate = getEditTableData(complianceSource).map((item) =>
        item
      );
      for (let i = 0; i < saveDate.length; i++) {
        saveDate[i].proId = 3
      }
      if (saveDate.length > 0) {
        dispatch({
          type: 'contractJudgesSorce/saveCompliance',
          payload: {
            saveDate,
          },
        }).then((res) => {
          if (res.message == 'ok') {
            this.setState({
                isSave: true
            })
            notification.success({
                message: intl
                  .get(`bid.bidcommon.view.title.savesuccessfully`)
                  .d('保存成功'),
            });
            this.fetchCompliance()
          }
        });
      }
    }

    // 提交
    @Bind()
    handleSubmit() {
      const { dispatch, match } = this.props;
      const { isSave } = this.state;
      if (isSave) {
        dispatch({
          type: 'contractJudgesSorce/submitCompliance',
          payload: {
            proId: 3, // match.params.proId
          },
        }).then((res) => {
          notification.success({
              message: intl
              .get(`warning.message.createNeedAfterSave`)
              .d('提交成功'),
          });
        });
      } else {
        notification.error({
          message: intl
          .get(`warning.message.createNeedAfterSave`)
          .d('请先进行保存'),
        });
      }
    }

    render() {
        const {
          fetchSourceList,
          contractJudgesSorce,
          deleteLinesLoading = false,
          form
        } = this.props;
        const { complianceSource = [] } = contractJudgesSorce;
        const columns = [
          {
            title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('供应商'),
            dataIndex: 'supplierName',
          },
          {
            title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('审查结果'),
            dataIndex: 'examineResult',
            render: (text, row, index) => {
              if (row.$form !== undefined) {
                const {getFieldDecorator} = row.$form;
                return (
                  <p>{row.examineResult}</p>
              //     <Form.Item>
              //       {getFieldDecorator('examineResult', {
              //         initialValue: row.examineResult,
              //       })(
              //         <Select>
              //           {(code['BID.EXPERT_TYPE'] || []).map((n) => (
              //             <Select.Option key={n.value} value={n.value}>
              //               {n.meaning}
              //             </Select.Option>
              //           ))}
              //         </Select>
              //       )}
              //     </Form.Item>
                )
              }
            }
          },
          {
            title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('理由'),
            dataIndex: 'examineReason',
            render: (text, row, index) => {
              if (row.$form != undefined) {
                const { getFieldDecorator, getFieldValue } = row.$form;
                return (
                  <Form.Item>
                    {getFieldDecorator('examineReason', {
                      initialValue: row.examineReason,
                    })(
                      <Input 
                      placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('请输入')}
                      onChange={() => row.examineReason = getFieldValue('examineReason')} />
                    )}
                  </Form.Item>
                  // <Input placeholder='请输入' onChange={() => row.examineReason = row.$form.getFieldValue('answerGetReason')}></Input>
                )
              }
            }
          }
        ];
        const otherListProps = {
          dataSource: complianceSource,
          columns,
          contractJudgesSorce,
          loading: fetchSourceList
        };
        otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
        return (
          <Fragment>
            <Content>
              <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
                <Col span={24} className="customize-buttons">
                  <Button onClick={this.handleSave}>
                    <img src={saveIcon} alt="" />
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  <Button onClick={this.handleSubmit}>
                    <img src={submitIcon} alt="" />
                    {intl.get('hzero.common.button.submit').d('提交')}
                  </Button>
                </Col>
              </Row>
              <EditTable bordered {...otherListProps} />
            </Content>
          </Fragment>
        );
    }
}
