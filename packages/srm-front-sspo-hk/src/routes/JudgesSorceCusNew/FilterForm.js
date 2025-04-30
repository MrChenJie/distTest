import React from 'react';
import { connect } from 'dva';
import { Form, Input, Row, Col } from 'antd';
import CusSelect from '_cus_components/CusSelect';
import intl from 'utils/intl';
import CusLov from '_cus_components/CusLov';
import { mediumScreenWidth } from '_cus_utils/constants';
import styles from './index.less';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';

const prompt = 'bid.bidcommon';
const screenWidth = window.screen.width;
// @connect(({ contractJudgesCusSorce = {} }) => ({
//   contractJudgesCusSorce,
//   infoSource: contractJudgesCusSorce?.infoSource, // 基本信息数据源
// }))

export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this)
    this.state = {
      isShowMore: true,
    };
  }

  filterForm = React.createRef();

  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  handleReset = () => {
    this.filterForm.current?.resetFields();
  };

  render() {
    const gridSpan = getDFormGridSpan();
    const { contractJudgesCusSorce: { infoSource, enumMap }, bidType } = this.props;
    const { isShowMore } = this.state;
    const { listType = [], listTypeNew = [] } = enumMap;
    return (
      <div className="customize-form">
        <Form ref={this.filterForm} initialValues={{
            'packageNo': infoSource.packageNo,
            'packageName': infoSource.packageName,
            // 'purchaseType': infoSource.purchaseType,
            'productNameMeaning': infoSource.productNameMeaning,
            'bidNum': infoSource.bidNum,
            'tenRate': infoSource.tenRate,
            'priceRate': infoSource.priceRate,
          }}>
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.packageno`).d('标包编号')}
                wrapperCol={{ span: 24 }}
                name="packageNo"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.packagename`).d('标包名称')}
                wrapperCol={{ span: 24 }}
                name="packageName"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.procurement`).d('采购方式')}
                wrapperCol={{ span: 24 }}
                name="purchaseType"
                initialValue={infoSource.purchaseType}
              >
                <CusSelect options={infoSource.proInfoWording ? listType : listTypeNew} disabled className={styles.selectDisable} />
              </Form.Item>
            </Col>
            {/* <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.productname`).d('产品名称')}
                wrapperCol={{ span: 24 }}
                name='productNameMeaning'
              >
                <CusLov disabled
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={infoSource.productNameMeaning}
                  textField={infoSource.productNameMeaning}
                />
              </Form.Item>
            </Col> */}
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${prompt}.bid.title.Numberofsuccessfulbidders`).d('中标人数')}
                wrapperCol={{ span: 24 }}
                name="bidNum"
              >
                <Input min={0} disabled />
              </Form.Item>
            </Col>
            {(bidType === 'invited_bidding' || bidType === 'public_bidding') && <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.technicalproportion`).d('技术比例')}
                wrapperCol={{ span: 24 }}
                name="tenRate"
              >
                <Input min={0} max={100} disabled />
              </Form.Item>
            </Col>}
            {(bidType === 'invited_bidding' || bidType === 'public_bidding') && <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.priceproportion`).d('价格比例')}
                wrapperCol={{ span: 24 }}
                name="priceRate"
              >
                <Input min={0} max={100} disabled />
              </Form.Item>
            </Col>}
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
