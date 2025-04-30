import React from 'react';

import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';

import { Col, Form, Row } from 'antd';

import intl from 'utils/intl';

import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';

export default class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  form = React.createRef();

  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  @Bind()
  handleResetBtnClick(e) {
    e.preventDefault();
    this.form.current?.resetFields();
  }

  @Bind()
  handleSearchBtnClick(e) {
    e.preventDefault();
    const { onSearch } = this.props;
    onSearch();
  }

  render() {
    const { typeList = [] } = this.props;
    return (
      <Form ref={this.form} className="customize-form" style={{ marginBottom: '24px' }}>
        <Row>
          {/* 任务名称 -> 备注信息 */}
          <Col span={12}>
            <Form.Item
              name="taskName"
              label={intl.get('hzero.common.component.excelExport.hd.m.hd.desc').d('备注信息')}
            >
              <CusInput />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="state"
              label={intl.get('hzero.common.component.excelExport.hd.m.hd.state').d('任务状态')}
            >
              <CusSelect allowClear options={typeList} />
            </Form.Item>
          </Col>
        </Row>
        <CusQueryButtons
          onQuery={this.handleSearchBtnClick}
          onReset={this.handleResetBtnClick}
          isShowMoreButton={false}
        />
      </Form>
    );
  }
}
