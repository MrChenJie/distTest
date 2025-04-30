/**
 * 供应商管理 - 供应商预览（准入完成）
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/13
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component, Fragment } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { Collapse, Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import PanelHeader from '_cus_components/CusCollapse';
import intl from 'utils/intl';
import FinanceToPurchaseBasicForm from '@/routes/Supplier/components/FinanceToPurchaseBasicForm';
import ContactTable from '@/routes/Supplier/components/ContactTable';
import ClientTable from '@/routes/Supplier/components/ClientTable';
import A2PTable from '@/routes/Supplier/components/A2PTable';
import BankTable from '@/routes/Supplier/components/BankTable';
import AttachmentTable from '@/routes/Supplier/components/AttachmentTable';


const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';
@Form.create()
export default class SupplierDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact', 'client', 'a2p', 'bank', 'attachment'],
    }
  }

  componentDidMount() {
  }

  render() {
    const { queryLoading = false, form: { getFieldDecorator } } = this.props;
    const { activeKey } = this.state;
    return (
      <Fragment>
        <PageWrapper loading={queryLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                  arrowActive={activeKey.includes('basic')}
                />
              }
              key="basic"
            >
              <FinanceToPurchaseBasicForm />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.contact.person`).d('联系信息')}
                  arrowActive={activeKey.includes('contact')}
                />
              }
              key="contact"
            >
              <ContactTable />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.client.information`).d('客户信息')}
                  arrowActive={activeKey.includes('client')}
                />
              }
              key="client"
            >
              <ClientTable />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.a2p.info`).d('A2P信息')}
                  arrowActive={activeKey.includes('a2p')}
                />
              }
              key="a2p"
            >
              <A2PTable />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                  arrowActive={activeKey.includes('bank')}
                />
              }
              key="bank"
            >
              <BankTable />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.company.attachment`).d('公司附件')}
                  arrowActive={activeKey.includes('attachment')}
                />
              }
              key="attachment"
            >
              <AttachmentTable />
            </Panel>
          </Collapse>
        </PageWrapper>
      </Fragment>
    )
  }
}
