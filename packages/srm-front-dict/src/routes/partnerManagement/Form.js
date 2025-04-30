import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import { Col, Input } from 'antd';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import { getLFormGridSpan } from '_cus_utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import CusSelect from '_cus_components/CusSelect';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';

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
    const { form: { getFieldDecorator }, onSearch, idpValueMap } = this.props;
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
                  label={intl.get(`${prompt}.view.field.companynameen`).d('公司名称（英文）')}
                >
                  {getFieldDecorator('cmpanyNameEn')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.companynamecn`).d('公司名称（中文）')}
                >
                  {getFieldDecorator('cmpanyNameCh')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.supplier.code`).d('供应商编号')}
                >
                  {getFieldDecorator('supplierNumber')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.partner.code`).d('合作伙伴编号')}
                >
                  {getFieldDecorator('partnerNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.partner.status`).d('合作伙伴状态')}
                >
                  {getFieldDecorator('partnerStorageStatus')(<CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.PARTNER_STATUS']}
                  />)}
                </Form.Item>
              </Col>
            </GenerateSearchFormGrid>
          </Form>
        </div>
      </>
    );
  }
}
