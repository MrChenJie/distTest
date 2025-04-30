import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import { Col, Input } from 'antd';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import { getLFormGridSpan } from '_cus_utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import CusSelect from '_cus_components/CusSelect';

const gridSpan = getLFormGridSpan();
const prompt = 'spfmhk.dict';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class FilterForm extends PureComponent {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  @Bind()
  handleReset = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.resetFields();
  };

  render() {
    const { form: { getFieldDecorator }, onSearch } = this.props;
    return (
      <>
        <div className="customize-form">
          <Form onKeyDown={e => {
            if (e.keyCode === 13) {
              onSearch();
            }
          }}>
            <GenerateSearchFormGrid
              onQuery={onSearch}
              onReset={this.handleReset}
            >
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.applicationno`).d('申请单号')}
                >
                  {getFieldDecorator('applyNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.common.partnername`).d('合作伙伴名称')}
                >
                  {getFieldDecorator('cmpanyName')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.applicantionstatus`).d('申请状态')}
                >
                  {getFieldDecorator('editApplyStatus')(<CusSelect lovCode="DICT.PARTNER_EDIT_APPLY_STATUS" />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.partner.code`).d('合作伙伴编号')}
                >
                  {getFieldDecorator('partnerNum')(<Input />)}
                </Form.Item>
              </Col>
            </GenerateSearchFormGrid>
          </Form>
        </div>
      </>
    );
  }
}
