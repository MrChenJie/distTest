/**
 * index.js - 工作台-搜索
 * @date: 2022-03-10
 * @author: geekrainy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Input, Form, Row, Col } from 'antd';
import CusCascader from '_cus_components/CusCascader';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { mediumScreenWidth } from '_cus_utils/constants';
import querystring from 'querystring';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const screenWidth = window.screen.width;

@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord'
  ],
})

@connect(({ loading, contractMaintain }) => ({
  contractMaintain,
}))

@cacheComponent({ cacheKey: '/spcm/contract-maintain/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
      activeKey: ['form']
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  filterForm = React.createRef();

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  componentDidMount() {
    const { location } = this.props;
    const { proCode } = querystring.parse(location.search.substr(1));
    if(proCode) {
      this.filterForm?.current.setFieldsValue({
        proCode: proCode
      })
    }
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList(this.filterForm.current?.getFieldsValue());
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    this.filterForm?.current.resetFields();
  }

  render() {
    const { contractMaintain } = this.props;
    const { tenantId, expandForm } = this.state;
    const { noticeCascaderType = [] } = contractMaintain;
    
    return (
      <>
        <div className="customize-form">
          <Form ref={this.filterForm}>
            <Row>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
                  name="proName"
                >
                  <Input />
                </Form.Item>
              </Col>
              {/* <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`bid.bidcommon.bid.button.milestoneStatus`).d('里程碑及状态')}
                  name="proStateArray"
                  initialValue={[]}
                >
                  <CusCascader
                    fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                    options={noticeCascaderType}
                    expandTrigger="hover"
                    placeholder=""
                  />
                </Form.Item>
              </Col> */}
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`bid.biddashbord.model.title.demandPerson`).d('需求人')}
                  name="manualNumRequired"
                >
                  <CusLov
                    code="CMHK_REPORT_REQUESTER"
                    queryParams={{ tenantId }}
                    lovOptions={{ displayField: 'requester', valueField: 'loginName' }}
                  />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`bid.biddashbord.model.title.demandDepartment`).d('需求部门')}
                    name="demandDeptNum"
                  >
                    <CusLov
                      code="BID.USER_DEPARTMENT"
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'unitName', valueField: 'unitCode' }}
                    />
                  </Form.Item>
                </Col>
              <div style={{ display: expandForm ? 'block' : 'none' }}>
                {/* <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`bid.biddashbord.model.title.superiorDemandDepartment`)
                      .d('需求部')}
                    name="demandPrtDeptNum"
                  >
                    <CusLov
                      code="BID.USER_DEPARTMENT"
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'unitName', valueField: 'unitCode' }}
                    />
                  </Form.Item>
                </Col> */}
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`bid.biddashbord.model.title.demandDate`).d('需求日期')}
                    name="requireTimeStr"
                  >
                    <CusDatePicker
                      // showTime
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(currentDate) =>
                        this.filterForm.current?.getFieldValue('creationDateTo') &&
                        moment(this.filterForm.current?.getFieldValue('creationDateTo')).isBefore(
                          currentDate,
                          'day'
                        )
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号')}
                    name="proCode"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称')}
                    name="packageName"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号')}
                    name="packageNo"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式')}
                    name="purchaseType"
                  >
                    <CusSelect allowClear lovCode="BID.PROCUREMENT_METHOD" showSearch />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`HKPC.commom.view.title.procurementhandler`).d('采购经办人')}
                    name="purchasingEmpName"
                  >
                    <CusLov
                      allowClear
                      code="HKPC.PROCUREMENTAGENT"
                      queryParams={{ tenantId }}
                      lovOptions={{ displayField: 'userName', valueField: 'loginName' }}
                    />
                  </Form.Item>
                </Col>
              </div>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12} style={{ float: 'right' }}>
                <CusQueryButtons
                  onQuery={this.onClick}
                  onReset={this.onReset}
                  onShowMore={this.toggleForm}
                  isShowMore={expandForm}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
