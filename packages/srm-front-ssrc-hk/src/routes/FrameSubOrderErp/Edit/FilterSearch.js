import React from 'react';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import { Col } from 'antd';
import CusLov from '_cus_components/CusLov';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { getCurrentUser } from 'utils/utils';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';

@connect(({ purchaseApplicationModel, loading }) => ({
  purchaseApplicationModel,
}))
export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {};
  }
  @Form.create()
  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  render() {
    const {
      form,
      infomation,
      handleSearchApplier = (e) => e,
      getProjectNumber,
      frameSubOrderModel,
    } = this.props;
    const { prStatus } = frameSubOrderModel;
    const { getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();
    return (
      <Form className="customize-form" ref={this.filterForm}>
        <Col span={24}>
          <Form.Item
            label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
            {...formLayout}
          >
            {getFieldDecorator('projectName', {
              initialValue: infomation?.projectName,
            })(
              <CusLov
                disabled={
                  infomation.prStatus == 'PENDING_REFER' || infomation.prStatus == '' ? false : true
                }
                textValue={infomation.projectName}
                queryParams={{ lang: getCurrentUser().language }}
                code="CMHK.API.CPEX/OPEX"
                lovOptions={{ displayField: 'name', valueField: 'name' }}
                onChange={(_, item) => {
                  if (isEmpty(item)) {
                    dispatch({
                      type: 'purchaseApplicationModel/commentUpdateState',
                      payload: {
                        demander: null,
                        demanderDepartment: null,
                        demanderPhone: null,
                      },
                    });
                  } else {
                    setTimeout(() => {
                      getProjectNumber(item);
                      // handleSearchApplier();
                    }, 600);
                  }
                }}
              />
            )}
          </Form.Item>
        </Col>
      </Form>
    );
  }
}
