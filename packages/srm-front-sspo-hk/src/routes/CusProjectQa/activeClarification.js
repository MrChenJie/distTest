/** -- CMI主动澄清的表
 * @date: 2022/04/29 11:50:55
 * @author: Chenjie <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';

import intl from 'utils/intl';
import { tableScrollWidth, getResponse, getCurrentLanguage } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import EditTable from '_cus_components/EditTable';
import { queryMapIdpValue } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusModal from '_cus_components/CusModal';
import { tooltipRender } from '_cus_utils/render';

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
    this.props.onRef && this.props.onRef(this);
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

  // @Bind
  // handleSave() {
  //   const { onSave = (e) => e, } = this.props;
  //   onSave();
  //   this.setState({
  //     selectedRowKeys: [],
  //     selectedRows: [],
  //   });
  // }

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
      CusModal.confirm({
        content: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
        okType: 'normal',
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
      // dataSource = [],
      pagination = {},
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      onClarificationRow = (e) => e,
      poHeaderMilestonesInfo,
    } = this.props;
    const { selectedRowKeys = [], fastCodes = {} } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.CMIcategory`).d('分类'),
        dataIndex: 'qaType',
        key: 'qaType',
        width: 320,
        required: true,
        render: (val, record) =>
          record.ansPublished === 'y' || poHeaderMilestonesInfo.milestoneState === 'completed' ? (
            tooltipRender(record.qaTypeMeaning)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('qaType', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.CMIcategory`).d('分类'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  allowClear
                  style={{ width: '100%' }}
                  options={fastCodes['BID.CLASSIFICATION']}
                />
              )}
            </Form.Item>
          ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifyentry`).d('澄清条目'),
        dataIndex: 'caseDetailNew',
        key: 'caseDetailNew',
        required: true,
        width: 410,
        render: (val, record) =>
          record.ansPublished === 'y' || poHeaderMilestonesInfo.milestoneState === 'completed' ? (
            tooltipRender(val)
          ) : (
            <Form.Item>
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
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifycontent`).d('澄清内容'),
        dataIndex: 'qaContent',
        key: 'qaContent',
        required: true,
        width: 410,
        render: (val, record) =>
          record.ansPublished === 'y' || poHeaderMilestonesInfo.milestoneState === 'completed' ? (
            tooltipRender(val)
          ) : (
            <Form.Item>
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
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifydetail`).d('澄清明细'),
        dataIndex: 'answerContent',
        key: 'answerContent',
        required: true,
        width: 410,
        render: (val, record) =>
          record.ansPublished === 'y' || poHeaderMilestonesInfo.milestoneState === 'completed' ? (
            tooltipRender(val)
          ) : (
            <Form.Item>
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
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.CMIclarifyDate`).d('澄清日期'),
        dataIndex: 'askQuestTime',
        key: 'askQuestTime',
        width: getCurrentLanguage() === 'zh_CN' ? 118 : 118,
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
      getCheckboxProps: (record) => ({
        disabled:
          record.ansPublished === 'y' || poHeaderMilestonesInfo.milestoneState === 'completed',
      }),
    };

    let dataSource = [...this.props.dataSource]
    return (
      <>
        <CusSpin spinning={false}>
          {/* <div style={{marginBottom: '16px', textAlign: 'right'}}> */}
            {/* <CusButton
              onClick={this.handleDeleteLine}
              disabled={selectedRowKeys.length === 0 || loading}
            >
              {intl.get('bid.bidcommon.view.button.delete').d('删除')}
            </CusButton> */}
            {/* disabled={submitFlag || timeFlag} 暂不需要判断*/}
            {/* <CusButton onClick={this.handleAddLine} >
              {intl.get('bid.bidcommon.view.button.add').d('添加')}
            </CusButton> */}
            {/* disabled={submitFlag || timeFlag} 暂不需要判断*/}
            {/* <CusButton disabled={dataSource.length === 0} onClick={this.handleSave}>
              {intl.get('bid.bidcommon.view.button.save').d('保存')}
            </CusButton> */}
          {/* </div> */}
          <EditTable
            rowKey="rowKey"
            dataSource={dataSource}
            pagination={pagination}
            onChange={this.handlePageChange}
            columns={columns}
            rowSelection={rowSelection}
            onDataChange={this.handleDataChange}
            scroll={{ x: tableScrollWidth(columns) }}
          />
        </CusSpin>
      </>
    );
  }
}
