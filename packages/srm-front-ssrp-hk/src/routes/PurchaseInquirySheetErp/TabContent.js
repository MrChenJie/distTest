import React, { Component, Fragment } from 'react';
import { Form, Table, Row, Col, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import { getCurrentTenant } from 'utils/utils';
import intl from 'utils/intl';
import { FormItem } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 *考评档案管理详情页 各个tab 页的内容组件
 *
 * @export
 * @class TabContent
 * @extends {Component} - React.element
 * @reactProps {object} form - 表单对象
 * @returns React.element
 */
@formatterCollections({
  code: ['sslm.supplierDocManage'],
})
@Form.create({ fieldNameProp: null })
export default class TabContent extends Component {
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * 提示系统评分评分状态信息
   * @param {*} record - 行数据
   */
  inCompleteMessage(record = {}) {
    Modal.info({
      title: intl
        .get(`sslm.supplierDocManage.model.docManage.systemCalculateFailed`)
        .d('系统计算失败'),
      content: <p>{record.processRemark}</p>,
    });
  }

  /**
   * 获得columns
   */
  @Bind()
  getColumns() {
    const { granularity, tabKey, openModal, docStatus } = this.props;
    const colsObj = {
      scoreDetail: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
          dataIndex: 'supplierNum',
          fixed: 'left',
          width: 182,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
          dataIndex: 'supplierName',
          fixed: 'left',
          width: 182,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorCode`).d('指标编码'),
          dataIndex: 'indicatorCode',
          fixed: 'left',
          width: 182,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorName`).d('指标描述'),
          dataIndex: 'indicatorName',
          fixed: 'left',
          width: 120,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationWay`).d('评分方式'),
          dataIndex: 'scoreTypeMeaning',
          width: 120,
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.evaluationStandard`)
            .d('评分标准'),
          dataIndex: 'evalStandard',
          // width: 120,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.indicatorType`).d('指标类型'),
          dataIndex: 'indicatorTypeMeaning',
          width: 100,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationGroup`).d('评分组'),
          dataIndex: 'evaluationGroup',
          width: 120,
          render: (val, record) => {
            if (record.scoreType === 'MANUAL') {
              return (
                <a onClick={() => openModal('evaluationGroup', record)}>
                  {intl
                    .get(`sslm.supplierDocManage.model.docManage.evaluationGroupInfo`)
                    .d('评分组信息')}
                </a>
              );
            } else if (record.scoreType === 'SYSTEM') {
              return intl.get(`sslm.supplierDocManage.model.docManage.systemEval`).d('系统评分');
            }
          },
        },
        // {
        //   title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationPerson`).d('评分人'),
        //   dataIndex: 'evaluationPerson',
        //   width: 120,
        //   render: (val, record) => {
        //     if (record.scoreType === 'MANUAL') {
        //       return (
        //         <a onClick={() => openModal('evaluationPerson', record)}>
        //           {intl
        //             .get(`sslm.supplierDocManage.model.docManage.evaluationPersonInfo`)
        //             .d('评分人信息')}
        //         </a>
        //       );
        //     } else if (record.scoreType === 'SYSTEM') {
        //       return intl.get(`sslm.supplierDocManage.model.docManage.systemEval`).d('系统评分');
        //     }
        //   },
        // },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.evaluationStatus`).d('评分状态'),
          dataIndex: 'completeFlag',
          width: 120,
          render: (val, record) => {
            // if(record.scoreType === 'SYSTEM') {
            //   return record.processStatusMeaning;
            // } else {
            //   return (
            //     <a onClick={() => openModal('evaluationStatus', record)}>
            //       {val
            //         ? intl.get(`sslm.supplierDocManage.model.docManage.complete`).d('完成')
            //         : intl.get(`sslm.supplierDocManage.model.docManage.incomplete`).d('未完成')}
            //     </a>
            //   );
            // }
            if (docStatus === 'NEW') {
              return intl.get(`sslm.supplierDocManage.model.docManage.unScore`).d('尚未进行评分');
            }
            if (record.scoreType === 'SYSTEM') {
              return record.processStatusMeaning;
            } else {
              return (
                <a onClick={() => openModal('evaluationStatus', record)}>
                  {val
                    ? intl.get(`sslm.supplierDocManage.model.docManage.complete`).d('完成')
                    : intl.get(`sslm.supplierDocManage.model.docManage.incomplete`).d('未完成')}
                </a>
              );
            }
          },
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.score`).d('得分'),
          dataIndex: 'finalScore',
          width: 100,
          align: 'center',
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreFrom`).d('分值从'),
          dataIndex: 'scoreFrom',
          width: 100,
          align: 'center',
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreTo`).d('分值至'),
          dataIndex: 'scoreTo',
          width: 100,
          align: 'center',
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.scoreDefault`).d('缺省分值'),
          dataIndex: 'defaultScore',
          width: 100,
          align: 'center',
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.feedbackDescription`)
            .d('反馈说明'),
          dataIndex: 'respRemarks',
          onCell: this.onCell,
          width: 120,
          render: (val) => {
            return docStatus === 'FINAL_COLLECTED' || docStatus === 'PUBLISHED' ? val : null;
          },
        },
      ],
      scoreSum: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
          dataIndex: 'supplierNum',
          width: 225,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
          dataIndex: 'supplierName',
          width: 225,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.sumScore`).d('汇总得分'),
          dataIndex: 'lineScore',
          width: 210,
          render: (val, record) => <a onClick={() => openModal('sumScore', record)}>{val}</a>,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.grade`).d('等级'),
          dataIndex: 'levelCode',
          width: 210,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.rank`).d('考评排名'),
          dataIndex: 'rankNum',
          width: 210,
        },
      ],
      scoreVendor: [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
          dataIndex: 'supplierNum',
          width: 360,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
          dataIndex: 'supplierName',
          width: 370,
        },
        {
          title: intl
            .get(`sslm.supplierDocManage.model.docManage.purchaseCategoryName`)
            .d('采购品类名称'),
          dataIndex: 'categoryName',
          render: (val, record) => <a onClick={() => openModal('productName', record)}>{val}</a>,
          width: 360,
        },
      ],
    };
    if ((tabKey === 'scoreDetail' || tabKey === 'scoreSum') && granularity === 'SU+CA') {
      // 如果考评粒度为供应商加品类，则添加采购品类列
      colsObj[tabKey].splice(2, 0, {
        title: intl.get(`sslm.supplierDocManage.model.docManage.purchaseProduct`).d('采购品类'),
        dataIndex: 'categoryName',
        width: 160,
      });
    }
    if ((tabKey === 'scoreDetail' || tabKey === 'scoreSum') && granularity === 'SU+IT') {
      colsObj[tabKey].splice(2, 0, {
        title: intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料'),
        dataIndex: 'categoryName',
        width: 160,
      });
    }
    if (tabKey === 'scoreVendor' && granularity === 'SU+IT') {
      colsObj[tabKey].splice(2, 1, {
        title: intl.get(`sslm.supplierDocManage.model.docManage.materialName`).d('物料名称'),
        dataIndex: 'categoryName',
        width: 360,
      });
    }
    if (tabKey === 'scoreVendor' && granularity === 'SU') {
      return [
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderCode`).d('供应商编码'),
          dataIndex: 'supplierNum',
          width: 540,
        },
        {
          title: intl.get(`sslm.supplierDocManage.model.docManage.venderName`).d('供应商名称'),
          dataIndex: 'supplierName',
          width: 550,
        },
      ];
    }
    return colsObj[tabKey];
  }

  /**
   * 查询表单组件
   * @returns React.element
   */
  @Bind()
  getSearchForm() {
    const {
      granularity,
      tabKey,
      form: { getFieldDecorator },
      evalHeaderId,
    } = this.props;
    const lovProps = {
      tenantId: getCurrentTenant().tenantId,
      evalHeaderId,
    };
    if (tabKey === 'scoreDetail') {
      if (granularity === 'SU+CA') {
        // 如果考评粒度为供应商加品类，则有采购品类输入框
        return (
          <Row type="flex" gutter={24}>
            <Col span={18}>
              <Row type="flex">
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov code="SSLM.KPI_DTL_SUPPLIER" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.purchaseProduct`)
                      .d('采购品类')}
                    {...formLayout}
                  >
                    {getFieldDecorator('categoryId')(
                      <Lov code="SSLM.KPI_DTL_CATEGORY" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.evaluationIndicators`)
                      .d('考评指标')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorId')(
                      <Lov code="SSLM.KPI_DTL_INDICATOR" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={4} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        );
      } else if (granularity === 'SU+IT') {
        return (
          <Row type="flex" gutter={24}>
            <Col span={18}>
              <Row type="flex">
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov code="SSLM.KPI_DTL_SUPPLIER" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemId')(
                      <Lov code="SSLM.KPI_DTL_ITEM" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.evaluationIndicators`)
                      .d('考评指标')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorId')(
                      <Lov code="SSLM.KPI_DTL_INDICATOR" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={4} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  // style={{ marginRight: 18 }}
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        );
      } else if (granularity === 'SU') {
        // 如果考评粒度为仅供应商
        return (
          <Row type="flex" gutter={24}>
            <Col span={18}>
              <Row type="flex">
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov code="SSLM.KPI_DTL_SUPPLIER" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.evaluationIndicators`)
                      .d('考评指标')}
                    {...formLayout}
                  >
                    {getFieldDecorator('indicatorId')(
                      <Lov code="SSLM.KPI_DTL_INDICATOR" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={4} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  // style={{ marginRight: 18 }}
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        );
      }
    } else if (tabKey === 'scoreSum' || tabKey === 'scoreVendor') {
      if (granularity === 'SU+CA') {
        // 如果考评粒度为供应商加品类，则有采购品类输入框
        return (
          <Row type="flex" gutter={24}>
            <Col span={18}>
              <Row type="flex">
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov code="SSLM.KPI_DTL_SUPPLIER" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sslm.supplierDocManage.model.docManage.purchaseProduct`)
                      .d('采购品类')}
                    {...formLayout}
                  >
                    {getFieldDecorator('categoryId')(
                      <Lov queryParams={lovProps} code="SSLM.KPI_DTL_CATEGORY" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={4} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  // style={{ marginRight: 18 }}
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        );
      } else if (granularity === 'SU+IT') {
        return (
          <Row type="flex" gutter={24}>
            <Col span={18}>
              <Row type="flex">
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov code="SSLM.KPI_DTL_SUPPLIER" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.itemName`).d('物料')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemId')(
                      <Lov code="SSLM.KPI_DTL_ITEM" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={4} className="search-btn-more">
              <FormItem>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  // style={{ marginRight: 18 }}
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        );
      } else if (granularity === 'SU') {
        // 如果考评粒度为仅供应商
        return (
          <Row type="flex" gutter={24}>
            <Col span={18}>
              <Row type="flex">
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sslm.supplierDocManage.model.docManage.vendor`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierId')(
                      <Lov code="SSLM.KPI_DTL_SUPPLIER" queryParams={lovProps} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={4} className="search-btn-more">
              <FormItem>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  // style={{ marginRight: 18 }}
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.status.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        );
      }
    }
  }

  @Bind()
  getScrollX() {
    const { tabKey } = this.props;
    const xObj = {
      scoreDetail: { x: 1681 },
      scoreSum: { x: 1071 },
      scoreVendor: { x: 1061 },
    };
    return xObj[tabKey];
  }

  /**
   * 查询请求
   * @param {object} page - 分页信息
   */
  @Bind()
  handleSearch(page = {}) {
    const { form, onSearch, tabKey } = this.props;
    form.validateFields((err, values) => {
      if (!err && onSearch) {
        onSearch({ ...values, page }, tabKey);
      }
    });
  }

  /**
   * 重置查询表单
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * getRowKey - 获取行数据主键
   */
  // @Bind()
  // getRowKey(){
  //   const { tabKey } = this.props;
  //   return tabKey === 'scoreDetail' ? 'evalDtlId' : 'evalLineId';
  // }
  /**
   * @return React.element
   */
  render() {
    const { tableData, loading, pagination } = this.props;
    return (
      <Fragment>
        <div className="detail-quick-location">
          {/* <span className="field-legend">
            {intl.get(`sslm.supplierDocManage.model.docManage.quickLocation`).d('快速定位')}
          </span> */}
          <Form layout="inline" className="more-fields-form" style={{ marginBottom: 16 }}>
            {this.getSearchForm()}
          </Form>
        </div>
        <Table
          bordered
          loading={loading}
          dataSource={tableData}
          pagination={pagination}
          columns={this.getColumns()}
          scroll={this.getScrollX()}
          onChange={(page) => this.handleSearch(page)}
        />
      </Fragment>
    );
  }
}
