import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Form } from 'hzero-ui'
import { Col, Input, Row } from 'antd';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import UploadTable from './UploadTable';
import styles from './index.less'
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

export default class ProjectManager extends React.Component {
  constructor(props) {
    super(props);
    // const { onRef } = this.props;
    // onRef(this);
    this.state = {
      isShowMore: false,
    };
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

  render() {

    const { headFromDataSource,form } = this.props 
    const { getFieldDecorator = (e) => e } = form

    return (
      <div className={styles['out-ant-input']}>
        <Form className='customize-form'>
          {/* <GenerateFormGrid isPackUp={true}> */}
          <Row>
            <Col span={8}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人')}
                name='prDealMan'
              >
                {getFieldDecorator('prDealMan', {
                    initialValue: headFromDataSource?.prDealMan,
                  })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Row>
            {/* <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.Agencydepartment`).d('经办人部门')}
                name='prDealDep'
              >
                {getFieldDecorator('prDealDep', {
                    initialValue: headFromDataSource?.prDealDep ,
                  })(<Input disabled />)}
              </Form.Item>
            </Col> */}
          {/* </GenerateFormGrid> */}
        </Form>
      </div>
    );
  }
}
