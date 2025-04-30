/**
 * moduleName -
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/1/12
 * @Copyright: Copyright (c), 2024, hand
 */
import React, { Component } from 'react';
import { Collapse, Row, Col } from 'antd';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import CusTable from '_cus_components/CusTable';
import { tableScrollWidth } from 'utils/utils';
import queryString from 'querystring';
import dayjs from 'dayjs';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ loading = {}, evaluation = {} }) => ({
  evaluation,
  collectDetail: evaluation.collectDetail
}))

export default class CollectDetail extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'table'],
      isPub: location.pathname.includes('pub'), // 判断是否为pub页面
    };
  }

  componentDidMount() {
    this.getDetail();
  }

  @Bind()
  getDetail() {
    const { location: { search }, dispatch } = this.props;
    const { id } = queryString.parse(search.substring(1));
    console.log(id, 'id');
    dispatch({
      type: 'evaluation/getCollectDetailById',
      payload: {
        id
      }
    })
  }

  @Bind()
  getColumns() {
    const { collectDetail: { revHead = [] } } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.info.reviewNumber`).d('评审单号'),
        dataIndex: 'revNo'
      },
      {
        title: intl.get(`${prompt}.view.table.totalSore`).d('总得分'),
        dataIndex: 'totalScore'
      },
      {
        title: intl.get(`${prompt}.view.table.defaultTotalScore`).d('默认总分值'),
        dataIndex: 'defaultTotal'
      },
      {
        title: intl.get(`${prompt}.view.table.percentage`).d('百分比'),
        dataIndex: 'percentage'
      },
      {
        title: intl.get(`${prompt}.view.table.percentageAverage`).d('平均百分比'),
        dataIndex: 'averagePer',
        onCell: (_, index) => {
          if(index === 0) {
            return {
              rowSpan: revHead.length
            }
          }
          return  { rowSpan: 0}
        }
      },
      {
        title: intl.get(`${prompt}.basic.info.supplierGrade`).d('供应商等级'),
        dataIndex: 'revGrade',
        onCell: (_, index) => {
          if(index === 0) {
            return {
              rowSpan: revHead.length
            }
          }
          return  { rowSpan: 0}
        }
      },
    ]
  }

  render() {

    const { activeKey } = this.state;
    const {
      form: { getFieldDecorator },
      collectDetail
    } = this.props
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };

    return (
      <PageWrapper>
        <Collapse
          className='customize-collapse'
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
        >
          <Panel
            key='form'
            showArrow={false}
            header={
              <PanelHeader
                arrowActive={activeKey.includes('form')}
                title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
              />
            }
          >
            <Form className="customize-form">
              <Row gutter={24}>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.basic.info.sumOrder.No`).d('汇总单号')}>
                    {getFieldDecorator('revNo', {
                      initialValue: collectDetail?.gather?.gatNo
                    })(<CusInput disabled/>)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.info.reviewYear`).d('评审年度')}>
                    {getFieldDecorator('revYear', {
                      initialValue: collectDetail?.gather?.revYear
                    })(<CusInput disabled/>)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.info.reviewQuater`).d('评审季度')}>
                    {getFieldDecorator('revQuarter', {
                      initialValue: collectDetail?.gather?.revQuarter
                    })(<CusSelect disabled
                                  lovCode='HKSP.ASSESSMENT_QUARTER'
                    />)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.view.table.supplier.num`).d('供应商编号')}>
                    {getFieldDecorator('supplierNumber', {
                      initialValue: collectDetail?.gather?.supplierNumber
                    })(<CusInput disabled/>)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
                    {getFieldDecorator('companyNameEn', {
                      initialValue: collectDetail?.gather?.companyNameEn
                    })(<CusInput disabled/>)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
                    {getFieldDecorator('companyNameCh', {
                      initialValue: collectDetail?.gather?.companyNameCh
                    })(<CusInput disabled/>)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.basic.info.sumScore.Date`).d('评分汇总日期')}>
                    {getFieldDecorator('gatTime', {
                      initialValue: collectDetail?.gather?.gatTime ? dayjs(collectDetail?.gather?.gatTime) : undefined
                    })(<CusDatePicker disabled/>)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.basic.info.classDFrequency`).d('E级频次')}>
                    {getFieldDecorator('eFrequency', {
                      initialValue: collectDetail?.gather?.eFrequency
                    })(<CusInput disabled/>)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.info.reviewLevel`).d('本次评审等级')}>
                    {getFieldDecorator('revGrade', {
                      initialValue: collectDetail?.gather?.revGrade
                    })(<CusInput disabled/>)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Panel>
          <Panel
            key='table'
            showArrow={false}
            header={
              <PanelHeader
                arrowActive={activeKey.includes('table')}
                title={intl.get(`${prompt}.view.title.summaryDetails`).d('汇总明细')}
              />
            }
          >
            <p>{intl.get(`${prompt}.basic.info.supplierLevelA`).d('A≥85%；B≥75%；C≥60%；D≥50%；E＜50%；')}</p>
            <CusTable
              columns={this.getColumns()}
              bordered
              scroll={{ x: tableScrollWidth(this.getColumns()) }}
              dataSource={collectDetail?.revHead || []}
              rowKey="id"
            />
          </Panel>
        </Collapse>
      </PageWrapper>
    );
  }
}
