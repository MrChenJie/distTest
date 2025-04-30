/**
 * BusinessResponseTable - 商务应答表
 * @date: 2023-10-26
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
// import { Tooltip } from 'antd';
import { tableScrollWidth } from 'utils/utils';
// import { pullAllBy } from 'lodash';
// import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
// import querystring from 'querystring';
// import { numberRender, dateRender } from 'utils/renderer';
// import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import { Input, Tooltip,Col } from 'antd';
// import { Button, Dropdown, Form, Icon, Menu, Modal, Progress, Select, Tooltip } from 'hzero-ui';
import { Form, Select } from 'hzero-ui';


const promptCode = 'ssrc.resaleRfq';
const FormItem = Form.Item

export default class BusinessResponseTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      isControlButtons: true
    };
  }
  @Form.create()

  @Bind
  changeType(val) {
    if(val== 'OnlineRresponse_no'){
      this.setState({
        isControlButtons:false
      })
    }else {
      this.setState({
        isControlButtons:true
      })
    }
  }

  render() {
    const {
      form,idpValueMap,busReplyDataSource,busReplyDataPagination
    } = this.props
    const {isControlButtons} = this.state
    const { getFieldDecorator, getFieldValue } = form;
    // const { supperlierSouce = [{ bbb: '细节条款' }], supperlierPagination = {} } = evaluationList
    const supperlierPagination ={}
    const columns = [
      {
        title: tooltipRender(intl.get(`${promptCode}.view.title.SN`).d('序号')),
        dataIndex: 'lineNo',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.view.title.GeneralTerms`).d('大条款'),
        dataIndex: 'term',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.MinorTerms`).d('细节条款'),
        dataIndex: 'detailTerm',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.KeyIndicators`).d('关键指标'),
        dataIndex: 'isKpi',
        width: 160,
        render: (val, record) => {
          return (
            <FormItem>
              {getFieldDecorator('isKpi', {
                initialValue: busReplyDataSource?.isKpi,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: "yanzheng1"
                    }),
                  },
                ],
              })
              (<CusSelect
                allowClear
                popupClassName="customize-select"
                style={{ width: '100%' }}
                options={idpValueMap['HKPC.KEYINDICATORS']}
            />)}
            </FormItem>
          )
        },
      },
    ];

    const tableProps = {
      dataSource: busReplyDataSource,
      columns,
      pagination: busReplyDataPagination,
      rowKey: 'auditNodeMeaning',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <>
       <div style={{margin:'16px 0',textAlign:'right',display:'flex',flexDirection:'row-reverse'}}>
        {isControlButtons ? <>
        <CusButton>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
        <CusButton onClick={()=>{
          this.handleOpenExport()
        }}>{intl.get(`${promptCode}.view.button.Import`).d('导入')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.export`).d('导出')}</CusButton>
        <CusButton onClick={this.payTemplateDownload}>{intl.get(`${promptCode}.view.button.TemplateDownload`).d('模板下载')}</CusButton></>:<></>}
        <Col span={6}>
          <Form className='customize-form'>
            <Form.Item
            label={intl.get(`${promptCode}.view.title.OnlineResponse`).d('线上应答')}
            >
              {getFieldDecorator('online1 ', {
                      // initialValue: null,
                    })(<CusSelect
                      allowClear
                      popupClassName="customize-select"
                      options={idpValueMap['HKPC.ONLINERESPONSE']}
                      onChange={(val) => this.changeType(val)}
                    />)}
            </Form.Item>
          </Form>
        </Col>
      </div>
      <EditTable {...tableProps} />
    </>;
  }
}