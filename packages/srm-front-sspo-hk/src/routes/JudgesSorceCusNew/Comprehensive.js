/**
 * index.js - 符合性审查表-初审
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form } from 'antd';
import CusSelect from '_cus_components/CusSelect';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import { tooltipRender } from '_cus_utils/render';
import intl from 'utils/intl';

const prompt = 'bid.bidcommon';

export default class Comprehensive extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this)
    this.state = {
      passModal: false,
    };
  }

  compreForm = React.createRef();

  componentDidMount() {
    const { getPassFrame = (e) => e } = this.props;
    getPassFrame();
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   */
  handleDataChange = () => {
    this.props.dispatch({
      type: 'contractJudgesCusSorce/updateState',
      payload: {
        compreUnsaveFlag: true,
      },
    });
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  handlePageChange = (page = {}) => {
    const { getPassFrame = (e) => e, contractJudgesCusSorce: { compreUnsaveFlag } } = this.props;
    if (compreUnsaveFlag) {
      CusModal.confirm({
        content: intl
          .get(`${prompt}.view.message.confirmgetout`)
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okText: intl.get(`${prompt}.view.title.sure`).d('确定'),
        cancelText: intl.get(`${prompt}.view.button.cancel`).d('取消'),
        onOk: () => {
          this.compreForm.current?.resetFields();
          getPassFrame(page);
        },
      });
    } else {
      getPassFrame(page);
    }
  }

  render() {
    const {
      contractJudgesCusSorce: {
        passStatus = [],
        passPagination = {},
      },
      getPassFrame = (e) => e,
      trialResultSubmit,
      isSubmit,
      paStating
    } = this.props;
    // 初审
    const listProps = {
      dataSource: passStatus,
      columns: [
        {
          key: 'supplierName',
          dataIndex: 'supplierName',
          title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
          width: 500,
          ellipsis: true,
          render: tooltipRender,
        },
        {
          key: 'unqualifiedSupplierMeaning',
          dataIndex: 'unqualifiedSupplierMeaning',
          title: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
          width: 500,
          required: true,
          render: (text, record, index) => {
            if (this.props?.trialResultSubmit || (this.props?.isSubmit && this.props?.paStating)) {
              return <span>{text}</span>
            } else {
              return (
                <Form.Item
                  name={`unqualifiedSupplierMeaning${record.supplierId}`}
                  initialValue={text ? text : this.props.contractJudgesCusSorce?.enumMap?.status[1].value}
                  rules={[
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`bid.biddashbord.model.title.status`).d('状态'),
                      }),
                    },
                  ]}
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowclear="true"
                    placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                    // disabled={this.props.trialResultSubmit || (this.props.isSubmit && this.props.paStating)}
                    onChange={(_, selectVal) => {record.unqualifiedSupplier = selectVal.value; this.handleDataChange()}}
                    options={this.props.contractJudgesCusSorce?.enumMap?.status}
                  />
                </Form.Item>
              )
            }
          }
        }
      ],
      // pagination: passPagination,
      pagination: false,
      rowKey: 'passId',
      onChange: this.handlePageChange, // 校验切换分页前是否存在未保存数据
    };
    return (
      <Form ref={this.compreForm}>
        <EditTable {...listProps} bordered />
      </Form>
    );
  }
}
