/**
 * 单据权限配置 - SearchForm
 *
 * @date    2023-03-23
 * @author  陈深星 <chen.shenxing@hand-china.com>
 */

import { Col, Form, Input, Select } from 'antd';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import { getLFormGridSpan } from '_cus_utils/utils';

const gridSpan = getLFormGridSpan();

const promptKey = 'spub.docPermissionConfig';
const dateFormat = getDateFormat();

export default class SearchForm extends Component {
  /**
   * 表单元素格式处理函数
   * @param {String} language 语言类型
   */
  @Bind()
  formItemLayout(language = 'zh_CN') {
    // 语言1：中文
    if (language === 'zh_CN') {
      return {
        labelCol: { span: 0 },
        wrapperCol: { span: 24 },
      };
    }
    // 语言2：英文
    if (language === 'en_US') {
      return {
        labelCol: { span: 10 },
        wrapperCol: { span: 14 },
      };
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { parent = {} } = this.props;
    const { formRef = {} } = parent;
    const fieldsValueList = formRef.current.getFieldsValue();
    formRef.current.resetFields(
      Reflect.ownKeys(fieldsValueList).filter((item) => item.includes('query#'))
    );
    parent.handleUpdateState({ filterData: {} });
  }

  /**
   * 查询
   */
  @Bind()
  handleQuery() {
    const { formRef, handleSearch, handleUpdateState } = this.props.parent;
    const fieldsValueList = formRef.current.getFieldsValue();
    const { pagination = {} } = this.props.docPermissionConfig;
    const filterData = {};
    const queryFieldList = Reflect.ownKeys(fieldsValueList).filter((item) =>
      item.includes('query#')
    );

    queryFieldList.forEach((item) => {
      const [query, name] = item.split('#');
      Reflect.set(filterData, name, fieldsValueList[item]);
    });

    // 1. 更新模型
    handleUpdateState({
      filterData,
    });
    // 2. 查询列表
    handleSearch(filterData, { size: pagination.pageSize });
  }

  /**
   * 获取字段组件
   * @param {Object} field 映射字段对象
   * @returns
   */
  @Bind()
  getFormItem(field = {}) {
    // LOV
    if (field.value.includes('LOV_FIELD')) {
      const [valueField, displayField] = field.tag.split('|');
      return (
        <CusLov
          allowClear
          code={field.description}
          lovOptions={{
            valueField,
            displayField,
          }}
        />
      );
    }

    // 独立值集
    if (field.value.includes('LOOK_UP_CODE_FIELD')) {
      const [valueField, displayField] = field.tag.split('|');
      const dataList = this.props.docPermissionConfig[field.description];
      return (
        <Select popupClassName="customize-select" allowClear>
          {(dataList || []).map((item = {}) => {
            return (
              <Select.Option key={item[valueField]} value={item[valueField]}>
                {item[displayField]}
              </Select.Option>
            );
          })}
        </Select>
      );
    }

    // todo：日期
    // todo：时间

    // 部门
    if (field.value.includes('TEXT_FIELD1') && field.description.includes('UNIT')) {
      return (
        <CusLov
          allowClear
          code="SPRM.USER_UNIT"
          lovOptions={{
            valueField: 'unitCode',
            displayField: 'unitName',
          }}
          queryParams={{ tenantId: getCurrentOrganizationId() }}
        />
      );
    }

    // 其他
    return <Input />;
  }

  render() {
    const docType = this.props?.match?.params?.docType;
    let mappingList = this.props.docPermissionConfig[`${docType}-mappingList`] || [];
    if (docType === 'COST_PAYMENT') {
      // 过滤部门、备注的查询条件
      mappingList = mappingList.filter(
        (list) => !['textField2'].includes(list.fieldName)
      );
    }
    const fieldList = [
      <Form.Item
        name="query#userId"
        label={intl.get(`${promptKey}.model.userName`).d('用户名称')}
      >
        <CusLov
          allowClear
          code="SPUB.DOC_PER_USER"
          lovOptions={{
            valueField: 'id',
            displayField: 'userName',
          }}
        />
      </Form.Item>,
      ...mappingList.map((item) => (
        <Form.Item
          name={`query#${item.fieldName}`}
          label={intl.get(`${promptKey}.${item.fieldName}`).d(`${item.meaning}`)}
        >
          {this.getFormItem(item)}
        </Form.Item>
      )),
      <Form.Item
        name="query#effectiveDateFrom"
        label={intl.get(`${promptKey}.model.effectiveDateFrom`).d('有效日期从')}
      >
        <CusDatePicker
          format={dateFormat}
          placeholder={intl.get('hzero.common.view.message.placeholder.date').d('请选择日期')}
        />
      </Form.Item>,
      <Form.Item
        name="query#effectiveDateTo"
        label={intl.get(`${promptKey}.model.effectiveDateTo`).d('有效日期至')}
      >
        <CusDatePicker
          format={dateFormat}
          placeholder={intl.get('hzero.common.view.message.placeholder.date').d('请选择日期')}
        />
      </Form.Item>,
      <Form.Item
        name="query#creator"
        label={intl.get(`${promptKey}.model.creator`).d('创建人')}
      >
        <Input />
      </Form.Item>,
      <Form.Item
        name="query#creationDateFrom"
        label={intl.get(`${promptKey}.model.creationDateFrom`).d('创建日期从')}
      >
        <CusDatePicker
          format={dateFormat}
          placeholder={intl.get('hzero.common.view.message.placeholder.date').d('请选择日期')}
        />
      </Form.Item>,
      <Form.Item
        name="query#creationDateTo"
        label={intl.get(`${promptKey}.model.creationDateTo`).d('创建日期至')}
      >
        <CusDatePicker
          format={dateFormat}
          placeholder={intl.get('hzero.common.view.message.placeholder.date').d('请选择日期')}
        />
      </Form.Item>,
    ];

    return (
      <GenerateSearchFormGrid onQuery={this.handleQuery} onReset={this.handleReset}>
        {fieldList.map((list) => (
          <Col {...gridSpan}>{list}</Col>
        ))}
      </GenerateSearchFormGrid>
    );
  }
}
