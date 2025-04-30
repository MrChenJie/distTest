/**
 * TechnicalGradeTable - 技术评分
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
import { Input, Tooltip } from 'antd';
// import { Button, Dropdown, Form, Icon, Menu, Modal, Progress, Select, Tooltip } from 'hzero-ui';
import { Form, Select } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';


const promptCode = 'HKPC.commom';
const FormItem = Form.Item

export default class TechnicalGradeTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }


  render() {
    const {
      form,idpValueMap,scoreDataSource
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
        title: intl.get(`${promptCode}.view.title.ScoringItem`).d('评分大项'),
        dataIndex: 'aaa',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoringDetails`).d('评分细项'),
        dataIndex: 'bbb',
        required: 'true',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Score`).d('分值'),
        dataIndex: 'ccc',
        required: 'true',
        width: 160,
        render: (val, record) => {
          return (
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: "chushi",
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: "yanzheng1"
                    }),
                  },
                ],
              })
                (<CusInput />)}
            </FormItem>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ObjectiveScore`).d('是否客观分'),
        dataIndex: 'ccc',
        required: 'true',
        width: 160,
        render: (val, record) => {
          return (
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: "chushi",
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
                options={idpValueMap['HKPC.YES_OR_NO']}
            />)}
            </FormItem>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoreType`).d('分值类型'),
        dataIndex: 'ccc',
        required: 'true',
        width: 160,
        render: (val, record) => {
          return (
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: "chushi",
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
                options={idpValueMap['HKPC.YES_OR_NO']}
            />)}
            </FormItem>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ScoreValue`).d('设置分值下拉值'),
        dataIndex: 'ccc',
        required: 'true',
        width: 160,
        render: (val, record) => {
          return (
            <FormItem>
              {getFieldDecorator('name', {
                initialValue: "chushi",
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: "yanzheng1"
                    }),
                  },
                ],
              })
                (<CusInput />)}
            </FormItem>
          )
        },
      },
    ];

    const tableProps = {
      dataSource: scoreDataSource,
      columns,
      pagination: supperlierPagination,
      rowKey: 'auditNodeMeaning',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <>
      <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
        <CusButton>{intl.get(`${promptCode}.view.button.TemplateDownload`).d('模板下载')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.export`).d('导出')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.Import`).d('导入')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.delete`).d('删除')}</CusButton>
        <CusButton>{intl.get(`${promptCode}.view.button.add`).d('新建')}</CusButton>
      </div>
      <EditTable {...tableProps} />
    </>;
  }
}