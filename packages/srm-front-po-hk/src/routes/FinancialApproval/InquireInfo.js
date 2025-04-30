import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input, Row } from 'antd';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import formatterCollections from 'utils/intl/formatterCollections';
import CusSelect from '_cus_components/CusSelect';
import styles from './index.less'
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

@formatterCollections({ code: [promptCode] })
export default class InquireInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
    this.state = {
      isShowMore: false,
    };
  }

  inquireInfoForm = React.createRef();

  render() {
    const { purchaseApplicationModel, idpValueMap = {} } = this.props;
    const { purchaseApproveForm } = purchaseApplicationModel;
    this.inquireInfoForm?.current?.setFieldsValue({
      purchasingCategory: purchaseApproveForm?.purchasingCategory,
    });
    return (
      <div className={styles['out-ant-input']}>
        <Form className="customize-form" ref={this.inquireInfoForm}>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')}
              name="purchasingCategory"
            >
              <CusSelect options={idpValueMap['HKPC.PURCHASINGCATEGORY']} disabled />
            </Form.Item>
          </Col>
        </Form>
      </div>
    );
  }
}
