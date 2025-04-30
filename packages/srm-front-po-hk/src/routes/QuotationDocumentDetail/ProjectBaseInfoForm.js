import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input, Row } from 'antd';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
// import styles from './index.less'
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
export default class PeriodAdditionFrom extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {
      isShowMore: false,
    };
  }

  form = React.createRef();


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

  render() {
    const { infomationForm } = this.props;
    // console.log('infomationForm', infomationForm);
    this.form.current?.setFieldsValue({
      ...infomationForm
    });

    return (
      <div >
        <Form className='customize-form' ref={this.form}>
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.Projectnumber`).d('项目编码')}
                name='projectNumber'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
                name='projectName'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.RQname`).d('询价单名称')}
                name='rqName'
                required
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.RQnumber`).d('询价单号')}
                name='rqNumber'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}
                name='prNumber'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
                name='prName'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
                name='applicant'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.applyingdepartment`).d('申请人部门')}
                name='applicantDept'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额（HKD）')}
                name='estimatedHKD'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.prcurrency`).d('币种')}
                name='currency'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                name='procurementHandler'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.RQrate`).d('询价汇率')}
                name='rqRate'
              >
                <CusInput disabled />
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
