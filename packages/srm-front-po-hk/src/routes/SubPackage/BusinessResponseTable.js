/**
 * TechnicalGradeTable - 技术评分
 * @date: 2023-10-26
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import { numberRender, dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender, labelTip } from '_cus_utils/render';
import CusSelect from '_cus_components/CusSelect';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import CusLov from '_cus_components/CusLov';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { Col } from 'antd';
import { getCurrentOrganizationId } from 'utils/utils';
import uuid from 'uuid/v4';
import { pullAllBy } from 'lodash';
import CusNotification from 'utils/notification';


const promptCode = 'HKPC.commom';
const organizationId = getCurrentOrganizationId();
@Form.create()
export default class TechnicalGradeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      isControlButtons: true,
      disabled: false
    };
  }

  @Bind
  changeType(val) {
    if (val == 'OnlineRresponse_no') {
      this.setState({
        isControlButtons: false
      })
    } else {
      this.setState({
        isControlButtons: true
      })
    }
  }

  //技术应答打开导入弹框
  @Bind
  handleOpenExport() {
    this.setState({ payVisible: true })
  }

  // 导入
  @Bind()
  handleExport(payFileList) {
    const { match } = this.props
    const pacNum = match.params.pacNum;
    this.setState({ importUploading: true })
    let formData = new FormData();
    payFileList.forEach((file) => {
      formData.append('file', file);
    });
    // debugger
    console.log('formData', formData);
    request(`${CMHK_PR_CENTER}/v1/${organizationId}/pr-second/public-bid/pac/tech-reply-import/${pacNum}`, {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (res.failed) {
        CusNotification.error({
          message: intl.get('hzero.common.CusNotification.error').d('操作失败'),
          description: res.message,
        });
        this.setState({
          importUploading: false,
        });
        return;
      } else {
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
    console.log(templateField, '123123');
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

  // 新建
  @Bind()
  handleAdd() {
    this.setState({
      disabled: true
    })
    const {
      dispatch,
      pacId,
    } = this.props;
    const { busReplyDataSource } = this.props
    dispatch({
      type: `purchasePlan/updateState`,
      payload: {
        busReplyDataSource: [
          ...busReplyDataSource,
          {
            //  _status: 'create',
            //  id: uuid(),
            //  detailTerm : '' , //细节条款
            //  isDel : '0' , // 删除状态
            //  isKpi : '' , // 是否关键指标code
            //  isKpiMeaning :'',  // 是否关键指标
            //  lineNo : busReplyDataSource.length + 1, // 序号
            //  processMessage : '' , // 处理信息
            //  refHeadId : pacId , // 标包ID
            //  tenantId: organizationId.toString(),
            //  term : '', //大条款

            detailTerm: '',//细节条款
            isDel: '0',//删除状态
            isKpi: '', //是否关键指标
            //  isKpiMeaning :'',  // 是否关键指标(少一个，不知道什么原因)
            lineNo: busReplyDataSource.length + 1,//序号
            processMessage: '',//处理信息
            refHeadId: pacId, //标包id
            tenantId: organizationId.toString(),//租户id
            term: '',//大条款
            _status: 'create',
            id: uuid(),
          },
        ],
      },
    })
  }

  // 选中行
  @Bind()
  handleSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n.id !== record.id);
    // 选择的行key
    let newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item.id);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
    console.log("选中的key", newSelectedRowKeys);
  }

  // 全选/全不选
  @Bind()
  handleSelectAll(selected, newSelectedRows, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, 'id');
    let newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item.id);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  // 删除
  @Bind()
  handleDelete() {
    const {
      dispatch,
      busReplyDataSource
    } = this.props;
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length > 0) {
      const newtechReplyDataSource = busReplyDataSource
        .map((item) => {
          //  如果选择的是后端返回的数据，就把这个数据的状态改为1
          if (selectedRowKeys.includes(item.id)) {
            item.isDel = '1';
            return item;
          } else {
            return item;
          }
        })
        // 过滤出 后端反的（删掉了） || 选择的是后端反的 但是排除掉被勾选的（同时也保留了新增的数据）
        .filter((i) => i.isDel !== '1');

      // dispatch({
      //   type: `${NAME_SPACE}/updateState`,
      //   payload: {
      //     busReplyDataSource: [...newtechReplyDataSource],
      //   },
      // });
      this.setState({ selectedRowKeys: [] });
      console.log(newtechReplyDataSource, '删除之后的数据');
    } else {
      CusNotification.info({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
        placement: 'bottomRight',
      });
    }
  }

  render() {
    const { isControlButtons, selectedRowKeys, } = this.state
    const {
      form, idpValueMap, busReplyDataSource, busReplyDataPagination
    } = this.props

    console.log(busReplyDataSource,'这是商务');
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: 62,
        // fixed: 'left',
        dataIndex: 'lineNo',
        render: (_, record, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              {index + 1}
            </div>
          );
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.GeneralTerms`).d('大条款'),
        dataIndex: 'term',
        required: true,
        width: 150,
        render: (val, record) => {
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('term', {
                initialValue: record.term,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.GeneralTerms`).d('大条款'),
                  }),
                }]
              })(
                <CusInput
                  onBlur={(event)=>{
                    record.term = event.target.value
                  }}
                />
              )}
            </Form.Item>) : val
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.MinorTerms`).d('细节条款'),
        dataIndex: 'detailTerm',
        required: true,
        width: 550,
        render: (val, record) => {
          return (
            ['create'].includes(record._status) ? (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('detailTerm', {
                initialValue: record.detailTerm,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.MinorTerms`).d('细节条款'),
                  }),
                }]
              })(
                <CusInput
                onBlur={(event)=>{
                  record.detailTerm = event.target.value
                }}
                />
              )}
            </Form.Item>) : val
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.KeyIndicators`).d('关键指标'),
        dataIndex: 'isKpi',
        width: 100,
        render: (text, record, index) => {
          return (
            (<Form.Item>
              {record.$form && record.$form.getFieldDecorator('isKpi', {
                initialValue: record.isKpi,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.title.KeyIndicators`).d('关键指标'),
                  }),
                }]
              })(
                <CusSelect
                  options={idpValueMap['HKPC.KEYINDICATORS']}
                  onChange={(val)=>{
                    record.isKpi = val
                    console.log(val,"技术应答指标");
                  }}
                />
              )}
            </Form.Item>)
          )
        },
      },
    ].filter(Boolean);

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onSelect: this.handleSelect,
      onSelectAll: this.handleSelectAll,
    };

    const tableProps = {
      dataSource: busReplyDataSource,
      pagination: busReplyDataPagination,
      rowSelection: rowSelection,
      rowKey: 'id',
      columns,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    }

    return (<>
      <div style={{ margin: '16px 0', textAlign: 'right', display: 'flex', flexDirection: 'row-reverse' }}>

        {isControlButtons ? <>
          <CusButton onClick={this.handleAdd}>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
          <CusButton onClick={this.handleDelete}>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
          <CusButton onClick={() => {
            this.handleOpenExport()
          }}>{intl.get(`${promptCode}.view.button.Import`).d('导入')}</CusButton>
          {/* <CusButton>{intl.get(`${promptCode}.view.button.export`).d('导出')}</CusButton> */}
          <CusButton onClick={this.payTemplateDownload}>{intl.get(`${promptCode}.view.button.TemplateDownload`).d('模板下载')}</CusButton></> : <></>}
        <Col span={6}>
          <Form className='customize-form'>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.OnlineResponse`).d('线上应答')}
            >
              <CusSelect
                allowClear
                popupClassName="customize-select"
                options={idpValueMap['HKPC.ONLINERESPONSE']}
                onChange={(val) => this.changeType(val)}
              />

            </Form.Item>
          </Form>
        </Col>
      </div>
      <EditTable {...tableProps} />
    </>)
  }
}