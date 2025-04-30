import React, { PureComponent, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { CompanyAccessDS } from './dataset/CompanyAccessDS';

const commonPrompt = 'spfm.companyAccess';
const { Column } = Table;
export default class CompanyAccess extends PureComponent {
  CompanyAccessDS = new DataSet(CompanyAccessDS({ props: this.props, commonPrompt }));

  // renderRecord = ({ record }) => {
  //   if (record.data.processStatus === 'E') {
  //     return (
  //       <Button funcType="flat" size="small">
  //         重推
  //       </Button>
  //     );
  //   }
  // };

  renderMessage = ({ record }) => {
    return (
      <Button
        funcType="flat"
        size="small"
        onClick={() => this.openMessage(record.data.processMessage)}
      >
        查看错误信息
      </Button>
    );
  };

  /**
   * 查看错误信息弹框
   * @param {*} record
   */
  openMessage = (record) => {
    Modal.info({
      title: '查看错误信息',
      children: record,
    });
  };

  render() {
    return (
      <Fragment>
        <Header
          title={intl
            .get(`${commonPrompt}.view.contract.evaluate.query.title`)
            .d('供应商邀约记录查询')}
        />
        <Content>
          <Table dataSet={this.CompanyAccessDS}>
            <Column name="companyName" />
            <Column name="tenantName" />
            <Column name="nodeCode" />
            <Column name="processDate" />
            <Column name="processStatus" />
            <Column name="processMessage" renderer={this.renderMessage} />
            {/* <Column name="oprate" renderer={this.renderRecord} /> */}
          </Table>
        </Content>
      </Fragment>
    );
  }
}
