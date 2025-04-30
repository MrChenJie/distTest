import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import CusSelect from '_cus_components/CusSelect';
import intl from 'utils/intl';
import CusLov from '_cus_components/CusLov';
import { mediumScreenWidth } from '_cus_utils/constants';
import styles from './index.less';

const prompt = 'bid.bidcommon';
const screenWidth = window.screen.width;

export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this)
    this.state = {
      isShowMore: false,
    };
  }

  filterForm = React.createRef();

  componentDidMount() {

  }

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
    const { contractJudgesCusSorce: { infoSource, enumMap }, bidType } = this.props;
    const { isShowMore } = this.state;
    const { listType = [], listTypeNew = [] } = enumMap;
    return (
      <div className="customize-form">
        <Form ref={this.filterForm} >
          <Row>
            <Col span={screenWidth > mediumScreenWidth ? 12 : 24}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.packageno`).d('标包编号')}
                wrapperCol={{ span: 24 }}
                name="packageNo"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={screenWidth > mediumScreenWidth ? 12 : 24}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.packagename`).d('标包名称')}
                wrapperCol={{ span: 24 }}
                name="packageName"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={screenWidth > mediumScreenWidth ? 12 : 24}>
              <Form.Item
                label={intl.get(`${prompt}.view.title.procurement`).d('采购方式')}
                wrapperCol={{ span: 24 }}
                name="purchaseType"
              >
                <CusSelect options={infoSource.proInfoWording ? listType : listTypeNew} disabled className={styles.selectDisable} />
              </Form.Item>
            </Col>
            <Col span={screenWidth > mediumScreenWidth ? 12 : 24}>
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
            </Col>
            <div style={{ display: isShowMore ? 'block' : 'none' }}>
              <Col span={screenWidth > mediumScreenWidth ? 12 : 24}>
                <Form.Item
                  label={intl.get(`${prompt}.bid.title.Numberofsuccessfulbidders`).d('中标人数')}
                  wrapperCol={{ span: 24 }}
                  name="bidNum"
                >
                  <Input min={0} disabled />
                </Form.Item>
              </Col>
              {(bidType === 'invited_bidding' || bidType === 'public_bidding') &&
                <>
                <Col span={screenWidth > mediumScreenWidth ? 12 : 24}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.title.technicalproportion`).d('技术比例')}
                    wrapperCol={{ span: 24 }}
                    name="tenRate"
                  >
                    <Input min={0} max={100} disabled />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 12 : 24}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.title.priceproportion`).d('价格比例')}
                    wrapperCol={{ span: 24 }}
                    name="priceRate"
                  >
                    <Input min={0} max={100} disabled />
                  </Form.Item>
                </Col>
              </>
              }
            </div>
          </Row>
          <Row>
            <Col span={24}>
              {!isShowMore ?
                <a onClick={this.handleShowMore} style={{ float: 'right', marginBottom: '16px', fontSize: '14px', lineHeight: '22px', fontWeight: '400', marginTop: '-12px' }} >
                  {intl.get(`hzero.common.button.expand`).d('展开')}
                </a>
                :
                <a onClick={this.handleShowMore} style={{ float: 'right', marginBottom: '16px', fontSize: '14px', lineHeight: '22px', fontWeight: '400', marginTop: '-12px' }} >
                  {intl.get(`hzero.common.button.up`).d('收起')}
                </a>
              }
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
