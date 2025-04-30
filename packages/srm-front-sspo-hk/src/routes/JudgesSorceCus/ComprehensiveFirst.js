/**
 * index.js - 符合性审查表-初评
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input } from 'antd';
import CusSelect from '_cus_components/CusSelect';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import { tooltipRender } from '_cus_utils/render';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import styles from './index.less';

const prompt = 'bid.bidcommon';

export default class ComprehensiveFirst extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this)
    this.state = {
      passModal: false,
    };
  }

  compreFormFirst = React.createRef();

  componentDidMount() {
    const { fetchCompliance = (e) => e } = this.props;
      fetchCompliance();
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   */
  handleDataChange = () => {
    this.props.dispatch({
      type: 'contractJudgesCusSorce/updateState',
      payload: {
        compreFirstUnsaveFlag: true,
      },
    });
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   */
  handlePageChange = (page = {}) => {
    const { fetchCompliance = (e) => e, contractJudgesCusSorce: { compreFirstUnsaveFlag } } = this.props;
    if (compreFirstUnsaveFlag) {
      CusModal.confirm({
        content: intl
          .get(`${prompt}.view.message.confirmgetout`)
          .d('当前页面有未保存数据，继续操作，数据将丢失，请确认继续？'),
        okText: intl.get(`${prompt}.view.title.sure`).d('确定'),
        cancelText: intl.get(`${prompt}.view.button.cancel`).d('取消'),
        onOk: () => {
          this.compreFormFirst.current?.resetFields();
          fetchCompliance(page);
        },
      });
    } else {
      fetchCompliance(page);
    }
  }

  render() {
    const {
      contractJudgesCusSorce: {
        complianceSource = [],
        compliancePagination = {},
      },
      fetchCompliance = (e) => e,
      isSubmit,
      bidType,
      paStating
    } = this.props;
    const columns = [
      {
        key: 'supplierName',
        dataIndex: 'supplierName',
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        width: 300,
        ellipsis: true,
        resizable: true,
        render: tooltipRender,
      },
      {
        key: 'examineResult',
        dataIndex: 'examineResult',
        title: intl.get(`bid.bidcommon.view.title.reviewresults`).d('审查结论') + intl.get(`bid.bidcommon.view.title.reviewresultsremarks`).d('(请填写是否通过审查)'),
        width: 270,
        ellipsis: true,
        resizable: true,
        render: (text, record, index) =>
          record.gradeGetState !== 'y' ? (
            <Form.Item
              name={`examineResult${record.supplierId}`}
              initialValue={text}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.view.title.reviewresults`).d('审查结论'),
                  }),
                },
              ]}
            >
              <CusSelect style={{ width: '100%' }}
                allowclear="true" placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                disabled={this.props.isSubmit || record.gradeGetState === 'y'}
                // disabled={(!paStating && (this.props.contractJudgesCusSorce.editPassFrame || !this.props.contractJudgesCusSorce.editPassFrame)) || record.gradeGetState === 'y'}
                onChange={(_, selectVal) => {
                  record.examineResult = selectVal.value
                  this.setState({})
                  this.compreFormFirst.current?.setFields([
                    {
                      name:[`examineReason${record.supplierId}`],
                      errors: null
                    }
                  ])
                  this.handleDataChange();
                }}
                // onChange={(e) => { record.examineResult = e }}
                options={this.props.contractJudgesCusSorce?.enumMap?.yesNO}
              />
            </Form.Item>
          ) : (
            record.examineResult ? (record.examineResult === 'YES' ? intl.get(`${prompt}.view.title.yes`).d('是') : intl.get(`${prompt}.view.title.no`).d('否')) : ''
          )
      },
      {
        key: 'examineReason',
        dataIndex: 'examineReason',
        title: intl.get(`${prompt}.bid.title.Reason2`).d('填写审查结论的原因'),
        width: 350,
        required: true,
        render: (text, record, index) => {
          return (
            record.gradeGetState !== 'y' ? (
              <Form.Item
                name={`examineReason${record.supplierId}`}
                initialValue={text}
                rules={[
                  {
                    required: this.compreFormFirst.current?.getFieldValue(`examineResult${record.supplierId}`) === 'NO',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.bid.title.Reason`).d('理由'),
                    }),
                  },
                ]}
                // validateTrigger={['onChange']}
              >
                <Input style={{ width: '100%' }}
                  placeholder={intl.get(`${prompt}.view.title.pleaseenter`).d('请输入')}
                  disabled={this.props.isSubmit || record.gradeGetState === 'y'}
                  // disabled={(!paStating && (this.props.contractJudgesCusSorce.editPassFrame || !this.props.contractJudgesCusSorce.editPassFrame)) || record.gradeGetState === 'y'}
                  onChange={(e) => { record.examineReason = e.target.value; this.handleDataChange() }}
                />
              </Form.Item>
            ) : (
              record.examineReason
            )
          )
        }
   
      }
    ]
    // 初评
    const otherListProps = {
      dataSource: complianceSource,
      columns,
      pagination: compliancePagination,
      scroll: { x: tableScrollWidth(columns) },
      rowKey: 'otherId',
      onChange: this.handlePageChange, // 校验切换分页前是否存在未保存数据
    };
    return (
      <Form ref={this.compreFormFirst}>
        <div className={styles['formItemButtom']}>
          <CusTable {...otherListProps} />
        </div>
      </Form>
    );
  }
}
