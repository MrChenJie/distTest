/**
 * index.js - 符合性审查表
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, Row, Col, Select, Modal } from 'hzero-ui';
import EditTable from 'components/EditTable';
// import ValueList from 'components/ValueList';
import { queryMapIdpValue } from 'services/api';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData, getResponse, createPagination } from 'utils/utils';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';
import styles from '../index.less';
import formatterCollections from 'utils/intl/formatterCollections';

@connect(({ loading = {}, contractJudgesSorce = {} }) => ({
  complianceSourceLoading: loading.effects['contractJudgesSorce/getCompliance'],
  passListLoading: loading.effects['contractJudgesSorce/getPassFrame'],
  saveLoading: loading.effects['contractJudgesSorce/saveScore'],
  submitLoading: loading.effects['contractJudgesSorce/submitCompliance'],
  contractJudgesSorce,
}))
@formatterCollections({
  code: ['bid.bidcommon']
})
@Form.create({ fieldNameProp: null })

export default class Comprehensive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      saveFlag: false, // 是否进行了保存
      isSubmit: false, // 是否已经提交
      paStating: false, // 默认进来禁止编辑，评委确认供应商通过且采购确认完才允许编辑表格
      passModal: false,
    };
  }
  componentDidMount() {
    const { paStatus } = this.props;
    this.fetchCompliance(); // 查询数据
    if (paStatus === 'n') {
      this.setState({ paStating: false })
    } else {
      this.setState({ paStating: true })
    }
  }
  /**
   * fetchCompliance - 查询符合性审查表信息
   */
  @Bind()
  fetchCompliance() {
    const { dispatch, match } = this.props;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractJudgesSorce/getCompliance',
      payload: {
        proId: match.params.proId,
      },
    }).then((res) => {
      if (res && res[0].gradeGetState === 'y') {
        this.setState({ isSubmit: true })
      }
    });
  }

  // 值集
  fetchFastCode() {
    const codes = {
      'BID.YES_OR_NO': 'BID.YES_OR_NO',
    };
    queryMapIdpValue(codes).then((res) => {
      const response = getResponse(res);
      if (response) {
        this.setState({
          fastCodes: response,
        });
      }
    });
  }

  // 显示供应商的通过与否弹框
  @Bind
  handlePass() {
      this.getPassFrame();
      this.setState({ passModal: true });
  }

  /**
     * 查询供应商允许评分状态
    */
   @Bind
   getPassFrame(page = {}) {
       const { dispatch, match } = this.props;
       dispatch({
           type: 'contractJudgesSorce/getPassFrame',
           payload: {
               // page,
               proId: match.params.proId,
               all: 'NO'
           },
       }).then((res) => {
           if (res) {
               const newDataSource = res[0].supplierList.map((item) => ({
                   ...item,
                   _status: 'update',
               }));
               dispatch({
                   type: 'contractJudgesSorce/updateState',
                   payload: {
                       passStatus: newDataSource,
                       passPagination: createPagination(res[0].supplierList),
                   },
               });
           }
       })
   }

   /**
    * 是否允许供应商继续评分
   */
   @Bind
   supplierPass() {
       const { dispatch, match, contractJudgesSorce: { passStatus } } = this.props;
       let newData = [];
       passStatus.map((item) => {
           newData.push({ 
               supplierId: item.supplierId,
               unqualifiedSupplier: item.unqualifiedSupplier
           })
       })
       dispatch({
           type: 'contractJudgesSorce/supplierPass',
           payload: {
               proId: match.params.proId,
               passList: [...newData]
           },
       }).then((res) => {
           if (res.message === 'ok') {
               notification.success();
               this.setState({ status: false, passModal: false });
           }
       })
   }

  @Bind
  handleCancel() {
    this.setState({ passModal: false });
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
  @Debounce(300, { leading: true })
  @Bind()
  handleSave() {
    const { dispatch, match, contractJudgesSorce } = this.props;
    const { complianceSource = [] } = contractJudgesSorce;
    const saveDate = complianceSource.filter((item) => item._status === 'update');
    const newData = saveDate.filter((item) => (item.examineReason !== undefined || item.examineResult !== undefined) && item );
    // const saveDate = getEditTableData(complianceSource).map((item) =>
    //   item
    // );
    for (let i = 0; i < saveDate.length; i++) {
      saveDate[i].proId = match.params.proId
    }
    if (newData.length > 0) {
      dispatch({
        type: 'contractJudgesSorce/saveCompliance',
        payload: {
          saveDate: [...saveDate],
        },
      }).then((res) => {
        if (res.message == 'ok') {
          this.setState({ saveFlag: true })
          notification.success({
            message: intl.get(`bid.bidcommon.view.title.savesuccessfully`).d('保存成功'),
          });
          this.fetchCompliance()
        }
      });
    } else {
      notification.error({ message: intl.get('hzero.common.validation.notNull', {
        name: intl.get('bid.bidcommon.view.title.reviewresults').d('审查结果'),
      }) })
    }
  }

  // 提交
  @Bind()
  handleSubmit() {
    const { dispatch, match, contractJudgesSorce: { complianceSource = [] } } = this.props;
    const { saveFlag } = this.state;
    if (!saveFlag) {
      const saveDate = complianceSource.filter((item) => item._status === 'update');
      const newData = saveDate.filter((item) => (item.examineReason !== undefined || item.examineResult !== undefined) && item );
      for (let i = 0; i < saveDate.length; i++) {
        saveDate[i].proId = match.params.proId
      }
      if (newData.length > 0) {
        dispatch({
          type: 'contractJudgesSorce/saveCompliance',
          payload: {
            saveDate: [...saveDate],
          },
        }).then((res) => {
          if (res.message == 'ok') {
            this.setState({ saveFlag: false })
            dispatch({
              type: 'contractJudgesSorce/submitCompliance',
              payload: {
                proId: match.params.proId,
              },
            }).then(() => {
              this.setState({ isSubmit: true });
              this.fetchCompliance();
              notification.success({
                message: intl
                  .get(`bid.bidcommon.view.title.submitsuccessfully`)
                  .d('提交成功'),
              });
            });
          }
        });
      } else {
        notification.error({ message: intl.get('hzero.common.validation.notNull', {
          name: intl.get('bid.bidcommon.view.title.reviewresults').d('审查结果'),
        }) })
      }
    } else {
      dispatch({
        type: 'contractJudgesSorce/submitCompliance',
        payload: {
          proId: match.params.proId,
        },
      }).then(() => {
        this.fetchCompliance();
        this.setState({ saveFlag: false })
        notification.success({
          message: intl
            .get(`bid.bidcommon.view.title.submitsuccessfully`)
            .d('提交成功'),
        });
      });
    }
  }

  @Bind
  changeChosen(record, index) {
      const { contractJudgesSorce: { passStatus } } = this.props;
      passStatus[index].unqualifiedSupplier = record.$form.getFieldValue(`unqualifiedSupplier`)
  }

  render() {
    const {
      bidType,
      fetchSourceList,
      passList,
      saveLoading,
      submitLoading,
      passListLoading,
      contractJudgesSorce,
      complianceSourceLoading,
    } = this.props;
    const { isSubmit, passModal, paStating } = this.state;
    const { complianceSource = [], enumMap, passStatus = [] } = contractJudgesSorce;
    const { yesNO = [], status = [] } = enumMap;
    const columns =
      complianceSource.length > 0 ? complianceSource.map((v, index) => {
        return {
          key: `${index}`,
          title: `${v.supplierName}`,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          children: [
            {
              title: intl.get(`bid.bidcommon.view.title.reviewresults`).d('审查结果') + intl.get(`bid.bidcommon.view.title.reviewresultsremarks`).d('(请填写是否通过审查)'),
              // dataIndex: `${v.examineResult}`,
              width: 200,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
              render: (text, record) => {
                if (record.$form !== undefined) {
                  return (
                    <Form.Item>
                      {record.$form.getFieldDecorator(`examineResult${index}`, {
                        initialValue: record.list[index].examineResult,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get('bid.bidcommon.view.title.reviewresults').d('审查结果'),
                            }),
                          },
                        ],
                      })(
                        <Select allowclear style={{ minWidth: 150 }}
                          disabled={record.list[index].gradeGetState === 'y' || (!paStating && bidType !== 'single_source')}
                          onChange={(e) => { record.list[index].examineResult = e }}>
                          {yesNO.map((n) => (
                            <Select.Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                        // <ValueList
                        //   placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                        //   style={{ width: '100%' }}
                        //   options={fastCodes['BID.YES_OR_NO']}
                        //   lazyLoad={false}
                        // />
                      )}
                    </Form.Item>
                  )
                }
              }
            },
            {
              title: intl.get(`bid.bidcommon.bid.title.Reason2`).d('理由'),
              // dataIndex: `${v.examineReason}`,
              width: 200,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
              render: (text, record) => {
                if (record.$form != undefined) {
                  return (
                    <Form.Item>
                      {record.$form.getFieldDecorator(`examineReason${index}`, {
                        initialValue: record.list[index].examineReason,
                        // rules: [
                        //   {
                        //     required: true,
                        //     message: intl.get('hzero.common.validation.notNull', {
                        //       name: intl.get('bid.bidcommon.view.title.Reason').d('供应商'),
                        //     }),
                        //   },
                        // ],
                      })(
                        <Input
                          placeholder={intl.get(`bid.bidcommon.view.title.pleaseenter`).d('请输入')}
                          disabled={record.list[index].gradeGetState === 'y' || (!paStating && bidType !== 'single_source')}
                          onChange={(e) => { record.list[index].examineReason = e.currentTarget.value }} />
                      )}
                    </Form.Item>
                  )
                }
              }
            }
          ]
        }
      }) : [
        {
          title: '',
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          children: [
            {
              title: intl.get(`bid.bidcommon.view.title.reviewresults`).d('审查结果（请填写是否通过审查）'),
              // dataIndex: `${v.examineResult}`,
              width: 200,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            },
            {
              title: intl.get(`bid.bidcommon.bid.title.Reason2`).d('理由'),
              // dataIndex: `${v.examineReason}`,
              width: 200,
              onHeaderCell: () => ({ className: styles['table-thead-required'] }),
            }
          ]
        }
      ];
    const newData = [{ list: complianceSource, _status: 'update' }]
    const otherListProps = {
      dataSource: newData,
      columns,
      contractJudgesSorce,
      loading: fetchSourceList,
      pagination: false,
      loading: complianceSourceLoading
    };
    const listProps = {
      dataSource: passStatus,
      columns: [
        {
          title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商'),
          dataIndex: 'supplierName',
          width: 100,
          render: (text, record) => {
            return (
              <span>{record.supplierName}</span>
            )
          }
        },
        {
          title: intl.get(`bid.bidcommon.view.title.status`).d('状态'),
          dataIndex: 'unqualifiedSupplier',
          width: 100,
          onHeaderCell: () => ({ className: styles['table-thead-required'] }),
          render: (text, record, index) => {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator(`unqualifiedSupplier`, {
                  initialValue: record.unqualifiedSupplier,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.bidcommon.view.title.status`).d('状态'),
                    }),
                  }]
                })(
                  <Select style={{ width: 100 }} >
                    {status.map((n) => (
                      <Select.Option key={n.value} value={n.value} onChange={this.changeChosen(record, index)}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            )
          }
        }
      ],
      // pagination: passPagination,
      pagination: false,
      loading: passList,
    };
    otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        <Content>
          <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
            <Col span={24} className="customize-buttons" style={{display: 'flex', alignItems: 'baseline', justifyContent: 'end'}} >
              { bidType !== 'single_source' && 
                <div>
                  <Button onClick={this.handlePass} disabled={paStating || (isSubmit && paStating)} loading={passListLoading}>
                    <img src={submitIcon} style={{ width: '10px' }}/>
                    {intl.get(`bid.bidcommon.view.title.PreliminaryReview`).d('技术符合审查(初审)')}
                  </Button>
                  <div color='#a19b9b' 
                      style={{
                          fontSize: '12px',
                          textAlign: 'center', 
                          paddingLeft: '5px'}}
                  >
                      {intl.get(`bid.bidcommon.view.title.judgeremind`).d('请评委先进行初审')}
                  </div>
                </div>
              }
              <Button onClick={this.handleSave} disabled={isSubmit} loading={saveLoading}>
                <img src={saveIcon} alt="" />
                {intl.get(`bid.bidcommon.view.button.save`).d('保存')}
              </Button>
              <Button onClick={this.handleSubmit} disabled={isSubmit} loading={submitLoading}>
                <img src={submitIcon} alt="" style={{ width: '10px' }}/>
                {intl.get(`bid.bidcommon.view.button.submit`).d('提交')}
              </Button>
            </Col>
          </Row>
          <EditTable bordered {...otherListProps} />
          <Modal
            title={intl.get(`bid.bidcommon.view.title.PreliminaryReview`).d('技术符合审查(初审)')}
            visible={passModal}
            destroyOnClose
            width='45%'
            style={{ top: 150 }}
            cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
            okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
            onCancel={this.handleCancel}
            onOk={this.supplierPass}
          >
            <EditTable bordered {...listProps} ></EditTable>
          </Modal>
        </Content>
      </Fragment>
    );
  }
}
