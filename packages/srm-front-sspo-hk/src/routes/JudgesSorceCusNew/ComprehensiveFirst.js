/**
 * index.js - 符合性审查表-初评
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form } from 'antd';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import { tooltipRender } from '_cus_utils/render';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';

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
        okType: 'normal',
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
    } = this.props;
    const columns = [
      {
        key: 'supplierName',
        // dataIndex: 'soLineNumber',
        title: intl.get(`${prompt}.view.title.suppliername`).d('供应商名称'),
        width: 300,
        resizable: true,
        render: (_, record) => tooltipRender(record.supplierName),
      },
      {
        key: 'examineResult',
        // dataIndex: 'soLineNumber',
        title: intl.get(`bid.bidcommon.view.title.reviewresults`).d('审查结论') + intl.get(`bid.bidcommon.view.title.reviewresultsremarks`).d('(请填写是否通过审查)'),
        width: 270,
        // width: getCurrentLanguage() === 'zh_CN' ? 270: 350,
        resizable: true,
        required: true,
        render: (_, record, index) => {
          if (this.props?.isSubmit || record.gradeGetState === 'y') {
            return <span>{record.examineResult ? (record.examineResult === 'YES' ? intl.get(`${prompt}.view.title.yes`).d('是') : intl.get(`${prompt}.view.title.no`).d('否')) : ''}</span>
          } else {
            return (
              <Form.Item
                name={`examineResult${record.supplierId}`}
                initialValue={record.examineResult}
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.title.reviewresults`).d('审查结论'),
                    }),
                  },
                ]}
              >
                <CusSelect 
                  allowclear="true" placeholder={intl.get(`bid.bidcommon.view.title.pleaseselect`).d('请选择')}
                  // disabled={this.props.isSubmit || record.gradeGetState === 'y'}
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
                  options={this.props.contractJudgesCusSorce?.enumMap?.yesNO}
                />
              </Form.Item>
            )
          }
        }
      },
      {
        key: 'examineReason',
        // dataIndex: 'soLineNumber',
        title: intl.get(`${prompt}.bid.title.Reason2`).d('填写审查结论的原因'),
        width: 350,
        // width: getCurrentLanguage() === 'zh_CN' ? 350: 280,
        render: (_, record, index) => {
          if (this.props?.isSubmit || record.gradeGetState === 'y') {
            return <span>{record.examineReason}</span>
          } else {
            return (
              <Form.Item
                name={`examineReason${record.supplierId}`}
                initialValue={record.examineReason}
                rules={[
                  {
                    required: this.compreFormFirst.current?.getFieldValue(`examineResult${record.supplierId}`) === 'NO',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.bid.title.Reason`).d('理由'),
                    }),
                  },
                ]}
              >
                <CusInput 
                  placeholder={intl.get(`${prompt}.view.title.pleaseenter`).d('请输入')}
                  // disabled={this.props.isSubmit || record.gradeGetState === 'y'}
                  onChange={(e) => { record.examineReason = e; this.handleDataChange() }}
                />
              </Form.Item>
            )
          }
        }
      }
    ]
    // 初评
    const otherListProps = {
      dataSource: complianceSource,
      columns,
      // pagination: compliancePagination,
      pagination: false,
      scroll: { x: tableScrollWidth(columns) },
      rowKey: 'otherId',
      onChange: this.handlePageChange, // 校验切换分页前是否存在未保存数据
    };
    return (
      <Form ref={this.compreFormFirst}>
        <EditTable {...otherListProps} />
      </Form>
    );
  }
}
