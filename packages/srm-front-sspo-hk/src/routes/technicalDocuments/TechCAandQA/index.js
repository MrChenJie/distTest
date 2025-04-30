/**
 * index.js - 技术澄清提问
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Table, Form, Select, Input, Card, Row, Col, Modal } from 'hzero-ui';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { queryMapIdpValue } from 'services/api';
import { Content } from 'components/Page';
import { sum } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { connect } from 'dva';
import { Link } from 'dva/router';
import intl from 'utils/intl';
import { getEditTableData, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import submitIcon from '@/assets/buttonIcons/提交.png';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import {
  addItemToPagination,
  getCurrentOrganizationId,
  delItemsToPagination,
} from 'hzero-front/lib/utils/utils';

const viewMessagePrompt = 'spcm.common.view.message.title';

let newDataList = [];

@connect(({ contractJudgesSorce }) => ({
  mySource: contractJudgesSorce.mySource,
  otherSource: contractJudgesSorce.otherSource,
  contractJudgesSorce,
}))
@Form.create({ fieldNameProp: null })
export default class TechCAandQA extends Component {
  constructor(props) {
    super(props);
    const {

    } = this.props;
    this.state = {
      fastCodes: {}
    };
  }
  componentDidMount() {
    this.fetchCAandQAList(); // 查询数据
    this.fetchOtherList();
    this.fetchFastCode();
  }

  /**
   * fetchCAandQAList - 查询自己的技术澄清提问表格信息
   */
  @Bind()
  fetchCAandQAList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getcaqaList',
      payload: {
        page,
        proId: 61, // match.params.proId
        milestoneId: 449,
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          rowKey: uuidv4(),
        }));
        dispatch({
          type: 'contractJudgesSorce/updateState',
          payload: {
            mySource: newDataSource,
            myPagination: pagination,
          },
        });
      }
    })
  }

  /**
   * 查询别人的技术澄清提问表格信息
  */
  @Bind
  fetchOtherList(page = {}) {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractJudgesSorce/getOtherCaqaList',
      payload: {
        page,
        proId: 61, // match.params.proId
        milestoneId: 449,
      }
    })
    //  .then((res) => {
    //   if (res) {
    //     const { content = [] } = res;
    //     const newDataSource = content.map((item) => ({
    //       ...item,
    //       _status: 'update',
    //       rowKey: uuidv4(),
    //     }));
    //     dispatch({
    //       type: 'contractJudgesSorce/updateState',
    //       payload: {
    //         otherSource: newDataSource,
    //       },
    //     });
    //   }
    // })
  }
 
  fetchFastCode() {
    const codes = {
      'BID.CLASSIFICATION': 'BID.CLASSIFICATION',
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

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof ActiveClarificationTable
   */
  @Bind
  handleDataChange() {
    const { unsaveFlag } = this.props;
    if (!unsaveFlag) {
      const { onEdit = (e) => e } = this.props;
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof ActiveClarificationTable
   */
  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e, unsaveFlag } = this.props;
    if (unsaveFlag) {
      Modal.confirm({
        title: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
        onOk: () => {
          onPageChange(page);
        },
      });
    } else {
      onPageChange(page);
    }
  }

  // 保存
  @Bind
  handleSave() {
    const { dispatch, contractJudgesSorce } = this.props;
    const { mySource = [] } = contractJudgesSorce;
    const data = getEditTableData(mySource).map((item) =>
      item._status === 'create'
        ? {
            ...item,
            poOrderId: undefined,
          }
        : item
    );
    if (data.length > 0) {
      dispatch({
        type: 'contractJudgesSorce/saveClarification',
        payload: {
          data,
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchCAandQAList();
        }
      });
    }
  }

  // 提交
  @Debounce(200)
  @Bind
  handleSubmit() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractJudgesSorce/submit',
      payload: {
        proId: 61, // 项目Id
        milestoneId: 449, // 里程碑Id
      },
    }).then((res) => {
      if (res) {
        notification.success();
      }
    })
  }
  // 添加
  @Bind
  handleAddQusetionLine() {
    const { contractJudgesSorce, dispatch, match } = this.props;
    // const { poHeadersId } = match.params;
    const { mySource = [], myPagination = {} } = contractJudgesSorce;
    const newLine = {
      _status: 'create',
      organizationId: getCurrentOrganizationId(),
      proId: 61, // 项目ID
      milestoneId: 449, // 里程碑ID
      // poOrderId: uuidv4(),
      // creationDate: moment().format('YYYY-MM-DD 00:00:00'),
      // realName: getCurrentUser().realName,
      // editFlag: 'Y',
      // poHeadersId: +poHeadersId,
    };
    const newDataSource = [newLine, ...mySource];
    const newPagination = addItemToPagination(
      mySource.length,
      myPagination
    );
    dispatch({
      type: 'contractJudgesSorce/updateState',
      payload: {
        mySource: newDataSource,
        myPagination: newPagination,
      },
    });
  }

  // 删除
  @Bind
  handleDeleteQusetionLine(callback) {
    const { contractJudgesSorce, dispatch } = this.props;
    const { mySource = [], myPagination = {} } = contractJudgesSorce;
    const { selectedRows, selectedRowKeys } = this.state;
    const newDataSource = selectedRows;
    const deleteData = selectedRows;
    const newPagination = delItemsToPagination(
      selectedRowKeys.length,
      mySource.length,
      myPagination
    );

    const data = deleteData.filter((item) => item._status === 'update');
    const remainCreateData = newDataSource.filter((item) => item._status === 'create');
    if (data.length > 0) {
      if (remainCreateData.length > 0) {
        Modal.info({
          title: intl
            .get('sodr.purchaseOrder.view.info.ramainCreateData')
            .d('存在新增的行没有保存！'),
        });
        return false;
      } else {
        dispatch({
          type: 'contractJudgesSorce/deleteClarification',
          payload: {
            data,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            const { current, pageSize, sourceSize } = myPagination;
            this.fetchCAandQAList({
              current,
              pageSize: sourceSize || pageSize,
            });
            callback();
          }
        });
      }
    } else {
      if (remainCreateData.length > 0) {
        Modal.info({
          title: intl
            .get('sodr.purchaseOrder.view.info.ramainCreateData')
            .d('存在新增的行没有保存！'),
        });
        return false;
      } 
      // 下面放开后选中新增未保存的数据会只显示一行新增的数据
      // else {
      //   dispatch({
      //     type: 'contractJudgesSorce/updateState',
      //     payload: {
      //       mySource: newDataSource,
      //       myPagination: newPagination,
      //     },
      //   });
      //   callback();
      // }
    }
  }

  /**
   * 新建-添加行
  */
  @Bind
  handleAdd() {
    const { onAddLine = (e) => e } = this.props;
    onAddLine();
    this.handleDataChange();
  }

  /**
   *删除-删除行
   */
  @Bind
  @Debounce(300, { leading: true })
  handleDeleteLine() {
    const { onDeleteLine = (e) => e } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    onDeleteLine(selectedRowKeys, selectedRows, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
    });
  }

  render() {
    const {
      form,
      contractJudgesSorce: {
        mySource = [],
        otherSource = []
      },
      deleteLinesLoading = false,
      myPagination,
    } = this.props;
    const {
      selectedRowKeys = [],
      fastCodes = {}
    } = this.state;

    // 从其他评委的问题中拎出answerDTOList循环供应商
    let lists = []
    const { answerDTOList = [] } = otherSource.map((item ) => {
        lists.push(item.answerDTOList)
    })
    lists.map((items) => {
        newDataList.push(items)
    })

    const myColumns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('供应商'),
        dataIndex: 'milestoneId',
        width: 200,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('milestoneId', {
              initialValue: val,
            })(
              // <Select style={{ width: 150 }}>
              //     {(code['BID.YES_OR_NO'] || []).map((n) => (
              //     <Select.Option key={n.value} value={n.value}>
              //         {n.meaning}
              //     </Select.Option>
              //     )
              // )}
              // </Select>
              <Select placeholder="请选择" value={val} style={{ width: '100%' }}
              // onChange={this.handleCurrencyChange}
              >
                <Select.Option value="rmb">供应商q1</Select.Option>
                <Select.Option value="dollar">供应商q2</Select.Option>
              </Select>
            )}
          </Form.Item>
        )
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('问题分类'),
        key: 'qaType',
        dataIndex: 'qaType',
        width: 200,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('qaType', {
                 initialValue: val
               })(
                 <ValueList
                   style={{ width: '100%' }}
                   options={fastCodes['BID.CLASSIFICATION']}
                   lazyLoad={false}
                   allowClear
                 />
               )}
          </Form.Item>
        )
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('条目'),
        dataIndex: 'caseDetail',
        width: 200,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('caseDetail', {
              initialValue: val,
            })(
              <Input />
            )}
          </Form.Item>
        )
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('问题'),
        dataIndex: 'qaContent',
        width: 200,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('qaContent', {
              initialValue: val,
            })(
              <Input />
            )}
          </Form.Item>
        )
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('提出问题时间'),
        dataIndex: 'askQuestTime',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('供应商答复内容'),
        dataIndex: 'answerContent',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('供应商答复时间'),
        dataIndex: 'answerTime',
        width: 200,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('附件'),
        dataIndex: 'answerFileUrl',
        width: 200,
        render: (row, index) => {
          // if (row.enclosure == '未发布') {
          return (
            <Link to=''>查看附件</Link>
          )
          // }
        }
      }
    ];
    const otherColumns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('问题'),
        dataIndex: 'qaContent',
        width: 200, 
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('提出问题时间'),
        dataIndex: 'askQuestTime',
        fixed: 'left',
      },
      ...(newDataList).map((v, index) => {
        return {
          key: `${index}`,
          title: `${v[index] != undefined && v[index].answerUserName}`,
          children: [
            {
              title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('答复内容'),
              dataIndex: `${v[index] != undefined && v[index].answerContent}`,
              width: 200, 
            },
            {
              title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyName`).d('答复时间'),
              dataIndex: `${v[index] != undefined && v[index].answerTime}`,
              width: 200, 
            }
          ]
        }
      })
    ];
    const listProps = {
      form,
      dataSource: mySource,
      columns: myColumns,
      pagination: myPagination,
      rowSelection: {
        selectedRowKeys,
        onChange:  (keys,rows) => {
          this.setState({
            selectedRowKeys: keys,
            selectedRows: rows,
          });
          this.onRowSelectChange
        },
      },
    };
    const otherListProps = {
      dataSource: otherSource,
      columns: otherColumns,
    };
    listProps.scroll = { x: sum(listProps.columns.map((n) => n.width)) + 300 };
    otherListProps.scroll = { x: sum(otherListProps.columns.map((n) => n.width)) + 300 };
    return (
      <Fragment>
        <Content>
          <Card
            // key="contractHeaderInformation"
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl
                  .get(`${viewMessagePrompt}.contractHeaderInformatin`)
                  .d('评委提出的问题')}
              </h3>
            }
          >
            <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
              <Col span={24} className="customize-buttons">
                <Button onClick={this.handleSave}>
                  <img src={saveIcon} alt="" />
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button onClick={this.handleSubmit}>
                  <img src={submitIcon} alt="" />
                  {intl.get('hzero.common.button.submit').d('提交问题')}
                </Button>
                <Button
                  onClick={this.handleDeleteQusetionLine}
                  loading={deleteLinesLoading}
                >
                  <img src={deleteIcon} alt="" />
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
                <Button onClick={this.handleAddQusetionLine} >
                  <img src={addIcon} alt="" />
                  {intl.get('hzero.common.button.add').d('新建')}
                </Button>
              </Col>
            </Row>
            <EditTable bordered {...listProps} />
          </Card>
          <Card
            // key="contractHeaderInformation"
            id="spcm-contract-maintain-detail-contract-header-information"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>
                {intl
                  .get(`${viewMessagePrompt}.contractHeaderInformatin`)
                  .d('其他评委提出的问题')}
              </h3>
            }
          >
            <Table bordered {...otherListProps} />
          </Card>
        </Content>
      </Fragment>
    );
  }
}
