/** -- CMI主动澄清的表
 * @date: 2022/04/29 11:50:55
 * @author: Chenjie <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Modal, Tooltip } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentOrganizationId, tableScrollWidth, getResponse } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { queryMapIdpValue } from 'services/api';
import styles from './index.less';

import deleteIcon from '@/assets/buttonIcons/删除.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import formatterCollections from 'utils/intl/formatterCollections';

const status = ['create', 'update'];

@formatterCollections({
  code: ['bid.bidcommon'],
})
export default class ActiveClarificationTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      fastCodes: {},
    };
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    // this.checkPermission();
    this.fetchFastCode();
  }

  componentWillReceiveProps(nexProps) {
    if(nexProps.selectedRowKeys.length === 0) {
      this.setState({
        selectedRowKeys: []
      })
    }
  }

  checkStatus(record) {
    const { isEdit } = this.props;
    return status.includes(record._status) && isEdit;
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
   * 添加行
   *
   * @memberof ActiveClarificationTable
   */
  @Bind
  handleAddLine() {
    const { onAddLine = (e) => e } = this.props;
    onAddLine();
    this.handleDataChange();
  }

  /**
   *删除行
   *
   * @memberof ActiveClarificationTable
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

  @Bind
  handleSave() {
    const { onSave = (e) => e, } = this.props;
    onSave();
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
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

  render() {
    const {
      dataSource = [],
      pagination = {},
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      onClarificationRow = (e) => e
    } = this.props;
    const { selectedRowKeys = [], fastCodes = {} } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.CMIcategory`).d('分类'),
        dataIndex: 'qaType',
        key: 'qaType',
        width: 180,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('qaType', {
              initialValue: val,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`bid.bidcommon.view.title.CMIcategory`)
                      .d('分类'),
                  }),
                },
              ],
            })(
              <ValueList
                disabled={record.ansPublished === 'y'}
                style={{ width: '100%' }}
                options={fastCodes['BID.CLASSIFICATION']}
                lazyLoad={false}
                allowClear
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifyentry`).d('澄清条目'),
        dataIndex: 'caseDetailNew',
        key: 'caseDetailNew',
        width: 180,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('caseDetailNew', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.CMIclarifyentry`).d('澄清条目'),
                    }),
                  },
                ],
              })(<Input
                disabled={record.ansPublished === 'y'}
              />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifycontent`).d('澄清内容'),
        dataIndex: 'qaContent',
        key: 'qaContent',
        width: 180,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('qaContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.CMIclarifycontent`).d('澄清内容'),
                    }),
                  },
                ],
              })(<Input
                disabled={record.ansPublished === 'y'}
              />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      // {
      //   title: intl.get(`bid.bidcommon.view.title.questiontime`).d('提问时间'),
      //   dataIndex: 'askQuestTime',
      //   key: 'askQuestTime',
      //   width: 180,
      //   render: (val) => dateRender(val),
      // },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifydetail`).d('澄清明细'),
        dataIndex: 'answerContent',
        key: 'answerContent',
        width: 180,
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('answerContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.CMIclarifydetail`).d('澄清明细'),
                    }),
                  },
                ],
              })(<Input
                disabled={record.ansPublished === 'y'}
              />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifytime`).d('澄清时间'),
        dataIndex: 'answerTime',
        key: 'answerTime',
        width: 180,
        render: (val) => dateRender(val),
      },
    ];

    const loading = saveLoading || deleteLoading || fetchLoading;

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
        onClarificationRow(rows);
      },
      getCheckboxProps: record => ({
        disabled: record.ansPublished === 'y',
      })
    };

    return (
      <div style={{ marginTop: '-10px' }}>
        {/* {isEdit && ( */}
        <div
          style={{
            marginBottom: '10px',
            float: 'right',
          }}
          className="customize-buttons"
        >
          <Button
            onClick={this.handleDeleteLine}
            disabled={selectedRowKeys.length === 0 || loading}
            //  loading={deleteLoading}
          >
            <img src={deleteIcon} alt="" />
            {intl.get('bid.bidcommon.view.button.delete').d('删除')}
          </Button>
          {/* disabled={submitFlag || timeFlag} 暂不需要判断*/}
          <Button onClick={this.handleAddLine} >
            <img src={addIcon} alt="" />
            {intl.get('bid.bidcommon.view.button.add').d('添加')}
          </Button>
          {/* disabled={submitFlag || timeFlag} 暂不需要判断*/}
          <Button disabled={dataSource.length === 0} onClick={this.handleSave} loading={saveLoading}>
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </Button>
        </div>
        {/* )} */}
        <div style={{ clear: 'both' }} />
        <EditTable
          bordered
          rowKey="rowKey"
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handlePageChange}
          columns={columns}
          loading={fetchLoading}
          rowSelection={rowSelection}
          onDataChange={this.handleDataChange}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </div>
    );
  }
}
