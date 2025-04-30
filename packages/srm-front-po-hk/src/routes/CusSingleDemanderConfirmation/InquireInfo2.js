import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input, Row, Select } from 'antd';
import { Form } from 'hzero-ui';
import CusSelect from '_cus_components/CusSelect';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import styles from './index.less'
import formatterCollections from 'utils/intl/formatterCollections';
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();
@formatterCollections({
  code: [promptCode],
})
@Form.create()
export default class InquireInfo extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;

    onRef(this);
    this.state = {
      isShowMore: false,
    };
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

  /**
   * 展开高级查询
   * @function handleShowMore
   */
  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  @Bind
  changePurchasingCategories(e, a) {
    console.log(e, 'eeeeeeeeee');
    console.log(a?.meaning, 'aaaaaaaaaa');
    const { singlePurchaseApplicationCusModel, dispatch } = this.props;
    // const { purchasingCategoriesVal } = singlePurchaseApplicationCusModel;
    if (e) {
      dispatch({
        type: `singlePurchaseApplicationCusModel/updateState`,
        payload: {
          purchasingCategoriesVal: true,
        },
      });
    }

    dispatch({
      type: `singlePurchaseApplicationCusModel/updateState`,
      payload: {
        purchasingCategoriesCode: e ? e : '',
        purchasingCategories: e ? e : '',
        purchasingCategoriesMean: a?.meaning ? a?.meaning : "",
      },
    });
  }

  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  render() {
    const uploadProps = {
      filePreview: true,
      bucketName: 'private-bucket',
      bucketDirectory: 'srsp-receivePayment',
      tenantId: getCurrentOrganizationId(),
    };
    const { isShowMore } = this.state;
    const {
      form,
      singlePurchaseApplicationCusModel,
      isEdit,
    } = this.props;
    const { getFieldDecorator } = form;
    const { purchasingCategories } = singlePurchaseApplicationCusModel;
    return (
      <div className={styles['out-ant-input']}>
        <Form className='customize-form'>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')}
            >
              {getFieldDecorator('purchasingCategories', {
                initialValue: purchasingCategories,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
                  }),
                }],

              })(
                <CusSelect
                  allowClear
                  lovCode='HKPC.PURCHASINGCATEGORY'
                  onChange={(e, a) => {
                    this.changePurchasingCategories(e, a)
                  }}
                  disabled={isEdit}
                  popupClassName="customize-select"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          </Col>
        </Form>
      </div>
    );
  }
}
