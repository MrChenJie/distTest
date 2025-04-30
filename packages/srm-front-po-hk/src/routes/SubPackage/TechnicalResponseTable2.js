/**
 * TechnicalResponseTable - 技术应答表
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
import request from 'utils/request';
import EditTable from '_cus_components/EditTable';
// import querystring from 'querystring';
// import { numberRender, dateRender } from 'utils/renderer';
// import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import CusNotification from '_cus_components/CusNotification';
import { tooltipRender, labelTip } from '_cus_utils/render';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import ImportModal from '_cus_components/CusModal/ImportModal';
import { Input, Tooltip,Row,Col } from 'antd';
// import { Button, Dropdown, Form, Icon, Menu, Modal, Progress, Select, Tooltip } from 'hzero-ui';
import { Form, Select } from 'hzero-ui';
import purchaseTemplateDS from './DataSet/purchaseTemplateDS';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel, createPagination } from 'utils/utils';
import { downloadFile } from 'hzero-front/lib/services/api';
import { DataSet } from 'choerodon-ui/pro';

const CMHK_PR_CENTER = '/cmhk-pr-center';
const promptCode = 'ssrc.resaleRfq';
const FormItem = Form.Item
const organizationId = getCurrentOrganizationId();

export default class TechnicalResponseTable extends PureComponent {
  // 模板dataSet
  payDs = new DataSet({ ...purchaseTemplateDS() });
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      isControlButtons: true,
      payVisible: false,
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

  //技术应答打开导入弹框
  @Bind
  handleOpenExport(){
    this.setState({payVisible:true})
  }

  // 导入
  @Bind()
  handleExport(payFileList){
    const { match } = this.props
    const pacNum = match.params.pacNum;
    this.setState({importUploading:true})
    let formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    // debugger
    console.log('formData', formData);
    request(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/pac/tech-reply-import/${pacNum}`,{
      method:'POST',
      body: formData,
    }).then(res=>{
      if (res.failed) {
        CusNotification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: res.message,
        });
        this.setState({
          importUploading: false,
        });
        return;
      }else{
        this.setState({
          importUploading: false,
          payVisible: false,
        })
      }
    })
  }

  // 导入模板下载
  @Bind
  payTemplateDownload() {
    let templateField;
    templateField = this.payDs.getField('tecGrad');
    // const { value } = templateField.props.lookup[0];
    console.log(templateField,'123123');
    // if (value) {
      const api = ''
        .concat(HZERO_FILE, '/v1/')
        .concat(isTenantRoleLevel() ? ''.concat(organizationId, '/') : '', 'files/download');
      downloadFile({
        requestUrl: api,
        queryParams: [
          {
            name: 'url',
            value: encodeURIComponent('http://cmhk-erp-scm-cmi-gnc-minio1.cmhk-erp-scm-cmi-gnc-admin.svc.cluster.local:9000/scm-himp/himp01/0/87646f880aac4c6e9a22a95379c8cf7a@采购方案-技术评分表设置导入模板.xlsx'),
          },
          {
            name: 'bucketName',
            value: 'himp',
          },
        ],
      });
    // }
  }

    // 关闭导入弹框
  @Bind
  handleCancel() {
    this.setState({
      payVisible: false,
      payFileList: [],
    });
  }

  render() {
    const {isControlButtons,payVisible,importUploading} = this.state
    const {
      form,idpValueMap,techReplyDataSource,techReplyDataPagination
    } = this.props
    const { getFieldDecorator, getFieldValue } = form;
    const comparePriceModalProps = {}
    // const { supperlierSouce = [{ bbb: '细节条款' }], supperlierPagination = {} } = evaluationList
    const supperlierSouce =[{ bbb: '细节条款' }]
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
        // render: (val, record) => {
        //   return (
        //     <FormItem>
        //       {getFieldDecorator('isKpi', {
        //         initialValue: techReplyDataSource?.isKpi,
        //         rules: [
        //           {
        //             required: true,
        //             message: intl.get('hzero.common.validation.notNull', {
        //               name: "yanzheng1"
        //             }),
        //           },
        //         ],
        //       })
        //         (<CusSelect
        //           allowClear
        //           popupClassName="customize-select"
        //           style={{ width: '100%' }}
        //           options={idpValueMap['HKPC.KEYINDICATORS']}
        //       />)}
        //     </FormItem>
        //   )
        // },
      },
    ];

    const tableProps = {
      dataSource: techReplyDataSource,
      columns,
      pagination: techReplyDataPagination,
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
              {getFieldDecorator('online ', {
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
      {/* 导入提示框 */}
      <ImportModal
          visible={payVisible}
          onCancel={this.handleCancel}
          importUploading={importUploading}
          payUpload={this.handleExport}
        />
    </>;
  }
}