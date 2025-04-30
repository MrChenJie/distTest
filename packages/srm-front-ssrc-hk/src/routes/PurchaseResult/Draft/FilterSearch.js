import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
import { getCurrentOrganizationId } from 'utils/utils';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import { getLFormGridSpan } from '_cus_utils/utils';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';

export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {};
  }

  form = React.createRef();

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.form.current?.resetFields();
    onSearch();
  }

  render() {
    const { idpValueMap = {}, onSearch = (e) => e } = this.props;
    const gridSpan = getLFormGridSpan();

    return (
      <Form ref={this.form} className="customize-form">
        <GenerateSearchFormGrid
          onQuery={onSearch}
          onReset={this.handleReset}
        >
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.RQnumber`).d('询价单号')}
              name="thirdNum"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.RQname`).d('询价单名称')}
              name="thirdName"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号')}
              name="packageNum"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.PackageName`).d('标包名称')}
              name="packageName"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.requester`).d('需求人')}
              name="requireId"
            >
              <CusLov
                code="CMHK_REPORT_REQUESTER"
                queryParams={{ tenantId: getCurrentOrganizationId() }}
                lovOptions={{ displayField: 'requester', valueField: 'loginName' }}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门')}
              name="requireDepId"
            >
              <CusLov
                code="BID.USER_DEPARTMENT"
                queryParams={{ tenantId: getCurrentOrganizationId() }}
                lovOptions={{ displayField: 'unitName', valueField: 'unitId' }}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}
              name="prNum"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
              name="prName"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式')}
              name="purchaseType"
            >
              <CusSelect
                options={idpValueMap['BID.PROCUREMENT_METHOD']}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </GenerateSearchFormGrid>
      </Form>
    );
  }
}
